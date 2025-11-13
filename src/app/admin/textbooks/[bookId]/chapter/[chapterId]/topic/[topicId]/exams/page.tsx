
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

type Exam = {
    id: string;
    title: string;
    subtitle?: string;
    subject: string;
    testType: string;
    access: 'free' | 'premium' | 'pro';
    createdAt: string;
    chapterId?: string;
    topicId?: string;
    difficulty?: ('Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Expert')[];
    questionSource?: ('Random from Chapter' | 'Random from Topic' | 'Textbook Exercise' | 'Solved Examples' | 'Previous Year Questions')[];
    questions?: any[];
}

const difficultyOptions = ['Beginner', 'Easy', 'Medium', 'Hard', 'Expert'];
const questionSourceOptions = ['Random from Chapter', 'Random from Topic', 'Textbook Exercise', 'Solved Examples', 'Previous Year Questions'];


export default function ManageTopicExamsPage() {
    const params = useParams();
    const textbookId = params.bookId as string;
    const chapterId = params.chapterId as string;
    const topicId = params.topicId as string;
    const { toast } = useToast();

    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [examToDelete, setExamToDelete] = useState<Exam | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingExam, setEditingExam] = useState<Exam | null>(null);
    const [examData, setExamData] = useState<{title: string, subtitle: string, difficulty: string[], questionSource: string[]}>({
        title: '',
        subtitle: '',
        difficulty: ['Medium'],
        questionSource: ['Random from Topic']
    });


    const fetchExams = async () => {
        if (!topicId) return;
        setLoading(true);
        try {
            const allExams = (await getAllContent("Exam")) as Exam[];
            const topicExams = allExams.filter(exam => exam.topicId === topicId);
            setExams(topicExams);
        } catch (error) {
             toast({
                variant: "destructive",
                title: 'Error fetching exams',
                description: (error as Error).message,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExams();
    }, [topicId, toast]);

    const handleDelete = async () => {
        if (!examToDelete) return;
        try {
            await deleteContent(examToDelete.id);
            toast({
                title: 'Exam Deleted',
                description: `"${examToDelete.title}" has been successfully deleted.`,
            });
            setExams(exams.filter(exam => exam.id !== examToDelete.id));
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error Deleting Exam',
                description: (error as Error).message,
            });
        } finally {
            setExamToDelete(null);
        }
    };

     const handleOpenDialog = (exam: Exam | null) => {
        setEditingExam(exam);
        const difficultyArray = (exam?.difficulty && Array.isArray(exam.difficulty) ? exam.difficulty : ['Medium']) as any[];
        const sourceArray = (exam?.questionSource && Array.isArray(exam.questionSource) ? exam.questionSource : ['Random from Topic']) as any[];
        
        const subtitle = exam ? exam.subtitle || `Exam ${exams.findIndex(t => t.id === exam.id) + 1}` : `Exam ${exams.length + 1}`;
        setExamData(exam ? { title: exam.title, subtitle, difficulty: difficultyArray, questionSource: sourceArray } : { title: '', subtitle, difficulty: ['Medium'], questionSource: ['Random from Topic'] });
        setIsDialogOpen(true);
    };

    const handleAddOrUpdate = async () => {
        if (!examData.title.trim()) {
            toast({ variant: 'destructive', title: 'Title is required.' });
            return;
        }

        const contentToSave: any = { 
            ...examData, 
            testType: 'Exam',
            textbookId: textbookId,
            chapterId: chapterId,
            topicId: topicId,
            access: 'free',
            questions: editingExam?.questions || [],
        };
        
        try {
            if (editingExam) {
                await updateContent(editingExam.id, contentToSave);
                toast({ title: 'Exam Updated' });
            } else {
                await addContent(contentToSave);
                toast({ title: 'Exam Added' });
            }
            setIsDialogOpen(false);
            setEditingExam(null);
            fetchExams();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error saving exam', description: (error as Error).message });
        }
    };


    return (
        <div className="space-y-6">
            <div>
                <Button asChild variant="ghost">
                    <Link href={`/admin/textbooks/${textbookId}/chapter/${chapterId}/topic/${topicId}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Topic
                    </Link>
                </Button>
            </div>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-headline text-3xl font-bold">Manage Exams</h1>
                    <p className="text-muted-foreground">
                        Exams associated with this topic.
                    </p>
                </div>
                 <Button onClick={() => handleOpenDialog(null)}><PlusCircle className="mr-2" /> Add New Exam</Button>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Exams ({exams.length})</CardTitle>
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
                            ) : exams.length > 0 ? (
                                exams.map((exam) => (
                                <TableRow key={exam.id}>
                                    <TableCell className="font-medium">{exam.subtitle}: {exam.title}</TableCell>
                                    <TableCell><ContentBadge type={exam.access} /></TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/exam/${exam.id}`}><Eye className="mr-2 h-4 w-4"/>View</Link>
                                        </Button>
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/admin/textbooks/${textbookId}/chapter/${chapterId}/topic/${topicId}/exam/${exam.id}`}><FileQuestion className="mr-2 h-4 w-4"/>Manage Questions</Link>
                                        </Button>
                                         <Button variant="outline" size="sm" onClick={() => handleOpenDialog(exam)}>
                                            <Edit className="mr-2 h-4 w-4"/>Edit
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => setExamToDelete(exam)}>
                                            <Trash2 className="mr-2 h-4 w-4"/>Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">
                                    No exams added to this topic yet.
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
                        <DialogTitle>{editingExam ? 'Edit Exam' : 'Add New Exam'}</DialogTitle>
                    </DialogHeader>
                     <div className="space-y-4 py-4">
                         <div className="space-y-2">
                            <Label htmlFor="exam-subtitle">Subtitle</Label>
                            <Input id="exam-subtitle" value={examData.subtitle} onChange={e => setExamData(p => ({...p, subtitle: e.target.value}))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="exam-title">Title</Label>
                            <Input id="exam-title" value={examData.title} onChange={e => setExamData(p => ({...p, title: e.target.value}))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Difficulty</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {difficultyOptions.map(option => (
                                    <div key={option} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`diff-${option}`}
                                            checked={examData.difficulty.includes(option)}
                                            onCheckedChange={(checked) => {
                                                const currentDifficulties = examData.difficulty;
                                                const newDifficulties = checked
                                                    ? [...currentDifficulties, option]
                                                    : currentDifficulties.filter(d => d !== option);
                                                setExamData(prev => ({...prev, difficulty: newDifficulties as any[] }));
                                            }}
                                        />
                                        <label htmlFor={`diff-${option}`} className="text-sm font-medium leading-none">{option}</label>
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
                                            id={`source-${option}`}
                                            checked={examData.questionSource.includes(option)}
                                            onCheckedChange={(checked) => {
                                                const currentSources = examData.questionSource;
                                                const newSources = checked
                                                    ? [...currentSources, option]
                                                    : currentSources.filter(s => s !== option);
                                                setExamData(prev => ({...prev, questionSource: newSources as any[] }));
                                            }}
                                        />
                                        <label htmlFor={`source-${option}`} className="text-sm font-medium leading-none">{option}</label>
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

            <AlertDialog open={!!examToDelete} onOpenChange={() => setExamToDelete(null)}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the exam
                    "{examToDelete?.title}".
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
