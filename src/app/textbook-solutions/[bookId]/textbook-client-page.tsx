
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
import type { Chapter, Topic, Textbook, Resource, PracticeSet, Question } from '@/lib/types';
import { collection, doc, getDoc, getDocs, query, orderBy, where } from 'firebase/firestore';
import { ArrowLeft, BookOpen, FileText, CheckSquare, Loader2, Menu, ChevronRight, Lock, Award, Clock, HelpCircle, BarChart } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { getTopicsByChapterId, getPracticeSetsByTopicId, getAllContent, getContentById } from '@/lib/firebase/firestore';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ResourceViewerDialog } from '@/components/feature/resource-viewer-dialog';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentBadge } from '@/components/content-badge';

type Exam = {
  id: string;
  title: string;
  subject: string;
  questions: any[];
  duration: number;
  difficulty: string;
  access: "free" | "premium" | "pro";
  testType: string;
};

export default function TextbookClientPage({ textbook: initialTextbook }: { textbook: Textbook }) {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    
    const textbookId = params.bookId as string;

    const [textbook, setTextbook] = useState<Textbook | null>(initialTextbook);
    const [chaptersWithTopics, setChaptersWithTopics] = useState<(Chapter & {topics: Topic[], practiceSets: PracticeSet[]})[]>([]);
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                if (!textbook) {
                    toast({ variant: 'destructive', title: 'Textbook not found.' });
                    router.push('/textbook-solutions');
                    return;
                }

                const chaptersQuery = query(collection(db, `textbooks/${textbookId}/chapters`));
                const chaptersSnap = await getDocs(chaptersQuery);
                const chaptersData = chaptersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chapter));
                chaptersData.sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }));

                const chaptersWithDetails = await Promise.all(chaptersData.map(async (chapter) => {
                    const topicsData = await getTopicsByChapterId(textbookId, chapter.id);
                    
                    let practiceSetsData: PracticeSet[] = [];
                    if (topicsData.length === 0) {
                        const practiceSetsRef = collection(db, `textbooks/${textbookId}/chapters/${chapter.id}/practiceSets`);
                        const practiceSetsSnap = await getDocs(practiceSetsRef);
                        practiceSetsData = practiceSetsSnap.docs.map(d => ({id: d.id, ...d.data()}) as PracticeSet);
                    }

                    return { ...chapter, topics: topicsData, practiceSets: practiceSetsData };
                }));
                
                const allExams = await getAllContent("Exam") as Exam[];
                const textbookExams = allExams.filter(exam => (exam as any).textbookId === textbookId);
                setExams(textbookExams);

                setChaptersWithTopics(chaptersWithDetails);

            } catch (e) {
                toast({ variant: "destructive", title: "Error loading textbook content", description: (e as Error).message });
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [textbookId, textbook, toast, router]);
    
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
                <Loader2 className="w-8 h-8 animate-spin"/>
                <p className="ml-2">Loading Chapters...</p>
            </div>
        );
    }
    
    const ChapterIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path></svg>
    );

    function getUrlForTest(testType: string, testId: string) {
      const typeSlug = testType.toLowerCase().replace(/\s+/g, '-');
      return `/${typeSlug}/${testId}`;
    }

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
            
            <Tabs defaultValue="chapters" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                    <TabsTrigger value="chapters">Chapters</TabsTrigger>
                    <TabsTrigger value="exams">Exams</TabsTrigger>
                </TabsList>
                <TabsContent value="chapters" className="mt-8">
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {chaptersWithTopics.map((chapter, index) => (
                            <Card key={chapter.id} className="flex flex-col">
                                <Link href={`/textbook-solutions/${textbookId}/chapter/${chapter.id}`}>
                                    <CardHeader className="bg-primary text-primary-foreground p-4 flex-row items-center gap-3 hover:bg-primary/90 transition-colors">
                                        <ChapterIcon />
                                        <CardTitle className="text-lg font-semibold flex-grow">{chapter.title}</CardTitle>
                                        <ChevronRight className="w-5 h-5 flex-shrink-0" />
                                    </CardHeader>
                                </Link>
                                <CardContent className="p-0 flex-grow">
                                   <ul className="divide-y">
                                       {chapter.topics && chapter.topics.length > 0 ? (
                                           <>
                                               {chapter.topics.slice(0, 3).map(topic => (
                                                   <li key={topic.id}>
                                                       <Link href={`/textbook-solutions/${textbookId}/chapter/${chapter.id}/topic/${topic.id}`} className="flex items-center gap-3 p-3 text-sm hover:bg-accent/50 transition-colors">
                                                            <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                                            <span className="flex-grow truncate">{topic.title}</span>
                                                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                                       </Link>
                                                   </li>
                                               ))}
                                               {chapter.topics.length > 3 && (
                                                   <li className="p-3 text-sm text-center text-muted-foreground">
                                                       ...and {chapter.topics.length - 3} more topics
                                                   </li>
                                               )}
                                           </>
                                       ) : chapter.practiceSets && chapter.practiceSets.length > 0 ? (
                                           chapter.practiceSets.map(ps => (
                                               <li key={ps.id}>
                                                   <Link href={`/textbook-solutions/practice-set/${ps.id}?textbook=${textbookId}&chapter=${chapter.id}`} className="flex items-center gap-3 p-3 text-sm hover:bg-accent/50 transition-colors">
                                                        <CheckSquare className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                                        <span className="flex-grow truncate">{ps.title}</span>
                                                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                                   </Link>
                                               </li>
                                           ))
                                       ) : (
                                           <p className="p-4 text-sm text-center text-muted-foreground">No content in this chapter yet.</p>
                                       )}
                                   </ul>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
                <TabsContent value="exams" className="mt-8">
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {exams.length > 0 ? (
                             exams.map((exam) => (
                                <Card key={exam.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow">
                                <CardHeader className="p-0 relative">
                                    <Image
                                    src={`https://picsum.photos/seed/${exam.id}/400/225`}
                                    alt={exam.title}
                                    width={400}
                                    height={225}
                                    className="w-full h-auto object-cover"
                                    />
                                    <div className="absolute top-2 right-2">
                                    <ContentBadge type={exam.access} />
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow p-4">
                                    <p className="text-sm font-medium text-primary">{exam.subject}</p>
                                    <CardTitle className="font-headline text-lg mt-1 mb-2 leading-snug">{exam.title}</CardTitle>
                                    <div className="flex items-center text-sm text-muted-foreground space-x-4">
                                    <div className="flex items-center gap-1.5">
                                        <HelpCircle className="w-4 h-4" />
                                        <span>{exam.questions.length} Questions</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4" />
                                        <span>{exam.duration} min</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <BarChart className="w-4 h-4" />
                                        <span>{exam.difficulty}</span>
                                    </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="p-4 pt-0">
                                    <Button asChild className="w-full">
                                    <Link href={getUrlForTest(exam.testType, exam.id)}>Start Exam</Link>
                                    </Button>
                                </CardFooter>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-16 text-muted-foreground">
                                <p>No exams found for this textbook.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
      </div>
    );
}

