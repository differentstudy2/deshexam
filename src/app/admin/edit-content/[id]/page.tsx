
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
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
import { getContentById, updateContent, getSubjects, getContentTypes, getBoards, getExamTypes, getChaptersBySubjectId, addChapter, addBoard, addExamType, addSubject, getExamsByCategory, addExam, uploadFile, getSettings, getClasses, addClass, getStates, addState, getGradesByClass } from '@/lib/firebase/firestore';
import { PlusCircle, Trash2, Loader2, Sparkles, FileText, Upload, GripVertical, Save, Image as ImageIcon, FileJson, Copy } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { generateDescription } from '@/ai/flows/ai-description-generator';
import { generateImage } from '@/ai/flows/ai-image-generator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';


// Schemas from add-content/page.tsx
const optionSchema = z.object({
  text: z.string().min(1, 'Option text cannot be empty.'),
  image: z.string().optional(),
  audio: z.string().optional(),
});

const matchingOptionSchema = z.object({
    a: z.string().min(1, 'Column A item cannot be empty.'),
    aImage: z.string().optional(),
    b: z.string().min(1, 'Column B item cannot be empty.'),
    bImage: z.string().optional(),
});

const questionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, 'Question text cannot be empty.'),
  image: z.string().optional(),
  audio: z.string().optional(),
  type: z.enum(['Multiple Choice', 'True/False', 'Short Answer', 'Fill in the Blank', 'Matching']),
  options: z.array(optionSchema).optional(),
  matchingOptions: z.object({
      columnA: z.array(z.object({ text: z.string(), image: z.string().optional() })),
      columnB: z.array(z.object({ text: z.string(), image: z.string().optional() })),
  }).optional(),
  correctAnswer: z.any().optional(),
  explanation: z.string().optional(),
});

// Main form schema adapted for edit page
const formSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty.'),
  board: z.string().optional(),
  classCategory: z.string().optional(),
  class: z.string().optional(),
  state: z.string().optional(),
  examCategory: z.string().optional(),
  exam: z.string().optional(),
  subject: z.string().optional(),
  chapter: z.string().optional(),
  school: z.string().optional(),
  semester: z.string().optional(),
  newSubject: z.string().optional(),
  newBoard: z.string().optional(),
  newClass: z.string().optional(),
  newState: z.string().optional(),
  newExamCategory: z.string().optional(),
  newExam: z.string().optional(),
  newChapterNo: z.string().optional(),
  newChapterName: z.string().optional(),
  testType: z.array(z.string()).min(1, { message: 'Please select at least one content type.'}),
  description: z.string().optional(),
  duration: z.coerce
    .number()
    .int()
    .min(0, 'Duration must be a positive number of minutes.').optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
  access: z.enum(['free', 'premium', 'pro']),
  price: z.coerce.number().optional(),
  subscriptionPlan: z.enum(['pass', 'pro']).optional(),
  questions: z.array(questionSchema).optional(),
});


type FormValues = z.infer<typeof formSchema>;
type Subject = { id: string, name: string };
type Board = { id: string, name: string };
type ClassCategory = { id: string, name: string };
type Grade = { id: string, name: string };
type State = { id: string, name: string };
type ExamType = { id: string, name: string };
type Exam = { id: string, name: string };
type Chapter = { id: string; chapterNo: string; chapterName: string };
type ContentType = { id: string, name: string };

// Copied from add-content
const ImageUploader = ({ fieldName, onUrlChange, value }: { fieldName: string, onUrlChange: (url: string) => void, value?: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [url, setUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [prompt, setPrompt] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            try {
                const downloadURL = await uploadFile(file);
                onUrlChange(downloadURL);
                setIsOpen(false);
            } catch (error) {
                console.error("Upload error:", error);
            } finally {
                setIsUploading(false);
            }
        }
    };
    
    const handleGenerate = async () => {
        if (!prompt) return;
        setIsGenerating(true);
        try {
            const result = await generateImage({ prompt });
            onUrlChange(result.imageUrl);
            setIsOpen(false);
        } catch (error) {
            console.error("AI Generation error:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" type="button"><ImageIcon className="mr-2 h-4 w-4" />Set Image</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Set Image</DialogTitle>
                        </DialogHeader>
                        <Tabs defaultValue="upload">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="upload">Upload</TabsTrigger>
                                <TabsTrigger value="url">From URL</TabsTrigger>
                                <TabsTrigger value="ai">Generate with AI</TabsTrigger>
                            </TabsList>
                            <TabsContent value="upload" className="pt-4">
                                <div 
                                    className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className="space-y-1 text-center">
                                        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                                        <p>Click to upload a file</p>
                                        <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                                    </div>
                                </div>
                                <Input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/gif" />
                                {isUploading && <div className="mt-2 flex items-center justify-center"><Loader2 className="animate-spin" /> Uploading...</div>}
                            </TabsContent>
                            <TabsContent value="url" className="pt-4 space-y-2">
                                <Label htmlFor="imageUrl">Image URL</Label>
                                <Input id="imageUrl" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/image.png" />
                                <Button type="button" onClick={() => { onUrlChange(url); setIsOpen(false); }}>Set URL</Button>
                            </TabsContent>
                            <TabsContent value="ai" className="pt-4 space-y-2">
                                 <Label htmlFor="aiPrompt">Image Prompt</Label>
                                <Input id="aiPrompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g., A majestic dragon soaring" />
                                <Button type="button" onClick={handleGenerate} disabled={isGenerating}>
                                    {isGenerating ? <><Loader2 className="animate-spin" /> Generating...</> : <><Sparkles /> Generate</>}
                                </Button>
                            </TabsContent>
                        </Tabs>
                    </DialogContent>
                </Dialog>
                {value && (
                    <Button variant="destructive" size="sm" type="button" onClick={() => onUrlChange('')}>
                        <Trash2 className="mr-2 h-4 w-4" /> Remove
                    </Button>
                )}
            </div>
            {value && <Image src={value} alt="Preview" width={80} height={80} className="w-20 h-20 object-cover mt-2 rounded-md" />}
        </div>
    );
};

// Copied from add-content
const MatchingPairsField = ({ control, questionIndex, setValue }: { control: any, questionIndex: number, setValue: any }) => {
    const { fields: matchingPairFields, append: appendMatchingPair, remove: removeMatchingPair } = useFieldArray({
        control: control,
        name: `questions.${questionIndex}.correctAnswer` as any,
    });

    const handleImageUrlChange = (pairIndex: number, field: 'aImage' | 'bImage', url: string) => {
        setValue(`questions.${questionIndex}.correctAnswer.${pairIndex}.${field}`, url);
    };

    return (
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
                        <div className="space-y-2">
                            <FormField control={control} name={`questions.${questionIndex}.correctAnswer.${pairIndex}.a`} render={({ field }) => <Input {...field} placeholder={`Item A${pairIndex + 1} Text`} value={field.value ?? ''} />} />
                            <Controller control={control} name={`questions.${questionIndex}.correctAnswer.${pairIndex}.aImage`} render={({ field }) => (
                                <>
                                  <ImageUploader fieldName={field.name} onUrlChange={(url) => handleImageUrlChange(pairIndex, 'aImage', url)} value={field.value} />
                                </>
                            )} />
                        </div>
                        <div className="pt-2">
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                             <FormField control={control} name={`questions.${questionIndex}.correctAnswer.${pairIndex}.b`} render={({ field }) => <Input {...field} placeholder={`Item B${pairIndex + 1} Text`} value={field.value ?? ''} />} />
                             <Controller control={control} name={`questions.${questionIndex}.correctAnswer.${pairIndex}.bImage`} render={({ field }) => (
                                <>
                                  <ImageUploader fieldName={field.name} onUrlChange={(url) => handleImageUrlChange(pairIndex, 'bImage', url)} value={field.value} />
                                </>
                            )} />
                        </div>
                    </div>
                 </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendMatchingPair({ a: '', aImage: '', b: '', bImage: '' })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Pair
            </Button>
        </div>
    );
};

const jsonExampleMCQ = `
{
  "questions": [
    {
      "text": "What is the capital of France?",
      "type": "Multiple Choice",
      "options": [
        { "text": "Berlin" },
        { "text": "Madrid" },
        { "text": "Paris" },
        { "text": "Rome" }
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
      "correctAnswer": "False",
      "explanation": "The Earth is roughly a sphere."
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



export default function EditContentPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const contentId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [classes, setClasses] = useState<ClassCategory[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [examCategories, setExamCategories] = useState<ExamType[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [isAddingNewSubject, setIsAddingNewSubject] = useState(false);
  const [isAddingNewBoard, setIsAddingNewBoard] = useState(false);
  const [isAddingNewClass, setIsAddingNewClass] = useState(false);
  const [isAddingNewState, setIsAddingNewState] = useState(false);
  const [isAddingNewExamCategory, setIsAddingNewExamCategory] = useState(false);
  const [isAddingNewExam, setIsAddingNewExam] = useState(false);
  const [isAddingNewChapter, setIsAddingNewChapter] = useState(false);

  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [jsonText, setJsonText] = useState('');

  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [uploadingAudioField, setUploadingAudioField] = useState<string | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      board: '',
      class: '',
      state: '',
      examCategory: '',
      exam: '',
      subject: '',
      chapter: '',
      school: '',
      semester: '',
      testType: [],
      description: '',
      duration: 0,
      difficulty: 'Medium',
      access: 'free',
      price: undefined,
      subscriptionPlan: 'pass',
      questions: [],
    },
  });

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
        return total + 1; // Each question is worth 1 mark/minute by default
    }, 0) || 0;
    form.setValue('duration', totalMarks, { shouldValidate: true });
  }, [questions, form]);


  useEffect(() => {
    const fetchContentAndMetadata = async () => {
      if (!contentId) return;
      try {
        setLoading(true);
        const [contentData, subjectData, contentTypeData, boardData, classData, stateData, examTypeData, siteSettings] = await Promise.all([
            getContentById(contentId),
            getSubjects(),
            getContentTypes(),
            getBoards(),
            getClasses(),
            getStates(),
            getExamTypes(),
            getSettings()
        ]);
        
        setSubjects(subjectData);
        setContentTypes(contentTypeData);
        setBoards(boardData);
        setClasses(classData);
        setStates(stateData);
        setExamCategories(examTypeData);

        if (contentData) {
            const testTypeArray = Array.isArray(contentData.testType) 
                ? contentData.testType 
                : (typeof contentData.testType === 'string' ? [contentData.testType] : []);

            const questionsWithDefaults = (contentData.questions || []).map((q: any) => ({
                ...q,
                options: q.options || (q.type === 'Multiple Choice' ? Array.from({length: 4}, () => ({ text: '', explanation: ''})) : q.type === 'True/False' ? [{text: 'True', explanation: ''}, {text: 'False', explanation: ''}] : []),
            }));
            
            form.reset({ ...contentData, testType: testTypeArray, questions: questionsWithDefaults });
            
            if (contentData.classCategory) {
                const fetchedGrades = await getGradesByClass(contentData.classCategory);
                setGrades(fetchedGrades);
            }
             if (contentData.subject) {
                const selectedSubject = subjectData.find(s => s.name === contentData.subject);
                if (selectedSubject) {
                    const fetchedChapters = await getChaptersBySubjectId(selectedSubject.id);
                    setChapters(fetchedChapters);
                }
            }
            if (contentData.examCategory) {
                const selectedExamCategory = examTypeData.find(e => e.name === contentData.examCategory);
                if (selectedExamCategory) {
                    const fetchedExams = await getExamsByCategory(selectedExamCategory.id);
                    setExams(fetchedExams);
                }
            }
        } else {
            throw new Error("Content not found");
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: 'Error fetching content data',
          description: (error as Error).message,
        });
        router.push('/admin/content');
      } finally {
        setLoading(false);
      }
    };
    fetchContentAndMetadata();
  }, [contentId, form, toast, router]);

   useEffect(() => {
    const aiQuestionsRaw = sessionStorage.getItem('aiGeneratedQuestions');
    if (aiQuestionsRaw) {
      try {
        const newQuestions = JSON.parse(aiQuestionsRaw);
        const existingQuestions = form.getValues('questions') || [];
        const combinedQuestions = [...existingQuestions, ...newQuestions.map((q: any) => ({
            ...q,
            options: q.options || (q.type === 'Multiple Choice' ? Array.from({length: 4}, () => ({ text: '', explanation: ''})) : q.type === 'True/False' ? [{text: 'True', explanation: ''}, {text: 'False', explanation: ''}] : []),
            explanation: q.explanation || ''
        }))];
        replace(combinedQuestions);
        toast({
            title: 'Questions Added!',
            description: `${newQuestions.length} AI-generated questions have been added.`,
        });
      } catch (error) {
        toast({
            variant: "destructive",
            title: 'Failed to load AI questions',
            description: 'The stored AI questions were corrupted.',
        });
      } finally {
          sessionStorage.removeItem('aiGeneratedQuestions');
      }
    }
  }, [replace, toast, form]);


  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
        let finalData = {...data};

        // Process matching questions
        const processedQuestions = data.questions?.map(q => {
            if (q.type === 'Matching' && q.correctAnswer && Array.isArray(q.correctAnswer)) {
                const correctAnswer = q.correctAnswer as { a: string, aImage?: string, b: string, bImage?: string }[];
                const columnA = correctAnswer.map(pair => ({ text: pair.a, image: pair.aImage }));
                let columnB = correctAnswer.map(pair => ({ text: pair.b, image: pair.bImage }));
                for (let i = columnB.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [columnB[i], columnB[j]] = [columnB[j], columnB[i]];
                }
                return { ...q, matchingOptions: { columnA, columnB } };
            }
            return q;
        });

        finalData = {...finalData, questions: processedQuestions};

      await updateContent(contentId, finalData);
      toast({
        title: 'Content Updated!',
        description: `The content "${data.title}" has been successfully updated.`,
      });
      router.push('/admin/content');
    } catch (error) {
       toast({
        variant: "destructive",
        title: 'Error Updating Content',
        description: (error as Error).message,
      });
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
        toast({ title: 'Copied to clipboard!' });
    }).catch(err => {
        toast({ variant: 'destructive', title: 'Failed to copy', description: 'Could not copy text to clipboard.' });
    });
  };

    const processJsonImport = (jsonString: string) => {
        try {
            const parsed = JSON.parse(jsonString);
            const questionsToImport = parsed.questions || [];
            
            if(!Array.isArray(questionsToImport)){
                throw new Error("The 'questions' key must be an array if it exists.");
            }
            
            if (questionsToImport.length > 0) {
                questionsToImport.forEach((q: any) => {
                    const { success, error } = questionSchema.safeParse(q);
                    if (!success) {
                        console.error("Invalid question structure:", q, error.flatten().fieldErrors);
                        throw new Error(`One or more questions have an invalid structure. Please check the format.`);
                    }
                });
                append(questionsToImport);
            }

            toast({ title: 'Import Successful!', description: `${questionsToImport.length} questions added.` });
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


  if (loading) {
    return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="ml-4 text-lg">Loading Content Editor...</p>
        </div>
    )
  }
  
  return (
    <div>
      <Input type="file" ref={audioInputRef} onChange={handleAudioFileChange} className="hidden" accept="audio/*" />
      <h1 className="font-headline text-3xl font-bold">Edit Content</h1>
      <p className="text-muted-foreground mb-6">
        Modify the details of your content below.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Content Details</CardTitle>
              <CardDescription>
                Provide the essential information for your content.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField control={form.control} name="title" render={({ field }) => ( <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
               <FormField
                    control={form.control}
                    name="testType"
                    render={() => (
                        <FormItem>
                        <FormLabel>Content Type(s)</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                            {contentTypes.map((item) => (
                            <FormField key={item.id} control={form.control} name="testType" render={({ field }) => {
                                return (
                                    <FormItem key={item.id} className="flex flex-row items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                            checked={field.value?.includes(item.name)}
                                            onCheckedChange={(checked) => {
                                                return checked
                                                ? field.onChange([...(field.value || []), item.name])
                                                : field.onChange(field.value?.filter((value) => value !== item.name))
                                            }}
                                            />
                                        </FormControl>
                                        <FormLabel className="font-normal">{item.name}</FormLabel>
                                    </FormItem>
                                )
                                }}
                            />
                            ))}
                        </div>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
          </Card>

            <Card>
              <CardHeader>
                  <CardTitle>Questions</CardTitle>
                  <CardDescription>Add or modify questions for your content.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                 {fields.map((question, index) => {
                      const questionType = form.watch(`questions.${index}.type`);

                      return (
                          <Card key={question.id} className="p-4">
                              <div className="flex justify-between items-center mb-4 gap-4">
                                  <h4 className="font-semibold text-lg whitespace-nowrap">Question {index + 1}</h4>
                                  <FormField control={form.control} name={`questions.${index}.type`} render={({ field }) => (
                                      <FormItem className="w-full"><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a question type" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Multiple Choice">Multiple Choice</SelectItem><SelectItem value="True/False">True/False</SelectItem><SelectItem value="Short Answer">Short Answer</SelectItem><SelectItem value="Fill in the Blank">Fill in the Blank</SelectItem><SelectItem value="Matching">Matching</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                                  )}/>
                                  <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}>
                                      <Trash2 className="mr-2 h-4 w-4" />Remove
                                  </Button>
                              </div>
                              <div className="space-y-4">
                                  <FormField control={form.control} name={`questions.${index}.text`} render={({ field }) => ( <FormItem><FormLabel>Question Text</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                  
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={form.control} name={`questions.${index}.image`} render={({ field }) => (<FormItem><FormLabel>Question Image</FormLabel><FormControl><ImageUploader fieldName={field.name} onUrlChange={(url) => form.setValue(`questions.${index}.image`, url, { shouldValidate: true })} value={field.value} /></FormControl><FormMessage /></FormItem>)}/>
                                        <FormField control={form.control} name={`questions.${index}.audio`} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Question Audio</FormLabel>
                                                <div className="flex items-center gap-2">
                                                    <Input {...field} placeholder="Audio URL" value={field.value ?? ''} />
                                                    <Button type="button" variant="outline" size="icon" onClick={() => handleAudioUploadClick(`questions.${index}.audio`)} disabled={isUploadingAudio}>{isUploadingAudio && uploadingAudioField === `questions.${index}.audio` ? <Loader2 className="animate-spin" /> : <Upload className="w-4 h-4" />}</Button>
                                                    {!!field.value && (<Button type="button" variant="destructive" size="icon" onClick={() => form.setValue(`questions.${index}.audio`, '')}><Trash2 className="w-4 h-4" /></Button>)}
                                                </div>
                                                {!!field.value && <audio controls src={field.value} className="w-full mt-2" />}
                                                <FormMessage />
                                            </FormItem>
                                        )}/>
                                    </div>

                                  {questionType === 'Multiple Choice' && (
                                      <div className="space-y-4">
                                          <FormLabel>Options</FormLabel>
                                          <Controller control={form.control} name={`questions.${index}.correctAnswer`} render={({ field }) => (
                                              <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                  {[0, 1, 2, 3].map(optionIndex => (
                                                      <div key={optionIndex} className="flex items-start gap-4">
                                                          <FormControl><RadioGroupItem value={form.getValues(`questions.${index}.options.${optionIndex}.text`)} className="mt-2.5" /></FormControl>
                                                           <div className="space-y-2 flex-1">
                                                              <FormField control={form.control} name={`questions.${index}.options.${optionIndex}.text`} render={({ field: optionField }) => (<Input {...optionField} placeholder={`Option ${optionIndex + 1}`} /> )}/>
                                                              <div className="grid grid-cols-2 gap-2">
                                                                    <FormField control={form.control} name={`questions.${index}.options.${optionIndex}.image`} render={({ field: imageField }) => (<FormItem><FormLabel className="text-xs">Image</FormLabel><FormControl><ImageUploader fieldName={imageField.name} onUrlChange={(url) => form.setValue(`questions.${index}.options.${optionIndex}.image`, url)} value={imageField.value} /></FormControl></FormItem>)}/>
                                                                    <FormField control={form.control} name={`questions.${index}.options.${optionIndex}.audio`} render={({ field: audioField }) => (
                                                                        <FormItem>
                                                                            <FormLabel className="text-xs">Audio</FormLabel>
                                                                            <div className="flex items-center gap-2">
                                                                                <Input {...audioField} placeholder="Audio URL" value={audioField.value ?? ''} />
                                                                                <Button type="button" variant="outline" size="icon" onClick={() => handleAudioUploadClick(`questions.${index}.options.${optionIndex}.audio`)} disabled={isUploadingAudio}>{isUploadingAudio && uploadingAudioField === `questions.${index}.options.${optionIndex}.audio` ? <Loader2 className="animate-spin" /> : <Upload className="w-4 h-4" />}</Button>
                                                                                {!!audioField.value && (<Button type="button" variant="destructive" size="icon" onClick={() => form.setValue(`questions.${index}.options.${optionIndex}.audio`, '')}><Trash2 className="w-4 h-4" /></Button>)}
                                                                            </div>
                                                                        </FormItem>
                                                                    )}/>
                                                                </div>
                                                                {form.getValues(`questions.${index}.options.${optionIndex}.audio`) && (<audio controls src={form.getValues(`questions.${index}.options.${optionIndex}.audio`)} className="w-full mt-2" /> )}
                                                          </div>
                                                      </div>
                                                  ))}
                                              </RadioGroup>
                                          )}/>
                                          <FormMessage>{form.formState.errors.questions?.[index]?.correctAnswer?.message}</FormMessage>
                                      </div>
                                  )}
                                  {questionType === 'True/False' && (
                                      <FormField control={form.control} name={`questions.${index}.correctAnswer`} render={({ field }) => (
                                          <FormItem><FormLabel>Correct Answer</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="True" /></FormControl><FormLabel>True</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="False" /></FormControl><FormLabel>False</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>
                                      )}/>
                                  )}
                                  {questionType === 'Matching' && ( <MatchingPairsField control={form.control} questionIndex={index} setValue={form.setValue} /> )}
                                  {(questionType === 'Short Answer' || questionType === 'Fill in the Blank') && (
                                      <FormField control={form.control} name={`questions.${index}.correctAnswer`} render={({ field }) => (<FormItem><FormLabel>Answer</FormLabel><FormControl><Input {...field} placeholder="Enter the correct answer" /></FormControl><FormMessage /></FormItem>)}/>
                                  )}

                                  <FormField control={form.control} name={`questions.${index}.explanation`} render={({ field }) => (<FormItem><FormLabel>General Explanation</FormLabel><FormControl><Textarea {...field} placeholder="Explain why the correct answer is right." /></FormControl><FormMessage /></FormItem>)}/>
                              </div>
                          </Card>
                      );
                  })}
              </CardContent>
              <CardFooter className="flex flex-wrap gap-4">
                  <Button type="button" variant="outline" onClick={() => append({ text: '', type: 'Multiple Choice', options: Array.from({length: 4}, () => ({text: ''})), correctAnswer: '', explanation: '' })}>
                      <PlusCircle className="mr-2" />Add Question Manually
                  </Button>
                   <Button asChild variant="outline">
                        <Link href={`/admin/edit-content/${contentId}/add-ai-question`}>
                            <Sparkles className="mr-2 h-4 w-4" />Add Questions with AI
                        </Link>
                    </Button>
                    <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                        <DialogTrigger asChild>
                            <Button type="button" variant="outline"><FileJson className="mr-2" />Bulk Import from JSON</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Bulk Import Quiz Questions</DialogTitle>
                                <DialogDescription>
                                    Upload a JSON file or paste JSON text. The content will be appended to the current question list.
                                </DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="max-h-[60vh] pr-6">
                                <Tabs defaultValue="paste">
                                    <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="paste">Paste JSON</TabsTrigger><TabsTrigger value="upload">Upload File</TabsTrigger></TabsList>
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
                                        <AccordionTrigger>View Example JSON Formats</AccordionTrigger>
                                        <AccordionContent>
                                            <p className="text-sm text-muted-foreground mb-4">Your JSON file must contain a `questions` array. Each question should follow the specified format for its type.</p>
                                            <Tabs defaultValue="mcq" className="w-full">
                                                <TabsList className="h-auto flex-wrap justify-start">
                                                    <TabsTrigger value="mcq">MCQ</TabsTrigger>
                                                    <TabsTrigger value="tf">T/F</TabsTrigger>
                                                    <TabsTrigger value="sa">Short Answer</TabsTrigger>
                                                    <TabsTrigger value="fib">Fill Blank</TabsTrigger>
                                                    <TabsTrigger value="matching">Matching</TabsTrigger>
                                                </TabsList>
                                                <TabsContent value="mcq"><div className="relative mt-2"><Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => handleCopy(jsonExampleMCQ)}><Copy className="h-4 w-4" /><span className="sr-only">Copy</span></Button><ScrollArea className="h-64 rounded-md border bg-secondary p-4"><pre className="whitespace-pre-wrap break-words text-sm">{jsonExampleMCQ}</pre></ScrollArea></div></TabsContent>
                                                <TabsContent value="tf"><div className="relative mt-2"><Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => handleCopy(jsonExampleTF)}><Copy className="h-4 w-4" /><span className="sr-only">Copy</span></Button><ScrollArea className="h-64 rounded-md border bg-secondary p-4"><pre className="whitespace-pre-wrap break-words text-sm">{jsonExampleTF}</pre></ScrollArea></div></TabsContent>
                                                <TabsContent value="sa"><div className="relative mt-2"><Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => handleCopy(jsonExampleSA)}><Copy className="h-4 w-4" /><span className="sr-only">Copy</span></Button><ScrollArea className="h-64 rounded-md border bg-secondary p-4"><pre className="whitespace-pre-wrap break-words text-sm">{jsonExampleSA}</pre></ScrollArea></div></TabsContent>
                                                <TabsContent value="fib"><div className="relative mt-2"><Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => handleCopy(jsonExampleFIB)}><Copy className="h-4 w-4" /><span className="sr-only">Copy</span></Button><ScrollArea className="h-64 rounded-md border bg-secondary p-4"><pre className="whitespace-pre-wrap break-words text-sm">{jsonExampleFIB}</pre></ScrollArea></div></TabsContent>
                                                <TabsContent value="matching"><div className="relative mt-2"><Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => handleCopy(jsonExampleMatching)}><Copy className="h-4 w-4" /><span className="sr-only">Copy</span></Button><ScrollArea className="h-64 rounded-md border bg-secondary p-4"><pre className="whitespace-pre-wrap break-words text-sm">{jsonExampleMatching}</pre></ScrollArea></div></TabsContent>
                                            </Tabs>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </ScrollArea>
                        </DialogContent>
                    </Dialog>
              </CardFooter>
            </Card>

            <div className="flex items-center gap-4">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    <Save className="mr-2 h-4 w-4"/>{form.formState.isSubmitting ? "Updating..." : "Update Content"}
                </Button>
            </div>
            </form>
        </Form>
    </div>
  );
}
