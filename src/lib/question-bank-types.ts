export type QuestionStatus = 'Draft' | 'Published' | 'Archived' | 'Featured' | 'Premium' | 'Free';
export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert';
export type QuestionLanguage = 'Bangla' | 'English' | 'Hindi' | 'Arabic';
export type QuestionType = 
  | 'MCQ'
  | 'T/F'
  | 'FIB'
  | 'Match'
  | 'CQ'
  | 'Desc'
  | 'Model Test'
  | 'Practice Set'
  | 'Quiz'
  | 'Mock Test'
  | 'Exam Paper';

// Base taxonomy node for Board -> Class -> Subject -> Textbook -> Chapter -> Topic
export interface TaxonomyNode {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  
  // SEO Metadata
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionBoard extends TaxonomyNode {}
export interface QuestionClass extends TaxonomyNode { boardId: string; }
export interface QuestionSubject extends TaxonomyNode { classId: string; }
export interface QuestionTextbook extends TaxonomyNode { subjectId: string; }
export interface QuestionChapter extends TaxonomyNode { textbookId: string; }
export interface QuestionTopic extends TaxonomyNode { chapterId: string; }
export interface QuestionExam extends TaxonomyNode {}
export interface QuestionYear extends TaxonomyNode {}

export interface QuestionBankEntry {
  id: string;
  questionType?: QuestionType;
  
  // Content
  title?: string;
  questionText: string;
  
  // Media
  questionImage?: string;
  questionAudio?: string;
  questionVideo?: string;

  // Options (for MCQ)
  options?: {
    a: string;
    b: string;
    c: string;
    d: string;
    e?: string;
  };
  
  correctAnswer: string; // E.g., 'A', 'B', 'C', 'D' or actual text
  
  // Matching Questions
  matchingPairs?: { left: string; right: string; leftImage?: string; rightImage?: string }[];
  
  // Explanations
  explanation?: string;
  shortExplanation?: string;
  detailedExplanation?: string;
  
  // Metadata
  difficulty: QuestionDifficulty;
  status: QuestionStatus;
  language?: QuestionLanguage;
  contentType?: string;
  marks?: number;
  tags?: string[];
  
  // Source info
  sourceExam?: string;
  sourceBoard?: string;
  sourceYear?: string;
  references?: string;

  // Hierarchy bindings
  boardId?: string;
  classId?: string;
  subjectId?: string;
  textbookId?: string;
  chapterId?: string;
  topicId?: string;
  yearId?: string;
  
  // Exams bindings
  examIds?: string[];
  
  // SEO
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  
  // Verification System
  isVerified?: boolean;
  verificationLevel?: string;
  verifiedBy?: string;
  verifiedByName?: string;
  verifiedDesignation?: string;
  verifiedAt?: string; // Storing as ISO string or Date
  verificationNote?: string;
  verificationScore?: number;
  qaChecklist?: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

// Flat structure corresponding to Bulk Import CSV/Excel
export interface QuestionImportRow {
  Board: string;
  Class: string;
  Subject: string;
  Textbook: string;
  Chapter: string;
  Topic: string;
  'Question Type': string;
  Question: string;
  'Option A': string;
  'Option B': string;
  'Option C': string;
  'Option D': string;
  'Option E': string;
  'Correct Answer': string;
  Explanation: string;
  Difficulty: string;
  Exam: string;
  Year: string;
  Tags: string;
  Slug: string;
  Status: string;
}
