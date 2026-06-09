export type QuestionStatus = 'Draft' | 'Published' | 'Archived' | 'Featured' | 'Premium' | 'Free';
export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert';
export type QuestionLanguage = 'Bangla' | 'English' | 'Hindi' | 'Arabic';

// Base taxonomy node for Board -> Class -> Subject -> Textbook -> Chapter -> Topic
export interface TaxonomyNode {
  id: string;
  name: string;
  slug: string;
  description?: string;
  
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

export interface QuestionBankEntry {
  id: string;
  
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
  
  // Explanations
  explanation?: string;
  shortExplanation?: string;
  detailedExplanation?: string;
  
  // Metadata
  difficulty: QuestionDifficulty;
  status: QuestionStatus;
  language?: QuestionLanguage;
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
  
  // Exams bindings
  examIds?: string[];
  
  // SEO
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  
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
  Question: string;
  'Option A': string;
  'Option B': string;
  'Option C': string;
  'Option D': string;
  'Correct Answer': string;
  Explanation: string;
  Difficulty: string;
  Exam: string;
  Year: string;
  Tags: string;
  Slug: string;
  Status: string;
}
