
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
  CardFooter
} from '@/components/ui/card';
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
import { ImageUploader } from '@/components/feature/image-uploader';
import Image from 'next/image';
import type { Textbook, Chapter, Question } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';


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
    const [testData, setTestData] = useState<{title: string, subtitle: string, difficulty: ('Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Expert')[], questionSource: ('Random from Chapter' | 'Random from Topic' | 'Textbook Exercise' | 'Solved Examples' | 'Previous Year Questions')[], featureImage?: string, access: 'free' | 'premium' | 'pro'}>({
        title: '',
        subtitle: '',
        difficulty: ['Medium'],
        questionSource: ['Random from Chapter'],
        featureImage: '',
        access: 'free',
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
        setTestData(test ? { title: test.title, subtitle, difficulty: difficultyArray, questionSource: sourceArray, featureImage: test.featureImage || '', access: test.access || 'free' } : { title: '', subtitle, difficulty: ['Medium'], questionSource: ['Random from Chapter'], featureImage: '', access: 'free' });
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
    
    function getUrlForTest(testType: string, testId: string) {
        return `/textbook-solutions/mock-test/${testId}/textbook/${textbookId}`;
    }

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
                 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => handleOpenDialog(null)}>
                            <PlusCircle className="mr-2" />
                            Add New Mock Test
                        </Button>
                    </DialogTrigger>
                     <DialogContent className="max-h-[90vh]">
                        <DialogHeader>
                            <DialogTitle>{editingTest ? 'Edit Mock Test' : 'Add New Mock Test'}</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="max-h-[70vh] p-1">
                             <div className="space-y-4 py-4 pr-6">
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
                                    <Label>Access Level</Label>
                                    <Select value={testData.access} onValueChange={(value) => setTestData(prev => ({ ...prev, access: value as 'free' | 'premium' | 'pro' }))}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="free">Free</SelectItem>
                                            <SelectItem value="premium">Premium (Paid)</SelectItem>
                                            <SelectItem value="pro">Pro (Subscription)</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                        </ScrollArea>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                            <Button onClick={handleAddOrUpdate}>Save</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Mock Tests ({tests.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Card key={i}><CardContent className="p-4"><Skeleton className="h-48 w-full" /></CardContent></Card>
                            ))}
                        </div>
                    ) : tests.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {tests.map((test) => (
                                <Card key={test.id} className="flex flex-col">
                                    <CardHeader className="p-0 relative h-40">
                                        <Image
                                            src={test.featureImage || `https://picsum.photos/seed/${test.id}/400/225`}
                                            alt={test.title}
                                            fill
                                            className="object-cover rounded-t-lg"
                                        />
                                        <div className="absolute top-2 right-2"><ContentBadge type={test.access} /></div>
                                    </CardHeader>
                                    <CardContent className="p-4 flex-grow">
                                        <CardTitle className="font-headline text-lg mb-1">{test.subtitle}: {test.title}</CardTitle>
                                        <div className="flex flex-wrap gap-1">
                                            {(Array.isArray(test.difficulty) ? test.difficulty : test.difficulty ? [test.difficulty] : []).map(d => d && <Badge key={d} variant="secondary">{d}</Badge>)}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-4 pt-0 grid grid-cols-2 gap-2">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={getUrlForTest(test.testType, test.id)}><Eye className="mr-2 h-4 w-4"/>View</Link>
                                        </Button>
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/admin/textbooks/${textbookId}/mock-tests/${test.id}`}><FileQuestion className="mr-2 h-4 w-4"/>Questions</Link>
                                        </Button>
                                         <Button variant="outline" size="sm" onClick={() => handleOpenDialog(test)}>
                                            <Edit className="mr-2 h-4 w-4"/>Edit
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => setTestToDelete(test)}>
                                            <Trash2 className="mr-2 h-4 w-4"/>Delete
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-muted-foreground">
                            <p>No mock tests added to this textbook yet.</p>
                        </div>
                    )}
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
