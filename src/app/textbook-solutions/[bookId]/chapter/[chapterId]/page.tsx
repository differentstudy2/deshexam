

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Textbook, Chapter, Topic } from '@/lib/types';
import { getTopicsByChapterId, getQuestionsByPracticeSet } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, BookOpen, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ChapterPage() {
    const params = useParams();
    const { toast } = useToast();
    const textbookId = params.bookId as string;
    const chapterId = params.chapterId as string;

    const [textbook, setTextbook] = useState<Textbook | null>(null);
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!textbookId || !chapterId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const [textbookSnap, chapterSnap] = await Promise.all([
                    getDoc(doc(db, 'textbooks', textbookId)),
                    getDoc(doc(db, `textbooks/${textbookId}/chapters`, chapterId))
                ]);
                
                if (textbookSnap.exists()) setTextbook({ id: textbookSnap.id, ...textbookSnap.data() } as Textbook);
                if (chapterSnap.exists()) setChapter({ id: chapterSnap.id, ...chapterSnap.data() } as Chapter);
                
                const topicsData = await getTopicsByChapterId(textbookId, chapterId);

                // Fetch question count for each practice set in each topic
                for (const topic of topicsData) {
                    if (topic.practiceSets) {
                        for (const ps of topic.practiceSets) {
                            const questions = await getQuestionsByPracticeSet(textbookId, chapterId, topic.id, ps.id);
                            (ps as any).questionCount = questions.length;
                        }
                    }
                }
                setTopics(topicsData);

            } catch (e) {
                toast({ variant: 'destructive', title: 'Error fetching data', description: (e as Error).message });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [textbookId, chapterId, toast]);

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin" /></div>;
    }
    
    if (!chapter) {
        return <div>Chapter not found.</div>;
    }

    return (
        <div className="container py-8">
            <div className="mb-6">
                <Button variant="ghost" asChild>
                    <Link href={`/textbook-solutions/${textbookId}`}>
                        <ArrowLeft className="mr-2" /> Back to Chapters
                    </Link>
                </Button>
            </div>
            <header className="mb-8">
                <h1 className="text-4xl font-bold font-headline">{chapter.title}</h1>
                <p className="text-lg text-muted-foreground mt-2">{textbook?.title}</p>
                {chapter.content && <p className="mt-4 max-w-3xl">{chapter.content}</p>}
            </header>

            <div className="space-y-6">
                {topics.map(topic => (
                    <Card key={topic.id}>
                        <CardHeader>
                            <CardTitle>{topic.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 space-y-4">
                                    <h4 className="font-semibold">Practice Sets</h4>
                                    {topic.practiceSets && topic.practiceSets.length > 0 ? (
                                        <ul className="space-y-2">
                                            {topic.practiceSets.map(ps => (
                                                <li key={ps.id}>
                                                    <Link href={`/textbook-solutions/practice-set/${ps.id}?textbook=${textbookId}&chapter=${chapterId}&topic=${topic.id}`} className="flex items-center justify-between p-3 border rounded-md hover:bg-secondary">
                                                        <div>
                                                            <p>{ps.title}</p>
                                                            <p className="text-sm text-muted-foreground">{(ps as any).questionCount || 0} questions</p>
                                                        </div>
                                                        <ChevronRight className="w-5 h-5"/>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No practice sets for this topic.</p>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <Link href={`/textbook-solutions/${textbookId}/chapter/${chapterId}/topic/${topic.id}`}>
                                        <Button className="w-full h-full text-lg">
                                            <BookOpen className="mr-2" />
                                            View Topic & Resources
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {topics.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">No topics available for this chapter.</p>
                )}
            </div>
        </div>
    );
}
