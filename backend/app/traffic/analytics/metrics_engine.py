import threading
from collections import deque, Counter
from datetime import datetime, timedelta
from typing import List
from app.core.interfaces.traffic_consumer import TrafficConsumer
from app.core.events.packet_event import PacketEvent
from app.core.models.network_models import Protocol
from app.traffic.flows.connection_tracker import ConnectionTracker
from app.traffic.models.traffic_metrics import TrafficStatistics, NetworkStatus, ProtocolStats, EndpointStats

class MetricsEngine(TrafficConsumer):
    def __init__(self):
        self.lock = threading.Lock()
        self.start_time = datetime.utcnow()
        self.total_packets = 0
        self.recent_packets = deque(maxlen=100) # Keep last 100 packets
        
        # Sliding window for PPS and BPS
        self.window_seconds = 5
        self.packet_timestamps = deque()
        self.bytes_window = deque()
        
        self.protocol_counts = {p: 0 for p in Protocol}
        self.source_counts = Counter()
        self.dest_counts = Counter()
        
        self.connection_tracker = ConnectionTracker()

    def consume_packet(self, event: PacketEvent) -> None:
        with self.lock:
            self.total_packets += 1
            self.recent_packets.append(event)
            
            now = datetime.utcnow()
            self.packet_timestamps.append(now)
            self.bytes_window.append((now, event.length))
            
            self.protocol_counts[event.protocol] += 1
            
            if event.source_ip:
                self.source_counts[event.source_ip] += 1
            if event.destination_ip:
                self.dest_counts[event.destination_ip] += 1
                
            self.connection_tracker.track(event)
            self._cleanup_windows(now)

    def _cleanup_windows(self, now: datetime) -> None:
        cutoff = now - timedelta(seconds=self.window_seconds)
        while self.packet_timestamps and self.packet_timestamps[0] < cutoff:
            self.packet_timestamps.popleft()
        while self.bytes_window and self.bytes_window[0][0] < cutoff:
            self.bytes_window.popleft()

    def get_statistics(self) -> TrafficStatistics:
        with self.lock:
            now = datetime.utcnow()
            self._cleanup_windows(now)
            
            pps = len(self.packet_timestamps) / self.window_seconds if self.window_seconds > 0 else 0
            bps = sum(b for _, b in self.bytes_window) / self.window_seconds if self.window_seconds > 0 else 0
            uptime = int((now - self.start_time).total_seconds())
            
            status = NetworkStatus(
                total_packets=self.total_packets,
                packets_per_second=round(pps, 2),
                bytes_per_second=round(bps, 2),
                active_connections=self.connection_tracker.active_count,
                uptime_seconds=uptime
            )
            
            protocols = ProtocolStats(
                tcp=self.protocol_counts[Protocol.TCP],
                udp=self.protocol_counts[Protocol.UDP],
                icmp=self.protocol_counts[Protocol.ICMP],
                arp=self.protocol_counts[Protocol.ARP],
                other=self.protocol_counts[Protocol.OTHER]
            )
            
            top_sources = [EndpointStats(ip=ip, count=c) for ip, c in self.source_counts.most_common(5)]
            top_destinations = [EndpointStats(ip=ip, count=c) for ip, c in self.dest_counts.most_common(5)]
            
            return TrafficStatistics(
                status=status,
                protocols=protocols,
                top_sources=top_sources,
                top_destinations=top_destinations
            )

    def get_recent_packets(self) -> List[PacketEvent]:
        with self.lock:
            return list(self.recent_packets)
