
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
import type { Chapter, Topic, Textbook, Resource, PracticeSet } from '@/lib/types';
import { collection, doc, getDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { ArrowLeft, BookOpen, FileText, CheckSquare, Loader2, Menu, ChevronRight, Lock, Award, Video, Mic, File as FileIcon, ExternalLink, Smile, Frown, Annoyed, Facebook, Twitter, Linkedin, Link2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { getTopicsByChapterId, getPracticeSetsByTopicId } from '@/lib/firebase/firestore';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ResourceViewerDialog } from '@/components/feature/resource-viewer-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const getResourceIcon = (type: string) => {
    switch(type) {
        case 'video': return <Video className="w-4 h-4 text-muted-foreground" />;
        case 'audio': return <Mic className="w-4 h-4 text-muted-foreground" />;
        case 'pdf': return <FileIcon className="w-4 h-4 text-muted-foreground" />;
        default: return <ExternalLink className="w-4 h-4 text-muted-foreground" />;
    }
};

const getChapterIcon = (index: number) => {
    return <BookOpen className="h-5 w-5" />;
};

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
                {getChapterIcon(index)}
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
                       <Link href={`/textbook-solutions/${textbookId}/chapter/${chapter.id}/topic/${topic.id}`}>
                         {topic.title}
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


function TopicPageContent() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    
    const textbookId = params.bookId as string;
    const chapterId = params.chapterId as string;
    const topicId = params.topicId as string;

    const [textbook, setTextbook] = useState<Textbook | null>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [topics, setTopics] = useState<{ [chapterId: string]: Topic[] }>({});
    const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
    
    const [loading, setLoading] = useState(true);
    const [loadingTopics, setLoadingTopics] = useState<string | null>(null);
    
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerResource, setViewerResource] = useState<Resource | null>(null);
    const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);

    useEffect(() => {
      if (activeTopic?.content) {
        const idMap = new Map();
        const matches = activeTopic.content.matchAll(/^(#+)\s+(.*)/gm);
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
    }, [activeTopic]);


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

    const fetchPageData = useCallback(async () => {
        setLoading(true);
        try {
            const [textbookSnap, chaptersQuerySnap] = await Promise.all([
                getDoc(doc(db, 'textbooks', textbookId)),
                getDocs(query(collection(db, `textbooks/${textbookId}/chapters`), orderBy('title')))
            ]);

            if (textbookSnap.exists()) {
                setTextbook({ id: textbookSnap.id, ...textbookSnap.data() } as Textbook);
            }

            const chaptersData = chaptersQuerySnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chapter));
            chaptersData.sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }));
            setChapters(chaptersData);

            if (chapterId) {
                const topicsData = await getTopicsByChapterId(textbookId, chapterId);
                const practiceSetsPromises = topicsData.map(t => getPracticeSetsByTopicId(textbookId, chapterId, t.id));
                const practiceSetsArrays = await Promise.all(practiceSetsPromises);
                
                const topicsWithPracticeSets = topicsData.map((t, index) => ({
                    ...t,
                    practiceSets: practiceSetsArrays[index]
                }));
                
                setTopics(prev => ({ ...prev, [chapterId]: topicsWithPracticeSets }));
                
                const currentTopic = topicsWithPracticeSets.find(t => t.id === topicId);

                if (currentTopic) {
                    setActiveTopic(currentTopic);
                } else if(topicsWithPracticeSets.length > 0 && !topicId) {
                    router.replace(`/textbook-solutions/${textbookId}/chapter/${chapterId}/topic/${topicsWithPracticeSets[0].id}`);
                }
            }

        } catch (e) {
            toast({ variant: "destructive", title: "Error loading data", description: (e as Error).message });
        } finally {
            setLoading(false);
        }
    }, [textbookId, chapterId, topicId, toast, router]);

    useEffect(() => {
        fetchPageData();
    }, [fetchPageData]);
    
    const handleResourceClick = (resource: Resource) => {
        setViewerResource(resource);
        setViewerOpen(true);
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-[calc(100vh-200px)]"><Loader2 className="w-8 h-8 animate-spin"/></div>;
    }
    
    const activeChapter = chapters.find(c => c.id === chapterId);

    const breadcrumbs = [
        { name: 'Textbooks', href: '/textbook-solutions'},
        { name: textbook?.title || 'Textbook', href: `/textbook-solutions/${textbookId}` },
        ...(activeChapter ? [{ name: activeChapter.title, href: `/textbook-solutions/${textbookId}/chapter/${chapterId}` }] : []),
        ...(activeTopic ? [{ name: activeTopic.title, href: `/textbook-solutions/${textbookId}/chapter/${chapterId}/topic/${topicId}` }] : []),
    ];

    const sidebarContent = (
      <div className="p-2">
          <SidebarNav 
              chapters={chapters}
              topics={topics}
              activeChapterId={chapterId}
              activeTopicId={topicId}
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
                        <li className="flex items-center gap-1.5">
                             <Link href={`/textbook-solutions/${textbookId}/chapter/${chapterId}`} className="text-muted-foreground hover:text-foreground">
                                <ArrowLeft className="w-4 h-4 inline-block mr-1" />
                                <span className="truncate max-w-[150px] sm:max-w-none">{activeChapter?.title || "Chapter"}</span>
                            </Link>
                        </li>
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
                                          <Link key={ps.id} href={`/textbook-solutions/practice-set/${ps.id}?textbook=${textbookId}&chapter=${chapterId}&topic=${topicId}`}>
                                              <div className="p-4 border rounded-lg hover:bg-accent flex justify-between items-center">
                                                  <span className="font-semibold">{ps.title}</span>
                                                  <Button size="sm">Start Practice</Button>
                                              </div>
                                          </Link>
                                      ))}
                                  </div>
                                 </>
                             )}

                            <Separator className="my-12" />

                            <Card className="bg-secondary/50">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                        <p className="font-semibold">Is this article helpful? What are your Feelings</p>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="icon"><Smile className="w-6 h-6 text-muted-foreground hover:text-green-500" /></Button>
                                            <Button variant="ghost" size="icon"><Frown className="w-6 h-6 text-muted-foreground hover:text-yellow-500" /></Button>
                                            <Button variant="ghost" size="icon"><Annoyed className="w-6 h-6 text-muted-foreground hover:text-red-500" /></Button>
                                        </div>
                                    </div>
                                    <Separator className="my-4" />
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                        <p className="font-semibold">Share This Article :</p>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="icon"><Facebook className="w-5 h-5 text-[#1877F2]" /></Button>
                                            <Button variant="outline" size="icon"><Twitter className="w-5 h-5 text-[#1DA1F2]" /></Button>
                                            <Button variant="outline" size="icon"><Linkedin className="w-5 h-5 text-[#0A66C2]" /></Button>
                                            <Button variant="outline" size="icon"><Link2 className="w-5 h-5" /></Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                        </div>
                    ) : (
                         <div className="text-center text-muted-foreground pt-16">
                            <BookOpen className="w-16 h-16 mx-auto mb-4"/>
                            <h2 className="text-xl font-semibold">Select a topic</h2>
                            <p>Choose a chapter and topic from the sidebar to view the content.</p>
                        </div>
                    )}
                </main>
                <aside className="hidden lg:block p-6 border-l">
                    <div className="sticky top-24">
                        <h3 className="font-semibold mb-4">On This Page</h3>
                         {headings.length > 0 ? (
                            <ul className="space-y-2">
                            {headings.map((heading) => (
                                <li key={heading.id}>
                                <a
                                    href={`#${heading.id}`}
                                    className="text-sm text-muted-foreground hover:text-foreground"
                                    style={{ paddingLeft: `${(heading.level - 1) * 0.75}rem` }}
                                >
                                    {heading.text}
                                </a>
                                </li>
                            ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">No sections found.</p>
                        )}
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


export default function TopicPage() {
    return <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin"/></div>}><TopicPageContent /></Suspense>
}
