export interface AudioFormData {
  // Basic
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  language: string;
  status: string;

  // Media
  provider: string;
  audioUrl: string;
  thumbnail: string;
  featureImage: string;
  duration: string;
  durationSeconds: number;

  // Classification
  audioType: string;
  boardId: string;
  classId: string;
  subjectId: string;
  chapterId: string;
  topicId: string;

  // Instructor
  instructorName: string;
  instructorAvatar: string;
  instructorBio: string;
  instructorQualification: string;

  // Transcript
  transcript: string;

  // Resources
  attachments: any[];
  resources: any[];

  // Tags
  tags: string[];
  tagInput?: string; // For the UI

  // Premium
  isPremium: boolean;
  previewDuration: number;
  allowDownload: boolean;

  // SEO
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;

  // Analytics
  views: number;
  listens: number;
  completionRate: number;
  likes: number;
  bookmarks: number;

  relatedAudioIds: string[];
  schemaEnabled: boolean;
}

export const defaultAudioFormData: AudioFormData = {
  // Basic
  title: '',
  slug: '',
  description: '',
  shortDescription: '',
  language: 'english',
  status: 'draft',

  // Media
  provider: 'upload',
  audioUrl: '',
  thumbnail: '',
  featureImage: '',
  duration: '',
  durationSeconds: 0,

  // Classification
  audioType: 'lesson',
  boardId: '',
  classId: '',
  subjectId: '',
  chapterId: '',
  topicId: '',

  // Instructor
  instructorName: 'DeshExam',
  instructorAvatar: '',
  instructorBio: '',
  instructorQualification: '',

  // Transcript
  transcript: '',

  // Resources
  attachments: [],
  resources: [],

  // Tags
  tags: [],
  tagInput: '',

  // Premium
  isPremium: false,
  previewDuration: 60,
  allowDownload: false,

  // SEO
  seoTitle: '',
  seoDescription: '',
  focusKeyword: '',
  canonicalUrl: '',
  ogTitle: '',
  ogDescription: '',
  ogImage: '',

  // Analytics
  views: 0,
  listens: 0,
  completionRate: 0,
  likes: 0,
  bookmarks: 0,

  relatedAudioIds: [],
  schemaEnabled: true
};
