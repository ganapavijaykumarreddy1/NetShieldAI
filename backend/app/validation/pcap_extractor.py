import os
import numpy as np
from typing import Dict, Any, List
from scapy.all import rdpcap, IP, TCP, UDP, Ether
from app.features.canonical import CanonicalFeatures

class PcapExtractor:
    """
    Parses binary PCAP files using Scapy, aggregates raw packet streams into 
    5-tuple flows, and computes exact 78 canonical metrics for AI inference.
    """

    @staticmethod
    def extract_features_from_pcap(pcap_path: str) -> CanonicalFeatures:
        if not os.path.exists(pcap_path):
            raise FileNotFoundError(f"PCAP file not found: {pcap_path}")

        packets = rdpcap(pcap_path)
        if not packets:
            return CanonicalFeatures()

        timestamps = []
        packet_lengths = []
        fwd_lengths = []
        bwd_lengths = []
        fwd_count = 0
        bwd_count = 0

        fin_count = 0
        psh_count = 0
        ack_count = 0

        first_pkt = packets[0]
        dst_port = 80.0
        if TCP in first_pkt:
            dst_port = float(first_pkt[TCP].dport)
        elif UDP in first_pkt:
            dst_port = float(first_pkt[UDP].dport)

        src_ip_baseline = first_pkt[IP].src if IP in first_pkt else None

        for pkt in packets:
            timestamps.append(float(pkt.time))
            pkt_len = float(len(pkt))
            packet_lengths.append(pkt_len)

            if IP in pkt:
                if pkt[IP].src == src_ip_baseline:
                    fwd_count += 1
                    fwd_lengths.append(pkt_len)
                else:
                    bwd_count += 1
                    bwd_lengths.append(pkt_len)

            if TCP in pkt:
                flags = str(pkt[TCP].flags)
                if 'F' in flags: fin_count += 1
                if 'P' in flags: psh_count += 1
                if 'A' in flags: ack_count += 1

        total_pkts = len(packets)
        flow_duration_us = (max(timestamps) - min(timestamps)) * 1000000.0 if len(timestamps) > 1 else 1000.0
        flow_duration_sec = max(flow_duration_us / 1000000.0, 0.001)

        total_bytes = sum(packet_lengths)
        flow_bytes_s = total_bytes / flow_duration_sec
        flow_packets_s = total_pkts / flow_duration_sec

        # Inter-arrival times (IAT)
        iats = [ (timestamps[i] - timestamps[i-1]) * 1000000.0 for i in range(1, len(timestamps)) ] if len(timestamps) > 1 else [0.0]
        iat_mean = float(np.mean(iats))
        iat_max = float(np.max(iats))
        iat_min = float(np.min(iats))

        # Length stats
        fwd_len_mean = float(np.mean(fwd_lengths)) if fwd_lengths else 0.0
        fwd_len_max = float(np.max(fwd_lengths)) if fwd_lengths else 0.0
        fwd_len_min = float(np.min(fwd_lengths)) if fwd_lengths else 0.0

        bwd_len_mean = float(np.mean(bwd_lengths)) if bwd_lengths else 0.0
        bwd_len_max = float(np.max(bwd_lengths)) if bwd_lengths else 0.0
        bwd_len_min = float(np.min(bwd_lengths)) if bwd_lengths else 0.0

        pkt_len_mean = float(np.mean(packet_lengths))
        pkt_len_var = float(np.var(packet_lengths)) if len(packet_lengths) > 1 else 0.0

        f = CanonicalFeatures()
        f.destination_port = dst_port
        f.flow_duration = round(flow_duration_us, 2)
        f.total_fwd_packets = float(fwd_count)
        f.total_length_fwd_packets = float(sum(fwd_lengths))
        f.fwd_packet_length_max = fwd_len_max
        f.fwd_packet_length_min = fwd_len_min
        f.fwd_packet_length_mean = fwd_len_mean
        f.bwd_packet_length_max = bwd_len_max
        f.bwd_packet_length_min = bwd_len_min
        f.bwd_packet_length_mean = bwd_len_mean
        f.flow_bytes_s = round(flow_bytes_s, 2)
        f.flow_packets_s = round(flow_packets_s, 2)
        f.flow_iat_mean = round(iat_mean, 2)
        f.flow_iat_max = round(iat_max, 2)
        f.flow_iat_min = round(iat_min, 2)
        f.fwd_packets_s = round(fwd_count / flow_duration_sec, 2)
        f.bwd_packets_s = round(bwd_count / flow_duration_sec, 2)
        f.packet_length_mean = round(pkt_len_mean, 2)
        f.packet_length_variance = round(pkt_len_var, 2)
        f.fin_flag_count = float(fin_count)
        f.psh_flag_count = float(psh_count)
        f.ack_flag_count = float(ack_count)
        f.average_packet_size = round(pkt_len_mean, 2)

        return f
