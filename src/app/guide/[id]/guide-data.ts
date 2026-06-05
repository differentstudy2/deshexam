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
        ]
      }
    ]
  }
];

// --- Reading Content Mock Data ---

export type ReadingContentData = {
  id: string;
  title: string;
  subtitle: string;
  views: number;
  author: {
    name: string;
    avatarUrl: string;
  };
  contentBlocks: {
    word: string;
    meaning: string;
  }[];
};

export const readingContentData: Record<string, ReadingContentData> = {
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
      { word: 'কুঞ্জ', meaning: 'লতাপাতায় আচ্ছাদিত বৃক্ষাকার স্থান, উপবন' },
      { word: 'বেরিবেরি', meaning: 'বি ভিটামিনের অভাবে হাত-পা ফুলে যাওয়া রোগ।' },
      { word: 'আসামি', meaning: 'এ শব্দটি দিয়ে সাধারণত আদালতে কোনো অপরাধের দায়ে অভিযুক্ত ব্যক্তিদের বোঝানো হয়ে থাকে। কিন্তু এখানে রোগাক্রান্তদের বোঝানো হয়েছে।' },
      { word: 'পাণ্ডুর', meaning: 'ফ্যাকশে।' },
      { word: 'মালি', meaning: 'মালা রচনাকারী, মালাকর। বেতনের বিনিময়ে বাগানের কাজে নিযুক্ত ব্যক্তি।' },
      { word: 'মালিনী', meaning: 'মালির স্ত্রী।' },
    ]
  }
};

// --- Helpers ---

export function getGuidePageType(id: string): 'subject' | 'content' {
  // Simulate checking if the ID belongs to a subject
  const isSubject = sidebarSubjects.some(s => s.id === id) || id === '0';
  if (isSubject) return 'subject';

  // Everything else is considered reading content for now
  return 'content';
}
