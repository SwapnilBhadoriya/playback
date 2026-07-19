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
  // Only meaningful while status is "active", and only populated by the backend
  // for extracting_audio/transcribing (the two stages with a natural progress
  // signal). Absent/undefined elsewhere.
  progressPercent?: number;
}

// Reconciled with PipelineStage (src/types/video.ts) in lib/mapStageToProcessingSteps.ts.
// "error" corresponds to the backend's "failed" stage -- not reachable yet (failure
// handling isn't implemented in the pipeline), but handled defensively rather than
// left to hang indefinitely if it ever occurs.
export type VideoPageState = "loading" | "processing" | "complete" | "error" | "not-found";
