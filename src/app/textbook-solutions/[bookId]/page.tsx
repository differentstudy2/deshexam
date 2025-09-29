

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
import { ArrowLeft, BookOpen, FileText, CheckSquare, Loader2, Menu, ChevronRight, Lock, Award, Video, Mic, File as FileIcon, ExternalLink, Download } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { getUserProfile, getTextbookProgress, getSettings, getQuestionsByPracticeSet } from '@/lib/firebase/firestore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ResourceViewerDialog } from '@/components/feature/resource-viewer-dialog';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ReactDOM from 'react-dom';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';


type UserProfile = {
  subscriptionPlan?: 'pass' | 'pro';
};

type TextbookProgress = {
    highestScores: { [practiceSetId: string]: number };
    allAttempts: { [practiceSetId: string]: number };
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
  topics: { [chapterId: string]: Topic[] };
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Table of Contents</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion
          type="single"
          collapsible
          className="w-full"
          defaultValue={activeChapter || undefined}
          onValueChange={(value) => onChapterToggle(value)}
        >
          {chapters.map((chapter, index) => {
            const isFree = chapter.access === 'free' || index < (settings?.freeChaptersPerBook || 1);
            const isChapterLocked = !isFree && !userProfile?.subscriptionPlan;

            return (
              <AccordionItem value={chapter.id} key={chapter.id}>
                <AccordionTrigger disabled={isChapterLocked} className="hover:no-underline">
                  <div className="flex items-center gap-2 text-left">
                    {isChapterLocked && <Lock className="w-4 h-4 flex-shrink-0" />}
                    <span>{chapter.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {loadingTopics === chapter.id ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    <ul className="space-y-1 pl-2">
                      {(topics[chapter.id] || []).map(topic => (
                        <li key={topic.id}>
                          <Button
                            variant="ghost"
                            className={cn(
                                "w-full justify-start text-left h-auto py-1 px-2",
                                activeTopic === topic.id ? "bg-accent text-accent-foreground" : ""
                            )}
                            onClick={() => {
                              onTopicSelect(chapter.id, topic.id);
                              onSheetClose?.();
                            }}
                          >
                            {topic.title}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
};

const PracticeSetItem = ({ 
    ps, 
    textbookId, 
    chapterId, 
    topicId, 
    isLocked, 
    highestScore,
    onDownload,
    isDownloading,
}: { 
    ps: any; 
    textbookId: string; 
    chapterId: string; 
    topicId: string; 
    isLocked: boolean; 
    highestScore?: number; 
    onDownload: () => void;
    isDownloading: boolean;
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
                 <Button variant="outline" size="sm" onClick={onDownload} disabled={isLocked || isDownloading}>
                    {isDownloading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Download className="mr-2 h-4 w-4" />
                            PDF
                        </>
                    )}
                </Button>
                <Button asChild disabled={isLocked}>
                    <Link href={`/textbook-solutions/practice-set/${ps.id}?textbook=${textbookId}&chapter=${chapterId}&topic=${topicId}`}>
                            Start Practice
                    </Link>
                </Button>
            </div>
        </Card>
    );
};


export default function TextbookSolutionsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const textbookId = params.bookId as string;
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
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

  const activeChapter = searchParams.get('chapter');
  const activeTopic = searchParams.get('topic');
  
  const [areResourcesFetched, setAreResourcesFetched] = useState(false);
  const [areResourcesLoading, setAreResourcesLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);


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
  
  useEffect(() => {
    // Reset resource fetching state when topic changes
    setAreResourcesFetched(false);
  }, [activeTopic]);


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
  
  const handleResourceClick = (resource: any) => {
    setViewerResource(resource);
    setViewerOpen(true);
  };
  
  const fetchResources = async () => {
    if (!activeChapter || !activeTopic || areResourcesFetched) return;
    
    setAreResourcesLoading(true);
    try {
        const topicRef = doc(db, `textbooks/${textbookId}/chapters/${activeChapter}/topics`, activeTopic);
        const topicSnap = await getDoc(topicRef);
        if(topicSnap.exists()) {
            const topicData = topicSnap.data();
            setTopics(prevTopics => ({
                ...prevTopics,
                [activeChapter]: prevTopics[activeChapter].map(t => 
                    t.id === activeTopic ? { ...t, resources: topicData.resources || [] } : t
                )
            }));
            setAreResourcesFetched(true);
        }
    } catch(e) {
        console.error("Failed to fetch resources", e);
    } finally {
        setAreResourcesLoading(false);
    }
  }

  const handleDownloadPdf = async (practiceSet: any) => {
    if (!activeChapter || !activeTopic) return;
    setIsDownloading(practiceSet.id);
    toast({
        title: "Generating PDF...",
        description: "Your download will begin shortly.",
    });

    try {
        const questions = await getQuestionsByPracticeSet(textbookId, activeChapter, activeTopic, practiceSet.id);
        const totalMarks = questions.reduce((total: number, q: any) => {
            if (q.type === 'Matching') return total + (q.correctAnswer?.length || 0);
            return total + (q.marks || 1);
        }, 0);
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageHeight = 297;
        const pageWidth = 210;
        const margin = 10;
        let y = margin;

        pdf.setFontSize(18);
        pdf.text(practiceSet.title, pageWidth / 2, y, { align: 'center' });
        y += 10;
        pdf.setFontSize(12);
        pdf.text(`Total Marks: ${totalMarks}`, pageWidth / 2, y, { align: 'center' });
        y += 15;

        for (let i = 0; i < questions.length; i++) {
            let question = questions[i] as Question;

             if (question.type === 'Matching' && question.correctAnswer && !question.matchingOptions) {
                const pairs = question.correctAnswer as { a: string, aImage?: string, b: string, bImage?: string }[];
                const columnA = pairs.map(p => ({ text: p.a, image: p.aImage }));
                let columnB = [...pairs.map(p => ({ text: p.b, image: p.bImage }))];
                
                // Shuffle column B
                for (let i = columnB.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [columnB[i], columnB[j]] = [columnB[j], columnB[i]];
                }
                question.matchingOptions = { columnA, columnB };
            }

            const content = (
              <div key={`pdf-q-${i}`} id={`pdf-question-${i}`} className="p-1 bg-white text-black font-sans w-[700px]">
                  <div className="flex justify-between items-start text-lg font-bold mb-1">
                      <span className="flex-1">Q{i + 1}: {question.text}</span>
                      <span className="ml-4 text-xs font-normal">[Marks: {question.type === 'Matching' ? (question.correctAnswer?.length || 1) : question.marks || 1}]</span>
                  </div>
                  {question.type === 'Multiple Choice' && question.options && (
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          {question.options.map((option, optIndex) => (
                              <div key={optIndex} className="grid grid-cols-[20px_1fr] items-start">
                                  <div className="font-bold">{String.fromCharCode(65 + optIndex)}.</div>
                                  <div>{option.text}</div>
                              </div>
                          ))}
                      </div>
                  )}
                  {question.type === 'True/False' && (
                      <div className="flex space-x-4"><span>A) True</span><span>B) False</span></div>
                  )}
                  {(question.type === 'Short Answer' || question.type === 'Fill in the Blank') && (
                      <div className="mt-4 border-b-2 border-dotted border-black"></div>
                  )}
                  {question.type === 'Matching' && question.matchingOptions && (
                      <div className="mt-2">
                          <div className="grid grid-cols-2 gap-8">
                              <h4 className="font-semibold underline">Column A</h4>
                              <h4 className="font-semibold underline">Column B</h4>
                          </div>
                          {question.matchingOptions.columnA.map((itemA, index) => (
                              <div key={index} className="grid grid-cols-2 gap-8 items-center">
                                  <span>{index + 1}. {itemA.text}</span>
                                  <span>{String.fromCharCode(97 + index)}. {question.matchingOptions!.columnB[index]?.text}</span>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
            );

            // Temporarily render the element off-screen to use html2canvas
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.left = '-9999px';
            document.body.appendChild(container);
            
            const { createRoot } = await import('react-dom/client');
            const root = createRoot(container);
            
            ReactDOM.flushSync(() => {
              root.render(content);
            });
            
            const element = container.querySelector(`#pdf-question-${i}`);
            if (element) {
                const canvas = await html2canvas(element as HTMLElement, { scale: 2 });
                const imgData = canvas.toDataURL('image/png');
                const imgWidth = pageWidth - 2 * margin;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                if (y + imgHeight > pageHeight - margin) {
                    pdf.addPage();
                    y = margin;
                }

                pdf.addImage(imgData, 'PNG', margin, y, imgWidth, imgHeight);
                y += imgHeight + 1; 
            }
            root.unmount();
            document.body.removeChild(container);
        }
        
        pdf.save(`${practiceSet.title.replace(/\s/g, '_')}.pdf`);

    } catch (error) {
        console.error(error);
        toast({
            variant: "destructive",
            title: "Download Failed",
            description: "An error occurred while generating the PDF.",
        });
    } finally {
        setIsDownloading(null);
    }
  };


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

  const groupedResources = (selectedTopicContent?.resources || []).reduce((acc, resource) => {
    const type = resource.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(resource);
    return acc;
  }, {} as { [key: string]: Resource[] });

  const resourceOrder: ('video' | 'audio' | 'pdf' | 'doc')[] = ['video', 'audio', 'pdf', 'doc'];

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
                                
                                <Accordion type="single" collapsible className="w-full not-prose mt-8" onValueChange={(value) => {if(value) fetchResources()}}>
                                    <AccordionItem value="resources">
                                        <AccordionTrigger>
                                            <h3 className="font-semibold text-lg">Additional Resources</h3>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                        {areResourcesLoading ? (
                                            <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                                        ) : selectedTopicContent.resources && selectedTopicContent.resources.length > 0 ? (
                                            <div className="space-y-4 mt-4">
                                            {resourceOrder.map(type => (
                                                groupedResources[type] && (
                                                <div key={type}>
                                                    <h4 className="font-semibold text-md mb-2 capitalize">{type}s</h4>
                                                    <ul className="space-y-2">
                                                    {groupedResources[type].map(res => (
                                                        <li key={res.id}>
                                                            <button
                                                                onClick={() => handleResourceClick(res)}
                                                                className="w-full flex items-center p-3 border rounded-md hover:bg-secondary transition-colors text-left"
                                                            >
                                                                {getResourceIcon(res.type)}
                                                                <span className="ml-3 font-medium">{res.title}</span>
                                                                <ExternalLink className="w-4 h-4 ml-auto text-muted-foreground" />
                                                            </button>
                                                        </li>
                                                    ))}
                                                    </ul>
                                                </div>
                                                )
                                            ))}
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground text-center py-4">No additional resources for this topic.</p>
                                        )}
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>

                                {selectedTopicContent.practiceSets && selectedTopicContent.practiceSets.length > 0 && (
                                    <div className="mt-8">
                                        <Separator />
                                        <h3 className="mt-6 font-semibold text-2xl">Practice Sets</h3>
                                        <div className="space-y-2 mt-4">
                                            {selectedTopicContent.practiceSets.map((ps, index) => {
                                                const passMark = settings?.practiceSetPassMark || 40;
                                                const prevPsId = index > 0 ? selectedTopicContent.practiceSets[index - 1].id : null;
                                                const prevSetHighestScore = prevPsId ? progress?.highestScores?.[prevPsId] : undefined;
                                                
                                                const isLocked = index > 0 && settings?.gateChaptersOnPass && (prevSetHighestScore === undefined || prevSetHighestScore < passMark);

                                                return (
                                                  <PracticeSetItem
                                                    key={ps.id}
                                                    ps={ps}
                                                    textbookId={textbookId}
                                                    chapterId={activeChapter!}
                                                    topicId={activeTopic!}
                                                    isLocked={isLocked}
                                                    highestScore={progress?.highestScores?.[ps.id]}
                                                    onDownload={() => handleDownloadPdf(ps)}
                                                    isDownloading={isDownloading === ps.id}
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

       {viewerResource && (
            <ResourceViewerDialog 
                resource={viewerResource} 
                open={viewerOpen} 
                onOpenChange={setViewerOpen} 
            />
        )}
    </div>
  );
}
