import { useCallback, useEffect, useRef, useState } from "react";
import type { StudioRecordingQuality } from "@/lib/studio";
import {
  STUDIO_RECORDING_PRESETS,
  pickStudioMimeType,
  studioRecordingConstraints,
} from "./recording";

export type StudioRecordingState =
  | "idle"
  | "recording"
  | "paused"
  | "stopping";

/**
 * Studio screen recorder — one hook, no UI.
 * Captures the screen/tab (getDisplayMedia) + the presenter's mic, and
 * downloads a .webm when stopped. The display track gets
 * contentHint "detail" so Bengali text stays sharp at any quality.
 * Mic failure never blocks the recording: it continues with screen
 * audio/video only.
 */
export function useStudioRecording(
  testTitle: string,
  quality: StudioRecordingQuality,
) {
  const [state, setState] = useState<StudioRecordingState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const qualityRef = useRef(quality);
  qualityRef.current = quality;

  const supported =
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getDisplayMedia &&
    typeof MediaRecorder !== "undefined";

  useEffect(() => {
    if (state !== "recording") return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [state]);

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(async () => {
    if (!supported || state !== "idle") return;
    setError(null);
    try {
      const display = await navigator.mediaDevices.getDisplayMedia(
        studioRecordingConstraints(qualityRef.current),
      );
      // Keep text sharp: tell the encoder to preserve fine detail.
      const videoTrack = display.getVideoTracks()[0];
      try {
        if (videoTrack && "contentHint" in videoTrack) {
          (videoTrack as any).contentHint = "detail";
        }
      } catch {
        // contentHint is a hint — ignore when unsupported.
      }

      // Mic, best-effort: a denied mic must not kill the recording.
      let mic: MediaStream | null = null;
      try {
        mic = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        mic = null;
      }

      const stream = new MediaStream([
        ...display.getVideoTracks(),
        ...display.getAudioTracks(),
        ...(mic ? mic.getAudioTracks() : []),
      ]);
      streamRef.current = stream;
      chunksRef.current = [];

      const preset = STUDIO_RECORDING_PRESETS[qualityRef.current];
      const mimeType = pickStudioMimeType();
      const recorder = new MediaRecorder(
        stream,
        mimeType
          ? { mimeType, videoBitsPerSecond: preset.videoBitsPerSecond }
          : { videoBitsPerSecond: preset.videoBitsPerSecond },
      );
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mimeType || "video/webm",
        });
        const safeName = (testTitle || "DeshExam")
          .replace(/[^\p{L}\p{N}]+/gu, "_")
          .slice(0, 60);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `DeshExam_${safeName}_${qualityRef.current.toUpperCase()}.webm`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 10_000);
        stopTracks();
        setState("idle");
        setElapsed(0);
      };
      // If the user stops sharing from the browser chrome, end cleanly.
      display.getVideoTracks()[0]?.addEventListener("ended", () => {
        if (recorder.state !== "inactive") recorder.stop();
      });
      recorderRef.current = recorder;
      recorder.start(1000);
      setState("recording");
    } catch (e: any) {
      stopTracks();
      setError(
        e?.name === "NotAllowedError"
          ? "স্ক্রিন শেয়ারের অনুমতি দেওয়া হয়নি।"
          : "রেকর্ডিং শুরু করা যায়নি — আবার চেষ্টা করুন।",
      );
    }
  }, [supported, state, stopTracks, testTitle]);

  const stop = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    setState("stopping");
    recorder.stop();
  }, []);

  const pause = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state !== "recording") return;
    recorder.pause();
    setState("paused");
  }, []);

  const resume = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state !== "paused") return;
    recorder.resume();
    setState("recording");
  }, []);

  // Stop the tracks if the player closes mid-recording.
  useEffect(() => stopTracks, [stopTracks]);

  return { state, elapsed, error, supported, start, stop, pause, resume };
}
