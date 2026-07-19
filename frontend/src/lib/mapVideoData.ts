import type { Note, PracticeQuestion, RawNoteBlock, VideoMetadataResponse } from "@/types/video";
import type { NoteBlock, NoteSection } from "@/types/notes";
import type { PracticeQuestionRich } from "@/types/questions";
import type { TimelineChapter } from "@/types/timeline";
import type { VideoMetadata } from "@/types/videoMeta";

export function toVideoMetadata(res: VideoMetadataResponse): VideoMetadata {
  return {
    id: res.id,
    title: res.title ?? "Untitled video",
    youtubeId: res.youtube_video_id ?? "",
    thumbnailUrl: res.youtube_video_id
      ? `https://img.youtube.com/vi/${res.youtube_video_id}/hqdefault.jpg`
      : "",
    durationSeconds: res.duration_seconds ?? 0,
    channelName: res.channel_name ?? undefined,
  };
}

function toNoteBlock(block: RawNoteBlock, sectionId: string, blockIdx: number): NoteBlock {
  if (block.type === "keypoints") {
    return {
      type: "keypoints",
      points: block.points.map((point, pointIdx) => ({
        id: `${sectionId}-b${blockIdx}-p${pointIdx}`,
        label: point.label,
        value: point.value,
      })),
    };
  }
  return block;
}

export function toNoteSections(notes: Note[]): NoteSection[] {
  return notes.map((note) => ({
    id: note.id,
    title: note.section_title,
    startTimestamp: note.start_timestamp,
    blocks: (note.blocks ?? []).map((block, idx) => toNoteBlock(block, note.id, idx)),
  }));
}

export function toPracticeQuestions(questions: PracticeQuestion[]): PracticeQuestionRich[] {
  return questions.map((q) => ({
    id: q.id,
    questionType: q.question_type,
    questionText: q.question_text,
    options: q.options,
    answer: q.answer,
    explanation: q.explanation,
    marks: q.marks ?? 1,
    difficulty: q.difficulty ?? "medium",
    topicTags: q.topic_tags ?? [],
    timestampSeconds: q.timestamp_seconds ?? 0,
  }));
}

export function toTimelineChapters(sections: NoteSection[], durationSeconds: number): TimelineChapter[] {
  return sections.map((section, idx) => {
    const nextStart = sections[idx + 1]?.startTimestamp ?? durationSeconds;
    const firstParagraph = section.blocks.find((b) => b.type === "paragraph");
    return {
      id: section.id,
      title: section.title,
      startSeconds: section.startTimestamp,
      endSeconds: Math.max(nextStart, section.startTimestamp),
      summary: firstParagraph?.type === "paragraph" ? firstParagraph.text : undefined,
    };
  });
}
