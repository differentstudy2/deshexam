'use client';

import { useEffect, useState } from 'react';
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
import { mockTests } from '@/lib/mock-data';
import { getTestById, updateTest } from '@/lib/firebase/firestore';
import { PlusCircle, Trash2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const optionSchema = z.object({
  text: z.string().min(1, 'Option text cannot be empty.'),
});

const questionSchema = z.object({
  text: z.string().min(1, 'Question text cannot be empty.'),
  type: z.enum(['Multiple Choice', 'True/False', 'Short Answer']),
  options: z.array(optionSchema).optional(),
  correctAnswer: z.string().min(1, 'Please specify the correct answer.'),
});

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  subject: z.string().min(1, 'Please select a subject.'),
  testType: z.string().min(1, 'Please select a content type.'),
  description: z.string().optional(),
  duration: z.coerce
    .number()
    .int()
    .positive('Duration must be a positive number of minutes.'),
  access: z.enum(['free', 'premium', 'pro']),
  questions: z.array(questionSchema).min(1, 'Please add at least one question.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditContentPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const subjects = Array.from(new Set(mockTests.map((test) => test.subject)));

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      subject: '',
      testType: 'Mock Test',
      description: '',
      duration: 60,
      access: 'free',
      questions: [],
    },
  });

  useEffect(() => {
    const fetchTest = async () => {
      try {
        setLoading(true);
        const testData = await getTestById(params.id);
        if (testData) {
            form.reset(testData as FormValues);
        } else {
            throw new Error("Test not found");
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: 'Error fetching test data',
          description: (error as Error).message,
        });
        router.push('/dashboard/my-content');
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [params.id, form, toast, router]);


  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'questions',
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      await updateTest(params.id, data);
      toast({
        title: 'Content Updated!',
        description: `The ${data.testType.toLowerCase()} "${data.title}" has been successfully updated.`,
      });
      router.push('/dashboard/my-content');
    } catch (error) {
       toast({
        variant: "destructive",
        title: 'Error Updating Content',
        description: (error as Error).message,
      });
    }
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="ml-4 text-lg">Loading Content Editor...</p>
        </div>
    )
  }

  return (
    <div>
      <h1 className="font-headline text-3xl font-bold">Edit Content</h1>
      <p className="text-muted-foreground mb-6">
        Modify the details of your content below.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Content Details</CardTitle>
              <CardDescription>
                Provide the essential information for your content.
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
                      <Input placeholder="e.g., NEET Full Syllabus Physics - 2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject} value={subject}>
                              {subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="testType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a content type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Mock Test">Mock Test</SelectItem>
                          <SelectItem value="Quiz">Quiz</SelectItem>
                           <SelectItem value="Practice Questions">Practice Questions</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide a brief description of the test content."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  name="access"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Access Level</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select access level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                          <SelectItem value="pro">Pro</SelectItem>
                        </SelectContent>
                      </Select>
                       <FormDescription>
                          Choose who can access this content.
                      </FormDescription>
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
                <CardDescription>Add or modify questions for your content.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 {fields.map((question, index) => {
                    const questionType = form.watch(`questions.${index}.type`);
                    return (
                        <Card key={question.id} className="p-4">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-semibold text-lg">Question {index + 1}</h4>
                                <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}>
                                    <Trash2 className="mr-2" />
                                    Remove Question
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
                                                <Textarea {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`questions.${index}.type`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Question Type</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select a question type" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Multiple Choice">Multiple Choice</SelectItem>
                                                    <SelectItem value="True/False">True/False</SelectItem>
                                                    <SelectItem value="Short Answer">Short Answer</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {questionType === 'Multiple Choice' && (
                                    <>
                                        <FormLabel>Options</FormLabel>
                                        <Controller
                                            control={form.control}
                                            name={`questions.${index}.correctAnswer`}
                                            render={({ field }) => (
                                                <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-2">
                                                    {[0, 1, 2, 3].map(optionIndex => (
                                                         <FormField
                                                            key={optionIndex}
                                                            control={form.control}
                                                            name={`questions.${index}.options.${optionIndex}.text`}
                                                            render={({ field: optionField }) => (
                                                                <FormItem className="flex items-center gap-4">
                                                                     <FormControl>
                                                                        <RadioGroupItem value={optionField.value} />
                                                                     </FormControl>
                                                                    <Input {...optionField} placeholder={`Option ${optionIndex + 1}`} />
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    ))}
                                                </RadioGroup>
                                            )}
                                        />
                                        <FormMessage>{form.formState.errors.questions?.[index]?.correctAnswer?.message}</FormMessage>

                                    </>
                                )}
                                {questionType === 'True/False' && (
                                     <FormField
                                        control={form.control}
                                        name={`questions.${index}.correctAnswer`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Correct Answer</FormLabel>
                                                <FormControl>
                                                    <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4">
                                                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="True" /></FormControl><FormLabel>True</FormLabel></FormItem>
                                                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="False" /></FormControl><FormLabel>False</FormLabel></FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                                {questionType === 'Short Answer' && (
                                    <FormField
                                        control={form.control}
                                        name={`questions.${index}.correctAnswer`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Answer</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Enter the correct answer" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>
                        </Card>
                    );
                 })}
            </CardContent>
            <CardFooter>
                 <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({ text: '', type: 'Multiple Choice', options: [{text: ''}, {text: ''}, {text: ''}, {text: ''}], correctAnswer: '' })}
                >
                    <PlusCircle className="mr-2" />
                    Add Question
                </Button>
            </CardFooter>
          </Card>
          
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Updating..." : "Update Content"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
