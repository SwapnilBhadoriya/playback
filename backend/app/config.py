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
    # Optional: base URL of a running bgutil-ytdlp-pot-provider HTTP server (see
    # https://github.com/Brainicism/bgutil-ytdlp-pot-provider), e.g.
    # "http://127.0.0.1:4416" locally or an internal service URL on Railway. Supplies YouTube
    # PO (proof-of-origin) tokens -- cookies alone weren't enough to pass the bot-check from
    # Railway's IP, confirmed live. Unset for local dev (not blocked, so not needed there).
    pot_provider_base_url: str | None = None


settings = Settings()
