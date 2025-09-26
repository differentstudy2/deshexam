
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { db } from '@/lib/firebase/client';
import type { Chapter, Solution, Textbook, Topic } from '@/lib/types';
import { collection, doc, getDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { ArrowLeft, BookOpen, FileText, CheckSquare, Loader2, Menu, ChevronRight, Lock } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { getUserProfile, getTextbookProgress, getSettings } from '@/lib/firebase/firestore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type UserProfile = {
  subscriptionPlan?: 'pass' | 'pro';
};

type TextbookProgress = {
    [chapterId: string]: {
        completed: boolean;
        // In the future, we can add more details like score, completionDate, etc.
    }
}

const TextbookContentSidebar = ({
  chapters,
  topics,
  activeChapter,
  activeTopic,
  onTopicSelect,
  onChapterToggle,
  onSheetClose,
  userProfile,
  loadingTopics,
  progress,
  settings,
}: {
  chapters: Chapter[];
  topics: { [key: string]: Topic[] };
  activeChapter: string | null;
  activeTopic: string | null;
  onTopicSelect: (chapterId: string, topicId: string) => void;
  onChapterToggle: (chapterId: string) => void;
  onSheetClose?: () => void;
  userProfile: UserProfile | null;
  loadingTopics: string | null;
  progress: TextbookProgress | null;
  settings: any;
}) => {
    
    const hasAccess = (chapter: Chapter, index: number) => {
        if (!settings?.gateChaptersOnPass) return true; // If gating is off, all are accessible
        if (index < settings.freeChaptersPerBook) return true; // Free chapters are always accessible

        // Rule 2: Check subscription access
        if (chapter.access !== 'free') {
            if (!userProfile) return false;
            if (userProfile.subscriptionPlan === 'pro') {
                // Pro can access everything
            } else if (userProfile.subscriptionPlan === 'pass' && chapter.access === 'pro') {
                return false; // Pass user can't access Pro chapter
            } else if (!userProfile.subscriptionPlan) {
                return false; // Free user can't access paid chapters
            }
        }
        
        // Rule 3: Check sequential completion
        const previousChapter = chapters[index - 1];
        if (!previousChapter) return true; // Should not happen
        
        return progress?.[previousChapter.id]?.completed ?? false;
    }

    const [openAccordion, setOpenAccordion] = useState<string | undefined>(activeChapter ? `item-${activeChapter}` : undefined);
    
    useEffect(() => {
        setOpenAccordion(activeChapter ? `item-${activeChapter}` : undefined);
    }, [activeChapter]);

    const handleAccordionChange = (value: string) => {
        const chapterId = value.replace('item-', '');
        setOpenAccordion(value);
        if (chapterId) {
            onChapterToggle(chapterId);
        }
    }

    return (
    <Card>
        <CardHeader>
            <CardTitle>Chapters</CardTitle>
        </CardHeader>
        <CardContent>
            <Accordion 
                type="single" 
                collapsible 
                value={openAccordion}
                onValueChange={handleAccordionChange}
            >
            {chapters.map((chapter, index) => {
                const canAccess = hasAccess(chapter, index);
                return (
                    <AccordionItem value={`item-${chapter.id}`} key={chapter.id} disabled={!canAccess}>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <AccordionTrigger 
                                        className={!canAccess ? 'cursor-not-allowed text-muted-foreground' : ''}
                                    >
                                        <span className="flex items-center gap-2">
                                            {!canAccess && <Lock className="w-4 h-4" />}
                                            {chapter.title}
                                        </span>
                                    </AccordionTrigger>
                                </TooltipTrigger>
                                {!canAccess && (
                                    <TooltipContent>
                                        <p>Complete the previous chapter to unlock.</p>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>

                        <AccordionContent>
                             {loadingTopics === chapter.id ? (
                                <div className="flex justify-center items-center p-4">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                </div>
                            ) : (
                                <ul className="space-y-1">
                                    {(topics[chapter.id] || []).map(topic => (
                                        <li key={topic.id}>
                                            <Button
                                                variant="ghost"
                                                className={`w-full justify-start h-auto py-2 px-3 text-left font-normal ${activeTopic === topic.id ? 'bg-secondary' : ''}`}
                                                onClick={() => {
                                                    onTopicSelect(chapter.id, topic.id);
                                                    onSheetClose?.();
                                                }}
                                            >
                                            <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
                                            <span className="flex-grow">{topic.title}</span>
                                            </Button>
                                        </li>
                                    ))}
                                    {topics[chapter.id] && topics[chapter.id].length === 0 && (
                                        <li className="text-sm text-muted-foreground text-center p-2">No topics in this chapter.</li>
                                    )}
                                </ul>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                )
            })}
            </Accordion>
        </CardContent>
    </Card>
)};


export default function TextbookSolutionsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const textbookId = params.bookId as string;
  const router = useRouter();
  const { user } = useAuth();
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [textbook, setTextbook] = useState<Textbook | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [topics, setTopics] = useState<{ [chapterId: string]: Topic[] }>({});
  const [progress, setProgress] = useState<TextbookProgress | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingTopics, setLoadingTopics] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const activeChapter = searchParams.get('chapter');
  const activeTopic = searchParams.get('topic');

  useEffect(() => {
    if (!textbookId) return;

    const fetchTextbookAndChapters = async () => {
      setLoading(true);
      const textbookDocRef = doc(db, 'textbooks', textbookId);
      
      const [siteSettings, textbookDocSnap] = await Promise.all([getSettings(), getDoc(textbookDocRef)]);
      setSettings(siteSettings);

      if (user) {
          const [profile, progressData] = await Promise.all([
            getUserProfile(user.uid),
            getTextbookProgress(user.uid, textbookId)
          ]);
          setUserProfile(profile);
          setProgress(progressData);
      }

      if (textbookDocSnap.exists()) {
        setTextbook({ id: textbookDocSnap.id, ...textbookDocSnap.data() } as Textbook);
        
        const chaptersQuery = query(collection(db, `textbooks/${textbookId}/chapters`));
        const chaptersSnap = await getDocs(chaptersQuery);
        const chaptersData = chaptersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chapter));
        
        chaptersData.sort((a, b) => {
            const numA = parseInt(a.title.match(/^\d+/)?.[0] || '0', 10);
            const numB = parseInt(b.title.match(/^\d+/)?.[0] || '0', 10);
            return numA - numB;
        });
        setChapters(chaptersData);

        if(activeChapter) {
            handleChapterToggle(activeChapter);
        }

      } else {
        router.push('/');
      }
      setLoading(false);
    };

    fetchTextbookAndChapters();
  }, [textbookId, router, user]);

  const handleChapterToggle = useCallback(async (chapterId: string) => {
      if (topics[chapterId]) return;

      setLoadingTopics(chapterId);
      try {
          const topicsQuery = query(collection(db, `textbooks/${textbookId}/chapters/${chapterId}/topics`));
          const topicsSnap = await getDocs(topicsQuery);
          const topicsForChapter = topicsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Topic));
          
          topicsForChapter.sort((a, b) => {
              const numA = parseFloat(a.title.match(/^\d+(\.\d+)?/)?.[0] || '0');
              const numB = parseFloat(b.title.match(/^\d+(\.\d+)?/)?.[0] || '0');
              return numA - numB;
          });
          
          for (let topic of topicsForChapter) {
            const practiceSetsQuery = query(collection(db, `textbooks/${textbookId}/chapters/${chapterId}/topics/${topic.id}/practiceSets`), orderBy("createdAt", "desc"));
            const practiceSetsSnap = await getDocs(practiceSetsQuery);
            topic.practiceSets = practiceSetsSnap.docs.map(doc => ({ id: doc.id, title: doc.data().title }));
          }

          setTopics(prev => ({ ...prev, [chapterId]: topicsForChapter }));
      } catch (error) {
          console.error("Failed to fetch topics:", error);
      } finally {
          setLoadingTopics(null);
      }
  }, [textbookId, topics]);
  
  const handleTopicSelect = (chapterId: string, topicId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('chapter', chapterId);
      params.set('topic', topicId);
      router.push(`?${params.toString()}`, { scroll: false });
  };
  
  const selectedTopicContent = activeChapter && activeTopic ? topics[activeChapter]?.find(t => t.id === activeTopic) : null;

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="ml-4 text-lg">Loading Textbook...</p>
        </div>
    );
  }

  if (!textbook) {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <p>Textbook not found.</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-7xl">
       <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground flex items-center gap-1.5 flex-wrap">
                <Link href="/textbook-solutions" className="hover:text-primary">Textbook Solutions</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-foreground">{textbook.title}</span>
            </div>

            <div className="md:hidden self-end">
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline">
                            <Menu className="mr-2 h-4 w-4" />
                            Table of Contents
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-2 w-[80%] sm:max-w-sm">
                        <SheetHeader>
                           <SheetTitle className="sr-only">Table of Contents</SheetTitle>
                        </SheetHeader>
                        <TextbookContentSidebar
                            chapters={chapters}
                            topics={topics}
                            activeChapter={activeChapter}
                            activeTopic={activeTopic}
                            onTopicSelect={handleTopicSelect}
                            onChapterToggle={handleChapterToggle}
                            onSheetClose={() => setIsSheetOpen(false)}
                            userProfile={userProfile}
                            loadingTopics={loadingTopics}
                            progress={progress}
                            settings={settings}
                        />
                    </SheetContent>
                </Sheet>
            </div>
       </div>
      <header className="mb-8 flex flex-col md:flex-row items-center gap-6 md:gap-8 rounded-lg bg-card p-6">
        <Image 
            src={textbook.featureImage || "https://picsum.photos/seed/bookcover/200/280"}
            alt={textbook.title}
            width={150}
            height={210}
            className="rounded-md shadow-lg object-cover w-36 md:w-40 flex-shrink-0"
        />
        <div className="text-center md:text-left">
            <h1 className="font-headline text-3xl md:text-4xl font-bold">{textbook.title} Solutions</h1>
            <p className="mt-2 text-lg text-muted-foreground">{textbook.description}</p>
            <div className="mt-4 flex justify-center md:justify-start flex-wrap gap-2">
                <Badge variant="secondary">{textbook.subject}</Badge>
                <Badge variant="secondary">{textbook.class}</Badge>
                {textbook.board && <Badge variant="outline">{textbook.board}</Badge>}
            </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8 items-start">
        <aside className="hidden md:block md:sticky md:top-24">
          <TextbookContentSidebar
            chapters={chapters}
            topics={topics}
            activeChapter={activeChapter}
            activeTopic={activeTopic}
            onTopicSelect={handleTopicSelect}
            onChapterToggle={handleChapterToggle}
            userProfile={userProfile}
            loadingTopics={loadingTopics}
            progress={progress}
            settings={settings}
          />
        </aside>

        <main>
           {selectedTopicContent ? (
             <Card>
                <CardContent className="p-4">
                     <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger className="text-xl font-headline">{selectedTopicContent.title}</AccordionTrigger>
                            <AccordionContent className="prose dark:prose-invert max-w-none pt-4">
                                <div dangerouslySetInnerHTML={{ __html: selectedTopicContent.content || '<p>No content available for this topic yet.</p>' }} />
                                
                                {selectedTopicContent.practiceSets && selectedTopicContent.practiceSets.length > 0 && (
                                    <div className="mt-8">
                                        <Separator />
                                        <h3 className="mt-6 font-semibold text-lg">Practice Sets</h3>
                                        <div className="space-y-2 mt-4">
                                            {selectedTopicContent.practiceSets.map(ps => (
                                                <Card key={ps.id} className="p-4 flex justify-between items-center not-prose">
                                                    <div className="flex items-center gap-3">
                                                        <CheckSquare className="h-5 w-5 text-primary" />
                                                        <span className="font-medium">{ps.title}</span>
                                                    </div>
                                                    <Button asChild>
                                                        <Link href={`/textbook-solutions/practice-set/${ps.id}?textbook=${textbookId}&chapter=${activeChapter}&topic=${activeTopic}`}>
                                                                Start Practice
                                                        </Link>
                                                    </Button>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
           ) : (
             <Card className="min-h-[60vh] flex items-center justify-center">
                <CardContent className="text-center text-muted-foreground">
                    <BookOpen className="mx-auto h-12 w-12 mb-4" />
                    <p className="font-semibold">Select a chapter and topic to start learning.</p>
                </CardContent>
            </Card>
           )}
        </main>
      </div>
    </div>
  );
}
