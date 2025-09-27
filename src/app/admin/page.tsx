

'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users, FileText, BarChart2, Activity, PlusCircle, FilePlus, Eye, Trash2, Book } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getPaginatedSubmissions, getAllContent, getUserProfile, deleteSubmissions, getAllUsers } from '@/lib/firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScoreCircle } from '@/components/feature/score-circle';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { DocumentSnapshot } from 'firebase/firestore';

type Submission = {
  id: string;
  testId: string;
  testTitle: string;
  score: number;
  totalQuestions: number;
  submittedAt: any;
  testType: string;
  userId: string;
  user?: {
    displayName: string;
    photoURL?: string;
  };
};

const ITEMS_PER_PAGE = 5;

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalContent: 0,
    submissionsToday: 0,
  });
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);
  const [submissionToDelete, setSubmissionToDelete] = useState<Submission | null>(null);

  const [submissionsCurrentPage, setSubmissionsCurrentPage] = useState(1);
  const [submissionsLastVisible, setSubmissionsLastVisible] = useState<DocumentSnapshot | null>(null);
  const [submissionsPageHistory, setSubmissionsPageHistory] = useState<(DocumentSnapshot | null)[]>([null]);
  const [hasMoreSubmissions, setHasMoreSubmissions] = useState(true);


  const fetchStatsAndSubmissions = async (page: number, startAfter: DocumentSnapshot | null) => {
    try {
      setLoading(true);

      // Fetch stats only on the first page load
      if (page === 1) {
        const [users, content] = await Promise.all([
          getAllUsers(),
          getAllContent(),
        ]);
        setStats({
          totalUsers: users.length,
          totalContent: content.length,
          submissionsToday: 0, // This is no longer accurate as we fetch all submissions
        });
      }
      
      const { submissions, lastVisible, hasMore } = await getPaginatedSubmissions(ITEMS_PER_PAGE, startAfter);

      const submissionsWithUsers = await Promise.all(
        submissions.map(async (sub: any) => {
          const userProfile = await getUserProfile(sub.userId);
          return {
            ...sub,
            user: {
              displayName: userProfile?.displayName || 'Unknown User',
              photoURL: userProfile?.photoURL,
            }
          } as Submission;
        })
      );

      setRecentSubmissions(submissionsWithUsers);
      setSubmissionsLastVisible(lastVisible);
      setHasMoreSubmissions(hasMore);

      if (page >= submissionsPageHistory.length) {
        setSubmissionsPageHistory(prev => [...prev, lastVisible]);
      }
      
    } catch (error) {
      console.error("Failed to fetch admin dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatsAndSubmissions(1, null);
  }, []);
  
  const handleNextPage = () => {
    if (hasMoreSubmissions) {
        const nextPage = submissionsCurrentPage + 1;
        fetchStatsAndSubmissions(nextPage, submissionsLastVisible);
        setSubmissionsCurrentPage(nextPage);
    }
  }

  const handlePrevPage = () => {
      if (submissionsCurrentPage > 1) {
          const prevPage = submissionsCurrentPage - 1;
          const prevStartAfter = submissionsPageHistory[prevPage - 1];
          fetchStatsAndSubmissions(prevPage, prevStartAfter);
          setSubmissionsCurrentPage(prevPage);
      }
  }

  const getUrlForResults = (testType: string, testId: string, submissionId: string) => {
    const typeSlug = (testType || 'content').toLowerCase().replace(/\s+/g, '-');
    return `/${typeSlug}/${testId}/results?submissionId=${submissionId}`;
  }
  
  const handleSelectSubmission = (id: string) => {
    setSelectedSubmissions(prev => 
      prev.includes(id) ? prev.filter(subId => subId !== id) : [...prev, id]
    );
  }

  const handleDelete = async (ids: string[]) => {
    try {
        await deleteSubmissions(ids);
        toast({ title: `${ids.length} submission(s) deleted successfully!` });
        setRecentSubmissions(prev => prev.filter(sub => !ids.includes(sub.id)));
        setSelectedSubmissions([]);
        setSubmissionToDelete(null);
    } catch (error) {
         toast({
            variant: "destructive",
            title: 'Error deleting submissions',
            description: (error as Error).message,
        });
    }
  }

  const adminStats = [
    { title: "Total Users", value: stats.totalUsers, icon: <Users/>, description: "Total registered users" },
    { title: "Total Content", value: stats.totalContent, icon: <FileText/>, description: "Tests, quizzes, and articles" },
    { title: "Total Submissions", value: stats.submissionsToday, icon: <BarChart2/>, description: "All test submissions" },
     { title: "Site Activity", value: "High", icon: <Activity/>, description: "All systems normal" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
            <h1 className="font-headline text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
                Welcome, Admin! Here's an overview of your platform.
            </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {adminStats.map((stat, index) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <span className="text-muted-foreground">{stat.icon}</span>
            </CardHeader>
            <CardContent>
              {loading ? (
                <>
                  <Skeleton className="h-8 w-1/2 mb-2" />
                  <Skeleton className="h-3 w-3/4" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Perform common administrative tasks.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4">
                    <Link href="/admin/users" className="p-4 border rounded-lg hover:bg-secondary text-center">
                        <Users className="mx-auto mb-2" />
                        <span>Manage Users</span>
                    </Link>
                     <Link href="/admin/content" className="p-4 border rounded-lg hover:bg-secondary text-center">
                        <FileText className="mx-auto mb-2" />
                        <span>Manage Content</span>
                    </Link>
                    <Link href="/admin/textbooks" className="p-4 border rounded-lg hover:bg-secondary text-center">
                        <Book className="mx-auto mb-2" />
                        <span>Manage Textbooks</span>
                    </Link>
                    <Link href="/admin/add-content" className="p-4 border rounded-lg hover:bg-secondary text-center">
                        <PlusCircle className="mx-auto mb-2" />
                        <span>Add Quiz/Test</span>
                    </Link>
                     <Link href="/admin/add-article" className="p-4 border rounded-lg hover:bg-secondary text-center">
                        <FilePlus className="mx-auto mb-2" />
                        <span>Add Article</span>
                    </Link>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Recent Submissions</CardTitle>
                     <CardDescription>The latest test submissions from users.</CardDescription>
                </CardHeader>
                <CardContent>
                    {selectedSubmissions.length > 0 && (
                       <div className="mb-4">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                        <Trash2 className="mr-2 h-4 w-4"/>
                                        Delete Selected ({selectedSubmissions.length})
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>This will permanently delete {selectedSubmissions.length} submission(s).</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(selectedSubmissions)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}
                    {loading ? (
                       <Skeleton className="h-48 w-full" />
                    ) : recentSubmissions.length > 0 ? (
                        <div className="space-y-4">
                            {recentSubmissions.map(sub => (
                                <div key={sub.id} className="relative p-4 border rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                     <Checkbox 
                                        className="absolute top-2 right-2 sm:static sm:mr-4" 
                                        checked={selectedSubmissions.includes(sub.id)}
                                        onCheckedChange={() => handleSelectSubmission(sub.id)}
                                    />
                                    <div className="flex items-center gap-3 flex-grow min-w-0">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={sub.user?.photoURL} />
                                            <AvatarFallback>{sub.user?.displayName?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <div className="font-medium truncate">{sub.user?.displayName}</div>
                                            <div className="text-sm text-muted-foreground truncate">{sub.testTitle}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0 self-end sm:self-center">
                                        <ScoreCircle score={(sub.score / sub.totalQuestions) * 100} size={36} />
                                        <div className="flex gap-2">
                                            <Button asChild variant="outline" size="sm" className="flex-shrink-0">
                                                <Link href={getUrlForResults(sub.testType, sub.testId, sub.id)}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View
                                                </Link>
                                            </Button>
                                             <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4"/></Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Submission?</AlertDialogTitle>
                                                        <AlertDialogDescription>This will permanently delete this submission record. It cannot be undone.</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete([sub.id])}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                       <p className="text-muted-foreground text-center py-10">No submissions yet.</p>
                    )}
                </CardContent>
                 <CardFooter>
                    <div className="flex items-center justify-end space-x-2 w-full">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrevPage}
                            disabled={submissionsCurrentPage === 1 || loading}
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Page {submissionsCurrentPage}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNextPage}
                            disabled={!hasMoreSubmissions || loading}
                        >
                            Next
                        </Button>
                    </div>
                </CardFooter>
            </Card>
       </div>
    </div>
  );
}
