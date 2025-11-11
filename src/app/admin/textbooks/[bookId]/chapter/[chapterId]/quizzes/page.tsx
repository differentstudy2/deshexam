
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getAllContent, deleteContent, addContent } from '@/lib/firebase/firestore';
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
import { Eye, PlusCircle, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ContentBadge } from '@/components/content-badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Quiz = {
    id: string;
    title: string;
    subject: string;
    testType: string;
    access: 'free' | 'premium' | 'pro';
    createdAt: string;
    chapterId?: string;
}

function getUrlForTest(testId: string) {
    return `/quiz/${testId}`;
}

export default function ManageChapterQuizzesPage() {
    const params = useParams();
    const textbookId = params.bookId as string;
    const chapterId = params.chapterId as string;
    const { toast } = useToast();

    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newQuizData, setNewQuizData] = useState({ title: '', description: '', difficulty: 'Medium' });
    
    const fetchQuizzes = async () => {
        if (!chapterId) return;
        setLoading(true);
        try {
            const allQuizzes = (await getAllContent("Quiz")) as Quiz[];
            const chapterQuizzes = allQuizzes.filter(quiz => quiz.chapterId === chapterId);
            setQuizzes(chapterQuizzes);
        } catch (error) {
             toast({
                variant: "destructive",
                title: 'Error fetching quizzes',
                description: (error as Error).message,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuizzes();
    }, [chapterId, toast]);

    const handleDelete = async () => {
        if (!quizToDelete) return;
        try {
            await deleteContent(quizToDelete.id);
            toast({
                title: 'Quiz Deleted',
                description: `"${quizToDelete.title}" has been successfully deleted.`,
            });
            setQuizzes(quizzes.filter(quiz => quiz.id !== quizToDelete.id));
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error Deleting Quiz',
                description: (error as Error).message,
            });
        } finally {
            setQuizToDelete(null);
        }
    };
    
     const handleAddQuiz = async () => {
        if (!newQuizData.title) {
            toast({ variant: 'destructive', title: 'Title is required.' });
            return;
        }
        try {
             const contentToSave: any = { 
                ...newQuizData, 
                testType: 'Quiz',
                textbookId: textbookId,
                chapterId: chapterId,
                access: 'free',
                questions: [],
             };
            await addContent(contentToSave);
            toast({ title: 'Quiz Added' });
            setIsDialogOpen(false);
            setNewQuizData({ title: '', description: '', difficulty: 'Medium' });
            fetchQuizzes();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error adding quiz', description: (error as Error).message });
        }
    };


    return (
        <div className="space-y-6">
            <div>
                <Button asChild variant="ghost">
                    <Link href={`/admin/textbooks/${textbookId}/chapter/${chapterId}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Chapter
                    </Link>
                </Button>
            </div>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-headline text-3xl font-bold">Manage Quizzes</h1>
                    <p className="text-muted-foreground">
                        Quizzes associated with this chapter.
                    </p>
                </div>
                 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button><PlusCircle className="mr-2" /> Add New Quiz</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Quiz</DialogTitle>
                            <DialogDescription>Fill in the details for the new quiz.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="quiz-title">Title</Label>
                                <Input id="quiz-title" value={newQuizData.title} onChange={e => setNewQuizData(p => ({...p, title: e.target.value}))} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="quiz-desc">Description</Label>
                                <Textarea id="quiz-desc" value={newQuizData.description} onChange={e => setNewQuizData(p => ({...p, description: e.target.value}))} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="quiz-difficulty">Difficulty</Label>
                                <Select value={newQuizData.difficulty} onValueChange={(v) => setNewQuizData(p => ({...p, difficulty: v}))}>
                                    <SelectTrigger id="quiz-difficulty"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Easy">Easy</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="Hard">Hard</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                            <Button onClick={handleAddQuiz}>Save</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Quizzes ({quizzes.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Access</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                            ) : quizzes.length > 0 ? (
                                quizzes.map((quiz) => (
                                <TableRow key={quiz.id}>
                                    <TableCell className="font-medium">{quiz.title}</TableCell>
                                    <TableCell>{quiz.subject}</TableCell>
                                    <TableCell><ContentBadge type={quiz.access} /></TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={getUrlForTest(quiz.id)}><Eye className="mr-2 h-4 w-4"/>View</Link>
                                        </Button>
                                         <Button asChild variant="outline" size="sm">
                                            <Link href={`/admin/edit-content/${quiz.id}`}><Edit className="mr-2 h-4 w-4"/>Edit</Link>
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => setQuizToDelete(quiz)}>
                                            <Trash2 className="mr-2 h-4 w-4"/>Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">
                                    No quizzes added to this chapter yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <AlertDialog open={!!quizToDelete} onOpenChange={() => setQuizToDelete(null)}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the quiz
                    "{quizToDelete?.title}".
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
