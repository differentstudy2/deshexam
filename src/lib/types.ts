

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
    practiceSets: PracticeSet[];
    resources?: Resource[];
};

export type PracticeSet = {
    id: string;
    title: string;
    duration?: number;
};

export type Solution = {
    id: string;
    title: string;
    description?: string;
    content: string;
};

export type Question = {
    id: string;
    text: string;
    type: 'Multiple Choice' | 'True/False' | 'Short Answer' | 'Fill in the Blank' | 'Matching';
    marks: number;
    options?: {text: string, explanation?: string}[];
    matchingOptions?: {
        columnA: { text: string, image?: string }[];
        columnB: { text: string, image?: string }[];
    };
    correctAnswer: any;
    explanation?: string;
};
