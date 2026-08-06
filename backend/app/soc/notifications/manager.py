import logging
from typing import List
from sqlalchemy.orm import Session
from app.models.soc import Alert, Notification
from app.soc.notifications.interfaces import NotificationProvider
from app.soc.notifications.providers.gmail_provider import GmailNotificationProvider
from app.soc.notifications.providers.dashboard_provider import DashboardNotificationProvider
import uuid

logger = logging.getLogger("netshield_notif_manager")

class NotificationManager:
    """
    Manages and dispatches notifications via registered providers.
    Follows Dependency Injection and Strategy patterns.
    """
    def __init__(self, db: Session):
        self.db = db
        self.providers: List[NotificationProvider] = [
            DashboardNotificationProvider(),
            GmailNotificationProvider()
            # Future providers (Slack, Webhooks) can be appended here
        ]

    def dispatch(self, alert: Alert):
        """
        Dispatch the alert to all registered providers.
        """
        for provider in self.providers:
            try:
                success = provider.send(alert, self.db)
                # Note: DashboardProvider saves its own Notification record. 
                # For external ones, we can log the delivery status here.
                if provider.provider_name != "Dashboard":
                    notif_id = f"NOT-{uuid.uuid4().hex[:8].upper()}"
                    status = "Delivered" if success else "Failed"
                    notif = Notification(
                        notification_id=notif_id,
                        alert_id=alert.id,
                        provider=provider.provider_name,
                        status=status
                    )
                    self.db.add(notif)
                    self.db.commit()
            except Exception as e:
                logger.error(f"Provider {provider.provider_name} threw an exception: {e}")
                self.db.rollback()
