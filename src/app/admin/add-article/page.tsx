
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { addContent } from '@/lib/firebase/firestore';
import { Loader2, Save, Sparkles } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { generateLearnContent, AILearnContentGeneratorInput, AILearnContentGeneratorOutput } from '@/ai/flows/ai-learn-content-generator';


const formSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
  body: z.string().min(1, "Content body cannot be empty."),
  subject: z.string().optional(),
});


type FormValues = z.infer<typeof formSchema>;

const aiLearnGeneratorFormSchema = z.object({
  topic: z.string().min(5, 'Topic must be at least 5 characters.'),
});
type AILearnGeneratorFormValues = z.infer<typeof aiLearnGeneratorFormSchema>;


export default function AddArticlePage() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      body: '',
      subject: '',
    },
  });

  const aiLearnForm = useForm<AILearnGeneratorFormValues>({
    resolver: zodResolver(aiLearnGeneratorFormSchema),
    defaultValues: {
      topic: '',
    },
  });

  const handleFormSubmit = async (data: FormValues) => {
    try {
      const contentToSave = {
        title: data.title,
        description: data.description,
        body: data.body,
        subject: data.subject || 'General',
        testType: 'Learn',
        access: 'free', // Default access level
      };

      await addContent(contentToSave);
      toast({
        title: 'Article Created!',
        description: `The article "${data.title}" has been successfully saved.`,
      });
      
      form.reset();

    } catch (error) {
       toast({
        variant: "destructive",
        title: 'Error Creating Article',
        description: (error as Error).message,
      });
    }
  }

  const handleAILearnGenerate = async (aiData: AILearnGeneratorFormValues) => {
    setIsGenerating(true);
    try {
        const result: AILearnContentGeneratorOutput = await generateLearnContent(aiData);
        form.setValue('title', result.title);
        form.setValue('description', result.description);
        form.setValue('body', result.body);
        form.setValue('subject', aiData.topic);
        toast({
            title: 'Article Generated!',
            description: `AI has created a draft for "${result.title}".`,
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
  }
  
  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">Add New Article</h1>
                <p className="text-muted-foreground">
                    Create a new blog post or educational article for the "Learn" section.
                </p>
            </div>
             <Dialog open={isGeneratorOpen} onOpenChange={setIsGeneratorOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Article with AI
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                     <DialogHeader>
                        <DialogTitle>Generate Article with AI</DialogTitle>
                        <DialogDescription>
                            Enter a topic and Gemini will write a draft article for you.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...aiLearnForm}>
                        <form onSubmit={aiLearnForm.handleSubmit(handleAILearnGenerate)} className="space-y-4">
                             <FormField
                                control={aiLearnForm.control}
                                name="topic"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Article Topic</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., 'The Future of Renewable Energy'" {...field} />
                                        </FormControl>
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
        </div>


      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Article Details</CardTitle>
              <CardDescription>
                Provide the essential information for your new article.
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
                      <Input placeholder="Your article title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject / Category</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Science, History, Technology" {...field} />
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
                    <FormLabel>Summary / Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide a brief, one-paragraph summary of the article."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

                <FormField
                  control={form.control}
                  name="body"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content Body</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write your article content here."
                          {...field}
                          className="min-h-[400px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </CardContent>
            <CardFooter>
                 <Button 
                    type="submit"
                    disabled={form.formState.isSubmitting}
                >
                    {form.formState.isSubmitting ? "Publishing..." : "Publish Article"}
                </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
