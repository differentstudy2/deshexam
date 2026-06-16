'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Pencil, Trash2, ArrowLeft, Loader2, ListPlus, ExternalLink, ImageIcon, LinkIcon, Upload, Wand2, Sparkles, Copy } from 'lucide-react';
import { getAssessmentsByNode, saveAssessment, deleteAssessment, AssessmentCollectionType } from '@/lib/firebase/assessment';
import { getTopicHierarchy } from '@/lib/firebase/guide';
import { QuestionPickerModal } from '@/components/assessment/QuestionPickerModal';
import { QuestionBankEntry } from '@/lib/question-bank-types';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { storage } from '@/lib/firebase/client';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

interface TopicAssessmentManagerProps { topicId: string; tabType: string; nodeLevel?: 'chapter' | 'topic'; }

export function TopicAssessmentManager({ topicId, tabType, nodeLevel = 'topic' }: TopicAssessmentManagerProps) {
  const { toast } = useToast();
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hierarchy, setHierarchy] = useState<any>(null);
  const [editData, setEditData] = useState<any>({});
  const [showPicker, setShowPicker] = useState(false);

  // Feature Image States
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [aiImagePrompt, setAiImagePrompt] = useState('');
  const [isGeneratingImagePrompt, setIsGeneratingImagePrompt] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const mapTabToCollection = (tab: string): AssessmentCollectionType => {
    if (tab === 'practice_sets') return 'practiceSets';
    if (tab === 'quizzes') return 'quizzes';
    if (tab === 'mock_tests' || tab === 'model_test') return 'mockTests';
    if (tab === 'exams_papers') return 'examPapers';
    return 'practiceSets';
  };
  const collectionName = mapTabToCollection(tabType);

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      console.log(`[DEBUG] TopicAssessmentManager fetching for tabType=${tabType}, collectionName=${collectionName}, topicId=${topicId}, nodeLevel=${nodeLevel}`);
      const data = await getAssessmentsByNode(collectionName, nodeLevel, topicId);
      console.log(`[DEBUG] Fetched data:`, data);
      setAssessments(data);
    } catch (e) { 
      console.error(e);
      toast({ title: 'Error fetching', variant: 'destructive' }); 
    }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchAssessments();
    setView('list');
    getTopicHierarchy(topicId).then(setHierarchy);
  }, [topicId, tabType]);

  const resetForm = () => setEditData({ title: '', slug: '', description: '', questionIds: [], difficulty: 'Medium', status: 'Published', topicId, estimatedTimeMin: 15, timeLimitMin: 15, passingScorePercent: 40, durationMin: 60, totalMarks: 100 });

  const handleEdit = (item: any) => { setEditData(item); setView('editor'); };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this assessment?')) return;
    try { await deleteAssessment(collectionName, id); toast({ title: 'Deleted' }); fetchAssessments(); }
    catch { toast({ title: 'Delete failed', variant: 'destructive' }); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const storageRef = ref(storage, `assessments/thumbnails/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload error", error);
          toast({ title: 'Upload failed', variant: 'destructive' });
          setIsUploading(false);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          setEditData((prev: any) => ({ ...prev, thumbnail: url }));
          setIsUploading(false);
          setUploadProgress(0);
          toast({ title: 'Image uploaded successfully' });
        }
      );
    } catch (e) {
      console.error(e);
      setIsUploading(false);
    }
  };

  const handleGenerateImagePrompt = async () => {
    if (!editData.title) {
        toast({ title: "Please enter a test title first.", variant: "destructive" });
        return;
    }
    
    setIsGeneratingImagePrompt(true);
    try {
        const res = await fetch('/api/ai/generate-prompt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                title: editData.title,
                description: editData.description || 'A mock test for competitive exams'
            })
        });
        
        const data = await res.json();
        if (data.success) {
            setAiImagePrompt(data.prompt);
        } else {
            toast({ title: "Prompt generation failed", description: data.error, variant: "destructive" });
        }
    } catch(e) {
        toast({ title: "Prompt generation failed", variant: "destructive" });
    } finally {
        setIsGeneratingImagePrompt(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!aiImagePrompt) return;
    
    setIsGeneratingImage(true);
    try {
        const res = await fetch('/api/ai/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: aiImagePrompt })
        });
        
        const data = await res.json();
        if (data.success && data.imageUrl) {
            setEditData((prev: any) => ({ ...prev, thumbnail: data.imageUrl }));
            toast({ title: "Image generated and applied!" });
        } else {
            toast({ title: "Image generation failed", description: data.error || "No image returned", variant: "destructive" });
        }
    } catch(e) {
        toast({ title: "Image generation failed", variant: "destructive" });
    } finally {
        setIsGeneratingImage(false);
    }
  };

  const handleSave = async () => {
    if (!editData.title) { toast({ title: 'Title is required', variant: 'destructive' }); return; }
    setIsSaving(true);
    try {
      const id = editData.id || `${collectionName}_${Date.now()}`;
      const slug = editData.slug || editData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      await saveAssessment(collectionName, id, { ...editData, slug, questionIds: editData.questionIds || [], status: editData.status || 'Draft', difficulty: editData.difficulty || 'Medium', topicId, boardId: hierarchy?.boardId || '', classId: hierarchy?.classId || '', subjectId: hierarchy?.subjectId || '', textbookId: hierarchy?.textbookId || '', chapterId: hierarchy?.chapterId || '' });
      toast({ title: 'Saved!' });
      setView('list');
      fetchAssessments();
    } catch { toast({ title: 'Save failed', variant: 'destructive' }); }
    finally { setIsSaving(false); }
  };

  const DIFFICULTY_COLORS: Record<string, string> = { Easy: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30', Medium: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30', Hard: 'text-red-600 bg-red-50 dark:bg-red-900/30', Expert: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30' };
  const STATUS_COLORS: Record<string, string> = { Published: 'text-emerald-700 bg-emerald-50', Draft: 'text-slate-600 bg-slate-100', Archived: 'text-slate-400 bg-slate-50' };

  // ── Editor View ──
  if (view === 'editor') {
    return (
      <div className="space-y-3 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center gap-2">
          <button onClick={() => setView('list')} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
            <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white flex-1">{editData.id ? 'Edit' : 'Create'} {tabType.replace(/_/g, ' ')}</h3>
          <button onClick={handleSave} disabled={isSaving}
            className="px-4 py-1.5 text-xs font-bold rounded-full bg-[#107c41] text-white flex items-center gap-1.5 disabled:opacity-60">
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlusCircle className="w-3.5 h-3.5" />}
            Save
          </button>
        </div>

        {/* Basic Details */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Basic Details</p>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Title *</label>
            <Input className="h-9 text-sm" placeholder="e.g. Chapter 1 Mock Test" value={editData.title || ''} onChange={e => setEditData({ ...editData, title: e.target.value })} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Description</label>
            <Textarea className="text-sm resize-none" rows={2} value={editData.description || ''} onChange={e => setEditData({ ...editData, description: e.target.value })} />
          </div>
        </div>

        {/* Feature Image Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2"><ImageIcon className="w-3.5 h-3.5" /> Feature Image</p>
          
          {editData.thumbnail && (
              <div className="relative w-full h-40 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={editData.thumbnail} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                  <button className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-white/90 rounded-full hover:bg-red-50" onClick={() => setEditData({...editData, thumbnail: ''})}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
              </div>
          )}
          
          <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-9">
                  <TabsTrigger value="upload" className="flex items-center gap-2 text-[11px]"><Upload className="w-3.5 h-3.5"/> Upload</TabsTrigger>
                  <TabsTrigger value="url" className="flex items-center gap-2 text-[11px]"><LinkIcon className="w-3.5 h-3.5"/> URL</TabsTrigger>
                  <TabsTrigger value="ai" className="flex items-center gap-2 text-[11px] text-purple-600"><Wand2 className="w-3.5 h-3.5"/> AI Generate</TabsTrigger>
              </TabsList>
              <TabsContent value="upload" className="pt-2 space-y-2">
                  <div className="flex items-center gap-2">
                      <Input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} disabled={isUploading} className="flex-1 h-8 text-xs" />
                      {isUploading && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
                  </div>
                  {isUploading && (
                      <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
                          <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                  )}
              </TabsContent>
              <TabsContent value="url" className="pt-2">
                  <Input 
                      placeholder="Paste image URL here..." 
                      className="h-8 text-xs"
                      value={editData.thumbnail || ''} 
                      onChange={(e) => setEditData({...editData, thumbnail: e.target.value})}
                  />
              </TabsContent>
              <TabsContent value="ai" className="pt-2 space-y-3 bg-purple-50/50 p-3 rounded-lg border border-purple-100 mt-2">
                  <p className="text-[11px] text-slate-600">Let Gemini generate a stunning feature image prompt based on your test title.</p>
                  
                  {!aiImagePrompt ? (
                      <button onClick={handleGenerateImagePrompt} disabled={isGeneratingImagePrompt || !editData.title} className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-[11px] font-bold flex items-center justify-center disabled:opacity-50">
                          {isGeneratingImagePrompt ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5 mr-1.5" />}
                          Generate Prompt Idea
                      </button>
                  ) : (
                      <div className="space-y-3 animate-in fade-in">
                          <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Image Prompt</label>
                              <Textarea 
                                  value={aiImagePrompt} 
                                  onChange={(e) => setAiImagePrompt(e.target.value)} 
                                  rows={3} 
                                  className="text-[11px] leading-relaxed resize-none p-2"
                              />
                          </div>
                          <div className="flex gap-2">
                              <button className="flex-1 py-1.5 border border-slate-300 rounded text-[11px] font-bold flex items-center justify-center hover:bg-slate-50" onClick={() => {
                                  navigator.clipboard.writeText(aiImagePrompt);
                                  toast({ title: "Prompt copied!" });
                              }}>
                                  <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy
                              </button>
                              <button 
                                  className="flex-1 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded text-[11px] font-bold flex items-center justify-center disabled:opacity-50" 
                                  onClick={handleGenerateImage} 
                                  disabled={isGeneratingImage}
                              >
                                  {isGeneratingImage ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5" />}
                                  Generate & Apply
                              </button>
                          </div>
                      </div>
                  )}
              </TabsContent>
          </Tabs>
        </div>

        {/* Settings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Settings</p>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Status</label>
              <select className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-sm" value={editData.status || 'Draft'} onChange={e => setEditData({ ...editData, status: e.target.value })}>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Difficulty</label>
              <select className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-sm" value={editData.difficulty || 'Medium'} onChange={e => setEditData({ ...editData, difficulty: e.target.value })}>
                <option>Easy</option><option>Medium</option><option>Hard</option><option>Expert</option>
              </select>
            </div>
            {collectionName === 'practiceSets' && (
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Est. Time (min)</label>
                <Input type="number" className="h-9 text-sm" value={editData.estimatedTimeMin || ''} onChange={e => setEditData({ ...editData, estimatedTimeMin: parseInt(e.target.value) })} />
              </div>
            )}
            {collectionName === 'quizzes' && (
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Time Limit (min)</label>
                <Input type="number" className="h-9 text-sm" value={editData.timeLimitMin || ''} onChange={e => setEditData({ ...editData, timeLimitMin: parseInt(e.target.value) })} />
              </div>
            )}
            {collectionName === 'mockTests' && (
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Duration (min)</label>
                <Input type="number" className="h-9 text-sm" value={editData.durationMin || ''} onChange={e => setEditData({ ...editData, durationMin: parseInt(e.target.value) })} />
              </div>
            )}
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Questions ({editData.questionIds?.length || 0})</p>
            <button onClick={() => setShowPicker(true)} className="px-3 py-1 text-xs font-semibold rounded-full border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center gap-1">
              <ListPlus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
          {(!editData.questionIds || editData.questionIds.length === 0) ? (
            <div className="py-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-400">
              No questions attached yet. Tap "Add" to pick questions.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-[30vh] overflow-y-auto">
              {editData.questionIds.map((id: string, idx: number) => (
                <div key={id} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2">
                  <span className="text-xs font-bold text-slate-400 w-5">{idx + 1}.</span>
                  <span className="flex-1 text-xs text-slate-600 dark:text-slate-400 font-mono truncate">{id}</span>
                  <button onClick={() => setEditData({ ...editData, questionIds: editData.questionIds?.filter((qid: string) => qid !== id) })} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-100 dark:hover:bg-red-900/30">
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <QuestionPickerModal open={showPicker} onOpenChange={setShowPicker} onSelectQuestions={(qs: QuestionBankEntry[]) => { const newIds = qs.map(q => q.id); setEditData((p: any) => ({ ...p, questionIds: [...(p.questionIds || []), ...newIds] })); }} preSelectedIds={editData.questionIds || []} />
      </div>
    );
  }

  // ── List View ──
  const displayTab = tabType.replace(/_/g, ' ');
  const tabTitle = displayTab.endsWith('s') ? displayTab : displayTab + 's';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-slate-500 capitalize">{tabTitle}</p>
        <button onClick={() => { resetForm(); setView('editor'); }}
          className="px-3.5 py-1.5 text-xs font-bold rounded-full bg-[#107c41] text-white flex items-center gap-1.5">
          <PlusCircle className="w-3.5 h-3.5" /> Create New
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-[#107c41]" /></div>
      ) : assessments.length === 0 ? (
        <div className="flex flex-col items-center py-14 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
          <p className="text-sm text-slate-400 capitalize">No {tabTitle} yet</p>
          <button onClick={() => { resetForm(); setView('editor'); }} className="mt-3 px-4 py-2 text-xs font-semibold rounded-full bg-[#107c41] text-white">Create First</button>
        </div>
      ) : (
        <div className="space-y-2 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
          {assessments.map(set => (
            <div key={set.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm">
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate leading-tight">{set.title}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", DIFFICULTY_COLORS[set.difficulty] || DIFFICULTY_COLORS.Medium)}>{set.difficulty}</span>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", STATUS_COLORS[set.status] || STATUS_COLORS.Draft)}>{set.status}</span>
                    <span className="text-[10px] text-slate-400">{set.questionIds?.length || 0} Qs</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleEdit(set)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                    <Pencil className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                  <button onClick={() => handleDelete(set.id)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 dark:hover:bg-red-900/30">
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
