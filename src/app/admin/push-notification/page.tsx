
'use client';

import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Send, Users } from 'lucide-react';
import { sendPushNotification } from '@/ai/flows/send-push-notification';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

const notificationSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  body: z.string().min(5, "Message body must be at least 5 characters."),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

export default function PushNotificationPage() {
    const { toast } = useToast();
    const [subscriberCount, setSubscriberCount] = useState(0);

    useEffect(() => {
        const tokensCollection = collection(db, 'fcmTokens');
        const unsubscribe = onSnapshot(tokensCollection, (snapshot) => {
            setSubscriberCount(snapshot.size);
        }, (error) => {
            console.error("Error fetching subscriber count in real-time: ", error);
            toast({
                variant: 'destructive',
                title: 'Real-time Error',
                description: 'Could not connect for live subscriber updates.',
            });
        });

        // Cleanup the listener when the component unmounts
        return () => unsubscribe();
    }, [toast]);

    const form = useForm<NotificationFormValues>({
        resolver: zodResolver(notificationSchema),
        defaultValues: {
            title: '',
            body: '',
        },
    });

    const onSubmit: SubmitHandler<NotificationFormValues> = async (data) => {
        try {
            await sendPushNotification(data);
            toast({
                title: 'Notifications Sent!',
                description: 'Your message has been sent to all subscribed users.',
            });
            form.reset();
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error Sending Notifications',
                description: (error as Error).message,
            });
        }
    };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Push Notifications</h1>
        <p className="text-muted-foreground">
          Send a message to all users who have subscribed to notifications.
        </p>
      </div>

       <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Subscribers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriberCount}</div>
            <p className="text-xs text-muted-foreground">
              Total devices subscribed to receive notifications.
            </p>
          </CardContent>
        </Card>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Compose Message</CardTitle>
          <CardDescription>
            Enter a title and body for the notification. It will be sent immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notification Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., New Test Available!" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notification Body</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the new content or announcement..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  <Send className="mr-2 h-4 w-4" />
                  {form.formState.isSubmitting ? 'Sending...' : 'Send Notification'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
