import os
import logging
from logging.handlers import RotatingFileHandler

# Resolve logs directory path relative to backend root
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LOGS_DIR = os.path.join(BACKEND_DIR, "logs")

os.makedirs(LOGS_DIR, exist_ok=True)

# Standard Log Formatter
LOG_FORMATTER = logging.Formatter(
    fmt="[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)

def create_file_logger(logger_name: str, filename: str, level=logging.INFO) -> logging.Logger:
    logger = logging.getLogger(logger_name)
    logger.setLevel(level)
    
    # Avoid adding handlers multiple times if re-imported
    if not logger.handlers:
        file_path = os.path.join(LOGS_DIR, filename)
        handler = RotatingFileHandler(
            file_path, maxBytes=10 * 1024 * 1024, backupCount=5, encoding="utf-8"
        )
        handler.setFormatter(LOG_FORMATTER)
        logger.addHandler(handler)
        
        # Also log WARNING and ERROR to console
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(LOG_FORMATTER)
        console_handler.setLevel(logging.WARNING)
        logger.addHandler(console_handler)
        
    return logger

# Dedicated System Loggers
api_logger = create_file_logger("netshield.api", "api.log")
ai_logger = create_file_logger("netshield.ai", "ai.log")
alerts_logger = create_file_logger("netshield.alerts", "alerts.log")
system_logger = create_file_logger("netshield.system", "system.log")
notifications_logger = create_file_logger("netshield.notifications", "notifications.log")

def log_system_event(message: str, level="info"):
    if level == "error":
        system_logger.error(message)
    elif level == "warning":
        system_logger.warning(message)
    else:
        system_logger.info(message)
