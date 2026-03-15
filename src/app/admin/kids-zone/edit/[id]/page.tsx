
'use client';

import { useEffect, useState, useRef } from 'react';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getContentById, updateContent, uploadFile } from '@/lib/firebase/firestore';
import { Loader2, Save, ArrowLeft, PlusCircle, Trash2, Upload, FileJson, Copy } from 'lucide-react';
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';


const funQuizQuestionSchema = z.object({
    id: z.string().optional(),
    text: z.string().min(1, 'Question text cannot be empty.'),
    image: z.string().optional(),
    audio: z.string().optional(),
    type: z.enum(['Multiple Choice', 'True/False']),
    options: z.array(z.object({
        text: z.string().min(1, "Option text cannot be empty."),
        image: z.string().optional(),
        audio: z.string().optional(),
    })).optional(),
    correctAnswer: z.string().min(1, "Please provide a correct answer."),
    explanation: z.string().optional(),
});

const formSchema = z.object({
    title: z.string().min(1, "Title is required."),
    description: z.string().optional(),
    tags: z.string().optional(),
    keywords: z.string().optional(),
    featureImage: z.string().optional(),
    category: z.string().min(1, "Category is required."),
    body: z.string().optional(),
    questions: z.array(funQuizQuestionSchema).optional(),
});

type FormValues = z.infer<typeof formSchema>;


const jsonExampleFull = `
{
  "title": "Fun Animal Sounds Quiz (SEO Title ~60 chars)",
  "description": "Can you guess which animal makes which sound? A fun and educational quiz for kids with real animal pictures and sounds. (SEO Description ~160 chars)",
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
}
`;

const jsonExampleTextOnly = `
{
  "title": "Simple Planet Quiz (SEO Title)",
  "description": "A quick and easy quiz about the planets in our solar system. Test your basic astronomy knowledge now! (SEO Description)",
  "questions": [
    {
      "text": "Which planet is known as the Red Planet?",
      "type": "Multiple Choice",
      "options": [
        { "text": "Earth" },
        { "text": "Mars" },
        { "text": "Jupiter" },
        { "text": "Venus" }
      ],
      "correctAnswer": "Mars",
      "explanation": "Mars is often called the Red Planet because of its reddish appearance."
    }
  ]
}
`;

const jsonExampleQuestionsOnly = `
{
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
    },
    {
      "text": "Is the sun hot?",
      "type": "True/False",
      "correctAnswer": "True",
      "explanation": "The sun is a star and is very hot."
    }
  ]
}
`;

export default function EditKidsContentPage() {
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const contentId = params.id as string;
    const [loading, setLoading] = useState(true);
    const [isUploadingAudio, setIsUploadingAudio] = useState(false);
    const audioInputRef = useRef<HTMLInputElement>(null);
    const [uploadingAudioField, setUploadingAudioField] = useState<string | null>(null);

    const [isImporting, setIsImporting] = useState(false);
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
    const [jsonText, setJsonText] = useState('');
    const importFileRef = useRef<HTMLInputElement>(null);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast({ title: 'Copied to clipboard!' });
        }).catch(err => {
            toast({ variant: 'destructive', title: 'Failed to copy', description: 'Could not copy text to clipboard.' });
        });
    };

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            description: '',
            tags: '',
            keywords: '',
            featureImage: '',
            category: 'Fun Quizzes',
            body: '',
            questions: [],
        },
    });

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

        const fetchContent = async () => {
            setLoading(true);
            try {
                const contentData = await getContentById(contentId);
                if (contentData) {
                    const questionsWithDefaults = (contentData.questions || []).map((q: any) => ({
                        ...q,
                        type: q.type || 'Multiple Choice',
                        explanation: q.explanation || ''
                    }));
                    form.reset({ ...contentData, questions: questionsWithDefaults } as any);
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
            }
        };

        fetchContent();
    }, [contentId, router, toast, form]);

      const processJsonImport = (jsonString: string) => {
        try {
            const parsed = JSON.parse(jsonString);
            
            if (parsed.title) {
                form.setValue('title', parsed.title);
            }
            if(parsed.description) {
                form.setValue('description', parsed.description);
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
      }


    const handleUpdate = async (data: FormValues) => {
        try {
            const contentToSave: any = {
                title: data.title,
                description: data.description,
                tags: data.tags,
                keywords: data.keywords,
                featureImage: data.featureImage,
                testType: data.category === 'Fun Quizzes' ? 'Quiz' : 'Kids Zone',
                category: data.category,
                body: data.body,
                questions: data.category === 'Fun Quizzes' ? data.questions : [],
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
                            <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Amazing Animals Quiz" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField
                              control={form.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Textarea placeholder="A fun quiz about all kinds of animals!" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name="tags"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Tags</FormLabel>
                                      <FormControl>
                                        <Input placeholder="e.g., Animals, Sounds, Fun" {...field} />
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
                                        <Input placeholder="e.g., animal sounds quiz, kids learning" {...field} />
                                      </FormControl>
                                      <FormDescription>Comma-separated keywords for SEO.</FormDescription>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                            </div>
                            <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Fun Quizzes">Fun Quizzes</SelectItem><SelectItem value="Learning Games">Learning Games</SelectItem><SelectItem value="Learning English">Learning English</SelectItem><SelectItem value="Learning Bengali">Learning Bengali</SelectItem><SelectItem value="Learning Hindi">Learning Hindi</SelectItem><SelectItem value="Learning Arabic">Learning Arabic</SelectItem><SelectItem value="Learning Urdu">Learning Urdu</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="featureImage" render={({ field }) => (<FormItem><FormLabel>Feature Image</FormLabel><FormControl><ImageUploader fieldName={field.name} onUrlChange={(url) => form.setValue('featureImage', url, { shouldValidate: true })} value={field.value} /></FormControl><FormMessage /></FormItem>)} />
                            {form.watch('category') !== 'Fun Quizzes' && (<FormField control={form.control} name="body" render={({ field }) => (<FormItem><FormLabel>Content Body (for non-quiz content)</FormLabel><FormControl><Textarea {...field} placeholder="Write your article or game description here." className="min-h-[200px] font-mono" /></FormControl><FormMessage /></FormItem>)} />)}
                            {form.watch('category') === 'Fun Quizzes' && (
                                <div className="space-y-6 pt-4 border-t">
                                    <h3 className="text-lg font-medium">Quiz Questions</h3>
                                    {fields.map((question, index) => {
                                        const questionType = form.watch(`questions.${index}.type`);
                                        return (
                                        <Card key={question.id} className="p-4 bg-secondary/50">
                                            <div className="flex justify-between items-center mb-4"><h4 className="font-semibold">Question {index + 1}</h4><Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>
                                            <div className="space-y-4">
                                                <FormField control={form.control} name={`questions.${index}.text`} render={({ field }) => (<FormItem><FormLabel>Question Text</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                <FormField
                                                    control={form.control}
                                                    name={`questions.${index}.type`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Question Type</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl><SelectTrigger><SelectValue placeholder="Select type..."/></SelectTrigger></FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="Multiple Choice">Multiple Choice</SelectItem>
                                                                    <SelectItem value="True/False">True/False</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <FormField control={form.control} name={`questions.${index}.image`} render={({ field }) => (<FormItem><FormLabel>Question Image</FormLabel><FormControl><ImageUploader fieldName={field.name} onUrlChange={(url) => form.setValue(`questions.${index}.image`, url)} value={field.value} /></FormControl><FormMessage /></FormItem>)} />
                                                    <FormField control={form.control} name={`questions.${index}.audio`} render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Question Audio</FormLabel>
                                                             <div className="flex items-center gap-2">
                                                                <Input {...field} placeholder="Audio URL" value={field.value ?? ''} />
                                                                <Button type="button" variant="outline" size="icon" onClick={() => handleAudioUploadClick(`questions.${index}.audio`)} disabled={isUploadingAudio}>
                                                                    {isUploadingAudio && uploadingAudioField === `questions.${index}.audio` ? <Loader2 className="animate-spin" /> : <Upload className="w-4 h-4" />}
                                                                </Button>
                                                                {!!field.value && (
                                                                    <Button type="button" variant="destructive" size="icon" onClick={() => form.setValue(`questions.${index}.audio`, '')}>
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                            </div>
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
                                                            render={({ field: controllerField }) => (
                                                                <RadioGroup onValueChange={controllerField.onChange} value={controllerField.value} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                                                             <div className="flex items-center gap-2">
                                                                                                <Input {...audioField} placeholder="Audio URL" value={audioField.value ?? ''} />
                                                                                                <Button type="button" variant="outline" size="icon" onClick={() => handleAudioUploadClick(`questions.${index}.options.${optionIndex}.audio`)} disabled={isUploadingAudio}>
                                                                                                    {isUploadingAudio && uploadingAudioField === `questions.${index}.options.${optionIndex}.audio` ? <Loader2 className="animate-spin" /> : <Upload className="w-4 h-4" />}
                                                                                                </Button>
                                                                                                {!!audioField.value && (
                                                                                                    <Button type="button" variant="destructive" size="icon" onClick={() => form.setValue(`questions.${index}.options.${optionIndex}.audio`, '')}>
                                                                                                        <Trash2 className="h-4 w-4" />
                                                                                                    </Button>
                                                                                                )}
                                                                                            </div>
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
                                    <div className="flex flex-wrap gap-4">
                                        <Button type="button" variant="outline" onClick={() => append({ text: '', type: 'Multiple Choice', options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }], correctAnswer: '', explanation: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Question</Button>
                                        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button type="button" variant="outline"><FileJson className="mr-2 h-4 w-4" /> Bulk Import</Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-xl">
                                                <DialogHeader>
                                                    <DialogTitle>Bulk Import Quiz Questions</DialogTitle>
                                                    <DialogDescription>
                                                        Upload a JSON file or paste JSON text. The content will be appended to the current question list.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <ScrollArea className="max-h-[60vh] pr-6">
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
                                                            <AccordionTrigger>View Example JSON Formats</AccordionTrigger>
                                                            <AccordionContent>
                                                                <Tabs defaultValue="full" className="w-full">
                                                                    <TabsList className="grid w-full grid-cols-3">
                                                                        <TabsTrigger value="full">Full Example</TabsTrigger>
                                                                        <TabsTrigger value="text-only">Text-Only</TabsTrigger>
                                                                        <TabsTrigger value="questions-only">Questions Only</TabsTrigger>
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
                                                                    <TabsContent value="questions-only">
                                                                        <div className="relative mt-2">
                                                                            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => handleCopy(jsonExampleQuestionsOnly)}><Copy className="h-4 w-4" /><span className="sr-only">Copy</span></Button>
                                                                            <ScrollArea className="h-64 rounded-md border bg-secondary p-4"><pre className="whitespace-pre-wrap break-words text-sm">{jsonExampleQuestionsOnly}</pre></ScrollArea>
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
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={form.formState.isSubmitting}><Save className="mr-2 h-4 w-4" />{form.formState.isSubmitting ? "Saving..." : "Save Changes"}</Button>
                        <Button type="button" variant="ghost" asChild><Link href="/admin/kids-zone/manage">Cancel</Link></Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
