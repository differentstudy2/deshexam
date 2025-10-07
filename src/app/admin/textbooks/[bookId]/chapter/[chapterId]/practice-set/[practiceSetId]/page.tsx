
'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, updateDoc, collection, getDocs, addDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { PracticeSet, Question, Chapter } from '@/lib/types';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, ArrowLeft, PlusCircle, Edit, Trash2, GripVertical, FileJson } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/use-auth';

const optionSchema = z.object({
  text: z.string().min(1, 'Option text cannot be empty.'),
  explanation: z.string().optional(),
});

const questionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, 'Question text cannot be empty.'),
  type: z.enum(['Multiple Choice', 'True/False', 'Short Answer', 'Fill in the Blank', 'Matching']),
  marks: z.coerce.number().int().min(1, 'Marks must be a positive number.'),
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
        { "text": "Berlin", "explanation": "Incorrect." },
        { "text": "Madrid", "explanation": "Incorrect." },
        { "text": "Paris", "explanation": "Correct." },
        { "text": "Rome", "explanation": "Incorrect." }
      ],
      "correctAnswer": "Paris",
      "explanation": "Paris is the capital of France."
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
                                <Select onValueChange={field.onChange} value={field.value}>
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


export default function ManageChapterPracticeSetQuestionsPage() {
    const params = useParams();
    const { toast } = useToast();
    const { user } = useAuth();

    const textbookId = params.bookId as string;
    const chapterId = params.chapterId as string;
    const practiceSetId = params.practiceSetId as string;
    
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [practiceSet, setPracticeSet] = useState<PracticeSet | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

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

    const getQuestionsRef = () => collection(db, `textbooks/${textbookId}/chapters/${chapterId}/practiceSets/${practiceSetId}/questions`);

    const fetchData = async () => {
        if (!textbookId || !chapterId || !practiceSetId) return;
        setLoading(true);
        try {
            const chapterRef = doc(db, `textbooks/${textbookId}/chapters`, chapterId);
            const chapterSnap = await getDoc(chapterRef);
            if(chapterSnap.exists()) setChapter({ id: chapterSnap.id, ...chapterSnap.data() } as Chapter);

            const practiceSetRef = doc(db, `textbooks/${textbookId}/chapters/${chapterId}/practiceSets`, practiceSetId);
            const practiceSetSnap = await getDoc(practiceSetRef);
            if(practiceSetSnap.exists()) setPracticeSet({ id: practiceSetSnap.id, ...practiceSetSnap.data() } as PracticeSet);

            const q = query(getQuestionsRef(), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            setQuestions(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question)));

        } catch (error) {
            toast({ variant: 'destructive', title: 'Error fetching data', description: (error as Error).message });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [textbookId, chapterId, practiceSetId]);

    const openQuestionDialog = (question: Question | null) => {
        setEditingQuestion(question);
        if (question) {
            form.reset(question);
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
            const questionsRef = getQuestionsRef();
            const dataToSave = {
                ...data,
                authorId: user?.uid,
                authorName: user?.displayName,
                updatedAt: new Date()
            };
            if (editingQuestion) {
                const questionRef = doc(questionsRef, editingQuestion.id);
                await updateDoc(questionRef, dataToSave);
                toast({ title: 'Question Updated' });
            } else {
                await addDoc(questionsRef, { ...dataToSave, createdAt: new Date() });
                toast({ title: 'Question Added' });
            }
            fetchData();
            setIsQuestionDialogOpen(false);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: (error as Error).message });
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleDeleteQuestion = async (questionId: string) => {
        try {
            const questionRef = doc(getQuestionsRef(), questionId);
            await deleteDoc(questionRef);
            toast({ title: 'Question Deleted' });
            fetchData();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: (error as Error).message });
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
            const deletePromises = selectedQuestions.map(id => deleteDoc(doc(getQuestionsRef(), id)));
            await Promise.all(deletePromises);
            toast({ title: `${selectedQuestions.length} question(s) deleted.` });
            setSelectedQuestions([]);
            fetchData();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error deleting questions', description: (error as Error).message });
        }
    }

    const processJsonImport = async (jsonText: string) => {
        try {
            const parsedJson = JSON.parse(jsonText);
            const questionsToImport = parsedJson.questions.map((q: any) => ({...q, authorId: user?.uid, authorName: user?.displayName, createdAt: new Date()}));
            
            const addPromises = questionsToImport.map((q: any) => addDoc(getQuestionsRef(), q));
            await Promise.all(addPromises);
            
            toast({ title: 'Import Successful!', description: `${questionsToImport.length} questions have been added.`});
            fetchData();
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
                    <Link href={`/admin/textbooks/${textbookId}/chapter/${chapterId}/practice-sets`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Chapter Practice Sets
                    </Link>
                </Button>
            </div>
            <header>
                <h1 className="font-headline text-3xl font-bold">Practice Set: <span className="text-primary">{practiceSet?.title}</span></h1>
                <p className="text-muted-foreground mt-1">Chapter: {chapter?.title}</p>
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
                    ) : ( <p className="text-muted-foreground text-center py-8">No questions added to this practice set yet.</p>)}
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

    