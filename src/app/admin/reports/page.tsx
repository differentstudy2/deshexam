
'use client';

import { useEffect, useState } from 'react';
import { getContactMessages } from '@/lib/firebase/firestore';
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
import { Loader2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type Message = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
};

export default function ReportsPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const fetchedMessages = await getContactMessages();
        setMessages(fetchedMessages as Message[]);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error fetching messages',
          description: (error as Error).message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [toast]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Reports & Contact</h1>
        <p className="text-muted-foreground">
          View messages submitted through the contact form.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact Form Submissions</CardTitle>
          <CardDescription>
            Here are the messages from your users.
          </CardDescription>
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
                  <TableHead>From</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="hidden md:table-cell">Received</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.length > 0 ? (
                  messages.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell>
                         <div className="flex items-center gap-3">
                           <Avatar className="w-9 h-9">
                            <AvatarImage src={`https://picsum.photos/seed/${message.email}/40/40`} />
                            <AvatarFallback>{message.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{message.name}</div>
                            <div className="text-sm text-muted-foreground break-all">{message.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                          <Badge variant="outline">{message.subject}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-xs">{message.createdAt}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/reports/view/${message.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No messages yet.
                    </TableCell>
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
