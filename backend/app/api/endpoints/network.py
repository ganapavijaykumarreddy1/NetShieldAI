from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from app.traffic.services.traffic_service import TrafficService
from app.traffic.models.traffic_metrics import TrafficStatistics, NetworkStatus, ProtocolStats
from app.core.events.packet_event import PacketEvent
from app.api import deps

router = APIRouter()

def get_traffic_service() -> TrafficService:
    return TrafficService.get_instance()

@router.get("/status", response_model=NetworkStatus)
def get_network_status(
    service: TrafficService = Depends(get_traffic_service),
    current_user: Any = Depends(deps.get_current_active_user)
):
    stats = service.get_statistics()
    return stats.status

@router.get("/statistics", response_model=TrafficStatistics)
def get_network_statistics(
    service: TrafficService = Depends(get_traffic_service),
    current_user: Any = Depends(deps.get_current_active_user)
):
    return service.get_statistics()

@router.get("/protocols", response_model=ProtocolStats)
def get_protocol_distribution(
    service: TrafficService = Depends(get_traffic_service),
    current_user: Any = Depends(deps.get_current_active_user)
):
    stats = service.get_statistics()
    return stats.protocols

@router.get("/connections", response_model=Dict[str, int])
def get_active_connections(
    service: TrafficService = Depends(get_traffic_service),
    current_user: Any = Depends(deps.get_current_active_user)
):
    stats = service.get_statistics()
    return {"active_connections": stats.status.active_connections}

@router.get("/packets/recent", response_model=List[PacketEvent])
def get_recent_packets(
    service: TrafficService = Depends(get_traffic_service),
    current_user: Any = Depends(deps.get_current_active_user)
):
    return service.get_recent_packets()
