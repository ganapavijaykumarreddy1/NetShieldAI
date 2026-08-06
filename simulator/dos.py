from scapy.all import Ether, IP, TCP, wrpcap
import time
import os

def generate_dos_pcap(output_path="simulator/data/dos_attack.pcap", packet_count=5000):
    print(f"[*] Generating synthetic DoS attack PCAP: {output_path}...")
    packets = []
    start_time = time.time()
    for i in range(packet_count):
        src_port = 12345
        pkt = (
            Ether(dst="ff:ff:ff:ff:ff:ff") / 
            IP(src="192.168.100.200", dst="192.168.100.102") / 
            TCP(sport=src_port, dport=80, flags="S")
        )
        pkt.time = start_time + (i * 0.01)
        packets.append(pkt)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    wrpcap(output_path, packets)
    print(f"[*] Successfully generated '{output_path}'.")
