
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
import { MoreHorizontal, Pencil, Trash2, Eye, Loader2, PlusCircle, ToyBrick } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
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
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

type KidsContent = {
    id: string;
    title: string;
    category: string;
    createdAt: string;
}

export default function ManageKidsContentPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [content, setContent] = useState<KidsContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState<KidsContent | null>(null);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const allContent = await getAllContent();
      const kidsContent = (allContent as any[]).filter(item => item.testType === 'Kids Zone' || (item.testType === 'Quiz' && item.category === 'Fun Quizzes'));
      
      const formattedContent = kidsContent.map((c: any) => {
            let pubDate = 'N/A';
            const dateField = c.createdAt;
            if (dateField && typeof dateField.toDate === 'function') {
                pubDate = dateField.toDate().toLocaleDateString();
            } else if (dateField) {
                try {
                    const d = new Date(dateField);
                    if (!isNaN(d.getTime())) {
                        pubDate = d.toLocaleDateString();
                    }
                } catch(e) {}
            }
            return {
                ...c,
                createdAt: pubDate
            } as KidsContent;
        });

      setContent(formattedContent);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching Kids Zone content",
        description: (error as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [toast]);

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
        await deleteContent(itemToDelete.id);
        toast({
            title: "Content Deleted",
            description: `"${itemToDelete.title}" has been deleted.`,
        });
        fetchContent();
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Error deleting content',
            description: (error as Error).message,
        });
    } finally {
        setItemToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
            <div>
                <h1 className="font-headline text-3xl font-bold">Manage Kids Zone</h1>
                <p className="text-muted-foreground">View, edit, and delete content for the Kids Zone.</p>
            </div>
            <Button asChild>
                <Link href="/admin/kids-zone/add">
                    <PlusCircle className="mr-2" /> Add New Content
                </Link>
            </Button>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>All Kids Zone Content</CardTitle>
          <CardDescription>
            A list of all games, quizzes, and activities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="hidden md:table-cell">Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-full ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : content.length > 0 ? (
                content.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell><Badge variant="outline">{item.category}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell">{item.createdAt}</TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem asChild><Link href={`/admin/kids-zone/edit/${item.id}`}><Pencil className="mr-2 h-4 w-4"/>Edit</Link></DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive" onClick={() => setItemToDelete(item)}>
                                <Trash2 className="mr-2 h-4 w-4"/>Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    No Kids Zone content found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
       <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete "{itemToDelete?.title}".</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
