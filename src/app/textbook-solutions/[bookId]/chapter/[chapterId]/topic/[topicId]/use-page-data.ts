
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { getAllContent, getPracticeSetsByTopicId } from '@/lib/firebase/firestore';
import type { Textbook, Chapter, Topic, Exam, PracticeSet } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export function usePageData() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();

    const textbookId = params.bookId as string;
    const chapterId = params.chapterId as string;
    const topicId = params.topicId as string;

    const [textbook, setTextbook] = useState<Textbook | null>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
    const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPageData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [textbookSnap, chaptersQuerySnap, allExams] = await Promise.all([
                getDoc(doc(db, 'textbooks', textbookId)),
                getDocs(query(collection(db, `textbooks/${textbookId}/chapters`), orderBy('title'))),
                getAllContent("Exam")
            ]);

            if (!textbookSnap.exists()) {
                throw new Error("Textbook not found.");
            }
            const textbookData = { id: textbookSnap.id, ...textbookSnap.data() } as Textbook;
            setTextbook(textbookData);

            const chaptersData = chaptersQuerySnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chapter));
            chaptersData.sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }));
            setChapters(chaptersData);
            
            setExams((allExams as Exam[]).filter((exam: any) => exam.textbookId === textbookId));

            const chapterDocRef = doc(db, `textbooks/${textbookId}/chapters`, chapterId);
            const chapterSnap = await getDoc(chapterDocRef);
            if (!chapterSnap.exists()) {
                throw new Error("Chapter not found.");
            }
            const chapterData = { id: chapterSnap.id, ...chapterSnap.data() } as Chapter;
            setActiveChapter(chapterData);

            const topicDocRef = doc(db, `textbooks/${textbookId}/chapters/${chapterId}/topics`, topicId);
            const topicSnap = await getDoc(topicDocRef);
            if (!topicSnap.exists()) {
                 const topicsQuerySnap = await getDocs(query(collection(chapterDocRef, "topics"), orderBy("title"), limit(1)));
                 if (!topicsQuerySnap.empty) {
                     const firstTopicId = topicsQuerySnap.docs[0].id;
                     router.replace(`/textbook-solutions/${textbookId}/chapter/${chapterId}/topic/${firstTopicId}`);
                     // The redirect will trigger a re-render, so we can stop here
                     return;
                 } else {
                    // No topics in this chapter, stay on chapter page
                    setActiveTopic(null);
                 }
            } else {
                 const topicData = { id: topicSnap.id, ...topicSnap.data() } as Topic;
                 const practiceSetsData = await getPracticeSetsByTopicId(textbookId, chapterId, topicId);
                 topicData.practiceSets = practiceSetsData;
                 setActiveTopic(topicData);
            }

        } catch (e: any) {
            setError(e.message);
            toast({ variant: "destructive", title: "Error loading data", description: e.message });
        } finally {
            setLoading(false);
        }
    }, [textbookId, chapterId, topicId, toast, router]);

    useEffect(() => {
        if(textbookId && chapterId && topicId) {
            fetchPageData();
        }
    }, [fetchPageData, textbookId, chapterId, topicId]);

    return { loading, textbook, chapters, activeChapter, activeTopic, exams, error, fetchPageData };
}
