import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useVideoStatus } from "../hooks/useVideoStatus";
import { getVideoNotes, getPracticeSheet } from "../api/videos";
import { StatusBanner } from "../components/StatusBanner";
import { NotesList } from "../components/NotesList";
import { PracticeSheet } from "../components/PracticeSheet";

export function VideoPage() {
  const { videoId } = useParams<{ videoId: string }>();
  const statusQuery = useVideoStatus(videoId!);
  const isDone = statusQuery.data?.current_stage === "done";

  const notesQuery = useQuery({
    queryKey: ["videoNotes", videoId],
    queryFn: () => getVideoNotes(videoId!),
    enabled: isDone,
  });

  const practiceSheetQuery = useQuery({
    queryKey: ["practiceSheet", videoId],
    queryFn: () => getPracticeSheet(videoId!),
    enabled: isDone,
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Video Results</h1>

      {statusQuery.isLoading && <p className="text-sm text-slate-500">Loading status...</p>}
      {statusQuery.isError && <p className="text-sm text-red-600">Could not find this video.</p>}
      {statusQuery.data && <StatusBanner status={statusQuery.data} />}

      {isDone && (
        <>
          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">Notes</h2>
            {notesQuery.data && <NotesList notes={notesQuery.data} />}
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">Practice Sheet</h2>
            {practiceSheetQuery.data && <PracticeSheet questions={practiceSheetQuery.data} />}
          </section>
        </>
      )}
    </main>
  );
}
