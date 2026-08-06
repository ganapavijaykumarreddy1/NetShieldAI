# NetShield AI – Network Anomaly Detection & Threat Monitoring System

Welcome to **NetShield AI**, an enterprise-grade cybersecurity monitoring platform built as part of the **Infosys Springboard Virtual Internship**. 

This repository contains the completed deliverables up to **Milestone 3**, featuring a full-stack enterprise cybersecurity platform with a robust **AI-powered Threat Detection Engine**, a **Live Network Analytics Dashboard**, **Role-Based Access Control (RBAC)**, an **Executive PDF Report Generator**, **SMTP Email Alert Settings**, and an **Admin User Management Console** powered by FastAPI, React, and PostgreSQL/SQLite.

---

## 🏆 Internship Milestones Roadmap

### ✅ Milestone 1: AI Model Architecture & Dataset Evaluation
* Trained Random Forest Classifier on CIC-IDS-2017 & UNSW-NB15 datasets achieving **99.71% F1-score**.
* Implemented Feature Store and 38-feature canonical extractor.

### ✅ Milestone 2: Core Full-Stack Application & Packet Pipeline
* Built FastAPI backend with SQLite fallback and React + Tailwind CSS dark-mode UI.
* Implemented Scapy packet capture, flow aggregation engine, and live monitoring dashboard.

### ✅ Milestone 3: Advanced SOC Operations, RBAC & Executive Reporting
* **Role-Based Access Control (RBAC)**: Defined `Administrator`, `SOC Manager`, and `Security Analyst` access tiers.
* **Unified Single Top Navigation**: Sleek, sticky navigation bar with active page highlighting and user profile menu.
* **Admin User Management**: Provisioning users, reassigning roles, disabling accounts, and audit logging.
* **Executive PDF Report Generator**: Custom ReportLab Platypus PDF engine with MITRE ATT&CK recommendations.
* **SMTP Alert Settings**: Persistent email notification configuration saved to backend storage and localStorage.
* **System Sleep Anomaly Protection**: Feature store purging, 10s cooldown, and short flow heuristics preventing false alerts on wake-up.

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

### 1. Backend Setup (FastAPI)

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

*SQL definitions are available in [database/schema.sql](file:///C:/Users/vijay/OneDrive/Documents/pythonspace/NetShieldAI/database/schema.sql) and seed entries in [database/seed.sql](file:///C:/Users/vijay/OneDrive/Documents/pythonspace/NetShieldAI/database/seed.sql).*

---

## 🛠️ API Reference Documentation

| Method | Endpoint | Authentication | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | None | Provisions a new user account and binds them to a role. |
| **POST** | `/api/auth/login` | None | Verifies credentials and returns a signed JWT access token. |
| **POST** | `/api/auth/logout` | Bearer Token | Terminates session and logs the disconnection audit trail. |
| **GET** | `/api/auth/roles` | None | Retrieves list of roles available for user registration. |
| **GET** | `/api/users/profile` | Bearer Token | Returns details of the currently logged-on user. |
| **PUT** | `/api/users/profile` | Bearer Token | Modifies user profiles (fullname, username, email, password). |
| **GET** | `/api/network/overview` | Bearer Token | Fetches live network metrics (Total Packets, Bytes/sec, Active Conns). |
| **GET** | `/api/threats/feed` | Bearer Token | Streams live AI threat predictions, active flows, and System Risk Score. |

---

## 🎨 UI Design System & Guidelines

The frontend is styled custom-tailored with Tailwind CSS matching active enterprise cybersecurity platforms (such as CrowdStrike and Microsoft Defender):
*   **Deep Dark Backgrounds (`bg-cyber-bg`)** to prevent operator eye strain during night shifts.
*   **Electric Neon Cyan Glows (`text-cyber-accent`)** highlighting interactive system elements.
*   **Vibrant Threat Red Alerts (`text-cyber-danger`)** to alert operators to failed validations or gate warnings.
*   **Fully Responsive Form Grids** shifting layouts cleanly between mobile viewports and wide-screen SOC displays.



Fake Testing Module Restructure
The floating scripts generate_dos.py and replay_pcap.py have been moved out of the root directory and properly modularized.
To simulate traffic and test NetShieldAI, we provide a unified CLI tool.

1. **Replay Existing PCAP**:
   ```bash
   python -m simulator.cli replay simulator/data/slammer.pcap
   ```
2. **Generate and Run DoS Attack**:
   ```bash
   # This will generate 10,000 synthetic packets and immediately replay them
   
   ```