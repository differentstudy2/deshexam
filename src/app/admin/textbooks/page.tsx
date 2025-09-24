
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { db } from '@/lib/firebase/client';
import { deleteTextbook } from '@/lib/firebase/firestore';
import type { Textbook } from '@/lib/types';
import { collection, getDocs } from 'firebase/firestore';
import { Book, Edit, Trash2 } from 'lucide-react';
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

export default function ManageTextbooksPage() {
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [textbookToDelete, setTextbookToDelete] = useState<Textbook | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTextbooks = async () => {
      setLoading(true);
      const textbooksCollectionRef = collection(db, 'textbooks');
      const querySnapshot = await getDocs(textbooksCollectionRef);
      const textbooksData = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Textbook)
      );
      setTextbooks(textbooksData);
      setLoading(false);
    };

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
      setTextbooks(textbooks.filter(book => book.id !== textbookToDelete.id));
      toast({
        title: "Textbook Deleted",
        description: `"${textbookToDelete.title}" and all its content have been removed.`,
      });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">Manage Textbooks</h1>
          <p className="text-muted-foreground">
            A list of all textbooks available on the platform.
          </p>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {textbooks.map((book) => (
          <Card key={book.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Book /> {book.title}</CardTitle>
              <CardDescription>{book.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <Button asChild className="w-full">
                    <Link href={`/admin/textbooks/${book.id}`}>Manage Chapters</Link>
                </Button>
            </CardContent>
            <CardFooter className="flex gap-2">
                <Button variant="outline" className="w-full" disabled>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
                 <Button variant="destructive" className="w-full" onClick={() => handleDeleteClick(book)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
            </CardFooter>
          </Card>
        ))}
         {textbooks.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-10">
                <p>No textbooks found. Add one from the main content editor.</p>
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
