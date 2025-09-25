

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
import { getContentById, updateContent, getSubjects, getContentTypes, getBoards, getExamTypes, getChaptersBySubjectId, addChapter, addBoard, addExamType, addSubject, getExamsByCategory, addExam, uploadFile, getSettings, getClasses, addClass, getStates, addState } from '@/lib/firebase/firestore';
import { PlusCircle, Trash2, Loader2, Sparkles, FileText, Upload, GripVertical, Save, Image as ImageIcon, FileJson } from 'lucide-react';
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

type FormValues = z.infer<typeof formSchema>;
type ContentType = { id: string, name: string };
type Subject = { id: string, name: string };
type Board = { id: string, name: string };
type Class = { id: string, name: string };
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


export default function EditContentPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const contentId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
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
  });

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
      newSubject: '',
      newBoard: '',
      newClass: '',
      newState: '',
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
    const fetchContent = async () => {
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

        if (siteSettings) {
            setSettings({
                enableMatching: siteSettings.enableMatching ?? true,
                enableMultipleChoice: siteSettings.enableMultipleChoice ?? true,
                enableTrueFalse: siteSettings.enableTrueFalse ?? true,
                enableShortAnswer: siteSettings.enableShortAnswer ?? true,
                enableFillInTheBlank: siteSettings.enableFillInTheBlank ?? true,
                enableSubjectMetafield: siteSettings.enableSubjectMetafield ?? true,
                enableBoardMetafield: siteSettings.enableBoardMetafield ?? true,
                enableClassMetafield: siteSettings.enableClassMetafield ?? true,
                enableStateMetafield: siteSettings.enableStateMetafield ?? true,
                enableExamCategoryMetafield: siteSettings.enableExamCategoryMetafield ?? true,
                enableExamMetafield: siteSettings.enableExamMetafield ?? true,
                enableChapterMetafield: siteSettings.enableChapterMetafield ?? true,
            });
        }

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

  useEffect(() => {
    const aiQuestionsRaw = sessionStorage.getItem('aiGeneratedQuestions');
    if (aiQuestionsRaw) {
      try {
        const newQuestions = JSON.parse(aiQuestionsRaw);
        const existingQuestions = form.getValues('questions') || [];
        const combinedQuestions = [...existingQuestions, ...newQuestions.map((q: any) => ({
            ...q,
            options: q.options || (q.type === 'Multiple Choice' ? [{text:'', explanation:''}, {text:'', explanation:''}, {text:'', explanation:''}, {text:'', explanation:''}] : undefined),
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
      
      let className = data.class;
      if (data.class === 'add_new_class' && data.newClass) {
          await addClass(data.newClass);
          className = data.newClass;
      }
      
      let stateName = data.state;
      if (data.state === 'add_new_state' && data.newState) {
          await addState(data.newState);
          stateName = data.newState;
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

      const contentToSave = { ...data, subject: subjectName, board: boardName, class: className, state: stateName, examCategory: examCategoryName, exam: examName, chapter: chapterName, questions: processedQuestions };
      delete (contentToSave as any).newSubject;
      delete (contentToSave as any).newBoard;
      delete (contentToSave as any).newClass;
      delete (contentToSave as any).newState;
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

  const processJsonImport = (jsonText: string) => {
    try {
        let parsedJson = JSON.parse(jsonText);
        let questionsToImport = [];

        if (parsedJson.questions && Array.isArray(parsedJson.questions)) {
            questionsToImport = parsedJson.questions;
        } else {
            // If no "questions" key, combine all arrays in the object
            questionsToImport = Object.values(parsedJson).flat();
        }

        if (!Array.isArray(questionsToImport) || questionsToImport.length === 0) {
            throw new Error("No valid question array found in the JSON.");
        }
        
        // Basic validation for each question
        questionsToImport.forEach((q: any, i: number) => {
            const { success } = questionSchema.safeParse(q);
            if (!success) {
                // Log the failing question for easier debugging
                console.error("Invalid question structure at index:", i, q, questionSchema.safeParse(q));
                throw new Error(`Question at index ${i} has an invalid structure.`);
            }
        });
        
        append(questionsToImport);
        toast({
          title: 'Import Successful!',
          description: `${questionsToImport.length} questions have been added.`,
        });
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

  const accessLevel = form.watch('access');

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
                {settings.enableClassMetafield && <FormField
                    control={form.control}
                    name="class"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Class</FormLabel>
                        {!isAddingNewClass ? (
                                <Select onValueChange={handleClassChange} value={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a class" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {classes.map((c) => (
                                        <SelectItem key={c.id} value={c.name}>
                                        {c.name}
                                        </SelectItem>
                                    ))}
                                    <SelectItem value="add_new_class">Add new class...</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div className='space-y-2'>
                                    <FormField
                                        control={form.control}
                                        name="newClass"
                                        render={({ field }) => (
                                            <Input {...field} placeholder="Enter new class name" />
                                        )}
                                    />
                                    <Button type="button" variant="secondary" size="sm" onClick={() => { setIsAddingNewClass(false); form.setValue('class', ''); }}>Cancel</Button>
                                </div>
                            )}
                        <FormMessage />
                        </FormItem>
                    )}
                />}
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
                />}
              </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <CardFooter className="flex flex-wrap gap-4">
                 <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        append({
                          text: '',
                          type: 'Multiple Choice',
                          marks: 1,
                          options: [
                            { text: '', explanation: '' },
                            { text: '', explanation: '' },
                            { text: '', explanation: '' },
                            { text: '', explanation: '' },
                          ],
                          correctAnswer: '',
                          explanation: '',
                        });
                      }}
                >
                    <PlusCircle className="mr-2" />
                    Add Question Manually
                </Button>
                <Button asChild variant="outline">
                    <Link href={`/admin/edit-content/${contentId}/add-ai-question`}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Add Questions with AI
                    </Link>
                </Button>
                 <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                    <DialogTrigger asChild>
                         <Button type="button" variant="outline">
                            <FileJson className="mr-2" />
                            Bulk Import from JSON
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

                        <Accordion type="single" collapsible className="w-full mt-6">
                          <AccordionItem value="item-1">
                            <AccordionTrigger>View JSON Format Examples</AccordionTrigger>
                            <AccordionContent>
                              <p className="text-sm text-muted-foreground mb-4">Your JSON file should contain a single key "questions" which is an array of question objects, or multiple keys with arrays of questions which will be combined.</p>
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

    

    


