# NetShield AI — Technical Architecture Specification

## Executive Overview
NetShield AI is an enterprise-grade AI-powered Network Anomaly Detection and Threat Intelligence Monitoring Platform. It monitors real-time network traffic flows, extracts 78 canonical statistical metrics, performs multi-class ML threat classification, calculates heuristic risk scores (0–100), and triggers automated SOC workflows including Gmail alerting, incident management, and interactive analytics.

---

## High-Level Architecture Diagram

```
                        ┌──────────────────────────────────────────────┐
                        │             Traffic Source Manager           │
                        └──────────────────────┬───────────────────────┘
                                               │
               ┌───────────────────────────────┼───────────────────────────────┐
               ▼                               ▼                               ▼
    Live Network Capture              CICIDS2017 Replay              Traffic Simulator Engine
   (PyShark / Raw Sockets)           (Feature Flow Stream)           (Scenario Generator)
               │                               │                               │
               └───────────────────────────────┼───────────────────────────────┘
                                               │
                                               ▼
                                    Feature Extraction Engine
                               (78 Canonical Flow Statistics)
                                               │
                                               ▼
                                   AI Inference Pipeline
                             (Random Forest Ensemble Classifier)
                                               │
                                               ▼
                                    Risk Scoring Subsystem
                              (Confidence x Threat Multiplier)
                                               │
                                               ▼
                                    Alert & SOC Escalation
                     ┌─────────────────────────┼─────────────────────────┐
                     ▼                         ▼                         ▼
            PostgreSQL / SQLite       Gmail SMTP Dispatch      Incident Escalation Engine
                     │                         │                         │
                     └─────────────────────────┼─────────────────────────┘
                                               │
                                               ▼
                                    React.js / Vite Console
                             (Live Dashboard, Demo Engine & Health)
```

---

## Core System Components

### 1. Packet Capture & Traffic Ingestion Engine
- **Module**: `backend/app/network/pyshark_service.py` & `backend/app/traffic/`
- **Capabilities**: Captures raw IP packets across network interfaces, aggregates packets into bidirectional 5-tuple network flows (`(src_ip, dst_ip, src_port, dst_port, protocol)`), and cleans up inactive flows after configurable timeout periods.

### 2. Canonical Feature Store
- **Module**: `backend/app/features/canonical.py` & `backend/app/features/store.py`
- **Metrics Tracked**: 78 statistical network flow features aligned with the CICIDS2017 standard, including Flow Duration, Packet Length Means/StdDev, Forward/Backward Inter-Arrival Times (IAT), Header Lengths, Flow Bytes/sec, Flow Packets/sec, Flag Counts (FIN, SYN, RST, PSH, ACK, URG), and Active/Idle windows.

### 3. AI Inference Pipeline
- **Module**: `backend/app/ai/inference_pipeline.py`
- **Model**: Trained Scikit-Learn `Random Forest Classifier` ensemble model stored as `models/best_model.pkl`.
- **Classification Output**: 
  - `BENIGN / Normal Traffic`
  - `DoS / DDoS`
  - `PortScan`
  - `Brute Force`
  - `Web Attack`
  - `Botnet`
- **Inference Speed**: ~3.4 ms per flow prediction.

### 4. Alerting & SOC Workflow Subsystem
- **Module**: `backend/app/soc/` & `backend/app/api/endpoints/`
- **Automated Actions**:
  - Automatically logs security alerts into database table `alerts`.
  - Automatically escalates `High` and `Critical` threats into open `incidents`.
  - Triggers asynchronous TLS email notifications via `EmailNotificationService` (`smtp.gmail.com:587`).

### 5. Multi-Stream Structured Logging Subsystem
- **Module**: `backend/app/core/logging_config.py`
- **Output Files**:
  - `logs/api.log`: HTTP REST API request timing and access logs.
  - `logs/ai.log`: Feature extraction & model prediction logs.
  - `logs/alerts.log`: Security alert creations & risk score escalations.
  - `logs/notifications.log`: SMTP Gmail delivery logs.
  - `logs/system.log`: Core platform lifecycle & network monitor events.

### 6. Interactive Demo Engine & Validation Subsystem
- **Module**: `backend/app/validation/`
- **Endpoints**: `/api/demo/` and `/api/validation/`
- **Features**: Single-click attack scenario runner (`Normal Traffic`, `Port Scan`, `DDoS`, `Brute Force`, `Mixed Attack`), confusion matrix heatmaps, ROC curves, and system health performance monitors.

---

## Security Model & Authentication
- **Authentication**: OAuth2 JWT Bearer tokens with SHA-256 password hashing via Passlib (`bcrypt`).
- **Role-Based Access Control (RBAC)**:
  - `Administrator`: Full system access, user administration, role assignment, system configurations.
  - `SOC Manager`: View analytics, generate threat intel reports, manage incidents, sign off on escalations.
  - `Security Analyst`: Monitor live feeds, inspect alerts, add incident triage notes.
