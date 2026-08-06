from pydantic import BaseModel, field_serializer
from typing import Optional
from datetime import datetime

class IncidentCreate(BaseModel):
    alert_id: str
    priority: str

class IncidentUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_analyst: Optional[int] = None
    resolution_notes: Optional[str] = None

class IncidentResponse(BaseModel):
    id: int
    incident_id: str
    alert_id: int
    priority: str
    assigned_analyst: Optional[int]
    status: str
    resolution_notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    @field_serializer('created_at', 'updated_at')
    def serialize_dt(self, dt: datetime, _info):
        if dt is None:
            return None
        if dt.tzinfo is None:
            return dt.isoformat() + "Z"
        return dt.isoformat()

    class Config:
        from_attributes = True

