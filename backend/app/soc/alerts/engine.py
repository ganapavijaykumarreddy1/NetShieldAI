import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.soc import Alert
from app.soc.alerts.schemas import AlertCreate
from app.soc.notifications.manager import NotificationManager
from typing import Optional

class AlertEngine:
    db: Session
    dedup_window_minutes: int
    notification_manager: NotificationManager

    def __init__(self, db: Session):
        self.db = db
        self.notification_manager = NotificationManager(db)
        self.dedup_window_minutes = 5

    def process_prediction(self, src_ip: str, dst_ip: str, protocol: str, prediction) -> Optional[Alert]:
        if not prediction.is_threat:
            return None
        
        severity = self._calculate_severity(prediction.risk_score)
        
        if self._is_duplicate(src_ip, dst_ip, prediction.threat_type):
            return None
            
        alert_id = f"ALT-{uuid.uuid4().hex[:8].upper()}"
        
        new_alert = Alert(
            alert_id=alert_id,
            src_ip=src_ip,
            dst_ip=dst_ip,
            attack_type=prediction.threat_type,
            confidence=prediction.confidence,
            risk_score=prediction.risk_score,
            severity=severity,
            protocol=protocol,
            recommended_action=f"Investigate {prediction.threat_type} from {src_ip}",
            status="New"
        )
        
        self.db.add(new_alert)
        self.db.commit()
        self.db.refresh(new_alert)
        
        self.notification_manager.dispatch(new_alert)
        
        return new_alert

    def _calculate_severity(self, risk_score: float) -> str:
        if risk_score > 75:
            return 'Critical'
        if risk_score > 50:
            return 'High'
        if risk_score > 25:
            return 'Medium'
        return 'Low'

    def _is_duplicate(self, src_ip: str, dst_ip: str, attack_type: str) -> bool:
        time_threshold = datetime.now(timezone.utc) - timedelta(minutes=self.dedup_window_minutes)
        existing = self.db.query(Alert).filter(
            Alert.src_ip == src_ip,
            Alert.dst_ip == dst_ip,
            Alert.attack_type == attack_type,
            Alert.timestamp >= time_threshold
        ).first()
        return existing is not None
