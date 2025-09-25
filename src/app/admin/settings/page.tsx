
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
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, Library, Trash2, Edit, PlusCircle, Settings, KeyRound, Users, Type, LayoutTemplate, Sparkles, BrainCircuit, Star, GraduationCap, DollarSign, Book } from 'lucide-react';
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
    getClasses,
    addClass,
    updateClass,
    deleteClass,
    getStates,
    addState,
    updateState,
    deleteState,
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
    deleteExam,
    getGradesByClass,
    addGradeToClass,
    updateGradeInClass,
    deleteGradeFromClass
} from '@/lib/firebase/firestore';
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
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { generateMetadata } from '@/ai/flows/ai-metadata-generator';
import type { AIMetadataGeneratorOutput, AIMetadataGeneratorInput } from '@/ai/flows/ai-metadata-generator';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

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
    enableClassMetafield: z.boolean(),
    enableExamCategoryMetafield: z.boolean(),
    enableStateMetafield: z.boolean(),
    enableExamMetafield: z.boolean(),
    enableChapterMetafield: z.boolean(),
    defaultBoard: z.string().optional(),
    defaultClass: z.string().optional(),
    defaultSubject: z.string().optional(),
    defaultChapter: z.string().optional(),
    defaultExamCategory: z.string().optional(),
    defaultState: z.string().optional(),
    defaultExam: z.string().optional(),
    textbookOneTimePurchase: z.boolean().default(false),
    freeChaptersPerBook: z.coerce.number().int().min(0).default(1),
    practiceSetAttempts: z.coerce.number().int().min(1).default(3),
    enablePracticeSetRetry: z.boolean().default(true),
    practiceSetPassMark: z.coerce.number().int().min(0).max(100).default(40),
    gateChaptersOnPass: z.boolean().default(false),
    practiceSetSubmissionLimit: z.coerce.number().int().min(1).default(5),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;
type ContentSummary = { [key: string]: number; };
type MetafieldItem = { id: string; name?: string; chapterNo?: string, chapterName?: string };

const aiGeneratorSchema = z.object({
  metafieldType: z.enum(['Subject', 'Board', 'Exam Category', 'Class', 'State', 'Chapter', 'Exam']),
  topic: z.string().min(3, "Topic must be at least 3 characters."),
  count: z.coerce.number().int().min(1).max(20),
  parentId: z.string().optional(),
});
type AIGeneratorValues = z.infer<typeof aiGeneratorSchema>;

const MetafieldManager = ({
    title,
    items,
    onAdd,
    onUpdate,
    onDelete,
    defaultValue,
    onSetDefault,
} : {
    title: string;
    items: MetafieldItem[];
    onAdd: (name: string) => Promise<void>;
    onUpdate: (id: string, name: string) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    defaultValue?: string;
    onSetDefault: (name: string) => void;
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
                            <Button variant="ghost" size="sm" onClick={() => onSetDefault(item.name!)} title="Set as default">
                                <Star className={cn("w-4 h-4", defaultValue === item.name ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground")} />
                            </Button>
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
    defaultValue,
    onSetDefault,
}: {
    parentTitle: string;
    childTitle: string;
    parentItems: MetafieldItem[];
    fetchChildren: (parentId: string) => Promise<MetafieldItem[]>;
    onAdd: (parentId: string, data: any) => Promise<void>;
    onUpdate: (parentId: string, childId: string, data: any) => Promise<void>;
    onDelete: (parentId: string, childId: string) => Promise<void>;
    defaultValue?: string;
    onSetDefault: (name: string) => void;
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
    const isGrade = childTitle === 'Grades';

    const getFullItemName = (item: MetafieldItem) => {
        return isChapter ? `${item.chapterNo}. ${item.chapterName}` : item.name!;
    };

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
                                        <span className="flex-grow">{getFullItemName(item)}</span>
                                    )}
                                    <Button variant="ghost" size="sm" onClick={() => onSetDefault(getFullItemName(item))} title="Set as default">
                                        <Star className={cn("w-4 h-4", defaultValue === getFullItemName(item) ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground")} />
                                    </Button>
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
  const [activeTab, setActiveTab] = useState('general');
  const [contentSummary, setContentSummary] = useState<ContentSummary | null>(null);
  const [totalContent, setTotalContent] = useState(0);

  const [subjects, setSubjects] = useState<MetafieldItem[]>([]);
  const [boards, setBoards] = useState<MetafieldItem[]>([]);
  const [classes, setClasses] = useState<MetafieldItem[]>([]);
  const [states, setStates] = useState<MetafieldItem[]>([]);
  const [examTypes, setExamTypes] = useState<MetafieldItem[]>([]);
  
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedItems, setGeneratedItems] = useState<string[]>([]);

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
        enableClassMetafield: true,
        enableExamCategoryMetafield: true,
        enableStateMetafield: true,
        enableExamMetafield: true,
        enableChapterMetafield: true,
        defaultBoard: '',
        defaultClass: '',
        defaultSubject: '',
        defaultChapter: '',
        defaultExamCategory: '',
        defaultState: '',
        defaultExam: '',
        textbookOneTimePurchase: false,
        freeChaptersPerBook: 1,
        practiceSetAttempts: 3,
        enablePracticeSetRetry: true,
        practiceSetPassMark: 40,
        gateChaptersOnPass: false,
        practiceSetSubmissionLimit: 5,
    },
  });

  const aiForm = useForm<AIGeneratorValues>({
    resolver: zodResolver(aiGeneratorSchema),
    defaultValues: {
        metafieldType: 'Subject',
        topic: '',
        count: 10,
    }
  });
  const aiMetafieldType = aiForm.watch('metafieldType');


  const fetchInitialData = useCallback(async () => {
    try {
        setLoading(true);
        const [settings, allContent, subjectData, boardData, classData, stateData, examTypeData] = await Promise.all([
            getSettings(),
            getAllContent(),
            getSubjects(),
            getBoards(),
            getClasses(),
            getStates(),
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
        setClasses(classData);
        setStates(stateData);
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
  
  const handleAIGenerate: SubmitHandler<AIGeneratorValues> = async (data) => {
      setIsGenerating(true);
      setGeneratedItems([]);
      try {
          const input: AIMetadataGeneratorInput = {
              metafieldType: data.metafieldType,
              count: data.count,
              topic: data.topic,
          };
           if (data.parentId) {
               const parentCollection = data.metafieldType === 'Chapter' ? subjects : examTypes;
               const parent = parentCollection.find(p => p.id === data.parentId);
               if (parent) {
                   input.topic = parent.name!;
               }
           }
          const result: AIMetadataGeneratorOutput = await generateMetadata(input);
          setGeneratedItems(result.items);
          toast({
              title: "Suggestions Generated!",
              description: "Review the generated items below."
          });
      } catch (error) {
          toast({
              variant: "destructive",
              title: "AI Generation Failed",
              description: (error as Error).message,
          });
      } finally {
          setIsGenerating(false);
      }
  }

  const handleAddGeneratedItems = async () => {
      const { metafieldType, parentId } = aiForm.getValues();
      if (generatedItems.length === 0) return;
      
      const addFunctionMap = {
          'Subject': addSubject,
          'Board': addBoard,
          'Exam Category': addExamType,
          'Class': addClass,
          'State': addState,
          'Chapter': (item: string) => addChapter(parentId!, { chapterNo: '1', chapterName: item }), // Dummy chapter no
          'Exam': (item: string) => addExam(parentId!, { name: item }),
      };

      const addFunc = addFunctionMap[metafieldType];

      try {
          for (const item of generatedItems) {
            if (metafieldType === 'Chapter') {
                const parts = item.split(/[\.:\s]+/, 2);
                const chapterNo = parts.length > 1 ? parts[0] : 'N/A';
                const chapterName = parts.length > 1 ? parts.slice(1).join(' ').trim() : item;
                await addChapter(parentId!, { chapterNo, chapterName });
            } else {
                 await addFunc(item);
            }
          }
          
          toast({
              title: 'Items Added!',
              description: `${generatedItems.length} new ${metafieldType.toLowerCase()} items have been added.`,
          });
          // Refresh data
          await fetchInitialData();
          setGeneratedItems([]);
          setIsAIGeneratorOpen(false);
          aiForm.reset();
      } catch (error) {
           toast({
              variant: "destructive",
              title: `Error Adding ${metafieldType} Items`,
              description: (error as Error).message,
          });
      }
  }

  const createMetafieldHandlers = (type: 'subject' | 'board' | 'examType' | 'class' | 'state') => {
      const stateSetterMap = { subject: setSubjects, board: setBoards, examType: setExamTypes, class: setClasses, state: setStates } as const;
      const addFuncMap = { subject: addSubject, board: addBoard, examType: addExamType, class: addClass, state: addState };
      const updateFuncMap = { subject: updateSubject, board: updateBoard, examType: updateExamType, class: updateClass, state: updateState };
      const deleteFuncMap = { subject: deleteSubject, board: deleteBoard, examType: deleteExamType, class: deleteClass, state: deleteState };
      
      const getFunc = type === 'subject' ? getSubjects 
          : type === 'board' ? getBoards 
          : type === 'class' ? getClasses 
          : type === 'state' ? getStates
          : getExamTypes;
      
      const setState = stateSetterMap[type];

      return {
          onAdd: async (name: string) => { await addFuncMap[type](name); setState(await getFunc()); },
          onUpdate: async (id: string, name: string) => { await updateFuncMap[type](id, name); setState(await getFunc()); },
          onDelete: async (id: string) => { await deleteFuncMap[type](id); setState(await getFunc()); }
      };
  };

  const subjectHandlers = createMetafieldHandlers('subject');
  const boardHandlers = createMetafieldHandlers('board');
  const classHandlers = createMetafieldHandlers('class');
  const stateHandlers = createMetafieldHandlers('state');
  const examTypeHandlers = createMetafieldHandlers('examType');

    const chapterHandlers = {
        onAdd: addChapter, onUpdate: updateChapter, onDelete: deleteChapter,
    };
    const examHandlers = {
        onAdd: addExam, onUpdate: updateExam, onDelete: deleteExam,
    };
    
    const gradeHandlers = {
        fetchChildren: getGradesByClass,
        onAdd: addGradeToClass,
        onUpdate: updateGradeInClass,
        onDelete: deleteGradeFromClass,
    }

    const settingTabs = [
        { id: 'general', label: 'General', icon: Settings },
        { id: 'api', label: 'API Keys', icon: KeyRound },
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'plans', label: 'Plans & Pricing', icon: DollarSign },
        { id: 'textbooks', label: 'Textbooks', icon: Book },
        { id: 'metafields', label: 'Content Metafields', icon: LayoutTemplate },
        { id: 'questionTypes', label: 'Question Types', icon: Type },
        { id: 'content', label: 'Content Details', icon: Library },
    ];
  
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
      <form onSubmit={form.handleSubmit(handleSave)}>
        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] lg:grid-cols-[220px_1fr] gap-8">
            {/* Sidebar */}
            <aside>
                <nav className="flex flex-col space-y-1">
                    {settingTabs.map(tab => (
                        <Button 
                            key={tab.id}
                            type="button"
                            variant="ghost" 
                            className={cn(
                                "w-full justify-start gap-2",
                                activeTab === tab.id && "bg-secondary text-secondary-foreground"
                            )}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </Button>
                    ))}
                </nav>
            </aside>
            {/* Content */}
            <div className="space-y-6">
                {activeTab === 'general' && (
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
                )}

                {activeTab === 'api' && (
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
                )}

                {activeTab === 'users' && (
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
                )}
                
                 {activeTab === 'plans' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Plans & Pricing</CardTitle>
                            <CardDescription>
                            Manage your subscription tiers and one-time purchases.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Pricing management UI will be built here.</p>
                        </CardContent>
                    </Card>
                )}
                
                {activeTab === 'textbooks' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Textbook Settings</CardTitle>
                            <CardDescription>
                                Global settings for textbook solutions and content.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="textbookOneTimePurchase"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">One-Time Purchase for Textbooks</FormLabel>
                                            <FormDescription>Enable to make textbooks a one-time paid product instead of part of a subscription.</FormDescription>
                                        </div>
                                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="freeChaptersPerBook"
                                render={({ field }) => (
                                    <FormItem className="p-4 border rounded-lg">
                                        <FormLabel className="text-base">Free Chapters per Book</FormLabel>
                                        <FormDescription>Set the number of initial chapters that are free for any user to access.</FormDescription>
                                        <FormControl><Input type="number" {...field} className="mt-2 w-24" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="practiceSetAttempts"
                                render={({ field }) => (
                                    <FormItem className="p-4 border rounded-lg">
                                        <FormLabel className="text-base">Practice Set Attempts</FormLabel>
                                        <FormDescription>Limit how many times a user can submit a practice set.</FormDescription>
                                        <FormControl><Input type="number" {...field} className="mt-2 w-24" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="practiceSetSubmissionLimit"
                                render={({ field }) => (
                                    <FormItem className="p-4 border rounded-lg">
                                        <FormLabel className="text-base">Total Practice Set Submissions</FormLabel>
                                        <FormDescription>Set a global limit on how many total practice sets a free user can submit.</FormDescription>
                                        <FormControl><Input type="number" {...field} className="mt-2 w-24" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="practiceSetPassMark"
                                render={({ field }) => (
                                    <FormItem className="p-4 border rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <FormLabel className="text-base">Practice Set Pass Mark</FormLabel>
                                                <FormDescription>The minimum percentage required to "pass" a practice set.</FormDescription>
                                            </div>
                                            <span className="font-bold text-lg">{field.value}%</span>
                                        </div>
                                        <FormControl>
                                            <Slider
                                                defaultValue={[field.value ?? 40]}
                                                max={100}
                                                step={1}
                                                onValueChange={(value) => field.onChange(value[0])}
                                                className="mt-3"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="gateChaptersOnPass"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Gate Chapters on Pass Mark</FormLabel>
                                            <FormDescription>Require users to pass the current chapter's practice set before unlocking the next one.</FormDescription>
                                        </div>
                                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="enablePracticeSetRetry"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Allow Practice Set Retries</FormLabel>
                                            <FormDescription>Let users retry a practice set after submitting it.</FormDescription>
                                        </div>
                                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                )}

                 {activeTab === 'metafields' && (
                     <Card>
                        <CardHeader>
                            <CardTitle>Content Metafield Settings</CardTitle>
                            <CardDescription className="flex justify-between items-center">
                               <span>Control which data fields are available and manage their options.</span>
                               <Dialog open={isAIGeneratorOpen} onOpenChange={setIsAIGeneratorOpen}>
                                   <DialogTrigger asChild>
                                       <Button variant="outline" size="sm"><Sparkles className="mr-2 h-4 w-4" /> Generate with AI</Button>
                                   </DialogTrigger>
                                   <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Generate Metadata with AI</DialogTitle>
                                            <DialogDescription>
                                                Select a metadata type, provide a topic, and let Gemini generate a list of items for you to add.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <Form {...aiForm}>
                                            <form onSubmit={aiForm.handleSubmit(handleAIGenerate)} className="space-y-4">
                                                <FormField control={aiForm.control} name="metafieldType" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Metadata Type</FormLabel>
                                                        <Select onValueChange={(value) => { field.onChange(value); aiForm.setValue('parentId', undefined); }} defaultValue={field.value}>
                                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="Subject">Subject</SelectItem>
                                                                <SelectItem value="Board">Board</SelectItem>
                                                                <SelectItem value="Class">Class</SelectItem>
                                                                <SelectItem value="State">State</SelectItem>
                                                                <SelectItem value="Exam Category">Exam Category</SelectItem>
                                                                <SelectItem value="Chapter">Chapter</SelectItem>
                                                                <SelectItem value="Exam">Exam</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />

                                                { (aiMetafieldType === 'Chapter' || aiMetafieldType === 'Exam') && (
                                                    <FormField control={aiForm.control} name="parentId" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{aiMetafieldType === 'Chapter' ? 'Parent Subject' : 'Parent Exam Category'}</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl><SelectTrigger><SelectValue placeholder={`Select a ${aiMetafieldType === 'Chapter' ? 'Subject' : 'Category'}`} /></SelectTrigger></FormControl>
                                                                <SelectContent>
                                                                    {(aiMetafieldType === 'Chapter' ? subjects : examTypes).map(item => (
                                                                        <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                )}

                                                <FormField control={aiForm.control} name="topic" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Topic / Keywords</FormLabel>
                                                        <FormControl><Input placeholder={aiMetafieldType === 'Chapter' ? `e.g., 'Introduction to Physics'` : `e.g., 'High School Science'`} {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                                 <FormField control={aiForm.control} name="count" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Number of Items to Generate</FormLabel>
                                                        <FormControl><Input type="number" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                                <DialogFooter>
                                                    <Button type="submit" disabled={isGenerating}>
                                                        {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><BrainCircuit className="mr-2 h-4 w-4"/>Generate</>}
                                                    </Button>
                                                </DialogFooter>
                                            </form>
                                        </Form>
                                        {generatedItems.length > 0 && (
                                            <div className="space-y-4 pt-4 border-t">
                                                <h4 className="font-medium">Generated Items</h4>
                                                <ScrollArea className="h-40 rounded-md border">
                                                    <div className="p-4 space-y-1">
                                                        {generatedItems.map((item, index) => <Badge key={index} variant="secondary">{item}</Badge>)}
                                                    </div>
                                                </ScrollArea>
                                                <Button onClick={handleAddGeneratedItems} className="w-full">
                                                    <PlusCircle className="mr-2 h-4 w-4"/> Add {generatedItems.length} Items
                                                </Button>
                                            </div>
                                        )}
                                   </DialogContent>
                               </Dialog>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
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
                                        defaultValue={form.watch('defaultBoard')}
                                        onSetDefault={(value) => form.setValue('defaultBoard', value)}
                                    />
                                </CardContent>
                            </Card>

                             <Card>
                                <CardHeader>
                                    <FormField
                                        control={form.control}
                                        name="enableClassMetafield"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">Class Categories</FormLabel>
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
                                        title="Classes"
                                        items={classes}
                                        onAdd={classHandlers.onAdd}
                                        onUpdate={classHandlers.onUpdate}
                                        onDelete={classHandlers.onDelete}
                                        defaultValue={form.watch('defaultClass')}
                                        onSetDefault={(value) => form.setValue('defaultClass', value)}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <FormLabel className="text-base flex items-center gap-2">
                                        <GraduationCap /> Grades
                                    </FormLabel>
                                    <FormDescription>Manage grades within each class category (e.g., "First Grade" inside "Primary").</FormDescription>
                                </CardHeader>
                                <CardContent>
                                    <DependentMetafieldManager
                                        parentTitle="Class Categories"
                                        childTitle="Grades"
                                        parentItems={classes}
                                        fetchChildren={gradeHandlers.fetchChildren}
                                        onAdd={gradeHandlers.onAdd}
                                        onUpdate={gradeHandlers.onUpdate}
                                        onDelete={gradeHandlers.onDelete}
                                        defaultValue={form.watch('defaultClass')}
                                        onSetDefault={(value) => form.setValue('defaultClass', value)}
                                    />
                                </CardContent>
                            </Card>
                            
                             <Card>
                                <CardHeader>
                                    <FormField
                                        control={form.control}
                                        name="enableStateMetafield"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">States</FormLabel>
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
                                        title="States"
                                        items={states}
                                        onAdd={stateHandlers.onAdd}
                                        onUpdate={stateHandlers.onUpdate}
                                        onDelete={stateHandlers.onDelete}
                                        defaultValue={form.watch('defaultState')}
                                        onSetDefault={(value) => form.setValue('defaultState', value)}
                                    />
                                </CardContent>
                            </Card>

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
                                        defaultValue={form.watch('defaultSubject')}
                                        onSetDefault={(value) => form.setValue('defaultSubject', value)}
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
                                        defaultValue={form.watch('defaultChapter')}
                                        onSetDefault={(value) => form.setValue('defaultChapter', value)}
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
                                        defaultValue={form.watch('defaultExamCategory')}
                                        onSetDefault={(value) => form.setValue('defaultExamCategory', value)}
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
                                        defaultValue={form.watch('defaultExam')}
                                        onSetDefault={(value) => form.setValue('defaultExam', value)}
                                    />
                                </CardContent>
                            </Card>

                        </CardContent>
                    </Card>
                )}

                {activeTab === 'questionTypes' && (
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
                )}

                 {activeTab === 'content' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Content Details</CardTitle>
                            <CardDescription>
                                A summary of the content on your site.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {contentSummary ? (
                                <ul className="space-y-2">
                                    <li className="flex justify-between font-semibold">
                                        <span>Total Content Items</span>
                                        <span>{totalContent}</span>
                                    </li>
                                    {Object.entries(contentSummary).map(([type, count]) => (
                                        <li key={type} className="flex justify-between border-t pt-2">
                                            <span className="text-muted-foreground">{type}</span>
                                            <span>{count}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p>No content has been created yet.</p>}
                        </CardContent>
                    </Card>
                )}


                <div className="col-span-full">
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        <Save className="mr-2 h-4 w-4" />
                        {form.formState.isSubmitting ? "Saving..." : "Save All Settings"}
                    </Button>
                </div>
            </div>
        </div>
      </form>
    </Form>
    </div>
  );
}
