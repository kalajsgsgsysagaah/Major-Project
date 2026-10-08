"""
Application Configuration
Reads all settings from the .env file using pydantic-settings.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Google Gemini
    gemini_api_key: str = ""

    # Optional: Alpha Vantage financial data
    alpha_vantage_api_key: str = ""

    # App
    app_env: str = "development"
    app_name: str = "Agentic AI Investment Planner"
    backend_port: int = 8000
    frontend_url: str = "http://localhost:5173"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


# Singleton settings instance — import this everywhere
settings = Settings()
