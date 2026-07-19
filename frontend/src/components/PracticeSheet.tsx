import { useState } from "react";
import type { PracticeQuestion } from "../types/video";

function Question({ question }: { question: PracticeQuestion }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <li className="rounded-md border border-slate-200 dark:border-slate-800 p-4">
      <p className="font-medium text-slate-900 dark:text-slate-100">{question.question_text}</p>
      {question.options && (
        <ul className="mt-2 flex flex-col gap-1">
          {question.options.map((option) => (
            <li
              key={option}
              className={`rounded px-2 py-1 text-sm ${
                revealed && option === question.answer
                  ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={() => setRevealed((prev) => !prev)}
        className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
      >
        {revealed ? "Hide answer" : "Reveal answer"}
      </button>
      {revealed && (
        <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          <p>
            <span className="font-medium text-slate-900 dark:text-slate-100">Answer: </span>
            {question.answer}
          </p>
          <p className="mt-1">{question.explanation}</p>
        </div>
      )}
    </li>
  );
}

export function PracticeSheet({ questions }: { questions: PracticeQuestion[] }) {
  if (questions.length === 0) {
    return <p className="text-sm text-slate-500">No practice questions yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {questions.map((question) => (
        <Question key={question.id} question={question} />
      ))}
    </ul>
  );
}
