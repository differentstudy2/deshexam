"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DEMO_QUESTIONS, toBn } from "@/lib/wb-board";

const DEMO_SECONDS = 5 * 60;

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${toBn(m)}:${String(r).padStart(2, "0")}`;
}

export function DemoTest() {
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [seconds, setSeconds] = useState(DEMO_SECONDS);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!started || done) return;
    const t = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(t);
          setDone(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [started, done]);

  const q = DEMO_QUESTIONS[idx];
  const score = useMemo(
    () => answers.filter((a, i) => a === DEMO_QUESTIONS[i]?.answer).length,
    [answers]
  );

  const choose = (opt: number) => {
    if (picked !== null) return;
    setPicked(opt);
    setAnswers((prev) => [...prev, opt]);
  };

  const next = () => {
    if (idx + 1 >= DEMO_QUESTIONS.length) {
      setDone(true);
    } else {
      setIdx(idx + 1);
      setPicked(null);
    }
  };

  const restart = () => {
    setStarted(false);
    setIdx(0);
    setPicked(null);
    setAnswers([]);
    setSeconds(DEMO_SECONDS);
    setDone(false);
  };

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
          নমুনা টেস্ট · লগইন লাগবে না
        </span>
        {started && !done ? (
          <span className="text-base font-bold text-slate-900 dark:text-white" aria-live="polite">
            ⏱ {formatTime(seconds)}
          </span>
        ) : null}
      </div>

      {!started ? (
        <div className="text-center">
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">৫টি নমুনা প্রশ্ন, ৫ মিনিট</h3>
          <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
            ক্লাস ৫–১২-এর নমুনা প্রশ্ন দিয়ে দেখে নিন — উত্তর দিলেই সঙ্গে সঙ্গে ফলাফল পাবেন।
          </p>
          <button
            type="button"
            onClick={() => setStarted(true)}
            className="mt-5 inline-flex min-h-[48px] items-center rounded-full bg-brand-green px-8 text-base font-bold text-white hover:bg-emerald-800"
          >
            ফ্রি টেস্ট শুরু করুন
          </button>
        </div>
      ) : done ? (
        <div className="text-center" aria-live="polite">
          <p className="text-sm font-bold uppercase tracking-wider text-brand-golddark dark:text-amber-400">আপনার ফলাফল</p>
          <p className="mt-2 text-4xl font-extrabold text-slate-900 dark:text-white">
            {toBn(score)} / {toBn(DEMO_QUESTIONS.length)}
          </p>
          <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
            {score === DEMO_QUESTIONS.length
              ? "দারুণ! সবগুলো সঠিক হয়েছে।"
              : score >= 3
                ? "ভালো হয়েছে! আরো অনুশীলন করলে আরো ভালো হবে।"
                : "শুরুটা হয়েছে — অধ্যায়ভিত্তিক MCQ অনুশীলন করলে দ্রুত উন্নতি হবে।"}
          </p>
          <div className="mt-4 space-y-2 text-left">
            {DEMO_QUESTIONS.map((item, i) => (
              <div key={i} className="rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700">
                <p className="font-semibold text-slate-900 dark:text-white">
                  {answers[i] === item.answer ? "✓ " : "✗ "}{item.q}
                </p>
                <p className="mt-1 text-slate-600 dark:text-slate-400">সঠিক উত্তর: {item.options[item.answer]} — {item.explain}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/sign_up"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-brand-green px-8 text-base font-bold text-white hover:bg-emerald-800"
            >
              সাইন আপ করে সম্পূর্ণ বিশ্লেষণ পান
            </Link>
            <button
              type="button"
              onClick={restart}
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-slate-300 px-8 text-base font-bold text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              আবার দিন
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            প্রশ্ন {toBn(idx + 1)} / {toBn(DEMO_QUESTIONS.length)} · {q.subject}
          </p>
          <h3 className="mt-2 text-lg font-bold leading-relaxed text-slate-900 dark:text-white md:text-xl">{q.q}</h3>
          <div className="mt-4 space-y-2" role="group" aria-label="উত্তর বেছে নিন">
            {q.options.map((opt, i) => {
              const isAnswer = i === q.answer;
              const isPicked = i === picked;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => choose(i)}
                  disabled={picked !== null}
                  className={`flex min-h-[48px] w-full items-center rounded-xl border px-4 py-3 text-left text-base font-medium transition-colors ${
                    picked === null
                      ? "border-slate-300 hover:border-brand-green hover:bg-emerald-50 dark:border-slate-600 dark:hover:bg-emerald-950/40"
                      : isAnswer
                        ? "border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200"
                        : isPicked
                          ? "border-red-500 bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-200"
                          : "border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400"
                  }`}
                >
                  <span className="mr-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold dark:bg-slate-800">
                    {["ক", "খ", "গ", "ঘ"][i]}
                  </span>
                  {opt}
                  {picked !== null && isAnswer ? <span className="ml-auto font-bold">✓ সঠিক</span> : null}
                  {picked !== null && isPicked && !isAnswer ? <span className="ml-auto font-bold">✗ ভুল</span> : null}
                </button>
              );
            })}
          </div>
          {picked !== null ? (
            <div className="mt-4">
              <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {q.explain}
              </p>
              <button
                type="button"
                onClick={next}
                className="mt-3 inline-flex min-h-[48px] items-center rounded-full bg-brand-green px-8 text-base font-bold text-white hover:bg-emerald-800"
              >
                {idx + 1 >= DEMO_QUESTIONS.length ? "ফলাফল দেখুন" : "পরের প্রশ্ন"}
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
