# NetShield AI — API Specification & Endpoint Documentation

## Base URL & Authentication
- **Local Base URL**: `http://localhost:8000/api`
- **Swagger Interactive Specs**: `http://localhost:8000/docs`
- **ReDoc Interactive Specs**: `http://localhost:8000/redoc`
- **Authentication**: Include `Authorization: Bearer <access_token>` header for protected endpoints.

---

## Endpoint Reference Summary

| Prefix | Endpoint | Method | RBAC Roles | Description |
|---|---|---|---|---|
| `/api/auth` | `/token` | POST | Public | Authenticate user & return OAuth2 JWT access token |
| `/api/auth` | `/me` | GET | All Authenticated | Fetch active user profile and assigned role |
| `/api/users` | `/` | GET | Administrator | List all registered platform users |
| `/api/users` | `/` | POST | Administrator | Create a new user with assigned role |
| `/api/users` | `/{user_id}/role` | PUT | Administrator | Change user role assignment |
| `/api/network` | `/interfaces` | GET | All Authenticated | List network capture interfaces |
| `/api/network` | `/status` | GET | All Authenticated | Check packet capture engine state |
| `/api/soc` | `/alerts` | GET | All Authenticated | Paginated list of detected threat alerts |
| `/api/soc` | `/alerts/{alert_id}` | GET | All Authenticated | Fetch alert details and canonical features |
| `/api/soc` | `/incidents` | GET | All Authenticated | List SOC incident management tickets |
| `/api/soc` | `/incidents/{id}/status`| PUT | Analyst/Manager/Admin | Update incident resolution status |
| `/api/soc` | `/notifications` | GET | All Authenticated | Fetch email notification history |
| `/api/soc` | `/analytics` | GET | Manager/Admin | SOC threat metrics, severity distributions, timelines |
| `/api/soc` | `/reports/generate` | POST | Manager/Admin | Generate executive PDF/JSON threat intelligence report |
| `/api/validation`| `/ai-metrics` | GET | All Authenticated | Accuracy, F1 score, confusion matrix, ROC curve |
| `/api/validation`| `/system-health` | GET | All Authenticated | System latencies (ms), RAM/CPU, packet engine stats |
| `/api/demo` | `/scenarios` | GET | All Authenticated | List available interactive demo scenarios |
| `/api/demo` | `/run` | POST | All Authenticated | Trigger asynchronous demo scenario execution |
| `/api/demo` | `/status` | GET | All Authenticated | Fetch live execution progress & timeline logs |

---

## Detailed Endpoint Payloads & Responses

### 1. Authentication Token Endpoint
- **URL**: `POST /api/auth/token`
- **Content-Type**: `application/x-www-form-urlencoded`
- **Body**:
  ```
  username=admin@netshield.ai
  password=AdminSecretPassword123!
  ```
- **Response (200 OK)**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "token_type": "bearer",
    "expires_in_minutes": 120
  }
  ```

### 2. Interactive Demo Execution Endpoint
- **URL**: `POST /api/demo/run`
- **Header**: `Authorization: Bearer <jwt_token>`
- **Body**:
  ```json
  {
    "scenario_id": "port_scan"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "status": "started",
    "scenario_id": "port_scan",
    "message": "Started demonstration scenario 'Reconnaissance Port Scan'."
  }
  ```

### 3. Demo Status & Timeline Log Endpoint
- **URL**: `GET /api/demo/status`
- **Response (200 OK)**:
  ```json
  {
    "scenario_id": "port_scan",
    "name": "Reconnaissance Port Scan",
    "status": "completed",
    "current_step": 6,
    "total_steps": 6,
    "logs": [
      {
        "timestamp": "16:15:02",
        "step": 1,
        "stage": "Traffic Simulation",
        "message": "Generating synthetic traffic packets..."
      },
      {
        "timestamp": "16:15:03",
        "step": 3,
        "stage": "AI Inference",
        "message": "AI Model predicted 'PortScan' (Confidence: 98.2%, Risk Score: 78.5/100)"
      }
    ],
    "generated_alert_id": 14,
    "generated_incident_id": 6,
    "email_sent": true,
    "elapsed_sec": 4.2
  }
  ```

### 4. AI Metrics Endpoint
- **URL**: `GET /api/validation/ai-metrics`
- **Response (200 OK)**:
  ```json
  {
    "overall_metrics": {
      "accuracy": 0.9884,
      "precision": 0.9853,
      "recall": 0.9842,
      "f1_score": 0.9847,
      "roc_auc": 0.9935,
      "total_test_samples": 75060,
      "avg_inference_latency_ms": 3.42
    },
    "classes": ["BENIGN", "DoS / DDoS", "PortScan", "Brute Force", "Web Attack", "Botnet"],
    "confusion_matrix": [
      [48250, 120, 180, 30, 20, 0],
      [95, 14210, 45, 0, 10, 0]
    ]
  }
  ```
