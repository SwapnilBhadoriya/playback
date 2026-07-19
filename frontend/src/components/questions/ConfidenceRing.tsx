import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface ConfidenceRingProps {
  score: number;
}

export function ConfidenceRing({ score }: ConfidenceRingProps) {
  const radius = 9;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const colorClass =
    score >= 85 ? "text-emerald-500" : score >= 65 ? "text-amber-500" : "text-destructive";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="relative inline-flex size-6 items-center justify-center">
          <svg viewBox="0 0 24 24" className="size-6 -rotate-90">
            <circle cx="12" cy="12" r={radius} className="fill-none stroke-border" strokeWidth="2.5" />
            <circle
              cx="12"
              cy="12"
              r={radius}
              className={cn("fill-none transition-all", colorClass)}
              stroke="currentColor"
              strokeWidth="2.5"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
        </span>
      </TooltipTrigger>
      <TooltipContent>Confidence {score}%</TooltipContent>
    </Tooltip>
  );
}
