import shutil
import uuid

from app.database import SessionLocal
from app.models import Job, Note, PracticeQuestion, Transcript, Video
from app.services.llm import generate_notes, generate_practice_questions
from app.services.transcription import transcribe
from app.services.youtube import download_audio
from app.tasks.celery_app import celery_app


@celery_app.task(name="process_video")
def process_video(video_id: str):
    db = SessionLocal()
    vid = uuid.UUID(video_id)
    tmp_dir = None
    try:
        job = db.query(Job).filter(Job.video_id == vid).one()
        video = db.query(Video).filter(Video.id == vid).one()

        job.current_stage = "extracting_audio"
        db.commit()
        audio_path, tmp_dir = download_audio(video.youtube_url)

        job.current_stage = "transcribing"
        db.commit()
        segments = transcribe(audio_path)
        db.add(Transcript(video_id=vid, segments=segments))
        db.commit()

        job.current_stage = "generating_notes"
        db.commit()
        notes = generate_notes(segments)
        for note in notes:
            db.add(
                Note(
                    video_id=vid,
                    section_title=note.section_title,
                    content=note.content,
                    start_timestamp=note.start_timestamp,
                )
            )
        db.commit()

        job.current_stage = "generating_practice_sheet"
        db.commit()
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
                )
            )
        db.commit()

        job.current_stage = "done"
        db.commit()

        video.status = "done"
        db.commit()
    finally:
        if tmp_dir:
            shutil.rmtree(tmp_dir, ignore_errors=True)
        db.close()
