# NetShield AI – Network Anomaly Detection & Threat Monitoring System

**🚀 Live Deployment:** [https://netshield-ai-demo.com](https://netshield-ai-demo.com) *(Replace with your actual deployed link)*

Welcome to **NetShield AI**, an enterprise-grade cybersecurity monitoring platform built as part of the **Infosys Springboard Virtual Internship**. 

This repository contains the completed deliverables up to **Milestone 4**, featuring a full-stack enterprise cybersecurity platform with a robust **AI-powered Threat Detection Engine**, a **Live Network Analytics Dashboard**, **Role-Based Access Control (RBAC)**, an **Executive PDF Report Generator**, **SMTP Email Alert Settings**, and an **Admin User Management Console** powered by FastAPI, React, and PostgreSQL/SQLite, fully prepared for cloud deployment.

---

## 🏆 Internship Milestones Roadmap

### ✅ Milestone 1: Week 1 & 2 — Project Initialization, Design Process & Core Setup
* **Key Tasks**:
  * Defined security monitoring objectives and cybersecurity SOC workflows.
  * Designed system architecture, database schema, and ER diagrams.
  * Created UI wireframes and workflow planning.
  * Set up frontend (React + Vite + Tailwind CSS) and backend (FastAPI + SQLAlchemy) environments.
  * Implemented JWT authentication and Role-Based Access Control (RBAC) foundation.
  * Processed and evaluated **CIC-IDS-2017** and **UNSW-NB15** datasets.
  * Built live packet monitoring workflows and traffic analytics dashboard.
* **Key Outcomes**:
  * Comprehensive understanding of network security monitoring and SOC workflows.
  * Executed end-to-end system architecture and relational database design.
  * Production-ready project structure with automated database initialization.
  * Functional authentication system and live network monitoring engine.

---

### ✅ Milestone 2: Week 3 & 4 — Anomaly Detection & Intrusion Prediction
* **Key Tasks**:
  * Trained Random Forest anomaly detection models (**99.71% F1-score**).
  * Evaluated model accuracy, precision, recall, and confusion matrices.
  * Generated detailed model evaluation and anomaly detection reports.
  * Implemented attack prediction workflows and 38-feature canonical extractor.
  * Built threat classification modules for **DDoS, DoS, Botnets, Brute Force, Port Scanning, and Web Attacks**.
  * Developed real-time aggregated **System Risk Scoring Engine (0-100)**.
* **Key Outcomes**:
  * Deployed anomaly detection and intrusion prediction systems.
  * Built AI-powered real-time threat analysis pipelines.
  * Applied machine learning concepts to cybersecurity threat telemetry.
  * Streamed real-time threat detection insights to the operator console.

---

### ✅ Milestone 3: Week 5 & 6 — Alert Management & Security Analytics
* **Key Tasks**:
  * Implemented real-time threat alerting workflows and local date/time formatting.
  * Built notification systems with persistent **SMTP Email Alert settings** and incident triage management.
  * Generated executive **Platypus PDF & CSV Threat Intelligence Reports** with MITRE ATT&CK recommendations.
  * Developed attack visualization dashboards and top source IP telemetry analytics.
  * Implemented system sleep/hibernation anomaly protection (feature store purging, 10s cooldown, short flow guards).
  * Implemented **Admin User Management** (provisioning, role reassignments, status toggles, audit logging) with a single unified sticky top navigation bar.
* **Key Outcomes**:
  * Full threat alerting, notification, and security analytics suite.
  * End-to-end incident response, triage, and reporting workflows.
  * Operationalized cybersecurity operations and threat intelligence concepts.
  * Delivered a complete, production-grade end-to-end network security monitoring platform.

---

### ✅ Milestone 4: Week 7 & 8 — System Deployment & Project Delivery
* **Key Tasks**:
  * Containerized the frontend and backend using Docker and `docker-compose`.
  * Deployed the FastAPI backend to a cloud provider (e.g., AWS EC2 / Render).
  * Deployed the React frontend to a cloud hosting service (e.g., Vercel / Netlify).
  * Established global accessibility, CORS policies, and production environment variables.
  * Finalized comprehensive project documentation, user guides, and architecture diagrams.
* **Key Outcomes**:
  * Successfully launched a live, publicly accessible version of the NetShield AI platform.
  * Transitioned from a local development simulator to a fully cloud-native distributed architecture.
  * Concluded all final deliverables for the Infosys Springboard Virtual Internship.

---

## 🧠 AI Threat Detection Engine

The system is equipped with a Machine Learning pipeline designed to classify live network traffic and detect malicious activities in real-time.

*   **Model Architecture**: Random Forest Classifier
*   **Evaluation Metrics**: Achieved **99.71% Weighted F1-Score** and near 100% accuracy on network traffic anomaly datasets (CIC-IDS-2017 & UNSW-NB15).
*   **Threat Classifications**: Detects **DDoS, DoS, Botnets, Brute Force, Port Scanning, and Web Attacks** alongside Normal Traffic.
*   **Risk Scoring Engine**: Calculates an aggregated **System Risk Score (0-100)** based on the AI's confidence levels and the severity of active threat classes.

## 📊 Live Analytics Dashboard

*   **Real-time Traffic Metrics**: Monitors Total Packets, Packets/sec, Bytes/sec, and Active Connections dynamically.
*   **Active AI Flows**: Evaluates network packets and extracts statistical features in sliding windows for the ML inference pipeline.
*   **Live Threat Feed**: A scrolling feed of predictions (Source/Destination IPs, Ports, Protocols) showing threat classifications and AI confidence percentages.

---

## 🚀 Quick Start Guide

For ease of evaluation, the backend is built with **automatic SQLite fallback**. If a local PostgreSQL instance is not detected, the app will log a warning and automatically provision a local database file `netshield_ai.db` inside the `backend/` directory, allowing the system to run out-of-the-box.

### 🐳 Option A: Docker Setup (Recommended)

1. Ensure you have **Docker** and **Docker Compose** installed.
2. Clone the repository and navigate into it:
   ```bash
   git clone https://github.com/yourusername/NetShieldAI.git
   cd NetShieldAI
   ```
3. Boot up the entire stack (Frontend, Backend, and Database) with a single command:
   ```bash
   docker-compose up --build
   ```
4. Access the platform locally:
   * **React Dashboard**: [http://localhost:5173](http://localhost:5173)
   * **API Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 💻 Option B: Manual Local Setup

#### 1. Backend Setup (FastAPI)

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Create a Python virtual environment:
    ```bash
    python -m venv .venv
    ```
3.  Activate the virtual environment:
    *   **Windows (PowerShell)**:
        ```powershell
        .venv\Scripts\Activate.ps1
        ```
    *   **Mac/Linux**:
        ```bash
        source .venv/bin/activate
        ```
4.  Install the required dependencies:
    ```bash
    pip install -r requirements.txt
    ```
5.  Initialize settings (copy the default configuration template):
    ```bash
    copy .env.example .env
    ```
6.  Start the FastAPI development server:
    ```bash
    python -m uvicorn app.main:app --reload
    ```
    *The API documentation console will be available at:* [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 2. Frontend Setup (React.js + Tailwind CSS)

1.  Navigate to the `frontend` directory:
    ```bash
    cd ../frontend
    ```
2.  Install the dependencies (Tailwind, Axios, Lucide Icons, Router):
    ```bash
    npm install
    ```
3.  Start the Vite dev server:
    ```bash
    npm run dev
    ```
    *The secure logon terminal will be available at:* [http://localhost:5173](http://localhost:5173)

---

## ☁️ Cloud Deployment & Live Traffic Capture

When deployed to a cloud environment (like AWS EC2 using `docker-compose`), NetShield AI transitions from a local simulator into a **real-world intrusion detection system**.

*   **100% Real Traffic:** The backend Docker container is granted `NET_ADMIN` and `NET_RAW` privileges. This allows the Python `Scapy` engine to hook directly into the AWS server's network interface, sniffing every single real incoming and outgoing packet (HTTP, SSH, etc.) traversing the server.
*   **Global Accessibility:** The React dashboard, served via Nginx, is accessible from anywhere in the world via the server's Public IP.
*   **Centralized Telemetry:** If multiple security analysts log into the dashboard from different laptops globally, they all view the exact same real-time traffic feed representing the telemetry of the centralized AWS server. Every time a user visits the dashboard, their own HTTP requests are captured by the sniffer and processed by the AI pipeline!

### 🌍 How Other Users Can Access the Live App

Since the platform is centrally deployed, anyone with the frontend link can securely access the platform without needing local setup.

1.  **Open the Application:** Navigate to the live dashboard URL.
2.  **Create an Account:** Click on **Register** to create a new analyst profile. Select your desired role (e.g., *Security Analyst*).
3.  **Log In:** Authenticate using your newly created credentials. The backend will issue a secure JWT session.
4.  **Monitor Live Traffic:** You will be placed into the unified SOC dashboard. Since the backend processes global traffic, you and all other logged-in users worldwide will see the **exact same live network events and alerts** streaming in real-time.
5.  **Collaborate:** Admin users can manage roles, approve access for new users joining the platform, and monitor audit logs, simulating a real enterprise SOC environment.

---

## 📂 Project Structure

```text
NetShieldAI/
├── backend/                       # FastAPI application roots
│   ├── app/
│   │   ├── api/
│   │   │   ├── endpoints/
│   │   │   │   ├── auth.py        # /auth/register, /login, /logout, /roles
│   │   │   │   └── users.py       # /users/profile GET & PUT
│   │   │   └── deps.py            # JWT and RBAC checkers
│   │   ├── core/
│   │   │   ├── config.py          # Environment settings loader
│   │   │   ├── database.py        # SQLAlchemy helper with SQLite fallback
│   │   │   └── security.py        # Password hashing & JWT generators
│   │   ├── models/
│   │   │   └── user.py            # SQLAlchemy Roles, Users, & AuditLogs models
│   │   ├── schemas/
│   │   │   ├── auth.py            # Token structures
│   │   │   └── user.py            # User validation validators
│   │   └── main.py                # FastAPI bootstrapper & roles seeder
│   ├── .env                       # Local configurations
│   ├── .env.example
│   └── requirements.txt           # Python package dependencies
├── database/                      # SQL scripts
│   ├── schema.sql                 # Table schema definitions (PostgreSQL DDL)
│   └── seed.sql                   # Prepopulated Roles
├── docs/                          # Architecture & design specifications
│   ├── assets/
│   │   ├── system_architecture.png
│   │   └── conceptual_er_diagram.png
│   └── architecture.md
└── README.md                      # This documentation file
```

---

## 🔑 Database Schema (PostgreSQL)

The system manages authorization and threat audits using three core relational tables:
1.  **`roles`**: Stores access tiers: `Administrator`, `Security Analyst`, and `SOC Manager`.
2.  **`users`**: Stores user profiles, hashed credentials, and maps them to a single role.
3.  **`audit_logs`**: Tracks authentication audits (successful logins, logouts, failed login attempts, profile changes, and client IP mappings).

*SQL definitions are available in [`database/schema.sql`](database/schema.sql) and seed entries in [`database/seed.sql`](database/seed.sql).*

## 🧪 Simulating Traffic & Testing

To easily simulate traffic and test NetShield AI's threat detection capabilities, you can use the built-in simulation tools directly from the web interface.

1. **Log into the Dashboard**.
2. **Click the "Simulate Traffic" (or Demo) button** available in the UI.
3. This will automatically inject synthetic network flow data or replay malicious traffic samples (such as DoS, Botnet, or Brute Force attacks) into the live pipeline.
4. Watch the **Live Analytics Dashboard** as the AI engine instantly analyzes, classifies, and triggers alerts on the incoming simulated threats!

---

## 🤝 Contributing & Forking

We welcome contributions and improvements to the NetShield AI platform! 

### How to Fork and Use the Project

1. **Fork the Repository:** Click the **Fork** button at the top right of the GitHub page to create a copy in your own account.
2. **Clone your Fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/NetShieldAI.git
   cd NetShieldAI
   ```
3. **Make Changes:** Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature/amazing-new-feature
   ```
4. **Test Locally:** Follow the **Docker Setup** instructions above to quickly spin up the environment and verify your changes.
5. **Commit & Push:** Push your changes to your fork:
   ```bash
   git commit -m "Added an amazing new feature"
   git push origin feature/amazing-new-feature
   ```
6. **Pull Request:** Open a Pull Request from your branch back to the original repository.