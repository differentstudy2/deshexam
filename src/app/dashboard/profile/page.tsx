
'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { getUserProfile, updateUserProfile, uploadFile } from '@/lib/firebase/firestore';
import { updateProfile as updateAuthProfile } from 'firebase/auth';
import { Upload, Loader2 } from 'lucide-react';
import { useState } from 'react';

const profileSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters."),
  email: z.string().email(),
  photoURL: z.string().url().optional().or(z.literal('')),
  school: z.string().optional(),
  classGrade: z.string().optional(),
  targetExam: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: '',
      email: '',
      photoURL: '',
      school: '',
      classGrade: '',
      targetExam: '',
    },
  });

  useEffect(() => {
    if (user) {
      // Set default values from auth
      form.reset({
        displayName: user.displayName || '',
        email: user.email || '',
        photoURL: user.photoURL || '',
      });

      // Fetch and set extended profile data from Firestore
      const fetchProfile = async () => {
        const userProfile = await getUserProfile(user.uid);
        if (userProfile) {
          form.reset({
            ...form.getValues(),
            school: userProfile.school || '',
            classGrade: userProfile.classGrade || '',
            targetExam: userProfile.targetExam || '',
          });
        }
      };
      fetchProfile();
    }
  }, [user, form]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setIsUploading(true);
        try {
            const downloadURL = await uploadFile(file);
            form.setValue('photoURL', downloadURL, { shouldDirty: true });
             toast({
                title: 'Image Uploaded',
                description: 'Your new profile picture is ready. Click "Save Changes" to apply it.',
            });
        } catch (error) {
           toast({
            variant: "destructive",
            title: 'Upload Failed',
            description: (error as Error).message,
           });
        } finally {
            setIsUploading(false);
        }
    }
  };

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    if (!user) return;

    try {
      // Update Firestore user profile
      await updateUserProfile(user.uid, {
        displayName: data.displayName,
        photoURL: data.photoURL,
        school: data.school,
        classGrade: data.classGrade,
        targetExam: data.targetExam,
        email: user.email, // Keep email consistent
      });

      // Update Firebase Auth profile
      if (user.displayName !== data.displayName || user.photoURL !== data.photoURL) {
          await updateAuthProfile(user, {
            displayName: data.displayName,
            photoURL: data.photoURL,
          });
      }

      toast({
        title: "Profile Updated",
        description: "Your information has been successfully saved.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: (error as Error).message,
      });
    }
  };

  return (
    <div>
      <h1 className="font-headline text-3xl font-bold">Profile</h1>
      <p className="text-muted-foreground mb-6">
        Manage your account settings and personal information.
      </p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your photo and personal details here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={form.watch('photoURL') || `https://picsum.photos/seed/${user?.uid}/96/96`} />
                  <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <Button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                    {isUploading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Uploading...</>
                    ) : (
                        <><Upload className="mr-2 h-4 w-4"/> Upload New Photo</>
                    )}
                  </Button>
                  <Input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/png, image/jpeg, image/gif"
                    onChange={handleFileChange}
                  />
                  <p className="text-xs text-muted-foreground mt-2">Recommended size: 200x200px. PNG, JPG, GIF accepted.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} disabled />
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
                      <FormField
                          control={form.control}
                          name="school"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current School/College</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Delhi Public School" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                       <FormField
                          control={form.control}
                          name="classGrade"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Class/Grade</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 12th Grade" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                   </div>
                   <FormField
                      control={form.control}
                      name="targetExam"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Exam</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., NEET, JEE, UPSC" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
              </CardContent>
          </Card>

          <Button type="submit" disabled={form.formState.isSubmitting || isUploading}>
            {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
