from fastapi import APIRouter, Depends, HTTPException, Body
from typing import Dict, Any
from app.validation.simulator import DemoSimulatorEngine
from app.api.deps import RoleChecker
from app.models.user import User

router = APIRouter()
allow_admin = RoleChecker(["Administrator"])

@router.get("/scenarios")
def list_demo_scenarios(current_user: User = Depends(allow_admin)):
    """
    Returns available attack demonstration scenarios. Restricted to Administrator role.
    """
    engine = DemoSimulatorEngine.get_instance()
    return engine.get_available_scenarios()

@router.post("/run")
def run_demo_scenario(
    payload: Dict[str, str] = Body(...),
    current_user: User = Depends(allow_admin)
):
    """
    Starts an asynchronous demonstration scenario run. Restricted to Administrator role.
    """
    scenario_id = payload.get("scenario_id")
    if not scenario_id:
        raise HTTPException(status_code=400, detail="Missing scenario_id field in request body.")
        
    engine = DemoSimulatorEngine.get_instance()
    res = engine.run_scenario_async(scenario_id)
    if res.get("status") == "busy":
        raise HTTPException(status_code=409, detail=res["message"])
    elif res.get("status") == "error":
        raise HTTPException(status_code=404, detail=res["message"])
        
    return res

@router.get("/status")
def get_demo_scenario_status(current_user: User = Depends(allow_admin)):
    """
    Returns active demonstration scenario status. Restricted to Administrator role.
    """
    engine = DemoSimulatorEngine.get_instance()
    return engine.get_status()

@router.get("/history")
def get_demo_execution_history(current_user: User = Depends(allow_admin)):
    """
    Returns previous demonstration runs in session. Restricted to Administrator role.
    """
    engine = DemoSimulatorEngine.get_instance()
    return engine.history
