from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import logging
import sys

from app.core.config import settings

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("netshield_db")

db_url = settings.DATABASE_URL
connect_args = {}

# Check if SQLite url
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

# Attempt connection to Postgres or fallback to local SQLite
try:
    if db_url.startswith("postgresql"):
        # Test engine with pool_pre_ping to check server presence
        connect_args["connect_timeout"] = 3
        engine = create_engine(
            db_url,
            connect_args=connect_args,
            pool_pre_ping=True
        )
        # Try to connect once to verify connectivity
        with engine.connect() as conn:
            logger.info("Successfully connected to PostgreSQL database.")
    else:
        engine = create_engine(db_url, connect_args=connect_args)
except Exception as e:
    # Fallback to local SQLite database so the app runs immediately
    fallback_url = "sqlite:///./netshield_ai.db"
    logger.warning(
        f"PostgreSQL connection to {db_url} failed: {e}.\n"
        f"Falling back to local SQLite database at: {fallback_url}"
    )
    engine = create_engine(fallback_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
