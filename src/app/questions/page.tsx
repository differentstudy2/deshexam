'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  getSubjects,
  getPaginatedQuestions,
  getUserProfile,
  getAllUsers,
  addQuestion,
  getBoards,
  getClasses,
  getGradesByClass,
} from '@/lib/firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { DocumentSnapshot } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  LayoutGrid,
  Book,
  BriefcaseBusiness,
  School,
  GraduationCap,
  FlaskConical,
  Atom,
  Dna,
  Globe,
  Languages,
  Palette,
  Music,
  History,
  Landmark,
  MoreHorizontal,
  Plus,
  User,
  Trophy,
  BrainCircuit,
  TrendingUp,
  Computer,
  Leaf,
  BookOpen,
  Calculator,
  Clapperboard,
  Loader2,
  Send,
  Sparkles,
  Users,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Badge } from '@/components/ui/badge';
import { useAuthDialog } from '@/hooks/use-auth-dialog';

import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import rehypeRaw from 'rehype-raw';

type Subject = { id: string, name: string };
type Board = { id: string, name: string };
type ClassCategory = { id: string, name: string };
type Grade = { id: string, name: string };

type Question = {
    id: string;
    text: string;
    subject: string;
    createdAt: any;
    authorName: string;
    authorId: string;
};
type UserProfile = {
  uid: string;
  displayName: string;
  photoURL?: string;
  username?: string;
  points?: number;
};

const questionFormSchema = z.object({
  text: z.string().min(10, "Question must be at least 10 characters long."),
  subject: z.string().min(1, "Please select a subject."),
  board: z.string().optional(),
  classCategory: z.string().optional(),
  grade: z.string().optional(),
  type: z.enum(['Multiple Choice', 'True/False', 'Short Answer', 'Fill in the Blank', 'Matching', 'Grouped', 'Descriptive']),
});

type QuestionFormValues = z.infer<typeof questionFormSchema>;

const subjectIcons: { [key: string]: React.ReactNode } = {
  'All subjects': <LayoutGrid />,
  'French': <Languages />,
  'CBSE BOARD XII': <School />,
  'CBSE BOARD X': <School />,
  'Accountancy': <BriefcaseBusiness />,
  'Psychology': <BrainCircuit />,
  'Business Studies': <BriefcaseBusiness />,
  'Sociology': <Users />,
  'Political Science': <Landmark />,
  'Economy': <TrendingUp />,
  'Science': <FlaskConical />,
  'Music': <Music />,
  'Art': <Palette />,
  'World Languages': <Globe />,
  'Hindi': <Languages />,
  'Chinese': <Languages />,
  'India Languages': <Languages />,
  'Computer Science': <Computer />,
  'Environmental Sciences': <Leaf />,
  'Social Sciences': <Users />,
  'Chemistry': <FlaskConical />,
  'Physics': <Atom />,
  'Biology': <Dna />,
  'Geography': <Globe />,
  'English': <BookOpen />,
  'History': <History />,
  'Math': <Calculator />,
};

const ITEMS_PER_PAGE = 10;

// Main Page Component
export default function QuestionsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const { openAuthDialog } = useAuthDialog();

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [leaderboardUsers, setLeaderboardUsers] = useState<UserProfile[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const lastVisibleRef = useRef<DocumentSnapshot | null>(null);
    const [selectedSubject, setSelectedSubject] = useState('All subjects');

    // State for "Ask Question" dialog
    const [isAskDialogOpen, setIsAskDialogOpen] = useState(false);
    const [boards, setBoards] = useState<Board[]>([]);
    const [classCategories, setClassCategories] = useState<ClassCategory[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [loadingMetadata, setLoadingMetadata] = useState(true);

    const askForm = useForm<QuestionFormValues>({
        resolver: zodResolver(questionFormSchema),
        defaultValues: {
            text: '',
            subject: '',
            board: '',
            classCategory: '',
            grade: '',
            type: 'Descriptive',
        },
    });

    const selectedClassCategoryForAsk = askForm.watch('classCategory');

    const fetchQuestions = useCallback(async (isInitial = false) => {
        if(isInitial) {
            setLoading(true);
            lastVisibleRef.current = null;
        } else {
            setLoadingMore(true);
        }

        try {
            const { questions: newQuestions, lastVisible: newLastVisible, hasMore: newHasMore } = await getPaginatedQuestions(ITEMS_PER_PAGE, isInitial ? null : lastVisibleRef.current);
            setQuestions(prev => isInitial ? newQuestions : [...prev, ...newQuestions]);
            lastVisibleRef.current = newLastVisible;
            setHasMore(newHasMore);
        } catch (error) {
             toast({ variant: 'destructive', title: 'Error fetching questions', description: (error as Error).message });
        } finally {
            if(isInitial) setLoading(false);
            setLoadingMore(false);
        }
    }, [toast]);
    
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setLoadingMetadata(true);
            try {
                const [subjectsData, leaderboardData, boardsData, classesData] = await Promise.all([
                    getSubjects(),
                    getAllUsers(),
                    getBoards(),
                    getClasses(),
                ]);
                setSubjects([{ id: 'all', name: 'All subjects' }, ...subjectsData]);
                setBoards(boardsData);
                setClassCategories(classesData);
                
                const usersWithPoints = leaderboardData.map(u => ({...u, points: Math.floor(Math.random() * 1000)}));
                usersWithPoints.sort((a, b) => b.points - a.points);
                setLeaderboardUsers(usersWithPoints.slice(0, 5));

                if (user) {
                    const profileData = await getUserProfile(user.uid);
                    setUserProfile({...profileData, points: Math.floor(Math.random() * 200)} as UserProfile);
                }

                fetchQuestions(true);

            } catch (error) {
                toast({ variant: 'destructive', title: 'Error fetching initial data', description: (error as Error).message });
            } finally {
                setLoading(false);
                setLoadingMetadata(false);
            }
        };
        fetchData();
    }, [user, toast, fetchQuestions]);

    useEffect(() => {
        const fetchGrades = async () => {
            if (selectedClassCategoryForAsk) {
                const fetchedGrades = await getGradesByClass(selectedClassCategoryForAsk);
                setGrades(fetchedGrades);
            } else {
                setGrades([]);
            }
        };
        fetchGrades();
    }, [selectedClassCategoryForAsk]);

    const onAskSubmit: SubmitHandler<QuestionFormValues> = async (data) => {
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
                marks: 1, 
            };

            const newQuestionId = await addQuestion(questionData);
            
            toast({
                title: 'Question Submitted!',
                description: "Your question has been posted.",
            });
            setIsAskDialogOpen(false);
            askForm.reset();
            fetchQuestions(true);

        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error submitting question',
                description: (error as Error).message,
            });
        }
    };
    

    const filteredQuestions = useMemo(() => {
        if (selectedSubject === 'All subjects') {
            return questions;
        }
        return questions.filter(q => q.subject === selectedSubject);
    }, [questions, selectedSubject]);

    return (
        <div className="bg-secondary/30">
            <div className="container mx-auto grid grid-cols-1 lg:grid-cols-[250px_1fr_300px] gap-8 py-8">
                {/* Left Sidebar */}
                <aside className="hidden lg:block">
                    <Card>
                        <CardHeader>
                            <CardTitle>Subjects</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-1">
                                {subjects.map(subject => (
                                    <li key={subject.id}>
                                        <Button
                                            variant={selectedSubject === subject.name ? 'secondary' : 'ghost'}
                                            className="w-full justify-start gap-2"
                                            onClick={() => setSelectedSubject(subject.name)}
                                        >
                                            {subjectIcons[subject.name] || <Book className="h-4 w-4" />}
                                            {subject.name}
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </aside>

                {/* Main Content */}
                <main className="space-y-6">
                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle className="font-headline text-3xl font-bold">Get Answers for FREE</CardTitle>
                        </CardHeader>
                        <CardContent className="flex justify-center gap-4">
                            <Dialog open={isAskDialogOpen} onOpenChange={setIsAskDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button size="lg">ASK YOUR QUESTION</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-xl">
                                    <DialogHeader>
                                        <DialogTitle>Ask a Question</DialogTitle>
                                        <DialogDescription>
                                            Post your question to the community. Provide as much detail as possible.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <Form {...askForm}>
                                        <form onSubmit={askForm.handleSubmit(onAskSubmit)} className="space-y-4">
                                            <FormField
                                                control={askForm.control}
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
                                                    control={askForm.control}
                                                    name="subject"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Subject</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <FormControl><SelectTrigger><SelectValue placeholder="Select a subject" /></SelectTrigger></FormControl>
                                                                <SelectContent>
                                                                    {subjects.filter(s=>s.id !== 'all').map(subject => (
                                                                        <SelectItem key={subject.id} value={subject.name}>{subject.name}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={askForm.control}
                                                    name="type"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Question Type</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl><SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger></FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="Descriptive">Descriptive</SelectItem>
                                                                    <SelectItem value="Multiple Choice">Multiple Choice</SelectItem>
                                                                    <SelectItem value="True/False">True/False</SelectItem>
                                                                    <SelectItem value="Short Answer">Short Answer</SelectItem>
                                                                    <SelectItem value="Fill in the Blank">Fill in the Blank</SelectItem>
                                                                    <SelectItem value="Matching">Matching</SelectItem>
                                                                    <SelectItem value="Grouped">Grouped</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <FormField
                                                    control={askForm.control}
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
                                                <FormField
                                                    control={askForm.control}
                                                    name="classCategory"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Class Category (Optional)</FormLabel>
                                                            <Select onValueChange={(value) => { field.onChange(value); askForm.setValue('grade', ''); }} value={field.value}>
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
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <FormField
                                                    control={askForm.control}
                                                    name="grade"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Grade (Optional)</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value} disabled={!selectedClassCategoryForAsk}>
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
                                            <DialogFooter>
                                                <Button type="submit" disabled={askForm.formState.isSubmitting}>
                                                    <Send className="mr-2 h-4 w-4" />
                                                    {askForm.formState.isSubmitting ? "Submitting..." : "Submit Question"}
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </Form>
                                </DialogContent>
                            </Dialog>
                             <Button asChild variant="outline" size="lg">
                                <Link href="/admin/add-content/add-ai-question">
                                    <Sparkles className="mr-2" />
                                    Add with AI
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                    <div className="flex justify-between items-center">
                        <Select defaultValue="all">
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="All levels" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All levels</SelectItem>
                            </SelectContent>
                        </Select>
                         <Select defaultValue="unanswered">
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Unanswered" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="unanswered">Unanswered</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {loading && questions.length === 0 ? (
                        <div className="space-y-4">
                           {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
                        </div>
                    ) : filteredQuestions.length > 0 ? (
                        <div className="space-y-4">
                            {filteredQuestions.map(q => (
                                <Card key={q.id}>
                                    <CardHeader>
                                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <span>{q.subject}</span>
                                                <span>&middot;</span>
                                                <span>{q.createdAt}</span>
                                            </div>
                                            <Badge variant="outline">+5 pts</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <Link href={`/question/${q.id}`} className="font-semibold text-lg hover:text-primary">
                                            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]} className="prose dark:prose-invert max-w-none text-base">
                                                {q.text}
                                            </ReactMarkdown>
                                        </Link>
                                    </CardContent>
                                     <CardContent className="flex justify-between items-center">
                                        <Button variant="outline" asChild>
                                            <Link href={`/question/${q.id}`}>ANSWER</Link>
                                        </Button>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal />
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                            {hasMore && (
                                <Button onClick={() => fetchQuestions(false)} disabled={loadingMore} className="w-full">
                                    {loadingMore ? <Loader2 className="animate-spin" /> : "Load More"}
                                </Button>
                            )}
                        </div>
                    ) : (
                         <div className="text-center py-16 text-muted-foreground">
                            <p>No questions found for this subject.</p>
                        </div>
                    )}
                </main>

                {/* Right Sidebar */}
                <aside className="hidden lg:block space-y-6">
                    {userProfile ? (
                        <Card>
                            <CardHeader className="items-center text-center">
                                <Avatar className="w-16 h-16 mb-2">
                                    <AvatarImage src={userProfile.photoURL || undefined} />
                                    <AvatarFallback>{userProfile.displayName?.[0]}</AvatarFallback>
                                </Avatar>
                                <CardTitle className="text-lg">{userProfile.username}</CardTitle>
                                <CardDescription>Helping Hand</CardDescription>
                            </CardHeader>
                             <CardContent className="text-center space-y-2">
                                <p className="font-bold">{userProfile.points} pts</p>
                                <Button variant="ghost" className="w-full justify-start text-sm"><User className="mr-2"/> Brainly Space</Button>
                                <Button variant="ghost" className="w-full justify-start text-sm"><Plus className="mr-2"/> First Contact</Button>
                                <Button asChild variant="link" className="w-full">
                                    <Link href="/dashboard/profile">View My Achievements</Link>
                                </Button>
                             </CardContent>
                        </Card>
                    ) : (
                        <Card>
                             <CardHeader><Skeleton className="h-16 w-16 rounded-full mx-auto" /></CardHeader>
                             <CardContent className="space-y-2 items-center flex flex-col">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-4 w-32" />
                             </CardContent>
                        </Card>
                    )}
                    <Card>
                         <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2"><Trophy className="text-yellow-500"/> Brainliest users</CardTitle>
                             <Select defaultValue="daily">
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="daily">Daily ranking</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardHeader>
                        <CardContent>
                           <ul className="space-y-4">
                            {leaderboardUsers.map(u => (
                                <li key={u.uid} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="w-8 h-8">
                                            <AvatarImage src={u.photoURL || undefined} />
                                            <AvatarFallback>{u.displayName?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-medium">{u.username}</span>
                                    </div>
                                    <span className="text-sm font-bold">{u.points} pts</span>
                                </li>
                            ))}
                           </ul>
                           <Button variant="link" className="w-full mt-4">LOAD MORE</Button>
                        </CardContent>
                    </Card>
                </aside>
            </div>
        </div>
    )
}
