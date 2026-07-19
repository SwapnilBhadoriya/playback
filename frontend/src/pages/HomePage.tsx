import { VideoSubmitForm } from "../components/VideoSubmitForm";

export function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-6 px-6 py-16">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Playback</h1>
      <p className="max-w-xl text-center text-sm text-slate-600 dark:text-slate-400">
        Paste a YouTube URL to generate structured notes and a practice quiz from the video.
      </p>
      <VideoSubmitForm />
    </main>
  );
}
