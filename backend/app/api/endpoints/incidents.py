from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_db, get_current_user
from app.soc.incidents.schemas import IncidentCreate, IncidentUpdate, IncidentResponse
from app.soc.incidents.service import IncidentService

router = APIRouter(prefix="/incidents", tags=["Incidents"])

@router.post("/", response_model=IncidentResponse)
def create_incident(incident_in: IncidentCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = IncidentService(db)
    try:
        return service.create_incident(incident_in)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{incident_id_str}", response_model=IncidentResponse)
def update_incident(incident_id_str: str, incident_in: IncidentUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = IncidentService(db)
    try:
        return service.update_incident(incident_id_str, incident_in)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/", response_model=List[IncidentResponse])
def list_incidents(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    service = IncidentService(db)
    return service.get_incidents(skip=skip, limit=limit)
