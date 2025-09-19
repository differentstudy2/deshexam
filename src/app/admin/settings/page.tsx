
'use client';

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
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettingsPage() {
  const { toast } = useToast();

  const handleSave = () => {
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

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>
            Basic information about your site.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site-name">Site Name</Label>
            <Input id="site-name" defaultValue="DeshExam" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="site-description">Site Description</Label>
            <Input id="site-description" defaultValue="Your ultimate destination for mock tests, quizzes, and personalized learning paths." />
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleSave}><Save className="mr-2"/>Save Changes</Button>
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
          <div className="space-y-2">
            <Label htmlFor="razorpay-key-id">Razorpay Key ID</Label>
            <Input id="razorpay-key-id" type="password" placeholder="••••••••••••••••••••" />
          </div>
           <div className="space-y-2">
            <Label htmlFor="razorpay-key-secret">Razorpay Key Secret</Label>
            <Input id="razorpay-key-secret" type="password" placeholder="••••••••••••••••••••" />
          </div>
        </CardContent>
         <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleSave}><Save className="mr-2"/>Save API Keys</Button>
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
           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                  <Label htmlFor="allow-registrations">Allow New User Registrations</Label>
                  <p className="text-sm text-muted-foreground">
                      Toggle whether new users can sign up for an account.
                  </p>
              </div>
              <Switch id="allow-registrations" defaultChecked />
          </div>
        </CardContent>
         <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleSave}><Save className="mr-2"/>Save Settings</Button>
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
           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                  <Label htmlFor="enable-matching">Enable Matching Questions</Label>
                  <p className="text-sm text-muted-foreground">
                      Allow creation of 'Matching' type questions in the content editor.
                  </p>
              </div>
              <Switch id="enable-matching" defaultChecked />
          </div>
        </CardContent>
         <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleSave}><Save className="mr-2"/>Save Settings</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
