'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { getQuestions, getQuestionsPaginated, createQuestion, updateQuestion, deleteQuestion, getTaxonomyNodes, bulkUpdateQuestions, bulkDeleteQuestions } from '@/lib/firebase/question-bank';
import { QuestionBankEntry, TaxonomyNode } from '@/lib/question-bank-types';
import { PlusCircle, Pencil, Trash2, Loader2, ArrowLeft, Sparkles, Eye, Play, Image as ImageIcon, Video, ShieldCheck, Upload, FileJson, Copy, CheckCircle2, Filter, Layers, X, Search, CheckCircle, Archive, FileEdit, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { slugify } from '@/lib/utils';
import { doc, collection, getDocs } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase/client';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import dynamic from 'next/dynamic';
import { QuestionBankEditor } from '@/components/admin/QuestionBankEditor';

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

export default function QuestionBankQuestionsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [questions, setQuestions] = useState<QuestionBankEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [isBulkTaxonomyOpen, setIsBulkTaxonomyOpen] = useState(false);
  const [bulkTaxonomyData, setBulkTaxonomyData] = useState({ boardId: 'no_change', classId: 'no_change', subjectId: 'no_change', textbookId: 'no_change', chapterId: 'no_change', topicId: 'no_change', yearId: 'no_change', examIds: [] as string[] });
  const [filters, setFilters] = useState({ boardId: 'all', classId: 'all', subjectId: 'all', textbookId: 'all', difficulty: 'all', status: 'all', isVerified: 'all' });
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  
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
  const [activeBoardIds, setActiveBoardIds] = useState<Set<string>>(new Set());

  // View state
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [editData, setEditData] = useState<Partial<QuestionBankEntry>>({
      questionType: 'MCQ',
      difficulty: 'Medium',
      status: 'Published',
      language: 'English',
      options: { a: '', b: '', c: '', d: '', e: '' },
      examIds: [],
      qaChecklist: []
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const demoJsonFormat = [
      {
          "Question Type": "Multiple Choice",
          "Subject": "General Knowledge",
          "Chapter": "Geography",
          "Question": "What is the capital of France?",
          "Option A": "Berlin",
          "Option B": "Madrid",
          "Option C": "Paris",
          "Option D": "Rome",
          "Correct Answer": "C",
          "Difficulty": "Easy",
          "Explanation": "Paris is the capital and most populous city of France."
      },
      {
          "Question Type": "True/False",
          "Subject": "Science",
          "Chapter": "Astronomy",
          "Question": "The Earth is the fourth planet from the Sun.",
          "Option A": "True",
          "Option B": "False",
          "Correct Answer": "B",
          "Difficulty": "Medium",
          "Explanation": "Earth is the third planet from the Sun. Mars is the fourth."
      },
      {
          "Question Type": "Matching",
          "Subject": "History",
          "Chapter": "World War II",
          "Question": "Match the leader to their respective country.",
          "Option A": "Churchill=UK, FDR=USA",
          "Correct Answer": "1-A, 2-B"
      }
  ];

  const handleCopyJson = () => {
      navigator.clipboard.writeText(JSON.stringify(demoJsonFormat, null, 2));
      setHasCopied(true);
      toast({ title: 'JSON Copied to clipboard!' });
      setTimeout(() => setHasCopied(false), 2000);
  };

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

  const fetchQuestions = async (isLoadMore = false) => {
    if (!isLoadMore) {
        setLoading(true);
        setQuestions([]);
    } else {
        setIsBulkLoading(true);
    }
    try {
        const queryFilters: any = {};
        if (filters.boardId !== 'all') queryFilters.boardId = filters.boardId;
        if (filters.classId !== 'all') queryFilters.classId = filters.classId;
        if (filters.subjectId !== 'all') queryFilters.subjectId = filters.subjectId;
        if (filters.textbookId !== 'all') queryFilters.textbookId = filters.textbookId;
        if (filters.difficulty !== 'all') queryFilters.difficulty = filters.difficulty;
        if (filters.status !== 'all') queryFilters.status = filters.status;
        if (filters.isVerified !== 'all') queryFilters.isVerified = filters.isVerified === 'true';

        const { questions: newQuestions, lastDoc: newLastDoc } = await getQuestionsPaginated(queryFilters, 50, isLoadMore ? lastDoc : null);
        
        if (isLoadMore) {
            setQuestions(prev => [...prev, ...newQuestions]);
        } else {
            setQuestions(newQuestions);
        }
        setLastDoc(newLastDoc);
        setHasMore(newQuestions.length === 50);
    } catch (e: any) {
      toast({ title: 'Error fetching questions', description: e.message || 'Unknown error', variant: 'destructive' });
      console.error("Filter Error:", e);
    } finally {
      setLoading(false);
      setIsBulkLoading(false);
    }
  };

  const fetchTaxonomies = async () => {
      try {
          const { getTaxonomyNodesByTrack } = await import('@/lib/firebase/taxonomy');
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
          
          setYears(await fetchGuideCol('question_years') as any);
          setTags(await fetchGuideCol('question_tags') as any);
      } catch (e) {
          console.error("Failed to fetch taxonomies", e);
      }
  };

  useEffect(() => {
      fetchTaxonomies();
  }, []);

  useEffect(() => {
      if (boards.length === 0) return;
      const fetchActiveBoards = async () => {
          try {
              const { collection, query, where, limit, getDocs } = await import('firebase/firestore');
              const { db } = await import('@/lib/firebase/client');
              const colRef = collection(db, 'question_bank');
              const activeIds = new Set<string>();
              
              await Promise.all(boards.map(async (board) => {
                  const q = query(colRef, where('boardId', '==', board.id), limit(1));
                  const snap = await getDocs(q);
                  if (!snap.empty) {
                      activeIds.add(board.id);
                  }
              }));
              
              setActiveBoardIds(activeIds);
          } catch(e) {
              console.error('Failed to fetch active boards:', e);
          }
      };
      fetchActiveBoards();
  }, [boards]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const topicIdParam = params.get('topicId');
        if (topicIdParam) {
            import('@/lib/firebase/guide').then(({ getTopicHierarchy }) => {
                getTopicHierarchy(topicIdParam).then((hierarchy) => {
                    setView('editor');
                    if (hierarchy) {
                        setEditData(prev => ({
                            ...prev, 
                            topicId: topicIdParam,
                            boardId: hierarchy.boardId || '',
                            classId: hierarchy.classId || '',
                            subjectId: hierarchy.subjectId || '',
                            textbookId: hierarchy.textbookId || '',
                            chapterId: hierarchy.chapterId || '',
                        }));
                    } else {
                        setEditData(prev => ({ ...prev, topicId: topicIdParam }));
                    }
                });
            });
        }
    }
  }, []);

  useEffect(() => {
    fetchQuestions(false);
  }, [filters.boardId, filters.classId, filters.subjectId, filters.textbookId, filters.difficulty, filters.status, filters.isVerified]);

  const handleSave = async () => {
      if (!editData.questionText || !editData.correctAnswer) {
          toast({ title: 'Validation Error', description: 'Question Text and Correct Answer are required.', variant: 'destructive' });
          return;
      }
      setIsSaving(true);
      try {
          const generatedSlug = editData.slug || slugify(editData.title || editData.questionText.substring(0, 50));
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
          setView('list');
          fetchQuestions();
      } catch(e) {
          toast({ title: 'Error saving question', variant: 'destructive' });
      } finally {
          setIsSaving(false);
      }
  }

  const resetForm = () => {
      setEditData({
          id: '',
          title: '',
          questionText: '',
          options: { a: '', b: '', c: '', d: '' },
          correctAnswer: '',
          explanation: '',
          difficulty: 'Medium',
          status: 'Published',
          language: 'English',
          marks: 1,
          slug: '',
          sourceYear: '',
          tags: [],
          boardId: '', classId: '', subjectId: '', textbookId: '', chapterId: '', topicId: '', yearId: '',
          examIds: [],
          isVerified: false,
          qaChecklist: []
      });
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

  const toggleSelectAll = () => {
      if (selectedIds.length === questions.length) setSelectedIds([]);
      else setSelectedIds(questions.map(q => q.id));
  };

  const toggleSelect = (id: string) => {
      if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
      else setSelectedIds([...selectedIds, id]);
  };

  const handleBulkDelete = async () => {
      if (!confirm('Are you sure you want to delete selected questions?')) return;
      setIsBulkLoading(true);
      try {
          await bulkDeleteQuestions(selectedIds);
          toast({ title: 'Deleted successfully' });
          setSelectedIds([]);
          fetchQuestions();
      } catch(e) {
          toast({ title: 'Delete failed', variant: 'destructive' });
      } finally {
          setIsBulkLoading(false);
      }
  };

  const handleBulkUpdateStatus = async (status: string) => {
      setIsBulkLoading(true);
      try {
          await bulkUpdateQuestions(selectedIds, { status: status as any });
          toast({ title: 'Status updated successfully' });
          setSelectedIds([]);
          fetchQuestions();
      } catch(e) {
          toast({ title: 'Update failed', variant: 'destructive' });
      } finally {
          setIsBulkLoading(false);
      }
  };

  const handleBulkVerify = async (isVerified: boolean) => {
      setIsBulkLoading(true);
      try {
          const updateData: any = { isVerified };
          if (isVerified && user) {
              updateData.verifiedBy = user.uid;
              updateData.verifiedByName = user.displayName || user.email || '';
              updateData.verifiedAt = new Date().toISOString();
          } else if (!isVerified) {
              updateData.verifiedBy = '';
              updateData.verifiedByName = '';
              updateData.verifiedAt = null;
          }
          await bulkUpdateQuestions(selectedIds, updateData);
          toast({ title: isVerified ? 'Questions Verified' : 'Verification Removed' });
          setSelectedIds([]);
          fetchQuestions();
      } catch(e) {
          toast({ title: 'Bulk Verification failed', variant: 'destructive' });
      } finally {
          setIsBulkLoading(false);
      }
  };

  const handleBulkUpdateTaxonomy = async () => {
      setIsBulkLoading(true);
      try {
          const updateData: any = {};
          if (bulkTaxonomyData.boardId && bulkTaxonomyData.boardId !== 'no_change') updateData.boardId = bulkTaxonomyData.boardId;
          if (bulkTaxonomyData.classId && bulkTaxonomyData.classId !== 'no_change') updateData.classId = bulkTaxonomyData.classId;
          if (bulkTaxonomyData.subjectId && bulkTaxonomyData.subjectId !== 'no_change') updateData.subjectId = bulkTaxonomyData.subjectId;
          if (bulkTaxonomyData.textbookId && bulkTaxonomyData.textbookId !== 'no_change') updateData.textbookId = bulkTaxonomyData.textbookId;
          if (bulkTaxonomyData.chapterId && bulkTaxonomyData.chapterId !== 'no_change') updateData.chapterId = bulkTaxonomyData.chapterId;
          if (bulkTaxonomyData.topicId && bulkTaxonomyData.topicId !== 'no_change') updateData.topicId = bulkTaxonomyData.topicId;
          if (bulkTaxonomyData.yearId && bulkTaxonomyData.yearId !== 'no_change') updateData.yearId = bulkTaxonomyData.yearId;
          if (bulkTaxonomyData.examIds.length > 0 && bulkTaxonomyData.examIds[0] !== 'no_change') updateData.examIds = bulkTaxonomyData.examIds;

          if (Object.keys(updateData).length === 0) {
              toast({ title: 'No changes selected', variant: 'destructive' });
              setIsBulkLoading(false);
              return;
          }

          await bulkUpdateQuestions(selectedIds, updateData);
          toast({ title: 'Taxonomy updated successfully' });
          setSelectedIds([]);
          setIsBulkTaxonomyOpen(false);
          setBulkTaxonomyData({ boardId: 'no_change', classId: 'no_change', subjectId: 'no_change', textbookId: 'no_change', chapterId: 'no_change', topicId: 'no_change', yearId: 'no_change', examIds: [] });
          fetchQuestions();
      } catch(e) {
          toast({ title: 'Taxonomy update failed', variant: 'destructive' });
      } finally {
          setIsBulkLoading(false);
      }
  };

  if (view === 'editor') {
      return (
          <QuestionBankEditor 
              initialData={editData} 
              onSaveComplete={() => {
                  setView('list');
                  fetchQuestions();
              }}
              onCancel={() => setView('list')}
          />
      );
  }
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="p-4 md:p-6 space-y-6 md:space-y-8 pb-32"
    >
      <div className="relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5 bg-white/60 dark:bg-slate-900/60 p-5 md:p-6 rounded-2xl backdrop-blur-xl border border-white/50 dark:border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] mb-6">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col gap-1">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent flex items-center gap-3">
              <Layers className="h-8 w-8 text-indigo-500" />
              Question Bank
            </h1>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-xl">
               Manage, filter, and curate your academic and competitive questions in one unified place.
            </p>
        </div>
        
        <div className="relative z-10 flex flex-wrap md:flex-nowrap items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className="h-11 w-11 shrink-0 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-200/60 dark:border-slate-700/60 shadow-sm" title="Bulk Import JSON Format">
                        <FileJson className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Bulk Import JSON Format</DialogTitle>
                        <DialogDescription>
                            Use this exact JSON format when bulk-importing questions from the Import section.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="relative mt-4">
                        <div className="absolute top-2 right-2 flex gap-2">
                            <Button size="sm" variant="secondary" className="h-8" onClick={handleCopyJson}>
                                {hasCopied ? <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
                                {hasCopied ? 'Copied!' : 'Copy'}
                            </Button>
                        </div>
                        <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-xs font-mono pt-12">
                            {JSON.stringify(demoJsonFormat, null, 2)}
                        </pre>
                    </div>
                </DialogContent>
            </Dialog>
            <Link href="/admin/question-bank/academic-questions/add" className="flex-1 md:flex-none">
                <Button variant="default" className="w-full md:w-auto h-11 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 border-0 font-medium">
                    <PlusCircle className="h-5 w-5" /> <span className="whitespace-nowrap">Add Academic</span>
                </Button>
            </Link>
            <Link href="/admin/question-bank/exam/add" className="flex-1 md:flex-none">
                <Button variant="default" className="w-full md:w-auto h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 border-0 font-medium">
                    <PlusCircle className="h-5 w-5" /> <span className="whitespace-nowrap">Add Exam</span>
                </Button>
            </Link>
        </div>
      </div>

      {/* Mobile Filters */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full mb-4 bg-white/50 backdrop-blur-sm">
              <Filter className="mr-2 h-4 w-4" /> Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] overflow-y-auto rounded-t-2xl">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-1 gap-4 py-4">
              <Select value={filters.boardId} onValueChange={(v) => setFilters({...filters, boardId: v, classId: 'all', subjectId: 'all', textbookId: 'all'})}><SelectTrigger><SelectValue placeholder="All Boards" /></SelectTrigger><SelectContent><SelectItem value="all">All Boards</SelectItem>{boards.filter(b => activeBoardIds.has(b.id)).map(b => <SelectItem key={b.id} value={b.id}>{b.acronym || b.name}</SelectItem>)}</SelectContent></Select>
              <Select value={filters.classId} onValueChange={(v) => setFilters({...filters, classId: v, subjectId: 'all', textbookId: 'all'})}><SelectTrigger><SelectValue placeholder="All Classes" /></SelectTrigger><SelectContent><SelectItem value="all">All Classes</SelectItem>{classes.filter(c => filters.boardId === 'all' || c.parentId === filters.boardId || c.rootId === filters.boardId).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
              <Select value={filters.subjectId} onValueChange={(v) => setFilters({...filters, subjectId: v, textbookId: 'all'})}><SelectTrigger><SelectValue placeholder="All Subjects" /></SelectTrigger><SelectContent><SelectItem value="all">All Subjects</SelectItem>{subjects.filter(s => filters.classId === 'all' || s.parentId === filters.classId).map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select>
              <Select value={filters.textbookId} onValueChange={(v) => setFilters({...filters, textbookId: v})}><SelectTrigger><SelectValue placeholder="All Textbooks" /></SelectTrigger><SelectContent><SelectItem value="all">All Textbooks</SelectItem>{textbooks.filter(t => filters.subjectId === 'all' || t.parentId === filters.subjectId).map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select>
              <Select value={filters.difficulty} onValueChange={(v) => setFilters({...filters, difficulty: v})}><SelectTrigger><SelectValue placeholder="All Difficulties" /></SelectTrigger><SelectContent><SelectItem value="all">All Difficulties</SelectItem><SelectItem value="Easy">Easy</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Hard">Hard</SelectItem><SelectItem value="Expert">Expert</SelectItem></SelectContent></Select>
              <Select value={filters.status} onValueChange={(v) => setFilters({...filters, status: v})}><SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger><SelectContent><SelectItem value="all">All Statuses</SelectItem><SelectItem value="Published">Published</SelectItem><SelectItem value="Draft">Draft</SelectItem><SelectItem value="Archived">Archived</SelectItem></SelectContent></Select>
              <Select value={filters.isVerified} onValueChange={(v) => setFilters({...filters, isVerified: v})}><SelectTrigger><SelectValue placeholder="Verification Status" /></SelectTrigger><SelectContent><SelectItem value="all">All Verification</SelectItem><SelectItem value="true">Verified</SelectItem><SelectItem value="false">Not Verified</SelectItem></SelectContent></Select>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filters (Glassmorphism Toolbar) */}
      <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 mb-6 p-4 rounded-xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
          <Select value={filters.boardId} onValueChange={(v) => setFilters({...filters, boardId: v, classId: 'all', subjectId: 'all', textbookId: 'all'})}>
              <SelectTrigger className="bg-white dark:bg-slate-950 border-slate-200/60 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-300 focus:ring-indigo-500/20"><SelectValue placeholder="All Boards" /></SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Boards</SelectItem>
                  {boards.filter(b => activeBoardIds.has(b.id)).map(b => <SelectItem key={b.id} value={b.id}>{b.acronym || b.name}</SelectItem>)}
              </SelectContent>
          </Select>
          <Select value={filters.classId} onValueChange={(v) => setFilters({...filters, classId: v, subjectId: 'all', textbookId: 'all'})}>
              <SelectTrigger className="bg-white dark:bg-slate-950 border-slate-200/60 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-300 focus:ring-indigo-500/20"><SelectValue placeholder="All Classes" /></SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.filter(c => filters.boardId === 'all' || c.parentId === filters.boardId || c.rootId === filters.boardId).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
          </Select>
          <Select value={filters.subjectId} onValueChange={(v) => setFilters({...filters, subjectId: v, textbookId: 'all'})}>
              <SelectTrigger className="bg-white dark:bg-slate-950 border-slate-200/60 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-300 focus:ring-indigo-500/20"><SelectValue placeholder="All Subjects" /></SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.filter(s => filters.classId === 'all' || s.parentId === filters.classId).map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
          </Select>
          <Select value={filters.textbookId} onValueChange={(v) => setFilters({...filters, textbookId: v})}>
              <SelectTrigger className="bg-white dark:bg-slate-950 border-slate-200/60 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-300 focus:ring-indigo-500/20"><SelectValue placeholder="All Textbooks" /></SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Textbooks</SelectItem>
                  {textbooks.filter(t => filters.subjectId === 'all' || t.parentId === filters.subjectId).map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
          </Select>
          <Select value={filters.difficulty} onValueChange={(v) => setFilters({...filters, difficulty: v})}>
              <SelectTrigger className="bg-white dark:bg-slate-950 border-slate-200/60 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-300 focus:ring-indigo-500/20"><SelectValue placeholder="All Difficulties" /></SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
              </SelectContent>
          </Select>
          <Select value={filters.status} onValueChange={(v) => setFilters({...filters, status: v})}>
              <SelectTrigger className="bg-white dark:bg-slate-950 border-slate-200/60 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-300 focus:ring-indigo-500/20"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Published">Published</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
              </SelectContent>
          </Select>
          <Select value={filters.isVerified} onValueChange={(v) => setFilters({...filters, isVerified: v})}>
              <SelectTrigger className="bg-white dark:bg-slate-950 border-slate-200/60 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-300 focus:ring-indigo-500/20"><SelectValue placeholder="Verification Status" /></SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Verification</SelectItem>
                  <SelectItem value="true">Verified</SelectItem>
                  <SelectItem value="false">Not Verified</SelectItem>
              </SelectContent>
          </Select>
      </div>

      <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-md bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl overflow-hidden rounded-xl">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            All Questions 
            <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs py-0.5 px-2 rounded-full font-medium">
              {questions.length} found
            </span>
          </CardTitle>
          <div className="flex gap-2 text-sm text-slate-500">
             <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Published</span>
             <span className="flex items-center gap-1 ml-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Draft</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="hidden md:table">
            <TableHeader className="bg-slate-50/80 dark:bg-slate-900/80 sticky top-0 backdrop-blur-sm z-10">
              <TableRow className="border-b-slate-200 dark:border-slate-800">
                <TableHead className="w-[50px] pl-6"><input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer" checked={questions.length > 0 && selectedIds.length === questions.length} onChange={toggleSelectAll} /></TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 w-full min-w-[300px]">Text</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 w-[100px] text-center">Type</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 w-[100px] text-center">Difficulty</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 w-[80px] text-center">Status</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 w-[80px] text-center">Verified</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 w-[120px] text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="h-48 text-center"><Loader2 className="animate-spin h-8 w-8 text-indigo-500 mx-auto" /><p className="text-sm text-slate-500 mt-2">Loading questions...</p></TableCell></TableRow>
              ) : questions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                        <Search className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">No questions found</h3>
                      <p className="text-sm mt-1 max-w-sm">Try adjusting your filters or add a new question to get started.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <AnimatePresence>
                  {questions.map((q, i) => (
                    <motion.tr 
                      key={q.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.2) }}
                      className={`group hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800 ${selectedIds.includes(q.id) ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''}`}
                    >
                      <TableCell className="pl-6"><input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-all" checked={selectedIds.includes(q.id)} onChange={() => toggleSelect(q.id)} /></TableCell>
                      <TableCell className="max-w-[400px]">
                        <div className="font-medium text-slate-800 dark:text-slate-200 line-clamp-2">{q.questionText}</div>
                        {(q.boardId || q.classId || q.subjectId || q.textbookId) && (
                           <div className="text-xs text-slate-500 mt-1.5 flex flex-wrap items-center gap-1.5">
                             {(() => {
                               const b = boards.find(b => b.id === q.boardId);
                               return b ? <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] font-medium border border-slate-200 dark:border-slate-700" title={b.name}>{b.acronym || b.name}</span> : null;
                             })()}
                             {(() => {
                               const c = classes.find(c => c.id === q.classId);
                               return c ? <span className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 px-1.5 py-0.5 rounded text-[10px] font-medium border border-indigo-100 dark:border-indigo-800/50">{c.name}</span> : null;
                             })()}
                             {(() => {
                               const s = subjects.find(s => s.id === q.subjectId);
                               return s ? <span className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded text-[10px] font-medium border border-blue-100 dark:border-blue-800/50">{s.name}</span> : null;
                             })()}
                             {(() => {
                               const tb = textbooks.find(t => t.id === q.textbookId);
                               return tb ? <span className="bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-1.5 py-0.5 rounded text-[10px] font-medium border border-orange-100 dark:border-orange-800/50" title={tb.name}>{(tb.name?.length > 25 ? tb.name.substring(0, 25) + '...' : tb.name)}</span> : null;
                             })()}
                           </div>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {q.questionType || (q.options?.a ? 'MCQ' : 'Subjective')}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-medium border
                          ${q.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' : ''}
                          ${q.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' : ''}
                          ${q.difficulty === 'Hard' ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800' : ''}
                          ${q.difficulty === 'Expert' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800' : ''}
                        `}>
                          {q.difficulty}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full border shadow-sm transition-colors mx-auto
                          ${q.status === 'Published' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' : ''}
                          ${q.status === 'Draft' ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' : ''}
                          ${q.status === 'Archived' ? 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' : ''}
                        `} title={q.status}>
                          {q.status === 'Published' ? <CheckCircle2 className="w-4 h-4" /> : q.status === 'Draft' ? <FileEdit className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                        </div>
                      </TableCell>
                      <TableCell>
                          {q.isVerified ? (
                              <div className="flex items-center justify-center w-8 h-8 rounded-full mx-auto text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 shadow-sm transition-colors" title={`Verified by ${q.verifiedByName || 'Admin'}`}>
                                  <ShieldCheck className="w-4 h-4" />
                              </div>
                          ) : (
                              <div className="flex items-center justify-center w-8 h-8 rounded-full mx-auto text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors" title="Unverified">
                                  <ShieldAlert className="w-4 h-4" />
                              </div>
                          )}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <div className="flex gap-1 justify-end transition-opacity">
                            <Link href={`/question/${q.slug || q.id}`} target="_blank" rel="noopener noreferrer">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30" title="View Public Page"><Eye className="h-4 w-4" /></Button>
                            </Link>
                            {q.contentType === 'academic' ? (
                                <Link href={`/admin/question-bank/academic-questions/${q.id}`}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:bg-indigo-900/30" title="Edit Academic Question"><Pencil className="h-4 w-4" /></Button>
                                </Link>
                            ) : (
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:bg-indigo-900/30" onClick={() => { setEditData(q); setView('editor'); }}><Pencil className="h-4 w-4" /></Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30" onClick={async () => {
                                await deleteQuestion(q.id);
                                fetchQuestions();
                            }}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </TableBody>
          </Table>

          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-4 md:hidden p-4">
            {loading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-indigo-500" /></div>
            ) : questions.length === 0 ? (
                <div className="text-center p-8 text-slate-500">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No questions found.
                </div>
            ) : (
                <AnimatePresence>
                {questions.map((q, i) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    key={q.id} 
                    className={`flex flex-col p-4 border rounded-xl gap-3 bg-white dark:bg-slate-900 shadow-sm transition-all ${selectedIds.includes(q.id) ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-slate-200 dark:border-slate-800'}`}
                  >
                      <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3 w-full">
                              <input type="checkbox" className="w-5 h-5 mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 flex-shrink-0" checked={selectedIds.includes(q.id)} onChange={() => toggleSelect(q.id)} />
                              <div className="w-full">
                                  <div className="text-sm font-medium line-clamp-3 leading-snug">{q.questionText}</div>
                                  {(q.boardId || q.classId || q.subjectId || q.textbookId) && (
                                     <div className="text-xs text-slate-500 mt-2 flex flex-wrap items-center gap-1.5">
                                       {(() => {
                                         const b = boards.find(b => b.id === q.boardId);
                                         return b ? <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] font-medium border border-slate-200 dark:border-slate-700" title={b.name}>{b.acronym || b.name}</span> : null;
                                       })()}
                                       {(() => {
                                         const c = classes.find(c => c.id === q.classId);
                                         return c ? <span className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 px-1.5 py-0.5 rounded text-[10px] font-medium border border-indigo-100 dark:border-indigo-800/50">{c.name}</span> : null;
                                       })()}
                                       {(() => {
                                         const s = subjects.find(s => s.id === q.subjectId);
                                         return s ? <span className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded text-[10px] font-medium border border-blue-100 dark:border-blue-800/50">{s.name}</span> : null;
                                       })()}
                                       {(() => {
                                         const tb = textbooks.find(t => t.id === q.textbookId);
                                         return tb ? <span className="bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-1.5 py-0.5 rounded text-[10px] font-medium border border-orange-100 dark:border-orange-800/50" title={tb.name}>{(tb.name?.length > 20 ? tb.name.substring(0, 20) + '...' : tb.name)}</span> : null;
                                       })()}
                                     </div>
                                  )}
                              </div>
                          </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pl-8">
                          <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md font-medium">{q.questionType || (q.options?.a ? 'MCQ' : 'Subjective')}</span>
                          <span className={`px-2 py-1 rounded-md font-medium border ${q.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : q.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>{q.difficulty}</span>
                          <span className={`px-2 py-1 rounded-md font-medium border ${q.status === 'Published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{q.status}</span>
                          {q.isVerified && (
                              <span className="flex items-center text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded-md font-medium" title={q.verifiedByName}>
                                  <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                              </span>
                          )}
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 mt-1">
                          <Link href={`/question/${q.slug || q.id}`} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline" size="sm" className="text-blue-500"><Eye className="h-4 w-4 mr-1" /> View</Button>
                          </Link>
                          <Button variant="outline" size="sm" onClick={() => { setEditData(q); setView('editor'); }}><Pencil className="h-4 w-4 mr-1" /> Edit</Button>
                          <Button variant="outline" size="sm" className="text-destructive hover:bg-rose-50" onClick={async () => {
                              await deleteQuestion(q.id);
                              fetchQuestions();
                          }}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                  </motion.div>
                ))}
                </AnimatePresence>
            )}
          </div>
          {hasMore && !loading && questions.length > 0 && (
              <div className="flex justify-center p-6 border-t border-slate-100 dark:border-slate-800">
                  <Button variant="outline" className="rounded-full px-8 shadow-sm hover:shadow transition-all" onClick={() => fetchQuestions(true)} disabled={isBulkLoading}>
                      {isBulkLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Load More Questions
                  </Button>
              </div>
          )}
        </CardContent>
      </Card>

      {/* Floating Action Bar */}
      <AnimatePresence>
          {selectedIds.length > 0 && (
              <motion.div 
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl"
              >
                  <div className="bg-slate-900/90 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 p-3 sm:p-4 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                          <div className="bg-indigo-500/20 text-indigo-300 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border border-indigo-500/30">
                              {selectedIds.length}
                          </div>
                          <span className="text-slate-200 font-medium">Questions Selected</span>
                          <button onClick={() => setSelectedIds([])} className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors ml-auto sm:ml-2">
                              <X className="h-4 w-4" />
                          </button>
                      </div>

                      <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
                         <Select onValueChange={handleBulkUpdateStatus}>
                            <SelectTrigger className="w-[140px] h-9 bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 transition-colors"><SelectValue placeholder="Change Status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Published">Published</SelectItem>
                                <SelectItem value="Draft">Draft</SelectItem>
                                <SelectItem value="Archived">Archived</SelectItem>
                            </SelectContent>
                         </Select>
                         
                         <Dialog open={isBulkTaxonomyOpen} onOpenChange={setIsBulkTaxonomyOpen}>
                             <DialogTrigger asChild>
                                 <Button variant="outline" size="sm" className="bg-slate-800 border-slate-700 text-blue-400 hover:bg-slate-700 hover:text-blue-300" disabled={isBulkLoading}>
                                     <Layers className="h-4 w-4 mr-2" /> Taxonomy
                                 </Button>
                             </DialogTrigger>
                             {/* The Taxonomy Dialog Content remains the same as it was, but we can style the button above */}
                             <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                    <DialogTitle>Bulk Update Taxonomy</DialogTitle>
                                    <DialogDescription>
                                        Select the taxonomy fields you want to update for the {selectedIds.length} selected questions.
                                        Leave a field empty if you do not want to change it.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                                     <div>
                                         <label className="text-xs text-muted-foreground mb-1 block">Board</label>
                                         <Select value={bulkTaxonomyData.boardId} onValueChange={(v) => setBulkTaxonomyData({
                                             ...bulkTaxonomyData, 
                                             boardId: v,
                                             classId: 'no_change', subjectId: 'no_change', textbookId: 'no_change', chapterId: 'no_change', topicId: 'no_change'
                                         })}>
                                             <SelectTrigger><SelectValue placeholder="No Change" /></SelectTrigger>
                                             <SelectContent>
                                                 <SelectItem value="no_change">No Change</SelectItem>
                                                 {boards.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                                             </SelectContent>
                                         </Select>
                                     </div>
                                     <div>
                                         <label className="text-xs text-muted-foreground mb-1 block">Class</label>
                                         <Select value={bulkTaxonomyData.classId} onValueChange={(v) => setBulkTaxonomyData({
                                             ...bulkTaxonomyData, 
                                             classId: v,
                                             subjectId: 'no_change', textbookId: 'no_change', chapterId: 'no_change', topicId: 'no_change'
                                         })}>
                                             <SelectTrigger><SelectValue placeholder="No Change" /></SelectTrigger>
                                             <SelectContent>
                                                 <SelectItem value="no_change">No Change</SelectItem>
                                                 {classes.filter(c => bulkTaxonomyData.boardId === 'no_change' || (c as any).boardId === bulkTaxonomyData.boardId).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                             </SelectContent>
                                         </Select>
                                     </div>
                                     <div>
                                         <label className="text-xs text-muted-foreground mb-1 block">Subject</label>
                                         <Select value={bulkTaxonomyData.subjectId} onValueChange={(v) => setBulkTaxonomyData({
                                             ...bulkTaxonomyData, 
                                             subjectId: v,
                                             textbookId: 'no_change', chapterId: 'no_change', topicId: 'no_change'
                                         })}>
                                             <SelectTrigger><SelectValue placeholder="No Change" /></SelectTrigger>
                                             <SelectContent>
                                                 <SelectItem value="no_change">No Change</SelectItem>
                                                 {subjects.filter(s => bulkTaxonomyData.classId === 'no_change' || (s as any).classId === bulkTaxonomyData.classId).map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                             </SelectContent>
                                         </Select>
                                     </div>
                                     <div>
                                         <label className="text-xs text-muted-foreground mb-1 block">Textbook</label>
                                         <Select value={bulkTaxonomyData.textbookId} onValueChange={(v) => setBulkTaxonomyData({
                                             ...bulkTaxonomyData, 
                                             textbookId: v,
                                             chapterId: 'no_change', topicId: 'no_change'
                                         })}>
                                             <SelectTrigger><SelectValue placeholder="No Change" /></SelectTrigger>
                                             <SelectContent>
                                                 <SelectItem value="no_change">No Change</SelectItem>
                                                 {textbooks.filter(t => bulkTaxonomyData.subjectId === 'no_change' || (t as any).subjectId === bulkTaxonomyData.subjectId).map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                             </SelectContent>
                                         </Select>
                                     </div>
                                     <div>
                                         <label className="text-xs text-muted-foreground mb-1 block">Chapter</label>
                                         <Select value={bulkTaxonomyData.chapterId} onValueChange={(v) => setBulkTaxonomyData({
                                             ...bulkTaxonomyData, 
                                             chapterId: v,
                                             topicId: 'no_change'
                                         })}>
                                             <SelectTrigger><SelectValue placeholder="No Change" /></SelectTrigger>
                                             <SelectContent>
                                                 <SelectItem value="no_change">No Change</SelectItem>
                                                 {chapters.filter(c => bulkTaxonomyData.textbookId === 'no_change' || (c as any).textbookId === bulkTaxonomyData.textbookId).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                             </SelectContent>
                                         </Select>
                                     </div>
                                     <div>
                                         <label className="text-xs text-muted-foreground mb-1 block">Topic</label>
                                         <Select value={bulkTaxonomyData.topicId} onValueChange={(v) => setBulkTaxonomyData({...bulkTaxonomyData, topicId: v})}>
                                             <SelectTrigger><SelectValue placeholder="No Change" /></SelectTrigger>
                                             <SelectContent>
                                                 <SelectItem value="no_change">No Change</SelectItem>
                                                 {topics.filter(t => bulkTaxonomyData.chapterId === 'no_change' || (t as any).chapterId === bulkTaxonomyData.chapterId).map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                             </SelectContent>
                                         </Select>
                                     </div>
                                     <div>
                                         <label className="text-xs text-muted-foreground mb-1 block">Year</label>
                                         <Select value={bulkTaxonomyData.yearId} onValueChange={(v) => setBulkTaxonomyData({...bulkTaxonomyData, yearId: v})}>
                                             <SelectTrigger><SelectValue placeholder="No Change" /></SelectTrigger>
                                             <SelectContent>
                                                 <SelectItem value="no_change">No Change</SelectItem>
                                                 {years.map(y => <SelectItem key={y.id} value={y.id}>{y.name}</SelectItem>)}
                                             </SelectContent>
                                         </Select>
                                     </div>
                                     <div>
                                         <label className="text-xs text-muted-foreground mb-1 block">Exams</label>
                                         <Select value={bulkTaxonomyData.examIds.length > 0 ? bulkTaxonomyData.examIds[0] : "no_change"} onValueChange={(v) => setBulkTaxonomyData({...bulkTaxonomyData, examIds: v === 'no_change' ? [] : [v]})}>
                                             <SelectTrigger><SelectValue placeholder="No Change" /></SelectTrigger>
                                             <SelectContent>
                                                 <SelectItem value="no_change">No Change</SelectItem>
                                                 {exams.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                                             </SelectContent>
                                         </Select>
                                     </div>
                                 </div>
                                 <div className="flex justify-end gap-2 mt-4">
                                     <Button variant="outline" onClick={() => setIsBulkTaxonomyOpen(false)}>Cancel</Button>
                                     <Button onClick={handleBulkUpdateTaxonomy} disabled={isBulkLoading}>
                                         {isBulkLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                         Update Taxonomy
                                     </Button>
                                 </div>
                             </DialogContent>
                         </Dialog>

                         <Button variant="outline" size="sm" className="bg-slate-800 border-slate-700 text-indigo-400 hover:bg-slate-700 hover:text-indigo-300" onClick={() => handleBulkVerify(true)} disabled={isBulkLoading}>
                             <ShieldCheck className="h-4 w-4 mr-2" /> Verify
                         </Button>
                         <Button variant="outline" size="sm" className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-slate-100" onClick={() => handleBulkVerify(false)} disabled={isBulkLoading}>
                             Unverify
                         </Button>
                         <div className="w-px h-6 bg-slate-700 mx-1 hidden sm:block"></div>
                         <Button variant="destructive" size="sm" className="bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20" onClick={handleBulkDelete} disabled={isBulkLoading}>
                             {isBulkLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                             Delete
                         </Button>
                      </div>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>
    </motion.div>
  );
}
