from fastapi import APIRouter, Depends
from app.validation.metrics import ModelMetricsEvaluator
from app.validation.performance import PerformanceTracker
from app.api.deps import RoleChecker
from app.models.user import User

router = APIRouter()
allow_admin = RoleChecker(["Administrator"])

@router.get("/ai-metrics")
def get_ai_validation_metrics(current_user: User = Depends(allow_admin)):
    """
    Returns AI model evaluation metrics, accuracy, F1 score, 
    confusion matrix heatmap, and ROC curve coordinates. Restricted to Administrator role.
    """
    return ModelMetricsEvaluator.get_evaluation_summary()

@router.get("/system-health")
def get_system_health_and_performance(current_user: User = Depends(allow_admin)):
    """
    Returns real-time system performance, packet processing stats, 
    operation latencies (ms), and hardware resource metrics. Restricted to Administrator role.
    """
    tracker = PerformanceTracker.get_instance()
    return tracker.get_system_health()
