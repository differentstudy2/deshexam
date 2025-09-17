
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { getContentByAuthor, deleteContent, getContentTypes } from '@/lib/firebase/firestore';
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
import { MoreHorizontal, Pencil, Trash2, Eye, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ContentBadge } from '@/components/content-badge';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Test = {
    id: string;
    title: string;
    subject: string;
    testType: string;
    access: 'free' | 'premium' | 'pro';
    createdAt: string;
}

type ContentType = { id: string, name: string };

function getUrlForTest(testType: string, testId: string) {
    const typeSlug = testType.toLowerCase().replace(/\s+/g, '-');
    return `/${typeSlug}/${testId}`;
}

const ContentTable = ({ tests, loading, openDeleteDialog }: { tests: Test[], loading: boolean, openDeleteDialog: (test: Test) => void }) => (
    <Table>
        <TableHeader>
            <TableRow>
            <TableHead>Title</TableHead>
            <TableHead className="hidden md:table-cell">Subject</TableHead>
            <TableHead className="hidden md:table-cell">Access</TableHead>
            <TableHead className="hidden lg:table-cell">Created At</TableHead>
            <TableHead>
                <span className="sr-only">Actions</span>
            </TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                </TableRow>
            ))
            ) : tests.length > 0 ? (
            tests.map((test) => (
                <TableRow key={test.id}>
                <TableCell className="font-medium">{test.title}</TableCell>
                <TableCell className="hidden md:table-cell">{test.subject}</TableCell>
                <TableCell className="hidden md:table-cell">
                    <ContentBadge type={test.access} />
                </TableCell>
                <TableCell className="hidden lg:table-cell">{test.createdAt}</TableCell>
                <TableCell>
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
                            <Link href={getUrlForTest(test.testType, test.id)}><Eye className="mr-2 h-4 w-4"/>View</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                        <Link href={`/dashboard/edit-content/${test.id}`}><Pencil className="mr-2 h-4 w-4"/>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => openDeleteDialog(test)}>
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
                You haven't created any content of this type yet.
                </TableCell>
            </TableRow>
            )}
        </TableBody>
    </Table>
);

export default function MyContentPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState<Test | null>(null);
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (user) {
        try {
          setLoading(true);
          const [userTests, types] = await Promise.all([
            getContentByAuthor(user.uid),
            getContentTypes()
          ]);
          setTests(userTests as Test[]);
          setContentTypes([{ id: 'all', name: 'All'}, ...types]);
        } catch (error) {
           toast({
            variant: "destructive",
            title: 'Error fetching content',
            description: (error as Error).message,
          });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchInitialData();
  }, [user, toast]);

  const openDeleteDialog = (test: Test) => {
    setTestToDelete(test);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!testToDelete) return;
    try {
      await deleteContent(testToDelete.id);
      setTests(tests.filter(test => test.id !== testToDelete.id));
      toast({
        title: "Content Deleted",
        description: `"${testToDelete.title}" has been deleted.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: 'Error deleting content',
        description: (error as Error).message,
      });
    } finally {
        setIsDeleteDialogOpen(false);
        setTestToDelete(null);
    }
  };
  
  const getFilteredTests = (type: string) => {
      if(type === 'All') return tests;
      return tests.filter(test => test.testType === type);
  }

  return (
    <div>
      <h1 className="font-headline text-3xl font-bold">My Content</h1>
      <p className="text-muted-foreground mb-6">
        Here is a list of all the content you have created.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Your Content</CardTitle>
          <CardDescription>
            Manage your created content. You can view, edit, or delete them.
          </CardDescription>
        </CardHeader>
        <CardContent>
           {loading ? (
             <div className="flex items-center justify-center min-h-[200px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
             </div>
           ) : (
            <Tabs defaultValue="All">
                 <TabsList>
                    {contentTypes.map(type => (
                        <TabsTrigger key={type.id} value={type.name}>{type.name}</TabsTrigger>
                    ))}
                </TabsList>
                {contentTypes.map(type => (
                    <TabsContent key={type.id} value={type.name}>
                        <ContentTable 
                            tests={getFilteredTests(type.name)} 
                            loading={loading}
                            openDeleteDialog={openDeleteDialog}
                        />
                    </TabsContent>
                ))}
            </Tabs>
           )}
        </CardContent>
      </Card>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the content
              "{testToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
