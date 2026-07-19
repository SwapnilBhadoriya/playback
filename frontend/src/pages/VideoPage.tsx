import { useCallback, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProcessingStatus } from "@/components/processing/ProcessingStatus";
import { VideoPlayer, type VideoPlayerHandle } from "@/components/player/VideoPlayer";
import { Timeline } from "@/components/timeline/Timeline";
import { NotesPanel } from "@/components/notes/NotesPanel";
import { QuestionsPanel } from "@/components/questions/QuestionsPanel";
import { useVideoStatus } from "@/hooks/useVideoStatus";
import { useVideoMetadata } from "@/hooks/useVideoMetadata";
import { useVideoNotes } from "@/hooks/useVideoNotes";
import { usePracticeSheet } from "@/hooks/usePracticeSheet";
import { mapStageToProcessingSteps } from "@/lib/mapStageToProcessingSteps";
import { toTimelineChapters } from "@/lib/mapVideoData";
import { ApiError } from "@/api/client";

export function VideoPage() {
  const { videoId = "" } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const [activeTimestamp, setActiveTimestamp] = useState<number | null>(null);
  const videoPlayerRef = useRef<VideoPlayerHandle>(null);

  const metadataQuery = useVideoMetadata(videoId);
  const statusQuery = useVideoStatus(videoId);
  const currentStage = statusQuery.data?.current_stage;
  const isDone = currentStage === "done";

  const notesQuery = useVideoNotes(videoId, isDone);
  const practiceSheetQuery = usePracticeSheet(videoId, isDone);

  const handleSeek = useCallback((seconds: number) => {
    setActiveTimestamp(seconds);
    videoPlayerRef.current?.seekTo(seconds);
    videoPlayerRef.current?.play();
  }, []);

  if (metadataQuery.isError) {
    const notFound = metadataQuery.error instanceof ApiError && metadataQuery.error.status === 404;
    return (
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 px-6 py-16">
        <h1 className="text-xl font-semibold text-foreground">
          {notFound ? "Video not found" : "Something went wrong"}
        </h1>
        <p className="max-w-md text-center text-sm text-muted-foreground">
          {notFound
            ? "This video doesn't exist, or the link is incorrect."
            : "We couldn't load this video. Please try again."}
        </p>
        <Button onClick={() => navigate("/")}>Back to home</Button>
      </main>
    );
  }

  if (metadataQuery.isLoading || statusQuery.isLoading) {
    return (
      <main className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-16">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="aspect-video w-full" />
        <Skeleton className="h-32 w-full" />
      </main>
    );
  }

  if (currentStage === "failed") {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 px-6 py-16">
        <h1 className="text-xl font-semibold text-foreground">Processing failed</h1>
        <p className="max-w-md text-center text-sm text-muted-foreground">
          {statusQuery.data?.error_message ?? "Something went wrong while processing this video."}
        </p>
        <Button onClick={() => navigate("/")}>Try another video</Button>
      </main>
    );
  }

  if (!isDone || !currentStage) {
    return (
      <ProcessingStatus
        steps={mapStageToProcessingSteps(currentStage ?? "queued", statusQuery.data?.progress_percent)}
      />
    );
  }

  const metadata = metadataQuery.data!;
  const notes = notesQuery.data ?? [];
  const questions = practiceSheetQuery.data ?? [];
  const timelineChapters = toTimelineChapters(notes, metadata.durationSeconds);

  return (
    <main className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-6 sm:px-6">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
        <CheckCircle2 className="size-6 shrink-0 text-emerald-500" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Processing Complete!</p>
          <p className="text-xs text-muted-foreground">Notes and questions are ready.</p>
        </div>
      </div>

      <h1 className="text-lg font-semibold text-foreground">{metadata.title}</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <VideoPlayer ref={videoPlayerRef} youtubeId={metadata.youtubeId} onTimeUpdate={setActiveTimestamp} />
          <Timeline chapters={timelineChapters} activeTimestamp={activeTimestamp} onSeek={handleSeek} />
        </div>

        <Tabs defaultValue="notes">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
          </TabsList>
          <TabsContent value="notes">
            <NotesPanel sections={notes} onSeek={handleSeek} />
          </TabsContent>
          <TabsContent value="questions">
            <QuestionsPanel questions={questions} onSeek={handleSeek} />
          </TabsContent>
        </Tabs>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="self-start text-xs text-muted-foreground"
        onClick={() => navigate("/")}
      >
        Start over
      </Button>
    </main>
  );
}
