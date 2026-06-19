"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { CreateFAQDTO, FAQ, FAQStatus, FAQCategory } from "../types/faq.types";
import { getCategories } from "../services/faq.api";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Save, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

const faqSchema = z.object({
  question: z.string().min(5, "Question must be at least 5 characters."),
  answer: z.string().min(10, "Answer must be at least 10 characters."),
  categoryId: z.string().min(2, "Please select a category."),
  tags: z.string().min(2, "Provide at least one tag."),
  status: z.enum(["draft", "published", "hidden"]),
  order: z.coerce.number().min(0).default(0),
  featured: z.boolean().default(false),
  views: z.coerce.number().min(0).default(0),
  helpfulVotes: z.coerce.number().min(0).default(0),
  unhelpfulVotes: z.coerce.number().min(0).default(0),
  seo: z.object({
    slug: z.string().min(2, "Slug is required."),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    schemaEnabled: z.boolean().default(true),
  }),
});

type FaqFormValues = z.infer<typeof faqSchema>;

interface FAQFormProps {
  initialData?: FAQ;
  onSubmit: (data: CreateFAQDTO) => Promise<void>;
  isSubmitting: boolean;
  title: string;
}

export const FAQForm = ({ initialData, onSubmit, isSubmitting, title }: FAQFormProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [categories, setCategories] = useState<FAQCategory[]>([]);

  // AI State
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  const defaultValues: FaqFormValues = initialData ? {
    question: initialData.question,
    answer: initialData.answer,
    categoryId: initialData.categoryId,
    tags: initialData.tags.join(", "),
    status: initialData.status,
    order: initialData.order,
    featured: initialData.featured,
    views: initialData.views || 0,
    helpfulVotes: initialData.helpfulVotes || 0,
    unhelpfulVotes: initialData.unhelpfulVotes || 0,
    seo: {
      slug: initialData.seo.slug,
      metaTitle: initialData.seo.metaTitle || "",
      metaDescription: initialData.seo.metaDescription || "",
      schemaEnabled: initialData.seo.schemaEnabled,
    }
  } : {
    question: "",
    answer: "",
    categoryId: "general",
    tags: "",
    status: "draft",
    order: 0,
    featured: false,
    views: 0,
    helpfulVotes: 0,
    unhelpfulVotes: 0,
    seo: {
      slug: "",
      metaTitle: "",
      metaDescription: "",
      schemaEnabled: true,
    }
  };

  const form = useForm<FaqFormValues>({
    resolver: zodResolver(faqSchema),
    defaultValues,
  });

  const handleSlugAutoGenerate = (question: string) => {
    if (!form.getValues("seo.slug") && question.length > 3) {
      const slug = question.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      form.setValue("seo.slug", slug, { shouldValidate: true });
    }
  };

  const handleSubmit: SubmitHandler<FaqFormValues> = async (values) => {
    const formattedData = {
      ...values,
      tags: values.tags.split(",").map(t => t.trim()).filter(Boolean),
    } as CreateFAQDTO;
    await onSubmit(formattedData);
  };

  const handleAIGenerate = async () => {
    if (!aiTopic.trim()) return;
    try {
      setIsGenerating(true);
      const res = await fetch("/api/ai/generate-faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: aiTopic }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");

      form.setValue("question", data.question || "", { shouldValidate: true });
      form.setValue("answer", data.answer || "", { shouldValidate: true });
      form.setValue("tags", data.tags?.join(", ") || "", { shouldValidate: true });
      form.setValue("seo.slug", data.seo?.slug || "", { shouldValidate: true });
      form.setValue("seo.metaTitle", data.seo?.metaTitle || "", { shouldValidate: true });
      form.setValue("seo.metaDescription", data.seo?.metaDescription || "", { shouldValidate: true });

      toast({ title: "AI Generation Complete", description: "Please review the generated content." });
      setIsAiDialogOpen(false);
      setAiTopic("");
    } catch (error: any) {
      toast({ variant: "destructive", title: "AI Error", description: error.message });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/faqs">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-purple-700 hover:bg-purple-100 dark:text-purple-400 dark:hover:bg-purple-900/50 border-purple-200 dark:border-purple-800">
                <Sparkles className="w-4 h-4 mr-2" /> Auto-Generate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate FAQ with AI</DialogTitle>
                <DialogDescription>
                  Enter a topic or rough question, and our AI will draft the full FAQ content, tags, and SEO metadata.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Input
                  placeholder="e.g. 'Refund Policy' or 'How to reset password'"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAIGenerate(); }}
                  disabled={isGenerating}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAiDialogOpen(false)} disabled={isGenerating}>Cancel</Button>
                <Button onClick={handleAIGenerate} disabled={isGenerating || !aiTopic.trim()}>
                  {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  Generate
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.setValue("status", "draft");
              form.handleSubmit(handleSubmit)();
            }}
            disabled={isSubmitting}
          >
            Save as Draft
          </Button>
          <Button
            type="submit"
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {initialData ? "Update & Save" : "Save & Publish"}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            <div className="lg:col-span-2 space-y-8">
              {/* Core Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Core Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="question"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., How do I start a mock test?"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              handleSlugAutoGenerate(e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="answer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Answer</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Provide a detailed, helpful answer..."
                            className="min-h-[200px] resize-y"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* SEO Panel */}
              <Card>
                <CardHeader>
                  <CardTitle>SEO Optimization</CardTitle>
                  <CardDescription>Configure how this FAQ appears in search engines.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="seo.slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL Slug</FormLabel>
                        <FormControl>
                          <Input placeholder="how-to-start-mock-test" {...field} />
                        </FormControl>
                        <FormDescription>deshexam.com/faq/{"{slug}"}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="seo.metaTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Optional custom title for search results" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="seo.metaDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Optional custom description..." rows={2} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="seo.schemaEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Enable FAQ Schema</FormLabel>
                          <FormDescription>Injects structured data for Google Rich Snippets.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Settings */}
            <div className="space-y-8">
              {/* Classification */}
              <Card>
                <CardHeader>
                  <CardTitle>Classification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. login, password, reset" {...field} />
                        </FormControl>
                        <FormDescription>Comma separated tags.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="hidden">Hidden</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Featured FAQ</FormLabel>
                          <FormDescription>Show at the top of lists.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority Order</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>Lower numbers appear first.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="views"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Views</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="helpfulVotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Helpful</FormLabel>
                          <FormControl>
                            <Input type="number" className="text-emerald-600 font-medium" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="unhelpfulVotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unhelpful</FormLabel>
                          <FormControl>
                            <Input type="number" className="text-red-500 font-medium" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </form>
      </Form>

      {/* Mobile Floating Action Bar */}
      <div className="md:hidden fixed bottom-2 left-1/2 -translate-x-1/2 w-[90%] max-w-[340px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-full shadow-xl flex items-center justify-between px-6 py-3 z-50">
        <Button
          variant="ghost"
          onClick={() => setIsAiDialogOpen(true)}
          className="text-purple-600 dark:text-purple-400 hover:text-purple-700 hover:bg-purple-50 p-2 flex flex-col items-center justify-center gap-1 h-auto"
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-wide">AI Draft</span>
        </Button>

        <Button
          onClick={form.handleSubmit(handleSubmit)}
          disabled={isSubmitting}
          className="relative group bg-transparent hover:bg-transparent border-0 h-auto p-0"
        >
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-indigo-600 text-white p-3.5 rounded-full shadow-lg shadow-indigo-500/30 group-hover:bg-indigo-700 transition-colors">
            {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
          </div>
          <div className="flex flex-col items-center justify-center gap-1 mt-6 text-indigo-600 dark:text-indigo-400">
            <span className="text-[10px] font-bold tracking-wide">{initialData ? "Update" : "Publish"}</span>
          </div>
        </Button>

        <Button
          variant="ghost"
          onClick={() => {
            form.setValue("status", "draft");
            form.handleSubmit(handleSubmit)();
          }}
          disabled={isSubmitting}
          className="text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-100 p-2 flex flex-col items-center justify-center gap-1 h-auto"
        >
          <Save className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-wide">Draft</span>
        </Button>
      </div>

    </div>
  );
};
