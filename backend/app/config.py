import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "KrishiDirect"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./krishidirect.db")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "krishidirect-super-secret-production-key-seed-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days for demo
    
    # Currency and Locale
    DEFAULT_CURRENCY: str = "INR"
    CURRENCY_SYMBOL: str = "₹"
    
    # Delivery OTP Configuration
    OTP_EXPIRY_MINUTES: int = 15
    OTP_MAX_ATTEMPTS: int = 3
    
    # Demo Mode
    DEMO_MODE: bool = True

    class Config:
        env_file = ".env"

settings = Settings()
