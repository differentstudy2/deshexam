// src/lib/assessment-types.ts

export type AssessmentDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert';
export type AssessmentStatus = 'Draft' | 'Published' | 'Archived';

// Base metadata shared across assessments
export interface AssessmentBase {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  
  // Taxonomies
  boardId?: string;
  classId?: string;
  subjectId?: string;
  textbookId?: string;
  chapterId?: string;
  topicId?: string;
  examIds?: string[];
  yearId?: string;
  tags?: string[];
  verificationBadges?: string[];

  questionIds: string[]; // Link to QuestionBankEntry
  difficulty: AssessmentDifficulty;
  
  seoTitle?: string;
  seoDescription?: string;
  status: AssessmentStatus;

  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface PracticeSet extends AssessmentBase {
  estimatedTimeMin?: number; // Estimated completion time in minutes
}

export interface Quiz extends AssessmentBase {
  timeLimitMin: number;
  passingScorePercent: number;
  showAnswersAfterSubmission: boolean;
  showExplanation: boolean;
  attemptsAllowed: number; // 0 for unlimited
  certificateOption: boolean;
}

export interface MockTest extends AssessmentBase {
  durationMin: number;
  totalMarks: number;
  negativeMarking: number; // e.g., 0.25
  passingMarks: number;
  attemptsAllowed: number;
  instructions: string;
  examRules: string;
}

export interface ExamSeries {
  id: string;
  seriesTitle: string;
  slug: string;
  description: string;
  includedMockTestIds: string[]; // Link to MockTest
  banner?: string;
  difficulty: AssessmentDifficulty;
  targetExamId?: string;
  status: AssessmentStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExamPaper extends AssessmentBase {
  examName: string;
  yearId: string;
  pdfUrl?: string; // Optional raw PDF
  solutionsPdfUrl?: string;
  answerKeyPdfUrl?: string;
  verificationStatus: string;
}

export interface DailyChallenge extends AssessmentBase {
  activeDate: string; // ISO date string "YYYY-MM-DD"
  rewardPoints: number;
  leaderboardEnabled: boolean;
  badgeReward?: string;
}
