import { useMemo, useState } from "react";
import { ArrowRight, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { QuestionFilterChips, type FilterValue } from "@/components/questions/QuestionFilterChips";
import { QuestionCard } from "@/components/questions/QuestionCard";
import { QuestionsDialog } from "@/components/questions/QuestionsDialog";
import type { PracticeQuestionRich } from "@/types/questions";

export interface QuestionsPanelProps {
  questions: PracticeQuestionRich[];
  onSeek: (seconds: number) => void;
}

export function QuestionsPanel({ questions, onSeek }: QuestionsPanelProps) {
  const [filter, setFilter] = useState<FilterValue>("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredQuestions = useMemo(() => {
    if (filter === "all") return questions;
    return questions.filter((q) => q.difficulty === filter);
  }, [questions, filter]);

  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <HelpCircle className="size-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Related Questions ({questions.length})
          </h3>
        </div>
      </div>

      <QuestionFilterChips value={filter} onChange={setFilter} />

      <ScrollArea className="h-[calc(100vh-24rem)] min-h-72 pr-2">
        <div className="flex flex-col gap-3">
          {filteredQuestions.map((question) => (
            <QuestionCard key={question.id} question={question} onSeek={onSeek} />
          ))}
          {filteredQuestions.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No questions in this difficulty.
            </p>
          )}
        </div>
      </ScrollArea>

      <Button variant="outline" className="w-full gap-2" onClick={() => setDialogOpen(true)}>
        View All Questions
        <ArrowRight className="size-4" />
      </Button>

      <QuestionsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        questions={questions}
        onSeek={onSeek}
      />
    </div>
  );
}
