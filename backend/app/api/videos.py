import json
import uuid
from collections.abc import AsyncIterable

from fastapi import APIRouter, Depends, HTTPException
from fastapi.sse import EventSourceResponse, format_sse_event
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import SessionLocal, get_db
from app.models import Job, Note, PracticeQuestion, Transcript, Video
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


@router.get("/videos", response_model=list[VideoResponse])
def list_videos(db: Session = Depends(get_db)):
    return (
        db.query(Video)
        .filter(Video.status == "done")
        .order_by(Video.created_at.desc())
        .all()
    )


@router.post("/videos", response_model=VideoCreateResponse, status_code=201)
def create_video(payload: VideoCreateRequest, db: Session = Depends(get_db)):
    if not is_valid_youtube_url(payload.youtube_url):
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")

    try:
        metadata = fetch_metadata(payload.youtube_url)
    except VideoUnavailableError:
        raise HTTPException(status_code=400, detail="Video not found, private, or unavailable")

    youtube_video_id = metadata["youtube_video_id"]
    if youtube_video_id:
        existing_video = (
            db.query(Video).filter(Video.youtube_video_id == youtube_video_id).first()
        )
        if existing_video is not None:
            existing_job = db.query(Job).filter(Job.video_id == existing_video.id).first()
            if existing_job is not None and existing_job.current_stage != "failed":
                return VideoCreateResponse(video_id=existing_video.id, status=existing_video.status)

            # The existing row's youtube_video_id is protected by a unique index, so a
            # failed attempt can't just be left in place while inserting a new Video for
            # the same video -- that would violate the constraint every time, not just on
            # a rare race. Reset this row and re-dispatch the pipeline against it instead
            # of creating a second one. Also clear out any partial results a previous
            # attempt may have persisted before failing partway through the pipeline
            # (e.g. notes generated but questions failed), so they don't linger alongside
            # this attempt's fresh output.
            db.query(Note).filter(Note.video_id == existing_video.id).delete()
            db.query(PracticeQuestion).filter(PracticeQuestion.video_id == existing_video.id).delete()
            db.query(Transcript).filter(Transcript.video_id == existing_video.id).delete()

            existing_video.youtube_url = payload.youtube_url
            existing_video.title = metadata["title"]
            existing_video.duration_seconds = metadata["duration_seconds"]
            existing_video.channel_name = metadata["channel_name"]
            existing_video.status = "queued"
            if existing_job is not None:
                existing_job.current_stage = "queued"
                existing_job.error_message = None
                existing_job.progress_percent = None
            else:
                existing_job = Job(video_id=existing_video.id, current_stage="queued")
                db.add(existing_job)
            db.commit()

            process_video.delay(str(existing_video.id))

            return VideoCreateResponse(video_id=existing_video.id, status="queued")

    video_id = uuid.uuid4()
    video = Video(
        id=video_id,
        youtube_url=payload.youtube_url,
        title=metadata["title"],
        duration_seconds=metadata["duration_seconds"],
        youtube_video_id=youtube_video_id,
        channel_name=metadata["channel_name"],
        status="queued",
    )
    db.add(video)

    try:
        db.flush()
    except IntegrityError:
        # Another concurrent request for the same video won the race between our
        # dedup check above and this insert (e.g. a double-click, or two tabs
        # submitting the same URL at once). Fall back to whatever that request
        # created instead of erroring out.
        db.rollback()
        winner = db.query(Video).filter(Video.youtube_video_id == youtube_video_id).one()
        return VideoCreateResponse(video_id=winner.id, status=winner.status)

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

    return JobStatusResponse(
        current_stage=job.current_stage,
        error_message=job.error_message,
        progress_percent=job.progress_percent,
    )


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
    initial_progress = job.progress_percent

    async def event_generator() -> AsyncIterable[bytes]:
        yield format_sse_event(
            data_str=json.dumps(
                {
                    "current_stage": initial_stage,
                    "error_message": initial_error,
                    "progress_percent": initial_progress,
                }
            )
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
