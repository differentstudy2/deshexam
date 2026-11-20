"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Pencil } from "lucide-react";
import { toBn } from "@/lib/wb-board";
import "./animations.css";

const BN = "০১২৩৪৫৬৭৮৯";
const bn = (s: string) => s.replace(/\d/g, (d) => BN[Number(d)]);
const fmt = (sec: number) => bn(`${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`);

const CLASSES: { n: number; label?: string }[] = [
  { n: 5 }, { n: 6 }, { n: 7 }, { n: 8 }, { n: 9 },
  { n: 10, label: "মাধ্যমিক" }, { n: 11 }, { n: 12, label: "উচ্চমাধ্যমিক" },
];

const QUESTIONS: { tag: string; q: string; options: string[]; correct: number }[] = [
  { tag: "ক্লাস ১০ · জীবনবিজ্ঞান", q: "১. সালোকসংশ্লেষের প্রধান উপজাত গ্যাসটি কী?", options: ["ক) কার্বন ডাই-অক্সাইড", "খ) অক্সিজেন", "গ) নাইট্রোজেন"], correct: 1 },
  { tag: "ক্লাস ৯ · গণিত", q: "২. পিথাগোরাসের উপপাদ্য কোন ত্রিভুজের ক্ষেত্রে প্রযোজ্য?", options: ["ক) সমবাহু ত্রিভুজ", "খ) সমকোণী ত্রিভুজ", "গ) বিষমবাহু ত্রিভুজ"], correct: 1 },
  { tag: "ক্লাস ৮ · বিজ্ঞান", q: "৩. জলের রাসায়নিক সংকেত কোনটি?", options: ["ক) CO₂", "খ) H₂O", "গ) O₂"], correct: 1 },
  { tag: "ক্লাস ৬ · পরিবেশ", q: "৪. ভারতের জাতীয় পাখি কোনটি?", options: ["ক) ময়ূর", "খ) টিয়া", "গ) কাক"], correct: 0 },
  { tag: "ক্লাস ৫ · বাংলা", q: "৫. বাংলা নববর্ষের প্রথম মাস কোনটি?", options: ["ক) বৈশাখ", "খ) জ্যৈষ্ঠ", "গ) আষাঢ়"], correct: 0 },
];

export function Hero() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStep(2);
      return;
    }
    const id = setInterval(() => setStep((s) => (s + 1) % (QUESTIONS.length * 6)), 1000);
    return () => clearInterval(id);
  }, []);
  const qi = Math.floor(step / 6) % QUESTIONS.length;
  const current = QUESTIONS[qi];
  const selected = step % 6 >= 2;

  return (
    <section className="section-dark-hero relative overflow-hidden text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="container relative mx-auto grid max-w-6xl gap-12 px-4 py-10 md:grid-cols-2 md:items-center md:py-16 lg:grid-cols-[1.2fr_0.8fr]">
        {/* LEFT */}
        <div>
          <p className="hx-up inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-white/5 px-4 py-1.5 text-[15px] font-bold text-amber-200 shadow-[0_0_20px_rgba(212,175,55,0.15)]">
            <span aria-hidden="true" className="hx-dot h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_8px_#fcd34d]" />
            WBBSE · WBCHSE · ক্লাস ৫–১২
            <span aria-hidden="true" className="hx-dot h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          </p>
          <h1 style={{ animationDelay: "0.1s" }} className="hx-up mt-5 text-4xl font-bold leading-snug tracking-normal md:text-4xl lg:text-[3.25rem] lg:leading-[1.3]">
            <span className="lg:whitespace-nowrap">পশ্চিমবঙ্গ বোর্ডের প্রস্তুতি,</span>
            <span className="hx-shimmer block bg-[linear-gradient(90deg,#fbbf24,#fef3c7,#f59e0b,#fbbf24)] bg-clip-text text-transparent">ক্লাস ৫ থেকে ১২</span>
          </h1>
          <p style={{ animationDelay: "0.2s" }} className="hx-up mt-5 max-w-xl text-base leading-relaxed text-teal-50 md:text-lg">
            অভিজ্ঞ শিক্ষকদের লাইভ ক্লাস, মক টেস্ট এবং সম্পূর্ণ অধ্যায়ভিত্তিক আলোচনার মাধ্যমে পরীক্ষার সেরা প্রস্তুতি নাও।
          </p>
          <div style={{ animationDelay: "0.3s" }} className="hx-up mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="#demo-test" className="hx-glow hx-shine inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 px-8 text-base font-bold text-[#042f2e] shadow-[0_8px_30px_rgba(212,175,55,0.35)] transition-all hover:-translate-y-0.5">
              ফ্রি টেস্ট দিন <Pencil className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="#class-picker" className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border-2 border-amber-300/50 bg-white/5 px-8 text-base font-bold text-amber-100 shadow-[0_0_24px_rgba(212,175,55,0.15)] backdrop-blur transition-all hover:bg-white/10">
              ক্লাস বেছে নিন <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <p style={{ animationDelay: "0.4s" }} className="hx-up mt-4 flex items-center gap-2 text-sm text-emerald-300">
            <Check className="h-4 w-4" aria-hidden="true" /> লগইন ছাড়াই ফ্রি টেস্ট দেওয়া যায়
          </p>

          <ul className="-mx-4 mt-8 flex gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
            {CLASSES.map((c, i) => (
              <li key={c.n} style={{ animationDelay: `${0.6 + i * 0.07}s` }} className="hx-pop flex shrink-0 flex-col items-center">
                <Link
                  href={`/class/${c.n}`}
                  aria-label={`ক্লাস ${toBn(c.n)}${c.label ? ` (${c.label})` : ""}`}
                  className={`flex h-16 w-16 items-center justify-center rounded-full border-2 bg-slate-900/60 text-xl font-bold text-white shadow-[inset_0_0_14px_rgba(255,255,255,0.06)] transition-all hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400 ${
                    i % 2 === 0 || c.n === 11 ? "border-amber-400/70 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]" : "border-emerald-400/70 hover:shadow-[0_0_20px_rgba(52,211,153,0.4)]"
                  }`}
                >
                  {toBn(c.n)}
                </Link>
                <span className="mt-1 h-4 text-[11px] font-semibold text-slate-300">{c.label ?? ""}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT: phone */}
        <div style={{ animationDelay: "0.3s" }} className="hx-up relative mx-auto flex h-[520px] w-full max-w-sm items-center justify-center">
          <div aria-hidden="true" className="hx-ring absolute h-[440px] w-[440px] rounded-full border border-amber-300/25 shadow-[0_0_80px_rgba(52,211,153,0.15)]" />
          <div aria-hidden="true" className="absolute h-[340px] w-[340px] rounded-full border border-amber-300/40 bg-emerald-400/5" />
          <div aria-hidden="true" className="hx-spin absolute h-[390px] w-[390px] rounded-full border border-dashed border-amber-300/25" />
          <div className="hx-float">
          <Link href="#demo-test" className="group relative block outline-none focus-visible:ring-2 focus-visible:ring-amber-400" aria-label="ফ্রি ডেমো টেস্ট দিন">
            <div aria-hidden="true" className="relative w-64 rounded-[2.6rem] border-[5px] border-emerald-900 bg-gradient-to-b from-emerald-700 to-emerald-950 p-1.5 shadow-[0_30px_80px_rgba(0,0,0,0.6)] ring-1 ring-emerald-400/30 transition-transform duration-300 md:rotate-[10deg] md:group-hover:rotate-[6deg]">
              <div className="absolute left-1/2 top-3 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />
              <div className="min-h-[460px] rounded-[2.1rem] bg-gradient-to-b from-emerald-900 to-slate-950 px-4 pb-5 pt-10">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-emerald-300 px-2.5 py-0.5 text-xs font-bold text-emerald-950">{current.tag}</span>
                  <span className="text-sm font-bold text-slate-200">◔ {fmt(512 - step)}</span>
                </div>
                <hr className="my-3 border-white/10" />
                <div key={qi} className="hx-up">
                  <p className="text-lg font-bold leading-relaxed text-white">{current.q}</p>
                  <div className="mt-4 space-y-3">
                    {current.options.map((opt, oi) => {
                      const isCorrect = selected && oi === current.correct;
                      return (
                        <div key={opt} className={`flex items-center justify-between rounded-xl border px-3 py-2.5 transition-colors duration-500 ${isCorrect ? "border-emerald-300 bg-emerald-300 font-bold text-emerald-950" : "border-white/10 bg-white/5 text-slate-200"}`}>
                          {opt} {isCorrect ? <Check className="h-5 w-5 shrink-0 rounded-full bg-emerald-950 p-0.5 text-emerald-300" /> : null}
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-4 text-center text-xs font-semibold text-slate-400">প্রশ্ন {toBn(qi + 1)} / {toBn(QUESTIONS.length)}</p>
                </div>
              </div>
            </div>
          </Link>
          </div>
          {/* floating analytics card */}
          <div aria-hidden="true" className="hx-float-b absolute -right-2 bottom-12 w-52 rounded-2xl border border-white/15 bg-slate-900/70 p-3 shadow-xl backdrop-blur-md">
            <p className="text-xs font-bold text-white">অধ্যায়ভিত্তিক বিশ্লেষণ</p>
            <div className="mt-2 flex items-center gap-3">
              <svg viewBox="0 0 52 52" className="h-14 w-14 -rotate-90">
                <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="5" />
                <circle className="hx-draw" cx="26" cy="26" r="22" fill="none" stroke="#fbbf24" strokeWidth="5" strokeLinecap="round" strokeDasharray="117.5 138.2" />
              </svg>
              <div className="text-[11px] leading-tight text-slate-300"><b className="block text-base text-white">৮৫%</b>সম্পূর্ণ</div>
              <svg viewBox="0 0 40 28" className="h-8 w-10 text-emerald-300"><polyline points="2,24 12,14 20,18 38,4" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">নমুনা</p>
          </div>
        </div>
      </div>
    </section>
  );
}
