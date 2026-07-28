import time
import numpy as np
from typing import Dict, Tuple, List, Optional
from collections import deque
from app.core.events.packet_event import PacketEvent
from app.core.models.network_models import Protocol
from app.features.canonical import CanonicalFeatures
from app.core.interfaces.traffic_consumer import TrafficConsumer
from app.features.store import FeatureStore

class FlowFeatureExtractor(TrafficConsumer):
    """
    Stateful Flow Feature Extractor.
    Aggregates PacketEvents into CanonicalFeatures.
    """
    def __init__(self, flow_timeout: int = 120):
        self.flow_timeout = flow_timeout
        # Key: (src_ip, dst_ip, src_port, dst_port, protocol)
        self.flows: Dict[Tuple, Dict] = {}
        self.feature_store = FeatureStore.get_instance()

    def consume_packet(self, event: PacketEvent) -> None:
        result = self.extract_features(event)
        if result:
            key, feature = result
            self.feature_store.update_feature(key, feature)

    def _get_flow_key(self, event: PacketEvent) -> Tuple:
        # Standardize direction: smaller IP is "forward" to match both directions?
        # Actually, in dataset (like CICIDS2017), "forward" is usually the direction of the first packet seen.
        # So we keep it exactly as the first packet seen.
        return (event.source_ip, event.destination_ip, event.source_port, event.destination_port, event.protocol)
        
    def _get_reverse_flow_key(self, event: PacketEvent) -> Tuple:
        return (event.destination_ip, event.source_ip, event.destination_port, event.source_port, event.protocol)

    def extract_features(self, event: PacketEvent) -> Optional[Tuple[Tuple, CanonicalFeatures]]:
        key = self._get_flow_key(event)
        rev_key = self._get_reverse_flow_key(event)
        
        current_time = event.timestamp.timestamp()
        
        is_forward = True
        
        if rev_key in self.flows:
            key = rev_key
            is_forward = False
        elif key not in self.flows:
            # Create new flow
            self.flows[key] = {
                'start_time': current_time,
                'last_time': current_time,
                'last_fwd_time': current_time if is_forward else 0.0,
                'last_bwd_time': current_time if not is_forward else 0.0,
                'fwd_packets': 0,
                'bwd_packets': 0,
                'fwd_bytes': 0,
                'bwd_bytes': 0,
                'fwd_pkt_lens': [],
                'bwd_pkt_lens': [],
                'pkt_lens': [],
                'fwd_iats': [],
                'bwd_iats': [],
                'flow_iats': [],
                'fin_count': 0,
                'psh_count': 0,
                'ack_count': 0
            }
            
        flow = self.flows[key]
        
        # Inter-arrival times
        flow_iat = current_time - flow['last_time']
        if flow['fwd_packets'] + flow['bwd_packets'] > 0:
            flow['flow_iats'].append(flow_iat)
            
        flow['last_time'] = current_time
        
        # Parse flags
        flags = event.flags or ""
        if "F" in flags: flow['fin_count'] += 1
        if "P" in flags: flow['psh_count'] += 1
        if "A" in flags: flow['ack_count'] += 1
        
        length = event.length
        flow['pkt_lens'].append(length)

        if is_forward:
            if flow['fwd_packets'] > 0:
                flow['fwd_iats'].append(current_time - flow['last_fwd_time'])
            flow['last_fwd_time'] = current_time
            flow['fwd_packets'] += 1
            flow['fwd_bytes'] += length
            flow['fwd_pkt_lens'].append(length)
        else:
            if flow['bwd_packets'] > 0:
                flow['bwd_iats'].append(current_time - flow['last_bwd_time'])
            flow['last_bwd_time'] = current_time
            flow['bwd_packets'] += 1
            flow['bwd_bytes'] += length
            flow['bwd_pkt_lens'].append(length)
            
        # We can yield features periodically or per-packet. Let's return the updated features.
        return key, self._build_canonical(key, flow)
        
    def _build_canonical(self, key: Tuple, flow: Dict) -> CanonicalFeatures:
        duration = flow['last_time'] - flow['start_time']
        duration_s = duration if duration > 0 else 0.000001 # prevent div/0
        
        fwd_lens = flow['fwd_pkt_lens']
        bwd_lens = flow['bwd_pkt_lens']
        all_lens = flow['pkt_lens']
        
        flow_iats = flow['flow_iats']
        fwd_iats = flow['fwd_iats']
        bwd_iats = flow['bwd_iats']
        
        fwd_mean = float(np.mean(fwd_lens)) if fwd_lens else 0.0
        bwd_mean = float(np.mean(bwd_lens)) if bwd_lens else 0.0
        all_mean = float(np.mean(all_lens)) if all_lens else 0.0
        all_var = float(np.var(all_lens)) if all_lens else 0.0
        
        return CanonicalFeatures(
            destination_port=float(key[3]),
            flow_duration=float(duration),
            total_fwd_packets=float(flow['fwd_packets']),
            total_length_fwd_packets=float(flow['fwd_bytes']),
            fwd_packet_length_max=float(np.max(fwd_lens)) if fwd_lens else 0.0,
            fwd_packet_length_min=float(np.min(fwd_lens)) if fwd_lens else 0.0,
            fwd_packet_length_mean=fwd_mean,
            bwd_packet_length_max=float(np.max(bwd_lens)) if bwd_lens else 0.0,
            bwd_packet_length_min=float(np.min(bwd_lens)) if bwd_lens else 0.0,
            bwd_packet_length_mean=bwd_mean,
            flow_bytes_s=float((flow['fwd_bytes'] + flow['bwd_bytes']) / duration_s),
            flow_packets_s=float((flow['fwd_packets'] + flow['bwd_packets']) / duration_s),
            flow_iat_mean=float(np.mean(flow_iats)) if flow_iats else 0.0,
            flow_iat_max=float(np.max(flow_iats)) if flow_iats else 0.0,
            flow_iat_min=float(np.min(flow_iats)) if flow_iats else 0.0,
            fwd_iat_total=float(np.sum(fwd_iats)) if fwd_iats else 0.0,
            bwd_iat_total=float(np.sum(bwd_iats)) if bwd_iats else 0.0,
            fwd_packets_s=float(flow['fwd_packets'] / duration_s),
            bwd_packets_s=float(flow['bwd_packets'] / duration_s),
            packet_length_mean=all_mean,
            packet_length_variance=all_var,
            fin_flag_count=float(flow['fin_count']),
            psh_flag_count=float(flow['psh_count']),
            ack_flag_count=float(flow['ack_count']),
            average_packet_size=all_mean
        )

    def cleanup(self, current_time: float) -> None:
        stale = [k for k, v in self.flows.items() if current_time - v['last_time'] > self.flow_timeout]
        for k in stale:
            del self.flows[k]
