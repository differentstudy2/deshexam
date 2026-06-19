"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreateFAQDTO, FAQ, FAQStatus } from "../types/faq.types";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
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

  const defaultValues: FaqFormValues = initialData ? {
    question: initialData.question,
    answer: initialData.answer,
    categoryId: initialData.categoryId,
    tags: initialData.tags.join(", "),
    status: initialData.status,
    order: initialData.order,
    featured: initialData.featured,
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
    const formattedData: CreateFAQDTO = {
      ...values,
      tags: values.tags.split(",").map(t => t.trim()).filter(Boolean),
    };
    await onSubmit(formattedData);
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
        <div className="flex items-center gap-3">
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

            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};
