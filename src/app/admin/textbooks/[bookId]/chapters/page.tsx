
'use client';

import { Button } from "@/components/ui/button";
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
import type { Textbook, Chapter, Resource } from '@/lib/types';
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
import { ArrowLeft, PlusCircle, Edit, Trash2, Library, Video, File as FileIcon, Mic, Upload, Loader2, Link as LinkIcon, Sparkles, BrainCircuit, ImageIcon, ChevronRight, List, LayoutGrid, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { uploadFile } from '@/lib/firebase/firestore';
import { ImageUploader } from "@/components/feature/image-uploader";
import { DeshExamLogo } from "@/components/icons";
import { cn } from "@/lib/utils";


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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [view, setView] = useState<'list' | 'grid'>('list');

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
        setIsDialogOpen(false);
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
            description: `${'chapterTitles.length'} chapters have been added successfully.`,
        });
        
        setBulkChaptersText('');
        setIsBulkAddOpen(false);
        fetchChapters(); // Refresh the list
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
    setIsDialogOpen(true);
  };
  
  const handleAddNewClick = () => {
    setEditingChapter(null);
    setNewChapter({ title: '', content: '', featureImage: '', chapterPdfUrl: '', access: 'free' });
    setIsDialogOpen(true);
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

  if (!textbook) {
    return <div>Textbook not found.</div>;
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
        <div className="flex gap-2">
             <div className="flex items-center gap-1 rounded-md bg-secondary p-1">
                <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setView('list')}><List className="w-5 h-5"/></Button>
                <Button variant={view === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setView('grid')}><LayoutGrid className="w-5 h-5"/></Button>
            </div>
            <Button onClick={handleAddNewClick}>
                 <PlusCircle className="mr-2" /> Add New Chapter
            </Button>
            <Button variant="outline" onClick={() => setIsBulkAddOpen(true)}>
                 Bulk Add Chapters
            </Button>
        </div>
      </div>

       <Card>
        <CardHeader>
            <CardTitle>Existing Chapters</CardTitle>
            <CardDescription>
                A list of all chapters in this textbook. Click a chapter to manage its topics.
            </CardDescription>
        </CardHeader>
        <CardContent>
            {chapters.length > 0 ? (
                view === 'list' ? (
                     <div className="space-y-2">
                    {chapters.map((chapter) => (
                        <div key={chapter.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-accent/50">
                        <Link href={`/admin/textbooks/${textbookId}/chapter/${chapter.id}/topics`} className="font-medium flex-grow flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-muted-foreground"/>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {chapters.map((chapter) => (
                            <Card key={chapter.id} className="flex flex-col bg-slate-800 text-white">
                                <div className="h-48 flex items-center justify-center p-4">
                                    <DeshExamLogo />
                                </div>
                                <div className="p-4 border-t border-slate-700">
                                    <Link href={`/admin/textbooks/${textbookId}/chapter/${chapter.id}/topics`} className="font-semibold hover:text-primary transition-colors flex justify-between items-center">
                                       <span className="flex items-center gap-2">
                                            <BookOpen className="w-4 h-4"/>
                                            {chapter.title}
                                       </span>
                                        <ChevronRight />
                                    </Link>
                                </div>
                                <CardFooter className="p-4 border-t border-slate-700 flex gap-2">
                                    <Button variant="secondary" size="sm" className="w-full" onClick={() => handleEditClick(chapter)}>
                                        <Edit className="h-4 w-4 mr-2" /> Edit
                                    </Button>
                                    <Button variant="destructive" size="sm" className="w-full" onClick={() => handleDeleteClick(chapter)}>
                                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )
            ) : (
                <div className="text-center text-muted-foreground py-4">
                No chapters added yet.
                </div>
            )}
        </CardContent>
        </Card>
      
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

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{editingChapter ? 'Edit Chapter' : 'Add New Chapter'}</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
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
                </div>
                 <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddOrUpdateChapter}>
                        {editingChapter ? 'Update Chapter' : 'Add Chapter'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </div>
  );
}
