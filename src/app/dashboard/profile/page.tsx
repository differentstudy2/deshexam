'use client';

import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="font-headline text-3xl font-bold">Profile</h1>
      <p className="text-muted-foreground mb-6">
        Manage your account settings and personal information.
      </p>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your photo and personal details here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.photoURL || `https://picsum.photos/seed/${user?.uid}/80/80`} />
                <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <Button variant="outline">Change Photo</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input id="displayName" defaultValue={user?.displayName || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={user?.email || ''} disabled />
              </div>
            </div>
            <Button>Update Profile</Button>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Academic Details</CardTitle>
                <CardDescription>
                    Tell us about your academic background to personalize your experience.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="school">Current School/College</Label>
                        <Input id="school" placeholder="e.g., Delhi Public School" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="class">Class/Grade</Label>
                        <Input id="class" placeholder="e.g., 12th Grade" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="targetExam">Target Exam</Label>
                    <Input id="targetExam" placeholder="e.g., NEET, JEE, UPSC" />
                 </div>
                 <Button>Update Academic Info</Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
