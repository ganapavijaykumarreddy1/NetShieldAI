from abc import ABC, abstractmethod
from app.models.soc import Alert
from sqlalchemy.orm import Session

class NotificationProvider(ABC):
    """
    Interface for all notification providers.
    Following the Dependency Inversion principle.
    """
    @property
    @abstractmethod
    def provider_name(self) -> str:
        pass

    @abstractmethod
    def send(self, alert: Alert, db: Session) -> bool:
        """
        Send a notification for the given alert.
        Returns True if successful, False otherwise.
        """
        pass
