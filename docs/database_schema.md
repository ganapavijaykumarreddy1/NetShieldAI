# NetShield AI — Database Schema & Data Dictionary

## Overview
NetShield AI utilizes an Object-Relational Mapping (ORM) design built with SQLAlchemy. The system supports PostgreSQL for high-scale enterprise deployments and SQLite (`netshield_ai.db`) for lightweight local development and testing.

---

## Entity Relationship Summary

```
   ┌───────────────┐              ┌───────────────┐
   │     Role      │ 1          * │     User      │
   ├───────────────┼──────────────┼───────────────┤
   │ id (PK)       │              │ id (PK)       │
   │ role_name     │              │ username      │
   │ description   │              │ role_id (FK)  │
   └───────────────┘              └───────────────┘

   ┌───────────────┐ 1          * ┌───────────────┐
   │     Alert     │──────────────│   Incident    │
   ├───────────────┼              ├───────────────┤
   │ id (PK)       │              │ id (PK)       │
   │ source_ip     │              │ alert_id (FK) │
   │ threat_type   │              │ severity      │
   │ risk_score    │              │ status        │
   └───────────────┘              └───────────────┘
           │ 1
           │
           │ *
   ┌───────────────┐
   │ Notification  │
   ├───────────────┤
   │ id (PK)       │
   │ alert_id (FK) │
   │ channel       │
   │ status        │
   └───────────────┘
```

---

## Table Specifications

### 1. Table `roles`
Stores platform roles for Role-Based Access Control (RBAC).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | Primary Key, Auto-increment | Unique Role Identifier |
| `role_name` | String(50) | Unique, Not Null, Indexed | Role Name (`Administrator`, `Security Analyst`, `SOC Manager`) |
| `description` | Text | Nullable | Detailed scope of privileges |
| `created_at` | DateTime | Default `utcnow` | Timestamp of creation |

### 2. Table `users`
Stores user credentials, password hashes, contact details, and role assignments.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | Primary Key, Auto-increment | Unique User Identifier |
| `username` | String(50) | Unique, Not Null, Indexed | Login username |
| `email` | String(100) | Unique, Not Null, Indexed | Email address (used for alert notifications) |
| `hashed_password` | String(255) | Not Null | Bcrypt salted password hash |
| `full_name` | String(100) | Nullable | User display name |
| `is_active` | Boolean | Default `True` | User account status |
| `role_id` | Integer | Foreign Key (`roles.id`) | Assigned platform role |
| `created_at` | DateTime | Default `utcnow` | Account creation timestamp |

### 3. Table `alerts`
Stores raw and classified network anomaly detections.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | Primary Key, Auto-increment | Unique Alert Identifier |
| `source_ip` | String(45) | Not Null, Indexed | Source IP address (IPv4 / IPv6) |
| `destination_ip` | String(45) | Not Null, Indexed | Target IP address |
| `source_port` | Integer | Not Null | Source TCP/UDP port |
| `destination_port`| Integer | Not Null, Indexed | Target TCP/UDP port |
| `protocol` | String(10) | Not Null | Transport protocol (`TCP`, `UDP`, `ICMP`) |
| `threat_type` | String(50) | Not Null, Indexed | Classified threat (`DoS`, `PortScan`, `Brute Force`) |
| `severity` | String(20) | Not Null, Indexed | Severity rating (`Low`, `Medium`, `High`, `Critical`) |
| `confidence_score`| Float | Not Null | AI model probability (0.0 to 1.0) |
| `risk_score` | Float | Not Null, Indexed | Heuristic risk rating (0.0 to 100.0) |
| `status` | String(20) | Default `'NEW'`, Indexed | Alert state (`NEW`, `INVESTIGATING`, `RESOLVED`, `FALSE_POSITIVE`) |
| `raw_features` | JSON | Nullable | 78 canonical flow feature dictionary |
| `created_at` | DateTime | Default `utcnow`, Indexed | Detection timestamp |

### 4. Table `incidents`
Stores escalated SOC management incident tickets.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | Primary Key, Auto-increment | Incident Ticket Identifier |
| `alert_id` | Integer | Foreign Key (`alerts.id`), Unique | Associated alert reference |
| `title` | String(200) | Not Null | Incident summary title |
| `description` | Text | Nullable | Detailed incident investigation notes |
| `severity` | String(20) | Not Null | Escalated severity level |
| `status` | String(20) | Default `'OPEN'` | Status (`OPEN`, `IN_PROGRESS`, `CLOSED`, `FALSE_POSITIVE`) |
| `assigned_to` | String(100) | Nullable | Assigned analyst or team |
| `created_at` | DateTime | Default `utcnow` | Escalation timestamp |

### 5. Table `notifications`
Stores notification transmission logs for auditing email dispatch.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | Primary Key, Auto-increment | Notification Record ID |
| `alert_id` | Integer | Foreign Key (`alerts.id`) | Related alert ID |
| `channel` | String(20) | Default `'GMAIL'` | Delivery channel (`GMAIL`, `WEBHOOK`, `SLACK`) |
| `recipient` | String(100) | Not Null | Destination email address |
| `status` | String(20) | Not Null | Transmission status (`SENT`, `FAILED`, `PENDING`) |
| `sent_at` | DateTime | Default `utcnow` | Dispatch timestamp |
