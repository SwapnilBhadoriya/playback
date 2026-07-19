import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UrlInputBar } from "@/components/home/UrlInputBar";
import { ProcessingStatus } from "@/components/processing/ProcessingStatus";
import { VideoPlayer, type VideoPlayerHandle } from "@/components/player/VideoPlayer";
import { Timeline } from "@/components/timeline/Timeline";
import { NotesPanel } from "@/components/notes/NotesPanel";
import { QuestionsPanel } from "@/components/questions/QuestionsPanel";
import {
  mockNoteSections,
  mockProcessingSteps,
  mockQuestions,
  mockTimeline,
  mockVideoMetadata,
} from "@/lib/mockData";
import type { ProcessingStepState, VideoPageState } from "@/types/processing";

const STEP_DURATION_MS = 1200;

export function VideoPage() {
  const [pageState, setPageState] = useState<VideoPageState>("idle");
  const [steps, setSteps] = useState<ProcessingStepState[]>(mockProcessingSteps);
  const [activeTimestamp, setActiveTimestamp] = useState<number | null>(null);
  const videoPlayerRef = useRef<VideoPlayerHandle>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const handleSeek = useCallback((seconds: number) => {
    setActiveTimestamp(seconds);
    videoPlayerRef.current?.seekTo(seconds);
    videoPlayerRef.current?.play();
  }, []);

  function runProcessingSimulation() {
    setPageState("processing");
    setSteps(mockProcessingSteps.map((step) => ({ ...step, status: "pending" })));

    mockProcessingSteps.forEach((_, index) => {
      const activateTimeout = setTimeout(() => {
        setSteps((prev) =>
          prev.map((step, i) => (i === index ? { ...step, status: "active" } : step)),
        );
      }, index * STEP_DURATION_MS);

      const completeTimeout = setTimeout(
        () => {
          setSteps((prev) =>
            prev.map((step, i) => (i === index ? { ...step, status: "complete" } : step)),
          );
          if (index === mockProcessingSteps.length - 1) {
            setPageState("complete");
          }
        },
        index * STEP_DURATION_MS + STEP_DURATION_MS,
      );

      timeoutsRef.current.push(activateTimeout, completeTimeout);
    });
  }

  if (pageState === "idle") {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-6 px-6 py-16">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Generate notes for a video</h1>
        <p className="max-w-xl text-center text-sm text-muted-foreground">
          Paste a YouTube URL below and we'll generate structured notes, a searchable timeline,
          and practice questions.
        </p>
        <UrlInputBar onSubmit={() => runProcessingSimulation()} />
      </main>
    );
  }

  if (pageState === "processing") {
    return <ProcessingStatus steps={steps} />;
  }

  return (
    <main className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-6 sm:px-6">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
        <CheckCircle2 className="size-6 shrink-0 text-emerald-500" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Processing Complete!</p>
          <p className="text-xs text-muted-foreground">Notes and questions are ready.</p>
        </div>
      </div>

      <h1 className="text-lg font-semibold text-foreground">{mockVideoMetadata.title}</h1>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <VideoPlayer ref={videoPlayerRef} youtubeId={mockVideoMetadata.youtubeId} />
          <div className="hidden lg:block">
            <Timeline chapters={mockTimeline} activeTimestamp={activeTimestamp} onSeek={handleSeek} />
          </div>
        </div>

        <div className="hidden lg:contents">
          <NotesPanel sections={mockNoteSections} onSeek={handleSeek} />
          <QuestionsPanel questions={mockQuestions} onSeek={handleSeek} />
        </div>

        <Tabs defaultValue="timeline" className="lg:hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
          </TabsList>
          <TabsContent value="timeline">
            <Timeline chapters={mockTimeline} activeTimestamp={activeTimestamp} onSeek={handleSeek} />
          </TabsContent>
          <TabsContent value="notes">
            <NotesPanel sections={mockNoteSections} onSeek={handleSeek} />
          </TabsContent>
          <TabsContent value="questions">
            <QuestionsPanel questions={mockQuestions} onSeek={handleSeek} />
          </TabsContent>
        </Tabs>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="self-start text-xs text-muted-foreground"
        onClick={() => setPageState("idle")}
      >
        Start over
      </Button>
    </main>
  );
}
