
'use client';

import { useEffect, useState } from 'react';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getContentById, updateContent } from '@/lib/firebase/firestore';
import { Loader2, Save } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

const formSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
  body: z.string().min(1, "Content body cannot be empty."),
  subject: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditArticlePage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const contentId = params.id as string;
  const [loading, setLoading] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      body: '',
      subject: '',
    },
  });

  useEffect(() => {
    if (!contentId) {
        router.push('/admin/content');
        return;
    }

    const fetchContent = async () => {
        try {
            setLoading(true);
            const contentData = await getContentById(contentId);
            if (contentData && contentData.testType === 'Learn') {
                form.reset(contentData);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Invalid Content',
                    description: 'The requested item is not a "Learn" article.',
                });
                router.push('/admin/content');
            }
        } catch (error) {
             toast({
                variant: 'destructive',
                title: 'Error fetching article',
                description: (error as Error).message,
            });
        } finally {
            setLoading(false);
        }
    };
    
    fetchContent();

  }, [contentId, router, toast, form]);


  const handleFormSubmit = async (data: FormValues) => {
    try {
      const contentToSave = {
        title: data.title,
        description: data.description,
        body: data.body,
        subject: data.subject || 'General',
      };

      await updateContent(contentId, contentToSave);
      toast({
        title: 'Article Updated!',
        description: `The article "${data.title}" has been successfully updated.`,
      });
      router.push('/admin/content');

    } catch (error) {
       toast({
        variant: "destructive",
        title: 'Error Updating Article',
        description: (error as Error).message,
      });
    }
  }
  
  if (loading) {
    return (
        <div className="flex h-full items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-lg">Loading Article...</p>
        </div>
    );
  }

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">Edit Article</h1>
                <p className="text-muted-foreground">
                    Update the details of your article below.
                </p>
            </div>
        </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Article Details</CardTitle>
              <CardDescription>
                Modify the information for your article.
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
                     <FormDescription>A category to help organize your articles.</FormDescription>
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
                          placeholder="Write your article content here. You can use Markdown for formatting."
                          {...field}
                          className="min-h-[400px]"
                        />
                      </FormControl>
                       <FormDescription>
                        Use Markdown for headings (`# H1`), lists (`- item`), bold (`**bold**`), etc.
                      </FormDescription>
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
                    <Save className="mr-2 h-4 w-4" />
                    {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
