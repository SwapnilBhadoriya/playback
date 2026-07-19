import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { createVideo } from "@/api/videos";
import { ApiError } from "@/api/client";
import { UrlInputBar } from "@/components/home/UrlInputBar";

export function HomePage() {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: createVideo,
    onSuccess: (data) => {
      navigate(`/videos/${data.video_id}`);
    },
  });

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-6 px-6 py-16">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <Sparkles className="size-6" />
      </span>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Playback</h1>
      <p className="max-w-xl text-center text-sm text-muted-foreground">
        Paste a YouTube URL to generate structured notes, a searchable timeline, and practice
        questions from the video.
      </p>
      <UrlInputBar onSubmit={(url) => mutation.mutate(url)} isSubmitting={mutation.isPending} />
      {mutation.isError && (
        <p className="text-sm text-destructive">
          {mutation.error instanceof ApiError ? mutation.error.message : "Something went wrong. Please try again."}
        </p>
      )}
    </main>
  );
}
