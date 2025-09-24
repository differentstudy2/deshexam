
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, getDocs, query, addDoc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Topic, PracticeSet, Question } from '@/lib/types';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, ArrowLeft, PlusCircle, Edit, Trash2, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { 
    addPracticeSetToTopic, 
    getPracticeSetsByTopicId, 
    addQuestionToPracticeSet,
    getQuestionsByPracticeSet,
    updateQuestionInPracticeSet,
    deleteQuestionFromPracticeSet
} from '@/lib/firebase/firestore';

const questionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, 'Question text cannot be empty.'),
  type: z.enum(['Multiple Choice', 'True/False', 'Short Answer']),
  marks: z.coerce.number().int().positive('Marks must be a positive number.'),
  options: z.array(z.object({ text: z.string().min(1, "Option text is required.") })).optional(),
  correctAnswer: z.string().min(1, 'Correct answer is required.'),
  explanation: z.string().optional(),
});

type QuestionFormValues = z.infer<typeof questionSchema>;

export default function ManageTopicQuestionsPage() {
    const params = useParams();
    const { toast } = useToast();
    const router = useRouter();

    const textbookId = params.bookId as string;
    const chapterId = params.chapterId as string;
    const topicId = params.topicId as string;
    
    const [topic, setTopic] = useState<Topic | null>(null);
    const [practiceSets, setPracticeSets] = useState<PracticeSet[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [isPracticeSetDialogOpen, setIsPracticeSetDialogOpen] = useState(false);
    const [newPracticeSetTitle, setNewPracticeSetTitle] = useState('');

    const form = useForm<QuestionFormValues>({
        resolver: zodResolver(questionSchema),
        defaultValues: {
            text: '',
            type: 'Multiple Choice',
            marks: 1,
            options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
            correctAnswer: '',
            explanation: '',
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "options"
    });

    const questionType = form.watch('type');

    const fetchData = async () => {
        if (!textbookId || !chapterId || !topicId) return;
        setLoading(true);

        const topicRef = doc(db, `textbooks/${textbookId}/chapters/${chapterId}/topics`, topicId);
        const topicSnap = await getDoc(topicRef);
        if (topicSnap.exists()) {
            setTopic({ id: topicSnap.id, ...topicSnap.data() } as Topic);
        }

        const fetchedPracticeSets = await getPracticeSetsByTopicId(textbookId, chapterId, topicId);
        setPracticeSets(fetchedPracticeSets as PracticeSet[]);

        // For simplicity, we are managing questions inside the first practice set.
        // This could be expanded to select a practice set.
        if (fetchedPracticeSets.length > 0) {
            const fetchedQuestions = await getQuestionsByPracticeSet(textbookId, chapterId, topicId, fetchedPracticeSets[0].id);
            setQuestions(fetchedQuestions as Question[]);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [textbookId, chapterId, topicId]);

    const openQuestionDialog = (question: Question | null) => {
        setEditingQuestion(question);
        if (question) {
            form.reset({
                ...question,
                options: question.type === 'Multiple Choice' ? question.options : undefined
            });
        } else {
            form.reset({
                text: '',
                type: 'Multiple Choice',
                marks: 1,
                options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
                correctAnswer: '',
                explanation: '',
            });
        }
        setIsQuestionDialogOpen(true);
    }
    
    const handleQuestionSubmit = async (data: QuestionFormValues) => {
        if (practiceSets.length === 0) {
            toast({ variant: 'destructive', title: 'No Practice Set', description: 'Please create a practice set first to add questions.' });
            return;
        }
        const practiceSetId = practiceSets[0].id; // Use the first practice set for now

        try {
            if (editingQuestion) {
                await updateQuestionInPracticeSet(textbookId, chapterId, topicId, practiceSetId, editingQuestion.id, data);
                toast({ title: 'Question Updated' });
            } else {
                await addQuestionToPracticeSet(textbookId, chapterId, topicId, practiceSetId, data);
                toast({ title: 'Question Added' });
            }
            fetchData();
            setIsQuestionDialogOpen(false);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: (error as Error).message });
        }
    }

    const handleDeleteQuestion = async (questionId: string) => {
        if (practiceSets.length === 0) return;
        const practiceSetId = practiceSets[0].id;
        try {
            await deleteQuestionFromPracticeSet(textbookId, chapterId, topicId, practiceSetId, questionId);
            toast({ title: 'Question Deleted' });
            fetchData();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: (error as Error).message });
        }
    }

    const handleAddPracticeSet = async () => {
        if (!newPracticeSetTitle.trim()) return;
        try {
            await addPracticeSetToTopic(textbookId, chapterId, topicId, { title: newPracticeSetTitle });
            toast({ title: 'Practice Set Added' });
            setNewPracticeSetTitle('');
            setIsPracticeSetDialogOpen(false);
            fetchData();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: (error as Error).message });
        }
    }
    
    if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin" /></div>

    return (
        <div className="space-y-6">
            <div>
                <Button variant="ghost" asChild>
                    <Link href={`/admin/textbooks/${textbookId}/chapter/${chapterId}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Topics
                    </Link>
                </Button>
            </div>
            <header>
                <h1 className="font-headline text-3xl font-bold">Manage Topic: <span className="text-primary">{topic?.title}</span></h1>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Practice Sets</CardTitle>
                         <Dialog open={isPracticeSetDialogOpen} onOpenChange={setIsPracticeSetDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm"><PlusCircle className="mr-2"/> Add Practice Set</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add New Practice Set</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-2">
                                    <Label htmlFor="practice-set-title">Title</Label>
                                    <Input id="practice-set-title" value={newPracticeSetTitle} onChange={(e) => setNewPracticeSetTitle(e.target.value)} />
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleAddPracticeSet}>Save</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        {practiceSets.length > 0 ? (
                             <ul className="space-y-2">
                                {practiceSets.map(ps => (
                                    <li key={ps.id} className="flex items-center justify-between p-2 border rounded-md">
                                        <span>{ps.title}</span>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/textbook-solutions/practice-set/${ps.id}?textbook=${textbookId}&chapter=${chapterId}&topic=${topicId}`} target="_blank">
                                                <BookOpen className="mr-2 h-4 w-4"/> Preview
                                            </Link>
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground text-center">No practice sets created for this topic.</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Questions</CardTitle>
                        <Button size="sm" onClick={() => openQuestionDialog(null)} disabled={practiceSets.length === 0}>
                            <PlusCircle className="mr-2"/> Add Question
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {questions.length > 0 ? (
                            <ul className="space-y-2">
                                {questions.map(q => (
                                    <li key={q.id} className="flex items-center justify-between p-2 border rounded-md">
                                        <p className="truncate pr-4">{q.text}</p>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => openQuestionDialog(q)}><Edit className="h-4 w-4"/></Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteQuestion(q.id)}><Trash2 className="h-4 w-4"/></Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                             <p className="text-muted-foreground text-center">No questions added yet.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
            
             <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>{editingQuestion ? 'Edit Question' : 'Add New Question'}</DialogTitle>
                        <DialogDescription>
                            Fill in the details for your question below.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleQuestionSubmit)} className="space-y-4">
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
                                            </SelectContent>
                                        </Select>
                                    <FormMessage /></FormItem>
                                )}/>
                                <FormField name="marks" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel>Marks</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>
                            
                            {questionType === 'Multiple Choice' && (
                                <div className="space-y-2">
                                    <Label>Options</Label>
                                    {fields.map((field, index) => (
                                        <FormField key={field.id} name={`options.${index}.text`} control={form.control} render={({ field }) => (
                                            <FormItem><FormControl><Input {...field} placeholder={`Option ${index + 1}`} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                    ))}
                                </div>
                            )}

                             {questionType === 'True/False' ? (
                                <FormField name="correctAnswer" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel>Correct Answer</FormLabel>
                                        <FormControl>
                                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="True" /></FormControl><FormLabel>True</FormLabel></FormItem>
                                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="False" /></FormControl><FormLabel>False</FormLabel></FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                    <FormMessage /></FormItem>
                                )}/>
                            ) : (
                                <FormField name="correctAnswer" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel>Correct Answer</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            )}

                            <FormField name="explanation" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>Explanation (Optional)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            
                            <DialogFooter>
                                <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                    Save Question
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
