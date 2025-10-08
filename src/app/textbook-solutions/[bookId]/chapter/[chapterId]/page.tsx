

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

const getResourceIcon = (type: string) => {
    switch(type) {
        case 'video': return <Video className="w-4 h-4 text-muted-foreground" />;
        case 'audio': return <Mic className="w-4 h-4 text-muted-foreground" />;
        case 'pdf': return <FileIcon className="w-4 h-4 text-muted-foreground" />;
        default: return <ExternalLink className="w-4 h-4 text-muted-foreground" />;
    }
};

const ChapterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
);


const SidebarNav = ({
  chapters,
  topics,
  activeChapterId,
  activeTopicId,
  onChapterToggle,
  loadingTopics,
  textbookId,
}: {
  chapters: Chapter[];
  topics: { [key: string]: Topic[] };
  activeChapterId: string | null;
  activeTopicId: string | null;
  onChapterToggle: (chapterId: string) => void;
  loadingTopics: string | null;
  textbookId: string;
}) => (
    <Accordion type="single" collapsible defaultValue={activeChapterId || undefined} className="w-full" onValueChange={onChapterToggle}>
      {chapters.map((chapter, index) => (
        <AccordionItem value={chapter.id} key={chapter.id}>
          <AccordionTrigger
            className="hover:no-underline [&[data-state=open]]:bg-accent/50 px-3 rounded-md"
          >
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
                 {(topics[chapter.id] || []).map(topic => (
                   <li key={topic.id}>
                     <Button
                       variant="ghost"
                       asChild
                       className={cn(
                         "w-full justify-start text-left h-auto py-1.5 px-2 text-base",
                         activeTopicId === topic.id ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary" : ""
                       )}
                     >
                       <Link href={`/textbook-solutions/${textbookId}/chapter/${chapter.id}?topic=${topic.id}`} className="flex items-center gap-2">
                         <FileText className="w-4 h-4 text-muted-foreground" />
                         <span>{topic.title}</span>
                       </Link>
                     </Button>
                   </li>
                 ))}
                 {(!topics[chapter.id] || topics[chapter.id].length === 0) && (
                    <p className="p-2 text-sm text-muted-foreground">No topics in this chapter.</p>
                 )}
               </ul>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
);


function ChapterPageContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    
    const textbookId = params.bookId as string;
    const chapterId = params.chapterId as string;
    
    const [textbook, setTextbook] = useState<Textbook | null>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [topics, setTopics] = useState<{ [chapterId: string]: Topic[] }>({});
    
    const [loading, setLoading] = useState(true);
    const [loadingTopics, setLoadingTopics] = useState<string | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    
    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerResource, setViewerResource] = useState<Resource | null>(null);

    const activeTopicId = useMemo(() => {
        const topicId = searchParams.get('topic');
        if (topicId) return topicId;
        if (topics[chapterId] && topics[chapterId].length > 0) {
            return null;
        }
        return null;
    }, [searchParams, topics, chapterId]);

    const activeTopic = useMemo(() => {
        if (!topics[chapterId] || !activeTopicId) return null;
        return topics[chapterId].find(t => t.id === activeTopicId);
    }, [topics, chapterId, activeTopicId]);

    const fetchChapterTopics = useCallback(async (cId: string) => {
        if (!cId || topics[cId]) return;
        setLoadingTopics(cId);
        try {
            const topicsData = await getTopicsByChapterId(textbookId, cId);
            setTopics(prev => ({ ...prev, [cId]: topicsData }));
        } catch (e) {
            toast({ variant: "destructive", title: "Error loading topics", description: (e as Error).message });
        } finally {
            setLoadingTopics(null);
        }
    }, [textbookId, topics, toast]);

    const fetchAllChapterTopics = useCallback(async (allChapters: Chapter[]) => {
      for (const chapter of allChapters) {
        if (!topics[chapter.id]) {
          await fetchChapterTopics(chapter.id);
        }
      }
    }, [topics, fetchChapterTopics]);


    useEffect(() => {
        const fetchPageData = async () => {
            setLoading(true);
            try {
                const chapterRef = doc(db, `textbooks/${textbookId}/chapters`, chapterId);
                const practiceSetsRef = collection(chapterRef, 'practiceSets');

                const [textbookSnap, chaptersQuerySnap, chapterSnap, practiceSetsSnap] = await Promise.all([
                    getDoc(doc(db, 'textbooks', textbookId)),
                    getDocs(query(collection(db, `textbooks/${textbookId}/chapters`), orderBy('title'))),
                    getDoc(chapterRef),
                    getDocs(practiceSetsRef)
                ]);

                if (textbookSnap.exists()) setTextbook({ id: textbookSnap.id, ...textbookSnap.data() } as Textbook);
                
                const chaptersData = chaptersQuerySnap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Chapter));
                chaptersData.sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }));

                if (chapterSnap.exists()) {
                    const chapterData = { id: chapterSnap.id, ...chapterSnap.data(), practiceSets: practiceSetsSnap.docs.map(d => ({id: d.id, ...d.data()})) } as Chapter;
                    const chapterIndex = chaptersData.findIndex(c => c.id === chapterId);
                    if(chapterIndex > -1) {
                         chaptersData[chapterIndex] = chapterData;
                    } else {
                        chaptersData.push(chapterData);
                        chaptersData.sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }));
                    }
                }
                
                setChapters(chaptersData);

                if (chapterId) {
                    await fetchChapterTopics(chapterId);
                }

            } catch (e) {
                toast({ variant: "destructive", title: "Error loading data", description: (e as Error).message });
            } finally {
                setLoading(false);
            }
        };

        fetchPageData();
    }, [textbookId, chapterId, toast, fetchChapterTopics]);

    const handleResourceClick = (resource: Resource) => {
        setViewerResource(resource);
        setViewerOpen(true);
    };

    if (loading && !textbook) {
        return <div className="flex items-center justify-center min-h-[calc(100vh-200px)]"><Loader2 className="w-8 h-8 animate-spin"/></div>;
    }
    
    const activeChapter = chapters.find(c => c.id === chapterId);

    const breadcrumbs = [
        { name: 'Textbooks', href: '/textbook-solutions'},
        { name: textbook?.title || 'Textbook', href: `/textbook-solutions/${textbookId}` },
        { name: activeChapter?.title || 'Chapter', href: `/textbook-solutions/${textbookId}/chapter/${chapterId}` },
    ];

    const sidebarContent = (
         <div className="p-2">
            <SidebarNav 
                chapters={chapters}
                topics={topics}
                activeChapterId={chapterId}
                activeTopicId={activeTopicId}
                onChapterToggle={fetchChapterTopics}
                loadingTopics={loadingTopics}
                textbookId={textbookId}
            />
        </div>
    );

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
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[300px_1fr_250px]">
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
                <main className="p-6 md:p-8">
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

                    {activeTopic ? (
                        <div>
                            <h1 className="font-headline text-3xl md:text-4xl font-bold">{activeTopic.title}</h1>
                            {activeTopic.content && (
                                <article className="prose dark:prose-invert lg:prose-lg max-w-none mt-6">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeTopic.content}</ReactMarkdown>
                                </article>
                            )}

                             {activeTopic.resources && activeTopic.resources.length > 0 && (
                                <>
                                 <h2 className="font-headline text-2xl font-bold mt-12 mb-4">Resources</h2>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {activeTopic.resources.map(res => (
                                        <Button key={res.id} variant="outline" className="justify-start gap-3 h-auto py-3" onClick={() => handleResourceClick(res)}>
                                            {getResourceIcon(res.type)}
                                            <span className="flex-grow text-left">{res.title}</span>
                                        </Button>
                                    ))}
                                </div>
                                </>
                            )}
                             
                             {activeTopic.practiceSets && activeTopic.practiceSets.length > 0 && (
                                <>
                                 <h2 className="font-headline text-2xl font-bold mt-12 mb-4">Practice Sets</h2>
                                 <div className="space-y-4">
                                     {activeTopic.practiceSets.map(ps => (
                                         <Link key={ps.id} href={`/textbook-solutions/practice-set/${ps.id}?textbook=${textbookId}&chapter=${chapterId}&topic=${activeTopic.id}`}>
                                             <div className="p-4 border rounded-lg hover:bg-accent flex justify-between items-center">
                                                 <span className="font-semibold">{ps.title}</span>
                                                 <Button size="sm">Start Practice</Button>
                                             </div>
                                         </Link>
                                     ))}
                                 </div>
                                 </>
                             )}

                        </div>
                    ) : (
                         <div>
                            <h1 className="font-headline text-3xl md:text-4xl font-bold">{activeChapter?.title}</h1>
                            {activeChapter?.content && (
                                <article className="prose dark:prose-invert lg:prose-lg max-w-none mt-6">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeChapter.content}</ReactMarkdown>
                                </article>
                            )}

                            {activeChapter?.textbookQuestions && activeChapter.textbookQuestions.length > 0 && (
                                <div className="mt-12">
                                    <h2 className="font-headline text-2xl font-bold mb-4">Textbook Questions</h2>
                                    <div className="space-y-4">
                                        {activeChapter.textbookQuestions.map((q, i) => (
                                            <p key={q.id || i}>{i + 1}. {q.text}</p>
                                        ))}
                                    </div>
                                </div>
                            )}

                             {activeChapter?.practiceSets && activeChapter.practiceSets.length > 0 && (
                                <div className="mt-12">
                                    <h2 className="font-headline text-2xl font-bold mb-4">Practice Sets</h2>
                                    <div className="space-y-4">
                                        {activeChapter.practiceSets.map(ps => (
                                             <Link key={ps.id} href={`/textbook-solutions/practice-set/${ps.id}?textbook=${textbookId}&chapter=${chapterId}`}>
                                                <div className="p-4 border rounded-lg hover:bg-accent flex justify-between items-center">
                                                    <span className="font-semibold">{ps.title}</span>
                                                    <Button size="sm">Start Practice</Button>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(!activeChapter?.content && (!activeChapter?.textbookQuestions || activeChapter.textbookQuestions.length === 0) && (!activeChapter?.practiceSets || activeChapter.practiceSets.length === 0)) && (
                                <div className="text-center text-muted-foreground pt-16">
                                    <BookOpen className="w-16 h-16 mx-auto mb-4"/>
                                    <h2 className="text-xl font-semibold">Select a topic</h2>
                                    <p>Choose a topic from the sidebar to view its content.</p>
                                </div>
                            )}
                        </div>
                    )}
                </main>
                <aside className="hidden lg:block p-6 border-l">
                    <div className="sticky top-20">
                        <h3 className="font-semibold mb-4">On This Page</h3>
                        <p className="text-sm text-muted-foreground">Table of contents will appear here.</p>
                    </div>
                </aside>
            </div>
             <ResourceViewerDialog 
                resource={viewerResource} 
                open={viewerOpen} 
                onOpenChange={setViewerOpen} 
            />
        </div>
    );
}


export default function TextbookChapterPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin"/></div>}>
            <ChapterPageContent />
        </Suspense>
    );
}

    