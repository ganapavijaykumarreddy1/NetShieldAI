# NetShield AI: Comprehensive AI Pipeline Documentation

This document serves as the complete reference for the Artificial Intelligence subsystem implemented in Milestone 2. It details the journey from raw datasets to a production-ready, real-time threat classification engine.

---

## 1. Dataset Selection & Analysis

To build an AI model capable of classifying network traffic in real-time, two prominent benchmark datasets were analyzed: **CICIDS2017** and **UNSW-NB15**.

### A. UNSW-NB15
- **Format:** `.parquet`
- **Total Features:** 36 features.
- **Analysis:** This dataset includes deeply inspected application-layer features such as `service` (HTTP, FTP, SSH), `trans_depth`, `is_ftp_login`, and `response_body_len`. 
- **Conclusion:** *Rejected.* These features are nearly impossible to derive reliably in a live, high-speed packet capture environment without extremely heavy Deep Packet Inspection (DPI) processing that would bottleneck the system.

### B. CICIDS2017 (Selected)
- **Format:** `.csv` (Preprocessed Version used)
- **Dimensions:** 2,520,751 flows (rows) × 53 features (columns).
- **Analysis:** This dataset focuses heavily on **Flow Statistics** calculated purely from IP and Transport layer headers (e.g., packet counts, bytes, TCP flags, inter-arrival times). 
- **Conclusion:** *Accepted.* These features map perfectly to the existing `PacketEvent` stream from our Packet Monitoring Engine.

---

## 2. Feature Engineering & Canonicalization

The single most critical architectural requirement was ensuring that the **Live Traffic** and the **Training Datasets** use the exact same feature representation.

### The Canonical Feature Schema
We designed a Canonical Feature Layer (`CanonicalFeatures`) that acts as the single source of truth. We selected **25 highly discriminatory features** that were both present in the dataset and computable in real-time.

**Selected Features (25):**
```text
destination_port, flow_duration, total_fwd_packets, total_length_fwd_packets, 
fwd_packet_length_max, fwd_packet_length_min, fwd_packet_length_mean, 
bwd_packet_length_max, bwd_packet_length_min, bwd_packet_length_mean, 
flow_bytes_s, flow_packets_s, flow_iat_mean, flow_iat_max, flow_iat_min, 
fwd_iat_total, bwd_iat_total, fwd_packets_s, bwd_packets_s, packet_length_mean, 
packet_length_variance, fin_flag_count, psh_flag_count, ack_flag_count, 
average_packet_size
```

### Feature Transformation
1. **Live Traffic (`FlowFeatureExtractor`):** A stateful streaming engine groups raw `PacketEvent`s by their 5-tuple (Source IP, Dest IP, Source Port, Dest Port, Protocol). It maintains rolling arrays of packet lengths and timestamps to dynamically compute means, standard deviations, variances, and rates (bytes/s).
2. **Dataset Adapter (`CICIDS2017Adapter`):** Reads the dataset CSV, drops NaN/Infinite rows, strictly filters down to the 25 mapped columns, and returns a sanitized `X` DataFrame and `y` labels.

---

## 3. Model Training & Selection

The `ModelManager` orchestrates the training pipeline. The pipeline involves:
1. **Standardization:** A `StandardScaler` normalizes the numerical ranges of all 25 features to ensure stability.
2. **Encoding:** A `LabelEncoder` translates the string labels (e.g., 'BENIGN', 'DDoS', 'PortScan') into integers.
3. **Data Splitting:** Stratified 80/20 train-test split to ensure minority attack classes are represented fairly.

### Evaluated Models
We evaluated tree-based ensemble models as they are historically the state-of-the-art for tabular network flow data.

1. **HistGradientBoostingClassifier:** Fast, histogram-based gradient boosting.
   - *Result:* F1-Score: 0.9952 (Training Time: ~12.8s)
2. **RandomForestClassifier:** An ensemble of decision trees.
   - *Result:* F1-Score: **0.9971** (Training Time: ~61.6s)

### Best Model Selection
The pipeline automatically selected the **RandomForestClassifier** due to its marginally higher F1-score. The model, scaler, and encoder were serialized to `.pkl` artifacts in the Feature Store.

---

## 4. Evaluation Metrics

The final model was evaluated against the 20% hold-out test set (**504,151 flows**). 

**Overall Accuracy:** 1.00 (~99.7%+)
**Overall Weighted F1-Score:** 0.9971

**Class-Specific Breakdown:**
| Threat Class | Precision | Recall | F1-Score | Support (Sample Size) |
| :--- | :--- | :--- | :--- | :--- |
| **Normal Traffic** | 1.00 | 1.00 | 1.00 | 419,012 |
| **DDoS** | 1.00 | 1.00 | 1.00 | 25,603 |
| **DoS** | 1.00 | 0.99 | 1.00 | 38,749 |
| **Port Scanning** | 0.99 | 1.00 | 0.99 | 18,139 |
| **Brute Force** | 0.99 | 0.99 | 0.99 | 1,830 |
| **Bots** | 0.69 | 0.49 | 0.57 | 389 |
| **Web Attacks** | 0.92 | 0.21 | 0.34 | 429 |

> [!TIP]
> **Interpretation:** The model is exceptionally reliable at classifying volumetric threats (DDoS, DoS, Port Scanning). It struggles with application-layer threats (Web Attacks) and low-and-slow threats (Bots). This is an expected trade-off of relying purely on transport-layer flow statistics to guarantee high-speed, live inference capabilities.

---

## 5. Live Inference Pipeline

The `InferencePipeline` consumes live Canonical Features from the `FeatureStore` every few seconds.
It runs the features through the scaler and the RandomForest model, yielding a predicted Threat Class and a Confidence probability.

### Risk Scoring Engine
Rather than simply outputting "Attack", the system dynamically calculates a **0-100 Risk Score**:
1. Base score derived from prediction confidence.
2. Weighted multipliers based on threat severity (e.g., `DDoS` incurs a 1.5x multiplier).
3. Weighted multipliers based on traffic volume (flows > 1MB/s incur a 1.2x penalty).

These scores categorize the network into **Low, Medium, High, or Critical** severity directly visible on the frontend React Dashboard.
