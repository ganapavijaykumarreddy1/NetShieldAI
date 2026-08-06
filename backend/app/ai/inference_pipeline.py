import os
import pickle
import numpy as np
import warnings
from typing import Dict, Any, Tuple
from app.features.canonical import CanonicalFeatures
from app.features.store import FeatureStore

class ThreatPrediction:
    def __init__(self, is_threat: bool, threat_type: str, confidence: float, risk_score: float, severity: str):
        self.is_threat = is_threat
        self.threat_type = threat_type
        self.confidence = confidence
        self.risk_score = risk_score
        self.severity = severity
        
    def to_dict(self):
        return {
            "is_threat": self.is_threat,
            "threat_type": self.threat_type,
            "confidence": round(self.confidence, 4),
            "risk_score": round(self.risk_score, 2),
            "severity": self.severity
        }

class InferencePipeline:
    """
    Loads trained models and predicts threats based on CanonicalFeatures.
    """
    _instance = None
    
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self, model_dir: str = "models"):
        self.model_dir = model_dir
        self.model = None
        self.scaler = None
        self.encoder = None
        self.is_ready = False
        self._load_models()
        
    def _load_models(self):
        model_path = os.path.join(self.model_dir, "best_model.pkl")
        scaler_path = os.path.join(self.model_dir, "scaler.pkl")
        encoder_path = os.path.join(self.model_dir, "encoder.pkl")
        
        if os.path.exists(model_path) and os.path.exists(scaler_path) and os.path.exists(encoder_path):
            with open(model_path, "rb") as f:
                self.model = pickle.load(f)
            with open(scaler_path, "rb") as f:
                self.scaler = pickle.load(f)
            with open(encoder_path, "rb") as f:
                self.encoder = pickle.load(f)
            
            # Avoid the joblib Parallel warning when predicting a single sample
            if hasattr(self.model, "n_jobs"):
                self.model.n_jobs = 1
                
            self.is_ready = True
            print("Inference Pipeline: Models loaded successfully.")
        else:
            print("Inference Pipeline: Models not found. Training required.")

    def calculate_risk_score(self, threat_type: str, confidence: float, feature: CanonicalFeatures) -> Tuple[float, str]:
        """
        Risk Scoring logic based on confidence, threat class, and flow behavior.
        Returns:
            risk_score (0-100)
            severity (Low, Medium, High, Critical)
        """
        if threat_type in ('BENIGN', 'Normal Traffic'):
            return 0.0, "Low"
            
        # Base score on confidence
        base_score = confidence * 100
        
        # Adjust based on threat severity (simple mapping)
        critical_threats = ['DDoS', 'DoS', 'Bot', 'Web Attack', 'Infiltration']
        high_threats = ['PortScan', 'Brute Force']
        
        multiplier = 1.0
        for ct in critical_threats:
            if ct.lower() in threat_type.lower():
                multiplier = 1.5
                break
        for ht in high_threats:
            if ht.lower() in threat_type.lower():
                multiplier = 1.2
                break
                
        # Adjust based on traffic volume
        if feature.flow_bytes_s > 1000000: # > 1MB/s
            multiplier *= 1.2
            
        final_score = min(base_score * multiplier, 100.0)
        
        if final_score <= 25:
            severity = "Low"
        elif final_score <= 50:
            severity = "Medium"
        elif final_score <= 75:
            severity = "High"
        else:
            severity = "Critical"
            
        return final_score, severity

    def predict_flow(self, feature: CanonicalFeatures) -> ThreatPrediction:
        if not self.is_ready:
            # Safe fallback if models aren't trained
            return ThreatPrediction(False, "Normal Traffic", 1.0, 0.0, "Low")

        # --- HEURISTIC OVERRIDES ---
        # 1. Single/Double-packet reconnect probes or initial handshakes (<0.5s duration) are Normal Traffic
        if feature.total_fwd_packets <= 3 and feature.flow_duration < 500000.0:
            return ThreatPrediction(False, "Normal Traffic", 0.99, 0.0, "Low")

        # 2. If it's a massive 1-way flow, it's a DoS
        if feature.total_fwd_packets > 1000 and feature.bwd_packets_s == 0.0:
            return ThreatPrediction(True, "DoS", 0.99, 95.0, "Critical")
            
        arr = np.array([feature.to_array()])
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", category=UserWarning)
            arr_scaled = self.scaler.transform(arr)
        
        probs = self.model.predict_proba(arr_scaled)[0]
        pred_idx = np.argmax(probs)
        confidence = probs[pred_idx]
        threat_type = self.encoder.inverse_transform([pred_idx])[0]
        
        is_threat = (threat_type not in ('BENIGN', 'Normal Traffic'))
        
        risk_score, severity = self.calculate_risk_score(threat_type, confidence, feature)
        
        # Debug log to see what the model actually thought!
        if threat_type not in ('BENIGN', 'Normal Traffic'):
            print(f"[*] INFERENCE DETECTED THREAT: {threat_type} (Confidence: {confidence:.2f}, Risk: {risk_score:.2f})")
        else:
            # Print occasionally or just a small print to confirm we are evaluating
            print(f"[-] Inference: {threat_type} (Conf: {confidence:.2f}) - Bytes/s: {feature.flow_bytes_s:.2f}")

        return ThreatPrediction(is_threat, threat_type, confidence, risk_score, severity)
        
    def evaluate_all_active_flows(self) -> Dict[Tuple, ThreatPrediction]:
        store = FeatureStore.get_instance()
        active_features = store.get_all_active_features(timeout_seconds=10)
        
        results = {}
        for key, feature in active_features.items():
            results[key] = self.predict_flow(feature)
        return results
