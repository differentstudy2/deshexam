import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Search } from 'lucide-react';
import { t, AppLanguage } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';

// Firebase imports
import { getTaxonomyNodes, getQuestionsPaginated, TaxonomyType } from '@/lib/firebase/question-bank';
import { QuestionBankEntry, TaxonomyNode } from '@/lib/question-bank-types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

interface QuestionBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (questions: any[]) => void;
  appLanguage: AppLanguage;
}

export function QuestionBankModal({ isOpen, onClose, onAdd, appLanguage }: QuestionBankModalProps) {
  const { toast } = useToast();

  // Taxonomy states
  const [boards, setBoards] = useState<TaxonomyNode[]>([]);
  const [classes, setClasses] = useState<TaxonomyNode[]>([]);
  const [subjects, setSubjects] = useState<TaxonomyNode[]>([]);
  const [chapters, setChapters] = useState<TaxonomyNode[]>([]);

  // Selected filters
  const [selectedBoard, setSelectedBoard] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedChapter, setSelectedChapter] = useState<string>('all');

  // Query state
  const [questions, setQuestions] = useState<QuestionBankEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());

  // Fetch boards and initial questions on mount
  useEffect(() => {
    if (isOpen) {
      const fetchGuideCol = async (colName: string) => {
        try {
          const snap = await getDocs(collection(db, colName));
          return snap.docs.map(d => {
            const data = d.data();
            return { id: d.id, name: data.title || data.name, ...data };
          });
        } catch(e) {
          console.error('Error fetching guide collection:', colName, e);
          return [];
        }
      };

      const fetchCombinedCol = async (guideCol: string, questionCol: string) => {
        const [g, q] = await Promise.all([fetchGuideCol(guideCol), fetchGuideCol(questionCol)]);
        const combined = [...g, ...q];
        return Array.from(new Map(combined.map(item => [item.id, item])).values()) as TaxonomyNode[];
      };

      Promise.all([
        fetchCombinedCol('guide_boards', 'question_boards'),
        fetchCombinedCol('guide_classes', 'question_classes'),
        fetchCombinedCol('guide_subjects', 'question_subjects'),
        fetchCombinedCol('guide_chapters', 'question_chapters')
      ]).then(([b, c, s, ch]) => {
        setBoards(b);
        setClasses(c);
        setSubjects(s);
        setChapters(ch);
      });
    }
  }, [isOpen]);

  // Auto-fetch questions when filters change
  useEffect(() => {
    if (isOpen) {
      handleSearch();
    }
  }, [isOpen, selectedBoard, selectedClass, selectedSubject, selectedChapter]);

  const handleSearch = async () => {
    setIsLoading(true);
    // Don't clear questions immediately so the UI doesn't completely flash empty
    // setQuestions([]);
    
    const filters: any = {};
    if (selectedBoard !== 'all') filters.boardId = selectedBoard;
    if (selectedClass !== 'all') filters.classId = selectedClass;
    if (selectedSubject !== 'all') filters.subjectId = selectedSubject;
    if (selectedChapter !== 'all') filters.chapterId = selectedChapter;

    try {
      console.log('Fetching questions with filters:', filters);
      const res = await getQuestionsPaginated(filters, 50);
      console.log('Fetched questions:', res.questions);
      setQuestions(res.questions);
    } catch (e: any) {
      console.error('Error fetching questions:', e);
      toast({ 
        title: 'Error fetching questions', 
        description: e.message || 'An error occurred while fetching from Firebase.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedQuestionIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedQuestionIds(newSet);
  };

  const selectAll = () => {
    if (selectedQuestionIds.size === questions.length) {
      setSelectedQuestionIds(newSet => new Set());
    } else {
      setSelectedQuestionIds(new Set(questions.map(q => q.id)));
    }
  };

  const handleAdd = () => {
    const selectedQs = questions.filter(q => selectedQuestionIds.has(q.id));
    // Convert to QuestionBuilder format
    const formattedQs = selectedQs.map((q, idx) => ({
      id: `bank_${Date.now()}_${q.id}`,
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
      slug: `bank-${Date.now()}-${q.id}`,
      breakBeforeColumn: false
    }));

    onAdd(formattedQs);
    setSelectedQuestionIds(new Set());
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            🗃️ {t('addFromBank', appLanguage)}
          </DialogTitle>
        </DialogHeader>

        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/30 p-4 rounded-lg">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">{t('board', appLanguage)} ({boards.length})</label>
            <Select value={selectedBoard} onValueChange={setSelectedBoard}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="All Boards" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Boards</SelectItem>
                {boards.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Class ({classes.length})</label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Subject ({subjects.length})</label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">{t('chapter', appLanguage)} ({chapters.length})</label>
            <Select value={selectedChapter} onValueChange={setSelectedChapter}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="All Chapters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Chapters</SelectItem>
                {chapters.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSearch} disabled={isLoading} className="w-full md:w-auto">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            {t('searchBank', appLanguage)}
          </Button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto border rounded-lg p-2 space-y-2 mt-4 min-h-[300px] bg-muted/10">
          {isLoading && (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
          {!isLoading && questions.length === 0 && (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              {t('noQuestionsFound', appLanguage)}
            </div>
          )}
          {!isLoading && questions.map((q) => (
            <div 
              key={q.id} 
              className={`p-4 border rounded-lg flex gap-4 transition-colors hover:bg-muted/50 cursor-pointer ${selectedQuestionIds.has(q.id) ? 'border-primary bg-primary/5' : 'bg-background'}`}
              onClick={() => toggleSelection(q.id)}
            >
              <Checkbox 
                checked={selectedQuestionIds.has(q.id)}
                onCheckedChange={() => toggleSelection(q.id)}
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
                <div className="mt-3 flex gap-2">
                  <span className="text-[10px] px-2 py-0.5 bg-gray-100 rounded-full text-gray-500 font-medium">
                    {q.difficulty}
                  </span>
                  {q.language && (
                    <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">
                      {q.language}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <DialogFooter className="mt-4 flex items-center justify-between sm:justify-between border-t pt-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={selectAll} disabled={questions.length === 0}>
              {selectedQuestionIds.size === questions.length && questions.length > 0 ? 'Deselect All' : t('selectAll', appLanguage)}
            </Button>
            <span className="text-sm text-muted-foreground font-medium">
              {selectedQuestionIds.size} selected
            </span>
          </div>
          <Button onClick={handleAdd} disabled={selectedQuestionIds.size === 0}>
            {t('addSelected', appLanguage)} ({selectedQuestionIds.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
