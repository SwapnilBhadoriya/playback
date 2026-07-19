export interface NoteKeyPoint {
  id: string;
  label: string;
  value: string;
}

export type NoteBlock =
  | { type: "paragraph"; text: string }
  | { type: "keypoints"; points: NoteKeyPoint[] }
  | { type: "code"; language: string; code: string };

export interface NoteSection {
  id: string;
  title: string;
  startTimestamp: number;
  blocks: NoteBlock[];
}
