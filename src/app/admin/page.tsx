
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users, FileText, BarChart2, Activity } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  
  const adminStats = [
    { title: "Total Users", value: "1,254", icon: <Users/>, description: "+12 since last week" },
    { title: "Total Content", value: "342", icon: <FileText/>, description: "+5 new items" },
    { title: "Submissions Today", value: "8,432", icon: <BarChart2/>, description: "2% increase" },
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {adminStats.map((stat) => (
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
        }
      </div>

       <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Perform common administrative tasks.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                    <Link href="/admin/users" className="p-4 border rounded-lg hover:bg-secondary w-full md:w-auto text-center">
                        <Users className="mx-auto mb-2" />
                        <span>Manage Users</span>
                    </Link>
                     <Link href="/admin/content" className="p-4 border rounded-lg hover:bg-secondary w-full md:w-auto text-center">
                        <FileText className="mx-auto mb-2" />
                        <span>Manage Content</span>
                    </Link>
                    <Link href="/dashboard/add-content" className="p-4 border rounded-lg hover:bg-secondary w-full md:w-auto text-center">
                        <FileText className="mx-auto mb-2" />
                        <span>Add New Content</span>
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
