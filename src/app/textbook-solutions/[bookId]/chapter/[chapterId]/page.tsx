
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Textbook, Chapter, Topic } from '@/lib/types';
import { getTopicsByChapterId, getQuestionsByPracticeSet } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, BookOpen, FileText, CheckSquare, Edit } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

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
        return <div className="flex justify-center items-center h-full min-h-[50vh]"><Loader2 className="animate-spin" /></div>;
    }
    
    if (!chapter) {
        return <div className="text-center p-8">Chapter not found.</div>;
    }

    return (
        <div className="bg-secondary/40">
            <div className="container py-8 md:py-12">
                <div className="mb-6">
                    <Button variant="ghost" asChild>
                        <Link href={`/textbook-solutions/${textbookId}`}>
                            <ArrowLeft className="mr-2" /> Back to Chapters
                        </Link>
                    </Button>
                </div>
                <header className="mb-8 md:mb-12">
                    <p className="text-primary font-semibold">{textbook?.title}</p>
                    <h1 className="text-3xl md:text-4xl font-bold font-headline mt-1">{chapter.title}</h1>
                    {chapter.content && <p className="mt-2 max-w-3xl text-muted-foreground">{chapter.content}</p>}
                </header>

                <div className="space-y-6">
                     <h2 className="text-2xl font-bold font-headline border-b pb-2">Topics</h2>
                    {topics.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {topics.map(topic => (
                                <Card key={topic.id} className="flex flex-col">
                                    <CardHeader>
                                        <CardTitle>{topic.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <div className="space-y-2 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4"/>
                                                <span>{(topic.resources || []).length} Resources</span>
                                            </div>
                                             <div className="flex items-center gap-2">
                                                <CheckSquare className="w-4 h-4"/>
                                                <span>{(topic.practiceSets || []).length} Practice Sets</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex flex-col sm:flex-row gap-2">
                                        <Button asChild className="w-full">
                                            <Link href={`/textbook-solutions/${textbookId}/chapter/${chapterId}/topic/${topic.id}`}>
                                                <BookOpen className="mr-2"/> View Topic
                                            </Link>
                                        </Button>
                                        <Button asChild variant="secondary" className="w-full">
                                            <Link href={`/admin/textbooks/${textbookId}/chapter/${chapterId}/topic/${topic.id}`}>
                                                <Edit className="mr-2"/> Manage Topic
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-16 bg-card rounded-lg">
                            <p>No topics have been added to this chapter yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
