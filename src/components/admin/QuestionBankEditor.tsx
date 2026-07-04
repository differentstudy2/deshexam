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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileJson, Copy, Check } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { slugify, cn } from '@/lib/utils';
import { collection, getDocs } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase/client';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { createQuestion, updateQuestion, bulkCreateQuestions } from '@/lib/firebase/question-bank';
import { getTaxonomyNodesByTrack } from '@/lib/firebase/taxonomy';
import { getTopicSections } from '@/lib/firebase/guide';
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
    <div className={cn("relative border border-[#c4d6c4] dark:border-emerald-800/50 rounded-lg p-2 pt-3 focus-within:border-[#4a634a] dark:border-emerald-500/50 focus-within:ring-1 focus-within:ring-[#4a634a] dark:focus-within:ring-emerald-500 transition-colors bg-[#fdfefd] dark:bg-slate-900", className)}>
        <label className="absolute top-0 left-2 -translate-y-1/2 bg-[#fdfefd] dark:bg-slate-900 px-1 text-[10px] font-medium text-[#4a634a] dark:text-emerald-400 pointer-events-none">
            {label}
        </label>
        <Input className="border-0 focus-visible:ring-0 p-0 h-auto rounded-none bg-transparent shadow-none text-sm font-medium" {...props} />
    </div>
);

const MD3SelectField = ({ label, value, placeholder, onClick, required }: { label: string, value: string, placeholder: string, onClick: () => void, required?: boolean }) => (
    <div onClick={onClick} className="relative border border-[#c4d6c4] dark:border-emerald-800/50 rounded-lg p-2 pt-3 cursor-pointer hover:bg-[#f4f8f4] dark:bg-emerald-900/20 transition-colors bg-[#fdfefd] dark:bg-slate-900">
        <label className="absolute top-0 left-2 -translate-y-1/2 bg-[#fdfefd] dark:bg-slate-900 px-1 text-[10px] font-medium text-[#4a634a] dark:text-emerald-400 pointer-events-none">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex items-center justify-between min-h-[16px] mt-0.5">
            <span className={cn("text-sm font-medium truncate pr-2", value ? "text-slate-900" : "text-slate-400 dark:text-slate-500")}>{value || placeholder}</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
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
  
  const getDefaultMarks = (type?: string) => {
      const t = (type || '').toLowerCase();
      if (t === 'desc') return 3;
      if (t === 'cq') return 5;
      return 1;
  };

  const [editData, setEditData] = useState<Partial<QuestionBankEntry>>({
      questionType: 'MCQ',
      difficulty: 'Medium',
      status: 'Published',
      language: 'English',
      contentType: defaultContentType || initialData.contentType,
      options: { a: '', b: '', c: '', d: '', e: '' },
      matchingPairs: [{ left: '', right: '' }, { left: '', right: '' }, { left: '', right: '' }, { left: '', right: '' }],
      marks: initialData.marks || getDefaultMarks(initialData.questionType || 'MCQ'),
      examIds: [],
      qaChecklist: [],
      ...initialData
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isFetchingSource, setIsFetchingSource] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [uploadingPairImage, setUploadingPairImage] = useState<{idx: number, side: 'left'|'right'} | null>(null);

  // Bulk Import State
  const [showSampleJsonDialog, setShowSampleJsonDialog] = useState(false);
  const [showBulkImportDialog, setShowBulkImportDialog] = useState(false);
  const [bulkImportText, setBulkImportText] = useState('');
  const [copiedSample, setCopiedSample] = useState<string | false>(false);
  const [previewQuestions, setPreviewQuestions] = useState<any[] | null>(null);

  // Auto-Generate State
  const [showAutoGenerateDialog, setShowAutoGenerateDialog] = useState(false);
  const [autoGeneratePrompt, setAutoGeneratePrompt] = useState('');
  const [autoGenerateSourceText, setAutoGenerateSourceText] = useState('');

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

  const sampleJSONData: Record<string, string> = {
    MCQ: `[\n  {\n    "Question Type": "MCQ",\n    "Question": "What is the capital of France?",\n    "Language": "English",\n    "Option A": "London",\n    "Option B": "Berlin",\n    "Option C": "Paris",\n    "Option D": "Madrid",\n    "Correct Answer": "c",\n    "Explanation": "Paris is the capital of France.",\n    "Explanation A": "London is the capital of the UK.",\n    "Explanation B": "Berlin is the capital of Germany.",\n    "Explanation C": "Correct! Paris is the capital of France.",\n    "Explanation D": "Madrid is the capital of Spain.",\n    "Difficulty": "Easy",\n    "Subject": "Geography",\n    "Chapter": "Europe"\n  }\n]`,
    "T/F": `[\n  {\n    "Question Type": "T/F",\n    "Question": "The earth is flat.",\n    "Language": "English",\n    "Correct Answer": "false",\n    "Explanation": "Scientific evidence shows the Earth is roughly spherical."\n  }\n]`,
    FIB: `[\n  {\n    "Question Type": "FIB",\n    "Question": "The color of the sky is [blank] and the grass is [blank].",\n    "Language": "English",\n    "Correct Answer": "blue, green",\n    "Option A": "red",\n    "Option B": "yellow",\n    "Option C": "purple",\n    "Option D": "orange",\n    "Explanation": "During the day, a clear sky is blue, and healthy grass contains chlorophyll making it green."\n  }\n]`,
    Match: `[\n  {\n    "Question Type": "Match",\n    "Question": "Match the following countries with their capitals",\n    "Language": "English",\n    "matchingPairs": [\n      { "left": "France", "right": "Paris" },\n      { "left": "UK", "right": "London" }\n    ],\n    "Explanation": "Paris is the capital of France, and London is the capital of the UK."\n  }\n]`,
    Desc: `[\n  {\n    "Question Type": "Desc",\n    "Question": "Explain Newton's first law of motion.",\n    "Language": "English",\n    "Answer": "An object will remain at rest or in uniform motion...",\n    "Explanation": "Also known as the law of inertia."\n  }\n]`
  };

  const processBulkImportPreview = (content: string) => {
      try {
          const parsed = JSON.parse(content);
          
          if (!Array.isArray(parsed)) {
              throw new Error("JSON must be an array of questions.");
          }
          
          // Helper to map custom human-readable format to internal format
          const mapCustomFormat = (raw: any) => {
              if (!raw["Question"] && !raw["Question Type"]) return raw;
              
              const qTypeMap: Record<string, string> = { 
                  "Multiple Choice": "MCQ", "MCQ": "MCQ", 
                  "Descriptive": "Desc", "Desc": "Desc", 
                  "True/False": "T/F", "T/F": "T/F", 
                  "Fill in the Blank": "FIB", "FIB": "FIB", 
                  "Matching": "Match", "Match": "Match",
                  "CQ": "CQ"
              };
              const getVal = (obj: any, key: string) => {
                  if (!obj) return undefined;
                  const found = Object.keys(obj).find(k => k.toLowerCase().trim() === key.toLowerCase().trim());
                  return found ? obj[found] : undefined;
              };

              const options: any = raw.options || {};
              if (getVal(raw, "Option A")) options.a = getVal(raw, "Option A");
              if (getVal(raw, "Option B")) options.b = getVal(raw, "Option B");
              if (getVal(raw, "Option C")) options.c = getVal(raw, "Option C");
              if (getVal(raw, "Option D")) options.d = getVal(raw, "Option D");
              if (getVal(raw, "Option E")) options.e = getVal(raw, "Option E");

              const optionExplanations: any = raw.optionExplanations || raw["Option Explanations"] || {};
              if (getVal(raw, "Explanation A")) optionExplanations.a = getVal(raw, "Explanation A");
              if (getVal(raw, "Explanation B")) optionExplanations.b = getVal(raw, "Explanation B");
              if (getVal(raw, "Explanation C")) optionExplanations.c = getVal(raw, "Explanation C");
              if (getVal(raw, "Explanation D")) optionExplanations.d = getVal(raw, "Explanation D");
              if (getVal(raw, "Explanation E")) optionExplanations.e = getVal(raw, "Explanation E");

              const mappedType = qTypeMap[raw["Question Type"]] || raw.questionType || "MCQ";
              let correct = raw["Correct Answer"] || raw["Answer"] || raw["Answer Key"] || raw.correctAnswer || "";
              if (typeof correct === 'string' && ['MCQ', 'T/F'].includes(mappedType)) {
                  correct = correct.toLowerCase().trim();
              }

              return {
                  ...raw,
                  questionText: raw["Question"] || raw.questionText,
                  questionType: mappedType,
                  options: Object.keys(options).length > 0 ? options : undefined,
                  correctAnswer: correct,
                  explanation: raw["Explanation"] || raw.explanation,
                  optionExplanations: Object.keys(optionExplanations).length > 0 ? optionExplanations : undefined,
                  difficulty: raw["Difficulty"] || raw.difficulty,
                  language: raw["Language"] || raw.language,
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
          setPreviewQuestions(cleanQuestions);
      } catch(err: any) {
          console.error("Bulk import error:", err);
          toast({ title: 'Invalid JSON', description: err.message, variant: 'destructive' });
      }
  };

  const confirmBulkImport = async () => {
      if (!previewQuestions || previewQuestions.length === 0) return;
      setIsSaving(true);
      try {
          await bulkCreateQuestions(previewQuestions);
          toast({ title: 'Success', description: `Successfully imported ${previewQuestions.length} questions!` });
          setShowBulkImportDialog(false);
          setBulkImportText('');
          setPreviewQuestions(null);
      } catch(err: any) {
          console.error("Bulk import error:", err);
          toast({ title: 'Import Failed', description: err.message, variant: 'destructive' });
      } finally {
          setIsSaving(false);
      }
  };

  const handleBulkImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = async (event) => {
          const content = event.target?.result as string;
          processBulkImportPreview(content);
          if (e.target) e.target.value = ''; // Reset input
      };
      reader.readAsText(file);
  };

  const handleSave = async () => {
      if (!editData.questionText) {
          toast({ title: 'Validation Error', description: 'Question Text is required.', variant: 'destructive' });
          return;
      }
      if (!['Match', 'Desc', 'CQ'].includes(editData.questionType || 'MCQ') && !editData.correctAnswer) {
          toast({ title: 'Validation Error', description: 'Correct Answer is required.', variant: 'destructive' });
          return;
      }
      if (editData.questionType === 'Match') {
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
          
          if (cleanDataToSave.options) {
              Object.keys(cleanDataToSave.options).forEach(k => {
                  if (!cleanDataToSave.options[k] || String(cleanDataToSave.options[k]).trim() === '') {
                      delete cleanDataToSave.options[k];
                  }
              });
          }
          
          if (cleanDataToSave.optionExplanations) {
              Object.keys(cleanDataToSave.optionExplanations).forEach(k => {
                  if (!cleanDataToSave.optionExplanations[k] || String(cleanDataToSave.optionExplanations[k]).trim() === '') {
                      delete cleanDataToSave.optionExplanations[k];
                  }
              });
              if (Object.keys(cleanDataToSave.optionExplanations).length === 0) {
                  delete cleanDataToSave.optionExplanations;
              }
          }
          
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
                  correctAnswer: editData.correctAnswer,
                  language: editData.language || 'Bangla'
              })
          });
          const data = await res.json();
          if (data.explanation) {
              setEditData(prev => ({ 
                ...prev, 
                explanation: data.explanation,
                optionExplanations: data.optionExplanations || prev.optionExplanations
              }));
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

  const handleAutoGenerateFullQuestion = async () => {
      setIsGeneratingAI(true);
      try {
          // Gather taxonomy names
          const boardName = boards.find(b => b.id === editData.boardId)?.name || 'Any Board';
          const className = classes.find(b => b.id === editData.classId)?.name || 'Any Class';
          const subjectName = subjects.find(b => b.id === editData.subjectId)?.name || 'Any Subject';
          const textbookName = textbooks.find(b => b.id === editData.textbookId)?.name || 'Any Textbook';
          const chapterName = chapters.find(b => b.id === editData.chapterId)?.name || 'Any Chapter';
          const topicName = topics.find(b => b.id === editData.topicId)?.name || 'Any Topic';
          
          const prompt = `You are an expert curriculum designer and educator. 
  Generate a HIGH-QUALITY, STANDARD academic question based on the following context.
  Test deep understanding rather than simple recall. If applicable, create plausible and tricky distractors for the options.
  IMPORTANT: Option text MUST be extremely short and concise (typically 1-4 words). NEVER write full sentences, explanations, or examples inside the options. Explanations belong ONLY in the 'optionExplanations' and 'explanation' fields.
  
  - Board: ${boardName}
  - Class/Grade: ${className}
  - Subject: ${subjectName}
  - Textbook: ${textbookName}
  - Chapter: ${chapterName}
  - Topic: ${topicName}

Requirements:
- Question Type: ${editData.questionType}
- Difficulty: ${editData.difficulty}
- Language: ${editData.language}
${autoGenerateSourceText ? `- Base the question STRICTLY on the following source content:\n\n"""\n${autoGenerateSourceText}\n"""\n` : ''}
${autoGeneratePrompt ? `- Additional Instructions: ${autoGeneratePrompt}` : ''}

Output the result as a strict JSON object with NO markdown formatting, NO markdown code blocks (\`\`\`json). Just the raw JSON object.
  The JSON object must have this exact structure:
  {
    "questionText": "ভাষার বা শব্দের ক্ষুদ্রতম অংশকে কী বলে?",
    "options": {
       "a": "ধ্বনি",
       "b": "বর্ণ",
       "c": "বাক্য",
       "d": "শব্দ"
    },
    "optionExplanations": {
       "a": "সঠিক! শব্দের ক্ষুদ্রতম একক হল ধ্বনি।",
       "b": "বর্ণ হলো ধ্বনির লিখিত রূপ, শব্দের ক্ষুদ্রতম অংশ নয়।",
       "c": "বাক্য হলো একাধিক শব্দের সমষ্টি।",
       "d": "শব্দ হলো ধ্বনির সমষ্টি।"
    },
    "correctAnswer": "a",
    "explanation": "মানুষের মুখের উচ্চারিত শব্দের ক্ষুদ্রতম অংশকে ধ্বনি বলে।",
    "title": "A short, 2-5 word title summarizing the core concept of the question"
  }
If the Question Type is not MCQ, you can omit the options and optionExplanations objects or leave them empty. For T/F, use options 'a': 'True', 'b': 'False'.`;

          const res = await fetch('/api/ai/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt })
          });
          
          const rawData = await res.json();
          if (rawData.error) throw new Error(rawData.error);
          
          const generatedData = rawData;
          
          setEditData(prev => ({
              ...prev,
              title: generatedData.title || prev.title,
              questionText: generatedData.questionText || prev.questionText,
              options: generatedData.options ? { ...prev.options, ...generatedData.options } : prev.options,
              optionExplanations: generatedData.optionExplanations ? { ...prev.optionExplanations, ...generatedData.optionExplanations } : prev.optionExplanations,
              correctAnswer: generatedData.correctAnswer || prev.correctAnswer,
              explanation: generatedData.explanation || prev.explanation,
          }));
          
          setShowAutoGenerateDialog(false);
          toast({ title: 'Question Generated!' });
      } catch (err: any) {
          toast({ title: 'Generation Failed', description: err.message, variant: 'destructive' });
      } finally {
          setIsGeneratingAI(false);
      }
  }

    const openAutoGenerateDialog = async () => {
        setIsFetchingSource(true);
        let sourceContent = '';
        
        try {
            const nodeId = editData.topicId || editData.chapterId;
            if (nodeId) {
                const sections = await getTopicSections(nodeId);
                let rawHtml = '';
                if (sections['lesson']?.content) rawHtml += sections['lesson'].content + '\n';
                if (sections['guide_content']?.content) rawHtml += sections['guide_content'].content + '\n';
                if (sections['notes']?.content) rawHtml += sections['notes'].content + '\n';
                
                // Strip some basic html tags to leave plain text for the AI.
                sourceContent = rawHtml.replace(/<[^>]*>?/gm, ' ').trim();
            }
        } catch (e) {
            console.error("Failed to fetch guide content:", e);
        }

        // Fallback to taxonomy descriptions if no guide content is found
        if (!sourceContent) {
            if (editData.topicId) {
                sourceContent = topics.find(t => t.id === editData.topicId)?.description || '';
            }
            if (!sourceContent && editData.chapterId) {
                sourceContent = chapters.find(c => c.id === editData.chapterId)?.description || '';
            }
            if (!sourceContent && editData.textbookId) {
                sourceContent = textbooks.find(c => c.id === editData.textbookId)?.description || '';
            }
            if (!sourceContent && editData.subjectId) {
                sourceContent = subjects.find(c => c.id === editData.subjectId)?.description || '';
            }
        }
        
        setAutoGenerateSourceText(sourceContent);
        setShowAutoGenerateDialog(true);
        setIsFetchingSource(false);
    };

  return (
      <div className="space-y-4 md:space-y-6 pb-24 md:pb-8">
          {(title || breadcrumbs) && (
              <div className="flex flex-row flex-wrap items-start justify-between gap-4 border-b border-[#eef2ec] dark:border-slate-800 pb-3">
                  <div className="flex-1 min-w-[200px]">
                      {breadcrumbs && (
                          <div className="text-xs text-[#4a634a] dark:text-emerald-400 font-medium mb-1 flex flex-wrap items-center gap-x-1.5 gap-y-1">
                              {breadcrumbs.map((crumb, idx) => (
                                  <React.Fragment key={idx}>
                                      <span>{crumb}</span>
                                      {idx < breadcrumbs.length - 1 && <span className="opacity-50">/</span>}
                                  </React.Fragment>
                              ))}
                          </div>
                      )}
                      {title && <h1 className="text-xl font-bold tracking-tight text-[#2d3b2d] dark:text-emerald-200">{title}</h1>}
                  </div>
                  <div className="grid grid-cols-2 sm:flex sm:flex-row items-center gap-2 shrink-0 mt-3 sm:mt-0 w-full sm:w-auto">
                      <label className="cursor-pointer col-span-2 sm:col-span-1">
                          <input type="file" accept=".json" className="hidden" onChange={handleBulkImport} disabled={isSaving} />
                          <div className={cn(
                              "inline-flex w-full sm:w-auto items-center justify-center whitespace-nowrap text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                              "h-8 rounded-full border border-[#4a634a] dark:border-emerald-500/50 text-[#4a634a] dark:text-emerald-400 bg-transparent hover:bg-[#f4f8f4] dark:bg-emerald-900/20 px-4"
                          )}>
                              <Upload className="w-3 h-3 mr-1.5" />
                              Bulk Add (JSON)
                          </div>
                      </label>
                      <Button variant="outline" size="sm" className="w-full sm:w-auto flex h-8 text-xs rounded-full border-[#4a634a] dark:border-emerald-500/50 text-[#4a634a] dark:text-emerald-400 bg-transparent hover:bg-[#f4f8f4] dark:bg-emerald-900/20 px-4" onClick={() => {
                          setEditData({...editData, status: 'Draft'});
                          handleSave();
                      }} disabled={isSaving}>
                          {isSaving && editData.status === 'Draft' ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : null}
                          Save Draft
                      </Button>
                      <Button size="sm" className="w-full sm:w-auto flex h-8 text-xs rounded-full bg-[#3d5a3d] dark:bg-emerald-600 hover:bg-[#2d442d] dark:bg-emerald-700 text-white px-5 shadow-sm" onClick={() => {
                          setEditData({...editData, status: 'Published'});
                          handleSave();
                      }} disabled={isSaving}>
                          {isSaving && editData.status === 'Published' ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : null}
                          Publish Question
                      </Button>
                  </div>
              </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 items-start">
              {/* Left Section (Content, Options, Explanation) */}
              <div className="lg:col-span-2 flex flex-col gap-2">
                  {/* --- CARD 1: Question Content --- */}
                  <Card className="flex flex-col rounded-lg border-[#d3e3d3] dark:border-emerald-900/50 shadow-sm bg-[#fdfefd] dark:bg-slate-900 overflow-hidden">
                      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-[#eef2ec] dark:border-slate-800 bg-[#f8faf8] dark:bg-slate-900">
                          <CardTitle className="text-[#2d3b2d] dark:text-emerald-200ase text-[#4a634a] dark:text-emerald-400">Question Content</CardTitle>
                          <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="h-8 text-[#4a634a] dark:text-emerald-400 font-medium" onClick={openAutoGenerateDialog} disabled={isFetchingSource}>
                                    {isFetchingSource ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1.5" />}
                                    <span className="hidden sm:inline">{isFetchingSource ? 'Fetching...' : 'Auto-Generate'}</span>
                                </Button>
                              <Button variant="outline" size="icon" className="h-8 w-8 text-[#4a634a] dark:text-emerald-400" title="Sample JSON Format" onClick={() => setShowSampleJsonDialog(true)}>
                                  <FileJson className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="icon" className="h-8 w-8 text-[#4a634a] dark:text-emerald-400" title="Bulk Import Questions" onClick={() => setShowBulkImportDialog(true)}>
                                  <Upload className="w-4 h-4" />
                              </Button>
                          </div>
                      </CardHeader>
                      <CardContent className="space-y-3 flex-1 flex flex-col pt-3">
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                              <div className="relative border border-[#c4d6c4] dark:border-emerald-800/50 rounded-lg pt-2 pb-1 hover:bg-[#f4f8f4] dark:bg-emerald-900/20 transition-colors bg-white dark:bg-slate-950 focus-within:border-[#4a634a] dark:border-emerald-500/50 focus-within:ring-1 focus-within:ring-[#4a634a] dark:focus-within:ring-emerald-500">
                                  <label className="absolute top-0 left-2 -translate-y-1/2 bg-white dark:bg-slate-950 px-1 text-[10px] font-medium text-[#4a634a] dark:text-emerald-400 pointer-events-none">Question Type</label>
                                  <Select value={editData.questionType as string} onValueChange={v => {
                                      const newMarks = getDefaultMarks(v);
                                      setEditData({...editData, questionType: v as any, marks: newMarks});
                                  }}>
                                      <SelectTrigger className="border-0 focus:ring-0 shadow-none h-8 pt-0 bg-transparent font-medium text-[#2d3b2d] dark:text-emerald-200">
                                          <SelectValue placeholder="Select type" />
                                      </SelectTrigger>
                                      <SelectContent>
                                          <SelectItem value="MCQ">MCQ</SelectItem>
                                          <SelectItem value="T/F">T/F</SelectItem>
                                          <SelectItem value="FIB">FIB</SelectItem>
                                          <SelectItem value="Match">Match</SelectItem>
                                          <SelectItem value="CQ">CQ</SelectItem>
                                          <SelectItem value="Desc">Desc</SelectItem>
                                      </SelectContent>
                                  </Select>
                              </div>
                              <div className="relative border border-[#c4d6c4] dark:border-emerald-800/50 rounded-lg pt-2 pb-1 hover:bg-[#f4f8f4] dark:bg-emerald-900/20 transition-colors bg-white dark:bg-slate-950 focus-within:border-[#4a634a] dark:border-emerald-500/50 focus-within:ring-1 focus-within:ring-[#4a634a] dark:focus-within:ring-emerald-500">
                                  <label className="absolute top-0 left-2 -translate-y-1/2 bg-white dark:bg-slate-950 px-1 text-[10px] font-medium text-[#4a634a] dark:text-emerald-400 pointer-events-none">Question Language</label>
                                  <Select value={editData.language as string} onValueChange={v => setEditData({...editData, language: v as any})}>
                                      <SelectTrigger className="border-0 focus:ring-0 shadow-none h-8 pt-0 bg-transparent font-medium text-[#2d3b2d] dark:text-emerald-200">
                                          <SelectValue placeholder="Select language" />
                                      </SelectTrigger>
                                      <SelectContent>
                                          <SelectItem value="English">English</SelectItem>
                                          <SelectItem value="Bangla">Bangla</SelectItem>
                                          <SelectItem value="Hindi">Hindi</SelectItem>
                                          <SelectItem value="Bengali, English">Bengali, English</SelectItem>
                                      </SelectContent>
                                  </Select>
                              </div>
                              <MD3SelectField 
                                  label="Exam Year / Source" 
                                  placeholder="Select Year" 
                                  value={years.find(b => b.id === editData.yearId)?.name || ''} 
                                  onClick={() => openTaxonomySheet('year', 'Select Exam Year', years, editData.yearId || '', (v) => setEditData({...editData, yearId: v}))} 
                              />
                              <div className="relative border border-[#c4d6c4] dark:border-emerald-800/50 rounded-lg pt-2 pb-1 hover:bg-[#f4f8f4] dark:bg-emerald-900/20 transition-colors bg-white dark:bg-slate-950 focus-within:border-[#4a634a] dark:border-emerald-500/50 focus-within:ring-1 focus-within:ring-[#4a634a] dark:focus-within:ring-emerald-500">
                                  <label className="absolute top-0 left-2 -translate-y-1/2 bg-white dark:bg-slate-950 px-1 text-[10px] font-medium text-[#4a634a] dark:text-emerald-400 pointer-events-none">Marks</label>
                                  <Input 
                                      type="number" 
                                      min="1" 
                                      className="border-0 focus-visible:ring-0 shadow-none h-8 pt-0 bg-transparent font-medium text-[#2d3b2d] dark:text-emerald-200"
                                      placeholder="e.g. 1"
                                      value={editData.marks || ''}
                                      onChange={e => setEditData({...editData, marks: parseInt(e.target.value) || undefined})}
                                  />
                              </div>
                          </div>
                          <MD3Input 
                              label="Question Title (Optional)" 
                              placeholder="E.g. Newton's First Law" 
                              value={editData.title || ''} 
                              onChange={e => setEditData({...editData, title: e.target.value})} 
                          />
                          <div className="flex-1 flex flex-col">
                              <label className="text-sm font-semibold mb-2 block text-[#4a634a] dark:text-emerald-400">Question Text <span className="text-red-500">*</span></label>
                              <Textarea className="flex-1 min-h-[120px] resize-none border-[#c4d6c4] dark:border-emerald-800/50 focus-visible:ring-[#4a634a] dark:focus-visible:ring-emerald-500 rounded-xl" placeholder="Enter question content here..." value={editData.questionText || ''} onChange={e => setEditData({...editData, questionText: e.target.value})} />
                          </div>
                          <div className="pt-2 border-t border-[#eef2ec] dark:border-slate-800">
                              <label className="text-sm font-semibold mb-3 block text-[#4a634a] dark:text-emerald-400">Media Attachments</label>
                              <div className="flex flex-wrap gap-3">
                                  {/* Image Upload Button */}
                                  <label className="flex items-center gap-2 px-4 py-2 border border-[#c4d6c4] dark:border-emerald-800/50 rounded-full cursor-pointer hover:bg-[#f4f8f4] dark:bg-emerald-900/20 transition-colors bg-white dark:bg-slate-950 text-sm font-medium text-[#4a634a] dark:text-emerald-400">
                                      {isUploadingMedia ? <Loader2 className="h-4 w-4 animate-spin"/> : <ImageIcon className="h-4 w-4"/>}
                                      Image
                                      <input type="file" className="hidden" accept="image/*" onChange={e => handleMediaUpload(e, 'questionImage')} disabled={isUploadingMedia} />
                                  </label>
                                  {/* Audio Upload Button */}
                                  <label className="flex items-center gap-2 px-4 py-2 border border-[#c4d6c4] dark:border-emerald-800/50 rounded-full cursor-pointer hover:bg-[#f4f8f4] dark:bg-emerald-900/20 transition-colors bg-white dark:bg-slate-950 text-sm font-medium text-[#4a634a] dark:text-emerald-400">
                                      {isUploadingMedia ? <Loader2 className="h-4 w-4 animate-spin"/> : <Play className="h-4 w-4"/>}
                                      Audio
                                      <input type="file" className="hidden" accept="audio/*" onChange={e => handleMediaUpload(e, 'questionAudio')} disabled={isUploadingMedia} />
                                  </label>
                                  {/* Video Upload Button */}
                                  <label className="flex items-center gap-2 px-4 py-2 border border-[#c4d6c4] dark:border-emerald-800/50 rounded-full cursor-pointer hover:bg-[#f4f8f4] dark:bg-emerald-900/20 transition-colors bg-white dark:bg-slate-950 text-sm font-medium text-[#4a634a] dark:text-emerald-400">
                                      {isUploadingMedia ? <Loader2 className="h-4 w-4 animate-spin"/> : <Video className="h-4 w-4"/>}
                                      Video
                                      <input type="file" className="hidden" accept="video/*" onChange={e => handleMediaUpload(e, 'questionVideo')} disabled={isUploadingMedia} />
                                  </label>
                              </div>
                              {/* Display uploaded media status */}
                              {(editData.questionImage || editData.questionAudio || editData.questionVideo) && (
                                  <div className="mt-3 flex flex-col gap-2">
                                      {editData.questionImage && (
                                          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-2 rounded-md border text-sm">
                                              <span className="truncate max-w-[150px]"><ImageIcon className="w-4 h-4 inline mr-1"/> Image</span>
                                              <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteMedia(editData.questionImage, 'questionImage')}><Trash2 className="w-3 h-3" /></Button>
                                          </div>
                                      )}
                                      {editData.questionAudio && (
                                          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-2 rounded-md border text-sm">
                                              <span className="truncate max-w-[150px]"><Play className="w-4 h-4 inline mr-1"/> Audio</span>
                                              <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteMedia(editData.questionAudio, 'questionAudio')}><Trash2 className="w-3 h-3" /></Button>
                                          </div>
                                      )}
                                      {editData.questionVideo && (
                                          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-2 rounded-md border text-sm">
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
                  <Card className="flex flex-col rounded-lg border-[#d3e3d3] dark:border-emerald-900/50 shadow-sm bg-[#fdfefd] dark:bg-slate-900 overflow-hidden">
                      <CardHeader className="pb-2 border-b border-[#eef2ec] dark:border-slate-800 bg-[#f8faf8] dark:bg-slate-900">
                          <CardTitle className="text-[#2d3b2d] dark:text-emerald-200ase text-[#4a634a] dark:text-emerald-400">{editData.questionType === 'Match' ? 'Matching Pairs' : 'Options / Answer'}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 flex-1 pt-3">
                          {editData.questionType === 'Match' ? (
                              <div className="space-y-3">
                                  <div className="grid grid-cols-2 gap-4">
                                      <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Left Column (Items)</div>
                                      <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Right Column (Matches)</div>
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
                                                          <button className="w-9 h-9 shrink-0 border border-[#d3e3d3] dark:border-emerald-900/50ashed rounded flex items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500">
                                                              {uploadingPairImage?.idx === idx && uploadingPairImage?.side === 'left' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                                                          </button>
                                                      </PopoverTrigger>
                                                      <PopoverContent className="w-64 p-3" side="top">
                                                          <div className="space-y-3">
                                                              <div>
                                                                  <label className="text-xs font-medium mb-1 block">Upload from device</label>
                                                                  <label className="flex items-center justify-center w-full h-8 border border-[#d3e3d3] dark:border-emerald-900/50ashed rounded text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                                                                      <Upload className="w-3 h-3 mr-2" />
                                                                      Choose file...
                                                                      <input type="file" className="hidden" accept="image/*" onChange={e => handlePairImageUpload(e, idx, 'left')} disabled={uploadingPairImage !== null} />
                                                                  </label>
                                                              </div>
                                                              <div className="relative flex items-center py-1">
                                                                  <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
                                                                  <span className="flex-shrink-0 mx-2 text-[10px] text-slate-400 dark:text-slate-500 uppercase">Or</span>
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
                                                          <button className="w-9 h-9 shrink-0 border border-[#d3e3d3] dark:border-emerald-900/50ashed rounded flex items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500">
                                                              {uploadingPairImage?.idx === idx && uploadingPairImage?.side === 'right' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                                                          </button>
                                                      </PopoverTrigger>
                                                      <PopoverContent className="w-64 p-3" side="top">
                                                          <div className="space-y-3">
                                                              <div>
                                                                  <label className="text-xs font-medium mb-1 block">Upload from device</label>
                                                                  <label className="flex items-center justify-center w-full h-8 border border-[#d3e3d3] dark:border-emerald-900/50ashed rounded text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                                                                      <Upload className="w-3 h-3 mr-2" />
                                                                      Choose file...
                                                                      <input type="file" className="hidden" accept="image/*" onChange={e => handlePairImageUpload(e, idx, 'right')} disabled={uploadingPairImage !== null} />
                                                                  </label>
                                                              </div>
                                                              <div className="relative flex items-center py-1">
                                                                  <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
                                                                  <span className="flex-shrink-0 mx-2 text-[10px] text-slate-400 dark:text-slate-500 uppercase">Or</span>
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
                                  }} className="mt-2 text-[#2d3b2d] dark:text-emerald-200lue-600 border-blue-200 hover:bg-blue-50">
                                      + Add Pair
                                  </Button>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Pairs will be shuffled automatically when displayed to students.</p>
                              </div>
                          ) : ['MCQ'].includes(editData.questionType || 'MCQ') ? (
                              <div className="space-y-3">
                                  {['A', 'B', 'C', 'D'].map((optKey) => {
                                      const keyLower = optKey.toLowerCase() as keyof typeof editData.options;
                                      return (
                                      <div key={optKey} className="flex flex-col gap-2">
                                          <div className="flex items-center gap-3">
                                              <button 
                                                  className={cn("w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-colors", editData.correctAnswer?.toUpperCase() === optKey ? "border-[#4a634a] dark:border-emerald-500/50 border-[#eef2ec] dark:border-slate-800 bg-transparent" : "border-[#c4d6c4] dark:border-emerald-800/50")}
                                                  onClick={() => setEditData({...editData, correctAnswer: optKey})}
                                              >
                                                  {editData.correctAnswer?.toUpperCase() === optKey && <div className="w-3 h-3 bg-[#4a634a] rounded-full" />}
                                              </button>
                                              <div className="flex-1">
                                                  <MD3Input label={`Option ${optKey}`} placeholder={`Option ${optKey}`} value={editData.options?.[keyLower] || ''} onChange={e => setEditData({...editData, options: {...editData.options!, [keyLower]: e.target.value}})} />
                                              </div>
                                              <button className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400 shrink-0 px-2" onClick={() => setEditData({...editData, options: {...editData.options!, [keyLower]: ''}})}><X className="w-4 h-4" /></button>
                                          </div>
                                          {(editData.options?.[keyLower] || editData.optionExplanations?.[keyLower]) && (
                                              <div className="pl-9 pr-9">
                                                  <Input 
                                                      className="text-xs border-[#eef2ec] dark:border-slate-800 bg-[#f4f8f4]/50 dark:bg-slate-900 focus-visible:ring-[#4a634a] dark:focus-visible:ring-emerald-500 rounded-lg h-7 w-full" 
                                                      placeholder={`Explanation for why ${optKey} is correct/incorrect (Optional)`}
                                                      value={editData.optionExplanations?.[keyLower] || ''}
                                                      onChange={e => {
                                                          const newExp = { ...(editData.optionExplanations || {}) } as any;
                                                          newExp[keyLower] = e.target.value;
                                                          setEditData({...editData, optionExplanations: newExp});
                                                      }}
                                                  />
                                              </div>
                                          )}
                                      </div>
                                  )})}

                              </div>
                          ) : ['T/F'].includes(editData.questionType || '') ? (
                              <div className="space-y-4">
                                  <label className="text-sm font-medium">Select Correct Answer</label>
                                  <div className="flex gap-4">
                                      <label className={cn("flex flex-1 items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-slate-50 dark:bg-slate-900", editData.correctAnswer === 'True' && "border-blue-500 bg-blue-50")}>
                                          <input type="radio" name="correctAnswer" checked={editData.correctAnswer === 'True'} onChange={() => setEditData({...editData, correctAnswer: 'True'})} className="w-4 h-4 text-[#2d3b2d] dark:text-emerald-200lue-600" />
                                          <span className="font-semibold text-slate-700 dark:text-slate-300">True</span>
                                      </label>
                                      <label className={cn("flex flex-1 items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-slate-50 dark:bg-slate-900", editData.correctAnswer === 'False' && "border-blue-500 bg-blue-50")}>
                                          <input type="radio" name="correctAnswer" checked={editData.correctAnswer === 'False'} onChange={() => setEditData({...editData, correctAnswer: 'False'})} className="w-4 h-4 text-[#2d3b2d] dark:text-emerald-200lue-600" />
                                          <span className="font-semibold text-slate-700 dark:text-slate-300">False</span>
                                      </label>
                                  </div>
                              </div>
                          ) : ['FIB'].includes(editData.questionType || '') ? (
                              <div className="space-y-4">
                                  <div className="p-3 bg-blue-50 border border-blue-200 text-[#2d3b2d] dark:text-emerald-200lue-800 rounded-lg text-sm dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
                                      <strong>How to create blanks:</strong> Type <code className="bg-white dark:bg-slate-800 px-1 rounded text-[#2d3b2d] dark:text-emerald-200lue-600 dark:text-blue-400">[blank]</code> anywhere in the Question Text above to create a gap. You can add multiple blanks.
                                  </div>
                                  <div>
                                      <label className="text-sm font-medium">Correct Answer(s) in Order</label>
                                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Separate answers for each blank with commas (e.g. "Paris, Tokyo").</p>
                                      <Input 
                                          value={editData.correctAnswer || ''} 
                                          onChange={e => setEditData({...editData, correctAnswer: e.target.value})} 
                                          placeholder="Enter correct answers..."
                                      />
                                  </div>
                                  <div className="pt-2">
                                      <label className="text-sm font-medium">Word Bank Distractors (Optional)</label>
                                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Add extra wrong words to the drag-and-drop word bank to make it harder.</p>
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
                                  <label className="text-sm font-medium">Answer / Answer Key</label>
                                  <div className="prose-editor-container border border-[#c4d6c4] dark:border-emerald-800/50 rounded-xl overflow-hidden mt-2">
                                      <TiptapEditor 
                                          content={editData.correctAnswer || ''} 
                                          onChange={(html) => setEditData({...editData, correctAnswer: html})} 
                                      />
                                  </div>
                              </div>
                          )}
                      </CardContent>
                  </Card>

                  {/* --- CARD 3: Explanation --- */}
                  {!['Desc', 'CQ'].includes(editData.questionType || '') && (
                      <Card className="rounded-lg border-[#d3e3d3] dark:border-emerald-900/50 shadow-sm bg-[#fdfefd] dark:bg-slate-900 overflow-hidden">
                          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-[#eef2ec] dark:border-slate-800 bg-[#f8faf8] dark:bg-slate-900">
                              <CardTitle className="text-[#2d3b2d] dark:text-emerald-200ase text-[#4a634a] dark:text-emerald-400">Explanation</CardTitle>
                              <Button variant="outline" size="sm" onClick={handleGenerateAI} disabled={isGeneratingAI} className="h-7 text-xs rounded-lg text-[#4a634a] dark:text-emerald-400 border-[#c4d6c4] dark:border-emerald-800/50 bg-[#fdfefd] dark:bg-slate-900 hover:bg-[#f4f8f4] dark:bg-emerald-900/20">
                                  {isGeneratingAI ? <Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1.5" />}
                                  Generate with AI
                              </Button>
                          </CardHeader>
                          <CardContent className="pt-3">
                              <div className="prose-editor-container">
                                  <TiptapEditor 
                                      content={editData.explanation || ''} 
                                      onChange={(html) => setEditData({...editData, explanation: html})} 
                                  />
                              </div>
                          </CardContent>
                      </Card>
                  )}
              </div>

              {/* Right Column: Taxonomy and Meta */}
              <div className="space-y-2 flex flex-col">
                  {/* --- CARD 4: Academic Taxonomy --- */}
                  {(editData.contentType === 'academic' || defaultContentType === 'academic' || (!editData.contentType && (editData.boardId || editData.classId || !editData.examIds?.length))) && (
                      <Card className="rounded-lg border-[#d3e3d3] dark:border-emerald-900/50 shadow-sm bg-[#fdfefd] dark:bg-slate-900 overflow-hidden">
                          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-[#eef2ec] dark:border-slate-800 bg-[#f8faf8] dark:bg-slate-900">
                          <CardTitle className="text-[#2d3b2d] dark:text-emerald-200ase text-[#4a634a] dark:text-emerald-400">Academic Taxonomy</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-3">
                          <div className="grid grid-cols-2 gap-4">
                              <MD3SelectField 
                                  label="Board" 
                                  placeholder="Board" 
                                  required
                                  value={boards.find(b => b.id === editData.boardId)?.name || ''} 
                                  onClick={() => openTaxonomySheet('board', 'Select Board', boards, editData.boardId || '', (v) => setEditData({...editData, boardId: v, classId: '', subjectId: '', textbookId: '', chapterId: '', topicId: ''}))} 
                              />
                              <MD3SelectField 
                                  label="Class" 
                                  placeholder="Class" 
                                  required
                                  value={classes.find(b => b.id === editData.classId)?.name || ''} 
                                  onClick={() => openTaxonomySheet('class', 'Select Class', classes.filter(b => !editData.boardId || b.parentId === editData.boardId), editData.classId || '', (v) => setEditData({...editData, classId: v, subjectId: '', textbookId: '', chapterId: '', topicId: ''}))} 
                              />
                          </div>
                          <MD3SelectField 
                              label="Subject" 
                              placeholder="Subject" 
                              required
                              value={subjects.find(b => b.id === editData.subjectId)?.name || ''} 
                              onClick={() => openTaxonomySheet('subject', 'Select Subject', subjects.filter(b => !editData.classId || b.parentId === editData.classId), editData.subjectId || '', (v) => setEditData({...editData, subjectId: v, textbookId: '', chapterId: '', topicId: ''}))} 
                          />
                          <div className="grid grid-cols-1 gap-4">
                              <MD3SelectField 
                                  label="Textbook" 
                                  placeholder="Textbook" 
                                  value={textbooks.find(b => b.id === editData.textbookId)?.name || ''} 
                                  onClick={() => openTaxonomySheet('textbook', 'Select Textbook', textbooks.filter(b => !editData.subjectId || b.parentId === editData.subjectId), editData.textbookId || '', (v) => setEditData({...editData, textbookId: v, chapterId: '', topicId: ''}))} 
                              />
                          </div>
                          <div className="grid grid-cols-1 gap-4">
                              <MD3SelectField 
                                  label="Chapter" 
                                  placeholder="Chapter" 
                                  required
                                  value={chapters.find(b => b.id === editData.chapterId)?.name || ''} 
                                  onClick={() => openTaxonomySheet('chapter', 'Select Chapter', chapters.filter(b => !editData.textbookId || b.parentId === editData.textbookId), editData.chapterId || '', (v) => setEditData({...editData, chapterId: v, topicId: ''}))} 
                              />
                              <MD3SelectField 
                                  label="Topic" 
                                  placeholder="Topic" 
                                  required
                                  value={topics.find(b => b.id === editData.topicId)?.name || ''} 
                                  onClick={() => openTaxonomySheet('topic', 'Select Topic', topics.filter(b => !editData.chapterId || b.parentId === editData.chapterId), editData.topicId || '', (v) => setEditData({...editData, topicId: v}))} 
                              />
                          </div>
                      </CardContent>
                      </Card>
                  )}

                  {/* --- CARD 5: Publish Settings --- */}
                  <Card className="rounded-lg border-[#d3e3d3] dark:border-emerald-900/50 shadow-sm bg-[#fdfefd] dark:bg-slate-900 overflow-hidden">
                      <CardHeader className="pb-2 border-b border-[#eef2ec] dark:border-slate-800 bg-[#f8faf8] dark:bg-slate-900"><CardTitle className="text-[#2d3b2d] dark:text-emerald-200ase text-[#4a634a] dark:text-emerald-400">Publish Settings</CardTitle></CardHeader>
                      <CardContent className="space-y-3 pt-3">
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
                              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-full p-1 w-full border">
                                  <button onClick={() => setEditData({...editData, difficulty: 'Easy'})} className={cn("flex-1 text-xs py-1.5 rounded-full font-medium transition-colors", editData.difficulty === 'Easy' ? "bg-green-100 text-green-800 shadow-sm border border-green-200" : "text-slate-600 dark:text-slate-400 hover:text-slate-900")}>Easy</button>
                                  <button onClick={() => setEditData({...editData, difficulty: 'Medium'})} className={cn("flex-1 text-xs py-1.5 rounded-full font-medium transition-colors", editData.difficulty === 'Medium' ? "bg-green-100 text-green-800 shadow-sm border border-green-200" : "text-slate-600 dark:text-slate-400 hover:text-slate-900")}>Medium</button>
                                  <button onClick={() => setEditData({...editData, difficulty: 'Hard'})} className={cn("flex-1 text-xs py-1.5 rounded-full font-medium transition-colors", editData.difficulty === 'Hard' ? "bg-green-100 text-green-800 shadow-sm border border-green-200" : "text-slate-600 dark:text-slate-400 hover:text-slate-900")}>Hard</button>
                              </div>
                          </div>
                          <div>
                              <label className="text-xs font-semibold mb-2 block">Tags</label>
                              {tags.length === 0 ? (
                                  <p className="text-xs text-slate-500 dark:text-slate-400">No tags defined yet.</p>
                              ) : (
                                  <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto">
                                      {tags.map(tag => (
                                          <div key={tag.id} 
                                               className={cn("text-xs flex items-center gap-1 px-2 py-1 rounded-full border cursor-pointer select-none transition-colors", 
                                                 (editData.tags || []).includes(tag.name) ? "bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium" : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-900"
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
                                              {(editData.tags || []).includes(tag.name) && <X className="w-3 h-3 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400" />}
                                          </div>
                                      ))}
                                  </div>
                              )}
                          </div>
                      </CardContent>
                  </Card>

                  {/* --- CARD 6: Exams Taxonomy --- */}
                  {(editData.contentType === 'exam' || defaultContentType === 'exam' || (!editData.contentType && editData.examIds && editData.examIds.length > 0)) && (
                      <Card className="rounded-lg border-[#d3e3d3] dark:border-emerald-900/50 shadow-sm bg-[#fdfefd] dark:bg-slate-900 overflow-hidden mt-2">
                          <CardHeader className="pb-2 border-b border-[#eef2ec] dark:border-slate-800 bg-[#f8faf8] dark:bg-slate-900"><CardTitle className="text-[#2d3b2d] dark:text-emerald-200ase text-[#4a634a] dark:text-emerald-400">Exams Taxonomy</CardTitle></CardHeader>
                      <CardContent className="pt-3">
                          {exams.length === 0 ? (
                              <p className="text-xs text-slate-500 dark:text-slate-400">No exams defined in question_exams collection yet.</p>
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
                  <Card className="rounded-[24px] border-[#d3e3d3] dark:border-emerald-900/50 shadow-sm bg-[#fdfefd] dark:bg-slate-900 overflow-hidden">
                      <CardHeader className="bg-indigo-50/50 dark:bg-indigo-900/20 pb-4 border-b border-[#eef2ec] dark:border-slate-800">
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
          <div className="fixed bottom-0 left-0 right-0 md:left-[250px] bg-[#eef2ec] dark:bg-emerald-900/50/90 backdrop-blur-md border-t border-[#d3e3d3] dark:border-emerald-900/50 p-4 flex items-center justify-between z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
              <Button variant="ghost" className="rounded-full text-[#4a634a] dark:text-emerald-400 hover:bg-[#c4d6c4]" onClick={onCancel}>Cancel</Button>
              <div className="flex items-center gap-3">
                  <Button variant="outline" className="rounded-full border-[#4a634a] dark:border-emerald-500/50 text-[#4a634a] dark:text-emerald-400 bg-transparent hover:bg-[#f4f8f4] dark:bg-emerald-900/20 px-6" onClick={() => {
                      setEditData({...editData, status: 'Draft'});
                      handleSave();
                  }} disabled={isSaving}>
                      {isSaving && editData.status === 'Draft' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Save Draft
                  </Button>
                  <Button className="rounded-full bg-[#3d5a3d] dark:bg-emerald-600 hover:bg-[#2d442d] dark:bg-emerald-700 text-white px-8 shadow-sm" onClick={() => {
                      setEditData({...editData, status: 'Published'});
                      handleSave();
                  }} disabled={isSaving}>
                      {isSaving && editData.status === 'Published' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                      Publish
                  </Button>
              </div>
          </div>
          
          <Dialog open={taxonomySheet.isOpen} onOpenChange={(isOpen) => setTaxonomySheet(prev => ({...prev, isOpen}))}>
              <DialogContent className="sm:max-w-[425px] h-[80vh] rounded-[24px] px-0 flex flex-col pb-0 overflow-hidden">
                  <DialogHeader className="px-6 pb-2 border-b">
                      <DialogTitle className="text-xl font-bold text-slate-800 dark:text-slate-200">{taxonomySheet.title}</DialogTitle>
                  </DialogHeader>
                  <div className="p-4 border-b">
                      <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                          <Input 
                              placeholder="Search..." 
                              className="pl-9 bg-[#f0f4f0] dark:bg-emerald-950/30 border-transparent rounded-xl h-12 focus-visible:ring-emerald-600"
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
                                  <RadioGroupItem value={item.id} id={`sheet-item-${item.id}`} className="text-emerald-700 dark:text-emerald-400 border-[#eef2ec] dark:border-slate-800merald-700" />
                                  <label htmlFor={`sheet-item-${item.id}`} className="text-sm font-medium leading-none cursor-pointer flex-1 py-1">
                                      {item.name}
                                  </label>
                              </div>
                          ))}
                          {taxonomySheet.items.filter(item => item.name.toLowerCase().includes(sheetSearch.toLowerCase())).length === 0 && (
                              <div className="text-center text-slate-500 dark:text-slate-400 py-8">No results found</div>
                          )}
                      </RadioGroup>
                  </div>
              </DialogContent>
          </Dialog>

          {/* Sample JSON Dialog */}
          <Dialog open={showSampleJsonDialog} onOpenChange={setShowSampleJsonDialog}>
              <DialogContent className="w-[95vw] sm:w-full max-w-[95vw] sm:max-w-[700px] rounded-2xl sm:rounded-[24px] p-3 sm:p-6 gap-2 sm:gap-4 overflow-hidden">
                  <DialogHeader>
                      <DialogTitle className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200">
                          Sample JSON Format
                      </DialogTitle>
                  </DialogHeader>
                  <Tabs defaultValue="MCQ" className="w-full mt-2">
                      <TabsList className="flex overflow-x-auto justify-start w-full p-1 h-auto bg-slate-100 dark:bg-slate-800 rounded-lg gap-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                          <TabsTrigger value="MCQ" className="flex-1 shrink-0 min-w-[60px] sm:min-w-[80px] text-[11px] sm:text-sm py-1.5 px-3">MCQ</TabsTrigger>
                          <TabsTrigger value="T/F" className="flex-1 shrink-0 min-w-[60px] sm:min-w-[80px] text-[11px] sm:text-sm py-1.5 px-3">T/F</TabsTrigger>
                          <TabsTrigger value="FIB" className="flex-1 shrink-0 min-w-[60px] sm:min-w-[80px] text-[11px] sm:text-sm py-1.5 px-3">FIB</TabsTrigger>
                          <TabsTrigger value="Match" className="flex-1 shrink-0 min-w-[60px] sm:min-w-[80px] text-[11px] sm:text-sm py-1.5 px-3">Match</TabsTrigger>
                          <TabsTrigger value="Desc" className="flex-1 shrink-0 min-w-[60px] sm:min-w-[80px] text-[11px] sm:text-sm py-1.5 px-3">Desc</TabsTrigger>
                      </TabsList>
                      {Object.entries(sampleJSONData).map(([key, val]) => (
                          <TabsContent key={key} value={key} className="min-w-0 mt-3 w-full max-w-full overflow-hidden">
                              <div className="bg-slate-900 dark:bg-slate-950 rounded-xl p-3 sm:p-4 overflow-auto max-h-[40vh] sm:max-h-[50vh] relative w-full max-w-full">
                                  <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="absolute top-2 right-2 text-slate-300 hover:text-white h-7 text-xs sm:text-sm"
                                      onClick={() => {
                                          navigator.clipboard.writeText(val);
                                          setCopiedSample(key);
                                          setTimeout(() => setCopiedSample(false), 2000);
                                          toast({ title: "Copied!", description: "Sample JSON copied to clipboard." });
                                      }}
                                  >
                                      {copiedSample === key ? <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> : <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />}
                                      {copiedSample === key ? "Copied" : "Copy"}
                                  </Button>
                                  <pre className="text-[10px] sm:text-sm text-emerald-400 font-mono mt-10 sm:mt-8 pb-2 w-max min-w-full">
                                      {val}
                                  </pre>
                              </div>
                          </TabsContent>
                      ))}
                  </Tabs>
              </DialogContent>
          </Dialog>

          {/* Bulk Import Dialog */}
          <Dialog open={showBulkImportDialog} onOpenChange={setShowBulkImportDialog}>
              <DialogContent className="w-[95vw] sm:w-full max-w-[95vw] sm:max-w-[600px] rounded-2xl sm:rounded-[24px] p-3 sm:p-6 gap-2 sm:gap-4 overflow-hidden">
                  <DialogHeader>
                      <DialogTitle className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200">
                          {previewQuestions ? "Preview Import" : "Bulk Import Questions"}
                      </DialogTitle>
                  </DialogHeader>
                  
                  {!previewQuestions ? (
                      <div className="space-y-3 sm:space-y-4 pt-2 sm:pt-4">
                          <div className="space-y-1.5 sm:space-y-2">
                              <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">Upload JSON File</label>
                              <div className="flex items-center gap-2 sm:gap-4">
                                  <Input type="file" accept=".json" onChange={handleBulkImport} className="cursor-pointer text-[10px] sm:text-sm h-8 sm:h-10 file:text-[#4a634a] dark:text-emerald-400 file:font-medium file:bg-[#f4f8f4] dark:bg-emerald-900/20 file:border-0 file:mr-2 sm:file:mr-4 file:px-3 sm:file:px-4 file:py-1 sm:file:py-2 file:rounded-full" />
                              </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                              <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                              <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium uppercase">OR</span>
                              <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                          </div>

                          <div className="space-y-1.5 sm:space-y-2">
                              <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">Paste JSON Content</label>
                              <Textarea 
                                  value={bulkImportText} 
                                  onChange={e => setBulkImportText(e.target.value)} 
                                  placeholder="Paste your JSON array of questions here..." 
                                  className="h-32 sm:h-48 font-mono text-[10px] sm:text-xs p-2 sm:p-3 border-[#c4d6c4] dark:border-emerald-800/50 focus-visible:ring-[#4a634a] dark:focus-visible:ring-emerald-500"
                              />
                          </div>

                          <Button 
                              className="w-full rounded-full bg-[#3d5a3d] dark:bg-emerald-600 hover:bg-[#2d442d] dark:bg-emerald-700 text-white h-8 sm:h-10 text-xs sm:text-sm mt-2 sm:mt-0" 
                              disabled={!bulkImportText.trim()}
                              onClick={() => processBulkImportPreview(bulkImportText)}
                          >
                              <Search className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                              Preview Questions
                          </Button>
                      </div>
                  ) : (
                      <div className="space-y-3 sm:space-y-4 pt-1 sm:pt-2">
                          <div className="bg-[#f0f4f0] dark:bg-emerald-950/30 text-[#3d5a3d] dark:text-emerald-300 text-xs sm:text-sm p-2 sm:p-3 rounded-lg font-medium flex justify-between items-center">
                              <span>Ready to import {previewQuestions.length} questions.</span>
                          </div>
                          <div className="max-h-[50vh] sm:max-h-[55vh] overflow-y-auto space-y-2 pr-1 sm:pr-2">
                              {previewQuestions.map((q, i) => (
                                  <div key={i} className="p-2 sm:p-3 border border-[#d3e3d3] dark:border-emerald-900/50 rounded-xl bg-white dark:bg-slate-950 shadow-sm">
                                      <p className="font-semibold text-xs sm:text-sm line-clamp-2 text-slate-800 dark:text-slate-200">{q.questionText}</p>
                                      <div className="flex gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
                                          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-[#eef2ec] dark:bg-emerald-900/50 text-[#4a634a] dark:text-emerald-400 px-1.5 sm:px-2 py-0.5 rounded-full">{q.questionType}</span>
                                          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 sm:px-2 py-0.5 rounded-full">{q.difficulty || 'Medium'}</span>
                                      </div>
                                  </div>
                              ))}
                          </div>
                          <div className="flex gap-2 sm:gap-3 pt-2 border-t border-slate-100">
                              <Button variant="outline" className="flex-1 rounded-full border-slate-300 dark:border-slate-600 h-8 sm:h-10 text-xs sm:text-sm" onClick={() => setPreviewQuestions(null)}>Cancel</Button>
                              <Button 
                                  className="flex-1 rounded-full bg-[#3d5a3d] dark:bg-emerald-600 hover:bg-[#2d442d] dark:bg-emerald-700 text-white shadow-sm h-8 sm:h-10 text-xs sm:text-sm" 
                                  onClick={confirmBulkImport}
                                  disabled={isSaving}
                              >
                                  {isSaving ? <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 animate-spin" /> : <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />}
                                  Confirm & Import
                              </Button>
                          </div>
                      </div>
                  )}
              </DialogContent>
          </Dialog>
          <Dialog open={showAutoGenerateDialog} onOpenChange={setShowAutoGenerateDialog}>
              <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-indigo-500" />
                          Auto-Generate Question
                      </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                      <div>
                          <p className="text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Context:</p>
                          <div className="flex flex-wrap gap-2">
                              {[
                                  { label: 'Board', val: boards.find(b => b.id === editData.boardId)?.name },
                                  { label: 'Class', val: classes.find(b => b.id === editData.classId)?.name },
                                  { label: 'Subject', val: subjects.find(b => b.id === editData.subjectId)?.name },
                                  { label: 'Chapter', val: chapters.find(b => b.id === editData.chapterId)?.name },
                                  { label: 'Topic', val: topics.find(b => b.id === editData.topicId)?.name },
                                  { label: 'Type', val: editData.questionType },
                                  { label: 'Language', val: editData.language }
                              ].filter(c => c.val).map((c, idx) => (
                                  <span key={idx} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                                      {c.label}: {c.val}
                                  </span>
                              ))}
                          </div>
                      </div>
                      <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Source Material / Content (Optional)</label>
                          <Textarea 
                              placeholder="Paste the chapter text, topic notes, or paragraphs here..." 
                              className="h-32 resize-none text-sm"
                              value={autoGenerateSourceText}
                              onChange={e => setAutoGenerateSourceText(e.target.value)}
                          />
                          <p className="text-[10px] text-slate-500">The AI will generate questions based directly on this text.</p>
                      </div>
                      <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Additional Instructions (Optional)</label>
                          <Textarea 
                              placeholder="e.g. Make it a hard tricky question about Newton's third law..." 
                              className="h-16 resize-none text-sm"
                              value={autoGeneratePrompt}
                              onChange={e => setAutoGeneratePrompt(e.target.value)}
                          />
                      </div>
                      <Button onClick={handleAutoGenerateFullQuestion} disabled={isGeneratingAI} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                          {isGeneratingAI ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : 'Generate Question'}
                      </Button>
                  </div>
              </DialogContent>
          </Dialog>

      </div>
  );
}
