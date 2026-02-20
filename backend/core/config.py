"""
GeneDose.ai Configuration Settings

This module contains all configuration settings for the GeneDose.ai backend,
including database connections, security settings, and processing parameters.
"""

from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # Application
    app_name: str = "GeneDose.ai"
    app_version: str = "1.0.0"
    environment: str = "development"
    debug: bool = False
    
    # Security
    secret_key: str = "your-super-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Database
    database_url: str = "postgresql://genedose:password@localhost:5432/genedose"
    redis_url: str = "redis://localhost:6379"
    
    # File Processing
    max_file_size_mb: int = 5
    upload_dir: str = "./uploads"
    temp_dir: str = "./temp"
    reference_genome: str = "GRCh38"
    reference_fasta_path: str = ""
    liftover_chain_path: str = ""
    retention_enabled: bool = False
    
    # External Services
    pharmcat_container: str = "pharmcat:latest"
    pharmcat_endpoint: str = "http://pharmcat:8080"
    
    # CPIC Guidelines
    cpic_data_dir: str = "./data/cpic"
    allele_definition_dir: str = "./data/alleles"
    
    # Performance
    processing_timeout_seconds: int = 60
    max_concurrent_analyses: int = 10
    cache_ttl_seconds: int = 3600
    
    # Logging
    log_level: str = "INFO"
    log_format: str = "json"
    
    # CORS
    allowed_origins: List[str] = ["http://localhost:3000", "https://genedose.ai"]
    
    # Authentication
    skip_auth: bool = False  # For development only
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Global settings instance
settings = Settings()

# Ensure directories exist
os.makedirs(settings.upload_dir, exist_ok=True)
os.makedirs(settings.temp_dir, exist_ok=True)
os.makedirs(settings.cpic_data_dir, exist_ok=True)
os.makedirs(settings.allele_definition_dir, exist_ok=True)
