
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users, FileText, BarChart2, Activity, PlusCircle, FilePlus } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAllUsers, getAllContent, getTodaysSubmissions } from '@/lib/firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalContent: 0,
    submissionsToday: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, content, submissions] = await Promise.all([
          getAllUsers(),
          getAllContent(),
          getTodaysSubmissions(),
        ]);
        setStats({
          totalUsers: users.length,
          totalContent: content.length,
          submissionsToday: submissions.length,
        });
      } catch (error) {
        console.error("Failed to fetch admin dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const adminStats = [
    { title: "Total Users", value: stats.totalUsers, icon: <Users/>, description: "Total registered users" },
    { title: "Total Content", value: stats.totalContent, icon: <FileText/>, description: "Tests, quizzes, and articles" },
    { title: "Submissions Today", value: stats.submissionsToday, icon: <BarChart2/>, description: "Test submissions today" },
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
                    <CardTitle>Recent Site Activity</CardTitle>
                     <CardDescription>A log of recent important events.</CardDescription>
                </CardHeader>
                <CardContent>
                   <p className="text-muted-foreground">Activity feed coming soon...</p>
                </CardContent>
            </Card>
       </div>
    </div>
  );
}
