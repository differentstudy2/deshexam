
'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { getAllContent, deleteContent, getContentTypes, getSubjects, updateContent, getBoards, getChaptersBySubjectId, getExamsByCategory, getExamTypes, getAllQuestions, deleteQuestion, addQuestion, updateQuestion } from '@/lib/firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { MoreHorizontal, Pencil, Trash2, Eye, Loader2, Search, Filter, Sparkles, Upload, FilePlus, BookPlus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContentBadge } from '@/components/content-badge';
import { format } from 'date-fns';
import { DocumentSnapshot } from 'firebase/firestore';


type Content = {
    id: string;
    title: string;
    subject: string;
    testType: string | string[];
    access: 'free' | 'premium' | 'pro';
    publishedAt: string;
    authorId: string;
    authorName: string;
    board: string;
    examCategory: string;
    exam: string;
    chapter: string;
}

type ContentType = { id: string, name: string };
type Subject = { id: string, name: string };
type Board = { id: string, name: string };
type ExamType = { id: string, name: string };
type Exam = { id: string, name: string };
type Chapter = { id: string, chapterNo: string, chapterName: string };

type BulkAction = 
    | { type: 'delete' } 
    | { type: 'access', value: 'free' | 'premium' | 'pro' }
    | { type: 'board', value: string }
    | { type: 'subject', value: string }
    | { type: 'chapter', value: string }
    | { type: 'examCategory', value: string }
    | { type: 'exam', value: string }
    | null;

function getUrlForTest(testType: string | string[], testId: string) {
    const primaryType = Array.isArray(testType) ? testType[0] : testType;
    const typeSlug = (primaryType || 'content').toLowerCase().replace(/\s+/g, '-');
    return `/${typeSlug}/${testId}`;
}

const PaginationControls = ({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (page: number) => void }) => {
    if (totalPages <= 1) return null;
    return (
        <div className="flex items-center justify-end space-x-2 py-4">
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                Previous
            </Button>
             <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
            </span>
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                Next
            </Button>
        </div>
    );
};

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
}) => {
    const getEditUrl = (item: Content) => {
        if (Array.isArray(item.testType) ? item.testType.includes('Learn') : item.testType === 'Learn') {
            return `/admin/edit-article/${item.id}`;
        }
        return `/admin/edit-content/${item.id}`;
    }

    return (
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
                    <TableHead className="hidden lg:table-cell">Published At</TableHead>
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
                            {Array.isArray(item.testType) ? (
                                <div className="flex flex-wrap gap-1">
                                    {item.testType.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
                                </div>
                            ) : (
                                <Badge variant="secondary">{item.testType}</Badge>
                            )}
                        </TableCell>
                         <TableCell className="hidden md:table-cell">
                            <ContentBadge type={item.access} />
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">{item.publishedAt}</TableCell>
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
                                <Link href={getEditUrl(item)}><Pencil className="mr-2 h-4 w-4"/>Edit</Link>
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
};

const ITEMS_PER_PAGE = 10;

export default function ManageContentPage() {
  const { toast } = useToast();
  const [allContent, setAllContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isAddToContentDialogOpen, setIsAddToContentDialogOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<Content | null>(null);
  const [bulkAction, setBulkAction] = useState<BulkAction>(null);
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [accessFilter, setAccessFilter] = useState('all');
  const [selectedContent, setSelectedContent] = useState<string[]>([]);
  
  const [contentCurrentPage, setContentCurrentPage] = useState(1);

  const allTabs = useMemo(() => {
    return [{ id: 'all', name: 'All' }, ...contentTypes];
  }, [contentTypes]);

  const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [content, types, subjectData, boardData, examTypeData] = await Promise.all([
          getAllContent(),
          getContentTypes(),
          getSubjects(),
          getBoards(),
          getExamTypes(),
        ]);
        
        setAllContent(content as Content[]);
        setContentTypes(types);
        setSubjects(subjectData);
        setBoards(boardData);
        setExamTypes(examTypeData);

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
  
  useEffect(() => {
    const fetchDependentData = async () => {
        if (subjects.length > 0) {
            const allChapters = await Promise.all(subjects.map(s => getChaptersBySubjectId(s.id)));
            setChapters(allChapters.flat());
        }
        if (examTypes.length > 0) {
            const allExams = await Promise.all(examTypes.map(e => getExamsByCategory(e.id)));
            setExams(allExams.flat());
        }
    };
    if (subjects.length > 0 && examTypes.length > 0) {
        fetchDependentData();
    }
  }, [subjects, examTypes]);

  const filteredContent = useMemo(() => {
    return allContent.filter(item => {
        const matchesTab = activeTab === 'All' || (Array.isArray(item.testType) ? item.testType.includes(activeTab) : item.testType === activeTab);
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSubject = subjectFilter === 'all' || item.subject === subjectFilter;
        const matchesAccess = accessFilter === 'all' || item.access === accessFilter;
        return matchesTab && matchesSearch && matchesSubject && matchesAccess;
    });
  }, [allContent, activeTab, searchQuery, subjectFilter, accessFilter]);

  const paginatedContent = useMemo(() => {
      const startIndex = (contentCurrentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      return filteredContent.slice(startIndex, endIndex);
  }, [filteredContent, contentCurrentPage]);
  
  const totalContentPages = Math.ceil(filteredContent.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setContentCurrentPage(1);
  }, [searchQuery, activeTab, subjectFilter, accessFilter]);

  const openDeleteDialog = (item: Content) => {
    setContentToDelete(item);
    setIsAlertDialogOpen(true);
  };
  
  const openBulkActionDialog = (action: BulkAction) => {
    setBulkAction(action);
    setIsAlertDialogOpen(true);
  }

  const handleSelectContent = (id: string) => {
    setSelectedContent(prev => prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]);
  }

  const handleSelectAllContent = (checked: boolean) => {
    if (checked) {
        setSelectedContent(filteredContent.map(c => c.id));
    } else {
        setSelectedContent([]);
    }
  }

  const isAllContentSelected = selectedContent.length > 0 && selectedContent.length === filteredContent.length;

  const handleConfirmAction = async () => {
    if(contentToDelete) { // Single content delete
        await handleDeleteContent([contentToDelete.id]);
    } else if (bulkAction) { // Bulk actions
        if (bulkAction.type === 'delete') {
            await handleDeleteContent(selectedContent);
        } else if (bulkAction.type === 'access') {
            await handleBulkUpdate({ access: bulkAction.value });
        } else if (bulkAction.type === 'board') {
            await handleBulkUpdate({ board: bulkAction.value });
        } else if (bulkAction.type === 'subject') {
            await handleBulkUpdate({ subject: bulkAction.value });
        } else if (bulkAction.type === 'chapter') {
            await handleBulkUpdate({ chapter: bulkAction.value });
        } else if (bulkAction.type === 'examCategory') {
            await handleBulkUpdate({ examCategory: bulkAction.value });
        } else if (bulkAction.type === 'exam') {
            await handleBulkUpdate({ exam: bulkAction.value });
        }
    }
    
    setIsAlertDialogOpen(false);
    setContentToDelete(null);
    setBulkAction(null);
    setSelectedContent([]);
  };

  const handleDeleteContent = async (ids: string[]) => {
    try {
      await Promise.all(ids.map(id => deleteContent(id)));
      setAllContent(allContent.filter(item => !ids.includes(item.id)));
      toast({
        title: "Content Deleted",
        description: `${ids.length} item(s) have been deleted.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: 'Error deleting content',
        description: (error as Error).message,
      });
    }
  };

  const handleBulkUpdate = async (updateData: { [key: string]: any }) => {
    try {
        await Promise.all(selectedContent.map(id => updateContent(id, updateData)));
        
        setAllContent(allContent.map(item => 
            selectedContent.includes(item.id) ? { ...item, ...updateData } : item
        ));
        
        toast({
            title: 'Bulk Update Successful',
            description: `Updated ${selectedContent.length} items.`,
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: 'Bulk update failed',
            description: (error as Error).message,
        });
    }
  }

  const getAlertDialogDescription = () => {
      if (contentToDelete) {
          return `This action cannot be undone. This will permanently delete "${contentToDelete.title}".`;
      }
      if (bulkAction) {
          const actionTextMap: { [key: string]: string } = {
            'delete': `This will permanently delete ${selectedContent.length} item(s).`,
            'access': `This will change the access level for ${selectedContent.length} item(s) to "${(bulkAction as any).value}".`,
            'board': `This will change the board for ${selectedContent.length} item(s) to "${boards.find(b => b.name === (bulkAction as any).value)?.name || (bulkAction as any).value}".`,
            'subject': `This will change the subject for ${selectedContent.length} item(s) to "${subjects.find(s => s.name === (bulkAction as any).value)?.name || (bulkAction as any).value}".`,
            'chapter': `This will change the chapter for ${selectedContent.length} item(s) to "${(bulkAction as any).value}".`,
            'examCategory': `This will change the exam category for ${selectedContent.length} item(s) to "${examTypes.find(e => e.name === (bulkAction as any).value)?.name || (bulkAction as any).value}".`,
            'exam': `This will change the exam for ${selectedContent.length} item(s) to "${exams.find(e => e.name === (bulkAction as any).value)?.name || (bulkAction as any).value}".`,
          }
          if (bulkAction.type in actionTextMap) {
            return actionTextMap[bulkAction.type];
          }
      }
      return 'This action cannot be undone.';
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="font-headline text-3xl font-bold">Manage Content</h1>
            <p className="text-muted-foreground">
            View and manage all content across the platform.
            </p>
        </div>
         <div className="flex gap-2 w-full sm:w-auto">
            <Button asChild variant="outline" className="w-full">
                <Link href="/admin/add-article"><BookPlus className="mr-2"/>Add Article</Link>
            </Button>
            <Button asChild className="w-full">
                <Link href="/admin/add-content"><FilePlus className="mr-2"/>Add Quiz/Test</Link>
            </Button>
        </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by subject" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Subjects</SelectItem>
                            {subjects.map(sub => <SelectItem key={sub.id} value={sub.name}>{sub.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={accessFilter} onValueChange={setAccessFilter}>
                        <SelectTrigger>
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
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full">
                                    Bulk Actions ({selectedContent.length}) <Filter className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel>Modify Selected</DropdownMenuLabel>
                                 <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>Change Board</DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent>
                                        {boards.map(b => (
                                            <DropdownMenuItem key={b.id} onClick={() => openBulkActionDialog({ type: 'board', value: b.name })}>{b.name}</DropdownMenuItem>
                                        ))}
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>
                                 <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>Change Subject</DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent>
                                        {subjects.map(s => (
                                            <DropdownMenuItem key={s.id} onClick={() => openBulkActionDialog({ type: 'subject', value: s.name })}>{s.name}</DropdownMenuItem>
                                        ))}
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>Change Chapter</DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent>
                                         {chapters.map(c => (
                                            <DropdownMenuItem key={c.id} onClick={() => openBulkActionDialog({ type: 'chapter', value: `${c.chapterNo}. ${c.chapterName}` })}>{c.chapterNo}. {c.chapterName}</DropdownMenuItem>
                                        ))}
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>
                                 <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>Change Exam Category</DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent>
                                        {examTypes.map(et => (
                                            <DropdownMenuItem key={et.id} onClick={() => openBulkActionDialog({ type: 'examCategory', value: et.name })}>{et.name}</DropdownMenuItem>
                                        ))}
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>
                                 <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>Change Exam</DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent>
                                        {exams.map(e => (
                                            <DropdownMenuItem key={e.id} onClick={() => openBulkActionDialog({ type: 'exam', value: e.name })}>{e.name}</DropdownMenuItem>
                                        ))}
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>Change Access Level</DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent>
                                        <DropdownMenuItem onClick={() => openBulkActionDialog({ type: 'access', value: 'free' })}>Free</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => openBulkActionDialog({ type: 'access', value: 'premium' })}>Premium</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => openBulkActionDialog({ type: 'access', value: 'pro' })}>Pro</DropdownMenuItem>
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive" onClick={() => openBulkActionDialog({ type: 'delete' })}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Selected
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                     )}
                </div>
            </div>
           {loading ? (
             <div className="flex items-center justify-center min-h-[200px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
             </div>
           ) : (
            <Tabs defaultValue="All" onValueChange={setActiveTab}>
                 <TabsList className="flex-wrap h-auto justify-start">
                    {allTabs.map(type => (
                        <TabsTrigger key={type.id} value={type.name}>{type.name}</TabsTrigger>
                    ))}
                </TabsList>
                {allTabs.map(type => (
                    <TabsContent key={type.id} value={type.name}>
                       <ContentTable 
                            content={paginatedContent.filter(c => activeTab === 'All' || (Array.isArray(c.testType) ? c.testType.includes(activeTab) : c.testType === type.name))}
                            loading={loading}
                            openDeleteDialog={openDeleteDialog}
                            selectedContent={selectedContent}
                            onSelect={handleSelectContent}
                            onSelectAll={handleSelectAllContent}
                            isAllSelected={isAllContentSelected}
                        />
                         <PaginationControls 
                            currentPage={contentCurrentPage} 
                            totalPages={totalContentPages} 
                            onPageChange={setContentCurrentPage} 
                        />
                    </TabsContent>
                ))}
            </Tabs>
           )}
        </CardContent>
      </Card>
      
      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {getAlertDialogDescription()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setContentToDelete(null); setBulkAction(null); }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction} className="bg-destructive hover:bg-destructive/90">Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
