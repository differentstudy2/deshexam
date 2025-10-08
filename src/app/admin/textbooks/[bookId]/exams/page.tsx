
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getAllContent } from '@/lib/firebase/firestore';
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
import { Eye, PlusCircle, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ContentBadge } from '@/components/content-badge';

type Exam = {
    id: string;
    title: string;
    subject: string;
    testType: string;
    access: 'free' | 'premium' | 'pro';
    createdAt: string;
    textbookId?: string;
}

function getUrlForExam(examId: string) {
    return `/exam/${examId}`;
}

export default function ManageTextbookExamsPage() {
    const params = useParams();
    const textbookId = params.bookId as string;
    const { toast } = useToast();

    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExams = async () => {
            if (!textbookId) return;
            setLoading(true);
            try {
                const allExams = await getAllContent('Exam') as Exam[];
                const textbookExams = allExams.filter(exam => exam.textbookId === textbookId);
                setExams(textbookExams);
            } catch (error) {
                 toast({
                    variant: "destructive",
                    title: 'Error fetching exams',
                    description: (error as Error).message,
                });
            } finally {
                setLoading(false);
            }
        };
        fetchExams();
    }, [textbookId, toast]);

    return (
        <div className="space-y-6">
            <div>
                <Button asChild variant="ghost">
                    <Link href={`/admin/textbooks`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Textbooks
                    </Link>
                </Button>
            </div>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-headline text-3xl font-bold">Manage Exams</h1>
                    <p className="text-muted-foreground">
                        Exams associated with this textbook.
                    </p>
                </div>
                <Button asChild>
                    <Link href={`/admin/textbooks/${textbookId}/add-exam`}>
                        <PlusCircle className="mr-2" />
                        Add New Exam
                    </Link>
                </Button>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Exams ({exams.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Access</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                            ) : exams.length > 0 ? (
                                exams.map((exam) => (
                                <TableRow key={exam.id}>
                                    <TableCell className="font-medium">{exam.title}</TableCell>
                                    <TableCell>{exam.subject}</TableCell>
                                    <TableCell><ContentBadge type={exam.access} /></TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={getUrlForExam(exam.id)}><Eye className="mr-2 h-4 w-4"/>View</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">
                                    No exams added to this textbook yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
