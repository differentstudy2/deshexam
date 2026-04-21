
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  getKidsZoneCategories,
  addKidsZoneCategory,
  updateKidsZoneCategory,
  deleteKidsZoneCategory,
  deleteContent,
} from '@/lib/firebase/firestore';
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
    DialogClose,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash2, PlusCircle, Search, Edit, Eye, Loader2, ToyBrick } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type KidsContent = {
    id: string;
    title: string;
    category: string;
    createdAt: any;
    testType?: string;
}

type KidsZoneCategory = {
    id: string;
    title: string;
    description: string;
    icon: string;
};

export default function ManageKidsContentPage() {
  const { toast } = useToast();
  const [content, setContent] = useState<KidsContent[]>([]);
  const [dynamicCategories, setDynamicCategories] = useState<KidsZoneCategory[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [itemToDelete, setItemToDelete] = useState<KidsContent | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<KidsZoneCategory | null>(null);
  
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<KidsZoneCategory | null>(null);
  const [categoryData, setCategoryData] = useState({ title: '', description: '', icon: 'ToyBrick' });
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);

  const staticCategories = ["Fun Quizzes", "Learning Games", "Learning English", "Learning Bengali", "Learning Hindi", "Learning Urdu"];
  const allCategoriesForTabs = useMemo(() => ['All', ...staticCategories, ...dynamicCategories.map(c => c.title)], [dynamicCategories]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "kidsZoneCategories"), (snapshot) => {
        const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as KidsZoneCategory));
        setDynamicCategories(fetched);
        setLoadingCategories(false);
    }, (error) => {
        toast({ variant: 'destructive', title: 'Error fetching categories' });
        setLoadingCategories(false);
    });
    return () => unsubscribe();
  }, [toast]);
  
  useEffect(() => {
    setLoadingContent(true);
    let q;
    const contentRef = collection(db, "content");
    if (activeTab === 'All') {
        q = query(contentRef, where("category", "in", allCategoriesForTabs.filter(c => c !== 'All')));
    } else {
        q = query(contentRef, where("category", "==", activeTab));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedContent = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString() : 'N/A'
            } as KidsContent;
        });
        setContent(fetchedContent);
        setLoadingContent(false);
    }, (error) => {
        console.error("Error fetching content:", error);
        toast({ variant: "destructive", title: "Error fetching content." });
        setLoadingContent(false);
    });

    return () => unsubscribe();
}, [activeTab, toast, allCategoriesForTabs]);


  const filteredContent = useMemo(() => {
    return content.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [content, searchQuery]);


  const handleDeleteContent = async () => {
    if (!itemToDelete) return;
    try {
        await deleteContent(itemToDelete.id);
        toast({
            title: "Content Deleted",
            description: `"${itemToDelete.title}" has been deleted.`,
        });
        // State will update via real-time listener
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
  
    const handleOpenCategoryDialog = (category: KidsZoneCategory | null) => {
        setEditingCategory(category);
        if (category) {
            setCategoryData({ title: category.title, description: category.description, icon: category.icon });
        } else {
            setCategoryData({ title: '', description: '', icon: 'ToyBrick' });
        }
        setIsCategoryDialogOpen(true);
    };

    const handleCategorySubmit = async () => {
        if (!categoryData.title.trim() || !categoryData.description.trim()) {
            toast({ variant: 'destructive', title: 'Title and description are required.' });
            return;
        }
        setIsSubmittingCategory(true);
        try {
            if (editingCategory) {
                await updateKidsZoneCategory(editingCategory.id, categoryData);
                toast({ title: 'Category updated!' });
            } else {
                await addKidsZoneCategory(categoryData);
                toast({ title: 'Category added!' });
            }
            setIsCategoryDialogOpen(false);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Failed to save category', description: (error as Error).message });
        } finally {
            setIsSubmittingCategory(false);
        }
    };
    
    const handleDeleteCategory = async () => {
        if (!categoryToDelete) return;
        try {
            await deleteKidsZoneCategory(categoryToDelete.id);
            toast({ title: 'Category Deleted' });
            if(activeTab === categoryToDelete.title) {
                setActiveTab('All');
            }
        } catch (error) {
             toast({ variant: 'destructive', title: 'Error deleting category', description: (error as Error).message });
        } finally {
            setCategoryToDelete(null);
        }
    };
    
  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
            <div>
                <h1 className="font-headline text-3xl font-bold">Manage Kids Zone</h1>
                <p className="text-muted-foreground">View, edit, and delete content for the Kids Zone.</p>
            </div>
             <div className="flex gap-2">
                <Button onClick={() => handleOpenCategoryDialog(null)}><PlusCircle className="mr-2"/> Add Category</Button>
                <Button asChild>
                    <Link href="/admin/kids-zone/add">
                        <PlusCircle className="mr-2" /> Add New Content
                    </Link>
                </Button>
            </div>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>All Kids Zone Content</CardTitle>
           <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by title..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex-wrap h-auto justify-start">
              {allCategoriesForTabs.map(category => {
                  const isDynamic = !staticCategories.includes(category) && category !== 'All';
                  const dynamicCategory = isDynamic ? dynamicCategories.find(c => c.title === category) : null;
                  return (
                    <div key={category} className="relative group">
                       <TabsTrigger value={category} className={cn("pr-2", isDynamic && "pr-8")}>{category}</TabsTrigger>
                        {isDynamic && dynamicCategory && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="absolute top-1/2 right-0 -translate-y-1/2 h-6 w-6">
                                        <MoreHorizontal className="h-4 w-4"/>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => handleOpenCategoryDialog(dynamicCategory)}>
                                        <Edit className="mr-2 h-4 w-4"/> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setCategoryToDelete(dynamicCategory)} className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4"/> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                  )
              })}
            </TabsList>
            <TabsContent value={activeTab} className="mt-4">
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
                    {loadingContent ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-full ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredContent.length > 0 ? (
                      filteredContent.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.title}</TableCell>
                          <TableCell><Badge variant="outline">{item.category}</Badge></TableCell>
                          <TableCell className="hidden md:table-cell">{item.createdAt}</TableCell>
                          <TableCell className="text-right">
                             <DropdownMenu>
                                  <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                      <DropdownMenuItem asChild>
                                          <Link href={`/kids-zone/fun-quizzes/${item.id}`}><Eye className="mr-2 h-4 w-4"/>View</Link>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem asChild>
                                          <Link href={`/admin/kids-zone/edit/${item.id}`}><Pencil className="mr-2 h-4 w-4"/>Edit</Link>
                                      </DropdownMenuItem>
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
                          No content found for this category.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
       <AlertDialog open={!!contentToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete "{contentToDelete?.title}".</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteContent} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                  <div className="space-y-2">
                      <Label htmlFor="new-cat-title">Title</Label>
                      <Input id="new-cat-title" value={categoryData.title} onChange={(e) => setCategoryData(prev => ({...prev, title: e.target.value}))} />
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="new-cat-desc">Description</Label>
                      <Textarea id="new-cat-desc" value={categoryData.description} onChange={(e) => setCategoryData(prev => ({...prev, description: e.target.value}))} />
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="new-cat-icon">Icon</Label>
                      <Select value={categoryData.icon} onValueChange={(val) => setCategoryData(prev => ({...prev, icon: val}))}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Puzzle">Puzzle</SelectItem>
                            <SelectItem value="Gamepad2">Gamepad</SelectItem>
                            <SelectItem value="BookHeart">BookHeart</SelectItem>
                            <SelectItem value="BookOpen">BookOpen</SelectItem>
                            <SelectItem value="Languages">Languages</SelectItem>
                            <SelectItem value="Book">Book</SelectItem>
                            <SelectItem value="ToyBrick">ToyBrick (Default)</SelectItem>
                        </SelectContent>
                      </Select>
                  </div>
              </div>
              <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsCategoryDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleCategorySubmit} disabled={isSubmittingCategory}>
                    {isSubmittingCategory ? <Loader2 className="animate-spin" /> : 'Save Category'}
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
      
       <AlertDialog open={!!categoryToDelete} onOpenChange={() => setCategoryToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the category "{categoryToDelete?.title}". Content in this category will not be deleted but will become uncategorized. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteCategory} className="bg-destructive hover:bg-destructive/90">Delete Category</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
