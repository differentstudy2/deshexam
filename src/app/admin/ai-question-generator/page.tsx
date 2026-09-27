'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, Search, Wand2, Copy, Check } from 'lucide-react';
import { generateQuestions, AIQuestionGeneratorInput, AIQuestionGeneratorOutput } from '@/ai/flows/ai-question-generator';

export default function AIQuestionGeneratorPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState<AIQuestionGeneratorOutput | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState<AIQuestionGeneratorInput>({
    numQuestions: 5,
    difficulty: 'Medium',
    sourceType: 'text',
    source: '',
    questionType: 'Any',
  });

  const handleGenerate = async () => {
    if (!formData.source.trim()) {
      toast({ title: 'Error', description: 'Source content cannot be empty.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    setGeneratedData(null);
    setCopied(false);
    
    try {
      const result = await generateQuestions(formData);
      setGeneratedData(result);
      toast({ title: 'Success', description: `Generated ${result.questions.length} questions.` });
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Generation Failed', description: error.message || 'Unknown error occurred.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedData) return;
    navigator.clipboard.writeText(JSON.stringify(generatedData.questions, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied', description: 'Questions copied to clipboard as JSON.' });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-indigo-600" />
          AI Question Generator
        </h1>
        <p className="text-slate-500 mt-2">Generate questions automatically using AI based on text, topics, or chapters.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>Set the parameters for the AI generation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Number of Questions</Label>
                <Input 
                  type="number"
                  min={1}
                  max={20}
                  value={formData.numQuestions}
                  onChange={e => setFormData({...formData, numQuestions: parseInt(e.target.value) || 5})}
                />
              </div>

              <div className="space-y-2">
                <Label>Difficulty</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.difficulty}
                  onChange={e => setFormData({...formData, difficulty: e.target.value as any})}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Question Type</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.questionType}
                  onChange={e => setFormData({...formData, questionType: e.target.value as any})}
                >
                  <option value="Any">Any Mixed Type</option>
                  <option value="Multiple Choice">Multiple Choice</option>
                  <option value="True/False">True/False</option>
                  <option value="Short Answer">Short Answer</option>
                  <option value="Fill in the Blank">Fill in the Blank</option>
                  <option value="Matching">Matching</option>
                  <option value="Descriptive">Descriptive</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Source Type</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.sourceType}
                  onChange={e => setFormData({...formData, sourceType: e.target.value as any})}
                >
                  <option value="text">Raw Text Content</option>
                  <option value="topic">Topic Name (e.g., Photosynthesis)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Source</Label>
                <Textarea 
                  value={formData.source}
                  onChange={e => setFormData({...formData, source: e.target.value})}
                  placeholder={formData.sourceType === 'topic' ? "Enter topic name..." : "Paste the raw text content here..."}
                  rows={6}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleGenerate} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                {loading ? 'Generating...' : 'Generate Questions'}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="md:col-span-8">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Generated Output</CardTitle>
                <CardDescription>Review the AI-generated questions</CardDescription>
              </div>
              {generatedData && (
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="w-4 h-4 text-green-500 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  Copy JSON
                </Button>
              )}
            </CardHeader>
            <CardContent className="flex-1">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12 space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin text-indigo-400" />
                  <p>AI is thinking and creating questions...</p>
                </div>
              ) : generatedData ? (
                <div className="space-y-6">
                  {generatedData.questions.map((q, idx) => (
                    <div key={idx} className="p-4 border rounded-lg bg-slate-50">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-slate-800">Q{idx + 1}. {q.text}</span>
                        <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full font-medium">
                          {q.type} ({q.marks} marks)
                        </span>
                      </div>
                      
                      {q.options && q.options.length > 0 && (
                        <ul className="list-disc list-inside mt-2 text-sm text-slate-600 space-y-1">
                          {q.options.map((opt, oIdx) => (
                            <li key={oIdx}>{opt.text}</li>
                          ))}
                        </ul>
                      )}

                      <div className="mt-3 text-sm">
                        <span className="font-medium text-emerald-700">Answer: </span>
                        <span className="text-emerald-600">{typeof q.correctAnswer === 'string' ? q.correctAnswer : JSON.stringify(q.correctAnswer)}</span>
                      </div>

                      {q.explanation && (
                        <div className="mt-2 text-sm text-slate-500 italic">
                          <span className="font-medium not-italic">Explanation:</span> {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                  <Search className="w-12 h-12 mb-4 opacity-20" />
                  <p>Fill out the configuration and click generate.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
