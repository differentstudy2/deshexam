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
import { getTopicHierarchy, getTopicSections } from '@/lib/firebase/guide';
import { QuestionBankEditor } from '@/components/admin/QuestionBankEditor';
import { QuestionBankEntry } from '@/lib/question-bank-types';
import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const renderMathInHtml = (htmlString: string) => {
  if (!htmlString) return '';
  try {
    if (!htmlString.includes('$')) return htmlString;
    return htmlString.replace(/\$([^\$]+)\$/g, (match, math) => {
      // Decode HTML entities and remove tags that Tiptap might inject
      let decodedMath = math.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/<[^>]+>/g, '');
      return katex.renderToString(decodedMath, { throwOnError: false, displayMode: false });
    });
  } catch(e: any) {
    return htmlString + ` <span class="text-red-500 text-xs">[KaTeX Error: ${e?.message || 'Unknown'}]</span>`;
  }
};

interface TopicQuestionManagerProps {
  topicId: string;
  tabType: string;
  nodeLevel?: 'chapter' | 'topic';
}

export function TopicQuestionManager({ topicId, tabType, nodeLevel = 'topic' }: TopicQuestionManagerProps) {
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
  const [aiSettings, setAiSettings] = useState({
      count: '10',
      difficulty: 'Medium',
      language: 'Bangla',
      questionType: 'MCQ'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [innerQType, setInnerQType] = useState('MCQ');
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Filters state
  const [filterText, setFilterText] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterLanguage, setFilterLanguage] = useState('All');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  const filteredQuestions = questions.filter(q => {
    if (filterDifficulty !== 'All' && q.difficulty !== filterDifficulty) return false;
    if (filterStatus !== 'All' && q.status !== filterStatus) return false;
    if (filterLanguage !== 'All' && q.language !== filterLanguage) return false;
    if (filterText) {
      const txt = filterText.toLowerCase();
      if (!q.questionText?.toLowerCase().includes(txt)) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const currentQuestions = filteredQuestions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  const mapTabToQuestionType = (tab: string) => {
      if (tab === 'questions') return innerQType;
      if (tab === 'mcq') return 'MCQ';
      if (tab === 'creative_question') return 'CQ';
      if (tab === 'descriptive') return 'Desc';
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
      const field = nodeLevel === 'chapter' ? 'chapterId' : 'topicId';
      const data = await getQuestions({ [field]: topicId, questionType: qType }, 500);
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
            if (item.optionExplanations) newQuestion.optionExplanations = item.optionExplanations;
            
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
          const finalPrompt = `Task: Generate exactly ${aiSettings.count} ${aiSettings.questionType} questions.
Difficulty Level: ${aiSettings.difficulty}
Language: ${aiSettings.language}

Additional Instructions / Context:
${aiPrompt}`;

          const res = await fetch('/api/ai/generate-mcq', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt: finalPrompt })
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

  const handleOpenAiMode = async () => {
      // First, switch to AI mode immediately to show the prompt box
      setMode('ai');
      setIsProcessing(true); // Re-using isProcessing for the loading state while we fetch
      
      try {
          const parts = [];
          if (hierarchy?.boardTitle) parts.push(hierarchy.boardTitle);
          if (hierarchy?.classTitle) parts.push(hierarchy.classTitle);
          if (hierarchy?.subjectTitle) parts.push(hierarchy.subjectTitle);
          if (hierarchy?.chapterTitle) parts.push(hierarchy.chapterTitle);
          if (hierarchy?.topicTitle) parts.push(hierarchy.topicTitle);
          
          let defaultPrompt = parts.length > 0 ? parts.join(', ') : '';
          
          // Fetch guide content
          const sections = await getTopicSections(topicId);
          let rawHtml = '';
          if (sections['lesson']?.content) rawHtml += sections['lesson'].content + '\n';
          if (sections['guide_content']?.content) rawHtml += sections['guide_content'].content + '\n';
          if (sections['notes']?.content) rawHtml += sections['notes'].content + '\n';
          
          const cleanText = rawHtml.replace(/<[^>]*>?/gm, ' ').trim();
          
          if (cleanText) {
              defaultPrompt += `\n\n=== SOURCE MATERIAL ===\n${cleanText}`;
          }
          
          setAiPrompt(defaultPrompt);
      } catch (err) {
          console.error("Failed to fetch topic sections for AI", err);
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
      return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#107c41]" /></div>;
  }

  return (
    <div className="space-y-2">

      {/* ── Inner type sub-pills (Questions tab only) ── */}
      {tabType === 'questions' && (
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 lg:flex-wrap lg:overflow-x-visible lg:pb-0">
          {['MCQ','T/F','FIB','Match','Desc','CQ'].map(t => (
            <button key={t} onClick={() => setInnerQType(t)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap border transition-all ${
                innerQType === t ? 'bg-[#107c41] text-white border-[#107c41]' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500'
              }`}>{t}</button>
          ))}
        </div>
      )}

      {/* ── Mode action pills ── */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 lg:flex-wrap lg:overflow-x-visible lg:pb-0">
        <button onClick={() => setMode('list')} className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap border transition-all ${ mode === 'list' ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 border-slate-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500' }`}>
          All ({questions.length})
        </button>
        <button onClick={() => { setMode('single'); }} className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold flex items-center gap-1 whitespace-nowrap border transition-all ${ mode === 'single' ? 'bg-[#107c41] text-white border-[#107c41]' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500' }`}>
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
        {qType === 'MCQ' && (
          <>
            <button onClick={handleOpenAiMode} className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold flex items-center gap-1 whitespace-nowrap border transition-all ${ mode === 'ai' ? 'bg-violet-600 text-white border-violet-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500' }`}><Sparkles className="w-3.5 h-3.5" /> AI</button>
            <button onClick={() => setMode('bulk')} className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold flex items-center gap-1 whitespace-nowrap border transition-all ${ mode === 'bulk' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500' }`}><Upload className="w-3.5 h-3.5" /> Bulk</button>
            {questions.length > 0 && <button onClick={enterBulkEditMode} className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold flex items-center gap-1 whitespace-nowrap border transition-all ${ mode === 'bulk-edit' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500' }`}><Edit className="w-3.5 h-3.5" /> Edit All</button>}
          </>
        )}
      </div>

      {/* ── QUESTION LIST ── */}
      {['list', 'bulk-edit'].includes(mode) && (
        <div className="space-y-2">

          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl sticky top-[73px] lg:top-0 z-20 shadow-sm">
            <div className="flex items-center gap-2 flex-1 w-full shrink-0">
               <input type="checkbox" className="w-4 h-4 accent-[#107c41] rounded" checked={selectedIds.size > 0 && selectedIds.size === filteredQuestions.length} onChange={toggleAllSelection} id="select-all" />
               <label htmlFor="select-all" className="text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer whitespace-nowrap min-w-24">
                 {selectedIds.size > 0 ? `${selectedIds.size} selected` : `${filteredQuestions.length} questions`}
               </label>
            </div>
            
            <div className="flex flex-wrap md:flex-nowrap items-center gap-2 w-full">
               <Input 
                 placeholder="Search text..." 
                 value={filterText} 
                 onChange={e => setFilterText(e.target.value)}
                 className="h-8 text-xs w-full md:w-[150px] lg:w-[200px]"
               />
               <Select value={filterLanguage} onValueChange={setFilterLanguage}>
                 <SelectTrigger className="w-full md:w-[100px] h-8 text-[11px]"><SelectValue placeholder="Language" /></SelectTrigger>
                 <SelectContent>
                   <SelectItem value="All">All Langs</SelectItem>
                   <SelectItem value="Bangla">Bangla</SelectItem>
                   <SelectItem value="English">English</SelectItem>
                   <SelectItem value="Hindi">Hindi</SelectItem>
                 </SelectContent>
               </Select>
               <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                 <SelectTrigger className="w-full md:w-[100px] h-8 text-[11px]"><SelectValue placeholder="Difficulty" /></SelectTrigger>
                 <SelectContent>
                   <SelectItem value="All">All Levels</SelectItem>
                   <SelectItem value="Easy">Easy</SelectItem>
                   <SelectItem value="Medium">Medium</SelectItem>
                   <SelectItem value="Hard">Hard</SelectItem>
                 </SelectContent>
               </Select>
               <Select value={filterStatus} onValueChange={setFilterStatus}>
                 <SelectTrigger className="w-full md:w-[100px] h-8 text-[11px]"><SelectValue placeholder="Status" /></SelectTrigger>
                 <SelectContent>
                   <SelectItem value="All">All Status</SelectItem>
                   <SelectItem value="Published">Published</SelectItem>
                   <SelectItem value="Draft">Draft</SelectItem>
                 </SelectContent>
               </Select>

              {selectedIds.size > 0 && (
                <div className="flex items-center gap-1.5 border-l pl-2 border-slate-200 dark:border-slate-700 ml-auto">
                  <Select onValueChange={(val) => handleBulkUpdateProperty('language', val)}>
                    <SelectTrigger className="w-[80px] h-8 text-[11px] rounded-full"><SelectValue placeholder="Language" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bangla">Bangla</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Hindi">Hindi</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select onValueChange={(val) => handleBulkUpdateProperty('status', val)}>
                    <SelectTrigger className="w-[80px] h-8 text-[11px] rounded-full"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent><SelectItem value="Published">Published</SelectItem><SelectItem value="Draft">Draft</SelectItem><SelectItem value="Archived">Archived</SelectItem></SelectContent>
                  </Select>
                  <Select onValueChange={(val) => handleBulkUpdateProperty('difficulty', val)}>
                    <SelectTrigger className="w-[80px] h-8 text-[11px] rounded-full"><SelectValue placeholder="Level" /></SelectTrigger>
                    <SelectContent><SelectItem value="Easy">Easy</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Hard">Hard</SelectItem></SelectContent>
                  </Select>
                  <button onClick={handleBulkDeleteUI} className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Empty state */}
          {questions.length === 0 && (
            <div className="flex flex-col items-center py-14 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
              <p className="text-sm text-slate-400">No {qType}s yet</p>
              <button onClick={() => setMode('single')} className="mt-3 px-4 py-2 text-xs font-semibold rounded-full bg-[#107c41] text-white">+ Add First Question</button>
            </div>
          )}

          {/* Question cards */}
          <div className="space-y-2 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
          {currentQuestions.map((q, qi) => (
            <div key={q.id} className={`bg-white dark:bg-slate-900 border rounded-xl overflow-hidden shadow-sm transition-colors ${ selectedIds.has(q.id) ? 'border-[#107c41] ring-1 ring-[#107c41]/30' : 'border-slate-200 dark:border-slate-800' }`}>
              <div className="flex items-start gap-2 p-2.5">
                {/* Checkbox + number */}
                <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                  <input type="checkbox" className="w-3.5 h-3.5 accent-[#107c41] rounded" checked={selectedIds.has(q.id)} onChange={() => toggleSelection(q.id)} />
                  <span className="text-[10px] font-bold text-slate-400 w-4 text-center">{(currentPage - 1) * itemsPerPage + qi + 1}</span>
                </div>

                {/* Question body */}
                <div className="flex-1 min-w-0">
                  {/* Marks badge + type */}
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    {q.marks && <span className="text-[10px] font-black text-amber-700 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 px-1.5 py-0.5 rounded-full">[{q.marks} Marks]</span>}
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">{q.questionType}</span>
                    {q.difficulty && <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${ q.difficulty === 'Easy' ? 'text-emerald-700 bg-emerald-50' : q.difficulty === 'Hard' ? 'text-red-600 bg-red-50' : 'text-amber-600 bg-amber-50' }`}>{q.difficulty}</span>}
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${ q.status === 'Published' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 bg-slate-100' }`}>{q.status}</span>
                    {q.language && <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full dark:text-blue-400 dark:bg-blue-900/30">{q.language}</span>}
                  </div>

                  {/* Question text */}
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-snug line-clamp-3" dangerouslySetInnerHTML={{__html: renderMathInHtml(q.questionText)}} />

                  {/* MCQ options */}
                  {q.questionType === 'MCQ' && q.options && (
                    <div className="grid grid-cols-2 gap-1 mt-2">
                      {(['a','b','c','d'] as const).map(key => (
                        <div key={key} className={`text-[11px] px-2 py-1 rounded-lg border leading-tight flex items-start gap-1 ${ q.correctAnswer === key ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-800 font-semibold text-emerald-800 dark:text-emerald-300' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400' }`}>
                          <span className="font-bold uppercase shrink-0 mt-0.5">{key}.</span>
                          <div dangerouslySetInnerHTML={{__html: renderMathInHtml(q.options?.[key] || '')}} className="inline" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Matching pairs */}
                  {q.questionType === 'Match' && q.matchingPairs && q.matchingPairs.length > 0 && (
                    <div className="mt-2 bg-slate-50 dark:bg-slate-800 rounded-lg p-2">
                      <div className="grid grid-cols-2 gap-1 text-[11px]">
                        <div className="font-bold text-slate-500">Column A</div>
                        <div className="font-bold text-slate-500">Column B</div>
                        {q.matchingPairs.map((pair: any, idx: number) => (
                          <React.Fragment key={idx}>
                            <div className="text-slate-700 dark:text-slate-300 flex gap-1"><span className="shrink-0">{idx+1}.</span> <div dangerouslySetInnerHTML={{__html: renderMathInHtml(pair.left)}} className="inline" /></div>
                            <div className="text-slate-700 dark:text-slate-300 flex gap-1"><span className="shrink-0">{String.fromCharCode(65+idx)}.</span> <div dangerouslySetInnerHTML={{__html: renderMathInHtml(pair.right)}} className="inline" /></div>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Short/Long/Creative answer */}
                  {!['MCQ','Match'].includes(q.questionType || '') && q.correctAnswer && (
                    <div className="mt-2 text-[11px] p-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 mr-1">Answer: </span>
                      <span className="text-slate-700 dark:text-slate-300" dangerouslySetInnerHTML={{__html: renderMathInHtml(q.correctAnswer)}} />
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-1 shrink-0">
                  <button onClick={() => { setEditingQuestion(q); setMode('edit'); }} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                    <Edit className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                  <Link href={`/question/${q.slug || q.id}`} target="_blank">
                    <button className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </Link>
                  <button onClick={() => handleDelete(q.id)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 dark:hover:bg-red-900/30">
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          </div>{/* end 2-col grid */}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">{(currentPage-1)*itemsPerPage+1}–{Math.min(currentPage*itemsPerPage, questions.length)} of {questions.length}</span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setCurrentPage(p => Math.max(1,p-1))} disabled={currentPage===1}
                  className="px-3 py-1.5 text-[11px] font-semibold rounded-full border border-slate-200 disabled:opacity-40 bg-white dark:bg-slate-900">
                  <ChevronLeft className="w-3 h-3 inline" /> Prev
                </button>
                <span className="text-[11px] text-slate-500 font-medium">{currentPage}/{totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages,p+1))} disabled={currentPage===totalPages}
                  className="px-3 py-1.5 text-[11px] font-semibold rounded-full border border-slate-200 disabled:opacity-40 bg-white dark:bg-slate-900">
                  Next <ChevronRight className="w-3 h-3 inline" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── ADD / EDIT QUESTION EDITOR ── */}
      {(mode === 'single' || mode === 'edit') && !hierarchyLoading && (
        <div className="animate-in fade-in duration-200 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950 shadow-sm mt-2">
          {mode === 'edit' && (
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
              <button onClick={() => { setMode('list'); setEditingQuestion(null); }} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Editing Question</span>
            </div>
          )}
          <QuestionBankEditor
            defaultContentType="academic"
            initialData={mode === 'edit' && editingQuestion ? {
              ...editingQuestion,
              boardId: editingQuestion.boardId || hierarchy?.boardId || '',
              classId: editingQuestion.classId || hierarchy?.classId || '',
              subjectId: editingQuestion.subjectId || hierarchy?.subjectId || '',
              textbookId: editingQuestion.textbookId || hierarchy?.textbookId || '',
              chapterId: editingQuestion.chapterId || hierarchy?.chapterId || '',
              topicId: editingQuestion.topicId || topicId,
            } : {
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
              if (mode === 'edit') { setMode('list'); setEditingQuestion(null); }
            }}
            onCancel={() => { setMode('list'); setEditingQuestion(null); }}
          />
        </div>
      )}

      {/* ── BULK IMPORT ── */}
      {mode === 'bulk' && !hierarchyLoading && (
        <div className="animate-in fade-in duration-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm mt-2">
          <div className="flex items-center gap-2 px-3 py-2.5 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900/50">
            <Upload className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-700 dark:text-blue-400">Bulk Import (JSON)</span>
          </div>
          <div className="p-3 space-y-3">
            <Textarea
              disabled={isProcessing}
              value={bulkJson}
              onChange={e => setBulkJson(e.target.value)}
              placeholder={`[\n  {\n    "questionText": "...",\n    "options": {"a":"","b":"","c":"","d":""},\n    "correctAnswer": "a",\n    "explanation": "..."\n  }\n]`}
              className="min-h-[200px] font-mono text-xs bg-slate-900 text-slate-50 rounded-xl border-0"
            />
            <button onClick={handleBulkImport} disabled={isProcessing || !bulkJson}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60">
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Import Questions
            </button>
          </div>
        </div>
      )}

      {/* ── BULK EDIT ── */}
      {mode === 'bulk-edit' && !hierarchyLoading && (
        <div className="animate-in fade-in duration-200 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900 rounded-xl overflow-hidden shadow-sm mt-2">
          <div className="flex items-center gap-2 px-3 py-2.5 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-900/50">
            <Edit className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400">Bulk Edit (JSON)</span>
          </div>
          <div className="p-3 space-y-3">
            <Textarea
              disabled={isProcessing}
              value={bulkJson}
              onChange={e => setBulkJson(e.target.value)}
              className="min-h-[240px] font-mono text-xs bg-slate-900 text-slate-50 rounded-xl border-0"
            />
            <button onClick={handleBulkEditUpdate} disabled={isProcessing || !bulkJson}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60">
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* ── AI GENERATE ── */}
      {mode === 'ai' && (
        <div className="animate-in fade-in duration-200 bg-white dark:bg-slate-900 border border-violet-200 dark:border-violet-900 rounded-xl overflow-hidden shadow-sm mt-2">
          <div className="flex items-center gap-2 px-3 py-2.5 bg-violet-50 dark:bg-violet-900/20 border-b border-violet-100 dark:border-violet-900/50">
            <Sparkles className="w-4 h-4 text-violet-600" />
            <span className="text-xs font-bold text-violet-700 dark:text-violet-400">Generate with AI</span>
          </div>
          <div className="p-3 space-y-3">
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative border border-slate-200 dark:border-slate-800 rounded-lg pt-2 pb-1 bg-white dark:bg-slate-950">
                  <label className="absolute top-0 left-2 -translate-y-1/2 bg-white dark:bg-slate-950 px-1 text-[10px] font-medium text-slate-500 pointer-events-none">Questions</label>
                  <Select value={aiSettings.count} onValueChange={v => setAiSettings({...aiSettings, count: v})}>
                      <SelectTrigger className="border-0 focus:ring-0 shadow-none h-8 pt-0 bg-transparent font-medium text-slate-700 dark:text-slate-300">
                          <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="5">5 Questions</SelectItem>
                          <SelectItem value="10">10 Questions</SelectItem>
                          <SelectItem value="15">15 Questions</SelectItem>
                          <SelectItem value="20">20 Questions</SelectItem>
                          <SelectItem value="30">30 Questions</SelectItem>
                          <SelectItem value="50">50 Questions</SelectItem>
                      </SelectContent>
                  </Select>
              </div>
              <div className="relative border border-slate-200 dark:border-slate-800 rounded-lg pt-2 pb-1 bg-white dark:bg-slate-950">
                  <label className="absolute top-0 left-2 -translate-y-1/2 bg-white dark:bg-slate-950 px-1 text-[10px] font-medium text-slate-500 pointer-events-none">Type</label>
                  <Select value={aiSettings.questionType} onValueChange={v => setAiSettings({...aiSettings, questionType: v})}>
                      <SelectTrigger className="border-0 focus:ring-0 shadow-none h-8 pt-0 bg-transparent font-medium text-slate-700 dark:text-slate-300">
                          <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="MCQ">MCQ</SelectItem>
                          <SelectItem value="T/F">True/False</SelectItem>
                          <SelectItem value="FIB">Fill in Blanks</SelectItem>
                          <SelectItem value="Match">Matching</SelectItem>
                          <SelectItem value="Desc">Descriptive</SelectItem>
                          <SelectItem value="CQ">Creative Question</SelectItem>
                      </SelectContent>
                  </Select>
              </div>
              <div className="relative border border-slate-200 dark:border-slate-800 rounded-lg pt-2 pb-1 bg-white dark:bg-slate-950">
                  <label className="absolute top-0 left-2 -translate-y-1/2 bg-white dark:bg-slate-950 px-1 text-[10px] font-medium text-slate-500 pointer-events-none">Language</label>
                  <Select value={aiSettings.language} onValueChange={v => setAiSettings({...aiSettings, language: v})}>
                      <SelectTrigger className="border-0 focus:ring-0 shadow-none h-8 pt-0 bg-transparent font-medium text-slate-700 dark:text-slate-300">
                          <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="Bangla">Bangla</SelectItem>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Hindi">Hindi</SelectItem>
                      </SelectContent>
                  </Select>
              </div>
              <div className="relative border border-slate-200 dark:border-slate-800 rounded-lg pt-2 pb-1 bg-white dark:bg-slate-950">
                  <label className="absolute top-0 left-2 -translate-y-1/2 bg-white dark:bg-slate-950 px-1 text-[10px] font-medium text-slate-500 pointer-events-none">Difficulty</label>
                  <Select value={aiSettings.difficulty} onValueChange={v => setAiSettings({...aiSettings, difficulty: v})}>
                      <SelectTrigger className="border-0 focus:ring-0 shadow-none h-8 pt-0 bg-transparent font-medium text-slate-700 dark:text-slate-300">
                          <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="Easy">Easy</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                  </Select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Additional Instructions / Source Content</label>
              <Textarea
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="e.g., Make them conceptual and tricky."
                className="mt-1 min-h-[100px] text-sm rounded-xl"
              />
            </div>
            <button onClick={handleGenerateAI} disabled={isProcessing}
              className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60">
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate Questions
            </button>
          </div>
        </div>
      )}

      <style jsx>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
}
