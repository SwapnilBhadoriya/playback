from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str
    redis_url: str
    groq_api_key: str
    cors_origin: str
    groq_whisper_model: str = "whisper-large-v3-turbo"
    llm_provider: str = "groq"
    llm_model_name: str = "llama-3.3-70b-versatile"
    # Optional: full contents of a Netscape-format cookies.txt from a logged-in YouTube
    # session. Needed on hosts (Railway, Render, most clouds) where YouTube's bot-detection
    # blocks datacenter IPs with "Sign in to confirm you're not a bot" -- unset for local dev.
    yt_dlp_cookies: str | None = None


settings = Settings()
