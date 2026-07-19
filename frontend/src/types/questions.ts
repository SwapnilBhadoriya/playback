export type Difficulty = "easy" | "medium" | "hard";

export interface PracticeQuestionRich {
  id: string;
  questionType: string;
  questionText: string;
  options: string[] | null;
  answer: string;
  explanation: string;
  marks: number;
  difficulty: Difficulty;
  // Dropped: an LLM self-reporting a calibrated confidence score isn't something
  // models do reliably, so the backend doesn't produce this. Kept optional rather
  // than removed in case a real confidence signal is added later.
  confidenceScore?: number;
  topicTags: string[];
  timestampSeconds: number;
}
