
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getAllContent, deleteContent, addContent, updateContent } from '@/lib/firebase/firestore';
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
    DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, PlusCircle, ArrowLeft, Edit, Trash2, FileQuestion, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ContentBadge } from '@/components/content-badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Question } from '@/lib/types';


type Quiz = {
    id: string;
    title: string;
    subtitle?: string;
    subject: string;
    testType: string;
    access: 'free' | 'premium' | 'pro';
    createdAt: string;
    textbookId?: string;
    difficulty?: ('Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Expert')[];
    questionSource?: ('Random from Chapter' | 'Random from Topic' | 'Textbook Exercise' | 'Solved Examples' | 'Previous Year Questions')[];
    questions?: Question[];
}

const difficultyOptions = ['Beginner', 'Easy', 'Medium', 'Hard', 'Expert'];
const questionSourceOptions = ['Random from Chapter', 'Random from Topic', 'Textbook Exercise', 'Solved Examples', 'Previous Year Questions'];

function getUrlForQuiz(bookId: string, quizId: string) {
    return `/textbook-solutions/quiz/${quizId}/textbook/${bookId}`;
}


export default function ManageTextbookQuizzesPage() {
    const params = useParams();
    const textbookId = params.bookId as string;
    const { toast } = useToast();

    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
    const [quizData, setQuizData] = useState<{title: string, subtitle: string, difficulty: string[], questionSource: string[]}>({
        title: '',
        subtitle: '',
        difficulty: ['Medium'],
        questionSource: ['Random from Chapter']
    });

    useEffect(() => {
        const fetchQuizzes = async () => {
            if (!textbookId) return;
            setLoading(true);
            try {
                const allQuizzes = (await getAllContent("Quiz")) as Quiz[];
                const textbookQuizzes = allQuizzes.filter(quiz => quiz.textbookId === textbookId);
                setQuizzes(textbookQuizzes);
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
        fetchQuizzes();
    }, [textbookId, toast]);

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
        const difficultyArray = (quiz?.difficulty && Array.isArray(quiz.difficulty) ? quiz.difficulty : ['Medium']) as any[];
        const sourceArray = (quiz?.questionSource && Array.isArray(quiz.questionSource) ? quiz.questionSource : ['Random from Chapter']) as any[];
        
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
                    <h1 className="font-headline text-3xl font-bold">Manage Quizzes</h1>
                    <p className="text-muted-foreground">
                        Quizzes associated with this textbook.
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
                                    <TableCell className="font-medium">{quiz.subtitle}: {quiz.title}</TableCell>
                                    <TableCell>{quiz.subject}</TableCell>
                                    <TableCell><ContentBadge type={quiz.access} /></TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={getUrlForQuiz(textbookId, quiz.id)}><Eye className="mr-2 h-4 w-4"/>View</Link>
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
                                    No quizzes added to this textbook yet.
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
                            <Input id="quiz-title" value={quizData.title} onChange={e => setQuizData(p => ({...p, title: e.target.value}))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Difficulty</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {difficultyOptions.map(option => (
                                    <div key={option} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`diff-quiz-${option}`}
                                            checked={quizData.difficulty.includes(option)}
                                            onCheckedChange={(checked) => {
                                                const currentDifficulties = quizData.difficulty;
                                                const newDifficulties = checked
                                                    ? [...currentDifficulties, option]
                                                    : currentDifficulties.filter(d => d !== option);
                                                setQuizData(prev => ({...prev, difficulty: newDifficulties as any[] }));
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
                                            checked={quizData.questionSource.includes(option)}
                                            onCheckedChange={(checked) => {
                                                const currentSources = quizData.questionSource;
                                                const newSources = checked
                                                    ? [...currentSources, option]
                                                    : currentSources.filter(s => s !== option);
                                                setQuizData(prev => ({...prev, questionSource: newSources as any[] }));
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
