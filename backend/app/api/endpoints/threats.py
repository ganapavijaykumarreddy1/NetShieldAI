from fastapi import APIRouter, Depends
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.ai.inference_pipeline import InferencePipeline
from app.api.deps import get_db
from app.soc.alerts.engine import AlertEngine

router = APIRouter(prefix="/threats", tags=["Threats"])

@router.get("/feed")
def get_threat_feed(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Returns the latest threat predictions for all active flows,
    as well as an aggregated system risk score, directly from memory cache.
    """
    from app.traffic.services.threat_detection_service import ThreatDetectionService
    
    detection_service = ThreatDetectionService.get_instance()
    return detection_service.get_latest_feed()
