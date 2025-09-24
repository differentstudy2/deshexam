

export type Textbook = {
    id: string;
    title: string;
    description: string;
    subject: string;
    class: string;
};

export type Chapter = {
    id: string;
    title: string;
    content?: string;
    topics: Topic[];
};

export type Topic = {
    id: string;
    title: string;
    content?: string;
    practiceSets: PracticeSet[];
};

export type PracticeSet = {
    id: string;
    title: string;
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
