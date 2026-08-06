from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.soc.threat_intel.service import ThreatIntelService

router = APIRouter(prefix="/threat-intel", tags=["Threat Intelligence"])

@router.post("/seed")
def seed_threat_intel(db: Session = Depends(get_db)):
    service = ThreatIntelService(db)
    service.seed_database_if_empty()
    return {"status": "seeded"}

@router.get("/")
def get_all_intel(db: Session = Depends(get_db)):
    service = ThreatIntelService(db)
    return service.get_all()
