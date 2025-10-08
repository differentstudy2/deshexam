
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
import type { Chapter, Solution, Textbook, Topic, Resource, Question } from '@/lib/types';
import { collection, doc, getDoc, getDocs, query, orderBy, where } from 'firebase/firestore';
import { ArrowLeft, BookOpen, FileText, CheckSquare, Loader2, Menu, ChevronRight, Lock, Award, Video, Mic, File as FileIcon, ExternalLink, Download, CheckCircle, XCircle, GripVertical } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { getUserProfile, getTextbookProgress, getSettings, getQuestionsByPracticeSet, getTopicsByChapterId } from '@/lib/firebase/firestore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ResourceViewerDialog } from '@/components/feature/resource-viewer-dialog';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScoreCircle } from '@/components/feature/score-circle';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


type UserProfile = {
  subscriptionPlan?: 'pass' | 'pro';
  displayName?: string;
};

type TextbookProgress = {
    highestScores: { [practiceSetId: string]: number };
    allAttempts: { [practiceSetId: string]: number };
}

const ChapterCard = ({
    chapter,
    topics,
    activeChapter,
    activeTopic,
    onTopicSelect,
    onChapterToggle,
    userProfile,
    loadingTopics,
    progress,
    settings,
    isUnlocked
}: {
    chapter: Chapter;
    topics: { [chapterId: string]: Topic[] };
    activeChapter: string | null;
    activeTopic: string | null;
    onTopicSelect: (chapterId: string, topicId: string) => void;
    onChapterToggle: (chapterId: string) => void;
    userProfile: UserProfile | null;
    loadingTopics: string | null;
    progress: TextbookProgress | null;
    settings: any;
    isUnlocked: boolean;
}) => {
    
    return (
        <Card className="flex flex-col">
            <CardHeader 
              className="bg-primary text-primary-foreground p-4 rounded-t-lg flex-row items-center justify-between cursor-pointer"
              onClick={() => onChapterToggle(chapter.id)}
            >
                <div className="flex items-center gap-3">
                    <BookOpen className="w-6 h-6" />
                    <CardTitle className="text-lg font-semibold">{chapter.title}</CardTitle>
                </div>
                 {!isUnlocked && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Lock className="w-5 h-5" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Complete previous chapters to unlock</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                )}
            </CardHeader>
            <CardContent className="p-4 flex-grow">
                {activeChapter === chapter.id && (
                    loadingTopics === chapter.id ? (
                        <div className="flex justify-center items-center h-full">
                           <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    ) : (
                        <ul className="space-y-2">
                           {(topics[chapter.id] || []).map(topic => (
                                <li key={topic.id}>
                                    <Button
                                        variant="ghost"
                                        disabled={!isUnlocked}
                                        className={cn(
                                            "w-full justify-start text-left h-auto py-1 px-2 text-base",
                                            activeTopic === topic.id ? "bg-accent text-accent-foreground" : ""
                                        )}
                                        onClick={() => onTopicSelect(chapter.id, topic.id)}
                                    >
                                        <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                                        {topic.title}
                                    </Button>
                                </li>
                           ))}
                           {(!topics[chapter.id] || topics[chapter.id].length === 0) && (
                                <p className="text-sm text-muted-foreground text-center py-4">No topics found for this chapter.</p>
                           )}
                        </ul>
                    )
                )}
            </CardContent>
        </Card>
    );
};


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

    const isPracticeSetPage = params.practiceSetId;

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

            const initialChapterId = searchParams.get('chapter') || chaptersData[0]?.id;
            if (initialChapterId) {
                await handleChapterToggle(initialChapterId);
            }

          } else {
            router.push('/');
          }
          setLoading(false);
        };

        fetchTextbookAndChapters();
    }, [textbookId, router, user]);

    const handleChapterToggle = useCallback(async (chapterId: string) => {
          const params = new URLSearchParams(searchParams.toString());
          
          if (activeChapterId === chapterId) {
              // If clicking the same chapter, close it.
              params.delete('chapter');
              params.delete('topic');
          } else {
              params.set('chapter', chapterId);
              params.delete('topic');

              // Fetch topics if not already fetched
              if (!topics[chapterId]) {
                  setLoadingTopics(chapterId);
                  try {
                      const topicsData = await getTopicsByChapterId(textbookId, chapterId);
                      setTopics(prev => ({ ...prev, [chapterId]: topicsData }));
                  } catch (e) {
                      toast({ variant: "destructive", title: "Error", description: "Could not load topics for this chapter." });
                  } finally {
                      setLoadingTopics(null);
                  }
              }
          }
          router.push(`?${params.toString()}`, { scroll: false });
    }, [textbookId, topics, toast, router, searchParams, activeChapterId]);
      
    const handleTopicSelect = (chapterId: string, topicId: string) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set('chapter', chapterId);
          params.set('topic', topicId);
          router.push(`?${params.toString()}`, { scroll: false });
    };

     const isChapterUnlocked = useCallback((chapter: Chapter, index: number): boolean => {
        const freeChapterCount = settings?.freeChaptersPerBook ?? 0;
        if (index < freeChapterCount) return true;

        if (settings?.gateChaptersOnPass) {
            if (index === 0) return true;
            const prevChapter = chapters[index - 1];
            if (!prevChapter) return true;
            const prevChapterTopics = topics[prevChapter.id];
            if (!prevChapterTopics) return false;
            const prevChapterPracticeSets = prevChapterTopics.flatMap(t => t.practiceSets || []);
            if (prevChapterPracticeSets.length === 0) return true; 
            const passMark = settings.practiceSetPassMark || 60;
            return prevChapterPracticeSets.every(ps => (progress?.highestScores?.[ps.id] || 0) >= passMark);
        }
        
        if (chapter.access === 'free') return true;
        if (!userProfile?.subscriptionPlan) return false;
        
        const hasProAccess = userProfile.subscriptionPlan === 'pro';
        const hasPassAccess = userProfile.subscriptionPlan === 'pass';
        
        if (chapter.access === 'pro' && hasProAccess) return true;
        if (chapter.access === 'pass' && (hasProAccess || hasPassAccess)) return true;

        return false;
  }, [chapters, topics, userProfile, settings, progress]);

    const MainContent = () => (
      <>
        <header className="mb-8 flex flex-col md:flex-row items-center gap-6 md:gap-8 rounded-lg bg-card p-6">
            <Image 
                src={textbook?.featureImage || "https://picsum.photos/seed/bookcover/200/280"}
                alt={textbook?.title || ''}
                width={150}
                height={210}
                className="rounded-md shadow-lg object-cover w-36 md:w-40 flex-shrink-0"
            />
            <div className="text-center md:text-left">
                <h1 className="font-headline text-3xl md:text-4xl font-bold">{textbook?.title} Solutions</h1>
                <p className="mt-2 text-lg text-muted-foreground">{textbook?.description}</p>
                <div className="mt-4 flex justify-center md:justify-start flex-wrap gap-2">
                    <Badge variant="secondary">{textbook?.subject}</Badge>
                    <Badge variant="secondary">{textbook?.class}</Badge>
                    {textbook?.board && <Badge variant="outline">{textbook.board}</Badge>}
                </div>
            </div>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chapters.map((chapter, index) => (
                <ChapterCard
                    key={chapter.id}
                    chapter={chapter}
                    topics={topics}
                    activeChapter={activeChapterId}
                    activeTopic={activeTopicId}
                    onTopicSelect={handleTopicSelect}
                    onChapterToggle={handleChapterToggle}
                    userProfile={userProfile}
                    loadingTopics={loadingTopics}
                    progress={progress}
                    settings={settings}
                    isUnlocked={isChapterUnlocked(chapter, index)}
                />
            ))}
        </div>
      </>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
                <Loader2 className="w-8 h-8 animate-spin"/>
            </div>
        );
    }
    
    return isPracticeSetPage ? <>{children}</> : (
        <div className="container mx-auto py-8 max-w-7xl">
            <MainContent />
        </div>
    );
}

export default function TextbookSolutionsPage({ children }: { children: React.ReactNode }) {
    return <Suspense fallback={<div>Loading...</div>}><TextbookSolutionsLayout>{children}</TextbookSolutionsLayout></Suspense>
}

