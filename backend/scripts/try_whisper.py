"""Throwaway smoke test: confirms faster-whisper + ffmpeg produce timestamped segments.
Not part of the app -- run manually, then discard or keep for future debugging.

Usage: .venv/bin/python scripts/try_whisper.py path/to/audio_or_video_file
"""

import sys

from faster_whisper import WhisperModel

audio_path = sys.argv[1]

model = WhisperModel("base", device="cpu", compute_type="int8")
segments, info = model.transcribe(audio_path)

print(f"Detected language: {info.language} (p={info.language_probability:.2f})")
for segment in segments:
    print(f"[{segment.start:.2f}s -> {segment.end:.2f}s] {segment.text}")
