import threading
import time
import logging
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.ai.inference_pipeline import InferencePipeline
from app.soc.alerts.engine import AlertEngine
from app.core.database import SessionLocal

logger = logging.getLogger(__name__)

class ThreatDetectionService:
    _instance = None
    
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        self.running = False
        self.thread: Optional[threading.Thread] = None
        self.latest_feed_data = {
            "system_risk_score": 0.0,
            "system_severity": "Low",
            "active_flows_count": 0,
            "active_threats_count": 0,
            "recent_threats": []
        }
        self.lock = threading.Lock()
        
    def start(self):
        if self.running:
            return
        self.running = True
        self.thread = threading.Thread(target=self._detection_loop, daemon=True)
        self.thread.start()
        logger.info("Threat Detection Service started.")
        
    def stop(self):
        self.running = False
        if self.thread and self.thread.is_alive():
            self.thread.join(timeout=2.0)
        logger.info("Threat Detection Service stopped.")
        
    def get_latest_feed(self) -> Dict[str, Any]:
        with self.lock:
            return self.latest_feed_data
            
    def _detection_loop(self):
        inference = InferencePipeline.get_instance()
        last_loop_time = time.time()
        
        while self.running:
            try:
                now = time.time()
                loop_delta = now - last_loop_time
                last_loop_time = now

                # Detect system sleep / hibernation gap in background loop execution
                if loop_delta > 5.0:
                    logger.warning(f"[WAKEUP GUARD] System sleep gap of {loop_delta:.1f}s detected. Purging feature store and entering 10s grace period.")
                    from app.features.store import FeatureStore
                    FeatureStore.get_instance().clear()
                    with self.lock:
                        self.latest_feed_data["recent_threats"] = []
                        self.latest_feed_data["active_threats_count"] = 0
                        self.latest_feed_data["system_risk_score"] = 0.0
                    self.cooldown_until = time.time() + 10.0
                    last_loop_time = time.time()
                    time.sleep(2.0)
                    continue

                db: Session = SessionLocal()
                alert_engine = AlertEngine(db)
                
                results = inference.evaluate_all_active_flows()
                
                feed = []
                total_risk = 0.0
                threat_count = 0
                max_risk = 0.0
                in_cooldown = time.time() < getattr(self, 'cooldown_until', 0)
                
                for key, prediction in results.items():
                    src_ip, dst_ip, src_port, dst_port, protocol = key
                    
                    protocol_str = protocol.name if hasattr(protocol, 'name') else str(protocol)
                    
                    feed.append({
                        "flow_key": f"{src_ip}:{src_port} -> {dst_ip}:{dst_port} [{protocol_str}]",
                        "prediction": prediction.to_dict()
                    })
                    
                    if not in_cooldown:
                        alert_engine.process_prediction(src_ip, dst_ip, protocol_str, prediction)
                    
                    if prediction.is_threat and not in_cooldown:
                        total_risk += prediction.risk_score
                        threat_count += 1
                        max_risk = max(max_risk, prediction.risk_score)
                        
                db.close()
                
                system_risk = 0.0
                system_severity = "Low"
                if len(results) > 0:
                    system_risk = min(max_risk + (threat_count * 2.0), 100.0)
                    
                if system_risk <= 25:
                    system_severity = "Low"
                elif system_risk <= 50:
                    system_severity = "Medium"
                elif system_risk <= 75:
                    system_severity = "High"
                else:
                    system_severity = "Critical"
                    
                feed.sort(key=lambda x: x['prediction']['risk_score'], reverse=True)
                
                with self.lock:
                    self.latest_feed_data = {
                        "system_risk_score": round(system_risk, 2),
                        "system_severity": system_severity,
                        "active_flows_count": len(results),
                        "active_threats_count": threat_count,
                        "recent_threats": feed[:50]
                    }
                    
            except Exception as e:
                logger.error(f"Error in Threat Detection loop: {e}")
                
            time.sleep(2.0)
