import shutil
import time
import uuid

from app.database import SessionLocal
from app.models import Job, Note, PracticeQuestion, Transcript, Video
from app.pubsub import publish_status
from app.services.llm import generate_notes, generate_practice_questions
from app.services.transcription import transcribe
from app.services.youtube import download_audio
from app.tasks.celery_app import celery_app

# Minimum time between progress writes for a single stage, so a fast stream of
# tiny percentage ticks (e.g. per-segment transcription updates) doesn't flood
# the DB with commits or Redis with publishes.
PROGRESS_UPDATE_MIN_INTERVAL_SECONDS = 0.5


def _make_progress_reporter(db, job: "Job", video_id: str, stage: str):
    last_reported_at = 0.0

    def report(percent: int) -> None:
        nonlocal last_reported_at
        now = time.monotonic()
        is_final = percent >= 100
        if not is_final and (now - last_reported_at) < PROGRESS_UPDATE_MIN_INTERVAL_SECONDS:
            return
        last_reported_at = now
        job.progress_percent = percent
        db.commit()
        publish_status(video_id, stage, progress_percent=percent)

    return report


@celery_app.task(name="process_video")
def process_video(video_id: str):
    db = SessionLocal()
    vid = uuid.UUID(video_id)
    tmp_dir = None
    try:
        job = db.query(Job).filter(Job.video_id == vid).one()
        video = db.query(Video).filter(Video.id == vid).one()

        try:
            job.current_stage = "extracting_audio"
            job.progress_percent = 0
            db.commit()
            publish_status(video_id, job.current_stage, progress_percent=0)
            audio_path, tmp_dir = download_audio(
                video.youtube_url,
                on_progress=_make_progress_reporter(db, job, video_id, "extracting_audio"),
            )

            job.current_stage = "transcribing"
            job.progress_percent = 0
            db.commit()
            publish_status(video_id, job.current_stage, progress_percent=0)
            segments = transcribe(
                audio_path,
                on_progress=_make_progress_reporter(db, job, video_id, "transcribing"),
            )
            db.add(Transcript(video_id=vid, segments=segments))
            db.commit()

            job.current_stage = "generating_notes"
            job.progress_percent = None
            db.commit()
            publish_status(video_id, job.current_stage)
            notes = generate_notes(segments)
            for note in notes:
                db.add(
                    Note(
                        video_id=vid,
                        section_title=note.section_title,
                        blocks=[block.model_dump() for block in note.blocks],
                        start_timestamp=note.start_timestamp,
                    )
                )
            db.commit()

            job.current_stage = "generating_practice_sheet"
            db.commit()
            publish_status(video_id, job.current_stage)
            questions = generate_practice_questions(segments)
            for question in questions:
                db.add(
                    PracticeQuestion(
                        video_id=vid,
                        question_type=question.question_type,
                        question_text=question.question_text,
                        options=question.options,
                        answer=question.answer,
                        explanation=question.explanation,
                        difficulty=question.difficulty,
                        marks=question.marks,
                        topic_tags=question.topic_tags,
                        timestamp_seconds=question.timestamp_seconds,
                    )
                )
            db.commit()

            job.current_stage = "done"
            db.commit()
            publish_status(video_id, job.current_stage)

            video.status = "done"
            db.commit()
        except Exception as e:
            db.rollback()
            job.current_stage = "failed"
            job.error_message = str(e)
            video.status = "failed"
            db.commit()
            publish_status(video_id, "failed", error_message=str(e))
    finally:
        if tmp_dir:
            shutil.rmtree(tmp_dir, ignore_errors=True)
        db.close()
