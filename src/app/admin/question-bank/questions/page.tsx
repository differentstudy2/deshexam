'use client';

import React, { useState, useEffect } from 'react';
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
import { PlusCircle, Pencil, Trash2, Loader2, ArrowLeft, Sparkles, Eye, Play, Image as ImageIcon, Video, ShieldCheck, Upload, FileJson, Copy, CheckCircle2, Filter, Layers } from 'lucide-react';
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
    } catch (e) {
      toast({ title: 'Error fetching questions', variant: 'destructive' });
    } finally {
      setLoading(false);
      setIsBulkLoading(false);
    }
  };

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
          // Filter duplicates by ID
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

  useEffect(() => {
    fetchTaxonomies();
    
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
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 pb-24 md:pb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Question Bank</h1>
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" size="icon" title="Bulk Import JSON Format">
                        <FileJson className="h-4 w-4" />
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
            <Link href="/admin/question-bank/academic-questions/add">
                <Button variant="default" className="bg-indigo-600 hover:bg-indigo-700 text-white flex gap-2">
                    <PlusCircle className="h-4 w-4" /> Add Academic Question
                </Button>
            </Link>
            <Link href="/admin/question-bank/exam/add">
                <Button variant="default" className="bg-[#3d5a3d] hover:bg-[#2d442d] text-white flex gap-2">
                    <PlusCircle className="h-4 w-4" /> Add Exam Question
                </Button>
            </Link>
        </div>
      </div>

      {/* Mobile Filters */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full mb-4">
              <Filter className="mr-2 h-4 w-4" /> Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-1 gap-4 py-4">
              <Select value={filters.boardId} onValueChange={(v) => setFilters({...filters, boardId: v})}><SelectTrigger><SelectValue placeholder="All Boards" /></SelectTrigger><SelectContent><SelectItem value="all">All Boards</SelectItem>{boards.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select>
              <Select value={filters.classId} onValueChange={(v) => setFilters({...filters, classId: v})}><SelectTrigger><SelectValue placeholder="All Classes" /></SelectTrigger><SelectContent><SelectItem value="all">All Classes</SelectItem>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
              <Select value={filters.subjectId} onValueChange={(v) => setFilters({...filters, subjectId: v})}><SelectTrigger><SelectValue placeholder="All Subjects" /></SelectTrigger><SelectContent><SelectItem value="all">All Subjects</SelectItem>{subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select>
              <Select value={filters.textbookId} onValueChange={(v) => setFilters({...filters, textbookId: v})}><SelectTrigger><SelectValue placeholder="All Textbooks" /></SelectTrigger><SelectContent><SelectItem value="all">All Textbooks</SelectItem>{textbooks.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select>
              <Select value={filters.difficulty} onValueChange={(v) => setFilters({...filters, difficulty: v})}><SelectTrigger><SelectValue placeholder="All Difficulties" /></SelectTrigger><SelectContent><SelectItem value="all">All Difficulties</SelectItem><SelectItem value="Easy">Easy</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Hard">Hard</SelectItem><SelectItem value="Expert">Expert</SelectItem></SelectContent></Select>
              <Select value={filters.status} onValueChange={(v) => setFilters({...filters, status: v})}><SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger><SelectContent><SelectItem value="all">All Statuses</SelectItem><SelectItem value="Published">Published</SelectItem><SelectItem value="Draft">Draft</SelectItem><SelectItem value="Archived">Archived</SelectItem></SelectContent></Select>
              <Select value={filters.isVerified} onValueChange={(v) => setFilters({...filters, isVerified: v})}><SelectTrigger><SelectValue placeholder="Verification Status" /></SelectTrigger><SelectContent><SelectItem value="all">All Verification</SelectItem><SelectItem value="true">Verified</SelectItem><SelectItem value="false">Not Verified</SelectItem></SelectContent></Select>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filters */}
      <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
          <Select value={filters.boardId} onValueChange={(v) => setFilters({...filters, boardId: v})}>
              <SelectTrigger><SelectValue placeholder="All Boards" /></SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Boards</SelectItem>
                  {boards.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
          </Select>
          <Select value={filters.classId} onValueChange={(v) => setFilters({...filters, classId: v})}>
              <SelectTrigger><SelectValue placeholder="All Classes" /></SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
          </Select>
          <Select value={filters.subjectId} onValueChange={(v) => setFilters({...filters, subjectId: v})}>
              <SelectTrigger><SelectValue placeholder="All Subjects" /></SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
          </Select>
          <Select value={filters.textbookId} onValueChange={(v) => setFilters({...filters, textbookId: v})}>
              <SelectTrigger><SelectValue placeholder="All Textbooks" /></SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Textbooks</SelectItem>
                  {textbooks.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
          </Select>
          <Select value={filters.difficulty} onValueChange={(v) => setFilters({...filters, difficulty: v})}>
              <SelectTrigger><SelectValue placeholder="All Difficulties" /></SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
              </SelectContent>
          </Select>
          <Select value={filters.status} onValueChange={(v) => setFilters({...filters, status: v})}>
              <SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Published">Published</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
              </SelectContent>
          </Select>
          <Select value={filters.isVerified} onValueChange={(v) => setFilters({...filters, isVerified: v})}>
              <SelectTrigger><SelectValue placeholder="Verification Status" /></SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Verification</SelectItem>
                  <SelectItem value="true">Verified</SelectItem>
                  <SelectItem value="false">Not Verified</SelectItem>
              </SelectContent>
          </Select>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle>All Questions ({questions.length})</CardTitle>
          {selectedIds.length > 0 && (
             <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                 <span className="text-sm font-medium text-slate-500 w-full sm:w-auto">{selectedIds.length} selected</span>
                 <Select onValueChange={handleBulkUpdateStatus}>
                    <SelectTrigger className="w-[160px] h-9"><SelectValue placeholder="Change Status" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Published">Published</SelectItem>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Archived">Archived</SelectItem>
                    </SelectContent>
                 </Select>
                 <Button variant="outline" size="sm" onClick={() => handleBulkVerify(true)} disabled={isBulkLoading}>
                     <ShieldCheck className="h-4 w-4 mr-2 text-indigo-500" /> Verify
                 </Button>
                 <Button variant="outline" size="sm" onClick={() => handleBulkVerify(false)} disabled={isBulkLoading}>
                     Remove Verification
                 </Button>
                 <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={isBulkLoading}>
                     {isBulkLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                     Delete
                 </Button>
                 
                 <Dialog open={isBulkTaxonomyOpen} onOpenChange={setIsBulkTaxonomyOpen}>
                     <DialogTrigger asChild>
                         <Button variant="outline" size="sm" disabled={isBulkLoading}>
                             <Layers className="h-4 w-4 mr-2 text-blue-500" /> Taxonomy
                         </Button>
                     </DialogTrigger>
                     <DialogContent className="max-w-3xl">
                         <DialogHeader>
                             <DialogTitle>Bulk Update Taxonomy</DialogTitle>
                             <DialogDescription>
                                 Select the taxonomy fields you want to update for the {selectedIds.length} selected questions.
                                 Leave a field empty if you do not want to change it for the selected questions.
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
                                 <label className="text-xs text-muted-foreground mb-1 block">Exams (Overwrite existing)</label>
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
             </div>
          )}
        </CardHeader>
        <CardContent>
          <Table className="hidden md:table">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"><input type="checkbox" className="w-4 h-4 rounded border-slate-300" checked={questions.length > 0 && selectedIds.length === questions.length} onChange={toggleSelectAll} /></TableHead>
                <TableHead>Text</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7}><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
              ) : questions.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center">No questions found.</TableCell></TableRow>
              ) : (
                questions.map(q => (
                  <TableRow key={q.id}>
                    <TableCell><input type="checkbox" className="w-4 h-4 rounded border-slate-300" checked={selectedIds.includes(q.id)} onChange={() => toggleSelect(q.id)} /></TableCell>
                    <TableCell className="max-w-[400px] truncate">{q.questionText}</TableCell>
                    <TableCell>{q.questionType || (q.options?.a ? 'MCQ' : 'Subjective')}</TableCell>
                    <TableCell>{q.difficulty}</TableCell>
                    <TableCell>{q.status}</TableCell>
                    <TableCell>
                        {q.isVerified ? (
                            <div className="flex items-center text-xs text-indigo-600 font-medium" title={q.verifiedByName}>
                                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                                Verified
                            </div>
                        ) : <span className="text-xs text-slate-400">No</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                          <Link href={`/question/${q.slug || q.id}`} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="sm" title="View Public Page"><Eye className="h-4 w-4 text-blue-500" /></Button>
                          </Link>
                          {q.contentType === 'academic' ? (
                              <Link href={`/admin/question-bank/academic-questions/${q.id}`}>
                                  <Button variant="ghost" size="sm" title="Edit Academic Question"><Pencil className="h-4 w-4" /></Button>
                              </Link>
                          ) : (
                              <Button variant="ghost" size="sm" onClick={() => { setEditData(q); setView('editor'); }}><Pencil className="h-4 w-4" /></Button>
                          )}
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={async () => {
                              await deleteQuestion(q.id);
                              fetchQuestions();
                          }}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {loading ? (
                <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
            ) : questions.length === 0 ? (
                <div className="text-center p-4 text-slate-500">No questions found.</div>
            ) : (
                questions.map(q => (
                  <div key={q.id} className="flex flex-col p-4 border rounded-lg gap-3 bg-white">
                      <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3">
                              <input type="checkbox" className="w-5 h-5 mt-0.5 rounded border-slate-300" checked={selectedIds.includes(q.id)} onChange={() => toggleSelect(q.id)} />
                              <div className="text-sm font-medium line-clamp-3">{q.questionText}</div>
                          </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pl-8">
                          <span className="px-2 py-1 bg-slate-100 rounded">{q.questionType || (q.options?.a ? 'MCQ' : 'Subjective')}</span>
                          <span className="px-2 py-1 bg-slate-100 rounded">{q.difficulty}</span>
                          <span className="px-2 py-1 bg-slate-100 rounded">{q.status}</span>
                          {q.isVerified && (
                              <span className="flex items-center text-indigo-600 bg-indigo-50 px-2 py-1 rounded font-medium" title={q.verifiedByName}>
                                  <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                              </span>
                          )}
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-2 border-t mt-1">
                          <Link href={`/question/${q.slug || q.id}`} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline" size="icon" className="h-8 w-8 text-blue-500" title="View"><Eye className="h-4 w-4" /></Button>
                          </Link>
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => { setEditData(q); setView('editor'); }} title="Edit"><Pencil className="h-4 w-4" /></Button>
                          <Button variant="outline" size="icon" className="h-8 w-8 text-destructive" onClick={async () => {
                              await deleteQuestion(q.id);
                              fetchQuestions();
                          }} title="Delete"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                  </div>
                ))
            )}
          </div>
          {hasMore && !loading && questions.length > 0 && (
              <div className="flex justify-center mt-6">
                  <Button variant="outline" onClick={() => fetchQuestions(true)} disabled={isBulkLoading}>
                      {isBulkLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Load More
                  </Button>
              </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
