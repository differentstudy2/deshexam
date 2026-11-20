"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CLASSES, MEDIUMS, boardForClass, classLabel, toBn, type Medium } from "@/lib/wb-board";

const MEDIUM_KEY = "deshexam-medium";
const CLASS_KEY = "deshexam-class";

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

  return (
    <div>
      <div className="mb-6 flex flex-col items-center gap-3">
        <div className="inline-flex rounded-full border border-white/10 bg-white/[0.05] p-1" role="group" aria-label="মাধ্যম বেছে নিন">
          {MEDIUMS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => pickMedium(m.id)}
              aria-pressed={medium === m.id}
              className={`min-h-[44px] rounded-full px-5 text-sm font-bold transition-colors ${
                medium === m.id
                  ? "bg-brand-green text-white"
                  : "text-slate-300 hover:bg-white/10"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        {lastClass ? (
          <p className="text-sm text-slate-300">
            শেষবার আপনি <strong className="text-white">ক্লাস {toBn(lastClass)}</strong> দেখছিলেন —{" "}
            <Link href={`/class/${lastClass}?medium=${medium}`} className="font-bold text-emerald-400 hover:underline">
              যেখানে থেমেছিলেন, সেখান থেকে শুরু করুন →
            </Link>
          </p>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
        {CLASSES.map((n) => (
          <Link
            key={n}
            href={`/class/${n}?medium=${medium}`}
            onClick={() => window.localStorage.setItem(CLASS_KEY, String(n))}
            className="group flex min-h-[96px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-gold hover:shadow-md"
          >
            <span className="text-2xl font-bold text-white group-hover:text-emerald-400 md:text-3xl">
              ক্লাস {toBn(n)}
            </span>
            <span className="mt-1 text-sm font-semibold text-slate-300">
              {boardForClass(n) === "WBBSE" ? "WBBSE" : "WBCHSE"}
            </span>
            {n === 10 ? (
              <span className="mt-2 rounded-full bg-brand-gold/20 px-2.5 py-0.5 text-[15px] font-bold text-brand-golddark dark:text-amber-400">মাধ্যমিক</span>
            ) : null}
            {n === 12 ? (
              <span className="mt-2 rounded-full bg-brand-gold/20 px-2.5 py-0.5 text-[15px] font-bold text-brand-golddark dark:text-amber-400">উচ্চমাধ্যমিক</span>
            ) : null}
          </Link>
        ))}
      </div>
      <p className="mt-4 text-center text-sm text-slate-300">
        ক্লাস ৫–১০: WBBSE (মাধ্যমিক) · ক্লাস ১১–১২: WBCHSE (উচ্চমাধ্যমিক)
      </p>
    </div>
  );
}

// Re-exported for the class page so the picker state stays consistent.
export function useMedium() {
  return { MEDIUM_KEY, CLASS_KEY };
}
export { classLabel };
