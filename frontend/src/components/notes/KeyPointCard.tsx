import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { NoteKeyPoint } from "@/types/notes";

// Strips the wrapping <p> ReactMarkdown would otherwise add, since a keypoint
// value renders as a single inline line, not a block.
const INLINE_MARKDOWN_COMPONENTS = {
  p: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
};

export function KeyPointCard({ point }: { point: NoteKeyPoint }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/50 p-3">
      <p className="text-sm font-semibold text-foreground">{point.label}</p>
      <div className="mt-0.5 text-xs text-muted-foreground [&_code]:rounded [&_code]:bg-background [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-primary [&_strong]:font-semibold [&_strong]:text-foreground">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={INLINE_MARKDOWN_COMPONENTS}>
          {point.value}
        </ReactMarkdown>
      </div>
    </div>
  );
}
