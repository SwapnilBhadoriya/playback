import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { ProcessingStep } from "@/components/processing/ProcessingStep";
import type { ProcessingStepState } from "@/types/processing";

export interface ProcessingStatusProps {
  steps: ProcessingStepState[];
}

export function ProcessingStatus({ steps }: ProcessingStatusProps) {
  const completeCount = steps.filter((s) => s.status === "complete").length;
  const progressValue = (completeCount / steps.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex w-full max-w-xl flex-col gap-6 px-6 py-16"
    >
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground">Processing your video</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This usually takes less than a minute. Sit tight.
        </p>
      </div>

      <Progress value={progressValue} className="h-2" />

      <div className="flex flex-col gap-3">
        {steps.map((step) => (
          <ProcessingStep key={step.id} step={step} />
        ))}
      </div>
    </motion.div>
  );
}
