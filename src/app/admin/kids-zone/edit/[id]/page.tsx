
'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
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
import { useToast } from '@/hooks/use-toast';
import { getContentById, updateContent, uploadFile, getSubjects, getBoards, getClasses, getStates, getGradesByClass, getKidsZoneCategories, addKidsZoneCategory } from '@/lib/firebase/firestore';
import { Loader2, Save, ArrowLeft, PlusCircle, Trash2, Upload, FileJson, Copy, Sparkles, GripVertical, Image as ImageIcon } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { ImageUploader } from '@/components/feature/image-uploader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';


const funQuizQuestionSchema = z.object({
    id: z.string().optional(),
    text: z.string().min(1, 'Question text cannot be empty.'),
    image: z.string().optional(),
    audio: z.string().optional(),
    type: z.enum(['Multiple Choice', 'True/False', 'Matching', 'Fill in the Blank', 'Direct Question']),
    options: z.array(z.object({
        text: z.string().min(1, "Option text cannot be empty."),
        image: z.string().optional(),
        audio: z.string().optional(),
    })).optional(),
    correctAnswer: z.any().optional(),
    explanation: z.string().optional(),
    wordBank: z.string().optional(),
    correctAnswerString: z.string().optional(),
    answerImage: z.string().optional(),
    answerAudio: z.string().optional(),
});

const formSchema = z.object({
    title: z.string().min(1, "Title is required."),
    contentType: z.enum(['Text', 'Quiz']).default('Text'),
    description: z.string().optional(),
    board: z.string().optional(),
    classCategory: z.string().optional(),
    grade: z.string().optional(),
    state: z.string().optional(),
    subject: z.string().optional(),
    tags: z.string().optional(),
    keywords: z.string().optional(),
    featureImage: z.string().optional(),
    category: z.string().min(1, "Category is required."),
    body: z.string().optional(),
    questions: z.array(funQuizQuestionSchema).optional(),
}).superRefine((data, ctx) => {
    if (data.contentType === 'Text' && (!data.body || data.body.length < 1)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Content body cannot be empty for Text/Activity type.",
            path: ['body'],
        });
    }
    if (data.contentType === 'Quiz' && (!data.questions || data.questions.length === 0)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "At least one question is required for Quiz type.",
            path: ['questions'],
        });
    }
});


type FormValues = z.infer<typeof formSchema>;

type Subject = { id: string, name: string };
type Board = { id: string, name: string };
type ClassCategory = { id: string, name: string };
type Grade = { id: string, name: string };
type State = { id: string, name: string };
type KidsZoneCategory = { id: string; title: string; };

const hardcodedCategories = [
    { id: 'fun-quizzes', title: 'Fun Quizzes' },
    { id: 'learning-games', title: 'Learning Games' },
    { id: 'learning-english', title: 'Learning English' },
    { id: 'learning-bengali', title: 'Learning Bengali' },
    { id: 'learning-hindi', title: 'Learning Hindi' },
    { id: 'learning-urdu', title: 'Learning Urdu' },
];


const jsonExampleFull = `
{
  "title": "Fun Animal Sounds Quiz (~60 chars)",
  "description": "Can you guess which animal makes which sound? A fun and educational quiz for kids with real animal pictures and sounds. (~160 chars)",
  "tags": "Animals, Sounds, Fun",
  "keywords": "animal sounds quiz, kids learning, fun quiz for children",
  "questions": [
    {
      "text": "Which animal says 'Moo'?",
      "image": "https://picsum.photos/seed/cow-image/400/225",
      "audio": "https://example.com/sounds/cow_question.mp3",
      "type": "Multiple Choice",
      "options": [
        { "text": "Cow", "image": "https://picsum.photos/seed/cow-option/100/100", "audio": "https://example.com/sounds/cow_sound.mp3" },
        { "text": "Dog", "image": "https://picsum.photos/seed/dog-option/100/100", "audio": "https://example.com/sounds/dog_sound.mp3" },
        { "text": "Cat", "image": "https://picsum.photos/seed/cat-option/100/100", "audio": "https://example.com/sounds/cat_sound.mp3" },
        { "text": "Duck", "image": "https://picsum.photos/seed/duck-option/100/100", "audio": "https://example.com/sounds/duck_sound.mp3" }
      ],
      "correctAnswer": "Cow",
      "explanation": "Cows are known for their 'moo' sound."
    }
  ]
}`;

const jsonExampleTextOnly = `{
  "title": "Fun Animal Sounds Quiz (~60 chars)",
  "description": "Can you guess which animal makes which sound? A fun and educational quiz for kids with real animal pictures and sounds. (~160 chars)",
  "tags": "Animals, Sounds, Fun",
  "keywords": "animal sounds quiz, kids learning, fun quiz for children",
  "questions": [
    {
      "text": "What is 2 + 2?",
      "type": "Multiple Choice",
      "options": [
        { "text": "3" },
        { "text": "4" },
        { "text": "5" }
      ],
      "correctAnswer": "4",
      "explanation": "Two plus two equals four."
    }
  ]
}`;

const jsonExampleMCQ = `{
  "questions": [
    {
      "text": "What color is the sky on a clear day?",
      "type": "Multiple Choice",
      "options": [
        { "text": "Green" },
        { "text": "Blue" },
        { "text": "Red" },
        { "text": "Yellow" }
      ],
      "correctAnswer": "Blue",
      "explanation": "The sky appears blue because of how the Earth's atmosphere scatters sunlight."
    }
  ]
}`;

const jsonExampleTF = `{
  "questions": [
    {
      "text": "The Earth is flat.",
      "type": "True/False",
      "correctAnswer": "False",
      "explanation": "The Earth is roughly a sphere."
    }
  ]
}`;

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
                                <ImageUploader fieldName={field.name} onUrlChange={(url) => handleImageUrlChange(pairIndex, 'aImage', url)} value={field.value} />
                            )} />
                        </div>
                        <div className="pt-2">
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                             <FormField control={control} name={`questions.${questionIndex}.correctAnswer.${pairIndex}.b`} render={({ field }) => <Input {...field} placeholder={`Item B${pairIndex + 1} Text`} value={field.value ?? ''} />} />
                             <Controller control={control} name={`questions.${questionIndex}.correctAnswer.${pairIndex}.bImage`} render={({ field }) => (
                                <ImageUploader fieldName={field.name} onUrlChange={(url) => handleImageUrlChange(pairIndex, 'bImage', url)} value={field.value} />
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


export default function EditKidsContentPage() {
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const contentId = params.id as string;
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadingAudio, setIsUploadingAudio] = useState(false);
    const audioInputRef = useRef<HTMLInputElement>(null);
    const [uploadingAudioField, setUploadingAudioField] = useState<string | null>(null);

    const [isImporting, setIsImporting] = useState(false);
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
    const [jsonText, setJsonText] = useState('');
    const importFileRef = useRef<HTMLInputElement>(null);

    const [isGeneratingAudio, setIsGeneratingAudio] = useState<string | null>(null);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [boards, setBoards] = useState<Board[]>([]);
    const [classCategories, setClassCategories] = useState<ClassCategory[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [states, setStates] = useState<State[]>([]);
    const [loadingMetadata, setLoadingMetadata] = useState(true);

    const [categories, setCategories] = useState<KidsZoneCategory[]>([]);
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [newCategoryData, setNewCategoryData] = useState({ title: '', description: '', icon: 'ToyBrick' });
    const [isAddingCategory, setIsAddingCategory] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            contentType: 'Text',
            description: '',
            board: '',
            classCategory: '',
            grade: '',
            state: '',
            subject: '',
            tags: '',
            keywords: '',
            featureImage: '',
            category: 'Fun Quizzes',
            body: '',
            questions: [],
        },
    });

    const selectedClassCategory = form.watch('classCategory');
    const contentType = form.watch('contentType');

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'questions',
    });

    useEffect(() => {
        if (!contentId) {
            toast({ variant: 'destructive', title: 'Invalid Content ID' });
            router.push('/admin/kids-zone/manage');
            return;
        }

        const fetchContentAndMetadata = async () => {
            setLoading(true);
            setLoadingMetadata(true);
            try {
                 const [contentData, subjectData, boardData, classData, stateData, kidsCategoriesData] = await Promise.all([
                    getContentById(contentId),
                    getSubjects(),
                    getBoards(),
                    getClasses(),
                    getStates(),
                    getKidsZoneCategories()
                ]);

                setSubjects(subjectData);
                setBoards(boardData);
                setClassCategories(classData);
                setStates(stateData);

                const firestoreCategories = kidsCategoriesData.map((c: any) => ({id: c.id, title: c.title}));
                const combined = [...hardcodedCategories, ...firestoreCategories];
                const uniqueCategories = Array.from(new Map(combined.map(item => [item.title, item])).values());
                uniqueCategories.sort((a, b) => a.title.localeCompare(b.title));
                setCategories(uniqueCategories);

                if (contentData) {
                    const determinedContentType = (contentData.testType === 'Quiz' || contentData.category === 'Fun Quizzes') ? 'Quiz' : 'Text';
                    const sanitizedData = {
                        ...contentData,
                        contentType: determinedContentType,
                        title: contentData.title ?? '',
                        description: contentData.description ?? '',
                        board: contentData.board ?? '',
                        classCategory: contentData.classCategory ?? '',
                        grade: contentData.grade ?? '',
                        state: contentData.state ?? '',
                        subject: contentData.subject ?? '',
                        tags: contentData.tags ?? '',
                        keywords: contentData.keywords ?? '',
                        featureImage: contentData.featureImage ?? '',
                        category: contentData.category ?? 'Fun Quizzes',
                        body: contentData.body ?? '',
                        questions: (contentData.questions || []).map((q: any) => {
                            let wordBank = '';
                            let correctAnswerString = '';
                            if (q.type === 'Fill in the Blank') {
                                wordBank = q.options?.map((opt: any) => opt.text).join('\n') || '';
                                correctAnswerString = Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : '';
                            }
                            return {
                                ...q,
                                text: q.text ?? '',
                                image: q.image ?? '',
                                audio: q.audio ?? '',
                                type: q.type || 'Multiple Choice',
                                options: (q.options || Array(6).fill(null)).map((opt: any) => ({
                                    text: opt?.text ?? '',
                                    image: opt?.image ?? '',
                                    audio: opt?.audio ?? '',
                                })),
                                correctAnswer: q.correctAnswer ?? (q.type === 'Fill in the Blank' ? [] : ''),
                                explanation: q.explanation ?? '',
                                wordBank,
                                correctAnswerString,
                            }
                        }),
                    };
                    form.reset(sanitizedData as any);

                    if (contentData.classCategory) {
                        const fetchedGrades = await getGradesByClass(contentData.classCategory);
                        setGrades(fetchedGrades);
                    }
                } else {
                    toast({ variant: 'destructive', title: 'Content not found' });
                    router.push('/admin/kids-zone/manage');
                }
            } catch (error) {
                toast({
                    variant: 'destructive',
                    title: 'Error fetching content',
                    description: (error as Error).message,
                });
            } finally {
                setLoading(false);
                setLoadingMetadata(false);
            }
        };

        fetchContentAndMetadata();
    }, [contentId, router, toast, form]);

     useEffect(() => {
        const fetchGrades = async () => {
            if(selectedClassCategory) {
                const fetchedGrades = await getGradesByClass(selectedClassCategory);
                setGrades(fetchedGrades);
            } else {
                setGrades([]);
            }
        };
        if (selectedClassCategory) fetchGrades();
    }, [selectedClassCategory]);

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

            if (parsed.title) {
                form.setValue('title', parsed.title);
            }
            if(parsed.description) {
                form.setValue('description', parsed.description);
            }
            if (parsed.tags) {
                form.setValue('tags', parsed.tags);
            }
            if (parsed.keywords) {
                form.setValue('keywords', parsed.keywords);
            }

            const questionsToImport = parsed.questions || [];
            if(!Array.isArray(questionsToImport)){
                throw new Error("The 'questions' key must be an array if it exists.");
            }

            if (questionsToImport.length > 0) {
                questionsToImport.forEach((q: any) => {
                    const { success } = funQuizQuestionSchema.safeParse(q);
                    if (!success) {
                        console.error("Invalid question structure:", q, funQuizQuestionSchema.safeParse(q));
                        throw new Error(`One or more questions have an invalid structure. Please check the format.`);
                    }
                });
                append(questionsToImport);
            }

            toast({ title: 'Import Successful!', description: `${parsed.title ? 'Title and description updated. ' : ''}${questionsToImport.length} questions added.` });
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
    };

    const handleUpdate = async (data: FormValues) => {
        setIsSubmitting(true);
        try {
            const processedQuestions = data.questions?.map(q => {
                if (q.type === 'Fill in the Blank') {
                    const options = q.wordBank?.split('\n').filter(Boolean).map(text => ({ text })) || [];
                    const correctAnswer = q.correctAnswerString?.split(',').map(s => s.trim()).filter(Boolean) || [];

                    const newQ: any = { ...q };
                    newQ.options = options as any[];
                    newQ.correctAnswer = correctAnswer;
                    delete newQ.wordBank;
                    delete newQ.correctAnswerString;
                    return newQ;
                }
                return q;
            });

             const contentToSave: any = {
                title: data.title,
                description: data.description,
                board: data.board,
                classCategory: data.classCategory,
                grade: data.grade,
                state: data.state,
                subject: data.subject,
                tags: data.tags,
                keywords: data.keywords,
                featureImage: data.featureImage,
                testType: data.contentType === 'Quiz' ? 'Quiz' : 'Kids Zone',
                category: data.category,
                body: data.contentType === 'Text' ? data.body : null,
                questions: data.contentType === 'Quiz' ? processedQuestions : null,
            };
            await updateContent(contentId, contentToSave);
            toast({ title: 'Content Updated!', description: `The item "${data.title}" has been successfully updated.` });
            router.push('/admin/kids-zone/manage');
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error Updating Content',
                description: (error as Error).message,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGenerateAudio = async (text: string, fieldName: any) => {
        if (!text || !text.trim()) {
            toast({ variant: 'destructive', title: 'No text to generate audio from.' });
            return;
        }
        setIsGeneratingAudio(fieldName);
        try {
            const result = await textToSpeech({ text: text, lang: 'en-US' });
            const dataUri = result.audioUrl;

            const response = await fetch(dataUri);
            const blob = await response.blob();
            const audioFile = new File([blob], `generated_${Date.now()}.wav`, { type: 'audio/wav' });

            const downloadURL = await uploadFile(audioFile);

            form.setValue(fieldName, downloadURL, { shouldDirty: true });

            toast({ title: 'Audio Generated!', description: 'The audio has been generated and linked.' });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Audio Generation Failed',
                description: (error as Error).message,
            });
        } finally {
            setIsGeneratingAudio(null);
        }
    };

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
                form.setValue(uploadingAudioField as any, downloadURL, { shouldDirty: true });
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

    const handleAddNewCategory = async () => {
        if (!newCategoryData.title.trim() || !newCategoryData.description.trim()) {
            toast({ variant: 'destructive', title: 'Title and description are required.' });
            return;
        }
        setIsAddingCategory(true);
        try {
            await addKidsZoneCategory(newCategoryData);
            toast({ title: 'Category added!' });
            setIsCategoryDialogOpen(false);
            setNewCategoryData({ title: '', description: '', icon: 'ToyBrick' });

            const fetched = await getKidsZoneCategories();
            const firestoreCategories = fetched.map((c: any) => ({id: c.id, title: c.title}));
            const combined = [...hardcodedCategories, ...firestoreCategories];
            const uniqueCategories = Array.from(new Map(combined.map(item => [item.title, item])).values());
            uniqueCategories.sort((a, b) => a.title.localeCompare(b.title));
            setCategories(uniqueCategories);

        } catch (error) {
            toast({ variant: 'destructive', title: 'Failed to add category', description: (error as Error).message });
        } finally {
            setIsAddingCategory(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4 text-lg">Loading Editor...</p>
            </div>
        );
    }

    return (
        <div>
             <Input type="file" ref={audioInputRef} onChange={handleAudioFileChange} className="hidden" accept="audio/*" />
            <div className="mb-6">
                <Button asChild variant="outline">
                    <Link href="/admin/kids-zone/manage">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Kids Zone Management
                    </Link>
                </Button>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Kids Zone Material</CardTitle>
                            <CardDescription>Update the details of the game, quiz, or activity.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Amazing Animals Quiz" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField
                              control={form.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Textarea placeholder="A fun quiz about all kinds of animals!" {...field} value={field.value ?? ''} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="subject"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Subject</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a subject" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {subjects.map((subject) => (
                                                        <SelectItem key={subject.id} value={subject.name}>{subject.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="board"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Board</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a board" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {boards.map((board) => (
                                                        <SelectItem key={board.id} value={board.name}>{board.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="classCategory"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Class Category</FormLabel>
                                        <Select onValueChange={(value) => { field.onChange(value); form.setValue('grade', ''); }} value={field.value}>
                                            <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                            {classCategories.map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                            ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="grade"
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
                                            {grades.map(g => (
                                                <SelectItem key={g.id} value={g.name}>{g.name}</SelectItem>
                                            ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="state"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>State</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a state" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {states.map((state) => (
                                                        <SelectItem key={state.id} value={state.name}>{state.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                control={form.control}
                                name="tags"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Tags</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Animals, Sounds, Fun" {...field} value={field.value ?? ''} />
                                    </FormControl>
                                    <FormDescription>Comma-separated tags for categorization.</FormDescription>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <FormField
                                control={form.control}
                                name="keywords"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Keywords</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., animal sounds quiz, kids learning" {...field} value={field.value ?? ''} />
                                    </FormControl>
                                    <FormDescription>Comma-separated keywords for SEO.</FormDescription>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <div className="flex items-center gap-2">
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {categories.map(cat => <SelectItem key={cat.id} value={cat.title}>{cat.title}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                                                <DialogTrigger asChild>
                                                    <Button type="button" variant="outline" size="icon"><PlusCircle className="w-4 h-4"/></Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Add New Kids Zone Category</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="space-y-4 py-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="new-cat-title">Title</Label>
                                                            <Input id="new-cat-title" value={newCategoryData.title} onChange={(e) => setNewCategoryData(prev => ({ ...prev, title: e.target.value }))} />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="new-cat-desc">Description</Label>
                                                            <Textarea id="new-cat-desc" value={newCategoryData.description} onChange={(e) => setNewCategoryData(prev => ({ ...prev, description: e.target.value }))} />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="new-cat-icon">Icon</Label>
                                                            <Select value={newCategoryData.icon} onValueChange={(val) => setNewCategoryData(prev => ({ ...prev, icon: val }))}>
                                                                <SelectTrigger><SelectValue/></SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="Puzzle">Puzzle</SelectItem>
                                                                    <SelectItem value="Gamepad2">Gamepad</SelectItem>
                                                                    <SelectItem value="BookHeart">BookHeart</SelectItem>
                                                                    <SelectItem value="BookOpen">BookOpen</SelectItem>
                                                                    <SelectItem value="Languages">Languages</SelectItem>
                                                                    <SelectItem value="Book">Book</SelectItem>
                                                                    <SelectItem value="ToyBrick">ToyBrick (Default)</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <Button variant="ghost" onClick={() => setIsCategoryDialogOpen(false)}>Cancel</Button>
                                                        <Button onClick={handleAddNewCategory} disabled={isAddingCategory}>
                                                            {isAddingCategory ? <Loader2 className="animate-spin" /> : 'Add Category'}
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="featureImage"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Feature Image</FormLabel>
                                    <FormControl>
                                        <ImageUploader fieldName={field.name} onUrlChange={(url) => form.setValue('featureImage', url, { shouldValidate: true })} value={field.value} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />

                             <FormField
                                control={form.control}
                                name="contentType"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                    <FormLabel>Content Type</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        className="flex items-center space-x-4"
                                        >
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                            <RadioGroupItem value="Text" />
                                            </FormControl>
                                            <FormLabel className="font-normal">Text/Activity</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                            <RadioGroupItem value="Quiz" />
                                            </FormControl>
                                            <FormLabel className="font-normal">Fun Quiz</FormLabel>
                                        </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {contentType === 'Text' && (<FormField control={form.control} name="body" render={({ field }) => (<FormItem><FormLabel>Content Body (for non-quiz content)</FormLabel><FormControl><Textarea {...field} placeholder="Write your article or game description here." className="min-h-[200px] font-mono" value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />)}

                            {contentType === 'Quiz' && (
                                 <Card>
                                    <CardHeader>
                                        <h3 className="text-lg font-medium">Quiz Questions</h3>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {fields.map((question, index) => {
                                            const questionType = form.watch(`questions.${index}.type`);
                                            return (
                                            <Card key={question.id} className="p-4 bg-secondary/50">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h4 className="font-semibold">Question {index + 1}</h4>
                                                    <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                </div>
                                                <div className="space-y-4">
                                                    <FormField control={form.control} name={`questions.${index}.text`} render={({ field }) => (<FormItem><FormLabel>Question Text</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                                    <FormField
                                                        control={form.control}
                                                        name={`questions.${index}.type`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Question Type</FormLabel>
                                                                <Select onValueChange={(value) => {
                                                                    field.onChange(value);
                                                                    form.setValue(`questions.${index}.options`, Array(6).fill({ text: '', image: '', audio: '' }));
                                                                    form.setValue(`questions.${index}.correctAnswer`, value === 'Matching' ? [] : '');
                                                                }} defaultValue={field.value}>
                                                                    <FormControl><SelectTrigger><SelectValue placeholder="Select type..."/></SelectTrigger></FormControl>
                                                                    <SelectContent>
                                                                        <SelectItem value="Multiple Choice">Multiple Choice</SelectItem>
                                                                        <SelectItem value="True/False">True/False</SelectItem>
                                                                        <SelectItem value="Matching">Matching</SelectItem>
                                                                        <SelectItem value="Fill in the Blank">Fill in the Blank</SelectItem>
                                                                        <SelectItem value="Direct Question">Direct Question</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <FormField control={form.control} name={`questions.${index}.image`} render={({ field }) => (<FormItem><FormLabel>Question Image</FormLabel><FormControl><ImageUploader fieldName={field.name} onUrlChange={(url) => form.setValue(`questions.${index}.image`, url)} value={field.value} /></FormControl><FormMessage /></FormItem>)}/>
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

                                                    {questionType === 'Multiple Choice' && (
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
                                                                                         <FormField control={form.control} name={`questions.${index}.options.${optionIndex}.text`} render={({ field: optionField }) => (
                                                                                            <FormItem className="flex-1">
                                                                                                <FormLabel className="sr-only">Option {optionIndex + 1} Text</FormLabel>
                                                                                                <FormControl><Input {...optionField} /></FormControl>
                                                                                                <FormMessage />
                                                                                            </FormItem>
                                                                                        )}/>
                                                                                    </div>

                                                                                    <div className="grid grid-cols-2 gap-2">
                                                                                        <FormField control={form.control} name={`questions.${index}.options.${optionIndex}.image`} render={({ field: imageField }) => (<FormItem><FormLabel className="text-xs">Image</FormLabel><FormControl><ImageUploader fieldName={imageField.name} onUrlChange={(url) => form.setValue(`questions.${index}.options.${optionIndex}.image`, url)} value={imageField.value} /></FormControl><FormMessage /></FormItem>)}/>
                                                                                        <FormField control={form.control} name={`questions.${index}.options.${optionIndex}.audio`} render={({ field: audioField }) => (
                                                                                            <FormItem><FormLabel className="text-xs">Audio</FormLabel><FormControl><div className="flex items-center gap-2"><Input {...audioField} placeholder="Audio URL" value={audioField.value ?? ''} /><Button type="button" variant="outline" size="icon" onClick={() => handleAudioUploadClick(`questions.${index}.options.${optionIndex}.audio`)} disabled={isUploadingAudio}>{isUploadingAudio && uploadingAudioField === `questions.${index}.options.${optionIndex}.audio` ? <Loader2 className="animate-spin" /> : <Upload className="w-4 h-4" />}</Button>{!!audioField.value && (<Button type="button" variant="destructive" size="icon" onClick={() => form.setValue(`questions.${index}.options.${optionIndex}.audio`, '')}><Trash2 className="w-4 h-4" /></Button>)}</div></FormControl>{form.getValues(`questions.${index}.options.${optionIndex}.audio`) && (<audio controls src={form.getValues(`questions.${index}.options.${optionIndex}.audio`)} className="w-full mt-2" /> )}<FormMessage /></FormItem>
                                                                                        )}/>
                                                                                    </div>
                                                                                </div>
                                                                            </Card>
                                                                        ))}
                                                                    </RadioGroup>
                                                                )}
                                                            />
                                                        </div>
                                                    )}
                                                    {questionType === 'True/False' && (
                                                        <div className="space-y-4 pt-2 border-t">
                                                            <FormField
                                                                control={form.control}
                                                                name={`questions.${index}.correctAnswer`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Correct Answer</FormLabel>
                                                                        <FormControl>
                                                                            <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4">
                                                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                                                    <FormControl><RadioGroupItem value="True" /></FormControl>
                                                                                    <FormLabel className="font-normal">True</FormLabel>
                                                                                </FormItem>
                                                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                                                    <FormControl><RadioGroupItem value="False" /></FormControl>
                                                                                    <FormLabel className="font-normal">False</FormLabel>
                                                                                </FormItem>
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
                                                    {questionType === 'Fill in the Blank' && (
                                                        <div className="space-y-4 pt-2 border-t">
                                                            <FormDescription>
                                                                Use `____` for each blank in the question. Provide all possible words (correct and incorrect) in the Word Bank. Then list the correct words in order.
                                                            </FormDescription>
                                                            <FormField
                                                                control={form.control}
                                                                name={`questions.${index}.wordBank`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Word Bank Options</FormLabel>
                                                                        <FormControl>
                                                                            <Textarea placeholder={"One word per line...\napple\nball\ncat"} {...field} />
                                                                        </FormControl>
                                                                        <FormDescription>These words will be the draggable options for the user.</FormDescription>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={form.control}
                                                                name={`questions.${index}.correctAnswerString`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Correct Answers (in order)</FormLabel>
                                                                        <FormControl>
                                                                            <Input placeholder="e.g., apple, cat" {...field} />
                                                                        </FormControl>
                                                                        <FormDescription>Comma-separated list of the correct words, in the order they should appear in the blanks.</FormDescription>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </div>
                                                    )}
                                                     {questionType === 'Direct Question' && (
                                                        <div className="space-y-4 pt-2 border-t">
                                                            <FormField
                                                                control={form.control}
                                                                name={`questions.${index}.correctAnswer`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Model Answer</FormLabel>
                                                                        <FormControl>
                                                                            <Textarea placeholder="Provide a detailed model answer or key points." {...field} />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <div className="grid grid-cols-2 gap-4">
                                                                 <FormField
                                                                    control={form.control}
                                                                    name={`questions.${index}.answerImage`}
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormLabel>Answer Image</FormLabel>
                                                                            <FormControl>
                                                                                <ImageUploader
                                                                                    fieldName={field.name}
                                                                                    onUrlChange={(url) => form.setValue(`questions.${index}.answerImage`, url)}
                                                                                    value={field.value}
                                                                                />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`questions.${index}.answerAudio`}
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormLabel>Answer Audio</FormLabel>
                                                                            <div className="flex items-center gap-2">
                                                                                <Input {...field} placeholder="Audio URL" value={field.value ?? ''} />
                                                                                <Button type="button" variant="outline" size="icon" onClick={() => handleAudioUploadClick(`questions.${index}.answerAudio`)} disabled={isUploadingAudio}>
                                                                                    {isUploadingAudio && uploadingAudioField === `questions.${index}.answerAudio` ? <Loader2 className="animate-spin" /> : <Upload className="w-4 h-4" />}
                                                                                </Button>
                                                                                {!!field.value && (
                                                                                    <Button type="button" variant="destructive" size="icon" onClick={() => form.setValue(`questions.${index}.answerAudio`, '')}>
                                                                                        <Trash2 className="w-4 h-4" />
                                                                                    </Button>
                                                                                )}
                                                                            </div>
                                                                             {!!field.value && <audio controls src={field.value} className="w-full mt-2" />}
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                    <FormField
                                                        control={form.control}
                                                        name={`questions.${index}.explanation`}
                                                        render={({ field }) => (
                                                            <FormItem className="mt-4">
                                                                <FormLabel>Explanation</FormLabel>
                                                                <FormControl>
                                                                    <Textarea placeholder="Explain why the answer is correct (optional)..." {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </Card>
                                           )
                                        })}
                                    </CardContent>
                                    <CardFooter>
                                        <div className="flex flex-wrap gap-4">
                                            <Button type="button" variant="outline" onClick={() => append({ text: '', type: 'Multiple Choice', options: [{text: ''}, {text: ''}, {text: ''}, {text: ''}], correctAnswer: '', explanation: '' })}>
                                                <PlusCircle className="mr-2 h-4 w-4" /> Add Question
                                            </Button>
                                            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                                                <DialogTrigger asChild>
                                                    <Button type="button" variant="outline"><FileJson className="mr-2 h-4 w-4" /> Bulk Import</Button>
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
                                                                    <p className="text-sm text-muted-foreground mb-4">Your JSON file can contain a `title` and `description` to update the form, or just a `questions` array to append questions.</p>
                                                                    <Tabs defaultValue="full" className="w-full">
                                                                        <TabsList className="h-auto flex-wrap justify-start">
                                                                            <TabsTrigger value="full">Full Example (Multimedia)</TabsTrigger>
                                                                            <TabsTrigger value="text-only">Text-Only</TabsTrigger>
                                                                            <TabsTrigger value="mcq">MCQ</TabsTrigger>
                                                                            <TabsTrigger value="tf">True/False</TabsTrigger>
                                                                        </TabsList>
                                                                         <TabsContent value="full">
                                                                            <div className="relative mt-2">
                                                                                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => handleCopy(jsonExampleFull)}><Copy className="h-4 w-4" /><span className="sr-only">Copy</span></Button>
                                                                                <ScrollArea className="h-64 rounded-md border bg-secondary p-4"><pre className="whitespace-pre-wrap break-words text-sm">{jsonExampleFull}</pre></ScrollArea>
                                                                            </div>
                                                                        </TabsContent>
                                                                        <TabsContent value="text-only">
                                                                            <div className="relative mt-2">
                                                                                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => handleCopy(jsonExampleTextOnly)}><Copy className="h-4 w-4" /><span className="sr-only">Copy</span></Button>
                                                                                <ScrollArea className="h-64 rounded-md border bg-secondary p-4"><pre className="whitespace-pre-wrap break-words text-sm">{jsonExampleTextOnly}</pre></ScrollArea>
                                                                            </div>
                                                                        </TabsContent>
                                                                        <TabsContent value="mcq">
                                                                            <div className="relative mt-2">
                                                                                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => handleCopy(jsonExampleMCQ)}><Copy className="h-4 w-4" /><span className="sr-only">Copy</span></Button>
                                                                                <ScrollArea className="h-64 rounded-md border bg-secondary p-4"><pre className="whitespace-pre-wrap break-words text-sm">{jsonExampleMCQ}</pre></ScrollArea>
                                                                            </div>
                                                                        </TabsContent>
                                                                        <TabsContent value="tf">
                                                                            <div className="relative mt-2">
                                                                                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => handleCopy(jsonExampleTF)}><Copy className="h-4 w-4" /><span className="sr-only">Copy</span></Button>
                                                                                <ScrollArea className="h-64 rounded-md border bg-secondary p-4"><pre className="whitespace-pre-wrap break-words text-sm">{jsonExampleTF}</pre></ScrollArea>
                                                                            </div>
                                                                        </TabsContent>
                                                                    </Tabs>
                                                                </AccordionContent>
                                                            </AccordionItem>
                                                        </Accordion>
                                                    </ScrollArea>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </CardFooter>
                                </Card>
                            )}
              </CardContent>
            </Card>
          <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Content"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
