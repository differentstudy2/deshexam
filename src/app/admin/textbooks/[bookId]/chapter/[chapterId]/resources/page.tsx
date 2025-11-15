
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { db } from '@/lib/firebase/client';
import { uploadFile } from '@/lib/firebase/firestore';
import type { Chapter, Resource, Textbook } from '@/lib/types';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ArrowLeft, PlusCircle, Edit, Trash2, Video, File as FileIcon, Mic, Upload, Loader2, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import Image from "next/image";
import { ImageUploader } from "@/components/feature/image-uploader";


const ResourceItem = ({ resource, onEdit, onDelete }: { resource: Resource, onEdit: () => void, onDelete: () => void }) => {
    const getIcon = () => {
        switch(resource.type) {
            case 'video': return <Video className="w-5 h-5 text-muted-foreground" />;
            case 'audio': return <Mic className="w-5 h-5 text-muted-foreground" />;
            case 'pdf': return <FileIcon className="w-5 h-5 text-muted-foreground" />;
            default: return <LinkIcon className="w-5 h-5 text-muted-foreground" />;
        }
    }

    return (
        <div className="flex items-center gap-4 p-3 border rounded-md">
            {resource.featureImage && (
                <Image src={resource.featureImage} alt={resource.title} width={64} height={36} className="w-16 h-9 object-cover rounded-sm" />
            )}
            {!resource.featureImage && getIcon()}
            <div className="flex-grow">
                <p className="font-semibold">{resource.title}</p>
                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary truncate hover:underline">{resource.url}</a>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}><Edit className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete}><Trash2 className="w-4 h-4" /></Button>
        </div>
    )
}

export default function ManageResourcesPage() {
    const params = useParams();
    const textbookId = params.bookId as string;
    const chapterId = params.chapterId as string;
    const { toast } = useToast();

    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [loading, setLoading] = useState(true);
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingResource, setEditingResource] = useState<Resource | null>(null);
    const [newResource, setNewResource] = useState<{ type: 'video' | 'audio' | 'pdf' | 'doc', title: string, url: string, featureImage?: string }>({ type: 'video', title: '', url: '', featureImage: '' });
    const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchChapter = async () => {
        setLoading(true);
        const chapterRef = doc(db, `textbooks/${textbookId}/chapters`, chapterId);
        const chapterSnap = await getDoc(chapterRef);
        if(chapterSnap.exists()) {
            setChapter({ id: chapterSnap.id, ...chapterSnap.data() } as Chapter);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchChapter();
    }, [textbookId, chapterId]);

    const openResourceDialog = (resource: Resource | null) => {
        setEditingResource(resource);
        if (resource) {
            setNewResource({ type: resource.type, title: resource.title, url: resource.url, featureImage: resource.featureImage || '' });
        } else {
            setNewResource({ type: 'video', title: '', url: '', featureImage: '' });
        }
        setIsDialogOpen(true);
    }

    const handleSaveResource = async () => {
        if (!newResource.title || !newResource.url) {
            toast({ variant: 'destructive', title: 'Please fill all fields.' });
            return;
        }

        if(!chapter) return;

        let updatedResources;
        if (editingResource) {
            updatedResources = (chapter.resources || []).map(r => r.id === editingResource.id ? { ...editingResource, ...newResource } : r);
        } else {
            updatedResources = [...(chapter.resources || []), { ...newResource, id: new Date().getTime().toString() }];
        }

        try {
            const chapterRef = doc(db, `textbooks/${textbookId}/chapters`, chapterId);
            await updateDoc(chapterRef, { resources: updatedResources });
            setChapter(prev => prev ? {...prev, resources: updatedResources} : null);
            toast({ title: `Resource ${editingResource ? 'updated' : 'added'}.`});
        } catch(error) {
            toast({ variant: 'destructive', title: 'Error saving resource', description: (error as Error).message });
        } finally {
            setIsDialogOpen(false);
            setEditingResource(null);
        }
    }
    
    const handleDeleteResource = async () => {
        if (!resourceToDelete || !chapter?.resources) return;
        const updatedResources = chapter.resources.filter(r => r.id !== resourceToDelete.id);
        
        try {
            const chapterRef = doc(db, `textbooks/${textbookId}/chapters`, chapterId);
            await updateDoc(chapterRef, { resources: updatedResources });
            setChapter(prev => prev ? {...prev, resources: updatedResources} : null);
            toast({ title: 'Resource deleted.' });
        } catch(error) {
            toast({ variant: 'destructive', title: 'Error deleting resource', description: (error as Error).message });
        } finally {
            setResourceToDelete(null);
        }
    }

     const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            try {
                const downloadURL = await uploadFile(file);
                setNewResource(prev => ({...prev, url: downloadURL}));
                toast({ title: 'File uploaded!', description: 'URL has been set.' });
            } catch (error) {
                toast({ variant: 'destructive', title: 'Upload Failed', description: (error as Error).message });
            } finally {
                setIsUploading(false);
            }
        }
    };
    
    const getYouTubeId = (url: string) => {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    }

    const handleUrlBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const url = e.target.value;
        const ytId = getYouTubeId(url);
        if (ytId) {
            const thumbnailUrl = `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;
            const videoTitle = `YouTube Video: ${ytId}`; // Placeholder, can't fetch title client-side easily
            setNewResource(prev => ({...prev, featureImage: thumbnailUrl, title: prev.title || videoTitle}));
        }
    }


    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin w-8 h-8" /></div>
    }

    return (
        <div className="space-y-6">
            <div>
                <Button variant="ghost" asChild>
                    <Link href={`/admin/textbooks/${textbookId}/chapter/${chapterId}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Chapter Management
                    </Link>
                </Button>
            </div>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Additional Resources for "{chapter?.title}"</CardTitle>
                        <CardDescription>Manage supplementary materials like videos, PDFs, and audio files.</CardDescription>
                    </div>
                     <Button size="sm" onClick={() => openResourceDialog(null)}><PlusCircle className="mr-2"/> Add Resource</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {(chapter?.resources && chapter.resources.length > 0) ? (
                        chapter.resources.map(res => (
                            <ResourceItem
                                key={res.id}
                                resource={res}
                                onEdit={() => openResourceDialog(res)}
                                onDelete={() => setResourceToDelete(res)}
                            />
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground py-8">No resources added yet.</p>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingResource ? 'Edit' : 'Add'} Resource</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                         <div className="space-y-2">
                            <Label>Feature Image</Label>
                            <ImageUploader 
                                fieldName="featureImage"
                                onUrlChange={(url) => setNewResource(prev => ({...prev, featureImage: url}))}
                                value={newResource.featureImage}
                            />
                        </div>
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
                         <div className="space-y-2">
                            <Label>URL / File</Label>
                            <div className="flex gap-2">
                                <Input 
                                    placeholder="https://example.com/resource" 
                                    value={newResource.url} 
                                    onChange={(e) => setNewResource({...newResource, url: e.target.value})}
                                    onBlur={handleUrlBlur}
                                />
                                 <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                                    {isUploading ? <Loader2 className="animate-spin"/> : <Upload />}
                                 </Button>
                            </div>
                            <Input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                        <Button onClick={handleSaveResource}>Save Resource</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

             <AlertDialog open={!!resourceToDelete} onOpenChange={() => setResourceToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Delete Resource?</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete this resource?</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteResource} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
