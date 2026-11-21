"use client";

import Link from "next/link";
import { Clock, Eye, FileText, Play } from "lucide-react";
import { toBn } from "@/lib/wb-board";
import { getStudioQuestionCount } from "@/lib/studio";

const TYPE_LABEL: Record<string, string> = {
  "Mock Test": "মক টেস্ট",
  Quiz: "কুইজ",
  "Practice Set": "প্র্যাকটিস সেট",
};

const TYPE_STYLE: Record<string, string> = {
  "Mock Test": "bg-blue-500/15 text-blue-300 border-blue-500/30",
  Quiz: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  "Practice Set": "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
};

/** Presentation card grid — Present opens the studio's own player. */
export default function StudioCardGrid({
  tests,
  loading,
  onPresent,
}: {
  tests: any[];
  loading: boolean;
  onPresent: (test: any) => void;
}) {
  if (tests.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center">
        <p className="text-xl font-black text-white">
          কোনো প্রেজেন্টেশন পাওয়া যায়নি।
        </p>
        <p className="mt-2 text-slate-400">
          অন্য কিছু লিখে খুঁজুন, বা ফিল্টার বদলান।
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {tests.map((test) => {
        const slug = test.slug || test.id;
        const qCount = getStudioQuestionCount(test);
        const duration = test.durationMin ?? test.timeLimitMin ?? null;
        return (
          <div
            key={slug}
            className="flex flex-col rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-sm transition-colors hover:border-white/25"
          >
            <span
              className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-bold ${
                TYPE_STYLE[test.type || "Mock Test"] || TYPE_STYLE["Mock Test"]
              }`}
            >
              {TYPE_LABEL[test.type || "Mock Test"] || test.type}
            </span>
            <h3 className="mt-3 line-clamp-2 min-h-[3.25rem] text-lg font-black leading-snug text-white">
              {test.title}
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold text-slate-400">
              <span className="inline-flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {toBn(qCount)}টি প্রশ্ন
              </span>
              {duration ? (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {toBn(duration)} মিনিট
                </span>
              ) : null}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => onPresent(test)}
                disabled={loading}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-base font-black text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
              >
                <Play className="h-4 w-4" />
                {loading ? "লোড হচ্ছে…" : "Present"}
              </button>
              <Link
                href={`/presentation/${slug}`}
                className="inline-flex items-center gap-1 rounded-full border border-white/15 px-4 py-2.5 text-sm font-bold text-slate-200 transition-colors hover:border-white/30 hover:text-white"
              >
                <Eye className="h-4 w-4" />
                পেজে খুলুন
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
