

'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { doc, getDoc, collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { PracticeSet, Question, Topic } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowLeft, CheckCircle, XCircle, RefreshCw, Download, GripVertical } from 'lucide-react';
import Link from 'next/link';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';

type UserAnswer = {
  questionId: string;
  answer: any;
};

type Result = {
    score: number;
    totalMarks: number;
    percentage: number;
    results: Array<{
        question: Question;
        userAnswer: any;
        isCorrect: boolean;
        matchingScore?: number;
    }>
}

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
  const practiceSetId = params.practiceSetId as string;
  const textbookId = searchParams.get('textbook');
  const chapterId = searchParams.get('chapter');
  const topicId = searchParams.get('topic');

  const [practiceSet, setPracticeSet] = useState<PracticeSet | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
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

        // Shuffle columnB for matching questions
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

  const handleSubmit = () => {
    let score = 0;
    
    const totalMarks = questions.reduce((acc, q) => {
        if (q.type === 'Matching') {
            return acc + (Array.isArray(q.correctAnswer) ? q.correctAnswer.length : (q.marks || 0));
        }
        return acc + (q.marks || 1);
    }, 0);
    
    const results = questions.map(question => {
        const userAnswerObj = userAnswers.find(a => a.questionId === question.id);
        const userAnswer = userAnswerObj ? userAnswerObj.answer : null;
        let isCorrect = false;
        let matchingScore = 0;

        if (question.type === 'Matching') {
            if (userAnswer && Array.isArray(question.correctAnswer)) {
                for(const pair of question.correctAnswer) {
                    if (userAnswer[pair.a] === pair.b) {
                        matchingScore++;
                    }
                }
                isCorrect = matchingScore === question.correctAnswer.length;
            }
            score += matchingScore; // Add points for each correct match
        } else {
            isCorrect = userAnswer?.toLowerCase().trim() === question.correctAnswer?.toLowerCase().trim();
            if (isCorrect) {
                score += question.marks || 1;
            }
        }
        
        return { question, userAnswer, isCorrect, matchingScore };
    });

    const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;

    setResult({ score, totalMarks, percentage, results });
    setIsSubmitted(true);
  };

  const handleTryAgain = () => {
    setIsSubmitted(false);
    setResult(null);
    setUserAnswers([]);
    setQuestions(shuffleArray(questions));
  }

  const handleDownloadPdf = () => {
    const input = resultsRef.current;
    if (!input) return;

    html2canvas(input, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      const width = pdfWidth;
      let height = width / ratio;

      if(height > pdfHeight){
        height = pdfHeight;
      }
      
      let position = 0;
      let heightLeft = canvasHeight * (pdfWidth / canvasWidth);
      
      pdf.addImage(imgData, 'PNG', 0, position, width, height);
      heightLeft -= pdfHeight;

      while(heightLeft > 0){
        position = heightLeft - height;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, width, height);
        heightLeft -= pdfHeight;
      }
      
      pdf.save(`results-${practiceSet?.title.replace(/ /g, '_')}.pdf`);
    });
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

  if (isSubmitted && result) {
    return (
      <div className="container mx-auto max-w-3xl py-8">
         <div className="mb-6 flex justify-between">
            <Button variant="ghost" onClick={handleTryAgain}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
            </Button>
            <Button variant="outline" onClick={handleDownloadPdf}>
                <Download className="mr-2 h-4 w-4" />
                Download as PDF
            </Button>
        </div>
        <Card ref={resultsRef} className="p-4 sm:p-0">
            <CardHeader className="text-center items-center">
                <CardTitle className="font-headline text-3xl">Results: {practiceSet.title}</CardTitle>
                <CardDescription>You scored {result.score} out of {result.totalMarks}</CardDescription>
                <div className="w-full max-w-sm pt-4">
                    <Progress value={result.percentage} />
                    <p className="text-lg font-bold mt-2">{result.percentage.toFixed(2)}%</p>
                </div>
            </CardHeader>
            <CardContent className="space-y-8">
                {result.results.map(({ question, userAnswer, isCorrect, matchingScore }, index) => (
                    <div key={question.id} className={`space-y-4 border rounded-lg p-4 ${isCorrect ? 'border-green-300 bg-green-50/50' : 'border-red-300 bg-red-50/50'}`}>
                        <div className="flex justify-between items-start">
                            <p className="font-semibold">{index + 1}. {question.text}</p>
                             {question.type === 'Matching' ? (
                                <span className="font-semibold text-sm">{matchingScore}/{question.correctAnswer.length}</span>
                            ) : isCorrect ? (
                                <CheckCircle className="h-5 w-5 text-green-600"/>
                            ) : (
                                <XCircle className="h-5 w-5 text-red-600"/>
                            )}
                        </div>
                        
                         {question.type === 'Matching' ? (
                            <div className="space-y-2">
                               {Array.isArray(question.correctAnswer) && question.correctAnswer.map((pair: any, pairIndex) => {
                                   const userMatchedB = userAnswer?.[pair.a];
                                   const isPairCorrect = userMatchedB === pair.b;
                                   return (
                                        <div key={pairIndex} className={`p-2 border rounded-md ${isPairCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="font-medium">{pair.a}</span>
                                                <span>-</span>
                                                <span className={!isPairCorrect ? 'line-through' : ''}>{userMatchedB || "Not answered"}</span>
                                                {!isPairCorrect && <span className="font-bold text-green-700">{pair.b}</span>}
                                            </div>
                                        </div>
                                   )
                               })}
                           </div>
                         ) : (
                            <>
                                <p className={`text-sm ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>Your Answer: <span className="font-medium">{userAnswer || "No answer"}</span></p>
                                {!isCorrect && <p className="text-sm text-primary">Correct Answer: <span className="font-medium">{question.correctAnswer}</span></p>}
                            </>
                         )}

                        {question.explanation && <p className="text-sm text-muted-foreground bg-secondary/50 p-2 rounded-md">Explanation: {question.explanation}</p>}
                    </div>
                ))}
            </CardContent>
             <CardFooter className="justify-center">
                <Button asChild>
                    <Link href={backUrl}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Topic
                    </Link>
                </Button>
            </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-3xl py-8">
       <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href={backUrl}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {topic?.title || 'Topic'}
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
                <Button className="w-full mt-8">Submit Test</Button>
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

