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
import { Loader2, Save, ArrowLeft, Image as ImageIcon, Type, Layout, ShieldCheck, CheckCircle2, Tag, FolderTree, Upload, Link as LinkIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase/client';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  slug: z.string().optional(),
  description: z.string().min(1, 'Content description is required.'),
  featureImage: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [siteHost, setSiteHost] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSiteHost(window.location.host);
    }
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      featureImage: initialData?.featureImage || '',
      category: initialData?.category || '',
      tags: initialData?.tags || '',
      access: initialData?.access || 'free',
      testType: initialData?.testType || [contentType],
      status: initialData?.status || 'Published',
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      form.setValue('featureImage', ''); // Clear manual URL if a file is uploaded
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSaving(true);

      let finalImageUrl = data.featureImage;

      if (imageFile) {
        const storageRef = ref(storage, `images/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        finalImageUrl = await getDownloadURL(storageRef);
      }

      const payload = {
        ...data,
        featureImage: finalImageUrl,
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
    <div className="max-w-7xl mx-auto px-0 sm:px-0 lg:px-0 pb-0 pt-0">
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
                <CardHeader className="border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/50 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                      <Type className="w-4 h-4" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold">Content Area</CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        Craft your {contentType.toLowerCase()} masterpiece here.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-3">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-800 dark:text-slate-200">Post Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter a catchy title..."
                            className="text-sm py-3 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 rounded-lg shadow-inner"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              const currentSlug = form.getValues('slug');
                              // Auto-generate slug if it's empty or we are in create mode and haven't manually touched it much
                              if (!currentSlug || currentSlug === e.target.value.slice(0, -1).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')) {
                                const generatedSlug = e.target.value
                                  .toLowerCase()
                                  .replace(/[^a-z0-9]+/g, '-')
                                  .replace(/(^-|-$)+/g, '');
                                form.setValue('slug', generatedSlug, { shouldValidate: true });
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
                          Slug
                        </FormLabel>
                        <FormControl>
                          <div className="flex rounded-lg shadow-inner">
                            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm whitespace-nowrap">
                              {siteHost ? `${siteHost}/${contentType.toLowerCase()}/` : `.../${contentType.toLowerCase()}/`}
                            </span>
                            <Input
                              placeholder="url-friendly-slug"
                              className="text-sm py-3 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 rounded-r-lg rounded-l-none flex-1"
                              {...field}
                            />
                          </div>
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
                  <CardHeader className="border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                        <Layout className="w-4 h-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold">Post Settings</CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                          Configure metadata and visibility.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              Publish Status
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-lg h-9 text-sm">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-lg">
                                <SelectItem value="Published" className="rounded-md font-medium text-sm">Published</SelectItem>
                                <SelectItem value="Draft" className="rounded-md font-medium text-sm">Draft</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="access"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                              Access Level
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-lg h-9 text-sm">
                                  <SelectValue placeholder="Select access" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-lg">
                                <SelectItem value="free" className="rounded-md font-medium text-sm text-emerald-600 dark:text-emerald-400">Free</SelectItem>
                                <SelectItem value="premium" className="rounded-md font-medium text-sm text-amber-600 dark:text-amber-400">Premium</SelectItem>
                                <SelectItem value="pro" className="rounded-md font-medium text-sm text-purple-600 dark:text-purple-400">Pro</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="w-full h-px bg-slate-100 dark:bg-slate-800 my-4" />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                              <FolderTree className="w-3.5 h-3.5 text-blue-500" />
                              Category
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Technology" className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-lg h-9 text-sm" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="tags"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                              <Tag className="w-3.5 h-3.5 text-orange-500" />
                              Tags
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="comma, separated" className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-lg h-9 text-sm" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 rounded-lg overflow-hidden">
                  <CardHeader className="border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-lg">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold">Feature Image</CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                          Set the cover image.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <FormField
                      control={form.control}
                      name="featureImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input
                                placeholder="https://example.com/image.jpg"
                                className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-lg h-9 text-sm flex-1"
                                {...field}
                                disabled={!!imageFile}
                              />
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                ref={fileInputRef} 
                                onChange={handleImageChange} 
                              />
                              <Button 
                                type="button" 
                                variant="secondary" 
                                className="h-9 px-3 rounded-lg flex-shrink-0"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <Upload className="w-4 h-4 mr-1.5" />
                                Upload
                              </Button>
                            </div>
                          </FormControl>
                          <FormDescription className="text-xs">
                            Provide a URL or upload a new image.
                          </FormDescription>
                          
                          {(imagePreview || field.value) && (
                            <div className="mt-3 relative aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 group">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={imagePreview || field.value}
                                alt="Feature preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/f8fafc/94a3b8?text=Invalid+Image+URL';
                                }}
                              />
                              {imageFile && (
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Button 
                                    type="button" 
                                    variant="destructive" 
                                    size="sm" 
                                    onClick={() => {
                                      setImageFile(null);
                                      setImagePreview(null);
                                      if (fileInputRef.current) fileInputRef.current.value = '';
                                    }}
                                  >
                                    Remove File
                                  </Button>
                                </div>
                              )}
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
