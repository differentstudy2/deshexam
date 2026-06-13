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
import { Loader2, ArrowLeft, Sparkles, Play, Image as ImageIcon, Video, ShieldCheck, Upload, Trash2, X, Plus, Search, ChevronDown, CheckCircle2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { slugify, cn } from '@/lib/utils';
import { collection, getDocs } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase/client';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { createQuestion, updateQuestion, bulkCreateQuestions } from '@/lib/firebase/question-bank';
import { getTaxonomyNodesByTrack } from '@/lib/firebase/taxonomy';
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

const MD3Input = ({ label, className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
    <div className={cn("relative border border-[#c4d6c4] rounded-xl p-3 pt-4 focus-within:border-[#4a634a] focus-within:ring-1 focus-within:ring-[#4a634a] transition-colors bg-[#fdfefd]", className)}>
        <label className="absolute top-0 left-3 -translate-y-1/2 bg-[#fdfefd] px-1 text-xs font-medium text-[#4a634a] pointer-events-none">
            {label}
        </label>
        <Input className="border-0 focus-visible:ring-0 p-0 h-auto rounded-none bg-transparent shadow-none font-medium" {...props} />
    </div>
);

const MD3SelectField = ({ label, value, placeholder, onClick, required }: { label: string, value: string, placeholder: string, onClick: () => void, required?: boolean }) => (
    <div onClick={onClick} className="relative border border-[#c4d6c4] rounded-xl p-3 pt-4 cursor-pointer hover:bg-[#f4f8f4] transition-colors bg-[#fdfefd]">
        <label className="absolute top-0 left-3 -translate-y-1/2 bg-[#fdfefd] px-1 text-xs font-medium text-[#4a634a] pointer-events-none">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex items-center justify-between min-h-[20px] mt-0.5">
            <span className={cn("font-medium", value ? "text-slate-900" : "text-slate-400")}>{value || placeholder}</span>
            <ChevronDown className="h-4 w-4 text-slate-400" />
        </div>
    </div>
);

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
  const [boards, setBoards] = useState<TaxonomyNode[]>([]);
  const [classes, setClasses] = useState<TaxonomyNode[]>([]);
  const [subjects, setSubjects] = useState<TaxonomyNode[]>([]);
  const [textbooks, setTextbooks] = useState<TaxonomyNode[]>([]);
  const [chapters, setChapters] = useState<TaxonomyNode[]>([]);
  const [topics, setTopics] = useState<TaxonomyNode[]>([]);
  const [tags, setTags] = useState<TaxonomyNode[]>([]);
  const [exams, setExams] = useState<TaxonomyNode[]>([]);
  const [years, setYears] = useState<TaxonomyNode[]>([]);

  // Sheet State
  const [taxonomySheet, setTaxonomySheet] = useState<{ isOpen: boolean, type: string, title: string, items: TaxonomyNode[], value: string, onSelect: (id: string) => void }>({ isOpen: false, type: '', title: '', items: [], value: '', onSelect: () => {} });
  const [sheetSearch, setSheetSearch] = useState('');

  const openTaxonomySheet = (type: string, title: string, items: TaxonomyNode[], value: string, onSelect: (id: string) => void) => {
      setSheetSearch('');
      setTaxonomySheet({ isOpen: true, type, title, items, value, onSelect });
  };

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
        try {
            const allAcademic = await getTaxonomyNodesByTrack('academic');
            const allCompetitive = await getTaxonomyNodesByTrack('competitive');
            
            // Map the unified `title` field back to `name` which the Editor expects for its internal UI state.
            const mapNodes = (nodes: any[]) => nodes.map(n => ({ ...n, name: n.title || n.name }));
            
            setBoards(mapNodes(allAcademic.filter((n: any) => n.type === 'board')));
            setClasses(mapNodes(allAcademic.filter((n: any) => n.type === 'class')));
            setSubjects(mapNodes(allAcademic.filter((n: any) => n.type === 'subject')));
            setTextbooks(mapNodes(allAcademic.filter((n: any) => n.type === 'textbook')));
            setChapters(mapNodes(allAcademic.filter((n: any) => n.type === 'chapter')));
            setTopics(mapNodes(allAcademic.filter((n: any) => n.type === 'topic')));
            
            // For Exams
            setExams(mapNodes(allCompetitive.filter((n: any) => n.type === 'exam')));
            
            // Years and tags were never migrated to taxonomy_nodes. Fetch them directly.
            const fetchCol = async (colName: string) => {
                const snap = await getDocs(collection(db, colName));
                return snap.docs.map(d => ({ id: d.id, name: d.data().title || d.data().name, ...d.data() }));
            };
            setYears(await fetchCol('question_years') as unknown as TaxonomyNode[]);
            setTags(await fetchCol('question_tags') as unknown as TaxonomyNode[]);
        } catch (e) {
            console.error("Failed to load taxonomy nodes", e);
        }
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

  const handleBulkImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = async (event) => {
          try {
              const content = event.target?.result as string;
              const parsed = JSON.parse(content);
              
              if (!Array.isArray(parsed)) {
                  throw new Error("JSON must be an array of questions.");
              }
              
              setIsSaving(true);
              
              // Helper to map custom human-readable format to internal format
              const mapCustomFormat = (raw: any) => {
                  if (!raw["Question"] && !raw["Question Type"]) return raw;
                  
                  const qTypeMap: Record<string, string> = { "Multiple Choice": "MCQ", "Descriptive": "Descriptive", "True/False": "True/False" };
                  const options: any = raw.options || {};
                  if (raw["Option A"]) options.a = raw["Option A"];
                  if (raw["Option B"]) options.b = raw["Option B"];
                  if (raw["Option C"]) options.c = raw["Option C"];
                  if (raw["Option D"]) options.d = raw["Option D"];
                  if (raw["Option E"]) options.e = raw["Option E"];

                  let correct = raw["Correct Answer"] || raw.correctAnswer || "";
                  if (typeof correct === 'string') correct = correct.toLowerCase().trim();

                  return {
                      ...raw,
                      questionText: raw["Question"] || raw.questionText,
                      questionType: qTypeMap[raw["Question Type"]] || raw.questionType || "MCQ",
                      options: Object.keys(options).length > 0 ? options : undefined,
                      correctAnswer: correct,
                      explanation: raw["Explanation"] || raw.explanation,
                      difficulty: raw["Difficulty"] || raw.difficulty,
                      // Custom tags to store the raw Subject/Chapter names if provided
                      sourceSubject: raw["Subject"] || raw.sourceSubject,
                      sourceChapter: raw["Chapter"] || raw.sourceChapter
                  };
              };

              // Apply current taxonomy to imported questions
              const questionsToImport = parsed.map((rawQ: any) => {
                  const q = mapCustomFormat(rawQ);
                  return {
                      ...q,
                      id: `q_${Date.now()}_${Math.floor(Math.random() * 1000000)}`,
                      contentType: defaultContentType || 'general',
                      boardId: editData.boardId || q.boardId,
                      classId: editData.classId || q.classId,
                      subjectId: editData.subjectId || q.subjectId,
                      textbookId: editData.textbookId || q.textbookId,
                      chapterId: editData.chapterId || q.chapterId,
                      topicId: editData.topicId || q.topicId,
                      yearId: editData.yearId || q.yearId,
                      examIds: editData.examIds && editData.examIds.length > 0 ? editData.examIds : (q.examIds || []),
                      sourceBoard: editData.boardId ? boards.find(b => b.id === editData.boardId)?.name : q.sourceBoard,
                      sourceYear: editData.yearId ? years.find(y => y.id === editData.yearId)?.name : q.sourceYear,
                      sourceExam: editData.examIds && editData.examIds.length > 0 ? exams.filter(ex => editData.examIds?.includes(ex.id)).map(ex => ex.name).join(', ') : q.sourceExam,
                      status: q.status || 'Published',
                      difficulty: q.difficulty || editData.difficulty || 'Medium',
                      slug: q.slug || slugify(q.title || (q.questionText || '').replace(/<[^>]*>?/gm, '').substring(0, 50))
                  };
              });

              // Strip undefined values
              const cleanQuestions = JSON.parse(JSON.stringify(questionsToImport));
              
              await bulkCreateQuestions(cleanQuestions);
              toast({ title: 'Success', description: `Successfully imported ${cleanQuestions.length} questions!` });
              if (e.target) e.target.value = ''; // Reset input
          } catch(err: any) {
              console.error("Bulk import error:", err);
              toast({ title: 'Import Failed', description: err.message, variant: 'destructive' });
          } finally {
              setIsSaving(false);
          }
      };
      reader.readAsText(file);
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
          
          // Firestore does not support undefined values. Strip them out.
          const cleanDataToSave = JSON.parse(JSON.stringify(dataToSave));
          
          if (cleanDataToSave.id) {
              await updateQuestion(cleanDataToSave.id, cleanDataToSave as Partial<QuestionBankEntry>);
              toast({ title: 'Question updated successfully' });
          } else {
              cleanDataToSave.id = `q_${Date.now()}`;
              await createQuestion(cleanDataToSave as any);
              toast({ title: 'Question created successfully' });
          }
          onSaveComplete();
      } catch(e: any) {
          console.error("Save Error:", e);
          toast({ title: 'Error saving question', description: e.message || 'Unknown error', variant: 'destructive' });
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
              <div className="flex flex-row flex-wrap items-start justify-between gap-4 border-b border-[#eef2ec] pb-3">
                  <div>
                      {breadcrumbs && (
                          <div className="text-xs text-[#4a634a] font-medium mb-1 flex flex-wrap items-center gap-x-1.5 gap-y-1">
                              {breadcrumbs.map((crumb, idx) => (
                                  <React.Fragment key={idx}>
                                      <span>{crumb}</span>
                                      {idx < breadcrumbs.length - 1 && <span className="opacity-50">/</span>}
                                  </React.Fragment>
                              ))}
                          </div>
                      )}
                      {title && <h1 className="text-xl font-bold tracking-tight text-[#2d3b2d]">{title}</h1>}
                  </div>
                  <div className="flex flex-row items-center gap-2 shrink-0">
                      <label className="cursor-pointer">
                          <input type="file" accept=".json" className="hidden" onChange={handleBulkImport} disabled={isSaving} />
                          <div className={cn(
                              "inline-flex items-center justify-center whitespace-nowrap text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                              "h-8 rounded-full border border-[#4a634a] text-[#4a634a] bg-transparent hover:bg-[#f4f8f4] px-4"
                          )}>
                              <Upload className="w-3 h-3 mr-1.5" />
                              Bulk Add (JSON)
                          </div>
                      </label>
                      <Button variant="outline" size="sm" className="h-8 text-xs rounded-full border-[#4a634a] text-[#4a634a] bg-transparent hover:bg-[#f4f8f4] px-4" onClick={() => {
                          setEditData({...editData, status: 'Draft'});
                          handleSave();
                      }} disabled={isSaving}>
                          {isSaving && editData.status === 'Draft' ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : null}
                          Save Draft
                      </Button>
                      <Button size="sm" className="h-8 text-xs rounded-full bg-[#3d5a3d] hover:bg-[#2d442d] text-white px-5 shadow-sm" onClick={() => {
                          setEditData({...editData, status: 'Published'});
                          handleSave();
                      }} disabled={isSaving}>
                          {isSaving && editData.status === 'Published' ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : null}
                          Publish Question
                      </Button>
                  </div>
              </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left Section (Content, Options, Explanation) */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                  {/* --- CARD 1: Question Content --- */}
                  <Card className="flex flex-col rounded-[24px] border-[#d3e3d3] shadow-sm bg-[#fdfefd] overflow-hidden">
                      <CardHeader className="pb-3 border-b border-[#eef2ec] bg-[#f8faf8]">
                          <CardTitle className="text-lg text-[#4a634a]">Question Content</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6 flex-1 flex flex-col pt-6">
                              <div className="relative border border-[#c4d6c4] rounded-xl pt-3 pb-1 hover:bg-[#f4f8f4] transition-colors bg-white focus-within:border-[#4a634a] focus-within:ring-1 focus-within:ring-[#4a634a]">
                                  <label className="absolute top-0 left-3 -translate-y-1/2 bg-white px-1 text-xs font-medium text-[#4a634a] pointer-events-none">Question Type</label>
                                  <Select value={editData.questionType || 'MCQ'} onValueChange={v => setEditData({...editData, questionType: v as any})}>
                                      <SelectTrigger className="border-0 focus:ring-0 shadow-none h-8 pt-0 bg-transparent font-medium text-[#2d3b2d]">
                                          <SelectValue placeholder="Select type" />
                                      </SelectTrigger>
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
                          <MD3Input 
                              label="Question Title (Optional)" 
                              placeholder="E.g. Newton's First Law" 
                              value={editData.title || ''} 
                              onChange={e => setEditData({...editData, title: e.target.value})} 
                          />
                          <div className="flex-1 flex flex-col">
                              <label className="text-sm font-semibold mb-2 block text-[#4a634a]">Question Text <span className="text-red-500">*</span></label>
                              <Textarea className="flex-1 min-h-[120px] resize-none border-[#c4d6c4] focus-visible:ring-[#4a634a] rounded-xl" placeholder="Enter question content here..." value={editData.questionText || ''} onChange={e => setEditData({...editData, questionText: e.target.value})} />
                          </div>
                          <div className="pt-2 border-t border-[#eef2ec]">
                              <label className="text-sm font-semibold mb-3 block text-[#4a634a]">Media Attachments</label>
                              <div className="flex flex-wrap gap-3">
                                  {/* Image Upload Button */}
                                  <label className="flex items-center gap-2 px-4 py-2 border border-[#c4d6c4] rounded-full cursor-pointer hover:bg-[#f4f8f4] transition-colors bg-white text-sm font-medium text-[#4a634a]">
                                      {isUploadingMedia ? <Loader2 className="h-4 w-4 animate-spin"/> : <ImageIcon className="h-4 w-4"/>}
                                      Image
                                      <input type="file" className="hidden" accept="image/*" onChange={e => handleMediaUpload(e, 'questionImage')} disabled={isUploadingMedia} />
                                  </label>
                                  {/* Audio Upload Button */}
                                  <label className="flex items-center gap-2 px-4 py-2 border border-[#c4d6c4] rounded-full cursor-pointer hover:bg-[#f4f8f4] transition-colors bg-white text-sm font-medium text-[#4a634a]">
                                      {isUploadingMedia ? <Loader2 className="h-4 w-4 animate-spin"/> : <Play className="h-4 w-4"/>}
                                      Audio
                                      <input type="file" className="hidden" accept="audio/*" onChange={e => handleMediaUpload(e, 'questionAudio')} disabled={isUploadingMedia} />
                                  </label>
                                  {/* Video Upload Button */}
                                  <label className="flex items-center gap-2 px-4 py-2 border border-[#c4d6c4] rounded-full cursor-pointer hover:bg-[#f4f8f4] transition-colors bg-white text-sm font-medium text-[#4a634a]">
                                      {isUploadingMedia ? <Loader2 className="h-4 w-4 animate-spin"/> : <Video className="h-4 w-4"/>}
                                      Video
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
                  <Card className="flex flex-col rounded-[24px] border-[#d3e3d3] shadow-sm bg-[#fdfefd] overflow-hidden">
                      <CardHeader className="pb-3 border-b border-[#eef2ec] bg-[#f8faf8]">
                          <CardTitle className="text-lg text-[#4a634a]">{editData.questionType === 'Matching' ? 'Matching Pairs' : 'Options / Answer'}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 flex-1 pt-6">
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
                                              className={cn("w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-colors", editData.correctAnswer?.toUpperCase() === optKey ? "border-[#4a634a] border-2 bg-transparent" : "border-[#c4d6c4]")}
                                              onClick={() => setEditData({...editData, correctAnswer: optKey})}
                                          >
                                              {editData.correctAnswer?.toUpperCase() === optKey && <div className="w-3 h-3 bg-[#4a634a] rounded-full" />}
                                          </button>
                                          <div className="flex-1">
                                              <MD3Input label={`Option ${optKey}`} placeholder={`Option ${optKey}`} value={editData.options?.[optKey.toLowerCase() as keyof typeof editData.options] || ''} onChange={e => setEditData({...editData, options: {...editData.options!, [optKey.toLowerCase()]: e.target.value}})} />
                                          </div>
                                          <button className="text-slate-400 hover:text-slate-600 shrink-0 px-2" onClick={() => setEditData({...editData, options: {...editData.options!, [optKey.toLowerCase()]: ''}})}><X className="w-4 h-4" /></button>
                                      </div>
                                  ))}
                                  <div className="flex flex-col gap-3 pt-2">
                                      <div className="flex items-center gap-3">
                                          <button 
                                              className={cn("w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-colors", editData.correctAnswer?.toUpperCase() === 'E' ? "border-[#4a634a] border-2 bg-transparent" : "border-[#c4d6c4]")}
                                              onClick={() => setEditData({...editData, correctAnswer: 'E'})}
                                          >
                                              {editData.correctAnswer?.toUpperCase() === 'E' && <div className="w-3 h-3 bg-[#4a634a] rounded-full" />}
                                          </button>
                                          <div className="flex-1">
                                              <MD3Input label="Option E (optional)" placeholder="Option E" value={editData.options?.e || ''} onChange={e => setEditData({...editData, options: {...editData.options!, e: e.target.value}})} />
                                          </div>
                                          <button className="text-[#4a634a] hover:text-emerald-700 shrink-0 px-2"><Plus className="w-5 h-5" /></button>
                                      </div>
                                      <Button variant="outline" className="w-fit mt-2 rounded-full border-[#d3e3d3] text-[#4a634a] bg-[#fdfefd] hover:bg-[#f4f8f4]">Add Option</Button>
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
                  <Card className="rounded-[24px] border-[#d3e3d3] shadow-sm bg-[#fdfefd] overflow-hidden">
                      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[#eef2ec] bg-[#f8faf8]">
                          <CardTitle className="text-lg text-[#4a634a]">Explanation</CardTitle>
                          <Button variant="outline" size="sm" onClick={handleGenerateAI} disabled={isGeneratingAI} className="rounded-full text-[#4a634a] border-[#c4d6c4] bg-[#fdfefd] hover:bg-[#f4f8f4]">
                              {isGeneratingAI ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                              Generate with AI
                          </Button>
                      </CardHeader>
                      <CardContent className="pt-6">
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
                  {editData.contentType === 'academic' && (
                      <Card className="rounded-[24px] border-[#d3e3d3] shadow-sm bg-[#fdfefd] overflow-hidden">
                          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[#eef2ec] bg-[#f8faf8]">
                          <CardTitle className="text-lg text-[#4a634a]">Academic Taxonomy</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-6">
                          <div className="grid grid-cols-2 gap-4">
                              <MD3SelectField 
                                  label="Board" 
                                  placeholder="Board" 
                                  required
                                  value={boards.find(b => b.id === editData.boardId)?.name || ''} 
                                  onClick={() => openTaxonomySheet('board', 'Select Board', boards.filter(b => !!(b as any).isGuide === true), editData.boardId || '', (v) => setEditData({...editData, boardId: v, classId: '', subjectId: '', textbookId: '', chapterId: '', topicId: ''}))} 
                              />
                              <MD3SelectField 
                                  label="Class" 
                                  placeholder="Class" 
                                  required
                                  value={classes.find(b => b.id === editData.classId)?.name || ''} 
                                  onClick={() => openTaxonomySheet('class', 'Select Class', classes.filter(b => !!(b as any).isGuide === true && (!editData.boardId || (b as any).boardId === editData.boardId)), editData.classId || '', (v) => setEditData({...editData, classId: v, subjectId: '', textbookId: '', chapterId: '', topicId: ''}))} 
                              />
                          </div>
                          <MD3SelectField 
                              label="Subject" 
                              placeholder="Subject" 
                              required
                              value={subjects.find(b => b.id === editData.subjectId)?.name || ''} 
                              onClick={() => openTaxonomySheet('subject', 'Select Subject', subjects.filter(b => !!(b as any).isGuide === true && (!editData.classId || (b as any).classId === editData.classId)), editData.subjectId || '', (v) => setEditData({...editData, subjectId: v, textbookId: '', chapterId: '', topicId: ''}))} 
                          />
                          <div className="grid grid-cols-2 gap-4">
                              <MD3SelectField 
                                  label="Textbook" 
                                  placeholder="Textbook" 
                                  value={textbooks.find(b => b.id === editData.textbookId)?.name || ''} 
                                  onClick={() => openTaxonomySheet('textbook', 'Select Textbook', textbooks.filter(b => !!(b as any).isGuide === true && (!editData.subjectId || (b as any).subjectId === editData.subjectId)), editData.textbookId || '', (v) => setEditData({...editData, textbookId: v, chapterId: '', topicId: ''}))} 
                              />
                              <MD3SelectField 
                                  label="Book / Guide" 
                                  placeholder="Book / Guide" 
                                  value={years.find(b => b.id === editData.yearId)?.name || ''} 
                                  onClick={() => openTaxonomySheet('year', 'Select Book / Guide', years, editData.yearId || '', (v) => setEditData({...editData, yearId: v}))} 
                              />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <MD3SelectField 
                                  label="Chapter" 
                                  placeholder="Chapter" 
                                  required
                                  value={chapters.find(b => b.id === editData.chapterId)?.name || ''} 
                                  onClick={() => openTaxonomySheet('chapter', 'Select Chapter', chapters.filter(b => !!(b as any).isGuide === true && (!editData.textbookId || (b as any).textbookId === editData.textbookId)), editData.chapterId || '', (v) => setEditData({...editData, chapterId: v, topicId: ''}))} 
                              />
                              <MD3SelectField 
                                  label="Topic" 
                                  placeholder="Topic" 
                                  required
                                  value={topics.find(b => b.id === editData.topicId)?.name || ''} 
                                  onClick={() => openTaxonomySheet('topic', 'Select Topic', topics.filter(b => !!(b as any).isGuide === true && (!editData.chapterId || (b as any).chapterId === editData.chapterId)), editData.topicId || '', (v) => setEditData({...editData, topicId: v}))} 
                              />
                          </div>
                      </CardContent>
                      </Card>
                  )}

                  {/* --- CARD 5: Publish Settings --- */}
                  <Card className="rounded-[24px] border-[#d3e3d3] shadow-sm bg-[#fdfefd] overflow-hidden">
                      <CardHeader className="pb-3 border-b border-[#eef2ec] bg-[#f8faf8]"><CardTitle className="text-lg text-[#4a634a]">Publish Settings</CardTitle></CardHeader>
                      <CardContent className="space-y-4 pt-6">
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
                  {editData.contentType === 'exam' && (
                      <Card className="rounded-[24px] border-[#d3e3d3] shadow-sm bg-[#fdfefd] overflow-hidden">
                          <CardHeader className="pb-3 border-b border-[#eef2ec] bg-[#f8faf8]"><CardTitle className="text-lg text-[#4a634a]">Exams Taxonomy</CardTitle></CardHeader>
                      <CardContent className="pt-6">
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
                  )}

                  {/* --- CARD 7: Quality Assurance --- */}
                  <Card className="rounded-[24px] border-[#d3e3d3] shadow-sm bg-[#fdfefd] overflow-hidden">
                      <CardHeader className="bg-indigo-50/50 dark:bg-indigo-900/20 pb-4 border-b border-[#eef2ec]">
                          <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 text-lg">
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
          <div className="fixed bottom-0 left-0 right-0 md:left-[250px] bg-[#eef2ec]/90 backdrop-blur-md border-t border-[#d3e3d3] p-4 flex items-center justify-between z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
              <Button variant="ghost" className="rounded-full text-[#4a634a] hover:bg-[#c4d6c4]" onClick={onCancel}>Cancel</Button>
              <div className="flex items-center gap-3">
                  <Button variant="outline" className="rounded-full border-[#4a634a] text-[#4a634a] bg-transparent hover:bg-[#f4f8f4] px-6" onClick={() => {
                      setEditData({...editData, status: 'Draft'});
                      handleSave();
                  }} disabled={isSaving}>
                      {isSaving && editData.status === 'Draft' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Save Draft
                  </Button>
                  <Button className="rounded-full bg-[#3d5a3d] hover:bg-[#2d442d] text-white px-8 shadow-sm" onClick={() => {
                      setEditData({...editData, status: 'Published'});
                      handleSave();
                  }} disabled={isSaving}>
                      {isSaving && editData.status === 'Published' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                      Publish
                  </Button>
              </div>
          </div>
          
          <Sheet open={taxonomySheet.isOpen} onOpenChange={(isOpen) => setTaxonomySheet(prev => ({...prev, isOpen}))}>
              <SheetContent side="bottom" className="h-[85vh] sm:h-[60vh] rounded-t-[24px] px-0 flex flex-col pb-0">
                  <SheetHeader className="px-6 pb-2 border-b">
                      <SheetTitle className="text-xl font-bold text-slate-800">{taxonomySheet.title}</SheetTitle>
                  </SheetHeader>
                  <div className="p-4 border-b">
                      <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input 
                              placeholder="Search..." 
                              className="pl-9 bg-[#f0f4f0] border-transparent rounded-xl h-12 focus-visible:ring-emerald-600"
                              value={sheetSearch}
                              onChange={e => setSheetSearch(e.target.value)}
                          />
                      </div>
                  </div>
                  <div className="flex-1 overflow-y-auto px-6 py-4">
                      <RadioGroup 
                          value={taxonomySheet.value} 
                          onValueChange={(val) => {
                              taxonomySheet.onSelect(val);
                              setTaxonomySheet(prev => ({...prev, isOpen: false}));
                          }}
                          className="flex flex-col space-y-4"
                      >
                          {taxonomySheet.items.filter(item => item.name.toLowerCase().includes(sheetSearch.toLowerCase())).map(item => (
                              <div key={item.id} className="flex items-center space-x-3">
                                  <RadioGroupItem value={item.id} id={`sheet-item-${item.id}`} className="text-emerald-700 border-emerald-700" />
                                  <label htmlFor={`sheet-item-${item.id}`} className="text-sm font-medium leading-none cursor-pointer flex-1 py-1">
                                      {item.name}
                                  </label>
                              </div>
                          ))}
                          {taxonomySheet.items.filter(item => item.name.toLowerCase().includes(sheetSearch.toLowerCase())).length === 0 && (
                              <div className="text-center text-slate-500 py-8">No results found</div>
                          )}
                      </RadioGroup>
                  </div>
              </SheetContent>
          </Sheet>
      </div>
  );
}
