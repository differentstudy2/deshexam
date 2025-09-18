
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllContent, deleteContent, getContentTypes } from '@/lib/firebase/firestore';
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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


type Content = {
    id: string;
    title: string;
    subject: string;
    testType: string;
    access: 'free' | 'premium' | 'pro';
    createdAt: string;
    authorId: string;
    authorName: string;
}

type ContentType = { id: string, name: string };

function getUrlForTest(testType: string, testId: string) {
    const typeSlug = testType.toLowerCase().replace(/\s+/g, '-');
    return `/${typeSlug}/${testId}`;
}

const ContentTable = ({ 
    content, 
    loading, 
    openDeleteDialog 
}: { 
    content: Content[], 
    loading: boolean, 
    openDeleteDialog: (item: Content) => void 
}) => (
    <Table>
        <TableHeader>
            <TableRow>
            <TableHead>Title</TableHead>
            <TableHead className="hidden md:table-cell">Author</TableHead>
            <TableHead className="hidden md:table-cell">Type</TableHead>
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
                    <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                </TableRow>
            ))
            ) : content.length > 0 ? (
            content.map((item) => (
                <TableRow key={item.id}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                            <AvatarImage src={`https://picsum.photos/seed/${item.authorId}/24/24`} />
                            <AvatarFallback>{item.authorName?.[0]}</AvatarFallback>
                        </Avatar>
                        <span>{item.authorName}</span>
                    </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                    <Badge variant="secondary">{item.testType}</Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell">{item.createdAt}</TableCell>
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
                            <Link href={getUrlForTest(item.testType, item.id)}><Eye className="mr-2 h-4 w-4"/>View</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                        <Link href={`/dashboard/edit-content/${item.id}`}><Pencil className="mr-2 h-4 w-4"/>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => openDeleteDialog(item)}>
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
                No content of this type found.
                </TableCell>
            </TableRow>
            )}
        </TableBody>
    </Table>
);

export default function ManageContentPage() {
  const { toast } = useToast();
  const [allContent, setAllContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<Content | null>(null);
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
        try {
          setLoading(true);
          const [content, types] = await Promise.all([
            getAllContent(),
            getContentTypes()
          ]);
          
          const formattedContent = content.map(c => ({
              ...c,
              createdAt: c.createdAt ? new Date(c.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'
          })) as Content[];

          setAllContent(formattedContent);
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
    };

    fetchInitialData();
  }, [toast]);

  const openDeleteDialog = (item: Content) => {
    setContentToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!contentToDelete) return;
    try {
      await deleteContent(contentToDelete.id);
      setAllContent(allContent.filter(item => item.id !== contentToDelete.id));
      toast({
        title: "Content Deleted",
        description: `"${contentToDelete.title}" has been deleted.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: 'Error deleting content',
        description: (error as Error).message,
      });
    } finally {
        setIsDeleteDialogOpen(false);
        setContentToDelete(null);
    }
  };
  
  const getFilteredContent = (type: string) => {
      if(type === 'All') return allContent;
      return allContent.filter(item => item.testType === type);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Manage Content</h1>
        <p className="text-muted-foreground">
          View and manage all content across the platform.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Content</CardTitle>
          <CardDescription>
            A list of all content in your application.
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
                            content={getFilteredContent(type.name)} 
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
              "{contentToDelete?.title}".
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
