"""
Configuration parameters loaded from environment variables
"""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Environment settings
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# Database settings
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./educational_platform.db")

# Security settings
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-CHANGE-THIS-IN-PRODUCTION")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_MINUTES = int(os.getenv("REFRESH_TOKEN_EXPIRE_MINUTES", "10080"))

# File storage settings
BASE_FOLDER_DIR = os.getenv("BASE_FOLDER_DIR", "/app/storage")
THUMBNAIL_DIR = os.getenv("THUMBNAIL_DIR", "/app/thumbnails")
BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")

# CORS settings
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")

# VK OAuth settings
VK_CLIENT_ID = os.getenv("VK_CLIENT_ID", "")
VK_CLIENT_SECRET = os.getenv("VK_CLIENT_SECRET", "")
VK_REDIRECT_URI = os.getenv("VK_REDIRECT_URI", "")

# Create necessary directories
Path(BASE_FOLDER_DIR).mkdir(parents=True, exist_ok=True)
Path(THUMBNAIL_DIR).mkdir(parents=True, exist_ok=True)