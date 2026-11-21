import type { StudioBgTheme } from "@/lib/studio";

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
}

export interface StudioPlayerProps {
  questions: any[];
  test: StudioTest;
  theme: StudioBgTheme;
  onClose: () => void;
}
