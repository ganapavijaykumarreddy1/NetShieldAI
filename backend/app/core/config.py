from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List, Union
import os

class Settings(BaseSettings):
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    DATABASE_URL: str
    BACKEND_CORS_ORIGINS: Union[str, List[str]] = []

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Inference Engine
    MODEL_PATH: str = "models/registry/random_forest_v1.pkl"
    THREAT_RISK_THRESHOLD: float = 0.50
    
    # Notifications/SMTP
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_SENDER_EMAIL: str = "your_email@gmail.com"
    SMTP_APP_PASSWORD: str = "your_app_password"
    SMTP_RECIPIENT_EMAIL: str = "admin_email@gmail.com"

    class Config:
        # Resolve path to .env in parent folder of app
        env_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env")
        case_sensitive = True

settings = Settings()
