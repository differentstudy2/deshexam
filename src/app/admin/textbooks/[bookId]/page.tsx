
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
import type { Textbook, Chapter, Topic, Resource } from '@/lib/types';
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
import { ArrowLeft, PlusCircle, Edit, Trash2, Library, Video, File as FileIcon, Mic, FileQuestion, BookOpen, Award, Upload, Loader2, Link as LinkIcon, Sparkles, BrainCircuit, ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
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
  DialogClose,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { TextbookStats } from '@/components/feature/textbook-stats';
import { uploadFile } from "@/lib/firebase/firestore";
import { Separator } from "@/components/ui/separator";
import { solvedTextbookPageAssistant } from '@/ai/flows/solved-textbook-page-assistant';
import { generateSummary } from '@/ai/flows/ai-summary-generator';
import { generateTextbookQuestions } from '@/ai/flows/ai-textbook-question-generator';
import type { AISummaryGeneratorOutput } from '@/ai/flows/ai-summary-generator';
import type { AITextbookQuestionGeneratorOutput } from '@/ai/flows/ai-textbook-question-generator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImageUploader } from '@/components/feature/image-uploader';


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


export default function ManageChaptersPage() {
  const params = useParams();
  const textbookId = params.bookId as string;

  const [textbook, setTextbook] = useState<Textbook | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [newChapter, setNewChapter] = useState<{ title: string; content: string; access: 'free' | 'pass' | 'pro', resources: Resource[], featureImage?: string, chapterPdfUrl?: string }>({ title: '', content: '', access: 'pass', resources: [], featureImage: '', chapterPdfUrl: '' });
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [chapterToDelete, setChapterToDelete] = useState<Chapter | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);
  const [bulkChaptersText, setBulkChaptersText] = useState('');
  const [isBulkAdding, setIsBulkAdding] = useState(false);
  const { toast } = useToast();

  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [newResource, setNewResource] = useState<{ type: 'video' | 'audio' | 'pdf' | 'doc', title: string, url: string }>({ type: 'video', title: '', url: '' });
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chapterPdfFileRef = useRef<HTMLInputElement>(null);
  
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
        setNewChapter({ title: '', content: '', access: 'pass', resources: [], featureImage: '', chapterPdfUrl: '' });
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
                access: 'pass'
            });
        }
        
        toast({
            title: 'Chapters Added',
            description: `${'chapterTitles.length'} chapters have been added successfully.`,
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
    setNewChapter({ title: chapter.title, content: chapter.content || '', access: chapter.access || 'pass', resources: chapter.resources || [], featureImage: chapter.featureImage || '', chapterPdfUrl: chapter.chapterPdfUrl || '' });
  };
  
  const handleCancelEdit = () => {
    setEditingChapter(null);
    setNewChapter({ title: '', content: '', access: 'pass', resources: [], featureImage: '', chapterPdfUrl: '' });
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
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldToUpdate: 'featureImage' | 'chapterPdfUrl') => {
    const file = e.target.files?.[0];
    if (file) {
        setIsUploading(true);
        try {
            const downloadURL = await uploadFile(file);
            setNewChapter(prev => ({ ...prev, [fieldToUpdate]: downloadURL }));
            toast({ title: 'File uploaded!' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Upload Failed', description: (error as Error).message });
        } finally {
            setIsUploading(false);
        }
    }
  };
  
    const handleAiFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAiFiles(prevFiles => [...prevFiles, ...Array.from(e.target.files!)]);
        }
    }

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
    return <div>Loading textbooks...</div>;
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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold">
            Manage Chapters for <span className="text-primary">{textbook.title}</span>
          </h1>
          <p className="text-muted-foreground">
            Add, edit, and manage chapters for this textbook.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Dialog open={isBulkAddOpen} onOpenChange={setIsBulkAddOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary" className="w-full"><Library className="mr-2 h-4 w-4" /> Bulk Add</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Add Chapters</DialogTitle>
                <DialogDescription>
                  Paste a list of chapter titles below, one per line. Each line will be created as a new chapter.
                </DialogDescription>
              </DialogHeader>
              <Textarea
                placeholder="Chapter 1: Introduction
Chapter 2: The Basics
Chapter 3: Advanced Topics"
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
           <Button variant="outline" asChild className="w-full">
            <Link href={`/admin/textbooks/${textbookId}/exams`}>
              <Award className="mr-2 h-4 w-4" />
              Manage Exams
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href={`/admin/textbooks/${textbookId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Textbook Details
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-6">
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
                         <Button type="button" variant="outline" size="icon" onClick={() => chapterPdfFileRef.current?.click()}>
                            <Upload className="w-4 h-4"/>
                         </Button>
                         <Input type="file" className="hidden" ref={chapterPdfFileRef} onChange={(e) => handleFileUpload(e, 'chapterPdfUrl')} accept=".pdf"/>
                     </div>
                </div>
                <div className="space-y-2">
                     <div className="flex justify-between items-center">
                        <Label htmlFor="chapter-content">Chapter Content</Label>
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
                    <Textarea
                    id="chapter-content"
                    placeholder="Add a summary or introduction for the chapter. You can use AI to generate this from an image."
                    value={newChapter.content || ''}
                    onChange={(e) => setNewChapter({...newChapter, content: e.target.value})}
                    className="min-h-[200px]"
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
                <Separator />
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                         <Label>Additional Resources</Label>
                         <Button type="button" variant="outline" size="sm" onClick={() => openResourceDialog(null)}>
                             <PlusCircle className="mr-2 h-4 w-4" /> Add
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {newChapter.resources.map(res => (
                            <ResourceItem 
                                key={res.id} 
                                resource={res} 
                                onEdit={() => openResourceDialog(res)}
                                onDelete={() => setResourceToDelete(res)}
                            />
                        ))}
                        {newChapter.resources.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">No resources added.</p>}
                    </div>
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

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BrainCircuit className="text-primary"/> AI Content Tools</CardTitle>
                    <CardDescription>Generate summaries and questions based on the chapter content above.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="summary">
                            <AccordionTrigger>Generate Summary</AccordionTrigger>
                            <AccordionContent className="pt-4 space-y-4">
                               <Button onClick={handleGenerateSummary} disabled={isGeneratingSummary || !newChapter.content} className="w-full">
                                    {isGeneratingSummary ? <Loader2 className="animate-spin"/> : "Generate Summary & Key Points"}
                                </Button>
                                {generatedSummary && (
                                    <div className="space-y-4 border-t pt-4">
                                        <div>
                                            <h4 className="font-semibold">Generated Summary:</h4>
                                            <p className="text-sm text-muted-foreground">{generatedSummary.summary}</p>
                                        </div>
                                         <div>
                                            <h4 className="font-semibold">Key Points:</h4>
                                            <ul className="list-disc list-inside text-sm text-muted-foreground">
                                                {generatedSummary.keyPoints.map((pt: string, i: number) => <li key={i}>{pt}</li>)}
                                            </ul>
                                        </div>
                                        <Button variant="secondary" size="sm" onClick={handleUseSummary} className="w-full">Append to Chapter Content</Button>
                                    </div>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="questions">
                            <AccordionTrigger>Generate Questions</AccordionTrigger>
                            <AccordionContent className="pt-4 space-y-4">
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="num-questions" className="flex-shrink-0">Number of Questions:</Label>
                                    <Input 
                                        id="num-questions" 
                                        type="number"
                                        value={numQuestions}
                                        onChange={(e) => setNumQuestions(Number(e.target.value))}
                                        min="1"
                                        max="10"
                                        className="w-20"
                                    />
                                </div>
                                <div>
                                    <Label>Question Types:</Label>
                                     <div className="grid grid-cols-2 gap-2 mt-2">
                                        {['Multiple Choice', 'True/False', 'Short Answer', 'Fill in the Blank'].map(type => (
                                             <div key={type} className="flex items-center space-x-2">
                                                <Checkbox 
                                                    id={`type-${type}`}
                                                    checked={questionTypes.includes(type)}
                                                    onCheckedChange={(checked) => {
                                                        checked ? setQuestionTypes(prev => [...prev, type]) : setQuestionTypes(prev => prev.filter(t => t !== type))
                                                    }}
                                                />
                                                <label htmlFor={`type-${type}`} className="text-sm font-medium leading-none">{type}</label>
                                             </div>
                                        ))}
                                    </div>
                                </div>
                                <Button onClick={handleGenerateQuestions} disabled={isGeneratingQuestions || !newChapter.content} className="w-full">
                                    {isGeneratingQuestions ? <Loader2 className="animate-spin"/> : "Generate Questions"}
                                </Button>
                                {generatedQuestions && (
                                    <div className="space-y-4 border-t pt-4">
                                        <h4 className="font-semibold">Generated Questions:</h4>
                                        <div className="text-sm text-muted-foreground space-y-2 max-h-60 overflow-y-auto p-2 border rounded-md">
                                            {generatedQuestions.map((q: any, i: number) => <p key={i}><strong>{i+1}.</strong> {q.text}</p>)}
                                        </div>
                                        <Button variant="secondary" size="sm" onClick={handleUseQuestions} className="w-full">Append Questions to Content</Button>
                                    </div>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                     </Accordion>
                </CardContent>
            </Card>
        </div>


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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {chapters.map((chapter) => (
                            <Card key={chapter.id} className="flex flex-col">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base font-medium leading-tight">{chapter.title}</CardTitle>
                                    <ContentBadge type={chapter.access || 'pass'} />
                                </CardHeader>
                                <CardContent className="flex-grow text-sm text-muted-foreground">
                                    <div className="flex gap-2 flex-wrap">
                                        {(chapter.resources || []).slice(0, 3).map(res => {
                                            switch(res.type) {
                                                case 'video': return <Button key={res.id} variant="outline" size="sm" className="h-7"><Video className="w-3 h-3 mr-1"/> Video</Button>;
                                                case 'audio': return <Button key={res.id} variant="outline" size="sm" className="h-7"><Mic className="w-3 h-3 mr-1"/> Audio</Button>;
                                                case 'pdf': return <Button key={res.id} variant="outline" size="sm" className="h-7"><FileIcon className="w-3 h-3 mr-1"/> PDF</Button>;
                                                default: return null;
                                            }
                                        })}
                                        {(chapter.resources || []).length > 3 && <Badge>+ {(chapter.resources || []).length - 3} more</Badge>}
                                    </div>
                                </CardContent>
                                <CardFooter className="flex-col items-stretch gap-2 pt-4 border-t">
                                     <div className="space-y-2">
                                        <Button variant="secondary" size="sm" className="w-full" asChild>
                                            <Link href={`/admin/textbooks/${textbookId}/chapter/${chapter.id}`}>Manage Chapter</Link>
                                        </Button>
                                    </div>
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
