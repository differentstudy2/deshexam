
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
import type { Chapter, Topic, Textbook, Resource, PracticeSet, Question, Exam } from '@/lib/types';
import { collection, doc, getDoc, getDocs, query, orderBy, where } from 'firebase/firestore';
import { ArrowLeft, BookOpen, FileText, CheckSquare, Loader2, Menu, ChevronRight, Lock, Award, Clock, HelpCircle, BarChart, Video, Mic, File as FileIcon, ExternalLink, Smile, Frown, Annoyed, Facebook, Twitter, Linkedin, Link2, FileDown, LayoutGrid, List, Search, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { getTopicsByChapterId, getAllContent, getPracticeSetsByTopicId, getQuestionsByPracticeSet } from '@/lib/firebase/firestore';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { ResourceViewerDialog } from '@/components/feature/resource-viewer-dialog';
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentBadge } from '@/components/content-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { TextbookStats } from '@/components/feature/textbook-stats';


const getResourceIcon = (type: string) => {
    switch(type) {
        case 'video': return <Video className="w-4 h-4 text-muted-foreground" />;
        case 'audio': return <Mic className="w-4 h-4 text-muted-foreground" />;
        case 'pdf': return <FileIcon className="w-4 h-4 text-muted-foreground" />;
        default: return <ExternalLink className="w-4 h-4 text-muted-foreground" />;
    }
};

const ChapterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 flex-shrink-0"><path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path></svg>
);

const ExamIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="m14 2 4 4 4-4"></path><path d="M18 6V4"></path><path d="M6 10H4"></path><path d="M6 14H4"></path><path d="M6 18H4"></path><path d="M14 10h6"></path><path d="M14 14h6"></path><path d="M14 18h6"></path><path d="M4 20h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2z"></path></svg>
);


const SidebarNav = ({
  chapters,
  topicsByChapter,
  activeChapterId,
  activeTopicId,
  onChapterToggle,
  loadingTopics,
  textbookId,
  exams,
}: {
  chapters: Chapter[];
  topicsByChapter: { [key: string]: Topic[] };
  activeChapterId: string | null;
  activeTopicId: string | null;
  onChapterToggle: (chapterId: string) => void;
  loadingTopics: string | null;
  textbookId: string;
  exams: any[];
}) => {
    const hasTopics = (chapterId: string) => {
        return topicsByChapter[chapterId] && topicsByChapter[chapterId].length > 0;
    }
    return (
    <div className="flex flex-col h-full">
        <Accordion type="single" collapsible defaultValue={activeChapterId || undefined} className="w-full" onValueChange={onChapterToggle}>
          {chapters.map((chapter, index) => {
              const chapterHasTopics = hasTopics(chapter.id);
              if (chapterHasTopics) {
                  return (
                    <AccordionItem value={chapter.id} key={chapter.id}>
                        <AccordionTrigger className="hover:no-underline [&[data-state=open]]:bg-accent/50 px-3 rounded-md justify-start">
                           <div className="flex items-center gap-3">
                               <ChapterIcon />
                               <span>{chapter.title}</span>
                           </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 pb-0">
                           {loadingTopics === chapter.id ? (
                               <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin"/></div>
                           ) : (
                               <ul className="space-y-1 pl-4 border-l">
                                {(topicsByChapter[chapter.id] || []).map(topic => (
                                  <li key={topic.id}>
                                    <Button
                                      variant="ghost"
                                      asChild
                                      className={cn(
                                        "w-full justify-start text-left h-auto py-1.5 px-2 text-base",
                                        activeTopicId === topic.id ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary" : ""
                                      )}
                                    >
                                      <Link href={`/textbook-solutions/${textbookId}/chapter/${chapter.id}/topic/${topic.id}`} className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-muted-foreground" />
                                        <span>{topic.title}</span>
                                      </Link>
                                    </Button>
                                  </li>
                                ))}
                                {(!topicsByChapter[chapter.id] || topicsByChapter[chapter.id].length === 0) && (
                                   <p className="p-2 text-sm text-muted-foreground">No topics in this chapter.</p>
                                )}
                              </ul>
                           )}
                        </AccordionContent>
                    </AccordionItem>
                  )
              }
              // If no topics, render as a direct link
              return (
                  <div key={chapter.id} className="border-b">
                      <Button
                        variant="ghost"
                        asChild
                        className={cn(
                          "w-full justify-start text-left h-auto py-3 px-3 text-base font-medium rounded-none",
                          activeChapterId === chapter.id && !activeTopicId ? "bg-primary/10 text-primary font-semibold" : ""
                        )}
                      >
                          <Link href={`/textbook-solutions/${textbookId}/chapter/${chapter.id}`} className="flex items-center gap-3">
                            <ChapterIcon />
                            <span>{chapter.title}</span>
                          </Link>
                      </Button>
                  </div>
              )
          })}
        </Accordion>

        {exams.length > 0 && (
            <Accordion type="single" collapsible className="w-full mt-4 pt-4 border-t">
                 <AccordionItem value="exams">
                    <AccordionTrigger className="hover:no-underline [&[data-state=open]]:bg-accent/50 px-3 rounded-md">
                        <div className="flex items-center gap-3">
                            <ExamIcon/>
                            <span>Exams</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-0">
                        <ul className="space-y-1 pl-4 border-l">
                            {exams.map(exam => (
                                <li key={exam.id}>
                                    <Button variant="ghost" asChild className="w-full justify-start text-left h-auto py-1.5 px-2 text-base">
                                        <Link href={`/exam/${exam.id}`}>
                                            {exam.title}
                                        </Link>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        )}
    </div>
)};


export default function TextbookClientPage({ textbook: initialTextbook }: { textbook: Textbook }) {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    
    const textbookId = params.bookId as string;

    const [textbook, setTextbook] = useState<Textbook | null>(initialTextbook);
    const [chaptersWithTopics, setChaptersWithTopics] = useState<(Chapter & {topics: Topic[], practiceSets: PracticeSet[]})[]>([]);
    const [exams, setExams] = useState<Exam[]>([]);
    const [mockTests, setMockTests] = useState<Exam[]>([]);
    const [quizzes, setQuizzes] = useState<Exam[]>([]);
    const [practiceSets, setPracticeSets] = useState<PracticeSet[]>([]);
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
                    // Only fetch chapter-level practice sets if there are NO topics
                    if (topicsData.length === 0) {
                        const practiceSetsRef = collection(db, `textbooks/${textbookId}/chapters/${chapter.id}/practiceSets`);
                        const practiceSetsSnap = await getDocs(practiceSetsRef);
                        practiceSetsData = practiceSetsSnap.docs.map(d => ({id: d.id, ...d.data()}) as PracticeSet);
                    }

                    return { ...chapter, topics: topicsData, practiceSets: practiceSetsData };
                }));
                
                const allExams = await getAllContent("Exam") as Exam[];
                const allMockTests = await getAllContent("Mock Test") as Exam[];
                const allQuizzes = await getAllContent("Quiz") as Exam[];
                const allPracticeSets = await getAllContent("Practice Set") as PracticeSet[];

                const textbookExams = allExams.filter(exam => (exam as any).textbookId === textbookId);
                const textbookMockTests = allMockTests.filter(test => (test as any).textbookId === textbookId);
                const textbookQuizzes = allQuizzes.filter(quiz => (quiz as any).textbookId === textbookId);
                const textbookPracticeSets = allPracticeSets.filter(ps => ps.textbookId === textbookId && !ps.chapterId && !ps.topicId);
                
                setExams(textbookExams);
                setMockTests(textbookMockTests);
                setQuizzes(textbookQuizzes);
                setPracticeSets(textbookPracticeSets);

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
             <div className="bg-secondary/30 min-h-screen">
                <div className="container mx-auto px-4 py-12">
                    <header className="mb-8 flex flex-col md:flex-row items-center gap-6 md:gap-8 rounded-lg bg-card p-6">
                        <Skeleton className="rounded-md shadow-lg w-[120px] h-[170px] md:w-[150px] md:h-[210px]" />
                        <div className="flex-grow space-y-3 text-center md:text-left">
                            <Skeleton className="h-10 w-3/4 mx-auto md:mx-0" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6 mx-auto md:mx-0" />
                            <div className="flex justify-center md:justify-start gap-2 pt-2">
                                <Skeleton className="h-6 w-20" />
                                <Skeleton className="h-6 w-24" />
                                <Skeleton className="h-6 w-20" />
                            </div>
                        </div>
                    </header>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 max-w-2xl mx-auto mb-8">
                        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                         {[...Array(8)].map((_, i) => (
                            <Card key={i}>
                                <Skeleton className="h-48 rounded-t-lg" />
                                <CardHeader className="p-4 space-y-2">
                                    <Skeleton className="h-4 w-1/3" />
                                    <Skeleton className="h-6 w-full" />
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <Skeleton className="h-20 w-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
    
    const ChapterIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 flex-shrink-0"><path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path></svg>
    );

    function getUrlForTest(testType: string, testId: string) {
        const typeSlug = testType.toLowerCase().replace(/\s+/g, '-');
        if (typeSlug === 'practice-set') {
            return `/textbook-solutions/${textbookId}/practice-set/${testId}`;
        }
        if (typeSlug === 'exam') {
            return `/textbook-solutions/${textbookId}/exam/${testId}`;
        }
        return `/${typeSlug}/${testId}`;
    }

    const bgColors = [
        'bg-blue-100 dark:bg-blue-900/20',
        'bg-green-100 dark:bg-green-900/20',
        'bg-yellow-100 dark:bg-yellow-900/20',
        'bg-pink-100 dark:bg-pink-900/20',
        'bg-purple-100 dark:bg-purple-900/20',
        'bg-orange-100 dark:bg-orange-900/20',
        'bg-teal-100 dark:bg-teal-900/20',
    ];

    const ContentList = ({ items, type }: { items: (Exam | PracticeSet)[], type: string }) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
                <Card key={item.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow">
                <CardHeader className="p-0 relative">
                    <Image
                    src={(item as any).featureImage || `https://picsum.photos/seed/${item.id}/400/225`}
                    alt={item.title}
                    width={400}
                    height={225}
                    className="w-full h-auto object-cover"
                    />
                    <div className="absolute top-2 right-2">
                    <ContentBadge type={item.access} />
                    </div>
                </CardHeader>
                <CardContent className="flex-grow p-4">
                    <p className="text-sm font-medium text-primary">{(item as any).subject || (textbook as any).subject || ''}</p>
                    <CardTitle className="font-headline text-lg mt-1 mb-2 leading-snug">{item.title}</CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground space-x-4">
                    <div className="flex items-center gap-1.5"><HelpCircle className="w-4 h-4" /><span>{(item as any).questions?.length || 0} Qs</span></div>
                    <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" /><span>{(item as any).duration || (item as any).questions?.length || 0} min</span></div>
                    {(item as any).difficulty && <div className="flex items-center gap-1.5"><BarChart className="w-4 h-4" /><span>{Array.isArray((item as any).difficulty) ? (item as any).difficulty.join(', ') : (item as any).difficulty}</span></div>}
                    </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                    <Button asChild className="w-full">
                    <Link href={getUrlForTest((item as any).testType || type, item.id)}>Start {type}</Link>
                    </Button>
                </CardFooter>
                </Card>
            ))}
        </div>
    );

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
                <div className="text-center md:text-left flex-grow">
                    <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">{textbook?.title}</h1>
                    {textbook?.description && <p className="mt-2 text-muted-foreground max-w-2xl">{textbook.description}</p>}
                    <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                        {textbook?.board && <Badge variant="outline">{textbook.board}</Badge>}
                        {textbook?.class && <Badge variant="outline">{textbook.class}</Badge>}
                        {textbook?.subject && <Badge variant="secondary">{textbook.subject}</Badge>}
                    </div>
                </div>
                 {(textbook as any)?.pdfUrl && (
                    <div className="flex-shrink-0">
                        <Button asChild>
                            <a href={(textbook as any).pdfUrl} target="_blank" rel="noopener noreferrer">
                                <FileDown className="mr-2" /> Download Textbook
                            </a>
                        </Button>
                    </div>
                )}
            </header>
            
            <Tabs defaultValue="chapters" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 max-w-2xl mx-auto">
                    <TabsTrigger value="chapters">Chapters</TabsTrigger>
                    {practiceSets.length > 0 && <TabsTrigger value="practice-sets">Practice Sets</TabsTrigger>}
                    {exams.length > 0 && <TabsTrigger value="exams">Exams</TabsTrigger>}
                    {mockTests.length > 0 && <TabsTrigger value="mock-tests">Mock Tests</TabsTrigger>}
                    {quizzes.length > 0 && <TabsTrigger value="quizzes">Quizzes</TabsTrigger>}
                </TabsList>
                <TabsContent value="chapters" className="mt-8">
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {chaptersWithTopics.map((chapter, index) => (
                            <Card key={chapter.id} className="flex flex-col">
                                <Link href={`/textbook-solutions/${textbookId}/chapter/${chapter.id}`} className="block relative bg-gray-100 dark:bg-gray-800 rounded-t-lg max-h-48 h-48">
                                    <Image
                                        src={chapter.featureImage || '/image/logo.png'}
                                        alt={chapter.title}
                                        fill
                                        className="object-contain p-2"
                                    />
                                </Link>
                                <Link href={`/textbook-solutions/${textbookId}/chapter/${chapter.id}`}>
                                    <CardHeader className={cn(
                                        "p-4 flex-row items-center gap-3 hover:bg-opacity-80 transition-colors",
                                        bgColors[index % bgColors.length]
                                    )}>
                                        <ChapterIcon />
                                        <CardTitle className="text-base font-semibold flex-grow">{chapter.title}</CardTitle>
                                        <ChevronRight className="w-5 h-5 flex-shrink-0" />
                                    </CardHeader>
                                </Link>
                                <CardContent className="p-0 flex-grow">
                                   <ul className="divide-y">
                                       {chapter.topics && chapter.topics.length > 0 ? (
                                           <>
                                               {chapter.topics.slice(0, 10).map((topic, topicIndex) => (
                                                   <li key={topic.id}>
                                                       <Link href={`/textbook-solutions/${textbookId}/chapter/${chapter.id}/topic/${topic.id}`} className={cn("flex items-center gap-3 p-3 text-sm hover:bg-opacity-80 transition-colors", bgColors[(index + topicIndex + 1) % bgColors.length])}>
                                                            <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                                            <span className="flex-grow truncate">{topic.title}</span>
                                                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                                       </Link>
                                                   </li>
                                               ))}
                                               {chapter.topics.length > 10 && (
                                                   <li className="p-3 text-sm text-center">
                                                       <Link href={`/textbook-solutions/${textbookId}/chapter/${chapter.id}`} className="font-semibold text-primary hover:underline">
                                                           See {chapter.topics.length - 10} More Topics...
                                                       </Link>
                                                   </li>
                                               )}
                                           </>
                                       ) : chapter.practiceSets && chapter.practiceSets.length > 0 ? (
                                           chapter.practiceSets.map(ps => (
                                               <li key={ps.id}>
                                                   <Link href={`/textbook-solutions/practice-set/${ps.id}/textbook/${textbookId}/chapter/${chapter.id}/topic/null`} className="flex items-center gap-3 p-3 text-sm hover:bg-accent/50 transition-colors">
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
                <TabsContent value="practice-sets" className="mt-8">
                     <ContentList items={practiceSets} type="Practice Set" />
                </TabsContent>
                <TabsContent value="exams" className="mt-8">
                    <ContentList items={exams} type="Exam" />
                </TabsContent>
                <TabsContent value="mock-tests" className="mt-8">
                     <ContentList items={mockTests} type="Mock Test" />
                </TabsContent>
                <TabsContent value="quizzes" className="mt-8">
                     <ContentList items={quizzes} type="Quiz" />
                </TabsContent>
            </Tabs>
        </div>
      </div>
    );
}
