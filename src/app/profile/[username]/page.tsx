
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUserByUsername, getContentByAuthor, getSubmissionsByUserId, toggleFollowUser } from '@/lib/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, ArrowLeft, Eye, Users, Calendar, BadgeCheck, UserPlus, UserCheck, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/use-auth';

type UserProfile = {
  uid: string;
  displayName: string;
  username: string;
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
  location?: string;
};

type Content = {
  id: string;
  title: string;
  subject: string;
  testType: string;
};

type Submission = {
  id:string;
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
  const username = params.username as string;

  useEffect(() => {
    if (!username) return;

    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const profileData = await getUserByUsername(username);

        if (profileData) {
          const [contentData, submissionsData] = await Promise.all([
            getContentByAuthor(profileData.uid),
            getSubmissionsByUserId(profileData.uid),
          ]);
          
          setProfile(profileData as UserProfile);
          if (currentUser) {
            setIsFollowing(profileData.followers?.includes(currentUser.uid));
          }
          setCreatedContent(contentData as Content[]);
          setSubmissions(submissionsData as Submission[]);

        } else {
          toast({ variant: 'destructive', title: 'Profile not found' });
        }
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
  }, [username, toast, currentUser]);

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
    <div className="bg-secondary/50">
      <div className="container mx-auto p-4 md:p-8">
        
        {/* Profile Header */}
        <Card className="p-6 rounded-2xl shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-24 h-24 border-4 border-primary">
              <AvatarImage src={profile.photoURL || `https://picsum.photos/seed/${profile.uid}/96/96`} />
              <AvatarFallback>{profile.displayName?.[0]}</AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left flex-grow">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-3xl font-bold font-headline">{profile.displayName}</h1>
                <BadgeCheck className="text-primary w-6 h-6" />
              </div>
              <p className="text-muted-foreground">@{profile.username}</p>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-2 justify-center md:justify-start">
                  <Calendar size={16}/>
                  <span>Joined on {new Date(profile.createdAt?.seconds * 1000).toLocaleDateString()}</span>
              </div>
            </div>
             {currentUser && currentUser.uid !== profile.uid && (
                <div className="flex gap-2 w-full sm:w-auto">
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
          
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <Card className="p-4">
              <p className="text-2xl font-bold">{submissions.length}</p>
              <p className="text-sm text-muted-foreground">Quizzes Taken</p>
            </Card>
            <Card className="p-4">
              <p className="text-2xl font-bold">{createdContent.length}</p>
              <p className="text-sm text-muted-foreground">Quizzes Created</p>
            </Card>
            <Card className="p-4">
              <p className="text-2xl font-bold">{profile.followersCount || 0}</p>
              <p className="text-sm text-muted-foreground">Followers</p>
            </Card>
            <Card className="p-4">
              <p className="text-2xl font-bold">{profile.followingCount || 0}</p>
              <p className="text-sm text-muted-foreground">Following</p>
            </Card>
          </div>
        </Card>

        {/* Main Content */}
        <div className="mt-8">
           <Tabs defaultValue="activity" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="quizzes_taken">Quizzes Taken</TabsTrigger>
              <TabsTrigger value="created_quizzes">Created Quizzes</TabsTrigger>
              <TabsTrigger value="followers">Followers</TabsTrigger>
              <TabsTrigger value="following">Following</TabsTrigger>
            </TabsList>
            <TabsContent value="activity">
              <Card>
                <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
                <CardContent className="text-center text-muted-foreground py-16">
                  <p>Activity feed coming soon!</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="quizzes_taken">
              <Card>
                 <CardHeader><CardTitle>Quizzes Taken ({submissions.length})</CardTitle></CardHeader>
                 <CardContent>
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
                          <TableRow><TableCell colSpan={4} className="h-24 text-center">No tests taken yet.</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                 </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="created_quizzes">
              <Card>
                 <CardHeader><CardTitle>Created Quizzes ({createdContent.length})</CardTitle></CardHeader>
                 <CardContent>
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
                 </CardContent>
              </Card>
            </TabsContent>
             <TabsContent value="followers">
              <Card>
                <CardHeader><CardTitle>Followers ({profile.followersCount || 0})</CardTitle></CardHeader>
                 <CardContent className="text-center text-muted-foreground py-16">
                  <p>Follower list coming soon!</p>
                </CardContent>
              </Card>
            </TabsContent>
             <TabsContent value="following">
              <Card>
                <CardHeader><CardTitle>Following ({profile.followingCount || 0})</CardTitle></CardHeader>
                 <CardContent className="text-center text-muted-foreground py-16">
                  <p>Following list coming soon!</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
