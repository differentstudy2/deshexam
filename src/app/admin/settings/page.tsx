
'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { getSettings, updateSettings } from '@/lib/firebase/firestore';

const settingsSchema = z.object({
    siteName: z.string().min(1, "Site name is required."),
    siteDescription: z.string().optional(),
    razorpayKeyId: z.string().optional(),
    razorpayKeySecret: z.string().optional(),
    allowRegistrations: z.boolean(),
    enableMatching: z.boolean(),
    enableMultipleChoice: z.boolean(),
    enableTrueFalse: z.boolean(),
    enableShortAnswer: z.boolean(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
        siteName: "DeshExam",
        siteDescription: "Your ultimate destination for mock tests, quizzes, and personalized learning paths.",
        razorpayKeyId: "",
        razorpayKeySecret: "",
        allowRegistrations: true,
        enableMatching: true,
        enableMultipleChoice: true,
        enableTrueFalse: true,
        enableShortAnswer: true,
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
        try {
            setLoading(true);
            const settings = await getSettings();
            if (settings) {
                form.reset(settings);
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Failed to load settings',
                description: (error as Error).message,
            });
        } finally {
            setLoading(false);
        }
    };
    fetchSettings();
  }, [form, toast]);


  const handleSave: SubmitHandler<SettingsFormValues> = async (data) => {
    try {
        await updateSettings(data);
        toast({
            title: 'Settings Saved!',
            description: 'Your changes have been successfully saved to the database.',
        });
    } catch (error) {
         toast({
            variant: "destructive",
            title: 'Error Saving Settings',
            description: (error as Error).message,
        });
    }
  };
  
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading Settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Site Settings</h1>
        <p className="text-muted-foreground">
          Manage your application's global settings.
        </p>
      </div>

    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>
              Basic information about your site.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="siteName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="siteDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site Description</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                   <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>
              Manage API keys for third-party services. These are stored securely on the server.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <FormField
              control={form.control}
              name="razorpayKeyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razorpay Key ID</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••••••••••••••" {...field} />
                  </FormControl>
                   <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="razorpayKeySecret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razorpay Key Secret</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••••••••••••••" {...field} />
                  </FormControl>
                   <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Control how users interact with your site.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="allowRegistrations"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Allow New User Registrations
                    </FormLabel>
                    <FormDescription>
                      Toggle whether new users can sign up for an account.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Settings</CardTitle>
            <CardDescription>
              Control features related to content creation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
                control={form.control}
                name="enableMultipleChoice"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Multiple Choice Questions</FormLabel>
                        <FormDescription>
                            Allow creation of 'Multiple Choice' type questions.
                        </FormDescription>
                    </div>
                    <FormControl>
                        <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                    </FormControl>
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="enableTrueFalse"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable True/False Questions</FormLabel>
                        <FormDescription>
                            Allow creation of 'True/False' type questions.
                        </FormDescription>
                    </div>
                    <FormControl>
                        <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                    </FormControl>
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="enableShortAnswer"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Short Answer Questions</FormLabel>
                        <FormDescription>
                           Allow creation of 'Short Answer' and 'Fill in the Blank' questions.
                        </FormDescription>
                    </div>
                    <FormControl>
                        <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                    </FormControl>
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="enableMatching"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Matching Questions</FormLabel>
                        <FormDescription>
                            Allow creation of 'Matching' type questions in the content editor.
                        </FormDescription>
                    </div>
                    <FormControl>
                        <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                    </FormControl>
                    </FormItem>
                )}
            />
          </CardContent>
        </Card>
        
        <Button type="submit" disabled={form.formState.isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {form.formState.isSubmitting ? "Saving..." : "Save All Settings"}
        </Button>
      </form>
    </Form>
    </div>
  );
}
