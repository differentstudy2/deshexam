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
    <div className="max-w-7xl mx-auto px-0 sm:px-0 lg:px-0 pb-20 pt-0">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column: Title + Main Content */}
            <div className="lg:col-span-2 flex flex-col gap-6">

              {/* Header section (Left side) */}
              <div className="flex items-center gap-4 h-14">
                <Button variant="outline" size="icon" className="rounded-lg shadow-sm h-10 w-10 flex-shrink-0" asChild>
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

              {/* Main Content Card */}
              <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 rounded-lg overflow-hidden">
                <CardHeader className="border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/50 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                      <Type className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold">Content Area</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        Craft your {contentType.toLowerCase()} masterpiece here.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-8">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-800 dark:text-slate-200">Post Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter a catchy title..."
                            className="text-base py-5 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 rounded-lg shadow-inner"
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
                        <FormLabel className="text-sm font-semibold text-slate-800 dark:text-slate-200">Body Content</FormLabel>
                        <FormControl>
                          <div className="rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 transition-shadow">
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

            {/* Right Column: Actions + Settings Sidebar */}
            <div className="flex flex-col gap-6">

              {/* Header section (Right side - Actions) */}
              <div className="flex items-center lg:justify-end gap-3 h-14">
                <Button variant="ghost" className="font-semibold text-slate-600 dark:text-slate-300 rounded-lg px-6 h-10" asChild>
                  <Link href={backUrl}>Cancel</Link>
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 shadow-sm transition-all duration-300 font-semibold text-sm h-10"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save {contentType}
                    </>
                  )}
                </Button>
              </div>

              {/* Sidebar Settings Card */}
              <div className="sticky top-6">
                <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 rounded-lg overflow-hidden">
                  <CardHeader className="border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/50 pb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                        <Layout className="w-5 h-5" />
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
                              <SelectTrigger className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-lg h-11">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-lg">
                              <SelectItem value="Published" className="rounded-md font-medium">Published (Public)</SelectItem>
                              <SelectItem value="Draft" className="rounded-md font-medium">Draft (Hidden)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="w-full h-px bg-slate-100 dark:bg-slate-800" />

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
                              <SelectTrigger className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-lg h-11">
                                <SelectValue placeholder="Select access level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-lg">
                              <SelectItem value="free" className="rounded-md font-medium text-emerald-600 dark:text-emerald-400">Free</SelectItem>
                              <SelectItem value="premium" className="rounded-md font-medium text-amber-600 dark:text-amber-400">Premium</SelectItem>
                              <SelectItem value="pro" className="rounded-md font-medium text-purple-600 dark:text-purple-400">Pro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="w-full h-px bg-slate-100 dark:bg-slate-800" />

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
                              className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-lg h-11"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-xs">Provide an absolute URL for the cover image.</FormDescription>
                          {field.value && (
                            <div className="mt-3 aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
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

          </div>
        </form>
      </Form>
    </div>
  );
}
