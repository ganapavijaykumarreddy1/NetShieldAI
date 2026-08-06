from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON, func
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.user import User

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(String(100), unique=True, index=True, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    src_ip = Column(String(45), nullable=False)
    dst_ip = Column(String(45), nullable=False)
    attack_type = Column(String(100), nullable=False)
    confidence = Column(Float, nullable=False)
    risk_score = Column(Float, nullable=False)
    severity = Column(String(20), nullable=False)
    protocol = Column(String(20), nullable=True)
    recommended_action = Column(Text, nullable=True)
    status = Column(String(50), default="New", index=True)

    # Relationships
    incidents = relationship("Incident", back_populates="alert", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="alert", cascade="all, delete-orphan")

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String(100), unique=True, index=True, nullable=False)
    alert_id = Column(Integer, ForeignKey("alerts.id", ondelete="CASCADE"), nullable=False)
    priority = Column(String(20), nullable=False)
    assigned_analyst = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(50), default="Open", index=True)
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    alert = relationship("Alert", back_populates="incidents")
    analyst = relationship("User") # Relies on User model existing in the same declarative base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    notification_id = Column(String(100), unique=True, index=True, nullable=False)
    alert_id = Column(Integer, ForeignKey("alerts.id", ondelete="CASCADE"), nullable=False)
    provider = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    alert = relationship("Alert", back_populates="notifications")

class ThreatIntelligence(Base):
    __tablename__ = "threat_intelligence"

    id = Column(Integer, primary_key=True, index=True)
    threat_name = Column(String(100), unique=True, index=True, nullable=False)
    attack_category = Column(String(100), nullable=True)
    severity = Column(String(20), nullable=True)
    risk_explanation = Column(Text, nullable=True)
    recommended_mitigation = Column(Text, nullable=True)
    references_json = Column(JSON, nullable=True)

class ReportHistory(Base):
    __tablename__ = "report_history"

    id = Column(Integer, primary_key=True, index=True)
    report_type = Column(String(50), nullable=False)
    format = Column(String(20), nullable=False)
    generated_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    file_path = Column(Text, nullable=False)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    generator = relationship("User")
