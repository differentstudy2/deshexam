
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
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
import { useToast } from '@/hooks/use-toast';
import { addContent } from '@/lib/firebase/firestore';
import { Loader2, Sparkles, PlusCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { ImageUploader } from '@/components/feature/image-uploader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const funQuizQuestionSchema = z.object({
  text: z.string().min(1, 'Question text cannot be empty.'),
  image: z.string().optional(),
  audio: z.string().optional(),
  options: z.array(z.object({ 
    text: z.string().min(1, "Option text cannot be empty."),
    image: z.string().optional(),
    audio: z.string().optional(),
  })).min(4).max(4),
  correctAnswer: z.string().min(1, "Please select a correct answer."),
});

const formSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
  featureImage: z.string().optional(),
  category: z.string().min(1, "Category is required."),
  body: z.string().optional(),
  questions: z.array(funQuizQuestionSchema).optional(),
});


type FormValues = z.infer<typeof formSchema>;


export default function AddKidsContentPage() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      featureImage: '',
      category: 'Fun Quizzes',
      body: '',
      questions: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'questions',
  });

  const handleFormSubmit = async (data: FormValues) => {
    try {
      const contentToSave: any = {
        title: data.title,
        description: data.description,
        featureImage: data.featureImage,
        testType: data.category === 'Fun Quizzes' ? 'Quiz' : 'Kids Zone',
        category: data.category,
        access: 'free',
        body: data.body,
        questions: data.category === 'Fun Quizzes' ? data.questions : [],
      };

      await addContent(contentToSave);
      toast({
        title: 'Content Created!',
        description: `The item "${data.title}" has been successfully saved.`,
      });
      
      form.reset();

    } catch (error) {
       toast({
        variant: "destructive",
        title: 'Error Creating Content',
        description: (error as Error).message,
      });
    }
  }
  
  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">Add Kids Zone Material</h1>
                <p className="text-muted-foreground">
                    Create a new game, quiz, or learning activity for the Kids Zone.
                </p>
            </div>
        </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Content Details</CardTitle>
                <CardDescription>
                  Provide the essential information for your new content.
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
                        <Input placeholder="e.g., Amazing Animals Quiz" {...field} />
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                         <Input placeholder="A fun quiz about all kinds of animals!" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Fun Quizzes">Fun Quizzes</SelectItem>
                          <SelectItem value="Learning Games">Learning Games</SelectItem>
                          <SelectItem value="Learning English">Learning English</SelectItem>
                           <SelectItem value="Learning Bengali">Learning Bengali</SelectItem>
                          <SelectItem value="Learning Hindi">Learning Hindi</SelectItem>
                          <SelectItem value="Learning Arabic">Learning Arabic</SelectItem>
                          <SelectItem value="Learning Urdu">Learning Urdu</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="featureImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Feature Image</FormLabel>
                      <FormControl>
                        <ImageUploader
                            fieldName={field.name}
                            onUrlChange={(url) => form.setValue('featureImage', url, { shouldValidate: true })}
                            value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {form.watch('category') !== 'Fun Quizzes' && (
                  <FormField
                    control={form.control}
                    name="body"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content Body (for non-quiz content)</FormLabel>
                        <FormControl>
                          <Textarea
                              {...field}
                              placeholder="Write your article or game description here."
                              className="min-h-[200px] font-mono"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {form.watch('category') === 'Fun Quizzes' && (
                    <div className="space-y-6 pt-4 border-t">
                        <h3 className="text-lg font-medium">Quiz Questions</h3>
                        {fields.map((question, index) => (
                            <Card key={question.id} className="p-4 bg-secondary/50">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-semibold">Question {index + 1}</h4>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </div>
                                <div className="space-y-4">
                                     <FormField control={form.control} name={`questions.${index}.text`} render={({ field }) => (<FormItem><FormLabel>Question Text</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={form.control} name={`questions.${index}.image`} render={({ field }) => (<FormItem><FormLabel>Question Image</FormLabel><FormControl><ImageUploader fieldName={field.name} onUrlChange={(url) => form.setValue(`questions.${index}.image`, url)} value={field.value}/></FormControl><FormMessage /></FormItem>)}/>
                                        <FormField control={form.control} name={`questions.${index}.audio`} render={({ field }) => (<FormItem><FormLabel>Question Audio URL</FormLabel><FormControl><Input {...field} placeholder="Audio URL" /></FormControl><FormMessage /></FormItem>)}/>
                                    </div>
                                    
                                     <div className="space-y-3 pt-2">
                                        <Label>Options</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                        {[0, 1, 2, 3].map(optionIndex => (
                                          <div key={optionIndex} className="space-y-3 p-3 border rounded-md bg-background">
                                            <Label>Option {optionIndex + 1}</Label>
                                            <FormField control={form.control} name={`questions.${index}.options.${optionIndex}.text`} render={({ field }) => (<FormItem><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                            <div className="grid grid-cols-2 gap-2">
                                                <FormField control={form.control} name={`questions.${index}.options.${optionIndex}.image`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Image</FormLabel><FormControl><ImageUploader fieldName={field.name} onUrlChange={(url) => form.setValue(`questions.${index}.options.${optionIndex}.image`, url)} value={field.value}/></FormControl><FormMessage /></FormItem>)}/>
                                                <FormField control={form.control} name={`questions.${index}.options.${optionIndex}.audio`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Audio</FormLabel><FormControl><Input {...field} placeholder="Audio URL" /></FormControl><FormMessage /></FormItem>)}/>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                     <FormField
                                        control={form.control}
                                        name={`questions.${index}.correctAnswer`}
                                        render={({ field }) => (
                                            <FormItem className="space-y-3 pt-4">
                                            <FormLabel>Correct Answer</FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                    className="mt-2 grid grid-cols-2 gap-2"
                                                >
                                                    {form.watch(`questions.${index}.options`)?.map((option, optionIndex) => (
                                                        option.text ? (
                                                            <FormItem key={optionIndex} className="flex items-center space-x-3 space-y-0 p-2 border rounded-md bg-background has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                                                                <FormControl>
                                                                    <RadioGroupItem value={option.text} id={`q-${index}-opt-${optionIndex}`} />
                                                                </FormControl>
                                                                <FormLabel htmlFor={`q-${index}-opt-${optionIndex}`} className="font-normal w-full truncate cursor-pointer">
                                                                    {option.text}
                                                                </FormLabel>
                                                            </FormItem>
                                                        ) : null
                                                    ))}
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </Card>
                        ))}
                        <Button type="button" variant="outline" onClick={() => append({ text: '', options: [{text: ''}, {text: ''}, {text: ''}, {text: ''}], correctAnswer: '' })}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Question
                        </Button>
                    </div>
                )}
              </CardContent>
            </Card>
          <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Save Content"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
