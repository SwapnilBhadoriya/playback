import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ShikiHighlighter } from "react-shiki/web";
import { KeyPointCard } from "@/components/notes/KeyPointCard";
import { CodeHighlightBoundary } from "@/components/notes/CodeHighlightBoundary";
import type { NoteBlock } from "@/types/notes";

const CODE_THEME = { light: "github-light", dark: "github-dark" };

export function NoteBlockRenderer({ block }: { block: NoteBlock }) {
  if (block.type === "paragraph") {
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none">
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

  const plainFallback = (
    <div className="relative rounded-lg border border-border bg-secondary/60 p-3">
      <pre className="overflow-x-auto text-xs text-foreground">
        <code>{block.code}</code>
      </pre>
    </div>
  );

  return (
    <CodeHighlightBoundary fallback={plainFallback}>
      <ShikiHighlighter language={block.language} theme={CODE_THEME} defaultColor={false} className="text-xs">
        {block.code}
      </ShikiHighlighter>
    </CodeHighlightBoundary>
  );
}
