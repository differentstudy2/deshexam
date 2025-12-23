
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, ArrowLeft, PlusCircle, Edit, Trash2, GripVertical, FileJson, Sparkles, Upload, FileText } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { 
    addQuestionToPracticeSet,
    updatePracticeSet,
    getPracticeSetById,
    getQuestionsByPracticeSet,
    updateQuestionInPracticeSet,
    deleteQuestionFromPracticeSet,
    getChaptersByTextbookId
} from '@/lib/firebase/firestore';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/use-auth';
import { generateQuestions, AIQuestionGeneratorInput, AIQuestionGeneratorOutput } from '@/ai/flows/ai-question-generator';
import type { Question, PracticeSet } from '@/lib/types';
import QuestionForm from './question-form';

const questionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, 'Question text cannot be empty.'),
  type: z.enum(['Multiple Choice', 'True/False', 'Short Answer', 'Fill in the Blank', 'Matching']),
  marks: z.coerce.number().int().positive('Marks must be a positive number.'),
  options: z.array(z.object({ text: z.string().min(1, 'Option text cannot be empty.'), explanation: z.string().optional() })).optional(),
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

const aiGeneratorFormSchema = z.object({
    sourceType: z.enum(['textbookContent', 'topic', 'text', 'file']),
    sourceTopic: z.string().optional(),
    sourceText: z.string().optional(),
    sourceFile: z.string().optional(),
    numQuestions: z.coerce.number().int().min(1).max(20),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']),
    questionType: z.enum(['Multiple Choice', 'True/False', 'Short Answer', 'Fill in the Blank', 'Matching', 'Any']),
}).refine(data => {
    if (data.sourceType === 'topic') return !!data.sourceTopic && data.sourceTopic.length >= 3;
    if (data.sourceType === 'text' || data.sourceType === 'textbookContent') return !!data.sourceText && data.sourceText.length >= 3;
    if (data.sourceType === 'file') return !!data.sourceFile && data.sourceFile.length >= 3;
    return false;
}, {
    message: 'Source content must be at least 3 characters.',
    path: ['sourceTopic'], 
});
type AIGeneratorFormValues = z.infer<typeof aiGeneratorFormSchema>;


export default function ManageTextbookPracticeSetQuestionsPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useAuth();

    const textbookId = params.bookId as string;
    const practiceSetId = params.practiceSetId as string;
    
    const [practiceSet, setPracticeSet] = useState<PracticeSet | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [fullTextbookContent, setFullTextbookContent] = useState('');

    const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
    const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const aiFormFileInputRef = useRef<HTMLInputElement>(null);

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
            options: Array(4).fill({ text: '', explanation: '' }),
            correctAnswer: '',
            explanation: '',
        },
    });
    
    const aiForm = useForm<AIGeneratorFormValues>({
        resolver: zodResolver(aiGeneratorFormSchema),
        defaultValues: {
          sourceType: 'textbookContent',
          sourceTopic: '',
          sourceText: '',
          sourceFile: '',
          numQuestions: 5,
          difficulty: 'Medium',
          questionType: 'Any',
        },
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const fetchedPracticeSet = await getPracticeSetById(textbookId, 'null', 'null', practiceSetId);
            setPracticeSet(fetchedPracticeSet as PracticeSet);

            const fetchedQuestions = await getQuestionsByPracticeSet(textbookId, 'null', 'null', practiceSetId);
            setQuestions(fetchedQuestions as Question[]);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error fetching data', description: (error as Error).message });
            router.push(`/admin/textbooks/${textbookId}/practice-sets`);
        } finally {
            setLoading(false);
        }
    }, [textbookId, practiceSetId, toast, router]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        const fetchFullTextbookContent = async () => {
            if (!textbookId) return;
            try {
                const chapters = await getChaptersByTextbookId(textbookId);
                const content = chapters.map(c => c.content).filter(Boolean).join('\\n\\n---\\n\\n');
                setFullTextbookContent(content);
                aiForm.setValue('sourceText', content);
            } catch (error) {
                toast({
                    variant: 'destructive',
                    title: 'Could not load textbook content',
                    description: (error as Error).message
                });
            }
        };
        fetchFullTextbookContent();
    }, [textbookId, aiForm, toast]);


    const openQuestionDialog = (question: Question | null) => {
        setEditingQuestion(question);
        if (question) {
            form.reset({
                ...question,
                 options: question.options || (question.type === 'Multiple Choice' ? [{text:'', explanation:''}, {text:'', explanation:''}, {text:'', explanation:''}, {text:'', explanation:''}] : question.type === 'True/False' ? [{text: 'True', explanation: ''}, {text: 'False', explanation: ''}] : []),
            });
        } else {
            form.reset({ text: '', type: 'Multiple Choice', marks: 1, options: [{ text: '', explanation: '' }, { text: '', explanation: '' }, { text: '', explanation: '' }, { text: '', explanation: '' }], correctAnswer: '', explanation: '' });
        }
        setIsQuestionDialogOpen(true);
    }
    
    const handleQuestionSubmit = async (data: QuestionFormValues) => {
        setIsSubmitting(true);
        try {
            if (editingQuestion) {
                await updateQuestionInPracticeSet(textbookId, 'null', 'null', practiceSetId, editingQuestion.id, data);
                toast({ title: 'Question Updated' });
            } else {
                await addQuestionToPracticeSet(textbookId, 'null', 'null', practiceSetId, data);
                toast({ title: 'Question Added' });
            }
            fetchData();
            setIsQuestionDialogOpen(false);
        } catch (error) {
            toast({ variant: "destructive", title: 'Error', description: (error as Error).message });
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleDeleteQuestion = async (questionId: string) => {
        try {
            await deleteQuestionFromPracticeSet(textbookId, 'null', 'null', practiceSetId, questionId);
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
            const deletePromises = selectedQuestions.map(id => deleteQuestionFromPracticeSet(textbookId, 'null', 'null', practiceSetId, id));
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
            
            for(const q of questionsToImport) {
                await addQuestionToPracticeSet(textbookId, 'null', 'null', practiceSetId, q);
            }
            
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
    
    const handleAIGenerate = async (aiData: AIGeneratorFormValues) => {
        setIsGenerating(true);
        try {
            const source = aiData.sourceType === 'topic' ? aiData.sourceTopic
                         : aiData.sourceType === 'textbookContent' ? fullTextbookContent
                         : aiData.sourceType === 'text' ? aiData.sourceText
                         : aiData.sourceType === 'file' ? aiData.sourceFile
                         : null;
    
            if (!source || source.length < 3) {
                toast({
                    variant: "destructive",
                    title: 'AI Generation Failed',
                    description: 'Source content must be at least 3 characters.',
                });
                setIsGenerating(false);
                return;
            }
    
            const input: AIQuestionGeneratorInput = {
                numQuestions: aiData.numQuestions,
                difficulty: aiData.difficulty,
                questionType: aiData.questionType,
                sourceType: (aiData.sourceType === 'file' || aiData.sourceType === 'textbookContent') ? 'text' : aiData.sourceType,
                source: source,
            };

            const result: AIQuestionGeneratorOutput = await generateQuestions(input);
            
            for(const q of result.questions) {
                await addQuestionToPracticeSet(textbookId, 'null', 'null', practiceSetId, q);
            }
            
            toast({
                title: 'Questions Generated!',
                description: `${result.questions.length} new questions have been added.`,
            });
            fetchData();
            setIsAIGeneratorOpen(false);
    
        } catch (error) {
          toast({
            variant: "destructive",
            title: 'AI Generation Failed',
            description: (error as Error).message,
          });
        } finally {
          setIsGenerating(false);
        }
    };
    
      const handleAiFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.type === 'text/plain') {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const text = e.target?.result as string;
                    aiForm.setValue('sourceFile', text, { shouldValidate: true });
                    aiForm.setValue('sourceType', 'file');
                };
                reader.readAsText(file);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Invalid File Type',
                    description: 'Please upload a .txt file.',
                });
            }
        }
    };
    
    if (loading) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin" /></div>
    }

    return (
        <div className="space-y-6">
            <div>
                <Button variant="ghost" asChild>
                    <Link href={`/admin/textbooks/${textbookId}/practice-sets`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Practice Sets
                    </Link>
                </Button>
            </div>
            <header>
                <h1 className="font-headline text-3xl font-bold">Practice Set: <span className="text-primary">{practiceSet?.title}</span></h1>
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
                         <Dialog open={isAIGeneratorOpen} onOpenChange={setIsAIGeneratorOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="w-full"><Sparkles className="mr-2"/> Generate with AI</Button>
                            </DialogTrigger>
                             <DialogContent className="sm:max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Generate Questions with AI</DialogTitle>
                                    <DialogDescription>
                                        Describe the questions you want to create, and Gemini will generate them for this practice set.
                                    </DialogDescription>
                                </DialogHeader>
                                <Form {...aiForm}>
                                    <form onSubmit={aiForm.handleSubmit(handleAIGenerate)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
                                        <Tabs defaultValue="textbookContent" className="w-full" onValueChange={(value) => aiForm.setValue('sourceType', value as any)}>
                                            <TabsList className="grid w-full grid-cols-4">
                                                <TabsTrigger value="textbookContent">Textbook Content</TabsTrigger>
                                                <TabsTrigger value="topic">Topic</TabsTrigger>
                                                <TabsTrigger value="text">Paste Text</TabsTrigger>
                                                <TabsTrigger value="file">From File</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="textbookContent" className="pt-4">
                                                <FormItem>
                                                    <FormLabel>Full Textbook Content</FormLabel>
                                                    <FormControl>
                                                        <Textarea readOnly value={fullTextbookContent || "Loading textbook content..."} className="min-h-[150px] bg-secondary"/>
                                                    </FormControl>
                                                </FormItem>
                                            </TabsContent>
                                            <TabsContent value="topic" className="pt-4">
                                                <FormField control={aiForm.control} name="sourceTopic" render={({ field }) => (
                                                    <FormItem><FormLabel>Topic</FormLabel><FormControl><Input placeholder="e.g., 'Newton's Laws of Motion'" {...field} /></FormControl><FormMessage /></FormItem>
                                                )}/>
                                            </TabsContent>
                                            <TabsContent value="text" className="pt-4">
                                                <FormField control={aiForm.control} name="sourceText" render={({ field }) => (
                                                    <FormItem><FormLabel>Paste Text</FormLabel><FormControl><Textarea placeholder="Paste your content here..." {...field} className="min-h-[150px]" /></FormControl><FormMessage /></FormItem>
                                                )}/>
                                            </TabsContent>
                                            <TabsContent value="file" className="pt-4">
                                                <FormItem>
                                                    <FormLabel>Upload File</FormLabel>
                                                    <FormControl>
                                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer" onClick={() => aiFormFileInputRef.current?.click()}>
                                                            <div className="space-y-1 text-center">
                                                                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                                                                <p className="pl-1">{aiForm.watch('sourceFile') ? 'File selected' : 'Upload a .txt file'}</p>
                                                                <p className="text-xs text-muted-foreground">{aiForm.watch('sourceFile') ? aiForm.watch('sourceFile')?.substring(0, 50) + '...' : 'Text file up to 10MB'}</p>
                                                            </div>
                                                        </div>
                                                    </FormControl>
                                                    <Input type="file" ref={aiFormFileInputRef} onChange={handleAiFileChange} className="hidden" accept=".txt"/>
                                                    <FormMessage />
                                                </FormItem>
                                            </TabsContent>
                                        </Tabs>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField control={aiForm.control} name="numQuestions" render={({ field }) => (<FormItem><FormLabel>Number of Questions</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                            <FormField control={aiForm.control} name="difficulty" render={({ field }) => (
                                                <FormItem><FormLabel>Difficulty</FormLabel>
                                                     <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Easy">Easy</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Hard">Hard</SelectItem></SelectContent></Select>
                                                <FormMessage /></FormItem>
                                            )}/>
                                        </div>
                                        <FormField control={aiForm.control} name="questionType" render={({ field }) => (
                                            <FormItem><FormLabel>Question Type</FormLabel>
                                                 <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Any">Any</SelectItem><SelectItem value="Multiple Choice">Multiple Choice</SelectItem><SelectItem value="True/False">True/False</SelectItem><SelectItem value="Short Answer">Short Answer</SelectItem><SelectItem value="Fill in the Blank">Fill in the Blank</SelectItem><SelectItem value="Matching">Matching</SelectItem></SelectContent></Select>
                                            <FormMessage /></FormItem>
                                        )}/>
                                        <DialogFooter className="pt-4"><Button type="submit" disabled={isGenerating}>{isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : "Generate"}</Button></DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
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
                                    <AccordionContent><pre className="mt-2 w-full rounded-md bg-secondary p-4 whitespace-pre-wrap break-words text-sm">{jsonExample}</pre></AccordionContent>
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
    );
}

