# NetShield AI — Developer & Extension Manual

## Overview
This manual provides developer instructions for extending NetShield AI, including adding new Machine Learning models, integrating new traffic data sources, adding custom notification channels, and running automated tests.

---

## 1. Local Development Setup

### Backend (Python FastAPI)
1. Navigate to `backend/` directory:
   ```bash
   cd backend
   ```
2. Activate Virtual Environment:
   ```powershell
   .venv\Scripts\Activate.ps1
   ```
3. Install Dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run FastAPI Development Server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### Frontend (React.js / Vite)
1. Navigate to `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install Node Dependencies:
   ```bash
   npm install
   ```
3. Run Vite Development Server:
   ```bash
   npm run dev
   ```

---

## 2. Adding a New ML Model
To replace or add an additional classifier (e.g., XGBoost or LightGBM):
1. Train the model script using `backend/app/ai/training_pipeline.py`.
2. Export model artifacts to `backend/models/`:
   - `best_model.pkl`: Classifier instance.
   - `scaler.pkl`: `StandardScaler` feature transformer.
   - `encoder.pkl`: `LabelEncoder` instance.
3. Update `InferencePipeline` in `backend/app/ai/inference_pipeline.py` if custom feature preprocessing or array reshapes are required.

---

## 3. Adding a New Attack Scenario to Demo Engine
To add a new attack scenario to the interactive demo switcher:
1. Open `backend/app/validation/simulator.py`.
2. Add scenario metadata to `get_available_scenarios()`:
   ```python
   {
       "id": "sql_injection",
       "name": "Web SQL Injection Attack",
       "description": "Simulates malicious web payload strings targeting database endpoints.",
       "severity": "High",
       "expected_prediction": "Web Attack",
       "estimated_duration_sec": 4
   }
   ```
3. Add feature generation logic in `_generate_scenario_feature(self, scenario_id)`:
   ```python
   elif scenario_id == "sql_injection":
       f.flow_duration = 350000.0
       f.total_fwd_packets = 15
       f.total_bwd_packets = 12
       f.flow_bytes_s = 45000.0
       f.fwd_packet_length_mean = 850.0
   ```

---

## 4. Multi-Stream Structured Logging Audit
Check generated logs in `backend/logs/`:
- `alerts.log`: Security alerts & risk scores.
- `api.log`: REST API access logs.
- `system.log`: Platform state transitions.
- `ai.log`: Feature extraction & model inferences.
- `notifications.log`: Email dispatch status logs.
