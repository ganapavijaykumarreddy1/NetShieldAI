import os
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, EmailStr
from app.api.deps import get_db, get_current_user
from app.models.soc import Notification
from app.soc.notifications.providers.gmail_provider import GmailNotificationProvider
from app.core.config import settings

router = APIRouter(prefix="/notifications", tags=["Notifications"])

CONFIG_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), "smtp_config.json")

def _load_persisted_smtp():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r") as f:
                data = json.load(f)
                if data.get("smtp_server"): settings.SMTP_SERVER = data["smtp_server"]
                if data.get("smtp_port"): settings.SMTP_PORT = data["smtp_port"]
                if data.get("smtp_sender_email"): settings.SMTP_SENDER_EMAIL = data["smtp_sender_email"]
                if data.get("smtp_app_password"): settings.SMTP_APP_PASSWORD = data["smtp_app_password"]
                if data.get("smtp_recipient_email"): settings.SMTP_RECIPIENT_EMAIL = data["smtp_recipient_email"]
        except Exception as e:
            print(f"Error loading persisted SMTP config: {e}")

def _save_persisted_smtp(data_dict: dict):
    try:
        config_data = {}
        if os.path.exists(CONFIG_FILE):
            try:
                with open(CONFIG_FILE, "r") as f:
                    config_data = json.load(f)
            except Exception:
                config_data = {}
        config_data.update({k: v for k, v in data_dict.items() if v is not None})
        with open(CONFIG_FILE, "w") as f:
            json.dump(config_data, f, indent=2)
    except Exception as e:
        print(f"Error saving SMTP config: {e}")

# Initial load on import
_load_persisted_smtp()

class TestEmailRequest(BaseModel):
    recipient_email: Optional[str] = None

class SmtpSettingsUpdateRequest(BaseModel):
    smtp_server: Optional[str] = "smtp.gmail.com"
    smtp_port: Optional[int] = 587
    smtp_sender_email: Optional[str] = None
    smtp_app_password: Optional[str] = None
    smtp_recipient_email: Optional[str] = None

@router.get("/")
def get_notifications(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    notifs = db.query(Notification).order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()
    return [{"id": n.notification_id, "provider": n.provider, "status": n.status, "created_at": n.created_at, "alert_id": n.alert_id} for n in notifs]

@router.get("/settings")
def get_smtp_settings(current_user = Depends(get_current_user)):
    _load_persisted_smtp()
    is_configured = (
        bool(settings.SMTP_SENDER_EMAIL) and 
        settings.SMTP_SENDER_EMAIL != "your_email@gmail.com" and
        bool(settings.SMTP_APP_PASSWORD) and 
        settings.SMTP_APP_PASSWORD != "your_app_password"
    )
    return {
        "smtp_server": settings.SMTP_SERVER,
        "smtp_port": settings.SMTP_PORT,
        "smtp_sender_email": settings.SMTP_SENDER_EMAIL if settings.SMTP_SENDER_EMAIL != "your_email@gmail.com" else "",
        "smtp_recipient_email": settings.SMTP_RECIPIENT_EMAIL if settings.SMTP_RECIPIENT_EMAIL != "admin_email@gmail.com" else "",
        "is_configured": is_configured,
        "password_set": bool(settings.SMTP_APP_PASSWORD and settings.SMTP_APP_PASSWORD != "your_app_password")
    }

@router.post("/settings")
def update_smtp_settings(data: SmtpSettingsUpdateRequest, current_user = Depends(get_current_user)):
    save_data = {}
    if data.smtp_server:
        settings.SMTP_SERVER = data.smtp_server
        save_data["smtp_server"] = data.smtp_server
    if data.smtp_port:
        settings.SMTP_PORT = data.smtp_port
        save_data["smtp_port"] = data.smtp_port
    if data.smtp_sender_email:
        settings.SMTP_SENDER_EMAIL = data.smtp_sender_email
        save_data["smtp_sender_email"] = data.smtp_sender_email
    if data.smtp_app_password:
        settings.SMTP_APP_PASSWORD = data.smtp_app_password
        save_data["smtp_app_password"] = data.smtp_app_password
    if data.smtp_recipient_email:
        settings.SMTP_RECIPIENT_EMAIL = data.smtp_recipient_email
        save_data["smtp_recipient_email"] = data.smtp_recipient_email
    
    _save_persisted_smtp(save_data)
    return {"message": "SMTP settings updated successfully", "is_configured": True}

@router.post("/test-email")
def send_test_email(data: Optional[TestEmailRequest] = None, current_user = Depends(get_current_user)):
    _load_persisted_smtp()
    provider = GmailNotificationProvider()
    recipient = data.recipient_email if data and data.recipient_email else settings.SMTP_RECIPIENT_EMAIL
    result = provider.send_test_email(recipient=recipient)
    
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Failed to dispatch test email."))
        
    return result

