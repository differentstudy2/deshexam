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
  initialFilters?: {
    boardId?: string;
    classId?: string;
    textbookId?: string;
    subjectId?: string;
    chapterId?: string;
  };
}

export function QuestionBankModal({ isOpen, onClose, onAdd, appLanguage, initialFilters }: QuestionBankModalProps) {
  const { toast } = useToast();

  // Taxonomy states
  const [boards, setBoards] = useState<TaxonomyNode[]>([]);
  const [classes, setClasses] = useState<TaxonomyNode[]>([]);
  const [textbooks, setTextbooks] = useState<TaxonomyNode[]>([]);
  const [subjects, setSubjects] = useState<TaxonomyNode[]>([]);
  const [chapters, setChapters] = useState<TaxonomyNode[]>([]);

  // Selected filters
  const [selectedBoard, setSelectedBoard] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedTextbook, setSelectedTextbook] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedChapter, setSelectedChapter] = useState<string>('all');

  // Query state
  const [questions, setQuestions] = useState<QuestionBankEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());

  // Update selected filters when modal opens with initialFilters
  useEffect(() => {
    if (isOpen && initialFilters) {
      setSelectedBoard(initialFilters.boardId || 'all');
      setSelectedClass(initialFilters.classId || 'all');
      setSelectedTextbook(initialFilters.textbookId || 'all');
      setSelectedSubject(initialFilters.subjectId || 'all');
      setSelectedChapter(initialFilters.chapterId || 'all');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]); // Run only when modal opens

  // Fetch boards and initial questions on mount
  useEffect(() => {
    if (isOpen) {
      const fetchTaxonomies = async () => {
        try {
          const snap = await getDocs(collection(db, 'taxonomy_nodes'));
          const allNodes = snap.docs.map(d => {
            const data = d.data();
            return { id: d.id, name: data.title || data.name, ...data } as TaxonomyNode;
          });
          
          setBoards(allNodes.filter(n => n.type === 'board' || n.type === 'category'));
          setClasses(allNodes.filter(n => n.type === 'class' || n.type === 'subcategory'));
          setTextbooks(allNodes.filter(n => n.type === 'textbook' || n.type === 'exam'));
          setSubjects(allNodes.filter(n => n.type === 'subject'));
          setChapters(allNodes.filter(n => n.type === 'chapter'));
        } catch(e) {
          console.error('Error fetching taxonomy_nodes:', e);
        }
      };

      fetchTaxonomies();
    }
  }, [isOpen]);

  // Auto-fetch questions when filters change
  useEffect(() => {
    if (isOpen) {
      handleSearch();
    }
  }, [isOpen, selectedBoard, selectedClass, selectedTextbook, selectedSubject, selectedChapter]);

  const handleSearch = async () => {
    setIsLoading(true);
    // Don't clear questions immediately so the UI doesn't completely flash empty
    // setQuestions([]);
    
    const filters: any = {};
    if (selectedBoard !== 'all') filters.boardId = selectedBoard;
    if (selectedClass !== 'all') filters.classId = selectedClass;
    if (selectedTextbook !== 'all') filters.textbookId = selectedTextbook;
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

  const filteredClasses = classes.filter(c => selectedBoard === 'all' || c.parentId === selectedBoard);
  const filteredSubjects = subjects.filter(s => selectedClass === 'all' || s.parentId === selectedClass);
  const filteredTextbooks = textbooks.filter(t => selectedSubject === 'all' || t.parentId === selectedSubject);
  const filteredChapters = chapters.filter(c => selectedTextbook === 'all' ? (selectedSubject === 'all' || c.parentId === selectedSubject) : c.parentId === selectedTextbook);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            🗃️ {t('addFromBank', appLanguage)}
          </DialogTitle>
        </DialogHeader>

        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-muted/30 p-4 rounded-lg">
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
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Class ({filteredClasses.length})</label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {filteredClasses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Textbook ({filteredTextbooks.length})</label>
            <Select value={selectedTextbook} onValueChange={setSelectedTextbook}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="All Textbooks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Textbooks</SelectItem>
                {filteredTextbooks.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Subject ({filteredSubjects.length})</label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {filteredSubjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">{t('chapter', appLanguage)} ({filteredChapters.length})</label>
            <Select value={selectedChapter} onValueChange={setSelectedChapter}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="All Chapters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Chapters</SelectItem>
                {filteredChapters.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
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
