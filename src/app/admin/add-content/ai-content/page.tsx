
'use client';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Upload, ArrowLeft } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useState, useRef } from 'react';
import { generateContent, AIContentGeneratorInput, AIContentGeneratorOutput } from '@/ai/flows/ai-content-generator';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


const aiGeneratorFormSchema = z.object({
    sourceType: z.enum(['topic', 'text', 'file']),
    sourceTopic: z.string().optional(),
    sourceText: z.string().optional(),
    sourceFile: z.string().optional(),
    numQuestions: z.coerce.number().int().min(1).max(20),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']),
    questionType: z.enum(['Multiple Choice', 'True/False', 'Short Answer', 'Fill in the Blank', 'Matching', 'Any']),
    contentType: z.string(),
}).refine(data => {
    if (data.sourceType === 'topic') return !!data.sourceTopic && data.sourceTopic.length >= 3;
    if (data.sourceType === 'text') return !!data.sourceText && data.sourceText.length >= 3;
    if (data.sourceType === 'file') return !!data.sourceFile && data.sourceFile.length >= 3;
    return false;
}, {
    message: 'Source content must be at least 3 characters.',
    path: ['sourceTopic'], 
});
type AIGeneratorFormValues = z.infer<typeof aiGeneratorFormSchema>;


export default function AIContentGeneratorPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [isGenerating, setIsGenerating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const aiForm = useForm<AIGeneratorFormValues>({
        resolver: zodResolver(aiGeneratorFormSchema),
        defaultValues: {
          sourceType: 'topic',
          sourceTopic: '',
          sourceText: '',
          sourceFile: '',
          numQuestions: 5,
          difficulty: 'Medium',
          questionType: 'Any',
          contentType: 'Mock Test',
        },
    });

    const handleAIGenerate = async (aiData: AIGeneratorFormValues) => {
        setIsGenerating(true);
        try {
            const source = aiData.sourceType === 'topic' ? aiData.sourceTopic
                         : aiData.sourceType === 'text' ? aiData.sourceText
                         : aiData.sourceFile || null;
    
            if (!source || source.length < 3) {
                toast({
                    variant: "destructive",
                    title: 'AI Generation Failed',
                    description: 'Source content must be at least 3 characters.',
                });
                setIsGenerating(false);
                return;
            }
    
            const input: AIContentGeneratorInput = {
                numQuestions: aiData.numQuestions,
                difficulty: aiData.difficulty,
                questionType: aiData.questionType,
                sourceType: aiData.sourceType === 'file' ? 'text' : aiData.sourceType,
                source: source,
                contentType: aiData.contentType,
            };

            const result: AIContentGeneratorOutput = await generateContent(input);
            
            const contentToStore = {
                ...result,
                difficulty: aiData.difficulty,
                testType: aiData.contentType,
            };

            sessionStorage.setItem('aiGeneratedContent', JSON.stringify(contentToStore));
            
            toast({
                title: 'Content Generated!',
                description: `Redirecting you back to the form...`,
            });
            
            let redirectUrl = '/admin/add-content'; // Default for Mock Test
            if (aiData.contentType === 'Practice Questions') {
                redirectUrl = '/admin/add-practice-questions';
            } else if (aiData.contentType === 'Exam') {
                redirectUrl = '/admin/add-exam';
            }

            router.push(redirectUrl);
    
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

      const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.type === 'text/plain') {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const text = e.target?.result as string;
                    aiForm.setValue('sourceFile', text, { shouldValidate: true });
                    aiForm.setValue('sourceType', 'file');
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

    return (
        <div>
            <div className="mb-6">
                <Button asChild variant="outline">
                    <Link href="/admin/add-content">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Content Editor
                    </Link>
                </Button>
            </div>
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Generate Content with AI</CardTitle>
                    <CardDescription>
                        Describe the content you want to create, and Gemini will generate a draft for you. The result will be populated in the main content form.
                    </CardDescription>
                </CardHeader>
                <CardContent>
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
                                        name="sourceTopic"
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
                                        name="sourceText"
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
                                                            {aiForm.watch('sourceFile') ? 'File selected' : 'Upload a .txt file'}
                                                        </p>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                    {aiForm.watch('sourceFile') ? aiForm.watch('sourceFile')?.substring(0, 50) + '...' : 'Text file up to 10MB'}
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

                            <FormField
                                control={aiForm.control}
                                name="contentType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Content Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="Mock Test">Mock Test</SelectItem>
                                                <SelectItem value="Practice Questions">Practice Questions</SelectItem>
                                                <SelectItem value="Exam">Exam</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                control={aiForm.control}
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
                            <CardFooter className="p-0 pt-6">
                                <Button type="submit" disabled={isGenerating} className="w-full">
                                    {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : "Generate"}
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
