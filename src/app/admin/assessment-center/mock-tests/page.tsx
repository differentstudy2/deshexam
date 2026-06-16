'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PlusCircle, Pencil, Trash2, ArrowLeft, Loader2, ListPlus, Copy, GripVertical, Sparkles, Upload, Link as LinkIcon, Image as ImageIcon, Wand2, Check, ChevronDown, Search, CheckCircle2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { MockTest } from '@/lib/assessment-types';
import { getAssessments, saveAssessment, deleteAssessment } from '@/lib/firebase/assessment';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase/client';
import { QuestionPickerModal } from '@/components/assessment/QuestionPickerModal';
import { QuestionBankEntry, TaxonomyNode } from '@/lib/question-bank-types';
import { getQuestionsByIds } from '@/lib/firebase/question-bank';
import { getTaxonomyNodesByTrack } from '@/lib/firebase/taxonomy';
import { cn } from '@/lib/utils';
import { generateMockTestMetadata, generateImagePrompt, generateImageWithGemini } from './actions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const MD3SelectField = ({ label, value, placeholder, onClick, required }: { label: string, value: string, placeholder: string, onClick: () => void, required?: boolean }) => (
    <div onClick={onClick} className="relative border border-slate-200 rounded-lg p-2 pt-3 cursor-pointer hover:bg-slate-50 transition-colors bg-white">
        <label className="absolute top-0 left-2 -translate-y-1/2 bg-white px-1 text-[10px] font-medium text-slate-500 pointer-events-none">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex items-center justify-between min-h-[16px] mt-0.5">
            <span className={cn("text-sm font-medium", value ? "text-slate-900" : "text-slate-400")}>{value || placeholder}</span>
            <ChevronDown className="h-4 w-4 text-slate-400" />
        </div>
    </div>
);

export default function MockTestsPage() {
    const { toast } = useToast();
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [mockTests, setMockTests] = useState<MockTest[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [showAIDialog, setShowAIDialog] = useState(false);
    const [aiTopic, setAiTopic] = useState('');
    
    const [editData, setEditData] = useState<Partial<MockTest>>({});
    
    // Question Picker State
    const [showPicker, setShowPicker] = useState(false);
    
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
        if (view === 'editor' && editData.questionIds && editData.questionIds.length > 0) {
            const idsToFetch = editData.questionIds.filter(id => !questionPreviews[id]);
            if (idsToFetch.length > 0) {
                getQuestionsByIds(idsToFetch).then(questions => {
                    const newMap = { ...questionPreviews };
                    questions.forEach(q => newMap[q.id] = q.questionText);
                    setQuestionPreviews(newMap);
                }).catch(console.error);
            }
        }
    }, [editData.questionIds, view]);

    useEffect(() => {
        fetchMockTests();
    }, []);

    const fetchMockTests = async () => {
        setLoading(true);
        try {
            const data = await getAssessments('mockTests');
            setMockTests(data as MockTest[]);
        } catch (error) {
            console.error(error);
            toast({ title: 'Error fetching mock tests', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEditData({
            title: '',
            slug: '',
            description: '',
            questionIds: [],
            difficulty: 'Hard',
            status: 'Draft',
            durationMin: 60,
            totalMarks: 100,
            negativeMarking: 0.25,
            passingMarks: 40,
            attemptsAllowed: 1, // Strict for mock tests usually
            instructions: '',
            examRules: '',
            isStrictMode: true,
            shuffleQuestions: false,
            shuffleOptions: false,
            accessType: 'free',
            allowedSubscriptionPlans: [],
            price: 0
        });
    };

    const handleEdit = (test: MockTest) => {
        setEditData(test);
        setView('editor');
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this mock test?')) return;
        try {
            await deleteAssessment('mockTests', id);
            toast({ title: 'Mock test deleted' });
            fetchMockTests();
        } catch(e) {
            toast({ title: 'Delete failed', variant: 'destructive' });
        }
    };

    const handleClone = async (test: MockTest) => {
        setIsSaving(true);
        try {
            const newId = `mt_${Date.now()}`;
            const newTitle = `Copy of ${test.title}`;
            const newSlug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            
            const clonedTest: MockTest = {
                ...test,
                id: newId,
                title: newTitle,
                slug: newSlug,
                status: 'Draft',
                createdAt: undefined,
                updatedAt: undefined
            };
            
            await saveAssessment('mockTests', newId, clonedTest);
            toast({ title: 'Mock test cloned successfully' });
            fetchMockTests();
        } catch(e) {
            toast({ title: 'Clone failed', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

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
            const id = editData.id || `mt_${Date.now()}`;
            const slug = editData.slug || editData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            
            const dataToSave = {
                ...editData,
                id,
                slug,
                questionIds: editData.questionIds || [],
                status: editData.status || 'Draft',
                difficulty: editData.difficulty || 'Hard'
            };
            const cleanData = JSON.parse(JSON.stringify(dataToSave));
            
            await saveAssessment('mockTests', id, cleanData);
            
            toast({ title: 'Saved successfully' });
            setView('list');
            fetchMockTests();
        } catch(e) {
            toast({ title: 'Save failed', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleAIGenerate = () => {
        setAiTopic('');
        setShowAIDialog(true);
    };

    const confirmAIGenerate = async () => {
        if (!aiTopic.trim()) return;

        setIsGeneratingAI(true);
        setShowAIDialog(false);
        try {
            const res = await generateMockTestMetadata(aiTopic);
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

    if (view === 'editor') {
        return (
            <div className="p-6 max-w-5xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => setView('list')}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
                    <h1 className="text-2xl font-bold">{editData.id ? 'Edit Mock Test' : 'Create Mock Test'}</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Basic Details</CardTitle>
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
                                    <Input value={editData.slug || ''} onChange={e => setEditData({...editData, slug: e.target.value})} placeholder="wbcs-prelims-mock-1" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Description</label>
                                    <Textarea value={editData.description || ''} onChange={e => setEditData({...editData, description: e.target.value})} rows={2} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Instructions for Students</label>
                                    <Textarea value={editData.instructions || ''} onChange={e => setEditData({...editData, instructions: e.target.value})} rows={3} placeholder="Read carefully before starting..." />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><ImageIcon className="w-5 h-5 text-slate-500" /> Feature Image</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {editData.thumbnail && (
                                    <div className="relative w-full h-48 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={editData.thumbnail} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                                        <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => setEditData({...editData, thumbnail: ''})}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                                
                                <Tabs defaultValue="upload" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="upload" className="flex items-center gap-2"><Upload className="w-4 h-4"/> Upload</TabsTrigger>
                                        <TabsTrigger value="url" className="flex items-center gap-2"><LinkIcon className="w-4 h-4"/> URL</TabsTrigger>
                                        <TabsTrigger value="ai" className="flex items-center gap-2 text-purple-600"><Wand2 className="w-4 h-4"/> AI Generate</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="upload" className="pt-4 space-y-4">
                                        <div className="flex items-center gap-4">
                                            <Input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} disabled={isUploading} className="flex-1" />
                                            {isUploading && <Loader2 className="w-5 h-5 animate-spin text-blue-600" />}
                                        </div>
                                        {isUploading && (
                                            <div className="w-full bg-slate-100 rounded-full h-2">
                                                <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                            </div>
                                        )}
                                    </TabsContent>
                                    <TabsContent value="url" className="pt-4">
                                        <Input 
                                            placeholder="Paste image URL here..." 
                                            value={editData.thumbnail || ''} 
                                            onChange={(e) => setEditData({...editData, thumbnail: e.target.value})}
                                        />
                                    </TabsContent>
                                    <TabsContent value="ai" className="pt-4 space-y-4 bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                                        <p className="text-sm text-slate-600 mb-2">Let Gemini generate a stunning feature image prompt based on your test title and description.</p>
                                        
                                        {!aiImagePrompt ? (
                                            <Button onClick={handleGenerateImagePrompt} disabled={isGeneratingImagePrompt || !editData.title} className="w-full bg-purple-600 hover:bg-purple-700">
                                                {isGeneratingImagePrompt ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                                                Generate Prompt Idea
                                            </Button>
                                        ) : (
                                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-slate-500 uppercase">Image Prompt</label>
                                                    <Textarea 
                                                        value={aiImagePrompt} 
                                                        onChange={(e) => setAiImagePrompt(e.target.value)} 
                                                        rows={4} 
                                                        className="text-sm leading-relaxed"
                                                    />
                                                </div>
                                                <div className="flex gap-3">
                                                    <Button variant="outline" className="flex-1" onClick={() => {
                                                        navigator.clipboard.writeText(aiImagePrompt);
                                                        toast({ title: "Prompt copied to clipboard!" });
                                                    }}>
                                                        <Copy className="w-4 h-4 mr-2" /> Copy Prompt
                                                    </Button>
                                                    <Button 
                                                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" 
                                                        onClick={handleGenerateImage} 
                                                        disabled={isGeneratingImage}
                                                    >
                                                        {isGeneratingImage ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                                                        Generate & Apply
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base text-slate-800">Content Mapping (Taxonomy)</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <MD3SelectField 
                                        label="Board" 
                                        placeholder="Board" 
                                        value={boards.find(b => b.id === editData.boardId)?.name || ''} 
                                        onClick={() => openTaxonomySheet('board', 'Select Board', boards, editData.boardId || '', (v) => setEditData({...editData, boardId: v, classId: '', subjectId: '', textbookId: '', chapterId: '', topicId: ''}))} 
                                    />
                                    <MD3SelectField 
                                        label="Class" 
                                        placeholder="Class" 
                                        value={classes.find(b => b.id === editData.classId)?.name || ''} 
                                        onClick={() => openTaxonomySheet('class', 'Select Class', classes.filter(b => !editData.boardId || b.parentId === editData.boardId), editData.classId || '', (v) => setEditData({...editData, classId: v, subjectId: '', textbookId: '', chapterId: '', topicId: ''}))} 
                                    />
                                </div>
                                <MD3SelectField 
                                    label="Subject" 
                                    placeholder="Subject" 
                                    value={subjects.find(b => b.id === editData.subjectId)?.name || ''} 
                                    onClick={() => openTaxonomySheet('subject', 'Select Subject', subjects.filter(b => !editData.classId || b.parentId === editData.classId), editData.subjectId || '', (v) => setEditData({...editData, subjectId: v, textbookId: '', chapterId: '', topicId: ''}))} 
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <MD3SelectField 
                                        label="Textbook" 
                                        placeholder="Textbook" 
                                        value={textbooks.find(b => b.id === editData.textbookId)?.name || ''} 
                                        onClick={() => openTaxonomySheet('textbook', 'Select Textbook', textbooks.filter(b => !editData.subjectId || b.parentId === editData.subjectId), editData.textbookId || '', (v) => setEditData({...editData, textbookId: v, chapterId: '', topicId: ''}))} 
                                    />
                                    <MD3SelectField 
                                        label="Chapter" 
                                        placeholder="Chapter" 
                                        value={chapters.find(b => b.id === editData.chapterId)?.name || ''} 
                                        onClick={() => openTaxonomySheet('chapter', 'Select Chapter', chapters.filter(b => !editData.textbookId || b.parentId === editData.textbookId), editData.chapterId || '', (v) => setEditData({...editData, chapterId: v, topicId: ''}))} 
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <MD3SelectField 
                                        label="Topic" 
                                        placeholder="Topic" 
                                        value={topics.find(b => b.id === editData.topicId)?.name || ''} 
                                        onClick={() => openTaxonomySheet('topic', 'Select Topic', topics.filter(b => !editData.chapterId || b.parentId === editData.chapterId), editData.topicId || '', (v) => setEditData({...editData, topicId: v}))} 
                                    />
                                    <MD3SelectField 
                                        label="Competitive Exam" 
                                        placeholder="Select Exam" 
                                        value={exams.find(b => b.id === (editData.examIds?.[0] || ''))?.name || ''} 
                                        onClick={() => openTaxonomySheet('exam', 'Select Exam', exams, editData.examIds?.[0] || '', (v) => setEditData({...editData, examIds: [v]}))} 
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-4">
                                <CardTitle>Questions ({editData.questionIds?.length || 0})</CardTitle>
                                <Button size="sm" onClick={() => setShowPicker(true)}>
                                    <ListPlus className="h-4 w-4 mr-2" /> Add Questions
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {(!editData.questionIds || editData.questionIds.length === 0) ? (
                                    <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed">
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
                                                className={`flex items-center justify-between p-3 border rounded shadow-sm transition-colors cursor-move hover:border-blue-400 ${draggedIdx === idx ? 'opacity-50 border-blue-500 bg-blue-50' : 'bg-white border-slate-200'}`}
                                            >
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <GripVertical className="text-slate-400 w-5 h-5 flex-shrink-0" />
                                                    <span className="font-medium text-slate-500 w-6 flex-shrink-0">{idx + 1}.</span>
                                                    <span className="text-sm font-mono text-slate-400 flex-shrink-0 w-24 truncate">{id}</span>
                                                    <span className="text-sm text-slate-700 truncate line-clamp-1 ml-2 flex-1">
                                                        {questionPreviews[id] ? questionPreviews[id] : <span className="text-slate-400 italic">Loading preview...</span>}
                                                    </span>
                                                </div>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="text-red-500 h-8 w-8 p-0 flex-shrink-0 ml-4 hover:bg-red-50"
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
                        <Card>
                            <CardHeader><CardTitle>Exam Configuration</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
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
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Duration (Min)</label>
                                        <Input type="number" value={editData.durationMin || ''} onChange={e => setEditData({...editData, durationMin: parseInt(e.target.value)})} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Total Marks</label>
                                        <Input type="number" value={editData.totalMarks || ''} onChange={e => setEditData({...editData, totalMarks: parseInt(e.target.value)})} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Pass Marks</label>
                                        <Input type="number" value={editData.passingMarks || ''} onChange={e => setEditData({...editData, passingMarks: parseInt(e.target.value)})} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Negative Mark</label>
                                        <Input type="number" step="0.25" value={editData.negativeMarking ?? ''} onChange={e => setEditData({...editData, negativeMarking: parseFloat(e.target.value)})} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Attempts Allowed</label>
                                    <Input type="number" value={editData.attemptsAllowed ?? 1} onChange={e => setEditData({...editData, attemptsAllowed: parseInt(e.target.value)})} />
                                    <p className="text-xs text-slate-500 mt-1">Set 0 for unlimited, 1 for strict simulation.</p>
                                </div>
                                
                                <div className="space-y-4 pt-4 border-t">
                                    <h4 className="font-semibold text-slate-900">Advanced Settings</h4>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <label className="text-sm font-medium">Strict Anti-Cheat Mode</label>
                                            <p className="text-xs text-slate-500">Enforces fullscreen and terminates on exit</p>
                                        </div>
                                        <Switch 
                                            checked={editData.isStrictMode !== false} 
                                            onCheckedChange={c => setEditData({...editData, isStrictMode: c})} 
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <label className="text-sm font-medium">Shuffle Questions</label>
                                            <p className="text-xs text-slate-500">Randomize question order for each student</p>
                                        </div>
                                        <Switch 
                                            checked={!!editData.shuffleQuestions} 
                                            onCheckedChange={c => setEditData({...editData, shuffleQuestions: c})} 
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <label className="text-sm font-medium">Shuffle Options</label>
                                            <p className="text-xs text-slate-500">Randomize MCQ options for each student</p>
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
                                                <p className="text-xs text-slate-500 italic mt-1">
                                                    (Note: Pro Plan users automatically get access to all mock tests, so you don't need to select them here.)
                                                </p>
                                            </div>
                                        )}

                                        {(editData.accessType === 'one_time' || editData.accessType === 'both') && (
                                            <div className="pt-1 border-t">
                                                <label className="text-sm font-medium">Price (₹)</label>
                                                <Input type="number" value={editData.price || 0} onChange={e => setEditData({...editData, price: parseFloat(e.target.value)})} className="mt-1" />
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
                />

                <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Auto-Generate with AI</DialogTitle>
                            <DialogDescription>
                                Enter a topic and Gemini will write an SEO-optimized title, slug, meta description, and student instructions for you.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <label className="text-sm font-medium mb-2 block">Topic / Subject</label>
                            <Input 
                                placeholder="E.g., SSC CGL Tier 1 Full Mock, WBCS History..." 
                                value={aiTopic}
                                onChange={(e) => setAiTopic(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowAIDialog(false)}>Cancel</Button>
                            <Button onClick={confirmAIGenerate} disabled={!aiTopic.trim() || isGeneratingAI}>
                                <Sparkles className="h-4 w-4 mr-2" /> Generate
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                <Sheet open={taxonomySheet.isOpen} onOpenChange={(open) => setTaxonomySheet({...taxonomySheet, isOpen: open})}>
                    <SheetContent side="right" className="w-[400px] sm:w-[540px] flex flex-col p-0 bg-white">
                        <SheetHeader className="p-4 border-b border-slate-100 bg-slate-50 shrink-0">
                            <SheetTitle className="text-lg text-slate-800">{taxonomySheet.title}</SheetTitle>
                            <div className="relative mt-2">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                <Input 
                                    className="pl-9 bg-white border-slate-200 focus-visible:ring-slate-500" 
                                    placeholder={`Search ${taxonomySheet.type}...`}
                                    value={sheetSearch}
                                    onChange={e => setSheetSearch(e.target.value)}
                                />
                            </div>
                        </SheetHeader>
                        <div className="flex-1 overflow-y-auto p-2">
                            <div className="space-y-1">
                                {taxonomySheet.items
                                    .filter(item => item.name.toLowerCase().includes(sheetSearch.toLowerCase()))
                                    .map(item => (
                                    <button 
                                        key={item.id} 
                                        onClick={() => {
                                            taxonomySheet.onSelect(item.id);
                                            setTaxonomySheet({...taxonomySheet, isOpen: false});
                                        }}
                                        className={cn(
                                            "w-full flex items-center justify-between p-3 rounded-md text-sm text-left transition-colors",
                                            taxonomySheet.value === item.id ? "bg-slate-100 text-slate-900 font-semibold" : "hover:bg-slate-50 text-slate-600"
                                        )}
                                    >
                                        {item.name}
                                        {taxonomySheet.value === item.id && <CheckCircle2 className="w-4 h-4 text-slate-700" />}
                                    </button>
                                ))}
                                {taxonomySheet.items.filter(item => item.name.toLowerCase().includes(sheetSearch.toLowerCase())).length === 0 && (
                                    <div className="text-center p-4 text-slate-500 text-sm">No items found matching "{sheetSearch}".</div>
                                )}
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Mock Tests</h1>
                <Button onClick={() => { resetForm(); setView('editor'); }}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Mock Test
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Mock Tests</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Marks</TableHead>
                                <TableHead>Questions</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={6}><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
                            ) : mockTests.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="text-center">No mock tests found.</TableCell></TableRow>
                            ) : (
                                mockTests.map(test => (
                                    <TableRow key={test.id}>
                                        <TableCell className="font-medium">{test.title}</TableCell>
                                        <TableCell>{test.durationMin} min</TableCell>
                                        <TableCell>{test.totalMarks}</TableCell>
                                        <TableCell>{test.questionIds?.length || 0}</TableCell>
                                        <TableCell>{test.status}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(test)} title="Edit"><Pencil className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleClone(test)} title="Clone"><Copy className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(test.id)} title="Delete"><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
