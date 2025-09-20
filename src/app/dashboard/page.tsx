

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis } from 'recharts';
import { getSubmissionsByUserId, getContentById } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/button';
import { Eye, PlusCircle, FileText, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import { ChartConfig } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';

type Submission = {
  id: string;
  testId: string;
  testTitle: string;
  score: number;
  totalQuestions: number;
  submittedAt: any; 
  testType: string;
  test?: any;
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

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (user) {
        setLoading(true);
        const userSubmissions = await getSubmissionsByUserId(user.uid);
        
        const submissionsWithTestData = await Promise.all(
            userSubmissions.map(async (sub) => {
                const test = await getContentById(sub.testId);
                return { ...sub, test };
            })
        );
        setSubmissions(submissionsWithTestData);
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [user]);

  const getUrlForTest = (testType: string, testId: string, submissionId: string) => {
      const typeSlug = (testType || 'content').toLowerCase().replace(/\s+/g, '-');
      return `/${typeSlug}/${testId}/results?submissionId=${submissionId}`;
  }

  const averageScore = submissions.length > 0 
    ? Math.round(submissions.reduce((acc, sub) => acc + (sub.score / sub.totalQuestions) * 100, 0) / submissions.length)
    : 0;

  const chartData = submissions.slice(0, 6).reverse().map((sub, index) => ({
      name: `Test #${submissions.length - index}`,
      score: Math.round((sub.score / sub.totalQuestions) * 100),
  }));
  
  const dashboardStats = [
    { title: "Tests Taken", value: submissions.length, icon: <FileText/>, description: "Total tests completed" },
    { title: "Average Score", value: `${averageScore}%`, icon: <BarChart2/>, description: "Your average across all tests" },
  ];

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
                       <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto"/></TableCell>
                    </TableRow>
                  ))
                ) : submissions.length > 0 ? (
                  submissions.slice(0, 5).map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div className="font-medium">{sub.test?.title || sub.testTitle}</div>
                      <div className="text-sm text-muted-foreground">
                        {sub.test?.subject} - {sub.testType}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={getUrlForTest(sub.testType, sub.testId, sub.id)}>
                           <Eye className="mr-2 h-4 w-4" /> View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">You haven't taken any tests yet.</TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
