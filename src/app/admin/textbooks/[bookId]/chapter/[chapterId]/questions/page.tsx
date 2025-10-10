
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Chapter, Question } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowLeft, PlusCircle, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';


export default function ManageChapterQuestionsPage() {
    const params = useParams();
    const { toast } = useToast();

    const textbookId = params.bookId as string;
    const chapterId = params.chapterId as string;
    
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
    const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);

    const fetchData = useCallback(async () => {
        if (!textbookId || !chapterId) return;
        setLoading(true);

        const chapterRef = doc(db, `textbooks/${textbookId}/chapters`, chapterId);
        const chapterSnap = await getDoc(chapterRef);
        if (chapterSnap.exists()) {
            const chapterData = { id: chapterSnap.id, ...chapterSnap.data() } as Chapter;
            setChapter(chapterData);
            setQuestions(chapterData.textbookQuestions || []);
        }
        setLoading(false);
    }, [textbookId, chapterId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const saveQuestionsToFirestore = async (updatedQuestions: Question[]) => {
        const chapterRef = doc(db, `textbooks/${textbookId}/chapters`, chapterId);
        await updateDoc(chapterRef, { textbookQuestions: updatedQuestions });
    }
    
    const handleDeleteQuestion = async (questionId: string) => {
        if(!questionId) return;
        try {
            const updatedQuestions = questions.filter(q => q.id !== questionId);
            await saveQuestionsToFirestore(updatedQuestions);
            setQuestions(updatedQuestions);
            toast({ title: 'Question Deleted' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: (error as Error).message });
        } finally {
            setQuestionToDelete(null);
        }
    }
    
    const handleSelectQuestion = (questionId: string) => {
        setSelectedQuestions(prev => prev.includes(questionId) ? prev.filter(id => id !== questionId) : [...prev, id]);
    };
    
    const handleSelectAllQuestions = (checked: boolean) => {
        if (checked) {
            setSelectedQuestions(questions.map(q => q.id));
        } else {
            setSelectedQuestions([]);
        }
    };
    
    const handleDeleteSelected = async () => {
        try {
            const updatedQuestions = questions.filter(q => !selectedQuestions.includes(q.id));
            await saveQuestionsToFirestore(updatedQuestions);
            setQuestions(updatedQuestions);
            toast({ title: `${selectedQuestions.length} question(s) deleted.` });
            setSelectedQuestions([]);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error deleting questions', description: (error as Error).message });
        }
    }
    
    if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin" /></div>

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
                <h1 className="font-headline text-3xl font-bold">Chapter Questions: <span className="text-primary">{chapter?.title}</span></h1>
                <p className="text-muted-foreground mt-1">Manage the original textbook questions and their solutions for this chapter.</p>
            </header>

            <Card>
                <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <CardTitle>Questions ({questions.length})</CardTitle>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Button size="sm" asChild className="w-full">
                           <Link href={`/admin/textbooks/${textbookId}/chapter/${chapterId}/questions/add`}>
                                <PlusCircle className="mr-2"/> Add Question
                           </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                     {selectedQuestions.length > 0 && (
                        <div className="mb-4">
                             <AlertDialog>
                                <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4"/>Delete Selected ({selectedQuestions.length})</Button></AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete {selectedQuestions.length} question(s). This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteSelected}>Delete</AlertDialogAction></AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}
                    {questions.length > 0 ? (
                        <ul className="space-y-2">
                             <li className="flex items-center p-3 border-b">
                                <Checkbox id="select-all" checked={selectedQuestions.length === questions.length && questions.length > 0} onCheckedChange={handleSelectAllQuestions} className="mr-4" />
                                <label htmlFor="select-all" className="flex-1 font-semibold text-sm">Select All</label>
                            </li>
                            {questions.map(q => (
                                <li key={q.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-md gap-4">
                                    <div className="flex items-start flex-1 min-w-0">
                                        <Checkbox id={`select-${q.id}`} checked={selectedQuestions.includes(q.id)} onCheckedChange={() => handleSelectQuestion(q.id)} className="mr-4 mt-1" />
                                        <label htmlFor={`select-${q.id}`} className="flex-1">{q.text}</label>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0 self-end sm:self-center">
                                        <Button asChild variant="ghost" size="icon">
                                            <Link href={`/admin/textbooks/${textbookId}/chapter/${chapterId}/questions/${q.id}/edit`}>
                                                <Edit className="h-4 w-4"/>
                                            </Link>
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4"/></Button></AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone and will permanently delete this question.</AlertDialogDescription></AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteQuestion(q.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : ( <p className="text-muted-foreground text-center py-8">No questions added to this chapter yet.</p>)}
                </CardContent>
            </Card>
        </div>
    )
}

    