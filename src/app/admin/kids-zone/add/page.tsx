
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { addContent, uploadFile } from '@/lib/firebase/firestore';
import { Loader2, Sparkles, PlusCircle, Trash2, Upload, FileJson, Copy } from 'lucide-react';
import { useState, useRef } from 'react';
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';


const funQuizQuestionSchema = z.object({
  text: z.string().min(1, 'Question text cannot be empty.'),
  image: z.string().optional(),
  audio: z.string().optional(),
  type: z.enum(['Multiple Choice', 'True/False', 'Short Answer']),
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
}
`;

const jsonExampleTextOnly = `
{
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
}
`;

const jsonExampleMCQ = `
{
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


export default function AddKidsContentPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  }

  const handleFormSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const contentToSave: any = {
        title: data.title,
        description: data.description,
        tags: data.tags,
        keywords: data.keywords,
        featureImage: data.featureImage,
        testType: data.category === 'Fun Quizzes' ? 'Quiz' : 'Kids Zone',
        category: data.category,
        access: 'free',
        body: data.body,
        questions: data.category === 'Fun Quizzes' ? data.questions : [],
      };

      await addContent(contentToSave);
      toast({
        title: 'Content Created!',
        description: `The item "${data.title}" has been successfully saved.`,
      });
      
      form.reset();

    } catch (error) {
       toast({
        variant: "destructive",
        title: 'Error Creating Content',
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
  
  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">Add Kids Zone Material</h1>
                <p className="text-muted-foreground">
                    Create a new game, quiz, or learning activity for the Kids Zone.
                </p>
            </div>
        </div>
        
      <Input type="file" ref={audioInputRef} onChange={handleAudioFileChange} className="hidden" accept="audio/*" />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
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
                        <Input placeholder="e.g., Amazing Animals Quiz" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                 <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Fun Quizzes">Fun Quizzes</SelectItem>
                          <SelectItem value="Learning Games">Learning Games</SelectItem>
                          <SelectItem value="Learning English">Learning English</SelectItem>
                           <SelectItem value="Learning Bengali">Learning Bengali</SelectItem>
                          <SelectItem value="Learning Hindi">Learning Hindi</SelectItem>
                          <SelectItem value="Learning Arabic">Learning Arabic</SelectItem>
                          <SelectItem value="Learning Urdu">Learning Urdu</SelectItem>
                        </SelectContent>
                      </Select>
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
                        <ImageUploader
                            fieldName={field.name}
                            onUrlChange={(url) => form.setValue('featureImage', url, { shouldValidate: true })}
                            value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {form.watch('category') !== 'Fun Quizzes' && (
                  <FormField
                    control={form.control}
                    name="body"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content Body (for non-quiz content)</FormLabel>
                        <FormControl>
                          <Textarea
                              {...field}
                              placeholder="Write your article or game description here."
                              className="min-h-[200px] font-mono"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {form.watch('category') === 'Fun Quizzes' && (
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
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger><SelectValue placeholder="Select type..."/></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="Multiple Choice">Multiple Choice</SelectItem>
                                                            <SelectItem value="True/False">True/False</SelectItem>
                                                            <SelectItem value="Short Answer">Short Answer</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField control={form.control} name={`questions.${index}.image`} render={({ field }) => (<FormItem><FormLabel>Question Image</FormLabel><FormControl><ImageUploader fieldName={field.name} onUrlChange={(url) => form.setValue(`questions.${index}.image`, url)} value={field.value}/></FormControl><FormMessage /></FormItem>)}/>
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
                                                                <Trash2 className="w-4 h-4" />
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
                                                                    <FormItem className="flex items-center space-x-2">
                                                                        <FormControl><RadioGroupItem value="True" /></FormControl>
                                                                        <FormLabel>True</FormLabel>
                                                                    </FormItem>
                                                                    <FormItem className="flex items-center space-x-2">
                                                                        <FormControl><RadioGroupItem value="False" /></FormControl>
                                                                        <FormLabel>False</FormLabel>
                                                                    </FormItem>
                                                                </RadioGroup>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        )}
                                        {questionType === 'Short Answer' && (
                                            <div className="space-y-4 pt-2 border-t">
                                                 <FormField
                                                    control={form.control}
                                                    name={`questions.${index}.correctAnswer`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Correct Answer</FormLabel>
                                                            <FormControl><Input {...field} /></FormControl>
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
                        </CardContent>
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

