
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getAllContent, deleteContent, addContent, updateContent, getTextbookById } from '@/lib/firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
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
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
    DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, PlusCircle, ArrowLeft, Edit, Trash2, FileQuestion, Sparkles, LayoutGrid, List, MoreHorizontal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ContentBadge } from '@/components/content-badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ImageUploader } from '@/components/feature/image-uploader';
import Image from 'next/image';
import type { Textbook } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';


type PracticeSet = {
    id: string;
    title: string;
    subtitle?: string;
    subject: string;
    testType: string;
    access: 'free' | 'premium' | 'pro';
    createdAt: string;
    textbookId?: string;
    difficulty?: ('Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Expert')[];
    questionSource?: ('Random from Chapter' | 'Random from Topic' | 'Textbook Exercise' | 'Solved Examples' | 'Previous Year Questions')[];
    questions?: any[];
    featureImage?: string;
}

const difficultyOptions = ['Beginner', 'Easy', 'Medium', 'Hard', 'Expert'];
const questionSourceOptions = ['Random from Chapter', 'Random from Topic', 'Textbook Exercise', 'Solved Examples', 'Previous Year Questions'];


function getUrlForPracticeSet(bookId: string, practiceSetId: string) {
    return `/textbook-solutions/${bookId}/practice-set/${practiceSetId}`;
}

export default function ManageTextbookPracticeSetsPage() {
    const params = useParams();
    const textbookId = params.bookId as string;
    const { toast } = useToast();

    const [practiceSets, setPracticeSets] = useState<PracticeSet[]>([]);
    const [loading, setLoading] = useState(true);
    const [itemToDelete, setItemToDelete] = useState<PracticeSet | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<PracticeSet | null>(null);
    const [itemData, setItemData] = useState<{title: string, subtitle: string, difficulty: string[], questionSource: string[], featureImage?: string, access: 'free' | 'premium' | 'pro'}>({
        title: '',
        subtitle: '',
        difficulty: ['Medium'],
        questionSource: ['Random from Chapter'],
        featureImage: '',
        access: 'free',
    });
    const [textbook, setTextbook] = useState<Textbook | null>(null);
    const [view, setView] = useState<'grid' | 'list'>('grid');


    const fetchPracticeSets = async () => {
        if (!textbookId) return;
        setLoading(true);
        try {
             const [textbookData, allPracticeSets] = await Promise.all([
                getTextbookById(textbookId),
                getAllContent('Practice Set'),
            ]);
            setTextbook(textbookData as Textbook);
            const textbookPracticeSets = (allPracticeSets as PracticeSet[]).filter(ps => ps.textbookId === textbookId && !ps.chapterId && !ps.topicId);
            setPracticeSets(textbookPracticeSets);
        } catch (error) {
             toast({
                variant: "destructive",
                title: 'Error fetching practice sets',
                description: (error as Error).message,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPracticeSets();
    }, [textbookId, toast]);

    const handleDelete = async () => {
        if (!itemToDelete) return;
        try {
            await deleteContent(itemToDelete.id);
            toast({
                title: 'Practice Set Deleted',
                description: `"${itemToDelete.title}" has been successfully deleted.`,
            });
            setPracticeSets(practiceSets.filter(ps => ps.id !== itemToDelete.id));
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error Deleting Item',
                description: (error as Error).message,
            });
        } finally {
            setItemToDelete(null);
        }
    };
    
    const handleOpenDialog = (item: PracticeSet | null) => {
        setEditingItem(item);
        const difficultyArray = (item?.difficulty && Array.isArray(item.difficulty) ? item.difficulty : ['Medium']) as any[];
        const sourceArray = (item?.questionSource && Array.isArray(item.questionSource) ? item.questionSource : ['Random from Chapter']) as any[];
        const subtitle = item ? item.subtitle || `Practice Set ${practiceSets.findIndex(t => t.id === item.id) + 1}` : `Practice Set ${practiceSets.length + 1}`;
        setItemData(item ? { title: item.title, subtitle, difficulty: difficultyArray, questionSource: sourceArray, featureImage: item.featureImage || '', access: item.access || 'free' } : { title: '', subtitle, difficulty: ['Medium'], questionSource: ['Random from Chapter'], featureImage: '', access: 'free' });
        setIsDialogOpen(true);
    };

    const handleAddOrUpdate = async () => {
        if (!itemData.title.trim()) {
            toast({ variant: 'destructive', title: 'Title is required.' });
            return;
        }

        const contentToSave: any = { 
            ...itemData, 
            testType: 'Practice Set',
            textbookId: textbookId,
            questions: editingItem?.questions || [],
        };
        
        try {
            if (editingItem) {
                await updateContent(editingItem.id, contentToSave);
                toast({ title: 'Practice Set Updated' });
            } else {
                await addContent(contentToSave);
                toast({ title: 'Practice Set Added' });
            }
            setIsDialogOpen(false);
            setEditingItem(null);
            fetchPracticeSets();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error saving practice set', description: (error as Error).message });
        }
    };
    
    const generateTitle = (template: string) => {
        const title = template
            .replace('[Subject]', textbook?.subject || '')
            .replace('[Textbook Title]', textbook?.title || '');
        setItemData(prev => ({ ...prev, title }));
    };


    return (
        <div className="space-y-6">
            <div>
                <Button asChild variant="ghost">
                    <Link href={`/admin/textbooks/${textbookId}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Textbook
                    </Link>
                </Button>
            </div>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-headline text-3xl font-bold">Manage Practice Sets</h1>
                    <p className="text-muted-foreground">
                        Practice sets associated with this textbook.
                    </p>
                </div>
                 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => handleOpenDialog(null)}>
                            <PlusCircle className="mr-2" />
                            Add New Practice Set
                        </Button>
                    </DialogTrigger>
                     <DialogContent className="max-h-[90vh]">
                        <DialogHeader>
                            <DialogTitle>{editingItem ? 'Edit Practice Set' : 'Add New Practice Set'}</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="max-h-[70vh] p-1">
                             <div className="space-y-4 py-4 pr-6">
                                 <div className="space-y-2">
                                    <Label>Feature Image</Label>
                                    <ImageUploader
                                        fieldName="featureImage"
                                        onUrlChange={(url) => setItemData(p => ({ ...p, featureImage: url }))}
                                        value={itemData.featureImage}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ps-subtitle">Subtitle</Label>
                                    <Input id="ps-subtitle" value={itemData.subtitle} onChange={e => setItemData(p => ({...p, subtitle: e.target.value}))} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ps-title">Title</Label>
                                    <div className="flex gap-2">
                                        <Input id="ps-title" value={itemData.title} onChange={e => setItemData(p => ({...p, title: e.target.value}))} />
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="icon"><Sparkles className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>SEO Title Suggestions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onSelect={() => generateTitle('[Subject] Full Syllabus Practice')}>[Subject] Full Syllabus Practice</DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => generateTitle('[Textbook Title] - Practice Set')}>[Textbook Title] - Practice Set</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                                 <div className="space-y-2">
                                    <Label>Access Level</Label>
                                    <Select value={itemData.access} onValueChange={(value) => setItemData(prev => ({ ...prev, access: value as 'free' | 'premium' | 'pro' }))}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="free">Free</SelectItem>
                                            <SelectItem value="premium">Premium (Paid)</SelectItem>
                                            <SelectItem value="pro">Pro (Subscription)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Difficulty</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {difficultyOptions.map(option => (
                                            <div key={option} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`diff-${option}`}
                                                    checked={itemData.difficulty.includes(option)}
                                                    onCheckedChange={(checked) => {
                                                        const currentDifficulties = itemData.difficulty;
                                                        const newDifficulties = checked
                                                            ? [...currentDifficulties, option]
                                                            : currentDifficulties.filter(d => d !== option);
                                                        setItemData(prev => ({...prev, difficulty: newDifficulties as any[] }));
                                                    }}
                                                />
                                                <label htmlFor={`diff-${option}`} className="text-sm font-medium leading-none">{option}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                 <div className="space-y-2">
                                    <Label>Question Source</Label>
                                     <div className="grid grid-cols-2 gap-2">
                                        {questionSourceOptions.map(option => (
                                             <div key={option} className="flex items-center space-x-2">
                                                 <Checkbox
                                                    id={`source-${option}`}
                                                    checked={itemData.questionSource.includes(option)}
                                                    onCheckedChange={(checked) => {
                                                        const currentSources = itemData.questionSource;
                                                        const newSources = checked
                                                            ? [...currentSources, option]
                                                            : currentSources.filter(s => s !== option);
                                                        setItemData(prev => ({...prev, questionSource: newSources as any[] }));
                                                    }}
                                                />
                                                <label htmlFor={`source-${option}`} className="text-sm font-medium leading-none">{option}</label>
                                             </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                            <Button onClick={handleAddOrUpdate}>Save</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
             <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Practice Sets ({practiceSets.length})</CardTitle>
                         <div className="flex items-center gap-1 rounded-md bg-secondary p-1">
                            <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setView('list')}><List className="w-5 h-5"/></Button>
                            <Button variant={view === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setView('grid')}><LayoutGrid className="w-5 h-5"/></Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Card key={i}><CardContent className="p-4"><Skeleton className="h-48 w-full" /></CardContent></Card>
                            ))}
                        </div>
                    ) : practiceSets.length > 0 ? (
                        view === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {practiceSets.map((ps) => (
                                    <Card key={ps.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow">
                                        <CardHeader className="p-0 relative h-40">
                                            <Image
                                                src={ps.featureImage || `https://picsum.photos/seed/${ps.id}/400/225`}
                                                alt={ps.title}
                                                fill
                                                className="object-cover rounded-t-lg"
                                            />
                                            <div className="absolute top-2 right-2"><ContentBadge type={ps.access} /></div>
                                        </CardHeader>
                                        <CardContent className="p-4 flex-grow">
                                            <CardTitle className="font-headline text-lg mb-1">{ps.subtitle}: {ps.title}</CardTitle>
                                            <CardDescription>{ps.subject}</CardDescription>
                                             <div className="flex flex-wrap gap-1 mt-2">
                                                {(Array.isArray(ps.difficulty) ? ps.difficulty : ps.difficulty ? [ps.difficulty] : []).map(d => d && <Badge key={d} variant="secondary">{d}</Badge>)}
                                            </div>
                                        </CardContent>
                                        <CardFooter className="p-4 pt-0 grid grid-cols-2 gap-2">
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={getUrlForPracticeSet(textbookId, ps.id)}><Eye className="mr-2 h-4 w-4"/>View</Link>
                                            </Button>
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={`/admin/textbooks/${textbookId}/practice-sets/${ps.id}`}><FileQuestion className="mr-2 h-4 w-4"/>Questions</Link>
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => handleOpenDialog(ps)}>
                                                <Edit className="mr-2 h-4 w-4"/>Edit
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => setItemToDelete(ps)}>
                                                <Trash2 className="mr-2 h-4 w-4"/>Delete
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-20 hidden sm:table-cell">Image</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead className="hidden md:table-cell">Questions</TableHead>
                                        <TableHead className="hidden lg:table-cell">Difficulty</TableHead>
                                        <TableHead className="hidden md:table-cell">Access</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {practiceSets.map(ps => (
                                        <TableRow key={ps.id}>
                                            <TableCell className="hidden sm:table-cell">
                                                <Image src={ps.featureImage || `https://picsum.photos/seed/${ps.id}/400/225`} alt={ps.title} width={64} height={36} className="rounded-md object-cover" />
                                            </TableCell>
                                            <TableCell className="font-medium">{ps.subtitle}: {ps.title}</TableCell>
                                            <TableCell className="hidden md:table-cell">{ps.questions?.length || 0}</TableCell>
                                            <TableCell className="hidden lg:table-cell">
                                                <div className="flex flex-wrap gap-1">
                                                    {(Array.isArray(ps.difficulty) ? ps.difficulty : ps.difficulty ? [ps.difficulty] : []).map(d => d && <Badge key={d} variant="secondary">{d}</Badge>)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell"><ContentBadge type={ps.access}/></TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon"><MoreHorizontal/></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem asChild><Link href={getUrlForPracticeSet(textbookId, ps.id)}><Eye className="mr-2"/>View</Link></DropdownMenuItem>
                                                        <DropdownMenuItem asChild><Link href={`/admin/textbooks/${textbookId}/practice-sets/${ps.id}`}><FileQuestion className="mr-2"/>Manage Questions</Link></DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleOpenDialog(ps)}><Edit className="mr-2"/>Edit</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-destructive" onClick={() => setItemToDelete(ps)}><Trash2 className="mr-2"/>Delete</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )
                    ) : (
                        <div className="text-center py-16 text-muted-foreground">
                            <p>No practice sets added to this textbook yet.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the practice set
                    "{itemToDelete?.title}".
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
