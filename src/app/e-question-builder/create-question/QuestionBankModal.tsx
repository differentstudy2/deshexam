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
import { getHardcodedTaxonomyNodes } from '@/data/hardcoded/taxonomy';
import hardcodedQuestionsData from '@/data/hardcoded/taxonomy/questions.json';

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
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
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
        const hardcodedNodes = getHardcodedTaxonomyNodes().map(n => ({
          ...n,
          name: (n as any).title || (n as any).name
        })) as unknown as TaxonomyNode[];

        try {
          const snap = await getDocs(collection(db, 'taxonomy_nodes'));
          const allNodes = snap.docs.map(d => {
            const data = d.data();
            return { id: d.id, name: data.title || data.name, ...data } as TaxonomyNode;
          });
          
          const combinedNodes = [...hardcodedNodes, ...allNodes];

          setBoards(combinedNodes.filter(n => (n as any).type === 'board' || (n as any).type === 'category') as TaxonomyNode[]);
          setClasses(combinedNodes.filter(n => (n as any).type === 'class' || (n as any).type === 'subcategory') as TaxonomyNode[]);
          setTextbooks(combinedNodes.filter(n => (n as any).type === 'textbook' || (n as any).type === 'exam') as TaxonomyNode[]);
          setSubjects(combinedNodes.filter(n => (n as any).type === 'subject') as TaxonomyNode[]);
          setChapters(combinedNodes.filter(n => (n as any).type === 'chapter') as TaxonomyNode[]);
        } catch(e) {
          console.error('Error fetching taxonomy_nodes:', e);
          setBoards(hardcodedNodes.filter(n => (n as any).type === 'board' || (n as any).type === 'category') as unknown as TaxonomyNode[]);
          setClasses(hardcodedNodes.filter(n => (n as any).type === 'class' || (n as any).type === 'subcategory') as unknown as TaxonomyNode[]);
          setTextbooks(hardcodedNodes.filter(n => (n as any).type === 'textbook' || (n as any).type === 'exam') as unknown as TaxonomyNode[]);
          setSubjects(hardcodedNodes.filter(n => (n as any).type === 'subject') as unknown as TaxonomyNode[]);
          setChapters(hardcodedNodes.filter(n => (n as any).type === 'chapter') as unknown as TaxonomyNode[]);
        }
      };

      fetchTaxonomies();
    }
  }, [isOpen]);

  // Auto-fetch questions when filters change
  useEffect(() => {
    if (isOpen) {
      fetchQuestions(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedBoard, selectedClass, selectedTextbook, selectedSubject, selectedChapter]);

  const fetchQuestions = async (isLoadMore = false) => {
    if (isLoadMore) setIsLoadingMore(true);
    else {
      setIsLoading(true);
      setLastDoc(null);
    }
    
    const filters: any = {};
    if (selectedChapter !== 'all') filters.chapterId = selectedChapter;
    else if (selectedSubject !== 'all') filters.subjectId = selectedSubject;
    else if (selectedTextbook !== 'all') filters.textbookId = selectedTextbook;
    else if (selectedClass !== 'all') filters.classId = selectedClass;
    else if (selectedBoard !== 'all') filters.boardId = selectedBoard;

    try {
      const currentStartAfter = isLoadMore ? lastDoc : undefined;
      const res = await getQuestionsPaginated(filters, 50, currentStartAfter);
      
      const mappedResults = res.questions.map(q => ({
        ...q,
        correctAnswer: (q as any).correctOptionId || q.correctAnswer,
        questionType: q.questionType?.toUpperCase(),
        difficulty: q.difficulty ? q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1) : 'Medium'
      })) as QuestionBankEntry[];

      if (isLoadMore) {
        setQuestions(prev => {
          const allQs = [...prev, ...mappedResults];
          return Array.from(new Map(allQs.map(q => [q.id, q])).values());
        });
      } else {
        setQuestions(mappedResults);
      }

      setLastDoc(res.lastDoc);
      setHasMore(!!res.lastDoc);
    } catch (e: any) {
      console.error('Error fetching questions:', e);
      toast({ 
        title: 'Error', 
        description: 'Failed to fetch questions.',
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
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
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-4 md:p-5 gap-0.5">
        <DialogHeader className="pb-3 border-b flex flex-col md:flex-row md:items-center gap-3">
          <div className="text-2xl shrink-0 hidden md:block" aria-hidden="true">
            🗃️
          </div>
          <DialogTitle className="sr-only">
            {t('addFromBank', appLanguage)}
          </DialogTitle>

          {/* Filters inside header */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 w-full">
            <div>
              <Select value={selectedBoard} onValueChange={(val) => {
                setSelectedBoard(val);
                setSelectedClass('all');
                setSelectedSubject('all');
                setSelectedTextbook('all');
                setSelectedChapter('all');
              }}>
                <SelectTrigger className="bg-background h-8 text-xs">
                  <SelectValue placeholder={appLanguage === 'bn' ? 'সব বোর্ড' : 'All Boards'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{appLanguage === 'bn' ? 'সব বোর্ড' : 'All Boards'}</SelectItem>
                  {boards.map(b => <SelectItem key={b.id} value={b.id} className="text-xs">{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={selectedClass} onValueChange={(val) => {
                setSelectedClass(val);
                setSelectedSubject('all');
                setSelectedTextbook('all');
                setSelectedChapter('all');
              }}>
                <SelectTrigger className="bg-background h-8 text-xs">
                  <SelectValue placeholder={appLanguage === 'bn' ? 'সব ক্লাস' : 'All Classes'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{appLanguage === 'bn' ? 'সব ক্লাস' : 'All Classes'}</SelectItem>
                  {filteredClasses.map(c => <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={selectedSubject} onValueChange={(val) => {
                setSelectedSubject(val);
                setSelectedTextbook('all');
                setSelectedChapter('all');
              }}>
                <SelectTrigger className="bg-background h-8 text-xs">
                  <SelectValue placeholder={appLanguage === 'bn' ? 'সব বিষয়' : 'All Subjects'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{appLanguage === 'bn' ? 'সব বিষয়' : 'All Subjects'}</SelectItem>
                  {filteredSubjects.map(s => <SelectItem key={s.id} value={s.id} className="text-xs">{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={selectedTextbook} onValueChange={(val) => {
                setSelectedTextbook(val);
                setSelectedChapter('all');
              }}>
                <SelectTrigger className="bg-background h-8 text-xs">
                  <SelectValue placeholder={appLanguage === 'bn' ? 'সব বই' : 'All Textbooks'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{appLanguage === 'bn' ? 'সব বই' : 'All Textbooks'}</SelectItem>
                  {filteredTextbooks.map(s => <SelectItem key={s.id} value={s.id} className="text-xs">{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={selectedChapter} onValueChange={setSelectedChapter}>
                <SelectTrigger className="bg-background h-8 text-xs">
                  <SelectValue placeholder={appLanguage === 'bn' ? 'সব অধ্যায়' : 'All Chapters'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{appLanguage === 'bn' ? 'সব অধ্যায়' : 'All Chapters'}</SelectItem>
                  {filteredChapters.map(c => <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogHeader>

        {/* Results */}
        <div className="flex-1 overflow-y-auto border rounded-lg mt-2 min-h-[300px] bg-background">
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
          {!isLoading && questions.map((q, index) => (
            <div 
              key={q.id} 
              className={`p-4 flex gap-4 transition-all duration-200 cursor-pointer ${index !== questions.length - 1 ? 'border-b' : ''} ${selectedQuestionIds.has(q.id) ? 'bg-primary/5' : 'hover:bg-muted/30'}`}
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
                  <div className="text-sm text-gray-700 mb-3 bg-green-50/50 p-3 rounded-lg border border-green-200">
                    <strong className="text-green-800 block mb-1">উত্তর (Answer):</strong>
                    <div dangerouslySetInnerHTML={{ __html: q.correctAnswer }} className="leading-relaxed prose prose-sm max-w-none text-gray-700" />
                  </div>
                ) : null}

                {(q.explanation || q.detailedExplanation) && (
                  <div className="text-[13px] text-gray-600 mb-3 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                    <strong className="text-blue-800 block mb-1">ব্যাখ্যা (Explanation):</strong> 
                    <div dangerouslySetInnerHTML={{ __html: q.explanation || q.detailedExplanation || '' }} className="leading-relaxed block prose prose-sm max-w-none text-gray-600" />
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

          {hasMore && questions.length > 0 && !isLoading && (
            <div className="flex justify-center pt-4 pb-2">
              <Button 
                variant="outline" 
                onClick={() => fetchQuestions(true)} 
                disabled={isLoadingMore}
                className="w-full md:w-auto"
              >
                {isLoadingMore ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {t('loadMore', appLanguage)}
              </Button>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <DialogFooter className="mt-2 flex items-center justify-between sm:justify-between border-t pt-3">
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
