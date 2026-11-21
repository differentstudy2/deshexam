"use client";

import { Circle, Pause, Play, Square } from "lucide-react";
import type { StudioRecordingQuality } from "@/lib/studio";
import { useStudioRecording } from "./useStudioRecording";
import { formatStudioTime } from "./useStudioPlayer";

/**
 * Studio record button — desktop only (screen capture needs a desktop
 * browser). Shows a red dot + timer while recording, pause/resume
 * while running, and a plain error line when sharing is denied.
 */
export default function RecordingButton({
  testTitle,
  quality,
}: {
  testTitle: string;
  quality: StudioRecordingQuality;
}) {
  const rec = useStudioRecording(testTitle, quality);

  if (!rec.supported) return null;

  const chip =
    "hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-black shadow-lg transition-transform hover:scale-105 active:scale-95 md:inline-flex";

  if (rec.state === "idle") {
    return (
      <div className="absolute left-4 top-4 z-10 flex flex-col items-start gap-2">
        <button onClick={rec.start} className={`${chip} bg-red-600 text-white`}>
          <Circle className="h-4 w-4 fill-current" />
          Record
        </button>
        {rec.error ? (
          <p className="max-w-[260px] rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white shadow-lg">
            {rec.error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="absolute left-4 top-4 z-10 flex flex-col items-start gap-2">
      <div className="flex items-center gap-2">
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
      </div>
      <p className="max-w-[260px] rounded-xl bg-black/60 px-3 py-2 text-xs font-bold text-white shadow-lg">
        রেকর্ডিং চলছে — থামালে .webm ফাইল ডাউনলোড হবে।
      </p>
    </div>
  );
}
