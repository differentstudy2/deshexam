
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { PracticeSet, Question, Topic, Textbook, Chapter } from '@/lib/types';
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
    getPracticeSetById,
    addQuestionToPracticeSet,
    getQuestionsByPracticeSet,
    updateQuestionInPracticeSet,
    deleteQuestionFromPracticeSet
} from '@/lib/firebase/firestore';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/use-auth';
import { generateQuestions, AIQuestionGeneratorInput, AIQuestionGeneratorOutput } from '@/ai/flows/ai-question-generator';

const optionSchema = z.object({
  text: z.string().min(1, 'Option text cannot be empty.'),
  explanation: z.string().optional(),
});

const questionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, 'Question text cannot be empty.'),
  type: z.enum(['Multiple Choice', 'True/False', 'Short Answer', 'Fill in the Blank', 'Matching']),
  marks: z.coerce.number().int().positive('Marks must be a positive number.'),
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
                                <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[0, 1, 2, 3].map((optionIndex) => (
                                         <div key={optionIndex} className="flex items-start gap-4">
                                            <FormControl>
                                                <RadioGroupItem value={form.getValues(`options.${optionIndex}.text`)} id={`option-${optionIndex}-${form.getValues('id')}`} className="mt-2.5" />
                                            </FormControl>
                                            <div className="space-y-2 flex-1">
                                                <FormField
                                                    control={form.control}
                                                    name={`options.${optionIndex}.text`}
                                                    render={({ field: optionField }) => (
                                                        <Input {...optionField} placeholder={`Option ${optionIndex + 1}`} />
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`options.${optionIndex}.explanation`}
                                                    render={({ field: explanationField }) => (
                                                        <Textarea {...explanationField} placeholder={`Explanation for Option ${optionIndex + 1}`} />
                                                    )}
                                                />
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
                    <div className="space-y-4">
                        <FormField name="correctAnswer" control={form.control} render={({ field }) => (
                            <FormItem>
                                <FormLabel>Correct Answer</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4">
                                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="True" /></FormControl><Label>True</Label></FormItem>
                                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="False" /></FormControl><Label>False</Label></FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="options.0.explanation" render={({ field }) => (<FormItem><FormLabel>Explanation for "True"</FormLabel><FormControl><Textarea {...field}/></FormControl></FormItem>)} />
                            <FormField control={form.control} name="options.1.explanation" render={({ field }) => (<FormItem><FormLabel>Explanation for "False"</FormLabel><FormControl><Textarea {...field}/></FormControl></FormItem>)} />
                        </div>
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


const aiGeneratorFormSchema = z.object({
    sourceType: z.enum(['chapterContent', 'topic', 'text', 'file']),
    sourceTopic: z.string().optional(),
    sourceText: z.string().optional(),
    sourceFile: z.string().optional(),
    numQuestions: z.coerce.number().int().min(1).max(20),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']),
    questionType: z.enum(['Multiple Choice', 'True/False', 'Short Answer', 'Fill in the Blank', 'Matching', 'Any']),
}).refine(data => {
    if (data.sourceType === 'topic') return !!data.sourceTopic && data.sourceTopic.length >= 3;
    if (data.sourceType === 'text' || data.sourceType === 'chapterContent') return !!data.sourceText && data.sourceText.length >= 3;
    if (data.sourceType === 'file') return !!data.sourceFile && data.sourceFile.length >= 3;
    return false;
}, {
    message: 'Source content must be at least 3 characters.',
    path: ['sourceTopic'], 
});
type AIGeneratorFormValues = z.infer<typeof aiGeneratorFormSchema>;


export default function ManagePracticeSetQuestionsPage() {
    const params = useParams();
    const { toast } = useToast();
    const { user } = useAuth();

    const textbookId = params.bookId as string;
    const chapterId = params.chapterId as string;
    const topicId = params.topicId as string;
    const practiceSetId = params.practiceSetId as string;
    
    const [topic, setTopic] = useState<Topic | null>(null);
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [practiceSet, setPracticeSet] = useState<PracticeSet | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

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
          sourceType: 'chapterContent',
          sourceTopic: '',
          sourceText: '',
          sourceFile: '',
          numQuestions: 5,
          difficulty: 'Medium',
          questionType: 'Any',
        },
    });

    const fetchData = useCallback(async () => {
        if (!textbookId || !chapterId || !practiceSetId) return;
        setLoading(true);
        try {
            if (topicId) {
                const topicRef = doc(db, `textbooks/${textbookId}/chapters/${chapterId}/topics`, topicId);
                const topicSnap = await getDoc(topicRef);
                if(topicSnap.exists()) {
                    setTopic({ id: topicSnap.id, ...topicSnap.data() } as Topic);
                }
            }
            
            const chapterRef = doc(db, `textbooks/${textbookId}/chapters`, chapterId);
            const chapterSnap = await getDoc(chapterRef);
            if(chapterSnap.exists()) {
                const chapterData = { id: chapterSnap.id, ...chapterSnap.data() } as Chapter;
                setChapter(chapterData);
                aiForm.setValue('sourceText', chapterData.content || '');
            }


            const fetchedPracticeSet = await getPracticeSetById(textbookId, chapterId, topicId, practiceSetId);
            setPracticeSet(fetchedPracticeSet as PracticeSet);

            const fetchedQuestions = await getQuestionsByPracticeSet(textbookId, chapterId, topicId, practiceSetId);
            setQuestions(fetchedQuestions as Question[]);

        } catch (error) {
            toast({ variant: 'destructive', title: 'Error fetching data', description: (error as Error).message });
        } finally {
            setLoading(false);
        }
    }, [textbookId, chapterId, topicId, practiceSetId, toast, aiForm]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const openQuestionDialog = (question: Question | null) => {
        setEditingQuestion(question);
        if (question) {
            form.reset({
                ...question,
                 options: question.options || (question.type === 'Multiple Choice' ? [{text:'', explanation:''}, {text:'', explanation:''}, {text:'', explanation:''}, {text:'', explanation:''}] : question.type === 'True/False' ? [{text: 'True', explanation: ''}, {text: 'False', explanation: ''}] : []),
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
    
    const handleSelectQuestion = (questionId: string) => {
        setSelectedQuestions(prev => prev.includes(questionId) ? prev.filter(id => id !== questionId) : [...prev, questionId]);
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
            const deletePromises = selectedQuestions.map(id => deleteQuestionFromPracticeSet(textbookId, chapterId, topicId, practiceSetId, id));
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
                await addQuestionToPracticeSet(textbookId, chapterId, topicId, practiceSetId, q);
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
                         : aiData.sourceType === 'chapterContent' ? chapter?.content
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
                sourceType: (aiData.sourceType === 'file' || aiData.sourceType === 'chapterContent') ? 'text' : aiData.sourceType,
                source: source,
            };

            const result: AIQuestionGeneratorOutput = await generateQuestions(input);
            
            for(const q of result.questions) {
                await addQuestionToPracticeSet(textbookId, chapterId, topicId, practiceSetId, q);
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
                    <Link href={`/admin/textbooks/${textbookId}/chapter/${chapterId}/topic/${topicId}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Topic
                    </Link>
                </Button>
            </div>
            <header>
                <h1 className="font-headline text-3xl font-bold">Practice Set: <span className="text-primary">{practiceSet?.title}</span></h1>
                <p className="text-muted-foreground mt-1">Topic: {topic?.title || 'Chapter Level'}</p>
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
                                        <Tabs defaultValue="chapterContent" className="w-full" onValueChange={(value) => aiForm.setValue('sourceType', value as any)}>
                                            <TabsList className="grid w-full grid-cols-4">
                                                <TabsTrigger value="chapterContent">Chapter's Content</TabsTrigger>
                                                <TabsTrigger value="topic">Topic</TabsTrigger>
                                                <TabsTrigger value="text">Paste Text</TabsTrigger>
                                                <TabsTrigger value="file">From File</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="chapterContent" className="pt-4">
                                                <FormItem>
                                                    <FormLabel>Chapter Content</FormLabel>
                                                    <FormControl>
                                                        <Textarea readOnly value={chapter?.content || "No content available for this chapter."} className="min-h-[150px] bg-secondary"/>
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
                                                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="Easy">Easy</SelectItem>
                                                            <SelectItem value="Medium">Medium</SelectItem>
                                                            <SelectItem value="Hard">Hard</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                <FormMessage /></FormItem>
                                            )}/>
                                        </div>
                                        <FormField control={aiForm.control} name="questionType" render={({ field }) => (
                                            <FormItem><FormLabel>Question Type</FormLabel>
                                                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Any">Any</SelectItem>
                                                        <SelectItem value="Multiple Choice">Multiple Choice</SelectItem>
                                                        <SelectItem value="True/False">True/False</SelectItem>
                                                        <SelectItem value="Short Answer">Short Answer</SelectItem>
                                                        <SelectItem value="Fill in the Blank">Fill in the Blank</SelectItem>
                                                        <SelectItem value="Matching">Matching</SelectItem>
                                                    </SelectContent>
                                                </Select>
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
                                    <AccordionContent>
                                        <p className="text-sm text-muted-foreground mb-4">Your JSON file must contain a single key "questions" which is an array of question objects.</p>
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

    