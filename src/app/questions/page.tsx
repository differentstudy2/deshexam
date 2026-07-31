import React from 'react';
import { Metadata } from 'next';
import { getQuestions, getTotalQuestionsCount } from '@/lib/firebase/question-bank';
import QuestionCard from '@/components/question-bank/QuestionCard';
import QuestionsHeader from '@/components/question-bank/QuestionsHeader';
import QuestionsSidebar from '@/components/question-bank/QuestionsSidebar';
import QuestionFeed from '@/components/question-bank/QuestionFeed';
import QuestionsSeoContent from '@/components/question-bank/QuestionsSeoContent';
import QuestionsFaq from '@/components/question-bank/QuestionsFaq';
import { 
    getCollectionPageSchema, 
    getItemListSchema, 
    getBreadcrumbSchema, 
    getFAQSchema, 
    getSearchActionSchema, 
    getOrganizationSchema 
} from '@/lib/seo/json-ld';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
    const params = await searchParams;
    const query = params?.q;
    
    if (query) {
        return {
            title: `Search Results for "${query}" | DeshExam`,
            description: `Find practice questions, past papers, and mock tests for ${query} on DeshExam.`,
            robots: { index: false, follow: true }
        };
    }

    return {
        title: 'Practice Questions & Question Bank for All Exams | DeshExam',
        description: 'Practice 100,000+ exam-ready questions with answers, explanations, and instant answer checking. Prepare for board exams, competitive exams, MCQ tests, and previous year questions on DeshExam.',
        keywords: ['practice questions', 'question bank', 'mcq practice', 'online exam practice', 'previous year questions', 'general knowledge questions', 'competitive exam preparation'],
        alternates: {
            canonical: 'https://deshexam.com/questions'
        },
        openGraph: {
            title: 'Practice Questions & Question Bank for All Exams | DeshExam',
            description: 'Practice 100,000+ exam-ready questions with answers and explanations.',
            url: 'https://deshexam.com/questions',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: 'Practice Questions & Question Bank for All Exams | DeshExam',
            description: 'Practice 100,000+ exam-ready questions with answers and explanations.',
        }
    };
}

export default async function AllQuestionsPage(props: { searchParams: Promise<{ page?: string, q?: string }> }) {
    const searchParams = await props.searchParams;
    const page = parseInt(searchParams?.page || '1', 10);
    const query = searchParams?.q || '';
    const itemsPerPage = 20;
    
    // Fetch questions
    let questions = await getQuestions({}, query ? 500 : page * itemsPerPage);

    if (query) {
        const lowerQuery = query.toLowerCase();
        questions = questions.filter((q: any) => 
            q.questionText?.toLowerCase().includes(lowerQuery) ||
            q.tags?.some((tag: string) => tag.toLowerCase().includes(lowerQuery)) ||
            q.subjectId?.toLowerCase().includes(lowerQuery) ||
            q.boardId?.toLowerCase().includes(lowerQuery) ||
            q.questionType?.toLowerCase().includes(lowerQuery) ||
            (q.metadata?.examTypes || []).some((exam: string) => exam.toLowerCase().includes(lowerQuery)) ||
            (lowerQuery === 'academic' && q.boardId) ||
            (lowerQuery === 'competitive' && q.metadata?.examTypes?.length > 0) ||
            (lowerQuery === 'descriptive questions' && q.questionType !== 'mcq')
        );
    }

    // Total count for pagination
    const totalItems = query ? questions.length : await getTotalQuestionsCount({});
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const paginatedQuestions = questions.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const schemas = [
        getCollectionPageSchema('https://deshexam.com/questions'),
        getItemListSchema(paginatedQuestions),
        getBreadcrumbSchema([
            { name: 'Home', url: 'https://deshexam.com' },
            { name: 'Questions', url: 'https://deshexam.com/questions' }
        ]),
        getSearchActionSchema(),
        getOrganizationSchema(),
        getFAQSchema([
            { q: "Is DeshExam free?", a: "Yes, many of our practice questions, mock tests, and study materials are completely free. We also offer premium plans for advanced features, detailed analytics, and ad-free experiences." },
            { q: "Can I practice MCQ online?", a: "Absolutely! DeshExam provides an interactive platform to practice Multiple Choice Questions (MCQ) for various board and competitive exams with instant feedback." },
            { q: "Are solutions available?", a: "Yes, we provide detailed step-by-step solutions and explanations for most of our questions to help you understand the core concepts." },
            { q: "Which exams are supported?", a: "We currently support state boards (WBBSE, WBCHSE), central boards (CBSE, ICSE), and major competitive exams including SSC, Railway, NEET, JEE, and UPSC." },
            { q: "Can I save questions for later?", a: "Yes! If you create a free account, you can bookmark and save any question to your personal dashboard for quick revision later." }
        ])
    ];

    return (
        <div className="w-full flex flex-col items-center pb-20">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
            
            <QuestionsHeader />
            
            <div className="container max-w-[1200px] mx-auto py-10 px-4">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    
                    {/* Main Content (Left) */}
                    <div className="w-full lg:w-[68%]">
                        <QuestionFeed 
                            initialQuestions={JSON.parse(JSON.stringify(paginatedQuestions))}
                            serverCurrentPage={page}
                            serverTotalPages={totalPages}
                            serverTotalItems={totalItems}
                            serverItemsPerPage={itemsPerPage}
                        />
                    </div>

                    {/* Sidebar (Right) */}
                    <div className="w-full lg:w-[32%] lg:sticky lg:top-24">
                        <QuestionsSidebar />
                    </div>

                </div>
                
                {/* SEO Content Blocks */}
                {!query && (
                    <>
                        <QuestionsSeoContent />
                        <QuestionsFaq />
                    </>
                )}
            </div>
        </div>
    );
}
