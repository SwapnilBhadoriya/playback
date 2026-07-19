import json
import uuid
from collections.abc import AsyncIterable

from fastapi import APIRouter, Depends, HTTPException
from fastapi.sse import EventSourceResponse, format_sse_event
from sqlalchemy.orm import Session

from app.database import SessionLocal, get_db
from app.models import Job, Note, PracticeQuestion, Video
from app.pubsub import subscribe_status
from app.schemas.video import (
    JobStatusResponse,
    NoteResponse,
    PracticeQuestionResponse,
    VideoCreateRequest,
    VideoCreateResponse,
    VideoResponse,
)
from app.services.youtube import VideoUnavailableError, fetch_metadata, is_valid_youtube_url
from app.tasks.pipeline import process_video

router = APIRouter(tags=["videos"])

TERMINAL_STAGES = {"done", "failed"}


@router.post("/videos", response_model=VideoCreateResponse, status_code=201)
def create_video(payload: VideoCreateRequest, db: Session = Depends(get_db)):
    if not is_valid_youtube_url(payload.youtube_url):
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")

    try:
        metadata = fetch_metadata(payload.youtube_url)
    except VideoUnavailableError:
        raise HTTPException(status_code=400, detail="Video not found, private, or unavailable")

    video_id = uuid.uuid4()
    video = Video(
        id=video_id,
        youtube_url=payload.youtube_url,
        title=metadata["title"],
        duration_seconds=metadata["duration_seconds"],
        youtube_video_id=metadata["youtube_video_id"],
        channel_name=metadata["channel_name"],
        status="queued",
    )
    db.add(video)
    db.flush()

    job = Job(video_id=video_id, current_stage="queued")
    db.add(job)
    db.commit()

    process_video.delay(str(video_id))

    return VideoCreateResponse(video_id=video_id, status="queued")


@router.get("/videos/{video_id}", response_model=VideoResponse)
def get_video(video_id: uuid.UUID, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == video_id).first()
    if video is None:
        raise HTTPException(status_code=404, detail="Video not found")

    return video


@router.get("/videos/{video_id}/status", response_model=JobStatusResponse)
def get_video_status(video_id: uuid.UUID, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.video_id == video_id).first()
    if job is None:
        raise HTTPException(status_code=404, detail="Video not found")

    return JobStatusResponse(current_stage=job.current_stage, error_message=job.error_message)


@router.get("/videos/{video_id}/status/stream")
async def stream_video_status(video_id: uuid.UUID) -> EventSourceResponse:
    # The existence check must happen here, before EventSourceResponse is constructed --
    # once the generator below starts streaming, the response has already committed to a
    # 200 status, so raising HTTPException from inside the generator can't produce a 404.
    db = SessionLocal()
    try:
        job = db.query(Job).filter(Job.video_id == video_id).first()
    finally:
        db.close()

    if job is None:
        raise HTTPException(status_code=404, detail="Video not found")

    initial_stage = job.current_stage
    initial_error = job.error_message

    async def event_generator() -> AsyncIterable[bytes]:
        yield format_sse_event(
            data_str=json.dumps({"current_stage": initial_stage, "error_message": initial_error})
        )
        if initial_stage in TERMINAL_STAGES:
            return

        async for update in subscribe_status(str(video_id)):
            yield format_sse_event(data_str=json.dumps(update))
            if update["current_stage"] in TERMINAL_STAGES:
                return

    return EventSourceResponse(event_generator())


@router.get("/videos/{video_id}/notes", response_model=list[NoteResponse])
def get_video_notes(video_id: uuid.UUID, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == video_id).first()
    if video is None:
        raise HTTPException(status_code=404, detail="Video not found")

    notes = db.query(Note).filter(Note.video_id == video_id).order_by(Note.start_timestamp).all()
    return notes


@router.get("/videos/{video_id}/practice-sheet", response_model=list[PracticeQuestionResponse])
def get_video_practice_sheet(video_id: uuid.UUID, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == video_id).first()
    if video is None:
        raise HTTPException(status_code=404, detail="Video not found")

    questions = (
        db.query(PracticeQuestion).filter(PracticeQuestion.video_id == video_id).order_by(PracticeQuestion.id).all()
    )
    return questions
