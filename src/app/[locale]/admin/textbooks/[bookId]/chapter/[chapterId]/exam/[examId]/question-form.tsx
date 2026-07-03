
'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, PlusCircle, Trash2, GripVertical } from 'lucide-react';
import { DialogFooter, DialogClose } from '@/components/ui/dialog';

const optionSchema = z.object({
  text: z.string().min(1, 'Option text cannot be empty.'),
  explanation: z.string().optional(),
});

const questionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, 'Question text cannot be empty.'),
  type: z.enum(['Multiple Choice', 'True/False', 'Short Answer', 'Fill in the Blank', 'Matching']),
  marks: z.coerce.number().int().positive('Marks must be a positive number.'),
  options: z.array(optionSchema).optional(),
  matchingOptions: z.object({
    columnA: z.array(z.object({ text: z.string(), image: z.string().optional() })),
    columnB: z.array(z.object({ text: z.string(), image: z.string().optional() })),
  }).optional(),
  correctAnswer: z.any().optional(),
  explanation: z.string().optional(),
});
type QuestionFormValues = z.infer<typeof questionSchema>;


export default function QuestionForm({ form, onSubmit, isSubmitting }: { form: any, onSubmit: (data: QuestionFormValues) => void, isSubmitting: boolean }) {
    const questionType = form.watch('type');
     const { fields: matchingPairFields, append: appendMatchingPair, remove: removeMatchingPair } = useFieldArray({
        control: form.control,
        name: `correctAnswer`
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-4">
                <FormField name="text" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Question Text</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
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
                                         <div key={optionIndex} className="flex items-start gap-4">
                                            <FormControl>
                                                <RadioGroupItem value={form.getValues(`options.${optionIndex}.text`)} id={`option-${optionIndex}-${form.getValues('id')}`} className="mt-2.5" />
                                            </FormControl>
                                            <div className="space-y-2 flex-1">
                                                <FormField
                                                    control={form.control}
                                                    name={`options.${optionIndex}.text`}
                                                    render={({ field: optionField }) => (
                                                        <Input {...optionField} placeholder={`Option ${optionIndex + 1}`} />
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`options.${optionIndex}.explanation`}
                                                    render={({ field: explanationField }) => (
                                                        <Textarea {...explanationField} placeholder={`Explanation for Option ${optionIndex + 1}`} />
                                                    )}
                                                />
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
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4">
                                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="True" /></FormControl><Label>True</Label></FormItem>
                                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="False" /></FormControl><Label>False</Label></FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="options.0.explanation" render={({ field }) => (<FormItem><FormLabel>Explanation for "True"</FormLabel><FormControl><Textarea {...field}/></FormControl></FormItem>)} />
                            <FormField control={form.control} name="options.1.explanation" render={({ field }) => (<FormItem><FormLabel>Explanation for "False"</FormLabel><FormControl><Textarea {...field}/></FormControl></FormItem>)} />
                        </div>
                    </div>
                )}
                
                {questionType === 'Matching' && (
                     <div className='space-y-4'>
                        <FormLabel>Matching Pairs</FormLabel>
                        <div className='grid grid-cols-[1fr_auto_1fr] items-center gap-2 font-semibold text-center'>
                            <div>Column A</div>
                            <div></div>
                            <div>Column B</div>
                        </div>
                        {matchingPairFields.map((pair, pairIndex) => (
                             <div key={pair.id} className="p-4 border rounded-lg space-y-3">
                                <div className="flex justify-between items-center">
                                    <FormLabel className="text-sm">Pair {pairIndex + 1}</FormLabel>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => removeMatchingPair(pairIndex)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </div>
                                <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-4">
                                    <FormField control={form.control} name={`correctAnswer.${pairIndex}.a`} render={({ field }) => <Input {...field} placeholder={`Item A${pairIndex + 1} Text`} />} />
                                    <GripVertical className="h-5 w-5 text-muted-foreground pt-2" />
                                     <FormField control={form.control} name={`correctAnswer.${pairIndex}.b`} render={({ field }) => <Input {...field} placeholder={`Item B${pairIndex + 1} Text`} />} />
                                </div>
                             </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => appendMatchingPair({ a: '', b: '' })}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Pair
                        </Button>
                    </div>
                )}

                {(questionType === 'Short Answer' || questionType === 'Fill in the Blank') && (
                    <FormField name="correctAnswer" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Correct Answer</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                )}

                <FormField name="explanation" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>General Explanation</FormLabel><FormControl><Textarea {...field} placeholder="General explanation for the correct answer." /></FormControl><FormMessage /></FormItem>
                )}/>
                
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        Save Question
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    );
};
