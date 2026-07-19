export type ProcessingStepId =
  | "extracting_audio"
  | "transcribing"
  | "generating_notes"
  | "generating_questions";

export type ProcessingStepStatus = "pending" | "active" | "complete" | "error";

export interface ProcessingStepState {
  id: ProcessingStepId;
  label: string;
  status: ProcessingStepStatus;
}

// TODO: reconcile with PipelineStage in src/types/video.ts when wiring the real backend
export type VideoPageState = "idle" | "processing" | "complete";
