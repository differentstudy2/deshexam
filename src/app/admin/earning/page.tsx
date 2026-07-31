
'use client';

import { useEffect, useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, BarChart, Users, ShoppingCart, Download, Loader2 } from 'lucide-react';
import { getRecentOrders, getEarningStats, EarningStats, Order } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function EarningPage() {
    const [stats, setStats] = useState<EarningStats | null>(null);
    const [recentSales, setRecentSales] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [statsData, salesData] = await Promise.all([
                    getEarningStats(),
                    getRecentOrders(5)
                ]);
                setStats(statsData);
                setRecentSales(salesData);
            } catch (error) {
                toast({
                    variant: 'destructive',
                    title: 'Error Fetching Earning Data',
                    description: (error as Error).message,
                });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [toast]);

    const statCards = [
        { title: "Total Revenue", value: `₹${stats?.totalRevenue.toFixed(2) ?? '0.00'}`, description: ``, icon: <DollarSign/> },
        { title: "Subscriptions", value: `${stats?.totalUsers ?? 0}`, description: "Total registered users", icon: <Users/> },
        { title: "Sales Today", value: `₹${stats?.revenueToday.toFixed(2) ?? '0.00'}`, description: `from ${stats?.salesTodayCount ?? 0} sales`, icon: <ShoppingCart/> },
        { title: "Monthly Earnings", value: `₹${stats?.revenueThisMonth.toFixed(2) ?? '0.00'}`, description: "Your earnings this month", icon: <BarChart/> },
    ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
            <h1 className="font-headline text-3xl font-bold">Earning Overview</h1>
            <p className="text-muted-foreground">
                Track your revenue, sales, and subscription metrics.
            </p>
        </div>
        <Button>
            <Download className="mr-2 h-4 w-4" />
            Download Report
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
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
                        <Skeleton className="h-4 w-3/4" />
                    </>
                ) : (
                    <>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground">{stat.description}</p>
                    </>
                )}
              </CardContent>
            </Card>
          ))
        }
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>A list of the most recent sales.</CardDescription>
        </CardHeader>
        <CardContent>
             {loading ? (
                 <div className="flex items-center justify-center min-h-[200px]">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                 </div>
           ) : (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recentSales.map((sale) => (
                        <TableRow key={sale.orderId}>
                            <TableCell className="font-mono">{sale.orderId}</TableCell>
                            <TableCell>{sale.planName}</TableCell>
                            <TableCell className="font-medium">₹{sale.amount.toFixed(2)}</TableCell>
                            <TableCell>{sale.createdAt}</TableCell>
                            <TableCell className="text-right">
                                <Badge variant={sale.status === 'Success' ? 'default' : 'destructive'}>
                                    {sale.status}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                     {recentSales.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24">No recent transactions found.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
