
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { db } from '@/lib/firebase/client';
import type { Textbook } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, Book, CheckSquare, Edit, FileQuestion, Library, Award } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function ManageTextbookPage() {
  const params = useParams();
  const textbookId = params.bookId as string;
  const { toast } = useToast();

  const [textbook, setTextbook] = useState<Textbook | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTextbook = async () => {
        if (!textbookId) return;
        setLoading(true);
        try {
            const textbookDocRef = doc(db, 'textbooks', textbookId);
            const textbookDocSnap = await getDoc(textbookDocRef);
            if(textbookDocSnap.exists()) {
                setTextbook({ id: textbookDocSnap.id, ...textbookDocSnap.data() } as Textbook);
            } else {
                toast({ variant: "destructive", title: "Textbook not found." });
            }
        } catch (error) {
             toast({
                variant: "destructive",
                title: 'Error fetching textbook',
                description: (error as Error).message,
            });
        } finally {
            setLoading(false);
        }
    };
    fetchTextbook();
  }, [textbookId, toast]);

  const managementActions = [
    {
        title: "Manage Chapters & Topics",
        description: "Add, edit, or reorder chapters and the topics within them.",
        link: `/admin/textbooks/${textbookId}/chapters`,
        icon: <Library />,
    },
    {
        title: "Manage Questions",
        description: "View and manage all textbook questions for this book.",
        link: `/admin/textbooks/${textbookId}/questions`,
        icon: <FileQuestion />,
    },
    {
        title: "Manage Practice Sets",
        description: "Create and configure practice sets for chapters or topics.",
        link: `/admin/textbooks/${textbookId}/practice-sets`,
        icon: <CheckSquare />,
    },
    {
        title: "Manage Mock Tests",
        description: "Create and manage mock tests for this textbook.",
        link: `/admin/textbooks/${textbookId}/mock-tests`,
        icon: <Award />,
    },
    {
        title: "Manage Quizzes",
        description: "Create and manage quizzes for this textbook.",
        link: `/admin/textbooks/${textbookId}/quizzes`,
        icon: <Award />,
    },
    {
        title: "Manage Exams",
        description: "Create and manage exams for this textbook.",
        link: `/admin/textbooks/${textbookId}/exams`,
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

  if (!textbook) {
      return <p>Textbook could not be loaded.</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" asChild>
          <Link href="/admin/textbooks">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Textbooks
          </Link>
        </Button>
      </div>
      <header>
        <h1 className="font-headline text-3xl font-bold">
          Manage Textbook: <span className="text-primary">{textbook.title}</span>
        </h1>
        <p className="text-muted-foreground mt-1">Select an option below to manage content for this book.</p>
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
  );
}
