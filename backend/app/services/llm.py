from typing import Literal

from langchain.chat_models import init_chat_model
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel

from app.config import settings

_llm = init_chat_model(
    model=settings.llm_model_name,
    model_provider=settings.llm_provider,
    api_key=settings.google_api_key,
)


class LLMGenerationError(Exception):
    pass


class NoteItem(BaseModel):
    section_title: str
    content: str
    start_timestamp: float


class NotesResponse(BaseModel):
    notes: list[NoteItem]


class PracticeQuestionItem(BaseModel):
    question_type: Literal["multiple_choice", "true_false", "short_answer"]
    question_text: str
    options: list[str] | None
    answer: str
    explanation: str


class PracticeSheetResponse(BaseModel):
    questions: list[PracticeQuestionItem]


NOTES_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are creating structured study notes from a video transcript. The transcript "
            "is a list of timestamped segments, each formatted as [start_seconds] text. Produce "
            "note sections covering the entire video in chronological order. Each section needs "
            "a short descriptive title, a clear summary of what's covered, and the start time in "
            "seconds (taken from the transcript segments) where it begins. Do not invent "
            "information that isn't present in the transcript.",
        ),
        ("human", "Transcript:\n{transcript}"),
    ]
)

PRACTICE_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are creating a practice quiz based on a video transcript. Produce 5-10 "
            "questions covering the key points of the video. Each question is one of "
            "multiple_choice, true_false, or short_answer. For multiple_choice, provide a list "
            "of answer choices; for true_false, use [\"True\", \"False\"]; for short_answer, "
            "leave options empty. The answer must match one of the options where applicable, "
            "and the explanation should reference the transcript content.",
        ),
        ("human", "Transcript:\n{transcript}"),
    ]
)


def _format_transcript(segments: list[dict]) -> str:
    return "\n".join(f"[{s['start']:.2f}s] {s['text']}" for s in segments)


def generate_notes(segments: list[dict]) -> list[NoteItem]:
    chain = NOTES_PROMPT | _llm.with_structured_output(NotesResponse)
    try:
        result = chain.invoke({"transcript": _format_transcript(segments)})
    except Exception as e:
        raise LLMGenerationError(str(e)) from e
    return result.notes


def generate_practice_questions(segments: list[dict]) -> list[PracticeQuestionItem]:
    chain = PRACTICE_PROMPT | _llm.with_structured_output(PracticeSheetResponse)
    try:
        result = chain.invoke({"transcript": _format_transcript(segments)})
    except Exception as e:
        raise LLMGenerationError(str(e)) from e
    return result.questions
