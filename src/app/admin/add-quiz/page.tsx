
'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { addContent, uploadFile, getSubjects, getBoards, getExamTypes, getClasses, getStates, getGradesByClass, getExamsByCategory } from '@/lib/firebase/firestore';
import { Loader2, Sparkles, PlusCircle, Trash2, Upload, FileJson } from 'lucide-react';
import { useState, useRef, useEffect, Suspense } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { ImageUploader } from '@/components/feature/image-uploader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';


const quizQuestionSchema = z.object({
  text: z.string().min(1, 'Question text cannot be empty.'),
  image: z.string().optional(),
  audio: z.string().optional(),
  options: z.array(z.object({ 
    text: z.string().min(1, "Option text cannot be empty."),
    image: z.string().optional(),
    audio: z.string().optional(),
  })).min(4).max(4),
  correctAnswer: z.string().min(1, "Please select a correct answer."),
  explanation: z.string().optional(),
  marks: z.coerce.number().int().min(1).default(1),
});

const formSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().optional(),
  featureImage: z.string().optional(),
  questions: z.array(quizQuestionSchema).optional(),
  subject: z.string().optional(),
  board: z.string().optional(),
  classCategory: z.string().optional(),
  class: z.string().optional(),
  state: z.string().optional(),
  examCategory: z.string().optional(),
  exam: z.string().optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).default('Medium'),
  access: z.enum(['free', 'premium', 'pro']).default('free'),
  price: z.coerce.number().optional(),
  subscriptionPlan: z.enum(['pass', 'pro']).optional(),
});


type FormValues = z.infer<typeof formSchema>;
type Subject = { id: string, name: string };
type Board = { id: string, name: string };
type ClassCategory = { id: string, name: string };
type Grade = { id: string, name: string };
type State = { id: string, name: string };
type ExamType = { id: string, name: string };
type Exam = { id: string, name: string };

const ContentTypeNavigation = () => {
    const pathname = usePathname();
  
    const navItems = [
      { name: 'Mock Test', href: '/admin/add-content' },
      { name: 'Quiz', href: '/admin/add-quiz' },
      { name: 'Practice Questions', href: '/admin/add-practice-questions' },
      { name: 'Exam', href: '/admin/add-exam' },
      { name: 'Learn Article', href: '/admin/add-article' },
      { name: 'Textbook', href: '/admin/textbooks/add' },
    ];

    return (
        <div className="mb-6 flex flex-wrap items-center gap-1 rounded-lg bg-muted p-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
                )}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      );
}

function AddQuizForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAudioField, setUploadingAudioField] = useState<string | null>(null);

  const [isImporting, setIsImporting] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const importFileRef = useRef<HTMLInputElement>(null);
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [classCategories, setClassCategories] = useState<ClassCategory[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [examCategories, setExamCategories] = useState<ExamType[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loadingMetadata, setLoadingMetadata] = useState(true);

  const jsonExample = `
{
  "questions": [
    {
      "text": "Which animal says 'Moo'?",
      "image": "https://picsum.photos/seed/cow-image/400/225",
      "audio": "https://example.com/sounds/cow_question.mp3",
      "options": [
        { "text": "Cow", "image": "https://picsum.photos/seed/cow-option/100/100" },
        { "text": "Dog", "image": "https://picsum.photos/seed/dog-option/100/100" },
        { "text": "Cat", "image": "https://picsum.photos/seed/cat-option/100/100" },
        { "text": "Duck", "image": "https://picsum.photos/seed/duck-option/100/100" }
      ],
      "correctAnswer": "Cow",
      "marks": 1,
      "explanation": "Cows are known for making a 'moo' sound."
    }
  ]
}
`;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      featureImage: '',
      questions: [],
    },
  });
  
  const selectedClassCategory = form.watch('classCategory');
  const selectedExamCategory = form.watch('examCategory');

  useEffect(() => {
    const fetchMetadata = async () => {
        setLoadingMetadata(true);
        try {
             const [subjectData, boardData, classData, stateData, examTypeData] = await Promise.all([
                getSubjects(), getBoards(), getClasses(), getStates(), getExamTypes()
            ]);
            setSubjects(subjectData);
            setBoards(boardData);
            setClassCategories(classData);
            setStates(stateData);
            setExamCategories(examTypeData);
        } catch (error) {
             toast({ variant: 'destructive', title: "Failed to load metadata", description: (error as Error).message });
        } finally {
            setLoadingMetadata(false);
        }
    };
    fetchMetadata();
  }, [toast]);
  
  useEffect(() => {
    const fetchGrades = async () => {
      if (selectedClassCategory) {
        const fetchedGrades = await getGradesByClass(selectedClassCategory);
        setGrades(fetchedGrades);
      } else {
        setGrades([]);
      }
    };
    fetchGrades();
  }, [selectedClassCategory]);
  
   useEffect(() => {
    const fetchExams = async () => {
      if (selectedExamCategory) {
        const fetchedExams = await getExamsByCategory(selectedExamCategory);
        setExams(fetchedExams);
      } else {
        setExams([]);
      }
    };
    fetchExams();
  }, [selectedExamCategory]);


  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'questions',
  });

  const processJsonImport = (jsonString: string) => {
    try {
        const parsed = JSON.parse(jsonString);
        const questionsToImport = parsed.questions || [];
        if(!Array.isArray(questionsToImport) || questionsToImport.length === 0){
            throw new Error("No valid 'questions' array found in the JSON.");
        }
        
        questionsToImport.forEach((q: any) => {
            const { success } = quizQuestionSchema.safeParse(q);
            if (!success) {
                console.error("Invalid question structure:", q, quizQuestionSchema.safeParse(q));
                throw new Error(`One or more questions have an invalid structure. Please check the format.`);
            }
        });

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
    if (importFileRef.current) importFileRef.current.value = '';
  };
      
  const handleBulkImportFromText = () => {
    if (!jsonText.trim()) { 
        toast({ variant: "destructive", title: 'Import Failed', description: "Textbox cannot be empty."}); 
        return; 
    }
    setIsImporting(true);
    processJsonImport(jsonText);
  }

  const handleFormSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const contentToSave: any = {
        ...data,
        testType: 'Quiz',
      };

      await addContent(contentToSave);
      toast({
        title: 'Quiz Created!',
        description: `The quiz "${data.title}" has been successfully saved.`,
      });
      
      form.reset();

    } catch (error) {
       toast({
        variant: "destructive",
        title: 'Error Creating Quiz',
        description: (error as Error).message,
      });
    } finally {
        setIsSubmitting(false);
    }
  }

  const handleAudioUploadClick = (fieldName: string) => {
    setUploadingAudioField(fieldName);
    audioInputRef.current?.click();
  };

  const handleAudioFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadingAudioField) {
        setIsUploadingAudio(true);
        try {
            const downloadURL = await uploadFile(file);
            form.setValue(uploadingAudioField as any, downloadURL, { shouldValidate: true });
            toast({ title: 'Audio uploaded!' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Upload Failed', description: (error as Error).message });
        } finally {
            setIsUploadingAudio(false);
            setUploadingAudioField(null);
            if(audioInputRef.current) audioInputRef.current.value = '';
        }
    }
  };
  
  if (loadingMetadata) {
      return (
          <div className="flex items-center justify-center h-full">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <p className="ml-4 text-lg">Loading Form Data...</p>
          </div>
      )
  }
  
  return (
    <div>
      <h1 className="font-headline text-3xl font-bold">Add New Quiz</h1>
      <p className="text-muted-foreground mb-6">
          Create a new quiz with questions, images, and audio.
      </p>
      <ContentTypeNavigation />
        
      <Input type="file" ref={audioInputRef} onChange={handleAudioFileChange} className="hidden" accept="audio/*" />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Quiz Details</CardTitle>
                <CardDescription>
                  Provide the essential information for your new quiz.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField control={form.control} name="title" render={({ field }) => ( <FormItem> <FormLabel>Title</FormLabel> <FormControl> <Input placeholder="e.g., Fun Animal Sounds Quiz" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Description</FormLabel> <FormControl> <Input placeholder="A fun quiz about identifying animal sounds!" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="featureImage" render={({ field }) => ( <FormItem> <FormLabel>Feature Image</FormLabel> <FormControl> <ImageUploader fieldName={field.name} onUrlChange={(url) => form.setValue('featureImage', url, { shouldValidate: true })} value={field.value} /> </FormControl> <FormMessage /> </FormItem> )}/>
              </CardContent>
            </Card>
                
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-medium">Quiz Questions</h3>
                </CardHeader>
                <CardContent className="space-y-6">
                    {fields.map((question, index) => (
                        <Card key={question.id} className="p-4 bg-secondary/50">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-semibold">Question {index + 1}</h4>
                                <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </div>
                            <div className="space-y-4">
                                <FormField control={form.control} name={`questions.${index}.text`} render={({ field }) => (<FormItem><FormLabel>Question Text</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name={`questions.${index}.image`} render={({ field }) => (<FormItem><FormLabel>Question Image</FormLabel><FormControl><ImageUploader fieldName={field.name} onUrlChange={(url) => form.setValue(`questions.${index}.image`, url)} value={field.value}/></FormControl><FormMessage /></FormItem>)}/>
                                    <FormField control={form.control} name={`questions.${index}.audio`} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Question Audio</FormLabel>
                                            <FormControl>
                                                <div className="flex items-center gap-2">
                                                    <Input {...field} placeholder="Audio URL" value={field.value ?? ''} />
                                                    <Button type="button" variant="outline" size="icon" onClick={() => handleAudioUploadClick(`questions.${index}.audio`)} disabled={isUploadingAudio}>
                                                        {isUploadingAudio && uploadingAudioField === `questions.${index}.audio` ? <Loader2 className="animate-spin" /> : <Upload className="w-4 h-4" />}
                                                    </Button>
                                                    {!!field.value && (
                                                        <Button type="button" variant="destructive" size="icon" onClick={() => form.setValue(`questions.${index}.audio`, '')}>
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </FormControl>
                                            {!!field.value && <audio controls src={field.value} className="w-full mt-2" />}
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                </div>
                                
                                <div className="space-y-4 pt-2 border-t">
                                    <Label>Options</Label>
                                    <Controller
                                        control={form.control}
                                        name={`questions.${index}.correctAnswer`}
                                        render={({ field }) => (
                                            <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {[0, 1, 2, 3].map(optionIndex => (
                                                    <Card key={optionIndex} className="p-4 bg-background">
                                                        <div className="space-y-4">
                                                            <div className="flex items-center gap-3">
                                                                <FormControl>
                                                                    <RadioGroupItem value={form.watch(`questions.${index}.options.${optionIndex}.text`)} disabled={!form.watch(`questions.${index}.options.${optionIndex}.text`)} />
                                                                </FormControl>
                                                                <FormField control={form.control} name={`questions.${index}.options.${optionIndex}.text`} render={({ field }) => (
                                                                    <FormItem className="flex-1">
                                                                        <FormLabel className="sr-only">Option {optionIndex + 1} Text</FormLabel>
                                                                        <FormControl><Input {...field} /></FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}/>
                                                            </div>
                                                            
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <FormField control={form.control} name={`questions.${index}.options.${optionIndex}.image`} render={({ field: imageField }) => (
                                                                    <FormItem><FormLabel className="text-xs">Image</FormLabel><FormControl><ImageUploader fieldName={imageField.name} onUrlChange={(url) => form.setValue(`questions.${index}.options.${optionIndex}.image`, url)} value={imageField.value} /></FormControl><FormMessage /></FormItem>
                                                                )}/>
                                                                <FormField control={form.control} name={`questions.${index}.options.${optionIndex}.audio`} render={({ field: audioField }) => (
                                                                    <FormItem>
                                                                        <FormLabel className="text-xs">Audio</FormLabel>
                                                                        <FormControl>
                                                                            <div className="flex items-center gap-2">
                                                                                <Input {...audioField} placeholder="Audio URL" value={audioField.value ?? ''} />
                                                                                <Button type="button" variant="outline" size="icon" onClick={() => handleAudioUploadClick(`questions.${index}.options.${optionIndex}.audio`)} disabled={isUploadingAudio}>
                                                                                    {isUploadingAudio && uploadingAudioField === `questions.${index}.options.${optionIndex}.audio` ? <Loader2 className="animate-spin" /> : <Upload className="w-4 h-4" />}
                                                                                </Button>
                                                                                {!!audioField.value && (
                                                                                    <Button type="button" variant="destructive" size="icon" onClick={() => form.setValue(`questions.${index}.options.${optionIndex}.audio`, '')}>
                                                                                        <Trash2 className="w-4 h-4" />
                                                                                    </Button>
                                                                                )}
                                                                            </div>
                                                                        </FormControl>
                                                                        {!!audioField.value && <audio controls src={audioField.value} className="w-full mt-2" />}
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}/>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                ))}
                                            </RadioGroup>
                                        )}
                                    />
                                    <FormMessage>{form.formState.errors.questions?.[index]?.correctAnswer?.message}</FormMessage>
                                </div>
                                <FormField
                                    control={form.control}
                                    name={`questions.${index}.explanation`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Explanation (Optional)</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} placeholder="Explain why the correct answer is right." />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`questions.${index}.marks`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Marks</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </Card>
                    ))}
                    <div className="flex flex-wrap gap-4">
                        <Button type="button" variant="outline" onClick={() => append({ text: '', options: [{text: ''}, {text: ''}, {text: ''}, {text: ''}], correctAnswer: '', marks: 1, explanation: '' })}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Question
                        </Button>
                        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                            <DialogTrigger asChild>
                                <Button type="button" variant="outline"><FileJson className="mr-2 h-4 w-4" /> Bulk Import</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-xl">
                                <DialogHeader>
                                    <DialogTitle>Bulk Import Quiz Questions</DialogTitle>
                                    <DialogDescription>
                                        Upload a JSON file or paste JSON text containing an array of questions.
                                    </DialogDescription>
                                </DialogHeader>
                                <Tabs defaultValue="paste">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="paste">Paste JSON</TabsTrigger>
                                        <TabsTrigger value="upload">Upload File</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="paste" className="pt-4 space-y-4">
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
                                    </TabsContent>
                                    <TabsContent value="upload" className="pt-4">
                                        <div className="grid w-full max-w-sm items-center gap-1.5">
                                            <Label htmlFor="json-import">JSON/TXT File</Label>
                                            <Input id="json-import" type="file" accept=".json,.txt" onChange={handleBulkImportFromFile} ref={importFileRef} disabled={isImporting} />
                                            {isImporting && <p className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="animate-spin" /> Importing...</p>}
                                        </div>
                                    </TabsContent>
                                </Tabs>
                                <Accordion type="single" collapsible className="w-full mt-4">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>View Example JSON Format</AccordionTrigger>
                                    <AccordionContent>
                                    <pre className="mt-2 w-full rounded-md bg-secondary p-4 whitespace-pre-wrap break-words text-sm">{jsonExample}</pre>
                                    </AccordionContent>
                                </AccordionItem>
                                </Accordion>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
            </Card>
          <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Quiz"}
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default function AddQuizPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AddQuizForm />
        </Suspense>
    )
}
