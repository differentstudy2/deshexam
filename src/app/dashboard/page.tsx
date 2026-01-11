
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis } from 'recharts';
import { getContentById, getAllTextbooks, getUserProfile, deleteSubmissions } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/button';
import { Eye, PlusCircle, FileText, BarChart2, Book, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { ChartConfig } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import type { Textbook } from '@/lib/types';
import Image from 'next/image';
import { TextbookStats } from '@/components/feature/textbook-stats';
import { Badge } from '@/components/ui/badge';
import { ContentBadge } from '@/components/content-badge';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


type Submission = {
  id: string;
  testId: string;
  testTitle: string;
  score: number;
  totalQuestions: number;
  submittedAt: any; 
  testType: string;
  subject?: string;
};

const chartConfig = {
  score: {
    label: "Score (%)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;


export default function DashboardPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommendedTextbooks, setRecommendedTextbooks] = useState<Textbook[]>([]);
  const [loadingTextbooks, setLoadingTextbooks] = useState(true);
  const { toast } = useToast();
  const [submissionToDelete, setSubmissionToDelete] = useState<Submission | null>(null);

  useEffect(() => {
    if (!user) {
        setLoading(false);
        setLoadingTextbooks(false);
        return;
    }

    setLoading(true);
    setLoadingTextbooks(true);

    const fetchSubmissions = (collectionName: string, isPracticeSet: boolean) => {
        const q = query(collection(db, collectionName), where("userId", "==", user.uid));
        
        return onSnapshot(q, (querySnapshot) => {
            const userSubmissions = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    testId: isPracticeSet ? data.practiceSetId : data.testId,
                    testTitle: isPracticeSet ? data.practiceSetTitle : data.testTitle,
                    testType: isPracticeSet ? 'Practice Set' : data.testType,
                    // Convert to JS Date object immediately
                    submittedAt: data.submittedAt?.toDate ? data.submittedAt.toDate() : new Date(data.submittedAt),
                } as Submission;
            });

            setSubmissions(prev => {
                const otherSubmissions = prev.filter(s => (s.testType === 'Practice Set') !== isPracticeSet);
                const combined = [...otherSubmissions, ...userSubmissions];
                // Now sort using standard JS Date getTime()
                combined.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
                return combined;
            });

            setLoading(false);

        }, (error) => {
            console.error(`Error fetching real-time ${collectionName}: `, error);
            toast({
                variant: "destructive",
                title: "Real-time Update Failed",
                description: `Could not fetch your latest results from ${collectionName}.`,
            });
            setLoading(false);
        });
    };

    const unsubscribeSubmissions = fetchSubmissions('submissions', false);
    const unsubscribePracticeSets = fetchSubmissions('practiceSetSubmissions', true);

    const fetchRecommendations = async () => {
        try {
            const userProfile = await getUserProfile(user.uid);
            const allTextbooks = (await getAllTextbooks()) as Textbook[];
            
            if (userProfile && allTextbooks.length > 0) {
                const filteredTextbooks = allTextbooks.filter(book => {
                    return userProfile.grade ? book.class === userProfile.grade : false;
                });
                setRecommendedTextbooks(filteredTextbooks);
            }
        } catch(error) {
            console.error("Failed to fetch textbook recommendations:", error);
        } finally {
            setLoadingTextbooks(false);
        }
    }
    
    fetchRecommendations();

    return () => {
        unsubscribeSubmissions();
        unsubscribePracticeSets();
    };
  }, [user, toast]);


  const getUrlForTest = (testType: string, testId: string, submissionId: string) => {
      const typeSlug = (testType || 'content').toLowerCase().replace(/\s+/g, '-');
      return `/${typeSlug}/${testId}/results?submissionId=${submissionId}`;
  }

  const averageScore = useMemo(() => {
    if (submissions.length === 0) return 0;
    const totalPercentage = submissions.reduce((acc, sub) => {
        const percentage = sub.totalQuestions > 0 ? (sub.score / sub.totalQuestions) * 100 : 0;
        return acc + percentage;
    }, 0);
    return Math.round(totalPercentage / submissions.length);
  }, [submissions]);

  const chartData = useMemo(() => submissions.slice(0, 6).reverse().map((sub, index) => ({
      name: `Test #${submissions.length - index}`,
      score: sub.totalQuestions > 0 ? Math.round((sub.score / sub.totalQuestions) * 100) : 0,
  })), [submissions]);
  
  const dashboardStats = [
    { title: "Tests Taken", value: submissions.length, icon: <FileText/>, description: "Total tests completed" },
    { title: "Average Score", value: `${averageScore}%`, icon: <BarChart2/>, description: "Your average across all tests" },
  ];

  const handleDelete = async () => {
    if (!submissionToDelete) return;
    try {
        await deleteSubmissions([submissionToDelete.id]);
        toast({ title: `Submission for "${submissionToDelete.testTitle}" deleted.` });
        setSubmissionToDelete(null);
    } catch (error) {
         toast({
            variant: "destructive",
            title: 'Error deleting submission',
            description: (error as Error).message,
        });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
            <h1 className="font-headline text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
                Welcome back! Here's a summary of your progress.
            </p>
        </div>
        <Button asChild>
            <Link href="/mock-tests">
              <PlusCircle className="mr-2"/>
              Take a Test
            </Link>
          </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        {loading ? (
           Array.from({ length: 2 }).map((_, i) => (
             <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-1/3"/>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/2 mb-2"/>
                <Skeleton className="h-3 w-3/4"/>
              </CardContent>
            </Card>
           ))
        ) : (
          dashboardStats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <span className="text-muted-foreground">{stat.icon}</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                 <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
       {loadingTextbooks ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="flex flex-col overflow-hidden">
                  <CardHeader className="p-0 relative bg-gray-100 flex items-center justify-center h-[18rem]">
                    <Skeleton className="w-full h-full" />
                  </CardHeader>
                  <CardContent className="flex-grow p-4 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </CardContent>
          </Card>
      ) : recommendedTextbooks.length > 0 && (
          <Card>
              <CardHeader>
                  <CardTitle>Recommended Textbook Solutions</CardTitle>
                  <CardDescription>Based on your profile, we think you'll find these helpful.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {recommendedTextbooks.map(book => (
                    <Card key={book.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow">
                        <CardHeader className="p-0 relative bg-gray-100 dark:bg-gray-800 flex items-center justify-center h-[18rem]">
                            <Link href={`/textbook-solutions/${book.id}`} className="block w-full h-full">
                                <Image
                                src={book.featureImage || `https://picsum.photos/seed/${book.id}/200/280`}
                                alt={book.title}
                                width={200}
                                height={280}
                                className="w-full h-full object-contain p-2"
                                data-ai-hint={`${book.subject || ''} textbook`}
                                />
                            </Link>
                            <div className="absolute top-2 right-2">
                                <ContentBadge type={book.access} />
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow p-4 space-y-2">
                            <div className="flex flex-wrap gap-1">
                                {book.subject && <Badge variant="outline">{book.subject}</Badge>}
                                {book.class && <Badge variant="outline">{book.class}</Badge>}
                                {book.board && <Badge variant="outline">{book.board}</Badge>}
                            </div>
                            <Link href={`/textbook-solutions/${book.id}`}>
                                <h3 className="font-bold text-lg hover:text-primary transition-colors">{book.title}</h3>
                            </Link>
                            <p className="text-xs text-muted-foreground">by {(book as any).authorName || 'DeshExam'}</p>
                            <TextbookStats textbookId={book.id} />
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                            <Button asChild className="w-full">
                                <Link href={`/textbook-solutions/${book.id}`}><Book className="mr-2"/> View Solutions</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                  ))}
              </CardContent>
          </Card>
      )}

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Performance Over Time</CardTitle>
            <CardDescription>
              Your scores on the last {chartData.length} tests taken.
            </CardDescription>
          </CardHeader>
          <CardContent>
           {loading ? (
             <Skeleton className="h-[250px] w-full" />
           ) : chartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <AreaChart data={chartData} margin={{ left: -20, top: 10 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-score)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-score)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `${value}%`}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <Area
                  dataKey="score"
                  type="natural"
                  fill="url(#colorScore)"
                  stroke="var(--color-score)"
                  stackId="a"
                />
                 <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
             ) : (
                <div className="flex h-[250px] w-full items-center justify-center text-muted-foreground text-center">
                    <p>No performance data yet. <br/> Take a test to see your progress!</p>
                </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Here are the last tests you've taken.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Name</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                          <Skeleton className="h-5 w-3/4 mb-1"/>
                          <Skeleton className="h-4 w-1/2"/>
                      </TableCell>
                       <TableCell><Skeleton className="h-5 w-12"/></TableCell>
                       <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto"/></TableCell>
                    </TableRow>
                  ))
                ) : submissions.length > 0 ? (
                  submissions.slice(0, 5).map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div className="font-medium">{sub.testTitle}</div>
                      <div className="text-sm text-muted-foreground">
                         {sub.subject && `${sub.subject} - `}{sub.testType}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {sub.totalQuestions > 0 ? `${Math.round((sub.score / sub.totalQuestions) * 100)}%` : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={getUrlForTest(sub.testType, sub.testId, sub.id)}>
                           <Eye className="mr-2 h-4 w-4" /> View
                        </Link>
                      </Button>
                      <AlertDialog>
                          <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                  <Trash2 className="h-4 w-4"/>
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                      This will permanently delete this submission. This action cannot be undone.
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => setSubmissionToDelete(null)}>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete()}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">You haven't taken any tests yet.</TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

       <AlertDialog open={!!submissionToDelete} onOpenChange={() => setSubmissionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete your submission for "{submissionToDelete?.testTitle}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
