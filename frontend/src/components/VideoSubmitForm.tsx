import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createVideo } from "../api/videos";
import { ApiError } from "../api/client";

export function VideoSubmitForm() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: createVideo,
    onSuccess: (data) => {
      navigate(`/videos/${data.video_id}`);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate(youtubeUrl);
      }}
      className="flex flex-col gap-3 w-full max-w-xl"
    >
      <label htmlFor="youtube-url" className="text-sm font-medium text-slate-700 dark:text-slate-300">
        YouTube URL
      </label>
      <div className="flex gap-2">
        <input
          id="youtube-url"
          type="text"
          required
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="flex-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {mutation.isPending ? "Submitting..." : "Generate"}
        </button>
      </div>
      {mutation.isError && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {mutation.error instanceof ApiError ? mutation.error.message : "Something went wrong. Please try again."}
        </p>
      )}
    </form>
  );
}
