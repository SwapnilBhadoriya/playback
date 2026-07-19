export interface VideoCreateResponse {
  video_id: string;
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

export interface Note {
  id: string;
  section_title: string;
  content: string;
  start_timestamp: number;
}

export interface PracticeQuestion {
  id: string;
  question_type: string;
  question_text: string;
  options: string[] | null;
  answer: string;
  explanation: string;
}
