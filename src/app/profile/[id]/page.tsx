

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUserProfile, getContentByAuthor, getSubmissionsByUserId, toggleFollowUser } from '@/lib/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Book, FileText, GraduationCap, Target, School, Calendar, ArrowLeft, Eye, UserPlus, MessageSquare, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/use-auth';

type UserProfile = {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  school?: string;
  classGrade?: string;
  targetExam?: string;
  createdAt: any;
  followers: string[];
  following: string[];
  followersCount: number;
  followingCount: number;
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
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const { user: currentUser } = useAuth();
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
          const fetchedProfile = { ...profileData, uid: userId } as UserProfile;
          setProfile(fetchedProfile);
          if (currentUser) {
            setIsFollowing(fetchedProfile.followers?.includes(currentUser.uid));
          }
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
  }, [userId, toast, currentUser]);
  
  const handleFollowToggle = async () => {
    if (!currentUser || !profile) {
      toast({ variant: 'destructive', title: 'Please log in to follow users.' });
      return;
    }
    setIsFollowLoading(true);
    try {
      await toggleFollowUser(profile.uid);
      setIsFollowing(!isFollowing);
       // Optimistically update counts
      setProfile(prevProfile => {
        if (!prevProfile) return null;
        const newFollowersCount = isFollowing 
            ? (prevProfile.followersCount || 1) - 1 
            : (prevProfile.followersCount || 0) + 1;
        return { ...prevProfile, followersCount: newFollowersCount };
      });

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: (error as Error).message,
      });
    } finally {
      setIsFollowLoading(false);
    }
  };


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
          <div className="flex flex-col md:flex-row items-start gap-6">
            <Avatar className="w-24 h-24 border-4">
              <AvatarImage src={profile.photoURL || `https://picsum.photos/seed/${userId}/100/100`} />
              <AvatarFallback>{profile.displayName?.[0]}</AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left flex-grow">
              <CardTitle className="text-3xl font-bold">{profile.displayName}</CardTitle>
              <CardDescription className="text-muted-foreground">{profile.email}</CardDescription>
               <div className="flex justify-center md:justify-start gap-4 mt-2">
                  <div className="text-center">
                    <p className="font-bold">{profile.followersCount || 0}</p>
                    <p className="text-xs text-muted-foreground">Followers</p>
                  </div>
                   <div className="text-center">
                    <p className="font-bold">{profile.followingCount || 0}</p>
                    <p className="text-xs text-muted-foreground">Following</p>
                  </div>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground mt-2 justify-center md:justify-start">
                {profile.school && <div className="flex items-center gap-1.5"><School />{profile.school}</div>}
                {profile.classGrade && <div className="flex items-center gap-1.5"><GraduationCap />{profile.classGrade}</div>}
                {profile.targetExam && <div className="flex items-center gap-1.5"><Target />{profile.targetExam}</div>}
                {profile.createdAt && <div className="flex items-center gap-1.5"><Calendar />Joined on {new Date(profile.createdAt.seconds * 1000).toLocaleDateString()}</div>}
              </div>
            </div>
             {currentUser && currentUser.uid !== profile.uid && (
                <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full sm:w-auto">
                    <Button onClick={handleFollowToggle} disabled={isFollowLoading} className="w-full">
                        {isFollowLoading ? <Loader2 className="animate-spin" /> : 
                            isFollowing ? <><UserCheck className="mr-2"/> Following</> : <><UserPlus className="mr-2"/> Follow</>
                        }
                    </Button>
                    <Button variant="outline" className="w-full">
                        <MessageSquare className="mr-2"/> Message
                    </Button>
                </div>
            )}
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

