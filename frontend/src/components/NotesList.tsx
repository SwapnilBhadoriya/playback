import type { Note } from "../types/video";

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function NotesList({ notes }: { notes: Note[] }) {
  if (notes.length === 0) {
    return <p className="text-sm text-slate-500">No notes yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {notes.map((note) => (
        <li key={note.id} className="rounded-md border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">{note.section_title}</h3>
            <span className="shrink-0 text-xs text-slate-500">{formatTimestamp(note.start_timestamp)}</span>
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{note.content}</p>
        </li>
      ))}
    </ul>
  );
}
