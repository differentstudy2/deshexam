
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/firebase/client';
import type { Chapter, Solution, Textbook, Topic } from '@/lib/types';
import { collection, doc, getDoc, getDocs, query } from 'firebase/firestore';
import { ArrowLeft, BookOpen, FileText, CheckSquare } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function TextbookSolutionsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const textbookId = params.bookId as string;
  const router = useRouter();

  const [textbook, setTextbook] = useState<Textbook | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [topics, setTopics] = useState<{ [chapterId: string]: Topic[] }>({});
  const [loading, setLoading] = useState(true);

  const activeChapter = searchParams.get('chapter');
  const activeTopic = searchParams.get('topic');

  useEffect(() => {
    if (!textbookId) return;

    const fetchTextbookData = async () => {
      setLoading(true);
      const textbookDocRef = doc(db, 'textbooks', textbookId);
      const textbookDocSnap = await getDoc(textbookDocRef);

      if (textbookDocSnap.exists()) {
        setTextbook({ id: textbookDocSnap.id, ...textbookDocSnap.data() } as Textbook);
        
        const chaptersQuery = query(collection(db, `textbooks/${textbookId}/chapters`));
        const chaptersSnap = await getDocs(chaptersQuery);
        const chaptersData = chaptersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chapter));
        setChapters(chaptersData);

        const allTopics: { [key: string]: Topic[] } = {};

        for (const chapter of chaptersData) {
            const topicsQuery = query(collection(db, `textbooks/${textbookId}/chapters/${chapter.id}/topics`));
            const topicsSnap = await getDocs(topicsQuery);
            const topicsForChapter = topicsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Topic));
            
             // Fetch practice sets for each topic
            for (let topic of topicsForChapter) {
              const practiceSetsQuery = query(collection(db, `textbooks/${textbookId}/chapters/${chapter.id}/topics/${topic.id}/practiceSets`));
              const practiceSetsSnap = await getDocs(practiceSetsQuery);
              topic.practiceSets = practiceSetsSnap.docs.map(doc => ({ id: doc.id, title: doc.data().title }));
            }

            allTopics[chapter.id] = topicsForChapter;
        }
        setTopics(allTopics);

      } else {
        router.push('/');
      }
      setLoading(false);
    };

    fetchTextbookData();
  }, [textbookId, router]);
  
  const handleTopicSelect = (chapterId: string, topicId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('chapter', chapterId);
      params.set('topic', topicId);
      router.push(`?${params.toString()}`, { scroll: false });
  };
  
  const selectedTopicContent = activeChapter && activeTopic ? topics[activeChapter]?.find(t => t.id === activeTopic) : null;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!textbook) {
    return <div>Textbook not found</div>;
  }

  return (
    <div className="container mx-auto py-8 max-w-7xl">
       <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/textbook-solutions">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Textbooks
          </Link>
        </Button>
      </div>
      <header className="mb-8 text-center">
        <BookOpen className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 font-headline text-4xl font-bold">{textbook.title}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{textbook.description}</p>
        <div className="mt-2 flex justify-center gap-2">
            <Badge variant="secondary">{textbook.subject}</Badge>
            <Badge variant="secondary">{textbook.class}</Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8 items-start">
        <aside className="sticky top-20">
          <Card>
            <CardHeader>
              <CardTitle>Chapters</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible defaultValue={activeChapter ? `item-${activeChapter}` : undefined}>
                {chapters.map((chapter) => (
                  <AccordionItem value={`item-${chapter.id}`} key={chapter.id}>
                    <AccordionTrigger>{chapter.title}</AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-1">
                          {(topics[chapter.id] || []).map(topic => (
                              <li key={topic.id}>
                                  <Button 
                                      variant="ghost" 
                                      className={`w-full justify-start h-auto py-2 px-3 text-left font-normal ${activeTopic === topic.id ? 'bg-secondary' : ''}`}
                                      onClick={() => handleTopicSelect(chapter.id, topic.id)}
                                    >
                                    <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
                                    <span className="flex-grow">{topic.title}</span>
                                  </Button>
                              </li>
                          ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </aside>

        <main>
           {selectedTopicContent ? (
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">{selectedTopicContent.title}</CardTitle>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none">
                   <div dangerouslySetInnerHTML={{ __html: selectedTopicContent.content || '<p>No content available for this topic yet.</p>' }} />
                   
                   {selectedTopicContent.practiceSets && selectedTopicContent.practiceSets.length > 0 && (
                       <div className="mt-8">
                            <Separator />
                           <h3 className="mt-6 font-semibold text-lg">Practice Sets</h3>
                           <div className="space-y-2 mt-4">
                               {selectedTopicContent.practiceSets.map(ps => (
                                   <Card key={ps.id} className="p-4 flex justify-between items-center">
                                       <div className="flex items-center gap-3">
                                           <CheckSquare className="h-5 w-5 text-primary" />
                                           <span className="font-medium">{ps.title}</span>
                                       </div>
                                       <Button asChild>
                                           <Link href={`/textbook-solutions/practice-set/${ps.id}?textbook=${textbookId}&chapter=${activeChapter}&topic=${activeTopic}`}>
                                                Start Practice
                                           </Link>
                                       </Button>
                                   </Card>
                               ))}
                           </div>
                       </div>
                   )}
                </CardContent>
            </Card>
           ) : (
             <Card className="min-h-[60vh] flex items-center justify-center">
                <CardContent className="text-center text-muted-foreground">
                    <p>Select a chapter and topic from the left to view the content.</p>
                </CardContent>
            </Card>
           )}
        </main>
      </div>
    </div>
  );
}
