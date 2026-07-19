from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.videos import router as videos_router
from app.config import settings

app = FastAPI(title="Playback")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.cors_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(videos_router)


@app.get("/health")
def health():
    return {"status": "ok"}
