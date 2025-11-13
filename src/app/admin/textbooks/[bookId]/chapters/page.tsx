
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { db } from '@/lib/firebase/client';
import type { Textbook, Chapter, Topic } from '@/lib/types';
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
import { ArrowLeft, PlusCircle, Edit, Trash2, Library, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { uploadFile } from '@/lib/firebase/firestore';
import { ImageUploader } from "@/components/feature/image-uploader";

export default function ManageChaptersPage() {
  const params = useParams();
  const textbookId = params.bookId as string;

  const [textbook, setTextbook] = useState<Textbook | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [newChapter, setNewChapter] = useState<{ title: string, content: string, featureImage?: string, chapterPdfUrl?: string, access: 'free' | 'pass' | 'pro' }>({ title: '', content: '', featureImage: '', chapterPdfUrl: '', access: 'free' });
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [chapterToDelete, setChapterToDelete] = useState<Chapter | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);
  const [bulkChaptersText, setBulkChaptersText] = useState('');
  const [isBulkAdding, setIsBulkAdding] = useState(false);
  const { toast } = useToast();

  const fetchChapters = useCallback(async () => {
    if (!textbookId) return;
    setLoading(true);
    
    try {
        const textbookDocRef = doc(db, 'textbooks', textbookId);
        const textbookDocSnap = await getDoc(textbookDocRef);
        if(textbookDocSnap.exists()) setTextbook({ id: textbookDocSnap.id, ...textbookDocSnap.data() } as Textbook);

        const chaptersRef = collection(db, "textbooks", textbookId, "chapters");
        const q = query(chaptersRef);
        const querySnapshot = await getDocs(q);
        const chaptersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as { title: string } } as Chapter));
        
        // Sort chapters numerically if they start with numbers
        chaptersData.sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }));

        setChapters(chaptersData);
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error fetching chapters",
            description: (error as Error).message,
        })
    } finally {
        setLoading(false);
    }
  }, [textbookId, toast]);
  
  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  const handleAddOrUpdateChapter = async () => {
    if (!newChapter.title.trim()) return;
    try {
        if (editingChapter) {
            const chapterRef = doc(db, "textbooks", textbookId, "chapters", editingChapter.id);
            await updateDoc(chapterRef, newChapter);
            setEditingChapter(null);
            toast({ title: "Chapter updated successfully." });
        } else {
            const chaptersRef = collection(db, "textbooks", textbookId, "chapters");
            await addDoc(chaptersRef, newChapter);
            toast({ title: "Chapter added successfully." });
        }
        setNewChapter({ title: '', content: '', featureImage: '', chapterPdfUrl: '', access: 'free' });
        fetchChapters(); 

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error saving chapter",
        description: (error as Error).message,
      });
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
        fetchChapters();
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
    setNewChapter({ title: chapter.title, content: chapter.content || '', featureImage: chapter.featureImage || '', chapterPdfUrl: chapter.chapterPdfUrl || '', access: chapter.access || 'free' });
  };
  
  const handleCancelEdit = () => {
    setEditingChapter(null);
    setNewChapter({ title: '', content: '', featureImage: '', chapterPdfUrl: '', access: 'free' });
  }
  
  const handleDeleteClick = (chapter: Chapter) => {
    setChapterToDelete(chapter);
  };

  const handleConfirmDelete = async () => {
    if (!chapterToDelete) return;
    setIsDeleting(true);
    try {
      const chapterRef = doc(db, "textbooks", textbookId, "chapters", chapterToDelete.id);
      await deleteDoc(chapterRef);
      toast({
        title: "Chapter Deleted",
        description: `"${chapterToDelete.title}" has been removed.`,
      });
      fetchChapters();
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

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" asChild>
          <Link href={`/admin/textbooks/${textbookId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Textbook
          </Link>
        </Button>
      </div>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div>
          <h1 className="font-headline text-3xl font-bold">
            Manage Chapters & Topics
          </h1>
          <p className="text-muted-foreground">
            For textbook: <span className="font-semibold text-foreground">{textbook?.title}</span>
          </p>
        </div>
        <div>
            <Button onClick={() => setIsBulkAddOpen(true)}>
                 <PlusCircle className="mr-2" /> Bulk Add Chapters
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
            <Card>
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
                    <Label>Feature Image</Label>
                    <ImageUploader fieldName="featureImage" onUrlChange={(url) => setNewChapter(prev => ({ ...prev, featureImage: url }))} value={newChapter.featureImage} />
                </div>
                 <div className="space-y-2">
                    <Label>Chapter PDF</Label>
                    <div className="flex items-center gap-2">
                         <Input 
                            placeholder="PDF URL or upload a file" 
                            value={newChapter.chapterPdfUrl} 
                            onChange={(e) => setNewChapter(prev => ({...prev, chapterPdfUrl: e.target.value}))}
                        />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="chapter-content">Chapter Content</Label>
                    <Textarea
                    id="chapter-content"
                    placeholder="Add the main educational content for the chapter itself. You can use Markdown."
                    value={newChapter.content}
                    onChange={(e) => setNewChapter({...newChapter, content: e.target.value})}
                    className="min-h-[150px]"
                    />
                </div>
                 <div className="space-y-2">
                    <Label>Access</Label>
                    <Select value={newChapter.access} onValueChange={(value) => setNewChapter(prev => ({...prev, access: value as 'free'|'pass'|'pro'}))}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="free">Free</SelectItem>
                            <SelectItem value="pass">Pass Required</SelectItem>
                            <SelectItem value="pro">Pro Required</SelectItem>
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
        </div>
        <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Existing Chapters</CardTitle>
                <CardDescription>
                  A list of all chapters in this textbook. Click a chapter to manage its topics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {chapters.length > 0 ? (
                  <div className="space-y-2">
                    {chapters.map((chapter) => (
                      <div key={chapter.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-accent/50">
                        <Link href={`/admin/textbooks/${textbookId}/chapter/${chapter.id}/topics`} className="font-medium flex-grow">
                            {chapter.title}
                        </Link>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditClick(chapter)}><Edit className="h-4 w-4"/></Button>
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteClick(chapter)}><Trash2 className="h-4 w-4"/></Button>
                        </div>
                      </div>
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
              This will permanently delete the chapter "{chapterToDelete?.title}" and all its topics. This action cannot be undone.
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
      
      <AlertDialog open={isBulkAddOpen} onOpenChange={setIsBulkAddOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Bulk Add Chapters</AlertDialogTitle>
                <AlertDialogDescription>Enter each chapter title on a new line. They will be added with default settings.</AlertDialogDescription>
            </AlertDialogHeader>
            <Textarea 
                placeholder="Chapter 1: Units and Measurements&#10;Chapter 2: Motion in a Straight Line"
                className="min-h-[200px]"
                value={bulkChaptersText}
                onChange={(e) => setBulkChaptersText(e.target.value)}
            />
            <AlertDialogFooter>
                <AlertDialogCancel disabled={isBulkAdding}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleBulkAddChapters} disabled={isBulkAdding}>
                    {isBulkAdding ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</> : `Add ${bulkChaptersText.split('\n').filter(Boolean).length} Chapters`}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
