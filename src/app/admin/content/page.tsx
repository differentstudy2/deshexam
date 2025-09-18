

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { getAllContent, deleteContent, getContentTypes, getSubjects, updateContent, getBoards, getChaptersBySubjectId, getExamsByCategory, getExamTypes, getAllQuestions, deleteQuestion, addQuestionsToContent, updateQuestion } from '@/lib/firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash2, Eye, Loader2, Search, Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContentBadge } from '@/components/content-badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';


type Content = {
    id: string;
    title: string;
    subject: string;
    testType: string;
    access: 'free' | 'premium' | 'pro';
    createdAt: string;
    authorId: string;
    authorName: string;
    board: string;
    examCategory: string;
    exam: string;
    chapter: string;
}

const optionSchema = z.object({
  text: z.string().min(1, 'Option text cannot be empty.'),
});

const questionFormSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, 'Question text cannot be empty.'),
  type: z.enum(['Multiple Choice', 'True/False', 'Short Answer']),
  options: z.array(optionSchema).optional(),
  correctAnswer: z.string().min(1, 'Please specify the correct answer.'),
});

type QuestionFormValues = z.infer<typeof questionFormSchema>;

type Question = {
    id: string;
    text: string;
    authorName: string;
    createdAt: string;
    subject: string;
    type: 'Multiple Choice' | 'True/False' | 'Short Answer';
    options?: {text: string}[];
    correctAnswer: string;
};

type ContentType = { id: string, name: string };
type Subject = { id: string, name: string };
type Board = { id: string, name: string };
type ExamType = { id: string, name: string };
type Exam = { id: string, name: string };
type Chapter = { id: string, chapterNo: string, chapterName: string };

type BulkAction = 
    | { type: 'delete' } 
    | { type: 'access', value: 'free' | 'premium' | 'pro' }
    | { type: 'board', value: string }
    | { type: 'subject', value: string }
    | { type: 'chapter', value: string }
    | { type: 'examCategory', value: string }
    | { type: 'exam', value: string }
    | { type: 'delete-questions' }
    | { type: 'add-questions-to-content', contentIds: string[] }
    | null;

function getUrlForTest(testType: string, testId: string) {
    const typeSlug = testType.toLowerCase().replace(/\s+/g, '-');
    return `/${typeSlug}/${testId}`;
}

const ContentTable = ({ 
    content, 
    loading, 
    openDeleteDialog,
    selectedContent,
    onSelect,
    onSelectAll,
    isAllSelected
}: { 
    content: Content[], 
    loading: boolean, 
    openDeleteDialog: (item: Content) => void,
    selectedContent: string[],
    onSelect: (id: string) => void,
    onSelectAll: (checked: boolean) => void,
    isAllSelected: boolean
}) => (
    <div className="overflow-x-auto">
        <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-12">
                    <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={(checked) => onSelectAll(Boolean(checked))}
                        aria-label="Select all"
                    />
                </TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Author</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead className="hidden md:table-cell">Access</TableHead>
                <TableHead className="hidden lg:table-cell">Created At</TableHead>
                <TableHead>
                    <span className="sr-only">Actions</span>
                </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                    </TableRow>
                ))
                ) : content.length > 0 ? (
                content.map((item) => (
                    <TableRow key={item.id} data-state={selectedContent.includes(item.id) && "selected"}>
                     <TableCell>
                        <Checkbox
                            checked={selectedContent.includes(item.id)}
                            onCheckedChange={() => onSelect(item.id)}
                            aria-label={`Select ${item.title}`}
                        />
                      </TableCell>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                                <AvatarImage src={`https://picsum.photos/seed/${item.authorId}/24/24`} />
                                <AvatarFallback>{item.authorName?.[0]}</AvatarFallback>
                            </Avatar>
                            <span>{item.authorName}</span>
                        </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                        <Badge variant="secondary">{item.testType}</Badge>
                    </TableCell>
                     <TableCell className="hidden md:table-cell">
                        <ContentBadge type={item.access} />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{item.createdAt}</TableCell>
                    <TableCell>
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link href={getUrlForTest(item.testType, item.id)}><Eye className="mr-2 h-4 w-4"/>View</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                            <Link href={`/dashboard/edit-content/${item.id}`}><Pencil className="mr-2 h-4 w-4"/>Edit</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => openDeleteDialog(item)}>
                            <Trash2 className="mr-2 h-4 w-4"/>Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                    No content found matching your criteria.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
        </Table>
    </div>
);

const QuestionsTable = ({ 
    questions, 
    loading,
    selectedQuestions,
    onSelectQuestion,
    onSelectAllQuestions,
    isAllQuestionsSelected,
    onEditQuestion
}: { 
    questions: Question[], 
    loading: boolean,
    selectedQuestions: string[],
    onSelectQuestion: (id: string) => void,
    onSelectAllQuestions: (checked: boolean) => void,
    isAllQuestionsSelected: boolean,
    onEditQuestion: (question: Question) => void
}) => (
     <div className="overflow-x-auto">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-12">
                         <Checkbox
                            checked={isAllQuestionsSelected}
                            onCheckedChange={(checked) => onSelectAllQuestions(Boolean(checked))}
                            aria-label="Select all questions"
                        />
                    </TableHead>
                    <TableHead className="w-[60%]">Question Text</TableHead>
                    <TableHead className="hidden md:table-cell">Author</TableHead>
                    <TableHead className="hidden md:table-cell">Subject</TableHead>
                    <TableHead className="hidden lg:table-cell">Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                            <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                             <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                        </TableRow>
                    ))
                ) : questions.length > 0 ? (
                    questions.map((question) => (
                        <TableRow key={question.id} data-state={selectedQuestions.includes(question.id) && "selected"}>
                             <TableCell>
                                <Checkbox
                                    checked={selectedQuestions.includes(question.id)}
                                    onCheckedChange={() => onSelectQuestion(question.id)}
                                    aria-label={`Select question ${question.id}`}
                                />
                            </TableCell>
                            <TableCell className="font-medium truncate max-w-sm">{question.text}</TableCell>
                            <TableCell className="hidden md:table-cell">{question.authorName}</TableCell>
                            <TableCell className="hidden md:table-cell">{question.subject}</TableCell>
                            <TableCell className="hidden lg:table-cell">{question.createdAt}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex gap-2 justify-end">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/question/${question.id}`}><Eye className="mr-2 h-4 w-4"/>View</Link>
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => onEditQuestion(question)}>
                                        <Pencil className="mr-2 h-4 w-4"/>Edit
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">No questions found.</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    </div>
);

export default function ManageContentPage() {
  const { toast } = useToast();
  const [allContent, setAllContent] = useState<Content[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isQuestionDialogOpwn, setIsQuestionDialogOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<Content | null>(null);
  const [bulkAction, setBulkAction] = useState<BulkAction>(null);
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [accessFilter, setAccessFilter] = useState('all');
  const [selectedContent, setSelectedContent] = useState<string[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [dialogSelectedContent, setDialogSelectedContent] = useState<string[]>([]);
  
  const [isEditQuestionDialogOpen, setIsEditQuestionDialogOpen] = useState(false);
  const [questionToEdit, setQuestionToEdit] = useState<Question | null>(null);
  
  const questionForm = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
  });

  const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
    control: questionForm.control,
    name: 'options',
  });

  const openEditQuestionDialog = (question: Question) => {
    setQuestionToEdit(question);
    questionForm.reset(question);
    setIsEditQuestionDialogOpen(true);
  };
  
  const handleEditQuestionSubmit = async (data: QuestionFormValues) => {
    if (!questionToEdit) return;
    try {
        await updateQuestion(questionToEdit.id, data);
        toast({ title: 'Question updated successfully!' });
        setAllQuestions(prev => prev.map(q => q.id === questionToEdit.id ? { ...q, ...data } : q));
        setIsEditQuestionDialogOpen(false);
        setQuestionToEdit(null);
    } catch (error) {
        toast({
            variant: "destructive",
            title: 'Error updating question',
            description: (error as Error).message,
        });
    }
  };

  const allTabs = useMemo(() => {
    const baseTabs = [{ id: 'all', name: 'All' }, ...contentTypes];
    const hasQuestionsTab = baseTabs.some(tab => tab.name.toLowerCase() === 'questions');
    if (!hasQuestionsTab) {
      baseTabs.push({ id: 'questions', name: 'Questions' });
    }
    return baseTabs;
  }, [contentTypes]);

  const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [content, types, subjectData, boardData, examTypeData, questionData] = await Promise.all([
          getAllContent(),
          getContentTypes(),
          getSubjects(),
          getBoards(),
          getExamTypes(),
          getAllQuestions(),
        ]);
        
        const formattedContent = content.map(c => ({
            ...c,
            createdAt: c.createdAt ? new Date(c.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'
        })) as Content[];

        setAllContent(formattedContent);
        setAllQuestions(questionData as Question[]);
        setContentTypes(types);
        setSubjects(subjectData);
        setBoards(boardData);
        setExamTypes(examTypeData);

      } catch (error) {
         toast({
          variant: "destructive",
          title: 'Error fetching data',
          description: (error as Error).message,
        });
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    fetchInitialData();
  }, [toast]);
  
  useEffect(() => {
    const fetchDependentData = async () => {
        if (subjects.length > 0) {
            const allChapters = await Promise.all(subjects.map(s => getChaptersBySubjectId(s.id)));
            setChapters(allChapters.flat());
        }
        if (examTypes.length > 0) {
            const allExams = await Promise.all(examTypes.map(e => getExamsByCategory(e.id)));
            setExams(allExams.flat());
        }
    };
    if (subjects.length > 0 && examTypes.length > 0) {
        fetchDependentData();
    }
  }, [subjects, examTypes]);

  const filteredContent = useMemo(() => {
    return allContent.filter(item => {
        const matchesTab = activeTab === 'All' || item.testType === activeTab;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSubject = subjectFilter === 'all' || item.subject === subjectFilter;
        const matchesAccess = accessFilter === 'all' || item.access === accessFilter;
        return matchesTab && matchesSearch && matchesSubject && matchesAccess;
    });
  }, [allContent, activeTab, searchQuery, subjectFilter, accessFilter]);

  const filteredQuestions = useMemo(() => {
    return allQuestions.filter(item => {
        const matchesSearch = item.text.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSubject = subjectFilter === 'all' || item.subject === subjectFilter;
        return matchesSearch && matchesSubject;
    });
  }, [allQuestions, searchQuery, subjectFilter]);


  const openDeleteDialog = (item: Content) => {
    setContentToDelete(item);
    setIsAlertDialogOpen(true);
  };
  
  const openBulkActionDialog = (action: BulkAction) => {
    setBulkAction(action);
    if(action?.type === 'add-questions-to-content') {
        setIsQuestionDialogOpen(true);
    } else {
        setIsAlertDialogOpen(true);
    }
  }

  const handleSelectContent = (id: string) => {
    setSelectedContent(prev => prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]);
  }

  const handleSelectAllContent = (checked: boolean) => {
    if (checked) {
        setSelectedContent(filteredContent.map(c => c.id));
    } else {
        setSelectedContent([]);
    }
  }

  const isAllContentSelected = selectedContent.length > 0 && selectedContent.length === filteredContent.length;

  const handleSelectQuestion = (id: string) => {
    setSelectedQuestions(prev => prev.includes(id) ? prev.filter(qid => qid !== id) : [...prev, id]);
  }

  const handleSelectAllQuestions = (checked: boolean) => {
    if (checked) {
        setSelectedQuestions(filteredQuestions.map(q => q.id));
    } else {
        setSelectedQuestions([]);
    }
  }

  const isAllQuestionsSelected = selectedQuestions.length > 0 && selectedQuestions.length === filteredQuestions.length;


  const handleConfirmAction = async () => {
    if(contentToDelete) { // Single content delete
        await handleDeleteContent([contentToDelete.id]);
    } else if (bulkAction) { // Bulk actions
        if (bulkAction.type === 'delete') {
            await handleDeleteContent(selectedContent);
        } else if (bulkAction.type === 'delete-questions') {
            await handleDeleteQuestions(selectedQuestions);
        } else if (bulkAction.type === 'access') {
            await handleBulkUpdate({ access: bulkAction.value });
        } else if (bulkAction.type === 'board') {
            await handleBulkUpdate({ board: bulkAction.value });
        } else if (bulkAction.type === 'subject') {
            await handleBulkUpdate({ subject: bulkAction.value });
        } else if (bulkAction.type === 'chapter') {
            await handleBulkUpdate({ chapter: bulkAction.value });
        } else if (bulkAction.type === 'examCategory') {
            await handleBulkUpdate({ examCategory: bulkAction.value });
        } else if (bulkAction.type === 'exam') {
            await handleBulkUpdate({ exam: bulkAction.value });
        } else if (bulkAction.type === 'add-questions-to-content' && bulkAction.contentIds) {
            await handleAddQuestionsToContent(bulkAction.contentIds, selectedQuestions);
        }
    }
    
    setIsAlertDialogOpen(false);
    setIsQuestionDialogOpen(false);
    setContentToDelete(null);
    setBulkAction(null);
    setSelectedContent([]);
    setSelectedQuestions([]);
    setDialogSelectedContent([]);
  };

  const handleDeleteContent = async (ids: string[]) => {
    try {
      await Promise.all(ids.map(id => deleteContent(id)));
      setAllContent(allContent.filter(item => !ids.includes(item.id)));
      toast({
        title: "Content Deleted",
        description: `${ids.length} item(s) have been deleted.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: 'Error deleting content',
        description: (error as Error).message,
      });
    }
  };

  const handleDeleteQuestions = async (ids: string[]) => {
    try {
      await Promise.all(ids.map(id => deleteQuestion(id)));
      setAllQuestions(allQuestions.filter(item => !ids.includes(item.id)));
      toast({
        title: "Question(s) Deleted",
        description: `${ids.length} question(s) have been deleted.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: 'Error deleting questions',
        description: (error as Error).message,
      });
    }
  };

  const handleBulkUpdate = async (updateData: { [key: string]: any }) => {
    try {
        await Promise.all(selectedContent.map(id => updateContent(id, updateData)));
        
        // Optimistically update UI or refetch data
        setAllContent(allContent.map(item => 
            selectedContent.includes(item.id) ? { ...item, ...updateData } : item
        ));
        
        toast({
            title: 'Bulk Update Successful',
            description: `Updated ${selectedContent.length} items.`,
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: 'Bulk update failed',
            description: (error as Error).message,
        });
    }
  }

  const handleAddQuestionsToContent = async (contentIds: string[], questionIds: string[]) => {
    try {
        const questionsToAdd = allQuestions.filter(q => questionIds.includes(q.id));
        await Promise.all(contentIds.map(id => addQuestionsToContent(id, questionsToAdd)));
      
        toast({
            title: "Questions Added",
            description: `${questionIds.length} questions have been added to ${contentIds.length} content item(s).`,
        });
    } catch (error) {
       toast({
        variant: "destructive",
        title: 'Error adding questions',
        description: (error as Error).message,
      });
    }
  };
  
  const getAlertDialogDescription = () => {
      if (contentToDelete) {
          return `This action cannot be undone. This will permanently delete "${contentToDelete.title}".`;
      }
      if (bulkAction) {
          const actionTextMap: { [key: string]: string } = {
            'delete': `This will permanently delete ${selectedContent.length} item(s).`,
            'delete-questions': `This will permanently delete ${selectedQuestions.length} question(s).`,
            'access': `This will change the access level for ${selectedContent.length} item(s) to "${(bulkAction as any).value}".`,
            'board': `This will change the board for ${selectedContent.length} item(s) to "${boards.find(b => b.name === (bulkAction as any).value)?.name || (bulkAction as any).value}".`,
            'subject': `This will change the subject for ${selectedContent.length} item(s) to "${subjects.find(s => s.name === (bulkAction as any).value)?.name || (bulkAction as any).value}".`,
            'chapter': `This will change the chapter for ${selectedContent.length} item(s) to "${(bulkAction as any).value}".`,
            'examCategory': `This will change the exam category for ${selectedContent.length} item(s) to "${examTypes.find(e => e.name === (bulkAction as any).value)?.name || (bulkAction as any).value}".`,
            'exam': `This will change the exam for ${selectedContent.length} item(s) to "${exams.find(e => e.name === (bulkAction as any).value)?.name || (bulkAction as any).value}".`,
          }
          if (bulkAction.type in actionTextMap) {
            return actionTextMap[bulkAction.type];
          }
      }
      return 'This action cannot be undone.';
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Manage Content</h1>
        <p className="text-muted-foreground">
          View and manage all content across the platform.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Content</CardTitle>
          <CardDescription>
            A list of all content in your application.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search by title..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                 <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by subject" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Subjects</SelectItem>
                        {subjects.map(sub => <SelectItem key={sub.id} value={sub.name}>{sub.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                 <Select value={accessFilter} onValueChange={setAccessFilter} disabled={activeTab === 'Questions'}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by access" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Access</SelectItem>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                    </SelectContent>
                </Select>
                 {selectedContent.length > 0 && activeTab !== 'Questions' && (
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full sm:w-auto">
                                Bulk Actions ({selectedContent.length}) <Filter className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>Modify Selected</DropdownMenuLabel>
                             <DropdownMenuSub>
                                <DropdownMenuSubTrigger>Change Board</DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                    {boards.map(b => (
                                        <DropdownMenuItem key={b.id} onClick={() => openBulkActionDialog({ type: 'board', value: b.name })}>{b.name}</DropdownMenuItem>
                                    ))}
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                             <DropdownMenuSub>
                                <DropdownMenuSubTrigger>Change Subject</DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                    {subjects.map(s => (
                                        <DropdownMenuItem key={s.id} onClick={() => openBulkActionDialog({ type: 'subject', value: s.name })}>{s.name}</DropdownMenuItem>
                                    ))}
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>Change Chapter</DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                     {chapters.map(c => (
                                        <DropdownMenuItem key={c.id} onClick={() => openBulkActionDialog({ type: 'chapter', value: `${c.chapterNo}. ${c.chapterName}` })}>{c.chapterNo}. {c.chapterName}</DropdownMenuItem>
                                    ))}
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                             <DropdownMenuSub>
                                <DropdownMenuSubTrigger>Change Exam Category</DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                    {examTypes.map(et => (
                                        <DropdownMenuItem key={et.id} onClick={() => openBulkActionDialog({ type: 'examCategory', value: et.name })}>{et.name}</DropdownMenuItem>
                                    ))}
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                             <DropdownMenuSub>
                                <DropdownMenuSubTrigger>Change Exam</DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                    {exams.map(e => (
                                        <DropdownMenuItem key={e.id} onClick={() => openBulkActionDialog({ type: 'exam', value: e.name })}>{e.name}</DropdownMenuItem>
                                    ))}
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>Change Access Level</DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                    <DropdownMenuItem onClick={() => openBulkActionDialog({ type: 'access', value: 'free' })}>Free</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openBulkActionDialog({ type: 'access', value: 'premium' })}>Premium</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openBulkActionDialog({ type: 'access', value: 'pro' })}>Pro</DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => openBulkActionDialog({ type: 'delete' })}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Selected
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                 )}
                 {selectedQuestions.length > 0 && activeTab === 'Questions' && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full sm:w-auto">
                                Bulk Actions ({selectedQuestions.length}) <Filter className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                             <DropdownMenuLabel>Modify Selected Questions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => setIsQuestionDialogOpen(true)}>
                                Add to Content
                              </DropdownMenuItem>
                            <DropdownMenuSeparator />
                             <DropdownMenuItem className="text-destructive" onClick={() => openBulkActionDialog({ type: 'delete-questions' })}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Selected
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                 )}
            </div>
           {loading ? (
             <div className="flex items-center justify-center min-h-[200px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
             </div>
           ) : (
            <Tabs defaultValue="All" onValueChange={setActiveTab}>
                 <TabsList className="flex-wrap h-auto justify-start">
                    {allTabs.map(type => (
                        <TabsTrigger key={type.id} value={type.name}>{type.name}</TabsTrigger>
                    ))}
                </TabsList>
                {allTabs.map(type => (
                    <TabsContent key={type.id} value={type.name}>
                        {type.name === 'Questions' ? (
                            <QuestionsTable 
                                questions={filteredQuestions} 
                                loading={loading}
                                selectedQuestions={selectedQuestions}
                                onSelectQuestion={handleSelectQuestion}
                                onSelectAllQuestions={handleSelectAllQuestions}
                                isAllQuestionsSelected={isAllQuestionsSelected}
                                onEditQuestion={openEditQuestionDialog}
                             />
                        ) : (
                           <ContentTable 
                                content={filteredContent.filter(c => activeTab === 'All' || c.testType === type.name)}
                                loading={loading}
                                openDeleteDialog={openDeleteDialog}
                                selectedContent={selectedContent}
                                onSelect={handleSelectContent}
                                onSelectAll={handleSelectAllContent}
                                isAllSelected={isAllContentSelected}
                            />
                        )}
                    </TabsContent>
                ))}
            </Tabs>
           )}
        </CardContent>
      </Card>
      
      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {getAlertDialogDescription()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setContentToDelete(null); setBulkAction(null); }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction} className="bg-destructive hover:bg-destructive/90">Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isQuestionDialogOpwn} onOpenChange={setIsQuestionDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Questions to Content</DialogTitle>
            <DialogDescription>
                Select one or more content items to add the {selectedQuestions.length} selected questions to.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[300px] my-4">
            <div className="space-y-2 p-1">
                {allContent.map(c => (
                    <div key={c.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-secondary">
                        <Checkbox
                            id={`content-${c.id}`}
                            checked={dialogSelectedContent.includes(c.id)}
                            onCheckedChange={() => {
                                setDialogSelectedContent(prev => 
                                    prev.includes(c.id)
                                    ? prev.filter(id => id !== c.id)
                                    : [...prev, c.id]
                                );
                            }}
                        />
                        <label htmlFor={`content-${c.id}`} className="flex-grow cursor-pointer">{c.title}</label>
                    </div>
                ))}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setIsQuestionDialogOpen(false); setDialogSelectedContent([]); }}>Cancel</Button>
            <Button onClick={() => {
                handleConfirmAction();
            }}
            disabled={dialogSelectedContent.length === 0}
            >
                Add Questions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isEditQuestionDialogOpen} onOpenChange={setIsEditQuestionDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription>Modify the question details below.</DialogDescription>
          </DialogHeader>
          <Form {...questionForm}>
            <form onSubmit={questionForm.handleSubmit(handleEditQuestionSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-4">
                <FormField
                    control={questionForm.control}
                    name="text"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Question Text</FormLabel>
                            <FormControl>
                                <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={questionForm.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Question Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a question type" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="Multiple Choice">Multiple Choice</SelectItem>
                                    <SelectItem value="True/False">True/False</SelectItem>
                                    <SelectItem value="Short Answer">Short Answer</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {questionForm.watch('type') === 'Multiple Choice' && (
                     <>
                        <FormLabel>Options</FormLabel>
                        <Controller
                            control={questionForm.control}
                            name="correctAnswer"
                            render={({ field }) => (
                                <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-2">
                                    {optionFields.map((option, optionIndex) => (
                                        <FormField
                                            key={option.id}
                                            control={questionForm.control}
                                            name={`options.${optionIndex}.text`}
                                            render={({ field: optionField }) => (
                                                <FormItem className="flex items-center gap-4">
                                                        <FormControl>
                                                        <RadioGroupItem value={optionField.value} />
                                                        </FormControl>
                                                    <Input {...optionField} placeholder={`Option ${optionIndex + 1}`} />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    ))}
                                </RadioGroup>
                            )}
                        />
                        <FormMessage>{questionForm.formState.errors.correctAnswer?.message}</FormMessage>
                    </>
                )}
                 {questionForm.watch('type') === 'True/False' && (
                     <FormField
                        control={questionForm.control}
                        name="correctAnswer"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Correct Answer</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4">
                                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="True" /></FormControl><FormLabel>True</FormLabel></FormItem>
                                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="False" /></FormControl><FormLabel>False</FormLabel></FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                 {questionForm.watch('type') === 'Short Answer' && (
                    <FormField
                        control={questionForm.control}
                        name="correctAnswer"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Answer</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Enter the correct answer" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
              <DialogFooter className="pt-4">
                <Button variant="ghost" onClick={() => setIsEditQuestionDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={questionForm.formState.isSubmitting}>
                    {questionForm.formState.isSubmitting ? <Loader2 className="animate-spin" /> : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

