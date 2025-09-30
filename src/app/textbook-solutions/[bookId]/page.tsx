

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


type UserProfile = {
  subscriptionPlan?: 'pass' | 'pro';
  displayName?: string;
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
  
    const isChapterUnlocked = useCallback((chapter: Chapter, index: number) => {
        if (chapter.access === 'free') return true;
        if (index < (settings?.freeChaptersPerBook || 1)) return true;
        if (userProfile?.subscriptionPlan && (userProfile.subscriptionPlan === 'pro' || userProfile.subscriptionPlan === chapter.access)) {
            return true;
        }

        if (index > 0 && settings?.gateChaptersOnPass) {
            const prevChapter = chapters[index - 1];
            const prevChapterTopics = topics[prevChapter.id] || [];
            if (prevChapterTopics.length === 0) return true; // If prev chapter has no topics/sets, unlock

            const prevChapterPracticeSets = prevChapterTopics.flatMap(t => t.practiceSets || []);
            if (prevChapterPracticeSets.length === 0) return true; // If prev chapter has no sets, unlock

            return prevChapterPracticeSets.every(ps => (progress?.highestScores?.[ps.id] || 0) >= (settings.practiceSetPassMark || 60));
        }

        return false;
    }, [chapters, topics, userProfile, settings, progress]);


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
            const unlocked = isChapterUnlocked(chapter, index);
            
            return (
              <AccordionItem value={chapter.id} key={chapter.id}>
                <AccordionTrigger disabled={!unlocked} className="hover:no-underline">
                  <div className="flex items-center gap-2 text-left">
                    {!unlocked && <Lock className="w-4 h-4 flex-shrink-0" />}
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
    passMark,
    highestScore,
    onDownload,
    isDownloading,
}: { 
    ps: any; 
    textbookId: string; 
    chapterId: string; 
    topicId: string; 
    isLocked: boolean; 
    passMark: number;
    highestScore?: number; 
    onDownload: () => void;
    isDownloading: boolean;
}) => {
    return (
        <Card className="p-4 flex flex-col sm:flex-row justify-between items-center not-prose gap-4">
            <div className="flex items-center gap-3 flex-grow">
                {isLocked ? (
                     <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Lock className="h-5 w-5 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>You must score at least {passMark}% on the previous practice set to unlock this one.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
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
                {isLocked ? (
                    <Button disabled>Start Practice</Button>
                ) : (
                    <Button asChild>
                        <Link href={`/textbook-solutions/practice-set/${ps.id}?textbook=${textbookId}&chapter=${chapterId}&topic=${topicId}`}>
                                Start Practice
                        </Link>
                    </Button>
                )}
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

        // If a chapter is specified in the URL, fetch its topics
        const initialChapterId = searchParams.get('chapter');
        if (initialChapterId) {
            handleChapterToggle(initialChapterId);
        }

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
      if (!chapterId || topics[chapterId]) {
          return;
      }
      setLoadingTopics(chapterId);
      try {
          const topicsData = await getTopicsByChapterId(textbookId, chapterId);
          
           for (let topic of topicsData) {
              const practiceSetsQuery = query(collection(db, `textbooks/${textbookId}/chapters/${chapterId}/topics/${topic.id}/practiceSets`), orderBy("createdAt", "desc"));
              const practiceSetsSnap = await getDocs(practiceSetsQuery);
              (topic as any).practiceSets = practiceSetsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              (topic as any).practiceSets.sort((a: any, b: any) => a.title.localeCompare(b.title, undefined, { numeric: true }));
           }

          setTopics(prev => ({ ...prev, [chapterId]: topicsData }));
      } catch (e) {
          console.error("Failed to fetch topics for chapter:", e);
          toast({
              variant: "destructive",
              title: "Error",
              description: "Could not load topics for this chapter.",
          });
      } finally {
          setLoadingTopics(null);
      }
  }, [textbookId, topics, toast]);
  
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
        
        const addWatermarkAndNewPageIfNeeded = (yPos: number, contentHeight: number) => {
            if (yPos + contentHeight > pageHeight - margin) {
                pdf.addPage();
                pdf.setFontSize(60);
                pdf.setTextColor(230, 230, 230);
                pdf.text('DeshExam', pageWidth / 2, pageHeight / 2, {
                    angle: -45,
                    align: 'center',
                });
                pdf.setTextColor(0, 0, 0);
                return margin;
            }
            return yPos;
        };

        pdf.setFontSize(60);
        pdf.setTextColor(230, 230, 230);
        pdf.text('DeshExam', pageWidth / 2, pageHeight / 2, {
            angle: -45,
            align: 'center',
        });
        pdf.setTextColor(0, 0, 0);

        const headerContent = (
            <div className="p-1 bg-transparent text-black font-sans w-[700px] text-sm">
                <div className="text-center mb-2">
                    <h1 className="text-xl font-bold">{practiceSet.title}</h1>
                    <h2 className="text-lg">{textbook?.title}</h2>
                </div>
                 <div className="grid grid-cols-2 gap-x-4 gap-y-0 text-sm border-y-2 border-black py-0 my-2">
                    <p><strong>Institute Name:</strong> Deshexam.com</p>
                    {textbook?.board && <p><strong>Board:</strong> {textbook.board}</p>}
                    {textbook?.class && <p><strong>Class:</strong> {textbook.class}</p>}
                    {textbook?.subject && <p><strong>Subject:</strong> {textbook.subject}</p>}
                    {chapters.find(c => c.id === activeChapter)?.title && <p><strong>Chapter:</strong> {chapters.find(c => c.id === activeChapter)?.title}</p>}
                    {selectedTopicContent?.title && <p><strong>Topic:</strong> {selectedTopicContent.title}</p>}
                    <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                    <p><strong>Full Marks:</strong> {totalMarks}</p>
                    <p><strong>Duration:</strong> {totalMarks} min</p>
                </div>
            </div>
        );
        
        const headerContainer = document.createElement('div');
        headerContainer.style.position = 'absolute';
        headerContainer.style.left = '-9999px';
        document.body.appendChild(headerContainer);
        const headerRoot = createRoot(headerContainer);
        
        flushSync(() => {
          headerRoot.render(headerContent);
        });

        const headerElement = headerContainer.firstElementChild;
        if (headerElement) {
            const canvas = await html2canvas(headerElement as HTMLElement, { scale: 2, backgroundColor: null });
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = pageWidth - 2 * margin;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', margin, y, imgWidth, imgHeight);
            y += imgHeight + 2;
        }
        headerRoot.unmount();
        document.body.removeChild(headerContainer);


        for (let i = 0; i < questions.length; i++) {
            let question = questions[i] as Question;

             if (question.type === 'Matching' && question.correctAnswer && !question.matchingOptions) {
                const pairs = question.correctAnswer as { a: string, aImage?: string, b: string, bImage?: string }[];
                const columnA = pairs.map(p => ({ text: p.a, image: p.aImage }));
                let columnB = [...pairs.map(p => ({ text: p.b, image: p.bImage }))];
                
                for (let j = columnB.length - 1; j > 0; j--) {
                    const k = Math.floor(Math.random() * (j + 1));
                    [columnB[j], columnB[k]] = [columnB[k], columnB[j]];
                }
                question.matchingOptions = { columnA, columnB };
            }

            const content = (
              <div key={`pdf-q-${i}`} id={`pdf-question-${i}`} className="p-1 bg-transparent text-black font-sans w-[700px]">
                  <div className="flex justify-between items-start mb-1 text-base">
                      <span className="flex-1"><strong>Q{i + 1}:</strong> {question.text}</span>
                      <span className="ml-4 font-normal text-xs">[Marks: {question.type === 'Matching' ? (question.correctAnswer?.length || 1) : question.marks || 1}]</span>
                  </div>
                   {question.type === 'Multiple Choice' && question.options && (
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                          {question.options.map((option, optIndex) => (
                              <div key={optIndex} className="grid grid-cols-[20px_1fr] items-start">
                                  <div className="font-bold">{String.fromCharCode(65 + optIndex)}.</div>
                                  <div>{option.text}</div>
                              </div>
                          ))}
                      </div>
                  )}
                  {question.type === 'True/False' && (
                      <div className="flex space-x-4 text-sm"><span>A) True</span><span>B) False</span></div>
                  )}
                  {(question.type === 'Short Answer' || question.type === 'Fill in the Blank') && (
                      <div className="mt-4 border-b-2 border-dotted border-black"></div>
                  )}
                  {question.type === 'Matching' && question.matchingOptions && (
                      <div className="mt-2 text-sm">
                          <div className="grid grid-cols-2 gap-8">
                              <h4 className="font-semibold underline">Column A</h4>
                              <h4 className="font-semibold underline">Column B</h4>
                          </div>
                          <div className="grid grid-cols-2 gap-8">
                             <div>
                                {question.matchingOptions.columnA.map((itemA, index) => (
                                    <div key={index} className="grid grid-cols-[20px_1fr] items-center">
                                      <span>{index + 1}.</span>
                                      <span>{itemA.text}</span>
                                    </div>
                                ))}
                              </div>
                              <div>
                                {question.matchingOptions.columnB.map((itemB, index) => (
                                     <div key={index} className="grid grid-cols-[20px_1fr] items-center">
                                       <span>{String.fromCharCode(97 + index)}.</span>
                                       <span>{itemB.text}</span>
                                     </div>
                                ))}
                              </div>
                          </div>
                      </div>
                  )}
              </div>
            );
            
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.left = '-9999px';
            document.body.appendChild(container);
            
            const root = createRoot(container);
            
            flushSync(() => {
              root.render(content);
            });
            
            const element = container.querySelector(`#pdf-question-${i}`);
            if (element) {
                const canvas = await html2canvas(element as HTMLElement, {
                    scale: 2,
                    backgroundColor: null,
                });
                const imgData = canvas.toDataURL('image/png');
                const imgWidth = pageWidth - 2 * margin;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                y = addWatermarkAndNewPageIfNeeded(y, imgHeight);

                pdf.addImage(imgData, 'PNG', margin, y, imgWidth, imgHeight);
                y += imgHeight + 0.5;
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
                                                const passMark = settings?.practiceSetPassMark || 60;
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
                                                    passMark={passMark}
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
