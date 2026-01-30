
'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { addQuestion, getSubjects, getBoards, getClasses, getGradesByClass } from '@/lib/firebase/firestore';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import Link from 'next/link';
import { useAuthDialog } from '@/hooks/use-auth-dialog';

type Subject = { id: string, name: string };
type Board = { id: string, name: string };
type ClassCategory = { id: string, name: string };
type Grade = { id: string, name: string };


const questionFormSchema = z.object({
  text: z.string().min(10, "Question must be at least 10 characters long."),
  subject: z.string().min(1, "Please select a subject."),
  board: z.string().optional(),
  classCategory: z.string().optional(),
  grade: z.string().optional(),
});

type QuestionFormValues = z.infer<typeof questionFormSchema>;

export default function AskQuestionPage() {
    const { user, loading: authLoading } = useAuth();
    const { openAuthDialog } = useAuthDialog();
    const { toast } = useToast();
    const router = useRouter();

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [boards, setBoards] = useState<Board[]>([]);
    const [classCategories, setClassCategories] = useState<ClassCategory[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [loadingMetadata, setLoadingMetadata] = useState(true);

    const form = useForm<QuestionFormValues>({
        resolver: zodResolver(questionFormSchema),
        defaultValues: {
            text: '',
            subject: '',
            board: '',
            classCategory: '',
            grade: '',
        },
    });
    
    const selectedClassCategory = form.watch('classCategory');

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [subjectsData, boardsData, classesData] = await Promise.all([
                    getSubjects(),
                    getBoards(),
                    getClasses(),
                ]);
                setSubjects(subjectsData);
                setBoards(boardsData);
                setClassCategories(classesData);
            } catch (error) {
                toast({
                    variant: 'destructive',
                    title: 'Failed to load metadata',
                    description: 'Could not load subjects, boards, or classes.'
                });
            } finally {
                setLoadingMetadata(false);
            }
        };
        fetchMetadata();
    }, [toast]);
    
     useEffect(() => {
        const fetchGrades = async () => {
            if (selectedClassCategory) {
                const fetchedGrades = await getGradesByClass(selectedClassCategory);
                setGrades(fetchedGrades);
            } else {
                setGrades([]);
            }
        };
        fetchGrades();
    }, [selectedClassCategory]);

    const onSubmit: SubmitHandler<QuestionFormValues> = async (data) => {
        if (!user) {
            toast({
                title: 'Please log in',
                description: 'You need to be logged in to ask a question.',
            });
            openAuthDialog('sign-in');
            return;
        }

        try {
            const questionData = {
                ...data,
                type: 'Descriptive', // Set as a descriptive question by default
                marks: 1, // Default marks
            };

            const newQuestionId = await addQuestion(questionData);
            
            toast({
                title: 'Question Submitted!',
                description: "Your question has been posted. You'll be redirected shortly.",
            });

            router.push(`/question/${newQuestionId}`);

        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error submitting question',
                description: (error as Error).message,
            });
        }
    };

    if (authLoading || loadingMetadata) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="ml-4 text-lg">Loading...</p>
            </div>
        );
    }
    
    return (
        <div className="container py-12 max-w-3xl mx-auto">
            <div className="mb-6">
                <Button asChild variant="ghost">
                    <Link href="/questions">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to All Questions
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Ask a Question</CardTitle>
                    <CardDescription>
                        Post your question to the community. Provide as much detail as possible.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="text"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Your Question</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="What is the difference between speed and velocity?"
                                                className="min-h-[150px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="subject"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Subject</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select a subject" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {subjects.map(subject => (
                                                        <SelectItem key={subject.id} value={subject.name}>{subject.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="board"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Board (Optional)</FormLabel>
                                             <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select a board" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {boards.map(board => (
                                                        <SelectItem key={board.id} value={board.name}>{board.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                 <FormField
                                    control={form.control}
                                    name="classCategory"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Class Category (Optional)</FormLabel>
                                            <Select onValueChange={(value) => { field.onChange(value); form.setValue('grade', ''); }} value={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {classCategories.map(c => (
                                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="grade"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Grade (Optional)</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value} disabled={!selectedClassCategory}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select a grade" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {grades.map(g => (
                                                        <SelectItem key={g.id} value={g.name}>{g.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                             <div className="flex justify-end">
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    <Send className="mr-2 h-4 w-4" />
                                    {form.formState.isSubmitting ? "Submitting..." : "Submit Question"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
