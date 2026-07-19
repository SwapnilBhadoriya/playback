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
    (the "Sign in to confirm you're not a bot" error most cloud hosts hit).

    Correction from an earlier version of this function: "tv_embedded" is NOT a valid
    player_client in the installed yt-dlp version -- confirmed live yt-dlp logs
    "Skipping unsupported client 'tv_embedded'" and silently falls back to the default ("web")
    client. Every earlier test result attributed to "tv_embedded" was actually just testing
    default behavior. The real, current client with an equivalent purpose is "tv_simply": it
    doesn't send cookies (no login needed) and explicitly *requires* a PO (proof-of-origin)
    token for its media (GVS) formats -- confirmed live this actually engages a PO token
    provider (unlike "web", whose player-info-stage bot-check isn't gated behind any PO token
    yt-dlp knows to request, which is why cookies alone never helped: yt-dlp had no reason to
    ask bgutil-provider for anything).

    Three things confirmed necessary together for "tv_simply" to yield real audio-only formats
    (without them it silently degrades to image-only "formats"):
    1. player_client=tv_simply (this function)
    2. A running bgutil-ytdlp-pot-provider server for the actual PO token (POT_PROVIDER_BASE_URL)
    3. A JS runtime (Deno) plus yt-dlp's remote EJS challenge-solver component, to solve
       YouTube's "n challenge" signature obfuscation -- see download_audio's remote_components.

    Cookies (optional YT_DLP_COOKIES) are kept as a harmless fallback -- unused by tv_simply
    itself, but cost nothing to keep in case a future client change benefits from them again.
    """
    global _cookies_file
    extractor_args = {"youtube": {"player_client": ["tv_simply"]}}
    if settings.pot_provider_base_url:
        extractor_args["youtubepot-bgutilhttp"] = {"base_url": [settings.pot_provider_base_url]}
    opts = {"extractor_args": extractor_args, "remote_components": {"ejs:github"}}
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
        # Capped at 128kbps first: "bestaudio" alone picks the highest-bitrate stream
        # available, which for some videos is 250-400kbps -- plenty for speech transcription
        # accuracy at 128kbps, and confirmed live that an uncapped choice can exceed Groq's
        # 25MB cap well before a video gets particularly long. Falls back to whatever's
        # available if nothing fits under the cap.
        "format": (
            "bestaudio[ext=m4a][abr<=128]/bestaudio[ext=webm][abr<=128]/"
            "bestaudio[ext=m4a]/bestaudio[ext=webm]/bestaudio/best"
        ),
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
