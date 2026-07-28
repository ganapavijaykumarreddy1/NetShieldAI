from abc import ABC, abstractmethod
from typing import Callable
from app.core.events.packet_event import PacketEvent

PacketCallback = Callable[[PacketEvent], None]

class PacketSource(ABC):
    @abstractmethod
    def start(self) -> None:
        """Start generating/capturing packets."""
        pass

    @abstractmethod
    def stop(self) -> None:
        """Stop generating/capturing packets."""
        pass
        
    @abstractmethod
    def register_callback(self, callback: PacketCallback) -> None:
        """Register a callback to be called when a packet is received."""
        pass
