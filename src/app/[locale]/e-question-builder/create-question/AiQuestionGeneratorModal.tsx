import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Sparkles } from 'lucide-react';
import { t, AppLanguage } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';

interface AiQuestionGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (questions: any[]) => void;
  appLanguage: AppLanguage;
}

export function AiQuestionGeneratorModal({ isOpen, onClose, onAdd, appLanguage }: AiQuestionGeneratorModalProps) {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState<AppLanguage>(appLanguage);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [selectedQuestionIndices, setSelectedQuestionIndices] = useState<Set<number>>(new Set());

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setGeneratedQuestions([]);
    setSelectedQuestionIndices(new Set());

    try {
      // Append language instruction to the prompt
      const finalPrompt = `${prompt}\n\nPlease generate the questions in the following language: ${language === 'bn' ? 'Bengali' : language === 'hi' ? 'Hindi' : 'English'}.`;

      const response = await fetch('/api/ai/generate-mcq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: finalPrompt })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        setGeneratedQuestions(data);
        // Auto-select all initially
        setSelectedQuestionIndices(new Set(data.map((_, i) => i)));
      } else {
        throw new Error("Invalid format returned by AI.");
      }
    } catch (e: any) {
      console.error('Error generating questions:', e);
      toast({
        title: 'Generation Failed',
        description: e.message || 'An error occurred while generating questions.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelection = (index: number) => {
    const newSet = new Set(selectedQuestionIndices);
    if (newSet.has(index)) newSet.delete(index);
    else newSet.add(index);
    setSelectedQuestionIndices(newSet);
  };

  const selectAll = () => {
    if (selectedQuestionIndices.size === generatedQuestions.length) {
      setSelectedQuestionIndices(new Set());
    } else {
      setSelectedQuestionIndices(new Set(generatedQuestions.map((_, i) => i)));
    }
  };

  const handleAdd = () => {
    const selectedQs = generatedQuestions.filter((_, i) => selectedQuestionIndices.has(i));
    
    // Format them for the QuestionPaperBuilder
    const formattedQs = selectedQs.map((q, idx) => ({
      id: `ai_${Date.now()}_${idx}`,
      questionText: q.questionText,
      options: {
        a: q.options?.a || '',
        b: q.options?.b || '',
        c: q.options?.c || '',
        d: q.options?.d || ''
      },
      correctAnswer: q.correctAnswer?.toLowerCase() || 'a',
      explanation: q.explanation || '',
      difficulty: q.difficulty || 'Medium',
      status: 'Published',
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: `ai-${Date.now()}-${idx}`,
      breakBeforeColumn: false
    }));

    onAdd(formattedQs);
    setSelectedQuestionIndices(new Set());
    setGeneratedQuestions([]);
    setPrompt('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2 text-primary">
            <Sparkles className="w-5 h-5 text-amber-500" />
            {t('aiGenerate', appLanguage)}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="bg-muted/30 p-4 rounded-lg space-y-3 border border-border/50">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                {t('describeQuestions', appLanguage)}
              </label>
              <Textarea
                placeholder={t('aiPromptPlaceholder', appLanguage)}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px] resize-none bg-background focus-visible:ring-primary/20"
              />
            </div>
            
            <div className="flex items-end gap-3">
              <div className="w-48">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  {t('language', appLanguage)}
                </label>
                <Select value={language} onValueChange={(v) => setLanguage(v as AppLanguage)}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleGenerate} 
                disabled={isLoading || !prompt.trim()} 
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                {isLoading ? t('generating', appLanguage) : t('generate', appLanguage)}
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        {(generatedQuestions.length > 0 || isLoading) && (
          <div className="flex-1 overflow-y-auto border rounded-lg p-2 space-y-2 mt-4 min-h-[300px] bg-muted/10 relative">
            {isLoading && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-primary">
                <Loader2 className="h-10 w-10 animate-spin mb-4 text-indigo-600" />
                <p className="font-medium animate-pulse text-indigo-600">{t('generating', appLanguage)}</p>
              </div>
            )}
            
            {generatedQuestions.map((q, idx) => (
              <div 
                key={idx} 
                className={`p-4 border rounded-lg flex gap-4 transition-colors hover:bg-muted/50 cursor-pointer ${selectedQuestionIndices.has(idx) ? 'border-indigo-500 bg-indigo-50/50' : 'bg-background'}`}
                onClick={() => toggleSelection(idx)}
              >
                <Checkbox 
                  checked={selectedQuestionIndices.has(idx)}
                  onCheckedChange={() => toggleSelection(idx)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-900 mb-2" dangerouslySetInnerHTML={{ __html: q.questionText }}></p>
                  {q.options && (
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div dangerouslySetInnerHTML={{ __html: `(a) ${q.options.a}` }} />
                      <div dangerouslySetInnerHTML={{ __html: `(b) ${q.options.b}` }} />
                      <div dangerouslySetInnerHTML={{ __html: `(c) ${q.options.c}` }} />
                      <div dangerouslySetInnerHTML={{ __html: `(d) ${q.options.d}` }} />
                    </div>
                  )}
                  {q.correctAnswer && (
                    <div className="mt-3 text-xs font-medium text-emerald-600 bg-emerald-50 inline-block px-2 py-1 rounded">
                      Correct Answer: {q.correctAnswer.toUpperCase()}
                    </div>
                  )}
                  {q.explanation && (
                    <div className="mt-2 text-xs text-muted-foreground italic border-l-2 border-muted-foreground/30 pl-2">
                      {q.explanation}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer actions */}
        <DialogFooter className="mt-4 flex items-center justify-between sm:justify-between border-t pt-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={selectAll} disabled={generatedQuestions.length === 0 || isLoading}>
              {selectedQuestionIndices.size === generatedQuestions.length && generatedQuestions.length > 0 ? 'Deselect All' : t('selectAll', appLanguage)}
            </Button>
            <span className="text-sm text-muted-foreground font-medium">
              {selectedQuestionIndices.size} selected
            </span>
          </div>
          <Button 
            onClick={handleAdd} 
            disabled={selectedQuestionIndices.size === 0 || isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {t('addSelected', appLanguage)} ({selectedQuestionIndices.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
