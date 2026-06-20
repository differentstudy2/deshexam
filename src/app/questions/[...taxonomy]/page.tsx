import React from 'react';
import { Metadata } from 'next';
import { getQuestions } from '@/lib/firebase/question-bank';
import QuestionFeed from '@/components/question-bank/QuestionFeed';
import QuestionsHeader from '@/components/question-bank/QuestionsHeader';
import QuestionsSidebar from '@/components/question-bank/QuestionsSidebar';
import { getCollectionPageSchema, getItemListSchema, getBreadcrumbSchema } from '@/lib/seo/json-ld';

async function getFilteredQuestions(taxonomy: string[]) {
    let questions = await getQuestions({}, 500);
    const [level1, level2, level3] = taxonomy;

    return questions.filter((q: any) => {
        let match = true;
        if (level1) {
            match = match && (
                q.boardId?.toLowerCase() === level1.toLowerCase() || 
                (q.metadata?.examTypes || []).some((e: string) => e.toLowerCase() === level1.toLowerCase())
            );
        }
        if (level2) {
            match = match && (q.classId?.toLowerCase() === level2.toLowerCase() || q.subjectId?.toLowerCase() === level2.toLowerCase());
        }
        if (level3) {
            match = match && (q.subjectId?.toLowerCase() === level3.toLowerCase() || q.chapterId?.toLowerCase() === level3.toLowerCase());
        }
        return match;
    });
}

export async function generateMetadata({ params }: { params: Promise<{ taxonomy: string[] }> }): Promise<Metadata> {
    const { taxonomy } = await params;
    const titleBase = taxonomy.map(t => t.toUpperCase().replace('-', ' ')).join(' ');
    
    const questions = await getFilteredQuestions(taxonomy);
    
    if (questions.length === 0) {
        return {
            title: `No Results for ${titleBase} | DeshExam`,
            robots: { index: false, follow: true }
        };
    }

    return {
        title: `Top ${titleBase} Questions | DeshExam`,
        description: `Practice ${titleBase} questions with answers and explanations on DeshExam.`,
        alternates: {
            canonical: `https://deshexam.com/questions/${taxonomy.join('/')}`
        }
    };
}

export default async function TaxonomyFilterPage(props: { params: Promise<{ taxonomy: string[] }>, searchParams: Promise<{ page?: string }> }) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const taxonomy = params.taxonomy || [];
    const page = parseInt(searchParams?.page || '1', 10);
    const itemsPerPage = 20;

    const questions = await getFilteredQuestions(taxonomy);

    const totalItems = questions.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedQuestions = questions.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const titleBase = taxonomy.map(t => t.toUpperCase().replace('-', ' ')).join(' ');
    
    const breadcrumbItems = [
        { name: 'Home', url: 'https://deshexam.com' },
        { name: 'Questions', url: 'https://deshexam.com/questions' }
    ];
    
    let currentUrl = 'https://deshexam.com/questions';
    taxonomy.forEach(t => {
        currentUrl += `/${t}`;
        breadcrumbItems.push({ name: t.toUpperCase().replace('-', ' '), url: currentUrl });
    });

    const schemas = [
        getCollectionPageSchema(currentUrl),
        getItemListSchema(paginatedQuestions),
        getBreadcrumbSchema(breadcrumbItems)
    ];

    if (paginatedQuestions.length === 0) {
        return (
            <div className="w-full flex flex-col items-center pb-20">
                <QuestionsHeader />
                <div className="container max-w-[1200px] mx-auto py-20 text-center">
                    <h2 className="text-2xl font-bold mb-4">No Questions Found</h2>
                    <p className="text-slate-500">We couldn't find any questions matching "{titleBase}".</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col items-center pb-20">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
            <QuestionsHeader />
            
            <div className="container max-w-[1200px] mx-auto py-10 px-4">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {titleBase} Practice Questions
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Showing {totalItems} questions for {titleBase}.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <div className="w-full lg:w-[68%]">
                        <QuestionFeed 
                            initialQuestions={JSON.parse(JSON.stringify(paginatedQuestions))}
                            serverCurrentPage={page}
                            serverTotalPages={totalPages}
                            serverTotalItems={totalItems}
                            serverItemsPerPage={itemsPerPage}
                        />
                    </div>
                    <div className="w-full lg:w-[32%] lg:sticky lg:top-24">
                        <QuestionsSidebar />
                    </div>
                </div>
            </div>
        </div>
    );
}
