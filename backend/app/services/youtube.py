import os
import re
import shutil
import tempfile

import yt_dlp

YOUTUBE_URL_PATTERN = re.compile(
    r"^https?://(www\.|m\.)?"
    r"(youtube\.com/(watch\?v=|shorts/|embed/)[\w-]{11}|youtu\.be/[\w-]{11})"
)


class VideoUnavailableError(Exception):
    pass


def is_valid_youtube_url(url: str) -> bool:
    return bool(YOUTUBE_URL_PATTERN.match(url))


def fetch_metadata(url: str) -> dict:
    ydl_opts = {"quiet": True, "skip_download": True, "no_warnings": True, "noplaylist": True}
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
    except yt_dlp.utils.DownloadError as e:
        raise VideoUnavailableError(str(e)) from e

    return {
        "title": info.get("title"),
        "duration_seconds": info.get("duration"),
    }


def download_audio(url: str) -> tuple[str, str]:
    """Downloads and extracts audio for a YouTube URL. Returns (audio_path, tmp_dir).

    The caller is responsible for removing tmp_dir once done with the audio file.
    """
    tmp_dir = tempfile.mkdtemp(prefix="playback_audio_")
    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "noplaylist": True,
        "format": "bestaudio/best",
        "outtmpl": os.path.join(tmp_dir, "%(id)s.%(ext)s"),
        "postprocessors": [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "192",
            }
        ],
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            base, _ = os.path.splitext(ydl.prepare_filename(info))
    except yt_dlp.utils.DownloadError as e:
        shutil.rmtree(tmp_dir, ignore_errors=True)
        raise VideoUnavailableError(str(e)) from e

    return f"{base}.mp3", tmp_dir
