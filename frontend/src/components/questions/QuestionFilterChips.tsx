import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Difficulty } from "@/types/questions";

export type FilterValue = "all" | Difficulty;

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export interface QuestionFilterChipsProps {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
}

export function QuestionFilterChips({ value, onChange }: QuestionFilterChipsProps) {
  return (
    <div className="flex items-center gap-1.5">
      {FILTERS.map((filter) => {
        const isActive = filter.value === value;
        return (
          <button
            key={filter.value}
            type="button"
            onClick={() => onChange(filter.value)}
            className={cn(
              "relative rounded-full px-3 py-1 text-xs font-medium transition-colors",
              isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {isActive && (
              <motion.span
                layoutId="active-filter-pill"
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
              />
            )}
            <span className="relative z-10">{filter.label}</span>
          </button>
        );
      })}
    </div>
  );
}
