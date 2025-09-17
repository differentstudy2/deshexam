
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllQuestions } from '@/lib/firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

type Question = {
    id: string;
    text: string;
    authorName: string;
    createdAt: string;
}

export default function AllQuestionsPage() {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const allQuestions = await getAllQuestions();
        setQuestions(allQuestions as Question[]);
      } catch (error) {
         toast({
          variant: "destructive",
          title: 'Error fetching questions',
          description: (error as Error).message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [toast]);

  return (
    <div>
      <h1 className="font-headline text-3xl font-bold">All Questions</h1>
      <p className="text-muted-foreground mb-6">
        Browse all the questions available in the database.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Question Bank</CardTitle>
          <CardDescription>
            Here is a list of all questions. Click view to see details.
          </CardDescription>
        </CardHeader>
        <CardContent>
           {loading ? (
             <div className="flex items-center justify-center min-h-[200px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
             </div>
           ) : (
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[60%]">Question Text</TableHead>
                    <TableHead className="hidden md:table-cell">Author</TableHead>
                    <TableHead className="hidden lg:table-cell">Created At</TableHead>
                    <TableHead>
                        <span className="sr-only">Actions</span>
                    </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                            <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                        </TableRow>
                    ))
                    ) : questions.length > 0 ? (
                    questions.map((question) => (
                        <TableRow key={question.id}>
                            <TableCell className="font-medium truncate max-w-sm">{question.text}</TableCell>
                            <TableCell className="hidden md:table-cell">{question.authorName}</TableCell>
                            <TableCell className="hidden lg:table-cell">{question.createdAt}</TableCell>
                            <TableCell className="text-right">
                                <Button asChild variant="outline" size="sm">
                                    <Link href={`/question/${question.id}`}>
                                        <Eye className="mr-2 h-4 w-4"/>View
                                    </Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))
                    ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center h-24">
                            No questions found.
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
            </Table>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
