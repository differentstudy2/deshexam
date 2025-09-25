
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/firebase/client';
import { collection, getDocs } from 'firebase/firestore';
import { Book, Layers, FileText, CheckSquare, Library } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

type Textbook = {
    id: string;
    title: string;
    description: string;
    subject: string;
    class: string;
    board?: string;
    featureImage?: string;
};

const TextbookStats = ({ textbookId }: { textbookId: string }) => {
    const [stats, setStats] = useState({ chapterCount: 0, topicCount: 0, practiceSetCount: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            let chapterCount = 0;
            let topicCount = 0;
            let practiceSetCount = 0;
            
            const chaptersRef = collection(db, 'textbooks', textbookId, 'chapters');
            const chaptersSnapshot = await getDocs(chaptersRef);
            chapterCount = chaptersSnapshot.size;

            for (const chapterDoc of chaptersSnapshot.docs) {
                const topicsRef = collection(chapterDoc.ref, "topics");
                const topicsSnapshot = await getDocs(topicsRef);
                topicCount += topicsSnapshot.size;

                 for (const topicDoc of topicsSnapshot.docs) {
                    const practiceSetsRef = collection(topicDoc.ref, "practiceSets");
                    const practiceSetsSnapshot = await getDocs(practiceSetsRef);
                    practiceSetCount += practiceSetsSnapshot.size;
                }
            }
            setStats({ chapterCount, topicCount, practiceSetCount });
            setLoading(false);
        };
        fetchStats();
    }, [textbookId]);

    if (loading) {
        return (
            <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
                <div className="flex flex-col items-center gap-1">
                    <Layers className="h-4 w-4" />
                    <span>... Chapters</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>... Topics</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <CheckSquare className="h-4 w-4" />
                    <span>... Sets</span>
                </div>
            </div>
        )
    }

    return (
        <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
            <div className="flex flex-col items-center gap-1">
                <Layers className="h-4 w-4" />
                <span>{stats.chapterCount} Chapters</span>
            </div>
            <div className="flex flex-col items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>{stats.topicCount} Topics</span>
            </div>
            <div className="flex flex-col items-center gap-1">
                <CheckSquare className="h-4 w-4" />
                <span>{stats.practiceSetCount} Sets</span>
            </div>
        </div>
    );
};

export default function TextbookSolutionsListPage() {
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTextbooks = async () => {
      setLoading(true);
      const textbooksCollectionRef = collection(db, 'textbooks');
      const querySnapshot = await getDocs(textbooksCollectionRef);
      
      const textbooksData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
      })) as Textbook[];

      setTextbooks(textbooksData);
      setLoading(false);
    };

    fetchTextbooks();
  }, []);

  if (loading) {
    return (
        <div className="container mx-auto py-8 space-y-6 max-w-7xl">
            <header className="text-center mb-12">
                <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">Textbook Solutions</h1>
                <p className="text-lg text-muted-foreground mt-2">
                Select a textbook to view its solutions, topics, and practice questions.
                </p>
            </header>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({length: 4}).map((_, i) => (
                    <Card key={i}><CardContent className="p-4"><Skeleton className="h-64 w-full" /></CardContent></Card>
                ))}
            </div>
        </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-7xl">
       <header className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">Textbook Solutions</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Select a textbook to view its solutions, topics, and practice questions.
        </p>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {textbooks.map((book) => (
          <Card key={book.id} className="overflow-hidden flex flex-col group">
            <div className="relative w-full h-48 overflow-hidden">
                <Image
                    src={book.featureImage || `https://picsum.photos/seed/${book.id}/400/300`}
                    alt={book.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
            </div>
            <CardContent className="p-4 flex-grow flex flex-col">
              <div className="flex flex-wrap gap-2 mb-2">
                  {book.subject && <Badge variant="secondary">{book.subject}</Badge>}
                  {book.class && <Badge variant="secondary">{book.class}</Badge>}
                  {book.board && <Badge variant="outline">{book.board}</Badge>}
              </div>
              <h3 className="font-bold text-lg flex items-center gap-2 flex-grow">{book.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2 min-h-[40px]">{book.description}</p>
              <TextbookStats textbookId={book.id} />
            </CardContent>
            <CardContent className="p-4 pt-0">
                <Button asChild className="w-full">
                    <Link href={`/textbook-solutions/${book.id}`}>View Solutions</Link>
                </Button>
            </CardContent>
          </Card>
        ))}
         {textbooks.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-10">
                <p>No textbooks found.</p>
            </div>
        )}
      </div>
    </div>
  );
}
