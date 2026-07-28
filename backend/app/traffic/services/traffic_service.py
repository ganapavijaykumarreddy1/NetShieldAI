from app.traffic.analytics.metrics_engine import MetricsEngine
from app.network.engine import PacketMonitoringEngine
from app.network.capture.simulated_source import SimulatedSource
from app.network.capture.scapy_source import ScapySource

class TrafficService:
    _instance = None
    
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        self.metrics_engine = MetricsEngine()
        
        # Using SimulatedSource by default for testing.
        self.packet_source = ScapySource()
        
        self.network_engine = PacketMonitoringEngine(self.packet_source)
        self.network_engine.register_consumer(self.metrics_engine)
        
        from app.features.extractor import FlowFeatureExtractor
        self.flow_extractor = FlowFeatureExtractor()
        self.network_engine.register_consumer(self.flow_extractor)

    def start(self):
        self.network_engine.start()

    def stop(self):
        self.network_engine.stop()

    def get_statistics(self):
        return self.metrics_engine.get_statistics()
        
    def get_recent_packets(self):
        return self.metrics_engine.get_recent_packets()
