import type { JobStatus, PipelineStage } from "../types/video";

const STAGE_LABELS: Record<PipelineStage, string> = {
  queued: "Queued",
  extracting_audio: "Extracting audio",
  transcribing: "Transcribing",
  generating_notes: "Generating notes",
  generating_practice_sheet: "Generating practice sheet",
  done: "Done",
  failed: "Failed",
};

export function StatusBanner({ status }: { status: JobStatus }) {
  const isFailed = status.current_stage === "failed";
  const isDone = status.current_stage === "done";

  return (
    <div
      className={`rounded-md border px-4 py-3 text-sm ${
        isFailed
          ? "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
          : isDone
            ? "border-green-300 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
            : "border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
      }`}
    >
      <p className="font-medium">{STAGE_LABELS[status.current_stage] ?? status.current_stage}</p>
      {status.error_message && <p className="mt-1">{status.error_message}</p>}
    </div>
  );
}
