"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { isDarkStudioTheme, studioThemeBg } from "./themes";
import { useStudioPlayer } from "./useStudioPlayer";
import LaunchScreen from "./LaunchScreen";
import QuestionSlide from "./QuestionSlide";
import EndScreen from "./EndScreen";
import type { StudioPlayerProps } from "./types";

/**
 * Studio player — the small main file. It only composes the stages:
 * launch → questions → result. State lives in useStudioPlayer,
 * each screen lives in its own file.
 */
export default function StudioPlayer({
  questions,
  test,
  theme,
  onClose,
}: StudioPlayerProps) {
  const total = questions.length;
  const p = useStudioPlayer(total);
  const dark = isDarkStudioTheme(theme);
  const q = questions[p.index];
  const { stage, next, prev } = p;

  useEffect(() => {
    if (stage !== "questions") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stage, next, prev]);

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto ${studioThemeBg(theme)} ${
        dark ? "text-white" : "text-slate-900"
      }`}
    >
      <button
        onClick={onClose}
        aria-label="বন্ধ করুন"
        className={`absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full font-black shadow-lg transition-transform hover:scale-110 ${
          dark
            ? "bg-white/10 text-white hover:bg-white/20"
            : "bg-white text-slate-700 hover:bg-slate-100"
        }`}
      >
        <X className="h-5 w-5" />
      </button>

      {stage === "launch" && (
        <LaunchScreen test={test} questionCount={total} onStart={p.start} />
      )}

      {stage === "questions" && q && (
        <QuestionSlide
          question={q}
          index={p.index}
          total={total}
          selected={p.selected}
          recordedKey={p.answers[p.index]?.key ?? null}
          dark={dark}
          elapsed={p.elapsed}
          correctCount={p.correct}
          wrongCount={p.wrong}
          onPick={(key, isCorrect) => p.pick(p.index, key, isCorrect)}
          onNext={p.next}
          onPrev={p.prev}
        />
      )}

      {stage === "end" && (
        <EndScreen
          correct={p.correct}
          wrong={p.wrong}
          skipped={p.skipped}
          total={total}
          accuracy={p.accuracy}
          totalMarks={test.totalMarks}
          onRetake={p.retake}
        />
      )}
    </div>
  );
}
