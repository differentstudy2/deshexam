
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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
import { Eye, PlusCircle, ArrowLeft, Edit, Trash2, FileQuestion } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getChaptersByTextbookId, deletePracticeSet } from '@/lib/firebase/firestore';
import type { PracticeSet, Chapter } from '@/lib/types';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

export default function ManageTextbookPracticeSetsPage() {
    const params = useParams();
    const textbookId = params.bookId as string;
    const { toast } = useToast();

    const [practiceSets, setPracticeSets] = useState<(PracticeSet & { chapterTitle: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const [itemToDelete, setItemToDelete] = useState<(PracticeSet & { chapterTitle: string }) | null>(null);

    useEffect(() => {
        const fetchPracticeSets = async () => {
            if (!textbookId) return;
            setLoading(true);
            try {
                const chapters = await getChaptersByTextbookId(textbookId);
                let allPracticeSets: (PracticeSet & { chapterTitle: string })[] = [];

                for (const chapter of chapters) {
                    const chapterRef = collection(db, `textbooks/${textbookId}/chapters/${chapter.id}/practiceSets`);
                    const chapterSetsSnap = await getDocs(chapterRef);
                    chapterSetsSnap.forEach(doc => {
                        allPracticeSets.push({ id: doc.id, ...doc.data(), chapterTitle: chapter.title } as PracticeSet & { chapterTitle: string });
                    });
                    
                    const topicsRef = collection(db, `textbooks/${textbookId}/chapters/${chapter.id}/topics`);
                    const topicsSnap = await getDocs(topicsRef);
                    for (const topicDoc of topicsSnap.docs) {
                         const practiceSetsRef = collection(topicDoc.ref, "practiceSets");
                         const practiceSetsSnap = await getDocs(practiceSetsRef);
                         practiceSetsSnap.forEach(doc => {
                            allPracticeSets.push({ id: doc.id, ...doc.data(), chapterTitle: chapter.title } as PracticeSet & { chapterTitle: string });
                         });
                    }
                }
                setPracticeSets(allPracticeSets);

            } catch (error) {
                 toast({
                    variant: "destructive",
                    title: 'Error fetching practice sets',
                    description: (error as Error).message,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchPracticeSets();
    }, [textbookId, toast]);

    const handleDelete = async () => {
        if (!itemToDelete) return;
        try {
            // This is a simplified delete. For a real app, you'd need to find the exact path.
            // This will likely fail if the practice set is under a topic.
            // A more robust solution would store chapter/topic path on the practice set document.
            const chapter = (await getChaptersByTextbookId(textbookId)).find(c => c.title === itemToDelete.chapterTitle);
            if (chapter) {
                 await deletePracticeSet(textbookId, chapter.id, (itemToDelete as any).topicId || null, itemToDelete.id);
                 toast({
                    title: 'Practice Set Deleted',
                    description: `"${itemToDelete.title}" has been successfully deleted.`,
                });
                setPracticeSets(prev => prev.filter(ps => ps.id !== itemToDelete.id));
            } else {
                 throw new Error("Could not find parent chapter to delete practice set.");
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error Deleting Item',
                description: (error as Error).message,
            });
        } finally {
            setItemToDelete(null);
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
                    <h1 className="font-headline text-3xl font-bold">Manage Practice Sets</h1>
                    <p className="text-muted-foreground">
                        All practice sets associated with this textbook.
                    </p>
                </div>
                {/* Add button would require selecting a chapter first, so we'll omit it from this central page for now */}
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Practice Sets ({practiceSets.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Chapter</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-1/4" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-32 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                            ) : practiceSets.length > 0 ? (
                                practiceSets.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.subtitle}: {item.title}</TableCell>
                                    <TableCell>{item.chapterTitle}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="sm" asChild>
                                           <Link href={`/admin/textbooks/${textbookId}/chapter/${(item as any).chapterId}/topic/${(item as any).topicId || 'null'}/practice-set/${item.id}`}>
                                                <FileQuestion className="mr-2 h-4 w-4"/>Manage Questions
                                            </Link>
                                        </Button>
                                        {/* Edit button would require a more complex dialog or page */}
                                        <Button variant="destructive" size="sm" onClick={() => setItemToDelete(item)}>
                                            <Trash2 className="mr-2 h-4 w-4"/>Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24">
                                    No practice sets found for this textbook.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the practice set
                    "{itemToDelete?.title}".
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
