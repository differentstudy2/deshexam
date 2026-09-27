'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PlusCircle, Pencil, Trash2, ArrowLeft, Loader2, ListPlus, Copy, GripVertical, Sparkles, Upload, Link as LinkIcon, Image as ImageIcon, Wand2, Check, ChevronDown, Search, CheckCircle2, Printer, FileText, Compass, ListChecks, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { MockTest } from '@/lib/assessment-types';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase/client';
import { QuestionPickerModal } from '@/components/assessment/QuestionPickerModal';
import { QuestionImportModal } from '@/components/assessment/QuestionImportModal';
import { QuestionBankEntry, TaxonomyNode } from '@/lib/question-bank-types';
import { getQuestionsByIds } from '@/lib/firebase/question-bank';
import { getTaxonomyNodesByTrack } from '@/lib/firebase/taxonomy';
import { cn } from '@/lib/utils';
import { generateMockTestMetadata, generateImagePrompt, generateImageWithGemini } from '@/app/admin/assessment-center/mock-tests/actions';
import { ImageUploader } from '@/components/feature/image-uploader';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const MD3SelectField = ({ label, value, placeholder, onClick, required }: { label: string, value: string, placeholder: string, onClick: () => void, required?: boolean }) => (
    <div onClick={onClick} className="relative border border-slate-200 dark:border-slate-700 rounded-lg p-2 pt-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors bg-white dark:bg-slate-900">
        <label className="absolute top-0 left-2 -translate-y-1/2 bg-white dark:bg-slate-900 px-1 text-[10px] font-medium text-slate-500 dark:text-slate-400 pointer-events-none">
            {label} {required && <span className="text-red-500 dark:text-red-400">*</span>}
        </label>
        <div className="flex items-center justify-between min-h-[16px] mt-0.5">
            <span className={cn("text-sm font-medium truncate pr-2", value ? "text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-500")}>{value || placeholder}</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
        </div>
    </div>
);

export interface AssessmentEditorProps {
    initialData: any;
    onSave: (data: any) => Promise<void>;
    onCancel: () => void;
    title?: string;
    collectionPath?: string;
}

export function AssessmentEditor({ initialData, onSave, onCancel, title = 'Mock Test', collectionPath }: AssessmentEditorProps) {
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [showAIDialog, setShowAIDialog] = useState(false);
    const [aiTopic, setAiTopic] = useState('');
    const [editData, setEditData] = useState<Partial<MockTest> & Record<string, any>>({
        status: 'Draft',
        difficulty: 'Medium',
        durationMin: 60,
        totalMarks: 100,
        negativeMarking: 0.25,
        passingMarks: 40,
        attemptsAllowed: 1, // Strict for mock tests usually
        isStrictMode: true,
        shuffleQuestions: false,
        shuffleOptions: false,
        accessType: 'free',
        allowedSubscriptionPlans: [],
        price: 0,
        ...initialData
    });
    
    const [showPicker, setShowPicker] = useState(false);
    const [showImport, setShowImport] = useState(false);
    
    // Auto-Calculate State
    const [autoCalc, setAutoCalc] = useState(!initialData.id);

    // New Advanced States
    const [questionPreviews, setQuestionPreviews] = useState<Record<string, string>>({});
    const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

    // Feature Image States
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [aiImagePrompt, setAiImagePrompt] = useState('');
    const [isGeneratingImagePrompt, setIsGeneratingImagePrompt] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Taxonomy States
    const [boards, setBoards] = useState<TaxonomyNode[]>([]);
    const [classes, setClasses] = useState<TaxonomyNode[]>([]);
    const [subjects, setSubjects] = useState<TaxonomyNode[]>([]);
    const [textbooks, setTextbooks] = useState<TaxonomyNode[]>([]);
    const [chapters, setChapters] = useState<TaxonomyNode[]>([]);
    const [topics, setTopics] = useState<TaxonomyNode[]>([]);
    const [exams, setExams] = useState<TaxonomyNode[]>([]);
    const [taxonomySheet, setTaxonomySheet] = useState<{ isOpen: boolean, type: string, title: string, items: TaxonomyNode[], value: string, onSelect: (id: string) => void }>({ isOpen: false, type: '', title: '', items: [], value: '', onSelect: () => {} });
    const [sheetSearch, setSheetSearch] = useState('');

    const openTaxonomySheet = (type: string, title: string, items: TaxonomyNode[], value: string, onSelect: (id: string) => void) => {
        setSheetSearch('');
        setTaxonomySheet({ isOpen: true, type, title, items, value, onSelect });
    };

    useEffect(() => {
        const fetchTaxonomies = async () => {
            try {
                const allAcademic = await getTaxonomyNodesByTrack('academic');
                const allCompetitive = await getTaxonomyNodesByTrack('competitive');
                
                const mapNodes = (nodes: any[]) => nodes.map(n => ({ ...n, name: n.title || n.name }));
                
                setBoards(mapNodes(allAcademic.filter((n: any) => n.type === 'board')));
                setClasses(mapNodes(allAcademic.filter((n: any) => n.type === 'class')));
                setSubjects(mapNodes(allAcademic.filter((n: any) => n.type === 'subject')));
                setTextbooks(mapNodes(allAcademic.filter((n: any) => n.type === 'textbook')));
                setChapters(mapNodes(allAcademic.filter((n: any) => n.type === 'chapter')));
                setTopics(mapNodes(allAcademic.filter((n: any) => n.type === 'topic')));
                setExams(mapNodes(allCompetitive.filter((n: any) => n.type === 'exam')));
            } catch (e) {
                console.error("Failed to load taxonomy nodes", e);
            }
        };

        fetchTaxonomies();
    }, []);

    // Fetch Question Previews when editData.questionIds changes
    useEffect(() => {
        if (editData.questionIds && editData.questionIds.length > 0) {
            const idsToFetch = editData.questionIds.filter(id => !questionPreviews[id]);
            if (idsToFetch.length > 0) {
                getQuestionsByIds(idsToFetch).then(questions => {
                    const newMap = { ...questionPreviews };
                    questions.forEach(q => newMap[q.id] = q.questionText);
                    setQuestionPreviews(newMap);
                }).catch(console.error);
            }
        }
    }, [editData.questionIds]);

    // Auto-calculate Configuration
    useEffect(() => {
        if (autoCalc && editData.questionIds) {
            const count = editData.questionIds.length;
            setEditData(prev => ({
                ...prev,
                totalMarks: count,
                durationMin: count,
                passingMarks: Math.ceil(count * 0.6) // 60% merit cutoff
            }));
        }
    }, [autoCalc, editData.questionIds?.length]);


    // Drag and Drop handlers
    const handleDragStart = (idx: number) => {
        setDraggedIdx(idx);
    };

    const handleDragEnter = (idx: number) => {
        if (draggedIdx === null || draggedIdx === idx) return;
        
        const newIds = [...(editData.questionIds || [])];
        const draggedItem = newIds[draggedIdx];
        newIds.splice(draggedIdx, 1);
        newIds.splice(idx, 0, draggedItem);
        
        setDraggedIdx(idx);
        setEditData({ ...editData, questionIds: newIds });
    };

    const handleDragEnd = () => {
        setDraggedIdx(null);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadProgress(0);

        const storageRef = ref(storage, `mock-test-thumbnails/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed', 
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            }, 
            (error) => {
                toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
                setIsUploading(false);
            }, 
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    setEditData({ ...editData, thumbnail: downloadURL });
                    toast({ title: 'Image uploaded successfully' });
                    setIsUploading(false);
                });
            }
        );
    };

    const handleGenerateImagePrompt = async () => {
        if (!editData.title) {
            toast({ title: "Please enter a title first", variant: "destructive" });
            return;
        }
        setIsGeneratingImagePrompt(true);
        const res = await generateImagePrompt(editData.title, editData.description || "");
        if (res.success && res.prompt) {
            setAiImagePrompt(res.prompt);
        } else {
            toast({ title: "Failed to generate prompt", description: res.error, variant: "destructive" });
        }
        setIsGeneratingImagePrompt(false);
    };

    const handleGenerateImage = async () => {
        if (!aiImagePrompt) {
            toast({ title: "Please generate a prompt first", variant: "destructive" });
            return;
        }
        setIsGeneratingImage(true);
        const res = await generateImageWithGemini(aiImagePrompt);
        if (res.success && res.imageUrl) {
            setEditData({ ...editData, thumbnail: res.imageUrl });
            toast({ title: "Image generated successfully!" });
        } else {
            toast({ title: "Generation failed", description: res.error, variant: "destructive" });
        }
        setIsGeneratingImage(false);
    };

    const handleSave = async () => {
        if (!editData.title) {
            toast({ title: 'Title is required', variant: 'destructive' });
            return;
        }
        setIsSaving(true);
        try {
            await onSave(editData);
        } catch(e) {
            console.error(e);
            toast({ title: 'Save failed', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleAIGenerate = async () => {
        const parts = [];
        if (editData.boardId) {
            const b = boards.find(b => b.id === editData.boardId);
            if (b) parts.push(`Board: ${b.name}`);
        }
        if (editData.classId) {
            const b = classes.find(b => b.id === editData.classId);
            if (b) parts.push(`Class: ${b.name}`);
        }
        if (editData.subjectId) {
            const b = subjects.find(b => b.id === editData.subjectId);
            if (b) parts.push(`Subject: ${b.name}`);
        }
        if (editData.chapterId) {
            const b = chapters.find(b => b.id === editData.chapterId);
            if (b) parts.push(`Chapter: ${b.name}`);
        }
        if (editData.topicId) {
            const b = topics.find(b => b.id === editData.topicId);
            if (b) parts.push(`Topic: ${b.name}`);
        }
        
        const topicContext = parts.length > 0 ? parts.join(', ') : '';
        if (!topicContext) {
            toast({ title: 'Taxonomy Required', description: 'Please select at least a Board, Subject, or Chapter to generate metadata.', variant: 'destructive' });
            return;
        }

        setIsGeneratingAI(true);
        try {
            const res = await generateMockTestMetadata(topicContext, title);
            if (res.success && res.data) {
                setEditData(prev => ({
                    ...prev,
                    title: res.data!.title,
                    slug: res.data!.slug,
                    description: res.data!.description,
                    instructions: res.data!.instructions,
                }));
                toast({ title: 'AI Generation Successful!' });
            } else {
                toast({ title: 'AI Generation Failed', description: res.error, variant: 'destructive' });
            }
        } catch (e: any) {
            console.error(e);
            toast({ title: 'AI Generation Failed', description: e.message || 'Unknown network error', variant: 'destructive' });
        } finally {
            setIsGeneratingAI(false);
        }
    };


    const handleQuestionsSelected = (questions: QuestionBankEntry[]) => {
        const newIds = questions.map(q => q.id);
        setEditData(prev => ({
            ...prev,
            questionIds: [...(prev.questionIds || []), ...newIds]
        }));
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={onCancel}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold">{editData.id ? `Edit ${title}` : `Create ${title}`}</h1>
                        {editData.id && editData.attemptCount !== undefined && (
                            <div className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-sm font-medium border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                {Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(editData.attemptCount)} Attempts
                            </div>
                        )}
                    </div>
                </div>
            </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <Card className="border-slate-200/60 dark:border-slate-800 shadow-sm bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-blue-100 dark:border-blue-800/50 bg-blue-50/80 dark:bg-blue-900/20 py-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <CardTitle className="text-base text-slate-800 dark:text-slate-100">Basic Details</CardTitle>
                                </div>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={handleAIGenerate} 
                                    disabled={isGeneratingAI}
                                    className="text-purple-600 border-purple-200 hover:bg-purple-50"
                                >
                                    {isGeneratingAI ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                                    Auto-Generate with AI
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Test Title</label>
                                    <Input value={editData.title || ''} onChange={e => setEditData({...editData, title: e.target.value})} placeholder="E.g., WBCS Prelims Full Mock 1" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Slug</label>
                                    <Input value={editData.slug || ''} onChange={e => setEditData({...editData, slug: e.target.value})} placeholder="wbcs-prelims-mock-1" disabled={!!initialData?.id} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Description</label>
                                    <Textarea value={editData.description || ''} onChange={e => setEditData({...editData, description: e.target.value})} rows={2} className="resize-y" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Instructions for Students</label>
                                    <Textarea value={editData.instructions || ''} onChange={e => setEditData({...editData, instructions: e.target.value})} rows={4} placeholder="Read carefully before starting..." className="resize-y min-h-[100px]" />
                                </div>
                            </CardContent>
                        </Card>

                        <ImageUploader 
                            value={editData.thumbnail}
                            onUrlChange={(url) => setEditData({...editData, thumbnail: url})}
                            multiple={true}
                            defaultAiPrompt={editData.title || ''}
                        />

                        <Card className="border-slate-200/60 dark:border-slate-800 shadow-sm bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl overflow-hidden">
                            <CardHeader className="border-b border-emerald-100 dark:border-emerald-800/50 bg-emerald-50/80 dark:bg-emerald-900/20 py-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
                                        <Compass className="w-4 h-4" />
                                    </div>
                                    <CardTitle className="text-base text-slate-800 dark:text-slate-100">Content Mapping (Taxonomy)</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <MD3SelectField 
                                        label="Board" 
                                        placeholder="Board" 
                                        value={(boards.find(b => b.id === editData.boardId) as any)?.acronym || (boards.find(b => b.id === editData.boardId) as any)?.name || ''} 
                                        onClick={() => openTaxonomySheet('board', 'Select Board', boards, editData.boardId || '', (v) => setEditData(prev => ({...prev, boardId: v, classId: '', subjectId: '', textbookId: '', chapterId: '', topicId: ''})))} 
                                    />
                                    <MD3SelectField 
                                        label="Class" 
                                        placeholder="Class" 
                                        value={classes.find(b => b.id === editData.classId)?.name || ''} 
                                        onClick={() => openTaxonomySheet('class', 'Select Class', classes.filter(b => !editData.boardId || b.parentId === editData.boardId), editData.classId || '', (v) => setEditData(prev => ({...prev, classId: v, subjectId: '', textbookId: '', chapterId: '', topicId: ''})))} 
                                    />
                                </div>
                                <MD3SelectField 
                                    label="Subject" 
                                    placeholder="Subject" 
                                    value={subjects.find(b => b.id === editData.subjectId)?.name || ''} 
                                    onClick={() => openTaxonomySheet('subject', 'Select Subject', subjects.filter(b => !editData.classId || b.parentId === editData.classId), editData.subjectId || '', (v) => setEditData(prev => ({...prev, subjectId: v, textbookId: '', chapterId: '', topicId: ''})))} 
                                />
                                <div className="grid grid-cols-1 gap-4">
                                    <MD3SelectField 
                                        label="Textbook" 
                                        placeholder="Textbook" 
                                        value={textbooks.find(b => b.id === editData.textbookId)?.name || ''} 
                                        onClick={() => openTaxonomySheet('textbook', 'Select Textbook', textbooks.filter(b => !editData.subjectId || b.parentId === editData.subjectId), editData.textbookId || '', (v) => setEditData(prev => ({...prev, textbookId: v, chapterId: '', topicId: ''})))} 
                                    />
                                    <MD3SelectField 
                                        label="Chapter" 
                                        placeholder="Chapter" 
                                        value={chapters.find(b => b.id === editData.chapterId)?.name || ''} 
                                        onClick={() => openTaxonomySheet('chapter', 'Select Chapter', chapters.filter(b => !editData.textbookId || b.parentId === editData.textbookId), editData.chapterId || '', (v) => setEditData(prev => ({...prev, chapterId: v, topicId: ''})))} 
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <MD3SelectField 
                                        label="Topic" 
                                        placeholder="Topic" 
                                        value={topics.find(b => b.id === editData.topicId)?.name || ''} 
                                        onClick={() => openTaxonomySheet('topic', 'Select Topic', topics.filter(b => !editData.chapterId || b.parentId === editData.chapterId), editData.topicId || '', (v) => setEditData(prev => ({...prev, topicId: v})))} 
                                    />
                                    <MD3SelectField 
                                        label="Competitive Exam" 
                                        placeholder="Select Exam" 
                                        value={exams.find(b => b.id === (editData.examIds?.[0] || ''))?.name || ''} 
                                        onClick={() => openTaxonomySheet('exam', 'Select Exam', exams, editData.examIds?.[0] || '', (v) => setEditData(prev => ({...prev, examIds: [v]})))} 
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200/60 dark:border-slate-800 shadow-sm bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-indigo-100 dark:border-indigo-800/50 bg-indigo-50/80 dark:bg-indigo-900/20 py-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                                        <ListChecks className="w-4 h-4" />
                                    </div>
                                    <CardTitle className="text-base text-slate-800 dark:text-slate-100">Questions ({editData.questionIds?.length || 0})</CardTitle>
                                </div>
                                <div className="flex gap-2">
                                    {editData.id && editData.questionIds && editData.questionIds.length > 0 && collectionPath && (
                                        <Button size="icon" variant="outline" title="Print Answer Sheet" className="h-9 w-9 text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950" onClick={() => window.open(`/admin/assessment-center/${collectionPath}/${editData.id}/answer-sheet`, '_blank')}>
                                            <Printer className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Button size="icon" variant="outline" title="Import Questions" className="h-9 w-9" onClick={() => setShowImport(true)}>
                                        <Upload className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" title="Add Questions" className="h-9 w-9" onClick={() => setShowPicker(true)}>
                                        <ListPlus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {(!editData.questionIds || editData.questionIds.length === 0) ? (
                                    <div className="text-center py-8 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                                        No questions attached yet. Click 'Add Questions' to open the Question Bank.
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {editData.questionIds.map((id, idx) => (
                                            <div 
                                                key={id} 
                                                draggable
                                                onDragStart={() => handleDragStart(idx)}
                                                onDragEnter={() => handleDragEnter(idx)}
                                                onDragEnd={handleDragEnd}
                                                onDragOver={(e) => e.preventDefault()}
                                                className={`flex items-center justify-between p-3 border rounded shadow-sm transition-colors cursor-move hover:border-blue-400 dark:hover:border-blue-500 ${draggedIdx === idx ? 'opacity-50 border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}
                                            >
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <GripVertical className="text-slate-400 w-5 h-5 flex-shrink-0" />
                                                    <span className="font-medium text-slate-500 w-6 flex-shrink-0">{idx + 1}.</span>
                                                    <span className="text-sm font-mono text-slate-400 dark:text-slate-500 flex-shrink-0 w-24 truncate">{id}</span>
                                                    <span className="text-sm text-slate-700 dark:text-slate-300 truncate line-clamp-1 ml-2 flex-1">
                                                        {questionPreviews[id] ? questionPreviews[id] : <span className="text-slate-400 dark:text-slate-500 italic">Loading preview...</span>}
                                                    </span>
                                                </div>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="text-red-500 h-8 w-8 p-0 flex-shrink-0 ml-4 hover:bg-red-50 dark:hover:bg-red-900/30"
                                                    onClick={() => setEditData({...editData, questionIds: editData.questionIds?.filter(qid => qid !== id)})}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="border-slate-200/60 dark:border-slate-800 shadow-sm bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl overflow-hidden">
                            <CardHeader className="border-b border-orange-100 dark:border-orange-800/50 bg-orange-50/80 dark:bg-orange-900/20 py-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400">
                                        <Settings className="w-4 h-4" />
                                    </div>
                                    <CardTitle className="text-base text-slate-800 dark:text-slate-100">Exam Configuration</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/50 mb-4">
                                    <div className="space-y-0.5">
                                        <label className="text-sm font-medium text-blue-900 dark:text-blue-100 flex items-center gap-2">
                                            <Wand2 className="h-4 w-4" /> Auto-Calculate
                                        </label>
                                        <p className="text-xs text-blue-700 dark:text-blue-300">Automatically sync marks and duration based on questions.</p>
                                    </div>
                                    <Switch checked={autoCalc} onCheckedChange={setAutoCalc} />
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Status</label>
                                    <Select value={editData.status || 'Draft'} onValueChange={v => setEditData({...editData, status: v as any})}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Published">Published</SelectItem>
                                            <SelectItem value="Draft">Draft</SelectItem>
                                            <SelectItem value="Archived">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Difficulty</label>
                                        <Select value={editData.difficulty || 'Hard'} onValueChange={v => setEditData({...editData, difficulty: v as any})}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Easy">Easy</SelectItem>
                                                <SelectItem value="Medium">Medium</SelectItem>
                                                <SelectItem value="Hard">Hard</SelectItem>
                                                <SelectItem value="Expert">Expert</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Language</label>
                                        <Select value={editData.language || 'English'} onValueChange={v => setEditData({...editData, language: v})}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="English">English</SelectItem>
                                                <SelectItem value="Bengali">Bengali</SelectItem>
                                                <SelectItem value="Hindi">Hindi</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Duration (Min)</label>
                                        <Input type="number" value={editData.durationMin || ''} onChange={e => setEditData({...editData, durationMin: e.target.value === '' ? undefined : parseInt(e.target.value)})} disabled={autoCalc} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Total Marks</label>
                                        <Input type="number" value={editData.totalMarks || ''} onChange={e => setEditData({...editData, totalMarks: e.target.value === '' ? undefined : parseInt(e.target.value)})} disabled={autoCalc} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Pass Marks</label>
                                        <Input type="number" value={editData.passingMarks || ''} onChange={e => setEditData({...editData, passingMarks: e.target.value === '' ? undefined : parseInt(e.target.value)})} disabled={autoCalc} />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium">Negative Marking</label>
                                            <Switch 
                                                checked={editData.negativeMarking !== undefined && editData.negativeMarking > 0} 
                                                onCheckedChange={c => setEditData({...editData, negativeMarking: c ? 0.25 : 0})} 
                                            />
                                        </div>
                                        {editData.negativeMarking !== undefined && editData.negativeMarking > 0 && (
                                            <Input type="number" step="0.01" value={editData.negativeMarking ?? ''} onChange={e => setEditData({...editData, negativeMarking: e.target.value === '' ? 0 : parseFloat(e.target.value)})} placeholder="e.g. 0.25" />
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Attempts Allowed</label>
                                        <Input type="number" value={editData.attemptsAllowed ?? 1} onChange={e => setEditData({...editData, attemptsAllowed: e.target.value === '' ? undefined : parseInt(e.target.value)})} />
                                        <p className="text-xs text-slate-500 mt-1">0 for unlimited, 1 for strict.</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Total Attempts (Display)</label>
                                        <Input type="number" value={editData.attemptCount ?? 0} onChange={e => setEditData({...editData, attemptCount: e.target.value === '' ? undefined : parseInt(e.target.value)})} />
                                        <p className="text-xs text-slate-500 mt-1">Override total attempts shown.</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-4 pt-4 border-t">
                                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">Advanced Settings</h4>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <label className="text-sm font-medium">Strict Anti-Cheat Mode</label>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Enforces fullscreen and terminates on exit</p>
                                        </div>
                                        <Switch 
                                            checked={editData.isStrictMode !== false} 
                                            onCheckedChange={c => setEditData({...editData, isStrictMode: c})} 
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <label className="text-sm font-medium">Shuffle Questions</label>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Randomize question order for each student</p>
                                        </div>
                                        <Switch 
                                            checked={!!editData.shuffleQuestions} 
                                            onCheckedChange={c => setEditData({...editData, shuffleQuestions: c})} 
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <label className="text-sm font-medium">Shuffle Options</label>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Randomize MCQ options for each student</p>
                                        </div>
                                        <Switch 
                                            checked={!!editData.shuffleOptions} 
                                            onCheckedChange={c => setEditData({...editData, shuffleOptions: c})} 
                                        />
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium">Access Type</label>
                                            <Select value={editData.accessType || 'free'} onValueChange={v => setEditData({...editData, accessType: v as any})}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="free">Free for Everyone</SelectItem>
                                                    <SelectItem value="subscription">Subscription Only</SelectItem>
                                                    <SelectItem value="one_time">One-Time Purchase Only</SelectItem>
                                                    <SelectItem value="both">Subscription or One-Time Purchase</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {(editData.accessType === 'subscription' || editData.accessType === 'both') && (
                                            <div className="space-y-2 pt-1 border-t">
                                                <label className="text-sm font-medium">Included in Pass Plan?</label>
                                                <div className="flex gap-2 items-center">
                                                    <Button
                                                        type="button"
                                                        variant={editData.allowedSubscriptionPlans?.includes('pass') ? 'default' : 'outline'}
                                                        size="sm"
                                                        onClick={() => {
                                                            const plans = editData.allowedSubscriptionPlans || [];
                                                            if (plans.includes('pass')) setEditData({...editData, allowedSubscriptionPlans: plans.filter(p => p !== 'pass')});
                                                            else setEditData({...editData, allowedSubscriptionPlans: [...plans, 'pass']});
                                                        }}
                                                    >
                                                        Pass Plan
                                                    </Button>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-1">
                                                    (Note: Pro Plan users automatically get access to all mock tests, so you don't need to select them here.)
                                                </p>
                                            </div>
                                        )}

                                        {(editData.accessType === 'one_time' || editData.accessType === 'both') && (
                                            <div className="pt-1 border-t">
                                                <label className="text-sm font-medium">Price (₹)</label>
                                                <Input type="number" value={editData.price || 0} onChange={e => setEditData({...editData, price: e.target.value === '' ? undefined : parseFloat(e.target.value)})} className="mt-1" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Button className="w-full mt-4" onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <PlusCircle className="h-4 w-4 mr-2" />}
                                    Save Mock Test
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <QuestionPickerModal 
                    open={showPicker} 
                    onOpenChange={setShowPicker} 
                    onSelectQuestions={handleQuestionsSelected}
                    preSelectedIds={editData.questionIds || []}
                    initialFilters={{
                        ...(editData.boardId ? { boardId: editData.boardId } : {}),
                        ...(editData.classId ? { classId: editData.classId } : {}),
                        ...(editData.subjectId ? { subjectId: editData.subjectId } : {}),
                        ...(editData.textbookId ? { textbookId: editData.textbookId } : {}),
                        ...(editData.chapterId ? { chapterId: editData.chapterId } : {}),
                        ...(editData.topicId ? { topicId: editData.topicId } : {})
                    }}
                />

                <QuestionImportModal
                    open={showImport}
                    onOpenChange={setShowImport}
                    onImportComplete={(newIds) => {
                        setEditData(prev => ({
                            ...prev,
                            questionIds: [...(prev.questionIds || []), ...newIds]
                        }));
                        setShowImport(false);
                    }}
                />


                <Dialog open={taxonomySheet.isOpen} onOpenChange={(open) => setTaxonomySheet({...taxonomySheet, isOpen: open})}>
                    <DialogContent className="sm:max-w-[540px] h-[80vh] flex flex-col p-0 bg-white dark:bg-slate-900 overflow-hidden">
                        <DialogHeader className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0">
                            <DialogTitle className="text-lg text-slate-800 dark:text-slate-100">{taxonomySheet.title}</DialogTitle>
                            <div className="relative mt-2">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                                <Input 
                                    className="pl-9 bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700 focus-visible:ring-slate-500" 
                                    placeholder={`Search ${taxonomySheet.type}...`}
                                    value={sheetSearch}
                                    onChange={e => setSheetSearch(e.target.value)}
                                />
                            </div>
                        </DialogHeader>
                        <div className="flex-1 overflow-y-auto p-2">
                            <div className="space-y-1">
                                {taxonomySheet.items
                                    .filter(item => {
                                        const displayName = (item as any).acronym || item.name;
                                        return displayName && String(displayName).trim() !== '';
                                    })
                                    .filter(item => item.name.toLowerCase().includes(sheetSearch.toLowerCase()) || (item as any).acronym?.toLowerCase().includes(sheetSearch.toLowerCase()))
                                    .map(item => (
                                    <button 
                                        key={item.id} 
                                        onClick={() => {
                                            taxonomySheet.onSelect(item.id);
                                            setTaxonomySheet({...taxonomySheet, isOpen: false});
                                        }}
                                        className={cn(
                                            "w-full flex items-center justify-between p-3 rounded-md text-sm text-left transition-colors",
                                            taxonomySheet.value === item.id ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100 font-semibold" : "hover:bg-slate-50 text-slate-600 dark:hover:bg-slate-800 dark:text-slate-400"
                                        )}
                                    >
                                        <span>
                                            {(item as any).acronym || item.name}
                                        </span>
                                        {taxonomySheet.value === item.id && <CheckCircle2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />}
                                    </button>
                                ))}
                                {taxonomySheet.items
                                    .filter(item => {
                                        const displayName = (item as any).acronym || item.name;
                                        return displayName && String(displayName).trim() !== '';
                                    })
                                    .filter(item => item.name.toLowerCase().includes(sheetSearch.toLowerCase()) || (item as any).acronym?.toLowerCase().includes(sheetSearch.toLowerCase())).length === 0 && (
                                    <div className="text-center p-4 text-slate-500 dark:text-slate-400 text-sm">No items found matching "{sheetSearch}".</div>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        );
}
