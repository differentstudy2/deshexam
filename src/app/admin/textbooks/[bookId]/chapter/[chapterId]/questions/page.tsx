
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, PlusCircle, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getChapterById, getQuestionsByChapterId, deleteQuestion } from '@/lib/firebase/firestore';
import { db } from '@/lib/firebase/client';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import type { Chapter, Question, Textbook } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function ManageChapterQuestionsPage() {
    const params = useParams();
    const router = useRouter();
    const textbookId = params.bookId as string;
    const chapterId = params.chapterId as string;
    const { toast } = useToast();

    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [itemToDelete, setItemToDelete] = useState<Question | null>(null);
    
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [selectedChapterForAdd, setSelectedChapterForAdd] = useState(chapterId);

    const fetchData = useCallback(async () => {
        if (!textbookId || !chapterId) return;
        setLoading(true);
        try {
            const chapterData = await getChapterById(textbookId, chapterId);
            setChapter(chapterData as Chapter);
            
            const questionsData = await getQuestionsByChapterId(chapterId);
            // client-side sort
            const sortedQuestions = (questionsData as Question[]).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());

            setQuestions(sortedQuestions as Question[]);

        } catch (error) {
             toast({
                variant: "destructive",
                title: "Error fetching data",
                description: (error as Error).message,
            });
        } finally {
            setLoading(false);
        }
    }, [textbookId, chapterId, toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    
    const handleDeleteQuestion = async (questionId: string) => {
        if(!questionId) return;
        try {
            await deleteQuestion(questionId);
            setQuestions(prev => prev.filter(q => q.id !== questionId));
            toast({ title: 'Question Deleted' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: (error as Error).message });
        } finally {
            setItemToDelete(null);
        }
    }
    
    const handleContinue = () => {
        if (selectedChapterForAdd) {
            router.push(`/admin/textbooks/${textbookId}/chapter/${selectedChapterForAdd}/questions/add`);
            setIsAddDialogOpen(false);
        }
    };


    return (
        <div className="space-y-6">
            <div>
                <Button asChild variant="ghost">
                    <Link href={`/admin/textbooks/${textbookId}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Textbook Chapters
                    </Link>
                </Button>
            </div>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-headline text-3xl font-bold">Manage Chapter Questions</h1>
                    <p className="text-muted-foreground">
                        All textbook questions for "{chapter?.title}".
                    </p>
                </div>
                 <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button><PlusCircle className="mr-2 h-4 w-4" /> Add New Question</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add New Question</DialogTitle>
                            <DialogDescription>Select the chapter to add the question to.</DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <div className="space-y-2">
                                <Label htmlFor="chapter-select">Chapter</Label>
                                <Select value={selectedChapterForAdd} onValueChange={setSelectedChapterForAdd}>
                                    <SelectTrigger id="chapter-select">
                                        <SelectValue placeholder="Select a chapter..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={chapterId}>{chapter?.title}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleContinue} disabled={!selectedChapterForAdd}>Continue</Button>
                        </DialogFooter>
                    </DialogContent>
                 </Dialog>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Questions ({questions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Question</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                            ) : questions.length > 0 ? (
                                questions.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium max-w-lg truncate">{item.text}</TableCell>
                                    <TableCell>{item.type}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/question/${item.id}`} target="_blank">
                                                <Eye className="mr-2 h-4 w-4"/>View
                                            </Link>
                                        </Button>
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/admin/textbooks/${textbookId}/chapter/${chapterId}/questions/${item.id}/edit`}>
                                                <Edit className="mr-2 h-4 w-4"/>Edit
                                            </Link>
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4"/></Button></AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone and will permanently delete this question.</AlertDialogDescription></AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteQuestion(item.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24">
                                    No questions found for this chapter.
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
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this question.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteQuestion(itemToDelete!.id)} className="bg-destructive hover:bg-destructive/90">
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
