
'use client';

import { Suspense, useEffect, useState, useMemo, useCallback } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { db } from '@/lib/firebase/client';
import type { Chapter, Topic, Textbook, Question, Resource } from '@/lib/types';
import { collection, doc, getDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { ArrowLeft, BookOpen, FileText, CheckSquare, Loader2, Menu, ChevronRight, Lock, Award, Video, Mic, File as FileIcon, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { getTopicsByChapterId } from '@/lib/firebase/firestore';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ResourceViewerDialog } from '@/components/feature/resource-viewer-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

function TextbookMainContent() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    
    const textbookId = params.bookId as string;

    const [textbook, setTextbook] = useState<Textbook | null>(null);
    const [chaptersWithTopics, setChaptersWithTopics] = useState<(Chapter & {topics: Topic[]})[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const textbookDocRef = doc(db, 'textbooks', textbookId);
                const textbookDocSnap = await getDoc(textbookDocRef);

                if (!textbookDocSnap.exists()) {
                    toast({ variant: 'destructive', title: 'Textbook not found.' });
                    router.push('/textbook-solutions');
                    return;
                }
                setTextbook({ id: textbookDocSnap.id, ...textbookDocSnap.data() } as Textbook);

                const chaptersQuery = query(collection(db, `textbooks/${textbookId}/chapters`));
                const chaptersSnap = await getDocs(chaptersQuery);
                const chaptersData = chaptersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chapter));
                chaptersData.sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }));

                const chaptersWithTopicsData = await Promise.all(chaptersData.map(async (chapter) => {
                    const topicsData = await getTopicsByChapterId(textbookId, chapter.id);
                    return { ...chapter, topics: topicsData };
                }));

                setChaptersWithTopics(chaptersWithTopicsData);

            } catch (e) {
                toast({ variant: "destructive", title: "Error loading textbook content", description: (e as Error).message });
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [textbookId, toast, router]);
    
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
                <Loader2 className="w-8 h-8 animate-spin"/>
                <p className="ml-2">Loading Chapters...</p>
            </div>
        );
    }
    
    const ChapterIcon = ({index}: {index: number}) => {
        const icons = [<BookOpen />, <FileText />, <CheckSquare />, <Award />, <Video/>, <Mic/>];
        return icons[index % icons.length];
    };

    return (
      <div className="bg-secondary/30 min-h-screen">
        <div className="container mx-auto px-4 py-12">
            <header className="mb-8 flex flex-col md:flex-row items-center gap-6 md:gap-8 rounded-lg bg-card p-6">
                <Image 
                    src={textbook?.featureImage || `https://picsum.photos/seed/${textbookId}/200/280`}
                    alt={textbook?.title || 'Textbook Cover'}
                    width={150}
                    height={210}
                    className="rounded-md shadow-lg object-cover w-[120px] h-[170px] md:w-[150px] md:h-[210px]"
                />
                <div className="text-center md:text-left">
                    <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">{textbook?.title}</h1>
                    {textbook?.description && <p className="mt-2 text-muted-foreground max-w-2xl">{textbook.description}</p>}
                    <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                        {textbook?.board && <Badge variant="outline">{textbook.board}</Badge>}
                        {textbook?.class && <Badge variant="outline">{textbook.class}</Badge>}
                        {textbook?.subject && <Badge variant="secondary">{textbook.subject}</Badge>}
                    </div>
                </div>
            </header>
            
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {chaptersWithTopics.map((chapter, index) => (
                    <Card key={chapter.id} className="flex flex-col">
                        <CardHeader className="bg-primary text-primary-foreground p-4 flex-row items-center gap-3">
                            <ChapterIcon index={index} />
                            <CardTitle className="text-lg font-semibold">{chapter.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-grow">
                           <ul className="divide-y">
                               {chapter.topics.map(topic => (
                                   <li key={topic.id}>
                                       <Link href={`/textbook-solutions/${textbookId}/chapter/${chapter.id}/topic/${topic.id}`} className="flex items-center gap-3 p-3 text-sm hover:bg-accent/50 transition-colors">
                                            <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                            <span className="flex-grow">{topic.title}</span>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                       </Link>
                                   </li>
                               ))}
                               {chapter.topics.length === 0 && <p className="p-4 text-sm text-center text-muted-foreground">No topics in this chapter.</p>}
                           </ul>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
      </div>
    );
}

// This is the new layout component
const TextbookSolutionsLayout = ({ children }: { children: React.ReactNode }) => {
    const params = useParams();
    const hasChapterId = !!params.chapterId;

    if (hasChapterId) {
        return <>{children}</>;
    }

    return <TextbookMainContent />;
}


export default function TextbookSolutionsPage({ children }: { children: React.ReactNode }) {
    return <Suspense fallback={<div>Loading...</div>}><TextbookSolutionsLayout>{children}</TextbookSolutionsLayout></Suspense>
}
