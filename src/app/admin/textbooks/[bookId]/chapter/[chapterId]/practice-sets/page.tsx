
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Chapter, PracticeSet, Textbook } from '@/lib/types';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, PlusCircle, Edit, Trash2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
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
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { getTextbookById } from '@/lib/firebase/firestore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const difficultyOptions = ['Beginner', 'Easy', 'Medium', 'Hard', 'Expert'];
const questionSourceOptions = ['Random from Chapter', 'Random from Topic', 'Textbook Exercise', 'Solved Examples', 'Previous Year Questions'];

export default function ManageChapterPracticeSetsPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();

    const textbookId = params.bookId as string;
    const chapterId = params.chapterId as string;

    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [textbook, setTextbook] = useState<Textbook | null>(null);
    const [practiceSets, setPracticeSets] = useState<PracticeSet[]>([]);
    const [loading, setLoading] = useState(true);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPracticeSet, setEditingPracticeSet] = useState<PracticeSet | null>(null);
    const [practiceSetData, setPracticeSetData] = useState<{title: string, subtitle: string, difficulty: ('Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Expert')[], questionSource: ('Random from Chapter' | 'Random from Topic' | 'Textbook Exercise' | 'Solved Examples' | 'Previous Year Questions')[]}>({
        title: '',
        subtitle: '',
        difficulty: ['Medium'],
        questionSource: ['Random from Chapter']
    });
    const [practiceSetToDelete, setPracticeSetToDelete] = useState<PracticeSet | null>(null);

    useEffect(() => {
        if (!textbookId || !chapterId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const textbookData = await getTextbookById(textbookId);
                setTextbook(textbookData as Textbook);

                const chapterRef = doc(db, `textbooks/${textbookId}/chapters`, chapterId);
                const chapterSnap = await getDoc(chapterRef);

                if (chapterSnap.exists()) {
                    setChapter({ id: chapterSnap.id, ...chapterSnap.data() } as Chapter);
                } else {
                    toast({ variant: 'destructive', title: 'Chapter not found' });
                    router.back();
                    return;
                }

                const practiceSetsRef = collection(db, `textbooks/${textbookId}/chapters/${chapterId}/practiceSets`);
                const practiceSetsSnap = await getDocs(practiceSetsRef);
                const sets = practiceSetsSnap.docs.map(d => ({ id: d.id, ...d.data() } as PracticeSet));
                setPracticeSets(sets);

            } catch (error) {
                toast({ variant: 'destructive', title: 'Error fetching data', description: (error as Error).message });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [textbookId, chapterId, toast, router]);

    const handleOpenDialog = (ps: PracticeSet | null) => {
        setEditingPracticeSet(ps);
        
        let difficultyArray: ('Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Expert')[] = ['Medium'];
        if (ps?.difficulty) {
            difficultyArray = Array.isArray(ps.difficulty) ? ps.difficulty : [ps.difficulty] as any;
        }
        
        let sourceArray: ('Random from Chapter' | 'Random from Topic' | 'Textbook Exercise' | 'Solved Examples' | 'Previous Year Questions')[] = ['Random from Chapter'];
        if (ps?.questionSource) {
            sourceArray = Array.isArray(ps.questionSource) ? ps.questionSource : [ps.questionSource] as any;
        }
        
        const subtitle = ps ? ps.subtitle || `Practice Set ${practiceSets.findIndex(p => p.id === ps.id) + 1}` : `Practice Set ${practiceSets.length + 1}`;

        setPracticeSetData(ps ? { title: ps.title, subtitle: subtitle, difficulty: difficultyArray, questionSource: sourceArray } : { title: '', subtitle: subtitle, difficulty: ['Medium'], questionSource: ['Random from Chapter']});
        setIsDialogOpen(true);
    };

    const handleAddOrUpdate = async () => {
        if (!practiceSetData.title.trim() || practiceSetData.difficulty.length === 0) {
            toast({ variant: 'destructive', title: 'Please fill all required fields.' });
            return;
        }
        
        const practiceSetsRef = collection(db, `textbooks/${textbookId}/chapters/${chapterId}/practiceSets`);
        
        try {
            if (editingPracticeSet) {
                const psRef = doc(practiceSetsRef, editingPracticeSet.id);
                await updateDoc(psRef, practiceSetData);
                toast({ title: 'Practice Set Updated' });
            } else {
                await addDoc(practiceSetsRef, { ...practiceSetData, createdAt: new Date() });
                toast({ title: 'Practice Set Added' });
            }

            setPracticeSetData({ title: '', subtitle: '', difficulty: ['Medium'], questionSource: ['Random from Chapter'] });
            setIsDialogOpen(false);
            setEditingPracticeSet(null);
            
            const practiceSetsSnap = await getDocs(practiceSetsRef);
            const sets = practiceSetsSnap.docs.map(d => ({ id: d.id, ...d.data() } as PracticeSet));
            setPracticeSets(sets);

        } catch (error) {
            toast({ variant: 'destructive', title: 'Error saving practice set', description: (error as Error).message });
        }
    };
    
    const handleDeletePracticeSet = async () => {
        if (!practiceSetToDelete) return;

        try {
            const psRef = doc(db, `textbooks/${textbookId}/chapters/${chapterId}/practiceSets`, practiceSetToDelete.id);
            await deleteDoc(psRef);
            toast({ title: 'Practice Set Deleted' });
            
            setPracticeSets(prev => prev.filter(ps => ps.id !== practiceSetToDelete.id));
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error deleting practice set', description: (error as Error).message });
        } finally {
            setPracticeSetToDelete(null);
        }
    };
    
    const generateTitle = (template: string) => {
        const title = template
            .replace('[Chapter Title]', chapter?.title || '')
            .replace('[Subject]', textbook?.subject || '')
            .replace('[Textbook Title]', textbook?.title || '');
        setPracticeSetData(prev => ({ ...prev, title }));
    };

    if (loading) {
        return <div>Loading...</div>;
    }
    
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
                <h1 className="font-headline text-3xl font-bold">Chapter Practice Sets</h1>
                <p className="text-muted-foreground mt-1">Manage practice sets for: <span className="font-semibold text-foreground">{chapter?.title}</span></p>
            </header>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Practice Sets ({practiceSets.length})</CardTitle>
                        <CardDescription>Practice tests associated with this chapter.</CardDescription>
                    </div>
                    <Button size="sm" onClick={() => handleOpenDialog(null)}><PlusCircle className="mr-2"/> Add Practice Set</Button>
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
                                        <span className="font-semibold">{ps.subtitle || 'Practice Set'}:</span>
                                        <span className="font-medium">{ps.title}</span>
                                        {difficulties.map(d => <Badge key={d} variant="secondary">{d}</Badge>)}
                                        {sources.map(s => <Badge key={s} variant="outline">{s.replace('-', ' ')}</Badge>)}
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/admin/textbooks/${textbookId}/chapter/${chapterId}/topic/null/practice-set/${ps.id}`}>
                                                Manage Questions
                                            </Link>
                                        </Button>
                                         <Button variant="outline" size="sm" onClick={() => handleOpenDialog(ps)}>
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
                        <p className="text-muted-foreground text-center py-8">No practice sets created for this chapter yet.</p>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingPracticeSet ? 'Edit Practice Set' : 'Add New Practice Set'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                         <div className="space-y-2">
                            <Label htmlFor="practice-set-subtitle">Subtitle</Label>
                            <Input id="practice-set-subtitle" value={practiceSetData.subtitle} onChange={(e) => setPracticeSetData(prev => ({...prev, subtitle: e.target.value}))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="practice-set-title">Title</Label>
                            <div className="flex gap-2">
                                <Input id="practice-set-title" value={practiceSetData.title} onChange={(e) => setPracticeSetData(prev => ({...prev, title: e.target.value}))} />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="icon"><Sparkles className="h-4 w-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onSelect={() => generateTitle('[Chapter Title] - Practice Set')}>[Chapter Title] - Practice Set</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => generateTitle('[Chapter Title] - MCQ Practice')}>[Chapter Title] - MCQ Questions</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => generateTitle('[Subject] Practice: [Chapter Title]')}>[Subject] Practice: [Chapter Title]</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => generateTitle('[Textbook Title]: [Chapter Title] Practice')}>[Textbook Title]: [Chapter Title] Practice</DropdownMenuItem>
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
                        <Button onClick={handleAddOrUpdate}>Save</Button>
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
                        <AlertDialogAction onClick={handleDeletePracticeSet} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
