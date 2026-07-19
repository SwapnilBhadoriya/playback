import { motion } from "framer-motion";
import { Clock, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatTimestamp } from "@/lib/format";
import type { PracticeQuestionRich } from "@/types/questions";

export interface QuestionCardProps {
  question: PracticeQuestionRich;
  onSeek: (seconds: number) => void;
}

const DIFFICULTY_STYLES: Record<PracticeQuestionRich["difficulty"], string> = {
  easy: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  medium: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  hard: "bg-rose-500/15 text-rose-500 border-rose-500/30",
};

export function QuestionCard({ question, onSeek }: QuestionCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
    >
      <div className="flex items-center justify-between">
        <Badge variant="outline" className={cn("capitalize", DIFFICULTY_STYLES[question.difficulty])}>
          {question.difficulty}
        </Badge>
        <Badge variant="secondary">{question.marks} Marks</Badge>
      </div>

      <p className="text-sm font-medium text-foreground">{question.questionText}</p>

      <div className="flex flex-wrap gap-1.5">
        {question.topicTags.map((tag) => (
          <Badge key={tag} variant="outline" className="text-[10px] font-normal text-muted-foreground">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="size-3.5" />
          {formatTimestamp(question.timestampSeconds)}
        </span>
      </div>

      <Button
        variant="secondary"
        className="w-full gap-2"
        onClick={() => onSeek(question.timestampSeconds)}
      >
        <Play className="size-3.5" />
        Jump to Video
      </Button>
    </motion.div>
  );
}
