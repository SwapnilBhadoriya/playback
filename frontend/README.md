# Playback Frontend

React + Vite + TypeScript frontend for Playback: submit a YouTube URL, watch it process, then read the generated notes and take the practice quiz. Talks to the backend documented in `../backend/README.md`.

## Prerequisites

- Node.js 20+ and npm
- The backend running and reachable (see `../backend/README.md`): Postgres + Redis (`docker compose up -d`), `uvicorn app.main:app --reload`, and a Celery worker, all from `backend/`

## Setup

```bash
cd frontend
npm install
cp .env.example .env   # defaults to http://localhost:8000, matches the backend's default port
npm run dev
```

The app runs at `http://localhost:5173` — the backend's default `CORS_ORIGIN` already allows this origin, so no backend config changes are needed.

## Project layout

```
src/
├── main.tsx           # React root: QueryClientProvider + BrowserRouter
├── App.tsx            # Route definitions
├── index.css          # Tailwind entry point (@import "tailwindcss";)
├── api/
│   ├── client.ts       # Typed fetch wrapper (base URL, JSON, error handling)
│   └── videos.ts       # createVideo, getVideoStatus, getVideoNotes, getPracticeSheet
├── types/
│   └── video.ts        # TypeScript types matching the backend's response schemas
├── hooks/
│   └── useVideoStatus.ts  # Polls GET /videos/{id}/status until done/failed
├── pages/
│   ├── HomePage.tsx    # "/" — URL submission form
│   └── VideoPage.tsx   # "/videos/:videoId" — status, then notes + practice sheet
├── components/
│   ├── VideoSubmitForm.tsx
│   ├── StatusBanner.tsx
│   ├── NotesList.tsx
│   └── PracticeSheet.tsx
└── lib/
    └── queryClient.ts  # Shared TanStack Query client instance
```

## Stack

- **Vite + React + TypeScript** — build tooling and UI framework
- **Tailwind CSS v4** (via the `@tailwindcss/vite` plugin) — styling
- **TanStack Query** — all API data fetching; `useVideoStatus` uses its dynamic `refetchInterval` to poll every 2s until the job reaches `done`/`failed`, then stops automatically
- **React Router** — `/` (submit) and `/videos/:videoId` (results)

## Commands

```bash
npm run dev        # start the dev server
npm run build       # type-check + production build
npx tsc --noEmit    # type-check only
```
