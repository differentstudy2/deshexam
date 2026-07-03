
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowLeft, BookOpen, CheckSquare, FileText, Library, FileQuestion, PlusCircle, Award, Book } from "lucide-react";
import Link from "next/link";
import { useParams } from 'next/navigation';
import { useEffect, useState } from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { Chapter, Textbook } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";


export default function ManageChapterPage() {
    const params = useParams();
    const textbookId = params.bookId as string;
    const chapterId = params.chapterId as string;
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [textbook, setTextbook] = useState<Textbook | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const textbookDocRef = doc(db, 'textbooks', textbookId);
            const textbookDocSnap = await getDoc(textbookDocRef);
            if(textbookDocSnap.exists()) setTextbook({ id: textbookDocSnap.id, ...textbookDocSnap.data() } as Textbook);
            
            const chapterDocRef = doc(db, `textbooks/${textbookId}/chapters`, chapterId);
            const chapterDocSnap = await getDoc(chapterDocRef);
            if(chapterDocSnap.exists()) setChapter({ id: chapterDocSnap.id, ...chapterDocSnap.data() } as Chapter);
            setLoading(false);
        };
        fetchData();
    }, [textbookId, chapterId]);

    const managementActions = [
        {
            title: "Manage Topics",
            description: "Organize the chapter into smaller topics and manage their content.",
            link: `/admin/textbooks/${textbookId}/chapter/${chapterId}/topics`,
            icon: <Library />,
        },
        {
            title: "Manage Questions",
            description: "Add, edit, or remove textbook questions and solutions for this chapter.",
            link: `/admin/textbooks/${textbookId}/chapter/${chapterId}/questions`,
            icon: <FileQuestion />,
        },
        {
            title: "Manage Practice Sets",
            description: "Create and configure practice sets associated with this chapter.",
            link: `/admin/textbooks/${textbookId}/chapter/${chapterId}/practice-sets`,
            icon: <CheckSquare />,
        },
        {
            title: "Manage Mock Tests",
            description: "Create and manage mock tests for this chapter.",
            link: `/admin/textbooks/${textbookId}/chapter/${chapterId}/mock-tests`,
            icon: <Award />,
        },
        {
            title: "Manage Quizzes",
            description: "Create and manage quizzes for this chapter.",
            link: `/admin/textbooks/${textbookId}/chapter/${chapterId}/quizzes`,
            icon: <Award />,
        },
        {
            title: "Manage Exams",
            description: "Create and manage exams for this chapter.",
            link: `/admin/textbooks/${textbookId}/chapter/${chapterId}/exams`,
            icon: <Award />,
        },
        {
            title: "Manage Additional Resources",
            description: "Add videos, PDFs, and other supplementary materials.",
            link: `/admin/textbooks/${textbookId}/chapter/${chapterId}/resources`,
            icon: <Book />,
        }
    ];

    const addContentActions = [
        {
            title: "Add Exam",
            description: "Create a new exam based on this chapter.",
            link: `/admin/textbooks/${textbookId}/add-exam`,
            icon: <Award />,
        },
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

    if (!chapter) {
        return <p>Chapter not found.</p>;
    }
    
    return (
        <div className="space-y-6">
            <div>
                <Button variant="ghost" asChild>
                <Link href={`/admin/textbooks/${textbookId}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Chapters
                </Link>
                </Button>
            </div>
            <header>
                <p className="text-sm text-muted-foreground">{textbook?.title}</p>
                <h1 className="font-headline text-3xl font-bold">
                    Manage Chapter: <span className="text-primary">{chapter.title}</span>
                </h1>
            </header>

            <section>
                <h2 className="text-2xl font-semibold font-headline mb-4">Manage Content</h2>
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
            
            <section>
                 <h2 className="text-2xl font-semibold font-headline mb-4">Add New Content</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {addContentActions.map(action => (
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
