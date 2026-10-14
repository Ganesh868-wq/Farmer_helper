import os
from pathlib import Path
from dotenv import load_dotenv

# Base directory
BASE_DIR = Path(__file__).resolve().parent

# Load .env file
load_dotenv(BASE_DIR / ".env")

class Config:
    """Application configuration loaded from environment variables."""
    SECRET_KEY = os.getenv("SECRET_KEY", "rythu_mitra_default_dev_secret_key_change_in_production")
    DATABASE_PATH = os.getenv("DATABASE_PATH", str(BASE_DIR / "rythu_mitra.db"))
    
    # External APIs
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
    OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "").strip()
    DATA_GOV_IN_API_KEY = os.getenv("DATA_GOV_IN_API_KEY", "").strip()
    
    # Server settings
    HOST = os.getenv("HOST", "127.0.0.1")
    PORT = int(os.getenv("PORT", "5000"))
    DEBUG = os.getenv("FLASK_DEBUG", "1") == "1"
    
    # Upload settings
    UPLOAD_FOLDER = BASE_DIR / "uploads" / "scans"
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max upload
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}

config = Config()
