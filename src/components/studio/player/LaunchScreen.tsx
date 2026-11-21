import type { ReactNode } from "react";
import { toBn } from "@/lib/wb-board";
import type { StudioTest } from "./types";

/**
 * Studio launch screen — dark navy + gold poster, same look as the
 * DeshExam launch video frame. Photos come from /launch/ (the user's
 * own launch assets). Data is LIVE only: rows render only when the
 * value exists — no invented duration, negative marking or difficulty.
 * The Subscribe badge is a visual span (no YouTube URL known).
 */
export default function LaunchScreen({
  test,
  questionCount,
  onStart,
  recording,
}: {
  test: StudioTest;
  questionCount: number;
  onStart: () => void;
  recording?: ReactNode;
}) {
  const rows: { label: string; value: string }[] = [
    { label: "মোট প্রশ্ন", value: `${toBn(questionCount)}টি` },
  ];
  if (test.durationMin) {
    rows.push({ label: "সময়", value: `${toBn(test.durationMin)} মিনিট` });
  }
  if (test.negativeMarking !== undefined && test.negativeMarking !== null) {
    rows.push({
      label: "নেগেটিভ মার্কিং",
      value:
        test.negativeMarking === 0
          ? "নেই"
          : `−${toBn(test.negativeMarking)}`,
    });
  }
  if (test.totalMarks) {
    rows.push({ label: "মোট নম্বর", value: toBn(test.totalMarks) });
  }

  return (
    <div className="flex min-h-full items-center justify-center px-3 py-5 sm:px-6">
      <div
        className="w-full max-w-6xl overflow-hidden rounded-3xl border border-amber-400/40 shadow-2xl"
        style={{
          background:
            "radial-gradient(ellipse at center, #0a2257 0%, #071535 70%)",
        }}
      >
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
          <img src="/launch/logo.png" alt="DeshExam" className="h-9 w-auto" />
          <div className="leading-tight">
            <p className="text-base font-black text-white sm:text-lg">
              DeshExam <span className="text-amber-400">Mock Test</span>
            </p>
            <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400">
              LEARN • PRACTICE • SUCCEED
            </p>
          </div>
          <span className="mx-auto hidden text-sm font-bold text-slate-300 md:block">
            সঠিক প্রস্তুতি, সফলতার পথে
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 text-xs font-black text-white">
            ▶ Subscribe DeshExam
          </span>
        </div>

        {/* Body */}
        <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[1fr_1.5fr_1fr]">
          {/* Left: student + points (desktop only) */}
          <div className="order-3 hidden flex-col gap-3 lg:order-1 lg:flex">
            <img
              src="/launch/student.jpg"
              alt=""
              className="h-44 w-full rounded-2xl object-cover"
            />
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              {[
                ["🎯", "সঠিক প্রস্তুতি"],
                ["📊", "শক্তি মূল্যায়ন"],
                ["💡", "উন্নতির পরিকল্পনা"],
              ].map(([icon, text]) => (
                <p
                  key={text}
                  className="flex items-center gap-3 border-b border-white/10 py-2.5 text-sm font-bold text-slate-200 last:border-0 last:pb-0 first:pt-0"
                >
                  <span className="text-lg">{icon}</span>
                  {text}
                </p>
              ))}
            </div>
            <img
              src="/launch/books.jpg"
              alt=""
              className="h-20 w-full rounded-2xl object-cover"
            />
          </div>

          {/* Centre */}
          <div className="order-1 flex flex-col items-center text-center lg:order-2">
            <img src="/launch/emb.png" alt="" className="h-12 w-auto" />
            <p className="mt-3 text-4xl font-black leading-none text-white sm:text-5xl">
              Desh<span className="text-amber-400">Exam</span>
            </p>
            <span className="mt-3 inline-flex items-center rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-5 py-1.5 text-base font-black text-slate-900 shadow-lg">
              Mock Test
            </span>
            <h1 className="mt-4 text-2xl font-black leading-snug text-white sm:text-3xl">
              {test.title}
            </h1>
            {test.classLine ? (
              <span className="mt-3 inline-flex items-center rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-5 py-1.5 text-base font-black text-slate-900 shadow-lg">
                {test.classLine}
              </span>
            ) : null}
            <p className="mt-4 text-sm font-semibold text-slate-300 sm:text-base">
              নিজেকে যাচাই করুন, এগিয়ে যান আরও দূরে...
            </p>
            <div className="mt-6 flex flex-wrap items-start justify-center gap-3">
              <button
                onClick={onStart}
                className="rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-8 py-3.5 text-lg font-black text-slate-900 shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                ▶ টেস্ট শুরু করো »
              </button>
              {recording}
            </div>
          </div>

          {/* Right: building + live exam info */}
          <div className="order-2 flex flex-col gap-3 lg:order-3">
            <img
              src="/launch/bldg.jpg"
              alt=""
              className="hidden h-28 w-full rounded-2xl object-cover lg:block"
            />
            <div className="rounded-2xl border border-amber-400/30 bg-white/5 p-4">
              <p className="mb-3 flex items-center gap-2 text-sm font-black text-amber-300">
                📋 পরীক্ষার তথ্য
              </p>
              <dl className="flex flex-col gap-2">
                {rows.map((r) => (
                  <div
                    key={r.label}
                    className="flex items-center justify-between gap-4 border-b border-white/10 pb-2 text-sm last:border-0 last:pb-0"
                  >
                    <dt className="font-semibold text-slate-300">{r.label}</dt>
                    <dd className="text-base font-black text-amber-300">
                      {r.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-4 py-3 text-xs font-bold text-slate-300 sm:px-6 sm:text-sm">
          <span>🏆 সফলতার জন্য আজই শুরু হোক আপনার প্রস্তুতি...</span>
          <a
            href="https://deshexam.vercel.app/"
            className="font-bold text-amber-400 hover:underline"
          >
            🌐 deshexam.vercel.app
          </a>
        </div>
      </div>
    </div>
  );
}
