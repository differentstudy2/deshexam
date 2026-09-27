'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Users, FileText, BarChart2, PlusCircle, FilePlus, Book, ArrowUpRight, TrendingUp, Search, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getPaginatedSubmissions, getAllContent, getUserProfile, deleteSubmissions, getAllUsers } from '@/lib/firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { DocumentSnapshot } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { ActivityChart } from '@/components/admin/overview/ActivityChart';
import { SubmissionsTable } from '@/components/admin/overview/SubmissionsTable';
import Link from 'next/link';

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

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-10 max-w-7xl mx-auto">
      
      {/* Background Soft Gradients */}
      <div className="fixed top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none -z-10" />
      
      {/* Hero Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pt-4">
        <div>
            <p className="text-sm font-semibold text-emerald-600 tracking-wide uppercase mb-1">{currentDate}</p>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 font-lexend">Good Morning, Admin</h1>
            <p className="text-muted-foreground mt-2 text-lg max-w-xl">
                Here is what's happening with your platform today.
            </p>
        </div>
        <div className="w-full md:w-auto relative group">
            <div className="absolute inset-0 bg-emerald-400/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 z-10" />
            <Input 
              type="search" 
              placeholder="Search users, tests, content..." 
              className="w-full md:w-80 h-12 pl-12 bg-white/70 backdrop-blur-md border-slate-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.03)] rounded-2xl relative z-10 text-base focus-visible:ring-emerald-500/50" 
            />
        </div>
      </div>

      {/* Premium Stat Cards (Top Row) */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/80 backdrop-blur-xl overflow-hidden relative group rounded-3xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
          <div className="absolute -right-4 -top-4 bg-indigo-50 w-24 h-24 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
            <Users className="w-8 h-8 text-indigo-400 mr-2 mt-2" />
          </div>
          <CardContent className="p-6 relative z-10">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Users</p>
            {loading ? <Skeleton className="h-10 w-24 rounded-lg" /> : (
              <div className="flex flex-col gap-1">
                <div className="text-4xl font-bold text-slate-900 font-lexend">{stats.totalUsers}</div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-600"><ArrowUpRight className="w-3 h-3"/></span>
                  <span className="text-sm font-medium text-slate-600"><span className="text-emerald-600 font-semibold">12%</span> vs last month</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total Content */}
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/80 backdrop-blur-xl overflow-hidden relative group rounded-3xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
          <div className="absolute -right-4 -top-4 bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
            <FileText className="w-8 h-8 text-blue-400 mr-2 mt-2" />
          </div>
          <CardContent className="p-6 relative z-10">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Content</p>
            {loading ? <Skeleton className="h-10 w-24 rounded-lg" /> : (
              <div className="flex flex-col gap-1">
                <div className="text-4xl font-bold text-slate-900 font-lexend">{stats.totalContent}</div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-600"><ArrowUpRight className="w-3 h-3"/></span>
                  <span className="text-sm font-medium text-slate-600"><span className="text-emerald-600 font-semibold">4%</span> vs last month</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submissions */}
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/80 backdrop-blur-xl overflow-hidden relative group rounded-3xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
          <div className="absolute -right-4 -top-4 bg-purple-50 w-24 h-24 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
            <BarChart2 className="w-8 h-8 text-purple-400 mr-2 mt-2" />
          </div>
          <CardContent className="p-6 relative z-10">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Submissions</p>
            {loading ? <Skeleton className="h-10 w-24 rounded-lg" /> : (
              <div className="flex flex-col gap-1">
                <div className="text-4xl font-bold text-slate-900 font-lexend">1,248</div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-600"><ArrowUpRight className="w-3 h-3"/></span>
                  <span className="text-sm font-medium text-slate-600"><span className="text-emerald-600 font-semibold">24%</span> vs last month</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card className="border-none shadow-[0_12px_40px_rgb(16,185,129,0.15)] bg-gradient-to-br from-emerald-500 to-teal-600 text-white overflow-hidden relative group rounded-3xl hover:shadow-[0_12px_40px_rgb(16,185,129,0.25)] transition-all duration-300">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="absolute -right-6 -top-6 bg-white/10 w-32 h-32 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-700 blur-[2px]">
             <TrendingUp className="w-12 h-12 text-white/50 mr-4 mt-4" />
          </div>
          <CardContent className="p-6 relative z-10 h-full flex flex-col justify-between">
            <p className="text-sm font-semibold text-emerald-50 uppercase tracking-wider mb-2">Revenue (Monthly)</p>
            <div className="flex flex-col gap-1">
              <div className="text-4xl font-bold font-lexend drop-shadow-sm">₹ 45,200</div>
              <div className="flex items-center gap-1.5 mt-2 text-emerald-100">
                <span className="text-sm font-medium">Record high this month</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Row (Bento Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Activity Chart component */}
        <ActivityChart data={activityData} />

        {/* Quick Actions (Bento Box) */}
        <div className="col-span-1 grid grid-cols-2 gap-4 h-full">
            <Link href="/admin/add-content" className="relative overflow-hidden group bg-white/80 backdrop-blur-md rounded-[24px] p-6 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgb(16,185,129,0.15)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-400/10 rounded-bl-[100px] transition-colors duration-300 group-hover:bg-emerald-500" />
                <PlusCircle className="w-8 h-8 text-slate-700 group-hover:text-emerald-50 relative z-10 transition-colors" />
                <div className="mt-6 relative z-10">
                  <h3 className="font-bold text-slate-900 text-lg">Add Quiz</h3>
                  <p className="text-xs text-slate-500 mt-1">Create new assessment</p>
                </div>
            </Link>

            <Link href="/admin/add-article" className="relative overflow-hidden group bg-white/80 backdrop-blur-md rounded-[24px] p-6 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgb(59,130,246,0.15)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/10 rounded-bl-[100px] transition-colors duration-300 group-hover:bg-blue-600" />
                <FilePlus className="w-8 h-8 text-slate-700 group-hover:text-blue-50 relative z-10 transition-colors" />
                <div className="mt-6 relative z-10">
                  <h3 className="font-bold text-slate-900 text-lg">Add Article</h3>
                  <p className="text-xs text-slate-500 mt-1">Publish new reading</p>
                </div>
            </Link>

            <Link href="/admin/users" className="relative overflow-hidden group bg-white/80 backdrop-blur-md rounded-[24px] p-6 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgb(99,102,241,0.15)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/10 rounded-bl-[100px] transition-colors duration-300 group-hover:bg-indigo-600" />
                <Users className="w-8 h-8 text-slate-700 group-hover:text-indigo-50 relative z-10 transition-colors" />
                <div className="mt-6 relative z-10">
                  <h3 className="font-bold text-slate-900 text-lg">Users</h3>
                  <p className="text-xs text-slate-500 mt-1">Manage accounts</p>
                </div>
            </Link>

            <Link href="/admin/settings" className="relative overflow-hidden group bg-white/80 backdrop-blur-md rounded-[24px] p-6 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgb(100,116,139,0.15)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                <div className="absolute right-0 top-0 w-24 h-24 bg-slate-500/10 rounded-bl-[100px] transition-colors duration-300 group-hover:bg-slate-600" />
                <Settings className="w-8 h-8 text-slate-700 group-hover:text-slate-50 relative z-10 transition-colors" />
                <div className="mt-6 relative z-10">
                  <h3 className="font-bold text-slate-900 text-lg">Settings</h3>
                  <p className="text-xs text-slate-500 mt-1">System config</p>
                </div>
            </Link>


        </div>
      </div>

      {/* Submissions Table Component */}
      <SubmissionsTable 
        loading={loading}
        submissions={recentSubmissions}
        selectedSubmissions={selectedSubmissions}
        onSelectSubmission={handleSelectSubmission}
        onDeleteSubmissions={handleDelete}
        currentPage={submissionsCurrentPage}
        hasMore={hasMoreSubmissions}
        onNextPage={handleNextPage}
        onPrevPage={handlePrevPage}
      />

    </div>
  );
}
