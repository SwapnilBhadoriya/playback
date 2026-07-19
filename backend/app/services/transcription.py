from collections.abc import Callable

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


def transcribe(audio_path: str, on_progress: Callable[[int], None] | None = None) -> list[dict]:
    model = _get_model()
    segments, info = model.transcribe(audio_path)

    result = []
    for segment in segments:
        result.append({"start": segment.start, "end": segment.end, "text": segment.text})
        if on_progress is not None and info.duration:
            on_progress(min(99, int(segment.end / info.duration * 100)))

    if on_progress is not None:
        on_progress(100)

    return result
