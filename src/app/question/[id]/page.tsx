
'use client';

import { useEffect, useState } from 'react';
import { getQuestionById } from '@/lib/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

type Option = {
  text: string;
};

type Question = {
  id: string;
  text: string;
  type: 'Multiple Choice' | 'True/False' | 'Short Answer';
  options?: Option[];
  correctAnswer: string;
};

export default function QuestionPage() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const questionId = params.id as string;

  useEffect(() => {
    const fetchQuestion = async () => {
      if (!questionId) return;
      try {
        setLoading(true);
        const questionData = await getQuestionById(questionId);
        setQuestion(questionData as Question);
      } catch (error) {
        toast({
          variant: "destructive",
          title: 'Error fetching question',
          description: (error as Error).message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [questionId, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading Question...</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="text-center min-h-[calc(100vh-200px)] flex flex-col justify-center">
        <h2 className="text-2xl font-bold">Question not found</h2>
        <p className="text-muted-foreground">The question you are looking for does not exist.</p>
        <Button asChild className="mt-4 mx-auto" variant="outline" onClick={() => router.back()}>
            <Link href="#">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
            </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-12">
       <header className="mb-8">
        <h1 className="font-headline text-4xl font-bold tracking-tighter">Question Details</h1>
        <p className="text-muted-foreground mt-2 max-w-3xl">Review the question and its correct answer.</p>
      </header>

        <Card>
            <CardHeader>
            <CardTitle>Question</CardTitle>
            <CardDescription className="text-lg text-foreground pt-2">{question.text}</CardDescription>
            </CardHeader>
            <CardContent>
            {question.type === 'Multiple Choice' && question.options && (
                <RadioGroup value={question.correctAnswer} disabled className="space-y-2">
                {question.options.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.text} id={`q-opt${optIndex}`} />
                    <Label htmlFor={`q-opt${optIndex}`} className="text-base">{option.text}</Label>
                    </div>
                ))}
                </RadioGroup>
            )}
            {question.type === 'True/False' && (
                <RadioGroup value={question.correctAnswer} disabled className="flex space-x-4">
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="True" id={`q-true`} />
                    <Label htmlFor={`q-true`}>True</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="False" id={`q-false`} />
                    <Label htmlFor={`q-false`}>False</Label>
                </div>
                </RadioGroup>
            )}
            {question.type === 'Short Answer' && (
                <div>
                    <Label className="text-base">Correct Answer:</Label>
                    <Input 
                        value={question.correctAnswer}
                        disabled
                    />
                </div>
            )}
            </CardContent>
        </Card>
        <div className="mt-8 flex justify-start">
             <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4"/>
                Go Back
            </Button>
        </div>
    </div>
  );
}
