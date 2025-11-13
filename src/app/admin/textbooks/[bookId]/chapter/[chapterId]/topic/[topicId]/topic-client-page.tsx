
'use client';

import { Suspense, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { db } from '@/lib/firebase/client';
import type { Chapter, Topic, Textbook, Resource, PracticeSet, Question, Exam } from '@/lib/types';
import { collection, doc, getDoc, getDocs, query, orderBy, where } from 'firebase/firestore';
import { ArrowLeft, BookOpen, FileText, CheckSquare, Loader2, Menu, ChevronRight, Lock, Award, Video, Mic, File as FileIcon, ExternalLink, Smile, Frown, Annoyed, Facebook, Twitter, Linkedin, Link2, FileDown } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { getTopicsByChapterId, getAllContent, getPracticeSetsByTopicId, getQuestionsByPracticeSet, addContent, deleteContent } from '@/lib/firebase/firestore';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { ResourceViewerDialog } from '@/components/feature/resource-viewer-dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PracticeSetPDF } from '@/components/feature/practice-set-pdf';
import Image from 'next/image';
import { usePageData } from './use-page-data';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sparkles } from 'lucide-react';


const getResourceIcon = (type: string) => {
    switch(type) {
        case 'video': return <Video className="w-4 h-4 text-muted-foreground" />;
        case 'audio': return <Mic className="w-4 h-4 text-muted-foreground" />;
        case 'pdf': return <FileIcon className="w-4 h-4 text-muted-foreground" />;
        default: return <ExternalLink className="w-4 h-4 text-muted-foreground" />;
    }
};

const ChapterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 flex-shrink-0"><path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path></svg>
);

const ExamIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="m14 2 4 4 4-4"></path><path d="M18 6V4"></path><path d="M6 10H4"></path><path d="M6 14H4"></path><path d="M6 18H4"></path><path d="M14 10h6"></path><path d="M14 14h6"></path><path d="M14 18h6"></path><path d="M4 20h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2z"></path></svg>
);


const SidebarNav = ({
  chapters,
  topicsByChapter,
  activeChapterId,
  activeTopicId,
  onChapterToggle,
  loadingTopics,
  textbookId,
  exams,
}: {
  chapters: Chapter[];
  topicsByChapter: { [key: string]: Topic[] };
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
                className="hover:no-underline [&[data-state=open]]:bg-accent/50 px-3 rounded-md justify-start"
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
                     {(topicsByChapter[chapter.id] || []).map(topic => (
                       <li key={topic.id}>
                         <Button
                           variant="ghost"
                           asChild
                           className={cn(
                             "w-full justify-start text-left h-auto py-1.5 px-2 text-base",
                             activeTopicId === topic.id ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary" : ""
                           )}
                         >
                           <Link href={`/textbook-solutions/${textbookId}/chapter/${chapter.id}/topic/${topic.id}`} className="flex items-center gap-2">
                             <FileText className="w-4 h-4 text-muted-foreground" />
                             <span>{topic.title}</span>
                           </Link>
                         </Button>
                       </li>
                     ))}
                     {(!topicsByChapter[chapter.id] || topicsByChapter[chapter.id].length === 0) && (
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

const difficultyOptions = ['Beginner', 'Easy', 'Medium', 'Hard', 'Expert'];
const questionSourceOptions = ['Random from Chapter', 'Random from Topic', 'Textbook Exercise', 'Solved Examples', 'Previous Year Questions'];


export default function TopicClientPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    
    const { 
        loading, 
        textbook, 
        chapters, 
        activeChapter, 
        activeTopic, 
        exams, 
        error,
        fetchPageData,
    } = usePageData();
    
    const textbookId = params.bookId as string;
    const chapterId = params.chapterId as string;
    const topicId = params.topicId as string;
    
    const [topicsByChapter, setTopicsByChapter] = useState<{ [chapterId: string]: Topic[] }>({});
    const [loadingTopics, setLoadingTopics] = useState<string | null>(null);
    
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerResource, setViewerResource] = useState<Resource | null>(null);
    const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
    const [pdfContent, setPdfContent] = useState<{ practiceSet: PracticeSet; questions: Question[] } | null>(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState<string | null>(null);

    const [isExamDialogOpen, setIsExamDialogOpen] = useState(false);
    const [examData, setExamData] = useState<{title: string, subtitle: string, difficulty: string[], questionSource: string[]}>({ title: '', subtitle: '', difficulty: ['Medium'], questionSource: ['Random from Topic'] });

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
        if (!cId || topicsByChapter[cId]) return; 
        setLoadingTopics(cId);
        try {
            const topicsData = await getTopicsByChapterId(textbookId, cId);
            setTopicsByChapter(prev => ({ ...prev, [cId]: topicsData }));
        } catch (e) {
            toast({ variant: "destructive", title: "Error loading topics", description: (e as Error).message });
        } finally {
            setLoadingTopics(null);
        }
    }, [textbookId, topicsByChapter, toast]);

    useEffect(() => {
        if (chapterId && !topicsByChapter[chapterId]) {
            fetchChapterTopics(chapterId);
        }
    }, [chapterId, topicsByChapter, fetchChapterTopics]);
    
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
    
    const handleAddExam = async () => {
        if (!examData.title.trim()) {
            toast({ variant: 'destructive', title: 'Title is required.' });
            return;
        }

        const contentData = {
            title: examData.title,
            subtitle: examData.subtitle,
            difficulty: examData.difficulty,
            questionSource: examData.questionSource,
            textbookId,
            chapterId,
            topicId,
            testType: 'Exam',
            access: 'free',
            questions: [],
        };
        
        try {
            await addContent(contentData);
            toast({ title: `Exam Added Successfully` });
            fetchPageData(); // Refresh data
            setIsExamDialogOpen(false);
        } catch (error) {
            toast({ variant: 'destructive', title: `Error adding Exam`, description: (error as Error).message });
        }
    };
    
    const handleDeleteExam = async (examId: string) => {
        try {
            await deleteContent(examId);
            toast({ title: 'Exam Deleted' });
            fetchPageData(); // Refresh data
        } catch (error) {
             toast({ variant: 'destructive', title: 'Error deleting exam', description: (error as Error).message });
        }
    }
    
    const generateTitle = (template: string, setData: Function) => {
        const title = template
            .replace('[Chapter Title]', chapter?.title || '')
            .replace('[Topic Title]', topic?.title || '')
            .replace('[Subject]', textbook?.subject || '')
            .replace('[Textbook Title]', textbook?.title || '');
        setData((prev: any) => ({ ...prev, title }));
    };


    if (loading) {
        return <div className="flex items-center justify-center min-h-[calc(100vh-200px)]"><Loader2 className="w-8 h-8 animate-spin"/></div>;
    }

    if (error) {
        return <div className="text-center py-10 text-destructive">{error}</div>;
    }
    
    const breadcrumbs = [
        { name: 'Textbooks', href: '/textbook-solutions'},
        { name: textbook?.title || 'Textbook', href: `/textbook-solutions/${textbookId}` },
        ...(activeChapter ? [{ name: activeChapter.title, href: `/textbook-solutions/${textbookId}/chapter/${chapterId}` }] : []),
        ...(activeTopic ? [{ name: activeTopic.title, href: `/textbook-solutions/${textbookId}/chapter/${chapterId}/topic/${topicId}` }] : []),
    ];

    const sidebarContent = (
         <div className="p-2">
            <SidebarNav 
                chapters={chapters}
                topicsByChapter={topicsByChapter}
                activeChapterId={chapterId}
                activeTopicId={topicId}
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
                        <li className="flex items-center gap-1.5">
                             <Link href={`/textbook-solutions/${textbookId}/chapter/${chapterId}`} className="text-muted-foreground hover:text-foreground">
                                <ArrowLeft className="w-4 h-4 inline-block mr-1" />
                                <span className="truncate max-w-[150px] sm:max-w-none">{activeChapter?.title || "Chapter"}</span>
                            </Link>
                        </li>
                    </ol>
                </nav>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[300px_1fr_250px]">
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
                             <header className="relative p-8 md:p-12 text-center md:text-left min-h-[250px] flex items-center justify-center md:justify-start bg-slate-900 text-white rounded-lg overflow-hidden">
                                <div className="absolute inset-0 z-0">
                                    <Image 
                                        src={activeTopic?.featureImage || activeChapter?.featureImage || '/image/logo.png'}
                                        alt={activeTopic?.title || 'Topic background'}
                                        fill
                                        className="object-cover opacity-20"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent z-10" />
                                </div>
                                <div className="relative z-20">
                                    <h1 className="font-headline text-3xl md:text-4xl font-bold">{activeTopic.title}</h1>
                                    {activeTopic?.pdfUrl && (
                                        <div className="mt-4">
                                            <Button asChild className="bg-green-500 hover:bg-green-600 text-white">
                                                <a href={activeTopic.pdfUrl} target="_blank" rel="noopener noreferrer">
                                                    <FileText className="mr-2" /> View Topic PDF
                                                </a>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </header>
                            
                            {activeTopic.content && (
                                <article className="prose dark:prose-invert lg:prose-lg max-w-none mt-8">
                                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>{activeTopic.content}</ReactMarkdown>
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
                                <section id="practice-sets" className="my-8">
                                    <h2 className="font-headline text-3xl font-bold mb-6">Practice Sets</h2>
                                    <div className="space-y-4">
                                        {activeTopic.practiceSets.map(ps => {
                                            const difficulties = Array.isArray(ps.difficulty) ? ps.difficulty : ps.difficulty ? [ps.difficulty] : [];
                                            const sources = Array.isArray(ps.questionSource) ? ps.questionSource : ps.questionSource ? [ps.questionSource] : [];
                                            return (
                                                <div key={ps.id} className="p-4 border rounded-lg hover:bg-accent flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                                    <div className="flex-grow">
                                                        <p className="font-semibold">{ps.subtitle}: {ps.title}</p>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {difficulties.map(d => <Badge key={d} variant="secondary">{d}</Badge>)}
                                                            {sources.map(s => <Badge key={s} variant="outline">{s.replace('-', ' ')}</Badge>)}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
                                                        <Button size="sm" asChild className="flex-1">
                                                            <Link href={`/textbook-solutions/practice-set/${ps.id}/textbook/${textbookId}/chapter/${chapterId}/topic/${topicId}`}>Start Practice</Link>
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
                                            )
                                        })}
                                    </div>
                                </section>
                             )}

                            <Separator className="my-12" />

                            <Card className="bg-secondary/50">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                        <p className="font-semibold">Is this article helpful? What are your Feelings</p>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="icon"><Smile className="w-6 h-6 text-muted-foreground hover:text-green-500" /></Button>
                                            <Button variant="ghost" size="icon"><Frown className="w-6 h-6 text-muted-foreground hover:text-yellow-500" /></Button>
                                            <Button variant="ghost" size="icon"><Annoyed className="w-6 h-6 text-muted-foreground hover:text-red-500" /></Button>
                                        </div>
                                    </div>
                                    <Separator className="my-4" />
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                        <p className="font-semibold">Share This Article :</p>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="icon"><Facebook className="w-5 h-5 text-[#1877F2]" /></Button>
                                            <Button variant="outline" size="icon"><Twitter className="w-5 h-5 text-[#1DA1F2]" /></Button>
                                            <Button variant="outline" size="icon"><Linkedin className="w-5 h-5 text-[#0A66C2]" /></Button>
                                            <Button variant="outline" size="icon"><Link2 className="w-5 h-5" /></Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                        </div>
                    ) : (
                         <div className="text-center text-muted-foreground pt-16">
                            <BookOpen className="w-16 h-16 mx-auto mb-4"/>
                            <h2 className="text-xl font-semibold">Select a topic</h2>
                            <p>Choose a topic from the sidebar to view its specific content.</p>
                        </div>
                    )}
                </main>
                <aside className="hidden lg:block p-6 border-l">
                    <div className="sticky top-20">
                        <h3 className="font-semibold mb-4">On This Page</h3>
                         {headings.length > 0 ? (
                            <ul className="space-y-2">
                            {headings.map((heading) => (
                                <li key={heading.id}>
                                <a
                                    href={`#${heading.id}`}
                                    className="text-sm text-muted-foreground hover:text-foreground"
                                    style={{ paddingLeft: `${(heading.level - 1) * 0.75}rem` }}
                                >
                                    {heading.text}
                                </a>
                                </li>
                            ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">No sections found.</p>
                        )}
                    </div>
                </aside>
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

