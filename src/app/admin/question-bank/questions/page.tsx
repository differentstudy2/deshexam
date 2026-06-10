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
import { getQuestions, createQuestion, updateQuestion, deleteQuestion, getTaxonomyNodes, bulkUpdateQuestions, bulkDeleteQuestions } from '@/lib/firebase/question-bank';
import { QuestionBankEntry, TaxonomyNode } from '@/lib/question-bank-types';
import { PlusCircle, Pencil, Trash2, Loader2, ArrowLeft, Sparkles, Eye, Play, Image as ImageIcon, Video, ShieldCheck, Upload } from 'lucide-react';
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

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const data = await getQuestions();
      setQuestions(data);
    } catch (e) {
      toast({ title: 'Error fetching questions', variant: 'destructive' });
    } finally {
      setLoading(false);
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
    fetchQuestions();
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Question Bank</h1>
        <Button onClick={() => { resetForm(); setView('editor'); }}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Question
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Questions ({questions.length})</CardTitle>
          {selectedIds.length > 0 && (
             <div className="flex items-center gap-4">
                 <span className="text-sm font-medium text-slate-500">{selectedIds.length} selected</span>
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
             </div>
          )}
        </CardHeader>
        <CardContent>
          <Table>
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
                <TableRow><TableCell colSpan={5}><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
              ) : questions.length === 0 ? (
                <TableRow><TableCell colSpan={5}>No questions found.</TableCell></TableRow>
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
                          <Button variant="ghost" size="sm" onClick={() => { setEditData(q); setView('editor'); }}><Pencil className="h-4 w-4" /></Button>
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
        </CardContent>
      </Card>
    </div>
  );
}
