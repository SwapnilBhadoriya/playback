import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { QuestionCard } from "@/components/questions/QuestionCard";
import type { PracticeQuestionRich } from "@/types/questions";

export interface QuestionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questions: PracticeQuestionRich[];
  onSeek: (seconds: number) => void;
}

export function QuestionsDialog({ open, onOpenChange, questions, onSeek }: QuestionsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>All Questions ({questions.length})</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[70vh] pr-2">
          <div className="flex flex-col gap-3">
            {questions.map((question) => (
              <QuestionCard key={question.id} question={question} onSeek={onSeek} />
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
