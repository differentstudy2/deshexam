'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
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
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { useToast } from '@/hooks/use-toast';
import { addContent, updateContent } from '@/lib/firebase/firestore';
import { Loader2, Save, ArrowLeft, Image as ImageIcon, Type, Layout, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().min(1, 'Content description is required.'),
  featureImage: z.string().optional(),
  access: z.enum(['free', 'premium', 'pro']),
  testType: z.array(z.string()),
  status: z.enum(['Draft', 'Published']),
});

type FormValues = z.infer<typeof formSchema>;

interface PostEditorProps {
  contentType: 'Blog' | 'Job' | 'News';
  initialData?: any;
  contentId?: string;
  backUrl: string;
}

export function PostEditor({ contentType, initialData, contentId, backUrl }: PostEditorProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      featureImage: initialData?.featureImage || '',
      access: initialData?.access || 'free',
      testType: initialData?.testType || [contentType],
      status: initialData?.status || 'Published',
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSaving(true);
      
      const payload = {
        ...data,
        updatedAt: new Date(),
        ...(initialData ? {} : { createdAt: new Date(), publishedAt: new Date(), subject: contentType, duration: 5 }), // Some defaults that AssessmentClient expects
      };

      if (contentId) {
        await updateContent(contentId, payload);
        toast({
          title: `${contentType} Updated!`,
          description: `The ${contentType.toLowerCase()} has been successfully updated.`,
        });
      } else {
        await addContent(payload);
        toast({
          title: `${contentType} Created!`,
          description: `The ${contentType.toLowerCase()} has been successfully created.`,
        });
      }

      router.push(backUrl);
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error Saving Content',
        description: (error as Error).message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Sticky Header Action Bar */}
          <div className="sticky top-0 z-30 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 pb-4 pt-6 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 transition-all">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" className="rounded-full shadow-sm" asChild>
                <Link href={backUrl}>
                  <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </Link>
              </Button>
              <div>
                <h1 className="font-headline text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300">
                  {contentId ? `Edit ${contentType}` : `Create New ${contentType}`}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  {contentId ? `Make changes to your ${contentType.toLowerCase()} post.` : `Write and publish a new ${contentType.toLowerCase()} post.`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" className="font-semibold text-slate-600 dark:text-slate-300 rounded-full px-6" asChild>
                <Link href={backUrl}>Cancel</Link>
              </Button>
              <Button 
                type="submit" 
                disabled={isSaving} 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full px-8 shadow-lg shadow-indigo-500/25 transition-all duration-300 font-semibold text-base"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    Save {contentType}
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="border-0 shadow-xl shadow-slate-200/40 dark:shadow-none bg-white/60 dark:bg-slate-900/40 backdrop-blur-3xl rounded-3xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                      <Type className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold">Content Area</CardTitle>
                      <CardDescription className="text-base mt-1">
                        Craft your {contentType.toLowerCase()} masterpiece here.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 sm:p-8 space-y-8">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-slate-800 dark:text-slate-200">Post Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter a catchy title..." 
                            className="text-lg py-6 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 rounded-xl shadow-inner" 
                            {...field} 
                          />
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
                        <FormLabel className="text-base font-semibold text-slate-800 dark:text-slate-200">Body Content</FormLabel>
                        <FormControl>
                          <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 transition-shadow">
                            <RichTextEditor 
                              content={field.value} 
                              onChange={field.onChange} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Settings Column */}
            <div className="space-y-8">
              <Card className="border-0 shadow-xl shadow-slate-200/40 dark:shadow-none bg-white/60 dark:bg-slate-900/40 backdrop-blur-3xl rounded-3xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800 sticky top-32">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
                      <Layout className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold">Post Settings</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        Configure metadata and visibility.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          Publish Status
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-xl h-12">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="Published" className="rounded-lg font-medium">Published (Public)</SelectItem>
                            <SelectItem value="Draft" className="rounded-lg font-medium">Draft (Hidden)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="w-full h-px bg-slate-200 dark:bg-slate-800" />

                  <FormField
                    control={form.control}
                    name="access"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                          <ShieldCheck className="w-4 h-4 text-indigo-500" />
                          Access Level
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-xl h-12">
                              <SelectValue placeholder="Select access level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="free" className="rounded-lg font-medium text-emerald-600 dark:text-emerald-400">Free</SelectItem>
                            <SelectItem value="premium" className="rounded-lg font-medium text-amber-600 dark:text-amber-400">Premium</SelectItem>
                            <SelectItem value="pro" className="rounded-lg font-medium text-purple-600 dark:text-purple-400">Pro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="w-full h-px bg-slate-200 dark:bg-slate-800" />

                  <FormField
                    control={form.control}
                    name="featureImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                          <ImageIcon className="w-4 h-4 text-pink-500" />
                          Feature Image URL
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com/image.jpg" 
                            className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-xl h-12"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription className="text-xs">Provide an absolute URL for the cover image.</FormDescription>
                        {field.value && (
                          <div className="mt-3 aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={field.value} 
                              alt="Feature preview" 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/f8fafc/94a3b8?text=Invalid+Image+URL';
                              }}
                            />
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </CardContent>
              </Card>
            </div>
            
          </div>
        </form>
      </Form>
    </div>
  );
}
