
'use client';

import { useForm, SubmitHandler, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { addContent, getContentById } from '@/lib/firebase/firestore';
import { PlusCircle, Trash2, Loader2, Save, Sparkles, FileJson } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import type { Textbook, Chapter, Topic } from '@/lib/types';
import { generateDescription } from '@/ai/flows/ai-description-generator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';

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

const formSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().optional(),
  duration: z.coerce
    .number()
    .int()
    .min(0, 'Duration must be a positive number of minutes.').optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
  questions: z.array(questionSchema).optional(),
});

type FormValues = z.infer<typeof formSchema>;

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


export default function AddTextbookMockTestPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const textbookId = params.bookId as string;
  const chapterId = params.chapterId as string;
  const topicId = searchParams.get('topicId');
  
  const [textbook, setTextbook] = useState<Textbook | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  
  const importFileRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [jsonText, setJsonText] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      duration: 0,
      difficulty: 'Medium',
      questions: [],
    },
  });

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            const bookData = await getContentById(textbookId) as Textbook;
            setTextbook(bookData);

            const chapData = await getContentById(chapterId) as Chapter;
            setChapter(chapData);
            
            if (topicId) {
                const topicData = await getContentById(topicId) as Topic;
                setTopic(topicData);
            }
        } catch (error) {
             toast({ variant: "destructive", title: "Failed to load context", description: (error as Error).message });
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [textbookId, chapterId, topicId, toast]);

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'questions',
  });
  
  const questions = form.watch('questions');
  useEffect(() => {
    const totalMarks = questions?.reduce((total, q) => {
        if (q.type === 'Matching' && Array.isArray(q.correctAnswer)) {
            return total + (q.correctAnswer.length || 0);
        }
        return total + (q.marks || 1);
    }, 0) || 0;
    form.setValue('duration', totalMarks, { shouldValidate: true });
  }, [questions, form]);
  
    useEffect(() => {
    const aiQuestionsRaw = sessionStorage.getItem('aiGeneratedQuestions');
    if (aiQuestionsRaw) {
      try {
        const newQuestions = JSON.parse(aiQuestionsRaw);
        replace(newQuestions);
        toast({
            title: 'Questions Added!',
            description: 'AI-generated questions have been loaded into the form.',
        });
      } catch (error) {
        toast({
            variant: "destructive",
            title: 'Failed to load AI questions',
        });
      } finally {
          sessionStorage.removeItem('aiGeneratedQuestions');
      }
    }
  }, [replace, toast]);


  const handleFormSubmit = async (data: FormValues) => {
    try {
      const contentToSave: any = { 
        ...data, 
        testType: 'Mock Test',
        textbookId: textbookId,
        chapterId: chapterId,
        topicId: topicId,
        access: 'free', 
      };
      
      await addContent(contentToSave);
      toast({
        title: 'Mock Test Created!',
        description: `The test "${data.title}" has been successfully saved.`,
      });
      
      router.push(`/admin/textbooks/${textbookId}/chapter/${chapterId}`);

    } catch (error) {
       toast({
        variant: "destructive",
        title: 'Error Creating Mock Test',
        description: (error as Error).message,
      });
    }
  }

  const handleAIDescriptionGenerate = async () => {
    const title = form.getValues('title');
    if (!title) {
        toast({
            variant: "destructive",
            title: 'Title is required',
            description: 'Please enter a title before generating a description.',
        });
        return;
    }

    setIsGeneratingDesc(true);
    try {
        const source = `${title} - for chapter ${chapter?.title} in textbook ${textbook?.title}`;
        const result = await generateDescription({ source });
        form.setValue('description', result.description);
        toast({
            title: 'Description Generated!',
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: 'AI Generation Failed',
            description: (error as Error).message,
        });
    } finally {
      setIsGeneratingDesc(false);
    }
  };

    const processJsonImport = (jsonString: string) => {
        try {
            const parsed = JSON.parse(jsonString);
            const questionsToImport = parsed.questions || [];
            if(!Array.isArray(questionsToImport) || questionsToImport.length === 0){
                throw new Error("No 'questions' array found in JSON.");
            }
            append(questionsToImport);
            toast({ title: 'Import Successful', description: `${questionsToImport.length} questions added.` });
            setIsImportDialogOpen(false);
            setJsonText('');
        } catch (error) {
            toast({ variant: 'destructive', title: 'Import Failed', description: (error as Error).message });
        } finally {
            setIsImporting(false);
        }
    };
    
    const handleBulkImportFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setIsImporting(true);
        const reader = new FileReader();
        reader.onload = (e) => processJsonImport(e.target?.result as string);
        reader.readAsText(file);
    };

    const handleBulkImportFromText = () => {
        setIsImporting(true);
        processJsonImport(jsonText);
    };

    const backUrl = topicId 
        ? `/admin/textbooks/${textbookId}/chapter/${chapterId}/topic/${topicId}`
        : `/admin/textbooks/${textbookId}/chapter/${chapterId}`;

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">Add New Mock Test</h1>
                <p className="text-muted-foreground">
                    For: {textbook?.title} - {chapter?.title} {topic ? `- ${topic.title}` : ''}
                </p>
            </div>
             <Button asChild variant="outline">
                <Link href={backUrl}>
                    Back to {topicId ? 'Topic' : 'Chapter'}
                </Link>
            </Button>
        </div>


      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Mock Test Details</CardTitle>
              <CardDescription>
                Provide the essential information for your new mock test.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Chapter 1 Test - Physics" {...field} />
                    </FormControl>
                    <FormDescription>SEO Suggestion: {chapter?.title} Mock Test for {textbook?.title}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
                
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                        <FormLabel>Description / Summary</FormLabel>
                        <Button type="button" variant="outline" size="sm" onClick={handleAIDescriptionGenerate} disabled={!form.getValues('title') || isGeneratingDesc}>
                            <Sparkles className="mr-2 h-4 w-4"/> Generate with AI
                        </Button>
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder="Provide a brief description of the mock test."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration / Total Marks</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} readOnly disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value ?? 'Medium'}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a difficulty" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Easy">Easy</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
                <CardTitle>Questions</CardTitle>
                <CardDescription>Add questions to your mock test.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {fields.map((question, index) => {
                    return (
                        <Card key={question.id} className="p-4">
                            <div className="flex justify-between items-center mb-4 gap-4">
                                <h4 className="font-semibold text-lg whitespace-nowrap">Question {index + 1}</h4>
                                <FormField
                                    control={form.control}
                                    name={`questions.${index}.type`}
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select a question type" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Multiple Choice">Multiple Choice</SelectItem>
                                                    <SelectItem value="True/False">True/False</SelectItem>
                                                    <SelectItem value="Short Answer">Short Answer</SelectItem>
                                                    <SelectItem value="Fill in the Blank">Fill in the Blank</SelectItem>
                                                    <SelectItem value="Matching">Matching</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`questions.${index}.marks`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input type="number" placeholder="Marks" className="w-24" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Remove
                                </Button>
                            </div>
                             <div className="space-y-4">
                                  <FormField
                                      control={form.control}
                                      name={`questions.${index}.text`}
                                      render={({ field }) => (
                                          <FormItem>
                                              <FormLabel>Question Text</FormLabel>
                                              <FormControl>
                                                  <Input {...field} />
                                              </FormControl>
                                              <FormMessage />
                                          </FormItem>
                                      )}
                                  />
                                   {form.watch(`questions.${index}.type`) === 'Multiple Choice' && (
                                    <div className="space-y-4">
                                        <FormLabel>Options</FormLabel>
                                        <Controller
                                            control={form.control}
                                            name={`questions.${index}.correctAnswer`}
                                            render={({ field }) => (
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                                >
                                                    {[0, 1, 2, 3].map(optionIndex => (
                                                        <div key={optionIndex} className="flex items-start gap-4">
                                                            <FormControl>
                                                                <RadioGroupItem value={form.getValues(`questions.${index}.options.${optionIndex}.text`)} className="mt-2.5" />
                                                            </FormControl>
                                                            <div className="space-y-2 flex-1">
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`questions.${index}.options.${optionIndex}.text`}
                                                                    render={({ field: optionField }) => (
                                                                        <Input {...optionField} placeholder={`Option ${optionIndex + 1}`} />
                                                                    )}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </RadioGroup>
                                            )}
                                        />
                                    </div>
                                )}
                                {(form.watch(`questions.${index}.type`) === 'Short Answer' || form.watch(`questions.${index}.type`) === 'Fill in the Blank') && (
                                    <FormField
                                        control={form.control}
                                        name={`questions.${index}.correctAnswer`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Answer</FormLabel>
                                                <FormControl><Input {...field} placeholder="Enter the correct answer" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                                <FormField
                                    control={form.control}
                                    name={`questions.${index}.explanation`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Explanation</FormLabel>
                                            <FormControl><Textarea {...field} placeholder="Explain why the answer is correct." /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </Card>
                    );
                })}
            </CardContent>
            <CardFooter className="flex flex-wrap gap-4">
                <Button type="button" variant="outline" onClick={() => { append({ text: '', type: 'Multiple Choice', marks: 1, options: [ { text: '' }, { text: '' }, { text: '' }, { text: '' } ], correctAnswer: '' }); }}>
                    <PlusCircle className="mr-2" /> Add Question
                </Button>
                <Button asChild variant="outline">
                    <Link href={`/admin/add-content/add-ai-question?redirect=${encodeURIComponent(router.asPath)}`}>
                        <Sparkles className="mr-2 h-4 w-4" /> Add with AI
                    </Link>
                </Button>
                <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                    <DialogTrigger asChild>
                         <Button type="button" variant="outline">
                            <FileJson className="mr-2" />
                            Bulk Import
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Bulk Import Questions from JSON</DialogTitle>
                        </DialogHeader>
                        <Tabs defaultValue="paste">
                             <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="paste">Paste JSON</TabsTrigger>
                                <TabsTrigger value="upload">Upload File</TabsTrigger>
                            </TabsList>
                             <TabsContent value="paste" className="pt-4 space-y-2">
                                <Textarea value={jsonText} onChange={(e) => setJsonText(e.target.value)} className="min-h-[200px]" placeholder='Paste your JSON content here...' />
                                <Button onClick={handleBulkImportFromText} disabled={isImporting}>Import from Text</Button>
                             </TabsContent>
                              <TabsContent value="upload" className="pt-4 space-y-2">
                                <Input id="json-file" type="file" accept=".json" onChange={handleBulkImportFromFile} ref={importFileRef} />
                             </TabsContent>
                        </Tabs>
                        <Accordion type="single" collapsible>
                            <AccordionItem value="item-1">
                                <AccordionTrigger>View Example JSON</AccordionTrigger>
                                <AccordionContent>
                                    <pre className="mt-2 w-full rounded-md bg-secondary p-4 whitespace-pre-wrap text-sm">{jsonExample}</pre>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </DialogContent>
                </Dialog>
            </CardFooter>
          </Card>
          
           <div className="flex items-center gap-4">
                <Button 
                    type="submit"
                    disabled={form.formState.isSubmitting}
                >
                    <Save className="mr-2 h-4 w-4"/>
                    {form.formState.isSubmitting ? "Saving..." : "Save Mock Test"}
                </Button>
           </div>
        </form>
      </Form>
    </div>
  );
}
