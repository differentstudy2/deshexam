
'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Topic, PracticeSet, Resource } from '@/lib/types';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, PlusCircle, BookOpen, Edit, Trash2, Video, FileText, Mic, Upload, Loader2, ExternalLink, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { 
    addPracticeSetToTopic, 
    getPracticeSetsByTopicId, 
    uploadFile,
    getTextbookById,
    getChapterById
} from '@/lib/firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ResourceViewerDialog } from '@/components/feature/resource-viewer-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


const difficultyOptions = ['Beginner', 'Easy', 'Medium', 'Hard', 'Expert'];
const questionSourceOptions = ['Random from Chapter', 'Random from Topic', 'Textbook Exercise', 'Solved Examples', 'Previous Year Questions'];

export default function ManageTopicPage() {
    const params = useParams();
    const { toast } = useToast();

    const textbookId = params.bookId as string;
    const chapterId = params.chapterId as string;
    const topicId = params.topicId as string;
    
    const [topic, setTopic] = useState<Topic | null>(null);
    const [textbook, setTextbook] = useState<any | null>(null);
    const [chapter, setChapter] = useState<any | null>(null);
    const [practiceSets, setPracticeSets] = useState<PracticeSet[]>([]);
    const [loading, setLoading] = useState(true);

    const [isPracticeSetDialogOpen, setIsPracticeSetDialogOpen] = useState(false);
    const [editingPracticeSet, setEditingPracticeSet] = useState<PracticeSet | null>(null);
    const [practiceSetData, setPracticeSetData] = useState<{title: string, difficulty: ('Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Expert')[], questionSource: ('Random from Chapter' | 'Random from Topic' | 'Textbook Exercise' | 'Solved Examples' | 'Previous Year Questions')[]}>({
        title: '',
        difficulty: ['Medium'],
        questionSource: ['Random from Topic']
    });
    const [practiceSetToDelete, setPracticeSetToDelete] = useState<PracticeSet | null>(null);
    

    const fetchData = async () => {
        if (!textbookId || !chapterId || !topicId) return;
        setLoading(true);

        try {
            const topicRef = doc(db, `textbooks/${textbookId}/chapters/${chapterId}/topics`, topicId);
            const topicSnap = await getDoc(topicRef);
            if (topicSnap.exists()) {
                setTopic({ id: topicSnap.id, ...topicSnap.data() } as Topic);
            }

            const [textbookData, chapterData] = await Promise.all([
                getTextbookById(textbookId),
                getChapterById(textbookId, chapterId),
            ]);
            setTextbook(textbookData);
            setChapter(chapterData);

            const fetchedPracticeSets = await getPracticeSetsByTopicId(textbookId, chapterId, topicId);
            setPracticeSets(fetchedPracticeSets as PracticeSet[]);
        } catch (error) {
             toast({ variant: 'destructive', title: 'Error fetching topic data', description: (error as Error).message });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [textbookId, chapterId, topicId]);
    
    const handleOpenPracticeSetDialog = (ps: PracticeSet | null) => {
        setEditingPracticeSet(ps);
        
        let difficultyArray: ('Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Expert')[] = ['Medium'];
        if (ps?.difficulty) {
            difficultyArray = Array.isArray(ps.difficulty) ? ps.difficulty : [ps.difficulty] as any;
        }
        
        let sourceArray: ('Random from Chapter' | 'Random from Topic' | 'Textbook Exercise' | 'Solved Examples' | 'Previous Year Questions')[] = ['Random from Topic'];
        if (ps?.questionSource) {
            sourceArray = Array.isArray(ps.questionSource) ? ps.questionSource : [ps.questionSource] as any;
        }

        setPracticeSetData(ps ? { title: ps.title, difficulty: difficultyArray, questionSource: sourceArray } : { title: '', difficulty: ['Medium'], questionSource: ['Random from Topic']});
        setIsPracticeSetDialogOpen(true);
    }

    const handleAddOrUpdatePracticeSet = async () => {
        if (!practiceSetData.title.trim() || practiceSetData.difficulty.length === 0) {
            toast({ variant: 'destructive', title: 'Please fill all required fields.' });
            return;
        }
        try {
            if (editingPracticeSet) {
                const psRef = doc(db, `textbooks/${textbookId}/chapters/${chapterId}/topics/${topicId}/practiceSets`, editingPracticeSet.id);
                await updateDoc(psRef, practiceSetData);
                toast({ title: 'Practice Set Updated' });
            } else {
                await addPracticeSetToTopic(textbookId, chapterId, topicId, practiceSetData);
                toast({ title: 'Practice Set Added' });
            }

            setPracticeSetData({ title: '', difficulty: ['Medium'], questionSource: ['Random from Topic']});
            setIsPracticeSetDialogOpen(false);
            setEditingPracticeSet(null);
            fetchData();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: (error as Error).message });
        }
    }
    
    const handleDeletePracticeSet = async (ps: PracticeSet) => {
        if (!ps) return;
        try {
            const psRef = doc(db, `textbooks/${textbookId}/chapters/${chapterId}/topics/${topicId}/practiceSets`, ps.id);
            await deleteDoc(psRef);
            toast({ title: 'Practice Set Deleted' });
            setPracticeSets(prev => prev.filter(p => p.id !== ps.id));
        } catch (error) {
             toast({ variant: 'destructive', title: 'Error deleting practice set', description: (error as Error).message });
        } finally {
            setPracticeSetToDelete(null);
        }
    };
    
    const generateTitle = (template: string) => {
        const title = template
            .replace('[Chapter Title]', chapter?.title || '')
            .replace('[Topic Title]', topic?.title || '')
            .replace('[Subject]', textbook?.subject || '')
            .replace('[Textbook Title]', textbook?.title || '');
        setPracticeSetData(prev => ({ ...prev, title }));
    };

    if (loading) return <div className="flex items-center justify-center h-full">Loading...</div>

    return (
        <div className="space-y-6">
            <div>
                <Button variant="ghost" asChild>
                    <Link href={`/admin/textbooks/${textbookId}/chapter/${chapterId}/topics`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Topics
                    </Link>
                </Button>
            </div>
            <header>
                <h1 className="font-headline text-3xl font-bold">Manage Topic: <span className="text-primary">{topic?.title}</span></h1>
                 <p className="text-muted-foreground mt-1">Here you can add and manage practice sets for this topic.</p>
            </header>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Practice Sets</CardTitle>
                        <CardDescription>Manage practice tests associated with this topic.</CardDescription>
                    </div>
                    <Button size="sm" onClick={() => handleOpenPracticeSetDialog(null)}><PlusCircle className="mr-2"/> Add Practice Set</Button>
                </CardHeader>
                <CardContent>
                    {practiceSets.length > 0 ? (
                        <ul className="space-y-2">
                            {practiceSets.map(ps => {
                                const difficulties = Array.isArray(ps.difficulty) ? ps.difficulty : ps.difficulty ? [ps.difficulty] : [];
                                const sources = Array.isArray(ps.questionSource) ? ps.questionSource : ps.questionSource ? [ps.questionSource] : [];
                                return (
                                <li key={ps.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-md gap-2">
                                    <div className="flex-grow flex items-center gap-2 flex-wrap">
                                        <span className="font-medium">{ps.title}</span>
                                        {difficulties.map(d => <Badge key={d} variant="secondary">{d}</Badge>)}
                                        {sources.map(s => <Badge key={s} variant="outline">{s.replace('-', ' ')}</Badge>)}
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/admin/textbooks/${textbookId}/chapter/${chapterId}/topic/${topicId}/practice-set/${ps.id}`}>
                                                Manage Questions
                                            </Link>
                                        </Button>
                                         <Button variant="outline" size="sm" onClick={() => handleOpenPracticeSetDialog(ps)}>
                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => setPracticeSetToDelete(ps)}>
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                        </Button>
                                    </div>
                                </li>
                            )})}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">No practice sets created for this topic yet.</p>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isPracticeSetDialogOpen} onOpenChange={setIsPracticeSetDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingPracticeSet ? 'Edit Practice Set' : 'Add New Practice Set'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="practice-set-title">Title</Label>
                            <div className="flex gap-2">
                                <Input id="practice-set-title" value={practiceSetData.title} onChange={(e) => setPracticeSetData(prev => ({ ...prev, title: e.target.value }))} />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="icon"><Sparkles className="h-4 w-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onSelect={() => generateTitle('[Topic Title] - Practice Set')}>[Topic Title] - Practice Set</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => generateTitle('[Topic Title] - MCQ Questions')}>[Topic Title] - MCQ Questions</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => generateTitle('[Subject] Practice: [Topic Title]')}>[Subject] Practice: [Topic Title]</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => generateTitle('[Textbook Title]: [Topic Title] Practice')}>[Textbook Title]: [Topic Title] Practice</DropdownMenuItem>
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
                                            checked={practiceSetData.difficulty.includes(option as any)}
                                            onCheckedChange={(checked) => {
                                                const currentDifficulties = practiceSetData.difficulty;
                                                const newDifficulties = checked
                                                    ? [...currentDifficulties, option as any]
                                                    : currentDifficulties.filter(d => d !== option);
                                                setPracticeSetData(prev => ({...prev, difficulty: newDifficulties }));
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
                                            checked={practiceSetData.questionSource.includes(option as any)}
                                            onCheckedChange={(checked) => {
                                                const currentSources = practiceSetData.questionSource;
                                                const newSources = checked
                                                    ? [...currentSources, option as any]
                                                    : currentSources.filter(s => s !== option);
                                                setPracticeSetData(prev => ({...prev, questionSource: newSources }));
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
                        <Button onClick={handleAddOrUpdatePracticeSet}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            <AlertDialog open={!!practiceSetToDelete} onOpenChange={() => setPracticeSetToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the practice set "{practiceSetToDelete?.title}" and all of its questions. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeletePracticeSet(practiceSetToDelete!)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
