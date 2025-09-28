
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/firebase/client';
import type { Textbook, Chapter } from '@/lib/types';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  deleteDoc,
  orderBy
} from 'firebase/firestore';
import { ArrowLeft, PlusCircle, Edit, Lock, Trash2, Library } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContentBadge } from '@/components/content-badge';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export default function ManageChaptersPage() {
  const params = useParams();
  const textbookId = params.bookId as string;

  const [textbook, setTextbook] = useState<Textbook | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [newChapter, setNewChapter] = useState({ title: '', content: '', access: 'free' as 'free' | 'pass' | 'pro' });
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [chapterToDelete, setChapterToDelete] = useState<Chapter | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);
  const [bulkChaptersText, setBulkChaptersText] = useState('');
  const [isBulkAdding, setIsBulkAdding] = useState(false);
  const { toast } = useToast();

  const fetchTextbookAndChapters = async () => {
    if (!textbookId) return;
    setLoading(true);
    // Fetch textbook details
    const textbookDocRef = doc(db, 'textbooks', textbookId);
    const textbookDocSnap = await getDoc(textbookDocRef);
    if (textbookDocSnap.exists()) {
      setTextbook({ id: textbookDocSnap.id, ...textbookDocSnap.data() } as Textbook);
    } else {
      console.error('No such textbook!');
    }

    // Fetch chapters
    const chaptersQuery = query(collection(db, 'textbooks', textbookId, 'chapters'));
    const querySnapshot = await getDocs(chaptersQuery);
    const chaptersData = querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Chapter)
    );
    
    chaptersData.sort((a, b) => {
      const numA = parseInt(a.title.match(/^\d+/)?.[0] || '0', 10);
      const numB = parseInt(b.title.match(/^\d+/)?.[0] || '0', 10);
      if (numA !== numB) {
        return numA - numB;
      }
      return a.title.localeCompare(b.title, undefined, { numeric: true });
    });

    setChapters(chaptersData);
    setLoading(false);
  };
  
  useEffect(() => {
    fetchTextbookAndChapters();
  }, [textbookId]);

  const handleAddOrUpdateChapter = async () => {
    if (!newChapter.title.trim()) return;
    try {
        const chaptersCollectionRef = collection(db, 'textbooks', textbookId, 'chapters');
        
        if (editingChapter) {
            // Update logic
            const chapterDocRef = doc(chaptersCollectionRef, editingChapter.id);
            await updateDoc(chapterDocRef, newChapter);
            setEditingChapter(null);
        } else {
            // Add logic
            await addDoc(chaptersCollectionRef, newChapter);
        }
        setNewChapter({ title: '', content: '', access: 'free' });
        fetchTextbookAndChapters(); // Refetch to get the updated/new chapter

    } catch (error) {
      console.error('Error saving chapter: ', error);
    }
  };

  const handleBulkAddChapters = async () => {
    if (!bulkChaptersText.trim()) return;
    setIsBulkAdding(true);
    try {
        const chapterTitles = bulkChaptersText.split('\n').map(t => t.trim()).filter(Boolean);
        const chaptersCollectionRef = collection(db, 'textbooks', textbookId, 'chapters');

        for (const title of chapterTitles) {
            await addDoc(chaptersCollectionRef, {
                title: title,
                content: '',
                access: 'free'
            });
        }
        
        toast({
            title: 'Chapters Added',
            description: `${chapterTitles.length} chapters have been added successfully.`,
        });
        
        setBulkChaptersText('');
        setIsBulkAddOpen(false);
        fetchTextbookAndChapters(); // Refresh the list
    } catch (error) {
         toast({
            variant: "destructive",
            title: "Error adding chapters",
            description: (error as Error).message,
        });
    } finally {
        setIsBulkAdding(false);
    }
  };

  const handleEditClick = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setNewChapter({ title: chapter.title, content: chapter.content || '', access: chapter.access || 'free' });
  };
  
  const handleCancelEdit = () => {
    setEditingChapter(null);
    setNewChapter({ title: '', content: '', access: 'free' });
  }
  
  const handleDeleteClick = (chapter: Chapter) => {
    setChapterToDelete(chapter);
  };

  const handleConfirmDelete = async () => {
    if (!chapterToDelete) return;
    setIsDeleting(true);
    try {
      const chapterRef = doc(db, 'textbooks', textbookId, 'chapters', chapterToDelete.id);
      await deleteDoc(chapterRef);
      toast({
        title: "Chapter Deleted",
        description: `"${chapterToDelete.title}" has been removed.`,
      });
      fetchTextbookAndChapters(); // Refresh the list
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error Deleting Chapter",
        description: (error as Error).message,
      });
    } finally {
      setIsDeleting(false);
      setChapterToDelete(null);
    }
  };


  if (loading) {
    return <div>Loading...</div>;
  }

  if (!textbook) {
    return <div>Textbook not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" asChild>
          <Link href="/admin/textbooks">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Textbooks
          </Link>
        </Button>
      </div>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div>
          <h1 className="font-headline text-3xl font-bold">
            Manage Chapters for <span className="text-primary">{textbook.title}</span>
          </h1>
          <p className="text-muted-foreground">
            Add, edit, and manage chapters for this textbook.
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isBulkAddOpen} onOpenChange={setIsBulkAddOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary"><Library className="mr-2 h-4 w-4" /> Bulk Add</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Add Chapters</DialogTitle>
                <DialogDescription>
                  Paste a list of chapter titles below, one per line. Each line will be created as a new chapter.
                </DialogDescription>
              </DialogHeader>
              <Textarea
                placeholder="Chapter 1: Introduction&#10;Chapter 2: The Basics&#10;Chapter 3: Advanced Topics"
                className="min-h-[200px]"
                value={bulkChaptersText}
                onChange={(e) => setBulkChaptersText(e.target.value)}
                disabled={isBulkAdding}
              />
              <DialogFooter>
                <Button onClick={handleBulkAddChapters} disabled={isBulkAdding || !bulkChaptersText.trim()}>
                  {isBulkAdding ? 'Adding...' : 'Add Chapters'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" asChild>
            <Link href={`/admin/textbooks/${textbookId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Textbook Details
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{editingChapter ? 'Edit Chapter' : 'Add New Chapter'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="chapter-title">Chapter Title</Label>
                <Input
                id="chapter-title"
                placeholder="e.g., Chapter 1: Electric Charges"
                value={newChapter.title}
                onChange={(e) => setNewChapter({...newChapter, title: e.target.value})}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="chapter-content">Chapter Content</Label>
                <Textarea
                id="chapter-content"
                placeholder="Add a summary or introduction for the chapter."
                value={newChapter.content || ''}
                onChange={(e) => setNewChapter({...newChapter, content: e.target.value})}
                />
            </div>
             <div className="space-y-2">
                <Label htmlFor="chapter-access">Access Level</Label>
                 <Select value={newChapter.access} onValueChange={(value) => setNewChapter({...newChapter, access: value as 'free' | 'pass' | 'pro' })}>
                    <SelectTrigger id="chapter-access">
                        <SelectValue placeholder="Select access level" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="pass">Pass</SelectItem>
                        <SelectItem value="pro">Pass Pro</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="flex gap-2">
              <Button onClick={handleAddOrUpdateChapter}>
                {editingChapter ? 'Update Chapter' : <><PlusCircle className="mr-2 h-4 w-4" /> Add Chapter</>}
              </Button>
              {editingChapter && (
                <Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Existing Chapters</CardTitle>
                <CardDescription>
                  A list of all chapters in this textbook.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {chapters.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {chapters.map((chapter) => (
                            <Card key={chapter.id} className="flex flex-col">
                                <CardHeader className="flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-base font-medium leading-tight">{chapter.title}</CardTitle>
                                    <ContentBadge type={chapter.access || 'free'} />
                                </CardHeader>
                                <CardFooter className="flex-col items-stretch gap-2 pt-4 border-t">
                                    <Button variant="secondary" size="sm" asChild>
                                        <Link href={`/admin/textbooks/${textbookId}/chapter/${chapter.id}`}>Manage Topics</Link>
                                    </Button>
                                    <div className="flex gap-2">
                                         <Button variant="outline" size="sm" onClick={() => handleEditClick(chapter)} className="w-full">
                                            <Edit className="h-3 w-3 mr-1"/> Edit
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(chapter)} className="w-full">
                                            <Trash2 className="h-3 w-3 mr-1"/> Delete
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    No chapters added yet.
                  </div>
                )}
              </CardContent>
            </Card>
        </div>
      </div>
      
       <AlertDialog open={!!chapterToDelete} onOpenChange={(open) => !open && setChapterToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the chapter "{chapterToDelete?.title}". This action cannot be undone.
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
