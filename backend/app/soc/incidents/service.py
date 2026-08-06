import uuid
from sqlalchemy.orm import Session
from app.models.soc import Incident, Alert
from app.soc.incidents.schemas import IncidentCreate, IncidentUpdate

class IncidentService:
    def __init__(self, db: Session):
        self.db = db

    def create_incident(self, incident_data: IncidentCreate) -> Incident:
        # Verify alert exists
        alert = self.db.query(Alert).filter(Alert.alert_id == incident_data.alert_id).first()
        if not alert:
            raise ValueError("Alert not found")
            
        incident_id = f"INC-{uuid.uuid4().hex[:8].upper()}"
        new_incident = Incident(
            incident_id=incident_id,
            alert_id=alert.id,
            priority=incident_data.priority,
            status="Open"
        )
        self.db.add(new_incident)
        
        # Update alert status
        alert.status = "Investigating"
        
        self.db.commit()
        self.db.refresh(new_incident)
        return new_incident

    def update_incident(self, incident_id_str: str, update_data: IncidentUpdate) -> Incident:
        incident = self.db.query(Incident).filter(Incident.incident_id == incident_id_str).first()
        if not incident:
            raise ValueError("Incident not found")

        update_dict = update_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(incident, key, value)
            
        if incident.status in ["Resolved", "Closed"] and incident.alert:
            incident.alert.status = "Resolved"
            
        self.db.commit()
        self.db.refresh(incident)
        return incident

    def get_incidents(self, skip: int = 0, limit: int = 100):
        return self.db.query(Incident).offset(skip).limit(limit).all()
