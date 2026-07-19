export interface VideoCreateResponse {
  video_id: string;
  status: string;
}

export interface VideoMetadataResponse {
  id: string;
  title: string | null;
  youtube_url: string;
  youtube_video_id: string | null;
  duration_seconds: number | null;
  channel_name: string | null;
  status: string;
}

export type PipelineStage =
  | "queued"
  | "extracting_audio"
  | "transcribing"
  | "generating_notes"
  | "generating_practice_sheet"
  | "done"
  | "failed";

export interface JobStatus {
  current_stage: PipelineStage;
  error_message: string | null;
}

// Raw block shape as returned by the backend -- unlike the frontend's rich
// NoteBlock (types/notes.ts), keypoints here have no `id`; the mapping layer
// synthesizes one since the LLM/backend has no reason to produce it.
export type RawNoteBlock =
  | { type: "paragraph"; text: string }
  | { type: "keypoints"; points: { label: string; value: string }[] }
  | { type: "code"; language: string; code: string };

export interface Note {
  id: string;
  section_title: string;
  blocks: RawNoteBlock[] | null;
  start_timestamp: number;
}

export interface PracticeQuestion {
  id: string;
  question_type: string;
  question_text: string;
  options: string[] | null;
  answer: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard" | null;
  marks: number | null;
  topic_tags: string[] | null;
  timestamp_seconds: number | null;
}
