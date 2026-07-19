from collections.abc import Callable

from groq import Groq

from app.config import settings

_client: Groq | None = None


def _get_client() -> Groq:
    global _client
    if _client is None:
        _client = Groq(api_key=settings.groq_api_key)
    return _client


def transcribe(audio_path: str, on_progress: Callable[[int], None] | None = None) -> list[dict]:
    client = _get_client()
    # Groq's free tier caps uploaded audio files at 25MB.
    with open(audio_path, "rb") as f:
        result = client.audio.transcriptions.create(
            file=f,
            model=settings.groq_whisper_model,
            response_format="verbose_json",
        )

    # Groq's transcription endpoint is a single blocking call with no incremental
    # progress of its own (unlike a local model transcribing segment-by-segment),
    # so the only honest signal available is "done" once the response is back.
    if on_progress is not None:
        on_progress(100)

    return [{"start": s["start"], "end": s["end"], "text": s["text"]} for s in result.segments]
