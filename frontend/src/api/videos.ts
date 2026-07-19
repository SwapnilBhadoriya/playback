import { apiFetch, BASE_URL } from "./client";
import type {
  JobStatus,
  Note,
  PracticeQuestion,
  VideoCreateResponse,
  VideoMetadataResponse,
} from "../types/video";

export function listVideos(): Promise<VideoMetadataResponse[]> {
  return apiFetch<VideoMetadataResponse[]>("/videos");
}

export function createVideo(youtubeUrl: string): Promise<VideoCreateResponse> {
  return apiFetch<VideoCreateResponse>("/videos", {
    method: "POST",
    body: JSON.stringify({ youtube_url: youtubeUrl }),
  });
}

export function getVideoMetadata(videoId: string): Promise<VideoMetadataResponse> {
  return apiFetch<VideoMetadataResponse>(`/videos/${videoId}`);
}

export function getVideoStatus(videoId: string): Promise<JobStatus> {
  return apiFetch<JobStatus>(`/videos/${videoId}/status`);
}

export function videoStatusStreamUrl(videoId: string): string {
  return `${BASE_URL}/videos/${videoId}/status/stream`;
}

export function getVideoNotes(videoId: string): Promise<Note[]> {
  return apiFetch<Note[]>(`/videos/${videoId}/notes`);
}

export function getPracticeSheet(videoId: string): Promise<PracticeQuestion[]> {
  return apiFetch<PracticeQuestion[]>(`/videos/${videoId}/practice-sheet`);
}
