// DeshExam — West Bengal Board taxonomy & clearly-marked SAMPLE content.
// Phase 2 of the Production Readiness spec. All records below are SAMPLES
// (labelled `sample: true`); they must be replaced by real DB content before
// launch. Never present them as real enrolment/rating/test data.

export type Board = "WBBSE" | "WBCHSE";
export type Medium = "bn" | "en";
export type ContentType =
  | "Chapter MCQ"
  | "Mock Test"
  | "Previous Year Paper"
  | "Suggestion"
  | "Notes"
  | "Video"
  | "Live Class";
export type ExamStage =
  | "Unit Test"
  | "Half-Yearly"
  | "Annual"
  | "Madhyamik"
  | "Higher Secondary";

export const CLASSES = [5, 6, 7, 8, 9, 10, 11, 12] as const;
export type ClassNumber = (typeof CLASSES)[number];

export function boardForClass(n: number): Board {
  return n <= 10 ? "WBBSE" : "WBCHSE";
}

export function classLabel(n: number): string {
  if (n === 10) return "ক্লাস ১০ · মাধ্যমিক";
  if (n === 12) return "ক্লাস ১২ · উচ্চমাধ্যমিক";
  return `ক্লাস ${toBn(n)}`;
}

export function toBn(n: number | string): string {
  return String(n).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);
}

export const SUBJECTS_BY_CLASS: Record<number, string[]> = {
  5: ["বাংলা", "English", "গণিত", "বিজ্ঞান", "ইতিহাস", "ভূগোল"],
  6: ["বাংলা", "English", "গণিত", "বিজ্ঞান", "ইতিহাস", "ভূগোল"],
  7: ["বাংলা", "English", "গণিত", "বিজ্ঞান", "ইতিহাস", "ভূগোল"],
  8: ["বাংলা", "English", "গণিত", "বিজ্ঞান", "ইতিহাস", "ভূগোল"],
  9: ["বাংলা", "English", "গণিত", "ভৌতবিজ্ঞান", "জীবনবিজ্ঞান", "ইতিহাস", "ভূগোল"],
  10: ["বাংলা", "English", "গণিত", "ভৌতবিজ্ঞান", "জীবনবিজ্ঞান", "ইতিহাস", "ভূগোল"],
  11: ["পদার্থবিদ্যা", "রসায়ন", "গণিত", "জীববিদ্যা", "বাংলা", "English", "কম্পিউটার বিজ্ঞান", "হিসাবশাস্ত্র", "রাষ্ট্রবিজ্ঞান", "ইতিহাস", "ভূগোল", "শিক্ষাবিজ্ঞান"],
  12: ["পদার্থবিদ্যা", "রসায়ন", "গণিত", "জীববিদ্যা", "বাংলা", "English", "কম্পিউটার বিজ্ঞান", "হিসাবশাস্ত্র", "রাষ্ট্রবিজ্ঞান", "ইতিহাস", "ভূগোল", "শিক্ষাবিজ্ঞান"],
};

export const MEDIUMS: { id: Medium; label: string; short: string }[] = [
  { id: "bn", label: "বাংলা মাধ্যম", short: "বাংলা" },
  { id: "en", label: "English Medium", short: "English" },
];

export interface WbContent {
  id: string;
  title: string;
  class: number;
  board: Board;
  medium: Medium;
  subject: string;
  contentType: ContentType;
  examStage?: ExamStage;
  questions?: number;
  minutes?: number;
  lessons?: number;
  price?: number; // INR, 0 = Free
  oldPrice?: number;
  difficulty?: "সহজ" | "মাঝারি" | "কঠিন";
  sample: true;
}

export const SAMPLE_MOCK_TESTS: WbContent[] = [
  { id: "mt-10-life-mock-1", title: "ক্লাস ১০ জীবনবিজ্ঞান — মক টেস্ট ১", class: 10, board: "WBBSE", medium: "bn", subject: "জীবনবিজ্ঞান", contentType: "Mock Test", examStage: "Madhyamik", questions: 40, minutes: 60, price: 0, difficulty: "মাঝারি", sample: true },
  { id: "mt-10-math-mock-1", title: "ক্লাস ১০ গণিত — মক টেস্ট ১", class: 10, board: "WBBSE", medium: "bn", subject: "গণিত", contentType: "Mock Test", examStage: "Madhyamik", questions: 40, minutes: 60, price: 0, difficulty: "মাঝারি", sample: true },
  { id: "mt-12-phy-mock-1", title: "ক্লাস ১২ পদার্থবিদ্যা — মক টেস্ট ১", class: 12, board: "WBCHSE", medium: "bn", subject: "পদার্থবিদ্যা", contentType: "Mock Test", examStage: "Higher Secondary", questions: 35, minutes: 60, price: 0, difficulty: "কঠিন", sample: true },
  { id: "mt-9-eng-mock-1", title: "Class 9 English — Mock Test 1", class: 9, board: "WBBSE", medium: "en", subject: "English", contentType: "Mock Test", examStage: "Annual", questions: 40, minutes: 60, price: 0, difficulty: "সহজ", sample: true },
  { id: "mt-10-phy-mock-1", title: "ক্লাস ১০ ভৌতবিজ্ঞান — মক টেস্ট ১", class: 10, board: "WBBSE", medium: "bn", subject: "ভৌতবিজ্ঞান", contentType: "Mock Test", examStage: "Madhyamik", questions: 40, minutes: 60, price: 0, difficulty: "মাঝারি", sample: true },
  { id: "mt-11-chem-mock-1", title: "ক্লাস ১১ রসায়ন — মক টেস্ট ১", class: 11, board: "WBCHSE", medium: "bn", subject: "রসায়ন", contentType: "Mock Test", examStage: "Half-Yearly", questions: 35, minutes: 60, price: 0, difficulty: "মাঝারি", sample: true },
];

export const SAMPLE_COURSES: WbContent[] = [
  { id: "c-10-life", title: "ক্লাস ১০ জীবনবিজ্ঞান — সম্পূর্ণ কোর্স", class: 10, board: "WBBSE", medium: "bn", subject: "জীবনবিজ্ঞান", contentType: "Video", lessons: 24, price: 0, sample: true },
  { id: "c-12-math", title: "ক্লাস ১২ গণিত — সম্পূর্ণ কোর্স", class: 12, board: "WBCHSE", medium: "bn", subject: "গণিত", contentType: "Video", lessons: 30, price: 0, sample: true },
  { id: "c-9-bengali", title: "ক্লাস ৯ বাংলা — সম্পূর্ণ কোর্স", class: 9, board: "WBBSE", medium: "bn", subject: "বাংলা", contentType: "Video", lessons: 18, price: 0, sample: true },
  { id: "c-10-phy", title: "ক্লাস ১০ ভৌতবিজ্ঞান — সম্পূর্ণ কোর্স", class: 10, board: "WBBSE", medium: "bn", subject: "ভৌতবিজ্ঞান", contentType: "Video", lessons: 22, price: 0, sample: true },
];

export const SAMPLE_NOTES: WbContent[] = [
  { id: "n-10-life-ch1", title: "ক্লাস ১০ জীবনবিজ্ঞান: অধ্যায়ভিত্তিক নোট", class: 10, board: "WBBSE", medium: "bn", subject: "জীবনবিজ্ঞান", contentType: "Notes", price: 0, sample: true },
  { id: "n-12-chem-ch1", title: "ক্লাস ১২ রসায়ন: অধ্যায়ভিত্তিক নোট", class: 12, board: "WBCHSE", medium: "bn", subject: "রসায়ন", contentType: "Notes", price: 0, sample: true },
  { id: "n-10-math-ch1", title: "ক্লাস ১০ গণিত: অধ্যায়ভিত্তিক নোট", class: 10, board: "WBBSE", medium: "bn", subject: "গণিত", contentType: "Notes", price: 0, sample: true },
  { id: "n-9-hist-ch1", title: "ক্লাস ৯ ইতিহাস: অধ্যায়ভিত্তিক নোট", class: 9, board: "WBBSE", medium: "bn", subject: "ইতিহাস", contentType: "Notes", price: 0, sample: true },
];

// Demo test — 5 original sample questions, clearly labelled Sample (Phase 4.5).
export interface DemoQuestion {
  q: string;
  options: string[];
  answer: number;
  explain: string;
  subject: string;
}

export const DEMO_QUESTIONS: DemoQuestion[] = [
  { q: "সালোকসংশ্লেষ প্রক্রিয়ায় উদ্ভিদ কোন গ্যাস গ্রহণ করে?", options: ["অক্সিজেন", "কার্বন ডাই-অক্সাইড", "নাইট্রোজেন", "হাইড্রোজেন"], answer: 1, explain: "সালোকসংশ্লেষে উদ্ভিদ বাতাস থেকে কার্বন ডাই-অক্সাইড গ্রহণ করে।", subject: "জীবনবিজ্ঞান" },
  { q: "১৫ + ২৭ = ?", options: ["৪০", "৪১", "৪২", "৪৩"], answer: 2, explain: "১৫ + ২৭ = ৪২।", subject: "গণিত" },
  { q: "‘সূর্য’ শব্দের সমার্থক শব্দ কোনটি?", options: ["চাঁদ", "রবি", "তারা", "মেঘ"], answer: 1, explain: "‘রবি’ সূর্যের সমার্থক শব্দ।", subject: "বাংলা" },
  { q: "ভারতের জাতীয় পাখি কোনটি?", options: ["কাক", "ময়ূর", "টিয়া", "পায়রা"], answer: 1, explain: "ময়ূর ভারতের জাতীয় পাখি।", subject: "ভূগোল" },
  { q: "জলের রাসায়নিক সংকেত কোনটি?", options: ["CO₂", "O₂", "H₂O", "NaCl"], answer: 2, explain: "জলের রাসায়নিক সংকেত H₂O।", subject: "ভৌতবিজ্ঞান" },
];

export const PLANS = [
  { id: "basic", name: "Basic", price: 50, oldPrice: 100, features: ["অধ্যায়ভিত্তিক MCQ অনুশীলন", "আগের বছরের প্রশ্নপত্র", "বিনামূল্যের ডেমো টেস্ট"] },
  { id: "plus", name: "Plus", price: 100, oldPrice: 250, features: ["Basic-এর সব সুবিধা", "মক টেস্ট ও সাজেশন", "অধ্যায়ভিত্তিক নোট", "ফলাফল বিশ্লেষণ"], popular: true },
  { id: "pro", name: "Pro", price: 200, oldPrice: 400, features: ["Plus-এর সব সুবিধা", "ভিডিও ক্লাস", "লাইভ ক্লাস", "সব বিষয় ও সব ক্লাস"] },
] as const;
