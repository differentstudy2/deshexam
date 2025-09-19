
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

const settingsSchema = z.object({
    siteName: z.string().min(1, "Site name is required."),
    siteDescription: z.string().optional(),
    razorpayKeyId: z.string().optional(),
    razorpayKeySecret: z.string().optional(),
    allowRegistrations: z.boolean(),
    enableMatching: z.boolean(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function AdminSettingsPage() {
  const { toast } = useToast();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
        siteName: "DeshExam",
        siteDescription: "Your ultimate destination for mock tests, quizzes, and personalized learning paths.",
        razorpayKeyId: "",
        razorpayKeySecret: "",
        allowRegistrations: true,
        enableMatching: true,
    },
  });

  // In a real app, you would fetch these values from a database.
  useEffect(() => {
    // Here you would fetch settings from Firestore and reset the form
    // For example:
    // const settings = await getSettings();
    // form.reset(settings);
  }, [form]);


  const handleSave: SubmitHandler<SettingsFormValues> = (data) => {
    // In a real app, you'd save `data` to your database here.
    console.log("Saving settings:", data);
    toast({
      title: 'Settings Saved!',
      description: 'Your changes have been successfully saved.',
    });
  };

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
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit"><Save className="mr-2"/>Save Changes</Button>
          </CardFooter>
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
                </FormItem>
              )}
            />
          </CardContent>
           <CardFooter className="border-t px-6 py-4">
            <Button type="submit"><Save className="mr-2"/>Save API Keys</Button>
          </CardFooter>
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
           <CardFooter className="border-t px-6 py-4">
            <Button type="submit"><Save className="mr-2"/>Save Settings</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Settings</CardTitle>
            <CardDescription>
              Control features related to content creation.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
           <CardFooter className="border-t px-6 py-4">
            <Button type="submit"><Save className="mr-2"/>Save Settings</Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
    </div>
  );
}
