import { ArrowLeft, ArrowRight, Check, Clock, X } from "lucide-react";
import { toBn } from "@/lib/wb-board";
import { normalizeOptions, isCorrectOption, optionLetter } from "./questions";
import { formatStudioTime } from "./useStudioPlayer";

const LETTER_BG = [
  "bg-[#4285F4]",
  "bg-[#34A853]",
  "bg-[#F9AB00]",
  "bg-[#EA4335]",
  "bg-[#9C27B0]",
];

/**
 * One question slide. Unanswered options stay readable on every theme:
 * light tint on light themes, white-on-translucent on dark themes.
 * Picking once reveals the correct answer and scores the question.
 */
export default function QuestionSlide({
  question,
  index,
  total,
  selected,
  recordedKey,
  dark,
  elapsed,
  correctCount,
  wrongCount,
  onPick,
  onNext,
  onPrev,
}: {
  question: any;
  index: number;
  total: number;
  selected: string | null;
  recordedKey: string | null;
  dark: boolean;
  elapsed: number;
  correctCount: number;
  wrongCount: number;
  onPick: (key: string, isCorrect: boolean) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const opts = normalizeOptions(question);
  const revealed = selected !== null || recordedKey !== null;
  const activeKey = selected ?? recordedKey;

  return (
    <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col justify-center px-4 py-8">
      {/* Top bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span
          className={`rounded-full px-4 py-1.5 text-sm font-black ${
            dark ? "bg-white/10 text-white" : "bg-white text-slate-800 shadow-sm"
          }`}
        >
          প্রশ্ন {toBn(index + 1)} / {toBn(total)}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-black ${
            dark ? "bg-white/10 text-white" : "bg-white text-slate-800 shadow-sm"
          }`}
        >
          <Clock className="h-4 w-4" />
          {toBn(formatStudioTime(elapsed))}
        </span>
        <span
          className={`rounded-full px-4 py-1.5 text-sm font-black ${
            dark ? "bg-white/10 text-white" : "bg-white text-slate-800 shadow-sm"
          }`}
        >
          ✓ {toBn(correctCount)} | ✗ {toBn(wrongCount)}
        </span>
      </div>

      {/* Question card */}
      <div className="rounded-3xl border-t-4 border-t-blue-500 bg-white p-6 shadow-xl sm:p-8">
        <p className="text-xl font-black leading-relaxed text-slate-900 sm:text-2xl">
          {question?.questionText}
        </p>
      </div>

      {/* Options */}
      <div className="mt-5 flex flex-col gap-3">
        {opts.map((opt, oIdx) => {
          const correct = isCorrectOption(question, opt.key);
          const isActive = activeKey === opt.key;
          let rowClass = dark
            ? "border-white/15 bg-white/10 text-white"
            : "border-gray-200 bg-white text-slate-800 shadow-sm";
          let letterClass = `${LETTER_BG[oIdx % LETTER_BG.length]} text-white`;
          let mark = null;
          if (revealed) {
            if (correct) {
              rowClass =
                "border-[#34A853] bg-[#f0fdf4] text-slate-900 ring-2 ring-[#34A853]/30";
              letterClass = "bg-[#34A853] text-white";
              mark = <Check className="h-5 w-5 shrink-0 text-[#34A853]" />;
            } else if (isActive) {
              rowClass =
                "border-[#EA4335] bg-[#fce8e6] text-slate-900 ring-2 ring-[#EA4335]/30";
              letterClass = "bg-[#EA4335] text-white";
              mark = <X className="h-5 w-5 shrink-0 text-[#EA4335]" />;
            }
          }
          return (
            <button
              key={opt.key}
              disabled={revealed}
              onClick={() => onPick(opt.key, correct)}
              className={`flex items-center gap-4 rounded-2xl border px-4 py-3 text-left transition-all duration-150 ${rowClass} ${
                revealed ? "" : "hover:scale-[1.01] active:scale-[0.99]"
              }`}
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-black ${letterClass}`}
              >
                {optionLetter(oIdx, opt.key)}
              </span>
              <span className="flex-1 text-base font-bold leading-snug sm:text-lg">
                {opt.text}
              </span>
              {mark}
            </button>
          );
        })}
      </div>

      {/* Nav */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          onClick={onPrev}
          disabled={index === 0}
          className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-black transition-colors disabled:opacity-40 ${
            dark
              ? "border border-white/20 text-white hover:bg-white/10"
              : "border border-gray-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
          }`}
        >
          <ArrowLeft className="h-4 w-4" />
          আগেরটি
        </button>
        <button
          onClick={onNext}
          disabled={!revealed}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 font-black text-white shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
        >
          {index + 1 >= total ? "ফলাফল দেখুন" : "পরের প্রশ্ন"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
