
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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
import { Eye, PlusCircle, ArrowLeft, Edit, Trash2, FileQuestion, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getAllContent, deleteContent, addContent, updateContent, getTextbookById } from '@/lib/firebase/firestore';
import { ContentBadge } from '@/components/content-badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ImageUploader } from '@/components/feature/image-uploader';
import Image from 'next/image';
import type { PracticeSet, Textbook } from '@/lib/types';


const difficultyOptions = ['Beginner', 'Easy', 'Medium', 'Hard', 'Expert'];
const questionSourceOptions = ['Random from Chapter', 'Random from Topic', 'Textbook Exercise', 'Solved Examples', 'Previous Year Questions'];


function getUrlForPracticeSet(bookId: string, practiceSetId: string) {
    return `/textbook-solutions/practice-set/${practiceSetId}/textbook/${bookId}`;
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
    const [itemData, setItemData] = useState<{title: string, subtitle: string, difficulty: string[], questionSource: string[], featureImage?: string}>({
        title: '',
        subtitle: '',
        difficulty: ['Medium'],
        questionSource: ['Random from Chapter'],
        featureImage: '',
    });

    const fetchPracticeSets = async () => {
        if (!textbookId) return;
        setLoading(true);
        try {
            const allPracticeSets = await getAllContent('Practice Set') as PracticeSet[];
            const textbookPracticeSets = allPracticeSets.filter(ps => ps.textbookId === textbookId && !ps.chapterId && !ps.topicId);
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
        setItemData(item ? { title: item.title, subtitle, difficulty: difficultyArray, questionSource: sourceArray, featureImage: item.featureImage || '' } : { title: '', subtitle, difficulty: ['Medium'], questionSource: ['Random from Chapter'], featureImage: '' });
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
            access: 'free',
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
                     <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingItem ? 'Edit Practice Set' : 'Add New Practice Set'}</DialogTitle>
                        </DialogHeader>
                         <div className="space-y-4 py-4">
                             <div className="space-y-2">
                                <Label>Feature Image</Label>
                                <ImageUploader
                                    fieldName="featureImage"
                                    onUrlChange={(url) => setItemData(p => ({ ...p, featureImage: url }))}
                                    value={itemData.featureImage}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="item-subtitle">Subtitle</Label>
                                <Input id="item-subtitle" value={itemData.subtitle} onChange={e => setItemData(p => ({...p, subtitle: e.target.value}))} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="item-title">Title</Label>
                                <Input id="item-title" value={itemData.title} onChange={e => setItemData(p => ({...p, title: e.target.value}))} />
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
                        <DialogFooter>
                            <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                            <Button onClick={handleAddOrUpdate}>Save</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Practice Sets ({practiceSets.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-20">Image</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Access</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-10 w-16 rounded-md" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-32 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                            ) : practiceSets.length > 0 ? (
                                practiceSets.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <Image 
                                            src={item.featureImage || '/image/logo.png'} 
                                            alt={item.title}
                                            width={64}
                                            height={40}
                                            className="rounded-md object-cover"
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{item.subtitle ? `${item.subtitle}: ${item.title}` : item.title}</TableCell>
                                    <TableCell><ContentBadge type={item.access} /></TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={getUrlForPracticeSet(textbookId, item.id)}><Eye className="mr-2 h-4 w-4"/>View</Link>
                                        </Button>
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/admin/textbooks/${textbookId}/practice-sets/${item.id}`}><FileQuestion className="mr-2 h-4 w-4"/>Manage Questions</Link>
                                        </Button>
                                         <Button variant="outline" size="sm" onClick={() => handleOpenDialog(item)}>
                                            <Edit className="mr-2 h-4 w-4"/>Edit
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => setItemToDelete(item)}>
                                            <Trash2 className="mr-2 h-4 w-4"/>Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">
                                    No practice sets added to this textbook yet.
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

    