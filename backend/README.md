# Playback Backend

Backend for Playback: submit a YouTube URL, get back auto-generated notes and a practice sheet.

**Status:** Phase 0–5 complete. All four pipeline stages (audio download, transcription, notes, practice sheet) run real logic and have been verified end-to-end against a real 21-minute video. Transcription and notes/practice-sheet generation both run through Groq's API (`app/services/transcription.py`, `app/services/llm.py`) — no local ML model is loaded. The LLM is constructed once via `init_chat_model(model=..., model_provider=...)`, so swapping to a different Groq model or another LangChain-supported provider is a config change (`LLM_PROVIDER`/`LLM_MODEL_NAME` in `.env`), not a code change. `GET /videos/{id}/notes` and `GET /videos/{id}/practice-sheet` expose the generated results.

## Prerequisites

- Python 3.12+
- Docker + Docker Compose plugin (`docker compose`, not the standalone `docker-compose` binary)
- A Groq API key from the [Groq Console](https://console.groq.com/) (used for both audio transcription and notes/quiz generation)

## Setup

1. **Create a virtualenv and install dependencies:**
   ```bash
   cd backend
   python3 -m venv .venv
   .venv/bin/pip install --upgrade pip
   .venv/bin/pip install -r requirements.txt
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set a real `GROQ_API_KEY` (the other defaults work as-is for local dev). Note `DATABASE_URL` points at host port **5433**, not the standard 5432 — this repo's `docker-compose.yml` remaps it to avoid clashing with any Postgres already running natively on your machine.

3. **Start Postgres and Redis:**
   ```bash
   docker compose up -d
   docker compose ps   # both services should show "healthy"
   ```

4. **Run database migrations:**
   ```bash
   .venv/bin/alembic upgrade head
   ```

5. **Run the app:**
   ```bash
   .venv/bin/uvicorn app.main:app --reload
   ```
   The API is now at `http://localhost:8000`.

6. **Run the Celery worker** (separate terminal — required for `POST /videos` to actually process anything):
   ```bash
   .venv/bin/celery -A app.tasks.celery_app worker --loglevel=info
   ```
   By default this runs with prefork concurrency (one process per CPU core).

## Verifying your setup

```bash
curl http://localhost:8000/health
# {"status":"ok"}

curl -X POST http://localhost:8000/videos \
  -H "Content-Type: application/json" \
  -d '{"youtube_url": "https://www.youtube.com/watch?v=jNQXAC9IVRw"}'
# 201 {"video_id": "...", "status": "queued"}
```

## Running tests

```bash
.venv/bin/pytest
```

## Project layout

```
app/
├── main.py           # FastAPI app instance, CORS, routers, /health
├── config.py         # Settings loaded from .env (pydantic-settings)
├── database.py        # SQLAlchemy engine/session, Base, get_db dependency
├── models/            # SQLAlchemy ORM models (videos, transcripts, notes, practice_questions, jobs)
├── schemas/           # Pydantic request/response schemas
├── api/               # FastAPI routers (one module per resource)
├── services/          # Pure, DB-free business logic (yt-dlp, Groq transcription, Groq LLM calls)
└── tasks/             # Celery app + pipeline (all four stages wired with real logic)
alembic/               # DB migrations
scripts/               # Throwaway manual smoke-test scripts (not part of the app)
tests/                 # pytest unit tests
```

## Current API surface

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Liveness check |
| POST | `/videos` | Submit a YouTube URL; validates it, fetches title/duration via `yt-dlp`, creates `videos` + `jobs` rows, enqueues async processing, returns `video_id` |
| GET | `/videos/{video_id}` | Returns the video's stored metadata (title, duration, channel, status); `404` if it doesn't exist |
| GET | `/videos/{video_id}/status` | Returns `current_stage` and `error_message` from the `jobs` table for the given video |
| GET | `/videos/{video_id}/status/stream` | Server-Sent Events stream of status updates as the pipeline progresses; closes once `current_stage` reaches `done`/`failed` |
| GET | `/videos/{video_id}/notes` | Returns all generated notes for the video, ordered by `start_timestamp` (empty list if not generated yet); `404` if the video doesn't exist |
| GET | `/videos/{video_id}/practice-sheet` | Returns all generated practice questions for the video (empty list if not generated yet); `404` if the video doesn't exist |

## Common issues

- **`address already in use` on `docker compose up`**: something else on your machine is already bound to the mapped host port (check `ss -tlnp | grep <port>`). This repo intentionally uses `5433` for Postgres for this reason — adjust `docker-compose.yml` and `.env` together if you hit a similar conflict on 6379 (Redis).
- **Migrations out of sync**: if you pull new model changes, re-run `.venv/bin/alembic upgrade head`. To generate a new migration after changing models: `.venv/bin/alembic revision --autogenerate -m "description"`.
- **`Video not found, private, or unavailable` on a video that works locally**: this almost always means YouTube is blocking the host's IP with "Sign in to confirm you're not a bot" — check the web service's logs for the actual `yt-dlp` error (logged, but deliberately not sent to the client). Common on cloud hosts (Railway, Render, etc.), rare on a residential/local IP. Fix: set `YT_DLP_COOKIES` to the full contents of a Netscape-format `cookies.txt` exported from a real, logged-in YouTube session:
  1. Log into YouTube in your browser.
  2. Export cookies with a browser extension such as "Get cookies.txt LOCALLY" (Chrome/Firefox), scoped to youtube.com.
  3. Paste the exported file's full contents as the `YT_DLP_COOKIES` env var on your host (as one multi-line value — most dashboards, including Railway's, support multi-line env vars).
  4. Redeploy. `app/services/youtube.py` writes it to a temp file and passes it to `yt-dlp` as `cookiefile` automatically once the env var is set.
  
  Cookies from a real session can eventually expire/rotate — if the error comes back after working for a while, re-export and update the env var.

  Also already applied regardless of cookies: `_base_ydl_opts()` in `app/services/youtube.py` forces the `tv_embedded` player client, which returns the same full audio-only format catalog as the default client (confirmed live — no quality/size regression) but uses a different auth context that's sometimes not subject to the same bot-check as the "web" client.

  **If cookies + `tv_embedded` still aren't enough** (confirmed on Railway: cookies reached the process intact and correctly formatted, but YouTube still rejected the request), the next layer is a PO (proof-of-origin) token:
  1. Deploy [`brainicism/bgutil-ytdlp-pot-provider`](https://github.com/Brainicism/bgutil-ytdlp-pot-provider) as its own service (it's a prebuilt Docker image, deployable directly — e.g. on Railway: "New" → "Empty Service" → set the Docker image, no repo needed) exposing port `4416`.
  2. Set `POT_PROVIDER_BASE_URL` on both the web and worker services to that provider's internal URL (e.g. `http://<service-name>.railway.internal:4416` on Railway), and redeploy both.
  3. `app/services/youtube.py` passes it to `yt-dlp` via the `youtubepot-bgutilhttp` extractor arg automatically once the env var is set — confirmed locally that `yt-dlp` recognizes the plugin and provider (`bgutil:http` shows as an available PO Token Provider in verbose output) and the full pipeline still runs correctly with it configured. Whether it actually defeats a given host's specific block can only be confirmed by deploying it there, since a non-blocked environment never needs to request a token in the first place.
