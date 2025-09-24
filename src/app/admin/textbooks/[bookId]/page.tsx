
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
import type { Textbook, Chapter } from '@/lib/types';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
} from 'firebase/firestore';
import { ArrowLeft, PlusCircle, Edit } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function ManageChaptersPage() {
  const params = useParams();
  const textbookId = params.bookId as string;

  const [textbook, setTextbook] = useState<Textbook | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [newChapter, setNewChapter] = useState({ title: '', content: '' });
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!textbookId) return;

    const fetchTextbookAndChapters = async () => {
      setLoading(true);
      // Fetch textbook details
      const textbookDocRef = doc(db, 'textbooks', textbookId);
      const textbookDocSnap = await getDoc(textbookDocRef);
      if (textbookDocSnap.exists()) {
        setTextbook({ id: textbookDocSnap.id, ...textbookDocSnap.data() } as Textbook);
      } else {
        console.error('No such textbook!');
      }

      // Fetch chapters
      const chaptersQuery = query(collection(db, 'textbooks', textbookId, 'chapters'));
      const querySnapshot = await getDocs(chaptersQuery);
      const chaptersData = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Chapter)
      );
      setChapters(chaptersData);
      setLoading(false);
    };

    fetchTextbookAndChapters();
  }, [textbookId]);

  const handleAddOrUpdateChapter = async () => {
    if (!newChapter.title.trim()) return;
    try {
        const chaptersCollectionRef = collection(db, 'textbooks', textbookId, 'chapters');
        
        if (editingChapter) {
            // Update logic
            const chapterDocRef = doc(chaptersCollectionRef, editingChapter.id);
            await updateDoc(chapterDocRef, newChapter);
            setChapters(chapters.map(c => c.id === editingChapter.id ? { ...c, ...newChapter, topics: c.topics } : c));
            setEditingChapter(null);
        } else {
            // Add logic
            const docRef = await addDoc(chaptersCollectionRef, newChapter);
            setChapters([...chapters, { id: docRef.id, ...newChapter, topics: [] }]);
        }
        setNewChapter({ title: '', content: '' });

    } catch (error) {
      console.error('Error saving chapter: ', error);
    }
  };

  const handleEditClick = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setNewChapter({ title: chapter.title, content: chapter.content || '' });
  };
  
  const handleCancelEdit = () => {
    setEditingChapter(null);
    setNewChapter({ title: '', content: '' });
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!textbook) {
    return <div>Textbook not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" asChild>
          <Link href="/admin/textbooks">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Textbooks
          </Link>
        </Button>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">
            Manage Chapters for <span className="text-primary">{textbook.title}</span>
          </h1>
          <p className="text-muted-foreground">
            Add, edit, and manage chapters for this textbook.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{editingChapter ? 'Edit Chapter' : 'Add New Chapter'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="chapter-title">Chapter Title</Label>
                <Input
                id="chapter-title"
                placeholder="e.g., Chapter 1: Electric Charges"
                value={newChapter.title}
                onChange={(e) => setNewChapter({...newChapter, title: e.target.value})}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="chapter-content">Chapter Content</Label>
                <Textarea
                id="chapter-content"
                placeholder="Add a summary or introduction for the chapter."
                value={newChapter.content || ''}
                onChange={(e) => setNewChapter({...newChapter, content: e.target.value})}
                />
            </div>
             <div className="flex gap-2">
              <Button onClick={handleAddOrUpdateChapter}>
                {editingChapter ? 'Update Chapter' : <><PlusCircle className="mr-2 h-4 w-4" /> Add Chapter</>}
              </Button>
              {editingChapter && (
                <Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Chapters</CardTitle>
            <CardDescription>
              A list of all chapters in this textbook.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chapters.length > 0 ? (
              <ul className="space-y-2">
                {chapters.map((chapter) => (
                  <li
                    key={chapter.id}
                    className="flex items-center justify-between rounded-md border p-3 gap-2"
                  >
                    <span className="truncate pr-2">{chapter.title}</span>
                    <div className="flex-shrink-0 flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(chapter)}>
                            <Edit className="h-3 w-3 mr-1"/>
                            Edit
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/textbooks/${textbookId}/chapter/${chapter.id}`}>Manage Topics</Link>
                        </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                No chapters added yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
