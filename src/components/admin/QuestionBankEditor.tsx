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
import { Loader2, ArrowLeft, Sparkles, Play, Image as ImageIcon, Video, ShieldCheck, Upload, Trash2, X, Plus } from 'lucide-react';
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
  title?: string;
  breadcrumbs?: string[];
  defaultContentType?: string;
}

export function QuestionBankEditor({ initialData, onSaveComplete, onCancel, title, breadcrumbs, defaultContentType }: QuestionBankEditorProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [editData, setEditData] = useState<Partial<QuestionBankEntry>>({
      questionType: 'MCQ',
      difficulty: 'Medium',
      status: 'Published',
      language: 'English',
      contentType: defaultContentType || initialData.contentType,
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
  const [showGuideTaxonomy, setShowGuideTaxonomy] = useState(false);
  const [boards, setBoards] = useState<TaxonomyNode[]>([]);
  const [classes, setClasses] = useState<TaxonomyNode[]>([]);
  const [subjects, setSubjects] = useState<TaxonomyNode[]>([]);
  const [textbooks, setTextbooks] = useState<TaxonomyNode[]>([]);
  const [chapters, setChapters] = useState<TaxonomyNode[]>([]);
  const [topics, setTopics] = useState<TaxonomyNode[]>([]);
  const [tags, setTags] = useState<TaxonomyNode[]>([]);
  const [exams, setExams] = useState<TaxonomyNode[]>([]);
  const [years, setYears] = useState<TaxonomyNode[]>([]);

  useEffect(() => {
    // Only update if the ID changes to avoid overwriting ongoing edits
    setEditData(prev => ({
        questionType: 'MCQ',
        difficulty: 'Medium',
        status: 'Published',
        language: 'English',
        contentType: defaultContentType || initialData.contentType,
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
        const fetchGuideCol = async (colName: string, isGuide: boolean) => {
            try {
                const snap = await getDocs(collection(db, colName));
                return snap.docs.map(d => {
                    const data = d.data();
                    return { id: d.id, name: data.title || data.name, isGuide, ...data };
                });
            } catch(e) {
                return [];
            }
        };

        const fetchCombinedCol = async (guideCol: string, questionCol: string) => {
            const [g, q] = await Promise.all([fetchGuideCol(guideCol, true), fetchGuideCol(questionCol, false)]);
            return [...g, ...q];
        };

        const [b, c, s, t, ch, tp, ex, yr, tg] = await Promise.all([
            fetchCombinedCol('guide_boards', 'question_boards'),
            fetchCombinedCol('guide_classes', 'question_classes'),
            fetchCombinedCol('guide_subjects', 'question_subjects'),
            fetchCombinedCol('guide_textbooks', 'question_textbooks'),
            fetchCombinedCol('guide_chapters', 'question_chapters'),
            fetchCombinedCol('guide_topics', 'question_topics'),
            fetchGuideCol('question_exams', false),
            fetchGuideCol('question_years', false),
            fetchGuideCol('question_tags', false)
        ]);
        setBoards(b as unknown as TaxonomyNode[]); setClasses(c as unknown as TaxonomyNode[]); setSubjects(s as unknown as TaxonomyNode[]);
        setTextbooks(t as unknown as TaxonomyNode[]); setChapters(ch as unknown as TaxonomyNode[]); setTopics(tp as unknown as TaxonomyNode[]); setExams(ex as unknown as TaxonomyNode[]); setYears(yr as unknown as TaxonomyNode[]); setTags(tg as unknown as TaxonomyNode[]);
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
              contentType: defaultContentType || 'general',
              ...editData,
              slug: generatedSlug,
              sourceExam: editData.examIds && editData.examIds.length > 0
                ? exams.filter(e => editData.examIds?.includes(e.id)).map(e => e.name).join(', ')
                : editData.sourceExam,
              sourceYear: editData.yearId
                ? years.find(y => y.id === editData.yearId)?.name
                : editData.sourceYear,
              sourceBoard: editData.boardId
                ? boards.find(b => b.id === editData.boardId)?.name
                : editData.sourceBoard,
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
      <div className="space-y-6 pb-24">
          {(title || breadcrumbs) && (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
                  <div>
                      {breadcrumbs && (
                          <div className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                              {breadcrumbs.map((crumb, idx) => (
                                  <React.Fragment key={idx}>
                                      <span>{crumb}</span>
                                      {idx < breadcrumbs.length - 1 && <span>/</span>}
                                  </React.Fragment>
                              ))}
                          </div>
                      )}
                      {title && <h1 className="text-3xl font-bold tracking-tight">{title}</h1>}
                  </div>
                  <div className="flex items-center gap-3">
                      <Button variant="outline" onClick={() => {
                          setEditData({...editData, status: 'Draft'});
                          handleSave();
                      }} disabled={isSaving}>
                          {isSaving && editData.status === 'Draft' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                          Save Draft
                      </Button>
                      <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => {
                          setEditData({...editData, status: 'Published'});
                          handleSave();
                      }} disabled={isSaving}>
                          {isSaving && editData.status === 'Published' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                          Publish Question
                      </Button>
                  </div>
              </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left Section (Content, Options, Explanation) */}
              <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* --- CARD 1: Question Content --- */}
                  <Card className="flex flex-col rounded-xl border-slate-200/60 shadow-sm bg-white h-full">
                      <CardHeader className="pb-3"><CardTitle className="text-lg">Question Content</CardTitle></CardHeader>
                      <CardContent className="space-y-4 flex-1 flex flex-col">
                          <div>
                              <label className="text-sm font-semibold mb-1 block">Question Type <span className="text-red-500">*</span></label>
                              <Select value={editData.questionType || 'MCQ'} onValueChange={v => setEditData({...editData, questionType: v as any})}>
                                  <SelectTrigger className="bg-green-50/50 border-green-200 text-green-900 focus:ring-green-500"><SelectValue placeholder="Select type" /></SelectTrigger>
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
                          <div className="flex-1 flex flex-col">
                              <label className="text-sm font-semibold mb-1 block">Question Text <span className="text-red-500">*</span></label>
                              <Textarea className="flex-1 min-h-[120px] resize-none" placeholder="Enter question content here..." value={editData.questionText || ''} onChange={e => setEditData({...editData, questionText: e.target.value})} />
                          </div>
                          <div className="pt-2">
                              <label className="text-sm font-semibold mb-2 block">Attachments</label>
                              <div className="flex gap-3">
                                  {/* Image Upload Button */}
                                  <label className="flex flex-col items-center justify-center w-24 h-20 border rounded-xl cursor-pointer hover:bg-slate-50 transition-colors bg-white">
                                      {isUploadingMedia ? <Loader2 className="h-5 w-5 animate-spin text-slate-400 mb-1"/> : <ImageIcon className="h-6 w-6 text-slate-700 mb-1"/>}
                                      <span className="text-[10px] font-medium text-slate-600">Upload Image</span>
                                      <input type="file" className="hidden" accept="image/*" onChange={e => handleMediaUpload(e, 'questionImage')} disabled={isUploadingMedia} />
                                  </label>
                                  {/* Audio Upload Button */}
                                  <label className="flex flex-col items-center justify-center w-24 h-20 border rounded-xl cursor-pointer hover:bg-slate-50 transition-colors bg-white">
                                      {isUploadingMedia ? <Loader2 className="h-5 w-5 animate-spin text-slate-400 mb-1"/> : <Play className="h-6 w-6 text-slate-700 mb-1"/>}
                                      <span className="text-[10px] font-medium text-slate-600">Upload Audio</span>
                                      <input type="file" className="hidden" accept="audio/*" onChange={e => handleMediaUpload(e, 'questionAudio')} disabled={isUploadingMedia} />
                                  </label>
                                  {/* Video Upload Button */}
                                  <label className="flex flex-col items-center justify-center w-24 h-20 border rounded-xl cursor-pointer hover:bg-slate-50 transition-colors bg-white">
                                      {isUploadingMedia ? <Loader2 className="h-5 w-5 animate-spin text-slate-400 mb-1"/> : <Video className="h-6 w-6 text-slate-700 mb-1"/>}
                                      <span className="text-[10px] font-medium text-slate-600">Upload Video</span>
                                      <input type="file" className="hidden" accept="video/*" onChange={e => handleMediaUpload(e, 'questionVideo')} disabled={isUploadingMedia} />
                                  </label>
                              </div>
                              {/* Display uploaded media status */}
                              {(editData.questionImage || editData.questionAudio || editData.questionVideo) && (
                                  <div className="mt-3 flex flex-col gap-2">
                                      {editData.questionImage && (
                                          <div className="flex items-center justify-between bg-slate-50 p-2 rounded-md border text-sm">
                                              <span className="truncate max-w-[150px]"><ImageIcon className="w-4 h-4 inline mr-1"/> Image</span>
                                              <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteMedia(editData.questionImage, 'questionImage')}><Trash2 className="w-3 h-3" /></Button>
                                          </div>
                                      )}
                                      {editData.questionAudio && (
                                          <div className="flex items-center justify-between bg-slate-50 p-2 rounded-md border text-sm">
                                              <span className="truncate max-w-[150px]"><Play className="w-4 h-4 inline mr-1"/> Audio</span>
                                              <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteMedia(editData.questionAudio, 'questionAudio')}><Trash2 className="w-3 h-3" /></Button>
                                          </div>
                                      )}
                                      {editData.questionVideo && (
                                          <div className="flex items-center justify-between bg-slate-50 p-2 rounded-md border text-sm">
                                              <span className="truncate max-w-[150px]"><Video className="w-4 h-4 inline mr-1"/> Video</span>
                                              <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteMedia(editData.questionVideo, 'questionVideo')}><Trash2 className="w-3 h-3" /></Button>
                                          </div>
                                      )}
                                  </div>
                              )}
                          </div>
                      </CardContent>
                  </Card>

                  {/* --- CARD 2: Options / Answer --- */}
                  <Card className="flex flex-col rounded-xl border-slate-200/60 shadow-sm bg-white h-full">
                      <CardHeader className="pb-3"><CardTitle className="text-lg">{editData.questionType === 'Matching' ? 'Matching Pairs' : 'Options / Answer'}</CardTitle></CardHeader>
                      <CardContent className="space-y-4 flex-1">
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
                              <div className="space-y-3">
                                  {['A', 'B', 'C', 'D'].map((optKey) => (
                                      <div key={optKey} className="flex items-center gap-3">
                                          <button 
                                              className={cn("w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors", editData.correctAnswer?.toUpperCase() === optKey ? "border-green-600 bg-green-600" : "border-slate-300")}
                                              onClick={() => setEditData({...editData, correctAnswer: optKey})}
                                          >
                                              {editData.correctAnswer?.toUpperCase() === optKey && <div className="w-2 h-2 bg-white rounded-full" />}
                                          </button>
                                          <Input className="flex-1" placeholder={`Option ${optKey}`} value={editData.options?.[optKey.toLowerCase() as keyof typeof editData.options] || ''} onChange={e => setEditData({...editData, options: {...editData.options!, [optKey.toLowerCase()]: e.target.value}})} />
                                          <button className="text-slate-400 hover:text-slate-600 shrink-0 px-2" onClick={() => setEditData({...editData, options: {...editData.options!, [optKey.toLowerCase()]: ''}})}><X className="w-4 h-4" /></button>
                                      </div>
                                  ))}
                                  <div className="flex items-center gap-3 pt-2">
                                      <button 
                                          className={cn("w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors", editData.correctAnswer?.toUpperCase() === 'E' ? "border-green-600 bg-green-600" : "border-slate-300")}
                                          onClick={() => setEditData({...editData, correctAnswer: 'E'})}
                                      >
                                          {editData.correctAnswer?.toUpperCase() === 'E' && <div className="w-2 h-2 bg-white rounded-full" />}
                                      </button>
                                      <Input className="flex-1" placeholder="Option E (optional)" value={editData.options?.e || ''} onChange={e => setEditData({...editData, options: {...editData.options!, e: e.target.value}})} />
                                      <button className="text-green-600 hover:text-green-700 shrink-0 px-2"><Plus className="w-5 h-5" /></button>
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

                  {/* --- CARD 3: Explanation --- */}
                  <Card className="lg:col-span-2 rounded-xl border-slate-200/60 shadow-sm bg-white">
                      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
                          <CardTitle className="text-lg">Explanation</CardTitle>
                          <Button variant="outline" size="sm" onClick={handleGenerateAI} disabled={isGeneratingAI} className="text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 rounded-md">
                              {isGeneratingAI ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                              Generate Explanation with AI
                          </Button>
                      </CardHeader>
                      <CardContent className="pt-4">
                          <div className="prose-editor-container">
                              <TiptapEditor 
                                  content={editData.explanation || ''} 
                                  onChange={(html) => setEditData({...editData, explanation: html})} 
                              />
                          </div>
                      </CardContent>
                  </Card>
              </div>

              {/* Right Column: Taxonomy and Meta */}
              <div className="space-y-6 flex flex-col">
                  {/* --- CARD 4: Academic Taxonomy --- */}
                  <Card className="rounded-xl border-slate-200/60 shadow-sm bg-white">
                      <CardHeader className="flex flex-row items-center justify-between pb-3">
                          <CardTitle className="text-lg">Academic Taxonomy</CardTitle>
                          <div className="flex items-center space-x-2">
                              <Switch id="guide-mode" checked={showGuideTaxonomy} onCheckedChange={(v) => {
                                  setShowGuideTaxonomy(v);
                                  setEditData({...editData, boardId: '', classId: '', subjectId: '', textbookId: '', chapterId: '', topicId: ''});
                              }} />
                              <label htmlFor="guide-mode" className="text-[10px] font-medium leading-none cursor-pointer text-slate-500">
                                  Guide Only
                              </label>
                          </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="text-xs font-semibold mb-1 block">Board <span className="text-red-500">*</span></label>
                                  <Select value={editData.boardId || ''} onValueChange={v => setEditData({...editData, boardId: v, classId: '', subjectId: '', textbookId: '', chapterId: '', topicId: ''})}>
                                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Board" /></SelectTrigger>
                                      <SelectContent>{boards.filter(b => !!(b as any).isGuide === showGuideTaxonomy).map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                                  </Select>
                              </div>
                              <div>
                                  <label className="text-xs font-semibold mb-1 block">Class <span className="text-red-500">*</span></label>
                                  <Select value={editData.classId || ''} onValueChange={v => setEditData({...editData, classId: v, subjectId: '', textbookId: '', chapterId: '', topicId: ''})}>
                                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Class" /></SelectTrigger>
                                      <SelectContent>{classes.filter(b => !!(b as any).isGuide === showGuideTaxonomy && (!editData.boardId || (b as any).boardId === editData.boardId)).map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                                  </Select>
                              </div>
                          </div>
                          <div>
                              <label className="text-xs font-semibold mb-1 block">Subject <span className="text-red-500">*</span></label>
                              <Select value={editData.subjectId || ''} onValueChange={v => setEditData({...editData, subjectId: v, textbookId: '', chapterId: '', topicId: ''})}>
                                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Subject" /></SelectTrigger>
                                  <SelectContent>{subjects.filter(b => !!(b as any).isGuide === showGuideTaxonomy && (!editData.classId || (b as any).classId === editData.classId)).map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                              </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="text-xs font-semibold mb-1 block text-slate-500">Textbook</label>
                                  <Select value={editData.textbookId || ''} onValueChange={v => setEditData({...editData, textbookId: v, chapterId: '', topicId: ''})}>
                                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Textbook" /></SelectTrigger>
                                      <SelectContent>{textbooks.filter(b => !!(b as any).isGuide === showGuideTaxonomy && (!editData.subjectId || (b as any).subjectId === editData.subjectId)).map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                                  </Select>
                              </div>
                              <div>
                                  <label className="text-xs font-semibold mb-1 block text-slate-500">Book / Guide</label>
                                  <Select value={editData.yearId || ''} onValueChange={v => setEditData({...editData, yearId: v})}>
                                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Book / Guide" /></SelectTrigger>
                                      <SelectContent>{years.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                                  </Select>
                              </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="text-xs font-semibold mb-1 block">Chapter <span className="text-red-500">*</span></label>
                                  <Select value={editData.chapterId || ''} onValueChange={v => setEditData({...editData, chapterId: v, topicId: ''})}>
                                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Chapter" /></SelectTrigger>
                                      <SelectContent>{chapters.filter(b => !!(b as any).isGuide === showGuideTaxonomy && (!editData.textbookId || (b as any).textbookId === editData.textbookId)).map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                                  </Select>
                              </div>
                              <div>
                                  <label className="text-xs font-semibold mb-1 block">Topic <span className="text-red-500">*</span></label>
                                  <Select value={editData.topicId || ''} onValueChange={v => setEditData({...editData, topicId: v})}>
                                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Topic" /></SelectTrigger>
                                      <SelectContent>{topics.filter(b => !!(b as any).isGuide === showGuideTaxonomy && (!editData.chapterId || (b as any).chapterId === editData.chapterId)).map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                                  </Select>
                              </div>
                          </div>
                      </CardContent>
                  </Card>

                  {/* --- CARD 5: Publish Settings --- */}
                  <Card className="rounded-xl border-slate-200/60 shadow-sm bg-white">
                      <CardHeader className="pb-3"><CardTitle className="text-lg">Publish Settings</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                          <div>
                              <label className="text-xs font-semibold mb-2 block">Status</label>
                              <div className="flex items-center gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                      <input type="radio" name="status" checked={editData.status === 'Draft'} onChange={() => setEditData({...editData, status: 'Draft'})} className="w-4 h-4 text-green-600 focus:ring-green-500" />
                                      <span className="text-sm">Draft</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                      <input type="radio" name="status" checked={editData.status === 'Published'} onChange={() => setEditData({...editData, status: 'Published'})} className="w-4 h-4 text-green-600 focus:ring-green-500" />
                                      <span className="text-sm">Published</span>
                                  </label>
                              </div>
                          </div>
                          <div>
                              <label className="text-xs font-semibold mb-2 block">Difficulty</label>
                              <div className="flex bg-slate-100 rounded-full p-1 w-full border">
                                  <button onClick={() => setEditData({...editData, difficulty: 'Easy'})} className={cn("flex-1 text-xs py-1.5 rounded-full font-medium transition-colors", editData.difficulty === 'Easy' ? "bg-green-100 text-green-800 shadow-sm border border-green-200" : "text-slate-600 hover:text-slate-900")}>Easy</button>
                                  <button onClick={() => setEditData({...editData, difficulty: 'Medium'})} className={cn("flex-1 text-xs py-1.5 rounded-full font-medium transition-colors", editData.difficulty === 'Medium' ? "bg-green-100 text-green-800 shadow-sm border border-green-200" : "text-slate-600 hover:text-slate-900")}>Medium</button>
                                  <button onClick={() => setEditData({...editData, difficulty: 'Hard'})} className={cn("flex-1 text-xs py-1.5 rounded-full font-medium transition-colors", editData.difficulty === 'Hard' ? "bg-green-100 text-green-800 shadow-sm border border-green-200" : "text-slate-600 hover:text-slate-900")}>Hard</button>
                              </div>
                          </div>
                          <div>
                              <label className="text-xs font-semibold mb-1 block">Language</label>
                              <Select value={editData.language as string} onValueChange={v => setEditData({...editData, language: v as any})}>
                                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="English">English</SelectItem>
                                      <SelectItem value="Bangla">Bangla</SelectItem>
                                      <SelectItem value="Hindi">Hindi</SelectItem>
                                      <SelectItem value="Bengali, English">Bengali, English</SelectItem>
                                  </SelectContent>
                              </Select>
                          </div>
                          <div>
                              <label className="text-xs font-semibold mb-2 block">Tags</label>
                              {tags.length === 0 ? (
                                  <p className="text-xs text-slate-500">No tags defined yet.</p>
                              ) : (
                                  <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto">
                                      {tags.map(tag => (
                                          <div key={tag.id} 
                                               className={cn("text-xs flex items-center gap-1 px-2 py-1 rounded-full border cursor-pointer select-none transition-colors", 
                                                 (editData.tags || []).includes(tag.name) ? "bg-slate-200 border-slate-300 text-slate-700 font-medium" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                                               )}
                                               onClick={() => {
                                                   const currentTags = editData.tags || [];
                                                   if (currentTags.includes(tag.name)) {
                                                       setEditData({...editData, tags: currentTags.filter(t => t !== tag.name)});
                                                   } else {
                                                       setEditData({...editData, tags: [...currentTags, tag.name]});
                                                   }
                                               }}
                                          >
                                              {tag.name}
                                              {(editData.tags || []).includes(tag.name) && <X className="w-3 h-3 text-slate-400 hover:text-slate-600" />}
                                          </div>
                                      ))}
                                  </div>
                              )}
                          </div>
                      </CardContent>
                  </Card>

                  {/* --- CARD 6: Exams Taxonomy --- */}
                  <Card className="rounded-xl border-slate-200/60 shadow-sm bg-white">
                      <CardHeader className="pb-3"><CardTitle className="text-lg">Exams Taxonomy</CardTitle></CardHeader>
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

                  {/* --- CARD 7: Quality Assurance --- */}
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

          {/* Bottom Sticky Action Bar */}
          <div className="fixed bottom-0 left-0 right-0 md:left-[250px] bg-white dark:bg-slate-950 border-t p-4 flex items-center justify-between z-40 shadow-lg">
              <Button variant="ghost" onClick={onCancel}>Cancel</Button>
              <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={() => {
                      setEditData({...editData, status: 'Draft'});
                      handleSave();
                  }} disabled={isSaving}>
                      {isSaving && editData.status === 'Draft' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Save Draft
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => {
                      setEditData({...editData, status: 'Published'});
                      handleSave();
                  }} disabled={isSaving}>
                      {isSaving && editData.status === 'Published' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Publish
                  </Button>
              </div>
          </div>
      </div>
  );
}
