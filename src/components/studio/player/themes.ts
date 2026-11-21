/**
 * Studio player themes — small, self-contained.
 * The overlay's theme system lives in PresentationOverlay; the studio
 * player has its own copy here so the two players never share code.
 */
import type { StudioBgTheme } from "@/lib/studio";

export const DARK_STUDIO_THEMES: StudioBgTheme[] = [
  "video",
  "midnight",
  "aurora",
  "sunset",
  "cyberpunk",
  "ocean",
  "forest",
  "fire",
  "nebula",
  "hologram",
  "solid",
];

export function isDarkStudioTheme(theme: StudioBgTheme): boolean {
  return DARK_STUDIO_THEMES.includes(theme);
}

/** Stage background for a studio theme. */
export function studioThemeBg(theme: StudioBgTheme): string {
  switch (theme) {
    case "grid":
      return "bg-[#f8fafc]";
    case "dots":
      return "bg-[#f8fafc]";
    case "mesh":
      return "bg-gradient-to-br from-indigo-100 via-purple-50 to-teal-100";
    case "video":
      return "bg-black/90";
    case "midnight":
      return "bg-slate-950";
    case "aurora":
      return "bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#022c22]";
    case "sunset":
      return "bg-gradient-to-br from-[#4c1d95] via-[#9f1239] to-[#fb923c]";
    case "cyberpunk":
      return "bg-gradient-to-br from-[#1a0b2e] via-[#120521] to-[#0a0014]";
    case "ocean":
      return "bg-gradient-to-br from-[#061e36] via-[#021021] to-[#00050c]";
    case "forest":
      return "bg-gradient-to-br from-[#082b1d] via-[#031c11] to-[#010c07]";
    case "fire":
      return "bg-gradient-to-br from-[#381008] via-[#210602] to-[#0f0200]";
    case "nebula":
      return "bg-gradient-to-br from-[#2a0e4a] via-[#15042b] to-[#0a001a]";
    case "hologram":
      return "bg-gradient-to-br from-[#0a2e30] via-[#041a1c] to-[#010d0e]";
    case "solid":
      return "bg-slate-900";
    default:
      return "bg-slate-50";
  }
}
