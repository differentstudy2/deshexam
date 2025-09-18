
'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { getAllContent, deleteContent, getContentTypes, getSubjects } from '@/lib/firebase/firestore';
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
import { MoreHorizontal, Pencil, Trash2, Eye, Loader2, Search, Filter } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContentBadge } from '@/components/content-badge';


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
type Subject = { id: string, name: string };

function getUrlForTest(testType: string, testId: string) {
    const typeSlug = testType.toLowerCase().replace(/\s+/g, '-');
    return `/${typeSlug}/${testId}`;
}

const ContentTable = ({ 
    content, 
    loading, 
    openDeleteDialog,
    selectedContent,
    onSelect,
    onSelectAll,
    isAllSelected
}: { 
    content: Content[], 
    loading: boolean, 
    openDeleteDialog: (item: Content) => void,
    selectedContent: string[],
    onSelect: (id: string) => void,
    onSelectAll: (checked: boolean) => void,
    isAllSelected: boolean
}) => (
    <div className="overflow-x-auto">
        <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-12">
                    <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={(checked) => onSelectAll(Boolean(checked))}
                        aria-label="Select all"
                    />
                </TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Author</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead className="hidden md:table-cell">Access</TableHead>
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
                        <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                    </TableRow>
                ))
                ) : content.length > 0 ? (
                content.map((item) => (
                    <TableRow key={item.id} data-state={selectedContent.includes(item.id) && "selected"}>
                     <TableCell>
                        <Checkbox
                            checked={selectedContent.includes(item.id)}
                            onCheckedChange={() => onSelect(item.id)}
                            aria-label={`Select ${item.title}`}
                        />
                      </TableCell>
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
                     <TableCell className="hidden md:table-cell">
                        <ContentBadge type={item.access} />
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
                    <TableCell colSpan={7} className="text-center h-24">
                    No content found matching your criteria.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
        </Table>
    </div>
);

export default function ManageContentPage() {
  const { toast } = useToast();
  const [allContent, setAllContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<Content | null>(null);
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [accessFilter, setAccessFilter] = useState('all');
  const [selectedContent, setSelectedContent] = useState<string[]>([]);

  const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [content, types, subjectData] = await Promise.all([
          getAllContent(),
          getContentTypes(),
          getSubjects(),
        ]);
        
        const formattedContent = content.map(c => ({
            ...c,
            createdAt: c.createdAt ? new Date(c.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'
        })) as Content[];

        setAllContent(formattedContent);
        setContentTypes([{ id: 'all', name: 'All'}, ...types]);
        setSubjects(subjectData);
      } catch (error) {
         toast({
          variant: "destructive",
          title: 'Error fetching data',
          description: (error as Error).message,
        });
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    fetchInitialData();
  }, [toast]);

  const filteredContent = useMemo(() => {
    return allContent.filter(item => {
        const matchesTab = activeTab === 'All' || item.testType === activeTab;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSubject = subjectFilter === 'all' || item.subject === subjectFilter;
        const matchesAccess = accessFilter === 'all' || item.access === accessFilter;
        return matchesTab && matchesSearch && matchesSubject && matchesAccess;
    });
  }, [allContent, activeTab, searchQuery, subjectFilter, accessFilter]);


  const openDeleteDialog = (item: Content | null) => {
    setContentToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleSelectContent = (id: string) => {
    setSelectedContent(prev => prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]);
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
        setSelectedContent(filteredContent.map(c => c.id));
    } else {
        setSelectedContent([]);
    }
  }

  const isAllSelected = selectedContent.length > 0 && selectedContent.length === filteredContent.length;

  const handleDelete = async () => {
    const idsToDelete = contentToDelete ? [contentToDelete.id] : selectedContent;
    if (idsToDelete.length === 0) return;

    try {
      await Promise.all(idsToDelete.map(id => deleteContent(id)));
      setAllContent(allContent.filter(item => !idsToDelete.includes(item.id)));
      toast({
        title: "Content Deleted",
        description: `${idsToDelete.length} item(s) have been deleted.`,
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
        setSelectedContent([]);
    }
  };

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
           <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search by title..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                 <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by subject" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Subjects</SelectItem>
                        {subjects.map(sub => <SelectItem key={sub.id} value={sub.name}>{sub.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                 <Select value={accessFilter} onValueChange={setAccessFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by access" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Access</SelectItem>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                    </SelectContent>
                </Select>
                 {selectedContent.length > 0 && (
                    <Button variant="destructive" className="w-full sm:w-auto" onClick={() => openDeleteDialog(null)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete ({selectedContent.length})
                    </Button>
                 )}
            </div>
           {loading ? (
             <div className="flex items-center justify-center min-h-[200px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
             </div>
           ) : (
            <Tabs defaultValue="All" onValueChange={setActiveTab}>
                 <TabsList className="flex-wrap h-auto">
                    {contentTypes.map(type => (
                        <TabsTrigger key={type.id} value={type.name}>{type.name}</TabsTrigger>
                    ))}
                </TabsList>
                {contentTypes.map(type => (
                    <TabsContent key={type.id} value={type.name}>
                        <ContentTable 
                            content={filteredContent}
                            loading={loading}
                            openDeleteDialog={openDeleteDialog}
                            selectedContent={selectedContent}
                            onSelect={handleSelectContent}
                            onSelectAll={handleSelectAll}
                            isAllSelected={isAllSelected}
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
              This action cannot be undone. This will permanently delete {" "}
              {contentToDelete ? `"${contentToDelete.title}"` : `${selectedContent.length} item(s)`}.
            </AlertDialogDescription>
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
