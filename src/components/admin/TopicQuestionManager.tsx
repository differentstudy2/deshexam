'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, Save, ExternalLink, Loader2, Sparkles, Upload } from 'lucide-react';
import { getQuestions, createQuestion, deleteQuestion } from '@/lib/firebase/question-bank';
import { QuestionBankEntry } from '@/lib/question-bank-types';
import Link from 'next/link';

interface TopicQuestionManagerProps {
  topicId: string;
  tabType: string;
}

export function TopicQuestionManager({ topicId, tabType }: TopicQuestionManagerProps) {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<QuestionBankEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Editor mode state
  const [mode, setMode] = useState<'list' | 'single' | 'bulk' | 'ai'>('list');
  
  // Minimal editor state
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState({ a: '', b: '', c: '', d: '' });
  const [correctAnswer, setCorrectAnswer] = useState('a');
  const [explanation, setExplanation] = useState('');

  // Bulk and AI state
  const [bulkJson, setBulkJson] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mapTabToQuestionType = (tab: string) => {
      if (tab === 'mcq') return 'MCQ';
      if (tab === 'creative_question') return 'Creative';
      if (tab === 'short_question') return 'Short Answer';
      return 'MCQ'; // default
  };
  
  const qType = mapTabToQuestionType(tabType);

  const fetchTopicQuestions = async () => {
    setLoading(true);
    try {
      const data = await getQuestions({ topicId, questionType: qType }, 100);
      setQuestions(data);
    } catch (error) {
      toast({ title: 'Error fetching questions', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopicQuestions();
    setMode('list');
  }, [topicId, tabType]);

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

            const newQuestion: Omit<QuestionBankEntry, 'createdAt' | 'updatedAt'> = {
                id: `qb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                slug: `q-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                topicId: topicId,
                questionType: qType as any,
                questionText: item.questionText,
                options: qType === 'MCQ' ? item.options : undefined,
                correctAnswer: item.correctAnswer,
                explanation: item.explanation || '',
                difficulty: 'Medium',
                status: 'Draft',
                language: 'English',
                examIds: [],
                qaChecklist: [],
                tags: []
              };
        
              await createQuestion(newQuestion);
        }
        
        toast({ title: 'Questions imported successfully!' });
        setBulkJson('');
        setMode('list');
        fetchTopicQuestions();
    } catch(e: any) {
        toast({ title: 'Invalid JSON format', description: e.message, variant: 'destructive' });
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

  if (loading) {
      return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-[#107c41]" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-4 border rounded-lg">
          <div>
              <h3 className="text-lg font-semibold">{qType}s for this Topic</h3>
              <p className="text-sm text-slate-500">These questions are centrally synced with the Question Bank.</p>
          </div>
          <div className="flex flex-wrap gap-2">
              {qType === 'MCQ' && (
                  <>
                      <Button onClick={() => setMode(mode === 'ai' ? 'list' : 'ai')} variant={mode === 'ai' ? "outline" : "secondary"} className="bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200">
                          {mode === 'ai' ? "Cancel AI" : <><Sparkles className="w-4 h-4 mr-2" /> AI Generate</>}
                      </Button>
                      <Button onClick={() => setMode(mode === 'bulk' ? 'list' : 'bulk')} variant="outline">
                          {mode === 'bulk' ? "Cancel Bulk" : <><Upload className="w-4 h-4 mr-2" /> Bulk Import JSON</>}
                      </Button>
                  </>
              )}
              <Button onClick={() => setMode(mode === 'single' ? 'list' : 'single')} variant={mode === 'single' ? "outline" : "default"} className={mode !== 'single' ? "bg-[#107c41] hover:bg-[#0b5c30]" : ""}>
                  {mode === 'single' ? "Cancel" : <><Plus className="w-4 h-4 mr-2" /> Add Single</>}
              </Button>
              <Link href={`/admin/question-bank/questions?topicId=${topicId}`}>
                <Button variant="secondary" className="shadow-sm">
                    <ExternalLink className="w-4 h-4 mr-2" /> Full Editor
                </Button>
              </Link>
          </div>
      </div>

      {/* SINGLE QUESTION EDITOR */}
      {mode === 'single' && (
          <Card className="border-emerald-200 dark:border-emerald-900 shadow-md animate-in fade-in slide-in-from-top-2">
              <CardHeader className="bg-emerald-50/50 dark:bg-emerald-900/20 pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">Inline {qType} Creator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                  <div className="space-y-2">
                      <Label>Question Text</Label>
                      <Textarea value={questionText} onChange={e => setQuestionText(e.target.value)} placeholder="Type your question here..." className="min-h-[80px]"/>
                  </div>

                  {qType === 'MCQ' && (
                      <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/50 border rounded-lg">
                          <Label className="mb-2 block text-slate-500">Options (Select the radio button for the correct answer)</Label>
                          {['a', 'b', 'c', 'd'].map((opt) => (
                              <div key={opt} className={`flex items-center gap-3 p-2 rounded-md transition-colors ${correctAnswer === opt ? 'bg-emerald-100/50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800' : ''}`}>
                                  <input 
                                      type="radio" 
                                      name="correct-answer" 
                                      checked={correctAnswer === opt} 
                                      onChange={() => setCorrectAnswer(opt)} 
                                      className="w-4 h-4 text-emerald-600 accent-emerald-600 cursor-pointer"
                                  />
                                  <Label className="w-16 font-semibold uppercase cursor-pointer" onClick={() => setCorrectAnswer(opt)}>Option {opt}</Label>
                                  <Input 
                                      value={options[opt as keyof typeof options]} 
                                      onChange={e => setOptions({...options, [opt]: e.target.value})} 
                                      className="flex-1 bg-white dark:bg-slate-950" 
                                      placeholder={`Enter option ${opt.toUpperCase()}...`}
                                  />
                              </div>
                          ))}
                      </div>
                  )}

                  {qType !== 'MCQ' && (
                      <div className="space-y-2">
                          <Label>Answer Key</Label>
                          <Textarea value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)} placeholder="Type the answer key or main points..." />
                      </div>
                  )}

                  <div className="space-y-2">
                      <Label>Explanation (Optional)</Label>
                      <Textarea value={explanation} onChange={e => setExplanation(e.target.value)} placeholder="Explain why the answer is correct..." className="min-h-[80px]" />
                  </div>
                  
                  <div className="pt-2 flex justify-end">
                      <Button onClick={handleSaveInline} className="bg-[#107c41] hover:bg-[#0b5c30]">
                          <Save className="w-4 h-4 mr-2" /> Save to Question Bank
                      </Button>
                  </div>
              </CardContent>
          </Card>
      )}

      {/* BULK IMPORT EDITOR */}
      {mode === 'bulk' && (
          <Card className="border-blue-200 dark:border-blue-900 shadow-md animate-in fade-in slide-in-from-top-2">
              <CardHeader className="bg-blue-50/50 dark:bg-blue-900/20 pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">Bulk JSON Import</CardTitle>
                  <p className="text-sm text-slate-500">Paste a JSON array containing your questions. Format: <code className="bg-white dark:bg-black px-1 rounded">[{`{"questionText": "...", "options": {"a":"...","b":"...","c":"...","d":"..."}, "correctAnswer": "a", "explanation": "..."}`}]</code></p>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                  <Textarea 
                      value={bulkJson} 
                      onChange={e => setBulkJson(e.target.value)} 
                      placeholder="[\n  {\n    &quot;questionText&quot;: &quot;...&quot;,\n    &quot;options&quot;: { &quot;a&quot;: &quot;&quot;, &quot;b&quot;: &quot;&quot;, &quot;c&quot;: &quot;&quot;, &quot;d&quot;: &quot;&quot; },\n    &quot;correctAnswer&quot;: &quot;a&quot;,\n    &quot;explanation&quot;: &quot;...&quot;\n  }\n]"
                      className="min-h-[300px] font-mono text-sm bg-slate-900 text-slate-50"
                  />
                  <div className="flex justify-end">
                      <Button onClick={handleBulkImport} disabled={isProcessing} className="bg-blue-600 hover:bg-blue-700 text-white">
                          {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                          Import Questions
                      </Button>
                  </div>
              </CardContent>
          </Card>
      )}

      {/* AI GENERATION EDITOR */}
      {mode === 'ai' && (
          <Card className="border-purple-200 dark:border-purple-900 shadow-md animate-in fade-in slide-in-from-top-2">
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

      <div className="space-y-4">
          {questions.length === 0 ? (
              <div className="text-center p-8 border-2 border-dashed rounded-lg text-slate-500">
                  No {qType}s found for this topic yet.
              </div>
          ) : (
              questions.map(q => (
                  <Card key={q.id} className="relative group hover:border-[#107c41]/50 transition-colors">
                      <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                          <Link href={`/admin/question-bank/questions?topicId=${topicId}`}>
                              <Button variant="outline" size="sm" className="h-8"><Edit className="w-4 h-4" /></Button>
                          </Link>
                          <Button variant="destructive" size="sm" className="h-8" onClick={() => handleDelete(q.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                      <CardContent className="p-5">
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
              ))
          )}
      </div>
    </div>
  );
}
