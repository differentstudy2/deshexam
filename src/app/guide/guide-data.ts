export type Subtopic = {
  id: string;
  title: string;
  type: 'subtopic';
};

export type Topic = {
  id: string;
  title: string;
  type: 'topic';
  subtopics: Subtopic[];
};

export type Chapter = {
  id: string;
  title: string;
  topics: Topic[];
};

export type SidebarSubject = {
  id: string;
  title: string;
  countStr: string;
  textbooks?: { id: string, title: string }[];
};

// --- Dashboard Mock Data ---

export const sidebarSubjects: SidebarSubject[] = [
  { id: 'sahitya-kanika', title: 'সাহিত্য কণিকা', countStr: '4.2k' },
  { id: 'bangla-byakoron', title: 'বাংলা ব্যাকরণ ও নির্মিতি', countStr: '1k' },
  { id: 'english-for-today', title: 'English for Today', countStr: '3.2k' },
  { id: 'gonit', title: 'গণিত', countStr: '4.7k' },
  { id: 'ict', title: 'তথ্য ও যোগাযোগ প্রযুক্তি', countStr: '1.2k' },
];

export const curriculumData: Chapter[] = [
  {
    id: 'c1',
    title: 'গদ্য',
    topics: [
      {
        id: 'otithir-sriti',
        title: 'অতিথির স্মৃতি (শরৎচন্দ্র চট্টোপাধ্যায়)',
        type: 'topic',
        subtopics: [
          { id: 'shobdartho', title: 'শব্দার্থ ও টীকা', type: 'subtopic' },
          { id: 'pather-uddeshsho', title: 'পাঠের উদ্দেশ্য', type: 'subtopic' },
          { id: 'path-porichiti', title: 'পাঠ-পরিচিতি', type: 'subtopic' },
          { id: 'lekhok-porichiti', title: 'লেখক পরিচিতি', type: 'subtopic' },
          { id: 'kormo-onushilon', title: 'কর্ম-অনুশীলন', type: 'subtopic' },
        ]
      },
      {
        id: 'pore-pawa',
        title: 'পড়ে পাওয়া (বিভূতিভূষণ বন্দ্যোপাধ্যায়)',
        type: 'topic',
        subtopics: [
          { id: 'pp-shobdartho', title: 'শব্দার্থ ও টীকা', type: 'subtopic' },
          { id: 'pp-pather', title: 'পাঠের উদ্দেশ্য', type: 'subtopic' },
          { id: 'pp-path', title: 'পাঠ-পরিচিতি', type: 'subtopic' },
          { id: 'pp-lekhok', title: 'লেখক পরিচিতি', type: 'subtopic' },
          { id: 'pp-kormo', title: 'কর্ম-অনুশীলন', type: 'subtopic' },
          { id: 'pp-mcq', title: 'বহুনির্বাচনি প্রশ্ন', type: 'subtopic' },
          { id: 'pp-cq', title: 'সৃজনশীল প্রশ্ন', type: 'subtopic' },
        ]
      },
      {
        id: 'toilochitrer-vut',
        title: 'তৈলচিত্রের ভূত (মানিক বন্দ্যোপাধ্যায়)',
        type: 'topic',
        subtopics: [
          { id: 'tv-shobdartho', title: 'শব্দার্থ ও টীকা', type: 'subtopic' },
          { id: 'tv-pather', title: 'পাঠের উদ্দেশ্য', type: 'subtopic' },
          { id: 'tv-path', title: 'পাঠ-পরিচিতি', type: 'subtopic' },
          { id: 'tv-lekhok', title: 'লেখক-পরিচিতি', type: 'subtopic' },
          { id: 'tv-kormo', title: 'কর্ম-অনুশীলন', type: 'subtopic' },
          { id: 'tv-mcq', title: 'বহুনির্বাচনি প্রশ্ন', type: 'subtopic' },
          { id: 'tv-cq', title: 'সৃজনশীল প্রশ্ন', type: 'subtopic' },
        ]
      },
      {
        id: 'amader-lokoshilpo',
        title: 'আমাদের লোকশিল্প (কামরুল হাসান)',
        type: 'topic',
        subtopics: [
          { id: 'al-shobdartho', title: 'শব্দার্থ ও টীকা', type: 'subtopic' },
          { id: 'al-pather', title: 'পাঠের উদ্দেশ্য', type: 'subtopic' },
          { id: 'al-path', title: 'পাঠ-পরিচিতি', type: 'subtopic' },
          { id: 'al-lekhok', title: 'লেখক-পরিচিতি', type: 'subtopic' },
          { id: 'al-kormo', title: 'কর্ম-অনুশীলন', type: 'subtopic' },
        ]
      },
      {
        id: 'sukhi-manush',
        title: 'সুখী মানুষ (মমতাজউদদীন আহমদ)',
        type: 'topic',
        subtopics: [
          { id: 'sm-shobdartho', title: 'শব্দার্থ ও টীকা', type: 'subtopic' },
          { id: 'sm-pather', title: 'পাঠের উদ্দেশ্য', type: 'subtopic' },
          { id: 'sm-path', title: 'পাঠ-পরিচিতি', type: 'subtopic' },
        ]
      },
      {
        id: 'mongdur-pothe',
        title: 'মংডুর পথে (অন্নদাশঙ্কর রায়)',
        type: 'topic',
        subtopics: [
          { id: 'mp-shobdartho', title: 'শব্দার্থ ও টীকা', type: 'subtopic' },
          { id: 'mp-pather', title: 'পাঠের উদ্দেশ্য', type: 'subtopic' },
          { id: 'mp-path', title: 'পাঠ-পরিচিতি', type: 'subtopic' },
        ]
      },
      {
        id: 'bangla-noboborsho',
        title: 'বাংলা নববর্ষ (শামসুজ্জামান খান)',
        type: 'topic',
        subtopics: [
          { id: 'bn-shobdartho', title: 'শব্দার্থ ও টীকা', type: 'subtopic' },
          { id: 'bn-pather', title: 'পাঠের উদ্দেশ্য', type: 'subtopic' },
        ]
      },
      {
        id: 'bangla-vashar-jonmokotha',
        title: 'বাংলা ভাষার জন্মকথা (হুমায়ুন আজাদ)',
        type: 'topic',
        subtopics: [
          { id: 'bv-shobdartho', title: 'শব্দার্থ ও টীকা', type: 'subtopic' },
        ]
      }
    ]
  },
  {
    id: 'c2',
    title: 'কবিতা',
    topics: [
      {
        id: 'manob-dhormo',
        title: 'মানব ধর্ম (লালন শাহ)',
        type: 'topic',
        subtopics: [
          { id: 'md-shobdartho', title: 'শব্দার্থ ও টীকা', type: 'subtopic' },
          { id: 'md-pather', title: 'পাঠের উদ্দেশ্য', type: 'subtopic' },
        ]
      }
    ]
  }
];

// --- Reading Content Mock Data ---

export type ContentAuthor = {
  name: string;
  avatarUrl: string;
};

export type ContentSection =
  | { id?: string; type: 'article'; title: string; body: string; body_en?: string; author: ContentAuthor; badges?: string[] }
  | { id?: string; type: 'mcq'; title: string; questions: { q: string; options: string[]; correctIdx: number }[]; author: ContentAuthor }
  | { id?: string; type: 'subtopic'; title: string; content: { word?: string; meaning?: string; text?: string }[]; author: ContentAuthor }
  | { id?: string; type: 'pdf'; title: string; pdfData: { id?: string; title?: string; url?: string; description?: string; tags?: string }[]; author: ContentAuthor }
  | { id?: string; type: 'video'; title: string; videoData: { id?: string; title?: string; url?: string; description?: string; tags?: string }[]; author: ContentAuthor }
  | { id?: string; type: 'audio'; title: string; audioData: { id?: string; title?: string; url?: string; description?: string; tags?: string }[]; author: ContentAuthor };

export type ReadingContentData = {
  id: string;
  title: string;
  subtitle?: string;
  views?: number;
  author?: ContentAuthor;
  contentBlocks?: { word: string; meaning: string }[]; // Legacy support
  content?: string; // Legacy string content
  sections?: ContentSection[]; // New complex format
  tags?: string[];
};

const defaultAuthor: ContentAuthor = {
  name: 'Sattar Uddin Sohel',
  avatarUrl: 'https://i.pravatar.cc/150?u=sattar',
};

export const readingContentData: Record<string, ReadingContentData> = {
  'default': {
    id: 'default',
    title: 'Content not found',
    sections: [
      {
        type: 'article',
        title: 'Empty Content',
        body: 'No content has been added for this specific topic yet.',
        author: defaultAuthor,
      }
    ]
  },
  'shobdartho': {
    id: 'shobdartho',
    title: 'শব্দার্থ ও টীকা',
    subtitle: 'গদ্য - সাহিত্য কণিকা - অষ্টম শ্রেণি | NCTB BOOK',
    views: 812,
    author: {
      name: 'Rezwan Siddiki Tamim',
      avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    },
    contentBlocks: [
      { word: 'ভজন', meaning: 'ঈশ্বর বা দেবদেবীর স্তুতি বা মহিমাকীর্তন। প্রার্থনামূলক গান।' },
      { word: 'দোর', meaning: 'দুয়ার বা দরজা। বাড়ির ফটক।' },
    ]
  },
  'otithir-sriti': {
    id: 'otithir-sriti',
    title: 'অতিথির স্মৃতি',
    tags: ['বাংলা ১ম পত্র', 'অষ্টম শ্রেণি', 'সাহিত্য কণিকা', 'গদ্য', 'অতিথির স্মৃতি'],
    sections: [
      {
        type: 'article',
        title: 'অতিথির স্মৃতি (শরৎচন্দ্র চট্টোপাধ্যায়)',
        badges: ['MCQ: 2.3k', 'CQ: 1.8k', 'Practice'],
        author: defaultAuthor,
        body: 'চিকিৎসকের আদেশে দেওঘরে এসেছিলাম বায়ু-পরিবর্তনের জন্য। প্রাচীর-ঘেরা বাগানের মধ্যে একটা বড়ো বাড়িতে থাকি। রাত্রি তিনটে থেকে কাছে কোথাও একজনা গলাভাঙা একঘেয়ে সুরে ভজন শুরু করে। ঘুম ভেঙে যায়। দোর খুলে বারান্দায় এসে বসি। ধীরে ধীরে রাত্রি শেষ হয়ে আসে। পাখিদের আনাগোনা শুরু হয়। দেখতাম ওদের মধ্যে সবচেয়ে ভোরে ওঠে দোয়েল। অন্ধকার শেষ না হতেই তাদের গান আরম্ভ হয়। তারপর একে একে আসে বুলবুলি, শালিক, ময়না, টিয়া।\n\nএকদিন দেখি একটা কুকুর গেটের বাইরে দাঁড়িয়ে। আমি বললাম, "কাল থেকে তুই আমার অতিথি, আসবি তো?" সে লেজ নেড়ে সায় দিল। আমি চাকরদের বলে দিলাম, "অতিথিকে যেন খেতে দেওয়া হয়।" কিন্তু পরে জানতে পারলাম মালিনী তাকে তাড়িয়ে দেয়। আমার দেওঘর ছাড়ার সময় এল। স্টেশনে গিয়ে দেখি অতিথি দাঁড়িয়ে আছে। গাড়ি ছেড়ে দিলে সে একদৃষ্টে তাকিয়ে রইল।'
      },
      {
        type: 'mcq',
        title: 'বহুনির্বাচনি প্রশ্ন',
        author: defaultAuthor,
        questions: [
          { q: 'লেখক বায়ু-পরিবর্তনের জন্য কোথায় এসেছিলেন?', options: ['শিমলায়', 'দেওঘরে', 'দার্জিলিংয়ে', 'পুরীতে'], correctIdx: 1 },
          { q: 'রাত্রি কয়টা থেকে ভজন শুরু হতো?', options: ['দুটো', 'তিনটে', 'চারটে', 'পাঁচটা'], correctIdx: 1 },
          { q: 'সবচেয়ে ভোরে কোন পাখি ওঠে?', options: ['কোকিল', 'দোয়েল', 'শালিক', 'ময়না'], correctIdx: 1 },
          { q: 'অতিথিকে কে তাড়িয়ে দিত?', options: ['চাকররা', 'মালি', 'মালিনী', 'দারোয়ান'], correctIdx: 2 },
          { q: 'স্টেশনে লেখককে বিদায় জানাতে কে এসেছিল?', options: ['বন্ধুরা', 'মালিনী', 'অতিথি', 'চাকররা'], correctIdx: 2 }
        ]
      },
      {
        type: 'subtopic',
        title: 'শব্দার্থ ও টীকা',
        author: defaultAuthor,
        content: [
          { word: 'ভজন', meaning: 'ঈশ্বর বা দেবদেবীর স্তুতি বা মহিমাকীর্তন। প্রার্থনামূলক গান।' },
          { word: 'দোর', meaning: 'দুয়ার বা দরজা। বাড়ির ফটক।' },
          { word: 'পাণ্ডুর', meaning: 'ফ্যাকশে।' },
          { word: 'মালিনী', meaning: 'মালির স্ত্রী।' }
        ]
      },
      {
        type: 'subtopic',
        title: 'পাঠের উদ্দেশ্য',
        author: defaultAuthor,
        content: [
          { text: 'শিক্ষার্থীদের মনে প্রাণীর প্রতি সদয় আচরণের বিষয়ে আগ্রহী করে তোলা। সকল জীবের প্রতি সহানুভূতিশীল হওয়ার শিক্ষা দেওয়া।' }
        ]
      },
      {
        type: 'subtopic',
        title: 'পাঠ-পরিচিতি',
        author: defaultAuthor,
        content: [
          { text: 'শরৎচন্দ্র চট্টোপাধ্যায়ের "দেওঘরের স্মৃতি" গল্পটি পরিমার্জনা করে "অতিথির স্মৃতি" নামে সংকলন করা হয়েছে। একটি প্রাণীর সাথে একজন অসুস্থ মানুষের কয়েকদিনের পরিচয়ের মধ্য দিয়ে গড়ে ওঠা মায়ার সম্পর্কই এই গল্পের বিষয়। কিন্তু নানা প্রতিকূলতায় সে সম্পর্ক স্থায়ী রূপ পেতে বাধাগ্রস্ত হয়। এই গল্পে দেখানো হয়েছে, মানুষে মানুষে যেমন স্নেহের সম্পর্ক হতে পারে, তেমনি অন্য জীবের সাথেও মানুষের ভালোবাসার সম্পর্ক গড়ে উঠতে পারে।' }
        ]
      },
      {
        type: 'subtopic',
        title: 'লেখক পরিচিতি',
        author: defaultAuthor,
        content: [
          { text: 'শরৎচন্দ্র চট্টোপাধ্যায় ১৮৭৬ সালে হুগলি জেলার দেবানন্দপুর গ্রামে জন্মগ্রহণ করেন। তিনি বাংলা সাহিত্যের অন্যতম শ্রেষ্ঠ ঔপন্যাসিক। তাঁর বিখ্যাত উপন্যাসের মধ্যে রয়েছে দেবদাস, পল্লীসমাজ, শ্রীকান্ত, গৃহদাহ ইত্যাদি। ১৯৩৮ সালে তিনি কলকাতায় মৃত্যুবরণ করেন।' }
        ]
      },
      {
        type: 'subtopic',
        title: 'কর্ম-অনুশীলন',
        author: defaultAuthor,
        content: [
          { text: '১. তোমার দেখা বা পোষা কোনো প্রাণী সম্পর্কে একটি অনুচ্ছেদ লেখো।\n২. প্রাণীদের প্রতি মানুষের কী ধরনের আচরণ করা উচিত তা নিয়ে শ্রেণিকক্ষে আলোচনা করো।' }
        ]
      }
    ]
  }
};

// --- Helpers ---

export function getGuidePageType(id: string): 'subject' | 'chapter' | 'content' {
  // Simulate checking if the ID belongs to a subject
  const isSubject = sidebarSubjects.some(s => s.id === id) || id === '0';
  if (isSubject) return 'subject';

  // Check if it's a chapter (like "গদ্য" or "c1")
  const isChapter = curriculumData.some(c => c.id === id || id.includes('গদ্য') || id.includes('কবিতা'));
  if (isChapter) return 'chapter';

  // Everything else is considered reading content for now
  return 'content';
}
