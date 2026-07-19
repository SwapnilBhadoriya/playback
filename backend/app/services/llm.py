from typing import Annotated, Literal, Union

from langchain.chat_models import init_chat_model
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field

from app.config import settings

_llm = init_chat_model(
    model=settings.llm_model_name,
    model_provider=settings.llm_provider,
    api_key=settings.groq_api_key,
)


class LLMGenerationError(Exception):
    pass


class ParagraphBlock(BaseModel):
    type: Literal["paragraph"]
    text: str


class KeyPoint(BaseModel):
    label: str
    value: str


class KeypointsBlock(BaseModel):
    type: Literal["keypoints"]
    points: list[KeyPoint]


class CodeBlock(BaseModel):
    type: Literal["code"]
    language: str
    code: str


NoteBlock = Annotated[Union[ParagraphBlock, KeypointsBlock, CodeBlock], Field(discriminator="type")]


class NoteItem(BaseModel):
    section_title: str
    start_timestamp: float
    blocks: list[NoteBlock]


class NotesResponse(BaseModel):
    notes: list[NoteItem]


class PracticeQuestionItem(BaseModel):
    question_type: Literal["multiple_choice", "true_false", "short_answer"]
    question_text: str
    options: list[str] | None
    answer: str
    explanation: str
    difficulty: Literal["easy", "medium", "hard"]
    marks: int
    topic_tags: list[str]
    timestamp_seconds: float


class PracticeSheetResponse(BaseModel):
    questions: list[PracticeQuestionItem]


NOTES_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are creating structured study notes from a video transcript. The transcript "
            "is a list of timestamped segments, each formatted as [start_seconds] text. Produce "
            "note sections covering the entire video in chronological order. Each section needs "
            "a short descriptive title, the start time in seconds (taken from the transcript "
            "segments) where it begins, and 2-4 content blocks. Each block is one of:\n"
            "- paragraph: a clear prose summary of what's covered, formatted as markdown -- use "
            "**bold** for key terms and definitions, `inline code` for function/variable/code-like "
            "terms, and short bullet or numbered lists where the content is naturally a sequence "
            "or list. Keep it flowing prose with light inline formatting, not a full document -- "
            "no headings or tables here, that's what keypoints blocks are for.\n"
            "- keypoints: a short list of label/value pairs, only when the content is naturally "
            "a list of distinct facts, steps, or comparisons\n"
            "- code: a code snippet with its language, only when the video actually shows or "
            "discusses code. Set language to a standard lowercase identifier (e.g. python, "
            "javascript, bash, sql).\n"
            "Every section should include at least one paragraph block; keypoints and code blocks "
            "are optional and should only appear when they genuinely fit the content. Do not "
            "invent information that isn't present in the transcript.",
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
            "and the explanation should reference the transcript content. For each question, "
            "also assign: a difficulty (easy, medium, or hard, based on how much reasoning or "
            "recall the question demands), a point value (marks, typically 1-5, harder "
            "questions worth more), 1-3 short topic tags describing what the question is about, "
            "and the timestamp in seconds (taken from the transcript segments) where the answer "
            "is covered.",
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
