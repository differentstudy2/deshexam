

'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { PracticeSet, Question, Topic, Textbook } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowLeft, GripVertical } from 'lucide-react';
import Link from 'next/link';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { addPracticeSetSubmission } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

type UserAnswer = {
  questionId: string;
  answer: any;
};

const shuffleArray = (array: any[]) => {
  if (!array) return [];
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function PracticeSetPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const practiceSetId = params.practiceSetId as string;
  const textbookId = searchParams.get('textbook');
  const chapterId = searchParams.get('chapter');
  const topicId = searchParams.get('topic');

  const [practiceSet, setPracticeSet] = useState<PracticeSet | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    if (!practiceSetId || !textbookId || !chapterId || !topicId) {
        setLoading(false);
        return;
    };

    const fetchPracticeSet = async () => {
      setLoading(true);
      
      const topicDocRef = doc(db, `textbooks/${textbookId}/chapters/${chapterId}/topics`, topicId);
      const topicSnap = await getDoc(topicDocRef);
      if(topicSnap.exists()) setTopic({ id: topicSnap.id, ...topicSnap.data() } as Topic);

      const practiceSetDocRef = doc(db, `textbooks/${textbookId}/chapters/${chapterId}/topics/${topicId}/practiceSets`, practiceSetId);
      const practiceSetSnap = await getDoc(practiceSetDocRef);

      if (practiceSetSnap.exists()) {
        const psData = { id: practiceSetSnap.id, ...practiceSetSnap.data() } as PracticeSet
        setPracticeSet(psData);
        const questionsQuery = query(collection(practiceSetDocRef, 'questions'));
        const questionsSnap = await getDocs(questionsQuery);
        let questionsData = questionsSnap.docs.map(qDoc => ({ id: qDoc.id, ...qDoc.data() } as Question));

        questionsData = questionsData.map(q => {
            if (q.type === 'Matching' && q.correctAnswer) {
                const pairs = q.correctAnswer as { a: string, aImage?: string, b: string, bImage?: string }[];
                const columnA = pairs.map(p => ({ text: p.a, image: p.aImage }));
                let columnB = pairs.map(p => ({ text: p.b, image: p.bImage }));
                return {
                    ...q,
                    matchingOptions: {
                        columnA,
                        columnB: shuffleArray(columnB)
                    }
                }
            }
            return q;
        });

        setQuestions(shuffleArray(questionsData));
      }

      setLoading(false);
    };

    fetchPracticeSet();
  }, [practiceSetId, textbookId, chapterId, topicId]);

  const handleAnswerChange = (questionId: string, answer: any) => {
    setUserAnswers(prevAnswers => {
      const otherAnswers = prevAnswers.filter(a => a.questionId !== questionId);
      return [...otherAnswers, { questionId, answer }];
    });
  };

  const handleMatchingAnswerChange = (questionId: string, columnAItem: string, columnBItem: string) => {
    const currentAnswer = userAnswers.find(a => a.questionId === questionId)?.answer || {};
    const newAnswer = { ...currentAnswer, [columnAItem]: columnBItem };
    handleAnswerChange(questionId, newAnswer);
  }

  const handleSubmit = async () => {
    if (!user) {
        toast({variant: "destructive", title: "Please log in to submit."});
        return;
    }
    setIsSubmitting(true);
    let score = 0;
    
    const totalMarks = questions.reduce((acc, q) => {
        if (q.type === 'Matching') {
            return acc + (Array.isArray(q.correctAnswer) ? q.correctAnswer.length : (q.marks || 0));
        }
        return acc + (q.marks || 1);
    }, 0);
    
    questions.forEach(question => {
        const userAnswerObj = userAnswers.find(a => a.questionId === question.id);
        const userAnswer = userAnswerObj ? userAnswerObj.answer : null;
        
        if (question.type === 'Matching') {
            if (userAnswer && Array.isArray(question.correctAnswer)) {
                for(const pair of question.correctAnswer) {
                    if (userAnswer[pair.a] === pair.b) {
                        score++;
                    }
                }
            }
        } else {
            if (userAnswer?.toLowerCase().trim() === question.correctAnswer?.toLowerCase().trim()) {
                score += question.marks || 1;
            }
        }
    });
    
     const submissionData = {
        practiceSetId: practiceSet?.id,
        practiceSetTitle: practiceSet?.title,
        topicId: topic?.id,
        topicTitle: topic?.title,
        chapterId: chapterId,
        textbookId: textbookId,
        answers: userAnswers.reduce((acc, ans) => ({...acc, [ans.questionId]: ans.answer}), {}),
        score,
        totalQuestions: totalMarks,
    };

    try {
        const subId = await addPracticeSetSubmission(submissionData);
        toast({
            title: "Practice Set Submitted!",
            description: "Redirecting to your results...",
        });
        router.push(`/textbook-solutions/practice-set/${practiceSetId}/results?submissionId=${subId}`);
    } catch(error) {
        console.error("Failed to save submission:", error);
        toast({
            variant: "destructive",
            title: "Submission Error",
            description: "There was an issue saving your results. Please try again."
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!practiceSet) {
    return <div className="container mx-auto py-8 text-center">Practice set not found.</div>;
  }

  const backUrl = `/textbook-solutions/${textbookId}?chapter=${chapterId}&topic=${topicId}`;

  return (
    <div className="container mx-auto max-w-3xl py-8">
       <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href={backUrl}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="truncate md:hidden">Back to Topic</span>
            <span className="truncate hidden md:inline">Back to {topic?.title || 'Topic'}</span>
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">{practiceSet.title}</CardTitle>
          <CardDescription>Topic: {topic?.title}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {questions.map((question, index) => (
            <div key={question.id} className="space-y-4 border-t pt-6 first:border-t-0 first:pt-0">
              <p className="font-semibold">{index + 1}. {question.text} <span className="text-sm font-normal text-muted-foreground">({question.marks} mark{question.marks > 1 ? 's': ''})</span></p>

              {question.type === 'Multiple Choice' ? (
                <RadioGroup onValueChange={(value) => handleAnswerChange(question.id, value)}>
                  {(question.options || []).map((option, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.text} id={`${question.id}-option-${i}`} />
                      <Label htmlFor={`${question.id}-option-${i}`}>{option.text}</Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : question.type === 'True/False' ? (
                <RadioGroup onValueChange={(value) => handleAnswerChange(question.id, value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="True" id={`${question.id}-true`} />
                      <Label htmlFor={`${question.id}-true`}>True</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                      <RadioGroupItem value="False" id={`${question.id}-false`} />
                      <Label htmlFor={`${question.id}-false`}>False</Label>
                    </div>
                </RadioGroup>
              ) : (question.type === 'Short Answer' || question.type === 'Fill in the Blank') ? (
                <Input 
                  placeholder="Your answer..."
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                />
              ) : question.type === 'Matching' && question.matchingOptions ? (
                  <div className="space-y-4">
                      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                          <div className="font-bold text-center">Column A</div>
                          <div></div>
                          <div className="font-bold text-center">Column B</div>
                      </div>
                      {question.matchingOptions.columnA.map((itemA, itemIndex) => (
                          <div key={itemIndex} className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                              <div className="p-3 border rounded-md text-center bg-secondary">
                                  {itemA.image && <Image src={itemA.image} alt={itemA.text} width={100} height={100} className="mx-auto mb-2 rounded-md" />}
                                  {itemA.text}
                              </div>
                              <GripVertical className="h-5 w-5 text-muted-foreground" />
                              <Select 
                                  onValueChange={(value) => handleMatchingAnswerChange(question.id, itemA.text, value)} 
                              >
                                  <SelectTrigger>
                                      <SelectValue placeholder="Select a match" />
                                  </SelectTrigger>
                                  <SelectContent>
                                      {question.matchingOptions?.columnB.map((itemB, bIndex) => (
                                          <SelectItem key={bIndex} value={itemB.text}>
                                              <div className="flex items-center gap-2">
                                                  {itemB.image && <Image src={itemB.image} alt={itemB.text} width={24} height={24} className="rounded-sm" />}
                                                  <span>{itemB.text}</span>
                                              </div>
                                          </SelectItem>
                                      ))}
                                  </SelectContent>
                              </Select>
                          </div>
                      ))}
                  </div>
              ) : null}
            </div>
          ))}
           <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-full mt-8" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "Submit Test"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You are about to submit your answers. You cannot change them after submission.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSubmit}>Submit</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
