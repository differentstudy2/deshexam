
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import type { Metadata, ResolvingMetadata } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Textbook, Topic, PracticeSet } from '@/lib/types';
import { getSubmissionById } from '@/lib/firebase/firestore';
import ReviewClientPage from './review-client-page';
import { notFound } from 'next/navigation';

type PageProps = {
    params: Promise<{ practiceSetId: string; }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function getPageData(submissionId: string | undefined) {
    if (!submissionId) return { submission: null, textbook: null };

    try {
        const submission = await getSubmissionById(submissionId);
        if (!submission) return { submission: null, textbook: null };

        const textbookDoc = await getDoc(doc(db, 'textbooks', submission.textbookId));
        const textbook = textbookDoc.exists() ? { id: textbookDoc.id, ...textbookDoc.data() as Textbook } : null;

        return { submission, textbook };

    } catch (error) {
        console.error("Error fetching page data:", error);
        return { submission: null, textbook: null };
    }
}


export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const searchParams = await props.searchParams;
    const submissionId = searchParams.submissionId as string | undefined;
    const { submission, textbook } = await getPageData(submissionId);

    if (!submission) {
        return {
            title: submissionId ? 'Review Not Found' : 'Review Answers',
        };
    }

    const title = `Review: ${submission.practiceSetTitle} | ${textbook?.title || 'DeshExam'}`;
    const description = `Review your answers for the practice set "${submission.practiceSetTitle}". See detailed explanations for each question.`;
    const keywords = ['answer review', submission.practiceSetTitle, textbook?.title].filter(Boolean) as string[];

    return {
        title,
        description,
        keywords,
    };
}


export default async function PracticeSetReviewPage(props: PageProps) {
    const searchParams = await props.searchParams;
    const submissionId = searchParams.submissionId as string | undefined;

    if (!submissionId) {
        notFound();
    }

    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin w-8 h-8" /></div>}>
            <ReviewClientPage submissionId={submissionId} />
        </Suspense>
    );
}
