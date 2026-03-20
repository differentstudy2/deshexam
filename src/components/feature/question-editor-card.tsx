'use client';

import { Controller, useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Upload, Loader2 } from 'lucide-react';
import { MatchingPairsField } from './matching-pairs-field';
import { ImageUploader } from './image-uploader';
import { useRef, useState } from 'react';
import { uploadFile } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export const QuestionEditorCard = ({ index, onRemove, settings }: { index: number, onRemove: (index: number) => void, settings: any }) => {
    const { control, watch, setValue, getValues } = useFormContext();
    const { toast } = useToast();
    const questionType = watch(`questions.${index}.type`);
    const [isUploadingAudio, setIsUploadingAudio] = useState(false);
    const [uploadingAudioField, setUploadingAudioField] = useState<string | null>(null);
    const audioInputRef = useRef<HTMLInputElement>(null);

    const handleAudioUploadClick = (fieldName: string) => {
        setUploadingAudioField(fieldName);
        audioInputRef.current?.click();
    };
    
    const handleAudioFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && uploadingAudioField) {
            setIsUploadingAudio(true);
            try {
                const downloadURL = await uploadFile(file);
                setValue(uploadingAudioField, downloadURL, { shouldValidate: true });
                toast({ title: 'Audio uploaded!' });
            } catch (error) {
                toast({ variant: 'destructive', title: 'Upload Failed', description: (error as Error).message });
            } finally {
                setIsUploadingAudio(false);
                setUploadingAudioField(null);
                if(audioInputRef.current) audioInputRef.current.value = '';
            }
        }
    };

    return (
        <Card className="p-4">
            <Input type="file" ref={audioInputRef} onChange={handleAudioFileChange} className="hidden" accept="audio/*" />
            <div className="flex justify-between items-center mb-4 gap-4">
                <h4 className="font-semibold text-lg whitespace-nowrap">Question {index + 1}</h4>
                <FormField
                    control={control}
                    name={`questions.${index}.type`}
                    render={({ field }) => (
                        <FormItem className="w-full">
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a question type" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {settings.enableMultipleChoice && <SelectItem value="Multiple Choice">Multiple Choice</SelectItem>}
                                    {settings.enableTrueFalse && <SelectItem value="True/False">True/False</SelectItem>}
                                    {settings.enableShortAnswer && <SelectItem value="Short Answer">Short Answer</SelectItem>}
                                    {settings.enableFillInTheBlank && <SelectItem value="Fill in the Blank">Fill in the Blank</SelectItem>}
                                    {settings.enableMatching && <SelectItem value="Matching">Matching</SelectItem>}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="button" variant="destructive" size="sm" onClick={() => onRemove(index)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                </Button>
            </div>
            <div className="space-y-4">
                <FormField
                    control={control}
                    name={`questions.${index}.text`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Question Text</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                                {questionType === 'Fill in the Blank' && (
                                <FormDescription>
                                    Use "____" (four underscores) to indicate where the blank should be.
                                </FormDescription>
                                )}
                                {questionType === 'Matching' && (
                                <FormDescription>
                                    Provide the instruction for matching, e.g., "Match Column A with Column B".
                                </FormDescription>
                                )}
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={control}
                        name={`questions.${index}.image`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Question Image</FormLabel>
                                <FormControl>
                                    <ImageUploader
                                        fieldName={field.name}
                                        onUrlChange={(url) => setValue(`questions.${index}.image`, url, { shouldValidate: true })}
                                        value={field.value}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name={`questions.${index}.audio`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Question Audio</FormLabel>
                                <div className="flex items-center gap-2">
                                    <Input {...field} placeholder="Audio URL" value={field.value ?? ''} />
                                    <Button type="button" variant="outline" size="icon" onClick={() => handleAudioUploadClick(`questions.${index}.audio`)} disabled={isUploadingAudio}>
                                        {isUploadingAudio && uploadingAudioField === `questions.${index}.audio` ? <Loader2 className="animate-spin" /> : <Upload className="w-4 h-4" />}
                                    </Button>
                                    {!!field.value && (
                                        <Button type="button" variant="destructive" size="icon" onClick={() => setValue(`questions.${index}.audio`, '')}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                                {!!field.value && <audio controls src={field.value} className="w-full mt-2" />}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                
                {questionType === 'Multiple Choice' && (
                    <div className="space-y-4">
                        <FormLabel>Options</FormLabel>
                        <Controller
                            control={control}
                            name={`questions.${index}.correctAnswer`}
                            render={({ field }) => (
                                <RadioGroup
                                    onValueChange={field.onChange} 
                                    value={field.value} 
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                >
                                    {[0, 1, 2, 3].map(optionIndex => (
                                        <div key={optionIndex} className="flex items-start gap-4">
                                            <FormControl>
                                                <RadioGroupItem value={getValues(`questions.${index}.options.${optionIndex}.text`)} className="mt-2.5" />
                                            </FormControl>
                                            <div className="space-y-2 flex-1">
                                                <FormField
                                                    control={control}
                                                    name={`questions.${index}.options.${optionIndex}.text`}
                                                    render={({ field: optionField }) => (
                                                        <Input {...optionField} placeholder={`Option ${optionIndex + 1}`} />
                                                    )}
                                                />
                                                <div className="grid grid-cols-2 gap-2">
                                                    <FormField
                                                        control={control}
                                                        name={`questions.${index}.options.${optionIndex}.image`}
                                                        render={({ field: imageField }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs">Image</FormLabel>
                                                                <FormControl>
                                                                    <ImageUploader
                                                                        fieldName={imageField.name}
                                                                        onUrlChange={(url) => setValue(`questions.${index}.options.${optionIndex}.image`, url)}
                                                                        value={imageField.value}
                                                                    />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={control}
                                                        name={`questions.${index}.options.${optionIndex}.audio`}
                                                        render={({ field: audioField }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs">Audio</FormLabel>
                                                                <div className="flex items-center gap-2">
                                                                    <Input {...audioField} placeholder="Audio URL" value={audioField.value ?? ''} />
                                                                    <Button type="button" variant="outline" size="icon" onClick={() => handleAudioUploadClick(`questions.${index}.options.${optionIndex}.audio`)} disabled={isUploadingAudio}>
                                                                        {isUploadingAudio && uploadingAudioField === `questions.${index}.options.${optionIndex}.audio` ? <Loader2 className="animate-spin" /> : <Upload className="w-4 h-4" />}
                                                                    </Button>
                                                                    {!!audioField.value && (
                                                                        <Button type="button" variant="destructive" size="icon" onClick={() => setValue(`questions.${index}.options.${optionIndex}.audio`, '')}>
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                                {getValues(`questions.${index}.options.${optionIndex}.audio`) && (
                                                    <audio controls src={getValues(`questions.${index}.options.${optionIndex}.audio`)} className="w-full mt-2" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </RadioGroup>
                            )}
                        />
                        <FormMessage />
                    </div>
                )}
                {questionType === 'True/False' && (
                    <FormField
                        control={control}
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
                {questionType === 'Matching' && (
                  <MatchingPairsField questionIndex={index} />
                )}
                {(questionType === 'Short Answer' || questionType === 'Fill in the Blank') && (
                    <FormField
                        control={control}
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

                <FormField
                    control={control}
                    name={`questions.${index}.explanation`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>General Explanation</FormLabel>
                            <FormControl>
                                <Textarea {...field} placeholder="Explain why the correct answer is right." />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </Card>
    );
};
