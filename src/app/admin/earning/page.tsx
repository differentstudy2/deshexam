
'use client';

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
import { DollarSign, BarChart, Users, ShoppingCart, Download } from 'lucide-react';

const earningStats = [
    { title: "Total Revenue", value: "₹45,231.89", description: "+20.1% from last month", icon: <DollarSign/> },
    { title: "Subscriptions", value: "+2350", description: "+180.1% from last month", icon: <Users/> },
    { title: "Sales Today", value: "+12,234", description: "+19% from last month", icon: <ShoppingCart/> },
    { title: "Monthly Earnings", value: "₹15,340.50", description: "Your earnings this month", icon: <BarChart/> },
];

const recentSales = [
    { orderId: "ORD001", plan: "Yearly Pass Pro", amount: "₹649.00", date: "2024-05-23", status: "Success" },
    { orderId: "ORD002", plan: "Monthly Pass", amount: "₹299.00", date: "2024-05-23", status: "Success" },
    { orderId: "ORD003", plan: "Yearly Pass", amount: "₹349.00", date: "2024-05-22", status: "Failed" },
    { orderId: "ORD004", plan: "18 Months Pass Pro", amount: "₹799.00", date: "2024-05-22", status: "Success" },
    { orderId: "ORD005", plan: "Monthly Pass Pro", amount: "₹599.00", date: "2024-05-21", status: "Success" },
];

export default function EarningPage() {
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
        {earningStats.map((stat) => (
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

      <Card>
        <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>A list of the most recent sales.</CardDescription>
        </CardHeader>
        <CardContent>
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
                            <TableCell>{sale.plan}</TableCell>
                            <TableCell className="font-medium">{sale.amount}</TableCell>
                            <TableCell>{sale.date}</TableCell>
                            <TableCell className="text-right">
                                <Badge variant={sale.status === 'Success' ? 'default' : 'destructive'}>
                                    {sale.status}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
