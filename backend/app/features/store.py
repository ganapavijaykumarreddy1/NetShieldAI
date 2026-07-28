import threading
from typing import Dict, Tuple, List, Optional
from datetime import datetime
from app.features.canonical import CanonicalFeatures

class FeatureStore:
    """
    In-memory repository for latest CanonicalFeatures.
    Used by the Inference Pipeline to score live flows.
    """
    _instance = None
    
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        self.lock = threading.Lock()
        # Key: (src_ip, dst_ip, src_port, dst_port, protocol)
        self.latest_features: Dict[Tuple, CanonicalFeatures] = {}
        self.last_updated: Dict[Tuple, datetime] = {}
        
    def update_feature(self, key: Tuple, feature: CanonicalFeatures):
        with self.lock:
            self.latest_features[key] = feature
            self.last_updated[key] = datetime.utcnow()
            
    def get_feature(self, key: Tuple) -> Optional[CanonicalFeatures]:
        with self.lock:
            return self.latest_features.get(key)
            
    def get_all_active_features(self, timeout_seconds: int = 10) -> Dict[Tuple, CanonicalFeatures]:
        """Returns features updated within the last `timeout_seconds`"""
        with self.lock:
            now = datetime.utcnow()
            active = {}
            for k, dt in list(self.last_updated.items()):
                if (now - dt).total_seconds() <= timeout_seconds:
                    active[k] = self.latest_features[k]
                else:
                    # Cleanup old features
                    if k in self.latest_features:
                        del self.latest_features[k]
                    del self.last_updated[k]
            return active
