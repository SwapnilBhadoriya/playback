import type { PipelineStage } from "@/types/video";
import type { ProcessingStepId, ProcessingStepState } from "@/types/processing";

const STEP_ORDER: { id: ProcessingStepId; label: string; stage: PipelineStage }[] = [
  { id: "extracting_audio", label: "Extracting audio", stage: "extracting_audio" },
  { id: "transcribing", label: "Transcribing", stage: "transcribing" },
  { id: "generating_notes", label: "Generating notes", stage: "generating_notes" },
  { id: "generating_questions", label: "Generating questions", stage: "generating_practice_sheet" },
];

export function mapStageToProcessingSteps(currentStage: PipelineStage): ProcessingStepState[] {
  if (currentStage === "queued") {
    return STEP_ORDER.map(({ id, label }) => ({ id, label, status: "pending" }));
  }

  if (currentStage === "done") {
    return STEP_ORDER.map(({ id, label }) => ({ id, label, status: "complete" }));
  }

  if (currentStage === "failed") {
    // We don't yet track *which* stage failed (the backend has no per-stage failure
    // marker), so the first non-complete-looking stage is shown as the error -- good
    // enough until Phase 6 adds real failure tracking.
    return STEP_ORDER.map(({ id, label }, idx) => ({
      id,
      label,
      status: idx === 0 ? "error" : "pending",
    }));
  }

  const currentIdx = STEP_ORDER.findIndex((step) => step.stage === currentStage);
  return STEP_ORDER.map(({ id, label }, idx) => ({
    id,
    label,
    status: idx < currentIdx ? "complete" : idx === currentIdx ? "active" : "pending",
  }));
}
