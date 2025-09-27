
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/firebase/client';
import type { Textbook, Chapter, Topic } from '@/lib/types';
import { addTopicToChapter, getTopicsByChapterId, updateTopic } from '@/lib/firebase/firestore';
import {
  collection,
  doc,
  getDoc,
} from 'firebase/firestore';
import { ArrowLeft, PlusCircle, Edit } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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

  useEffect(() => {
    if (!textbookId || !chapterId) return;

    const fetchDetails = async () => {
      setLoading(true);

      const textbookDocRef = doc(db, 'textbooks', textbookId);
      const textbookDocSnap = await getDoc(textbookDocRef);
      if (textbookDocSnap.exists()) {
        setTextbook({ id: textbookDocSnap.id, ...textbookDocSnap.data() } as Textbook);
      } else {
        console.error('No such textbook!');
      }

      const chapterDocRef = doc(db, `textbooks/${textbookId}/chapters`, chapterId);
      const chapterDocSnap = await getDoc(chapterDocRef);
      if (chapterDocSnap.exists()) {
        setChapter({ id: chapterDocSnap.id, ...chapterDocSnap.data() } as Chapter);
      } else {
        console.error('No such chapter!');
      }

      const topicsData = await getTopicsByChapterId(textbookId, chapterId);
      setTopics(topicsData as Topic[]);

      setLoading(false);
    };

    fetchDetails();
  }, [textbookId, chapterId]);

  const handleAddOrUpdateTopic = async () => {
    if (!newTopic.title.trim()) return;

    try {
        if (editingTopic) {
            // Update
            await updateTopic(textbookId, chapterId, editingTopic.id, newTopic);
            setTopics(topics.map(t => t.id === editingTopic.id ? { ...t, ...newTopic, practiceSets: t.practiceSets } : t));
            setEditingTopic(null);
        } else {
            // Add
            const newId = await addTopicToChapter(textbookId, chapterId, newTopic);
            setTopics([...topics, { id: newId, ...newTopic, practiceSets: [] }]);
        }
        setNewTopic({ title: '', content: '' });

    } catch (error) {
      console.error('Error saving topic: ', error);
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!textbook || !chapter) {
    return <div>Textbook or Chapter not found.</div>;
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
      <div className="flex items-center justify-between">
        <div>
           <h1 className="font-headline text-3xl font-bold">
            Manage Topics for <span className="text-primary">{chapter.title}</span>
          </h1>
          <p className="text-muted-foreground">
            Textbook: {textbook.title}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card>
          <CardHeader>
            <CardTitle>{editingTopic ? 'Edit Topic' : 'Add New Topic'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic-title">Topic Title</Label>
              <Input
                id="topic-title"
                placeholder="e.g., Electric Field Lines"
                value={newTopic.title}
                onChange={(e) => setNewTopic({...newTopic, title: e.target.value})}
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="topic-content">Original Book Content</Label>
              <Textarea
                id="topic-content"
                placeholder="Paste the original content from the book for this topic."
                className="min-h-[150px]"
                value={newTopic.content || ''}
                onChange={(e) => setNewTopic({...newTopic, content: e.target.value})}
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

        <Card>
          <CardHeader>
            <CardTitle>Existing Topics</CardTitle>
            <CardDescription>
              A list of all topics in this chapter.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topics.length > 0 ? (
              <ul className="space-y-2">
                {topics.map((topic) => (
                  <li
                    key={topic.id}
                    className="flex items-center justify-between rounded-md border p-3 gap-2"
                  >
                    <span className="truncate pr-4">{topic.title}</span>
                    <div className="flex-shrink-0 flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(topic)}>
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/textbooks/${textbookId}/chapter/${chapterId}/topic/${topic.id}`}>
                            Manage Questions
                        </Link>
                        </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                No topics added yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
