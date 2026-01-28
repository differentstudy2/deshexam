

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Chapter, Question } from '@/lib/types';
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
import { getQuestionById, updateQuestion } from '@/lib/firebase/firestore';

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

const questionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Question text cannot be empty.'),
  type: z.enum(['Multiple Choice', 'True/False', 'Short Answer', 'Fill in the Blank', 'Matching']),
  marks: z.coerce.number().int().min(1, 'Marks must be a positive number.').default(1),
  options: z.array(optionSchema).optional(),
  correctAnswer: z.any().optional(),
  explanation: z.string().optional(),
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
    return !!data.correctAnswer;
}, {
    message: "A valid correct answer is required for this question type.",
    path: ["correctAnswer"],
});


type QuestionFormValues = z.infer<typeof questionSchema>;


const MatchingPairsField = ({ control, setValue }: { control: any, setValue: any }) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "correctAnswer",
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
                            <FormField control={control} name={`correctAnswer.${pairIndex}.a`} render={({ field }) => <Input {...field} placeholder={`Item A${pairIndex + 1} Text`} />} />
                            <Controller control={control} name={`correctAnswer.${pairIndex}.aImage`} render={({ field }) => (
                                <ImageUploader fieldName={field.name} onUrlChange={(url) => setValue(`correctAnswer.${pairIndex}.aImage`, url, { shouldValidate: true })} value={field.value} />
                            )} />
                        </div>
                        <GripVertical className="h-5 w-5 text-muted-foreground pt-2" />
                        <div className="space-y-2">
                             <FormField control={control} name={`correctAnswer.${pairIndex}.b`} render={({ field }) => <Input {...field} placeholder={`Item B${pairIndex + 1} Text`} />} />
                             <Controller control={control} name={`correctAnswer.${pairIndex}.bImage`} render={({ field }) => (
                                <ImageUploader fieldName={field.name} onUrlChange={(url) => setValue(`correctAnswer.${pairIndex}.bImage`, url, { shouldValidate: true })} value={field.value} />
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
            try {
                const questionData = await getQuestionById(questionId);

                if (questionData) {
                    form.reset(questionData as QuestionFormValues);
                } else {
                    toast({ variant: 'destructive', title: 'Question not found' });
                    router.back();
                }
            } catch(e) {
                toast({ variant: 'destructive', title: 'Error fetching question', description: (e as Error).message });
                router.back();
            } finally {
                setLoading(false);
            }
        };
        fetchQuestion();
    }, [questionId, form, toast, router]);

    const questionType = form.watch('type');

    const onSubmit = async (data: QuestionFormValues) => {
        try {
            await updateQuestion(questionId, data);
            toast({ title: "Question Updated", description: "The question has been successfully updated." });
            router.push(`/admin/textbooks/${textbookId}/chapter/${chapterId}/questions`);
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
                                <FormItem><FormLabel>Question Text</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
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
                                            </SelectContent>
                                        </Select>
                                    <FormMessage /></FormItem>
                                )}/>
                                <FormField name="marks" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel>Marks</FormLabel><FormControl><Input type="number" {...field} disabled={questionType === 'Matching'} /></FormControl><FormMessage /></FormItem>
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
                                <MatchingPairsField control={form.control} setValue={form.setValue} />
                            )}
                            
                            {(questionType === 'Short Answer' || questionType === 'Fill in the Blank') && (
                                <FormField name="correctAnswer" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel>Correct Answer</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
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
