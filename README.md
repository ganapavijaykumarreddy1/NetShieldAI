# NetShield AI – Network Anomaly Detection & Threat Monitoring System

Welcome to the Day 1 deliverables of **NetShield AI**, an enterprise-grade cybersecurity monitoring platform built as part of the **Infosys Springboard Virtual Internship**. 

This repository contains the completed Day 1 tasks: a robust User Management Module, a dark-themed security-oriented React frontend, and a FastAPI-powered PostgreSQL backend with JWT authentication and Role-Based Access Control (RBAC).

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

---

## 🎨 UI Design System & Guidelines

The frontend is styled custom-tailored with Tailwind CSS matching active enterprise cybersecurity platforms (such as CrowdStrike and Microsoft Defender):
*   **Deep Dark Backgrounds (`bg-cyber-bg`)** to prevent operator eye strain during night shifts.
*   **Electric Neon Cyan Glows (`text-cyber-accent`)** highlighting interactive system elements.
*   **Vibrant Threat Red Alerts (`text-cyber-danger`)** to alert operators to failed validations or gate warnings.
*   **Fully Responsive Form Grids** shifting layouts cleanly between mobile viewports and wide-screen SOC displays.
