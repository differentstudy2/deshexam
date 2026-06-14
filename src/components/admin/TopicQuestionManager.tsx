'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, Save, ExternalLink, Loader2, Sparkles, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import { getQuestions, createQuestion, deleteQuestion, bulkEditQuestions, bulkUpdateQuestions, bulkDeleteQuestions } from '@/lib/firebase/question-bank';
import { getTopicHierarchy } from '@/lib/firebase/guide';
import { QuestionBankEditor } from '@/components/admin/QuestionBankEditor';
import { QuestionBankEntry } from '@/lib/question-bank-types';
import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TopicQuestionManagerProps {
  topicId: string;
  tabType: string;
}

export function TopicQuestionManager({ topicId, tabType }: TopicQuestionManagerProps) {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<QuestionBankEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [hierarchy, setHierarchy] = useState<any>(null);
  const [hierarchyLoading, setHierarchyLoading] = useState(true);
  
  // Editor mode state
  const [mode, setMode] = useState<'list' | 'single' | 'bulk' | 'bulk-edit' | 'ai' | 'edit'>('list');
  const [editingQuestion, setEditingQuestion] = useState<QuestionBankEntry | null>(null);
  
  // Minimal editor state
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState({ a: '', b: '', c: '', d: '' });
  const [correctAnswer, setCorrectAnswer] = useState('a');
  const [explanation, setExplanation] = useState('');

  // Bulk and AI state
  const [bulkJson, setBulkJson] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [innerQType, setInnerQType] = useState('MCQ');
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  const totalPages = Math.ceil(questions.length / itemsPerPage);
  const currentQuestions = questions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  const mapTabToQuestionType = (tab: string) => {
      if (tab === 'questions') return innerQType;
      if (tab === 'mcq') return 'MCQ';
      if (tab === 'creative_question') return 'Creative Question'; // Fixed to match QuestionType
      if (tab === 'short_question') return 'Short Question';       // Fixed to match QuestionType
      if (tab === 'model_test') return 'Model Test';
      if (tab === 'practice_sets') return 'Practice Set';
      if (tab === 'quizzes') return 'Quiz';
      if (tab === 'mock_tests') return 'Mock Test';
      if (tab === 'exams_papers') return 'Exam Paper';
      return 'MCQ'; // default
  };
  
  const qType = mapTabToQuestionType(tabType);

  const fetchTopicQuestions = async () => {
    setLoading(true);
    try {
      const data = await getQuestions({ topicId, questionType: qType }, 500);
      setQuestions(data);
      setSelectedIds(new Set());
      setCurrentPage(1);
    } catch (error) {
      toast({ title: 'Error fetching questions', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopicQuestions();
    setHierarchyLoading(true);
    getTopicHierarchy(topicId).then((h) => {
      setHierarchy(h);
      setHierarchyLoading(false);
    });
  }, [topicId, tabType, innerQType]);

  const handleSaveInline = async () => {
    if (!questionText) {
      toast({ title: 'Question text is required', variant: 'destructive' });
      return;
    }
    if (qType === 'MCQ' && (!options.a || !options.b || !options.c || !options.d || !correctAnswer)) {
      toast({ title: 'All options and correct answer are required for MCQ', variant: 'destructive' });
      return;
    }

    try {
      const newQuestion: Omit<QuestionBankEntry, 'createdAt' | 'updatedAt'> = {
        id: `qb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        slug: `q-${Date.now()}`,
        topicId: topicId,
        boardId: hierarchy?.boardId || '',
        classId: hierarchy?.classId || '',
        subjectId: hierarchy?.subjectId || '',
        textbookId: hierarchy?.textbookId || '',
        chapterId: hierarchy?.chapterId || topicId,
        questionType: qType as any,
        questionText: questionText,
        options: qType === 'MCQ' ? options : undefined,
        correctAnswer: correctAnswer,
        explanation: explanation,
        difficulty: 'Medium',
        status: 'Draft',
        language: 'English',
        examIds: [],
        qaChecklist: [],
        tags: []
      };

      await createQuestion(newQuestion);
      toast({ title: 'Question added to Question Bank!' });
      
      // Reset
      setQuestionText('');
      setOptions({ a: '', b: '', c: '', d: '' });
      setCorrectAnswer('a');
      setExplanation('');
      setMode('list');
      fetchTopicQuestions();
    } catch (error) {
      toast({ title: 'Error creating question', variant: 'destructive' });
    }
  };

  const handleBulkImport = async () => {
    try {
        const parsed = JSON.parse(bulkJson);
        if (!Array.isArray(parsed)) throw new Error("Must be a JSON array");
        
        setIsProcessing(true);
        for (const item of parsed) {
            if (!item.questionText || !item.correctAnswer) continue;

            const generateSlug = (text: string) => {
                const noHtml = text.replace(/<[^>]*>?/gm, '');
                // 1. Keep letters, numbers, marks, spaces, and format chars (ZWJ). Remove all other punctuation.
                const cleanText = noHtml.replace(/[^\p{L}\p{N}\p{M}\p{Cf}\s]/gu, '');
                // 2. Replace one or more spaces with a single dash
                const slugified = cleanText.trim().replace(/\s+/g, '-').toLowerCase();
                
                // 3. Truncate up to 60 chars, but try not to cut in the middle of a word
                let truncated = slugified;
                if (truncated.length > 60) {
                    truncated = truncated.substring(0, 60);
                    const lastDash = truncated.lastIndexOf('-');
                    if (lastDash > 0) {
                        truncated = truncated.substring(0, lastDash);
                    }
                }
                
                return `${truncated || 'q'}-${Math.random().toString(36).substr(2, 5)}`;
            };

            const newQuestion: any = {
                id: `qb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                slug: generateSlug(item.questionText),
                topicId: topicId,
                boardId: hierarchy?.boardId || '',
                classId: hierarchy?.classId || '',
                subjectId: hierarchy?.subjectId || '',
                textbookId: hierarchy?.textbookId || '',
                chapterId: hierarchy?.chapterId || topicId,
                questionType: qType,
                questionText: item.questionText,
                correctAnswer: item.correctAnswer,
                explanation: item.explanation || '',
                difficulty: 'Medium',
                status: 'Draft',
                language: 'English',
                examIds: [],
                qaChecklist: [],
                tags: []
            };

            if (item.title) newQuestion.title = item.title;
            if (qType === 'MCQ' && item.options) newQuestion.options = item.options;
            
            await createQuestion(newQuestion);
        }
        
        toast({ title: 'Questions imported successfully!' });
        setBulkJson('');
        setMode('single');
        fetchTopicQuestions();
    } catch (error) {
        console.error(error);
        toast({ title: 'Error importing questions', variant: 'destructive' });
    } finally {
        setIsProcessing(false);
    }
  };

  const enterBulkEditMode = () => {
      const simplified = questions.map(q => ({
          id: q.id,
          questionText: q.questionText,
          options: q.options || { a: '', b: '', c: '', d: '' },
          correctAnswer: q.correctAnswer || 'a',
          explanation: q.explanation || ''
      }));
      setBulkJson(JSON.stringify(simplified, null, 2));
      setMode('bulk-edit');
  };

  const handleBulkEditUpdate = async () => {
    try {
        const parsed = JSON.parse(bulkJson);
        if (!Array.isArray(parsed)) throw new Error("Must be a JSON array");
        
        setIsProcessing(true);
        const updates = parsed.filter(item => item.id).map(item => ({
            id: item.id,
            questionText: item.questionText,
            options: item.options,
            correctAnswer: item.correctAnswer,
            explanation: item.explanation
        }));
        
        if (updates.length > 0) {
            await bulkEditQuestions(updates);
            toast({ title: `Successfully updated ${updates.length} questions!` });
        }
        
        setBulkJson('');
        setMode('list');
        fetchTopicQuestions();
    } catch (error) {
        console.error(error);
        toast({ title: 'Error updating questions', variant: 'destructive' });
    } finally {
        setIsProcessing(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt) {
        toast({ title: 'Prompt is required', variant: 'destructive' });
        return;
    }
    setIsProcessing(true);
    try {
        const res = await fetch('/api/ai/generate-mcq', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: aiPrompt })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to generate');
        
        // Auto-switch to bulk mode and paste the generated JSON so user can review it
        setBulkJson(JSON.stringify(data, null, 2));
        setMode('bulk');
        toast({ title: 'Questions generated!', description: 'Review the JSON and click Import.' });
    } catch(e: any) {
        toast({ title: 'AI Generation Failed', description: e.message, variant: 'destructive' });
    } finally {
        setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this question globally?')) {
        try {
            await deleteQuestion(id);
            toast({ title: 'Question deleted' });
            fetchTopicQuestions();
        } catch(e) {
            toast({ title: 'Failed to delete', variant: 'destructive' });
        }
    }
  };

  const toggleSelection = (id: string) => {
      const newSet = new Set(selectedIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setSelectedIds(newSet);
  };

  const toggleAllSelection = () => {
      if (selectedIds.size === questions.length && questions.length > 0) {
          setSelectedIds(new Set());
      } else {
          setSelectedIds(new Set(questions.map(q => q.id)));
      }
  };

  const handleBulkUpdateProperty = async (property: string, value: string) => {
      if (selectedIds.size === 0) return;
      try {
          setIsProcessing(true);
          await bulkUpdateQuestions(Array.from(selectedIds), { [property]: value });
          toast({ title: `Updated ${selectedIds.size} questions successfully!` });
          fetchTopicQuestions();
      } catch (e) {
          toast({ title: 'Failed to update questions', variant: 'destructive' });
      } finally {
          setIsProcessing(false);
      }
  };

  const handleBulkDeleteUI = async () => {
      if (selectedIds.size === 0) return;
      if (confirm(`Are you sure you want to permanently delete ${selectedIds.size} questions?`)) {
          try {
              setIsProcessing(true);
              await bulkDeleteQuestions(Array.from(selectedIds));
              toast({ title: `Deleted ${selectedIds.size} questions successfully!` });
              fetchTopicQuestions();
          } catch (e) {
              toast({ title: 'Failed to delete questions', variant: 'destructive' });
          } finally {
              setIsProcessing(false);
          }
      }
  };

  if (loading) {
      return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-[#107c41]" /></div>;
  }

  return (
    <div className="space-y-6">
      {tabType === 'questions' && (
        <Tabs value={innerQType} onValueChange={setInnerQType}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="MCQ">MCQ</TabsTrigger>
            <TabsTrigger value="Short Question">Short Questions</TabsTrigger>
            <TabsTrigger value="Creative Question">Creative Questions</TabsTrigger>
          </TabsList>
        </Tabs>
      )}
      <div className="flex flex-wrap gap-4 justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-4 border rounded-lg">
          <div>
              <h3 className="text-lg font-semibold">{qType}s for this Topic</h3>
              <p className="text-sm text-slate-500">These questions are centrally synced with the Question Bank.</p>
          </div>
      </div>
      <Tabs value={mode} onValueChange={(val) => {
          if (val === 'bulk-edit') enterBulkEditMode();
          else setMode(val as any);
          if (val !== 'list') {
              setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
          }
      }} className="w-full">
          <TabsList className="flex flex-wrap w-full h-auto p-1 bg-slate-100 dark:bg-slate-900 mb-6">
              <TabsTrigger value="list" className="flex-1 min-w-[120px] py-2">Questions List</TabsTrigger>
              <TabsTrigger value="single" className="flex-1 min-w-[120px] py-2">Add Question</TabsTrigger>
              {qType === 'MCQ' && (
                  <>
                      <TabsTrigger value="ai" className="flex-1 min-w-[120px] py-2"><Sparkles className="w-4 h-4 mr-2" /> AI Generate</TabsTrigger>
                      <TabsTrigger value="bulk" className="flex-1 min-w-[120px] py-2"><Upload className="w-4 h-4 mr-2" /> Bulk Import</TabsTrigger>
                      {questions.length > 0 && (
                          <TabsTrigger value="bulk-edit" className="flex-1 min-w-[120px] py-2"><Edit className="w-4 h-4 mr-2" /> Bulk Edit</TabsTrigger>
                      )}
                  </>
              )}
          </TabsList>
      </Tabs>

      {/* --- 1. QUESTIONS LIST IS ALWAYS RENDERED FIRST --- */}
      <div className="space-y-4">
          {questions.length > 0 && (
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 border p-3 rounded-lg sticky top-4 z-10 shadow-sm">
                  <div className="flex items-center gap-3">
                      <Checkbox 
                          checked={selectedIds.size > 0 && selectedIds.size === questions.length} 
                          onCheckedChange={toggleAllSelection} 
                          id="select-all" 
                      />
                      <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                          Select All ({selectedIds.size} selected)
                      </label>
                  </div>
                  {selectedIds.size > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                          <Select onValueChange={(val) => handleBulkUpdateProperty('status', val)}>
                              <SelectTrigger className="w-[120px] h-9">
                                  <SelectValue placeholder="Status..." />
                              </SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="Published">Published</SelectItem>
                                  <SelectItem value="Draft">Draft</SelectItem>
                                  <SelectItem value="Archived">Archived</SelectItem>
                              </SelectContent>
                          </Select>
                          <Select onValueChange={(val) => handleBulkUpdateProperty('difficulty', val)}>
                              <SelectTrigger className="w-[120px] h-9">
                                  <SelectValue placeholder="Difficulty..." />
                              </SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="Easy">Easy</SelectItem>
                                  <SelectItem value="Medium">Medium</SelectItem>
                                  <SelectItem value="Hard">Hard</SelectItem>
                                  <SelectItem value="Expert">Expert</SelectItem>
                              </SelectContent>
                          </Select>
                          <Select onValueChange={(val) => handleBulkUpdateProperty('language', val)}>
                              <SelectTrigger className="w-[120px] h-9">
                                  <SelectValue placeholder="Language..." />
                              </SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="English">English</SelectItem>
                                  <SelectItem value="Bangla">Bangla</SelectItem>
                                  <SelectItem value="Hindi">Hindi</SelectItem>
                                  <SelectItem value="Arabic">Arabic</SelectItem>
                              </SelectContent>
                          </Select>
                          <Button variant="destructive" size="sm" className="h-9" onClick={handleBulkDeleteUI}>
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </Button>
                      </div>
                  )}
              </div>
          )}

          {questions.length === 0 && (
              <div className="text-center p-8 border-2 border-dashed rounded-lg text-slate-500">
                  No {qType}s found for this topic yet.
              </div>
          )}

          {questions.length > 0 && (
              <>
                  {currentQuestions.map(q => (
                      <Card key={q.id} className={`relative group transition-colors ${selectedIds.has(q.id) ? 'border-[#107c41] ring-1 ring-[#107c41] bg-emerald-50/20' : 'hover:border-[#107c41]/50'}`}>
                          <div className="absolute left-3 top-3 z-10">
                              <Checkbox checked={selectedIds.has(q.id)} onCheckedChange={() => toggleSelection(q.id)} />
                          </div>
                          <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
                              <Link href={`/question/${q.slug || q.id}`} target="_blank">
                                  <Button variant="outline" size="sm" className="h-8"><ExternalLink className="w-4 h-4" /></Button>
                              </Link>
                              <Button variant="outline" size="sm" className="h-8" onClick={() => { 
                                  setEditingQuestion(q); 
                                  setMode('edit'); 
                                  setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
                              }}><Edit className="w-4 h-4" /></Button>
                              <Button variant="destructive" size="sm" className="h-8" onClick={() => handleDelete(q.id)}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                          <CardContent className="p-5 pl-10">
                              <div className="font-medium mb-3 pr-20 text-slate-800 dark:text-slate-100" dangerouslySetInnerHTML={{__html: q.questionText}} />
                              {q.questionType === 'MCQ' && q.options && (
                                  <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                                      <div className={`p-2 rounded border ${q.correctAnswer === 'a' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'}`}>
                                          <span className="font-semibold mr-2 text-slate-500">A</span> {q.options.a}
                                      </div>
                                      <div className={`p-2 rounded border ${q.correctAnswer === 'b' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'}`}>
                                          <span className="font-semibold mr-2 text-slate-500">B</span> {q.options.b}
                                      </div>
                                      <div className={`p-2 rounded border ${q.correctAnswer === 'c' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'}`}>
                                          <span className="font-semibold mr-2 text-slate-500">C</span> {q.options.c}
                                      </div>
                                      <div className={`p-2 rounded border ${q.correctAnswer === 'd' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'}`}>
                                          <span className="font-semibold mr-2 text-slate-500">D</span> {q.options.d}
                                      </div>
                                  </div>
                              )}
                              {q.questionType !== 'MCQ' && q.correctAnswer && (
                                  <div className="mt-3 text-sm p-3 bg-slate-50 dark:bg-slate-900 rounded border">
                                      <span className="font-semibold block mb-1">Answer Key:</span>
                                      <div dangerouslySetInnerHTML={{__html: q.correctAnswer}} />
                                  </div>
                              )}
                              {q.explanation && (
                                  <div className="mt-4 text-sm p-3 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-md">
                                      <span className="font-semibold text-blue-700 dark:text-blue-400 block mb-1">Explanation:</span>
                                      <div dangerouslySetInnerHTML={{__html: q.explanation}} />
                                  </div>
                              )}
                          </CardContent>
                      </Card>
                  ))}
                  
                  {totalPages > 1 && (
                      <div className="flex items-center justify-between border-t pt-4 mt-6">
                          <span className="text-sm text-slate-500">
                              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, questions.length)} of {questions.length} questions
                          </span>
                          <div className="flex items-center gap-2">
                              <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                  disabled={currentPage === 1}
                              >
                                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                              </Button>
                              <span className="text-sm px-2 text-slate-600 font-medium">Page {currentPage} of {totalPages}</span>
                              <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                  disabled={currentPage === totalPages}
                              >
                                  Next <ChevronRight className="w-4 h-4 ml-1" />
                              </Button>
                          </div>
                      </div>
                  )}
              </>
          )}
      </div>

      {/* --- 2. EDITORS AND FORMS APPEAR BELOW THE LIST --- */}

      {/* SINGLE QUESTION EDITOR */}
      {mode === 'single' && !hierarchyLoading && (
          <div className="animate-in fade-in slide-in-from-top-2 border rounded-xl overflow-hidden bg-white dark:bg-slate-950 shadow-md p-2 mt-4">
              <QuestionBankEditor 
                  defaultContentType="academic"
                  initialData={{
                      topicId,
                      questionType: qType as any,
                      boardId: hierarchy?.boardId || '',
                      classId: hierarchy?.classId || '',
                      subjectId: hierarchy?.subjectId || '',
                      textbookId: hierarchy?.textbookId || '',
                      chapterId: hierarchy?.chapterId || '',
                  }}
                  onSaveComplete={() => {
                      fetchTopicQuestions();
                      // Keep the form open for the next question instead of closing it
                  }}
                  onCancel={() => setMode('list')}
              />
          </div>
      )}

      {/* EDIT QUESTION EDITOR */}
      {mode === 'edit' && editingQuestion && !hierarchyLoading && (
          <div className="animate-in fade-in slide-in-from-top-2 border rounded-xl overflow-hidden bg-white dark:bg-slate-950 shadow-md p-2 mt-4">
              <QuestionBankEditor 
                  defaultContentType="academic"
                  initialData={{
                      ...editingQuestion,
                      boardId: editingQuestion.boardId || hierarchy?.boardId || '',
                      classId: editingQuestion.classId || hierarchy?.classId || '',
                      subjectId: editingQuestion.subjectId || hierarchy?.subjectId || '',
                      textbookId: editingQuestion.textbookId || hierarchy?.textbookId || '',
                      chapterId: editingQuestion.chapterId || hierarchy?.chapterId || '',
                      topicId: editingQuestion.topicId || topicId,
                  }}
                  onSaveComplete={() => {
                      setMode('list');
                      setEditingQuestion(null);
                      fetchTopicQuestions();
                  }}
                  onCancel={() => {
                      setMode('list');
                      setEditingQuestion(null);
                  }}
              />
          </div>
      )}

      {/* BULK IMPORT UI */}
      {mode === 'bulk' && !hierarchyLoading && (
          <div className="animate-in fade-in slide-in-from-top-2 mt-4">
              <Card>
              <CardHeader className="bg-slate-50 dark:bg-slate-900 pb-4">
                  <CardTitle className="text-lg flex items-center gap-2 text-[#107c41]">
                      <Upload className="w-5 h-5" /> Bulk Import Questions (JSON)
                  </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                  <Textarea 
                      disabled={isProcessing || hierarchyLoading}
                      value={bulkJson} 
                      onChange={e => setBulkJson(e.target.value)} 
                      placeholder="[\n  {\n    &quot;questionText&quot;: &quot;...&quot;,\n    &quot;options&quot;: { &quot;a&quot;: &quot;&quot;, &quot;b&quot;: &quot;&quot;, &quot;c&quot;: &quot;&quot;, &quot;d&quot;: &quot;&quot; },\n    &quot;correctAnswer&quot;: &quot;a&quot;,\n    &quot;explanation&quot;: &quot;...&quot;\n  }\n]"
                      className="min-h-[300px] font-mono text-sm bg-slate-900 text-slate-50"
                  />
                  <div className="flex justify-end">
                      <Button onClick={handleBulkImport} disabled={isProcessing || !bulkJson || hierarchyLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
                          {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                          Import Questions
                      </Button>
                  </div>
              </CardContent>
              </Card>
          </div>
      )}

      {/* BULK EDIT UI */}
      {mode === 'bulk-edit' && !hierarchyLoading && (
          <div className="animate-in fade-in slide-in-from-top-2 mt-4">
              <Card>
              <CardHeader className="bg-amber-50 dark:bg-amber-900/20 pb-4 border-b border-amber-100 dark:border-amber-900/50">
                  <CardTitle className="text-lg flex items-center gap-2 text-amber-700 dark:text-amber-400">
                      <Edit className="w-5 h-5" /> Bulk Edit Questions (JSON)
                  </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                  <Textarea 
                      disabled={isProcessing || hierarchyLoading}
                      value={bulkJson} 
                      onChange={e => setBulkJson(e.target.value)} 
                      className="min-h-[400px] font-mono text-sm bg-slate-900 text-slate-50"
                  />
                  <div className="flex justify-end">
                      <Button onClick={handleBulkEditUpdate} disabled={isProcessing || !bulkJson || hierarchyLoading} className="bg-amber-600 hover:bg-amber-700 text-white">
                          {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                          Save Changes
                      </Button>
                  </div>
              </CardContent>
              </Card>
          </div>
      )}

      {/* AI GENERATION EDITOR */}
      {mode === 'ai' && (
          <Card className="border-purple-200 dark:border-purple-900 shadow-md animate-in fade-in slide-in-from-top-2 mt-4">
              <CardHeader className="bg-purple-50/50 dark:bg-purple-900/20 pb-4">
                  <CardTitle className="text-lg flex items-center gap-2 text-purple-700 dark:text-purple-400">
                      <Sparkles className="w-5 h-5" /> Generate MCQs with Google Gemini
                  </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                      <Label>What should the questions be about?</Label>
                      <Textarea 
                          value={aiPrompt} 
                          onChange={e => setAiPrompt(e.target.value)} 
                          placeholder="e.g., Generate 5 multiple choice questions about Newton's laws of motion. Make them difficult and conceptual."
                          className="min-h-[120px]"
                      />
                  </div>
                  <div className="flex justify-end">
                      <Button onClick={handleGenerateAI} disabled={isProcessing} className="bg-purple-600 hover:bg-purple-700 text-white">
                          {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                          Generate Questions
                      </Button>
                  </div>
              </CardContent>
          </Card>
      )}


    </div>
  );
}
