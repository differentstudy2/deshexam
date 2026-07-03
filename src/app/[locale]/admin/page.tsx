'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Users, FileText, BarChart2, Activity, PlusCircle, FilePlus, Eye, Trash2, Book, ArrowUpRight, TrendingUp, Search } from 'lucide-react';
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Input } from '@/components/ui/input';

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

const activityData = [
  { name: 'Mon', submissions: 120 },
  { name: 'Tue', submissions: 150 },
  { name: 'Wed', submissions: 180 },
  { name: 'Thu', submissions: 140 },
  { name: 'Fri', submissions: 210 },
  { name: 'Sat', submissions: 250 },
  { name: 'Sun', submissions: 310 },
];

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
  
  const [submissionsCurrentPage, setSubmissionsCurrentPage] = useState(1);
  const [submissionsLastVisible, setSubmissionsLastVisible] = useState<DocumentSnapshot | null>(null);
  const [submissionsPageHistory, setSubmissionsPageHistory] = useState<(DocumentSnapshot | null)[]>([null]);
  const [hasMoreSubmissions, setHasMoreSubmissions] = useState(true);

  const fetchStatsAndSubmissions = async (page: number, startAfter: DocumentSnapshot | null) => {
    try {
      setLoading(true);
      if (page === 1) {
        const [users, content] = await Promise.all([
          getAllUsers(),
          getAllContent(),
        ]);
        setStats({
          totalUsers: users.length,
          totalContent: content.length,
          submissionsToday: 0,
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

  const getUrlForResults = (sub: Submission) => {
    if (sub.testType === 'Practice Set') {
      return `/textbook-solutions/practice-set/${sub.testId}/results?submissionId=${sub.id}`;
    }
    const typeSlug = (sub.testType || 'content').toLowerCase().replace(/\s+/g, '-');
    return `/${typeSlug}/${sub.testId}/results?submissionId=${sub.id}`;
  };
  
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
    } catch (error) {
         toast({
            variant: "destructive",
            title: 'Error deleting submissions',
            description: (error as Error).message,
        });
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
            <p className="text-muted-foreground mt-1">
                Here's what's happening with your platform today.
            </p>
        </div>
        <div className="flex items-center gap-2">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search..." className="w-64 pl-8 bg-white" />
            </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm bg-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Users className="w-16 h-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 z-10 relative">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Users</CardTitle>
          </CardHeader>
          <CardContent className="z-10 relative">
            {loading ? <Skeleton className="h-8 w-24" /> : (
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-slate-900">{stats.totalUsers}</div>
                <span className="text-sm font-medium text-green-600 flex items-center"><ArrowUpRight className="w-3 h-3 mr-1"/> 12%</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <FileText className="w-16 h-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 z-10 relative">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Content</CardTitle>
          </CardHeader>
          <CardContent className="z-10 relative">
            {loading ? <Skeleton className="h-8 w-24" /> : (
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-slate-900">{stats.totalContent}</div>
                <span className="text-sm font-medium text-green-600 flex items-center"><ArrowUpRight className="w-3 h-3 mr-1"/> 4%</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <BarChart2 className="w-16 h-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 z-10 relative">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Submissions</CardTitle>
          </CardHeader>
          <CardContent className="z-10 relative">
            {loading ? <Skeleton className="h-8 w-24" /> : (
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-slate-900">1,248</div>
                <span className="text-sm font-medium text-green-600 flex items-center"><ArrowUpRight className="w-3 h-3 mr-1"/> 24%</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-[#00a651] text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <TrendingUp className="w-16 h-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 z-10 relative">
            <CardTitle className="text-sm font-medium text-green-100 uppercase tracking-wider">Revenue (Monthly)</CardTitle>
          </CardHeader>
          <CardContent className="z-10 relative">
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold">₹ 45,200</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart Area */}
        <Card className="lg:col-span-2 border-none shadow-sm">
            <CardHeader>
                <CardTitle>Activity Overview</CardTitle>
                <CardDescription>Daily test submissions over the last week.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={activityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00a651" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#00a651" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                            <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Area type="monotone" dataKey="submissions" stroke="#00a651" strokeWidth={3} fillOpacity={1} fill="url(#colorSubmissions)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-none shadow-sm">
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-3">
                    <Link href="/admin/add-content" className="flex flex-col items-center justify-center p-4 border rounded-xl hover:bg-[#00a651] hover:text-white hover:border-[#00a651] transition-all group">
                        <PlusCircle className="mb-2 h-6 w-6 text-slate-500 group-hover:text-white" />
                        <span className="text-sm font-medium">Add Quiz</span>
                    </Link>
                    <Link href="/admin/add-article" className="flex flex-col items-center justify-center p-4 border rounded-xl hover:bg-[#00a651] hover:text-white hover:border-[#00a651] transition-all group">
                        <FilePlus className="mb-2 h-6 w-6 text-slate-500 group-hover:text-white" />
                        <span className="text-sm font-medium">Add Article</span>
                    </Link>
                    <Link href="/admin/users" className="flex flex-col items-center justify-center p-4 border rounded-xl hover:bg-slate-100 transition-all">
                        <Users className="mb-2 h-6 w-6 text-slate-500" />
                        <span className="text-sm font-medium">Users</span>
                    </Link>
                    <Link href="/admin/textbooks" className="flex flex-col items-center justify-center p-4 border rounded-xl hover:bg-slate-100 transition-all">
                        <Book className="mb-2 h-6 w-6 text-slate-500" />
                        <span className="text-sm font-medium">Textbooks</span>
                    </Link>
                </div>
            </CardContent>
        </Card>
      </div>

      {/* Submissions Table */}
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Recent Submissions</CardTitle>
                <CardDescription>Latest test results from users across the platform.</CardDescription>
            </div>
            {selectedSubmissions.length > 0 && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="shadow-sm">
                            <Trash2 className="mr-2 h-4 w-4"/>
                            Delete ({selectedSubmissions.length})
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently delete {selectedSubmissions.length} submission(s).</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(selectedSubmissions)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </CardHeader>
        <CardContent>
            {loading ? (
                <div className="space-y-4">
                    <Skeleton className="h-16 w-full rounded-xl" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                </div>
            ) : recentSubmissions.length > 0 ? (
                <div className="rounded-md border border-slate-100">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-4 py-3 w-10"></th>
                                <th className="px-4 py-3">User</th>
                                <th className="px-4 py-3">Test Title</th>
                                <th className="px-4 py-3 text-center">Score</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {recentSubmissions.map(sub => (
                                <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-4 py-3">
                                        <Checkbox 
                                            checked={selectedSubmissions.includes(sub.id)}
                                            onCheckedChange={() => handleSelectSubmission(sub.id)}
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8 border">
                                                <AvatarImage src={sub.user?.photoURL} />
                                                <AvatarFallback className="bg-primary/10 text-primary text-xs">{sub.user?.displayName?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium text-slate-900">{sub.user?.displayName}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">{sub.testTitle}</td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex justify-center">
                                            <ScoreCircle score={(sub.score / sub.totalQuestions) * 100} size={32} />
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button asChild variant="outline" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50">
                                                <Link href={getUrlForResults(sub)}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="outline" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50">
                                                        <Trash2 className="h-4 w-4"/>
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Submission?</AlertDialogTitle>
                                                        <AlertDialogDescription>This will permanently delete this submission record. It cannot be undone.</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete([sub.id])} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                        <FileText className="h-6 w-6 text-slate-400" />
                    </div>
                    <h3 className="font-medium text-slate-900">No submissions found</h3>
                    <p className="text-sm text-slate-500 mt-1">There hasn't been any test activity yet.</p>
                </div>
            )}
        </CardContent>
        <CardFooter className="border-t border-slate-100 bg-slate-50/50 rounded-b-xl py-3">
            <div className="flex items-center justify-between w-full">
                <span className="text-xs text-slate-500">
                    Showing Page {submissionsCurrentPage}
                </span>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevPage}
                        disabled={submissionsCurrentPage === 1 || loading}
                        className="h-8 text-xs"
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={!hasMoreSubmissions || loading}
                        className="h-8 text-xs"
                    >
                        Next
                    </Button>
                </div>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}
