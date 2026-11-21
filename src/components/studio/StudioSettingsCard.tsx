"use client";

import { Settings2 } from "lucide-react";
import {
  STUDIO_THEMES,
  STUDIO_RECORDING_QUALITIES,
  type StudioBgTheme,
  type StudioRecordingQuality,
} from "@/lib/studio";

/**
 * Studio settings — theme applies to the studio player right away.
 * Recording quality is passed to the player's Record button.
 */
export default function StudioSettingsCard({
  theme,
  recording,
  onTheme,
  onRecording,
}: {
  theme: StudioBgTheme;
  recording: StudioRecordingQuality;
  onTheme: (t: StudioBgTheme) => void;
  onRecording: (r: StudioRecordingQuality) => void;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
      <h2 className="flex items-center gap-2 text-lg font-black text-white">
        <Settings2 className="h-5 w-5 text-blue-400" />
        স্টুডিও সেটিংস
      </h2>
      <p className="mt-1 text-sm text-slate-400">
        থিম স্টুডিও প্লেয়ারে সঙ্গে সঙ্গে প্রযোজ্য হবে — মনে রাখা থাকবে।
      </p>
      <div className="mt-4">
        <p className="text-sm font-bold text-slate-300">থিম</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {STUDIO_THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => onTheme(t.id)}
              aria-pressed={theme === t.id}
              className={`rounded-full border px-3 py-1.5 text-sm font-bold transition-colors ${
                theme === t.id
                  ? "border-blue-400 bg-blue-600 text-white"
                  : "border-white/15 bg-white/[0.04] text-slate-300 hover:border-white/30 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm font-bold text-slate-300">রেকর্ডিং কোয়ালিটি</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {STUDIO_RECORDING_QUALITIES.map((r) => (
            <button
              key={r.id}
              onClick={() => onRecording(r.id)}
              aria-pressed={recording === r.id}
              className={`rounded-full border px-3 py-1.5 text-sm font-bold transition-colors ${
                recording === r.id
                  ? "border-blue-400 bg-blue-600 text-white"
                  : "border-white/15 bg-white/[0.04] text-slate-300 hover:border-white/30 hover:text-white"
              }`}
            >
              {r.label}{" "}
              <span className="font-semibold opacity-70">({r.hint})</span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs font-semibold text-slate-500">
          রেকর্ডিং প্লেয়ারের ওপরের লাল Record বোতাম থেকে শুরু হবে — থামালে
          .webm ফাইল ডাউনলোড হবে।
        </p>
      </div>
    </div>
  );
}
