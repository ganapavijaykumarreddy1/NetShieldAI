from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime

class NetworkStatus(BaseModel):
    total_packets: int = 0
    packets_per_second: float = 0.0
    bytes_per_second: float = 0.0
    active_connections: int = 0
    uptime_seconds: int = 0

class ProtocolStats(BaseModel):
    tcp: int = 0
    udp: int = 0
    icmp: int = 0
    arp: int = 0
    other: int = 0

class EndpointStats(BaseModel):
    ip: str
    count: int

class TrafficStatistics(BaseModel):
    status: NetworkStatus
    protocols: ProtocolStats
    top_sources: List[EndpointStats]
    top_destinations: List[EndpointStats]
