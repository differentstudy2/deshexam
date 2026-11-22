import type { StudioBgTheme } from "@/lib/studio";
import type { StudioRecordingQuality } from "@/lib/studio";

export type StudioStage = "launch" | "questions" | "end";

/** The live facts the studio player shows — nothing invented. */
export interface StudioTest {
  title: string;
  slug: string;
  type: string;
  classLine?: string;
  topicLine?: string;
  language?: string;
  durationMin?: number;
  totalMarks?: number;
  negativeMarking?: number;
  /** Shown only when the assessment record really has one. */
  difficulty?: string;
}

export interface StudioPlayerProps {
  questions: any[];
  test: StudioTest;
  theme: StudioBgTheme;
  recordingQuality: StudioRecordingQuality;
  onClose: () => void;
  onThemeChange?: (t: StudioBgTheme) => void;
  onRecordingQualityChange?: (q: StudioRecordingQuality) => void;
}
