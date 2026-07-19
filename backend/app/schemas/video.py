import uuid

from pydantic import BaseModel, ConfigDict


class VideoCreateRequest(BaseModel):
    youtube_url: str


class VideoCreateResponse(BaseModel):
    video_id: uuid.UUID
    status: str


class JobStatusResponse(BaseModel):
    current_stage: str
    error_message: str | None


class NoteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    section_title: str
    content: str
    start_timestamp: float


class PracticeQuestionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    question_type: str
    question_text: str
    options: list[str] | None
    answer: str
    explanation: str
