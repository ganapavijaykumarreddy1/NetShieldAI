from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_db, get_current_user
from app.models.soc import Alert
from app.soc.alerts.schemas import AlertResponse

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("/", response_model=List[AlertResponse])
def get_alerts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Alert).order_by(Alert.timestamp.desc()).offset(skip).limit(limit).all()

from app.soc.notifications.providers.gmail_provider import GmailNotificationProvider
from app.models.soc import Notification
import uuid

@router.put("/{alert_id_str}/acknowledge", response_model=AlertResponse)
def acknowledge_alert(alert_id_str: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    alert = db.query(Alert).filter(Alert.alert_id == alert_id_str).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    if alert.status == "New":
        alert.status = "Acknowledged"
        db.commit()
        db.refresh(alert)
    return alert

@router.post("/{alert_id_str}/send-email")
def send_alert_email(alert_id_str: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    alert = db.query(Alert).filter(Alert.alert_id == alert_id_str).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    provider = GmailNotificationProvider()
    res = provider.send_alert_manual(alert)
    
    notif_id = f"NOT-{uuid.uuid4().hex[:8].upper()}"
    status = "Delivered" if res.get("success") else "Failed"
    notif = Notification(
        notification_id=notif_id,
        alert_id=alert.id,
        provider="Gmail (Manual)",
        status=status
    )
    db.add(notif)
    db.commit()

    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("error", "Failed to dispatch email."))
        
    return {"message": "Email alert dispatched successfully", "result": res}

