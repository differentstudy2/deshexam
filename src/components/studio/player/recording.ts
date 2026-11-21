/**
 * Studio recording presets — small, self-contained.
 * Same quality ladder as the main player: High (1080p/30fps) is the
 * default because it keeps text sharp without choking the encoder.
 */
import type { StudioRecordingQuality } from "@/lib/studio";

export interface RecordingPreset {
  width: number;
  height: number;
  frameRate: number;
  videoBitsPerSecond: number;
  label: string;
}

export const STUDIO_RECORDING_PRESETS: Record<
  StudioRecordingQuality,
  RecordingPreset
> = {
  standard: {
    width: 1280,
    height: 720,
    frameRate: 30,
    videoBitsPerSecond: 5_000_000,
    label: "Standard (720p / 30fps)",
  },
  high: {
    width: 1920,
    height: 1080,
    frameRate: 30,
    videoBitsPerSecond: 10_000_000,
    label: "High (1080p / 30fps)",
  },
  ultra: {
    width: 2560,
    height: 1440,
    frameRate: 60,
    videoBitsPerSecond: 30_000_000,
    label: "Ultra (1440p / 60fps)",
  },
  "4k": {
    width: 3840,
    height: 2160,
    frameRate: 60,
    videoBitsPerSecond: 60_000_000,
    label: "4K (2160p / 60fps)",
  },
};

export function studioRecordingConstraints(
  quality: StudioRecordingQuality,
): MediaStreamConstraints {
  const p = STUDIO_RECORDING_PRESETS[quality];
  return {
    video: {
      width: { ideal: p.width },
      height: { ideal: p.height },
      frameRate: { ideal: p.frameRate },
    },
    audio: true,
  };
}

export function pickStudioMimeType(): string {
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];
  if (typeof MediaRecorder === "undefined") return "";
  return candidates.find((m) => MediaRecorder.isTypeSupported(m)) ?? "";
}
