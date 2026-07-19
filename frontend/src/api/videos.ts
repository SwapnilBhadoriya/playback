import { apiFetch } from "./client";
import type { JobStatus, Note, PracticeQuestion, VideoCreateResponse } from "../types/video";

export function createVideo(youtubeUrl: string): Promise<VideoCreateResponse> {
  return apiFetch<VideoCreateResponse>("/videos", {
    method: "POST",
    body: JSON.stringify({ youtube_url: youtubeUrl }),
  });
}

export function getVideoStatus(videoId: string): Promise<JobStatus> {
  return apiFetch<JobStatus>(`/videos/${videoId}/status`);
}

export function getVideoNotes(videoId: string): Promise<Note[]> {
  return apiFetch<Note[]>(`/videos/${videoId}/notes`);
}

export function getPracticeSheet(videoId: string): Promise<PracticeQuestion[]> {
  return apiFetch<PracticeQuestion[]>(`/videos/${videoId}/practice-sheet`);
}
