'use client';

import { useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Award, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function TestResultsPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const score = searchParams.get('score');
  const total = searchParams.get('total');

  const scoreValue = score ? parseInt(score, 10) : 0;
  const totalValue = total ? parseInt(total, 10) : 1;
  const percentage = Math.round((scoreValue / totalValue) * 100);
  const correctAnswers = scoreValue;
  const incorrectAnswers = totalValue - scoreValue;

  return (
    <div className="container py-12">
      <header className="text-center mb-8">
        <h1 className="font-headline text-4xl font-bold">Test Results</h1>
        <p className="text-muted-foreground">Here's how you performed on the test.</p>
      </header>
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
            <Award className="w-16 h-16 mx-auto mb-4 text-primary" />
            <CardTitle className="text-3xl">Congratulations!</CardTitle>
            <CardDescription>You've completed the test.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 text-center space-y-6">
            <div>
                <p className="text-muted-foreground text-sm">Your Score</p>
                <p className="text-5xl font-bold">{percentage}%</p>
            </div>
            
            <Progress value={percentage} className="w-full h-3" />
            
            <div className="flex justify-around pt-4">
                <div className="text-center">
                    <p className="text-2xl font-bold">{totalValue}</p>
                    <p className="text-muted-foreground">Total Questions</p>
                </div>
                <div className="text-center text-green-600">
                     <p className="text-2xl font-bold flex items-center justify-center gap-2"><CheckCircle /> {correctAnswers}</p>
                    <p className="text-muted-foreground">Correct</p>
                </div>
                 <div className="text-center text-destructive">
                    <p className="text-2xl font-bold flex items-center justify-center gap-2"><XCircle /> {incorrectAnswers}</p>
                    <p className="text-muted-foreground">Incorrect</p>
                </div>
            </div>
            
            <div className="flex gap-4 justify-center pt-6">
                <Button asChild>
                    <Link href="/mock-tests">Back to Mock Tests</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href={`/mock-tests/${params.id}`}>Try Again</Link>
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
