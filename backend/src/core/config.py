from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Application settings
    app_name: str = "Traffic Simulation Platform"
    debug: bool = False
    
    # Server settings
    host: str = "0.0.0.0"
    port: int = 8000
    
    # File upload settings
    upload_dir: str = "uploads"
    max_file_size: int = 10 * 1024 * 1024  # 10MB
    allowed_image_types: list = [".jpg", ".jpeg", ".png", ".bmp"]
    
    # SUMO settings
    sumo_binary: str = "sumo"
    sumo_config_dir: str = "sumo_configs"
    simulation_step: float = 1.0  # seconds
    
    # WebSocket settings
    websocket_ping_interval: int = 20
    websocket_ping_timeout: int = 20
    
    # Image processing settings
    min_road_width: int = 10
    max_road_width: int = 100
    intersection_detection_threshold: float = 0.7
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Create global settings instance
settings = Settings()

# Ensure required directories exist
os.makedirs(settings.upload_dir, exist_ok=True)
os.makedirs(settings.sumo_config_dir, exist_ok=True) 