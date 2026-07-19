import logging
import os
import re
import shutil
import tempfile
from collections.abc import Callable

import yt_dlp

from app.config import settings

logger = logging.getLogger(__name__)

YOUTUBE_URL_PATTERN = re.compile(
    r"^https?://(www\.|m\.)?"
    r"(youtube\.com/(watch\?v=|shorts/|embed/)[\w-]{11}|youtu\.be/[\w-]{11})"
)

_cookies_file: str | None = None


def _base_ydl_opts() -> dict:
    """Options shared by every yt-dlp call to work around YouTube blocking datacenter IPs
    (the "Sign in to confirm you're not a bot" error most cloud hosts hit) by authenticating
    as a real logged-in session via cookies, configured through the optional YT_DLP_COOKIES
    env var. (Forcing an alternate player_client was tried and rejected -- confirmed live that
    it silently degrades YouTube's format list to a single muxed video+audio stream instead of
    the proper audio-only DASH formats, which would blow past Groq's 25MB upload cap on
    anything but very short videos. Cookies are the only fix that doesn't have that downside.)
    """
    global _cookies_file
    opts = {}
    if settings.yt_dlp_cookies:
        if _cookies_file is None:
            fd, path = tempfile.mkstemp(prefix="yt_cookies_", suffix=".txt")
            with os.fdopen(fd, "w") as f:
                f.write(settings.yt_dlp_cookies)
            _cookies_file = path
            lines = settings.yt_dlp_cookies.splitlines()
            logger.error(
                "YT_DLP_COOKIES loaded: %d chars, %d lines, first line: %r",
                len(settings.yt_dlp_cookies),
                len(lines),
                lines[0] if lines else None,
            )
    else:
        logger.error("YT_DLP_COOKIES is not set")
    if _cookies_file:
        opts["cookiefile"] = _cookies_file
    return opts


class VideoUnavailableError(Exception):
    pass


def is_valid_youtube_url(url: str) -> bool:
    return bool(YOUTUBE_URL_PATTERN.match(url))


def fetch_metadata(url: str) -> dict:
    ydl_opts = {
        "quiet": True,
        "skip_download": True,
        "no_warnings": True,
        "noplaylist": True,
        **_base_ydl_opts(),
    }
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
        **_base_ydl_opts(),
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
