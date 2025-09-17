
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUserProfile, getContentByAuthor, getSubmissionsByUserId } from '@/lib/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Book, FileText, GraduationCap, Target, School, Calendar, ArrowLeft, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

type UserProfile = {
  displayName: string;
  email: string;
  photoURL?: string;
  school?: string;
  classGrade?: string;
  targetExam?: string;
  createdAt: any;
};

type Content = {
  id: string;
  title: string;
  subject: string;
  testType: string;
};

type Submission = {
  id: string;
  testId: string;
  testTitle: string;
  score: number;
  totalQuestions: number;
  submittedAt: any;
  testType: string;
};

export default function UserProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [createdContent, setCreatedContent] = useState<Content[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  useEffect(() => {
    if (!userId) return;

    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const [profileData, contentData, submissionsData] = await Promise.all([
          getUserProfile(userId),
          getContentByAuthor(userId),
          getSubmissionsByUserId(userId),
        ]);

        if (profileData) {
          setProfile(profileData as UserProfile);
        } else {
          toast({ variant: 'destructive', title: 'Profile not found' });
        }
        setCreatedContent(contentData as Content[]);
        setSubmissions(submissionsData as Submission[]);

      } catch (error) {
        toast({
          variant: "destructive",
          title: 'Error fetching profile data',
          description: (error as Error).message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, toast]);
  
  const getUrlForContent = (testType: string, testId: string) => {
    const typeSlug = (testType || 'content').toLowerCase().replace(/\s+/g, '-');
    return `/${typeSlug}/${testId}`;
  }
  
  const getUrlForResults = (testType: string, testId: string, submissionId: string) => {
    const typeSlug = (testType || 'content').toLowerCase().replace(/\s+/g, '-');
    return `/${typeSlug}/${testId}/results?submissionId=${submissionId}`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading Profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center min-h-[calc(100vh-200px)] flex flex-col justify-center">
        <h2 className="text-2xl font-bold">Profile not found</h2>
        <p className="text-muted-foreground">The profile you are looking for does not exist.</p>
        <Button asChild className="mt-4 mx-auto" variant="outline" onClick={() => router.back()}>
          <Link href="#">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-24 h-24 border-4">
              <AvatarImage src={profile.photoURL || `https://picsum.photos/seed/${userId}/100/100`} />
              <AvatarFallback>{profile.displayName?.[0]}</AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left">
              <CardTitle className="text-3xl font-bold">{profile.displayName}</CardTitle>
              <CardDescription className="text-muted-foreground">{profile.email}</CardDescription>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground mt-2">
                {profile.school && <div className="flex items-center gap-1.5"><School />{profile.school}</div>}
                {profile.classGrade && <div className="flex items-center gap-1.5"><GraduationCap />{profile.classGrade}</div>}
                {profile.targetExam && <div className="flex items-center gap-1.5"><Target />{profile.targetExam}</div>}
                {profile.createdAt && <div className="flex items-center gap-1.5"><Calendar />Joined on {new Date(profile.createdAt.seconds * 1000).toLocaleDateString()}</div>}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="activity">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              <TabsTrigger value="content">Created Content ({createdContent.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="activity">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Title</TableHead>
                    <TableHead className="hidden md:table-cell">Score</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.length > 0 ? submissions.map(sub => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{sub.testTitle}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                            <span>{Math.round((sub.score / sub.totalQuestions) * 100)}%</span>
                            <Progress value={Math.round((sub.score / sub.totalQuestions) * 100)} className="w-20 h-2"/>
                        </div>
                      </TableCell>
                       <TableCell className="hidden md:table-cell">{sub.submittedAt.toLocaleDateString()}</TableCell>
                       <TableCell className="text-right">
                         <Button asChild variant="outline" size="sm">
                            <Link href={getUrlForResults(sub.testType, sub.testId, sub.id)}>
                                <Eye className="mr-2"/> View
                            </Link>
                         </Button>
                       </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow><TableCell colSpan={4} className="h-24 text-center">No activity yet.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="content">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">Type</TableHead>
                    <TableHead className="hidden md:table-cell">Subject</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {createdContent.length > 0 ? createdContent.map(content => (
                    <TableRow key={content.id}>
                      <TableCell className="font-medium">{content.title}</TableCell>
                      <TableCell className="hidden md:table-cell">{content.testType}</TableCell>
                      <TableCell className="hidden md:table-cell">{content.subject}</TableCell>
                      <TableCell className="text-right">
                         <Button asChild variant="outline" size="sm">
                            <Link href={getUrlForContent(content.testType, content.id)}>
                               <Eye className="mr-2"/> View
                            </Link>
                         </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                     <TableRow><TableCell colSpan={4} className="h-24 text-center">No content created yet.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
       <div className="mt-8 flex justify-start">
            <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4"/> Go Back
            </Button>
        </div>
    </div>
  );
}
