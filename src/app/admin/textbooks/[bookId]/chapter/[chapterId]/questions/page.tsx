
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Chapter, Question } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, ArrowLeft, PlusCircle, Edit, Trash2, FileJson } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';


const optionSchema = z.object({
  text: z.string().min(1, 'Option text cannot be empty.'),
  explanation: z.string().optional(),
});

const questionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, 'Question text cannot be empty.'),
  type: z.enum(['Multiple Choice', 'True/False', 'Short Answer', 'Fill in the Blank', 'Matching']),
  marks: z.coerce.number().int().min(1, 'Marks must be a positive number.').describe('The marks allocated for the question.'),
  options: z.array(optionSchema).optional(),
  matchingOptions: z.object({
    columnA: z.array(z.object({ text: z.string(), image: z.string().optional() })),
    columnB: z.array(z.object({ text: z.string(), image: z.string().optional() })),
  }).optional(),
  correctAnswer: z.any().optional(),
  explanation: z.string().optional(),
});

type QuestionFormValues = z.infer<typeof questionSchema>;

const jsonExample = `
{
  "questions": [
    {
      "text": "What is the capital of France?",
      "type": "Multiple Choice",
      "marks": 1,
      "options": [
        { "text": "Berlin", "explanation": "Incorrect. Berlin is the capital of Germany." },
        { "text": "Madrid", "explanation": "Incorrect. Madrid is the capital of Spain." },
        { "text": "Paris", "explanation": "Correct. Paris is the capital of France." },
        { "text": "Rome", "explanation": "Incorrect. Rome is the capital of Italy." }
      ],
      "correctAnswer": "Paris",
      "explanation": "Paris is the capital and most populous city of France."
    }
  ]
}
`;


const QuestionForm = ({ form, onSubmit, isSubmitting }: { form: any, onSubmit: (data: QuestionFormValues) => void, isSubmitting: boolean }) => {
    const questionType = form.watch('type');
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-4">
                <FormField name="text" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Question Text</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <div className="grid grid-cols-2 gap-4">
                    <FormField name="type" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="Multiple Choice">Multiple Choice</SelectItem>
                                    <SelectItem value="True/False">True/False</SelectItem>
                                    <SelectItem value="Short Answer">Short Answer</SelectItem>
                                    <SelectItem value="Fill in the Blank">Fill in the Blank</SelectItem>
                                    <SelectItem value="Matching">Matching</SelectItem>
                                </SelectContent>
                            </Select>
                        <FormMessage /></FormItem>
                    )}/>
                    <FormField name="marks" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Marks</FormLabel><FormControl><Input type="number" {...field} disabled={questionType === 'Matching'} /></FormControl><FormMessage /></FormItem>
                    )}/>
                </div>
                
                {questionType === 'Multiple Choice' && (
                    <div className="space-y-2">
                        <FormLabel>Options</FormLabel>
                        {[0, 1, 2, 3].map(optionIndex => (
                            <FormField key={optionIndex} control={form.control} name={`options.${optionIndex}.text`} render={({ field }) => (
                                <FormItem><FormControl><Input {...field} placeholder={`Option ${optionIndex + 1}`} /></FormControl></FormItem>
                            )}/>
                        ))}
                         <FormField name="correctAnswer" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Correct Answer</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select correct answer"/></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {form.watch('options')?.map((opt:any, i:number) => opt.text && <SelectItem key={i} value={opt.text}>{opt.text}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            <FormMessage /></FormItem>
                        )}/>
                    </div>
                )}
                
                <FormField name="explanation" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>General Explanation</FormLabel><FormControl><Textarea {...field} placeholder="General explanation for the correct answer." /></FormControl><FormMessage /></FormItem>
                )}/>
                
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        Save Question
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    );
};


export default function ManageChapterQuestionsPage() {
    const params = useParams();
    const { toast } = useToast();

    const textbookId = params.bookId as string;
    const chapterId = params.chapterId as string;
    
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
    const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);

    const importFileRef = useRef<HTMLInputElement>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
    const [jsonText, setJsonText] = useState('');

    const form = useForm<QuestionFormValues>({
        resolver: zodResolver(questionSchema),
        defaultValues: {
            text: '',
            type: 'Multiple Choice',
            marks: 1,
            options: [{ text: '', explanation: '' }, { text: '', explanation: '' }, { text: '', explanation: '' }, { text: '', explanation: '' }],
            correctAnswer: '',
            explanation: '',
        },
    });
    
    const fetchData = useCallback(async () => {
        if (!textbookId || !chapterId) return;
        setLoading(true);

        const chapterRef = doc(db, `textbooks/${textbookId}/chapters`, chapterId);
        const chapterSnap = await getDoc(chapterRef);
        if (chapterSnap.exists()) {
            const chapterData = { id: chapterSnap.id, ...chapterSnap.data() } as Chapter;
            setChapter(chapterData);
            setQuestions(chapterData.textbookQuestions || []);
        }
        setLoading(false);
    }, [textbookId, chapterId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const saveQuestionsToFirestore = async (updatedQuestions: Question[]) => {
        const chapterRef = doc(db, `textbooks/${textbookId}/chapters`, chapterId);
        await updateDoc(chapterRef, { textbookQuestions: updatedQuestions });
    }

    const openQuestionDialog = (question: Question | null) => {
        setEditingQuestion(question);
        if (question) {
            form.reset({
                ...question,
                options: question.type === 'Multiple Choice' ? (question.options || []) : [{ text: '', explanation: '' }, { text: '', explanation: '' }, { text: '', explanation: '' }, { text: '', explanation: '' }],
            });
        } else {
            form.reset({
                text: '', type: 'Multiple Choice', marks: 1,
                options: [{ text: '', explanation: '' }, { text: '', explanation: '' }, { text: '', explanation: '' }, { text: '', explanation: '' }],
                correctAnswer: '', explanation: ''
            });
        }
        setIsQuestionDialogOpen(true);
    }
    
    const handleQuestionSubmit = async (data: QuestionFormValues) => {
        setIsSubmitting(true);
        try {
            let updatedQuestions;
            if (editingQuestion) {
                updatedQuestions = questions.map(q => q.id === editingQuestion.id ? { ...data, id: editingQuestion.id } : q);
            } else {
                const newQuestion = { ...data, id: new Date().getTime().toString() };
                updatedQuestions = [...questions, newQuestion];
            }
            await saveQuestionsToFirestore(updatedQuestions);
            setQuestions(updatedQuestions);
            toast({ title: editingQuestion ? 'Question Updated' : 'Question Added' });
            setIsQuestionDialogOpen(false);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: (error as Error).message });
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleDeleteQuestion = async (questionId: string) => {
        if(!questionId) return;
        try {
            const updatedQuestions = questions.filter(q => q.id !== questionId);
            await saveQuestionsToFirestore(updatedQuestions);
            setQuestions(updatedQuestions);
            toast({ title: 'Question Deleted' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: (error as Error).message });
        } finally {
            setQuestionToDelete(null);
        }
    }
    
    const handleSelectQuestion = (questionId: string) => {
        setSelectedQuestions(prev => prev.includes(questionId) ? prev.filter(id => id !== questionId) : [...prev, id]);
    };
    
    const handleSelectAllQuestions = (checked: boolean) => {
        if (checked) {
            setSelectedQuestions(questions.map(q => q.id));
        } else {
            setSelectedQuestions([]);
        }
    };
    
    const handleDeleteSelected = async () => {
        try {
            const updatedQuestions = questions.filter(q => !selectedQuestions.includes(q.id));
            await saveQuestionsToFirestore(updatedQuestions);
            setQuestions(updatedQuestions);
            toast({ title: `${selectedQuestions.length} question(s) deleted.` });
            setSelectedQuestions([]);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error deleting questions', description: (error as Error).message });
        }
    }

    const processJsonImport = async (jsonText: string) => {
        try {
            const parsedJson = JSON.parse(jsonText);
            const questionsToImport = parsedJson.questions.map((q: any) => ({...q, id: new Date().getTime().toString() + Math.random()}));
            
            const updatedQuestions = [...questions, ...questionsToImport];
            await saveQuestionsToFirestore(updatedQuestions);
            setQuestions(updatedQuestions);
            
            toast({ title: 'Import Successful!', description: `${questionsToImport.length} questions have been added.`});
            setIsImportDialogOpen(false);
            setJsonText('');
          } catch (error) {
            toast({ variant: 'destructive', title: 'Import Failed', description: (error as Error).message });
          } finally {
            setIsImporting(false);
          }
    }

    const handleBulkImportFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setIsImporting(true);
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          processJsonImport(text);
           if(importFileRef.current) importFileRef.current.value = '';
        };
        reader.readAsText(file);
    };
      
    const handleBulkImportFromText = () => {
        if (!jsonText.trim()) { toast({ variant: "destructive", title: 'Import Failed', description: "Textbox cannot be empty."}); return; }
        setIsImporting(true);
        processJsonImport(jsonText);
    }
    
    if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin" /></div>

    return (
        <div className="space-y-6">
            <div>
                <Button variant="ghost" asChild>
                    <Link href={`/admin/textbooks/${textbookId}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Chapters
                    </Link>
                </Button>
            </div>
            <header>
                <h1 className="font-headline text-3xl font-bold">Chapter Questions: <span className="text-primary">{chapter?.title}</span></h1>
                <p className="text-muted-foreground mt-1">Manage the original textbook questions for this chapter.</p>
            </header>

            <Card>
                <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <CardTitle>Questions ({questions.length})</CardTitle>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Button size="sm" onClick={() => openQuestionDialog(null)} className="w-full">
                            <PlusCircle className="mr-2"/> Add Question
                        </Button>
                        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="w-full"><FileJson className="mr-2"/> Bulk Import</Button>
                            </DialogTrigger>
                             <DialogContent className="sm:max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Bulk Import Questions</DialogTitle>
                                    <DialogDescription>Upload a JSON file or paste JSON text containing an array of questions.</DialogDescription>
                                </DialogHeader>
                                <Tabs defaultValue="upload" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="upload">Upload File</TabsTrigger><TabsTrigger value="paste">Paste JSON</TabsTrigger></TabsList>
                                    <TabsContent value="upload">
                                        <div className="py-4"><div className="grid w-full max-w-sm items-center gap-1.5">
                                            <Label htmlFor="json-import">JSON/TXT File</Label>
                                            <Input id="json-import" type="file" accept=".json,.txt" onChange={handleBulkImportFromFile} ref={importFileRef} disabled={isImporting} />
                                            {isImporting && <p className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="animate-spin" /> Importing...</p>}
                                        </div></div>
                                    </TabsContent>
                                    <TabsContent value="paste">
                                        <div className="py-4 space-y-4">
                                            <Textarea placeholder='Paste your JSON content here...' value={jsonText} onChange={(e) => setJsonText(e.target.value)} className="min-h-[200px] font-mono text-xs" disabled={isImporting}/>
                                            <Button onClick={handleBulkImportFromText} disabled={isImporting || !jsonText.trim()}>{isImporting ? <><Loader2 className="animate-spin mr-2"/>Processing...</> : 'Import from Text'}</Button>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                                <Accordion type="single" collapsible className="w-full"><AccordionItem value="item-1">
                                    <AccordionTrigger>View JSON Format Example</AccordionTrigger>
                                    <AccordionContent><p className="text-sm text-muted-foreground mb-4">Your JSON file must contain a single key "questions" which is an array of question objects.</p><pre className="mt-2 w-full rounded-md bg-secondary p-4 whitespace-pre-wrap break-words text-sm">{jsonExample}</pre></AccordionContent>
                                </AccordionItem></Accordion>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                     {selectedQuestions.length > 0 && (
                        <div className="mb-4">
                             <AlertDialog>
                                <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4"/>Delete Selected ({selectedQuestions.length})</Button></AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete {selectedQuestions.length} question(s). This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteSelected}>Delete</AlertDialogAction></AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}
                    {questions.length > 0 ? (
                        <ul className="space-y-2">
                             <li className="flex items-center p-3 border-b">
                                <Checkbox id="select-all" checked={selectedQuestions.length === questions.length && questions.length > 0} onCheckedChange={handleSelectAllQuestions} className="mr-4" />
                                <label htmlFor="select-all" className="flex-1 font-semibold text-sm">Select All</label>
                            </li>
                            {questions.map(q => (
                                <li key={q.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-md gap-4">
                                    <div className="flex items-start flex-1 min-w-0">
                                        <Checkbox id={`select-${q.id}`} checked={selectedQuestions.includes(q.id)} onCheckedChange={() => handleSelectQuestion(q.id)} className="mr-4 mt-1" />
                                        <label htmlFor={`select-${q.id}`} className="flex-1">{q.text}</label>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0 self-end sm:self-center">
                                        <Button variant="ghost" size="icon" onClick={() => openQuestionDialog(q)}><Edit className="h-4 w-4"/></Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4"/></Button></AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone and will permanently delete this question.</AlertDialogDescription></AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteQuestion(q.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : ( <p className="text-muted-foreground text-center py-8">No questions added to this chapter yet.</p>)}
                </CardContent>
            </Card>
            
             <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader><DialogTitle>{editingQuestion ? 'Edit Question' : 'Add New Question'}</DialogTitle><DialogDescription>Fill in the details for your question below.</DialogDescription></DialogHeader>
                    <QuestionForm form={form} onSubmit={handleQuestionSubmit} isSubmitting={isSubmitting} />
                </DialogContent>
            </Dialog>
        </div>
    )
}
