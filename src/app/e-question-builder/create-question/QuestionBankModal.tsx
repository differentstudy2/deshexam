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
        const HARDCODED_BOARDS = [
          { id: 'hb1', name: 'ঢাকা বোর্ড', type: 'board' },
          { id: 'hb2', name: 'রাজশাহী বোর্ড', type: 'board' },
        ];
        const HARDCODED_CLASSES = [
          { id: 'hc1', name: 'অষ্টম শ্রেণি (Class 8)', type: 'class', parentId: 'hb1' },
          { id: 'hc2', name: 'নবম-দশম শ্রেণি (SSC)', type: 'class', parentId: 'hb1' },
        ];
        const HARDCODED_TEXTBOOKS = [
          { id: 'ht1', name: 'সাধারণ বিজ্ঞান', type: 'textbook', parentId: 'hc1' },
          { id: 'ht2', name: 'পদার্থবিজ্ঞান', type: 'textbook', parentId: 'hc2' },
        ];
        const HARDCODED_SUBJECTS = [
          { id: 'hs1', name: 'বিজ্ঞান', type: 'subject', parentId: 'hc1' },
          { id: 'hs2', name: 'পদার্থবিজ্ঞান', type: 'subject', parentId: 'hc2' },
        ];
        const HARDCODED_CHAPTERS = [
          { id: 'hch1', name: 'অধ্যায় ১: প্রাণিজগতের শ্রেণিবিন্যাস', type: 'chapter', parentId: 'ht1' },
          { id: 'hch2', name: 'অধ্যায় ৬: আমাদের চারপাশের পরিবেশ', type: 'chapter', parentId: 'ht1' },
        ];

        try {
          const snap = await getDocs(collection(db, 'taxonomy_nodes'));
          const allNodes = snap.docs.map(d => {
            const data = d.data();
            return { id: d.id, name: data.title || data.name, ...data } as TaxonomyNode;
          });
          
          setBoards([...HARDCODED_BOARDS, ...allNodes.filter(n => (n as any).type === 'board' || (n as any).type === 'category')] as unknown as TaxonomyNode[]);
          setClasses([...HARDCODED_CLASSES, ...allNodes.filter(n => (n as any).type === 'class' || (n as any).type === 'subcategory')] as unknown as TaxonomyNode[]);
          setTextbooks([...HARDCODED_TEXTBOOKS, ...allNodes.filter(n => (n as any).type === 'textbook' || (n as any).type === 'exam')] as unknown as TaxonomyNode[]);
          setSubjects([...HARDCODED_SUBJECTS, ...allNodes.filter(n => (n as any).type === 'subject')] as unknown as TaxonomyNode[]);
          setChapters([...HARDCODED_CHAPTERS, ...allNodes.filter(n => (n as any).type === 'chapter')] as unknown as TaxonomyNode[]);
        } catch(e) {
          console.error('Error fetching taxonomy_nodes:', e);
          setBoards(HARDCODED_BOARDS as unknown as TaxonomyNode[]);
          setClasses(HARDCODED_CLASSES as unknown as TaxonomyNode[]);
          setTextbooks(HARDCODED_TEXTBOOKS as unknown as TaxonomyNode[]);
          setSubjects(HARDCODED_SUBJECTS as unknown as TaxonomyNode[]);
          setChapters(HARDCODED_CHAPTERS as unknown as TaxonomyNode[]);
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
    
    const filters: any = {};
    if (selectedChapter !== 'all') filters.chapterId = selectedChapter;
    else if (selectedSubject !== 'all') filters.subjectId = selectedSubject;
    else if (selectedTextbook !== 'all') filters.textbookId = selectedTextbook;
    else if (selectedClass !== 'all') filters.classId = selectedClass;
    else if (selectedBoard !== 'all') filters.boardId = selectedBoard;

    const HARDCODED_QUESTIONS: any[] = [
      {
        id: 'hq1',
        questionText: 'আমাদের শরীরের বর্ম কাকে বলা হয়?',
        questionType: 'MCQ',
        options: { a: 'মাংসপেশি', b: 'ত্বক বা চামড়া', c: 'হাড়', d: 'রক্ত' },
        correctAnswer: 'b',
        explanation: 'ত্বক বা চামড়া আমাদের শরীরের বর্ম হিসেবে কাজ করে, যা শরীরকে বাইরের আঘাত থেকে রক্ষা করে।',
        difficulty: 'Easy',
        language: 'Bangla',
        boardId: 'hb1',
        classId: 'hc1',
        textbookId: 'ht1',
        subjectId: 'hs1',
        chapterId: 'hch1'
      },
      {
        id: 'hq2',
        questionText: 'ত্বকের নিচে প্রধানত কী কী থাকে?',
        questionType: 'MCQ',
        options: { a: 'শুধুই মাংসপেশি', b: 'রক্তনালী ও স্নায়ু', c: 'হাড় ও মজ্জা', d: 'জল ও খনিজ' },
        correctAnswer: 'b',
        explanation: 'ত্বকের নিচে অসংখ্য রক্তনালী ও স্নায়ুজালের মতো ছড়িয়ে থাকে।',
        difficulty: 'Medium',
        language: 'Bangla',
        boardId: 'hb1',
        classId: 'hc1',
        textbookId: 'ht1',
        subjectId: 'hs1',
        chapterId: 'hch1'
      },
      {
        id: 'hq3',
        questionText: 'নিচের কোনটি মিশ্র পদার্থ?',
        questionType: 'MCQ',
        options: { a: 'পানি', b: 'লবণ', c: 'বায়ু', d: 'চিনি' },
        correctAnswer: 'c',
        explanation: 'বায়ু একাধিক গ্যাসীয় পদার্থের মিশ্রণ।',
        difficulty: 'Easy',
        language: 'Bangla',
        boardId: 'hb1',
        classId: 'hc1',
        textbookId: 'ht1',
        subjectId: 'hs1',
        chapterId: 'hch1'
      }
    ];

    try {
      console.log('Fetching questions with filters:', filters);
      const res = await getQuestionsPaginated(filters, 50);
      setQuestions([...HARDCODED_QUESTIONS, ...res.questions]);
    } catch (e: any) {
      console.error('Error fetching questions:', e);
      setQuestions(HARDCODED_QUESTIONS);
      toast({ 
        title: 'Using offline data', 
        description: 'Failed to fetch from server, showing hardcoded data.',
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
      ...q,
      id: `bank_${Date.now()}_${q.id}`,
      originalId: q.id,
      correctAnswer: q.correctAnswer?.toLowerCase() || 'a',
      explanation: q.explanation || '',
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
                <SelectValue placeholder={appLanguage === 'bn' ? 'সব বোর্ড' : 'All Boards'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{appLanguage === 'bn' ? 'সব বোর্ড' : 'All Boards'}</SelectItem>
                {boards.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Class ({filteredClasses.length})</label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder={appLanguage === 'bn' ? 'সব ক্লাস' : 'All Classes'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{appLanguage === 'bn' ? 'সব ক্লাস' : 'All Classes'}</SelectItem>
                {filteredClasses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Textbook ({filteredTextbooks.length})</label>
            <Select value={selectedTextbook} onValueChange={setSelectedTextbook}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder={appLanguage === 'bn' ? 'সব বই' : 'All Textbooks'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{appLanguage === 'bn' ? 'সব বই' : 'All Textbooks'}</SelectItem>
                {filteredTextbooks.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Subject ({filteredSubjects.length})</label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder={appLanguage === 'bn' ? 'সব বিষয়' : 'All Subjects'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{appLanguage === 'bn' ? 'সব বিষয়' : 'All Subjects'}</SelectItem>
                {filteredSubjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">{t('chapter', appLanguage)} ({filteredChapters.length})</label>
            <Select value={selectedChapter} onValueChange={setSelectedChapter}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder={appLanguage === 'bn' ? 'সব অধ্যায়' : 'All Chapters'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{appLanguage === 'bn' ? 'সব অধ্যায়' : 'All Chapters'}</SelectItem>
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
              className={`p-4 border rounded-xl flex gap-4 transition-all duration-200 cursor-pointer ${selectedQuestionIds.has(q.id) ? 'border-primary/50 bg-primary/5 shadow-sm ring-1 ring-primary/20' : 'bg-white hover:border-gray-300 hover:shadow-sm'}`}
              onClick={() => toggleSelection(q.id)}
            >
              <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                <Checkbox 
                  checked={selectedQuestionIds.has(q.id)}
                  onCheckedChange={() => toggleSelection(q.id)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[15px] text-gray-800 mb-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: q.questionText }}></p>
                
                {q.options && (!q.questionType || q.questionType === 'MCQ') ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm mb-3">
                    {['a', 'b', 'c', 'd'].map((opt) => (
                      <div 
                        key={opt}
                        className={`px-3 py-2 rounded-lg border ${q.correctAnswer?.toLowerCase() === opt ? 'border-green-300 bg-green-50 text-green-900 font-medium' : 'border-gray-100 bg-gray-50 text-gray-600'}`}
                        dangerouslySetInnerHTML={{ __html: `<span class="font-bold mr-1 ${q.correctAnswer?.toLowerCase() === opt ? 'text-green-700' : 'text-gray-400'}">(${opt})</span> ${q.options?.[opt as keyof typeof q.options] || ''}` }} 
                      />
                    ))}
                  </div>
                ) : q.correctAnswer ? (
                  <div className="text-sm font-medium text-green-800 mb-3 bg-green-50 px-3 py-2 rounded-lg border border-green-200 inline-flex items-center">
                    <span className="font-bold mr-2">Ans:</span> <span dangerouslySetInnerHTML={{ __html: q.correctAnswer }} />
                  </div>
                ) : null}

                {q.explanation && (
                  <div className="text-[13px] text-gray-600 mb-3 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                    <strong className="text-blue-800 block mb-1">ব্যাখ্যা (Explanation):</strong> 
                    <span dangerouslySetInnerHTML={{ __html: q.explanation }} className="leading-relaxed block" />
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-[11px] px-2.5 py-1 bg-purple-100 text-purple-700 border border-purple-200 rounded-md font-semibold tracking-wide uppercase">
                    {q.questionType || 'MCQ'}
                  </span>
                  <span className={`text-[11px] px-2.5 py-1 rounded-md font-semibold tracking-wide capitalize border ${
                    q.difficulty === 'Hard' ? 'bg-red-50 text-red-700 border-red-200' : 
                    q.difficulty === 'Easy' ? 'bg-green-50 text-green-700 border-green-200' : 
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {q.difficulty || 'Medium'}
                  </span>
                  <span className="text-[11px] px-2.5 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-md font-semibold tracking-wide uppercase">
                    {q.language || 'Bangla'}
                  </span>
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
