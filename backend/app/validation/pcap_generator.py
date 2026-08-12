import os
import time
from typing import List
from scapy.all import Ether, IP, TCP, UDP, wrpcap

SIMULATOR_DATA_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "simulator",
    "data"
)
os.makedirs(SIMULATOR_DATA_DIR, exist_ok=True)

class PcapGenerator:
    """
    Generates real PCAP binary files on disk containing valid Ethernet/IP/TCP/UDP packet streams 
    for specific attack signatures.
    """

    @staticmethod
    def generate_portscan_pcap(filename: str = "port_scan.pcap", packet_count: int = 150) -> str:
        filepath = os.path.join(SIMULATOR_DATA_DIR, filename)
        packets = []
        start_time = time.time()
        src_ip = "192.168.1.105"
        dst_ip = "172.16.0.10"

        # Web/database target ports (excluding auth ports 21/22/3389)
        ports = [80, 443, 8080, 8443, 53, 110, 139, 445, 1433, 3306, 5432]
        for i in range(packet_count):
            dport = ports[i % len(ports)]
            sport = 49152 + (i % 1000)
            pkt = (
                Ether(dst="ff:ff:ff:ff:ff:ff") /
                IP(src=src_ip, dst=dst_ip) /
                TCP(sport=sport, dport=dport, flags="S")  # SYN scan probes (0 PSH flags)
            )
            pkt.time = start_time + (i * 0.0004)  # High-rate 2,500 pkts/s scan rate
            packets.append(pkt)

        wrpcap(filepath, packets)
        return filepath

    @staticmethod
    def generate_dos_pcap(filename: str = "dos_attack.pcap", packet_count: int = 1000) -> str:
        filepath = os.path.join(SIMULATOR_DATA_DIR, filename)
        packets = []
        start_time = time.time()
        src_ip = "10.0.0.45"
        dst_ip = "172.16.0.10"

        for i in range(packet_count):
            sport = 1024 + (i % 60000)
            payload = b"X" * 1200  # High-volume flood payload (>1000 bytes)
            pkt = (
                Ether(dst="ff:ff:ff:ff:ff:ff") /
                IP(src=src_ip, dst=dst_ip) /
                UDP(sport=sport, dport=80) /
                payload
            )
            pkt.time = start_time + (i * 0.0002)  # High-volume flood (5,000 pkts/s)
            packets.append(pkt)

        wrpcap(filepath, packets)
        return filepath

    @staticmethod
    def generate_brute_force_pcap(filename: str = "brute_force.pcap", packet_count: int = 150) -> str:
        filepath = os.path.join(SIMULATOR_DATA_DIR, filename)
        packets = []
        start_time = time.time()
        src_ip = "192.168.1.105"
        dst_ip = "172.16.0.10"

        for i in range(packet_count):
            sport = 50000 + (i // 3)
            # High frequency PSH+ACK auth attempts on port 22
            flags = "PA"
            payload = b"SSH-2.0-OpenSSH_8.2\nuser=root&pass=admin123\n"
            pkt = (
                Ether(dst="ff:ff:ff:ff:ff:ff") /
                IP(src=src_ip, dst=dst_ip) /
                TCP(sport=sport, dport=22, flags=flags) /
                payload
            )
            pkt.time = start_time + (i * 0.02)  # Low rate, high PSH auth bursts on port 22
            packets.append(pkt)

        wrpcap(filepath, packets)
        return filepath

    @staticmethod
    def generate_mixed_attack_pcap(filename: str = "mixed_attack.pcap", packet_count: int = 850) -> str:
        filepath = os.path.join(SIMULATOR_DATA_DIR, filename)
        packets = []
        start_time = time.time()
        src_ip = "192.168.1.200"
        dst_ip = "172.16.0.10"

        for i in range(packet_count):
            if i < 150:
                # Stage 1: High-rate port scan
                pkt = (
                    Ether(dst="ff:ff:ff:ff:ff:ff") /
                    IP(src=src_ip, dst=dst_ip) /
                    TCP(sport=40000+i, dport=80+i, flags="S")
                )
            elif i < 350:
                # Stage 2: SSH Brute Force auth burst
                pkt = (
                    Ether(dst="ff:ff:ff:ff:ff:ff") /
                    IP(src=src_ip, dst=dst_ip) /
                    TCP(sport=50000, dport=22, flags="PA") /
                    b"SSH-2.0-OpenSSH_8.2\nroot:admin123"
                )
            else:
                # Stage 3: Massive UDP DoS flood payload
                pkt = (
                    Ether(dst="ff:ff:ff:ff:ff:ff") /
                    IP(src=src_ip, dst=dst_ip) /
                    UDP(sport=55555, dport=80) /
                    (b"FLOOD" * 250)
                )
            pkt.time = start_time + (i * 0.0002)
            packets.append(pkt)

        wrpcap(filepath, packets)
        return filepath

    @staticmethod
    def generate_web_attack_pcap(filename: str = "web_attack.pcap", packet_count: int = 180) -> str:
        filepath = os.path.join(SIMULATOR_DATA_DIR, filename)
        packets = []
        start_time = time.time()
        src_ip = "192.168.1.188"
        dst_ip = "172.16.0.10"

        # SQL Injection / Cross-Site Scripting (XSS) HTTP GET payload on port 80/443
        payloads = [
            b"GET /login?user=' OR '1'='1'-- HTTP/1.1\r\nHost: target.com\r\n\r\n",
            b"GET /search?q=<script>alert('XSS')</script> HTTP/1.1\r\nHost: target.com\r\n\r\n",
            b"POST /admin/upload?cmd=cat+/etc/passwd HTTP/1.1\r\nHost: target.com\r\n\r\n"
        ]

        for i in range(packet_count):
            sport = 45000 + (i % 500)
            payload = payloads[i % len(payloads)]
            pkt = (
                Ether(dst="ff:ff:ff:ff:ff:ff") /
                IP(src=src_ip, dst=dst_ip) /
                TCP(sport=sport, dport=80, flags="PA") /
                payload
            )
            pkt.time = start_time + (i * 0.01)
            packets.append(pkt)

        wrpcap(filepath, packets)
        return filepath

    @staticmethod
    def generate_botnet_pcap(filename: str = "botnet_traffic.pcap", packet_count: int = 200) -> str:
        filepath = os.path.join(SIMULATOR_DATA_DIR, filename)
        packets = []
        start_time = time.time()
        src_ip = "192.168.1.250"
        dst_ip = "198.51.100.42"  # External Command & Control (C2) Server IP

        # IRC / Custom C2 beaconing on port 6667 / 8443
        for i in range(packet_count):
            sport = 60000 + (i % 100)
            payload = b"PING :c2server.net\r\nPONG :bot_zombie_09\r\ncmd=exec_ddos\n"
            pkt = (
                Ether(dst="ff:ff:ff:ff:ff:ff") /
                IP(src=src_ip, dst=dst_ip) /
                TCP(sport=sport, dport=6667, flags="PA") /
                payload
            )
            pkt.time = start_time + (i * 0.005)
            packets.append(pkt)

        wrpcap(filepath, packets)
        return filepath
