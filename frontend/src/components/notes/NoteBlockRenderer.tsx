import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { KeyPointCard } from "@/components/notes/KeyPointCard";
import type { NoteBlock } from "@/types/notes";

export function NoteBlockRenderer({ block }: { block: NoteBlock }) {
  if (block.type === "paragraph") {
    return (
      <div className="space-y-2 text-sm leading-relaxed text-foreground [&_code]:rounded [&_code]:bg-secondary [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&_code]:text-primary [&_li]:ml-4 [&_li]:list-decimal [&_strong]:font-semibold [&_strong]:text-foreground">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.text}</ReactMarkdown>
      </div>
    );
  }

  if (block.type === "keypoints") {
    return (
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {block.points.map((point) => (
          <KeyPointCard key={point.id} point={point} />
        ))}
      </div>
    );
  }

  return (
    <div className="relative rounded-lg border border-border bg-secondary/60 p-3">
      <pre className="overflow-x-auto text-xs text-foreground">
        <code>{block.code}</code>
      </pre>
    </div>
  );
}
