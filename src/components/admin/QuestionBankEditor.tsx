'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { QuestionBankEntry, TaxonomyNode } from '@/lib/question-bank-types';
import { Loader2, ArrowLeft, Sparkles, Play, Image as ImageIcon, Video, ShieldCheck, Upload, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { slugify, cn } from '@/lib/utils';
import { collection, getDocs } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase/client';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { createQuestion, updateQuestion } from '@/lib/firebase/question-bank';
import dynamic from 'next/dynamic';

const TiptapEditor = dynamic(() => import('@/components/admin/TiptapEditor').then(mod => mod.TiptapEditor), {
  ssr: false,
  loading: () => <div className="min-h-[200px] flex items-center justify-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md">Loading Editor...</div>
});

const QA_CHECKLIST_ITEMS = [
  'Answer Verified',
  'Syllabus Checked',
  'Explanation Reviewed',
  'Exam Pattern Verified',
  'Fact Checked',
  'Previous Year Source Verified',
  'Language Proofread'
];

const VERIFICATION_LEVELS = [
  'Academic Team Verified',
  'Subject Expert Verified',
  'Senior Teacher Verified',
  'Board Exam Specialist Verified',
  'University Faculty Verified',
  'Competitive Exam Expert Verified',
  'Question Review Committee Verified',
  'Content Team Reviewed',
  'Fact Checked',
  'Previous Year Question Verified',
  'Official Syllabus Verified',
  'Exam Pattern Verified',
  'Answer Key Verified',
  'Curriculum Verified',
  'Premium Verified Content'
];

export interface QuestionBankEditorProps {
  initialData: Partial<QuestionBankEntry>;
  onSaveComplete: () => void;
  onCancel: () => void;
}

export function QuestionBankEditor({ initialData, onSaveComplete, onCancel }: QuestionBankEditorProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [editData, setEditData] = useState<Partial<QuestionBankEntry>>({
      questionType: 'MCQ',
      difficulty: 'Medium',
      status: 'Published',
      language: 'English',
      options: { a: '', b: '', c: '', d: '', e: '' },
      matchingPairs: [{ left: '', right: '' }, { left: '', right: '' }, { left: '', right: '' }, { left: '', right: '' }],
      examIds: [],
      qaChecklist: [],
      ...initialData
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [uploadingPairImage, setUploadingPairImage] = useState<{idx: number, side: 'left'|'right'} | null>(null);

  // Taxonomies for dropdowns
  const [boards, setBoards] = useState<TaxonomyNode[]>([]);
  const [classes, setClasses] = useState<TaxonomyNode[]>([]);
  const [subjects, setSubjects] = useState<TaxonomyNode[]>([]);
  const [textbooks, setTextbooks] = useState<TaxonomyNode[]>([]);
  const [chapters, setChapters] = useState<TaxonomyNode[]>([]);
  const [topics, setTopics] = useState<TaxonomyNode[]>([]);
  const [exams, setExams] = useState<TaxonomyNode[]>([]);
  const [years, setYears] = useState<TaxonomyNode[]>([]);
  const [tags, setTags] = useState<TaxonomyNode[]>([]);

  useEffect(() => {
    // Only update if the ID changes to avoid overwriting ongoing edits
    setEditData(prev => ({
        ...initialData,
        id: initialData.id,
        options: initialData.options || { a: '', b: '', c: '', d: '', e: '' },
        matchingPairs: initialData.matchingPairs || [{ left: '', right: '' }, { left: '', right: '' }, { left: '', right: '' }, { left: '', right: '' }],
        tags: initialData.tags || [],
        examIds: initialData.examIds || [],
        qaChecklist: initialData.qaChecklist || []
    }));
  }, [initialData.id, initialData.boardId, initialData.classId, initialData.subjectId, initialData.textbookId, initialData.chapterId, initialData.topicId]);

  useEffect(() => {
    const fetchTaxonomies = async () => {
        const fetchGuideCol = async (colName: string) => {
            try {
                const snap = await getDocs(collection(db, colName));
                return snap.docs.map(d => {
                    const data = d.data();
                    return { id: d.id, name: data.title || data.name, ...data };
                });
            } catch(e) {
                return [];
            }
        };

        const fetchCombinedCol = async (guideCol: string, questionCol: string) => {
            const [g, q] = await Promise.all([fetchGuideCol(guideCol), fetchGuideCol(questionCol)]);
            const combined = [...g, ...q];
            return Array.from(new Map(combined.map(item => [item.id, item])).values());
        };

        const [b, c, s, t, ch, tp, ex, yr, tg] = await Promise.all([
            fetchCombinedCol('guide_boards', 'question_boards'),
            fetchCombinedCol('guide_classes', 'question_classes'),
            fetchCombinedCol('guide_subjects', 'question_subjects'),
            fetchCombinedCol('guide_textbooks', 'question_textbooks'),
            fetchCombinedCol('guide_chapters', 'question_chapters'),
            fetchCombinedCol('guide_topics', 'question_topics'),
            fetchGuideCol('question_exams'),
            fetchGuideCol('question_years'),
            fetchGuideCol('question_tags')
        ]);
        setBoards(b as TaxonomyNode[]); setClasses(c as TaxonomyNode[]); setSubjects(s as TaxonomyNode[]);
        setTextbooks(t as TaxonomyNode[]); setChapters(ch as TaxonomyNode[]); setTopics(tp as TaxonomyNode[]); setExams(ex as TaxonomyNode[]); setYears(yr as TaxonomyNode[]); setTags(tg as TaxonomyNode[]);
    };

    fetchTaxonomies();
  }, []);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'questionImage' | 'questionAudio' | 'questionVideo') => {
      const file = e.target.files?.[0];
      if (!file) return;
      setIsUploadingMedia(true);
      try {
          const folder = field === 'questionImage' ? 'images' : field === 'questionAudio' ? 'audio' : 'video';
          const storageRef = ref(storage, `questions/${folder}/${Date.now()}_${file.name}`);
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);
          setEditData(prev => ({ ...prev, [field]: url }));
          toast({ title: 'Success', description: 'File uploaded successfully' });
      } catch(e) {
          toast({ title: 'Upload Failed', variant: 'destructive' });
      } finally {
          setIsUploadingMedia(false);
      }
  };

  const handlePairImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number, side: 'left' | 'right') => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploadingPairImage({ idx, side });
      try {
          const storageRef = ref(storage, `questions/images/${Date.now()}_${file.name}`);
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);
          
          const newPairs = [...(editData.matchingPairs || [])];
          if (side === 'left') newPairs[idx].leftImage = url;
          else newPairs[idx].rightImage = url;
          
          setEditData(prev => ({ ...prev, matchingPairs: newPairs }));
          toast({ title: 'Success', description: 'Pair image uploaded successfully' });
      } catch(e) {
          toast({ title: 'Upload Failed', variant: 'destructive' });
      } finally {
          setUploadingPairImage(null);
      }
  };

  const handleDeletePairImage = async (url: string | undefined, idx: number, side: 'left' | 'right') => {
      // Optimistically update the UI
      const newPairs = [...(editData.matchingPairs || [])];
      if (side === 'left') newPairs[idx].leftImage = undefined;
      else newPairs[idx].rightImage = undefined;
      setEditData(prev => ({ ...prev, matchingPairs: newPairs }));

      // Only attempt to delete from Firebase if it's a Firebase Storage URL
      if (!url || !url.includes('firebasestorage.googleapis.com')) return;
      
      try {
          const fileRef = ref(storage, url);
          await deleteObject(fileRef);
      } catch (e) {
          console.error("Failed to delete image from Firebase", e);
      }
  };

  const handleDeleteMedia = async (url: string | undefined, field: 'questionImage' | 'questionAudio' | 'questionVideo') => {
      // Optimistically update the UI
      setEditData(prev => ({ ...prev, [field]: undefined }));

      // Only attempt to delete from Firebase if it's a Firebase Storage URL
      if (!url || !url.includes('firebasestorage.googleapis.com')) return;
      
      try {
          const fileRef = ref(storage, url);
          await deleteObject(fileRef);
          toast({ title: 'Media Deleted', description: 'Removed from Firebase storage.' });
      } catch (e) {
          console.error("Failed to delete media from Firebase", e);
      }
  };

  const handleSave = async () => {
      if (!editData.questionText) {
          toast({ title: 'Validation Error', description: 'Question Text is required.', variant: 'destructive' });
          return;
      }
      if (editData.questionType !== 'Matching' && !editData.correctAnswer) {
          toast({ title: 'Validation Error', description: 'Correct Answer is required.', variant: 'destructive' });
          return;
      }
      if (editData.questionType === 'Matching') {
          const validPairs = editData.matchingPairs?.filter(p => p.left && p.right) || [];
          if (validPairs.length === 0) {
              toast({ title: 'Validation Error', description: 'At least one matching pair is required.', variant: 'destructive' });
              return;
          }
          editData.matchingPairs = validPairs;
          editData.correctAnswer = validPairs.map((p, i) => `${i+1}. ${p.left} -> ${p.right}`).join('\n');
      }
      setIsSaving(true);
      try {
          const cleanText = (editData.questionText || '').replace(/<[^>]*>?/gm, '');
          const generatedSlug = editData.slug || slugify(editData.title || cleanText.substring(0, 50));
          const dataToSave = {
              ...editData,
              slug: generatedSlug,
          };
          
          if (dataToSave.id) {
              await updateQuestion(dataToSave.id, dataToSave as Partial<QuestionBankEntry>);
              toast({ title: 'Question updated successfully' });
          } else {
              dataToSave.id = `q_${Date.now()}`;
              await createQuestion(dataToSave as any);
              toast({ title: 'Question created successfully' });
          }
          onSaveComplete();
      } catch(e) {
          toast({ title: 'Error saving question', variant: 'destructive' });
      } finally {
          setIsSaving(false);
      }
  }

  const handleGenerateAI = async () => {
      if (!editData.questionText || !editData.correctAnswer) {
          toast({ title: 'AI Error', description: 'Question Text and Correct Answer are required for the AI to generate an explanation.', variant: 'destructive' });
          return;
      }
      setIsGeneratingAI(true);
      try {
          const res = await fetch('/api/ai/generate-explanation', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  questionText: editData.questionText,
                  options: editData.options,
                  correctAnswer: editData.correctAnswer
              })
          });
          const data = await res.json();
          if (data.explanation) {
              setEditData(prev => ({ ...prev, explanation: data.explanation }));
              toast({ title: 'Explanation Generated!' });
          } else {
              throw new Error(data.error || 'Failed to generate');
          }
      } catch (err: any) {
          toast({ title: 'AI Generation Failed', description: err.message, variant: 'destructive' });
      } finally {
          setIsGeneratingAI(false);
      }
  }

  return (
      <div className="p-0 max-w-5xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onCancel}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
              <h1 className="text-2xl font-bold tracking-tight">{editData.id ? 'Edit Question' : 'Create Question'}</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Editor */}
              <div className="md:col-span-2 space-y-6">
                  <Card>
                      <CardHeader><CardTitle>Content</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                          <div>
                              <label className="text-sm font-medium">Question Type *</label>
                              <Select value={editData.questionType || 'MCQ'} onValueChange={v => setEditData({...editData, questionType: v as any})}>
                                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="MCQ">MCQ</SelectItem>
                                      <SelectItem value="Multiple Choice">Multiple Choice</SelectItem>
                                      <SelectItem value="True/False">True/False</SelectItem>
                                      <SelectItem value="Fill in the Blank">Fill in the Blank</SelectItem>
                                      <SelectItem value="Matching">Matching</SelectItem>
                                      <SelectItem value="Creative Question">Creative Question</SelectItem>
                                      <SelectItem value="Short Question">Short Question</SelectItem>
                                      <SelectItem value="Long Question">Long Question</SelectItem>
                                  </SelectContent>
                              </Select>
                          </div>
                          <div>
                              <label className="text-sm font-medium">Title (Optional)</label>
                              <Input placeholder="E.g. Newton's First Law" value={editData.title || ''} onChange={e => setEditData({...editData, title: e.target.value})} />
                          </div>
                          <div>
                              <label className="text-sm font-medium">Question Text *</label>
                              <Textarea placeholder="What is the capital of France?" rows={4} value={editData.questionText || ''} onChange={e => setEditData({...editData, questionText: e.target.value})} />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                              <div>
                                  <label className="text-sm font-medium flex items-center justify-between gap-1 mb-1">
                                      <span className="flex items-center gap-1"><ImageIcon className="h-4 w-4"/> Image</span>
                                      <label className="text-xs text-blue-600 cursor-pointer flex items-center gap-1 hover:underline">
                                          {isUploadingMedia ? <Loader2 className="h-3 w-3 animate-spin"/> : <Upload className="h-3 w-3"/>}
                                          Upload
                                          <input type="file" className="hidden" accept="image/*" onChange={e => handleMediaUpload(e, 'questionImage')} disabled={isUploadingMedia} />
                                      </label>
                                  </label>
                                  <div className="flex items-center gap-2">
                                      <Input placeholder="URL or upload..." value={editData.questionImage || ''} onChange={e => setEditData({...editData, questionImage: e.target.value})} />
                                      {editData.questionImage && (
                                          <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-red-500 hover:text-red-700" onClick={() => handleDeleteMedia(editData.questionImage, 'questionImage')}>
                                              <Trash2 className="w-4 h-4" />
                                          </Button>
                                      )}
                                  </div>
                              </div>
                              <div>
                                  <label className="text-sm font-medium flex items-center justify-between gap-1 mb-1">
                                      <span className="flex items-center gap-1"><Play className="h-4 w-4"/> Audio</span>
                                      <label className="text-xs text-blue-600 cursor-pointer flex items-center gap-1 hover:underline">
                                          {isUploadingMedia ? <Loader2 className="h-3 w-3 animate-spin"/> : <Upload className="h-3 w-3"/>}
                                          Upload
                                          <input type="file" className="hidden" accept="audio/*" onChange={e => handleMediaUpload(e, 'questionAudio')} disabled={isUploadingMedia} />
                                      </label>
                                  </label>
                                  <div className="flex items-center gap-2">
                                      <Input placeholder="URL or upload..." value={editData.questionAudio || ''} onChange={e => setEditData({...editData, questionAudio: e.target.value})} />
                                      {editData.questionAudio && (
                                          <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-red-500 hover:text-red-700" onClick={() => handleDeleteMedia(editData.questionAudio, 'questionAudio')}>
                                              <Trash2 className="w-4 h-4" />
                                          </Button>
                                      )}
                                  </div>
                              </div>
                              <div>
                                  <label className="text-sm font-medium flex items-center justify-between gap-1 mb-1">
                                      <span className="flex items-center gap-1"><Video className="h-4 w-4"/> Video</span>
                                      <label className="text-xs text-blue-600 cursor-pointer flex items-center gap-1 hover:underline">
                                          {isUploadingMedia ? <Loader2 className="h-3 w-3 animate-spin"/> : <Upload className="h-3 w-3"/>}
                                          Upload
                                          <input type="file" className="hidden" accept="video/*" onChange={e => handleMediaUpload(e, 'questionVideo')} disabled={isUploadingMedia} />
                                      </label>
                                  </label>
                                  <div className="flex items-center gap-2">
                                      <Input placeholder="URL or upload..." value={editData.questionVideo || ''} onChange={e => setEditData({...editData, questionVideo: e.target.value})} />
                                      {editData.questionVideo && (
                                          <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-red-500 hover:text-red-700" onClick={() => handleDeleteMedia(editData.questionVideo, 'questionVideo')}>
                                              <Trash2 className="w-4 h-4" />
                                          </Button>
                                      )}
                                  </div>
                              </div>
                          </div>
                      </CardContent>
                  </Card>

                  <Card>
                      <CardHeader><CardTitle>{editData.questionType === 'Matching' ? 'Matching Pairs' : 'Options / Answer Key'}</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                          {editData.questionType === 'Matching' ? (
                              <div className="space-y-3">
                                  <div className="grid grid-cols-2 gap-4">
                                      <div className="text-sm font-medium text-slate-500">Left Column (Items)</div>
                                      <div className="text-sm font-medium text-slate-500">Right Column (Matches)</div>
                                  </div>
                                  {(editData.matchingPairs || []).map((pair, idx) => (
                                      <div key={idx} className="grid grid-cols-2 gap-4 mb-2 pb-2 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0 last:mb-0">
                                          {/* Left */}
                                          <div className="flex items-center gap-2">
                                              <span className="text-sm font-semibold w-6 shrink-0">{idx + 1}.</span>
                                              <Input className="flex-1" placeholder="E.g. Newton's First Law" value={pair.left} onChange={e => {
                                                  const newPairs = [...(editData.matchingPairs || [])];
                                                  newPairs[idx].left = e.target.value;
                                                  setEditData({...editData, matchingPairs: newPairs});
                                              }} />
                                              {pair.leftImage ? (
                                                  <div className="relative group w-9 h-9 shrink-0 border rounded overflow-hidden">
                                                      <img src={pair.leftImage} alt="Left" className="w-full h-full object-cover" />
                                                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                                                           onClick={() => handleDeletePairImage(pair.leftImage, idx, 'left')}>
                                                          <Trash2 className="w-4 h-4 text-white" />
                                                      </div>
                                                  </div>
                                              ) : (
                                                  <Popover>
                                                      <PopoverTrigger asChild>
                                                          <button className="w-9 h-9 shrink-0 border border-dashed rounded flex items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400">
                                                              {uploadingPairImage?.idx === idx && uploadingPairImage?.side === 'left' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                                                          </button>
                                                      </PopoverTrigger>
                                                      <PopoverContent className="w-64 p-3" side="top">
                                                          <div className="space-y-3">
                                                              <div>
                                                                  <label className="text-xs font-medium mb-1 block">Upload from device</label>
                                                                  <label className="flex items-center justify-center w-full h-8 border border-dashed rounded text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                                                                      <Upload className="w-3 h-3 mr-2" />
                                                                      Choose file...
                                                                      <input type="file" className="hidden" accept="image/*" onChange={e => handlePairImageUpload(e, idx, 'left')} disabled={uploadingPairImage !== null} />
                                                                  </label>
                                                              </div>
                                                              <div className="relative flex items-center py-1">
                                                                  <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
                                                                  <span className="flex-shrink-0 mx-2 text-[10px] text-slate-400 uppercase">Or</span>
                                                                  <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
                                                              </div>
                                                              <div>
                                                                  <label className="text-xs font-medium mb-1 block">Add from URL</label>
                                                                  <Input className="h-8 text-xs" placeholder="https://..." value={pair.leftImage || ''} onChange={e => {
                                                                      const newPairs = [...(editData.matchingPairs || [])];
                                                                      newPairs[idx].leftImage = e.target.value;
                                                                      setEditData({...editData, matchingPairs: newPairs});
                                                                  }} />
                                                              </div>
                                                          </div>
                                                      </PopoverContent>
                                                  </Popover>
                                              )}
                                          </div>
                                          {/* Right */}
                                          <div className="flex items-center gap-2">
                                              <Input className="flex-1" placeholder="E.g. Law of Inertia" value={pair.right} onChange={e => {
                                                      const newPairs = [...(editData.matchingPairs || [])];
                                                      newPairs[idx].right = e.target.value;
                                                      setEditData({...editData, matchingPairs: newPairs});
                                              }} />
                                              {pair.rightImage ? (
                                                  <div className="relative group w-9 h-9 shrink-0 border rounded overflow-hidden">
                                                      <img src={pair.rightImage} alt="Right" className="w-full h-full object-cover" />
                                                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                                                           onClick={() => handleDeletePairImage(pair.rightImage, idx, 'right')}>
                                                          <Trash2 className="w-4 h-4 text-white" />
                                                      </div>
                                                  </div>
                                              ) : (
                                                  <Popover>
                                                      <PopoverTrigger asChild>
                                                          <button className="w-9 h-9 shrink-0 border border-dashed rounded flex items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400">
                                                              {uploadingPairImage?.idx === idx && uploadingPairImage?.side === 'right' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                                                          </button>
                                                      </PopoverTrigger>
                                                      <PopoverContent className="w-64 p-3" side="top">
                                                          <div className="space-y-3">
                                                              <div>
                                                                  <label className="text-xs font-medium mb-1 block">Upload from device</label>
                                                                  <label className="flex items-center justify-center w-full h-8 border border-dashed rounded text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                                                                      <Upload className="w-3 h-3 mr-2" />
                                                                      Choose file...
                                                                      <input type="file" className="hidden" accept="image/*" onChange={e => handlePairImageUpload(e, idx, 'right')} disabled={uploadingPairImage !== null} />
                                                                  </label>
                                                              </div>
                                                              <div className="relative flex items-center py-1">
                                                                  <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
                                                                  <span className="flex-shrink-0 mx-2 text-[10px] text-slate-400 uppercase">Or</span>
                                                                  <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
                                                              </div>
                                                              <div>
                                                                  <label className="text-xs font-medium mb-1 block">Add from URL</label>
                                                                  <Input className="h-8 text-xs" placeholder="https://..." value={pair.rightImage || ''} onChange={e => {
                                                                      const newPairs = [...(editData.matchingPairs || [])];
                                                                      newPairs[idx].rightImage = e.target.value;
                                                                      setEditData({...editData, matchingPairs: newPairs});
                                                                  }} />
                                                              </div>
                                                          </div>
                                                      </PopoverContent>
                                                  </Popover>
                                              )}
                                          </div>
                                      </div>
                                  ))}
                                  <Button variant="outline" size="sm" onClick={() => {
                                      setEditData({...editData, matchingPairs: [...(editData.matchingPairs || []), { left: '', right: '' }]});
                                  }} className="mt-2 text-blue-600 border-blue-200 hover:bg-blue-50">
                                      + Add Pair
                                  </Button>
                                  <p className="text-xs text-slate-500 mt-2">Pairs will be shuffled automatically when displayed to students.</p>
                              </div>
                          ) : ['MCQ', 'Multiple Choice'].includes(editData.questionType || 'MCQ') ? (
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <div className="flex items-center justify-between mb-1">
                                          <label className="text-sm font-medium">Option A</label>
                                          <label className="text-xs flex items-center gap-1 cursor-pointer text-green-600 font-medium">
                                              <input type="radio" name="correctAnswer" checked={editData.correctAnswer?.toUpperCase() === 'A'} onChange={() => setEditData({...editData, correctAnswer: 'A'})} /> Correct
                                          </label>
                                      </div>
                                      <Input value={editData.options?.a || ''} onChange={e => setEditData({...editData, options: {...editData.options!, a: e.target.value}})} />
                                  </div>
                                  <div>
                                      <div className="flex items-center justify-between mb-1">
                                          <label className="text-sm font-medium">Option B</label>
                                          <label className="text-xs flex items-center gap-1 cursor-pointer text-green-600 font-medium">
                                              <input type="radio" name="correctAnswer" checked={editData.correctAnswer?.toUpperCase() === 'B'} onChange={() => setEditData({...editData, correctAnswer: 'B'})} /> Correct
                                          </label>
                                      </div>
                                      <Input value={editData.options?.b || ''} onChange={e => setEditData({...editData, options: {...editData.options!, b: e.target.value}})} />
                                  </div>
                                  <div>
                                      <div className="flex items-center justify-between mb-1">
                                          <label className="text-sm font-medium">Option C</label>
                                          <label className="text-xs flex items-center gap-1 cursor-pointer text-green-600 font-medium">
                                              <input type="radio" name="correctAnswer" checked={editData.correctAnswer?.toUpperCase() === 'C'} onChange={() => setEditData({...editData, correctAnswer: 'C'})} /> Correct
                                          </label>
                                      </div>
                                      <Input value={editData.options?.c || ''} onChange={e => setEditData({...editData, options: {...editData.options!, c: e.target.value}})} />
                                  </div>
                                  <div>
                                      <div className="flex items-center justify-between mb-1">
                                          <label className="text-sm font-medium">Option D</label>
                                          <label className="text-xs flex items-center gap-1 cursor-pointer text-green-600 font-medium">
                                              <input type="radio" name="correctAnswer" checked={editData.correctAnswer?.toUpperCase() === 'D'} onChange={() => setEditData({...editData, correctAnswer: 'D'})} /> Correct
                                          </label>
                                      </div>
                                      <Input value={editData.options?.d || ''} onChange={e => setEditData({...editData, options: {...editData.options!, d: e.target.value}})} />
                                  </div>
                                  <div className="col-span-1 md:col-span-2 mt-2 pt-2 border-t border-slate-100">
                                      <div className="flex items-center justify-between mb-1">
                                          <label className="text-sm font-medium">Option E (Optional)</label>
                                          <label className="text-xs flex items-center gap-1 cursor-pointer text-green-600 font-medium">
                                              <input type="radio" name="correctAnswer" checked={editData.correctAnswer?.toUpperCase() === 'E'} onChange={() => setEditData({...editData, correctAnswer: 'E'})} /> Correct
                                          </label>
                                      </div>
                                      <Input value={editData.options?.e || ''} onChange={e => setEditData({...editData, options: {...editData.options!, e: e.target.value}})} />
                                  </div>
                              </div>
                          ) : ['True/False'].includes(editData.questionType || '') ? (
                              <div className="space-y-4">
                                  <label className="text-sm font-medium">Select Correct Answer</label>
                                  <div className="flex gap-4">
                                      <label className={cn("flex flex-1 items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-slate-50", editData.correctAnswer === 'True' && "border-blue-500 bg-blue-50")}>
                                          <input type="radio" name="correctAnswer" checked={editData.correctAnswer === 'True'} onChange={() => setEditData({...editData, correctAnswer: 'True'})} className="w-4 h-4 text-blue-600" />
                                          <span className="font-semibold text-slate-700">True</span>
                                      </label>
                                      <label className={cn("flex flex-1 items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-slate-50", editData.correctAnswer === 'False' && "border-blue-500 bg-blue-50")}>
                                          <input type="radio" name="correctAnswer" checked={editData.correctAnswer === 'False'} onChange={() => setEditData({...editData, correctAnswer: 'False'})} className="w-4 h-4 text-blue-600" />
                                          <span className="font-semibold text-slate-700">False</span>
                                      </label>
                                  </div>
                              </div>
                          ) : ['Fill in the Blank'].includes(editData.questionType || '') ? (
                              <div className="space-y-4">
                                  <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-sm dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
                                      <strong>How to create blanks:</strong> Type <code className="bg-white dark:bg-slate-800 px-1 rounded text-blue-600 dark:text-blue-400">[blank]</code> anywhere in the Question Text above to create a gap. You can add multiple blanks.
                                  </div>
                                  <div>
                                      <label className="text-sm font-medium">Correct Answer(s) in Order</label>
                                      <p className="text-xs text-slate-500 mb-2">Separate answers for each blank with commas (e.g. "Paris, Tokyo").</p>
                                      <Input 
                                          value={editData.correctAnswer || ''} 
                                          onChange={e => setEditData({...editData, correctAnswer: e.target.value})} 
                                          placeholder="Enter correct answers..."
                                      />
                                  </div>
                                  <div className="pt-2">
                                      <label className="text-sm font-medium">Word Bank Distractors (Optional)</label>
                                      <p className="text-xs text-slate-500 mb-2">Add extra wrong words to the drag-and-drop word bank to make it harder.</p>
                                      <div className="grid grid-cols-2 gap-3">
                                          <Input placeholder="Distractor 1" value={editData.options?.a || ''} onChange={e => setEditData({...editData, options: {...editData.options!, a: e.target.value}})} />
                                          <Input placeholder="Distractor 2" value={editData.options?.b || ''} onChange={e => setEditData({...editData, options: {...editData.options!, b: e.target.value}})} />
                                          <Input placeholder="Distractor 3" value={editData.options?.c || ''} onChange={e => setEditData({...editData, options: {...editData.options!, c: e.target.value}})} />
                                          <Input placeholder="Distractor 4" value={editData.options?.d || ''} onChange={e => setEditData({...editData, options: {...editData.options!, d: e.target.value}})} />
                                      </div>
                                  </div>
                              </div>
                          ) : (
                              <div>
                                  <label className="text-sm font-medium">Answer Key / Correct Answer</label>
                                  <Textarea 
                                      rows={4} 
                                      value={editData.correctAnswer || ''} 
                                      onChange={e => setEditData({...editData, correctAnswer: e.target.value})} 
                                      placeholder="Provide the exact answer key or sample answer..."
                                  />
                              </div>
                          )}
                      </CardContent>
                  </Card>

                  <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                          <CardTitle>Explanation</CardTitle>
                          <Button variant="outline" size="sm" onClick={handleGenerateAI} disabled={isGeneratingAI} className="text-purple-600 border-purple-200 bg-purple-50 hover:bg-purple-100">
                              {isGeneratingAI ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                              Auto-Generate with AI
                          </Button>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          <div className="prose-editor-container">
                              <TiptapEditor 
                                  content={editData.explanation || ''} 
                                  onChange={(html) => setEditData({...editData, explanation: html})} 
                              />
                          </div>
                      </CardContent>
                  </Card>
              </div>

              {/* Right Column: Meta & Taxonomy */}
              <div className="space-y-6">
                  <Card>
                      <CardHeader><CardTitle>Publish Settings</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                          <Button className="w-full" onClick={handleSave} disabled={isSaving}>
                              {isSaving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                              Save Question
                          </Button>
                          <div>
                              <label className="text-sm font-medium">Status</label>
                              <Select value={editData.status as string} onValueChange={v => setEditData({...editData, status: v as any})}>
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="Draft">Draft</SelectItem>
                                      <SelectItem value="Published">Published</SelectItem>
                                      <SelectItem value="Archived">Archived</SelectItem>
                                  </SelectContent>
                              </Select>
                          </div>
                          <div>
                              <label className="text-sm font-medium">Difficulty</label>
                              <Select value={editData.difficulty as string} onValueChange={v => setEditData({...editData, difficulty: v as any})}>
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
                              <Select value={editData.language as string} onValueChange={v => setEditData({...editData, language: v as any})}>
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="English">English</SelectItem>
                                      <SelectItem value="Bangla">Bangla</SelectItem>
                                      <SelectItem value="Hindi">Hindi</SelectItem>
                                  </SelectContent>
                              </Select>
                          </div>

                          <div>
                              <label className="text-sm font-medium mb-2 block">Tags</label>
                              {tags.length === 0 ? (
                                  <p className="text-xs text-slate-500">No tags defined in categories yet.</p>
                              ) : (
                                  <div className="grid grid-cols-2 gap-3 max-h-[150px] overflow-y-auto pr-2 border rounded-md p-3">
                                      {tags.map(tag => (
                                          <div key={tag.id} className="flex items-center space-x-2">
                                              <Checkbox 
                                                  id={`tag-${tag.id}`} 
                                                  checked={(editData.tags || []).includes(tag.name)}
                                                  onCheckedChange={(checked) => {
                                                      const currentTags = editData.tags || [];
                                                      if (checked) {
                                                          setEditData({...editData, tags: [...currentTags, tag.name]});
                                                      } else {
                                                          setEditData({...editData, tags: currentTags.filter(t => t !== tag.name)});
                                                      }
                                                  }}
                                              />
                                              <label htmlFor={`tag-${tag.id}`} className="text-sm font-medium leading-none cursor-pointer">
                                                  {tag.name}
                                              </label>
                                          </div>
                                      ))}
                                  </div>
                              )}
                          </div>
                      </CardContent>
                  </Card>

                  <Card>
                      <CardHeader><CardTitle>Taxonomy Binding</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                          <div>
                              <label className="text-xs text-muted-foreground">Board</label>
                              <Select value={editData.boardId || ''} onValueChange={v => setEditData({...editData, boardId: v})}>
                                  <SelectTrigger><SelectValue placeholder="Select Board" /></SelectTrigger>
                                  <SelectContent>{boards.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                              </Select>
                          </div>
                          <div>
                              <label className="text-xs text-muted-foreground">Year</label>
                              <Select value={editData.yearId || ''} onValueChange={v => setEditData({...editData, yearId: v})}>
                                  <SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger>
                                  <SelectContent>{years.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                              </Select>
                          </div>
                          <div>
                              <label className="text-xs text-muted-foreground">Class</label>
                              <Select value={editData.classId || ''} onValueChange={v => setEditData({...editData, classId: v})}>
                                  <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
                                  <SelectContent>{classes.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                              </Select>
                          </div>
                          <div>
                              <label className="text-xs text-muted-foreground">Subject</label>
                              <Select value={editData.subjectId || ''} onValueChange={v => setEditData({...editData, subjectId: v})}>
                                  <SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger>
                                  <SelectContent>{subjects.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                              </Select>
                          </div>
                          <div>
                              <label className="text-xs text-muted-foreground">Textbook</label>
                              <Select value={editData.textbookId || ''} onValueChange={v => setEditData({...editData, textbookId: v})}>
                                  <SelectTrigger><SelectValue placeholder="Select Textbook" /></SelectTrigger>
                                  <SelectContent>{textbooks.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                              </Select>
                          </div>
                          <div>
                              <label className="text-xs text-muted-foreground">Chapter</label>
                              <Select value={editData.chapterId || ''} onValueChange={v => setEditData({...editData, chapterId: v})}>
                                  <SelectTrigger><SelectValue placeholder="Select Chapter" /></SelectTrigger>
                                  <SelectContent>{chapters.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                              </Select>
                          </div>
                          <div>
                              <label className="text-xs text-muted-foreground">Topic</label>
                              <Select value={editData.topicId || ''} onValueChange={v => setEditData({...editData, topicId: v})}>
                                  <SelectTrigger><SelectValue placeholder="Select Topic" /></SelectTrigger>
                                  <SelectContent>{topics.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                              </Select>
                          </div>
                      </CardContent>
                  </Card>

                  <Card>
                      <CardHeader><CardTitle>Exams Taxonomy</CardTitle></CardHeader>
                      <CardContent>
                          {exams.length === 0 ? (
                              <p className="text-xs text-slate-500">No exams defined in question_exams collection yet.</p>
                          ) : (
                              <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2">
                                  {exams.map(exam => (
                                      <div key={exam.id} className="flex items-center space-x-2">
                                          <Checkbox 
                                              id={`exam-${exam.id}`} 
                                              checked={(editData.examIds || []).includes(exam.id)}
                                              onCheckedChange={(checked) => {
                                                  const currentIds = editData.examIds || [];
                                                  if (checked) {
                                                      setEditData({...editData, examIds: [...currentIds, exam.id]});
                                                  } else {
                                                      setEditData({...editData, examIds: currentIds.filter(id => id !== exam.id)});
                                                  }
                                              }}
                                          />
                                          <label htmlFor={`exam-${exam.id}`} className="text-sm font-medium leading-none cursor-pointer">
                                              {exam.name}
                                          </label>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </CardContent>
                  </Card>

                  <Card className="border-indigo-100 dark:border-indigo-900 shadow-sm">
                      <CardHeader className="bg-indigo-50/50 dark:bg-indigo-900/20 pb-4">
                          <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                              <ShieldCheck className="w-5 h-5" />
                              Quality Assurance & Verification
                          </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6 pt-6">
                          <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                  <label className="text-sm font-medium">Verify Question</label>
                                  <p className="text-xs text-muted-foreground">Mark this question as verified by an expert.</p>
                              </div>
                              <Switch 
                                  checked={!!editData.isVerified} 
                                  onCheckedChange={(checked) => {
                                      if (checked && !editData.verifiedBy && user) {
                                          setEditData({
                                              ...editData, 
                                              isVerified: true,
                                              verifiedBy: user.uid,
                                              verifiedByName: user.displayName || user.email || '',
                                              verifiedDesignation: 'Admin / Content Manager', // Default placeholder
                                              verifiedAt: new Date().toISOString()
                                          });
                                      } else {
                                          setEditData({...editData, isVerified: checked});
                                      }
                                  }}
                              />
                          </div>

                          {editData.isVerified && (
                              <div className="space-y-4 pt-4 border-t border-indigo-100 dark:border-indigo-900/50">
                                  <div>
                                      <label className="text-xs text-muted-foreground">Verification Level</label>
                                      <Select value={editData.verificationLevel || ''} onValueChange={v => setEditData({...editData, verificationLevel: v})}>
                                          <SelectTrigger><SelectValue placeholder="Select Level" /></SelectTrigger>
                                          <SelectContent>
                                              {VERIFICATION_LEVELS.map(lvl => <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>)}
                                          </SelectContent>
                                      </Select>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                      <div>
                                          <label className="text-xs text-muted-foreground">Verified By (Name)</label>
                                          <Input value={editData.verifiedByName || ''} onChange={e => setEditData({...editData, verifiedByName: e.target.value})} placeholder="E.g. Dr. Ahmed" />
                                      </div>
                                      <div>
                                          <label className="text-xs text-muted-foreground">Designation</label>
                                          <Input value={editData.verifiedDesignation || ''} onChange={e => setEditData({...editData, verifiedDesignation: e.target.value})} placeholder="E.g. Subject Expert" />
                                      </div>
                                  </div>

                                  <div>
                                      <label className="text-xs text-muted-foreground font-medium mb-2 block">QA Checklist</label>
                                      <div className="space-y-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-md border">
                                          {QA_CHECKLIST_ITEMS.map(item => (
                                              <div key={item} className="flex items-center space-x-2">
                                                  <Checkbox 
                                                      id={`qa-${item}`} 
                                                      checked={(editData.qaChecklist || []).includes(item)}
                                                      onCheckedChange={(checked) => {
                                                          const currentList = editData.qaChecklist || [];
                                                          if (checked) {
                                                              setEditData({...editData, qaChecklist: [...currentList, item]});
                                                          } else {
                                                              setEditData({...editData, qaChecklist: currentList.filter(i => i !== item)});
                                                          }
                                                      }}
                                                  />
                                                  <label htmlFor={`qa-${item}`} className="text-xs font-medium leading-none cursor-pointer">
                                                      {item}
                                                  </label>
                                              </div>
                                          ))}
                                      </div>
                                  </div>

                                  <div>
                                      <label className="text-xs text-muted-foreground">Verification Note (Optional)</label>
                                      <Textarea value={editData.verificationNote || ''} onChange={e => setEditData({...editData, verificationNote: e.target.value})} placeholder="Internal notes about the verification..." className="h-20" />
                                  </div>
                              </div>
                          )}
                      </CardContent>
                  </Card>
              </div>
          </div>
      </div>
  );
}
