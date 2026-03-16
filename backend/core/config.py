from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    PROJECT_NAME: str = "Smart Diet & Weather-Based Recommendation API"
    MONGODB_URI: str = "mongodb://localhost:27017" # Default local, override in .env
    DATABASE_NAME: str = "smart_diet_db"
    
    JWT_SECRET_KEY: str = "YOUR_SUPER_SECRET_KEY_HERE_CHANGE_IN_PRODUCTION"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    OPENWEATHER_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    
    SMTP_EMAIL: str = ""
    SMTP_APP_PASSWORD: str = ""
    model_config = {
        "env_file": ".env",
        "extra": "ignore"
    }

@lru_cache()
def get_settings():
    return Settings()
