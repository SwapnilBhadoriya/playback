# Playback Backend

Backend for Playback: submit a YouTube URL, get back auto-generated notes and a practice sheet. See `../plans/BackendPlan.md` for the full build plan and architecture.

**Status:** Phase 0–5 complete. All four pipeline stages (audio download, transcription, notes, practice sheet) run real logic and have been verified end-to-end against a real 21-minute video. Notes/practice-sheet generation is built on LangChain (`app/services/llm.py`): the model is constructed once via `init_chat_model(model=..., model_provider=...)`, so swapping to a different Gemini version or another LangChain-supported provider is a config change (`LLM_PROVIDER`/`LLM_MODEL_NAME` in `.env`), not a code change. `GET /videos/{id}/notes` and `GET /videos/{id}/practice-sheet` expose the generated results.

## Prerequisites

- Python 3.12+
- Docker + Docker Compose plugin (`docker compose`, not the standalone `docker-compose` binary)
- `ffmpeg` on your PATH (system package, not pip-installable):
  ```bash
  sudo apt-get update && sudo apt-get install -y ffmpeg
  ffmpeg -version   # verify
  ```
- A Google API key from [Google AI Studio](https://aistudio.google.com/) for Gemini access

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
   Edit `.env` and set a real `GOOGLE_API_KEY` (the other defaults work as-is for local dev). Note `DATABASE_URL` points at host port **5433**, not the standard 5432 — this repo's `docker-compose.yml` remaps it to avoid clashing with any Postgres already running natively on your machine.

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
   By default this runs with prefork concurrency (one process per CPU core). Each worker process lazily loads its own copy of the Whisper model on first use, so for local dev consider capping concurrency to avoid loading multiple copies at once: add `--concurrency=2`.

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
├── services/          # Pure, DB-free business logic (yt-dlp, whisper, LLM calls)
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
| GET | `/videos/{video_id}/status` | Returns `current_stage` and `error_message` from the `jobs` table for the given video |
| GET | `/videos/{video_id}/notes` | Returns all generated notes for the video, ordered by `start_timestamp` (empty list if not generated yet); `404` if the video doesn't exist |
| GET | `/videos/{video_id}/practice-sheet` | Returns all generated practice questions for the video (empty list if not generated yet); `404` if the video doesn't exist |

## Common issues

- **`address already in use` on `docker compose up`**: something else on your machine is already bound to the mapped host port (check `ss -tlnp | grep <port>`). This repo intentionally uses `5433` for Postgres for this reason — adjust `docker-compose.yml` and `.env` together if you hit a similar conflict on 6379 (Redis).
- **`ffmpeg: command not found`**: install it via your OS package manager (see Prerequisites) — it's required by both `yt-dlp` and `faster-whisper` and can't be installed via pip.
- **Migrations out of sync**: if you pull new model changes, re-run `.venv/bin/alembic upgrade head`. To generate a new migration after changing models: `.venv/bin/alembic revision --autogenerate -m "description"`.
