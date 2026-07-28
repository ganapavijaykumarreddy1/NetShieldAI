import uuid
from datetime import datetime
from scapy.all import Packet, IP, TCP, UDP, ICMP, ARP
from app.core.events.packet_event import PacketEvent
from app.core.models.network_models import Protocol

class PacketParser:
    @staticmethod
    def parse(packet: Packet) -> PacketEvent:
        event = PacketEvent(
            id=str(uuid.uuid4()),
            timestamp=datetime.utcnow(),
            length=len(packet),
            raw_summary=packet.summary()
        )
        
        if IP in packet:
            event.source_ip = packet[IP].src
            event.destination_ip = packet[IP].dst
            event.payload_size = len(packet[IP].payload)
            
            if TCP in packet:
                event.protocol = Protocol.TCP
                event.source_port = packet[TCP].sport
                event.destination_port = packet[TCP].dport
                event.flags = str(packet[TCP].flags)
            elif UDP in packet:
                event.protocol = Protocol.UDP
                event.source_port = packet[UDP].sport
                event.destination_port = packet[UDP].dport
            elif ICMP in packet:
                event.protocol = Protocol.ICMP
            else:
                event.protocol = Protocol.OTHER
        elif ARP in packet:
            event.protocol = Protocol.ARP
            event.source_ip = packet[ARP].psrc
            event.destination_ip = packet[ARP].pdst
            
        return event
