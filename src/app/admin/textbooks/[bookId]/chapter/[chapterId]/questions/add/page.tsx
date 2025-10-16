
'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, PlusCircle, Trash2, GripVertical, FileJson, Save, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ImageUploader } from '@/components/feature/image-uploader';


const optionSchema = z.object({
  text: z.string().optional(),
  explanation: z.string().optional(),
});

const matchingPairSchema = z.object({
    a: z.string().optional(),
    aImage: z.string().optional(),
    b: z.string().optional(),
    bImage: z.string().optional(),
});

const subQuestionSchema = z.object({
  id: z.string().optional(),
  text: z.string().optional(),
  type: z.enum(['Multiple Choice', 'True/False', 'Short Answer', 'Fill in the Blank', 'Matching']),
  marks: z.coerce.number().optional(),
  options: z.array(optionSchema).optional(),
  correctAnswer: z.any().optional(),
  explanation: z.string().optional(),
});

const questionSchema = z.object({
  text: z.string().optional(),
  type: z.enum(['Multiple Choice', 'True/False', 'Short Answer', 'Fill in the Blank', 'Matching', 'Grouped']),
  marks: z.coerce.number().int().min(1, 'Marks must be a positive number.').default(1),
  options: z.array(optionSchema).optional(),
  correctAnswer: z.any().optional(),
  explanation: z.string().optional(),
  subQuestions: z.array(subQuestionSchema).optional(),
});


type QuestionFormValues = z.infer<typeof questionSchema>;


const MatchingPairsField = ({ control, fieldNamePrefix, setValue }: { control: any, fieldNamePrefix: string, setValue: any }) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `${fieldNamePrefix}.correctAnswer` as any,
    });

    return (
        <div className='space-y-4'>
            <FormLabel>Matching Pairs</FormLabel>
            <FormDescription>
                Add the correct pairs for the matching question. The options in Column B will be shuffled for the student.
            </FormDescription>
            <div className='grid grid-cols-[1fr_auto_1fr] items-center gap-2 font-semibold text-center'>
                <div>Column A</div>
                <div></div>
                <div>Column B</div>
            </div>
            {fields.map((pair, pairIndex) => (
                <div key={pair.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                        <FormLabel className="text-sm">Pair {pairIndex + 1}</FormLabel>
                        <Button type="button" variant="ghost" size="sm" onClick={() => remove(pairIndex)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                    <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-4">
                        <div className="space-y-2">
                            <FormField control={control} name={`${fieldNamePrefix}.correctAnswer.${pairIndex}.a`} render={({ field }) => <Input {...field} placeholder={`Item A${pairIndex + 1} Text`} />} />
                            <Controller control={control} name={`${fieldNamePrefix}.correctAnswer.${pairIndex}.aImage`} render={({ field }) => (
                                <ImageUploader fieldName={field.name} onUrlChange={(url) => setValue(`${fieldNamePrefix}.correctAnswer.${pairIndex}.aImage`, url, { shouldValidate: true })} value={field.value} />
                            )} />
                        </div>
                        <GripVertical className="h-5 w-5 text-muted-foreground pt-2" />
                        <div className="space-y-2">
                             <FormField control={control} name={`${fieldNamePrefix}.correctAnswer.${pairIndex}.b`} render={({ field }) => <Input {...field} placeholder={`Item B${pairIndex + 1} Text`} />} />
                             <Controller control={control} name={`${fieldNamePrefix}.correctAnswer.${pairIndex}.bImage`} render={({ field }) => (
                                <ImageUploader fieldName={field.name} onUrlChange={(url) => setValue(`${fieldNamePrefix}.correctAnswer.${pairIndex}.bImage`, url, { shouldValidate: true })} value={field.value} />
                            )} />
                        </div>
                    </div>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => append({ a: '', aImage: '', b: '', bImage: '' })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Pair
            </Button>
        </div>
    );
};

const GroupedQuestionsField = ({ control, setValue, getValues }: { control: any, setValue: any, getValues: any }) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "subQuestions",
    });

    const subQuestionTypes = useWatch({
        control,
        name: "subQuestions",
    });

    return (
        <div className="space-y-4">
            <FormLabel>Sub-Questions</FormLabel>
            <FormDescription>Add the individual questions that fall under the main instruction.</FormDescription>
            {fields.map((field, index) => {
                const subQuestionType = subQuestionTypes?.[index]?.type;
                return (
                <Card key={field.id} className="p-4 bg-secondary/50">
                    <div className="flex justify-between items-center mb-2">
                         <FormLabel>Sub-Question {index + 1}</FormLabel>
                         <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4 text-destructive"/>
                        </Button>
                    </div>
                    <div className="space-y-4">
                        <FormField control={control} name={`subQuestions.${index}.text`} render={({ field }) => (
                            <FormItem><FormLabel className="text-xs">Question Text</FormLabel><FormControl><Input {...field} placeholder="e.g., Who is Bina?" /></FormControl><FormMessage/></FormItem>
                        )}/>
                        <FormField
                            control={control}
                            name={`subQuestions.${index}.type`}
                            render={({ field: typeField }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">Question Type</FormLabel>
                                    <Select onValueChange={typeField.onChange} defaultValue={typeField.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="Short Answer">Short Answer</SelectItem>
                                            <SelectItem value="Fill in the Blank">Fill in the Blank</SelectItem>
                                            <SelectItem value="Multiple Choice">Multiple Choice</SelectItem>
                                            <SelectItem value="True/False">True/False</SelectItem>
                                            <SelectItem value="Matching">Matching</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         {/* Dynamically render fields based on sub-question type */}
                        
                                {subQuestionType === 'Multiple Choice' && (
                                    <div className="space-y-2">
                                        <FormLabel className="text-xs">Options</FormLabel>
                                        <RadioGroup onValueChange={(val) => setValue(`subQuestions.${index}.correctAnswer`, val)}>
                                            {[0, 1, 2, 3].map(optIndex => (
                                                <div key={optIndex} className="flex items-center gap-2">
                                                    <RadioGroupItem value={getValues(`subQuestions.${index}.options.${optIndex}.text`) || ''} />
                                                    <FormField control={control} name={`subQuestions.${index}.options.${optIndex}.text`} render={({ field }) => (
                                                        <Input {...field} placeholder={`Option ${optIndex + 1}`} />
                                                    )}/>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </div>
                                )}
                                {subQuestionType === 'True/False' && (
                                    <FormField control={control} name={`subQuestions.${index}.correctAnswer`} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">Correct Answer</FormLabel>
                                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="True" /></FormControl><FormLabel className="font-normal">True</FormLabel></FormItem>
                                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="False" /></FormControl><FormLabel className="font-normal">False</FormLabel></FormItem>
                                            </RadioGroup>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                )}
                                {subQuestionType === 'Matching' && (
                                    <MatchingPairsField control={control} fieldNamePrefix={`subQuestions.${index}`} setValue={setValue} />
                                )}
                                {(subQuestionType === 'Short Answer' || subQuestionType === 'Fill in the Blank') && (
                                    <FormField control={control} name={`subQuestions.${index}.correctAnswer`} render={({ field }) => (
                                        <FormItem><FormLabel className="text-xs">Correct Answer</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                                    )}/>
                                )}

                        <FormField control={control} name={`subQuestions.${index}.explanation`} render={({ field }) => (
                             <FormItem><FormLabel className="text-xs">Explanation (Optional)</FormLabel><FormControl><Textarea {...field} placeholder="Optional explanation" rows={2}/></FormControl></FormItem>
                        )}/>
                    </div>
                </Card>
                )
            })}
            <Button type="button" variant="outline" size="sm" onClick={() => append({ text: '', correctAnswer: '', explanation: '', marks: 1, type: 'Short Answer' })}>
                <PlusCircle className="mr-2 h-4 w-4"/> Add Sub-Question
            </Button>
        </div>
    );
}


export default function AddChapterQuestionPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();

    const textbookId = params.bookId as string;
    const chapterId = params.chapterId as string;

    const form = useForm<QuestionFormValues>({
        resolver: zodResolver(questionSchema),
        defaultValues: {
            text: '',
            type: 'Multiple Choice',
            marks: 1,
            options: Array(4).fill({ text: '', explanation: '' }),
            correctAnswer: '',
            explanation: '',
            subQuestions: [],
        },
    });

    const questionType = form.watch('type');

    useEffect(() => {
        if (questionType === 'Matching') {
            form.setValue('correctAnswer', []);
        } else if (questionType === 'True/False') {
             form.setValue('options', [{text: 'True', explanation: ''}, {text: 'False', explanation: ''}]);
             form.setValue('correctAnswer', '');
        } else if (questionType === 'Grouped') {
             form.setValue('subQuestions', []);
        } else {
            form.setValue('correctAnswer', '');
        }
    }, [questionType, form]);


    const onSubmit = async (data: QuestionFormValues) => {
        try {
            const chapterRef = doc(db, `textbooks/${textbookId}/chapters`, chapterId);
            const newQuestion = { ...data, id: new Date().getTime().toString() };
            
            await updateDoc(chapterRef, {
                textbookQuestions: arrayUnion(newQuestion)
            });
            
            toast({ title: "Question Added", description: "The new question has been added to the chapter." });
            router.push(`/admin/textbooks/${textbookId}/chapter/${chapterId}/questions`);

        } catch (error) {
            toast({ variant: 'destructive', title: 'Error adding question', description: (error as Error).message });
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <Button asChild variant="ghost">
                    <Link href={`/admin/textbooks/${textbookId}/chapter/${chapterId}/questions`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Questions
                    </Link>
                </Button>
            </div>
            <header>
                <h1 className="font-headline text-3xl font-bold">Add New Question</h1>
                <p className="text-muted-foreground mt-1">Create a new textbook question and solution for this chapter.</p>
            </header>
            
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                        <CardHeader><CardTitle>Question Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                           <FormField name="text" control={form.control} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{questionType === 'Grouped' ? 'Main Instruction / Passage' : 'Question Text'}</FormLabel>
                                    <FormControl><Textarea {...field} /></FormControl>
                                    <FormDescription>
                                        {questionType === 'Fill in the Blank' && 'Use four underscores `____` to indicate where the blank should be.'}
                                        {questionType === 'Matching' && 'Provide the instruction for matching, e.g., "Match the items from Column A to Column B."'}
                                        {questionType === 'Grouped' && 'Enter the main instruction or passage that applies to all sub-questions below.'}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField name="type" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel>Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="Multiple Choice">Multiple Choice</SelectItem>
                                                <SelectItem value="True/False">True/False</SelectItem>
                                                <SelectItem value="Short Answer">Short Answer</SelectItem>
                                                <SelectItem value="Fill in the Blank">Fill in the Blank</SelectItem>
                                                <SelectItem value="Matching">Matching</SelectItem>
                                                <SelectItem value="Grouped">Grouped Questions</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    <FormMessage /></FormItem>
                                )}/>
                                <FormField name="marks" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel>Marks</FormLabel><FormControl><Input type="number" {...field} disabled={questionType === 'Matching' || questionType === 'Grouped'} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>
                            
                            {questionType === 'Multiple Choice' && (
                                <div className="space-y-4">
                                    <FormLabel>Options</FormLabel>
                                    <FormDescription>Select the radio button next to the correct answer.</FormDescription>
                                    <Controller
                                        control={form.control}
                                        name="correctAnswer"
                                        render={({ field }) => (
                                            <RadioGroup onValueChange={field.onChange} value={field.value || ''} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {[0, 1, 2, 3].map((optionIndex) => (
                                                    <div key={optionIndex} className="flex items-start gap-3">
                                                        <FormControl className="mt-2.5">
                                                             <RadioGroupItem value={form.getValues(`options.${optionIndex}.text`)} disabled={!form.getValues(`options.${optionIndex}.text`)} />
                                                        </FormControl>
                                                        <div className="flex-1 space-y-1">
                                                            <FormField control={form.control} name={`options.${optionIndex}.text`} render={({ field: optionField }) => (
                                                                <Input {...optionField} placeholder={`Option ${optionIndex + 1}`} />
                                                            )}/>
                                                             <FormField control={form.control} name={`options.${optionIndex}.explanation`} render={({ field: expField }) => (
                                                                <Textarea {...expField} placeholder={`Explanation (optional)`} className="text-xs" />
                                                            )}/>
                                                        </div>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        )}
                                    />
                                    <FormMessage>{form.formState.errors.correctAnswer?.message}</FormMessage>
                                </div>
                            )}

                             {questionType === 'True/False' && (
                                <div className="space-y-4">
                                    <FormField name="correctAnswer" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Correct Answer</FormLabel>
                                            <FormDescription>Select the correct option.</FormDescription>
                                            <FormControl>
                                                <RadioGroup onValueChange={field.onChange} value={field.value || ''} className="flex gap-4">
                                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="True" /></FormControl><FormLabel className="font-normal">True</FormLabel></FormItem>
                                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="False" /></FormControl><FormLabel className="font-normal">False</FormLabel></FormItem>
                                                </RadioGroup>
                                            </FormControl>
                                        <FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={form.control} name="options.0.explanation" render={({ field }) => (<FormItem><FormLabel>Explanation for "True"</FormLabel><FormControl><Textarea {...field}/></FormControl></FormItem>)} />
                                    <FormField control={form.control} name="options.1.explanation" render={({ field }) => (<FormItem><FormLabel>Explanation for "False"</FormLabel><FormControl><Textarea {...field}/></FormControl></FormItem>)} />
                                </div>
                            )}

                            {questionType === 'Matching' && (
                                <MatchingPairsField control={form.control} fieldNamePrefix="" setValue={form.setValue} />
                            )}
                            
                            {(questionType === 'Short Answer' || questionType === 'Fill in the Blank') && (
                                <FormField name="correctAnswer" control={form.control} render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Correct Answer</FormLabel>
                                        <FormDescription>Provide the exact answer for this question.</FormDescription>
                                        <FormControl><Input {...field} /></FormControl><FormMessage />
                                    </FormItem>
                                )}/>
                            )}

                             {questionType === 'Grouped' && (
                                <GroupedQuestionsField control={form.control} setValue={form.setValue} getValues={form.getValues} />
                            )}

                            <FormField name="explanation" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>General Explanation</FormLabel><FormControl><Textarea {...field} placeholder="A general explanation for the correct answer." /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </CardContent>
                    </Card>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                           {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                           Add Question
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
