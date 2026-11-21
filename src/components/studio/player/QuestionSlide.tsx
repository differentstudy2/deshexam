"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Maximize,
  Minimize,
  X,
} from "lucide-react";
import { toBn } from "@/lib/wb-board";
import { normalizeOptions, isCorrectOption, optionLetter } from "./questions";
import { formatStudioTime } from "./useStudioPlayer";
import QuestionPalette from "./QuestionPalette";
import type { StudioTest } from "./types";

const LETTER_BG = [
  "bg-[#4285F4]",
  "bg-[#34A853]",
  "bg-[#F9AB00]",
  "bg-[#EA4335]",
  "bg-[#9C27B0]",
];

function formatRemaining(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(sec).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/**
 * One question slide — dark navy + gold studio look.
 * White question/option cards (readable on every theme), 2-column
 * options on desktop, live explanation panel when the question has
 * one, question palette on the right, and a bottom toolbar with
 * Prev / Next / Record / Fullscreen.
 * Marks pill is shown only when totalMarks divides evenly by the
 * question count (a derivation from live fields, never invented).
 * The negative pill comes from the test's live negativeMarking.
 * No top scorers, live chat or presenter video: there is no real
 * data for them in the studio player.
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
  test,
  answers,
  onPick,
  onNext,
  onPrev,
  onJump,
  recording,
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
  test: StudioTest;
  answers: Record<number, { key: string; correct: boolean }>;
  onPick: (key: string, isCorrect: boolean) => void;
  onNext: () => void;
  onPrev: () => void;
  onJump: (i: number) => void;
  recording?: ReactNode;
}) {
  const opts = normalizeOptions(question);
  const revealed = selected !== null || recordedKey !== null;
  const activeKey = selected ?? recordedKey;
  const answeredCount = Object.keys(answers).length;

  const marksPerQ =
    test.totalMarks && total > 0 && test.totalMarks % total === 0
      ? test.totalMarks / total
      : null;

  const [isFs, setIsFs] = useState(false);
  useEffect(() => {
    const onFs = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);
  const toggleFs = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.();
  };

  const chromePill = dark
    ? "border-white/10 bg-white/10 text-white"
    : "border-gray-200 bg-white text-slate-700 shadow-sm";

  return (
    <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col px-3 py-4 sm:px-5">
      {/* Top bar — pr-14 clears the absolute close (X) button top-right */}
      <div className="mb-4 flex flex-wrap items-center gap-2 pr-14">
        <img src="/launch/logo.png" alt="DeshExam" className="h-8 w-auto" />
        <span
          className={`min-w-0 flex-1 truncate text-sm font-black sm:text-base ${
            dark ? "text-white" : "text-slate-900"
          }`}
        >
          {test.title}
        </span>
        <span className="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-black text-white sm:text-sm">
          প্রশ্ন {toBn(index + 1)} / {toBn(total)}
        </span>
        {marksPerQ !== null ? (
          <span className="rounded-full bg-green-600 px-3 py-1.5 text-xs font-black text-white sm:text-sm">
            ★ +{toBn(marksPerQ)} নম্বর
          </span>
        ) : null}
        {test.negativeMarking !== undefined &&
        test.negativeMarking !== null ? (
          <span
            className={`rounded-full px-3 py-1.5 text-xs font-black sm:text-sm ${
              test.negativeMarking > 0
                ? "bg-red-600 text-white"
                : "bg-slate-500 text-white"
            }`}
          >
            {test.negativeMarking > 0
              ? `−${toBn(test.negativeMarking)} নেগেটিভ`
              : "নেগেটিভ নেই"}
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1.5 text-xs font-black text-slate-900 sm:text-sm">
          <Clock className="h-4 w-4" />
          {test.durationMin
            ? `সময় বাকি ${toBn(formatRemaining(test.durationMin * 60 - elapsed))}`
            : toBn(formatStudioTime(elapsed))}
        </span>
        <span
          className={`rounded-full border px-3 py-1.5 text-xs font-black sm:text-sm ${chromePill}`}
        >
          ✓ {toBn(correctCount)} | ✗ {toBn(wrongCount)}
        </span>
      </div>

      {/* Main grid */}
      <div className="flex flex-1 flex-col gap-4 lg:flex-row">
        <div className="min-w-0 flex-1">
          {/* Question card */}
          <div className="rounded-3xl border-t-4 border-amber-400 bg-white p-5 shadow-xl sm:p-7">
            <p className="text-xl font-black leading-relaxed text-slate-900 sm:text-2xl">
              {question?.questionText}
            </p>
            {test.topicLine ? (
              <p className="mt-2 text-sm font-bold text-blue-600">
                {test.topicLine}
              </p>
            ) : null}
          </div>

          {/* Options — 2 columns on desktop */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {opts.map((opt, oIdx) => {
              const correct = isCorrectOption(question, opt.key);
              const isActive = activeKey === opt.key;
              let rowClass =
                "border-gray-200 bg-white text-slate-800 shadow-sm";
              let letterClass = `${LETTER_BG[oIdx % LETTER_BG.length]} text-white`;
              let mark = null;
              if (revealed) {
                if (correct) {
                  rowClass =
                    "border-[#34A853] bg-[#f0fdf4] text-slate-900 ring-2 ring-[#34A853]/40";
                  letterClass = "bg-[#34A853] text-white";
                  mark = <Check className="h-5 w-5 shrink-0 text-[#34A853]" />;
                } else if (isActive) {
                  rowClass =
                    "border-[#EA4335] bg-[#fce8e6] text-slate-900 ring-2 ring-[#EA4335]/40";
                  letterClass = "bg-[#EA4335] text-white";
                  mark = <X className="h-5 w-5 shrink-0 text-[#EA4335]" />;
                }
              }
              return (
                <button
                  key={opt.key}
                  disabled={revealed}
                  onClick={() => onPick(opt.key, correct)}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-150 ${rowClass} ${
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

          {/* Explanation — only when the question really has one */}
          {revealed &&
          typeof question?.explanation === "string" &&
          question.explanation.trim() ? (
            <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 p-4">
              <p className="text-sm font-black text-amber-800">💡 ব্যাখ্যা</p>
              <p className="mt-1 whitespace-pre-wrap text-sm font-semibold leading-relaxed text-slate-700">
                {question.explanation}
              </p>
            </div>
          ) : null}
        </div>

        {/* Right column: palette + progress */}
        <div className="w-full shrink-0 lg:w-72">
          <div
            className={`rounded-2xl border p-4 ${
              dark
                ? "border-white/10 bg-white/5"
                : "border-gray-200 bg-white shadow-sm"
            }`}
          >
            <QuestionPalette
              total={total}
              index={index}
              answers={answers}
              onJump={onJump}
              dark={dark}
            />
            <div className="mt-4 border-t border-white/10 pt-3">
              <div
                className={`flex items-center justify-between text-xs font-black ${
                  dark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                <span>মোট প্রশ্ন: {toBn(total)}</span>
                <span>
                  {toBn(answeredCount)}/{toBn(total)} উত্তর
                </span>
              </div>
              <div
                className={`mt-2 h-2 overflow-hidden rounded-full ${
                  dark ? "bg-white/10" : "bg-slate-100"
                }`}
              >
                <div
                  className="h-full rounded-full bg-amber-400"
                  style={{
                    width: `${total > 0 ? (answeredCount / total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom toolbar */}
      <div
        className={`mt-5 flex flex-wrap items-center justify-between gap-2 rounded-2xl border px-3 py-2.5 ${
          dark
            ? "border-white/10 bg-[#0a1a3a]/80"
            : "border-gray-200 bg-white shadow-sm"
        }`}
      >
        <button
          onClick={onPrev}
          disabled={index === 0}
          className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-black transition-colors disabled:opacity-40 ${
            dark
              ? "border border-white/20 text-white hover:bg-white/10"
              : "border border-gray-300 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <ArrowLeft className="h-4 w-4" />
          আগেরটি
        </button>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {recording}
          <button
            onClick={toggleFs}
            aria-label={isFs ? "পূর্ণ পর্দা থেকে বের হোন" : "পূর্ণ পর্দা"}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-black transition-colors ${
              dark
                ? "border border-white/20 text-white hover:bg-white/10"
                : "border border-gray-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {isFs ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
            পূর্ণ পর্দা
          </button>
        </div>
        <button
          onClick={onNext}
          disabled={!revealed}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-6 py-2.5 font-black text-slate-900 shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
        >
          {index + 1 >= total ? "ফলাফল দেখুন" : "পরের প্রশ্ন"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
