
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
import { Loader2, ArrowLeft, CheckCircle, XCircle, RefreshCw, Download } from 'lucide-react';
import Link from 'next/link';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type UserAnswer = {
  questionId: string;
  answer: string;
};

type Result = {
    score: number;
    totalMarks: number;
    percentage: number;
    results: Array<{
        question: Question;
        userAnswer: string;
        isCorrect: boolean;
    }>
}

const shuffleArray = (array: any[]) => {
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
        setPracticeSet({ id: practiceSetSnap.id, ...practiceSetSnap.data() } as PracticeSet);
        const questionsQuery = query(collection(practiceSetDocRef, 'questions'));
        const questionsSnap = await getDocs(questionsQuery);
        const questionsData = questionsSnap.docs.map(qDoc => ({ id: qDoc.id, ...qDoc.data() } as Question));
        setQuestions(shuffleArray(questionsData));
      }
      setLoading(false);
    };

    fetchPracticeSet();
  }, [practiceSetId, textbookId, chapterId, topicId]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setUserAnswers(prevAnswers => {
      const otherAnswers = prevAnswers.filter(a => a.questionId !== questionId);
      return [...otherAnswers, { questionId, answer }];
    });
  };

  const handleSubmit = () => {
    let score = 0;
    const totalMarks = questions.reduce((acc, q) => acc + q.marks, 0);
    
    const results = questions.map(question => {
        const userAnswerObj = userAnswers.find(a => a.questionId === question.id);
        const userAnswer = userAnswerObj ? userAnswerObj.answer : "";
        const isCorrect = userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
        if (isCorrect) {
            score += question.marks;
        }
        return { question, userAnswer, isCorrect };
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
      const height = width / ratio;

      let position = 0;
      let heightLeft = height;
      
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
                {result.results.map(({ question, userAnswer, isCorrect }, index) => (
                    <div key={question.id} className={`space-y-4 border rounded-lg p-4 ${isCorrect ? 'border-green-300 bg-green-50/50' : 'border-red-300 bg-red-50/50'}`}>
                        <div className="flex justify-between items-start">
                            <p className="font-semibold">{index + 1}. {question.text}</p>
                            {isCorrect ? <CheckCircle className="h-5 w-5 text-green-600"/> : <XCircle className="h-5 w-5 text-red-600"/>}
                        </div>
                        <p className={`text-sm ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>Your Answer: <span className="font-medium">{userAnswer || "No answer"}</span></p>
                        {!isCorrect && <p className="text-sm text-primary">Correct Answer: <span className="font-medium">{question.correctAnswer}</span></p>}
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

              {question.type === 'Multiple Choice' || question.type === 'True/False' ? (
                <RadioGroup onValueChange={(value) => handleAnswerChange(question.id, value)}>
                  {(question.options || []).map((option, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.text} id={`${question.id}-option-${i}`} />
                      <Label htmlFor={`${question.id}-option-${i}`}>{option.text}</Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : question.type === 'Short Answer' ? (
                <Input 
                  placeholder="Your answer..."
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                />
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
