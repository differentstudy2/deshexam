"use client";

import { toBn } from "@/lib/wb-board";

/** Real counts only — computed from the assessments passed in. */
export default function StudioStats({
  totalPresentations,
  totalQuestions,
}: {
  totalPresentations: number;
  totalQuestions: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-center sm:p-5">
        <p className="text-3xl font-black text-blue-400 sm:text-4xl">
          {toBn(totalPresentations)}
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-400">
          মোট প্রেজেন্টেশন
        </p>
      </div>
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-center sm:p-5">
        <p className="text-3xl font-black text-violet-400 sm:text-4xl">
          {toBn(totalQuestions)}
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-400">মোট প্রশ্ন</p>
      </div>
    </div>
  );
}
