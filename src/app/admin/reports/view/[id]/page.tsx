
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getContactMessageById } from '@/lib/firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, ArrowLeft, Mail, User, Calendar, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

type Message = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
};

export default function ViewReportPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const messageId = params.id as string;
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!messageId) {
      toast({ variant: 'destructive', title: 'Invalid Message ID' });
      router.push('/admin/reports');
      return;
    }

    const fetchMessage = async () => {
      try {
        setLoading(true);
        const fetchedMessage = await getContactMessageById(messageId);
        if (fetchedMessage) {
          setMessage(fetchedMessage as Message);
        } else {
          toast({ variant: 'destructive', title: 'Message not found' });
          router.push('/admin/reports');
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error fetching message',
          description: (error as Error).message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMessage();
  }, [messageId, toast, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading Message...</p>
      </div>
    );
  }

  if (!message) {
    return null; // Should be redirected by the effect
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button asChild variant="outline">
          <Link href="/admin/reports">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Messages
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
             <Avatar className="w-12 h-12">
                <AvatarImage src={`https://picsum.photos/seed/${message.email}/48/48`} />
                <AvatarFallback>{message.name?.[0]}</AvatarFallback>
            </Avatar>
            <div>
                 <p className="text-2xl font-bold">{message.subject}</p>
                 <CardDescription>Full message details from user</CardDescription>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="w-4 h-4"/>
                    <strong>From:</strong> <span className="text-foreground">{message.name}</span>
                </div>
                 <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4"/>
                    <strong>Email:</strong> <a href={`mailto:${message.email}`} className="text-primary hover:underline">{message.email}</a>
                </div>
                 <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4"/>
                    <strong>Received:</strong> <span className="text-foreground">{message.createdAt}</span>
                </div>
            </div>
            
            <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Message
                </h4>
                <div className="p-4 bg-secondary rounded-lg whitespace-pre-wrap">
                    <p>{message.message}</p>
                </div>
            </div>
            <div className="flex justify-end">
                <Button asChild variant="default">
                    <a href={`mailto:${message.email}?subject=Re: ${message.subject}`}>
                        Reply via Email
                    </a>
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
