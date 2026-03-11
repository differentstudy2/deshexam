
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllContent, deleteContent, updateContent } from '@/lib/firebase/firestore';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
    DialogClose
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ImageUploader } from '@/components/feature/image-uploader';


type KidsContent = {
    id: string;
    title: string;
    category: string;
    createdAt: string;
    body?: string;
    featureImage?: string;
    questions?: any[];
}

const funQuizQuestionSchema = z.object({
  text: z.string().min(1, 'Question text cannot be empty.'),
  image: z.string().optional(),
  audio: z.string().optional(),
  options: z.array(z.object({ 
    text: z.string().min(1, "Option text cannot be empty."),
    image: z.string().optional(),
    audio: z.string().optional(),
  })).min(4).max(4),
  correctAnswer: z.string().min(1, "Please select a correct answer."),
});

const formSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
  featureImage: z.string().optional(),
  category: z.string().min(1, "Category is required."),
  body: z.string().optional(),
  questions: z.array(funQuizQuestionSchema).optional(),
});


type FormValues = z.infer<typeof formSchema>;


export default function ManageKidsContentPage() {
  const { toast } = useToast();
  const [content, setContent] = useState<KidsContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState<KidsContent | null>(null);
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KidsContent | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'questions',
  });

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

  const handleOpenEditDialog = (item: KidsContent) => {
    setEditingItem(item);
    form.reset({
        title: item.title,
        description: (item as any).description || '',
        featureImage: item.featureImage || '',
        category: item.category,
        body: item.body || '',
        questions: item.questions || [],
    });
    setIsEditDialogOpen(true);
  };
  
  const handleUpdate = async (data: FormValues) => {
    if (!editingItem) return;
    try {
      const contentToSave: any = {
        title: data.title,
        description: data.description,
        featureImage: data.featureImage,
        testType: data.category === 'Fun Quizzes' ? 'Quiz' : 'Kids Zone',
        category: data.category,
        body: data.body,
        questions: data.category === 'Fun Quizzes' ? data.questions : [],
      };

      await updateContent(editingItem.id, contentToSave);
      toast({
        title: 'Content Updated!',
        description: `The item "${data.title}" has been successfully updated.`,
      });
      setIsEditDialogOpen(false);
      fetchContent();

    } catch (error) {
       toast({
        variant: "destructive",
        title: 'Error Updating Content',
        description: (error as Error).message,
      });
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
                                <DropdownMenuItem onClick={() => handleOpenEditDialog(item)}><Pencil className="mr-2 h-4 w-4"/>Edit</DropdownMenuItem>
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Kids Zone Material</DialogTitle>
            <DialogDescription>Update the details of the game, quiz, or activity.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-8 max-h-[70vh] overflow-y-auto p-1 pr-4">
                 <Card className="border-0 shadow-none">
                    <CardContent className="space-y-6 p-0">
                        <FormField control={form.control} name="title" render={({ field }) => ( <FormItem> <FormLabel>Title</FormLabel> <FormControl> <Input placeholder="e.g., Amazing Animals Quiz" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                        <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Description</FormLabel> <FormControl> <Input placeholder="A fun quiz about all kinds of animals!" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                        <FormField control={form.control} name="category" render={({ field }) => ( <FormItem> <FormLabel>Category</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl> <SelectTrigger> <SelectValue placeholder="Select a category" /> </SelectTrigger> </FormControl> <SelectContent> <SelectItem value="Fun Quizzes">Fun Quizzes</SelectItem> <SelectItem value="Learning Games">Learning Games</SelectItem> <SelectItem value="Learning English">Learning English</SelectItem> <SelectItem value="Learning Bengali">Learning Bengali</SelectItem> <SelectItem value="Learning Hindi">Learning Hindi</SelectItem> <SelectItem value="Learning Arabic">Learning Arabic</SelectItem> <SelectItem value="Learning Urdu">Learning Urdu</SelectItem> </SelectContent> </Select> <FormMessage /> </FormItem> )}/>
                        <FormField control={form.control} name="featureImage" render={({ field }) => ( <FormItem> <FormLabel>Feature Image</FormLabel> <FormControl> <ImageUploader fieldName={field.name} onUrlChange={(url) => form.setValue('featureImage', url, { shouldValidate: true })} value={field.value}/> </FormControl> <FormMessage /> </FormItem> )}/>
                        
                        {form.watch('category') !== 'Fun Quizzes' && (
                          <FormField control={form.control} name="body" render={({ field }) => ( <FormItem> <FormLabel>Content Body (for non-quiz content)</FormLabel> <FormControl> <Textarea {...field} placeholder="Write your article or game description here." className="min-h-[200px] font-mono"/> </FormControl> <FormMessage /> </FormItem> )}/>
                        )}
                        
                        {form.watch('category') === 'Fun Quizzes' && (
                            <div className="space-y-6 pt-4 border-t">
                                <h3 className="text-lg font-medium">Quiz Questions</h3>
                                {fields.map((question, index) => (
                                    <Card key={question.id} className="p-4 bg-secondary/50">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-semibold">Question {index + 1}</h4>
                                            <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                        </div>
                                        <div className="space-y-4">
                                            <FormField control={form.control} name={`questions.${index}.text`} render={({ field }) => (<FormItem><FormLabel>Question Text</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField control={form.control} name={`questions.${index}.image`} render={({ field }) => (<FormItem><FormLabel>Question Image</FormLabel><FormControl><ImageUploader fieldName={field.name} onUrlChange={(url) => form.setValue(`questions.${index}.image`, url)} value={field.value}/></FormControl><FormMessage /></FormItem>)}/>
                                                <FormField control={form.control} name={`questions.${index}.audio`} render={({ field }) => (<FormItem><FormLabel>Question Audio URL</FormLabel><FormControl><Input {...field} placeholder="Audio URL" /></FormControl><FormMessage /></FormItem>)}/>
                                            </div>
                                            
                                            <div className="space-y-3 pt-2">
                                                <Label>Options</Label>
                                                <div className="grid grid-cols-2 gap-4">
                                                {[0, 1, 2, 3].map(optionIndex => (
                                                  <div key={optionIndex} className="space-y-3 p-3 border rounded-md bg-background">
                                                    <Label>Option {optionIndex + 1}</Label>
                                                    <FormField control={form.control} name={`questions.${index}.options.${optionIndex}.text`} render={({ field }) => (<FormItem><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <FormField control={form.control} name={`questions.${index}.options.${optionIndex}.image`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Image</FormLabel><FormControl><ImageUploader fieldName={field.name} onUrlChange={(url) => form.setValue(`questions.${index}.options.${optionIndex}.image`, url)} value={field.value}/></FormControl><FormMessage /></FormItem>)}/>
                                                        <FormField control={form.control} name={`questions.${index}.options.${optionIndex}.audio`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Audio</FormLabel><FormControl><Input {...field} placeholder="Audio URL" /></FormControl><FormMessage /></FormItem>)}/>
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name={`questions.${index}.correctAnswer`}
                                                render={({ field }) => (
                                                    <FormItem className="space-y-3 pt-4">
                                                        <FormLabel>Correct Answer</FormLabel>
                                                        <FormControl>
                                                            <RadioGroup
                                                                onValueChange={field.onChange}
                                                                value={field.value}
                                                                className="mt-2 grid grid-cols-2 gap-2"
                                                            >
                                                                {form.watch(`questions.${index}.options`)?.map((option, optionIndex) => (
                                                                    option.text ? (
                                                                        <div key={optionIndex} className="flex items-center space-x-3 space-y-0 p-2 border rounded-md bg-background has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                                                                            <RadioGroupItem value={option.text} id={`edit-q-${index}-opt-${optionIndex}`} />
                                                                            <Label htmlFor={`edit-q-${index}-opt-${optionIndex}`} className="font-normal w-full truncate cursor-pointer">
                                                                                {option.text}
                                                                            </Label>
                                                                        </div>
                                                                    ) : null
                                                                ))}
                                                            </RadioGroup>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </Card>
                                ))}
                                <Button type="button" variant="outline" onClick={() => append({ text: '', options: [{text: ''}, {text: ''}, {text: ''}, {text: ''}], correctAnswer: '' })}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Question
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="ghost">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : "Save Changes"}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
        </DialogContent>
      </Dialog>
      
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
