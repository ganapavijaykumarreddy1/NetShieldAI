from typing import List, Type
from app.core.interfaces.packet_source import PacketSource
from app.core.interfaces.traffic_consumer import TrafficConsumer

class PacketMonitoringEngine:
    def __init__(self, source: PacketSource):
        self.source = source
        self.consumers: List[TrafficConsumer] = []
        self.source.register_callback(self._on_packet)

    def register_consumer(self, consumer: TrafficConsumer) -> None:
        self.consumers.append(consumer)

    def start(self) -> None:
        self.source.start()

    def stop(self) -> None:
        self.source.stop()

    def _on_packet(self, packet_event) -> None:
        for consumer in self.consumers:
            try:
                consumer.consume_packet(packet_event)
            except Exception:
                pass  # Log in a real system
