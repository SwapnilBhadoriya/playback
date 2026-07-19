import logging
import os
import re
import shutil
import tempfile
from collections.abc import Callable

import yt_dlp

logger = logging.getLogger(__name__)

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
        logger.error("fetch_metadata failed for %s: %s", url, e)
        raise VideoUnavailableError(str(e)) from e

    return {
        "title": info.get("title"),
        "duration_seconds": info.get("duration"),
        "youtube_video_id": info.get("id"),
        "channel_name": info.get("channel") or info.get("uploader"),
    }


def download_audio(
    url: str, on_progress: Callable[[int], None] | None = None
) -> tuple[str, str]:
    """Downloads audio for a YouTube URL. Returns (audio_path, tmp_dir).

    The caller is responsible for removing tmp_dir once done with the audio file.
    If on_progress is given, it's called with an integer 0-100 as the download advances.
    """
    tmp_dir = tempfile.mkdtemp(prefix="playback_audio_")

    def _progress_hook(status: dict) -> None:
        if on_progress is None or status.get("status") != "downloading":
            return
        total = status.get("total_bytes") or status.get("total_bytes_estimate")
        downloaded = status.get("downloaded_bytes")
        if not total or downloaded is None:
            return
        on_progress(min(99, int(downloaded / total * 100)))

    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "noplaylist": True,
        # m4a/webm are Groq's transcription API's natively supported containers for
        # YouTube's audio-only streams, so no ffmpeg extraction/conversion is needed.
        "format": "bestaudio[ext=m4a]/bestaudio[ext=webm]/bestaudio/best",
        "outtmpl": os.path.join(tmp_dir, "%(id)s.%(ext)s"),
        "progress_hooks": [_progress_hook],
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
    except yt_dlp.utils.DownloadError as e:
        logger.error("download_audio failed for %s: %s", url, e)
        shutil.rmtree(tmp_dir, ignore_errors=True)
        raise VideoUnavailableError(str(e)) from e

    if on_progress is not None:
        on_progress(100)

    return ydl.prepare_filename(info), tmp_dir
