

'use client';

import { useEffect, useRef, useState } from 'react';
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
import { getUserProfile, updateUserProfile, uploadFile, getBoards, getClasses, getGradesByClass, getSchools, addSchool } from '@/lib/firebase/firestore';
import { updateProfile as updateAuthProfile } from 'firebase/auth';
import { Upload, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Board = { id: string, name: string };
type ClassCategory = { id: string, name: string };
type Grade = { id: string, name: string };
type School = { id: string, name: string };

const profileSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters."),
  email: z.string().email(),
  photoURL: z.string().url().optional().or(z.literal('')),
  school: z.string().optional(),
  newSchool: z.string().optional(),
  classCategory: z.string().optional(),
  grade: z.string().optional(),
  targetExam: z.string().optional(),
  board: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);
  const [classCategories, setClassCategories] = useState<ClassCategory[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [isAddingNewSchool, setIsAddingNewSchool] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: '',
      email: '',
      photoURL: '',
      school: '',
      newSchool: '',
      classCategory: '',
      grade: '',
      targetExam: '',
      board: '',
    },
  });
  
  const selectedClassCategory = form.watch('classCategory');

  useEffect(() => {
    const fetchMetadata = async () => {
        try {
            const [boardsData, classesData, schoolsData] = await Promise.all([getBoards(), getClasses(), getSchools()]);
            setBoards(boardsData);
            setClassCategories(classesData);
            setSchools(schoolsData);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Failed to load academic options',
                description: 'Could not fetch boards, classes, or schools.',
            });
        }
    }
    fetchMetadata();
  }, [toast]);

  useEffect(() => {
    const fetchGrades = async () => {
        if(selectedClassCategory) {
            const fetchedGrades = await getGradesByClass(selectedClassCategory);
            setGrades(fetchedGrades);
        } else {
            setGrades([]);
        }
    };
    fetchGrades();
  }, [selectedClassCategory]);

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
            classCategory: userProfile.classCategory || '',
            grade: userProfile.grade || '',
            targetExam: userProfile.targetExam || '',
            board: userProfile.board || '',
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
        newSchool: data.newSchool,
        classCategory: data.classCategory,
        grade: data.grade,
        targetExam: data.targetExam,
        board: data.board,
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
      // Optionally refetch schools if a new one was added
      if (data.school === 'add_new_school' && data.newSchool) {
          const schoolsData = await getSchools();
          setSchools(schoolsData);
          form.setValue('school', data.newSchool);
          setIsAddingNewSchool(false);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: (error as Error).message,
      });
    }
  };
  
    const handleSchoolChange = (value: string) => {
      if (value === 'add_new_school') {
          setIsAddingNewSchool(true);
          form.setValue('school', 'add_new_school');
      } else {
          setIsAddingNewSchool(false);
          form.setValue('school', value);
      }
  }

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
              <div className="flex flex-col md:flex-row items-center text-center md:text-left md:items-start gap-6">
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
                          name="board"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Board</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select your board" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {boards.map(board => (
                                            <SelectItem key={board.id} value={board.name}>{board.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                            control={form.control}
                            name="school"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Current School/College</FormLabel>
                                    {!isAddingNewSchool ? (
                                        <Select onValueChange={handleSchoolChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select your school" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {schools.map((school) => (
                                                    <SelectItem key={school.id} value={school.name}>{school.name}</SelectItem>
                                                ))}
                                                <SelectItem value="add_new_school">Add new school...</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className='space-y-2'>
                                            <FormField
                                                control={form.control}
                                                name="newSchool"
                                                render={({ field: newSchoolField }) => (
                                                    <Input {...newSchoolField} placeholder="Enter your school name" />
                                                )}
                                            />
                                            <Button type="button" variant="secondary" size="sm" onClick={() => { setIsAddingNewSchool(false); form.setValue('school', ''); }}>Cancel</Button>
                                        </div>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <FormField
                          control={form.control}
                          name="classCategory"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Class Category</FormLabel>
                               <Select onValueChange={(value) => { field.onChange(value); form.setValue('grade', ''); }} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select your class category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {classCategories.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="grade"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Grade</FormLabel>
                               <Select onValueChange={field.onChange} value={field.value} disabled={!selectedClassCategory}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select your grade" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {grades.map(g => (
                                            <SelectItem key={g.id} value={g.name}>{g.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
