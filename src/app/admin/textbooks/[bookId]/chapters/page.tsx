
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
import { ArrowLeft, PlusCircle, Edit, Trash2, Library, Video, File as FileIcon, Mic, Upload, Loader2, Link as LinkIcon, Sparkles, BrainCircuit, ImageIcon, ChevronRight, List, LayoutGrid, BookOpen, Eye } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { uploadFile } from '@/lib/firebase/firestore';
import { ImageUploader } from "@/components/feature/image-uploader";
import { DeshExamLogo } from "@/components/icons";
import { cn } from "@/lib/utils";
import Image from 'next/image';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
    DialogClose,
    DialogDescription
} from '@/components/ui/dialog';
import { Separator } from "@/components/ui/separator";
import { solvedTextbookPageAssistant } from '@/ai/flows/solved-textbook-page-assistant';
import { generateSummary } from '@/ai/flows/ai-summary-generator';
import { generateTextbookQuestions } from '@/ai/flows/ai-textbook-question-generator';
import type { AISummaryGeneratorOutput } from '@/ai/flows/ai-summary-generator';
import type { AITextbookQuestionGeneratorOutput } from '@/ai/flows/ai-textbook-question-generator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from '@/components/ui/skeleton';


const ResourceItem = ({ resource, onEdit, onDelete }: { resource: Resource, onEdit: () => void, onDelete: () => void }) => {
    const getIcon = () => {
        switch(resource.type) {
            case 'video': return <Video className="w-4 h-4 text-muted-foreground" />;
            case 'audio': return <Mic className="w-4 h-4 text-muted-foreground" />;
            case 'pdf': return <FileIcon className="w-4 h-4 text-muted-foreground" />;
            case 'doc': return <FileIcon className="w-4 h-4 text-muted-foreground" />;
            default: return <LinkIcon className="w-4 h-4 text-muted-foreground" />;
        }
    }

    return (
        <div className="flex items-center gap-2 p-2 border rounded-md">
            {getIcon()}
            <span className="text-sm font-medium flex-grow truncate">{resource.title}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}><Edit className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onDelete}><Trash2 className="w-4 h-4" /></Button>
        </div>
    )
}

const ChapterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 flex-shrink-0"><path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path></svg>
);


export default function ManageChaptersPage() {
  const params = useParams();
  const textbookId = params.bookId as string;

  const [textbook, setTextbook] = useState<Textbook | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [newChapter, setNewChapter] = useState<{ title: string, content: string, resources: Resource[], featureImage?: string, chapterPdfUrl?: string, access: 'free' | 'pass' | 'pro' }>({ title: '', content: '', resources: [], featureImage: '', chapterPdfUrl: '', access: 'free' });
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
  
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [newResource, setNewResource] = useState<{ type: 'video' | 'audio' | 'pdf' | 'doc', title: string, url: string }>({ type: 'video', title: '', url: '' });
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chapterPdfFileRef = useRef<HTMLInputElement>(null);
  const topicPdfFileRef = useRef<HTMLInputElement>(null);

  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [aiFiles, setAiFiles] = useState<File[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const aiFileInputRef = useRef<HTMLInputElement>(null);

  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState<AISummaryGeneratorOutput | null>(null);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<AITextbookQuestionGeneratorOutput['questions'] | null>(null);
  const [numQuestions, setNumQuestions] = useState(5);
  const [questionTypes, setQuestionTypes] = useState<string[]>(['Multiple Choice']);


  const fetchChapters = useCallback(async () => {
    if (!textbookId) return;
    setLoading(true);
    
    try {
        const textbookDocRef = doc(db, 'textbooks', textbookId);
        const textbookDocSnap = await getDoc(textbookDocRef);
        if(textbookDocSnap.exists()) setTextbook({ id: textbookDocSnap.id, ...textbookDocSnap.data() } as Textbook);
        
        const chaptersRef = collection(db, "textbooks", textbookId, "chapters");
        const q = query(chaptersRef, orderBy("title"));
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
        setNewChapter({ title: '', content: '', resources: [], featureImage: '', chapterPdfUrl: '', access: 'free' });
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
                access: 'pass'
            });
        }
        
        toast({
            title: 'Chapters Added',
            description: `${chapterTitles.length} chapters have been added successfully.`,
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
    setNewChapter({ title: chapter.title, content: chapter.content || '', featureImage: chapter.featureImage || '', chapterPdfUrl: chapter.chapterPdfUrl || '', resources: chapter.resources || [], access: chapter.access || 'free' });
    setIsDialogOpen(true);
  };
  
  const handleAddNewClick = () => {
    setEditingChapter(null);
    setNewChapter({ title: '', content: '', resources: [], featureImage: '', chapterPdfUrl: '', access: 'free' });
    setIsDialogOpen(true);
  }
  
  const handleCancelEdit = () => {
    setEditingChapter(null);
    setNewChapter({ title: '', content: '', resources: [], featureImage: '', chapterPdfUrl: '', access: 'free' });
    setIsDialogOpen(false);
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

   const openResourceDialog = (resource: Resource | null) => {
    setEditingResource(resource);
    if (resource) {
        setNewResource({ type: resource.type, title: resource.title, url: resource.url });
    } else {
        setNewResource({ type: 'video', title: '', url: '' });
    }
    setIsResourceDialogOpen(true);
  }

  const handleSaveResource = async () => {
    if (!newResource.title || !newResource.url) {
        toast({ variant: 'destructive', title: 'Please fill all fields.' });
        return;
    }

    let updatedResources;
    if (editingResource) {
        updatedResources = newChapter.resources.map(r => r.id === editingResource.id ? { ...editingResource, ...newResource } : r);
    } else {
        updatedResources = [...newChapter.resources, { ...newResource, id: new Date().getTime().toString() }];
    }
    
    setNewChapter(prev => ({...prev, resources: updatedResources}));
    setIsResourceDialogOpen(false);
    setEditingResource(null);
  }

  const handleDeleteResource = () => {
    if (!resourceToDelete) return;
    const updatedResources = newChapter.resources.filter(r => r.id !== resourceToDelete.id);
    setNewChapter(prev => ({...prev, resources: updatedResources}));
    setResourceToDelete(null);
  }
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldToUpdate: 'resources' | 'pdfUrl' | 'featureImage' | 'chapterPdfUrl') => {
    const file = e.target.files?.[0];
    if (file) {
        setIsUploading(true);
        try {
            const downloadURL = await uploadFile(file);
            if(fieldToUpdate === 'featureImage') {
                setNewChapter(prev => ({...prev, featureImage: downloadURL}));
            } else if (fieldToUpdate === 'chapterPdfUrl') {
                if (chapter) {
                    const chapterRef = doc(db, `textbooks/${textbookId}/chapters`, chapter.id);
                    await updateDoc(chapterRef, { chapterPdfUrl: downloadURL });
                    fetchChapters(); // re-fetch to update state
                }
            } else {
                 setNewResource(prev => ({...prev, url: downloadURL}));
            }
            toast({ title: 'File uploaded!', description: 'URL has been set.' });
        } catch (error) {
            toast({ variant: "destructive", title: 'Upload Failed', description: (error as Error).message });
        } finally {
            setIsUploading(false);
        }
    }
  };

  const handleAiFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAiFiles(prevFiles => [...prevFiles, ...Array.from(e.target.files!)]);
    }
  };

  const removeAiFile = (fileToRemove: File) => {
    setAiFiles(prevFiles => prevFiles.filter(file => file !== fileToRemove));
  };


    const handleAIGenerateContent = async () => {
        if (aiFiles.length === 0) {
            toast({ variant: "destructive", title: "No files selected" });
            return;
        }

        setIsGenerating(true);
        let combinedContent = newChapter.content || '';

        try {
            for (const file of aiFiles) {
                const pageDataUri = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = error => reject(error);
                });
                
                const result = await solvedTextbookPageAssistant({ pageDataUri });
                combinedContent += (combinedContent ? '\n\n---\n\n' : '') + result.content;
                
                // Update content in real-time after each page
                setNewChapter(prev => ({...prev, content: combinedContent}));
            }
            
            toast({ title: `Content Generated!`, description: `AI content from ${aiFiles.length} page(s) has been appended.` });
            setIsAiDialogOpen(false);
            setAiFiles([]);

        } catch (error) {
            toast({ variant: "destructive", title: "AI Generation Failed", description: (error as Error).message });
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleGenerateSummary = async () => {
        if (!newChapter.content) {
            toast({ variant: "destructive", title: "Chapter content is empty." });
            return;
        }
        setIsGeneratingSummary(true);
        setGeneratedSummary(null);
        try {
            const result = await generateSummary({ content: newChapter.content });
            setGeneratedSummary(result);
        } catch(error) {
             toast({ variant: "destructive", title: "Summary Generation Failed", description: (error as Error).message });
        } finally {
            setIsGeneratingSummary(false);
        }
    }
    
    const handleGenerateQuestions = async () => {
        if (!newChapter.content) {
            toast({ variant: "destructive", title: "Chapter content is empty." });
            return;
        }
        setIsGeneratingQuestions(true);
        setGeneratedQuestions(null);
        try {
            const result: AITextbookQuestionGeneratorOutput = await generateTextbookQuestions({ 
                numQuestions: numQuestions,
                sourceText: newChapter.content,
                questionTypes: questionTypes as any,
            });
            setGeneratedQuestions(result.questions);
        } catch(error) {
             toast({ variant: "destructive", title: "Question Generation Failed", description: (error as Error).message });
        } finally {
            setIsGeneratingQuestions(false);
        }
    };

    const handleUseSummary = () => {
        if (!generatedSummary) return;
        const summaryText = `## Summary\n\n${generatedSummary.summary}\n\n### Key Points\n\n${generatedSummary.keyPoints.map((p: string) => `- ${p}`).join('\n')}`;
        setNewChapter(prev => ({ ...prev, content: (prev.content ? prev.content + '\n\n' : '') + summaryText }));
        toast({ title: "Summary added to content!" });
        setGeneratedSummary(null);
    }

    const handleUseQuestions = () => {
        if (!generatedQuestions) return;
        let questionsText = "\n\n## Practice Questions\n\n";
        generatedQuestions.forEach((q, index) => {
            questionsText += `**${index + 1}. ${q.text}**\n\n`;
            if (q.type === 'Multiple Choice' && q.options) {
                q.options.forEach((opt: { text: string; }) => {
                    questionsText += `- ${opt.text}\n`;
                });
                questionsText += `\n> **Answer:** ${q.correctAnswer}\n`;
            } else if (q.type === 'Matching' && Array.isArray(q.correctAnswer)) {
                const pairs = q.correctAnswer.map((p: any) => `  - ${p.a} → ${p.b}`).join('\n');
                questionsText += `\n> **Answer:**\n${pairs}\n`;
            } else if (q.correctAnswer) {
                 questionsText += `> **Answer:** ${String(q.correctAnswer)}\n`;
            }

            if (q.explanation) {
                questionsText += `\n> **Explanation:** ${q.explanation}\n`;
            }
            questionsText += "\n---\n\n";
        });
        setNewChapter(prev => ({ ...prev, content: (prev.content ? prev.content + '\n\n' : '') + questionsText }));
        toast({ title: "Questions added to content!" });
        setGeneratedQuestions(null);
    }


  if (loading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="space-y-2">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-48 w-full" />
                        </CardHeader>
                        <CardContent>
                             <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
  }

  if (!textbook) {
    return <div>Textbook not found.</div>;
  }

  return (
    <div className="space-y-6">
        <div>
            <Button asChild variant="ghost">
                <Link href={`/admin/textbooks`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Textbooks
                </Link>
            </Button>
        </div>
        <div>
            <h1 className="font-headline text-3xl font-bold">
            Manage Chapters
            </h1>
            <p className="text-muted-foreground">
            For textbook: <span className="font-semibold text-foreground">{textbook?.title}</span>
            </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button onClick={handleAddNewClick} className="w-full">
                <PlusCircle className="mr-2" /> Add New Chapter
            </Button>
            <Button variant="outline" onClick={() => setIsBulkAddOpen(true)} className="w-full">
                Bulk Add Chapters
            </Button>
        </div>

       <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle>Existing Chapters</CardTitle>
                <div className="flex items-center gap-1 rounded-md bg-secondary p-1">
                    <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setView('list')}><List className="w-5 h-5"/></Button>
                    <Button variant={view === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setView('grid')}><LayoutGrid className="w-5 h-5"/></Button>
                </div>
            </div>
            <CardDescription>
                  A list of all chapters in this textbook. Click a chapter to manage its topics.
            </CardDescription>
        </CardHeader>
        <CardContent>
            {chapters.length > 0 ? (
                view === 'list' ? (
                     <div className="space-y-2">
                        {chapters.map((chapter) => (
                           <div key={chapter.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-md hover:bg-accent/50 gap-2">
                                <Link href={`/admin/textbooks/${textbookId}/chapter/${chapter.id}`} className="font-medium flex-grow flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-muted-foreground"/>
                                    <span className="flex-1">{chapter.title}</span>
                                </Link>
                                <div className="flex items-center gap-2 self-end sm:self-center">
                                    <Button asChild variant="ghost" size="sm">
                                        <Link href={`/textbook-solutions/${textbookId}/chapter/${chapter.id}`} target="_blank">
                                            <Eye className="h-4 w-4"/>
                                        </Link>
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleEditClick(chapter)}><Edit className="h-4 w-4"/></Button>
                                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteClick(chapter)}><Trash2 className="h-4 w-4"/></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {chapters.map((chapter) => (
                            <Card key={chapter.id} className="flex flex-col">
                                <Link href={`/admin/textbooks/${textbookId}/chapter/${chapter.id}`} className="block relative bg-gray-100 dark:bg-gray-800 rounded-t-lg aspect-[4/3]">
                                    <Image
                                        src={chapter.featureImage || '/image/logo.png'}
                                        alt={chapter.title}
                                        fill
                                        className="object-contain p-2"
                                    />
                                </Link>
                                <Link href={`/admin/textbooks/${textbookId}/chapter/${chapter.id}`}>
                                    <CardHeader className="p-4 flex-row items-center gap-3 hover:bg-accent/50 transition-colors">
                                        <ChapterIcon />
                                        <CardTitle className="text-base font-semibold flex-grow">{chapter.title}</CardTitle>
                                        <ChevronRight className="w-5 h-5 flex-shrink-0" />
                                    </CardHeader>
                                </Link>
                                <CardFooter className="p-4 pt-0 flex gap-2">
                                     <Button variant="outline" size="sm" className="w-full" onClick={() => handleEditClick(chapter)}>
                                        <Edit className="h-3 w-3 mr-1"/> Edit
                                    </Button>
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href={`/textbook-solutions/${textbookId}/chapter/${chapter.id}`} target="_blank">
                                            <Eye className="h-3 w-3"/>
                                        </Link>
                                    </Button>
                                    <Button variant="destructive" size="sm" className="w-full" onClick={() => handleDeleteClick(chapter)}>
                                        <Trash2 className="h-3 w-3 mr-1"/> Delete
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
            <DialogContent className="max-w-4xl h-full flex flex-col md:max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>{editingChapter ? 'Edit Chapter' : 'Add New Chapter'}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1 overflow-y-auto flex-1">
                    {/* Left Column for Form */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="chapter-title">Chapter Title</Label>
                            <Input id="chapter-title" placeholder="e.g., Chapter 1: Electric Charges" value={newChapter.title} onChange={(e) => setNewChapter({...newChapter, title: e.target.value})} />
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
                                 <Button type="button" variant="outline" size="icon" onClick={() => chapterPdfFileRef.current?.click()}>
                                    <Upload className="w-4 h-4"/>
                                 </Button>
                                 <Input type="file" className="hidden" ref={chapterPdfFileRef} onChange={(e) => handleFileUpload(e, 'chapterPdfUrl')} accept=".pdf"/>
                             </div>
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
                        <div className="space-y-2">
                             <div className="flex justify-between items-center">
                                <Label htmlFor="topic-content">Chapter Content</Label>
                                <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button type="button" variant="outline" size="sm">
                                            <Sparkles className="mr-2 h-4 w-4" /> Generate with AI
                                        </Button>
                                    </DialogTrigger>
                                     <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Generate Content from Page(s)</DialogTitle>
                                            <DialogDescription>Upload one or more images of textbook pages to automatically generate content.</DialogDescription>
                                        </DialogHeader>
                                        <div 
                                            className="mt-1 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer hover:border-primary"
                                            onClick={() => aiFileInputRef.current?.click()}
                                        >
                                            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                                            <p>Click to upload or add files</p>
                                        </div>
                                        <Input type="file" ref={aiFileInputRef} onChange={handleAiFileChange} className="hidden" accept="image/*,.pdf" multiple />
                                        {aiFiles.length > 0 && (
                                            <ScrollArea className="h-32 w-full rounded-md border p-2">
                                                <ul className="text-sm text-muted-foreground space-y-2">
                                                    {aiFiles.map((file, index) => (
                                                        <li key={index} className="flex items-center justify-between">
                                                            <span className="truncate pr-2">{file.name}</span>
                                                            <Button variant="ghost" size="sm" onClick={() => removeAiFile(file)}><Trash2 className="w-4 h-4 text-destructive"/></Button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </ScrollArea>
                                        )}
                                        <DialogFooter>
                                            <Button type="button" onClick={handleAIGenerateContent} disabled={isGenerating || aiFiles.length === 0}>
                                                {isGenerating ? <><Loader2 className="animate-spin mr-2"/> Generating...</> : "Generate"}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                            <Textarea id="topic-content" placeholder="Add the main educational content. You can use Markdown." value={newChapter.content || ''} onChange={(e) => setNewChapter({...newChapter, content: e.target.value})} className="min-h-[200px]" />
                        </div>
                        <Separator />
                        <div className="space-y-2">
                            <div className="flex justify-between items-center"><Label>Additional Resources</Label><Button type="button" variant="outline" size="sm" onClick={() => openResourceDialog(null)}><PlusCircle className="mr-2 h-4 w-4" /> Add</Button></div>
                            <div className="space-y-2">{newChapter.resources.map(res => (<ResourceItem key={res.id} resource={res} onEdit={() => openResourceDialog(res)} onDelete={() => setResourceToDelete(res)}/>))}{newChapter.resources.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">No resources added.</p>}</div>
                        </div>
                    </div>
                    {/* Right Column for AI tools */}
                    <div className="space-y-4 md:border-l md:pl-6">
                        <Card className="bg-muted/50 sticky top-0">
                            <CardHeader><CardTitle className="flex items-center gap-2"><BrainCircuit className="text-primary"/> AI Content Tools</CardTitle><CardDescription>Generate summaries and questions based on the chapter content.</CardDescription></CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="summary"><AccordionTrigger>Generate Summary</AccordionTrigger>
                                        <AccordionContent className="pt-4 space-y-4"><Button onClick={handleGenerateSummary} disabled={isGeneratingSummary || !newChapter.content} className="w-full">{isGeneratingSummary ? <Loader2 className="animate-spin"/> : "Generate Summary & Key Points"}</Button>
                                            {generatedSummary && (<div className="space-y-4 border-t pt-4"><div><h4 className="font-semibold">Generated Summary:</h4><p className="text-sm text-muted-foreground">{generatedSummary.summary}</p></div><div><h4 className="font-semibold">Key Points:</h4><ul className="list-disc list-inside text-sm text-muted-foreground">{generatedSummary.keyPoints.map((pt: string, i: number) => <li key={i}>{pt}</li>)}</ul></div><Button variant="secondary" size="sm" onClick={handleUseSummary} className="w-full">Append to Content</Button></div>)}
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="questions"><AccordionTrigger>Generate Questions</AccordionTrigger>
                                        <AccordionContent className="pt-4 space-y-4">
                                            <div className="flex items-center gap-2"><Label htmlFor="num-questions" className="flex-shrink-0">Number of Questions:</Label><Input id="num-questions" type="number" value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))} min="1" max="10" className="w-20"/></div>
                                            <div><Label>Question Types:</Label><div className="grid grid-cols-2 gap-2 mt-2">{['Multiple Choice', 'True/False', 'Short Answer', 'Fill in the Blank'].map(type => (<div key={type} className="flex items-center space-x-2"><Checkbox id={`type-${type}`} checked={questionTypes.includes(type)} onCheckedChange={(checked) => { checked ? setQuestionTypes(prev => [...prev, type]) : setQuestionTypes(prev => prev.filter(t => t !== type))}}/><label htmlFor={`type-${type}`} className="text-sm font-medium leading-none">{type}</label></div>))}</div></div>
                                            <Button onClick={handleGenerateQuestions} disabled={isGeneratingQuestions || !newChapter.content} className="w-full">{isGeneratingQuestions ? <Loader2 className="animate-spin"/> : "Generate Questions"}</Button>
                                            {generatedQuestions && (<div className="space-y-4 border-t pt-4"><h4 className="font-semibold">Generated Questions:</h4><div className="text-sm text-muted-foreground space-y-2 max-h-60 overflow-y-auto p-2 border rounded-md">{generatedQuestions.map((q: any, i: number) => <p key={i}><strong>{i+1}.</strong> {q.text}</p>)}</div><Button variant="secondary" size="sm" onClick={handleUseQuestions} className="w-full">Append Questions to Content</Button></div>)}
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline" onClick={handleCancelEdit}>Cancel</Button></DialogClose>
                    <Button onClick={handleAddOrUpdateChapter}>{editingChapter ? 'Update Chapter' : 'Add Chapter'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        
         <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingResource ? 'Edit' : 'Add'} Resource</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Resource Type</Label>
                        <Select value={newResource.type} onValueChange={(v) => setNewResource({...newResource, type: v as any})}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="video">Video</SelectItem>
                                <SelectItem value="audio">Audio</SelectItem>
                                <SelectItem value="pdf">PDF</SelectItem>
                                <SelectItem value="doc">Document</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input placeholder="Resource Title" value={newResource.title} onChange={(e) => setNewResource({...newResource, title: e.target.value})} />
                    </div>
                     <div className="space-y-2">
                        <Label>URL / File</Label>
                        <div className="flex gap-2">
                            <Input placeholder="https://example.com/resource" value={newResource.url} onChange={(e) => setNewResource({...newResource, url: e.target.value})} />
                             <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                                {isUploading ? <Loader2 className="animate-spin"/> : <Upload />}
                             </Button>
                        </div>
                        <Input type="file" ref={fileInputRef} onChange={(e) => handleFileUpload(e, 'resources')} className="hidden" />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                    <Button onClick={handleSaveResource}>Save Resource</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

         <AlertDialog open={!!resourceToDelete} onOpenChange={() => setResourceToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Delete Resource?</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete this resource?</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteResource} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}

