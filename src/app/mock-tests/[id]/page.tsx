'use client';

import { useEffect, useState } from 'react';
import { getTestById } from '@/lib/firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Clock, HelpCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Option = {
  text: string;
};

type Question = {
  text: string;
  type: 'Multiple Choice' | 'True/False' | 'Short Answer';
  options?: Option[];
};

type Test = {
  id: string;
  title: string;
  subject: string;
  description: string;
  duration: number;
  questions: Question[];
};

export default function TestPage({ params }: { params: { id: string } }) {
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchTest = async () => {
      try {
        setLoading(true);
        const testData = await getTestById(params.id);
        setTest(testData as Test);
      } catch (error) {
        toast({
          variant: "destructive",
          title: 'Error fetching test',
          description: (error as Error).message,
        });
        router.push('/mock-tests');
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [params.id, toast, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading Test...</p>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="text-center min-h-[calc(100vh-200px)] flex flex-col justify-center">
        <h2 className="text-2xl font-bold">Test not found</h2>
        <p className="text-muted-foreground">The test you are looking for does not exist.</p>
        <Button asChild className="mt-4 mx-auto" variant="outline">
          <Link href="/mock-tests">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tests
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-12">
       <header className="mb-8">
        <p className="text-primary font-semibold">{test.subject}</p>
        <h1 className="font-headline text-4xl font-bold tracking-tighter">{test.title}</h1>
        <p className="text-muted-foreground mt-2 max-w-3xl">{test.description}</p>
        <div className="flex items-center text-sm text-muted-foreground space-x-4 mt-2">
            <div className="flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" />
              <span>{test.questions.length} Questions</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{test.duration} min</span>
            </div>
        </div>
      </header>

      <form>
        <div className="space-y-8">
          {test.questions.map((question, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>Question {index + 1}</CardTitle>
                <CardDescription className="text-lg text-foreground pt-2">{question.text}</CardDescription>
              </CardHeader>
              <CardContent>
                {question.type === 'Multiple Choice' && question.options && (
                  <RadioGroup className="space-y-2">
                    {question.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.text} id={`q${index}-opt${optIndex}`} />
                        <Label htmlFor={`q${index}-opt${optIndex}`} className="text-base">{option.text}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
                {question.type === 'True/False' && (
                  <RadioGroup className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="True" id={`q${index}-true`} />
                      <Label htmlFor={`q${index}-true`}>True</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="False" id={`q${index}-false`} />
                      <Label htmlFor={`q${index}-false`}>False</Label>
                    </div>
                  </RadioGroup>
                )}
                {question.type === 'Short Answer' && (
                  <Input placeholder="Your answer..." />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8 flex justify-end">
            <Button size="lg" type="submit">Submit Test</Button>
        </div>
      </form>
    </div>
  );
}
