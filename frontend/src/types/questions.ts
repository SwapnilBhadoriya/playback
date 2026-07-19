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
  confidenceScore: number;
  topicTags: string[];
  timestampSeconds: number;
}
