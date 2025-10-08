

'use client';

import { Suspense, useEffect, useState, useMemo, useCallback } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { db } from '@/lib/firebase/client';
import type { Chapter, Topic, Textbook, Resource } from '@/lib/types';
import { collection, doc, getDoc, getDocs, query } from 'firebase/firestore';
import { ArrowLeft, BookOpen, FileText, CheckSquare, Loader2, Menu, ChevronRight, Lock, Award, Video, Mic, File as FileIcon, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { getUserProfile, getTextbookProgress, getSettings, getTopicsByChapterId } from '@/lib/firebase/firestore';
import { ResourceViewerDialog } from '@/components/feature/resource-viewer-dialog';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Separator } from '@/components/ui/separator';

const getResourceIcon = (type: string) => {
    switch(type) {
        case 'video': return <Video className="w-4 h-4 text-muted-foreground" />;
        case 'audio': return <Mic className="w-4 h-4 text-muted-foreground" />;
        case 'pdf': return <FileIcon className="w-4 h-4 text-muted-foreground" />;
        default: return <ExternalLink className="w-4 h-4 text-muted-foreground" />;
    }
};

const SidebarNav = ({
  chapters,
  topics,
  activeChapter,
  activeTopic,
  onTopicSelect,
  loadingTopics,
  textbookId,
}: {
  chapters: Chapter[];
  topics: { [key: string]: Topic[] };
  activeChapter: string | null;
  activeTopic: string | null;
  onTopicSelect: (chapterId: string, topicId: string) => void;
  loadingTopics: string | null;
  textbookId: string;
}) => (
    <Accordion type="single" collapsible defaultValue={activeChapter || undefined} className="w-full">
      {chapters.map((chapter, index) => (
        <AccordionItem value={chapter.id} key={chapter.id}>
          <AccordionTrigger
            className="hover:no-underline [&[data-state=open]]:bg-accent/50"
          >
             <div className="flex items-center gap-2">
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
                         "w-full justify-start text-left h-auto py-1 px-2 text-base",
                         activeTopic === topic.id ? "bg-accent text-accent-foreground" : ""
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

function TopicPageLayout() {
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

    const fetchPageData = useCallback(async () => {
        setLoading(true);
        try {
            const textbookDocRef = doc(db, 'textbooks', textbookId);
            const [textbookDocSnap, chaptersQuerySnap] = await Promise.all([
                getDoc(textbookDocRef),
                getDocs(query(collection(db, `textbooks/${textbookId}/chapters`), orderBy('title')))
            ]);

            if (textbookDocSnap.exists()) {
                setTextbook({ id: textbookDocSnap.id, ...textbookDocSnap.data() } as Textbook);
            }

            const chaptersData = chaptersQuerySnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chapter));
            setChapters(chaptersData);

            if (chapterId) {
                setLoadingTopics(chapterId);
                const topicsData = await getTopicsByChapterId(textbookId, chapterId);
                setTopics(prev => ({ ...prev, [chapterId]: topicsData }));
                
                const currentTopic = topicsData.find(t => t.id === topicId);
                if (currentTopic) {
                    setActiveTopic(currentTopic);
                }
                setLoadingTopics(null);
            }

        } catch (e) {
            toast({ variant: "destructive", title: "Error loading data", description: (e as Error).message });
        } finally {
            setLoading(false);
        }
    }, [textbookId, chapterId, topicId, toast]);

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

    const sidebar = (
        <aside className="h-full bg-card border-r">
            <div className="p-4 border-b">
                <Link href={`/textbook-solutions/${textbookId}`} className="flex items-center gap-2 font-semibold">
                    <ArrowLeft className="w-4 h-4" /> {textbook?.title}
                </Link>
            </div>
            <SidebarNav 
                chapters={chapters} 
                topics={topics}
                activeChapter={chapterId}
                activeTopic={topicId}
                onTopicSelect={() => {}}
                loadingTopics={loadingTopics}
                textbookId={textbookId}
            />
        </aside>
    );

    return (
        <div className="min-h-screen bg-background">
            <div className="md:hidden p-4 border-b flex items-center gap-4">
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon"><Menu /></Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-80">
                        {sidebar}
                    </SheetContent>
                </Sheet>
                 <nav className="text-sm">
                    <ol className="flex items-center gap-1">
                        {breadcrumbs.slice(0, -1).map((crumb, index) => (
                           <li key={index} className="flex items-center gap-1">
                               <Link href={crumb.href} className="text-muted-foreground hover:text-foreground">{crumb.name}</Link>
                                <ChevronRight className="w-4 h-4 text-muted-foreground"/>
                           </li>
                        ))}
                         <li className="font-semibold">{breadcrumbs.slice(-1)[0]?.name}</li>
                    </ol>
                </nav>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[300px_1fr_250px]">
                <div className="hidden md:block">
                    {sidebar}
                </div>
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
                            <Separator className="my-6"/>
                            {activeTopic.content && (
                                <article className="prose dark:prose-invert lg:prose-lg max-w-none">
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


export default function TopicPage() {
    return <Suspense fallback={<div>Loading Topic...</div>}><TopicPageLayout/></Suspense>
}
