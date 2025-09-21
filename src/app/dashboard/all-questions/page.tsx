
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPaginatedQuestions } from '@/lib/firebase/firestore';
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
import { DocumentSnapshot } from 'firebase/firestore';

type Question = {
    id: string;
    text: string;
    authorName: string;
    createdAt: string;
}

const ITEMS_PER_PAGE = 10;

export default function AllQuestionsPage() {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null);
  const [pageHistory, setPageHistory] = useState<(DocumentSnapshot | null)[]>([null]);
  const [hasMore, setHasMore] = useState(true);

  const fetchQuestions = async (page: number, startAfterDoc: DocumentSnapshot | null) => {
      try {
        setLoading(true);
        const { questions: fetchedQuestions, lastVisible: newLastVisible, hasMore: newHasMore } = await getPaginatedQuestions(ITEMS_PER_PAGE, startAfterDoc);
        setQuestions(fetchedQuestions as Question[]);
        setLastVisible(newLastVisible);
        setHasMore(newHasMore);

        if (page > pageHistory.length) {
            setPageHistory(prev => [...prev, newLastVisible]);
        }
        
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

  useEffect(() => {
    fetchQuestions(1, null);
  }, [toast]);

  const handleNextPage = () => {
    if (hasMore) {
        const nextPage = currentPage + 1;
        fetchQuestions(nextPage, lastVisible);
        setCurrentPage(nextPage);
    }
  }

  const handlePrevPage = () => {
      if (currentPage > 1) {
          const prevPage = currentPage - 1;
          const prevStartAfter = pageHistory[prevPage - 1]; // -1 because pageHistory is 0-indexed and has a null at the beginning
          fetchQuestions(prevPage, prevStartAfter);
          setCurrentPage(prevPage);
      }
  }

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
            <>
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
                        Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
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
                <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevPage}
                        disabled={currentPage === 1 || loading}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {currentPage}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={!hasMore || loading}
                    >
                        Next
                    </Button>
                </div>
            </>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
