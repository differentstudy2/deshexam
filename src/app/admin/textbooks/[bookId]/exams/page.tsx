
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
import { Eye, PlusCircle, ArrowLeft, Edit, Trash2, FileQuestion } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ContentBadge } from '@/components/content-badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

type Exam = {
    id: string;
    title: string;
    subject: string;
    testType: string;
    access: 'free' | 'premium' | 'pro';
    createdAt: string;
    textbookId?: string;
}

function getUrlForExam(examId: string) {
    return `/exam/${examId}`;
}

export default function ManageTextbookExamsPage() {
    const params = useParams();
    const textbookId = params.bookId as string;
    const { toast } = useToast();

    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [examToDelete, setExamToDelete] = useState<Exam | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newExamData, setNewExamData] = useState({ title: '', description: '' });

    const fetchExams = async () => {
        if (!textbookId) return;
        setLoading(true);
        try {
            const allExams = await getAllContent('Exam') as Exam[];
            const textbookExams = allExams.filter(exam => exam.textbookId === textbookId);
            setExams(textbookExams);
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
    }, [textbookId, toast]);

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
    
    const handleAddExam = async () => {
        if (!newExamData.title) {
            toast({ variant: 'destructive', title: 'Title is required' });
            return;
        }
        
        const contentToSave = {
            ...newExamData,
            testType: 'Exam',
            textbookId: textbookId,
            access: 'free',
            questions: [],
        };
        
        try {
            await addContent(contentToSave);
            toast({ title: 'Exam Created!', description: 'You can now add questions to it.' });
            setIsDialogOpen(false);
            setNewExamData({ title: '', description: '' });
            fetchExams();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error Creating Exam', description: (error as Error).message });
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
                    <h1 className="font-headline text-3xl font-bold">Manage Exams</h1>
                    <p className="text-muted-foreground">
                        Exams associated with this textbook.
                    </p>
                </div>
                 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2" />
                            Add New Exam
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Exam</DialogTitle>
                            <DialogDescription>
                                Create a new exam shell. You can add questions after creating it.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="exam-title">Title</Label>
                                <Input 
                                    id="exam-title" 
                                    value={newExamData.title} 
                                    onChange={(e) => setNewExamData(prev => ({...prev, title: e.target.value}))} 
                                    placeholder="e.g., Mid-Term Exam"
                                />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="exam-description">Description</Label>
                                <Textarea 
                                    id="exam-description" 
                                    value={newExamData.description} 
                                    onChange={(e) => setNewExamData(prev => ({...prev, description: e.target.value}))} 
                                    placeholder="A brief description of the exam."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                            <Button onClick={handleAddExam}>Create Exam</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
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
                            ) : exams.length > 0 ? (
                                exams.map((exam) => (
                                <TableRow key={exam.id}>
                                    <TableCell className="font-medium">{exam.title}</TableCell>
                                    <TableCell>{exam.subject}</TableCell>
                                    <TableCell><ContentBadge type={exam.access} /></TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={getUrlForExam(exam.id)}><Eye className="mr-2 h-4 w-4"/>View</Link>
                                        </Button>
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/admin/textbooks/${textbookId}/exams/${exam.id}`}><FileQuestion className="mr-2 h-4 w-4"/>Manage Questions</Link>
                                        </Button>
                                         <Button asChild variant="outline" size="sm">
                                            <Link href={`/admin/edit-content/${exam.id}`}><Edit className="mr-2 h-4 w-4"/>Edit Details</Link>
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => setExamToDelete(exam)}>
                                            <Trash2 className="mr-2 h-4 w-4"/>Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">
                                    No exams added to this textbook yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

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
