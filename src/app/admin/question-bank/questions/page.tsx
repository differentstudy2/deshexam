'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { getQuestions, createQuestion, updateQuestion, deleteQuestion, getTaxonomyNodes, bulkUpdateQuestions, bulkDeleteQuestions } from '@/lib/firebase/question-bank';
import { QuestionBankEntry, TaxonomyNode } from '@/lib/question-bank-types';
import { PlusCircle, Pencil, Trash2, Loader2, ArrowLeft, Sparkles, Eye, Play, Image as ImageIcon, Video } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { slugify } from '@/lib/utils';
import { doc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

export default function QuestionBankQuestionsPage() {
  const { toast } = useToast();
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

  // View state
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [editData, setEditData] = useState<Partial<QuestionBankEntry>>({
      questionType: 'MCQ',
      difficulty: 'Medium',
      status: 'Published',
      language: 'English',
      options: { a: '', b: '', c: '', d: '', e: '' },
      examIds: []
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

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
          const snap = await getDocs(collection(db, colName));
          return snap.docs.map(d => {
              const data = d.data();
              return { id: d.id, name: data.title || data.name, ...data };
          });
      };
      const [b, c, s, t, ch, tp, ex, yr] = await Promise.all([
          fetchGuideCol('guide_boards'),
          fetchGuideCol('guide_classes'),
          fetchGuideCol('guide_subjects'),
          fetchGuideCol('guide_textbooks'),
          fetchGuideCol('guide_chapters'),
          fetchGuideCol('guide_topics'),
          fetchGuideCol('question_exams'),
          fetchGuideCol('question_years')
      ]);
      setBoards(b as TaxonomyNode[]); setClasses(c as TaxonomyNode[]); setSubjects(s as TaxonomyNode[]);
      setTextbooks(t as TaxonomyNode[]); setChapters(ch as TaxonomyNode[]); setTopics(tp as TaxonomyNode[]); setExams(ex as TaxonomyNode[]); setYears(yr as TaxonomyNode[]);
  };

  useEffect(() => {
    fetchQuestions();
    fetchTaxonomies();
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
          boardId: '', classId: '', subjectId: '', textbookId: '', chapterId: '', topicId: ''
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

  if (view === 'editor') {
      return (
          <div className="p-6 max-w-5xl mx-auto space-y-6">
              <div className="flex items-center gap-4">
                  <Button variant="ghost" onClick={() => setView('list')}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
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
                                      <label className="text-sm font-medium flex items-center gap-1"><ImageIcon className="h-4 w-4"/> Image URL</label>
                                      <Input placeholder="https://..." value={editData.questionImage || ''} onChange={e => setEditData({...editData, questionImage: e.target.value})} />
                                  </div>
                                  <div>
                                      <label className="text-sm font-medium flex items-center gap-1"><Play className="h-4 w-4"/> Audio URL</label>
                                      <Input placeholder="https://..." value={editData.questionAudio || ''} onChange={e => setEditData({...editData, questionAudio: e.target.value})} />
                                  </div>
                                  <div>
                                      <label className="text-sm font-medium flex items-center gap-1"><Video className="h-4 w-4"/> Video URL</label>
                                      <Input placeholder="https://..." value={editData.questionVideo || ''} onChange={e => setEditData({...editData, questionVideo: e.target.value})} />
                                  </div>
                              </div>
                          </CardContent>
                      </Card>

                      <Card>
                          <CardHeader><CardTitle>MCQ Options</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
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
                          </CardContent>
                      </Card>

                      <Card>
                          <CardHeader className="flex flex-row items-center justify-between">
                              <CardTitle>Explanations</CardTitle>
                              <Button variant="outline" size="sm" onClick={handleGenerateAI} disabled={isGeneratingAI} className="text-purple-600 border-purple-200 bg-purple-50 hover:bg-purple-100">
                                  {isGeneratingAI ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                                  Auto-Generate with AI
                              </Button>
                          </CardHeader>
                          <CardContent className="space-y-4">
                              <div>
                                  <label className="text-sm font-medium">Short Explanation</label>
                                  <Textarea placeholder="Quick hint or formula..." rows={2} value={editData.shortExplanation || ''} onChange={e => setEditData({...editData, shortExplanation: e.target.value})} />
                              </div>
                              <div>
                                  <label className="text-sm font-medium">Explanation</label>
                                  <Textarea placeholder="Explain the answer..." rows={3} value={editData.explanation || ''} onChange={e => setEditData({...editData, explanation: e.target.value})} />
                              </div>
                              <div>
                                  <label className="text-sm font-medium">Detailed Explanation</label>
                                  <Textarea placeholder="In-depth step by step explanation..." rows={5} value={editData.detailedExplanation || ''} onChange={e => setEditData({...editData, detailedExplanation: e.target.value})} />
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
                                  <label className="text-sm font-medium">Tags (comma separated)</label>
                                  <Input placeholder="math, algebra" value={editData.tags?.join(', ') || ''} onChange={e => setEditData({...editData, tags: e.target.value.split(',').map(s=>s.trim())})} />
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
                  </div>
              </div>
          </div>
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
                    <TableCell>{q.options?.a ? 'MCQ' : 'Subjective'}</TableCell>
                    <TableCell>{q.difficulty}</TableCell>
                    <TableCell>{q.status}</TableCell>
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
