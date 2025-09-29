

'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Topic, PracticeSet, Resource } from '@/lib/types';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, PlusCircle, BookOpen, Edit, Trash2, Video, FileText, Mic, Upload, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { 
    addPracticeSetToTopic, 
    getPracticeSetsByTopicId, 
    uploadFile
} from '@/lib/firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';


export default function ManageTopicPage() {
    const params = useParams();
    const { toast } = useToast();

    const textbookId = params.bookId as string;
    const chapterId = params.chapterId as string;
    const topicId = params.topicId as string;
    
    const [topic, setTopic] = useState<Topic | null>(null);
    const [practiceSets, setPracticeSets] = useState<PracticeSet[]>([]);
    const [loading, setLoading] = useState(true);

    const [isPracticeSetDialogOpen, setIsPracticeSetDialogOpen] = useState(false);
    const [editingPracticeSet, setEditingPracticeSet] = useState<PracticeSet | null>(null);
    const [practiceSetTitle, setPracticeSetTitle] = useState('');

    const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
    const [editingResource, setEditingResource] = useState<Resource | null>(null);
    const [newResource, setNewResource] = useState<{ type: 'video' | 'audio' | 'pdf' | 'doc', title: string, url: string }>({ type: 'video', title: '', url: '' });
    const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [resourcesLoading, setResourcesLoading] = useState(false);
    const [resourcesFetched, setResourcesFetched] = useState(false);

    const fetchData = async () => {
        if (!textbookId || !chapterId || !topicId) return;
        setLoading(true);

        const topicRef = doc(db, `textbooks/${textbookId}/chapters/${chapterId}/topics`, topicId);
        const topicSnap = await getDoc(topicRef);
        if (topicSnap.exists()) {
             const topicData = { id: topicSnap.id, ...topicSnap.data() } as Topic;
            // Initially, don't load resources
            delete (topicData as any).resources;
            setTopic(topicData);
        }

        const fetchedPracticeSets = await getPracticeSetsByTopicId(textbookId, chapterId, topicId);
        setPracticeSets(fetchedPracticeSets as PracticeSet[]);

        setLoading(false);
    };

    const fetchResources = async () => {
        if (!topicId || resourcesFetched) return;
        setResourcesLoading(true);
        try {
            const topicRef = doc(db, `textbooks/${textbookId}/chapters/${chapterId}/topics`, topicId);
            const topicSnap = await getDoc(topicRef);
            if (topicSnap.exists()) {
                const topicData = topicSnap.data() as Topic;
                setTopic(prev => prev ? { ...prev, resources: topicData.resources || [] } : null);
                setResourcesFetched(true);
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Failed to load resources', description: (error as Error).message });
        } finally {
            setResourcesLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [textbookId, chapterId, topicId]);

    const handleOpenPracticeSetDialog = (ps: PracticeSet | null) => {
        setEditingPracticeSet(ps);
        setPracticeSetTitle(ps ? ps.title : '');
        setIsPracticeSetDialogOpen(true);
    }

    const handleAddOrUpdatePracticeSet = async () => {
        if (!practiceSetTitle.trim()) return;
        try {
            if (editingPracticeSet) {
                const psRef = doc(db, `textbooks/${textbookId}/chapters/${chapterId}/topics/${topicId}/practiceSets`, editingPracticeSet.id);
                await updateDoc(psRef, { title: practiceSetTitle });
                toast({ title: 'Practice Set Updated' });
            } else {
                await addPracticeSetToTopic(textbookId, chapterId, topicId, { title: practiceSetTitle });
                toast({ title: 'Practice Set Added' });
            }

            setPracticeSetTitle('');
            setIsPracticeSetDialogOpen(false);
            setEditingPracticeSet(null);
            fetchData();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: (error as Error).message });
        }
    }

    const handleOpenResourceDialog = (resource: Resource | null) => {
        setEditingResource(resource);
        if (resource) {
            setNewResource({ type: resource.type, title: resource.title, url: resource.url });
        } else {
            setNewResource({ type: 'video', title: '', url: '' });
        }
        setIsResourceDialogOpen(true);
    };
    
    const handleSaveResource = async () => {
        if (!newResource.title || !newResource.url || !topic) {
            toast({ variant: 'destructive', title: 'Please fill all fields.' });
            return;
        }
    
        try {
            const topicRef = doc(db, `textbooks/${textbookId}/chapters/${chapterId}/topics`, topicId);
            
            // It's safer to fetch the latest resources directly from state if available, or fetch fresh.
            const currentResources = topic.resources || [];
            let updatedResources;
            
            if (editingResource) {
                updatedResources = currentResources.map((r) => r.id === editingResource.id ? { ...newResource, id: editingResource.id } : r);
            } else {
                updatedResources = [...currentResources, { ...newResource, id: new Date().getTime().toString() }];
            }
            
            await updateDoc(topicRef, { resources: updatedResources });
    
            toast({ title: `Resource ${editingResource ? 'updated' : 'added'}` });
            setIsResourceDialogOpen(false);
            setEditingResource(null);
            
            // Manually update local state and force a UI refresh
            setTopic(prev => prev ? { ...prev, resources: updatedResources } : null);
            setResourcesFetched(true);
    
        } catch (error) {
            toast({ variant: 'destructive', title: 'Failed to save resource', description: (error as Error).message });
        }
    };
    
    const handleDeleteResource = async () => {
        if (!resourceToDelete || !topic) return;
        try {
            const topicRef = doc(db, `textbooks/${textbookId}/chapters/${chapterId}/topics`, topicId);
            const updatedResources = (topic.resources || []).filter(r => r.id !== resourceToDelete.id);
            await updateDoc(topicRef, { resources: updatedResources });
            toast({ title: 'Resource Deleted' });
            setResourceToDelete(null);
            
            // Manually update local state
            setTopic(prev => prev ? { ...prev, resources: updatedResources } : null);

        } catch (error) {
            toast({ variant: 'destructive', title: 'Failed to delete resource', description: (error as Error).message });
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            try {
                const downloadURL = await uploadFile(file);
                setNewResource(prev => ({...prev, url: downloadURL}));
                toast({ title: 'File uploaded!', description: 'URL has been set. Click Save.' });
            } catch (error) {
                toast({ variant: 'destructive', title: 'Upload Failed', description: (error as Error).message });
            } finally {
                setIsUploading(false);
            }
        }
    };

     const getResourceIcon = (type: string) => {
        switch (type) {
        case 'video': return <Video className="w-4 h-4 text-muted-foreground" />;
        case 'audio': return <Mic className="w-4 h-4 text-muted-foreground" />;
        case 'pdf': return <FileText className="w-4 h-4 text-muted-foreground" />;
        case 'doc': return <FileText className="w-4 h-4 text-muted-foreground" />;
        default: return <FileText className="w-4 h-4 text-muted-foreground" />;
        }
    };

    if (loading) return <div className="flex items-center justify-center h-full">Loading...</div>

    return (
        <div className="space-y-6">
            <div>
                <Button variant="ghost" asChild>
                    <Link href={`/admin/textbooks/${textbookId}/chapter/${chapterId}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Topics
                    </Link>
                </Button>
            </div>
            <header>
                <h1 className="font-headline text-3xl font-bold">Manage Topic: <span className="text-primary">{topic?.title}</span></h1>
                 <p className="text-muted-foreground mt-1">Here you can add and manage practice sets and resources for this topic.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                 <Accordion type="single" collapsible className="w-full" onValueChange={(value) => { if(value) fetchResources() }}>
                    <AccordionItem value="resources">
                        <Card>
                             <CardHeader>
                                <AccordionTrigger className="w-full justify-between">
                                    <CardTitle>Additional Resources</CardTitle>
                                </AccordionTrigger>
                            </CardHeader>
                            <AccordionContent>
                                <CardContent>
                                    {resourcesLoading ? (
                                        <div className="flex justify-center p-4">
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                        </div>
                                    ) : (
                                        <>
                                            {topic?.resources && topic.resources.length > 0 ? (
                                                <ul className="space-y-2">
                                                    {topic.resources.map(res => (
                                                        <li key={res.id} className="flex items-center p-2 border rounded-md gap-2">
                                                            {getResourceIcon(res.type)}
                                                            <span className="flex-grow font-medium text-sm truncate">{res.title}</span>
                                                            <Button variant="ghost" size="sm" onClick={() => handleOpenResourceDialog(res)}><Edit className="w-4 h-4"/></Button>
                                                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setResourceToDelete(res)}><Trash2 className="w-4 h-4"/></Button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-muted-foreground text-center py-8">No resources added yet.</p>
                                            )}
                                            <Button size="sm" className="mt-4" onClick={() => handleOpenResourceDialog(null)}><PlusCircle className="mr-2"/> Add Resource</Button>
                                        </>
                                    )}
                                </CardContent>
                            </AccordionContent>
                        </Card>
                    </AccordionItem>
                </Accordion>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Practice Sets</CardTitle>
                            <CardDescription>Manage the practice sets associated with this topic.</CardDescription>
                        </div>
                        <Button size="sm" onClick={() => handleOpenPracticeSetDialog(null)}><PlusCircle className="mr-2"/> Add Practice Set</Button>
                    </CardHeader>
                    <CardContent>
                        {practiceSets.length > 0 ? (
                            <ul className="space-y-2">
                                {practiceSets.map(ps => (
                                    <li key={ps.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-md gap-2">
                                        <div className="flex-grow flex items-center gap-2">
                                            <span className="font-medium">{ps.title}</span>
                                            {(ps as any).questionCount > 0 && <Badge variant="secondary">{(ps as any).questionCount} questions</Badge>}
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/admin/textbooks/${textbookId}/chapter/${chapterId}/topic/${topicId}/practice-set/${ps.id}`}>
                                                    Manage Questions
                                                </Link>
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => handleOpenPracticeSetDialog(ps)}>
                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                            </Button>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/textbook-solutions/practice-set/${ps.id}?textbook=${textbookId}&chapter=${chapterId}&topic=${topicId}`} target="_blank">
                                                    <BookOpen className="mr-2 h-4 w-4"/> Preview
                                                </Link>
                                            </Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground text-center py-8">No practice sets created for this topic yet.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
           

            <Dialog open={isPracticeSetDialogOpen} onOpenChange={setIsPracticeSetDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingPracticeSet ? 'Edit Practice Set' : 'Add New Practice Set'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 py-4">
                        <Label htmlFor="practice-set-title">Title</Label>
                        <Input id="practice-set-title" value={practiceSetTitle} onChange={(e) => setPracticeSetTitle(e.target.value)} />
                    </div>
                    <DialogFooter>
                         <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                        <Button onClick={handleAddOrUpdatePracticeSet}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

             <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingResource ? 'Edit' : 'Add'} Resource</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                             <Label>Resource Type</Label>
                            <Select value={newResource.type} onValueChange={(v) => setNewResource({...newResource, type: v as any})}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="video">Video</SelectItem>
                                    <SelectItem value="audio">Audio</SelectItem>
                                    <SelectItem value="pdf">PDF</SelectItem>
                                    <SelectItem value="doc">Document</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                             <Label>Title</Label>
                            <Input placeholder="Resource Title" value={newResource.title} onChange={(e) => setNewResource({...newResource, title: e.target.value})} />
                         </div>
                         <Tabs defaultValue="url">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="url">From URL</TabsTrigger>
                                <TabsTrigger value="upload">Upload File</TabsTrigger>
                            </TabsList>
                            <TabsContent value="url" className="pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="resource-url">URL</Label>
                                    <Input id="resource-url" placeholder="https://example.com/resource" value={newResource.url} onChange={(e) => setNewResource({...newResource, url: e.target.value})} />
                                </div>
                            </TabsContent>
                            <TabsContent value="upload" className="pt-4">
                                 <div 
                                    className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer hover:border-primary"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className="space-y-1 text-center">
                                        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">Click to upload a file</p>
                                        <p className="text-xs text-muted-foreground">Video, Audio, PDF, DOC up to 50MB</p>
                                    </div>
                                </div>
                                <Input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                                {isUploading && <div className="mt-2 flex items-center justify-center text-sm"><Loader2 className="animate-spin mr-2" /> Uploading...</div>}
                            </TabsContent>
                         </Tabs>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                        <Button onClick={handleSaveResource}>Save Resource</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!resourceToDelete} onOpenChange={() => setResourceToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Resource?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete the resource "{resourceToDelete?.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteResource}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
