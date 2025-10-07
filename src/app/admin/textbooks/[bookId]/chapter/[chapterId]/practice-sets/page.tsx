
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, getDocs, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Chapter, PracticeSet } from '@/lib/types';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, PlusCircle, Edit } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';

export default function ManageChapterPracticeSetsPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();

    const textbookId = params.bookId as string;
    const chapterId = params.chapterId as string;

    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [practiceSets, setPracticeSets] = useState<PracticeSet[]>([]);
    const [loading, setLoading] = useState(true);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPracticeSet, setEditingPracticeSet] = useState<PracticeSet | null>(null);
    const [practiceSetTitle, setPracticeSetTitle] = useState('');

    useEffect(() => {
        if (!textbookId || !chapterId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
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
        setPracticeSetTitle(ps ? ps.title : '');
        setIsDialogOpen(true);
    };

    const handleAddOrUpdate = async () => {
        if (!practiceSetTitle.trim()) return;
        
        const practiceSetsRef = collection(db, `textbooks/${textbookId}/chapters/${chapterId}/practiceSets`);
        
        try {
            if (editingPracticeSet) {
                const psRef = doc(practiceSetsRef, editingPracticeSet.id);
                await updateDoc(psRef, { title: practiceSetTitle });
                toast({ title: 'Practice Set Updated' });
            } else {
                await addDoc(practiceSetsRef, { title: practiceSetTitle, createdAt: new Date() });
                toast({ title: 'Practice Set Added' });
            }

            setPracticeSetTitle('');
            setIsDialogOpen(false);
            setEditingPracticeSet(null);
            
            // Refetch
            const practiceSetsSnap = await getDocs(practiceSetsRef);
            const sets = practiceSetsSnap.docs.map(d => ({ id: d.id, ...d.data() } as PracticeSet));
            setPracticeSets(sets);

        } catch (error) {
            toast({ variant: 'destructive', title: 'Error saving practice set', description: (error as Error).message });
        }
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
                            {practiceSets.map(ps => (
                                <li key={ps.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-md gap-2">
                                    <span className="font-medium flex-grow">{ps.title}</span>
                                    <div className="flex gap-2 flex-shrink-0">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/admin/textbooks/${textbookId}/chapter/${chapterId}/practice-set/${ps.id}`}>
                                                Manage Questions
                                            </Link>
                                        </Button>
                                         <Button variant="outline" size="sm" onClick={() => handleOpenDialog(ps)}>
                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                        </Button>
                                    </div>
                                </li>
                            ))}
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
                    <div className="space-y-2 py-4">
                        <Label htmlFor="practice-set-title">Title</Label>
                        <Input id="practice-set-title" value={practiceSetTitle} onChange={(e) => setPracticeSetTitle(e.target.value)} />
                    </div>
                    <DialogFooter>
                         <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                        <Button onClick={handleAddOrUpdate}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
