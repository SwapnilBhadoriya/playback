import uuid

from pydantic import BaseModel, ConfigDict


class VideoCreateRequest(BaseModel):
    youtube_url: str


class VideoCreateResponse(BaseModel):
    video_id: uuid.UUID
    status: str


class VideoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str | None
    youtube_url: str
    youtube_video_id: str | None
    duration_seconds: int | None
    channel_name: str | None
    status: str


class JobStatusResponse(BaseModel):
    current_stage: str
    error_message: str | None


class NoteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    section_title: str
    blocks: list[dict] | None
    start_timestamp: float


class PracticeQuestionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    question_type: str
    question_text: str
    options: list[str] | None
    answer: str
    explanation: str
    difficulty: str | None
    marks: int | None
    topic_tags: list[str] | None
    timestamp_seconds: float | None
