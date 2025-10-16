
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Chapter, Question, SubQuestion } from '@/lib/types';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, PlusCircle, Trash2, GripVertical, FileJson, Save, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ImageUploader } from '@/components/feature/image-uploader';

const optionSchema = z.object({
  text: z.string().min(1, 'Option text cannot be empty.'),
  explanation: z.string().optional(),
});

const matchingPairSchema = z.object({
    a: z.string().min(1, 'Column A item cannot be empty.'),
    aImage: z.string().optional(),
    b: z.string().min(1, 'Column B item cannot be empty.'),
    bImage: z.string().optional(),
});

const subQuestionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, 'Sub-question text cannot be empty.'),
  type: z.enum(['Multiple Choice', 'True/False', 'Short Answer', 'Fill in the Blank', 'Matching']),
  marks: z.coerce.number().min(1).default(1),
  options: z.array(optionSchema).optional(),
  correctAnswer: z.any().optional(),
  explanation: z.string().optional(),
});

const questionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Question text cannot be empty.'),
  type: z.enum(['Multiple Choice', 'True/False', 'Short Answer', 'Fill in the Blank', 'Matching', 'Grouped']),
  marks: z.coerce.number().int().min(1, 'Marks must be a positive number.').default(1),
  options: z.array(optionSchema).optional(),
  correctAnswer: z.any().optional(),
  explanation: z.string().optional(),
  subQuestions: z.array(subQuestionSchema).optional(),
}).refine(data => {
    if (data.type === 'Multiple Choice') {
        return !!data.correctAnswer && data.options?.some(opt => opt.text === data.correctAnswer);
    }
    if (data.type === 'Matching') {
        return Array.isArray(data.correctAnswer) && data.correctAnswer.length > 0;
    }
    if (data.type === 'True/False') {
        return data.correctAnswer === 'True' || data.correctAnswer === 'False';
    }
    return !!data.correctAnswer || data.type === 'Grouped';
}, {
    message: "A valid correct answer is required for this question type.",
    path: ["correctAnswer"],
});


type QuestionFormValues = z.infer<typeof questionSchema>;


const MatchingPairsField = ({ control, setValue, fieldNamePrefix }: { control: any, setValue: any, fieldNamePrefix: string }) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `${fieldNamePrefix}.correctAnswer`,
    });

    return (
        <div className='space-y-4'>
            <FormLabel>Matching Pairs</FormLabel>
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


const GroupedQuestionsField = ({ control, setValue }: { control: any, setValue: any }) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "subQuestions",
    });

    return (
        <div className="space-y-4">
            <FormLabel>Sub-Questions</FormLabel>
            <FormDescription>Add the individual questions that fall under the main instruction.</FormDescription>
            {fields.map((field, index) => (
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
                        <Controller
                            control={control}
                            name={`subQuestions.${index}`}
                            render={({ field: subQuestionField }) => {
                                const subQuestionType = subQuestionField.value.type;
                                if (subQuestionType === 'Multiple Choice') {
                                    return (
                                        <div className="space-y-2">
                                            <FormLabel className="text-xs">Options</FormLabel>
                                            <RadioGroup onValueChange={(val) => setValue(`subQuestions.${index}.correctAnswer`, val)}>
                                                {[0, 1, 2, 3].map(optIndex => (
                                                    <div key={optIndex} className="flex items-center gap-2">
                                                        <RadioGroupItem value={subQuestionField.value.options?.[optIndex]?.text || ''} />
                                                        <FormField control={control} name={`subQuestions.${index}.options.${optIndex}.text`} render={({ field }) => (
                                                            <Input {...field} placeholder={`Option ${optIndex + 1}`} />
                                                        )}/>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </div>
                                    )
                                }
                                if (subQuestionType === 'True/False') {
                                    return (
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
                                    )
                                }
                                if (subQuestionType === 'Matching') {
                                    return <MatchingPairsField control={control} fieldNamePrefix={`subQuestions.${index}`} setValue={setValue} />
                                }
                                // Default to Short Answer / Fill in the blank
                                return (
                                    <FormField control={control} name={`subQuestions.${index}.correctAnswer`} render={({ field }) => (
                                        <FormItem><FormLabel className="text-xs">Correct Answer</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                                    )}/>
                                );
                            }}
                        />

                        <FormField control={control} name={`subQuestions.${index}.explanation`} render={({ field }) => (
                             <FormItem><FormLabel className="text-xs">Explanation (Optional)</FormLabel><FormControl><Textarea {...field} placeholder="Optional explanation" rows={2}/></FormControl></FormItem>
                        )}/>
                    </div>
                </Card>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => append({ text: '', correctAnswer: '', explanation: '', marks: 1, type: 'Short Answer' })}>
                <PlusCircle className="mr-2 h-4 w-4"/> Add Sub-Question
            </Button>
        </div>
    );
}

export default function EditChapterQuestionPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();

    const textbookId = params.bookId as string;
    const chapterId = params.chapterId as string;
    const questionId = params.questionId as string;
    
    const [loading, setLoading] = useState(true);

    const form = useForm<QuestionFormValues>({
        resolver: zodResolver(questionSchema)
    });
    
    useEffect(() => {
        const fetchQuestion = async () => {
            setLoading(true);
            const chapterRef = doc(db, `textbooks/${textbookId}/chapters`, chapterId);
            const chapterSnap = await getDoc(chapterRef);

            if (chapterSnap.exists()) {
                const chapterData = chapterSnap.data() as Chapter;
                const questionToEdit = chapterData.textbookQuestions?.find(q => q.id === questionId);

                if (questionToEdit) {
                    form.reset(questionToEdit);
                } else {
                    toast({ variant: 'destructive', title: 'Question not found' });
                    router.back();
                }
            } else {
                 toast({ variant: 'destructive', title: 'Chapter not found' });
                 router.back();
            }
            setLoading(false);
        };
        fetchQuestion();
    }, [textbookId, chapterId, questionId, form, toast, router]);

    const questionType = form.watch('type');

    const onSubmit = async (data: QuestionFormValues) => {
        try {
            const chapterRef = doc(db, `textbooks/${textbookId}/chapters`, chapterId);
            const chapterSnap = await getDoc(chapterRef);
            if (chapterSnap.exists()) {
                const chapterData = chapterSnap.data() as Chapter;
                const updatedQuestions = chapterData.textbookQuestions?.map(q => 
                    q.id === questionId ? data : q
                ) || [];
                
                await updateDoc(chapterRef, { textbookQuestions: updatedQuestions });
                toast({ title: "Question Updated", description: "The question has been successfully updated." });
                router.push(`/admin/textbooks/${textbookId}/chapter/${chapterId}/questions`);
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error updating question', description: (error as Error).message });
        }
    };
    
    if (loading) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin" /></div>
    }

    return (
        <div className="space-y-6">
            <div>
                <Button variant="ghost" asChild>
                    <Link href={`/admin/textbooks/${textbookId}/chapter/${chapterId}/questions`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Questions
                    </Link>
                </Button>
            </div>
            <header>
                <h1 className="font-headline text-3xl font-bold">Edit Question</h1>
            </header>
            
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                     <Card>
                        <CardHeader><CardTitle>Question Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                           <FormField name="text" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>{questionType === 'Grouped' ? 'Main Instruction' : 'Question Text'}</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField name="type" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel>Type</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
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
                                    <Controller
                                        control={form.control}
                                        name="correctAnswer"
                                        render={({ field }) => (
                                            <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {[0, 1, 2, 3].map((optionIndex) => (
                                                    <div key={optionIndex} className="flex items-start gap-3">
                                                        <FormControl className="mt-2.5">
                                                             <RadioGroupItem value={form.watch(`options.${optionIndex}.text`)} disabled={!form.watch(`options.${optionIndex}.text`)} />
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
                                        <FormItem><FormLabel>Correct Answer</FormLabel>
                                            <FormControl>
                                                <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4">
                                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="True" /></FormControl><FormLabel>True</FormLabel></FormItem>
                                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="False" /></FormControl><FormLabel>False</FormLabel></FormItem>
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
                                    <FormItem><FormLabel>Correct Answer</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            )}

                             {questionType === 'Grouped' && (
                                <GroupedQuestionsField control={form.control} setValue={form.setValue} />
                            )}

                            <FormField name="explanation" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>General Explanation</FormLabel><FormControl><Textarea {...field} placeholder="General explanation for the correct answer." /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </CardContent>
                    </Card>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                           {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                           Save Changes
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
