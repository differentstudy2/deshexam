

'use client';

import { useEffect, useState, useRef } from 'react';
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
import { getContentById, updateContent, getSubjects, getContentTypes, getBoards, getExamTypes, getChaptersBySubjectId, addChapter, addBoard, addExamType, addSubject, getExamsByCategory, addExam, uploadFile } from '@/lib/firebase/firestore';
import { PlusCircle, Trash2, Loader2, Sparkles, FileText, Upload, GripVertical, Save, Image as ImageIcon } from 'lucide-react';
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
import { generateQuestions, AIQuestionGeneratorInput, AIQuestionGeneratorOutput } from '@/ai/flows/ai-question-generator';
import { generateDescription } from '@/ai/flows/ai-description-generator';
import { generateImage } from '@/ai/flows/ai-image-generator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
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
  title: z.string().min(1, 'Title cannot be empty.'),
  board: z.string().optional(),
  examCategory: z.string().optional(),
  exam: z.string().optional(),
  subject: z.string().optional(),
  chapter: z.string().optional(),
  newSubject: z.string().optional(),
  newBoard: z.string().optional(),
  newExamCategory: z.string().optional(),
  newExam: z.string().optional(),
  newChapterNo: z.string().optional(),
  newChapterName: z.string().optional(),
  testType: z.string().min(1, 'Please select a content type.'),
  description: z.string().optional(),
  duration: z.coerce
    .number()
    .int()
    .positive('Duration must be a positive number of minutes.').optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
  access: z.enum(['free', 'premium', 'pro']),
  price: z.coerce.number().optional(),
  subscriptionPlan: z.enum(['pass', 'pro']).optional(),
  questions: z.array(questionSchema).optional(),
});

const aiGeneratorFormSchema = z.object({
    sourceType: z.enum(['topic', 'text', 'file']),
    source: z.string().min(3, 'Source must be at least 3 characters.'),
    numQuestions: z.coerce.number().int().min(1).max(20),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']),
    questionType: z.enum(['Multiple Choice', 'True/False', 'Short Answer', 'Fill in the Blank', 'Matching', 'Any']),
});
type AIGeneratorFormValues = z.infer<typeof aiGeneratorFormSchema>;

type FormValues = z.infer<typeof formSchema>;
type ContentType = { id: string, name: string };
type Subject = { id: string, name: string };
type Board = { id: string, name: string };
type ExamType = { id: string, name: string };
type Exam = { id: string, name: string };
type Chapter = { id: string; chapterNo: string; chapterName: string };

const ImageUploader = ({ fieldName, onUrlChange }: { fieldName: string, onUrlChange: (url: string) => void }) => {
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
                        <Input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
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
                            {isGenerating ? <><Loader2 className="animate-spin" /> Generating...</> : "Generate"}
                        </Button>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

const MatchingPairsField = ({ control, questionIndex }: { control: any, questionIndex: number }) => {
  const { fields: matchingPairFields, append: appendMatchingPair, remove: removeMatchingPair } = useFieldArray({
      control: control,
      name: `questions.${questionIndex}.correctAnswer` as any,
  });

  const handleImageUrlChange = (pairIndex: number, field: 'aImage' | 'bImage', url: string) => {
    control.setValue(`questions.${questionIndex}.correctAnswer.${pairIndex}.${field}`, url);
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
                        <FormField
                          control={control}
                          name={`questions.${questionIndex}.correctAnswer.${pairIndex}.a`}
                          render={({ field }) => <Input {...field} placeholder={`Item A${pairIndex + 1} Text`} value={field.value ?? ''} />}
                      />
                      <Controller control={control} name={`questions.${questionIndex}.correctAnswer.${pairIndex}.aImage`} render={({ field }) => (
                            <>
                                <ImageUploader fieldName={field.name} onUrlChange={(url) => handleImageUrlChange(pairIndex, 'aImage', url)} />
                                {field.value && <img src={field.value} alt="Preview" className="w-20 h-20 object-cover mt-2 rounded-md" />}
                            </>
                        )} />
                  </div>
                  <div className="pt-2">
                      <GripVertical className="h-5 w-5 text-muted-foreground"/>
                  </div>
                   <div className="space-y-2">
                        <FormField
                          control={control}
                          name={`questions.${questionIndex}.correctAnswer.${pairIndex}.b`}
                          render={({ field }) => <Input {...field} placeholder={`Item B${pairIndex + 1} Text`} value={field.value ?? ''} />}
                      />
                      <Controller control={control} name={`questions.${questionIndex}.correctAnswer.${pairIndex}.bImage`} render={({ field }) => (
                        <>
                          <ImageUploader fieldName={field.name} onUrlChange={(url) => handleImageUrlChange(pairIndex, 'bImage', url)} />
                          {field.value && <img src={field.value} alt="Preview" className="w-20 h-20 object-cover mt-2 rounded-md" />}
                        </>
                    )} />
                  </div>
              </div>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => appendMatchingPair({ a: '', aImage: '', b: '', bImage: '' })}>
            <PlusCircle className="mr-2 h-4 w-4"/> Add Pair
        </Button>
      </div>
  );
};

export default function EditContentPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [examCategories, setExamCategories] = useState<ExamType[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const contentId = params.id as string;
  const [isAddingNewSubject, setIsAddingNewSubject] = useState(false);
  const [isAddingNewBoard, setIsAddingNewBoard] = useState(false);
  const [isAddingNewExamCategory, setIsAddingNewExamCategory] = useState(false);
  const [isAddingNewExam, setIsAddingNewExam] = useState(false);
  const [isAddingNewChapter, setIsAddingNewChapter] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      board: '',
      examCategory: '',
      exam: '',
      subject: '',
      chapter: '',
      newSubject: '',
      newBoard: '',
      newExamCategory: '',
      newExam: '',
      newChapterNo: '',
      newChapterName: '',
      testType: 'Mock Test',
      description: '',
      duration: 0,
      difficulty: 'Medium',
      access: 'free',
      price: undefined,
      subscriptionPlan: 'pass',
      questions: [],
    },
  });

  const aiForm = useForm<AIGeneratorFormValues>({
    resolver: zodResolver(aiGeneratorFormSchema),
    defaultValues: {
      sourceType: 'topic',
      source: '',
      numQuestions: 5,
      difficulty: 'Medium',
      questionType: 'Any',
    },
  });


  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'questions',
  });

  const questions = form.watch('questions');
  useEffect(() => {
    const totalMarks = questions?.reduce((total, q) => {
        if (q.type === 'Matching') {
            return total + (q.correctAnswer?.length || q.marks || 1);
        }
        return total + (q.marks || 1);
    }, 0) || 0;
    form.setValue('duration', totalMarks, { shouldValidate: true });
  }, [questions, form]);


  useEffect(() => {
    const fetchContent = async () => {
      if (!contentId) return;
      try {
        setLoading(true);
        const [contentData, subjectData, contentTypeData, boardData, examTypeData] = await Promise.all([
            getContentById(contentId),
            getSubjects(),
            getContentTypes(),
            getBoards(),
            getExamTypes()
        ]);
        
        setSubjects(subjectData);
        setContentTypes(contentTypeData);
        setBoards(boardData);
        setExamCategories(examTypeData);

        if (contentData) {
            form.reset(contentData as FormValues);
             if (contentData.subject) {
              const selectedSubject = subjectData.find(s => s.name === contentData.subject);
              if (selectedSubject) {
                  const fetchedChapters = await getChaptersBySubjectId(selectedSubject.id);
                  setChapters(fetchedChapters);
                  form.setValue('chapter', contentData.chapter);
              }
            }
             if (contentData.examCategory) {
              const selectedExamCategory = examTypeData.find(e => e.name === contentData.examCategory);
              if (selectedExamCategory) {
                  const fetchedExams = await getExamsByCategory(selectedExamCategory.id);
                  setExams(fetchedExams);
                  form.setValue('exam', contentData.exam);
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
    fetchContent();
  }, [contentId, form, toast, router]);


  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      let subjectName = data.subject;
      let subjectId = subjects.find(s => s.name === data.subject)?.id;
      if (data.subject === 'add_new_subject' && data.newSubject) {
          const newSubId = await addSubject(data.newSubject);
          subjectName = data.newSubject;
          subjectId = newSubId;
      }
  
      let boardName = data.board;
      if (data.board === 'add_new_board' && data.newBoard) {
          await addBoard(data.newBoard);
          boardName = data.newBoard;
      }
  
      let examCategoryName = data.examCategory;
      let examCategoryId = examCategories.find(e => e.name === data.examCategory)?.id;
      if (data.examCategory === 'add_new_exam_category' && data.newExamCategory) {
          const newExamCatId = await addExamType(data.newExamCategory);
          examCategoryName = data.newExamCategory;
          examCategoryId = newExamCatId;
      }

      let examName = data.exam;
      if (data.exam === 'add_new_exam' && data.newExam && examCategoryId) {
          await addExam(examCategoryId, { name: data.newExam });
          examName = data.newExam;
      }

      let chapterName = data.chapter;
      if (data.chapter === 'add_new_chapter' && data.newChapterNo && data.newChapterName && subjectId) {
        await addChapter(subjectId, { chapterNo: data.newChapterNo, chapterName: data.newChapterName });
        chapterName = `${data.newChapterNo}. ${data.newChapterName}`;
      }
      
      // Process matching questions
      const processedQuestions = data.questions?.map(q => {
          if (q.type === 'Matching' && q.correctAnswer && Array.isArray(q.correctAnswer)) {
              const correctAnswer = q.correctAnswer as { a: string, aImage?: string, b: string, bImage?: string }[];
              const columnA = correctAnswer.map(pair => ({ text: pair.a, image: pair.aImage }));
              let columnB = correctAnswer.map(pair => ({ text: pair.b, image: pair.bImage }));
              // Simple shuffle for column B
              for (let i = columnB.length - 1; i > 0; i--) {
                  const j = Math.floor(Math.random() * (i + 1));
                  [columnB[i], columnB[j]] = [columnB[j], columnB[i]];
              }
              return { ...q, matchingOptions: { columnA, columnB }, marks: correctAnswer.length };
          }
          return q;
      });

      const contentToSave = { ...data, subject: subjectName, board: boardName, examCategory: examCategoryName, exam: examName, chapter: chapterName, questions: processedQuestions };
      delete (contentToSave as any).newSubject;
      delete (contentToSave as any).newBoard;
      delete (contentToSave as any).newExamCategory;
      delete (contentToSave as any).newExam;
      delete (contentToSave as any).newChapterNo;
      delete (contentToSave as any).newChapterName;


      await updateContent(contentId, contentToSave);
      toast({
        title: 'Content Updated!',
        description: `The ${data.testType?.toLowerCase()} "${data.title}" has been successfully updated.`,
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

  const handleAIGenerate = async (aiData: AIGeneratorFormValues) => {
    setIsGenerating(true);
    try {
        const input: AIQuestionGeneratorInput = {
            ...aiData,
            sourceType: aiData.sourceType === 'file' ? 'text' : aiData.sourceType,
        };
        const result: AIQuestionGeneratorOutput = await generateQuestions(input);
        append(result.questions);
        toast({
            title: 'Questions Added!',
            description: `${result.questions.length} new questions have been added.`,
        });
        
        setIsGeneratorOpen(false);

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
        const result = await generateDescription({ source: title });
        form.setValue('description', result.description);
        toast({
            title: 'Description Generated!',
            description: 'AI has created a description for you.',
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        if (file.type === 'text/plain') {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                aiForm.setValue('source', text, { shouldValidate: true });
                aiForm.setValue('sourceType', 'text');
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


  const handleSubjectChange = async (value: string) => {
      form.setValue('subject', value);
      form.setValue('chapter', '');
      setChapters([]);
      setIsAddingNewChapter(false);

      if (value === 'add_new_subject') {
          setIsAddingNewSubject(true);
      } else {
          setIsAddingNewSubject(false);
          const selectedSubject = subjects.find(s => s.name === value);
          if (selectedSubject) {
              const fetchedChapters = await getChaptersBySubjectId(selectedSubject.id);
              setChapters(fetchedChapters);
          }
      }
  }

  const handleBoardChange = (value: string) => {
      form.setValue('board', value);
      if (value === 'add_new_board') {
          setIsAddingNewBoard(true);
      } else {
          setIsAddingNewBoard(false);
      }
  }

  const handleExamCategoryChange = async (value: string) => {
      form.setValue('examCategory', value);
      form.setValue('exam', '');
      setExams([]);
      setIsAddingNewExam(false);

      if (value === 'add_new_exam_category') {
          setIsAddingNewExamCategory(true);
          setIsAddingNewExam(true);
          form.setValue('exam', 'add_new_exam');
      } else {
          setIsAddingNewExamCategory(false);
          const selectedExamCategory = examCategories.find(e => e.name === value);
          if (selectedExamCategory) {
              const fetchedExams = await getExamsByCategory(selectedExamCategory.id);
              setExams(fetchedExams);
          }
      }
  }

  const handleExamChange = (value: string) => {
    form.setValue('exam', value);
    if (value === 'add_new_exam') {
        setIsAddingNewExam(true);
    } else {
        setIsAddingNewExam(false);
    }
  };


   const handleChapterChange = (value: string) => {
    form.setValue('chapter', value);
    if (value === 'add_new_chapter') {
      setIsAddingNewChapter(true);
    } else {
      setIsAddingNewChapter(false);
    }
  };

  const accessLevel = form.watch('access');

  if (loading) {
    return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="ml-4 text-lg">Loading Content Editor...</p>
        </div>
    )
  }
  
  const selectedChapterValue = form.watch('chapter');
  const selectedChapter = chapters.find(c => `${c.chapterNo}. ${c.chapterName}` === selectedChapterValue);

  return (
    <div>
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
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., NEET Full Syllabus Physics - 2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                  control={form.control}
                  name="board"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Board</FormLabel>
                      {!isAddingNewBoard ? (
                            <Select onValueChange={handleBoardChange} value={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a board" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {boards.map((board) => (
                                    <SelectItem key={board.id} value={board.name}>
                                    {board.name}
                                    </SelectItem>
                                ))}
                                 <SelectItem value="add_new_board">Add new board...</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className='space-y-2'>
                                <FormField
                                    control={form.control}
                                    name="newBoard"
                                    render={({ field }) => (
                                        <Input {...field} placeholder="Enter new board name" />
                                    )}
                                />
                                <Button type="button" variant="secondary" size="sm" onClick={() => { setIsAddingNewBoard(false); form.setValue('board', ''); }}>Cancel</Button>
                             </div>
                        )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                        {!isAddingNewSubject ? (
                            <Select onValueChange={handleSubjectChange} value={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a subject" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {subjects.map((subject) => (
                                    <SelectItem key={subject.id} value={subject.name}>
                                    {subject.name}
                                    </SelectItem>
                                ))}
                                 <SelectItem value="add_new_subject">Add new subject...</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className='space-y-2'>
                                <FormField
                                    control={form.control}
                                    name="newSubject"
                                    render={({ field }) => (
                                        <Input {...field} placeholder="Enter new subject name" />
                                    )}
                                />
                                <Button type="button" variant="secondary" size="sm" onClick={() => { setIsAddingNewSubject(false); form.setValue('subject', ''); }}>Cancel</Button>
                             </div>
                        )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="chapter"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Chapter</FormLabel>
                        {!isAddingNewChapter ? (
                            <Select onValueChange={handleChapterChange} value={field.value} disabled={!form.watch('subject') || form.watch('subject') === 'add_new_subject'}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a chapter" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {chapters.map(chap => <SelectItem key={chap.id} value={`${chap.chapterNo}. ${chap.chapterName}`}>{chap.chapterNo}. {chap.chapterName}</SelectItem>)}
                                    <SelectItem value="add_new_chapter">Add new chapter...</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className='space-y-2'>
                                <FormField control={form.control} name="newChapterNo" render={({ field }) => (<Input {...field} placeholder="Chapter No." />)} />
                                <FormField control={form.control} name="newChapterName" render={({ field }) => (<Input {...field} placeholder="Chapter Name" />)} />
                                <Button type="button" variant="secondary" size="sm" onClick={() => { setIsAddingNewChapter(false); form.setValue('chapter', ''); }}>Cancel</Button>
                            </div>
                        )}
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 {selectedChapter && (
                    <FormItem>
                        <FormLabel>Chapter Name</FormLabel>
                        <FormControl>
                        <Input value={selectedChapter.chapterName} readOnly disabled />
                        </FormControl>
                    </FormItem>
                )}
              </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                  control={form.control}
                  name="examCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exam Category</FormLabel>
                      {!isAddingNewExamCategory ? (
                            <Select onValueChange={handleExamCategoryChange} value={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an exam category" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {examCategories.map((exam) => (
                                    <SelectItem key={exam.id} value={exam.name}>
                                    {exam.name}
                                    </SelectItem>
                                ))}
                                 <SelectItem value="add_new_exam_category">Add new exam category...</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className='space-y-2'>
                                <FormField
                                    control={form.control}
                                    name="newExamCategory"
                                    render={({ field }) => (
                                        <Input {...field} placeholder="Enter new exam category name" />
                                    )}
                                />
                                <Button type="button" variant="secondary" size="sm" onClick={() => { setIsAddingNewExamCategory(false); form.setValue('examCategory', ''); }}>Cancel</Button>
                             </div>
                        )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="exam"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exam</FormLabel>
                      {!isAddingNewExam ? (
                            <Select onValueChange={handleExamChange} value={field.value} disabled={!form.watch('examCategory') || form.watch('examCategory') === 'add_new_exam_category'}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an exam" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {exams.map((exam) => (
                                    <SelectItem key={exam.id} value={exam.name}>
                                    {exam.name}
                                    </SelectItem>
                                ))}
                                 <SelectItem value="add_new_exam">Add new exam...</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className='space-y-2'>
                                <FormField
                                    control={form.control}
                                    name="newExam"
                                    render={({ field }) => (
                                        <Input {...field} placeholder="Enter new exam name" />
                                    )}
                                />
                                {!isAddingNewExamCategory && (
                                  <Button type="button" variant="secondary" size="sm" onClick={() => { setIsAddingNewExam(false); form.setValue('exam', ''); }}>Cancel</Button>
                                )}
                             </div>
                        )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                        <FormLabel>Description</FormLabel>
                         <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={handleAIDescriptionGenerate}
                            disabled={isGeneratingDesc || !form.getValues('title')}
                        >
                            {isGeneratingDesc ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Generate with AI
                        </Button>
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder="Provide a brief description of the test content."
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
                      <FormLabel>Difficulty</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
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
                <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="access"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Access Level</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select access level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="free">Free</SelectItem>
                              <SelectItem value="premium">Paid (Premium)</SelectItem>
                              <SelectItem value="pro">Subscription (Pro)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {accessLevel === 'premium' && (
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Price (INR)</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        placeholder="e.g., 199"
                                        {...field}
                                        value={field.value ?? ''}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                    {accessLevel === 'pro' && (
                        <FormField
                            control={form.control}
                            name="subscriptionPlan"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subscription Plan</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a plan" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="pass">Pass</SelectItem>
                                            <SelectItem value="pro">Pass Pro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                </div>
              </div>

               <FormField
                  control={form.control}
                  name="testType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a content type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           {contentTypes.map((type) => (
                                <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                           ))}
                        </SelectContent>
                      </Select>
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
                                                <Input type="number" placeholder="Marks" className="w-24" {...field} disabled={questionType === 'Matching'} />
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
                                            {questionType === 'Fill in the Blank' && (
                                            <FormDescription>
                                                Use "____" (four underscores) to indicate where the blank should be.
                                            </FormDescription>
                                            )}
                                            {questionType === 'Matching' && (
                                            <FormDescription>
                                                Provide the instruction for matching, e.g., "Match Column A with Column B".
                                            </FormDescription>
                                            )}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                {questionType === 'Multiple Choice' && (
                                      <div className="space-y-4">
                                          <FormLabel>Options</FormLabel>
                                          <Controller
                                              control={form.control}
                                              name={`questions.${index}.correctAnswer`}
                                              render={({ field }) => (
                                                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                                  <FormField
                                                                      control={form.control}
                                                                      name={`questions.${index}.options.${optionIndex}.explanation`}
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
                                          <FormMessage>{form.formState.errors.questions?.[index]?.correctAnswer?.message}</FormMessage>

                                      </div>
                                  )}
                                  {questionType === 'True/False' && (
                                      <div className='space-y-4'>
                                          <FormField
                                              control={form.control}
                                              name={`questions.${index}.correctAnswer`}
                                              render={({ field }) => (
                                                  <FormItem>
                                                      <FormLabel>Correct Answer</FormLabel>
                                                      <FormControl>
                                                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                                                              <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="True" /></FormControl><FormLabel>True</FormLabel></FormItem>
                                                              <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="False" /></FormControl><FormLabel>False</FormLabel></FormItem>
                                                          </RadioGroup>
                                                      </FormControl>
                                                      <FormMessage />
                                                  </FormItem>
                                              )}
                                          />
                                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                               <FormField
                                                  control={form.control}
                                                  name={`questions.${index}.options.0.explanation`}
                                                  render={({ field }) => (
                                                      <FormItem>
                                                          <FormLabel>Explanation for "True"</FormLabel>
                                                          <FormControl><Textarea placeholder="Explain why it's true..." {...field} /></FormControl>
                                                          <FormMessage />
                                                      </FormItem>
                                                  )}
                                              />
                                               <FormField
                                                  control={form.control}
                                                  name={`questions.${index}.options.1.explanation`}
                                                  render={({ field }) => (
                                                      <FormItem>
                                                          <FormLabel>Explanation for "False"</FormLabel>
                                                          <FormControl><Textarea placeholder="Explain why it's false..." {...field} /></FormControl>
                                                          <FormMessage />
                                                      </FormItem>
                                                  )}
                                              />
                                          </div>
                                      </div>
                                  )}
                                {questionType === 'Matching' && (
                                    <MatchingPairsField control={form.control} questionIndex={index} />
                                )}
                                {(questionType === 'Short Answer' || questionType === 'Fill in the Blank') && (
                                    <FormField
                                        control={form.control}
                                        name={`questions.${index}.correctAnswer`}
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
                                <FormField
                                    control={form.control}
                                    name={`questions.${index}.explanation`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>General Explanation</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} placeholder="Explain why the correct answer is right." />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </Card>
                    );
                 })}
            </CardContent>
            <CardFooter className="gap-4">
                 <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        const newQuestion: any = { 
                            text: '', 
                            type: 'Multiple Choice', 
                            marks: 1, 
                            options: [{text: '', explanation: ''}, {text: '', explanation: ''}, {text: '', explanation: ''}, {text: '', explanation: ''}], 
                            correctAnswer: '', 
                            explanation: '' 
                        };
                         if (newQuestion.type === 'Matching') {
                            newQuestion.correctAnswer = [{ a: '', aImage: '', b: '', bImage: '' }];
                        }
                        append(newQuestion);
                    }}
                >
                    <PlusCircle className="mr-2" />
                    Add Question
                </Button>
                <Dialog open={isGeneratorOpen} onOpenChange={setIsGeneratorOpen}>
                    <DialogTrigger asChild>
                        <Button type="button" variant="outline">
                            <Sparkles className="mr-2 h-4 w-4" />
                            Add Questions with AI
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-xl">
                        <DialogHeader>
                        <DialogTitle>Generate Questions with AI</DialogTitle>
                        <DialogDescription>
                            Generate a set of questions to add to your content.
                        </DialogDescription>
                        </DialogHeader>
                        <Form {...aiForm}>
                        <form onSubmit={aiForm.handleSubmit(handleAIGenerate)} className="space-y-4">
                                <Tabs defaultValue="topic" className="w-full" onValueChange={(value) => aiForm.setValue('sourceType', value as 'topic' | 'text' | 'file')}>
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="topic">From Topic</TabsTrigger>
                                        <TabsTrigger value="text">From Text</TabsTrigger>
                                        <TabsTrigger value="file">From File</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="topic" className="pt-4">
                                        <FormField
                                            control={aiForm.control}
                                            name="source"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Topic</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., 'Newton's Laws of Motion'" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TabsContent>
                                    <TabsContent value="text" className="pt-4">
                                        <FormField
                                            control={aiForm.control}
                                            name="source"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Paste Text</FormLabel>
                                                    <FormControl>
                                                        <Textarea placeholder="Paste your content here..." {...field} className="min-h-[150px]" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TabsContent>
                                    <TabsContent value="file" className="pt-4">
                                        <FormItem>
                                            <FormLabel>Upload File</FormLabel>
                                            <FormControl>
                                                <div 
                                                    className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer"
                                                    onClick={() => fileInputRef.current?.click()}
                                                >
                                                    <div className="space-y-1 text-center">
                                                        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                                                        <div className="flex text-sm text-muted-foreground">
                                                            <p className="pl-1">
                                                                {aiForm.watch('source') ? 'File selected' : 'Upload a .txt file'}
                                                            </p>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                        {aiForm.watch('source') ? aiForm.watch('source').substring(0, 50) + '...' : 'Text file up to 10MB'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </FormControl>
                                            <Input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                className="hidden"
                                                accept=".txt"
                                            />
                                            <FormMessage />
                                        </FormItem>
                                    </TabsContent>
                                </Tabs>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={aiForm.control}
                                        name="numQuestions"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Number of Questions</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={aiForm.control}
                                        name="difficulty"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Difficulty</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
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
                                <FormField
                                    control={form.control}
                                    name="questionType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Question Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Any">Any</SelectItem>
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
                                <DialogFooter>
                                    <Button type="submit" disabled={isGenerating}>
                                        {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : "Generate"}
                                    </Button>
                                </DialogFooter>
                        </form>
                        </Form>
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
                    {form.formState.isSubmitting ? "Updating..." : "Update Content"}
                </Button>
           </div>
        </form>
      </Form>
    </div>
  );
}
