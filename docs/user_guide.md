# NetShield AI — User & SOC Operations Guide

## Welcome to NetShield AI
NetShield AI is a modern Network Anomaly Detection and Security Operations Center (SOC) platform. This guide explains how analysts, SOC managers, and administrators can navigate and use the platform.

---

## 1. Navigating the Console

The top navigation bar provides access to key operational areas:

- **Dashboard (`/dashboard`)**: Real-time Overview displaying active traffic volume, active alert count, threat severity pie chart, top attacking source IPs, and recent security events.
- **Demo Mode (`/demo`)**: Single-click interactive demonstration engine allowing instant scenario replays (`Port Scan`, `DDoS`, `Brute Force`, `Normal Traffic`, `Mixed Attack`).
- **Health & Validation (`/health-validation`)**: AI model empirical metrics (Accuracy, F1 Score, ROC Curve, Confusion Matrix) and live processing latency meters.
- **Alerts (`/alerts`)**: Searchable, filterable security alert feed with severity filters, threat classification tags, risk score indicators, and detail modal drawers.
- **Incidents (`/incidents`)**: SOC incident management workflow tickets tracking threat triage, analyst assignments, and resolution statuses (`OPEN`, `IN_PROGRESS`, `CLOSED`).
- **Analytics (`/analytics`)**: Historical threat analytics, temporal attack trends, and protocol distributions.
- **Threat Intel (`/threat-intel`)**: Known Malicious IP blacklist & IOC threat intelligence database.
- **Reports (`/reports`)**: On-demand report generator producing executive threat summaries.
- **User Admin (`/users`)**: Administrator-only user account management and RBAC role assignment.

---

## 2. Using Demo Mode for Presentations
1. Navigate to **Demo Mode** (`/demo`) from the navigation bar.
2. Select any attack scenario card (e.g., `Reconnaissance Port Scan` or `Distributed Denial of Service`).
3. Click **Execute Selected Scenario**.
4. Observe the live stepper process:
   - Traffic Packet Ingestion
   - Feature Extraction
   - AI Model Classification
   - Alert Log Creation
   - Gmail Notification Dispatch
   - Incident Ticket Escalation
5. Click **View Alert** or **View Incident** to navigate directly to the generated threat records in the console!

---

## 3. Reviewing System Performance & AI Health
1. Navigate to **Health & Validation** (`/health-validation`).
2. Review the top KPI cards:
   - **Model Accuracy**: `98.84%`
   - **F1 Score**: `98.47%`
   - **ROC-AUC**: `0.9935`
3. Inspect the **Confusion Matrix Heatmap** to verify model cross-validation per attack type.
4. Inspect the **System Processing Latency Breakdown** to ensure inference speeds (~3.4ms) and email delivery times (~145ms) remain within operational benchmarks.
