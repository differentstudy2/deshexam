
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
import type { Chapter, Topic, Textbook, Resource, PracticeSet, Question } from '@/lib/types';
import { collection, doc, getDoc, getDocs, query, orderBy, where } from 'firebase/firestore';
import { ArrowLeft, BookOpen, FileText, CheckSquare, Loader2, Menu, ChevronRight, Lock, Award, Video, Mic, File as FileIcon, ExternalLink, Lightbulb, Smile, Frown, Annoyed, Facebook, Twitter, Linkedin, Link2, FileDown } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { getTopicsByChapterId, getAllContent, getPracticeSetsByTopicId, getQuestionsByPracticeSet } from '@/lib/firebase/firestore';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ResourceViewerDialog } from '@/components/feature/resource-viewer-dialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PracticeSetPDF } from '@/components/feature/practice-set-pdf';
import Image from 'next/image';


const getResourceIcon = (type: string) => {
    switch(type) {
        case 'video': return <Video className="w-4 h-4 text-muted-foreground" />;
        case 'audio': return <Mic className="w-4 h-4 text-muted-foreground" />;
        case 'pdf': return <FileIcon className="w-4 h-4 text-muted-foreground" />;
        default: return <ExternalLink className="w-4 h-4 text-muted-foreground" />;
    }
};

const ChapterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path></svg>
);

const ExamIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="m14 2 4 4 4-4"></path><path d="M18 6V4"></path><path d="M6 10H4"></path><path d="M6 14H4"></path><path d="M6 18H4"></path><path d="M14 10h6"></path><path d="M14 14h6"></path><path d="M14 18h6"></path><path d="M4 20h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2z"></path></svg>
);


const SidebarNav = ({
  chapters,
  topics,
  activeChapterId,
  activeTopicId,
  onChapterToggle,
  loadingTopics,
  textbookId,
  exams,
}: {
  chapters: Chapter[];
  topics: { [key: string]: Topic[] };
  activeChapterId: string | null;
  activeTopicId: string | null;
  onChapterToggle: (chapterId: string) => void;
  loadingTopics: string | null;
  textbookId: string;
  exams: any[];
}) => (
    <div className="flex flex-col h-full">
        <Accordion type="single" collapsible defaultValue={activeChapterId || undefined} className="w-full" onValueChange={onChapterToggle}>
          {chapters.map((chapter, index) => (
            <AccordionItem value={chapter.id} key={chapter.id}>
              <AccordionTrigger
                className="hover:no-underline [&[data-state=open]]:bg-accent/50 px-3 rounded-md"
              >
                 <div className="flex items-center gap-3">
                    <ChapterIcon />
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
                           <Link href={`/textbook-solutions/${textbookId}/chapter/${chapter.id}?topic=${topic.id}`} className="flex items-center gap-2">
                             <FileText className="w-4 h-4 text-muted-foreground" />
                             <span>{topic.title}</span>
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

        {exams.length > 0 && (
            <Accordion type="single" collapsible className="w-full mt-4 pt-4 border-t">
                 <AccordionItem value="exams">
                    <AccordionTrigger className="hover:no-underline [&[data-state=open]]:bg-accent/50 px-3 rounded-md">
                        <div className="flex items-center gap-3">
                            <ExamIcon/>
                            <span>Exams</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-0">
                        <ul className="space-y-1 pl-4 border-l">
                            {exams.map(exam => (
                                <li key={exam.id}>
                                    <Button variant="ghost" asChild className="w-full justify-start text-left h-auto py-1.5 px-2 text-base">
                                        <Link href={`/exam/${exam.id}`}>
                                            {exam.title}
                                        </Link>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        )}
    </div>
);


export default function ChapterClientPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    
    const textbookId = params.bookId as string;
    const chapterId = params.chapterId as string;
    
    const [textbook, setTextbook] = useState<Textbook | null>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [topics, setTopics] = useState<{ [chapterId: string]: Topic[] }>({});
    const [exams, setExams] = useState<any[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [loadingTopics, setLoadingTopics] = useState<string | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    
    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerResource, setViewerResource] = useState<Resource | null>(null);
    const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
    const [pdfContent, setPdfContent] = useState<{ practiceSet: PracticeSet; questions: Question[] } | null>(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState<string | null>(null);


    const activeTopicId = useMemo(() => {
        const topicId = searchParams.get('topic');
        if (topicId) return topicId;
        if (topics[chapterId] && topics[chapterId].length > 0) {
            return null;
        }
        return null;
    }, [searchParams, topics, chapterId]);

    const activeTopic = useMemo(() => {
        if (!topics[chapterId] || !activeTopicId) return null;
        return topics[chapterId].find(t => t.id === activeTopicId);
    }, [topics, chapterId, activeTopicId]);
    
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

    useEffect(() => {
        const fetchPageData = async () => {
            setLoading(true);
            try {
                const chapterRef = doc(db, `textbooks/${textbookId}/chapters`, chapterId);
                const practiceSetsRef = collection(chapterRef, 'practiceSets');

                const [textbookSnap, chaptersQuerySnap, chapterSnap, practiceSetsSnap, allExams] = await Promise.all([
                    getDoc(doc(db, 'textbooks', textbookId)),
                    getDocs(query(collection(db, `textbooks/${textbookId}/chapters`), orderBy('title'))),
                    getDoc(chapterRef),
                    getDocs(practiceSetsRef),
                    getAllContent("Exam")
                ]);

                if (textbookSnap.exists()) setTextbook({ id: textbookSnap.id, ...textbookSnap.data() } as Textbook);
                
                const chaptersData = chaptersQuerySnap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Chapter));
                chaptersData.sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }));

                if (chapterSnap.exists()) {
                    const chapterData = { id: chapterSnap.id, ...chapterSnap.data(), practiceSets: practiceSetsSnap.docs.map(d => ({id: d.id, ...d.data()})) } as Chapter;
                    const chapterIndex = chaptersData.findIndex(c => c.id === chapterId);
                    if(chapterIndex > -1) {
                         chaptersData[chapterIndex] = chapterData;
                    } else {
                        chaptersData.push(chapterData);
                        chaptersData.sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }));
                    }
                }
                
                setChapters(chaptersData);
                setExams(allExams.filter((exam: any) => exam.textbookId === textbookId));


                if (chapterId) {
                    await fetchChapterTopics(chapterId);
                }

            } catch (e) {
                toast({ variant: "destructive", title: "Error loading data", description: (e as Error).message });
            } finally {
                setLoading(false);
            }
        };

        fetchPageData();
    }, [textbookId, chapterId, toast, fetchChapterTopics]);

    const handleResourceClick = (resource: Resource) => {
        setViewerResource(resource);
        setViewerOpen(true);
    };
    
    const handleDownloadPdf = async (practiceSet: PracticeSet) => {
        if (!activeTopic) return;
        setIsGeneratingPdf(practiceSet.id);
        try {
            const questions = await getQuestionsByPracticeSet(textbookId, chapterId, activeTopic.id, practiceSet.id);
            setPdfContent({ practiceSet, questions });

            // Allow time for the PDF content to render in the hidden div
            setTimeout(async () => {
                const pdfElement = document.getElementById('pdf-content');
                if (pdfElement) {
                    const canvas = await html2canvas(pdfElement, { scale: 2 });
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();
                    const imgWidth = canvas.width;
                    const imgHeight = canvas.height;
                    const ratio = imgWidth / imgHeight;
                    const width = pdfWidth;
                    const height = width / ratio;
                    let position = 0;
                    let heightLeft = height;

                    pdf.addImage(imgData, 'PNG', 0, position, width, height);
                    heightLeft -= pdfHeight;

                    while (heightLeft > 0) {
                        position = heightLeft - height;
                        pdf.addPage();
                        pdf.addImage(imgData, 'PNG', 0, position, width, height);
                        heightLeft -= pdfHeight;
                    }

                    pdf.save(`${practiceSet.title}.pdf`);
                }
                setPdfContent(null);
                setIsGeneratingPdf(null);
            }, 500);

        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error generating PDF',
                description: (error as Error).message,
            });
            setIsGeneratingPdf(null);
        }
    };

    if (loading && !textbook) {
        return <div className="flex items-center justify-center min-h-[calc(100vh-200px)]"><Loader2 className="w-8 h-8 animate-spin"/></div>;
    }
    
    const activeChapter = chapters.find(c => c.id === chapterId);

    const breadcrumbs = [
        { name: 'Textbooks', href: '/textbook-solutions'},
        { name: textbook?.title || 'Textbook', href: `/textbook-solutions/${textbookId}` },
        { name: activeChapter?.title || 'Chapter', href: `/textbook-solutions/${textbookId}/chapter/${chapterId}` },
    ];

    const sidebarContent = (
         <div className="p-2">
            <SidebarNav 
                chapters={chapters}
                topics={topics}
                activeChapterId={chapterId}
                activeTopicId={activeTopicId}
                onChapterToggle={fetchChapterTopics}
                loadingTopics={loadingTopics}
                textbookId={textbookId}
                exams={exams}
            />
        </div>
    );

    const bgColors = [
        'bg-blue-100 dark:bg-blue-900/20',
        'bg-green-100 dark:bg-green-900/20',
        'bg-yellow-100 dark:bg-yellow-900/20',
        'bg-pink-100 dark:bg-pink-900/20',
        'bg-purple-100 dark:bg-purple-900/20',
        'bg-orange-100 dark:bg-orange-900/20',
        'bg-teal-100 dark:bg-teal-900/20',
    ];


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
                        {breadcrumbs.map((crumb, index) => (
                           <li key={index} className="flex items-center gap-1.5">
                               <Link href={crumb.href} className="hover:text-foreground truncate max-w-[100px] sm:max-w-none">{crumb.name}</Link>
                               {index < breadcrumbs.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0"/>}
                           </li>
                        ))}
                    </ol>
                </nav>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[300px_1fr]">
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
                <main>
                    <div className="p-6 md:p-8">
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
                        
                        <header className="relative p-8 md:p-12 text-center md:text-left min-h-[250px] flex items-center justify-center md:justify-start bg-slate-900 text-white rounded-lg overflow-hidden">
                            <div className="absolute inset-0 z-0">
                                <Image 
                                    src={activeChapter?.featureImage || '/image/logo.png'}
                                    alt={activeChapter?.title || 'Chapter background'}
                                    fill
                                    className="object-cover opacity-20"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent z-10" />
                            </div>
                            <div className="relative z-20">
                                <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">{activeChapter?.title}</h1>
                                {activeChapter?.chapterPdfUrl && (
                                    <div className="mt-4">
                                        <Button asChild className="bg-green-500 hover:bg-green-600 text-white">
                                            <a href={activeChapter.chapterPdfUrl} target="_blank" rel="noopener noreferrer">
                                                <FileText className="mr-2" /> View Chapter PDF
                                            </a>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </header>
                        
                        {activeChapter?.description && (
                            <p className="prose dark:prose-invert lg:prose-lg max-w-none my-8 text-muted-foreground">{activeChapter.description}</p>
                        )}
                        
                        {activeChapter?.content && (
                            <article className="prose dark:prose-invert lg:prose-lg max-w-none my-8">
                                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{activeChapter.content}</ReactMarkdown>
                            </article>
                        )}

                        {topics[chapterId] && topics[chapterId].length > 0 && (
                            <section id="topics" className="my-8">
                                <h2 className="font-headline text-3xl font-bold mb-6">Topics in this Chapter</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {topics[chapterId].map((topic, index) => (
                                    <Link key={topic.id} href={`/textbook-solutions/${textbookId}/chapter/${chapterId}?topic=${topic.id}`}>
                                        <div className={cn(
                                            "p-4 rounded-lg flex items-center gap-4 transition-transform transform hover:scale-[1.02] hover:shadow-lg border",
                                            bgColors[index % bgColors.length]
                                        )}>
                                            <FileText className="w-5 h-5 flex-shrink-0 text-foreground/70" />
                                            <span className="font-semibold flex-grow text-foreground">{topic.title}</span>
                                            <ChevronRight className="w-5 h-5 flex-shrink-0 opacity-70" />
                                        </div>
                                    </Link>
                                ))}
                                </div>
                            </section>
                        )}
                        
                        {activeChapter?.practiceSets && activeChapter.practiceSets.length > 0 && (
                            <section id="practice-sets" className="my-8">
                                <h2 className="font-headline text-3xl font-bold mb-6">Practice Sets</h2>
                                 <div className="space-y-4">
                                     {activeChapter.practiceSets.map(ps => (
                                         <div key={ps.id} className="p-4 border rounded-lg hover:bg-accent flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                             <span className="font-semibold flex-grow">{ps.title}</span>
                                             <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
                                               <Button size="sm" asChild className="flex-1">
                                                   <Link href={`/textbook-solutions/practice-set/${ps.id}?textbook=${textbookId}&chapter=${chapterId}`}>Start Practice</Link>
                                               </Button>
                                               <Button 
                                                   size="sm" 
                                                   variant="outline" 
                                                   className="flex-1"
                                                   onClick={() => handleDownloadPdf(ps)}
                                                   disabled={isGeneratingPdf === ps.id}
                                               >
                                                   {isGeneratingPdf === ps.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <FileDown className="mr-2 h-4 w-4"/>}
                                                   Download PDF
                                               </Button>
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                            </section>
                        )}
                        
                        {activeChapter?.resources && activeChapter.resources.length > 0 && (
                            <section id="resources" className="my-8">
                                <h2 className="font-headline text-3xl font-bold mb-6">Additional Resources</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {activeChapter.resources.map(res => (
                                        <Button key={res.id} variant="outline" className="justify-start gap-3 h-auto py-3" onClick={() => handleResourceClick(res)}>
                                            {getResourceIcon(res.type)}
                                            <span className="flex-grow text-left">{res.title}</span>
                                        </Button>
                                    ))}
                                </div>
                            </section>
                        )}

                        {(!activeTopic && (!topics[chapterId] || topics[chapterId].length === 0) && !activeChapter?.content && !activeChapter?.practiceSets?.length && !activeChapter?.resources?.length) && (
                            <div className="text-center text-muted-foreground py-16">
                                <BookOpen className="w-16 h-16 mx-auto mb-4"/>
                                <h2 className="text-xl font-semibold">No Content Yet</h2>
                                <p>There is no content available for this chapter yet. Check back later!</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
            
            <ResourceViewerDialog 
                resource={viewerResource} 
                open={viewerOpen} 
                onOpenChange={setViewerOpen} 
            />
             {pdfContent && (
                <div style={{ position: 'fixed', left: '-9999px', top: 0, zIndex: -10 }}>
                    <div id="pdf-content">
                        <PracticeSetPDF 
                            practiceSet={pdfContent.practiceSet} 
                            questions={pdfContent.questions} 
                            textbookTitle={textbook?.title || ''} 
                            chapterTitle={activeChapter?.title || ''}
                            topicTitle={activeTopic?.title || ''}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
