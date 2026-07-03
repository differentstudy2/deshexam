
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Award, CheckSquare, FileQuestion, Book, BookOpen } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import type { Topic, Chapter, Textbook } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ManageTopicPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    
    const textbookId = params.bookId as string;
    const chapterId = params.chapterId as string;
    const topicId = params.topicId as string;

    const [topic, setTopic] = useState<Topic | null>(null);
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [textbook, setTextbook] = useState<Textbook | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const textbookDocRef = doc(db, 'textbooks', textbookId);
                const textbookDocSnap = await getDoc(textbookDocRef);
                if (textbookDocSnap.exists()) setTextbook({ id: textbookDocSnap.id, ...textbookDocSnap.data() } as Textbook);
                
                const chapterDocRef = doc(db, `textbooks/${textbookId}/chapters`, chapterId);
                const chapterDocSnap = await getDoc(chapterDocRef);
                if(chapterDocSnap.exists()) setChapter({ id: chapterDocSnap.id, ...chapterDocSnap.data() } as Chapter);
                
                const topicDocRef = doc(db, `textbooks/${textbookId}/chapters/${chapterId}/topics`, topicId);
                const topicDocSnap = await getDoc(topicDocRef);
                if(topicDocSnap.exists()) setTopic({ id: topicDocSnap.id, ...topicDocSnap.data() } as Topic);

            } catch(e) {
                toast({ variant: 'destructive', title: 'Error fetching page data', description: (e as Error).message });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [textbookId, chapterId, topicId, toast]);

    const managementActions = [
        {
            title: "Manage Practice Sets",
            description: "Create and configure practice sets for this topic.",
            link: `/admin/textbooks/${textbookId}/chapter/${chapterId}/topic/${topicId}/practice-set`,
            icon: <CheckSquare />,
        },
        {
            title: "Manage Mock Tests",
            description: "Create and manage mock tests for this topic.",
            link: `/admin/textbooks/${textbookId}/chapter/${chapterId}/topic/${topicId}/mock-test`,
            icon: <Award />,
        },
        {
            title: "Manage Quizzes",
            description: "Create and manage quizzes for this topic.",
            link: `/admin/textbooks/${textbookId}/chapter/${chapterId}/topic/${topicId}/quizzes`,
            icon: <Award />,
        },
        {
            title: "Manage Exams",
            description: "Create and manage exams for this topic.",
            link: `/admin/textbooks/${textbookId}/chapter/${chapterId}/topic/${topicId}/exams`,
            icon: <Award />,
        },
        {
            title: "Manage Additional Resources",
            description: "Add videos, PDFs, and other supplementary materials.",
            link: `/admin/textbooks/${textbookId}/chapter/${chapterId}/topic/${topicId}/resources`,
            icon: <BookOpen />,
        }
    ];

    if (loading) {
        return (
             <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <div className="space-y-2">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-5 w-1/2" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
                </div>
            </div>
        )
    }

    if (!topic || !chapter || !textbook) {
        return <p>Content not found.</p>;
    }
    
    return (
        <div className="space-y-6">
            <div>
                <Button variant="ghost" asChild>
                <Link href={`/admin/textbooks/${textbookId}/chapter/${chapterId}/topics`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Topics
                </Link>
                </Button>
            </div>
            <header>
                <p className="text-sm text-muted-foreground">{textbook?.title} - {chapter?.title}</p>
                <h1 className="font-headline text-3xl font-bold">
                    Manage Topic: <span className="text-primary">{topic.title}</span>
                </h1>
            </header>

            <section>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {managementActions.map(action => (
                        <Card key={action.title} className="hover:shadow-md transition-shadow">
                             <Link href={action.link} className="flex flex-col h-full">
                                <CardHeader className="flex flex-row items-start gap-4">
                                    <div className="bg-secondary p-3 rounded-full">{action.icon}</div>
                                    <div className="space-y-1">
                                        <CardTitle>{action.title}</CardTitle>
                                        <CardDescription>{action.description}</CardDescription>
                                    </div>
                                </CardHeader>
                            </Link>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    )
}
