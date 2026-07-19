"""Throwaway smoke test: confirms GROQ_API_KEY works for both audio transcription and
chat completion via Groq's API.
Not part of the app -- run manually, then discard or keep for future debugging.

Usage: .venv/bin/python scripts/try_groq.py path/to/audio_or_video_file
"""

import sys

from app.config import settings
from app.services.llm import generate_notes
from app.services.transcription import transcribe

audio_path = sys.argv[1]

segments = transcribe(audio_path)
print(f"Transcription ({settings.groq_whisper_model}):")
for segment in segments:
    print(f"  [{segment['start']:.2f}s -> {segment['end']:.2f}s] {segment['text']}")

print(f"\nNotes generation ({settings.llm_model_name}):")
for note in generate_notes(segments):
    print(f"  {note.section_title} ({note.start_timestamp:.2f}s) -- {len(note.blocks)} block(s)")
