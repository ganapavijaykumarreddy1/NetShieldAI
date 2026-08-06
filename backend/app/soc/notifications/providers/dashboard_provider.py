import logging
from sqlalchemy.orm import Session
from app.models.soc import Alert, Notification
from app.soc.notifications.interfaces import NotificationProvider
import uuid

logger = logging.getLogger("netshield_dashboard_notif")

class DashboardNotificationProvider(NotificationProvider):
    @property
    def provider_name(self) -> str:
        return "Dashboard"

    def send(self, alert: Alert, db: Session) -> bool:
        try:
            # We just write a record to the notifications table to surface in the UI
            notif_id = f"NOT-{uuid.uuid4().hex[:8].upper()}"
            notif = Notification(
                notification_id=notif_id,
                alert_id=alert.id,
                provider=self.provider_name,
                status="Delivered"
            )
            db.add(notif)
            db.commit()
            return True
        except Exception as e:
            logger.error(f"Failed to save dashboard notification: {e}")
            db.rollback()
            return False
