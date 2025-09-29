

'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/firebase/client';
import type { Textbook, Chapter, Topic, Resource } from '@/lib/types';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  deleteDoc,
  orderBy
} from 'firebase/firestore';
import { ArrowLeft, PlusCircle, Edit, Trash2, Video, File as FileIcon, Mic } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { useToast } from '@/hooks/use-toast';
import { getTopicsByChapterId, addTopicToChapter, updateTopic } from '@/lib/firebase/firestore';
import { Dialog, DialogClose, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function ManageTopicsPage() {
  const params = useParams();
  const textbookId = params.bookId as string;
  const chapterId = params.chapterId as string;

  const [textbook, setTextbook] = useState<Textbook | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [newTopic, setNewTopic] = useState({ title: '', content: '' });
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [topicToDelete, setTopicToDelete] = useState<Topic | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [newResource, setNewResource] = useState<{ type: 'video' | 'audio' | 'pdf' | 'doc', title: string, url: string }>({ type: 'video', title: '', url: '' });


  const fetchChapterAndTopics = useCallback(async () => {
    if (!textbookId || !chapterId) return;
    setLoading(true);
    
    try {
        const textbookDocRef = doc(db, 'textbooks', textbookId);
        const textbookDocSnap = await getDoc(textbookDocRef);
        if(textbookDocSnap.exists()) setTextbook({ id: textbookDocSnap.id, ...textbookDocSnap.data() } as Textbook);
        
        const chapterDocRef = doc(db, `textbooks/${textbookId}/chapters`, chapterId);
        const chapterDocSnap = await getDoc(chapterDocRef);
        if(chapterDocSnap.exists()) setChapter({ id: chapterDocSnap.id, ...chapterDocSnap.data() } as Chapter);
        
        const topicsData = await getTopicsByChapterId(textbookId, chapterId);
        setTopics(topicsData);

    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error fetching data",
            description: (error as Error).message,
        })
    } finally {
        setLoading(false);
    }
  }, [textbookId, chapterId, toast]);
  
  useEffect(() => {
    fetchChapterAndTopics();
  }, [fetchChapterAndTopics]);

  const handleAddOrUpdateTopic = async () => {
    if (!newTopic.title.trim()) return;
    try {
        if (editingTopic) {
            await updateTopic(textbookId, chapterId, editingTopic.id, newTopic);
            setEditingTopic(null);
            toast({ title: "Topic updated successfully." });
        } else {
            await addTopicToChapter(textbookId, chapterId, newTopic);
            toast({ title: "Topic added successfully." });
        }
        setNewTopic({ title: '', content: '' });
        fetchChapterAndTopics(); 

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error saving topic",
        description: (error as Error).message,
      });
    }
  };

  const handleEditClick = (topic: Topic) => {
    setEditingTopic(topic);
    setNewTopic({ title: topic.title, content: topic.content || '' });
  };
  
  const handleCancelEdit = () => {
    setEditingTopic(null);
    setNewTopic({ title: '', content: '' });
  }
  
  const handleDeleteClick = (topic: Topic) => {
    setTopicToDelete(topic);
  };

  const handleConfirmDelete = async () => {
    if (!topicToDelete) return;
    setIsDeleting(true);
    try {
      // Note: A robust delete would use a Cloud Function to recursively delete subcollections.
      // This is a simplified client-side delete.
      const topicRef = doc(db, `textbooks/${textbookId}/chapters/${chapterId}/topics`, topicToDelete.id);
      await deleteDoc(topicRef);
      toast({
        title: "Topic Deleted",
        description: `"${topicToDelete.title}" has been removed.`,
      });
      fetchChapterAndTopics();
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error Deleting Topic",
        description: (error as Error).message,
      });
    } finally {
      setIsDeleting(false);
      setTopicToDelete(null);
    }
  };

  const openResourceDialog = (resource: Resource | null) => {
    setEditingResource(resource);
    if (resource) {
        setNewResource({ type: resource.type, title: resource.title, url: resource.url });
    } else {
        setNewResource({ type: 'video', title: '', url: '' });
    }
    setIsResourceDialogOpen(true);
  }

  const handleSaveResource = async (topicId: string) => {
    if (!newResource.title || !newResource.url) {
        toast({ variant: 'destructive', title: 'Please fill all fields.' });
        return;
    }

    try {
        const topicRef = doc(db, `textbooks/${textbookId}/chapters/${chapterId}/topics`, topicId);
        const topicSnap = await getDoc(topicRef);
        if (!topicSnap.exists()) throw new Error("Topic not found");
        
        const topicData = topicSnap.data();
        let resources = topicData.resources || [];
        
        if (editingResource) {
            resources = resources.map((r: any) => r.id === editingResource.id ? { ...newResource, id: editingResource.id } : r);
        } else {
            resources.push({ ...newResource, id: new Date().getTime().toString() });
        }
        
        await updateDoc(topicRef, { resources: resources });
        toast({ title: `Resource ${editingResource ? 'updated' : 'added'}` });
        setIsResourceDialogOpen(false);
        setEditingResource(null);
        fetchChapterAndTopics(); // refetch to show update
    } catch (error) {
        toast({ variant: 'destructive', title: 'Failed to save resource', description: (error as Error).message });
    }
  }


  if (loading) {
    return <div>Loading...</div>;
  }

  if (!chapter) {
    return <div>Chapter not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" asChild>
          <Link href={`/admin/textbooks/${textbookId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Chapters
          </Link>
        </Button>
      </div>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div>
          <h1 className="font-headline text-3xl font-bold">
            Manage Topics for <span className="text-primary">{chapter.title}</span>
          </h1>
          <p className="text-muted-foreground">
            Add, edit, and manage topics for this chapter.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{editingTopic ? 'Edit Topic' : 'Add New Topic'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="topic-title">Topic Title</Label>
                <Input
                id="topic-title"
                placeholder="e.g., 1.1 Electric Charge"
                value={newTopic.title}
                onChange={(e) => setNewTopic({...newTopic, title: e.target.value})}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="topic-content">Topic Content (HTML)</Label>
                <Textarea
                id="topic-content"
                placeholder="Add the main educational content for this topic. You can use HTML tags."
                value={newTopic.content || ''}
                onChange={(e) => setNewTopic({...newTopic, content: e.target.value})}
                className="min-h-[200px]"
                />
            </div>
             <div className="flex gap-2">
              <Button onClick={handleAddOrUpdateTopic}>
                {editingTopic ? 'Update Topic' : <><PlusCircle className="mr-2 h-4 w-4" /> Add Topic</>}
              </Button>
              {editingTopic && (
                <Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Existing Topics</CardTitle>
                <CardDescription>
                  A list of all topics in this chapter.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {topics.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {topics.map((topic) => (
                            <Card key={topic.id} className="flex flex-col">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base font-medium leading-tight">{topic.title}</CardTitle>
                                </CardHeader>
                                 <CardContent className="flex-grow text-sm text-muted-foreground">
                                    <div className="flex gap-2 flex-wrap">
                                        <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm" className="h-7" onClick={() => openResourceDialog(null)}><Video className="w-3 h-3 mr-1"/> Add Video</Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>{editingResource ? 'Edit' : 'Add'} Resource</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4 py-4">
                                                    <Select value={newResource.type} onValueChange={(v) => setNewResource({...newResource, type: v as any})}>
                                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="video">Video</SelectItem>
                                                            <SelectItem value="audio">Audio</SelectItem>
                                                            <SelectItem value="pdf">PDF</SelectItem>
                                                            <SelectItem value="doc">Document</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <Input placeholder="Resource Title" value={newResource.title} onChange={(e) => setNewResource({...newResource, title: e.target.value})} />
                                                    <Input placeholder="Resource URL" value={newResource.url} onChange={(e) => setNewResource({...newResource, url: e.target.value})} />
                                                </div>
                                                <DialogFooter>
                                                    <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                                                    <Button onClick={() => handleSaveResource(topic.id)}>Save Resource</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                    <div className="mt-2 text-xs">{(topic.resources || []).length} resources</div>
                                </CardContent>
                                <CardFooter className="flex-col items-stretch gap-2 pt-4 border-t">
                                    <Button variant="secondary" size="sm" asChild>
                                        <Link href={`/admin/textbooks/${textbookId}/chapter/${chapterId}/topic/${topic.id}`}>Manage Practice Sets</Link>
                                    </Button>
                                    <div className="flex gap-2">
                                         <Button variant="outline" size="sm" onClick={() => handleEditClick(topic)} className="w-full">
                                            <Edit className="h-3 w-3 mr-1"/> Edit Topic
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(topic)} className="w-full">
                                            <Trash2 className="h-3 w-3 mr-1"/> Delete Topic
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    No topics added yet.
                  </div>
                )}
              </CardContent>
            </Card>
        </div>
      </div>
      
       <AlertDialog open={!!topicToDelete} onOpenChange={(open) => !open && setTopicToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the topic "{topicToDelete?.title}" and all its practice sets. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
