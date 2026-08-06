from pydantic import BaseModel, field_serializer
from typing import Optional
from datetime import datetime

class AlertBase(BaseModel):
    src_ip: str
    dst_ip: str
    attack_type: str
    confidence: float
    risk_score: float
    severity: str
    protocol: Optional[str] = None
    recommended_action: Optional[str] = None

class AlertCreate(AlertBase):
    pass

class AlertResponse(AlertBase):
    id: int
    alert_id: str
    timestamp: datetime
    status: str

    @field_serializer('timestamp')
    def serialize_timestamp(self, dt: datetime, _info):
        if dt is None:
            return None
        if dt.tzinfo is None:
            return dt.isoformat() + "Z"
        return dt.isoformat()

    class Config:
        from_attributes = True

