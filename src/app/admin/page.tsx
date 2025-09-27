

'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users, FileText, BarChart2, Activity, PlusCircle, FilePlus, Eye } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAllUsers, getAllContent, getTodaysSubmissions, getUserProfile } from '@/lib/firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScoreCircle } from '@/components/feature/score-circle';

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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, content, submissions] = await Promise.all([
          getAllUsers(),
          getAllContent(),
          getTodaysSubmissions(),
        ]);

        const submissionsWithUsers = await Promise.all(
          submissions.slice(0, 5).map(async (sub) => {
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
    fetchStats();
  }, []);
  
  const getUrlForResults = (testType: string, testId: string, submissionId: string) => {
    const typeSlug = (testType || 'content').toLowerCase().replace(/\s+/g, '-');
    return `/${typeSlug}/${testId}/results?submissionId=${submissionId}`;
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

       <div className="grid gap-6 md:grid-cols-2">
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
                    {loading ? (
                       <Skeleton className="h-48 w-full" />
                    ) : recentSubmissions.length > 0 ? (
                        <Table>
                           <TableBody>
                            {recentSubmissions.map(sub => (
                                <TableRow key={sub.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={sub.user?.photoURL} />
                                                <AvatarFallback>{sub.user?.displayName?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{sub.user?.displayName}</div>
                                                <div className="text-sm text-muted-foreground">{sub.testTitle}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <ScoreCircle score={(sub.score / sub.totalQuestions) * 100} size={36} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={getUrlForResults(sub.testType, sub.testId, sub.id)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                View
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                           </TableBody>
                       </Table>
                    ) : (
                       <p className="text-muted-foreground text-center py-10">No submissions yet.</p>
                    )}
                </CardContent>
            </Card>
       </div>
    </div>
  );
}
