
'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  getContentById,
  updateContent,
  getSubjects,
  getClasses,
  getGradesByClass,
  uploadFile,
  getBoards,
  getStates,
  getExamTypes,
  getExamsByCategory,
} from '@/lib/firebase/firestore';
import { Loader2, Save, Upload, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { generateImage } from '@/ai/flows/ai-image-generator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty.'),
  description: z.string().optional(),
  subject: z.string().optional(),
  classCategory: z.string().optional(),
  class: z.string().optional(),
  featureImage: z.string().optional(),
  board: z.string().optional(),
  state: z.string().optional(),
  examCategory: z.string().optional(),
  exam: z.string().optional(),
  school: z.string().optional(),
  semester: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;
type Subject = { id: string, name: string };
type ClassCategory = { id: string, name: string };
type Grade = { id: string, name: string };
type Board = { id: string, name: string };
type State = { id: string, name: string };
type ExamType = { id: string, name: string };
type Exam = { id: string, name: string };

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


export default function EditContentPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const contentId = params.bookId as string;
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classCategories, setClassCategories] = useState<ClassCategory[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [examCategories, setExamCategories] = useState<ExamType[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      subject: '',
      classCategory: '',
      class: '',
      featureImage: '',
      board: '',
      state: '',
      examCategory: '',
      exam: '',
      school: '',
      semester: '',
    },
  });
  
  const selectedClassCategory = form.watch('classCategory');
  const selectedExamCategory = form.watch('examCategory');

  useEffect(() => {
    const fetchDependentData = async () => {
        if(selectedClassCategory) {
            const fetchedGrades = await getGradesByClass(selectedClassCategory);
            setGrades(fetchedGrades);
        } else {
            setGrades([]);
        }
    };
    fetchDependentData();
  }, [selectedClassCategory]);

  useEffect(() => {
    const fetchDependentData = async () => {
        if (selectedExamCategory) {
            const fetchedExams = await getExamsByCategory(selectedExamCategory);
            setExams(fetchedExams);
        } else {
            setExams([]);
        }
    };
    fetchDependentData();
  }, [selectedExamCategory]);

  useEffect(() => {
    const fetchContent = async () => {
      if (!contentId) return;
      try {
        setLoading(true);
        const [contentData, subjectData, classData, boardData, stateData, examTypeData] = await Promise.all([
          getContentById(contentId),
          getSubjects(),
          getClasses(),
          getBoards(),
          getStates(),
          getExamTypes(),
        ]);

        setSubjects(subjectData);
        setClassCategories(classData);
        setBoards(boardData);
        setStates(stateData);
        setExamCategories(examTypeData);

        if (contentData) {
          form.reset(contentData as FormValues);
          if (contentData.classCategory) {
            const initialGrades = await getGradesByClass(contentData.classCategory);
            setGrades(initialGrades);
          }
          if (contentData.examCategory) {
            const initialExams = await getExamsByCategory(contentData.examCategory);
            setExams(initialExams);
          }
        } else {
          throw new Error("Textbook not found");
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: 'Error fetching textbook data',
          description: (error as Error).message,
        });
        router.push('/admin/textbooks');
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [contentId, form, toast, router]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      await updateContent(contentId, { ...data, testType: 'Textbook' });
      toast({
        title: 'Textbook Updated!',
        description: `The textbook "${data.title}" has been successfully updated.`,
      });
      router.push('/admin/textbooks');
    } catch (error) {
       toast({
        variant: "destructive",
        title: 'Error Updating Textbook',
        description: (error as Error).message,
      });
    }
  };
  
  if (loading) {
    return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="ml-4 text-lg">Loading Textbook Editor...</p>
        </div>
    )
  }
  
  return (
    <div>
      <h1 className="font-headline text-3xl font-bold">Edit Textbook</h1>
      <p className="text-muted-foreground mb-6">
        Modify the details of your textbook below.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Textbook Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., NCERT Class 12 Physics Part 1" {...field} />
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
                      <Textarea placeholder="A brief description of the textbook." {...field} />
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
                             <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a board" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {boards.map((b) => (
                                    <SelectItem key={b.id} value={b.name}>
                                    {b.name}
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
                                {states.map((s) => (
                                    <SelectItem key={s.id} value={s.name}>
                                    {s.name}
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
              </div>

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
                                {subjects.map((s) => (
                                    <SelectItem key={s.id} value={s.name}>
                                    {s.name}
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <FormField
                        control={form.control}
                        name="classCategory"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Class Category</FormLabel>
                                <Select onValueChange={(value) => { field.onChange(value); form.setValue('class', ''); }} value={field.value}>
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
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="examCategory"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Exam Category</FormLabel>
                            <Select onValueChange={(value) => { field.onChange(value); form.setValue('exam', ''); }} value={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an exam category" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {examCategories.map((ec) => (
                                    <SelectItem key={ec.id} value={ec.name}>
                                    {ec.name}
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
                    name="exam"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Exam</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={!selectedExamCategory}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an exam" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {exams.map((e) => (
                                    <SelectItem key={e.id} value={e.name}>
                                    {e.name}
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
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


               <FormField
                    control={form.control}
                    name="featureImage"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Feature Image</FormLabel>
                        <div className="flex items-center gap-4">
                            <ImageUploader
                                fieldName={field.name}
                                onUrlChange={(url) => form.setValue('featureImage', url)}
                            />
                            {field.value && <Image src={field.value} alt="Feature image preview" width={80} height={80} className="rounded-md object-cover" />}
                        </div>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </CardContent>
          </Card>
          
           <div className="flex items-center gap-4">
                <Button 
                    type="submit" 
                    disabled={form.formState.isSubmitting}
                >
                    <Save className="mr-2 h-4 w-4"/>
                    {form.formState.isSubmitting ? "Updating..." : "Update Textbook"}
                </Button>
           </div>
        </form>
      </Form>
    </div>
  );
}
