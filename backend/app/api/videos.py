import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Job, Note, PracticeQuestion, Video
from app.schemas.video import (
    JobStatusResponse,
    NoteResponse,
    PracticeQuestionResponse,
    VideoCreateRequest,
    VideoCreateResponse,
)
from app.services.youtube import VideoUnavailableError, fetch_metadata, is_valid_youtube_url
from app.tasks.pipeline import process_video

router = APIRouter(tags=["videos"])


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
        status="queued",
    )
    db.add(video)
    db.flush()

    job = Job(video_id=video_id, current_stage="queued")
    db.add(job)
    db.commit()

    process_video.delay(str(video_id))

    return VideoCreateResponse(video_id=video_id, status="queued")


@router.get("/videos/{video_id}/status", response_model=JobStatusResponse)
def get_video_status(video_id: uuid.UUID, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.video_id == video_id).first()
    if job is None:
        raise HTTPException(status_code=404, detail="Video not found")

    return JobStatusResponse(current_stage=job.current_stage, error_message=job.error_message)


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
