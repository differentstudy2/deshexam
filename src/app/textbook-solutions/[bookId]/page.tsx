
import type { Metadata, ResolvingMetadata } from 'next';
import { getContentById } from '@/lib/firebase/firestore';
import TextbookClientPage from './textbook-client-page';
import { notFound } from 'next/navigation';

type PageProps = {
    params: { bookId: string };
};

<<<<<<< HEAD
export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { bookId } = params;
  const textbook = (await getContentById(bookId)) as any;
=======
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
  
  const isChapterUnlocked = useCallback((chapter: Chapter, index: number): boolean => {
    const freeChapterCount = settings?.freeChaptersPerBook ?? 0;
    if (index < freeChapterCount) {
        return true;
    }

    if (settings?.gateChaptersOnPass) {
        if (index === 0) return true;
        const prevChapter = chapters[index - 1];
        if (!prevChapter) return true;

        const prevChapterTopics = topics[prevChapter.id];
        if (!prevChapterTopics) {
            return false;
        }

        const prevChapterPracticeSets = prevChapterTopics.flatMap(t => t.practiceSets || []);
        if (prevChapterPracticeSets.length === 0) {
            return true; 
        }

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

  const calculateChapterAggregate = (chapterId: string) => {
    const chapterTopics = topics[chapterId];
    if (!chapterTopics || !progress) return null;

    const practiceSets = chapterTopics.flatMap(t => t.practiceSets || []);
    if (practiceSets.length === 0) return null;

    const scores = practiceSets
        .map(ps => progress.highestScores[ps.id])
        .filter(score => score !== undefined);
        
    if (scores.length === 0) return null;

    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    return Math.round(average);
  };


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
          value={activeChapter || undefined}
          onValueChange={(value) => onChapterToggle(value)}
        >
          {chapters.map((chapter, index) => {
            const isUnlocked = isChapterUnlocked(chapter, index);
            const chapterAggregate = calculateChapterAggregate(chapter.id);
            const isGated = settings?.gateChaptersOnPass && index >= (settings?.freeChaptersPerBook ?? 0);
            const prevChapter = index > 0 ? chapters[index - 1] : null;

            return (
              <AccordionItem value={chapter.id} key={chapter.id}>
                <AccordionTrigger className="hover:no-underline" disabled={!isUnlocked}>
                  <div className="flex flex-col items-start w-full text-left">
                    <div className="flex items-center justify-between w-full">
                      <span className="flex items-center gap-2">
                        {chapter.title}
                        {chapterAggregate !== null && (
                          <ScoreCircle score={chapterAggregate} size={24} />
                        )}
                      </span>
                      {!isUnlocked && (
                        <Badge variant="destructive" className="flex items-center gap-1 mr-2">
                          <Lock className="w-3 h-3" />
                          Locked
                        </Badge>
                      )}
                    </div>
                     {!isUnlocked && isGated && prevChapter && (
                        <span className="text-xs text-muted-foreground mt-1 font-normal">
                            Get {settings.practiceSetPassMark}% on Chapter {prevChapter.title.match(/^\d+/)?.[0] || ''} to unlock
                        </span>
                    )}
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

    const ActionArea = () => {
        if (isLocked) {
            return (
                <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-right">
                    <div className="text-xs font-semibold text-destructive flex items-center gap-1">
                        <Lock className="w-4 h-4" />
                        <span>Get {passMark}% on the previous set to unlock</span>
                    </div>
                </div>
            );
        }
        return (
             <div className="flex items-center gap-2">
                 <Button variant="outline" size="sm" onClick={onDownload} disabled={isDownloading}>
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
                <Button asChild>
                    <Link href={`/textbook-solutions/practice-set/${ps.id}?textbook=${textbookId}&chapter=${chapterId}&topic=${topicId}`}>
                        Start Practice
                    </Link>
                </Button>
            </div>
        );
    };

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
                <ActionArea />
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

  const activeChapterId = searchParams.get('chapter');
  const activeTopicId = searchParams.get('topic');
  
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

        const initialChapterId = searchParams.get('chapter');
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

  const activeChapter = chapters.find(c => c.id === activeChapterId);
  const selectedTopicContent = useMemo(() => {
    if (!activeChapterId || !activeTopicId || !topics[activeChapterId]) return null;
    return topics[activeChapterId]?.find(t => t.id === activeTopicId) || null;
  }, [activeChapterId, activeTopicId, topics]);

  useEffect(() => {
    // Dynamically update metadata when textbook, chapter, or topic changes
    const updateMetadata = () => {
        let title = "Textbook Solutions";
        let description = "Find detailed solutions for your textbook exercises.";
        let keywords = "textbook solutions, exam preparation, practice sets";
        const jsonLdScript = document.getElementById('structured-data');

        if (textbook) {
            title = `${textbook.title} Solutions | DeshExam`;
            description = `Get complete solutions for ${textbook.title}. Covers all chapters and topics with practice sets.`;
            keywords = `${textbook.title}, ${textbook.subject}, ${textbook.class}, textbook solutions, NCERT solutions`;
        }
        if (activeChapter) {
            title = `${activeChapter.title} - ${textbook?.title} Solutions | DeshExam`;
            description = `Solutions for ${activeChapter.title}, part of the ${textbook?.title} textbook. Includes detailed explanations and practice questions.`;
            keywords += `, ${activeChapter.title}`;
        }
        if (selectedTopicContent) {
            title = `${selectedTopicContent.title} - ${activeChapter?.title} | DeshExam`;
            description = `Practice sets and resources for ${selectedTopicContent.title}, from chapter ${activeChapter?.title}.`;
            keywords += `, ${selectedTopicContent.title}`;
        }

        document.title = title;
        document.querySelector('meta[name="description"]')?.setAttribute('content', description);
        document.querySelector('meta[name="keywords"]')?.setAttribute('content', keywords);

        // Update or create JSON-LD script
        const jsonLd = {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": title,
            "url": window.location.href,
            "description": description,
            "image": textbook?.featureImage || "https://picsum.photos/seed/bookcover/800/400",
            "author": {
              "@type": "Organization",
              "name": "DeshExam",
            },
            "publisher": {
              "@type": "Organization",
              "name": "DeshExam",
              "logo": {
                "@type": "ImageObject",
                "url": "https://deshexam.com/logo.png"
              }
            },
            "datePublished": textbook ? new Date().toISOString() : '',
            "dateModified": new Date().toISOString(),
          };

        if(jsonLdScript) {
            jsonLdScript.innerHTML = JSON.stringify(jsonLd);
        } else {
            const script = document.createElement('script');
            script.id = 'structured-data';
            script.type = 'application/ld+json';
            script.innerHTML = JSON.stringify(jsonLd);
            document.head.appendChild(script);
        }
    };
    updateMetadata();
}, [textbook, activeChapter, selectedTopicContent]);
  
  useEffect(() => {
    setAreResourcesFetched(false);
  }, [activeTopicId]);


  const handleChapterToggle = useCallback(async (chapterId: string) => {
      if (!chapterId || topics[chapterId]) {
          const params = new URLSearchParams(searchParams.toString());
          params.set('chapter', chapterId);
          params.delete('topic'); 
          router.push(`?${params.toString()}`, { scroll: false });
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
          const params = new URLSearchParams(searchParams.toString());
          params.set('chapter', chapterId);
          params.delete('topic');
          router.push(`?${params.toString()}`, { scroll: false });
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
  }, [textbookId, topics, toast, router, searchParams]);
  
  const handleTopicSelect = (chapterId: string, topicId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('chapter', chapterId);
      params.set('topic', topicId);
      router.push(`?${params.toString()}`, { scroll: false });
  };
  
  const topicAggregateScore = useMemo(() => {
    if (!selectedTopicContent || !progress || !selectedTopicContent.practiceSets || selectedTopicContent.practiceSets.length === 0) {
        return null;
    }
    const scores = selectedTopicContent.practiceSets
        .map(ps => progress.highestScores[ps.id])
        .filter(score => score !== undefined);
        
    if (scores.length === 0) return null;

    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    return Math.round(average);
  }, [selectedTopicContent, progress]);
  
  const handleResourceClick = (resource: any) => {
    setViewerResource(resource);
    setViewerOpen(true);
  };
  
  const fetchResources = async () => {
    if (!activeChapterId || !activeTopicId || areResourcesFetched) return;
    
    setAreResourcesLoading(true);
    try {
        const topicRef = doc(db, `textbooks/${textbookId}/chapters/${activeChapterId}/topics`, activeTopicId);
        const topicSnap = await getDoc(topicRef);
        if(topicSnap.exists()) {
            const topicData = topicSnap.data();
            setTopics(prevTopics => ({
                ...prevTopics,
                [activeChapterId]: prevTopics[activeChapterId].map(t => 
                    t.id === activeTopicId ? { ...t, resources: topicData.resources || [] } : t
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
    if (!activeChapterId || !activeTopicId) return;
    setIsDownloading(practiceSet.id);
    toast({
        title: "Generating PDF...",
        description: "Your download will begin shortly.",
    });

    try {
        const questions = await getQuestionsByPracticeSet(textbookId, activeChapterId, activeTopicId, practiceSet.id);
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
        
        const drawWatermark = () => {
            pdf.setFontSize(60);
            pdf.setTextColor(230, 230, 230);
            pdf.text('DeshExam', pageWidth / 2, pageHeight / 2, {
                angle: -45,
                align: 'center',
            });
            pdf.setTextColor(0, 0, 0);
        }

        drawWatermark();
        y = margin;

        const headerContent = (
            <div className="p-1 bg-transparent text-black font-sans w-[700px] text-sm">
                <div className="text-center mb-2">
                    <h1 className="text-xl font-bold">{practiceSet.title}</h1>
                    <h2 className="text-lg">{textbook?.title}</h2>
                </div>
                 <div className="grid grid-cols-2 gap-x-4 gap-y-0 text-sm border-y-2 border-black py-2 my-2">
                    <p><strong>Institute Name:</strong> Deshexam.com</p>
                    {textbook?.board && <p><strong>Board:</strong> {textbook.board}</p>}
                    {textbook?.class && <p><strong>Class:</strong> {textbook.class}</p>}
                    {textbook?.subject && <p><strong>Subject:</strong> {textbook.subject}</p>}
                    {chapters.find(c => c.id === activeChapterId)?.title && <p><strong>Chapter:</strong> {chapters.find(c => c.id === activeChapterId)?.title}</p>}
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
            
            y = addWatermarkAndNewPageIfNeeded(y, imgHeight);
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
                   <div className="grid grid-cols-2 gap-x-4 gap-y-0 text-sm">
                        {question.type === 'Multiple Choice' && question.options?.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-start gap-1">
                                <div className="font-bold">{String.fromCharCode(65 + optIndex)}.</div>
                                <div>{option.text}</div>
                            </div>
                        ))}
                    </div>
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
                                        <div key={index} className="flex items-center gap-2">
                                            <span>{index + 1}.</span>
                                            <span>{itemA.text}</span>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    {question.matchingOptions.columnB.map((itemB, index) => (
                                        <div key={index} className="flex items-center gap-2">
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

                if (y + imgHeight > pageHeight - margin) {
                    pdf.addPage();
                    drawWatermark();
                    y = margin;
                }

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
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="ml-4 text-lg">Loading Textbook...</p>
        </div>
    );
  }
>>>>>>> 49fc1c0c874748b5830da174a57557d18a08f292

  if (!textbook) {
    return {
      title: 'Textbook Not Found',
    };
  }
  
  const keywords = [
    textbook.title,
    textbook.subject,
    textbook.class,
    textbook.board,
    'textbook solutions',
    'NCERT solutions',
  ].filter(Boolean);

  const previousImages = (await parent).openGraph?.images || [];
  const featureImage = textbook.featureImage || `https://picsum.photos/seed/${bookId}/1200/630`;

  const newTitle = `${textbook.title} | Solution, Mock Test, Practice Set, Exam Free`;

  return {
    title: newTitle,
    description: textbook.description || `Solutions and practice sets for the ${textbook.title} textbook.`,
    keywords,
    openGraph: {
      title: newTitle,
      description: textbook.description,
      images: [featureImage, ...previousImages],
      type: 'article',
    },
  };
}


export default async function TextbookSolutionsPage({ params }: PageProps) {
    const { bookId } = params;
    const textbookData = await getContentById(bookId);

    if (!textbookData) {
        notFound();
    }

    // Serialize the textbook object to make it a "plain object"
    const textbook = {
      ...textbookData,
      // Convert Firestore Timestamps to simple strings.
      createdAt: textbookData.createdAt?.toDate ? textbookData.createdAt.toDate().toLocaleDateString() : null,
      updatedAt: textbookData.updatedAt?.toDate ? textbookData.updatedAt.toDate().toLocaleDateString() : null,
    };

    return <TextbookClientPage textbook={textbook as any} />;
}
