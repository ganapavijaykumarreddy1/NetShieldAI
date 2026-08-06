from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse
from app.api.deps import get_db, get_current_user, RoleChecker
from app.soc.reporting.engine import ReportingEngine

router = APIRouter(prefix="/reports", tags=["Reports"])
manager_required = RoleChecker(["Administrator", "SOC Manager"])

@router.post("/generate/daily-pdf")
def generate_daily_pdf(db: Session = Depends(get_db), current_user = Depends(manager_required)):
    engine = ReportingEngine(db, user_id=current_user.id)
    filepath = engine.generate_daily_summary_pdf()
    return FileResponse(path=filepath, filename="daily_summary.pdf", media_type='application/pdf')

@router.post("/generate/alerts-csv")
def generate_alerts_csv(db: Session = Depends(get_db), current_user = Depends(manager_required)):
    engine = ReportingEngine(db, user_id=current_user.id)
    filepath = engine.generate_alerts_csv()
    return FileResponse(path=filepath, filename="alerts_export.csv", media_type='text/csv')

