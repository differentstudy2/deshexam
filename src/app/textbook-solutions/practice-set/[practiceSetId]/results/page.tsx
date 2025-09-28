
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Award, CheckCircle, XCircle, Loader2, FileQuestion, GraduationCap, Target, School, Book, Layers, BarChart, Clock, Star, Calendar, BadgeCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getSubmissionById, getUserProfile } from '@/lib/firebase/firestore';
import type { Textbook, Topic } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScoreCircle } from '@/components/feature/score-circle';
import { Badge } from '@/components/ui/badge';

type Submission = { 
    id: string; 
    practiceSetId: string; 
    practiceSetTitle: string;
    topicId: string;
    topicTitle: string;
    chapterId: string;
    textbookId: string;
    userId: string; 
    score: number; 
    totalQuestions: number; 
    answers: { [key: string]: string };
    submittedAt: any;
};

type UserProfile = { uid: string; displayName: string; photoURL?: string; school?: string; classGrade?: string; targetExam?: string; };


function ResultsDisplay() {
  const searchParams = useSearchParams();
  const submissionId = searchParams.get('submissionId');
  const { toast } = useToast();

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [textbook, setTextbook] = useState<Textbook | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [student, setStudent] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!submissionId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No submission ID found in the URL.",
      });
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const submissionData = await getSubmissionById(submissionId) as Submission;

        if (submissionData) {
          setSubmission(submissionData);
          
          const textbookDocRef = doc(db, 'textbooks', submissionData.textbookId);
          const topicDocRef = doc(db, `textbooks/${submissionData.textbookId}/chapters/${submissionData.chapterId}/topics`, submissionData.topicId);
           
          const [textbookData, studentData, topicData] = await Promise.all([
             getDoc(textbookDocRef),
             getUserProfile(submissionData.userId) as Promise<UserProfile>,
             getDoc(topicDocRef)
           ]);
           
           if(textbookData.exists()) setTextbook({id: textbookData.id, ...textbookData.data()} as Textbook);
           if(topicData.exists()) setTopic({id: topicData.id, ...topicData.data()} as Topic);

           setStudent(studentData);
        } else {
          throw new Error("Submission not found.");
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error loading results",
          description: (error as Error).message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [submissionId, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading Your Results...</p>
      </div>
    );
  }

  if (!submission || !student) {
    return (
      <div className="text-center min-h-[400px] flex flex-col justify-center">
        <h2 className="text-2xl font-bold">Results not found</h2>
        <p className="text-muted-foreground">We couldn't load the results for this practice set.</p>
        <Button asChild className="mt-4 mx-auto" variant="outline">
          <Link href="/textbook-solutions">Back to Textbooks</Link>
        </Button>
      </div>
    );
  }

  const { score, totalQuestions } = submission;
  const percentage = Math.round((score / totalQuestions) * 100);
  const submittedAtDate = submission.submittedAt ? new Date(submission.submittedAt) : null;

  const reviewUrl = `/textbook-solutions/practice-set/${submission.practiceSetId}/review?submissionId=${submissionId}`;
  const tryAgainUrl = `/textbook-solutions/practice-set/${submission.practiceSetId}?textbook=${submission.textbookId}&chapter=${submission.chapterId}&topic=${submission.topicId}`;
  const backToTopicUrl = `/textbook-solutions/${submission.textbookId}?chapter=${submission.chapterId}&topic=${submission.topicId}`;
  
  const pageTitle = `${student?.displayName}'s Practice Set Results`;


  return (
    <>
      <header className="text-center mb-8">
        <h1 className="font-headline text-4xl font-bold">{pageTitle}</h1>
        <p className="text-muted-foreground">Here's how you performed on the practice set for <span className="font-semibold text-foreground">{textbook?.board} - {textbook?.title}</span>.</p>
      </header>
      <Card className="max-w-4xl mx-auto">
         <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center gap-4">
                     <Avatar className="h-16 w-16">
                        <AvatarImage src={student?.photoURL || `https://picsum.photos/seed/${student?.uid}/64/64`} />
                        <AvatarFallback>{student?.displayName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="flex items-center justify-center md:justify-start gap-2">
                        <h3 className="text-lg font-semibold">{student?.displayName}</h3>
                        <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-600"><BadgeCheck className="w-3.5 h-3.5 mr-1"/>Verified</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1 pt-1">
                            {student.school && <div className="flex items-center gap-1.5"><School className="w-4 h-4" />{student.school}</div>}
                            {student.classGrade && <div className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4" />{student.classGrade}</div>}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-6 mt-4 md:mt-0">
                    <div className="text-center md:text-right">
                        <div className="text-3xl font-bold">{score}/{totalQuestions}</div>
                        <div className="text-xs font-semibold text-muted-foreground">Marks Obtained</div>
                    </div>
                    <div className="flex flex-col items-center">
                        <ScoreCircle score={percentage} size={60} strokeWidth={5}/>
                        <span className="text-xs font-semibold text-muted-foreground mt-1">Your Score</span>
                    </div>
                </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground col-span-full"><FileQuestion className="w-4 h-4"/> <strong>Practice Set:</strong> <span className="text-foreground">{submission.practiceSetTitle}</span></div>
                {topic?.title && <div className="flex items-center gap-2 text-muted-foreground col-span-full"><Layers className="w-4 h-4" /> <strong>Topic:</strong> <span className="text-foreground">{topic.title}</span></div>}
                {textbook?.title && <div className="flex items-center gap-2 text-muted-foreground col-span-full"><Book className="w-4 h-4" /> <strong>Textbook:</strong> <span className="text-foreground">{textbook.title}</span></div>}

                {textbook?.subject && <div className="flex items-center gap-2 text-muted-foreground"><Book className="w-4 h-4"/> <strong>Subject:</strong> <span className="text-foreground">{textbook.subject}</span></div>}
                {textbook?.board && <div className="flex items-center gap-2 text-muted-foreground"><Layers className="w-4 h-4"/> <strong>Board:</strong> <span className="text-foreground">{textbook.board}</span></div>}
                {textbook?.class && <div className="flex items-center gap-2 text-muted-foreground"><GraduationCap className="w-4 h-4"/> <strong>Class:</strong> <span className="text-foreground">{textbook.class}</span></div>}
                
                {totalQuestions > 0 && <div className="flex items-center gap-2 text-muted-foreground"><BarChart className="w-4 h-4"/> <strong>Full Marks:</strong> <span className="text-foreground">{totalQuestions}</span></div>}
                {totalQuestions > 0 && <div className="flex items-center gap-2 text-muted-foreground"><Clock className="w-4 h-4"/> <strong>Duration:</strong> <span className="text-foreground">{totalQuestions} min</span></div>}

                {submittedAtDate && submittedAtDate.toString() !== 'Invalid Date' && (
                    <>
                        <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="w-4 h-4"/> <strong>Date:</strong> <span className="text-foreground">{submittedAtDate.toLocaleDateString()}</span></div>
                        <div className="flex items-center gap-2 text-muted-foreground"><Clock className="w-4 h-4"/> <strong>Time:</strong> <span className="text-foreground">{submittedAtDate.toLocaleTimeString()}</span></div>
                    </>
                )}
            </div>
            <Separator />
             <div className="flex gap-4 justify-center pt-2">
                <Button asChild>
                <Link href={reviewUrl}>
                    <FileQuestion className="mr-2"/>
                    Review Answers
                </Link>
                </Button>
                <Button variant="outline" asChild>
                <Link href={tryAgainUrl}>Try Again</Link>
                </Button>
            </div>
            <div className="pt-2 text-center">
                    <Button variant="link" asChild>
                        <Link href={backToTopicUrl}>Back to Topic</Link>
                    </Button>
            </div>
        </CardContent>
      </Card>
    </>
  );
}

export default function PracticeSetResultsPage() {

  return (
    <div className="container py-12">
      <Suspense fallback={<div className="text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto"/></div>}>
        <ResultsDisplay />
      </Suspense>
    </div>
  );
}

    