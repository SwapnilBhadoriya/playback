from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str
    redis_url: str
    google_api_key: str
    cors_origin: str
    whisper_model_size: str = "base"
    llm_provider: str = "google_genai"
    llm_model_name: str = "gemini-flash-latest"


settings = Settings()
