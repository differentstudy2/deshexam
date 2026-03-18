
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllContent, deleteContent } from '@/lib/firebase/firestore';
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
import { MoreHorizontal, Pencil, Trash2, Eye, Loader2, PlusCircle, Gem } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ContentBadge } from '@/components/content-badge';

type Quiz = {
    id: string;
    title: string;
    subject: string;
    testType: string | string[];
    access: 'free' | 'premium' | 'pro';
    createdAt: string;
}

function getUrlForTest(testType: string | string[], testId: string) {
    const primaryType = Array.isArray(testType) ? testType[0] : testType;
    // Fallback for safety, though every item should have a type.
    if (!primaryType) return `/content/${testId}`;
    const typeSlug = primaryType.toLowerCase().replace(/\s+/g, '-');
    return `/${typeSlug}/${testId}`;
}

export default function ManageQuizzesPage() {
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const allContent = await getAllContent("Quiz");
      setQuizzes(allContent as Quiz[]);
    } catch (error) {
       toast({
        variant: "destructive",
        title: 'Error fetching quizzes',
        description: (error as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [toast]);

  const handleDelete = async () => {
    if (!quizToDelete) return;
    try {
        await deleteContent(quizToDelete.id);
        toast({
            title: "Quiz Deleted",
            description: `"${quizToDelete.title}" has been deleted.`,
        });
        fetchQuizzes();
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Error deleting quiz',
            description: (error as Error).message,
        });
    } finally {
        setQuizToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
            <div>
                <h1 className="font-headline text-3xl font-bold">Manage Quizzes</h1>
                <p className="text-muted-foreground">View, edit, and delete all quizzes.</p>
            </div>
            <Button asChild>
                <Link href="/admin/add-quiz">
                    <PlusCircle className="mr-2" /> Add New Quiz
                </Link>
            </Button>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>All Quizzes</CardTitle>
          <CardDescription>
            A list of all quizzes in your application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Subject</TableHead>
                <TableHead className="hidden md:table-cell">Access</TableHead>
                <TableHead className="hidden lg:table-cell">Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-full ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : quizzes.length > 0 ? (
                quizzes.map((quiz) => (
                  <TableRow key={quiz.id}>
                    <TableCell className="font-medium">{quiz.title}</TableCell>
                    <TableCell className="hidden md:table-cell">{quiz.subject}</TableCell>
                    <TableCell className="hidden md:table-cell">
                        <ContentBadge type={quiz.access} />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{quiz.createdAt}</TableCell>
                    <TableCell className="text-right">
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link href={getUrlForTest(quiz.testType, quiz.id)}><Eye className="mr-2 h-4 w-4"/>View</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                               <Link href={`/admin/edit-content/${quiz.id}`}><Pencil className="mr-2 h-4 w-4"/>Edit</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => setQuizToDelete(quiz)}>
                            <Trash2 className="mr-2 h-4 w-4"/>Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No quizzes found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
       <AlertDialog open={!!quizToDelete} onOpenChange={() => setQuizToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the quiz "{quizToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
