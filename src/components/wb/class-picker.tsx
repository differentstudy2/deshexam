"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { CLASSES, MEDIUMS, SUBJECTS_BY_CLASS, boardForClass, classLabel, toBn, type Medium } from "@/lib/wb-board";

const MEDIUM_KEY = "deshexam-medium";
const CLASS_KEY = "deshexam-class";

function ClassCard({ n, medium }: { n: number; medium: Medium }) {
  const subjects = SUBJECTS_BY_CLASS[n]?.length ?? 0;
  const badge = n === 10 ? "মাধ্যমিক" : n === 12 ? "উচ্চমাধ্যমিক" : null;
  return (
    <Link
      key={n}
      href={`/class/${n}?medium=${medium}`}
      onClick={() => window.localStorage.setItem(CLASS_KEY, String(n))}
      className="group relative flex min-h-[112px] flex-col justify-center rounded-2xl border border-amber-300/25 bg-[#0a1f1c]/80 p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-300/70 hover:shadow-[0_0_30px_rgba(212,175,55,0.25)]"
    >
      {badge ? (
        <span className="absolute right-3 top-3 rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-bold text-[#042f2e]">
          {badge}
        </span>
      ) : null}
      <span className="text-2xl font-bold text-white group-hover:text-amber-200 md:text-[1.7rem]">
        ক্লাস {toBn(n)}
      </span>
      <span className="mt-1 text-sm font-semibold text-amber-200/80">
        {toBn(subjects)}টি বিষয়
      </span>
      <ArrowRight
        className="absolute bottom-4 right-4 h-5 w-5 text-amber-300 opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden="true"
      />
    </Link>
  );
}

export function ClassPicker() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [medium, setMedium] = useState<Medium>("bn");
  const [lastClass, setLastClass] = useState<number | null>(null);

  useEffect(() => {
    const q = searchParams.get("medium");
    const stored = window.localStorage.getItem(MEDIUM_KEY) as Medium | null;
    const storedClass = window.localStorage.getItem(CLASS_KEY);
    if (q === "bn" || q === "en") setMedium(q);
    else if (stored === "bn" || stored === "en") setMedium(stored);
    if (storedClass) {
      const n = Number(storedClass);
      if (n >= 5 && n <= 12) setLastClass(n);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pickMedium = (m: Medium) => {
    setMedium(m);
    window.localStorage.setItem(MEDIUM_KEY, m);
    const params = new URLSearchParams(window.location.search);
    params.set("medium", m);
    router.replace(`/?${params.toString()}`, { scroll: false });
  };

  const wbbse = CLASSES.filter((n) => boardForClass(n) === "WBBSE");
  const wbchse = CLASSES.filter((n) => boardForClass(n) === "WBCHSE");

  return (
    <div className="relative">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-amber-500/[0.13] blur-[100px]" />
      </div>
      <div className="relative">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="inline-flex rounded-full border border-amber-300/30 bg-white/[0.05] p-1" role="group" aria-label="মাধ্যম বেছে নিন">
            {MEDIUMS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => pickMedium(m.id)}
                aria-pressed={medium === m.id}
                className={`min-h-[44px] rounded-full px-5 text-sm font-bold transition-colors ${
                  medium === m.id
                    ? "bg-gradient-to-b from-amber-300 to-amber-500 text-[#042f2e] shadow-[0_0_20px_rgba(212,175,55,0.35)]"
                    : "text-slate-300 hover:bg-white/10"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <p className="text-sm text-slate-300">নির্বাচিত মাধ্যম অনুযায়ী কনটেন্ট দেখানো হবে।</p>
          {lastClass ? (
            <p className="text-sm text-slate-300">
              শেষবার আপনি <strong className="text-white">ক্লাস {toBn(lastClass)}</strong> দেখছিলেন —{" "}
              <Link href={`/class/${lastClass}?medium=${medium}`} className="font-bold text-emerald-400 hover:underline">
                যেখানে থেমেছিলেন, সেখান থেকে শুরু করুন →
              </Link>
            </p>
          ) : null}
        </div>

        <p className="mb-3 text-sm font-bold text-amber-300/90">WBBSE · ক্লাস ৫–১০</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
          {wbbse.map((n) => (
            <ClassCard key={n} n={n} medium={medium} />
          ))}
        </div>

        <p className="mb-3 mt-8 text-sm font-bold text-amber-300/90">WBCHSE · ক্লাস ১১–১২</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
          {wbchse.map((n) => (
            <ClassCard key={n} n={n} medium={medium} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Re-exported for the class page so the picker state stays consistent.
export function useMedium() {
  return { MEDIUM_KEY, CLASS_KEY };
}
export { classLabel };
