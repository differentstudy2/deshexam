

'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users, FileText, BarChart2, Activity, PlusCircle, FilePlus, Eye, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAllUsers, getAllContent, getTodaysSubmissions, getUserProfile, deleteSubmissions } from '@/lib/firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScoreCircle } from '@/components/feature/score-circle';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

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

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [users, content, submissions] = await Promise.all([
        getAllUsers(),
        getAllContent(),
        getTodaysSubmissions(),
      ]);

      const submissionsWithUsers = await Promise.all(
        submissions.slice(0, 10).map(async (sub) => {
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
      
      setStats({
        totalUsers: users.length,
        totalContent: content.length,
        submissionsToday: submissions.length,
      });

      setRecentSubmissions(submissionsWithUsers);
    } catch (error) {
      console.error("Failed to fetch admin dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);
  
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
                <CardContent className="grid grid-cols-2 gap-4">
                    <Link href="/admin/users" className="p-4 border rounded-lg hover:bg-secondary text-center">
                        <Users className="mx-auto mb-2" />
                        <span>Manage Users</span>
                    </Link>
                     <Link href="/admin/content" className="p-4 border rounded-lg hover:bg-secondary text-center">
                        <FileText className="mx-auto mb-2" />
                        <span>Manage Content</span>
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
                                <div key={sub.id} className="p-4 border rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                     <Checkbox 
                                        className="absolute top-2 right-2 sm:static sm:mr-4" 
                                        checked={selectedSubmissions.includes(sub.id)}
                                        onCheckedChange={() => handleSelectSubmission(sub.id)}
                                    />
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={sub.user?.photoURL} />
                                            <AvatarFallback>{sub.user?.displayName?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <div className="font-medium truncate">{sub.user?.displayName}</div>
                                            <div className="text-sm text-muted-foreground truncate">{sub.testTitle}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end gap-4 flex-grow">
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
            </Card>
       </div>
    </div>
  );
}
