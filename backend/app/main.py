# Backend application entry point (v2)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.models.user import Role, User
from app.models.soc import Alert, Incident, Notification, ThreatIntelligence, ReportHistory
from app.api.endpoints import auth, users, network, threats, alerts, incidents, notifications, threat_intel, analytics, reports, validation, demo
from app.traffic.services.traffic_service import TrafficService
from app.core.logging_config import system_logger

logger = logging.getLogger("netshield_main")

# Auto-generate database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="NetShield AI",
    description="Network Anomaly Detection & Threat Monitoring System API Console",
    version="1.0.0"
)

# Apply CORS middleware using origins from settings
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

def seed_roles() -> None:
    """Pre-populate the roles table with default platform roles on startup."""
    db = SessionLocal()
    try:
        default_roles = [
            (
                "Administrator", 
                "Full system access, user management, system configurations, and alert policy administration."
            ),
            (
                "Security Analyst", 
                "Analyze network monitoring feeds, triage anomalies, view security dashboards, and log incident notes."
            ),
            (
                "SOC Manager", 
                "Oversee security operations, sign-off on incident escalations, generate threat intelligence reports, and review audit logs."
            )
        ]
        
        for name, description in default_roles:
            role_exists = db.query(Role).filter(Role.role_name == name).first()
            if not role_exists:
                db_role = Role(role_name=name, description=description)
                db.add(db_role)
                logger.info(f"Seeding default role: {name}")
                
        # Seed Threat Intel
        from app.soc.threat_intel.service import ThreatIntelService
        ThreatIntelService(db).seed_database_if_empty()
                
        # Seed Default Administrator Account
        admin_email = "admin@netshield.ai"
        admin_exists = db.query(User).filter(User.email == admin_email).first()
        if not admin_exists:
            admin_role = db.query(Role).filter(Role.role_name == "Administrator").first()
            if admin_role:
                from app.core.security import get_password_hash
                hashed_pwd = get_password_hash("Admin@123")
                admin_user = User(
                    username="admin",
                    email=admin_email,
                    password_hash=hashed_pwd,
                    full_name="NetShield Administrator",
                    role_id=admin_role.id,
                    is_active=True
                )
                db.add(admin_user)
                logger.info(f"Seeded default administrator: {admin_email}")

        db.commit()
    except Exception as e:
        logger.error(f"Error seeding on startup: {e}")
        db.rollback()
    finally:
        db.close()

# Invoke roles seeding
seed_roles()

# Mount API routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(network.router, prefix="/api/network", tags=["Network"])
app.include_router(threats.router, prefix="/api", tags=["Threats"])
app.include_router(alerts.router, prefix="/api/soc", tags=["SOC"])
app.include_router(incidents.router, prefix="/api/soc", tags=["SOC"])
app.include_router(notifications.router, prefix="/api/soc", tags=["SOC"])
app.include_router(threat_intel.router, prefix="/api/soc", tags=["SOC"])
app.include_router(analytics.router, prefix="/api/soc", tags=["SOC"])
app.include_router(reports.router, prefix="/api/soc", tags=["SOC"])
app.include_router(validation.router, prefix="/api/validation", tags=["Validation & Health"])
app.include_router(demo.router, prefix="/api/demo", tags=["Interactive Demo"])


@app.on_event("startup")
def startup_event():
    # Start packet monitoring
    TrafficService.get_instance().start()

@app.on_event("shutdown")
def shutdown_event():
    # Stop packet monitoring
    TrafficService.get_instance().stop()

@app.get("/")
def read_root():
    """Root server check endpoint."""
    return {
        "status": "active",
        "system": "NetShield AI Threat Intelligence Backend Console",
        "version": "1.0.0"
    }
