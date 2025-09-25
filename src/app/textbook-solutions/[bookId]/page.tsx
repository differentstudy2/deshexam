

'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { db } from '@/lib/firebase/client';
import type { Chapter, Solution, Textbook, Topic } from '@/lib/types';
import { collection, doc, getDoc, getDocs, query } from 'firebase/firestore';
import { ArrowLeft, BookOpen, FileText, CheckSquare, Loader2, Menu, ChevronRight, Lock } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { getUserProfile } from '@/lib/firebase/firestore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type UserProfile = {
  subscriptionPlan?: 'pass' | 'pro';
};

const TextbookContentSidebar = ({
  chapters,
  topics,
  activeChapter,
  activeTopic,
  onTopicSelect,
  onSheetClose,
  userProfile,
}: {
  chapters: Chapter[];
  topics: { [key: string]: Topic[] };
  activeChapter: string | null;
  activeTopic: string | null;
  onTopicSelect: (chapterId: string, topicId: string) => void;
  onSheetClose?: () => void;
  userProfile: UserProfile | null;
}) => {
    
    const hasAccess = (chapter: Chapter) => {
        if (chapter.access === 'free') return true;
        if (!userProfile) return false;
        if (chapter.access === 'pro') return userProfile.subscriptionPlan === 'pro';
        if (chapter.access === 'pass') return userProfile.subscriptionPlan === 'pass' || userProfile.subscriptionPlan === 'pro';
        return false;
    }

    const [openAccordion, setOpenAccordion] = useState<string | undefined>(activeChapter ? `item-${activeChapter}` : undefined);
    
    useEffect(() => {
        setOpenAccordion(activeChapter ? `item-${activeChapter}` : undefined);
    }, [activeChapter]);

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
                onValueChange={(value) => setOpenAccordion(value)}
            >
            {chapters.map((chapter) => {
                const canAccess = hasAccess(chapter);
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
                                        <p>Upgrade to {chapter.access === 'pro' ? 'Pass Pro' : 'Pass'} to access this chapter.</p>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>

                        <AccordionContent>
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
                            </ul>
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
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const activeChapter = searchParams.get('chapter');
  const activeTopic = searchParams.get('topic');

  useEffect(() => {
    if (!textbookId) return;

    const fetchTextbookData = async () => {
      setLoading(true);
      const textbookDocRef = doc(db, 'textbooks', textbookId);
      const textbookDocSnap = await getDoc(textbookDocRef);
      
      if (user) {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
      }

      if (textbookDocSnap.exists()) {
        setTextbook({ id: textbookDocSnap.id, ...textbookDocSnap.data() } as Textbook);
        
        const chaptersQuery = query(collection(db, `textbooks/${textbookId}/chapters`));
        const chaptersSnap = await getDocs(chaptersQuery);
        const chaptersData = chaptersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chapter));
        setChapters(chaptersData);

        const allTopics: { [key: string]: Topic[] } = {};

        for (const chapter of chaptersData) {
            const topicsQuery = query(collection(db, `textbooks/${textbookId}/chapters/${chapter.id}/topics`));
            const topicsSnap = await getDocs(topicsQuery);
            const topicsForChapter = topicsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Topic));
            
             // Fetch practice sets for each topic
            for (let topic of topicsForChapter) {
              const practiceSetsQuery = query(collection(db, `textbooks/${textbookId}/chapters/${chapter.id}/topics/${topic.id}/practiceSets`));
              const practiceSetsSnap = await getDocs(practiceSetsQuery);
              topic.practiceSets = practiceSetsSnap.docs.map(doc => ({ id: doc.id, title: doc.data().title }));
            }

            allTopics[chapter.id] = topicsForChapter;
        }
        setTopics(allTopics);

      } else {
        router.push('/');
      }
      setLoading(false);
    };

    fetchTextbookData();
  }, [textbookId, router, user]);
  
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
       <div className="mb-6 flex justify-between items-center">
            <div className="text-sm text-muted-foreground flex items-center gap-1.5 flex-wrap">
                <Link href="/textbook-solutions" className="hover:text-primary">Textbook Solutions</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-foreground">{textbook.title}</span>
            </div>

            <div className="md:hidden">
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline">
                            <Menu className="mr-2 h-4 w-4" />
                            Table of Contents
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-2 w-[80%] sm:max-w-sm">
                        <TextbookContentSidebar
                            chapters={chapters}
                            topics={topics}
                            activeChapter={activeChapter}
                            activeTopic={activeTopic}
                            onTopicSelect={handleTopicSelect}
                            onSheetClose={() => setIsSheetOpen(false)}
                            userProfile={userProfile}
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
            userProfile={userProfile}
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
