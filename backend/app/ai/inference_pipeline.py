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

        # --- HEURISTIC THREAT EVALUATION RULES ---
        # 1. Routine background connections, single/few-packet handshakes (<15 packets) are Normal Traffic
        if feature.total_fwd_packets <= 15:
            return ThreatPrediction(False, "Normal Traffic", 0.99, 0.0, "Low")

        # 2. SSH/FTP Brute Force: High-frequency auth payload bursts on port 22, 21, or 3389 with PSH flags
        if feature.destination_port in (22.0, 21.0, 3389.0) and feature.psh_flag_count > 5:
            return ThreatPrediction(True, "Brute Force", 0.975, 82.0, "Critical")

        # 3. Web Attack: Unencrypted HTTP exploit probe (Port 80/8080) with high PSH burst and 0 response
        if feature.destination_port in (80.0, 8080.0) and feature.psh_flag_count > 25 and feature.bwd_packets_s == 0.0:
            return ThreatPrediction(True, "Web Attack", 0.968, 79.0, "Critical")

        # 4. Botnet C2 Beaconing: Command & Control IRC / beacon stream on port 6667 / 8443
        if feature.destination_port in (6667.0, 8443.0, 6668.0, 6669.0):
            return ThreatPrediction(True, "Botnet", 0.988, 88.0, "Critical")

        # 5. DDoS / UDP Flood: Heavy flood payloads or massive unidirectional packet streams (UDP / port 80 flood)
        if feature.bwd_packets_s == 0.0 and (feature.fwd_packet_length_mean > 500.0 or feature.total_fwd_packets > 800):
            return ThreatPrediction(True, "DDoS", 0.994, 95.0, "Critical")

        # 6. Port Scanning: High probe packet count (>30 packets) with high SYN probe rate (>400 pkts/s) without PSH payload
        if feature.total_fwd_packets > 30 and feature.fwd_packets_s > 400.0 and feature.psh_flag_count == 0:
            return ThreatPrediction(True, "PortScan", 0.982, 78.5, "Critical")

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
