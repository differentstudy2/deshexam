

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
import { getSubjects, addSubject, getBoards, addBoard, getExamTypes, addExamType, getChaptersBySubjectId, addChapter, getExamsByCategory, addExam, uploadFile, getSettings, getClasses, addClass, getStates, addState, getGradesByClass, addContent } from '@/lib/firebase/firestore';
import { PlusCircle, Trash2, Loader2, Save, Sparkles, FileText, Upload, GripVertical, Image as ImageIcon, CalendarIcon, Book } from 'lucide-react';
import { useEffect, useState, useRef, Suspense } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { generateQuestions, AIQuestionGeneratorInput, AIQuestionGeneratorOutput } from '@/ai/flows/ai-question-generator';
import { generateDescription } from '@/ai/flows/ai-description-generator';
import { generateImage } from '@/ai/flows/ai-image-generator';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Link from 'next/link';
import { usePathname } from 'next/navigation';


const optionSchema = z.object({
  text: z.string().min(1, 'Option text cannot be empty.'),
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
  title: z.string().optional(),
  board: z.string().optional(),
  classCategory: z.string().optional(),
  class: z.string().optional(),
  subject: z.string().optional(),
  chapter: z.string().optional(),
  examCategory: z.string().optional(),
  state: z.string().optional(),
  exam: z.string().optional(),
  school: z.string().optional(),
  semester: z.string().optional(),
  newSubject: z.string().optional(),
  newBoard: z.string().optional(),
  newClass: z.string().optional(),
  newState: z.string().optional(),
  newExamCategory: z.string().optional(),
  newExam: z.string().optional(),
  newChapterName: z.string().optional(),
  testType: z.string().optional(),
  description: z.string().optional(),
  featureImage: z.string().optional(),
  duration: z.coerce
    .number()
    .int()
    .positive('Duration must be a positive number of minutes.').optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
  access: z.enum(['free', 'premium', 'pro']),
  price: z.coerce.number().optional(),
  subscriptionPlan: z.enum(['pass', 'pro']).optional(),
  publishedAt: z.date().optional(),
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
                            {isGenerating ? <><Loader2 className="animate-spin" /> Generating...</> : "Generate"}
                        </Button>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};


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
                            <FormField control={control} name={`questions.${questionIndex}.correctAnswer.${pairIndex}.a`} render={({ field }) => <Input {...field} placeholder={`Item A${pairIndex + 1} Text`} />} />
                            <Controller control={control} name={`questions.${questionIndex}.correctAnswer.${pairIndex}.aImage`} render={({ field }) => (
                                <>
                                  <ImageUploader fieldName={field.name} onUrlChange={(url) => handleImageUrlChange(pairIndex, 'aImage', url)} />
                                  {field.value && <img src={field.value} alt="Preview" className="w-20 h-20 object-cover mt-2 rounded-md" />}
                                </>
                            )} />
                        </div>
                        <div className="pt-2">
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                             <FormField control={control} name={`questions.${questionIndex}.correctAnswer.${pairIndex}.b`} render={({ field }) => <Input {...field} placeholder={`Item B${pairIndex + 1} Text`} />} />
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
                <PlusCircle className="mr-2 h-4 w-4" /> Add Pair
            </Button>
        </div>
    );
};

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

function AddContentForm() {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [classCategories, setClassCategories] = useState<ClassCategory[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [examCategories, setExamCategories] = useState<ExamType[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isAddingNewSubject, setIsAddingNewSubject] = useState(false);
  const [isAddingNewBoard, setIsAddingNewBoard] = useState(false);
  const [isAddingNewClass, setIsAddingNewClass] = useState(false);
  const [isAddingNewState, setIsAddingNewState] = useState(false);
  const [isAddingNewExamCategory, setIsAddingNewExamCategory] = useState(false);
  const [isAddingNewExam, setIsAddingNewExam] = useState(false);
  const [isAddingNewChapter, setIsAddingNewChapter] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  
  const [settings, setSettings] = useState({
    enableMatching: true,
    enableMultipleChoice: true,
    enableTrueFalse: true,
    enableShortAnswer: true,
    enableFillInTheBlank: true,
    enableSubjectMetafield: true,
    enableBoardMetafield: true,
    enableClassMetafield: true,
    enableStateMetafield: true,
    enableExamCategoryMetafield: true,
    enableExamMetafield: true,
    enableChapterMetafield: true,
    defaultBoard: '',
    defaultClassCategory: '',
    defaultClass: '',
    defaultSubject: '',
    defaultChapter: '',
    defaultExamCategory: '',
    defaultState: '',
    defaultExam: '',
  });

  const contentType = 'Exam';

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      board: '',
      classCategory: '',
      class: '',
      subject: '',
      chapter: '',
      examCategory: '',
      state: '',
      exam: '',
      school: '',
      semester: '',
      newSubject: '',
      newBoard: '',
      newClass: '',
      newState: '',
      newExamCategory: '',
      newExam: '',
      newChapterName: '',
      testType: contentType,
      description: '',
      featureImage: '',
      duration: 0,
      difficulty: 'Medium',
      access: 'free',
      price: undefined,
      subscriptionPlan: 'pass',
      publishedAt: new Date(),
      questions: [],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'questions',
  });
  
  const selectedClassCategory = form.watch('classCategory');
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
    form.setValue('testType', contentType);
  }, [contentType, form]);


  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setLoadingData(true);
        const [subjectData, boardData, classData, stateData, examTypeData, siteSettings] = await Promise.all([
            getSubjects(),
            getBoards(),
            getClasses(),
            getStates(),
            getExamTypes(),
            getSettings()
        ]);
        
        setSubjects(subjectData);
        setBoards(boardData);
        setClassCategories(classData);
        setStates(stateData);
        setExamCategories(examTypeData);

        if (siteSettings) {
          setSettings({
              enableMatching: siteSettings.enableMatching ?? true,
              enableMultipleChoice: siteSettings.enableMultipleChoice ?? true,
              enableTrueFalse: siteSettings.enableTrueFalse ?? true,
              enableShortAnswer: siteSettings.enableShortAnswer ?? true,
              enableFillInTheBlank: true,
              enableSubjectMetafield: siteSettings.enableSubjectMetafield ?? true,
              enableBoardMetafield: siteSettings.enableBoardMetafield ?? true,
              enableClassMetafield: siteSettings.enableClassMetafield ?? true,
              enableExamCategoryMetafield: siteSettings.enableExamCategoryMetafield ?? true,
              enableStateMetafield: siteSettings.enableStateMetafield ?? true,
              enableExamMetafield: siteSettings.enableExamMetafield ?? true,
              enableChapterMetafield: siteSettings.enableChapterMetafield ?? true,
              defaultBoard: siteSettings.defaultBoard ?? '',
              defaultClassCategory: siteSettings.defaultClassCategory ?? '',
              defaultClass: siteSettings.defaultClass ?? '',
              defaultSubject: siteSettings.defaultSubject ?? '',
              defaultChapter: siteSettings.defaultChapter ?? '',
              defaultExamCategory: siteSettings.defaultExamCategory ?? '',
              defaultState: siteSettings.defaultState ?? '',
              defaultExam: siteSettings.defaultExam ?? '',
          });

          const currentValues = form.getValues();
          form.reset({
              ...currentValues,
              board: currentValues.board || siteSettings.defaultBoard || '',
              classCategory: currentValues.classCategory || siteSettings.defaultClassCategory || '',
              class: currentValues.class || siteSettings.defaultClass || '',
              subject: currentValues.subject || siteSettings.defaultSubject || '',
              examCategory: currentValues.examCategory || siteSettings.defaultExamCategory || '',
              state: currentValues.state || siteSettings.defaultState || '',
              testType: contentType,
          });
          
          const defaultClassCat = siteSettings.defaultClassCategory || form.getValues('classCategory');
          if (defaultClassCat) {
            const fetchedGrades = await getGradesByClass(defaultClassCat);
            setGrades(fetchedGrades);
          }

           if (form.getValues('subject')) {
              const selectedSubject = subjectData.find(s => s.name === form.getValues('subject'));
              if (selectedSubject) {
                  const fetchedChapters = await getChaptersBySubjectId(selectedSubject.id);
                  setChapters(fetchedChapters);
                  if (siteSettings.defaultChapter && !form.getValues('chapter')) {
                    form.setValue('chapter', siteSettings.defaultChapter);
                  }
              }
          }
          if (form.getValues('examCategory')) {
              const selectedExamCategory = examTypeData.find(e => e.name === form.getValues('examCategory'));
              if (selectedExamCategory) {
                  const fetchedExams = await getExamsByCategory(selectedExamCategory.id);
                  setExams(fetchedExams);
                   if (siteSettings.defaultExam && !form.getValues('exam')) {
                    form.setValue('exam', siteSettings.defaultExam);
                  }
              }
          }
        }
      } catch (error) {
        toast({
            variant: "destructive",
            title: "Error loading data",
            description: "Could not load form data from the database."
        });
      } finally {
        setLoadingData(false);
      }
    };
    
    fetchFormData();

    const aiQuestionsRaw = sessionStorage.getItem('aiGeneratedQuestions');
    if (aiQuestionsRaw) {
      try {
        const newQuestions = JSON.parse(aiQuestionsRaw);
        const existingQuestions = form.getValues('questions') || [];
        const combinedQuestions = [...existingQuestions, ...newQuestions.map((q: any) => ({
            ...q,
            options: q.options || (q.type === 'Multiple Choice' ? [{text:''}, {text:''}, {text:''}, {text:''}] : undefined),
            explanation: q.explanation || ''
        }))];
        replace(combinedQuestions);
        toast({
            title: 'Questions Added!',
            description: 'AI-generated questions have been added to the form.',
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
    } else {
        const aiContentRaw = sessionStorage.getItem('aiGeneratedContent');
        if (aiContentRaw) {
          try {
            const aiContent = JSON.parse(aiContentRaw);
            form.setValue('title', aiContent.title);
            form.setValue('description', aiContent.description);
            form.setValue('difficulty', aiContent.difficulty);
            form.setValue('testType', aiContent.contentType);
            replace(aiContent.questions.map((q: any) => ({
                ...q,
                options: q.options || (q.type === 'Multiple Choice' ? [{text:''}, {text:''}, {text:''}, {text:''}] : undefined),
                explanation: q.explanation || ''
            })));
            toast({
                title: 'Content Loaded!',
                description: 'AI-generated content has been populated into the form.',
            });
          } catch (error) {
            toast({
                variant: "destructive",
                title: 'Failed to load AI content',
                description: 'The stored AI content was corrupted.',
            });
          } finally {
              sessionStorage.removeItem('aiGeneratedContent');
          }
        }
    }
  }, [form, replace, toast]);
  
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

  const handleFormSubmit = async (data: FormValues, resetType: 'full' | 'partial') => {
    try {
      let contentToSave: any;
      let subjectName = data.subject;
      let subjectId = subjects.find(s => s.name === data.subject)?.id;
      if(data.subject === 'add_new_subject' && data.newSubject) {
        const newSubId = await addSubject(data.newSubject);
        subjectName = data.newSubject;
        subjectId = newSubId;
        setIsAddingNewSubject(false);
      }
      
      let boardName = data.board;
      if(data.board === 'add_new_board' && data.newBoard) {
        await addBoard(data.newBoard);
        boardName = data.newBoard;
        setIsAddingNewBoard(false);
      }
      
      let className = data.class;
      if(data.class === 'add_new_class' && data.newClass) {
        await addClass(data.newClass);
        className = data.newClass;
        setIsAddingNewClass(false);
      }
      
      let stateName = data.state;
      if(data.state === 'add_new_state' && data.newState) {
          await addState(data.newState);
          stateName = data.newState;
          setIsAddingNewState(false);
      }

      let examCategoryName = data.examCategory;
      let examCategoryId = examCategories.find(e => e.name === data.examCategory)?.id;
      if(data.examCategory === 'add_new_exam_category' && data.newExamCategory) {
        const newExamCatId = await addExamType(data.newExamCategory);
        examCategoryName = data.newExamCategory;
        examCategoryId = newExamCatId;
        setIsAddingNewExamCategory(false);
      }
      
      let examName = data.exam;
      if(data.exam === 'add_new_exam' && data.newExam && examCategoryId) {
        await addExam(examCategoryId, { name: data.newExam });
        examName = data.newExam;
        setIsAddingNewExam(false);
      }

      let chapterName = data.chapter;
      if (data.chapter === 'add_new_chapter' && data.newChapterName && subjectId) {
        await addChapter(subjectId, { chapterName: data.newChapterName });
        chapterName = data.newChapterName;
        setIsAddingNewChapter(false);
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
        
        contentToSave = { ...data, subject: subjectName, board: boardName, class: className, state: stateName, examCategory: examCategoryName, exam: examName, chapter: chapterName, questions: processedQuestions };
        delete contentToSave.newSubject;
        delete contentToSave.newBoard;
        delete contentToSave.newClass;
        delete contentToSave.newState;
        delete contentToSave.newExamCategory;
        delete contentToSave.newExam;
        delete contentToSave.newChapterName;
      
      await addContent(contentToSave);
      toast({
        title: 'Content Created!',
        description: `The ${data.testType?.toLowerCase()} "${data.title}" has been successfully saved.`,
      });
      
      if (resetType === 'full') {
         form.reset({
            ...form.getValues(),
            title: '',
            board: settings.defaultBoard || '',
            classCategory: settings.defaultClassCategory || '',
            class: settings.defaultClass || '',
            subject: settings.defaultSubject || '',
            chapter: '',
            examCategory: settings.defaultExamCategory || '',
            state: settings.defaultState || '',
            exam: '',
            description: '',
            duration: 0,
            featureImage: '',
            access: 'free',
            price: undefined,
            publishedAt: new Date(),
            subscriptionPlan: 'pass',
            questions: [],
            newSubject: '',
            newBoard: '',
            newClass: '',
            newState: '',
            newExamCategory: '',
            newExam: '',
            newChapterName: '',
            difficulty: 'Medium',
            school: '',
            semester: '',
        });
        if (!settings.defaultSubject) setChapters([]);
        if (!settings.defaultExamCategory) setExams([]);
        if (!settings.defaultClassCategory) setGrades([]);

      } else { // partial reset
         form.reset({
            ...form.getValues(),
            title: '',
            description: '',
            duration: 0,
            access: 'free',
            featureImage: '',
            price: undefined,
            publishedAt: new Date(),
            subscriptionPlan: 'pass',
            questions: [],
            difficulty: 'Medium',
            school: '',
            semester: '',
         });
      }
      
      fetchFormData();

    } catch (error) {
       toast({
        variant: "destructive",
        title: 'Error Creating Content',
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
  
  const handleClassCategoryChange = (value: string) => {
      form.setValue('classCategory', value);
      form.setValue('class', '');
  }

  const handleClassChange = (value: string) => {
      form.setValue('class', value);
      if (value === 'add_new_class') {
          setIsAddingNewClass(true);
      } else {
          setIsAddingNewClass(false);
      }
  }

  const handleStateChange = (value: string) => {
    form.setValue('state', value);
    if (value === 'add_new_state') {
        setIsAddingNewState(true);
    } else {
        setIsAddingNewState(false);
    }
  };

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
  }

   const handleChapterChange = (value: string) => {
    form.setValue('chapter', value);
    if (value === 'add_new_chapter') {
      setIsAddingNewChapter(true);
    } else {
      setIsAddingNewChapter(false);
    }
  };
  
  const accessLevel = form.watch('access');

  if (loadingData) {
    return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="ml-4 text-lg">Loading Form Data...</p>
        </div>
    )
  }
  
  return (
    <div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">Add New Exam</h1>
                <p className="text-muted-foreground">
                    Fill out the form to create new content.
                </p>
            </div>
             <Button asChild variant="outline" className="w-full md:w-auto">
                <Link href="/admin/add-content/ai-content">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate with AI
                </Link>
            </Button>
        </div>
        
        <ContentTypeNavigation />


      <Form {...form}>
        <form className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Content Details</CardTitle>
              <CardDescription>
                Provide the essential information for your new content.
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
                    {settings.enableBoardMetafield && <FormField
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
                    />}
                    
                    {settings.enableClassMetafield && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="classCategory"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Class Category</FormLabel>
                                    <Select onValueChange={handleClassCategoryChange} value={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                        {classCategories.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>
                                            {c.name}
                                            </SelectItem>
                                        ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="class"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Grade</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={!selectedClassCategory}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a grade" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                        {grades.map((g) => (
                                            <SelectItem key={g.id} value={g.name}>
                                            {g.name}
                                            </SelectItem>
                                        ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}


                     {settings.enableStateMetafield && <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          {!isAddingNewState ? (
                            <Select onValueChange={handleStateChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a state" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {states.map((s) => (
                                  <SelectItem key={s.id} value={s.name}>
                                    {s.name}
                                  </SelectItem>
                                ))}
                                <SelectItem value="add_new_state">Add new state...</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className='space-y-2'>
                              <FormField
                                control={form.control}
                                name="newState"
                                render={({ field }) => (
                                  <Input {...field} placeholder="Enter new state name" />
                                )}
                              />
                              <Button type="button" variant="secondary" size="sm" onClick={() => { setIsAddingNewState(false); form.setValue('state', ''); }}>Cancel</Button>
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />}
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="school"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>School/College (Optional)</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., St. Stephen's College" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="semester"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Semester (Optional)</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., 3rd Semester" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                 </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {settings.enableSubjectMetafield && <FormField
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
                />}
                {settings.enableChapterMetafield && <FormField
                    control={form.control}
                    name="chapter"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Chapter</FormLabel>
                        {!isAddingNewChapter ? (
                            <Select onValueChange={handleChapterChange} value={field.value} disabled={!form.watch('subject') || form.watch('subject') === 'add_new_subject'}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a chapter" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {chapters.map(chap => <SelectItem key={chap.id} value={`${chap.chapterName}`}>{chap.chapterNo}. {chap.chapterName}</SelectItem>)}
                                    <SelectItem value="add_new_chapter">Add new chapter...</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className='space-y-2'>
                                <FormField control={form.control} name="newChapterName" render={({ field }) => (<Input {...field} placeholder="Chapter Name" />)} />
                                <Button type="button" variant="secondary" size="sm" onClick={() => { setIsAddingNewChapter(false); form.setValue('chapter', ''); }}>Cancel</Button>
                            </div>
                        )}
                        <FormMessage />
                        </FormItem>
                    )}
                />}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {settings.enableExamCategoryMetafield && <FormField
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
                />}
                 
                 {settings.enableExamMetafield && <FormField
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
                />}
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                        <FormLabel>Description / Summary</FormLabel>
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
                        placeholder="Provide a brief description of the content."
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
                        <FormDescription>
                            Set the difficulty level for this content.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="publishedAt"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Publish Date</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? (
                                    format(field.value, "PPP")
                                ) : (
                                    <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                         <FormMessage />
                        </FormItem>
                    )}
                />
                  <div className='space-y-2 lg:col-span-3'>
                      <FormField
                        control={form.control}
                        name="access"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Access Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                            <FormDescription>
                                Choose who can access this content.
                            </FormDescription>
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
            </CardContent>
          </Card>
          
          <Card>
              <CardHeader>
                  <CardTitle>Questions</CardTitle>
                  <CardDescription>Add questions to your content.</CardDescription>
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
                                                      {settings.enableMultipleChoice && <SelectItem value="Multiple Choice">Multiple Choice</SelectItem>}
                                                      {settings.enableTrueFalse && <SelectItem value="True/False">True/False</SelectItem>}
                                                      {settings.enableShortAnswer && <SelectItem value="Short Answer">Short Answer</SelectItem>}
                                                      {settings.enableFillInTheBlank && <SelectItem value="Fill in the Blank">Fill in the Blank</SelectItem>}
                                                      {settings.enableMatching && <SelectItem value="Matching">Matching</SelectItem>}
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
                                                  <RadioGroup
                                                    key={`${question.id}-${field.value}`}
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
                                                          <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4">
                                                              <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="True" /></FormControl><FormLabel>True</FormLabel></FormItem>
                                                              <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="False" /></FormControl><FormLabel>False</FormLabel></FormItem>
                                                          </RadioGroup>
                                                      </FormControl>
                                                      <FormMessage />
                                                  </FormItem>
                                              )}
                                          />
                                      </div>
                                  )}
                                  {questionType === 'Matching' && (
                                    <MatchingPairsField control={form.control} questionIndex={index} setValue={form.setValue} />
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
              <CardFooter>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const newQuestion: any = { 
                            text: '', 
                            type: 'Multiple Choice', 
                            marks: 1, 
                            options: [{text: ''}, {text: ''}, {text: ''}, {text: ''}], 
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
                      Add Question Manually
                  </Button>
                   <Button asChild variant="outline">
                        <Link href="/admin/add-content/add-ai-question?redirect=/admin/add-exam">
                            <Sparkles className="mr-2 h-4 w-4" />
                            Add Questions with AI
                        </Link>
                    </Button>
                </div>
              </CardFooter>
            </Card>
          
           <div className="flex items-center gap-4">
                <Button 
                    type="button" 
                    onClick={form.handleSubmit(data => handleFormSubmit(data, 'full'))} 
                    disabled={form.formState.isSubmitting}
                >
                    {form.formState.isSubmitting ? "Adding..." : "Add Content"}
                </Button>
                <Button 
                    type="button" 
                    variant="secondary"
                    onClick={form.handleSubmit(data => handleFormSubmit(data, 'partial'))} 
                    disabled={form.formState.isSubmitting}
                >
                    <Save className="mr-2 h-4 w-4"/>
                    {form.formState.isSubmitting ? "Saving..." : "Save and Add Another"}
                </Button>
           </div>
        </form>
      </Form>
    </div>
  );
}

export default function CreateTestPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AddContentForm />
        </Suspense>
    )
}

    