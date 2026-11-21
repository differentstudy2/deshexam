"use client";

import React from "react";
import { LayoutGrid, Palette, Mic, Video } from "lucide-react";

export type StudioSection =
  | "presentations"
  | "templates"
  | "voices"
  | "recordings";

const SECTIONS: {
  id: StudioSection;
  label: string;
  icon: React.ReactNode;
  ready: boolean;
  blurb: string;
}[] = [
  { id: "presentations", label: "প্রেজেন্টেশন", icon: <LayoutGrid className="h-5 w-5" />, ready: true, blurb: "" },
  { id: "templates", label: "টেমপ্লেট", icon: <Palette className="h-5 w-5" />, ready: false, blurb: "প্রেজেন্টেশনের থিম ও লেআউট টেমপ্লেট এখানে থাকবে — লঞ্চ, প্রশ্ন ও রেজাল্ট স্ক্রিনের তৈরি ডিজাইন।" },
  { id: "voices", label: "ভয়েস", icon: <Mic className="h-5 w-5" />, ready: false, blurb: "ন্যারেশন ও প্রশ্ন পড়ার ভয়েস এখান থেকে বাছা যাবে — বাংলা পুরুষ/মহিলা কণ্ঠ, গতি ও স্বর।" },
  { id: "recordings", label: "রেকর্ডিং", icon: <Video className="h-5 w-5" />, ready: false, blurb: "আগের রেকর্ড করা প্রেজেন্টেশনগুলো এখানে জমা থাকবে — দেখা, ডাউনলোড ও শেয়ার করা যাবে।" },
];

export function getStudioSection(id: StudioSection) {
  return SECTIONS.find((s) => s.id === id)!;
}

/** Left sidebar — the studio's section nav. */
export default function StudioSidebar({
  section,
  onSelect,
}: {
  section: StudioSection;
  onSelect: (s: StudioSection) => void;
}) {
  return (
    <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:w-60">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-3">
        <div className="px-2 pb-3 pt-2">
          <h1 className="text-2xl font-black text-white">
            🎬 DeshExam <span className="text-amber-300">Studio</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            প্রেজেন্টেশন স্টুডিও — সাজান, থিম বাছুন, প্রেজেন্ট করুন।
          </p>
        </div>
        <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={`flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-left text-base font-bold transition-colors ${
                section === s.id
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              {s.icon}
              <span className="flex-1">{s.label}</span>
              {!s.ready && (
                <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-xs font-bold text-amber-300">
                  শীঘ্রই
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
