
'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getSubjects, getPaginatedQuestions, getUserProfile, getAllUsers } from '@/lib/firebase/firestore';
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
    Users,
    Trophy,
    BrainCircuit,
    TrendingUp,
    Computer,
    Leaf,
    BookOpen,
    Calculator,
    Clapperboard,
    Loader2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Badge } from '@/components/ui/badge';

type Subject = { id: string, name: string };
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
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [leaderboardUsers, setLeaderboardUsers] = useState<UserProfile[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null);
    const [selectedSubject, setSelectedSubject] = useState('All subjects');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [subjectsData, leaderboardData] = await Promise.all([
                    getSubjects(),
                    getAllUsers(),
                ]);
                setSubjects([{ id: 'all', name: 'All subjects' }, ...subjectsData]);
                
                const usersWithPoints = leaderboardData.map(u => ({...u, points: Math.floor(Math.random() * 1000)}));
                usersWithPoints.sort((a, b) => b.points - a.points);
                setLeaderboardUsers(usersWithPoints.slice(0, 5));

                if (user) {
                    const profileData = await getUserProfile(user.uid);
                    setUserProfile({...profileData, points: Math.floor(Math.random() * 200)} as UserProfile);
                }

                await fetchQuestions(true);

            } catch (error) {
                toast({ variant: 'destructive', title: 'Error fetching initial data', description: (error as Error).message });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user, toast]);
    
    const fetchQuestions = async (isInitial = false) => {
        if(isInitial) {
            setQuestions([]);
            setLastVisible(null);
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const { questions: newQuestions, lastVisible: newLastVisible, hasMore: newHasMore } = await getPaginatedQuestions(ITEMS_PER_PAGE, isInitial ? null : lastVisible);
            setQuestions(prev => isInitial ? newQuestions : [...prev, ...newQuestions]);
            setLastVisible(newLastVisible);
            setHasMore(newHasMore);
        } catch (error) {
             toast({ variant: 'destructive', title: 'Error fetching questions', description: (error as Error).message });
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }

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
                        <CardContent className="flex justify-center">
                            <Button size="lg" asChild>
                                <Link href="/questions/ask">ASK YOUR QUESTION</Link>
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
                                            <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose dark:prose-invert max-w-none text-base">
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
                                <Button onClick={() => fetchQuestions()} disabled={loadingMore} className="w-full">
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
                                    <AvatarImage src={userProfile.photoURL} />
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
                                            <AvatarImage src={u.photoURL} />
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
