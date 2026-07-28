import threading
import time
import random
import uuid
from datetime import datetime
from typing import List, Optional
from app.core.interfaces.packet_source import PacketSource, PacketCallback
from app.core.events.packet_event import PacketEvent
from app.core.models.network_models import Protocol

class SimulatedSource(PacketSource):
    def __init__(self, packets_per_second: int = 10):
        self.packets_per_second = packets_per_second
        self._callbacks: List[PacketCallback] = []
        self._stop_event = threading.Event()
        self._thread: Optional[threading.Thread] = None
        self._internal_ips = ["192.168.1.10", "192.168.1.20", "192.168.1.50", "10.0.0.5"]
        self._external_ips = ["8.8.8.8", "1.1.1.1", "104.21.44.20", "142.250.190.46"]

    def register_callback(self, callback: PacketCallback) -> None:
        self._callbacks.append(callback)

    def start(self) -> None:
        if self._thread and self._thread.is_alive():
            return
            
        self._stop_event.clear()
        self._thread = threading.Thread(target=self._simulate_loop, daemon=True)
        self._thread.start()

    def stop(self) -> None:
        self._stop_event.set()
        if self._thread:
            self._thread.join(timeout=2.0)

    def _generate_random_packet(self) -> PacketEvent:
        is_outbound = random.choice([True, False])
        if is_outbound:
            src = random.choice(self._internal_ips)
            dst = random.choice(self._external_ips)
        else:
            src = random.choice(self._external_ips)
            dst = random.choice(self._internal_ips)
            
        protocol = random.choices(
            [Protocol.TCP, Protocol.UDP, Protocol.ICMP, Protocol.ARP],
            weights=[80, 15, 4, 1]
        )[0]
        
        length = random.randint(64, 1500)
        
        event = PacketEvent(
            id=str(uuid.uuid4()),
            timestamp=datetime.utcnow(),
            source_ip=src,
            destination_ip=dst,
            protocol=protocol,
            length=length,
            payload_size=max(0, length - 40),
            raw_summary=f"Simulated {protocol.value} packet {src} -> {dst}"
        )
        
        if protocol in [Protocol.TCP, Protocol.UDP]:
            event.source_port = random.randint(1024, 65535)
            event.destination_port = random.choice([80, 443, 53, 22, 3389])
            if protocol == Protocol.TCP:
                event.flags = random.choice(["S", "PA", "A", "FA"])
                
        return event

    def _simulate_loop(self) -> None:
        sleep_time = 1.0 / self.packets_per_second
        while not self._stop_event.is_set():
            packet = self._generate_random_packet()
            for callback in self._callbacks:
                try:
                    callback(packet)
                except Exception:
                    pass
            time.sleep(sleep_time * random.uniform(0.5, 1.5))
