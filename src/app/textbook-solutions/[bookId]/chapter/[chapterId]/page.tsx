
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
import type { Chapter, Topic, Textbook, Resource } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
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

const getChapterIcon = (index: number) => {
    const icons = [<BookOpen />, <FileText />, <CheckSquare />, <Award />, <Video/>, <Mic/>];
    return icons[index % icons.length];
};

const SidebarNav = ({
  topics,
  activeTopic,
  textbookId,
  chapterId,
}: {
  topics: Topic[];
  activeTopic: string | null;
  textbookId: string;
  chapterId: string;
}) => (
    <ul className="space-y-1">
     {topics.map(topic => (
       <li key={topic.id}>
         <Button
           variant="ghost"
           asChild
           className={cn(
             "w-full justify-start text-left h-auto py-2 px-3 text-sm",
             activeTopic === topic.id ? "bg-accent text-accent-foreground" : ""
           )}
         >
           <Link href={`/textbook-solutions/${textbookId}/chapter/${chapterId}/topic/${topic.id}`}>
             {topic.title}
           </Link>
         </Button>
       </li>
     ))}
     {!topics || topics.length === 0 && (
        <p className="p-2 text-sm text-muted-foreground">No topics in this chapter.</p>
     )}
   </ul>
);


function ChapterPageContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    
    const textbookId = params.bookId as string;
    const chapterId = params.chapterId as string;
    const activeTopicId = searchParams.get('topic');

    const [textbook, setTextbook] = useState<Textbook | null>(null);
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [topics, setTopics] = useState<Topic[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    
    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerResource, setViewerResource] = useState<Resource | null>(null);

    const activeTopic = useMemo(() => {
        if (!topics || topics.length === 0 || !activeTopicId) return null;
        return topics.find(t => t.id === activeTopicId);
    }, [topics, activeTopicId]);

    useEffect(() => {
        const fetchPageData = async () => {
            setLoading(true);
            try {
                const [textbookSnap, chapterSnap, topicsData] = await Promise.all([
                    getDoc(doc(db, 'textbooks', textbookId)),
                    getDoc(doc(db, `textbooks/${textbookId}/chapters`, chapterId)),
                    getTopicsByChapterId(textbookId, chapterId),
                ]);

                if (textbookSnap.exists()) setTextbook({ id: textbookSnap.id, ...textbookSnap.data() } as Textbook);
                if (chapterSnap.exists()) setChapter({ id: chapterSnap.id, ...chapterSnap.data() } as Chapter);
                
                setTopics(topicsData);

                // If no topic is selected in URL and topics exist, redirect to the first topic
                if (!activeTopicId && topicsData.length > 0) {
                    router.replace(`/textbook-solutions/${textbookId}/chapter/${chapterId}/topic/${topicsData[0].id}`);
                }

            } catch (e) {
                toast({ variant: "destructive", title: "Error loading data", description: (e as Error).message });
            } finally {
                setLoading(false);
            }
        };

        fetchPageData();
    }, [textbookId, chapterId, toast, router, activeTopicId]);

    const handleResourceClick = (resource: Resource) => {
        setViewerResource(resource);
        setViewerOpen(true);
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-[calc(100vh-200px)]"><Loader2 className="w-8 h-8 animate-spin"/></div>;
    }
    
    const breadcrumbs = [
        { name: 'Textbooks', href: '/textbook-solutions'},
        { name: textbook?.title || 'Textbook', href: `/textbook-solutions/${textbookId}` },
        { name: chapter?.title || 'Chapter', href: `/textbook-solutions/${textbookId}/chapter/${chapterId}` },
    ];

    const sidebar = (
        <aside className="h-full bg-card border-r">
             <SheetHeader>
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            </SheetHeader>
            <div className="p-4 border-b">
                <Link href={`/textbook-solutions/${textbookId}`} className="flex items-center gap-2 font-semibold">
                    <ArrowLeft className="w-4 h-4" /> {textbook?.title}
                </Link>
            </div>
             <div className="p-4">
                 <h4 className="font-semibold text-lg mb-2">{chapter?.title}</h4>
                <SidebarNav 
                    topics={topics}
                    activeTopic={activeTopicId}
                    textbookId={textbookId}
                    chapterId={chapterId}
                />
            </div>
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
                     <ol className="flex items-center gap-1.5 whitespace-nowrap">
                        {breadcrumbs.map((crumb, index) => (
                           <li key={index} className="flex items-center gap-1.5">
                               <Link href={crumb.href} className="text-muted-foreground hover:text-foreground truncate">{crumb.name}</Link>
                               {index < breadcrumbs.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0"/>}
                           </li>
                        ))}
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
                         <div className="text-center text-muted-foreground pt-16">
                            <BookOpen className="w-16 h-16 mx-auto mb-4"/>
                            <h2 className="text-xl font-semibold">Select a topic</h2>
                            <p>Choose a topic from the sidebar to view its content.</p>
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
