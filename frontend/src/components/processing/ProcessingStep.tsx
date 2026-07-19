import { motion } from "framer-motion";
import { Check, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import type { ProcessingStepState } from "@/types/processing";

export interface ProcessingStepProps {
  step: ProcessingStepState;
}

export function ProcessingStep({ step }: ProcessingStepProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3 transition-colors",
        step.status === "active" && "border-primary/50 bg-primary/5",
      )}
    >
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold",
          step.status === "pending" && "border-border text-muted-foreground",
          step.status === "active" && "border-primary text-primary",
          step.status === "complete" && "border-primary bg-primary text-primary-foreground",
          step.status === "error" && "border-destructive bg-destructive text-destructive-foreground",
        )}
      >
        {step.status === "active" && <Loader2 className="size-4 animate-spin" />}
        {step.status === "complete" && <Check className="size-4" />}
        {step.status === "error" && <X className="size-4" />}
      </span>
      <div className="flex-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "text-sm font-medium",
              step.status === "pending" ? "text-muted-foreground" : "text-foreground",
            )}
          >
            {step.label}
          </span>
          {step.status === "active" && step.progressPercent !== undefined && (
            <span className="text-xs font-semibold tabular-nums text-primary">
              {step.progressPercent}%
            </span>
          )}
        </div>
        {step.status === "active" && step.progressPercent !== undefined && (
          <Progress value={step.progressPercent} className="mt-1.5 h-1" />
        )}
      </div>
    </motion.div>
  );
}
