from typing import Dict, Tuple
from app.core.events.packet_event import PacketEvent
from app.core.models.network_models import Protocol

class ConnectionTracker:
    def __init__(self):
        # Key: (src_ip, dst_ip, src_port, dst_port, protocol)
        self.active_connections: Dict[Tuple, float] = {}
        self.connection_timeout = 300  # 5 minutes

    def track(self, event: PacketEvent) -> None:
        if event.protocol in [Protocol.TCP, Protocol.UDP]:
            # Normalize connection key (smaller IP first to match both directions)
            if event.source_ip and event.destination_ip:
                if event.source_ip < event.destination_ip:
                    key = (event.source_ip, event.destination_ip, event.source_port, event.destination_port, event.protocol)
                else:
                    key = (event.destination_ip, event.source_ip, event.destination_port, event.source_port, event.protocol)
                
                self.active_connections[key] = event.timestamp.timestamp()
                
                # Cleanup (could be done in a background thread or periodically)
                self._cleanup_stale_connections(event.timestamp.timestamp())

    def _cleanup_stale_connections(self, current_time: float) -> None:
        stale_keys = [
            k for k, last_seen in self.active_connections.items()
            if current_time - last_seen > self.connection_timeout
        ]
        for k in stale_keys:
            del self.active_connections[k]

    @property
    def active_count(self) -> int:
        return len(self.active_connections)
