
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import type { Metadata, ResolvingMetadata } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Textbook, Topic, PracticeSet } from '@/lib/types';
import { getSubmissionById } from '@/lib/firebase/firestore';
import ReviewClientPage from './review-client-page';

type PageProps = {
    params: { practiceSetId: string; };
    searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params, searchParams }: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
    const submissionId = searchParams.submissionId as string;
    if (!submissionId) {
        return { title: 'Review Answers' };
    }

    try {
        const submission = await getSubmissionById(submissionId);
        if (!submission) {
            return { title: 'Review Not Found' };
        }

        const textbookDoc = await getDoc(doc(db, 'textbooks', submission.textbookId));
        const textbookTitle = textbookDoc.exists() ? (textbookDoc.data() as Textbook).title : '';

        const title = `Review: ${submission.practiceSetTitle} | ${textbookTitle}`;
        const description = `Review your answers for the practice set "${submission.practiceSetTitle}". See detailed explanations for each question.`;
        const keywords = ['answer review', submission.practiceSetTitle, textbookTitle].filter(Boolean);

        return {
            title,
            description,
            keywords,
        };
    } catch (error) {
        console.error("Metadata generation error:", error);
        return {
            title: "Review Answers",
            description: "Review your submitted answers for a practice set."
        }
    }
}


export default async function PracticeSetReviewPage({ params, searchParams }: PageProps) {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin w-8 h-8" /></div>}>
            <ReviewClientPage />
        </Suspense>
    );
}
