
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
import { Separator } from '@/components/ui/separator';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PracticeSetPDF } from '@/components/feature/practice-set-pdf';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentBadge } from '@/components/content-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';


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


export default function ChapterClientPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    
    const [loading, setLoading] = useState(true);
    const [textbook, setTextbook] = useState<Textbook | null>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
    
    const [exams, setExams] = useState<Exam[] | null>(null);
    const [mockTests, setMockTests] = useState<Exam[] | null>(null);
    const [quizzes, setQuizzes] = useState<Exam[] | null>(null);
    const [loadingTabData, setLoadingTabData] = useState(false);
    
    const [error, setError] = useState<string | null>(null);
    
    const textbookId = params.bookId as string;
    const chapterId = params.chapterId as string;
    
    const [topicsByChapter, setTopicsByChapter] = useState<{ [chapterId: string]: Topic[] }>({});
    const [loadingTopics, setLoadingTopics] = useState<string | null>(null);
    
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerResource, setViewerResource] = useState<Resource | null>(null);
    const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
    const [pdfContent, setPdfContent] = useState<{ practiceSet: PracticeSet; questions: Question[] } | null>(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState<string | null>(null);
    const [resourceView, setResourceView] = useState<'grid' | 'list'>('grid');
    const [resourceFilter, setResourceFilter] = useState('');

    const fetchInitialData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [textbookSnap, chaptersQuerySnap] = await Promise.all([
                getDoc(doc(db, 'textbooks', textbookId)),
                getDocs(query(collection(db, `textbooks/${textbookId}/chapters`), orderBy('title'))),
            ]);

            if (!textbookSnap.exists()) throw new Error("Textbook not found.");
            
            const textbookData = { id: textbookSnap.id, ...textbookSnap.data() } as Textbook;
            setTextbook(textbookData);

            const chaptersData = chaptersQuerySnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chapter));
            chaptersData.sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }));
            setChapters(chaptersData);
            
            const chapterDocRef = doc(db, `textbooks/${textbookId}/chapters`, chapterId);
            const chapterSnap = await getDoc(chapterDocRef);
            if (!chapterSnap.exists()) throw new Error("Chapter not found.");
            
            const chapterData = { id: chapterSnap.id, ...chapterSnap.data() } as Chapter;
            
            const practiceSetsRef = collection(chapterDocRef, 'practiceSets');
            const practiceSetsSnap = await getDocs(practiceSetsRef);
            chapterData.practiceSets = practiceSetsSnap.docs.map(d => ({id: d.id, ...d.data()}) as PracticeSet);

            setActiveChapter(chapterData);

        } catch (e: any) {
            setError(e.message);
            toast({ variant: "destructive", title: "Error loading data", description: e.message });
        } finally {
            setLoading(false);
        }
    }, [textbookId, chapterId, toast]);

    useEffect(() => {
        if(textbookId && chapterId) {
            fetchInitialData();
        }
    }, [fetchInitialData, textbookId, chapterId]);


    const searchParams = useSearchParams();
    const activeTopicId = useMemo(() => {
        const topicIdFromParams = searchParams.get('topic');
        if (topicIdFromParams) return topicIdFromParams;
        return null;
    }, [searchParams]);

    const currentActiveTopic = useMemo(() => {
        if (!topicsByChapter[chapterId] || !activeTopicId) return null;
        return topicsByChapter[chapterId].find(t => t.id === activeTopicId);
    }, [topicsByChapter, chapterId, activeTopicId]);
    
    useEffect(() => {
      const activeContentSource = currentActiveTopic || chapters.find(c => c.id === chapterId);
      if (activeContentSource?.content) {
        const idMap = new Map();
        const matches = activeContentSource.content.matchAll(/^(#+)\s+(.*)/gm);
        const newHeadings = Array.from(matches).map((match, index) => {
          const level = match[1].length;
          const text = match[2];
          const baseId = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
          
          let id = baseId;
          let count = 1;
          while(idMap.has(id)) {
            id = `${baseId}-${count}`;
            count++;
          }
          idMap.set(id, true);

          return { id, text, level };
        });
        setHeadings(newHeadings);
      } else {
        setHeadings([]);
      }
    }, [currentActiveTopic, chapters, chapterId]);

    const fetchChapterTopics = useCallback(async (cId: string) => {
        if (!cId || topicsByChapter[cId]) return; 
        setLoadingTopics(cId);
        try {
            const topicsData = await getTopicsByChapterId(textbookId, cId);
            setTopicsByChapter(prev => ({ ...prev, [cId]: topicsData }));
        } catch (e) {
            toast({ variant: "destructive", title: "Error loading topics", description: (e as Error).message });
        } finally {
            setLoadingTopics(null);
        }
    }, [textbookId, topicsByChapter, toast]);

    useEffect(() => {
        if (chapterId && !topicsByChapter[chapterId]) {
            fetchChapterTopics(chapterId);
        }
    }, [chapterId, topicsByChapter, fetchChapterTopics]);
    
    const handleResourceClick = (resource: Resource) => {
        setViewerResource(resource);
        setViewerOpen(true);
    };
    
    const handleDownloadPdf = async (practiceSet: PracticeSet, topicContext?: Topic) => {
        setIsGeneratingPdf(practiceSet.id);
        try {
            const topicIdForPath = topicContext ? topicContext.id : 'null';
            const questions = await getQuestionsByPracticeSet(textbookId, chapterId, topicIdForPath, practiceSet.id);
            setPdfContent({ practiceSet, questions });

            setTimeout(async () => {
                const pdfElement = document.getElementById('pdf-content');
                if (pdfElement) {
                    const canvas = await html2canvas(pdfElement, { scale: 2 });
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();
                    const imgWidth = canvas.width;
                    const imgHeight = canvas.height;
                    const ratio = imgWidth / imgHeight;
                    const width = pdfWidth;
                    const height = width / ratio;
                    let position = 0;
                    let heightLeft = height;

                    pdf.addImage(imgData, 'PNG', 0, position, width, height);
                    heightLeft -= pdfHeight;

                    while (heightLeft > 0) {
                        position = heightLeft - height;
                        pdf.addPage();
                        pdf.addImage(imgData, 'PNG', 0, position, width, height);
                        heightLeft -= pdfHeight;
                    }

                    pdf.save(`${practiceSet.title}.pdf`);
                }
                setPdfContent(null);
                setIsGeneratingPdf(null);
            }, 500);

        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error generating PDF',
                description: (error as Error).message,
            });
            setIsGeneratingPdf(null);
        }
    };

    const handleTabChange = async (tab: string) => {
        const fetchContent = async (type: "Exam" | "Mock Test" | "Quiz", setter: React.Dispatch<React.SetStateAction<Exam[] | null>>) => {
            setLoadingTabData(true);
            try {
                const allContent = await getAllContent(type) as Exam[];
                setter(allContent.filter((item: any) => item.chapterId === chapterId));
            } catch (e) {
                toast({ variant: "destructive", title: `Error loading ${type}s`, description: (e as Error).message });
            } finally {
                setLoadingTabData(false);
            }
        };

        if (tab === 'exams' && exams === null) {
            fetchContent('Exam', setExams);
        } else if (tab === 'mock-tests' && mockTests === null) {
            fetchContent('Mock Test', setMockTests);
        } else if (tab === 'quizzes' && quizzes === null) {
            fetchContent('Quiz', setQuizzes);
        }
    };
    
    const filteredResources = useMemo(() => {
        if (!activeChapter?.resources) return [];
        if (!resourceFilter) return activeChapter.resources;
        return activeChapter.resources.filter(res => 
            res.title.toLowerCase().includes(resourceFilter.toLowerCase())
        );
    }, [activeChapter, resourceFilter]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[300px_1fr]">
                <aside className="hidden md:block h-full bg-card border-r">
                     <div className="sticky top-0 h-screen overflow-y-auto">
                        <div className="p-4 border-b">
                            <Skeleton className="h-6 w-3/4" />
                        </div>
                        <div className="p-2 space-y-2">
                            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                        </div>
                    </div>
                </aside>
                <main className="p-6 md:p-8">
                     <header className="relative p-8 md:p-12 min-h-[250px] flex items-center justify-center md:justify-start bg-slate-900 text-white rounded-lg overflow-hidden">
                        <Skeleton className="absolute inset-0 z-0"/>
                        <div className="relative z-20 space-y-3">
                            <Skeleton className="h-12 w-80" />
                            <Skeleton className="h-8 w-40" />
                        </div>
                    </header>
                    <div className="mt-8 space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return <div className="text-center py-10 text-destructive">{error}</div>;
    }
    
    const breadcrumbs = [
        { name: 'Textbooks', href: '/textbook-solutions'},
        { name: textbook?.title || 'Textbook', href: `/textbook-solutions/${textbookId}` },
        { name: activeChapter?.title || 'Chapter', href: `/textbook-solutions/${textbookId}/chapter/${chapterId}` },
    ];

    const sidebarContent = (
         <div className="p-2">
            <SidebarNav 
                chapters={chapters}
                topicsByChapter={topicsByChapter}
                activeChapterId={chapterId}
                activeTopicId={activeTopicId}
                onChapterToggle={fetchChapterTopics}
                loadingTopics={loadingTopics}
                textbookId={textbookId}
                exams={[]}
            />
        </div>
    );

    const bgColors = [
        'bg-blue-100 dark:bg-blue-900/20',
        'bg-green-100 dark:bg-green-900/20',
        'bg-yellow-100 dark:bg-yellow-900/20',
        'bg-pink-100 dark:bg-pink-900/20',
        'bg-purple-100 dark:bg-purple-900/20',
        'bg-orange-100 dark:bg-orange-900/20',
        'bg-teal-100 dark:bg-teal-900/20',
    ];

    const PracticeSetItem = ({ practiceSet, topicContext, isChapterLevel }: { practiceSet: PracticeSet, topicContext?: Topic, isChapterLevel?: boolean }) => {
        const difficulties = Array.isArray(practiceSet.difficulty) ? practiceSet.difficulty : practiceSet.difficulty ? [practiceSet.difficulty] : [];
        const sources = Array.isArray(practiceSet.questionSource) ? practiceSet.questionSource : practiceSet.questionSource ? [practiceSet.questionSource] : [];
        
        return (
            <div className="p-4 border rounded-lg hover:bg-accent flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex-grow">
                   <p className="font-semibold">{practiceSet.subtitle}: {practiceSet.title}</p>
                   <div className="flex flex-wrap gap-2 mt-2">
                       {difficulties.map(d => <Badge key={d} variant="secondary">{d}</Badge>)}
                       {sources.map(s => <Badge key={s} variant="outline">{s.replace('-', ' ')}</Badge>)}
                   </div>
                </div>
                <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
                  <Button size="sm" asChild className="flex-1">
                      <Link href={`/textbook-solutions/practice-set/${practiceSet.id}/textbook/${textbookId}/chapter/${chapterId}/topic/${topicContext?.id || 'null'}`}>Start Practice</Link>
                  </Button>
                  <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleDownloadPdf(practiceSet, topicContext)}
                      disabled={isGeneratingPdf === practiceSet.id}
                  >
                      {isGeneratingPdf === practiceSet.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <FileDown className="mr-2 h-4 w-4"/>}
                      Download PDF
                  </Button>
                </div>
            </div>
        )
    };

    function getUrlForTest(testType: string, testId: string, topicId?: string | null) {
        const typeSlug = testType.toLowerCase().replace(/\s+/g, '-');
        const topicSegment = topicId ? `/topic/${topicId}` : '/topic/null';
        return `/textbook-solutions/${typeSlug}/${testId}/textbook/${textbookId}/chapter/${chapterId}${topicSegment}`;
    }

    const ContentList = ({ items, type }: { items: Exam[] | null, type: string }) => {
        if(items === null) {
            return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
        }
        if(items.length === 0) {
            return <p className="text-muted-foreground text-center py-8">No {type.toLowerCase()}s available for this chapter.</p>
        }
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                    <Card key={item.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow">
                    <CardHeader className="p-0 relative">
                        <Image
                        src={`https://picsum.photos/seed/${item.id}/400/225`}
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
                        <p className="text-sm font-medium text-primary">{item.subject}</p>
                        <CardTitle className="font-headline text-lg mt-1 mb-2 leading-snug">{item.title}</CardTitle>
                        <div className="flex items-center text-sm text-muted-foreground space-x-4">
                        <div className="flex items-center gap-1.5"><HelpCircle className="w-4 h-4" /><span>{item.questions?.length || 0} Qs</span></div>
                        <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" /><span>{item.duration} min</span></div>
                        <div className="flex items-center gap-1.5"><BarChart className="w-4 h-4" /><span>{item.difficulty}</span></div>
                        </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                        <Button asChild className="w-full">
                        <Link href={getUrlForTest(item.testType, item.id, (item as any).topicId)}>Start {type}</Link>
                        </Button>
                    </CardFooter>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="md:hidden p-4 border-b flex items-center gap-4">
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon"><Menu /></Button>
                    </SheetTrigger>
                     <SheetContent side="left" className="p-0 w-80">
                       <SheetHeader className="p-4 border-b">
                           <SheetTitle className="sr-only">Main Navigation</SheetTitle>
                           <Link href={`/textbook-solutions/${textbookId}`} className="flex items-center gap-2 font-semibold">
                               <ArrowLeft className="w-4 h-4" /> {textbook?.title}
                           </Link>
                       </SheetHeader>
                       {sidebarContent}
                    </SheetContent>
                </Sheet>
                 <nav className="text-sm overflow-hidden">
                    <ol className="flex items-center gap-1.5 whitespace-nowrap">
                        {breadcrumbs.map((crumb, index) => (
                           <li key={index} className="flex items-center gap-1.5">
                               <Link href={crumb.href} className="hover:text-foreground truncate max-w-[100px] sm:max-w-none">{crumb.name}</Link>
                               {index < breadcrumbs.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0"/>}
                           </li>
                        ))}
                    </ol>
                </nav>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[300px_1fr]">
                <aside className="hidden md:block h-full bg-card border-r">
                    <div className="sticky top-0 h-screen overflow-y-auto">
                         <div className="p-4 border-b">
                            <Link href={`/textbook-solutions/${textbookId}`} className="flex items-center gap-2 font-semibold">
                                <ArrowLeft className="w-4 h-4" /> {textbook?.title}
                            </Link>
                        </div>
                        {sidebarContent}
                    </div>
                </aside>
                <main>
                    <div className="p-6 md:p-8">
                        <nav className="text-sm mb-6 hidden md:block">
                             <ol className="flex items-center gap-1.5">
                                {breadcrumbs.map((crumb, index) => (
                                   <li key={index} className="flex items-center gap-1.5">
                                       <Link href={crumb.href} className={cn("hover:text-foreground", index === breadcrumbs.length - 1 ? 'text-foreground font-semibold' : 'text-muted-foreground')}>{crumb.name}</Link>
                                       {index < breadcrumbs.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground"/>}
                                   </li>
                                ))}
                            </ol>
                        </nav>
                        
                        <header className="relative p-8 md:p-12 text-center md:text-left min-h-[250px] flex items-center justify-center md:justify-start bg-slate-900 text-white rounded-lg overflow-hidden">
                            <div className="absolute inset-0 z-0">
                                <Image 
                                    src={activeChapter?.featureImage || '/image/logo.png'}
                                    alt={activeChapter?.title || 'Chapter background'}
                                    fill
                                    className="object-cover opacity-20"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent z-10" />
                            </div>
                            <div className="relative z-20">
                                <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">{activeChapter?.title}</h1>
                                {activeChapter?.chapterPdfUrl && (
                                    <div className="mt-4">
                                        <Button asChild className="bg-green-500 hover:bg-green-600 text-white">
                                            <a href={activeChapter.chapterPdfUrl} target="_blank" rel="noopener noreferrer">
                                                <FileText className="mr-2" /> View Chapter PDF
                                            </a>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </header>
                        
                        {activeChapter?.description && (
                            <p className="prose dark:prose-invert lg:prose-lg max-w-none my-8 text-muted-foreground">{activeChapter.description}</p>
                        )}
                        
                        <Tabs defaultValue="content" className="w-full mt-8" onValueChange={handleTabChange}>
                            <TabsList className="grid w-full grid-cols-2 md:grid-cols-7 h-auto">
                                <TabsTrigger value="content">Content</TabsTrigger>
                                {activeChapter?.resources && activeChapter.resources.length > 0 && <TabsTrigger value="resources">Resources</TabsTrigger>}
                                {activeChapter?.textbookQuestions && activeChapter.textbookQuestions.length > 0 && <TabsTrigger value="questions">Questions</TabsTrigger>}
                                {activeChapter?.practiceSets && activeChapter.practiceSets.length > 0 && <TabsTrigger value="practice-sets">Practice Sets</TabsTrigger>}
                                <TabsTrigger value="mock-tests">Mock Tests</TabsTrigger>
                                <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
                                <TabsTrigger value="exams">Exams</TabsTrigger>
                            </TabsList>
                            <TabsContent value="content" className="mt-6">
                                 {activeChapter?.content ? (
                                    <article className="prose dark:prose-invert lg:prose-xl max-w-none">
                                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>{activeChapter.content}</ReactMarkdown>
                                    </article>
                                 ) : (
                                    <div className="text-center text-muted-foreground py-16">
                                        <BookOpen className="w-16 h-16 mx-auto mb-4"/>
                                        <h2 className="text-xl font-semibold">No Content Yet</h2>
                                        <p>There is no written content available for this chapter yet. Check out the other tabs for resources or practice sets!</p>
                                    </div>
                                 )}
                            </TabsContent>
                            <TabsContent value="resources" className="mt-6">
                                {activeChapter?.resources && activeChapter.resources.length > 0 ? (
                                    <div className="space-y-4">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <div className="relative w-full sm:max-w-xs">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input 
                                                    placeholder="Filter resources..." 
                                                    className="pl-9"
                                                    value={resourceFilter}
                                                    onChange={(e) => setResourceFilter(e.target.value)}
                                                />
                                            </div>
                                            <div className="flex items-center gap-1 rounded-md bg-muted p-1">
                                                <Button variant={resourceView === 'list' ? 'secondary' : 'ghost'} size="sm" onClick={() => setResourceView('list')}><List className="w-4 h-4 mr-2"/>List</Button>
                                                <Button variant={resourceView === 'grid' ? 'secondary' : 'ghost'} size="sm" onClick={() => setResourceView('grid')}><LayoutGrid className="w-4 h-4 mr-2"/>Grid</Button>
                                            </div>
                                        </div>
                                         <div className={cn(
                                            "gap-4",
                                            resourceView === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2' : 'space-y-3'
                                         )}>
                                            {filteredResources.map(res => (
                                                <Card 
                                                    key={res.id} 
                                                    onClick={() => handleResourceClick(res)}
                                                    className={cn(
                                                        "cursor-pointer hover:bg-accent transition-colors",
                                                        resourceView === 'grid' && "flex flex-col"
                                                    )}
                                                >
                                                     {resourceView === 'grid' && (
                                                        <div className="relative aspect-video w-full bg-secondary rounded-t-lg overflow-hidden">
                                                            {res.featureImage ? (
                                                                <Image src={res.featureImage} alt={res.title} fill className="object-cover" />
                                                            ) : getResourceIcon(res.type)}
                                                            {res.type === 'video' && (
                                                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                                    <PlayCircle className="w-12 h-12 text-white/80" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className="p-4 flex items-center gap-3">
                                                         {resourceView === 'list' && getResourceIcon(res.type)}
                                                        <span className="flex-grow font-medium">{res.title}</span>
                                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                ) : <p className="text-muted-foreground text-center py-8">No additional resources available.</p>}
                            </TabsContent>
                             <TabsContent value="questions" className="mt-6">
                                {activeChapter?.textbookQuestions && activeChapter.textbookQuestions.length > 0 ? (
                                    <div className="space-y-4">
                                        {activeChapter.textbookQuestions.map((q, i) => (
                                            <div key={q.id || i} className="p-4 border rounded-md">
                                                <p className="font-semibold">{i + 1}. {q.text}</p>
                                                <div className="text-sm mt-2 text-green-600"><strong>Answer:</strong> {String(q.correctAnswer)}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-muted-foreground text-center py-8">No textbook questions available.</p>}
                            </TabsContent>
                            <TabsContent value="practice-sets" className="mt-6">
                                {activeChapter?.practiceSets && activeChapter.practiceSets.length > 0 ? (
                                    <div className="space-y-4">
                                        {activeChapter.practiceSets.map(ps => <PracticeSetItem key={ps.id} practiceSet={ps} isChapterLevel />)}
                                    </div>
                                ) : <p className="text-muted-foreground text-center py-8">No practice sets available.</p>}
                             </TabsContent>
                             <TabsContent value="mock-tests" className="mt-6">
                                <ContentList items={mockTests} type="Mock Test" />
                             </TabsContent>
                             <TabsContent value="quizzes" className="mt-6">
                                <ContentList items={quizzes} type="Quiz" />
                            </TabsContent>
                            <TabsContent value="exams" className="mt-6">
                                <ContentList items={exams} type="Exam" />
                            </TabsContent>
                        </Tabs>
                    </div>
                </main>
            </div>
            
            <ResourceViewerDialog 
                resource={viewerResource} 
                open={viewerOpen} 
                onOpenChange={setViewerOpen} 
            />
             {pdfContent && (
                <div style={{ position: 'fixed', left: '-9999px', top: 0, zIndex: -10 }}>
                    <div id="pdf-content">
                        <PracticeSetPDF 
                            practiceSet={pdfContent.practiceSet} 
                            questions={pdfContent.questions} 
                            textbookTitle={textbook?.title || ''} 
                            chapterTitle={activeChapter?.title || ''}
                            topicTitle={topic?.title || ''}
                            board={textbook?.board || ''}
                            className={textbook?.class || ''}
                            subject={textbook?.subject || ''}
                            totalMarks={pdfContent.questions.reduce((acc, q) => acc + (q.marks || 1), 0)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
