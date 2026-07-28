
NetShield AI


System Architecture & Database Schema


# 1. System Architecture


NetShield AI follows a layered architecture that separates presentation, backend, business logic, AI inference, data storage, and infrastructure concerns, allowing each layer to scale and evolve independently.


Presentation Layer – React.js web portal for dashboards, alerts, and analytics


Backend / API Gateway – FastAPI services handling auth, routing, and access control


Business Logic Layer – traffic processing, alert orchestration, reporting


AI / ML Layer – anomaly detection and intrusion prediction models


Database Layer – PostgreSQL (structured data) + MongoDB (traffic logs, model artifacts)


Infrastructure Layer – Docker, cloud hosting (AWS/Azure), CI/CD


Figure 1 – NetShield AI High-Level System Architecture


# 2. Database Schema


The conceptual schema below defines the core entities and relationships. It is design-level only; no SQL is included.



| Entity | Description | Key Relationships |
| --- | --- | --- |
| User | Platform account (analyst, manager, admin) | N:1 Role; 1:N Audit Log, Alert, Incident |
| Role | Named permission set | 1:N User |
| Network Traffic Log | Processed traffic/flow records | 1:N Anomaly Event |
| Anomaly Event | Detected deviation with confidence score | N:1 Traffic Log, Model; 1:1 Alert |
| Alert | Actionable, prioritized notification | 1:1 Anomaly Event, Incident; N:1 User |
| Incident | Logged resolution of an alert | 1:1 Alert; N:1 User |
| Detection Model | Trained AI model version | 1:N Anomaly Event |
| Audit Log | System/user action record | N:1 User |
| System Configuration | Platform config key/value store | Standalone |
| Threat Intelligence Feed | (Future) external enrichment indicators | N:N Anomaly Event |



Figure 2 – NetShield AI Conceptual Entity-Relationship (ER) Diagram
