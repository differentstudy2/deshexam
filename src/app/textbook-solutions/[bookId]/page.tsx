
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { db } from '@/lib/firebase/client';
import type { Chapter, Topic, Textbook, Question, Resource } from '@/lib/types';
import { collection, doc, getDoc, getDocs, query } from 'firebase/firestore';
import { ArrowLeft, BookOpen, FileText, CheckSquare, Loader2, Menu, ChevronRight, Lock, Award, Video, Mic, File as FileIcon, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback, Suspense, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { getUserProfile, getTextbookProgress, getSettings, getTopicsByChapterId } from '@/lib/firebase/firestore';
import { Tooltip, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ResourceViewerDialog } from '@/components/feature/resource-viewer-dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Separator } from '@/components/ui/separator';

type UserProfile = {
  subscriptionPlan?: 'pass' | 'pro';
};

type TextbookProgress = {
    highestScores: { [practiceSetId: string]: number };
    allAttempts: { [practiceSetId: string]: number };
}

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
  onChapterToggle,
  onTopicSelect,
  isChapterUnlocked,
  loadingTopics,
}: {
  chapters: Chapter[];
  topics: { [key: string]: Topic[] };
  activeChapter: string | null;
  activeTopic: string | null;
  onChapterToggle: (chapterId: string) => void;
  onTopicSelect: (chapterId: string, topicId: string) => void;
  isChapterUnlocked: (chapter: Chapter, index: number) => boolean;
  loadingTopics: string | null;
}) => (
    <Accordion type="single" collapsible value={activeChapter || undefined} onValueChange={(value) => onChapterToggle(value)}>
      {chapters.map((chapter, index) => (
        <AccordionItem value={chapter.id} key={chapter.id}>
          <AccordionTrigger
            disabled={!isChapterUnlocked(chapter, index)}
            className="hover:no-underline [&[data-state=open]]:bg-accent/50"
          >
             <div className="flex items-center gap-2">
                {!isChapterUnlocked(chapter, index) && <Lock className="w-4 h-4 text-muted-foreground" />}
                <span className={cn(!isChapterUnlocked(chapter, index) && "text-muted-foreground")}>{chapter.title}</span>
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
                       className={cn(
                         "w-full justify-start text-left h-auto py-1 px-2 text-base",
                         activeTopic === topic.id ? "bg-accent text-accent-foreground" : ""
                       )}
                       onClick={() => onTopicSelect(chapter.id, topic.id)}
                     >
                       {topic.title}
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


function TextbookSolutionsLayout({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const { toast } = useToast();
    
    const textbookId = params.bookId as string;
    const activeChapterId = searchParams.get('chapter');
    const activeTopicId = searchParams.get('topic');

    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [textbook, setTextbook] = useState<Textbook | null>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [topics, setTopics] = useState<{ [chapterId: string]: Topic[] }>({});
    const [progress, setProgress] = useState<TextbookProgress | null>(null);
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [loadingTopics, setLoadingTopics] = useState<string | null>(null);
    
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerResource, setViewerResource] = useState<Resource | null>(null);

    const activeChapter = useMemo(() => chapters.find(c => c.id === activeChapterId), [chapters, activeChapterId]);
    const activeTopic = useMemo(() => topics[activeChapterId || '']?.find(t => t.id === activeTopicId), [topics, activeChapterId, activeTopicId]);

    const fetchTextbookAndChapters = useCallback(async () => {
        setLoading(true);
        try {
            const textbookDocRef = doc(db, 'textbooks', textbookId);
            const [siteSettings, textbookDocSnap, profile, progressData] = await Promise.all([
                getSettings(),
                getDoc(textbookDocRef),
                user ? getUserProfile(user.uid) : Promise.resolve(null),
                user ? getTextbookProgress(user.uid, textbookId) : Promise.resolve(null)
            ]);

            setSettings(siteSettings);
            setUserProfile(profile);
            setProgress(progressData);

            if (textbookDocSnap.exists()) {
                setTextbook({ id: textbookDocSnap.id, ...textbookDocSnap.data() } as Textbook);
                const chaptersQuery = query(collection(db, `textbooks/${textbookId}/chapters`));
                const chaptersSnap = await getDocs(chaptersQuery);
                const chaptersData = chaptersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chapter))
                    .sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }));
                setChapters(chaptersData);

                if (activeChapterId) {
                    await handleChapterToggle(activeChapterId, true);
                }
            } else {
                toast({ variant: 'destructive', title: 'Textbook not found.' });
                router.push('/textbook-solutions');
            }
        } catch (e) {
            toast({ variant: "destructive", title: "Error loading textbook", description: (e as Error).message });
        } finally {
            setLoading(false);
        }
    }, [textbookId, user, activeChapterId, toast, router]);

    useEffect(() => {
        fetchTextbookAndChapters();
    }, [fetchTextbookAndChapters]);

    const handleChapterToggle = useCallback(async (chapterId: string, forceOpen = false) => {
        const params = new URLSearchParams(searchParams.toString());
        if (!forceOpen && activeChapterId === chapterId) {
            params.delete('chapter');
            params.delete('topic');
            router.push(`?${params.toString()}`, { scroll: false });
        } else if (!topics[chapterId]) {
            setLoadingTopics(chapterId);
            params.set('chapter', chapterId);
            params.delete('topic');
            router.push(`?${params.toString()}`, { scroll: false });
            try {
                const topicsData = await getTopicsByChapterId(textbookId, chapterId);
                setTopics(prev => ({ ...prev, [chapterId]: topicsData }));
            } catch (e) {
                toast({ variant: "destructive", title: "Error loading topics", description: (e as Error).message });
            } finally {
                setLoadingTopics(null);
            }
        } else {
             params.set('chapter', chapterId);
             params.delete('topic');
             router.push(`?${params.toString()}`, { scroll: false });
        }
    }, [textbookId, topics, toast, router, searchParams, activeChapterId]);

    const handleTopicSelect = (chapterId: string, topicId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('chapter', chapterId);
        params.set('topic', topicId);
        router.push(`?${params.toString()}`, { scroll: false });
        setIsSheetOpen(false);
    };
    
    const isChapterUnlocked = useCallback((chapter: Chapter, index: number): boolean => {
        if (!settings) return false;
        if (index < (settings.freeChaptersPerBook ?? 0)) return true;
        if (settings.gateChaptersOnPass) {
            if (index === 0) return true;
            const prevChapter = chapters[index - 1];
            if (!prevChapter) return true;
            const prevChapterTopics = topics[prevChapter.id];
            if (!prevChapterTopics) return false;
            const prevChapterPracticeSets = prevChapterTopics.flatMap(t => t.practiceSets || []);
            if (prevChapterPracticeSets.length === 0) return true;
            return prevChapterPracticeSets.every(ps => (progress?.highestScores?.[ps.id] || 0) >= (settings.practiceSetPassMark || 60));
        }
        if (chapter.access === 'free') return true;
        if (!userProfile?.subscriptionPlan) return false;
        if (userProfile.subscriptionPlan === 'pro') return true;
        if (chapter.access === 'pass' && userProfile.subscriptionPlan === 'pass') return true;
        return false;
    }, [chapters, topics, userProfile, settings, progress]);
    
    const handleResourceClick = (resource: Resource) => {
        setViewerResource(resource);
        setViewerOpen(true);
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-[calc(100vh-200px)]"><Loader2 className="w-8 h-8 animate-spin"/></div>;
    }

     // If there are children (e.g., a specific practice set page), render them directly.
    if (children) {
        return <>{children}</>;
    }
    
    const breadcrumbs = [
        { name: textbook?.title || 'Textbook', href: `/textbook-solutions/${textbookId}` },
        ...(activeChapter ? [{ name: activeChapter.title, href: `?chapter=${activeChapter.id}` }] : []),
        ...(activeTopic ? [{ name: activeTopic.title, href: `?chapter=${activeChapterId}&topic=${activeTopicId}` }] : []),
    ];

    const sidebar = (
        <aside className="h-full bg-card border-r">
            <div className="p-4 border-b">
                <Link href="/textbook-solutions" className="flex items-center gap-2 font-semibold">
                    <ArrowLeft className="w-4 h-4" /> All Textbooks
                </Link>
            </div>
            <SidebarNav 
                chapters={chapters} 
                topics={topics}
                activeChapter={activeChapterId}
                activeTopic={activeTopicId}
                onChapterToggle={handleChapterToggle}
                onTopicSelect={handleTopicSelect}
                isChapterUnlocked={isChapterUnlocked}
                loadingTopics={loadingTopics}
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
                                         <Link key={ps.id} href={`/textbook-solutions/practice-set/${ps.id}?textbook=${textbookId}&chapter=${activeChapterId}&topic=${activeTopicId}`}>
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
                        {/* Placeholder for future table of contents */}
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

export default function TextbookSolutionsPage({ children }: { children: React.ReactNode }) {
    return <Suspense fallback={<div>Loading...</div>}><TextbookSolutionsLayout>{children}</TextbookSolutionsLayout></Suspense>
}
