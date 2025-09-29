
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Topic, PracticeSet } from '@/lib/types';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, PlusCircle, BookOpen, Edit } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
    addPracticeSetToTopic, 
    getPracticeSetsByTopicId, 
} from '@/lib/firebase/firestore';

export default function ManageTopicPage() {
    const params = useParams();
    const { toast } = useToast();

    const textbookId = params.bookId as string;
    const chapterId = params.chapterId as string;
    const topicId = params.topicId as string;
    
    const [topic, setTopic] = useState<Topic | null>(null);
    const [practiceSets, setPracticeSets] = useState<PracticeSet[]>([]);
    const [loading, setLoading] = useState(true);

    const [isPracticeSetDialogOpen, setIsPracticeSetDialogOpen] = useState(false);
    const [editingPracticeSet, setEditingPracticeSet] = useState<PracticeSet | null>(null);
    const [practiceSetTitle, setPracticeSetTitle] = useState('');

    const fetchData = async () => {
        if (!textbookId || !chapterId || !topicId) return;
        setLoading(true);

        const topicRef = doc(db, `textbooks/${textbookId}/chapters/${chapterId}/topics`, topicId);
        const topicSnap = await getDoc(topicRef);
        if (topicSnap.exists()) {
            setTopic({ id: topicSnap.id, ...topicSnap.data() } as Topic);
        }

        const fetchedPracticeSets = await getPracticeSetsByTopicId(textbookId, chapterId, topicId);
        setPracticeSets(fetchedPracticeSets as PracticeSet[]);

        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [textbookId, chapterId, topicId]);

    const handleOpenDialog = (ps: PracticeSet | null) => {
        setEditingPracticeSet(ps);
        setPracticeSetTitle(ps ? ps.title : '');
        setIsPracticeSetDialogOpen(true);
    }

    const handleAddOrUpdatePracticeSet = async () => {
        if (!practiceSetTitle.trim()) return;
        try {
            if (editingPracticeSet) {
                // Update existing practice set
                const psRef = doc(db, `textbooks/${textbookId}/chapters/${chapterId}/topics/${topicId}/practiceSets`, editingPracticeSet.id);
                await updateDoc(psRef, { title: practiceSetTitle });
                toast({ title: 'Practice Set Updated' });
            } else {
                // Add new practice set
                await addPracticeSetToTopic(textbookId, chapterId, topicId, { title: practiceSetTitle });
                toast({ title: 'Practice Set Added' });
            }

            setPracticeSetTitle('');
            setIsPracticeSetDialogOpen(false);
            setEditingPracticeSet(null);
            fetchData();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: (error as Error).message });
        }
    }
    
    if (loading) return <div className="flex items-center justify-center h-full">Loading...</div>

    return (
        <div className="space-y-6">
            <div>
                <Button variant="ghost" asChild>
                    <Link href={`/admin/textbooks/${textbookId}/chapter/${chapterId}`}>
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
                        <CardDescription>Manage the practice sets associated with this topic.</CardDescription>
                    </div>
                     <Button size="sm" onClick={() => handleOpenDialog(null)}><PlusCircle className="mr-2"/> Add Practice Set</Button>
                </CardHeader>
                <CardContent>
                    {practiceSets.length > 0 ? (
                         <ul className="space-y-2">
                            {practiceSets.map(ps => (
                                <li key={ps.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-md gap-2">
                                    <span className="font-medium flex-grow">{ps.title}</span>
                                    <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/admin/textbooks/${textbookId}/chapter/${chapterId}/topic/${topicId}/practice-set/${ps.id}`}>
                                                Manage Questions
                                            </Link>
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => handleOpenDialog(ps)}>
                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                        </Button>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/textbook-solutions/practice-set/${ps.id}?textbook=${textbookId}&chapter=${chapterId}&topic=${topicId}`} target="_blank">
                                                <BookOpen className="mr-2 h-4 w-4"/> Preview
                                            </Link>
                                        </Button>
                                    </div>
                                </li>
                            ))}
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
                    <div className="space-y-2">
                        <Label htmlFor="practice-set-title">Title</Label>
                        <Input id="practice-set-title" value={practiceSetTitle} onChange={(e) => setPracticeSetTitle(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAddOrUpdatePracticeSet}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
