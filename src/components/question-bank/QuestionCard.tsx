'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { QuestionBankEntry } from '@/lib/question-bank-types';
import { Heart, Share2, Eye, ChevronDown, ChevronUp, CheckCircle2, XCircle, ThumbsDown, Bookmark, Flag, Link as LinkIcon, Printer, Save, Download, ShieldCheck, ExternalLink, MoreVertical, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { recordQuestionAttempt } from '@/lib/firebase/student-analytics';
import { toggleInteraction, getQuestionInteraction, incrementQuestionView } from '@/lib/firebase/question-bank';
import { trackQuestionEvent } from '@/lib/analytics/question-events';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AuthModal } from '@/components/auth/AuthModal';
import InteractiveMatching from './InteractiveMatching';
import InteractiveFillInTheBlank from './InteractiveFillInTheBlank';
import { Input } from '@/components/ui/input';

interface QuestionCardProps {
    question: QuestionBankEntry;
    index?: number;
    testMode?: boolean;
    isListView?: boolean;
    isDetailView?: boolean;
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

export default function QuestionCard({ question, index, testMode = false, isListView = false, isDetailView = false }: QuestionCardProps) {
    const isDescriptive = ['desc', 'descriptive', 'creative question'].includes(question.questionType?.toLowerCase() || '');
    const [showAnswer, setShowAnswer] = useState(isDescriptive);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [fillBlankAnswer, setFillBlankAnswer] = useState<string>('');
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

    // Fetch real-time interaction state
    useEffect(() => {
        if (user) {
            const interactionId = `${user.uid}_${question.id}`;
            const unsubscribe = onSnapshot(doc(db, 'question_interactions', interactionId), (snap) => {
                if (snap.exists()) {
                    setInteraction(snap.data() as any);
                }
            });
            return () => unsubscribe();
        }
    }, [user, question.id]);

    // Fetch real-time counts
    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, 'question_bank', question.id), (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                setCounts(prev => ({
                    ...prev,
                    likes: data.likesCount || 0,
                    dislikes: data.dislikesCount || 0,
                    bookmarks: data.bookmarksCount || 0,
                    views: data.viewsCount || 0
                }));
            }
        });
        return () => unsubscribe();
    }, [question.id]);

    // Increment View Count once per session (simple implementation)
    useEffect(() => {
        const viewedKey = `viewed_${question.id}`;
        if (!sessionStorage.getItem(viewedKey)) {
            incrementQuestionView(question.id);
            setCounts(prev => ({ ...prev, views: prev.views + 1 }));
            sessionStorage.setItem(viewedKey, 'true');
            
            trackQuestionEvent('question_view', question.id, user?.uid, {
                subject: question.subjectId,
                board: question.boardId,
                type: question.questionType
            });
        }
    }, [question.id, user?.uid, question.subjectId, question.boardId, question.questionType]);

    // Reset state when mode changes
    useEffect(() => {
        if (!testMode) {
            setSelectedOption(null);
            setShowAnswer(isDescriptive);
        } else {
            setShowAnswer(false);
            setSelectedOption(null);
        }
    }, [testMode, question.id, isDescriptive]);

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
            if (type === 'like' || type === 'bookmark') {
                const eventType = type === 'bookmark' ? 'save' : 'like';
                trackQuestionEvent(eventType, question.id, user.uid, {
                    subject: question.subjectId,
                    board: question.boardId
                });
            }
        } catch (e) {
            console.error(e);
            toast({ title: 'Error', variant: 'destructive' });
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/question/${question.slug || question.id}`);
        toast({ title: 'Link Copied!' });
        trackQuestionEvent('share', question.id, user?.uid, {
            subject: question.subjectId,
            board: question.boardId
        });
    };

    const handleRevealAnswer = () => {
        const newState = !showAnswer;
        setShowAnswer(newState);
        if (newState) {
            trackQuestionEvent('answer_reveal', question.id, user?.uid, {
                subject: question.subjectId,
                board: question.boardId
            });
        }
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
        toast({ title: 'Generating premium mockup...' });

        // Variables
        const uName = user?.displayName || 'Tariq Rahman';
        const uPoints = '1250 pts';
        const qIndex = index !== undefined ? `${index}/25` : '12/25';
        const qText = question.questionText || '';
        const qLang = question.language || 'Bangla';

        // Build Options HTML
        const optionKeys = ['a', 'b', 'c', 'd', 'e', 'f'];
        let optionsHtml = '';
        optionKeys.forEach(key => {
            const value = (question.options as any)?.[key];
            if (value) {
                const isCorrect = question.correctAnswer?.toLowerCase() === key.toLowerCase();
                const label = getOptionLabel(key, qLang);
                
                if (isCorrect) {
                    optionsHtml += `
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; margin-bottom: 16px; border-radius: 9999px; border: 3px solid #22c55e; background-color: #dcfce7;">
                            <div style="display: flex; align-items: center; gap: 16px;">
                                <div style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 9999px; background-color: #22c55e; color: white; font-weight: bold; font-size: 20px;">
                                    ${label}
                                </div>
                                <span style="font-size: 24px; font-weight: bold; color: #166534;">${value}</span>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#22c55e" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="border-radius: 50%;"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
                        </div>
                    `;
                } else {
                    optionsHtml += `
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; margin-bottom: 16px; border-radius: 9999px; border: 2px solid #e2e8f0; background-color: white;">
                            <div style="display: flex; align-items: center; gap: 16px;">
                                <div style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 9999px; background-color: #f1f5f9; border: 2px solid #cbd5e1; color: #475569; font-weight: bold; font-size: 20px;">
                                    ${label}
                                </div>
                                <span style="font-size: 24px; font-weight: normal; color: #334155;">${value}</span>
                            </div>
                        </div>
                    `;
                }
            }
        });

        // Determine Canvas Sizes based on format
        let canvasW = 1080;
        let canvasH = 1920;
        let scaleStr = 'transform: scale(1);';
        
        if (format === 'square') {
            canvasH = 1080;
            // Scale phone down to fit in 1080x1080, push it down slightly
            scaleStr = 'transform: scale(0.6) translateY(200px);';
        } else if (format === 'landscape') {
            canvasW = 1920;
            canvasH = 1080;
            scaleStr = 'transform: scale(0.6) translateY(200px);';
        }

        // Create an offscreen wrapper
        const wrapper = document.createElement('div');
        wrapper.style.position = 'absolute';
        wrapper.style.left = '-9999px';
        wrapper.style.top = '-9999px';
        wrapper.style.width = `${canvasW}px`;
        wrapper.style.height = `${canvasH}px`;
        
        wrapper.innerHTML = `
            <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%); font-family: sans-serif; position: relative;">
                
                <!-- Blurred background elements for depth -->
                <div style="position: absolute; width: 600px; height: 600px; background: #60a5fa; filter: blur(100px); opacity: 0.3; top: -100px; left: -100px; border-radius: 50%;"></div>
                <div style="position: absolute; width: 600px; height: 600px; background: #2dd4bf; filter: blur(100px); opacity: 0.2; bottom: -100px; right: -100px; border-radius: 50%;"></div>
                
                <!-- Phone Frame -->
                <div style="width: 900px; height: 1800px; background-color: #f8fafc; border-radius: 70px; border: 20px solid #1e293b; box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.4), 0 0 0 4px #475569 inset; overflow: hidden; position: relative; display: flex; flex-direction: column; ${scaleStr} transform-origin: center;">
                    
                    <!-- Top Status Bar -->
                    <div style="display: flex; justify-content: space-between; padding: 16px 36px; background-color: #2563eb; color: white; font-weight: bold; font-size: 16px; z-index: 40;">
                        <span>10:09 AM</span>
                        <span>📱 📶 🔋</span>
                    </div>

                    <!-- Blue Header -->
                    <div style="background-color: #2563eb; color: white; padding: 20px 40px 100px 40px; display: flex; justify-content: space-between; align-items: flex-start; position: relative; z-index: 10;">
                        <div>
                            <div style="font-size: 52px; font-weight: 800; margin-bottom: 8px;">দেশএক্সাম</div>
                            <div style="font-size: 26px; font-weight: 500; opacity: 0.9;">সাধারণ জ্ঞান কুইজ</div>
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: center; padding-top: 10px;">
                            <div style="width: 72px; height: 72px; background-color: white; border-radius: 9999px; margin-bottom: 8px; display: flex; justify-content: center; align-items: center; font-size: 40px; overflow: hidden; border: 3px solid white;">
                                👤
                            </div>
                            <div style="font-size: 18px; font-weight: bold;">${uName}</div>
                            <div style="font-size: 16px; opacity: 0.9;">${uPoints}</div>
                        </div>
                    </div>

                    <!-- Main White Card -->
                    <div style="background-color: white; border-radius: 40px; margin: -50px 32px 130px 32px; padding: 40px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); border: 2px solid #f1f5f9; position: relative; z-index: 20; flex: 1; display: flex; flex-direction: column;">
                        
                        <!-- Question Counter Tag -->
                        <div style="position: absolute; top: -20px; left: 40px; background-color: white; color: #64748b; font-weight: bold; font-size: 18px; padding: 8px 24px; border-radius: 9999px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                            ${qIndex}
                        </div>

                        <!-- Question Text -->
                        <div style="font-size: 38px; font-weight: 800; color: #0f172a; margin-top: 30px; margin-bottom: 40px; line-height: 1.4;">
                            ${qText}
                        </div>

                        <!-- Options -->
                        <div style="margin-bottom: 40px;">
                            ${optionsHtml}
                        </div>

                        <!-- Bottom Stats/Feedback -->
                        <div style="margin-top: auto; padding-top: 20px;">
                            <div style="display: flex; align-items: center; justify-content: center; gap: 12px; color: #64748b; font-size: 20px; font-weight: 500; margin-bottom: 16px;">
                                📊 ৬,০০০+ জন এই উত্তর দিয়েছেন 🧑‍🎓👩‍🎓
                            </div>
                            <div style="display: flex; align-items: center; justify-content: center; gap: 12px; color: #16a34a; font-size: 24px; font-weight: bold; margin-bottom: 10px;">
                                ✅ আপনি সঠিক উত্তর দিয়েছেন! 🎉🎉🎉
                            </div>
                            <div style="text-align: center; color: #475569; font-size: 20px; margin-bottom: 30px;">
                                আপনি +২৫ পয়েন্ট পেয়েছেন!
                            </div>
                            
                            <!-- Action Buttons -->
                            <div style="display: flex; gap: 20px;">
                                <div style="flex: 1; background-color: #16a34a; color: white; padding: 22px 0; border-radius: 9999px; text-align: center; font-size: 24px; font-weight: bold; box-shadow: 0 4px 15px -3px rgba(22, 163, 74, 0.4);">
                                    পরবর্তী প্রশ্ন &gt;
                                </div>
                                <div style="flex: 1; background-color: white; color: #475569; border: 2px solid #cbd5e1; padding: 22px 0; border-radius: 9999px; text-align: center; font-size: 24px; font-weight: bold;">
                                    ব্যাখ্যা দেখুন
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Bottom Nav Bar -->
                    <div style="position: absolute; bottom: 0; width: 100%; height: 110px; background-color: white; border-top: 2px solid #e2e8f0; display: flex; justify-content: space-around; align-items: center; z-index: 30; padding-bottom: 15px; box-shadow: 0 -4px 6px -1px rgba(0,0,0,0.05);">
                        <div style="display: flex; flex-direction: column; align-items: center; color: #2563eb;">
                            <span style="font-size: 32px;">🏠</span><span style="font-size: 16px; font-weight: bold; margin-top: 6px;">Home</span>
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: center; color: #94a3b8;">
                            <span style="font-size: 32px;">📋</span><span style="font-size: 16px; font-weight: 500; margin-top: 6px;">Exams</span>
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: center; color: #94a3b8;">
                            <span style="font-size: 32px;">📊</span><span style="font-size: 16px; font-weight: 500; margin-top: 6px;">Leaderboard</span>
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: center; color: #94a3b8;">
                            <span style="font-size: 32px;">👤</span><span style="font-size: 16px; font-weight: 500; margin-top: 6px;">Profile</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(wrapper);

        try {
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(wrapper, {
                scale: 1, // Keep scale 1 since the internal size is already massive (1080/1920)
                useCORS: true,
                logging: false,
                backgroundColor: null,
                width: canvasW,
                height: canvasH
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

        if (user) {
            const isCorrectAnswer = question.correctAnswer?.toLowerCase() === key.toLowerCase();
            try {
                await recordQuestionAttempt(user.uid, question.id, key, isCorrectAnswer);
            } catch (error) {
                console.error("Failed to record attempt", error);
            }
        }
    };

    const isMatching = question.questionType?.toLowerCase() === 'matching';
    const isTrueFalse = question.questionType?.toLowerCase() === 'true/false';
    const isFillInTheBlank = question.questionType?.toLowerCase() === 'fill in the blank';
    let displayMatchingPairs = question.matchingPairs || [];
    
    // Fallback for legacy/imported matching questions
    if (isMatching && displayMatchingPairs.length === 0 && question.options?.a) {
        try {
            // If they just put everything in option A
            if (question.options.a && !question.options.b) {
                const pairs = question.options.a.split(',').map(p => p.trim());
                displayMatchingPairs = pairs.map(p => {
                    let [left, right] = p.split('=');
                    if (!right) {
                        left = p;
                        right = '';
                    }
                    return { left: left.trim(), right: right.trim() };
                });
            }
        } catch(e) {}
    }

    return (
        <div id={`question-card-${question.id}`} className="w-full bg-white dark:bg-slate-900 p-5 md:p-6 rounded-xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm mb-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden">
            
            {/* Top row: Taxonomy chips and Link */}
            <div className="flex items-start justify-between mb-4 gap-4">
                <div className="flex flex-wrap items-center gap-2">
                    {question.marks && (
                        <span className="bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-bold rounded-md px-2.5 py-0.5 text-[12px] uppercase tracking-wide shadow-sm">
                            {question.marks} Marks
                        </span>
                    )}
                    
                    {question.sourceYear ? (
                        <span className="bg-[#f8fafc] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium rounded-md px-2.5 py-0.5 text-[11px] uppercase tracking-wide">{question.sourceYear}</span>
                    ) : null}
                    
                    {/* Real tags */}
                    {(question as any).taxonomyTags?.map((tag: string, idx: number) => (
                        <span key={`tax-${idx}`} className="bg-[#f8fafc] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium rounded-md px-2.5 py-0.5 text-[11px] uppercase tracking-wide">{tag}</span>
                    ))}
                    {question.tags?.map((tag: string, idx: number) => (
                        <span key={`tag-${idx}`} className="bg-[#f8fafc] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium rounded-md px-2.5 py-0.5 text-[11px] uppercase tracking-wide">{tag}</span>
                    ))}

                    {/* Fallback example tags if none exist in the database for UI preview */}
                    {!question.sourceYear && !(question as any).taxonomyTags?.length && !question.tags?.length && (
                        <>
                            <span className="bg-[#f8fafc] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium rounded-md px-2.5 py-0.5 text-[11px] uppercase tracking-wide">WBBSE</span>
                            <span className="bg-[#f8fafc] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium rounded-md px-2.5 py-0.5 text-[11px] uppercase tracking-wide">CLASS 10</span>
                            <span className="bg-[#f8fafc] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium rounded-md px-2.5 py-0.5 text-[11px] uppercase tracking-wide">বাংলা</span>
                            <span className="bg-[#f8fafc] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium rounded-md px-2.5 py-0.5 text-[11px] uppercase tracking-wide">MCQ</span>
                            <span className="bg-[#f8fafc] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium rounded-md px-2.5 py-0.5 text-[11px] uppercase tracking-wide">2022</span>
                        </>
                    )}
                    
                    {question.isVerified && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-500/20 uppercase tracking-wide">
                            <ShieldCheck className="w-3 h-3" />
                            VERIFIED
                        </div>
                    )}
                </div>
                
                <div className="flex items-center gap-1">
                    <Link href={`/question/${question.slug || question.id}`} className="text-slate-400 hover:text-blue-500 transition-colors p-1 shrink-0" title="Open Question Page">
                        <ExternalLink className="h-4 w-4" />
                    </Link>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 shrink-0 outline-none" title="More Options">
                                <MoreVertical className="h-4 w-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handlePrint} className="flex items-center gap-2 cursor-pointer">
                                <Printer className="h-4 w-4" />
                                <span>Print Question</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadImage('square')} className="flex items-center gap-2 cursor-pointer">
                                <Download className="h-4 w-4" />
                                <span>Download as Image</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="flex flex-col gap-2 mb-5">
                <div className="flex items-start gap-2">
                    {index !== undefined && <span className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-0.5">{index}.</span>}
                    {isFillInTheBlank ? (
                        <div className="flex-1 w-full min-w-0">
                            <InteractiveFillInTheBlank 
                                text={question.questionText || ''}
                                correctAnswers={(question.correctAnswer || '').split(',')}
                                distractors={Object.values(question.options || {}).filter(Boolean) as string[]}
                                testMode={testMode}
                                showAnswer={showAnswer}
                                onAttempt={(isCorrect) => {
                                    if (user && testMode) {
                                        setShowAnswer(true);
                                        recordQuestionAttempt(user.uid, question.id, "FILL_IN_THE_BLANK_ATTEMPT", isCorrect).catch(console.error);
                                    }
                                }}
                            />
                        </div>
                    ) : (
                        isDetailView ? (
                            <h1 className="text-[1.3rem] md:text-[1.5rem] font-extrabold text-slate-800 dark:text-slate-200 leading-snug whitespace-pre-wrap mb-1 mt-0">
                                {question.questionText}
                            </h1>
                        ) : (
                            <div className="text-[1rem] font-bold text-slate-800 dark:text-slate-200 leading-snug whitespace-pre-wrap">
                                <Link href={`/question/${question.slug || question.id}`} className="hover:text-blue-600 transition-colors">
                                    {question.questionText}
                                </Link>
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* MCQ Options */}
            {!isMatching && !isTrueFalse && !isFillInTheBlank && question.options && Object.values(question.options).some(o => !!o) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-4 mb-4">
                    {['a', 'b', 'c', 'd', 'e', 'f'].map(key => {
                        const value = (question.options as any)?.[key];
                        if (!value) return null;
                        
                        const isCorrectAnswer = question.correctAnswer?.toLowerCase() === key.toLowerCase();
                        
                        let containerClasses = "bg-white border border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300";
                        let circleClasses = "bg-[#f8fafc] text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
                        let Icon = null;

                        if (!testMode) {
                            // Reading Mode: Just highlight the correct answer statically
                            if (isCorrectAnswer) {
                                containerClasses = "bg-[#f0fdf4] border border-[#22c55e] text-[#166534] dark:bg-green-900/20 dark:border-[#22c55e] dark:text-green-400";
                                circleClasses = "bg-[#22c55e] text-white border-[#22c55e] dark:bg-[#22c55e] dark:border-[#22c55e]";
                                Icon = CheckCircle2;
                            }
                        } else {
                            // Test Mode
                            if (selectedOption || showAnswer) {
                                // User has made a choice or revealed the answer
                                if (isCorrectAnswer) {
                                    containerClasses = "bg-[#f0fdf4] border border-[#22c55e] text-[#166534] dark:bg-green-900/20 dark:border-[#22c55e] dark:text-green-400";
                                    circleClasses = "bg-[#22c55e] text-white border-[#22c55e] dark:bg-[#22c55e] dark:border-[#22c55e]";
                                    Icon = CheckCircle2;
                                } else if (selectedOption?.toLowerCase() === key.toLowerCase()) {
                                    // User picked this wrong answer
                                    containerClasses = "bg-red-50 border border-red-500 text-red-800 dark:bg-red-900/20 dark:border-red-500/50 dark:text-red-400";
                                    circleClasses = "bg-red-500 text-white border-red-500 dark:bg-red-600 dark:border-red-600";
                                    Icon = XCircle;
                                } else {
                                    // Neutral state for unpicked wrong answers
                                    containerClasses = "bg-white border border-slate-200 opacity-60 dark:bg-slate-900 dark:border-slate-800";
                                }
                            } else {
                                // Hoverable state before choice
                                containerClasses = "bg-white border border-slate-200 hover:border-[#107c41] hover:bg-[#f0fdf4] dark:bg-slate-900 dark:border-slate-700 dark:hover:border-green-500/50 dark:hover:bg-green-900/20 cursor-pointer";
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
                                    "flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold shrink-0 transition-colors",
                                    circleClasses
                                )}>
                                    {Icon ? <Icon className="h-4 w-4" /> : getOptionLabel(key, question.language)}
                                </div>
                                <span className="text-[13px] flex-grow font-medium">
                                    {value}
                                </span>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* True/False Options */}
            {isTrueFalse && (
                <div className="flex gap-4 mb-6">
                    {['True', 'False'].map(opt => {
                        const isCorrectAnswer = question.correctAnswer?.toLowerCase() === opt.toLowerCase();
                        let containerClasses = "bg-white border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300";
                        let Icon = null;

                        if (!testMode) {
                            if (isCorrectAnswer) {
                                containerClasses = "bg-green-50 border-green-500 text-green-800 dark:bg-green-900/20 dark:border-green-500/50 dark:text-green-400";
                                Icon = CheckCircle2;
                            }
                        } else {
                            if (selectedOption || showAnswer) {
                                if (isCorrectAnswer) {
                                    containerClasses = "bg-green-50 border-green-500 text-green-800 dark:bg-green-900/20 dark:border-green-500/50 dark:text-green-400";
                                    Icon = CheckCircle2;
                                } else if (selectedOption?.toLowerCase() === opt.toLowerCase()) {
                                    containerClasses = "bg-red-50 border-red-500 text-red-800 dark:bg-red-900/20 dark:border-red-500/50 dark:text-red-400";
                                    Icon = XCircle;
                                } else {
                                    containerClasses = "bg-white border-slate-200 opacity-60 dark:bg-slate-900 dark:border-slate-800";
                                }
                            } else {
                                containerClasses = "bg-white border-slate-200 hover:border-[#107c41] hover:bg-green-50 dark:bg-slate-900 dark:border-slate-700 dark:hover:border-green-500/50 dark:hover:bg-green-900/20 cursor-pointer";
                            }
                        }

                        return (
                            <div 
                                key={opt} 
                                className={cn("flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 font-bold text-lg transition-all", containerClasses)}
                                onClick={() => handleOptionClick(opt)}
                            >
                                {Icon && <Icon className="h-6 w-6" />}
                                {opt}
                            </div>
                        );
                    })}
                </div>
            )}


            {/* Matching Pairs */}
            {isMatching && displayMatchingPairs.length > 0 && (
                <div className="mb-6 mx-2 md:mx-6">
                    <InteractiveMatching 
                        pairs={displayMatchingPairs}
                        testMode={testMode}
                        showAnswer={showAnswer}
                        onAttempt={(isCorrect) => {
                            if (user && testMode) {
                                setShowAnswer(true);
                                recordQuestionAttempt(user.uid, question.id, "MATCHING_ATTEMPT", isCorrect).catch(console.error);
                            }
                        }}
                    />
                </div>
            )}

            {/* Tags moved to top row */}


            {/* Footer Actions */}
            {isListView ? (
                <div className="flex w-full items-center justify-evenly pt-3 border-t border-slate-100 dark:border-slate-800 mt-1 print-hidden-actions text-slate-500 dark:text-slate-400 font-medium">
                    <button onClick={() => handleInteract('like')} className={cn("flex flex-1 justify-center items-center gap-1.5 hover:text-[#107c41] transition-colors py-1", interaction.isLiked && "text-[#107c41]")}>
                        <Heart className={cn("h-4 w-4", interaction.isLiked && "fill-current")} />
                        <span className="text-sm">{counts.likes > 0 ? counts.likes : 'Like'}</span>
                    </button>
                    
                    <button onClick={() => handleInteract('bookmark')} className={cn("flex flex-1 justify-center items-center gap-1.5 hover:text-yellow-500 transition-colors py-1", interaction.isBookmarked && "text-yellow-500")}>
                        <Bookmark className={cn("h-4 w-4", interaction.isBookmarked && "fill-current")} />
                        <span className="text-sm">{counts.bookmarks > 0 ? counts.bookmarks : 'Save'}</span>
                    </button>

                    <button onClick={handleRevealAnswer} className={cn("flex flex-1 justify-center items-center gap-1.5 hover:text-indigo-500 transition-colors py-1", showAnswer && "text-indigo-500")} title="Reveal Answer">
                        <Eye className={cn("h-4 w-4", showAnswer && "fill-current")} />
                        <span className="text-sm">Answer</span>
                    </button>

                    <button onClick={handleCopyLink} className="flex flex-1 justify-center items-center gap-1.5 hover:text-blue-500 transition-colors py-1" title="Share Question">
                        <Share2 className="h-4 w-4" />
                        <span className="text-sm">Share</span>
                    </button>
                </div>
            ) : (
                <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 mt-1 print-hidden-actions text-slate-500 dark:text-slate-400 font-medium">
                    
                    <div className="flex items-center gap-5">
                        <button onClick={() => handleInteract('like')} className={cn("flex items-center gap-1.5 hover:text-[#107c41] transition-colors", interaction.isLiked && "text-[#107c41]")}>
                            <Heart className={cn("h-4 w-4", interaction.isLiked && "fill-current")} />
                            <span className="text-sm">{counts.likes > 0 ? counts.likes : 'Like'}</span>
                        </button>
                        <button onClick={() => handleInteract('dislike')} className={cn("flex items-center gap-1.5 hover:text-red-500 transition-colors", interaction.isDisliked && "text-red-500")}>
                            <ThumbsDown className={cn("h-4 w-4", interaction.isDisliked && "fill-current")} />
                        </button>
                        <button onClick={() => handleInteract('bookmark')} className={cn("flex items-center gap-1.5 hover:text-yellow-500 transition-colors", interaction.isBookmarked && "text-yellow-500")}>
                            <Bookmark className={cn("h-4 w-4", interaction.isBookmarked && "fill-current")} />
                            <span className="text-sm">{counts.bookmarks > 0 ? counts.bookmarks : 'Save'}</span>
                        </button>
                    </div>
                    
                    <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
                    
                    <div className="flex items-center gap-4">
                        <button onClick={handleCopyLink} className="flex items-center hover:text-blue-500 transition-colors" title="Copy Link">
                            <LinkIcon className="h-4 w-4" />
                        </button>
                        <button onClick={() => toast({ title: 'Reported', description: 'Thank you for reporting this question.' })} className="flex items-center hover:text-red-500 transition-colors" title="Report Issue">
                            <Flag className="h-4 w-4" />
                        </button>
                        <div className="flex items-center gap-1.5 ml-1" title="Views">
                            <Eye className="h-4 w-4" />
                            <span className="text-sm">{counts.views}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Descriptive Answer Section */}
            {isDescriptive && showAnswer && question.correctAnswer && (
                <div className="mt-4 mb-2 p-4 rounded-xl bg-green-50/50 dark:bg-green-900/10 !text-[0.8rem] text-slate-700 dark:text-slate-300 !leading-snug animate-in fade-in slide-in-from-top-2 duration-300 border border-green-100 dark:border-green-800/30">
                    <div className="font-bold text-green-900 dark:text-green-300 flex items-center gap-1.5 mb-2 border-b border-green-200/50 dark:border-green-800/50 pb-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        {isDetailView ? <h2 className="text-base m-0">Answer</h2> : "Answer"}
                    </div>
                    <div className="prose dark:prose-invert max-w-none opacity-90 !text-[0.85rem] prose-p:!text-[0.85rem] prose-p:!my-1 prose-headings:!text-[0.95rem] prose-headings:!my-1.5 prose-li:!text-[0.85rem] prose-li:!my-0.5" dangerouslySetInnerHTML={{ __html: question.correctAnswer }} />
                </div>
            )}

            {/* Explanation Section */}
            {!isDescriptive && showAnswer && question.explanation && (
                <div className="mt-4 mb-2 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 !text-[0.8rem] text-slate-700 dark:text-slate-300 !leading-snug animate-in fade-in slide-in-from-top-2 duration-300 border border-blue-100 dark:border-blue-800/30">
                    <div className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5 mb-2 border-b border-blue-200/50 dark:border-blue-800/50 pb-2">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        {isDetailView ? <h2 className="text-base m-0">Explanation</h2> : "Explanation"}
                    </div>
                    <div className="prose dark:prose-invert max-w-none opacity-90 !text-[0.8rem] prose-p:!text-[0.8rem] prose-p:!my-0.5 prose-headings:!text-[0.85rem] prose-headings:!my-1 prose-li:!text-[0.8rem] prose-li:!my-0" dangerouslySetInnerHTML={{ __html: question.explanation }} />
                </div>
            )}



            {/* QA Card */}
            {question.isVerified && (
                <div className="mt-4 p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/50 text-sm">
                    <div className="font-semibold text-indigo-900 dark:text-indigo-200 mb-3 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-indigo-500" />
                        Quality Assurance
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                        {question.qaChecklist?.map((item: string) => (
                            <div key={item} className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-xs">
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                                {item}
                            </div>
                        ))}
                    </div>
                    
                    <div className="pt-3 border-t border-indigo-100 dark:border-indigo-900/50 grid grid-cols-2 gap-4 text-xs">
                        <div>
                            <span className="text-slate-500 block mb-0.5">Verified by:</span>
                            <span className="font-medium text-slate-800 dark:text-slate-200">{question.verifiedByName || 'Expert Team'}</span>
                            {question.verifiedDesignation && <span className="block text-slate-500">{question.verifiedDesignation}</span>}
                        </div>
                        {question.verifiedAt && (
                            <div>
                                <span className="text-slate-500 block mb-0.5">Last Verified:</span>
                                <span className="font-medium text-slate-800 dark:text-slate-200">
                                    {new Date(question.verifiedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <AuthModal open={showLoginModal} onOpenChange={setShowLoginModal} />
        </div>
    );
}
