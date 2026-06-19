'use client';

import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addFaq, getFaqs, deleteFaq, updateFaq } from '@/lib/firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

const faqSchema = z.object({
  question: z.string().min(5, "Question must be at least 5 characters.").max(200),
  answer: z.string().min(10, "Answer must be at least 10 characters."),
  category: z.string().min(2, "Please select a category."),
  isActive: z.boolean().default(true),
});

type FaqFormValues = z.infer<typeof faqSchema>;

type Faq = {
  id: string;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
  createdAt: string;
}

const CATEGORIES = [
  "General",
  "Account",
  "Mock Tests",
  "Payments",
  "Subscription & Pricing",
  "Technical Issues"
];

export default function FaqsAdminPage() {
  const { toast } = useToast();
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<FaqFormValues>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: '',
      answer: '',
      category: 'General',
      isActive: true,
    },
  });

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const fetchedFaqs = await getFaqs();
      setFaqs(fetchedFaqs as Faq[]);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching FAQs",
        description: (error as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchFaqs();
  }, [toast]);

  const onSubmit: SubmitHandler<FaqFormValues> = async (data) => {
    try {
      await addFaq(data);
      toast({
        title: "FAQ Created!",
        description: `Your new FAQ has been successfully added.`,
      });
      form.reset({
        question: '',
        answer: '',
        category: data.category, // keep the same category selected for convenience
        isActive: true,
      });
      fetchFaqs(); // Refresh the list
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Creating FAQ",
        description: (error as Error).message,
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      await deleteFaq(id);
      toast({
        title: "FAQ Deleted",
        description: "The FAQ has been removed successfully."
      });
      fetchFaqs();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Deleting FAQ",
        description: (error as Error).message,
      });
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateFaq(id, { isActive: !currentStatus });
      toast({
        title: "Status Updated",
        description: "FAQ visibility has been updated."
      });
      fetchFaqs();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Updating Status",
        description: (error as Error).message,
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">Manage FAQs</h1>
        <p className="text-muted-foreground">
          Create, categorize, and manage Frequently Asked Questions for your users.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New FAQ</CardTitle>
          <CardDescription>Fill out the form below to add a new question to the database.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., How do I start a mock test?" {...field} />
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
                      <Textarea placeholder="Provide a clear, helpful answer..." rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Publish FAQ</FormLabel>
                        <CardDescription>
                          Make this FAQ instantly visible to students.
                        </CardDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Creating..." : "Create FAQ"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Existing FAQs</CardTitle>
          <CardDescription>Here is a list of all FAQs currently in the system.</CardDescription>
        </CardHeader>
        <CardContent>
           {loading ? (
             <div className="flex items-center justify-center min-h-[200px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
             </div>
           ) : (
             <div className="rounded-md border">
               <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Question</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created On</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faqs.length > 0 ? (
                    faqs.map((faq) => (
                      <TableRow key={faq.id}>
                        <TableCell className="font-medium">
                          <div className="line-clamp-2" title={faq.question}>{faq.question}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-slate-50 text-slate-700">
                            {faq.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                           <Switch 
                             checked={faq.isActive}
                             onCheckedChange={() => handleToggleStatus(faq.id, faq.isActive)}
                             title="Toggle Visibility"
                           />
                        </TableCell>
                         <TableCell className="text-slate-500 text-sm whitespace-nowrap">{faq.createdAt}</TableCell>
                         <TableCell className="text-right">
                           <Button variant="ghost" size="icon" onClick={() => handleDelete(faq.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                             <Trash2 className="w-4 h-4" />
                           </Button>
                         </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                        No FAQs found. Create one above to get started!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
             </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
