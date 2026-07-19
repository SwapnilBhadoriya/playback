"""Throwaway smoke test: confirms GEMINI_API_KEY works via the google-genai SDK.
Not part of the app -- run manually, then discard or keep for future debugging.
"""

from google import genai

from app.config import settings

client = genai.Client(api_key=settings.google_api_key)

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Reply with exactly one word: pong",
)

print(response.text)
