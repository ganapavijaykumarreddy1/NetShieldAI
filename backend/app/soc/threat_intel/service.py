from sqlalchemy.orm import Session
from app.models.soc import ThreatIntelligence
from app.soc.threat_intel.data import THREAT_DB

class ThreatIntelService:
    def __init__(self, db: Session):
        self.db = db

    def seed_database_if_empty(self):
        count = self.db.query(ThreatIntelligence).count()
        if count == 0:
            for threat_name, data in THREAT_DB.items():
                ti = ThreatIntelligence(
                    threat_name=threat_name,
                    attack_category=data["attack_category"],
                    severity=data["severity"],
                    risk_explanation=data["risk_explanation"],
                    recommended_mitigation=data["recommended_mitigation"],
                    references_json=data["references_json"]
                )
                self.db.add(ti)
            self.db.commit()

    def get_intel(self, threat_name: str) -> ThreatIntelligence:
        return self.db.query(ThreatIntelligence).filter(ThreatIntelligence.threat_name.ilike(f"%{threat_name}%")).first()

    def get_all(self):
        return self.db.query(ThreatIntelligence).all()
