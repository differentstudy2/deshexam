
'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { PracticeSet, Question, Topic } from '@/lib/types';
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
import { Loader2, ArrowLeft, PlusCircle, Edit, Trash2, GripVertical, FileJson } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { 
    getPracticeSetById,
    addQuestionToPracticeSet,
    getQuestionsByPracticeSet,
    updateQuestionInPracticeSet,
    deleteQuestionFromPracticeSet
} from '@/lib/firebase/firestore';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

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

const jsonExampleTF = `
{
  "questions": [
    {
      "text": "The Earth is flat.",
      "type": "True/False",
      "marks": 1,
      "options": [
        {"text": "True", "explanation": "This is incorrect. The Earth is an oblate spheroid."},
        {"text": "False", "explanation": "This is correct. Scientific evidence overwhelmingly shows the Earth is round."}
      ],
      "correctAnswer": "False",
      "explanation": "The Earth is roughly a sphere. Evidence includes satellite photos, the way ships disappear over the horizon, and the existence of different time zones."
    }
  ]
}
`;
const jsonExampleSA = `
{
  "questions": [
    {
      "text": "What is the chemical symbol for water?",
      "type": "Short Answer",
      "marks": 1,
      "correctAnswer": "H2O",
      "explanation": "Water is a chemical compound consisting of two hydrogen atoms and one oxygen atom."
    }
  ]
}
`;
const jsonExampleFIB = `
{
  "questions": [
    {
      "text": "The powerhouse of the cell is the ____.",
      "type": "Fill in the Blank",
      "marks": 1,
      "correctAnswer": "mitochondrion",
      "explanation": "Mitochondria are membrane-bound cell organelles that generate most of the chemical energy needed to power the cell's biochemical reactions."
    }
  ]
}
`;
const jsonExampleMatching = `
{
  "questions": [
    {
      "text": "Match the countries to their capitals.",
      "type": "Matching",
      "marks": 3,
      "correctAnswer": [
        { "a": "Japan", "b": "Tokyo" },
        { "a": "Canada", "b": "Ottawa" },
        { "a": "Australia", "b": "Canberra" }
      ],
      "explanation": "This tests knowledge of world geography and capital cities."
    }
  ]
}
`;

const QuestionForm = ({ form, onSubmit, isSubmitting }: { form: any, onSubmit: (data: QuestionFormValues) => void, isSubmitting: boolean }) => {
    const questionType = form.watch('type');
     const { fields: matchingPairFields, append: appendMatchingPair, remove: removeMatchingPair } = useFieldArray({
        control: form.control,
        name: `correctAnswer`
    });

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
                    <div className="space-y-4">
                        <FormLabel>Options</FormLabel>
                        <Controller
                            control={form.control}
                            name="correctAnswer"
                            render={({ field }) => (
                                <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-2">
                                    {[0, 1, 2, 3].map(optionIndex => (
                                        <div key={optionIndex} className="flex items-start gap-3">
                                            <FormControl className="mt-2.5">
                                                <RadioGroupItem value={form.getValues(`options.${optionIndex}.text`)} />
                                            </FormControl>
                                            <div className="flex-1 space-y-1">
                                                <FormField control={form.control} name={`options.${optionIndex}.text`} render={({ field: optionField }) => (
                                                    <Input {...optionField} placeholder={`Option ${optionIndex + 1}`} />
                                                )}/>
                                                 <FormField control={form.control} name={`options.${optionIndex}.explanation`} render={({ field: expField }) => (
                                                    <Textarea {...expField} placeholder={`Explanation (optional)`} className="text-xs" />
                                                )}/>
                                            </div>
                                        </div>
                                    ))}
                                </RadioGroup>
                            )}
                        />
                    </div>
                )}

                 {questionType === 'True/False' && (
                    <div className="space-y-4">
                        <FormField name="correctAnswer" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Correct Answer</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="True" /></FormControl><FormLabel>True</FormLabel></FormItem>
                                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="False" /></FormControl><FormLabel>False</FormLabel></FormItem>
                                    </RadioGroup>
                                </FormControl>
                            <FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="options.0.explanation" render={({ field }) => (<FormItem><FormLabel>Explanation for "True"</FormLabel><FormControl><Textarea {...field}/></FormControl></FormItem>)} />
                        <FormField control={form.control} name="options.1.explanation" render={({ field }) => (<FormItem><FormLabel>Explanation for "False"</FormLabel><FormControl><Textarea {...field}/></FormControl></FormItem>)} />
                    </div>
                )}
                
                {questionType === 'Matching' && (
                     <div className='space-y-4'>
                        <FormLabel>Matching Pairs</FormLabel>
                        <div className='grid grid-cols-[1fr_auto_1fr] items-center gap-2 font-semibold text-center'>
                            <div>Column A</div>
                            <div></div>
                            <div>Column B</div>
                        </div>
                        {matchingPairFields.map((pair, pairIndex) => (
                             <div key={pair.id} className="p-4 border rounded-lg space-y-3">
                                <div className="flex justify-between items-center">
                                    <FormLabel className="text-sm">Pair {pairIndex + 1}</FormLabel>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => removeMatchingPair(pairIndex)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </div>
                                <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-4">
                                    <FormField control={form.control} name={`correctAnswer.${pairIndex}.a`} render={({ field }) => <Input {...field} placeholder={`Item A${pairIndex + 1} Text`} />} />
                                    <GripVertical className="h-5 w-5 text-muted-foreground pt-2" />
                                     <FormField control={form.control} name={`correctAnswer.${pairIndex}.b`} render={({ field }) => <Input {...field} placeholder={`Item B${pairIndex + 1} Text`} />} />
                                </div>
                             </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => appendMatchingPair({ a: '', b: '' })}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Pair
                        </Button>
                    </div>
                )}

                {(questionType === 'Short Answer' || questionType === 'Fill in the Blank') && (
                    <FormField name="correctAnswer" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Correct Answer</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
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


export default function ManagePracticeSetQuestionsPage() {
    const params = useParams();
    const { toast } = useToast();

    const textbookId = params.bookId as string;
    const chapterId = params.chapterId as string;
    const topicId = params.topicId as string;
    const practiceSetId = params.practiceSetId as string;
    
    const [topic, setTopic] = useState<Topic | null>(null);
    const [practiceSet, setPracticeSet] = useState<PracticeSet | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const fetchData = async () => {
        if (!textbookId || !chapterId || !topicId || !practiceSetId) return;
        setLoading(true);

        const topicRef = doc(db, `textbooks/${textbookId}/chapters/${chapterId}/topics`, topicId);
        const topicSnap = await getDoc(topicRef);
        if (topicSnap.exists()) {
            setTopic({ id: topicSnap.id, ...topicSnap.data() } as Topic);
        }

        const fetchedPracticeSet = await getPracticeSetById(textbookId, chapterId, topicId, practiceSetId);
        setPracticeSet(fetchedPracticeSet as PracticeSet);

        const fetchedQuestions = await getQuestionsByPracticeSet(textbookId, chapterId, topicId, practiceSetId);
        setQuestions(fetchedQuestions as Question[]);

        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [textbookId, chapterId, topicId, practiceSetId]);

    const openQuestionDialog = (question: Question | null) => {
        setEditingQuestion(question);
        if (question) {
            form.reset({
                ...question,
                options: question.type === 'Multiple Choice' || question.type === 'True/False' ? question.options || [] : [{ text: '', explanation: '' }, { text: '', explanation: '' }, { text: '', explanation: '' }, { text: '', explanation: '' }],
                correctAnswer: question.correctAnswer || (question.type === 'Matching' ? [] : '')
            });
        } else {
            form.reset({
                text: '',
                type: 'Multiple Choice',
                marks: 1,
                options: [{ text: '', explanation: '' }, { text: '', explanation: '' }, { text: '', explanation: '' }, { text: '', explanation: '' }],
                correctAnswer: '',
                explanation: '',
            });
        }
        setIsQuestionDialogOpen(true);
    }
    
    const handleQuestionSubmit = async (data: QuestionFormValues) => {
        setIsSubmitting(true);
        try {
            if (editingQuestion) {
                await updateQuestionInPracticeSet(textbookId, chapterId, topicId, practiceSetId, editingQuestion.id, data);
                toast({ title: 'Question Updated' });
            } else {
                await addQuestionToPracticeSet(textbookId, chapterId, topicId, practiceSetId, data);
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
            await deleteQuestionFromPracticeSet(textbookId, chapterId, topicId, practiceSetId, questionId);
            toast({ title: 'Question Deleted' });
            fetchData();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: (error as Error).message });
        }
    }

    const processJsonImport = async (jsonText: string) => {
        try {
            const json = JSON.parse(jsonText);
            if (!json.questions || !Array.isArray(json.questions)) {
                throw new Error("JSON must have a top-level 'questions' array.");
            }
            
            // Basic validation for each question
            for (const q of json.questions) {
                const { success } = questionSchema.safeParse(q);
                if (!success) {
                    throw new Error(`A question in the JSON has an invalid structure.`);
                }
                await addQuestionToPracticeSet(textbookId, chapterId, topicId, practiceSetId, q);
            }
            
            toast({
              title: 'Import Successful!',
              description: `${json.questions.length} questions have been added.`,
            });
            fetchData();
            setIsImportDialogOpen(false);
            setJsonText('');
          } catch (error) {
            toast({
              variant: 'destructive',
              title: 'Import Failed',
              description: (error as Error).message,
            });
          } finally {
            setIsImporting(false);
          }
    }

    const handleBulkImportFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/json' && file.type !== 'text/plain') {
          toast({
            variant: 'destructive',
            title: 'Invalid File Type',
            description: 'Please upload a valid JSON or TXT file.',
          });
          return;
        }

        setIsImporting(true);
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          processJsonImport(text);
           if(importFileRef.current) {
                importFileRef.current.value = '';
            }
        };
        reader.readAsText(file);
      };
      
      const handleBulkImportFromText = () => {
        if (!jsonText.trim()) {
             toast({
                variant: "destructive",
                title: 'Import Failed',
                description: "Textbox cannot be empty."
            });
            return;
        }
        setIsImporting(true);
        processJsonImport(jsonText);
      }
    
    if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin" /></div>

    return (
        <div className="space-y-6">
            <div>
                <Button variant="ghost" asChild>
                    <Link href={`/admin/textbooks/${textbookId}/chapter/${chapterId}/topic/${topicId}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Topic
                    </Link>
                </Button>
            </div>
            <header>
                <h1 className="font-headline text-3xl font-bold">Practice Set: <span className="text-primary">{practiceSet?.title}</span></h1>
                <p className="text-muted-foreground mt-1">Topic: {topic?.title}</p>
            </header>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Questions</CardTitle>
                        <CardDescription>Manage the questions for this practice set.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" onClick={() => openQuestionDialog(null)}>
                            <PlusCircle className="mr-2"/> Add Question
                        </Button>
                        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                    <FileJson className="mr-2"/> Bulk Import
                                </Button>
                            </DialogTrigger>
                             <DialogContent className="sm:max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Bulk Import Questions</DialogTitle>
                                    <DialogDescription>
                                        Upload a JSON file or paste JSON text containing an array of questions.
                                    </DialogDescription>
                                </DialogHeader>
                                <Tabs defaultValue="upload" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="upload">Upload File</TabsTrigger>
                                        <TabsTrigger value="paste">Paste JSON</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="upload">
                                        <div className="py-4">
                                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                                <Label htmlFor="json-import">JSON/TXT File</Label>
                                                <Input id="json-import" type="file" accept=".json,.txt" onChange={handleBulkImportFromFile} ref={importFileRef} disabled={isImporting} />
                                                {isImporting && <p className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="animate-spin" /> Importing...</p>}
                                            </div>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="paste">
                                        <div className="py-4 space-y-4">
                                            <Textarea
                                                placeholder='Paste your JSON content here...'
                                                value={jsonText}
                                                onChange={(e) => setJsonText(e.target.value)}
                                                className="min-h-[200px] font-mono text-xs"
                                                disabled={isImporting}
                                            />
                                            <Button onClick={handleBulkImportFromText} disabled={isImporting || !jsonText.trim()}>
                                                {isImporting ? <><Loader2 className="animate-spin mr-2"/>Processing...</> : 'Import from Text'}
                                            </Button>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="item-1">
                                        <AccordionTrigger>View JSON Format Examples</AccordionTrigger>
                                        <AccordionContent>
                                        <p className="text-sm text-muted-foreground mb-4">Your JSON file should contain a single key "questions" which is an array of question objects.</p>
                                        <Tabs defaultValue="mcq" className="w-full">
                                            <TabsList className="h-auto flex-wrap justify-start">
                                            <TabsTrigger value="mcq">MCQ</TabsTrigger>
                                            <TabsTrigger value="tf">T/F</TabsTrigger>
                                            <TabsTrigger value="sa">Short Answer</TabsTrigger>
                                            <TabsTrigger value="fib">Fill in Blank</TabsTrigger>
                                            <TabsTrigger value="matching">Matching</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="mcq"><pre className="mt-2 w-full rounded-md bg-secondary p-4 whitespace-pre-wrap break-words text-sm">{jsonExample}</pre></TabsContent>
                                            <TabsContent value="tf"><pre className="mt-2 w-full rounded-md bg-secondary p-4 whitespace-pre-wrap break-words text-sm">{jsonExampleTF}</pre></TabsContent>
                                            <TabsContent value="sa"><pre className="mt-2 w-full rounded-md bg-secondary p-4 whitespace-pre-wrap break-words text-sm">{jsonExampleSA}</pre></TabsContent>
                                            <TabsContent value="fib"><pre className="mt-2 w-full rounded-md bg-secondary p-4 whitespace-pre-wrap break-words text-sm">{jsonExampleFIB}</pre></TabsContent>
                                            <TabsContent value="matching"><pre className="mt-2 w-full rounded-md bg-secondary p-4 whitespace-pre-wrap break-words text-sm">{jsonExampleMatching}</pre></TabsContent>
                                        </Tabs>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    {questions.length > 0 ? (
                        <ul className="space-y-2">
                            {questions.map(q => (
                                <li key={q.id} className="flex items-center justify-between p-3 border rounded-md">
                                    <p className="truncate pr-4">{q.text}</p>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => openQuestionDialog(q)}><Edit className="h-4 w-4"/></Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4"/></Button>
                                            </AlertDialogTrigger>
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
                    ) : (
                         <p className="text-muted-foreground text-center py-8">No questions added to this practice set yet.</p>
                    )}
                </CardContent>
            </Card>
            
             <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{editingQuestion ? 'Edit Question' : 'Add New Question'}</DialogTitle>
                        <DialogDescription>
                            Fill in the details for your question below.
                        </DialogDescription>
                    </DialogHeader>
                    <QuestionForm form={form} onSubmit={handleQuestionSubmit} isSubmitting={isSubmitting} />
                </DialogContent>
            </Dialog>
        </div>
    )
}
