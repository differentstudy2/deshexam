
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


type MockTest = {
    id: string;
    title: string;
    subject: string;
    testType: string;
    access: 'free' | 'premium' | 'pro';
    createdAt: string;
    chapterId?: string;
}

function getUrlForTest(testId: string) {
    return `/mock-test/${testId}`;
}

export default function ManageChapterMockTestsPage() {
    const params = useParams();
    const textbookId = params.bookId as string;
    const chapterId = params.chapterId as string;
    const { toast } = useToast();

    const [tests, setTests] = useState<MockTest[]>([]);
    const [loading, setLoading] = useState(true);
    const [testToDelete, setTestToDelete] = useState<MockTest | null>(null);
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newTestData, setNewTestData] = useState({ title: '', description: '', difficulty: 'Medium' });

    const fetchTests = async () => {
        if (!chapterId) return;
        setLoading(true);
        try {
            const allTests = (await getAllContent("Mock Test")) as MockTest[];
            const chapterTests = allTests.filter(test => test.chapterId === chapterId);
            setTests(chapterTests);
        } catch (error) {
             toast({
                variant: "destructive",
                title: 'Error fetching mock tests',
                description: (error as Error).message,
            });
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchTests();
    }, [chapterId, toast]);

    const handleDelete = async () => {
        if (!testToDelete) return;
        try {
            await deleteContent(testToDelete.id);
            toast({
                title: 'Mock Test Deleted',
                description: `"${testToDelete.title}" has been successfully deleted.`,
            });
            setTests(tests.filter(test => test.id !== testToDelete.id));
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error Deleting Mock Test',
                description: (error as Error).message,
            });
        } finally {
            setTestToDelete(null);
        }
    };

    const handleAddTest = async () => {
        if (!newTestData.title) {
            toast({ variant: 'destructive', title: 'Title is required.' });
            return;
        }
        try {
             const contentToSave: any = { 
                ...newTestData, 
                testType: 'Mock Test',
                textbookId: textbookId,
                chapterId: chapterId,
                access: 'free',
                questions: [],
             };
            await addContent(contentToSave);
            toast({ title: 'Mock Test Added' });
            setIsDialogOpen(false);
            setNewTestData({ title: '', description: '', difficulty: 'Medium' });
            fetchTests();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error adding mock test', description: (error as Error).message });
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
                    <h1 className="font-headline text-3xl font-bold">Manage Mock Tests</h1>
                    <p className="text-muted-foreground">
                        Mock tests associated with this chapter.
                    </p>
                </div>
                 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button><PlusCircle className="mr-2" /> Add New Mock Test</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Mock Test</DialogTitle>
                            <DialogDescription>Fill in the details for the new mock test.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="test-title">Title</Label>
                                <Input id="test-title" value={newTestData.title} onChange={e => setNewTestData(p => ({...p, title: e.target.value}))} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="test-desc">Description</Label>
                                <Textarea id="test-desc" value={newTestData.description} onChange={e => setNewTestData(p => ({...p, description: e.target.value}))} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="test-difficulty">Difficulty</Label>
                                <Select value={newTestData.difficulty} onValueChange={(v) => setNewTestData(p => ({...p, difficulty: v}))}>
                                    <SelectTrigger id="test-difficulty"><SelectValue /></SelectTrigger>
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
                            <Button onClick={handleAddTest}>Save</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Mock Tests ({tests.length})</CardTitle>
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
                            ) : tests.length > 0 ? (
                                tests.map((test) => (
                                <TableRow key={test.id}>
                                    <TableCell className="font-medium">{test.title}</TableCell>
                                    <TableCell>{test.subject}</TableCell>
                                    <TableCell><ContentBadge type={test.access} /></TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={getUrlForTest(test.id)}><Eye className="mr-2 h-4 w-4"/>View</Link>
                                        </Button>
                                         <Button asChild variant="outline" size="sm">
                                            <Link href={`/admin/edit-content/${test.id}`}><Edit className="mr-2 h-4 w-4"/>Edit</Link>
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => setTestToDelete(test)}>
                                            <Trash2 className="mr-2 h-4 w-4"/>Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">
                                    No mock tests added to this chapter yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <AlertDialog open={!!testToDelete} onOpenChange={() => setTestToDelete(null)}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the mock test
                    "{testToDelete?.title}".
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
