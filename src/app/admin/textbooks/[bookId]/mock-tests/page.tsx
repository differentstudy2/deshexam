
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getAllContent, deleteContent, addContent, updateContent, getTextbookById } from '@/lib/firebase/firestore';
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
import type { Textbook, Chapter, Question } from '@/lib/types';
import { ImageUploader } from '@/components/feature/image-uploader';
import Image from 'next/image';


type MockTest = {
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
    featureImage?: string;
}

const difficultyOptions = ['Beginner', 'Easy', 'Medium', 'Hard', 'Expert'];
const questionSourceOptions = ['Random from Chapter', 'Random from Topic', 'Textbook Exercise', 'Solved Examples', 'Previous Year Questions'];


export default function ManageTextbookMockTestsPage() {
    const params = useParams();
    const textbookId = params.bookId as string;
    const { toast } = useToast();

    const [tests, setTests] = useState<MockTest[]>([]);
    const [loading, setLoading] = useState(true);
    const [testToDelete, setTestToDelete] = useState<MockTest | null>(null);
    const [textbook, setTextbook] = useState<Textbook | null>(null);
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTest, setEditingTest] = useState<MockTest | null>(null);
    const [testData, setTestData] = useState<{title: string, subtitle: string, difficulty: ('Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Expert')[], questionSource: ('Random from Chapter' | 'Random from Topic' | 'Textbook Exercise' | 'Solved Examples' | 'Previous Year Questions')[], featureImage?: string}>({
        title: '',
        subtitle: '',
        difficulty: ['Medium'],
        questionSource: ['Random from Chapter'],
        featureImage: '',
    });

    const fetchTestsAndTextbook = async () => {
        if (!textbookId) return;
        setLoading(true);
        try {
            const [fetchedTests, textbookData] = await Promise.all([
                getAllContent("Mock Test"),
                getTextbookById(textbookId),
            ]);

            setTextbook(textbookData as Textbook);

            const textbookTests = (fetchedTests as MockTest[]).filter(test => test.textbookId === textbookId);
            setTests(textbookTests);
        } catch (error) {
             toast({
                variant: "destructive",
                title: 'Error fetching data',
                description: (error as Error).message,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTestsAndTextbook();
    }, [textbookId, toast]);

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

    const handleOpenDialog = (test: MockTest | null) => {
        setEditingTest(test);
        const difficultyArray = (test?.difficulty && Array.isArray(test.difficulty) ? test.difficulty : ['Medium']) as ('Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Expert')[];
        const sourceArray = (test?.questionSource && Array.isArray(test.questionSource) ? test.questionSource : ['Random from Chapter']) as ('Random from Chapter' | 'Random from Topic' | 'Textbook Exercise' | 'Solved Examples' | 'Previous Year Questions')[];
        
        const subtitle = test ? test.subtitle || `Mock Test ${tests.findIndex(t => t.id === test.id) + 1}` : `Mock Test ${tests.length + 1}`;
        setTestData(test ? { title: test.title, subtitle, difficulty: difficultyArray, questionSource: sourceArray, featureImage: test.featureImage || '' } : { title: '', subtitle, difficulty: ['Medium'], questionSource: ['Random from Chapter'], featureImage: '' });
        setIsDialogOpen(true);
    };

    const handleAddOrUpdate = async () => {
        if (!testData.title.trim()) {
            toast({ variant: 'destructive', title: 'Title is required.' });
            return;
        }

        const contentToSave: any = { 
            ...testData, 
            testType: 'Mock Test',
            textbookId: textbookId,
            access: 'free',
            questions: editingTest?.questions || [],
        };
        
        try {
            if (editingTest) {
                await updateContent(editingTest.id, contentToSave);
                toast({ title: 'Mock Test Updated' });
            } else {
                await addContent(contentToSave);
                toast({ title: 'Mock Test Added' });
            }
            setIsDialogOpen(false);
            setEditingTest(null);
            fetchTestsAndTextbook();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error saving mock test', description: (error as Error).message });
        }
    };
    
    const generateTitle = (template: string) => {
        const title = template
            .replace('[Subject]', textbook?.subject || '')
            .replace('[Textbook Title]', textbook?.title || '');
        setTestData(prev => ({ ...prev, title }));
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
                    <h1 className="font-headline text-3xl font-bold">Manage Mock Tests</h1>
                    <p className="text-muted-foreground">
                        Mock tests associated with this textbook.
                    </p>
                </div>
                <Button onClick={() => handleOpenDialog(null)}><PlusCircle className="mr-2" /> Add New Mock Test</Button>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Mock Tests ({tests.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-20">Image</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Questions</TableHead>
                                <TableHead>Access</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-10 w-16 rounded-md" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-32 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                            ) : tests.length > 0 ? (
                                tests.map((test) => (
                                <TableRow key={test.id}>
                                    <TableCell>
                                        <Image 
                                            src={test.featureImage || '/image/logo.png'} 
                                            alt={test.title}
                                            width={64}
                                            height={40}
                                            className="rounded-md object-cover"
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{test.subtitle ? `${test.subtitle}: ${test.title}` : test.title}</TableCell>
                                    <TableCell>{test.questions?.length || 0}</TableCell>
                                    <TableCell><ContentBadge type={test.access} /></TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/textbook-solutions/mock-test/${test.id}/textbook/${textbookId}`}><Eye className="mr-2 h-4 w-4"/>View</Link>
                                        </Button>
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/admin/textbooks/${textbookId}/mock-tests/${test.id}`}><FileQuestion className="mr-2 h-4 w-4"/>Manage Questions</Link>
                                        </Button>
                                         <Button variant="outline" size="sm" onClick={() => handleOpenDialog(test)}>
                                            <Edit className="mr-2 h-4 w-4"/>Edit
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => setTestToDelete(test)}>
                                            <Trash2 className="mr-2 h-4 w-4"/>Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                    No mock tests added to this textbook yet.
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
                        <DialogTitle>{editingTest ? 'Edit Mock Test' : 'Add New Mock Test'}</DialogTitle>
                    </DialogHeader>
                     <div className="space-y-4 py-4">
                         <div className="space-y-2">
                            <Label>Feature Image</Label>
                            <ImageUploader
                                fieldName="featureImage"
                                onUrlChange={(url) => setTestData(p => ({ ...p, featureImage: url }))}
                                value={testData.featureImage}
                            />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="test-subtitle">Subtitle</Label>
                            <Input id="test-subtitle" value={testData.subtitle} onChange={e => setTestData(p => ({...p, subtitle: e.target.value}))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="test-title">Title</Label>
                            <div className="flex gap-2">
                                <Input id="test-title" value={testData.title} onChange={e => setTestData(p => ({...p, title: e.target.value}))} />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="icon"><Sparkles className="h-4 w-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onSelect={() => generateTitle('[Subject] Full Syllabus Mock Test')}>[Subject] Full Syllabus Mock Test</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => generateTitle('[Textbook Title] - Complete Mock Test')}>[Textbook Title] - Complete Mock Test</DropdownMenuItem>
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
                                            id={`diff-${option}`}
                                            checked={testData.difficulty.includes(option as any)}
                                            onCheckedChange={(checked) => {
                                                const currentDifficulties = testData.difficulty;
                                                const newDifficulties = checked
                                                    ? [...currentDifficulties, option as any]
                                                    : currentDifficulties.filter(d => d !== option);
                                                setTestData(prev => ({...prev, difficulty: newDifficulties }));
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
                                            checked={testData.questionSource.includes(option as any)}
                                            onCheckedChange={(checked) => {
                                                const currentSources = testData.questionSource;
                                                const newSources = checked
                                                    ? [...currentSources, option as any]
                                                    : currentSources.filter(s => s !== option);
                                                setTestData(prev => ({...prev, questionSource: newSources }));
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
