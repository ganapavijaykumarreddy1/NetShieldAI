from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.api.deps import get_db, RoleChecker
from app.soc.analytics.service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics"])
manager_required = RoleChecker(["Administrator", "SOC Manager"])

@router.get("/summary")
def get_summary(db: Session = Depends(get_db), current_user = Depends(manager_required)):
    service = AnalyticsService(db)
    return service.get_threat_summary()

@router.get("/categories")
def get_categories(db: Session = Depends(get_db), current_user = Depends(manager_required)):
    service = AnalyticsService(db)
    return service.get_attack_categories()

@router.get("/timeline")
def get_timeline(db: Session = Depends(get_db), current_user = Depends(manager_required)):
    service = AnalyticsService(db)
    return service.get_threat_timeline()

@router.get("/top-ips")
def get_top_ips(db: Session = Depends(get_db), current_user = Depends(manager_required)):
    service = AnalyticsService(db)
    return service.get_top_source_ips()

@router.get("/detailed")
def get_detailed_analytics(days: int = 7, db: Session = Depends(get_db), current_user = Depends(manager_required)):
    service = AnalyticsService(db)
    return service.get_detailed_analytics(days=days)
