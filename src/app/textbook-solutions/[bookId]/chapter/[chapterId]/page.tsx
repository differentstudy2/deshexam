
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import type { Metadata, ResolvingMetadata } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Textbook, Chapter, Topic } from '@/lib/types';
import ChapterClientPage from './chapter-client-page';
import { notFound } from 'next/navigation';

type PageProps = {
    params: { bookId: string; chapterId: string };
    searchParams: { [key: string]: string | string[] | undefined };
};

async function getPageData(bookId: string, chapterId: string, topicId?: string) {
    try {
        const textbookDocRef = doc(db, 'textbooks', bookId);
        const chapterDocRef = doc(db, `textbooks/${bookId}/chapters`, chapterId);
        
        const [textbookSnap, chapterSnap] = await Promise.all([
            getDoc(textbookDocRef),
            getDoc(chapterDocRef),
        ]);

        const textbook = textbookSnap.exists() ? { id: textbookSnap.id, ...textbookSnap.data() } as Textbook : null;
        const chapter = chapterSnap.exists() ? { id: chapterSnap.id, ...chapterSnap.data() } as Chapter : null;

        let topic = null;
        if (topicId && chapter) {
            const topicDocRef = doc(db, `textbooks/${bookId}/chapters/${chapterId}/topics`, topicId);
            const topicSnap = await getDoc(topicDocRef);
            if (topicSnap.exists()) {
                topic = { id: topicSnap.id, ...topicSnap.data() } as Topic;
            }
        }
        
        return { textbook, chapter, topic };
    } catch (error) {
        console.error("Error fetching metadata:", error);
        return { textbook: null, chapter: null, topic: null };
    }
}

export async function generateMetadata({ params, searchParams }: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
    const { bookId, chapterId } = params;
    const topicId = searchParams.topic as string | undefined;
    const { textbook, chapter, topic } = await getPageData(bookId, chapterId, topicId);

    if (!textbook || !chapter) {
        return {
            title: 'Content Not Found',
        };
    }

    let title = `${chapter.title} | ${textbook.title}`;
    let description = `Solutions and resources for Chapter ${chapter.title} from the ${textbook.title} textbook, covering subjects like ${textbook.subject}.`;
    let keywords = [textbook.title, chapter.title, textbook.subject, "textbook solutions", "NCERT solutions"];

    if (topic) {
        title = `${topic.title} | ${chapter.title}`;
        description = `Detailed explanation and practice sets for the topic "${topic.title}" from Chapter ${chapter.title} of the ${textbook.title} textbook.`;
        keywords.push(topic.title);
    }
    
    const previousImages = (await parent).openGraph?.images || [];
    const featureImage = textbook.featureImage || `https://picsum.photos/seed/${params.bookId}/1200/630`;

    return {
        title,
        description,
        keywords,
        openGraph: {
            title,
            description,
            images: [featureImage, ...previousImages],
        },
    };
}

export default async function TextbookChapterPage({ params }: PageProps) {
    const { bookId, chapterId } = params;
    const { textbook, chapter, topic } = await getPageData(bookId, chapterId);
     if (!textbook || !chapter) {
        notFound();
    }

    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin"/></div>}>
            <ChapterClientPage />
        </Suspense>
    );
}
