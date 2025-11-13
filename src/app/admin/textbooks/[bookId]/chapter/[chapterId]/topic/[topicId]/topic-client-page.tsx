

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

    const [isMockTestDialogOpen, setIsMockTestDialogOpen] = useState(false);
    const [mockTestData, setMockTestData] = useState<{title: string, subtitle: string, difficulty: string[], questionSource: string[]}>({ title: '', subtitle: '', difficulty: ['Medium'], questionSource: ['Random from Topic'] });

    const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);
    const [quizData, setQuizData] = useState<{title: string, subtitle: string, difficulty: string[], questionSource: string[]}>({ title: '', subtitle: '', difficulty: ['Medium'], questionSource: ['Random from Topic'] });
    

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
    
    const handleAddTestOrQuiz = async (type: 'Exam' | 'Mock Test' | 'Quiz') => {
        let data, setData, setDialogOpen;
        switch(type) {
            case 'Exam': data = examData; setData = setExamData; setDialogOpen = setIsExamDialogOpen; break;
            case 'Mock Test': data = mockTestData; setData = setMockTestData; setDialogOpen = setIsMockTestDialogOpen; break;
            case 'Quiz': data = quizData; setData = setQuizData; setDialogOpen = setIsQuizDialogOpen; break;
        }

        if (!data.title.trim()) {
            toast({ variant: 'destructive', title: 'Title is required.' });
            return;
        }

        const contentData = {
            title: data.title,
            subtitle: data.subtitle,
            difficulty: data.difficulty,
            questionSource: data.questionSource,
            textbookId,
            chapterId,
            topicId,
            testType: type,
            access: 'free',
            questions: [],
        };
        
        try {
            await addContent(contentData);
            toast({ title: `${type} Added Successfully` });
            fetchPageData();
            setDialogOpen(false);
        } catch (error) {
            toast({ variant: 'destructive', title: `Error adding ${type}`, description: (error as Error).message });
        }
    };
    
    const handleDeleteTest = async (testId: string) => {
        try {
            await deleteContent(testId);
            toast({ title: 'Content Deleted' });
            fetchPageData();
        } catch (error) {
             toast({ variant: 'destructive', title: 'Error deleting content', description: (error as Error).message });
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Practice Sets</CardTitle>
                        </CardHeader>
                        <CardContent>{/* ... practice set list ... */}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Mock Tests</CardTitle>
                             <Dialog open={isMockTestDialogOpen} onOpenChange={setIsMockTestDialogOpen}>
                                <DialogTrigger asChild><Button size="sm"><PlusCircle className="mr-2"/> Add</Button></DialogTrigger>
                                 <DialogContent>
                                    <DialogHeader><DialogTitle>Add New Mock Test</DialogTitle></DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2"><Label htmlFor="mt-subtitle">Subtitle</Label><Input id="mt-subtitle" value={mockTestData.subtitle} onChange={e => setMockTestData(p => ({...p, subtitle: e.target.value}))} /></div>
                                        <div className="space-y-2">
                                            <Label htmlFor="mt-title">Title</Label>
                                            <div className="flex gap-2">
                                                <Input id="mt-title" value={mockTestData.title} onChange={e => setMockTestData(p => ({...p, title: e.target.value}))} />
                                                <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="icon"><Sparkles className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => generateTitle('[Topic Title] - Mock Test', setMockTestData)}>[Topic Title] - Mock Test</DropdownMenuItem><DropdownMenuItem onSelect={() => generateTitle('[Chapter Title] Mock: [Topic Title]', setMockTestData)}>[Chapter Title] Mock: [Topic Title]</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
                                            </div>
                                        </div>
                                        <div className="space-y-2"><Label>Difficulty</Label><div className="grid grid-cols-3 gap-2">{difficultyOptions.map(o=><div key={o} className="flex items-center space-x-2"><Checkbox id={`diff-mt-${o}`} checked={mockTestData.difficulty.includes(o)} onCheckedChange={(c)=>setMockTestData(p=>({...p,difficulty:c?[...p.difficulty,o]:p.difficulty.filter(d=>d!==o)}))}/><label htmlFor={`diff-mt-${o}`}>{o}</label></div>)}</div></div>
                                        <div className="space-y-2"><Label>Question Source</Label><div className="grid grid-cols-2 gap-2">{questionSourceOptions.map(o=><div key={o} className="flex items-center space-x-2"><Checkbox id={`src-mt-${o}`} checked={mockTestData.questionSource.includes(o)} onCheckedChange={(c)=>setMockTestData(p=>({...p,questionSource:c?[...p.questionSource,o]:p.questionSource.filter(s=>s!==o)}))}/><label htmlFor={`src-mt-${o}`}>{o}</label></div>)}</div></div>
                                    </div>
                                    <DialogFooter><DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose><Button onClick={() => handleAddTestOrQuiz('Mock Test')}>Save</Button></DialogFooter>
                                 </DialogContent>
                            </Dialog>
                        </CardHeader>
                         <CardContent>{/* ... mock test list ... */}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Quizzes</CardTitle>
                             <Dialog open={isQuizDialogOpen} onOpenChange={setIsQuizDialogOpen}>
                                <DialogTrigger asChild><Button size="sm"><PlusCircle className="mr-2"/> Add</Button></DialogTrigger>
                                 <DialogContent>
                                    <DialogHeader><DialogTitle>Add New Quiz</DialogTitle></DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2"><Label>Subtitle</Label><Input value={quizData.subtitle} onChange={(e) => setQuizData(prev => ({...prev, subtitle: e.target.value}))} /></div>
                                        <div className="space-y-2">
                                            <Label>Title</Label>
                                            <div className="flex gap-2">
                                                <Input value={quizData.title} onChange={(e) => setQuizData(prev => ({...prev, title: e.target.value}))} />
                                                 <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="icon"><Sparkles className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => generateTitle('[Topic Title] - Quiz', setQuizData)}>[Topic Title] - Quiz</DropdownMenuItem><DropdownMenuItem onSelect={() => generateTitle('[Topic Title] - Knowledge Check', setQuizData)}>[Topic Title] - Knowledge Check</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
                                            </div>
                                        </div>
                                        <div className="space-y-2"><Label>Difficulty</Label><div className="grid grid-cols-3 gap-2">{difficultyOptions.map(o=><div key={o} className="flex items-center space-x-2"><Checkbox id={`diff-q-${o}`} checked={quizData.difficulty.includes(o)} onCheckedChange={(c)=>setQuizData(p=>({...p,difficulty:c?[...p.difficulty,o]:p.difficulty.filter(d=>d!==o)}))}/><label htmlFor={`diff-q-${o}`}>{o}</label></div>)}</div></div>
                                        <div className="space-y-2"><Label>Question Source</Label><div className="grid grid-cols-2 gap-2">{questionSourceOptions.map(o=><div key={o} className="flex items-center space-x-2"><Checkbox id={`src-q-${o}`} checked={quizData.questionSource.includes(o)} onCheckedChange={(c)=>setQuizData(p=>({...p,questionSource:c?[...p.questionSource,o]:p.questionSource.filter(s=>s!==o)}))}/><label htmlFor={`src-q-${o}`}>{o}</label></div>)}</div></div>
                                    </div>
                                    <DialogFooter><DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose><Button onClick={() => handleAddTestOrQuiz('Quiz')}>Save</Button></DialogFooter>
                                 </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>{/* ... quiz list ... */}</CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Exams</CardTitle>
                            <Dialog open={isExamDialogOpen} onOpenChange={setIsExamDialogOpen}>
                                <DialogTrigger asChild><Button size="sm"><PlusCircle className="mr-2"/> Add</Button></DialogTrigger>
                                 <DialogContent>
                                    <DialogHeader><DialogTitle>Add New Exam</DialogTitle></DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2"><Label>Subtitle</Label><Input value={examData.subtitle} onChange={(e) => setExamData(prev => ({...prev, subtitle: e.target.value}))} /></div>
                                        <div className="space-y-2">
                                            <Label>Title</Label>
                                            <div className="flex gap-2">
                                                <Input value={examData.title} onChange={(e) => setExamData(prev => ({...prev, title: e.target.value}))} />
                                                 <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="icon"><Sparkles className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => generateTitle('[Topic Title] - Exam', setExamData)}>[Topic Title] - Exam</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
                                            </div>
                                        </div>
                                        <div className="space-y-2"><Label>Difficulty</Label><div className="grid grid-cols-3 gap-2">{difficultyOptions.map(o=><div key={o} className="flex items-center space-x-2"><Checkbox id={`diff-e-${o}`} checked={examData.difficulty.includes(o)} onCheckedChange={(c)=>setExamData(p=>({...p,difficulty:c?[...p.difficulty,o]:p.difficulty.filter(d=>d!==o)}))}/><label htmlFor={`diff-e-${o}`}>{o}</label></div>)}</div></div>
                                        <div className="space-y-2"><Label>Question Source</Label><div className="grid grid-cols-2 gap-2">{questionSourceOptions.map(o=><div key={o} className="flex items-center space-x-2"><Checkbox id={`src-e-${o}`} checked={examData.questionSource.includes(o)} onCheckedChange={(c)=>setExamData(p=>({...p,questionSource:c?[...p.questionSource,o]:p.questionSource.filter(s=>s!==o)}))}/><label htmlFor={`src-e-${o}`}>{o}</label></div>)}</div></div>
                                    </div>
                                    <DialogFooter><DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose><Button onClick={() => handleAddTestOrQuiz('Exam')}>Save</Button></DialogFooter>
                                 </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>{/* ... exam list ... */}</CardContent>
                    </Card>
                </div>
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

