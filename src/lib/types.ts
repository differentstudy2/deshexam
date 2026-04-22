

export type Resource = {
    id: string;
    type: 'video' | 'audio' | 'pdf' | 'doc';
    title: string;
    url: string;
    featureImage?: string;
    duration?: number; // in minutes
};

export type Textbook = {
    id: string;
    title: string;
    description: string;
    subject: string;
    classCategory: string;
    class: string;
    featureImage?: string;
    access: 'free' | 'premium' | 'pro';
    price?: number;
    subscriptionPlan?: 'pass' | 'pro';
    board?: string;
};

export type Chapter = {
    id: string;
    title: string;
    content?: string;
    featureImage?: string;
    chapterPdfUrl?: string;
    topics: Topic[];
    resources?: Resource[];
    textbookQuestions?: Question[];
    practiceSets?: PracticeSet[];
    mockTests?: Test[];
    quizzes?: Test[];
    access: 'free' | 'pass' | 'pro';
};

export type Topic = {
    id: string;
    title: string;
    content?: string;
    practiceSets?: PracticeSet[];
    mockTests?: Test[];
    quizzes?: Test[];
    resources?: Resource[];
    featureImage?: string;
    pdfUrl?: string;
};

export type PracticeSet = {
    id: string;
    title: string;
    subtitle?: string;
    duration?: number;
    difficulty?: ('Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Expert')[];
    questionSource?: ('Random from Chapter' | 'Random from Topic' | 'Textbook Exercise' | 'Solved Examples' | 'Previous Year Questions')[];
    textbookId?: string;
    chapterId?: string;
    topicId?: string;
    featureImage?: string;
    questions?: Question[];
    access: 'free' | 'premium' | 'pro';
};

export type Solution = {
    id: string;
    title: string;
    description?: string;
    content: string;
};

// Represents a question nested within a "Grouped" question.
// It cannot have its own sub-questions.
export type SubQuestion = {
  id: string;
  text: string;
  type: 'Multiple Choice' | 'True/False' | 'Short Answer' | 'Fill in the Blank' | 'Matching';
  marks: number;
  options?: { text: string; explanation?: string }[];
  matchingOptions?: {
    columnA: { text: string; image?: string }[];
    columnB: { text: string; image?: string }[];
  };
  correctAnswer: any;
  explanation?: string;
};


export type Question = {
    id: string;
    text: string;
    image?: string;
    audio?: string;
    type: 'Multiple Choice' | 'True/False' | 'Short Answer' | 'Fill in the Blank' | 'Matching' | 'Grouped' | 'Descriptive';
    marks: number;
    options?: {text: string, explanation?: string, image?: string, audio?: string}[];
    matchingOptions?: {
        columnA: { text: string, image?: string }[];
        columnB: { text: string, image?: string }[];
    };
    correctAnswer: any;
    explanation?: string;
    answerImage?: string;
    answerAudio?: string;
    subQuestions?: SubQuestion[];
    likes: number;
    dislikes: number;
    likedBy: string[];
    dislikedBy: string[];
    authorName: string;
    authorId: string;
    createdAt: Date;
    subject?: string;
    textbookId?: string;
    chapterId?: string;
    board?: string;
    classCategory?: string;
    class?: string;
};

export type Comment = {
    id: string;
    text: string;
    authorId: string;
    authorName: string;
    authorPhotoURL?: string;
    createdAt: Date;
    rating?: number;
    likes: number;
    dislikes: number;
    likedBy: string[];
    dislikedBy: string[];
    parentId: string | null;
    replies?: Comment[];
}

export type Exam = {
  id: string;
  title: string;
  subject: string;
  questions: any[];
  duration: number;
  difficulty: string;
  access: "free" | "premium" | "pro";
  testType: string;
};

export type Quiz = {
  id: string;
  title: string;
  description?: string;
  category: string;
  testType: string;
  featureImage?: string;
  questions?: any[];
};

export type Test = {
  id: string;
  title: string;
  subject: string;
  questions: any[];
  duration: number;
  difficulty: string;
  access: "free" | "premium" | "pro";
  testType: string;
};
