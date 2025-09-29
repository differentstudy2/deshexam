

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
import { collection, doc, getDoc, getDocs, query, orderBy, where } from 'firebase/firestore';
import { ArrowLeft, BookOpen, FileText, CheckSquare, Loader2, Menu, ChevronRight, Lock, Award, Video, Mic, File as FileIcon, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from 'react';
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
    highestScores: { [practiceSetId: string]: number };
    allAttempts: { [practiceSetId: string]: number };
}

const PracticeSetItem = ({ 
    ps, 
    textbookId, 
    chapterId, 
    topicId, 
    isLocked, 
    highestScore 
}: { 
    ps: any; 
    textbookId: string; 
    chapterId: string; 
    topicId: string; 
    isLocked: boolean; 
    highestScore?: number; 
}) => {
    return (
        <Card className="p-4 flex flex-col sm:flex-row justify-between items-center not-prose gap-4">
            <div className="flex items-center gap-3 flex-grow">
                {isLocked ? (
                    <Lock className="h-5 w-5 text-muted-foreground" />
                ) : (
                    <CheckSquare className="h-5 w-5 text-primary" />
                )}
                <span className="font-medium">{ps.title}</span>
            </div>
            <div className="flex items-center gap-4">
                {highestScore !== undefined && (
                    <div className="text-center">
                        <p className="font-bold text-sm text-primary flex items-center gap-1"><Award className="w-4 h-4"/> Best: {Math.round(highestScore)}%</p>
                    </div>
                )}
                <Button asChild disabled={isLocked}>
                    <Link href={`/textbook-solutions/practice-set/${ps.id}?textbook=${textbookId}&chapter=${chapterId}&topic=${topicId}`}>
                            Start Practice
                    </Link>
                </Button>
            </div>
        </Card>
    );
};


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
        if (!settings?.gateChaptersOnPass) return true; 
        if (index < settings.freeChaptersPerBook) return true; 

        if (chapter.access !== 'free') {
            if (!userProfile) return false;
            if (userProfile.subscriptionPlan === 'pro') {
                return true;
            } else if (userProfile.subscriptionPlan === 'pass' && chapter.access === 'pro') {
                return false; 
            } else if (!userProfile.subscriptionPlan) {
                return false; 
            }
        }
        
        const previousChapter = chapters[index - 1];
        if (!previousChapter) return true; 
        
        const prevChapterTopics = topics[previousChapter.id] || [];
        if (prevChapterTopics.length === 0) return true;

        for (const topic of prevChapterTopics) {
            if (topic.practiceSets && topic.practiceSets.length > 0) {
                for (const ps of topic.practiceSets) {
                    const score = progress?.highestScores[ps.id];
                    if (score === undefined || score < (settings?.practiceSetPassMark || 40)) {
                        return false; // Found an incomplete/failed practice set
                    }
                }
            }
        }
        
        return true; // All practice sets in previous chapter are passed
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
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
          const progressData = await getTextbookProgress(user.uid, textbookId);
          setProgress(progressData);
      }

      if (textbookDocSnap.exists()) {
        setTextbook({ id: textbookDocSnap.id, ...textbookDocSnap.data() } as Textbook);
        
        const chaptersQuery = query(collection(db, `textbooks/${textbookId}/chapters`));
        const chaptersSnap = await getDocs(chaptersQuery);
        let chaptersData = chaptersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chapter));
        
        chaptersData.sort((a, b) => {
            return a.title.localeCompare(b.title, undefined, { numeric: true });
        });
        
        setChapters(chaptersData);

        const allTopics : { [key: string]: Topic[] } = {};

        for(const chapter of chaptersData) {
            const topicsQuery = query(collection(db, `textbooks/${textbookId}/chapters/${chapter.id}/topics`));
            const topicsSnap = await getDocs(topicsQuery);
            let topicsForChapter: Topic[] = topicsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Topic));
            
            topicsForChapter.sort((a, b) => {
                return a.title.localeCompare(b.title, undefined, { numeric: true });
            });

             for (let topic of topicsForChapter) {
                const practiceSetsQuery = query(collection(db, `textbooks/${textbookId}/chapters/${chapter.id}/topics/${topic.id}/practiceSets`), orderBy("createdAt", "desc"));
                const practiceSetsSnap = await getDocs(practiceSetsQuery);
                topic.practiceSets = practiceSetsSnap.docs.map(doc => ({ id: doc.id, title: doc.data().title, ...doc.data() }));
                topic.practiceSets.sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }));
             }

             allTopics[chapter.id] = topicsForChapter;
        }

        setTopics(allTopics);


      } else {
        router.push('/');
      }
      setLoading(false);
    };

    fetchTextbookAndChapters();
  }, [textbookId, router, user]);

  const handleChapterToggle = useCallback(async (chapterId: string) => {
      // Data is now pre-fetched, so this can be a simple state update if needed
      // Or just rely on the accordion to show/hide content
  }, []);
  
  const handleTopicSelect = (chapterId: string, topicId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('chapter', chapterId);
      params.set('topic', topicId);
      router.push(`?${params.toString()}`, { scroll: false });
  };
  
  const selectedTopicContent = useMemo(() => {
    if (!activeChapter || !activeTopic || !topics[activeChapter]) return null;
    const topic = topics[activeChapter]?.find(t => t.id === activeTopic);
    if (!topic) return null;
  
    // Ensure practice sets are sorted for consistent locking logic
    const sortedPracticeSets = [...(topic.practiceSets || [])].sort((a, b) =>
      a.title.localeCompare(b.title, undefined, { numeric: true })
    );
  
    return { ...topic, practiceSets: sortedPracticeSets };
  }, [activeChapter, activeTopic, topics]);


  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <Loader2 className="w-8 h-8 animate-spin"/>
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
  
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4 text-primary" />;
      case 'audio': return <Mic className="w-4 h-4 text-primary" />;
      case 'pdf': return <FileIcon className="w-4 h-4 text-primary" />;
      case 'doc': return <FileText className="w-4 h-4 text-primary" />;
      default: return <FileText className="w-4 h-4 text-primary" />;
    }
  };
  
  const getYoutubeVideoId = (url: string): string | null => {
      if (!url) return null;
      try {
        const urlObj = new URL(url);
        if (urlObj.hostname.includes('youtube.com')) {
          return urlObj.searchParams.get('v');
        }
        if (urlObj.hostname.includes('youtu.be')) {
          return urlObj.pathname.slice(1);
        }
      } catch (error) {
          // Invalid URL format, ignore
      }
      return null;
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
                           <SheetTitle>Table of Contents</SheetTitle>
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
                                
                                {selectedTopicContent.resources && selectedTopicContent.resources.length > 0 && (
                                  <div className="mt-8">
                                    <Separator />
                                    <h3 className="mt-6 font-semibold text-2xl">Additional Resources</h3>
                                    <div className="space-y-4 mt-4 not-prose">
                                      {selectedTopicContent.resources.map(resource => {
                                          if (resource.type === 'video') {
                                              const videoId = getYoutubeVideoId(resource.url);
                                              if(videoId) {
                                                  return (
                                                      <div key={resource.id} className="space-y-2">
                                                          <h4 className="font-medium flex items-center gap-2">{getResourceIcon(resource.type)} {resource.title}</h4>
                                                           <div className="aspect-video w-full">
                                                              <iframe 
                                                                  className="w-full h-full rounded-lg"
                                                                  src={`https://www.youtube.com/embed/${videoId}`} 
                                                                  title={resource.title}
                                                                  frameBorder="0" 
                                                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                                                  allowFullScreen>
                                                              </iframe>
                                                          </div>
                                                      </div>
                                                  )
                                              }
                                          }
                                          if (resource.type === 'audio') {
                                            return (
                                              <div key={resource.id} className="space-y-2">
                                                <h4 className="font-medium flex items-center gap-2">{getResourceIcon(resource.type)} {resource.title}</h4>
                                                <audio controls controlsList="nodownload" src={resource.url} className="w-full">
                                                  Your browser does not support the audio element.
                                                </audio>
                                              </div>
                                            );
                                          }
                                          if (resource.type === 'pdf') {
                                            return (
                                                <div key={resource.id} className="space-y-2">
                                                    <h4 className="font-medium flex items-center gap-2">{getResourceIcon(resource.type)} {resource.title}</h4>
                                                    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 border rounded-md hover:bg-secondary transition-colors no-underline">
                                                        <span>Open PDF Document</span>
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                </div>
                                            );
                                          }
                                          // Fallback for other types or non-youtube videos
                                          return (
                                              <a key={resource.id} href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 border rounded-md hover:bg-secondary transition-colors no-underline">
                                                {getResourceIcon(resource.type)}
                                                <span className="ml-3 font-medium">{resource.title}</span>
                                              </a>
                                          );
                                      })}
                                    </div>
                                  </div>
                                )}
                                
                                {selectedTopicContent.practiceSets && selectedTopicContent.practiceSets.length > 0 && (
                                    <div className="mt-8">
                                        <Separator />
                                        <h3 className="mt-6 font-semibold text-2xl">Practice Sets</h3>
                                        <div className="space-y-2 mt-4">
                                            {selectedTopicContent.practiceSets.map((ps, index) => {
                                                const passMark = settings?.practiceSetPassMark || 40;
                                                const prevPsId = index > 0 ? selectedTopicContent.practiceSets[index - 1].id : null;
                                                const prevSetHighestScore = prevPsId ? progress?.highestScores?.[prevPsId] : undefined;
                                                
                                                // The first practice set is always unlocked.
                                                // Subsequent sets are locked if the previous set hasn't been passed.
                                                const isLocked = index > 0 && (prevSetHighestScore === undefined || prevSetHighestScore < passMark);

                                                return (
                                                  <PracticeSetItem
                                                    key={ps.id}
                                                    ps={ps}
                                                    textbookId={textbookId}
                                                    chapterId={activeChapter!}
                                                    topicId={activeTopic!}
                                                    isLocked={isLocked}
                                                    highestScore={progress?.highestScores?.[ps.id]}
                                                  />
                                                );
                                            })}
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


