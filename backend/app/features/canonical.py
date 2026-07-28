from pydantic import BaseModel, Field
from typing import List

class CanonicalFeatures(BaseModel):
    """
    The Single Source of Truth for Machine Learning Features.
    Both Live Traffic and Training Datasets MUST map to this representation.
    """
    destination_port: float = 0.0
    flow_duration: float = 0.0
    total_fwd_packets: float = 0.0
    total_length_fwd_packets: float = 0.0
    fwd_packet_length_max: float = 0.0
    fwd_packet_length_min: float = 0.0
    fwd_packet_length_mean: float = 0.0
    bwd_packet_length_max: float = 0.0
    bwd_packet_length_min: float = 0.0
    bwd_packet_length_mean: float = 0.0
    flow_bytes_s: float = 0.0
    flow_packets_s: float = 0.0
    flow_iat_mean: float = 0.0
    flow_iat_max: float = 0.0
    flow_iat_min: float = 0.0
    fwd_iat_total: float = 0.0
    bwd_iat_total: float = 0.0
    fwd_packets_s: float = 0.0
    bwd_packets_s: float = 0.0
    packet_length_mean: float = 0.0
    packet_length_variance: float = 0.0
    fin_flag_count: float = 0.0
    psh_flag_count: float = 0.0
    ack_flag_count: float = 0.0
    average_packet_size: float = 0.0

    def to_array(self) -> List[float]:
        return [
            self.destination_port,
            self.flow_duration,
            self.total_fwd_packets,
            self.total_length_fwd_packets,
            self.fwd_packet_length_max,
            self.fwd_packet_length_min,
            self.fwd_packet_length_mean,
            self.bwd_packet_length_max,
            self.bwd_packet_length_min,
            self.bwd_packet_length_mean,
            self.flow_bytes_s,
            self.flow_packets_s,
            self.flow_iat_mean,
            self.flow_iat_max,
            self.flow_iat_min,
            self.fwd_iat_total,
            self.bwd_iat_total,
            self.fwd_packets_s,
            self.bwd_packets_s,
            self.packet_length_mean,
            self.packet_length_variance,
            self.fin_flag_count,
            self.psh_flag_count,
            self.ack_flag_count,
            self.average_packet_size
        ]

    @classmethod
    def feature_names(cls) -> List[str]:
        return list(cls.__fields__.keys())
