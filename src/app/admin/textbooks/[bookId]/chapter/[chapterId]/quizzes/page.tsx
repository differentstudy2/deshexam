

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getAllContent, deleteContent, addContent, updateContent } from '@/lib/firebase/firestore';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
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
import { Button } from '@/components/ui/button';
import { Eye, PlusCircle, ArrowLeft, Edit, Trash2, Sparkles, FileQuestion } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Textbook, Chapter, Question } from '@/lib/types';


type Quiz = {
    id: string;
    title: string;
    subtitle?: string;
    subject: string;
    testType: string;
    access: 'free' | 'premium' | 'pro';
    createdAt: string;
    chapterId?: string;
    difficulty?: ('Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Expert')[];
    questionSource?: ('Random from Chapter' | 'Random from Topic' | 'Textbook Exercise' | 'Solved Examples' | 'Previous Year Questions')[];
    questions?: Question[];
}

const difficultyOptions = ['Beginner', 'Easy', 'Medium', 'Hard', 'Expert'];
const questionSourceOptions = ['Random from Chapter', 'Random from Topic', 'Textbook Exercise', 'Solved Examples', 'Previous Year Questions'];

export default function ManageChapterQuizzesPage() {
    const params = useParams();
    const textbookId = params.bookId as string;
    const chapterId = params.chapterId as string;
    const { toast } = useToast();

    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);
    const [textbook, setTextbook] = useState<Textbook | null>(null);
    const [chapter, setChapter] = useState<Chapter | null>(null);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
    const [quizData, setQuizData] = useState<{title: string, subtitle: string, difficulty: ('Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Expert')[], questionSource: ('Random from Chapter' | 'Random from Topic' | 'Textbook Exercise' | 'Solved Examples' | 'Previous Year Questions')[]}>({
        title: '',
        subtitle: '',
        difficulty: ['Medium'],
        questionSource: ['Random from Chapter']
    });

    const fetchQuizzes = async () => {
        if (!chapterId) return;
        setLoading(true);
        try {
            const [textbookSnap, chapterSnap] = await Promise.all([
                getDoc(doc(db, 'textbooks', textbookId)),
                getDoc(doc(db, `textbooks/${textbookId}/chapters`, chapterId))
            ]);
            if (textbookSnap.exists()) setTextbook({id: textbookSnap.id, ...textbookSnap.data()} as Textbook);
            if (chapterSnap.exists()) setChapter({id: chapterSnap.id, ...chapterSnap.data()} as Chapter);

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
    
    const handleOpenDialog = (quiz: Quiz | null) => {
        setEditingQuiz(quiz);
        const difficultyArray = (quiz?.difficulty && Array.isArray(quiz.difficulty) ? quiz.difficulty : ['Medium']) as ('Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Expert')[];
        const sourceArray = (quiz?.questionSource && Array.isArray(quiz.questionSource) ? quiz.questionSource : ['Random from Chapter']) as ('Random from Chapter' | 'Random from Topic' | 'Textbook Exercise' | 'Solved Examples' | 'Previous Year Questions')[];
        
        const subtitle = quiz ? quiz.subtitle || `Quiz ${quizzes.findIndex(q => q.id === quiz.id) + 1}` : `Quiz ${quizzes.length + 1}`;
        setQuizData(quiz ? { title: quiz.title, subtitle, difficulty: difficultyArray, questionSource: sourceArray } : { title: '', subtitle, difficulty: ['Medium'], questionSource: ['Random from Chapter'] });
        setIsDialogOpen(true);
    };

    const handleAddOrUpdate = async () => {
        if (!quizData.title.trim()) {
            toast({ variant: 'destructive', title: 'Title is required.' });
            return;
        }
        
        const contentToSave: any = { 
            ...quizData, 
            testType: 'Quiz',
            textbookId: textbookId,
            chapterId: chapterId,
            access: 'free',
            questions: editingQuiz?.questions || [],
        };
        
        try {
            if (editingQuiz) {
                await updateContent(editingQuiz.id, contentToSave);
                toast({ title: 'Quiz Updated' });
            } else {
                await addContent(contentToSave);
                toast({ title: 'Quiz Added' });
            }
            setIsDialogOpen(false);
            setEditingQuiz(null);
            fetchQuizzes();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error saving quiz', description: (error as Error).message });
        }
    };

     const generateTitle = (template: string) => {
        const title = template
            .replace('[Chapter Title]', chapter?.title || '')
            .replace('[Subject]', textbook?.subject || '')
            .replace('[Textbook Title]', textbook?.title || '');
        setQuizData(prev => ({ ...prev, title }));
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
                 <Button onClick={() => handleOpenDialog(null)}><PlusCircle className="mr-2" /> Add New Quiz</Button>
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
                                <TableHead>Access</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-32 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                            ) : quizzes.length > 0 ? (
                                quizzes.map((quiz) => (
                                <TableRow key={quiz.id}>
                                    <TableCell className="font-medium">{quiz.subtitle}: {quiz.title}</TableCell>
                                    <TableCell><ContentBadge type={quiz.access} /></TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/textbook-solutions/quiz/${quiz.id}/textbook/${textbookId}/chapter/${chapterId}/topic/null`}><Eye className="mr-2 h-4 w-4"/>View</Link>
                                        </Button>
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/admin/textbooks/${textbookId}/chapter/${chapterId}/topic/null/quiz/${quiz.id}`}><FileQuestion className="mr-2 h-4 w-4"/>Manage Questions</Link>
                                        </Button>
                                         <Button variant="outline" size="sm" onClick={() => handleOpenDialog(quiz)}>
                                            <Edit className="mr-2 h-4 w-4"/>Edit
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

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingQuiz ? 'Edit Quiz' : 'Add New Quiz'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                         <div className="space-y-2">
                            <Label htmlFor="quiz-subtitle">Subtitle</Label>
                            <Input id="quiz-subtitle" value={quizData.subtitle} onChange={e => setQuizData(p => ({...p, subtitle: e.target.value}))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="quiz-title">Title</Label>
                            <div className="flex gap-2">
                                <Input id="quiz-title" value={quizData.title} onChange={e => setQuizData(p => ({...p, title: e.target.value}))} />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="icon"><Sparkles className="h-4 w-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onSelect={() => generateTitle('[Chapter Title] - Quiz', setQuizData)}>[Chapter Title] - Quiz</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => generateTitle('[Chapter Title] - Knowledge Check', setQuizData)}>[Chapter Title] - Knowledge Check</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Difficulty</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {difficultyOptions.map(option => (
                                    <div key={option} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`diff-quiz-${option}`}
                                            checked={quizData.difficulty.includes(option as any)}
                                            onCheckedChange={(checked) => {
                                                const currentDifficulties = quizData.difficulty;
                                                const newDifficulties = checked
                                                    ? [...currentDifficulties, option as any]
                                                    : currentDifficulties.filter(d => d !== option);
                                                setQuizData(prev => ({...prev, difficulty: newDifficulties }));
                                            }}
                                        />
                                        <label htmlFor={`diff-quiz-${option}`} className="text-sm font-medium leading-none">{option}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label>Question Source</Label>
                             <div className="grid grid-cols-2 gap-2">
                                {questionSourceOptions.map(option => (
                                     <div key={option} className="flex items-center space-x-2">
                                         <Checkbox
                                            id={`source-quiz-${option}`}
                                            checked={quizData.questionSource.includes(option as any)}
                                            onCheckedChange={(checked) => {
                                                const currentSources = quizData.questionSource;
                                                const newSources = checked
                                                    ? [...currentSources, option as any]
                                                    : currentSources.filter(s => s !== option);
                                                setQuizData(prev => ({...prev, questionSource: newSources }));
                                            }}
                                        />
                                        <label htmlFor={`source-quiz-${option}`} className="text-sm font-medium leading-none">{option}</label>
                                     </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                        <Button onClick={handleAddOrUpdate}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
