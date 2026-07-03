
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { db } from '@/lib/firebase/client';
import { deleteTextbook } from '@/lib/firebase/firestore';
import type { Textbook } from '@/lib/types';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Book, Edit, Trash2, PlusCircle, Layers, FileText, CheckSquare, Eye } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


const TextbookStats = ({ textbookId }: { textbookId: string }) => {
    const [stats, setStats] = useState({ chapterCount: 0, topicCount: 0, practiceSetCount: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            let chapterCount = 0;
            let topicCount = 0;
            let practiceSetCount = 0;
            
            const chaptersRef = collection(db, 'textbooks', textbookId, 'chapters');
            const chaptersSnapshot = await getDocs(chaptersRef);
            chapterCount = chaptersSnapshot.size;

            for (const chapterDoc of chaptersSnapshot.docs) {
                const topicsRef = collection(chapterDoc.ref, "topics");
                const topicsSnapshot = await getDocs(topicsRef);
                topicCount += topicsSnapshot.size;

                 for (const topicDoc of topicsSnapshot.docs) {
                    const practiceSetsRef = collection(topicDoc.ref, "practiceSets");
                    const practiceSetsSnapshot = await getDocs(practiceSetsRef);
                    practiceSetCount += practiceSetsSnapshot.size;
                }
            }
            setStats({ chapterCount, topicCount, practiceSetCount });
            setLoading(false);
        };
        fetchStats();
    }, [textbookId]);

    if (loading) {
        return (
            <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
                <div className="flex flex-col items-center gap-1">
                    <Layers className="h-4 w-4" />
                    <span>... Chapters</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>... Topics</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <CheckSquare className="h-4 w-4" />
                    <span>... Sets</span>
                </div>
            </div>
        )
    }

    return (
        <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
            <div className="flex flex-col items-center gap-1">
                <Layers className="h-4 w-4" />
                <span>{stats.chapterCount} Chapters</span>
            </div>
            <div className="flex flex-col items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>{stats.topicCount} Topics</span>
            </div>
            <div className="flex flex-col items-center gap-1">
                <CheckSquare className="h-4 w-4" />
                <span>{stats.practiceSetCount} Sets</span>
            </div>
        </div>
    );
};


export default function ManageTextbooksPage() {
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [textbookToDelete, setTextbookToDelete] = useState<Textbook | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const fetchTextbooks = async () => {
      setLoading(true);
      const textbooksCollectionRef = query(collection(db, 'textbooks'), orderBy("title"));
      const querySnapshot = await getDocs(textbooksCollectionRef);
      const textbooksData = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Textbook)
      );
      setTextbooks(textbooksData);
      setLoading(false);
    };

  useEffect(() => {
    fetchTextbooks();
  }, []);

  const handleDeleteClick = (book: Textbook) => {
    setTextbookToDelete(book);
  };

  const handleConfirmDelete = async () => {
    if (!textbookToDelete) return;
    setIsDeleting(true);
    try {
      await deleteTextbook(textbookToDelete.id);
      toast({
        title: "Textbook Deleted",
        description: `"${textbookToDelete.title}" and all its content have been removed.`,
      });
      fetchTextbooks(); // Refetch the list
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error Deleting Textbook",
        description: (error as Error).message,
      });
    } finally {
      setIsDeleting(false);
      setTextbookToDelete(null);
    }
  };


  if (loading) {
    return <div>Loading textbooks...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold">Manage Textbooks</h1>
          <p className="text-muted-foreground">
            A list of all textbooks available on the platform.
          </p>
        </div>
        <Button asChild className="w-full md:w-auto">
            <Link href="/admin/textbooks/add">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Textbook
            </Link>
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {textbooks.map((book) => (
          <Card key={book.id} className="flex flex-col">
            <CardHeader className="p-0 relative h-48 flex-shrink-0">
               <Image 
                src={book.featureImage || `https://picsum.photos/seed/${book.id}/400/300`}
                alt={book.title}
                fill
                className="object-cover rounded-t-lg"
               />
            </CardHeader>
            <CardContent className="p-4 flex-grow flex flex-col overflow-y-auto">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <h3 className="font-bold text-lg flex items-center gap-2 flex-grow h-14 overflow-hidden line-clamp-2">
                                <Book /> <span>{book.title}</span>
                            </h3>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{book.title}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
              {book.board && <Badge variant="outline">{book.board}</Badge>}
              <TextbookStats textbookId={book.id} />
            </CardContent>
            <CardFooter className="flex flex-col gap-2 p-4 border-t">
                <div className="flex gap-2 w-full">
                    <Button asChild className="w-full" variant="secondary">
                        <Link href={`/textbook-solutions/${book.id}`} target="_blank">
                            <Eye className="mr-2 h-4 w-4" /> View
                        </Link>
                    </Button>
                    <Button asChild className="w-full" variant="outline">
                        <Link href={`/admin/textbooks/${book.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                        </Link>
                    </Button>
                </div>
                 <Button asChild className="w-full">
                    <Link href={`/admin/textbooks/${book.id}`}>Manage Chapters</Link>
                </Button>
                <Button variant="destructive" className="w-full" onClick={() => handleDeleteClick(book)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
            </CardFooter>
          </Card>
        ))}
         {textbooks.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-10">
                <p>No textbooks found. Add one to get started.</p>
            </div>
        )}
      </div>

       <AlertDialog open={!!textbookToDelete} onOpenChange={(open) => !open && setTextbookToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the textbook "{textbookToDelete?.title}" and all of its chapters, topics, and questions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
