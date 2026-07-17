'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { db } from '@/lib/firebase/client';
import type { Chapter, Topic, Textbook, Resource, PracticeSet, Question, Exam } from '@/lib/types';
import { collection, doc, getDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { ArrowLeft, BookOpen, Loader2, Menu, ChevronRight, FileDown, Bookmark, Search, Share2, Sun, Moon, FileText } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { getTopicsByChapterId } from '@/lib/firebase/firestore';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ScrollSpyNav } from '@/components/feature/textbook/ScrollSpyNav';
import { LessonToolsPanel } from '@/components/feature/textbook/LessonToolsPanel';
import { CustomMarkdownRenderers } from '@/components/feature/textbook/CustomMarkdownRenderers';
import { useTheme } from 'next-themes';
import { Progress } from '@/components/ui/progress';

export default function ChapterClientPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const { theme, setTheme } = useTheme();
    
    const [loading, setLoading] = useState(true);
    const [textbook, setTextbook] = useState<Textbook | null>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const textbookId = params.bookId as string;
    const chapterId = params.chapterId as string;
    
    const [topicsByChapter, setTopicsByChapter] = useState<{ [chapterId: string]: Topic[] }>({});
    const [loadingTopics, setLoadingTopics] = useState<string | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    
    const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
    const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
    const [focusMode, setFocusMode] = useState(false);
    const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');

    const currentIndex = useMemo(() => {
        return chapters.findIndex(c => c.id === chapterId);
    }, [chapters, chapterId]);

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

    useEffect(() => {
      if (activeChapter?.content) {
        const idMap = new Map();
        
        // Match both Markdown (# Heading) and HTML (<h1...>Heading</h1>)
        const matches = Array.from(activeChapter.content.matchAll(/(?:^(#+)\s+(.*))|(?:<h([1-6])[^>]*>(.*?)<\/h\3>)/gim));
        
        const newHeadings = matches.map((match: any) => {
          const levelRaw = match[1] || match[3];
          const textRaw = match[2] || match[4];
          
          const level = match[1] ? match[1].length : parseInt(levelRaw);
          const text = textRaw ? textRaw.replace(/<[^>]*>?/gm, '').trim() : '';
          
          if (!text) return null;

          const baseId = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
          
          let id = baseId;
          let count = 1;
          while(idMap.has(id)) {
            id = `${baseId}-${count}`;
            count++;
          }
          idMap.set(id, true);

          return { id, text, level };
        }).filter(Boolean) as { id: string; text: string; level: number }[];
        
        setHeadings(newHeadings);
      } else {
        setHeadings([]);
      }
    }, [activeChapter]);

    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveHeadingId(entry.target.id);
            }
          });
        },
        { rootMargin: '-20% 0% -60% 0%' }
      );

      headings.forEach((heading) => {
        const element = document.getElementById(heading.id);
        if (element) observer.observe(element);
      });

      return () => observer.disconnect();
    }, [headings]);

    const handleHeadingClick = (id: string) => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr_320px]">
                <aside className="hidden md:block h-full border-r p-4"><Skeleton className="h-full w-full" /></aside>
                <main className="p-8 space-y-4"><Skeleton className="h-40 w-full" /><Skeleton className="h-96 w-full" /></main>
                <aside className="hidden lg:block border-l p-4"><Skeleton className="h-full w-full" /></aside>
            </div>
        );
    }

    if (error) {
        return <div className="text-center py-10 text-destructive">{error}</div>;
    }
    
    const breadcrumbs = [
        { name: 'Home', href: '/' },
        { name: textbook?.board || 'Board', href: '#' },
        { name: textbook?.subject || 'Subject', href: '#' },
        { name: textbook?.title || 'Textbook', href: `/textbook-solutions/${textbookId}` },
        { name: activeChapter?.title || 'Lesson', href: '#' },
    ];

    const leftSidebar = (
         <div className="flex flex-col h-full bg-card">
            {/* Textbook Info Header */}
            <div className="p-4 pt-5 border-b text-center flex flex-col items-center">
                <div className="w-24 h-32 relative mb-3 shadow-md rounded overflow-hidden">
                    <Image src={textbook?.featureImage || '/image/logo.png'} alt="Cover" fill className="object-cover" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{textbook?.subject}</p>
                <h3 className="font-bold text-lg leading-tight mt-1 px-2 line-clamp-3 text-balance">{textbook?.title}</h3>
                
                <div className="mt-3 flex items-center justify-start gap-3 w-full border rounded-2xl p-2 bg-muted/10 text-left">
                    <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                            <circle className="text-muted stroke-current" strokeWidth="10" cx="50" cy="50" r="40" fill="transparent" />
                            <circle className="text-primary stroke-current" strokeWidth="10" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent" strokeDasharray="160 251.2" />
                        </svg>
                        <span className="absolute text-[10px] font-bold">65%</span>
                    </div>
                    <span className="text-xs font-semibold line-clamp-2 pr-2">{activeChapter?.title}</span>
                </div>
            </div>

            {/* Scroll Spy Nav Header */}
            <div className="px-4 py-3 mt-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">
                Sections in this lesson
            </div>
            
            {/* Scroll Spy Nav List */}
            <div className="pb-4 pt-2">
                <ScrollSpyNav 
                    headings={headings} 
                    activeHeadingId={activeHeadingId} 
                    onHeadingClick={handleHeadingClick} 
                />
            </div>
            
            {/* Chapters & Topics */}
            <div className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-y bg-muted/30">
                Chapters & Topics
            </div>
            <div className="flex-1 overflow-y-auto pb-20">
                <Accordion type="single" collapsible defaultValue={chapterId} className="w-full" onValueChange={fetchChapterTopics}>
                  {chapters.map((chapter) => (
                    <AccordionItem value={chapter.id} key={chapter.id}>
                      <AccordionTrigger className="hover:no-underline [&[data-state=open]]:bg-accent/50 px-4 py-3 text-sm font-medium">
                         <div className="flex items-center gap-2 text-left">
                            <BookOpen className="w-4 h-4 shrink-0" />
                            <span className="line-clamp-2">{chapter.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-1 pb-2">
                        {loadingTopics === chapter.id ? (
                            <div className="flex justify-center py-2"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground"/></div>
                        ) : (
                            <ul className="space-y-0.5 px-2">
                             {(topicsByChapter[chapter.id] || []).map(topic => (
                               <li key={topic.id}>
                                 <Button
                                   variant="ghost"
                                   asChild
                                   className="w-full justify-start text-left h-auto py-2 px-3 text-sm font-normal text-muted-foreground hover:text-foreground"
                                 >
                                   <Link href={`/textbook-solutions/${textbookId}/chapter/${chapter.id}/topic/${topic.id}`} className="flex items-start gap-2">
                                     <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                     <span className="line-clamp-2">{topic.title}</span>
                                   </Link>
                                 </Button>
                               </li>
                             ))}
                             {(!topicsByChapter[chapter.id] || topicsByChapter[chapter.id].length === 0) && (
                                <p className="px-3 py-2 text-xs text-muted-foreground">No topics yet.</p>
                             )}
                           </ul>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Mobile Header */}
            <div className="md:hidden p-4 border-b flex items-center justify-between bg-card sticky top-0 z-50">
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon"><Menu /></Button>
                    </SheetTrigger>
                     <SheetContent side="left" className="p-0 w-[280px]">
                        {leftSidebar}
                    </SheetContent>
                </Sheet>
                 <span className="font-semibold truncate max-w-[200px]">{activeChapter?.title}</span>
                 <Button variant="ghost" size="icon"><Bookmark className="w-5 h-5" /></Button>
            </div>

            <div className="flex-1 max-w-[1536px] mx-auto w-full grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[280px_1fr_320px]">
                
                {/* Left Sidebar - Desktop */}
                <aside className={cn(
                    "hidden md:block h-[calc(100vh-64px)] sticky top-16 border-r overflow-y-auto transition-all duration-300",
                    focusMode ? "-ml-[280px] opacity-0 pointer-events-none" : "ml-0 opacity-100"
                )}>
                    {leftSidebar}
                </aside>

                {/* Main Content Column */}
                <main className={cn(
                    "relative min-h-[calc(100vh-64px)] transition-all duration-300",
                    "mx-auto w-full max-w-[920px]"
                )}>
                    {/* Top Utility Bar */}
                    <div className="sticky top-0 md:top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-6 py-3 flex items-center justify-between">
                        <nav className="hidden sm:flex text-sm overflow-hidden">
                            <ol className="flex items-center gap-1.5 whitespace-nowrap text-muted-foreground">
                                {breadcrumbs.map((crumb, index) => (
                                   <li key={index} className="flex items-center gap-1.5">
                                       <Link href={crumb.href} className="hover:text-foreground">{crumb.name}</Link>
                                       {index < breadcrumbs.length - 1 && <ChevronRight className="w-4 h-4"/>}
                                   </li>
                                ))}
                            </ol>
                        </nav>
                        <div className="flex items-center gap-2 ml-auto">
                            <div className="flex items-center border rounded-md">
                                <Button variant="ghost" size="sm" onClick={() => setFontSize('normal')} className={cn("px-2 text-xs", fontSize === 'normal' && "bg-muted")}>A-</Button>
                                <div className="w-px h-4 bg-border" />
                                <Button variant="ghost" size="sm" onClick={() => setFontSize('large')} className={cn("px-2 text-sm", fontSize === 'large' && "bg-muted")}>A+</Button>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                                {theme === 'dark' ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>}
                            </Button>
                            <Button variant="ghost" size="icon"><Share2 className="w-4 h-4"/></Button>
                            <Button variant="ghost" size="icon"><Bookmark className="w-4 h-4"/></Button>
                            <div className="flex items-center gap-2 ml-2 pl-4 border-l">
                                <span className="text-sm text-muted-foreground">Focus Mode</span>
                                <Switch checked={focusMode} onCheckedChange={setFocusMode} />
                            </div>
                        </div>
                    </div>

                    <div className={cn("p-6 md:p-10", fontSize === 'large' ? "text-lg" : "text-base")}>
                        
                        {/* Hero Section */}
                        <div className="bg-primary/5 rounded-2xl p-8 mb-10 relative overflow-hidden">
                            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                                <BookOpen className="w-64 h-64 -mb-10 -mr-10" />
                            </div>
                            <div className="relative z-10 space-y-4">
                                <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/20 text-sm px-3 py-1">
                                    {activeChapter?.title}
                                </Badge>
                                <h1 className="font-headline text-4xl md:text-5xl font-bold leading-tight">
                                    {activeChapter?.title}
                                </h1>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                                    <span>{textbook?.board} Board</span>
                                    <span className="w-1 h-1 rounded-full bg-muted-foreground/50"/>
                                    <span>Class {textbook?.class}</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        15 mins
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                                        Medium
                                    </div>
                                    <div className="flex-1 min-w-[200px] flex items-center gap-3">
                                        <Progress value={0} className="h-2 flex-1" />
                                        <span className="text-xs font-semibold">0%</span>
                                    </div>
                                </div>
                                <Button className="mt-4 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20 px-8 py-5 text-lg rounded-xl transition-transform hover:scale-105">
                                    Continue Reading
                                </Button>
                            </div>
                        </div>

                        {/* Markdown Content rendered with Custom Renderers */}
                        {activeChapter?.content ? (
                            <article className={cn(
                                "prose dark:prose-invert max-w-none prose-headings:font-headline",
                                "prose-p:leading-[1.8] prose-p:text-foreground/90",
                                "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
                                fontSize === 'large' && "prose-lg"
                            )}>
                                <ReactMarkdown 
                                    components={{
                                        ...CustomMarkdownRenderers,
                                        h1: ({node, ...props}: any) => {
                                            const id = props.children?.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
                                            return <h1 id={id} className="text-3xl font-bold mt-12 mb-6" {...props} />
                                        },
                                        h2: ({node, ...props}: any) => {
                                            const id = props.children?.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
                                            return <h2 id={id} className="text-2xl font-bold mt-10 mb-4 text-primary" {...props} />
                                        },
                                        h3: ({node, ...props}: any) => {
                                            const id = props.children?.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
                                            return <h3 id={id} className="text-xl font-bold mt-8 mb-3" {...props} />
                                        }
                                    }}
                                    remarkPlugins={[remarkGfm, remarkMath]} 
                                    rehypePlugins={[rehypeRaw, rehypeKatex]}
                                >
                                    {activeChapter.content}
                                </ReactMarkdown>
                            </article>
                        ) : (
                            <div className="text-center text-muted-foreground py-20 bg-muted/20 rounded-xl border border-dashed">
                                <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted"/>
                                <h2 className="text-xl font-semibold text-foreground">No Content Yet</h2>
                                <p>Content is being prepared for this lesson.</p>
                            </div>
                        )}

                        {/* Bottom Navigation */}
                        <div className="mt-16 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                            {currentIndex > 0 ? (
                                <Button variant="outline" className="rounded-full px-6 w-full sm:w-auto" asChild>
                                    <Link href={`/textbook-solutions/${textbookId}/chapter/${chapters[currentIndex - 1].id}`}>
                                        <ChevronRight className="w-4 h-4 mr-2 rotate-180" /> Previous Lesson
                                    </Link>
                                </Button>
                            ) : (
                                <Button variant="outline" className="rounded-full px-6 w-full sm:w-auto" disabled>
                                    <ChevronRight className="w-4 h-4 mr-2 rotate-180" /> Previous Lesson
                                </Button>
                            )}
                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                <Button className="rounded-full px-6 bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    Mark Complete
                                </Button>
                                <Button variant="outline" className="rounded-full px-6 w-full sm:w-auto">Practice</Button>
                                {currentIndex < chapters.length - 1 && currentIndex !== -1 ? (
                                    <Button className="rounded-full px-6 w-full sm:w-auto" asChild>
                                        <Link href={`/textbook-solutions/${textbookId}/chapter/${chapters[currentIndex + 1].id}`}>
                                            Next Lesson <ChevronRight className="w-4 h-4 ml-2" />
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button className="rounded-full px-6 w-full sm:w-auto" disabled>
                                        Next Lesson <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                )}
                            </div>
                        </div>

                    </div>
                </main>

                {/* Right Sidebar - Sticky Tools Panel */}
                <aside className={cn(
                    "hidden lg:block h-[calc(100vh-64px)] sticky top-16 border-l p-6 overflow-y-auto bg-muted/10 transition-all duration-300",
                    focusMode ? "-mr-[320px] opacity-0 pointer-events-none" : "mr-0 opacity-100"
                )}>
                    <LessonToolsPanel 
                        progress={0} 
                        sectionsFinished={0} 
                        totalSections={headings.length}
                        textbookId={textbookId}
                        chapterId={chapterId}
                    />
                </aside>

            </div>
        </div>
    );
}
