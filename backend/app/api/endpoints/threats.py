from fastapi import APIRouter
from typing import Dict, Any, List
from app.ai.inference_pipeline import InferencePipeline

router = APIRouter(prefix="/threats", tags=["Threats"])

@router.get("/feed")
def get_threat_feed() -> Dict[str, Any]:
    """
    Returns the latest threat predictions for all active flows,
    as well as an aggregated system risk score.
    """
    inference = InferencePipeline.get_instance()
    results = inference.evaluate_all_active_flows()
    
    feed = []
    total_risk = 0.0
    threat_count = 0
    
    for key, prediction in results.items():
        src_ip, dst_ip, src_port, dst_port, protocol = key
        
        feed.append({
            "flow_key": f"{src_ip}:{src_port} -> {dst_ip}:{dst_port} [{protocol.name if hasattr(protocol, 'name') else protocol}]",
            "prediction": prediction.to_dict()
        })
        
        if prediction.is_threat:
            total_risk += prediction.risk_score
            threat_count += 1
            
    # Calculate an aggregated system risk score (0-100)
    system_risk = 0.0
    system_severity = "Low"
    if len(results) > 0:
        # Heavily weight active threats
        avg_risk = total_risk / len(results)
        # Cap at 100
        system_risk = min(avg_risk + (threat_count * 10.0), 100.0)
        
    if system_risk <= 25:
        system_severity = "Low"
    elif system_risk <= 50:
        system_severity = "Medium"
    elif system_risk <= 75:
        system_severity = "High"
    else:
        system_severity = "Critical"
        
    # Sort feed by risk score descending
    feed.sort(key=lambda x: x['prediction']['risk_score'], reverse=True)
    
    return {
        "system_risk_score": round(system_risk, 2),
        "system_severity": system_severity,
        "active_flows_count": len(results),
        "active_threats_count": threat_count,
        "recent_threats": feed[:50] # return top 50
    }
