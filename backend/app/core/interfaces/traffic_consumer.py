from abc import ABC, abstractmethod
from app.core.events.packet_event import PacketEvent

class TrafficConsumer(ABC):
    @abstractmethod
    def consume_packet(self, packet_event: PacketEvent) -> None:
        """Process a normalized packet event."""
        pass
