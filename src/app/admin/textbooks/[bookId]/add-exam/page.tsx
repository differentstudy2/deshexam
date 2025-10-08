
'use client';

import { useForm, SubmitHandler, useFieldArray, Controller } from 'react-hook-form';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { addContent, uploadFile } from '@/lib/firebase/firestore';
import { PlusCircle, Trash2, Loader2, Save, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';


const optionSchema = z.object({
  text: z.string().min(1, 'Option text cannot be empty.'),
  explanation: z.string().optional(),
});

const questionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, 'Question text cannot be empty.'),
  type: z.enum(['Multiple Choice', 'True/False', 'Short Answer', 'Fill in the Blank', 'Matching']),
  marks: z.coerce.number().int().min(1, 'Marks must be a positive number.').describe('The marks allocated for the question.'),
  options: z.array(optionSchema).optional(),
  matchingOptions: z.object({
      columnA: z.array(z.object({ text: z.string(), image: z.string().optional() })),
      columnB: z.array(z.object({ text: z.string(), image: z.string().optional() })),
  }).optional(),
  correctAnswer: z.any().optional(),
  explanation: z.string().optional(),
});

const formSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  duration: z.coerce
    .number()
    .int()
    .positive('Duration must be a positive number of minutes.').optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
  access: z.enum(['free', 'premium', 'pro']),
  price: z.coerce.number().optional(),
  subscriptionPlan: z.enum(['pass', 'pro']).optional(),
  questions: z.array(questionSchema).optional(),
});

type FormValues = z.infer<typeof formSchema>;


export default function AddTextbookExamPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const textbookId = params.bookId as string;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      duration: 0,
      difficulty: 'Medium',
      access: 'free',
      price: undefined,
      subscriptionPlan: 'pass',
      questions: [],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'questions',
  });
  
  const questions = form.watch('questions');
  
  const handleFormSubmit = async (data: FormValues) => {
    try {
      const contentToSave: any = { 
        ...data, 
        testType: 'Exam',
        textbookId: textbookId,
      };
      
      await addContent(contentToSave);
      toast({
        title: 'Exam Created!',
        description: `The exam "${data.title}" has been successfully saved.`,
      });
      
      router.push(`/admin/textbooks/${textbookId}/exams`);

    } catch (error) {
       toast({
        variant: "destructive",
        title: 'Error Creating Exam',
        description: (error as Error).message,
      });
    }
  }

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">Add New Exam</h1>
                <p className="text-muted-foreground">
                    Create a new exam for this textbook.
                </p>
            </div>
             <Button asChild variant="outline">
                <Link href={`/admin/textbooks/${textbookId}/exams`}>
                    Back to Exams
                </Link>
            </Button>
        </div>


      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Exam Details</CardTitle>
              <CardDescription>
                Provide the essential information for your new exam.
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
                      <Input placeholder="e.g., Final Exam - Physics" {...field} />
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
                    <FormLabel>Description / Summary</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide a brief description of the exam."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (in minutes)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value ?? 'Medium'}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a difficulty" />
                            </SelectTrigger>
                          </FormControl>
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
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
                <CardTitle>Questions</CardTitle>
                <CardDescription>Add questions to your exam.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {fields.map((question, index) => {
                    return (
                        <Card key={question.id} className="p-4">
                            <div className="flex justify-between items-center mb-4 gap-4">
                                <h4 className="font-semibold text-lg whitespace-nowrap">Question {index + 1}</h4>
                                <FormField
                                    control={form.control}
                                    name={`questions.${index}.type`}
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select a question type" /></SelectTrigger></FormControl>
                                                <SelectContent>
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
                                <FormField
                                    control={form.control}
                                    name={`questions.${index}.marks`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input type="number" placeholder="Marks" className="w-24" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Remove
                                </Button>
                            </div>
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name={`questions.${index}.text`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Question Text</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {/* ... More question type fields will be added here ... */}
                            </div>
                        </Card>
                    );
                })}
            </CardContent>
            <CardFooter>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      append({ 
                          text: '', 
                          type: 'Multiple Choice', 
                          marks: 1, 
                          options: [{text: '', explanation: ''}, {text: '', explanation: ''}, {text: '', explanation: ''}, {text: '', explanation: ''}], 
                          correctAnswer: '', 
                          explanation: '' 
                      });
                  }}
                >
                    <PlusCircle className="mr-2" />
                    Add Question
                </Button>
            </CardFooter>
          </Card>
          
           <div className="flex items-center gap-4">
                <Button 
                    type="submit"
                    disabled={form.formState.isSubmitting}
                >
                    {form.formState.isSubmitting ? "Saving Exam..." : "Save Exam"}
                </Button>
           </div>
        </form>
      </Form>
    </div>
  );
}
