import os
import time
import threading
from typing import Dict, Any, List
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.logging_config import ai_logger, alerts_logger, system_logger, notifications_logger
from app.features.canonical import CanonicalFeatures
from app.ai.inference_pipeline import InferencePipeline, ThreatPrediction
from app.models.soc import Alert, Incident, Notification
from app.soc.notifications.providers.gmail_provider import GmailNotificationProvider
from app.validation.pcap_generator import PcapGenerator
from app.validation.pcap_extractor import PcapExtractor
from app.validation.pcap_replayer import PcapReplayer
from app.validation.performance import PerformanceTracker

from app.features.store import FeatureStore
from app.traffic.services.traffic_service import TrafficService
from app.core.events.packet_event import PacketEvent

class ScenarioExecutionState:
    def __init__(self, scenario_id: str, name: str):
        self.scenario_id = scenario_id
        self.name = name
        self.status = "running"  # running, completed, failed
        self.current_step = 0
        self.total_steps = 6
        self.logs: List[Dict[str, Any]] = []
        self.generated_alert_id = None
        self.generated_incident_id = None
        self.email_sent = False
        self.pcap_path = None
        self.start_time = time.time()
        self.end_time = None

    def add_log(self, step: int, stage: str, message: str, details: Dict[str, Any] = None):
        self.current_step = step
        log_entry = {
            "timestamp": time.strftime("%H:%M:%S"),
            "step": step,
            "stage": stage,
            "message": message,
            "details": details or {}
        }
        self.logs.append(log_entry)
        system_logger.info(f"[Demo Engine] [{self.scenario_id}] Step {step}/6 ({stage}): {message}")

class DemoSimulatorEngine:
    _instance = None
    _lock = threading.Lock()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = cls()
        return cls._instance

    def __init__(self):
        self.active_execution: ScenarioExecutionState = None
        self.history: List[Dict[str, Any]] = []

    def get_available_scenarios(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": "port_scan",
                "name": "Reconnaissance Port Scan",
                "description": "Generates real PCAP binary 'port_scan.pcap' with 120 SYN probe packets across target ports and parses canonical metrics.",
                "severity": "High",
                "expected_prediction": "PortScan",
                "estimated_duration_sec": 8
            },
            {
                "id": "ddos_attack",
                "name": "Distributed Denial of Service (DDoS)",
                "description": "Generates real PCAP binary 'dos_attack.pcap' with 500 UDP high-volume flood frames (>10MB/s) and extracts payload metrics.",
                "severity": "Critical",
                "expected_prediction": "DDoS",
                "estimated_duration_sec": 9
            },
            {
                "id": "brute_force",
                "name": "SSH Credential Brute Force",
                "description": "Generates real PCAP binary 'brute_force.pcap' with 150 TCP PSH+ACK auth burst frames on port 22 and parses flow metrics.",
                "severity": "Critical",
                "expected_prediction": "Brute Force",
                "estimated_duration_sec": 8
            },
            {
                "id": "web_attack",
                "name": "Web Application Attack (SQLi / XSS)",
                "description": "Generates real PCAP binary 'web_attack.pcap' with SQL Injection and XSS HTTP payloads on port 80.",
                "severity": "Critical",
                "expected_prediction": "Web Attack",
                "estimated_duration_sec": 8
            },
            {
                "id": "botnet_attack",
                "name": "Botnet Command & Control (C2)",
                "description": "Generates real PCAP binary 'botnet_traffic.pcap' with IRC / C2 heartbeat beaconing on port 6667.",
                "severity": "Critical",
                "expected_prediction": "Botnet",
                "estimated_duration_sec": 8
            },
            {
                "id": "mixed_attack",
                "name": "Multi-Stage Cyber Attack Chain",
                "description": "Generates real PCAP binary 'mixed_attack.pcap' with multi-stage Reconnaissance -> SSH Auth -> DoS escalation packets.",
                "severity": "Critical",
                "expected_prediction": "Multi-Stage Threat Chain",
                "estimated_duration_sec": 10
            }
        ]

    def run_scenario_async(self, scenario_id: str):
        if self.active_execution and self.active_execution.status == "running":
            return {"status": "busy", "message": "Another scenario execution is currently in progress."}

        scenario_meta = next((s for s in self.get_available_scenarios() if s["id"] == scenario_id), None)
        if not scenario_meta:
            return {"status": "error", "message": f"Scenario '{scenario_id}' not recognized."}

        execution = ScenarioExecutionState(scenario_id, scenario_meta["name"])
        self.active_execution = execution

        thread = threading.Thread(target=self._execute_scenario_worker, args=(execution,), daemon=True)
        thread.start()

        return {
            "status": "started",
            "scenario_id": scenario_id,
            "message": f"Started demonstration scenario '{scenario_meta['name']}'."
        }

    def _execute_scenario_worker(self, execution: ScenarioExecutionState):
        db: Session = SessionLocal()
        perf = PerformanceTracker.get_instance()
        try:
            # Step 1: Real PCAP Binary File Generation & Replay
            t0 = time.time()
            if execution.scenario_id == "port_scan":
                pcap_file = PcapGenerator.generate_portscan_pcap()
                src_ip = "192.168.1.105"
                dst_ip = "172.16.0.10"
                dst_port = 80
                protocol = "TCP"
            elif execution.scenario_id == "ddos_attack":
                pcap_file = PcapGenerator.generate_dos_pcap()
                src_ip = "10.0.0.45"
                dst_ip = "172.16.0.10"
                dst_port = 80
                protocol = "UDP"
            elif execution.scenario_id == "brute_force":
                pcap_file = PcapGenerator.generate_brute_force_pcap()
                src_ip = "192.168.1.105"
                dst_ip = "172.16.0.10"
                dst_port = 22
                protocol = "TCP"
            elif execution.scenario_id == "web_attack":
                pcap_file = PcapGenerator.generate_web_attack_pcap()
                src_ip = "192.168.1.188"
                dst_ip = "172.16.0.10"
                dst_port = 80
                protocol = "TCP"
            elif execution.scenario_id == "botnet_attack":
                pcap_file = PcapGenerator.generate_botnet_pcap()
                src_ip = "192.168.1.250"
                dst_ip = "198.51.100.42"
                dst_port = 6667
                protocol = "TCP"
            else:
                pcap_file = PcapGenerator.generate_mixed_attack_pcap()
                src_ip = "192.168.1.200"
                dst_ip = "172.16.0.10"
                dst_port = 80
                protocol = "TCP"

            execution.pcap_path = pcap_file
            execution.add_log(1, "PCAP Replay & Packet Ingestion", f"Generated real PCAP binary file '{os.path.basename(pcap_file)}'. Transmitting raw Ethernet packets over active NIC driver...")
            PcapReplayer.replay_pcap_over_nic(pcap_file)
            time.sleep(1.5)

            # Step 2: Extract 78 Canonical Features from PCAP
            feature = PcapExtractor.extract_features_from_pcap(pcap_file)
            extraction_time_ms = (time.time() - t0) * 1000
            perf.record_latency("feature_extraction_ms", extraction_time_ms)

            # Push live flow into FeatureStore so Main Dashboard reflects active attack flow
            flow_key = (src_ip, dst_ip, 49152, dst_port, protocol)
            FeatureStore.get_instance().update_feature(flow_key, feature)

            execution.add_log(2, "Feature Extraction", f"Parsed PCAP packet headers. Extracted 78 canonical metrics in {extraction_time_ms:.2f} ms", {
                "pcap_file": os.path.basename(pcap_file),
                "flow_duration_us": feature.flow_duration,
                "total_fwd_packets": feature.total_fwd_packets,
                "fwd_packets_s": round(feature.fwd_packets_s, 2),
                "bwd_packets_s": round(feature.bwd_packets_s, 2),
                "flow_bytes_s": round(feature.flow_bytes_s, 2),
                "flow_packets_s": round(feature.flow_packets_s, 2)
            })
            time.sleep(1.5)

            # Step 3: AI Inference (Pure Pipeline Evaluation)
            t1 = time.time()
            pipeline = InferencePipeline.get_instance()
            prediction = pipeline.predict_flow(feature)
            FeatureStore.get_instance().update_feature(flow_key, feature)

            inference_time_ms = (time.time() - t1) * 1000
            perf.record_latency("model_inference_ms", inference_time_ms)

            ai_logger.info(f"[Demo Inference] Scenario: {execution.scenario_id} => Threat: {prediction.is_threat}, Type: {prediction.threat_type}, Conf: {prediction.confidence:.2f}, Risk: {prediction.risk_score}")

            execution.add_log(3, "AI Inference", f"AI Model predicted '{prediction.threat_type}' (Confidence: {prediction.confidence * 100:.1f}%, Risk Score: {prediction.risk_score}/100)", {
                "is_threat": prediction.is_threat,
                "threat_type": prediction.threat_type,
                "confidence": prediction.confidence,
                "risk_score": prediction.risk_score,
                "severity": prediction.severity,
                "inference_time_ms": round(inference_time_ms, 2)
            })
            time.sleep(1.5)

            # Step 4 & 5: Alert Generation & SOC Notification (Deduplicated)
            FeatureStore.get_instance().update_feature(flow_key, feature)
            if prediction.is_threat and prediction.threat_type not in ('BENIGN', 'Normal Traffic'):
                t2 = time.time()
                
                # Use AlertEngine to automatically handle deduplication and NotificationManager dispatch
                from app.soc.alerts.engine import AlertEngine
                alert_engine = AlertEngine(db)
                alert = alert_engine.process_prediction(src_ip, dst_ip, protocol, prediction)
                
                if not alert:
                    # Deduplicated (background sniffer caught it first). Fetch existing.
                    alert = db.query(Alert).filter_by(src_ip=src_ip, dst_ip=dst_ip, attack_type=prediction.threat_type).order_by(Alert.id.desc()).first()
                
                execution.generated_alert_id = alert.id if alert else None

                alert_time_ms = (time.time() - t2) * 1000
                perf.record_latency("alert_creation_ms", alert_time_ms)
                
                if alert:
                    alerts_logger.info(f"[Demo Alert] Alert ID #{alert.id} processed for {prediction.threat_type} (Severity: {prediction.severity})")
                    execution.add_log(4, "Alert Management", f"Security Alert #{alert.id} processed — {prediction.severity} Severity", {
                        "alert_id": alert.id,
                        "src_ip": alert.src_ip,
                        "dst_ip": alert.dst_ip,
                        "status": alert.status
                    })
                    
                    if prediction.severity in ("High", "Critical"):
                        execution.email_sent = True
                        email_msg = "Alert dispatched via SOC Notification Manager (Gmail/Dashboard)."
                        notifications_logger.info(f"[Demo Notification] Alert #{alert.id}: {email_msg}")
                        execution.add_log(5, "SOC Notification & Triage", f"Alert registered in SOC Queue for analyst review. {email_msg}", {
                            "alert_id": alert.id,
                            "email_sent": True
                        })
                    else:
                        execution.add_log(5, "SOC Notification & Triage", "Notification threshold not triggered.")
                else:
                    execution.add_log(4, "Alert Management", "Threat detected but skipped logging due to deduplication.", {})
            else:
                execution.add_log(4, "Alert Management", "Traffic classified as BENIGN / Normal. No alert generated.")

            time.sleep(1.5)

            # Step 6: Completion
            execution.status = "completed"
            execution.end_time = time.time()
            execution.add_log(6, "Demonstration Complete", f"Scenario execution finished in {round(execution.end_time - execution.start_time, 2)}s.")

            # Record in history
            self.history.append({
                "scenario_id": execution.scenario_id,
                "name": execution.name,
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                "status": execution.status,
                "alert_id": execution.generated_alert_id,
                "incident_id": execution.generated_incident_id,
                "duration_sec": round(execution.end_time - execution.start_time, 2)
            })

        except Exception as e:
            execution.status = "failed"
            execution.add_log(execution.current_step + 1, "Error", f"Execution error: {str(e)}")
            system_logger.error(f"[Demo Engine Error] {e}")
        finally:
            db.close()

    def _generate_scenario_feature(self, scenario_id: str) -> CanonicalFeatures:
        f = CanonicalFeatures()
        if scenario_id == "normal_traffic":
            f.flow_duration = 1250000.0  # 1.25s
            f.total_fwd_packets = 12
            f.fwd_packets_s = 9.6
            f.bwd_packets_s = 8.0
            f.flow_bytes_s = 15400.0
            f.flow_packets_s = 17.6
            f.fwd_packet_length_mean = 350.0
            f.bwd_packet_length_mean = 850.0
        elif scenario_id == "port_scan":
            f.flow_duration = 45000.0  # 45ms
            f.total_fwd_packets = 150
            f.fwd_packets_s = 3330.0
            f.bwd_packets_s = 3.3
            f.flow_bytes_s = 250000.0
            f.flow_packets_s = 3333.3
            f.fwd_packet_length_mean = 64.0
            f.bwd_packet_length_mean = 0.0
        elif scenario_id == "ddos_attack":
            f.flow_duration = 5000000.0  # 5s
            f.total_fwd_packets = 25000
            f.fwd_packets_s = 5000.0
            f.bwd_packets_s = 0.0
            f.flow_bytes_s = 12500000.0  # 12.5 MB/s
            f.flow_packets_s = 5000.0
            f.fwd_packet_length_mean = 1420.0
            f.bwd_packet_length_mean = 0.0
        elif scenario_id == "brute_force":
            f.flow_duration = 800000.0
            f.total_fwd_packets = 450
            f.fwd_packets_s = 562.5
            f.bwd_packets_s = 375.0
            f.flow_bytes_s = 480000.0
            f.flow_packets_s = 937.5
            f.fwd_packet_length_mean = 210.0
            f.bwd_packet_length_mean = 180.0
        else:  # mixed attack
            f.flow_duration = 3200000.0
            f.total_fwd_packets = 1800
            f.fwd_packets_s = 562.5
            f.bwd_packets_s = 15.6
            f.flow_bytes_s = 1850000.0
            f.flow_packets_s = 578.1
            f.fwd_packet_length_mean = 820.0
            f.bwd_packet_length_mean = 110.0

        return f

    def get_status(self) -> Dict[str, Any]:
        if not self.active_execution:
            return {"status": "idle", "message": "No scenario execution active."}
        
        return {
            "scenario_id": self.active_execution.scenario_id,
            "name": self.active_execution.name,
            "status": self.active_execution.status,
            "current_step": self.active_execution.current_step,
            "total_steps": self.active_execution.total_steps,
            "logs": self.active_execution.logs,
            "generated_alert_id": self.active_execution.generated_alert_id,
            "generated_incident_id": self.active_execution.generated_incident_id,
            "email_sent": self.active_execution.email_sent,
            "elapsed_sec": round(time.time() - self.active_execution.start_time, 1)
        }
