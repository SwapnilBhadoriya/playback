import pytest

from app.services.youtube import is_valid_youtube_url

VALID_URLS = [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtube.com/watch?v=dQw4w9WgXcQ",
    "https://m.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtube.com/watch?v=dQw4w9WgXcQ&t=10s",
    "https://youtu.be/dQw4w9WgXcQ",
    "https://www.youtube.com/shorts/dQw4w9WgXcQ",
    "https://www.youtube.com/embed/dQw4w9WgXcQ",
]

INVALID_URLS = [
    "not-a-url",
    "",
    "https://vimeo.com/123456789",
    "https://www.youtube.com/watch?v=short",
    "https://www.youtube.com/",
    "ftp://youtube.com/watch?v=dQw4w9WgXcQ",
]


@pytest.mark.parametrize("url", VALID_URLS)
def test_valid_youtube_urls(url):
    assert is_valid_youtube_url(url) is True


@pytest.mark.parametrize("url", INVALID_URLS)
def test_invalid_youtube_urls(url):
    assert is_valid_youtube_url(url) is False
