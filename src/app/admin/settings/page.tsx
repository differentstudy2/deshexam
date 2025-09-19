

'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, Library, Trash2, Edit, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState, useCallback } from 'react';
import { 
    getSettings, 
    updateSettings, 
    getAllContent, 
    getSubjects, 
    addSubject, 
    updateSubject, 
    deleteSubject,
    getBoards,
    addBoard,
    updateBoard,
    deleteBoard,
    getExamTypes,
    addExamType,
    updateExamType,
    deleteExamType,
    getChaptersBySubjectId,
    addChapter,
    updateChapter,
    deleteChapter,
    getExamsByCategory,
    addExam,
    updateExam,
    deleteExam
} from '@/lib/firebase/firestore';
import Link from 'next/link';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const settingsSchema = z.object({
    siteName: z.string().min(1, "Site name is required."),
    siteDescription: z.string().optional(),
    razorpayKeyId: z.string().optional(),
    razorpayKeySecret: z.string().optional(),
    allowRegistrations: z.boolean(),
    enableMatching: z.boolean(),
    enableMultipleChoice: z.boolean(),
    enableTrueFalse: z.boolean(),
    enableShortAnswer: z.boolean(),
    enableFillInTheBlank: z.boolean(),
    enableSubjectMetafield: z.boolean(),
    enableBoardMetafield: z.boolean(),
    enableExamCategoryMetafield: z.boolean(),
    enableExamMetafield: z.boolean(),
    enableChapterMetafield: z.boolean(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;
type ContentSummary = { [key: string]: number; };
type MetafieldItem = { id: string; name?: string; chapterNo?: string, chapterName?: string };

const MetafieldManager = ({
    title,
    items,
    onAdd,
    onUpdate,
    onDelete,
} : {
    title: string;
    items: MetafieldItem[];
    onAdd: (name: string) => Promise<void>;
    onUpdate: (id: string, name: string) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}) => {
    const [newItemName, setNewItemName] = useState('');
    const [editingItem, setEditingItem] = useState<MetafieldItem | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    const handleAdd = async () => {
        if (!newItemName.trim()) return;
        setIsAdding(true);
        await onAdd(newItemName);
        setNewItemName('');
        setIsAdding(false);
    };
    
    const handleUpdate = async () => {
        if (!editingItem || !editingItem.name?.trim()) return;
        await onUpdate(editingItem.id, editingItem.name);
        setEditingItem(null);
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;
        await onDelete(itemToDelete);
        setItemToDelete(null);
    }
    
    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <Input 
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder={`New ${title.slice(0, -1)} Name`}
                    disabled={isAdding}
                />
                <Button onClick={handleAdd} disabled={isAdding || !newItemName.trim()}>
                    {isAdding ? <Loader2 className="animate-spin" /> : <PlusCircle />}
                </Button>
            </div>

            <ScrollArea className="h-60 rounded-md border">
                <div className="p-4 space-y-2">
                    {items.map(item => (
                        <div key={item.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-secondary">
                            {editingItem?.id === item.id ? (
                                <Input 
                                    value={editingItem.name} 
                                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                    onBlur={handleUpdate}
                                    onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                                    autoFocus
                                />
                            ) : (
                                <span className="flex-grow">{item.name}</span>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => setEditingItem(item)}><Edit className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setItemToDelete(item.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                    ))}
                    {items.length === 0 && <p className="text-center text-sm text-muted-foreground">No items added yet.</p>}
                </div>
            </ScrollArea>

             <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the item. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

const DependentMetafieldManager = ({
    parentTitle,
    childTitle,
    parentItems,
    fetchChildren,
    onAdd,
    onUpdate,
    onDelete,
}: {
    parentTitle: string;
    childTitle: string;
    parentItems: MetafieldItem[];
    fetchChildren: (parentId: string) => Promise<MetafieldItem[]>;
    onAdd: (parentId: string, data: any) => Promise<void>;
    onUpdate: (parentId: string, childId: string, data: any) => Promise<void>;
    onDelete: (parentId: string, childId: string) => Promise<void>;
}) => {
    const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
    const [children, setChildren] = useState<MetafieldItem[]>([]);
    const [loadingChildren, setLoadingChildren] = useState(false);
    
    const [newItemData, setNewItemData] = useState<any>({});
    const [editingItem, setEditingItem] = useState<MetafieldItem | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    
    const handleParentChange = async (parentId: string) => {
        setSelectedParentId(parentId);
        if (parentId) {
            setLoadingChildren(true);
            const fetchedChildren = await fetchChildren(parentId);
            setChildren(fetchedChildren);
            setLoadingChildren(false);
        } else {
            setChildren([]);
        }
    };

    const handleAdd = async () => {
        if (!selectedParentId) return;
        const requiredFields = childTitle === 'Chapters' ? ['chapterNo', 'chapterName'] : ['name'];
        if (requiredFields.some(field => !newItemData[field]?.trim())) return;

        setIsAdding(true);
        await onAdd(selectedParentId, newItemData);
        setNewItemData({});
        await handleParentChange(selectedParentId);
        setIsAdding(false);
    };

    const handleUpdate = async () => {
        if (!selectedParentId || !editingItem) return;
        await onUpdate(selectedParentId, editingItem.id, editingItem);
        setEditingItem(null);
        await handleParentChange(selectedParentId);
    };
    
    const handleDelete = async () => {
        if (!selectedParentId || !itemToDelete) return;
        await onDelete(selectedParentId, itemToDelete);
        setItemToDelete(null);
        await handleParentChange(selectedParentId);
    };
    
    const isChapter = childTitle === 'Chapters';

    return (
        <div className="space-y-4">
            <Select onValueChange={handleParentChange}>
                <SelectTrigger><SelectValue placeholder={`Select a ${parentTitle.slice(0, -1)}`} /></SelectTrigger>
                <SelectContent>
                    {parentItems.map(item => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}
                </SelectContent>
            </Select>

            {selectedParentId && (
                <>
                    <div className="flex gap-2">
                        {isChapter ? (
                            <>
                                <Input value={newItemData.chapterNo || ''} onChange={(e) => setNewItemData({...newItemData, chapterNo: e.target.value})} placeholder="No." className="w-20" disabled={isAdding} />
                                <Input value={newItemData.chapterName || ''} onChange={(e) => setNewItemData({...newItemData, chapterName: e.target.value})} placeholder="New Chapter Name" disabled={isAdding} />
                            </>
                        ) : (
                            <Input value={newItemData.name || ''} onChange={(e) => setNewItemData({name: e.target.value})} placeholder={`New ${childTitle.slice(0, -1)} Name`} disabled={isAdding} />
                        )}
                        <Button onClick={handleAdd} disabled={isAdding || (isChapter ? (!newItemData.chapterNo || !newItemData.chapterName) : !newItemData.name)}>{isAdding ? <Loader2 className="animate-spin" /> : <PlusCircle />}</Button>
                    </div>

                    <ScrollArea className="h-60 rounded-md border">
                        <div className="p-4 space-y-2">
                            {loadingChildren ? <Loader2 className="mx-auto animate-spin" /> : children.map(item => (
                                <div key={item.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-secondary">
                                    {editingItem?.id === item.id ? (
                                        isChapter ? (
                                            <>
                                                <Input value={editingItem.chapterNo} onChange={(e) => setEditingItem({...editingItem, chapterNo: e.target.value})} className="w-20" />
                                                <Input value={editingItem.chapterName} onChange={(e) => setEditingItem({...editingItem, chapterName: e.target.value})} onBlur={handleUpdate} onKeyDown={(e) => e.key === 'Enter' && handleUpdate()} autoFocus />
                                            </>
                                        ) : (
                                            <Input value={editingItem.name} onChange={(e) => setEditingItem({...editingItem, name: e.target.value})} onBlur={handleUpdate} onKeyDown={(e) => e.key === 'Enter' && handleUpdate()} autoFocus />
                                        )
                                    ) : (
                                        <span className="flex-grow">{isChapter ? `${item.chapterNo}. ${item.chapterName}` : item.name}</span>
                                    )}
                                    <Button variant="ghost" size="sm" onClick={() => setEditingItem(item)}><Edit className="w-4 h-4" /></Button>
                                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setItemToDelete(item.id)}><Trash2 className="w-4 h-4" /></Button>
                                </div>
                            ))}
                            {!loadingChildren && children.length === 0 && <p className="text-center text-sm text-muted-foreground">No items added yet.</p>}
                        </div>
                    </ScrollArea>
                </>
            )}
            <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}


export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [contentSummary, setContentSummary] = useState<ContentSummary | null>(null);
  const [totalContent, setTotalContent] = useState(0);

  const [subjects, setSubjects] = useState<MetafieldItem[]>([]);
  const [boards, setBoards] = useState<MetafieldItem[]>([]);
  const [examTypes, setExamTypes] = useState<MetafieldItem[]>([]);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
        siteName: "DeshExam",
        siteDescription: "Your ultimate destination for mock tests, quizzes, and personalized learning paths.",
        razorpayKeyId: "",
        razorpayKeySecret: "",
        allowRegistrations: true,
        enableMatching: true,
        enableMultipleChoice: true,
        enableTrueFalse: true,
        enableShortAnswer: true,
        enableFillInTheBlank: true,
        enableSubjectMetafield: true,
        enableBoardMetafield: true,
        enableExamCategoryMetafield: true,
        enableExamMetafield: true,
        enableChapterMetafield: true,
    },
  });

  const fetchInitialData = useCallback(async () => {
    try {
        setLoading(true);
        const [settings, allContent, subjectData, boardData, examTypeData] = await Promise.all([
            getSettings(),
            getAllContent(),
            getSubjects(),
            getBoards(),
            getExamTypes(),
        ]);

        if (settings) {
            form.reset(settings);
        }
        
        if (allContent) {
            const summary = allContent.reduce((acc: ContentSummary, item: any) => {
                const type = item.testType || 'Unknown';
                acc[type] = (acc[type] || 0) + 1;
                return acc;
            }, {});
            setContentSummary(summary);
            setTotalContent(allContent.length);
        }
        
        setSubjects(subjectData);
        setBoards(boardData);
        setExamTypes(examTypeData);

    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Failed to load page data',
            description: (error as Error).message,
        });
    } finally {
        setLoading(false);
    }
  }, [form, toast]);
  
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);


  const handleSave: SubmitHandler<SettingsFormValues> = async (data) => {
    try {
        await updateSettings(data);
        toast({
            title: 'Settings Saved!',
            description: 'Your changes have been successfully saved to the database.',
        });
    } catch (error) {
         toast({
            variant: "destructive",
            title: 'Error Saving Settings',
            description: (error as Error).message,
        });
    }
  };

  const createMetafieldHandlers = (type: 'subject' | 'board' | 'examType') => {
      const stateSetterMap = { subject: setSubjects, board: setBoards, examType: setExamTypes };
      const addFuncMap = { subject: addSubject, board: addBoard, examType: addExamType };
      const updateFuncMap = { subject: updateSubject, board: updateBoard, examType: updateExamType };
      const deleteFuncMap = { subject: deleteSubject, board: deleteBoard, examType: deleteExamType };
      const getFunc = type === 'subject' ? getSubjects : type === 'board' ? getBoards : getExamTypes;

      return {
          onAdd: async (name: string) => { await addFuncMap[type](name); setState(await getFunc()); },
          onUpdate: async (id: string, name: string) => { await updateFuncMap[type](id, name); setState(await getFunc()); },
          onDelete: async (id: string) => { await deleteFuncMap[type](id); setState(await getFunc()); }
      };
  };

  const subjectHandlers = createMetafieldHandlers('subject');
  const boardHandlers = createMetafieldHandlers('board');
  const examTypeHandlers = createMetafieldHandlers('examType');

    const chapterHandlers = {
        onAdd: addChapter, onUpdate: updateChapter, onDelete: deleteChapter,
    };
    const examHandlers = {
        onAdd: addExam, onUpdate: updateExam, onDelete: deleteExam,
    };
  
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading Settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Site Settings</h1>
        <p className="text-muted-foreground">
          Manage your application's global settings.
        </p>
      </div>

    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSave)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card>
            <CardHeader>
                <CardTitle>General</CardTitle>
                <CardDescription>
                Basic information about your site.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                control={form.control}
                name="siteName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Site Name</FormLabel>
                    <FormControl>
                        <Input {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="siteDescription"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Site Description</FormLabel>
                    <FormControl>
                        <Input {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </CardContent>
            </Card>
            
            <Card>
            <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>
                Manage API keys for third-party services. These are stored securely on the server.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                control={form.control}
                name="razorpayKeyId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Razorpay Key ID</FormLabel>
                    <FormControl>
                        <Input type="password" placeholder="••••••••••••••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="razorpayKeySecret"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Razorpay Key Secret</FormLabel>
                    <FormControl>
                        <Input type="password" placeholder="••••••••••••••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </CardContent>
            </Card>

            <Card>
            <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                Control how users interact with your site.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <FormField
                control={form.control}
                name="allowRegistrations"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <FormLabel className="text-base">
                        Allow New User Registrations
                        </FormLabel>
                        <FormDescription>
                        Toggle whether new users can sign up for an account.
                        </FormDescription>
                    </div>
                    <FormControl>
                        <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                    </FormControl>
                    </FormItem>
                )}
                />
            </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Content Metafield Settings</CardTitle>
                    <CardDescription>
                    Control which data fields are available and manage their options.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Card>
                        <CardHeader>
                            <FormField
                                control={form.control}
                                name="enableSubjectMetafield"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Subjects</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    </FormItem>
                                )}
                            />
                        </CardHeader>
                        <CardContent>
                            <MetafieldManager 
                                title="Subjects"
                                items={subjects}
                                onAdd={subjectHandlers.onAdd}
                                onUpdate={subjectHandlers.onUpdate}
                                onDelete={subjectHandlers.onDelete}
                            />
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <FormField
                                control={form.control}
                                name="enableChapterMetafield"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Chapters</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </CardHeader>
                        <CardContent>
                            <DependentMetafieldManager
                                parentTitle="Subjects"
                                childTitle="Chapters"
                                parentItems={subjects}
                                fetchChildren={getChaptersBySubjectId}
                                onAdd={chapterHandlers.onAdd}
                                onUpdate={chapterHandlers.onUpdate}
                                onDelete={chapterHandlers.onDelete}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <FormField
                                control={form.control}
                                name="enableExamCategoryMetafield"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Exam Categories</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </CardHeader>
                        <CardContent>
                             <MetafieldManager 
                                title="Exam Categories"
                                items={examTypes}
                                onAdd={examTypeHandlers.onAdd}
                                onUpdate={examTypeHandlers.onUpdate}
                                onDelete={examTypeHandlers.onDelete}
                            />
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <FormField
                                control={form.control}
                                name="enableExamMetafield"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Exams</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </CardHeader>
                        <CardContent>
                            <DependentMetafieldManager
                                parentTitle="Exam Categories"
                                childTitle="Exams"
                                parentItems={examTypes}
                                fetchChildren={getExamsByCategory}
                                onAdd={examHandlers.onAdd}
                                onUpdate={examHandlers.onUpdate}
                                onDelete={examHandlers.onDelete}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                             <FormField
                                control={form.control}
                                name="enableBoardMetafield"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Boards</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </CardHeader>
                        <CardContent>
                            <MetafieldManager 
                                title="Boards"
                                items={boards}
                                onAdd={boardHandlers.onAdd}
                                onUpdate={boardHandlers.onUpdate}
                                onDelete={boardHandlers.onDelete}
                            />
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>

            <Card>
            <CardHeader>
                <CardTitle>Question Type Settings</CardTitle>
                <CardDescription>
                Enable or disable specific question types site-wide.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                    control={form.control}
                    name="enableMultipleChoice"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable Multiple Choice Questions</FormLabel>
                            <FormDescription>
                                Allow creation of 'Multiple Choice' type questions.
                            </FormDescription>
                        </div>
                        <FormControl>
                            <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="enableTrueFalse"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable True/False Questions</FormLabel>
                            <FormDescription>
                                Allow creation of 'True/False' type questions.
                            </FormDescription>
                        </div>
                        <FormControl>
                            <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="enableShortAnswer"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable Short Answer Questions</FormLabel>
                            <FormDescription>
                            Allow creation of 'Short Answer' questions.
                            </FormDescription>
                        </div>
                        <FormControl>
                            <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="enableFillInTheBlank"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable Fill in the Blank Questions</FormLabel>
                            <FormDescription>
                            Allow creation of 'Fill in the Blank' questions.
                            </FormDescription>
                        </div>
                        <FormControl>
                            <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="enableMatching"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable Matching Questions</FormLabel>
                            <FormDescription>
                                Allow creation of 'Matching' type questions in the content editor.
                            </FormDescription>
                        </div>
                        <FormControl>
                            <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        </FormItem>
                    )}
                />
            </CardContent>
            </Card>
            
            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full lg:w-auto">
                <Save className="mr-2 h-4 w-4" />
                {form.formState.isSubmitting ? "Saving..." : "Save All Settings"}
            </Button>
        </div>
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Content Summary</CardTitle>
                    <CardDescription>A quick overview of your site's content.</CardDescription>
                </CardHeader>
                <CardContent>
                    {contentSummary ? (
                        <ul className="space-y-2 text-sm">
                            <li className="flex justify-between items-center font-semibold">
                                <span>Total Content</span>
                                <span>{totalContent}</span>
                            </li>
                             <li className="flex justify-between items-center">
                                <span>Mock Tests</span>
                                <span>{contentSummary['Mock Test'] || 0}</span>
                            </li>
                             <li className="flex justify-between items-center">
                                <span>Quizzes</span>
                                <span>{contentSummary['Quiz'] || 0}</span>
                            </li>
                             <li className="flex justify-between items-center">
                                <span>Learn Articles</span>
                                <span>{contentSummary['Learn'] || 0}</span>
                            </li>
                             <li className="flex justify-between items-center">
                                <span>Practice Questions</span>
                                <span>{contentSummary['Practice Questions'] || 0}</span>
                            </li>
                        </ul>
                    ) : <p className="text-sm text-muted-foreground">No content found.</p>}
                </CardContent>
                <CardFooter>
                    <Button variant="outline" asChild className="w-full">
                        <Link href="/admin/content"><Library className="mr-2 h-4 w-4"/>Manage Content</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
      </form>
    </Form>
    </div>
  );
}
