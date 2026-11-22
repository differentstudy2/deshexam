import { useCallback, useEffect, useMemo, useState } from "react";
import type { StudioStage } from "./types";

export function formatStudioTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * Studio player state — one hook, no UI.
 * Timer runs only while question slides are on screen.
 * Each question is scored once, the first time an option is picked.
 */
export function useStudioPlayer(total: number) {
  const [stage, setStage] = useState<StudioStage>("launch");
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<
    Record<number, { key: string; correct: boolean }>
  >({});
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (stage !== "questions") return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [stage]);

  const answered = useMemo(() => Object.keys(answers).length, [answers]);
  const correct = useMemo(
    () => Object.values(answers).filter((a) => a.correct).length,
    [answers],
  );
  const wrong = answered - correct;
  const skipped = total - answered;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  const start = useCallback(() => setStage("questions"), []);

  const pick = useCallback(
    (qIndex: number, key: string, isCorrect: boolean) => {
      setSelected(key);
      setAnswers((prev) =>
        prev[qIndex] ? prev : { ...prev, [qIndex]: { key, correct: isCorrect } },
      );
    },
    [],
  );

  const next = useCallback(() => {
    setSelected(null);
    if (index + 1 >= total) {
      setStage("end");
      return;
    }
    setIndex(index + 1);
  }, [index, total]);

  const prev = useCallback(() => {
    setSelected(null);
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  // Jump from the question palette. Answers are kept per question, so a
  // jumped-to question shows its recorded answer (or a fresh state).
  const goTo = useCallback(
    (i: number) => {
      setSelected(null);
      setIndex(Math.max(0, Math.min(total - 1, i)));
    },
    [total],
  );

  // Retry the current question: clear its recorded answer so the
  // student can answer it again (the new pick scores again).
  const retryCurrent = useCallback(() => {
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
    setSelected(null);
  }, [index]);

  const retake = useCallback(() => {
    setAnswers({});
    setSelected(null);
    setIndex(0);
    setElapsed(0);
    setStage("launch");
  }, []);

  return {
    stage,
    index,
    selected,
    answers,
    elapsed,
    answered,
    correct,
    wrong,
    skipped,
    accuracy,
    start,
    pick,
    next,
    prev,
    goTo,
    retryCurrent,
    retake,
  };
}
