import threading
from scapy.all import sniff
from typing import List, Optional
from app.core.interfaces.packet_source import PacketSource, PacketCallback
from app.network.parser.packet_parser import PacketParser

class ScapySource(PacketSource):
    def __init__(self, interface: Optional[str] = None):
        self.interface = interface
        self._callbacks: List[PacketCallback] = []
        self._stop_event = threading.Event()
        self._thread: Optional[threading.Thread] = None

    def register_callback(self, callback: PacketCallback) -> None:
        self._callbacks.append(callback)

    def start(self) -> None:
        if self._thread and self._thread.is_alive():
            return
            
        self._stop_event.clear()
        self._thread = threading.Thread(target=self._sniff_loop, daemon=True)
        self._thread.start()

    def stop(self) -> None:
        self._stop_event.set()
        if self._thread:
            self._thread.join(timeout=2.0)

    def _sniff_loop(self) -> None:
        sniff(
            iface=self.interface,
            prn=self._handle_packet,
            stop_filter=lambda _: self._stop_event.is_set(),
            store=False
        )

    def _handle_packet(self, packet) -> None:
        try:
            event = PacketParser.parse(packet)
            for callback in self._callbacks:
                try:
                    callback(event)
                except Exception:
                    pass  # Log this in a real system
        except Exception:
            pass  # Log parsing error
