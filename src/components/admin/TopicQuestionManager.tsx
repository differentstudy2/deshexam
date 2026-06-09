'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, Save, ExternalLink, Loader2 } from 'lucide-react';
import { getQuestions, createQuestion, updateQuestion, deleteQuestion } from '@/lib/firebase/question-bank';
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
  const [isAdding, setIsAdding] = useState(false);
  
  // Minimal editor state
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState({ a: '', b: '', c: '', d: '' });
  const [correctAnswer, setCorrectAnswer] = useState('');
  
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
        difficulty: 'Medium',
        status: 'Draft',
        language: 'English',
        viewsCount: 0,
        likesCount: 0,
        dislikesCount: 0,
        bookmarksCount: 0,
        examIds: [],
        qaChecklist: [],
        tags: []
      };

      await createQuestion(newQuestion);
      toast({ title: 'Question added to Question Bank!' });
      setIsAdding(false);
      setQuestionText('');
      setOptions({ a: '', b: '', c: '', d: '' });
      setCorrectAnswer('');
      fetchTopicQuestions();
    } catch (error) {
      toast({ title: 'Error creating question', variant: 'destructive' });
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
      <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-4 border rounded-lg">
          <div>
              <h3 className="text-lg font-semibold">{qType}s for this Topic</h3>
              <p className="text-sm text-slate-500">These questions are centrally synced with the Question Bank.</p>
          </div>
          <div className="flex gap-2">
              <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? "outline" : "default"} className={!isAdding ? "bg-[#107c41] hover:bg-[#0b5c30]" : ""}>
                  {isAdding ? "Cancel" : <><Plus className="w-4 h-4 mr-2" /> Add Mini Question</>}
              </Button>
              <Link href={`/admin/question-bank/questions?topicId=${topicId}`}>
                <Button variant="secondary" className="shadow-sm">
                    <ExternalLink className="w-4 h-4 mr-2" /> Full Editor
                </Button>
              </Link>
          </div>
      </div>

      {isAdding && (
          <Card className="border-emerald-200 dark:border-emerald-900 shadow-md">
              <CardHeader className="bg-emerald-50/50 dark:bg-emerald-900/20 pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                      Inline {qType} Creator
                  </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                      <Label>Question Text</Label>
                      <Textarea 
                          value={questionText} 
                          onChange={e => setQuestionText(e.target.value)} 
                          placeholder="Type your question here..."
                          className="min-h-[100px]"
                      />
                  </div>

                  {qType === 'MCQ' && (
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2"><Label>Option A</Label><Input value={options.a} onChange={e => setOptions({...options, a: e.target.value})} /></div>
                          <div className="space-y-2"><Label>Option B</Label><Input value={options.b} onChange={e => setOptions({...options, b: e.target.value})} /></div>
                          <div className="space-y-2"><Label>Option C</Label><Input value={options.c} onChange={e => setOptions({...options, c: e.target.value})} /></div>
                          <div className="space-y-2"><Label>Option D</Label><Input value={options.d} onChange={e => setOptions({...options, d: e.target.value})} /></div>
                      </div>
                  )}

                  <div className="space-y-2">
                      <Label>{qType === 'MCQ' ? 'Correct Answer' : 'Answer Key'}</Label>
                      {qType === 'MCQ' ? (
                          <Select value={correctAnswer} onValueChange={setCorrectAnswer}>
                              <SelectTrigger><SelectValue placeholder="Select correct option" /></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="a">Option A</SelectItem>
                                  <SelectItem value="b">Option B</SelectItem>
                                  <SelectItem value="c">Option C</SelectItem>
                                  <SelectItem value="d">Option D</SelectItem>
                              </SelectContent>
                          </Select>
                      ) : (
                          <Textarea 
                              value={correctAnswer} 
                              onChange={e => setCorrectAnswer(e.target.value)} 
                              placeholder="Type the answer key or main points..."
                          />
                      )}
                  </div>
                  
                  <div className="pt-2 flex justify-end">
                      <Button onClick={handleSaveInline} className="bg-[#107c41] hover:bg-[#0b5c30]">
                          <Save className="w-4 h-4 mr-2" /> Save to Question Bank
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
                  <Card key={q.id} className="relative group">
                      <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                          <Link href={`/admin/question-bank/questions?topicId=${topicId}`}>
                              <Button variant="outline" size="sm" className="h-8"><Edit className="w-4 h-4" /></Button>
                          </Link>
                          <Button variant="destructive" size="sm" className="h-8" onClick={() => handleDelete(q.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                      <CardContent className="p-5">
                          <div className="font-medium mb-3 pr-20" dangerouslySetInnerHTML={{__html: q.questionText}} />
                          {q.questionType === 'MCQ' && q.options && (
                              <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                                  <div className={`p-2 rounded border ${q.correctAnswer === 'a' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30' : 'bg-slate-50 dark:bg-slate-800'}`}>A: {q.options.a}</div>
                                  <div className={`p-2 rounded border ${q.correctAnswer === 'b' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30' : 'bg-slate-50 dark:bg-slate-800'}`}>B: {q.options.b}</div>
                                  <div className={`p-2 rounded border ${q.correctAnswer === 'c' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30' : 'bg-slate-50 dark:bg-slate-800'}`}>C: {q.options.c}</div>
                                  <div className={`p-2 rounded border ${q.correctAnswer === 'd' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30' : 'bg-slate-50 dark:bg-slate-800'}`}>D: {q.options.d}</div>
                              </div>
                          )}
                          {q.questionType !== 'MCQ' && q.correctAnswer && (
                              <div className="mt-3 text-sm p-3 bg-slate-50 dark:bg-slate-900 rounded border">
                                  <span className="font-semibold block mb-1">Answer Key:</span>
                                  <div dangerouslySetInnerHTML={{__html: q.correctAnswer}} />
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
