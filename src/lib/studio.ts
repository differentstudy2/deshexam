/**
 * DeshExam Studio — shared, client-safe helpers.
 *
 * Theme + recording-quality options mirror the PresentationOverlay's own
 * settings exactly, so the studio can pass them in as initial values.
 * Nothing here is fake: counts come from the assessments passed in, and
 * the taxonomy titles come from the same hardcoded registry the
 * presentation list page uses.
 */
import { getHardcodedTaxonomyNodes } from "@/data/hardcoded/taxonomy";

export type StudioBgTheme =
  | "default"
  | "mesh"
  | "grid"
  | "dots"
  | "video"
  | "midnight"
  | "aurora"
  | "sunset"
  | "cyberpunk"
  | "ocean"
  | "forest"
  | "fire"
  | "nebula"
  | "hologram"
  | "solid";

export type StudioRecordingQuality = "standard" | "high" | "ultra" | "4k";

export const STUDIO_THEMES: { id: StudioBgTheme; label: string }[] = [
  { id: "grid", label: "গ্রিড" },
  { id: "default", label: "সাধারণ" },
  { id: "dots", label: "ডট" },
  { id: "mesh", label: "মেশ" },
  { id: "video", label: "ভিডিও" },
  { id: "midnight", label: "মধ্যরাত" },
  { id: "aurora", label: "অরোরা" },
  { id: "sunset", label: "সূর্যাস্ত" },
  { id: "cyberpunk", label: "সাইবারপাঙ্ক" },
  { id: "ocean", label: "সমুদ্র" },
  { id: "forest", label: "বন" },
  { id: "fire", label: "আগুন" },
  { id: "nebula", label: "নীহারিকা" },
  { id: "hologram", label: "হলোগ্রাম" },
  { id: "solid", label: "একরঙা" },
];

export const STUDIO_RECORDING_QUALITIES: {
  id: StudioRecordingQuality;
  label: string;
  hint: string;
}[] = [
  { id: "standard", label: "স্ট্যান্ডার্ড", hint: "720p / 30fps" },
  { id: "high", label: "হাই", hint: "1080p / 30fps" },
  { id: "ultra", label: "আল্ট্রা", hint: "1440p / 60fps" },
  { id: "4k", label: "4K", hint: "2160p / 60fps" },
];

export function getStudioQuestionCount(t: any): number {
  return (
    (t.questions && t.questions.length) ||
    (t.questionIds && t.questionIds.length) ||
    t.questionCount ||
    t.totalQuestions ||
    0
  );
}

const BN_TITLES: Record<string, string> = {
  "Class 1": "প্রথম শ্রেণি",
  "Class 2": "দ্বিতীয় শ্রেণি",
  "Class 3": "তৃতীয় শ্রেণি",
  "Class 4": "চতুর্থ শ্রেণি",
  "Class 5": "পঞ্চম শ্রেণি",
  "Class 6": "ষষ্ঠ শ্রেণি",
  "Class 7": "সপ্তম শ্রেণি",
  "Class 8": "অষ্টম শ্রেণি",
  "Class 9": "নবম শ্রেণি",
  "Class 10": "দশম শ্রেণি",
  "Class 11": "একাদশ শ্রেণি",
  "Class 12": "দ্বাদশ শ্রেণি",
  "Bengali Literature": "বাংলা",
  Bengali: "বাংলা",
  English: "ইংরেজি",
  Mathematics: "গণিত",
  "Environmental Science": "পরিবেশ বিজ্ঞান",
  "Life Science": "জীবন বিজ্ঞান",
  "Physical Science": "ভৌত বিজ্ঞান",
  History: "ইতিহাস",
  Geography: "ভূগোল",
  WBBSE: "WBBSE",
  WBBPE: "WBBPE",
  WBCHSE: "WBCHSE",
  "Sahaj Path": "সহজ পাঠ",
  "Sahaj Path Pratham Bhag": "সহজ পাঠ প্রথম ভাগ",
  "Sahaj Path Dwitiyo Bhag": "সহজ পাঠ দ্বিতীয় ভাগ",
  "Amar Ganit": "আমার গণিত",
  "Amader Paribesh": "আমাদের পরিবেশ",
  "Bhasha Path": "ভাষা পাঠ",
  Sahityamela: "সাহিত্যমেলা",
  "Pata Bahar": "পাতাবাহার",
};

/** Same taxonomy-title resolution as the presentation list page. */
export function getStudioTaxonomyTitle(
  id?: string,
  language?: string,
): string | null {
  if (!id) return null;
  if (/^[a-zA-Z0-9]{20}$/.test(id)) return null; // Ignore raw Firebase IDs
  let nodes: any[] = [];
  try {
    nodes = getHardcodedTaxonomyNodes() || [];
  } catch {
    nodes = [];
  }
  const node = nodes.find((n: any) => n.id === id);
  let title = node ? node.title : id;
  if (language === "Bengali" && BN_TITLES[title]) {
    title = BN_TITLES[title];
  }
  return title;
}
