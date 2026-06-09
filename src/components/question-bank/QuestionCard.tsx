'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { QuestionBankEntry } from '@/lib/question-bank-types';
import { Heart, Share2, Eye, ChevronDown, ChevronUp, CheckCircle2, XCircle, ThumbsDown, Bookmark, Flag, Link as LinkIcon, Printer, Save, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { recordQuestionAttempt } from '@/lib/firebase/student-analytics';
import { toggleInteraction, getQuestionInteraction, incrementQuestionView } from '@/lib/firebase/question-bank';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface QuestionCardProps {
    question: QuestionBankEntry;
    index?: number;
    testMode?: boolean;
}

const getOptionLabel = (key: string, language: string = 'Bangla') => {
    const isBangla = language.toLowerCase() === 'bangla' || language.toLowerCase() === 'bengali';
    const mapping: Record<string, string> = isBangla ? {
        'a': 'ক', 'b': 'খ', 'c': 'গ', 'd': 'ঘ', 'e': 'ঙ', 'f': 'চ'
    } : {
        'a': 'A', 'b': 'B', 'c': 'C', 'd': 'D', 'e': 'E', 'f': 'F'
    };
    return mapping[key.toLowerCase()] || key.toUpperCase();
}

const formatDate = (dateValue: any) => {
    if (!dateValue) return '';
    const date = new Date(dateValue.seconds ? dateValue.seconds * 1000 : dateValue);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

export default function QuestionCard({ question, index, testMode = false }: QuestionCardProps) {
    const [showAnswer, setShowAnswer] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const { user } = useAuth();
    const { toast } = useToast();
    const [showLoginModal, setShowLoginModal] = useState(false);

    const [interaction, setInteraction] = useState({ isLiked: false, isDisliked: false, isBookmarked: false });
    const [counts, setCounts] = useState({
        likes: (question as any).likesCount || 0,
        dislikes: (question as any).dislikesCount || 0,
        bookmarks: (question as any).bookmarksCount || 0,
        views: (question as any).viewsCount || 0,
    });

    // Fetch initial interaction state
    useEffect(() => {
        if (user) {
            getQuestionInteraction(question.id, user.uid).then(data => {
                if (data) setInteraction(data as any);
            });
        }
    }, [user, question.id]);

    // Increment View Count once per session (simple implementation)
    useEffect(() => {
        const viewedKey = `viewed_${question.id}`;
        if (!sessionStorage.getItem(viewedKey)) {
            incrementQuestionView(question.id);
            setCounts(prev => ({ ...prev, views: prev.views + 1 }));
            sessionStorage.setItem(viewedKey, 'true');
        }
    }, [question.id]);

    // Reset state when mode changes
    useEffect(() => {
        if (!testMode) {
            setSelectedOption(null);
            setShowAnswer(false);
        } else {
            setShowAnswer(false);
            setSelectedOption(null);
        }
    }, [testMode, question.id]);

    const handleInteract = async (type: 'like' | 'dislike' | 'bookmark') => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }
        
        // Optimistic UI update
        setInteraction(prev => {
            const next = { ...prev };
            if (type === 'like') {
                next.isLiked = !prev.isLiked;
                if (next.isLiked && prev.isDisliked) next.isDisliked = false;
            } else if (type === 'dislike') {
                next.isDisliked = !prev.isDisliked;
                if (next.isDisliked && prev.isLiked) next.isLiked = false;
            } else if (type === 'bookmark') {
                next.isBookmarked = !prev.isBookmarked;
            }
            return next;
        });

        // Optimistic Counts update
        setCounts(prev => {
            const next = { ...prev };
            if (type === 'like') {
                next.likes += interaction.isLiked ? -1 : 1;
                if (!interaction.isLiked && interaction.isDisliked) next.dislikes -= 1;
            } else if (type === 'dislike') {
                next.dislikes += interaction.isDisliked ? -1 : 1;
                if (!interaction.isDisliked && interaction.isLiked) next.likes -= 1;
            } else if (type === 'bookmark') {
                next.bookmarks += interaction.isBookmarked ? -1 : 1;
            }
            return next;
        });

        try {
            await toggleInteraction(question.id, user.uid, type);
        } catch (e) {
            console.error(e);
            toast({ title: 'Error', variant: 'destructive' });
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/question/${question.slug || question.id}`);
        toast({ title: 'Link Copied!' });
    };

    const handlePrint = () => {
        document.body.classList.add('print-isolation');
        const cardEl = document.getElementById(`question-card-${question.id}`);
        if (cardEl) cardEl.classList.add('print-target');
        
        setTimeout(() => {
            window.print();
            document.body.classList.remove('print-isolation');
            if (cardEl) cardEl.classList.remove('print-target');
        }, 100);
    };

    const handleDownloadImage = async (format: 'square' | 'story' | 'landscape') => {
        const cardEl = document.getElementById(`question-card-${question.id}`);
        if (!cardEl) return;

        toast({ title: 'Generating image...' });

        // Clone the card
        const clone = cardEl.cloneNode(true) as HTMLElement;
        
        // Remove footer from clone
        const footer = clone.querySelector('.print-hidden-actions');
        if (footer) footer.remove();

        // Create an offscreen wrapper
        const wrapper = document.createElement('div');
        wrapper.style.position = 'absolute';
        wrapper.style.left = '-9999px';
        wrapper.style.top = '-9999px';
        
        let width = 1080;
        let height = 1080;
        
        if (format === 'story') {
            width = 1080;
            height = 1920;
        } else if (format === 'landscape') {
            width = 1920;
            height = 1080;
        }
        
        wrapper.style.width = `${width}px`;
        wrapper.style.height = `${height}px`;
        wrapper.className = 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-950 flex flex-col justify-center items-center p-16';

        // Fix inner clone width
        clone.style.width = '80%';
        clone.style.maxWidth = '1000px';
        clone.className = "bg-white dark:bg-slate-950 p-8 rounded-2xl shadow-2xl relative z-10 border border-slate-200 dark:border-slate-800";
        
        // Watermark
        const watermark = document.createElement('div');
        watermark.className = 'absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0 select-none overflow-hidden';
        watermark.innerHTML = `<span class="font-black transform -rotate-45 whitespace-nowrap text-slate-900 dark:text-white" style="font-size: ${Math.min(width, height) / 8}px;">DESHEXAM.COM</span>`;
        
        // Branding tag at the bottom
        const branding = document.createElement('div');
        branding.className = 'absolute bottom-8 right-12 text-blue-900/30 dark:text-blue-100/30 font-bold text-2xl z-10 tracking-widest';
        branding.innerText = 'WWW.DESHEXAM.COM';

        wrapper.appendChild(watermark);
        wrapper.appendChild(clone);
        wrapper.appendChild(branding);
        
        document.body.appendChild(wrapper);

        try {
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(wrapper, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: null,
                width: width,
                height: height
            });
            
            const image = canvas.toDataURL("image/png");
            const link = document.createElement('a');
            link.href = image;
            link.download = `deshexam-${format}-${question.id}.png`;
            link.click();
            
            toast({ title: 'Image Downloaded!' });
        } catch (err) {
            console.error("Error generating image:", err);
            toast({ title: 'Download failed', variant: 'destructive' });
        } finally {
            document.body.removeChild(wrapper);
        }
    };

    const handleOptionClick = async (key: string) => {
        if (!testMode) return; // In reading mode, options aren't selectable
        if (selectedOption) return; // Already answered
        
        setSelectedOption(key);
        setShowAnswer(true); // Automatically show explanation on answer

        if (user) {
            const isCorrectAnswer = question.correctAnswer?.toLowerCase() === key.toLowerCase();
            try {
                await recordQuestionAttempt(user.uid, question.id, key, isCorrectAnswer);
            } catch (error) {
                console.error("Failed to record attempt", error);
            }
        }
    };

    return (
        <div id={`question-card-${question.id}`} className="w-full bg-white dark:bg-slate-950 p-5 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm mb-6 transition-all hover:shadow-md relative overflow-hidden">
            
            <div className="flex flex-col gap-2 mb-6">
                <div className="flex items-start gap-2">
                    {index !== undefined && <span className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-0.5">{index}.</span>}
                    <div className="text-lg font-semibold text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                        {question.questionText}
                    </div>
                </div>
                <div className="text-[11px] text-slate-400 font-medium ml-6 md:ml-8 flex items-center gap-2">
                    {question.createdAt && <span>Created: {formatDate(question.createdAt)}</span>}
                    {question.createdAt && question.updatedAt && <span>|</span>}
                    {question.updatedAt && <span>Updated: {formatDate(question.updatedAt)}</span>}
                </div>
            </div>

            {/* MCQ Options */}
            {question.options && Object.values(question.options).some(o => !!o) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 mb-6">
                    {['a', 'b', 'c', 'd', 'e', 'f'].map(key => {
                        const value = (question.options as any)?.[key];
                        if (!value) return null;
                        
                        const isCorrectAnswer = question.correctAnswer?.toLowerCase() === key.toLowerCase();
                        
                        let containerClasses = "bg-white border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300";
                        let circleClasses = "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
                        let Icon = null;

                        if (!testMode) {
                            // Reading Mode: Just highlight the correct answer statically
                            if (isCorrectAnswer) {
                                containerClasses = "bg-green-50 border-green-500 text-green-800 dark:bg-green-900/20 dark:border-green-500/50 dark:text-green-400";
                                circleClasses = "bg-green-500 text-white border-green-500 dark:bg-green-600 dark:border-green-600";
                                Icon = CheckCircle2;
                            }
                        } else {
                            // Test Mode
                            if (selectedOption) {
                                // User has made a choice
                                if (isCorrectAnswer) {
                                    containerClasses = "bg-green-50 border-green-500 text-green-800 dark:bg-green-900/20 dark:border-green-500/50 dark:text-green-400";
                                    circleClasses = "bg-green-500 text-white border-green-500 dark:bg-green-600 dark:border-green-600";
                                    Icon = CheckCircle2;
                                } else if (selectedOption.toLowerCase() === key.toLowerCase()) {
                                    // User picked this wrong answer
                                    containerClasses = "bg-red-50 border-red-500 text-red-800 dark:bg-red-900/20 dark:border-red-500/50 dark:text-red-400";
                                    circleClasses = "bg-red-500 text-white border-red-500 dark:bg-red-600 dark:border-red-600";
                                    Icon = XCircle;
                                } else {
                                    // Neutral state for unpicked wrong answers
                                    containerClasses = "bg-white border-slate-200 opacity-60 dark:bg-slate-900 dark:border-slate-800";
                                }
                            } else {
                                // Hoverable state before choice
                                containerClasses = "bg-white border-slate-200 hover:border-[#107c41] hover:bg-green-50 dark:bg-slate-900 dark:border-slate-700 dark:hover:border-green-500/50 dark:hover:bg-green-900/20 cursor-pointer";
                            }
                        }

                        return (
                            <div 
                                key={key} 
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-full border transition-all duration-200",
                                    containerClasses
                                )}
                                onClick={() => handleOptionClick(key)}
                            >
                                <div className={cn(
                                    "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold shrink-0 transition-colors",
                                    circleClasses
                                )}>
                                    {Icon ? <Icon className="h-5 w-5" /> : getOptionLabel(key, question.language)}
                                </div>
                                <span className="text-base flex-grow font-medium">
                                    {value}
                                </span>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6 ml-6 md:ml-8">
                {question.sourceYear && <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 font-normal shadow-none border border-slate-200 rounded px-3 py-1">{question.sourceYear}</Badge>}
                {(question as any).taxonomyTags?.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 font-normal shadow-none border border-slate-200 rounded px-3 py-1">{tag}</Badge>
                ))}
                {question.tags?.map(tag => (
                    <Badge key={tag} variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 font-normal shadow-none border border-slate-200 rounded px-3 py-1">{tag}</Badge>
                ))}
            </div>

            {/* Footer Actions */}
            <div className="flex flex-wrap gap-4 justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800 mt-2 print-hidden-actions">
                <button 
                    onClick={() => setShowAnswer(!showAnswer)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
                >
                    {showAnswer ? 'Hide Explanation' : 'Show Explanation'}
                    {showAnswer ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                
                <div className="flex flex-wrap items-center gap-4 md:gap-6 text-slate-500 dark:text-slate-400 text-sm font-medium">
                    <button onClick={() => handleInteract('like')} className={cn("flex items-center gap-1.5 hover:text-[#107c41] transition-colors", interaction.isLiked && "text-[#107c41]")}>
                        <Heart className={cn("h-4 w-4", interaction.isLiked && "fill-current")} />
                        <span>{counts.likes > 0 ? counts.likes : 'Like'}</span>
                    </button>
                    <button onClick={() => handleInteract('dislike')} className={cn("flex items-center gap-1.5 hover:text-red-500 transition-colors", interaction.isDisliked && "text-red-500")}>
                        <ThumbsDown className={cn("h-4 w-4", interaction.isDisliked && "fill-current")} />
                    </button>
                    <button onClick={() => handleInteract('bookmark')} className={cn("flex items-center gap-1.5 hover:text-yellow-500 transition-colors", interaction.isBookmarked && "text-yellow-500")}>
                        <Bookmark className={cn("h-4 w-4", interaction.isBookmarked && "fill-current")} />
                        <span>{counts.bookmarks > 0 ? counts.bookmarks : 'Save'}</span>
                    </button>
                    
                    <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
                    
                    <button onClick={handleCopyLink} className="flex items-center gap-1.5 hover:text-blue-500 transition-colors" title="Copy Link">
                        <LinkIcon className="h-4 w-4" />
                    </button>
                    <button onClick={handlePrint} className="flex items-center gap-1.5 hover:text-slate-800 dark:hover:text-slate-200 transition-colors" title="Print">
                        <Printer className="h-4 w-4" />
                    </button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors outline-none" title="Download as Image">
                                <Download className="h-4 w-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDownloadImage('square')}>Instagram Square (1:1)</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadImage('story')}>Mobile Story (9:16)</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadImage('landscape')}>Desktop Landscape (16:9)</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <button onClick={() => toast({ title: 'Reported', description: 'Thank you for reporting this question.' })} className="flex items-center gap-1.5 hover:text-red-500 transition-colors" title="Report Issue">
                        <Flag className="h-4 w-4" />
                    </button>

                    <div className="flex items-center gap-1.5 ml-2" title="Views">
                        <Eye className="h-4 w-4" />
                        <span>{counts.views}</span>
                    </div>
                </div>
            </div>

            {/* Explanation Section */}
            {showAnswer && question.explanation && (
                <div className="mt-4 p-5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2">
                        Explanation
                    </span>
                    {question.explanation}
                </div>
            )}

            <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Login Required</DialogTitle>
                        <DialogDescription>
                            You need to be logged in to interact with questions, save them, or view your history.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 sm:justify-start gap-2">
                        <Button variant="outline" onClick={() => setShowLoginModal(false)}>Cancel</Button>
                        <Link href="/login">
                            <Button>Log In</Button>
                        </Link>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
