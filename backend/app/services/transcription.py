from faster_whisper import WhisperModel

from app.config import settings

_model: WhisperModel | None = None


def _get_model() -> WhisperModel:
    global _model
    if _model is None:
        _model = WhisperModel(
            settings.whisper_model_size,
            device="cpu",
            compute_type="int8",
            cpu_threads=settings.whisper_cpu_threads,
        )
    return _model


def transcribe(audio_path: str) -> list[dict]:
    model = _get_model()
    segments, _info = model.transcribe(audio_path)
    return [{"start": s.start, "end": s.end, "text": s.text} for s in segments]
