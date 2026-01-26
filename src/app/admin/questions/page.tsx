

'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { getAllQuestions, deleteQuestion, addQuestion, updateQuestion, getSubjects } from '@/lib/firebase/firestore';
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
import { MoreHorizontal, Pencil, Trash2, Eye, Loader2, Search, Filter, Sparkles, Upload, FilePlus, BookPlus } from 'lucide-react';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { generateContent, AIContentGeneratorInput } from '@/ai/flows/ai-content-generator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


type Subject = { id: string, name: string };
const optionSchema = z.object({
  text: z.string().min(1, 'Option text cannot be empty.'),
  explanation: z.string().optional(),
});
const questionFormSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, 'Question text cannot be empty.'),
  subject: z.string().min(1, { message: 'Subject is required.' }),
  type: z.enum(['Multiple Choice', 'True/False', 'Short Answer', 'Fill in the Blank']),
  marks: z.coerce.number().int().positive('Marks must be a positive number.'),
  options: z.array(optionSchema).optional(),
  correctAnswer: z.string().optional(),
  explanation: z.string().optional(),
});
type QuestionFormValues = z.infer<typeof questionFormSchema>;

type Question = {
    id: string;
    text: string;
    authorName: string;
    createdAt: any;
    subject: string;
    type: 'Multiple Choice' | 'True/False' | 'Short Answer' | 'Fill in the Blank';
    marks: number;
    options?: {text: string, explanation?: string}[];
    correctAnswer?: string;
    explanation?: string;
};

const ITEMS_PER_PAGE = 10;

const QuestionForm = ({ form, onSubmit, isSubmitting, subjects, onClose }: { form: any, onSubmit: (data: QuestionFormValues) => void, isSubmitting: boolean, subjects: Subject[], onClose: () => void }) => {
    const questionType = form.watch('type');

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-4">
                <FormField control={form.control} name="subject" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a subject" /></SelectTrigger></FormControl>
                            <SelectContent>
                                {subjects.map(sub => (<SelectItem key={sub.id} value={sub.name}>{sub.name}</SelectItem>))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="text" render={({ field }) => (<FormItem><FormLabel>Question Text</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField control={form.control} name="type" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Question Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a question type" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="Multiple Choice">Multiple Choice</SelectItem>
                                <SelectItem value="True/False">True/False</SelectItem>
                                <SelectItem value="Short Answer">Short Answer</SelectItem>
                                <SelectItem value="Fill in the Blank">Fill in the Blank</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="explanation" render={({ field }) => (
                    <FormItem><FormLabel>Explanation</FormLabel><FormControl><Textarea placeholder="Explain why the correct answer is right." {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="marks" render={({ field }) => (
                    <FormItem><FormLabel>Marks</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                {questionType === 'Multiple Choice' && (
                    <div className="space-y-4">
                        <FormLabel>Options</FormLabel>
                        <Controller
                            control={form.control}
                            name="correctAnswer"
                            render={({ field }) => (
                                <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Array.from({length: 4}).map((_, optionIndex) => (
                                        <div key={optionIndex} className="flex items-start gap-4">
                                            <FormControl><RadioGroupItem value={form.getValues(`options.${optionIndex}.text`)} id={`q${form.getValues('id')}-opt-${optionIndex}`} className="mt-2.5" /></FormControl>
                                            <div className="space-y-2 flex-1">
                                                <FormField control={form.control} name={`options.${optionIndex}.text`} render={({ field: optionField }) => (<Input {...optionField} placeholder={`Option ${optionIndex + 1}`} />)} />
                                                <FormField control={form.control} name={`options.${optionIndex}.explanation`} render={({ field: explanationField }) => (<Textarea {...explanationField} placeholder={`Explanation for Option ${optionIndex + 1}`} />)}/>
                                            </div>
                                        </div>
                                    ))}
                                </RadioGroup>
                            )}
                        />
                        <FormMessage>{form.formState.errors.correctAnswer?.message}</FormMessage>
                    </div>
                )}
                {questionType === 'True/False' && (
                    <FormField control={form.control} name="correctAnswer" render={({ field }) => (
                        <FormItem><FormLabel>Correct Answer</FormLabel>
                        <FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="True" /></FormControl><FormLabel>True</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="False" /></FormControl><FormLabel>False</FormLabel></FormItem></RadioGroup></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}/>
                )}
                {(questionType === 'Short Answer' || questionType === 'Fill in the Blank') && (
                    <FormField control={form.control} name="correctAnswer" render={({ field }) => (
                        <FormItem><FormLabel>Answer</FormLabel><FormControl><Input {...field} placeholder="Enter the correct answer" /></FormControl><FormMessage /></FormItem>
                    )}/>
                )}
                <DialogFooter className="pt-4">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin" /> : 'Save Changes'}</Button>
                </DialogFooter>
            </form>
        </Form>
    );
};

const QuestionsTable = ({
    questions,
    loading,
    selectedQuestions,
    onSelectQuestion,
    onSelectAllQuestions,
    isAllQuestionsSelected,
    onEditQuestion,
    onDeleteQuestion
}: {
    questions: Question[];
    loading: boolean;
    selectedQuestions: string[];
    onSelectQuestion: (id: string) => void;
    onSelectAllQuestions: (checked: boolean) => void;
    isAllQuestionsSelected: boolean;
    onEditQuestion: (question: Question) => void;
    onDeleteQuestion: (question: Question) => void;
}) => {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-12">
                        <Checkbox
                            checked={isAllQuestionsSelected}
                            onCheckedChange={(checked) => onSelectAllQuestions(Boolean(checked))}
                            aria-label="Select all"
                        />
                    </TableHead>
                    <TableHead>Question Text</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead className="hidden md:table-cell">Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                            <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell>
                        </TableRow>
                    ))
                ) : questions.length > 0 ? (
                    questions.map((question) => (
                        <TableRow key={question.id} data-state={selectedQuestions.includes(question.id) && "selected"}>
                            <TableCell>
                                <Checkbox
                                    checked={selectedQuestions.includes(question.id)}
                                    onCheckedChange={() => onSelectQuestion(question.id)}
                                    aria-label={`Select question`}
                                />
                            </TableCell>
                            <TableCell className="font-medium max-w-sm truncate">{question.text}</TableCell>
                            <TableCell>{question.subject}</TableCell>
                            <TableCell>{question.type}</TableCell>
                            <TableCell>{question.marks}</TableCell>
                            <TableCell className="hidden md:table-cell">
                                {question.createdAt?.toDate ? question.createdAt.toDate().toLocaleDateString() : 'Just now'}
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem asChild>
                                            <Link href={`/question/${question.id}`} target="_blank">
                                                <Eye className="mr-2 h-4 w-4" /> View
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onEditQuestion(question)}>
                                            <Pencil className="mr-2 h-4 w-4" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onDeleteQuestion(question)} className="text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={7} className="text-center h-24">No questions found.</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
};


export default function ManageQuestionsPage() {
    const { toast } = useToast();
    const { user } = useAuth();
    const [allQuestions, setAllQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('all');
    const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isQuestionFormDialogOpen, setIsQuestionFormDialogOpen] = useState(false);
    const [questionToEdit, setQuestionToEdit] = useState<Question | null>(null);
    const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);

    const questionForm = useForm<QuestionFormValues>({
        resolver: zodResolver(questionFormSchema),
    });

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [subjectData, questionData] = await Promise.all([
            getSubjects(),
            getAllQuestions(),
            ]);
            
            setSubjects(subjectData);
            setAllQuestions(questionData as Question[]);

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
    
    const filteredQuestions = useMemo(() => {
        return allQuestions.filter(item => {
            const matchesSearch = item.text.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesSubject = subjectFilter === 'all' || item.subject === subjectFilter;
            return matchesSearch && matchesSubject;
        });
    }, [allQuestions, searchQuery, subjectFilter]);
    
    const paginatedQuestions = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredQuestions.slice(startIndex, endIndex);
    }, [filteredQuestions, currentPage]);
    
    const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE);

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

    const openQuestionDialog = (question: Question | null) => {
        setQuestionToEdit(question);
        if (question) {
            questionForm.reset({
                ...question,
                options: question.options || (question.type === 'Multiple Choice' ? Array.from({ length: 4 }, () => ({ text: '', explanation: '' })) : question.type === 'True/False' ? [{text: 'True', explanation: ''}, {text: 'False', explanation: ''}] : []),
            });
        } else {
          questionForm.reset({
            text: '',
            subject: subjectFilter !== 'all' ? subjectFilter : '',
            type: 'Multiple Choice',
            marks: 1,
            options: Array.from({ length: 4 }, () => ({ text: '', explanation: '' })),
            correctAnswer: '',
            explanation: '',
          });
        }
        setIsQuestionFormDialogOpen(true);
      };
      
      const handleQuestionFormSubmit = async (data: QuestionFormValues) => {
        if (!user) {
            toast({variant: 'destructive', title: 'Not authenticated'});
            return;
        }
        try {
            if (questionToEdit) {
                await updateQuestion(questionToEdit.id, data);
                toast({ title: 'Question updated successfully!' });
            } else {
                await addQuestion(data);
                toast({ title: 'Question added successfully!' });
            }
            setIsQuestionFormDialogOpen(false);
            setQuestionToEdit(null);
            fetchInitialData();
        } catch (error) {
            toast({
                variant: "destructive",
                title: `Error ${questionToEdit ? 'updating' : 'adding'} question`,
                description: (error as Error).message,
            });
        }
      };

    const handleDeleteQuestions = async (ids: string[]) => {
        try {
          await Promise.all(ids.map(id => deleteQuestion(id)));
          toast({
            title: "Question(s) Deleted",
            description: `${ids.length} question(s) have been deleted.`,
          });
          fetchInitialData();
        } catch (error) {
          toast({
            variant: "destructive",
            title: 'Error deleting questions',
            description: (error as Error).message,
          });
        } finally {
            setSelectedQuestions([]);
            setQuestionToDelete(null);
        }
      };

    return(
        <div className="space-y-6">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="font-headline text-3xl font-bold">Manage Questions</h1>
                    <p className="text-muted-foreground">
                    View and manage all questions across the platform.
                    </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button onClick={() => openQuestionDialog(null)} className="w-full">
                        <FilePlus className="mr-2"/>Add New Question
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Question Bank</CardTitle>
                    <CardDescription>
                        A list of all standalone questions in your application.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-4">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search by question text..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by subject" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Subjects</SelectItem>
                                    {subjects.map(sub => <SelectItem key={sub.id} value={sub.name}>{sub.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {selectedQuestions.length > 0 && (
                                <Button variant="destructive" onClick={() => handleDeleteQuestions(selectedQuestions)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Selected ({selectedQuestions.length})
                                </Button>
                            )}
                        </div>
                    </div>
                     <QuestionsTable 
                        questions={paginatedQuestions} 
                        loading={loading}
                        selectedQuestions={selectedQuestions}
                        onSelectQuestion={handleSelectQuestion}
                        onSelectAllQuestions={handleSelectAllQuestions}
                        isAllQuestionsSelected={isAllQuestionsSelected}
                        onEditQuestion={openQuestionDialog}
                        onDeleteQuestion={setQuestionToDelete}
                    />
                    <div className="flex items-center justify-end space-x-2 py-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isQuestionFormDialogOpen} onOpenChange={setIsQuestionFormDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{questionToEdit ? 'Edit Question' : 'Add New Question'}</DialogTitle>
                    <DialogDescription>
                        {questionToEdit ? 'Modify the question details below.' : 'Add a new question to the question bank.'}
                    </DialogDescription>
                </DialogHeader>
                <QuestionForm 
                    form={questionForm} 
                    onSubmit={handleQuestionFormSubmit} 
                    isSubmitting={questionForm.formState.isSubmitting} 
                    subjects={subjects}
                    onClose={() => setIsQuestionFormDialogOpen(false)}
                />
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!questionToDelete} onOpenChange={() => setQuestionToDelete(null)}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                    This will permanently delete this question. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteQuestions([questionToDelete!.id])}>Delete</AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}


