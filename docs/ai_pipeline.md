# NetShield AI — AI Pipeline & Feature Engineering Manual

## Overview
The NetShield AI Machine Learning Subsystem processes raw network traffic flows, extracts statistical metrics, standardizes features, predicts threat classes using an ensemble `Random Forest` model trained on **25 core canonical features** (distilled from the 78 raw CICIDS2017 metrics), and computes dynamic risk scores (0–100).

---

## 1. Feature Engineering Schema (25 Core Canonical Metrics)
NetShield AI aggregates 5-tuple IP packet streams (`(src_ip, dst_ip, src_port, dst_port, protocol)`) into bidirectional flow windows.

The 25 core canonical metrics fed into the trained ML model include:

| Metric Group | Feature Examples | Description |
|---|---|---|
| **Flow Volume** | `flow_duration`, `total_fwd_packets`, `total_bwd_packets`, `flow_bytes_s`, `flow_packets_s` | Overall flow volume, packet counts, and transfer rates |
| **Packet Size Stats**| `fwd_packet_length_mean`, `bwd_packet_length_mean`, `pkt_len_std`, `pkt_len_var` | Statistical metrics of payload sizes in forward and backward directions |
| **Inter-Arrival Times**| `flow_iat_mean`, `flow_iat_std`, `fwd_iat_tot`, `bwd_iat_tot` | Time interval between consecutive packets in microseconds |
| **TCP Flags** | `fin_flag_cnt`, `syn_flag_cnt`, `rst_flag_cnt`, `psh_flag_cnt`, `ack_flag_cnt` | Count of control flags indicating scan probes or teardown attempts |
| **Header Size** | `fwd_header_len`, `bwd_header_len` | Size of transport layer headers |
| **Active / Idle** | `active_mean`, `idle_mean`, `active_max`, `idle_min` | Duration of active transmission vs idle periods |

---

## 2. Machine Learning Pipeline Architecture

```
 Raw PCAP / Simulated Flow
             │
             ▼
 Canonical Feature Extractor (78 Features)
             │
             ▼
 StandardScaler Normalization (scaler.pkl)
             │
             ▼
 Random Forest Ensemble Classifier (best_model.pkl)
             │
             ▼
 Probability Array & Multi-Class Prediction
             │
             ▼
 Threat Risk Scoring Engine
```

### Model Specifications
- **Classifier**: `RandomForestClassifier(n_estimators=100, max_depth=25, random_state=42)`
- **Preprocessing**: `StandardScaler` for zero-mean unit-variance metric normalization.
- **Label Encoder**: `LabelEncoder` mapping text labels (`BENIGN`, `DoS`, `PortScan`, `Brute Force`, `Web Attack`, `Botnet`) to integer indices.
- **Evaluation Accuracy**: `98.84%` overall accuracy on held-out CICIDS2017 test set.

---

## 3. Dynamic Risk Scoring Formula

The Risk Score ($R$) scales from $0.0$ to $100.0$ and is computed as follows:

$$R = \min\left(\text{Confidence} \times 100 \times M_{\text{threat}} \times M_{\text{volume}},\, 100.0\right)$$

Where:
- $\text{Confidence} \in [0.0, 1.0]$ is the model output probability for the predicted class.
- $M_{\text{threat}}$ is the severity multiplier based on attack type:
  - `DDoS / DoS / Infiltration / Botnet`: $1.5$
  - `PortScan / Brute Force / Web Attack`: $1.2$
  - `BENIGN`: $0.0$
- $M_{\text{volume}}$ is the volume penalty multiplier:
  - If $\text{flow\_bytes\_s} > 1,000,000$ (1 MB/s): $1.2$
  - Otherwise: $1.0$

### Severity Threshold Mapping
- $0 \le R \le 25$: **Low Severity**
- $25 < R \le 50$: **Medium Severity**
- $50 < R \le 75$: **High Severity**
- $75 < R \le 100$: **Critical Severity**
