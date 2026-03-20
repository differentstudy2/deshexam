'use client';

import { useFieldArray, Controller, useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { FormField, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2, GripVertical } from 'lucide-react';
import { ImageUploader } from '@/components/feature/image-uploader';

export const MatchingPairsField = ({ questionIndex }: { questionIndex: number }) => {
    const { control, setValue } = useFormContext();
    const { fields: matchingPairFields, append: appendMatchingPair, remove: removeMatchingPair } = useFieldArray({
        control: control,
        name: `questions.${questionIndex}.correctAnswer`,
    });

    const handleImageUrlChange = (pairIndex: number, field: 'aImage' | 'bImage', url: string) => {
        setValue(`questions.${questionIndex}.correctAnswer.${pairIndex}.${field}`, url);
    };

    return (
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
                        <div className="space-y-2">
                            <FormField control={control} name={`questions.${questionIndex}.correctAnswer.${pairIndex}.a`} render={({ field }) => <Input {...field} placeholder={`Item A${pairIndex + 1} Text`} value={field.value ?? ''} />} />
                            <Controller control={control} name={`questions.${questionIndex}.correctAnswer.${pairIndex}.aImage`} render={({ field }) => (
                                <ImageUploader fieldName={field.name} onUrlChange={(url) => handleImageUrlChange(pairIndex, 'aImage', url)} value={field.value} />
                            )} />
                        </div>
                        <div className="pt-2">
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                             <FormField control={control} name={`questions.${questionIndex}.correctAnswer.${pairIndex}.b`} render={({ field }) => <Input {...field} placeholder={`Item B${pairIndex + 1} Text`} value={field.value ?? ''} />} />
                             <Controller control={control} name={`questions.${questionIndex}.correctAnswer.${pairIndex}.bImage`} render={({ field }) => (
                                <ImageUploader fieldName={field.name} onUrlChange={(url) => handleImageUrlChange(pairIndex, 'bImage', url)} value={field.value} />
                            )} />
                        </div>
                    </div>
                 </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendMatchingPair({ a: '', aImage: '', b: '', bImage: '' })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Pair
            </Button>
        </div>
    );
};
