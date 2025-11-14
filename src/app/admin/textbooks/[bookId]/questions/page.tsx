
'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getChaptersByTextbookId, getTextbookById, updateDoc, doc } from '@/lib/firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Textbook, Chapter, Question } from '@/lib/types';


export default function ManageTextbookQuestionsPage() {
    const params = useParams();
    const textbookId = params.bookId as string;
    const { toast } = useToast();

    const [textbook, setTextbook] = useState<Textbook | null>(null);
    const [allQuestions, setAllQuestions] = useState<{question: Question, chapter: Chapter}[]>([]);
    const [loading, setLoading] = useState(true);
    const [itemToDelete, setItemToDelete] = useState<{question: Question, chapter: Chapter} | null>(null);
    
    useEffect(() => {
        const fetchData = async () => {
            if (!textbookId) return;
            setLoading(true);
            try {
                const textbookData = await getTextbookById(textbookId);
                setTextbook(textbookData as Textbook);

                const chapters = await getChaptersByTextbookId(textbookId);
                let questions: {question: Question, chapter: Chapter}[] = [];
                for(const chapter of chapters) {
                    const chapterData = (await getDoc(doc(db, `textbooks/${textbookId}/chapters`, chapter.id))).data() as Chapter;
                    if(chapterData.textbookQuestions) {
                        questions = [...questions, ...chapterData.textbookQuestions.map(q => ({question: q, chapter: chapterData}))];
                    }
                }
                setAllQuestions(questions);

            } catch (error) {
                 toast({
                    variant: "destructive",
                    title: 'Error fetching questions',
                    description: (error as Error).message,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [textbookId, toast]);

    const handleDelete = async () => {
        if (!itemToDelete) return;
        try {
            const { question, chapter } = itemToDelete;
            const chapterRef = doc(db, `textbooks/${textbookId}/chapters`, chapter.id);
            const updatedQuestions = chapter.textbookQuestions?.filter(q => q.id !== question.id) || [];
            await updateDoc(chapterRef, { textbookQuestions: updatedQuestions });
            
            toast({
                title: 'Question Deleted',
                description: `The question has been successfully deleted from chapter "${chapter.title}".`,
            });
            setAllQuestions(prev => prev.filter(item => item.question.id !== question.id));
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error Deleting Question',
                description: (error as Error).message,
            });
        } finally {
            setItemToDelete(null);
        }
    };


    return (
        <div className="space-y-6">
            <div>
                <Button asChild variant="ghost">
                    <Link href={`/admin/textbooks/${textbookId}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Textbook
                    </Link>
                </Button>
            </div>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-headline text-3xl font-bold">Manage All Questions</h1>
                    <p className="text-muted-foreground">
                        All textbook questions for "{textbook?.title}".
                    </p>
                </div>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Questions ({allQuestions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Question</TableHead>
                                <TableHead>Chapter</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                            ) : allQuestions.length > 0 ? (
                                allQuestions.map((item) => (
                                <TableRow key={item.question.id}>
                                    <TableCell className="font-medium max-w-lg truncate">{item.question.text}</TableCell>
                                    <TableCell>{item.chapter.title}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/admin/textbooks/${textbookId}/chapter/${item.chapter.id}/questions/${item.question.id}/edit`}>
                                                <Edit className="mr-2 h-4 w-4"/>Edit
                                            </Link>
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => setItemToDelete(item)}>
                                            <Trash2 className="mr-2 h-4 w-4"/>Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24">
                                    No questions found for this textbook.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this question.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

