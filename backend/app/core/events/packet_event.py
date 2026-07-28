from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from app.core.models.network_models import Protocol

class PacketEvent(BaseModel):
    id: str = Field(..., description="Unique identifier for the packet event")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    source_ip: Optional[str] = None
    destination_ip: Optional[str] = None
    source_port: Optional[int] = None
    destination_port: Optional[int] = None
    protocol: Protocol = Protocol.OTHER
    length: int = 0
    payload_size: int = 0
    flags: Optional[str] = None
    raw_summary: str = ""
    metadata: Dict[str, Any] = Field(default_factory=dict)
