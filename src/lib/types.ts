

export type Resource = {
    id: string;
    type: 'video' | 'audio' | 'pdf' | 'doc';
    title: string;
    url: string;
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
    access: 'free' | 'pass' | 'pro';
};

export type Topic = {
    id: string;
    title: string;
    content?: string;
    practiceSets?: PracticeSet[];
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
    type: 'Multiple Choice' | 'True/False' | 'Short Answer' | 'Fill in the Blank' | 'Matching' | 'Grouped';
    marks: number;
    options?: {text: string, explanation?: string}[];
    matchingOptions?: {
        columnA: { text: string, image?: string }[];
        columnB: { text: string, image?: string }[];
    };
    correctAnswer: any;
    explanation?: string;
    subQuestions?: SubQuestion[];
    likes: number;
    dislikes: number;
    likedBy: string[];
    dislikedBy: string[];
};

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


