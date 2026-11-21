"use client";

import { Circle, Pause, Play, Square } from "lucide-react";
import type { StudioRecording } from "./useStudioRecording";
import { formatStudioTime } from "./useStudioPlayer";

/**
 * Studio record control — presentational only. The recorder hook lives
 * in StudioPlayer so one recording survives stage changes (launch →
 * questions → result). Desktop only: screen capture needs a desktop
 * browser. Rendered inline (launch CTA row + question toolbar).
 */
export default function RecordingButton({ rec }: { rec: StudioRecording }) {
  if (!rec.supported) return null;

  const chip =
    "hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-black shadow-lg transition-transform hover:scale-105 active:scale-95 md:inline-flex";

  if (rec.state === "idle") {
    return (
      <span className="inline-flex flex-col items-start gap-1">
        <button onClick={rec.start} className={`${chip} bg-red-600 text-white`}>
          <Circle className="h-4 w-4 fill-current" />
          Record
        </button>
        {rec.error ? (
          <span className="max-w-[260px] rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-bold text-white shadow-lg">
            {rec.error}
          </span>
        ) : null}
      </span>
    );
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <span className="inline-flex items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-black text-white shadow-lg">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" />
          {rec.state === "paused" ? "Paused" : "REC"}{" "}
          {formatStudioTime(rec.elapsed)}
        </span>
        {rec.state === "recording" ? (
          <button
            onClick={rec.pause}
            aria-label="Pause recording"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-800 shadow-lg transition-transform hover:scale-110"
          >
            <Pause className="h-4 w-4" />
          </button>
        ) : rec.state === "paused" ? (
          <button
            onClick={rec.resume}
            aria-label="Resume recording"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-800 shadow-lg transition-transform hover:scale-110"
          >
            <Play className="h-4 w-4" />
          </button>
        ) : null}
        <button
          onClick={rec.stop}
          disabled={rec.state === "stopping"}
          aria-label="Stop recording"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-red-600 shadow-lg transition-transform hover:scale-110 disabled:opacity-50"
        >
          <Square className="h-4 w-4 fill-current" />
        </button>
      </span>
      <span className="max-w-[260px] rounded-lg bg-black/60 px-2.5 py-1.5 text-xs font-bold text-white shadow-lg">
        রেকর্ডিং চলছে — থামালে .webm ফাইল ডাউনলোড হবে।
      </span>
    </span>
  );
}
