'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';
import { X, ChevronLeft, ChevronRight, Play, Settings, Check, Clock, Pen, Trash2 } from 'lucide-react';

const bnOptionsMap: Record<string, string> = {
    a: 'ক',
    b: 'খ',
    c: 'গ',
    d: 'ঘ',
    e: 'ঙ'
};

const remarkPluginsList = [remarkGfm, remarkMath];
const rehypePluginsList = [rehypeKatex, rehypeRaw];

interface PresentationOverlayProps {
    questions: any[];
    classLine: string;
    chapterName?: string;
    topicName?: string;
}

export default function PresentationOverlay({ questions, classLine, chapterName, topicName }: PresentationOverlayProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [step, setStep] = useState(0); // 0: Question, 1: Show Answer, 2: Show Explanation
    const [qFontScale, setQFontScale] = useState(1);
    const [optFontScale, setOptFontScale] = useState(1);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [mode, setMode] = useState<'test' | 'read'>('test');
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isTimerEnabled, setIsTimerEnabled] = useState(true);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [wmOpacity, setWmOpacity] = useState(40);
    const [wmSize, setWmSize] = useState(70);
    const [wmVisible, setWmVisible] = useState(true);
    const [optionsLayout, setOptionsLayout] = useState<'grid' | 'list'>('grid');

    const [isExpEnabled, setIsExpEnabled] = useState(true);
    const [isOptionExpEnabled, setIsOptionExpEnabled] = useState(true);
    const [expFontScale, setExpFontScale] = useState(1);

    const [timerPos, setTimerPos] = useState({ x: 0, y: 0 });
    const [isDraggingTimer, setIsDraggingTimer] = useState(false);
    const dragStartPos = useRef({ x: 0, y: 0 });

    // Pen Tool State
    const [isPenActive, setIsPenActive] = useState(false);
    const [penColor, setPenColor] = useState('#ef4444');
    const [penSize, setPenSize] = useState(4);
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const isDrawing = useRef(false);
    const lastPos = useRef({ x: 0, y: 0 });

    // Initialize Canvas
    useEffect(() => {
        if (!isOpen) return;

        const resizeCanvas = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const newWidth = canvas.offsetWidth;
            const newHeight = canvas.offsetHeight;
            
            // If the new dimensions are zero, don't set them, just return
            if (newWidth === 0 || newHeight === 0) return;

            if (canvas.width !== newWidth || canvas.height !== newHeight) {
                // If the new dimensions are zero, don't set them, just return
                if (newWidth === 0 || newHeight === 0) return;

                canvas.width = newWidth;
                canvas.height = newHeight;
                const context = canvas.getContext('2d');
                if (context) {
                    context.lineCap = 'round';
                    context.lineJoin = 'round';
                    contextRef.current = context;
                }
            }
        };

        // Call multiple times to ensure we catch the final size after any CSS transitions
        resizeCanvas();
        const t1 = setTimeout(resizeCanvas, 100);
        const t2 = setTimeout(resizeCanvas, 300);
        const t3 = setTimeout(resizeCanvas, 600);
        
        window.addEventListener('resize', resizeCanvas);
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, [isOpen]);

    const clearCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const context = contextRef.current;
        if (canvas && context) {
            context.clearRect(0, 0, canvas.width, canvas.height);
        }
    }, []);

    useEffect(() => {
        clearCanvas();
    }, [currentSlide, clearCanvas]);

    const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    // Drawing Handlers
    const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isPenActive) return;
        
        isDrawing.current = true;
        try {
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
        } catch (err) {}

        const { x, y } = getCoordinates(e);

        lastPos.current = { x, y };
        
        // Draw a dot on click
        const ctx = contextRef.current;
        if (ctx) {
            ctx.beginPath();
            ctx.arc(x, y, penSize / 2, 0, Math.PI * 2);
            ctx.fillStyle = penColor;
            ctx.fill();
        }
    };

    const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDrawing.current || !isPenActive) return;
        
        const ctx = contextRef.current;
        if (!ctx) return;

        const { x, y } = getCoordinates(e);

        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(x, y);
        ctx.strokeStyle = penColor;
        ctx.lineWidth = penSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        lastPos.current = { x, y };
    };

    const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDrawing.current) return;
        
        if (contextRef.current) {
            contextRef.current.closePath();
        }
        isDrawing.current = false;
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    };

    const handleTimerPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        setIsDraggingTimer(true);
        dragStartPos.current = { x: e.clientX - timerPos.x, y: e.clientY - timerPos.y };
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handleTimerPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDraggingTimer) return;
        setTimerPos({
            x: e.clientX - dragStartPos.current.x,
            y: e.clientY - dragStartPos.current.y
        });
    };

    const handleTimerPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        setIsDraggingTimer(false);
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    };
    const openPresentation = () => {
        setIsOpen(true);
        setCurrentSlide(0);
        setStep(mode === 'read' ? 2 : 0);
        setSelectedOption(null);
        document.body.style.overflow = 'hidden';
    };

    const closePresentation = useCallback(() => {
        setIsOpen(false);
        document.body.style.overflow = '';
    }, []);

    const nextStep = useCallback(() => {
        if (mode === 'read') {
            if (currentSlide < questions.length - 1) {
                setCurrentSlide(currentSlide + 1);
                setStep(2);
                setSelectedOption(null);
            }
        } else {
            if (step < 2) {
                setStep(step + 1);
            } else if (currentSlide < questions.length - 1) {
                setCurrentSlide(currentSlide + 1);
                setStep(0);
                setSelectedOption(null);
            }
        }
    }, [step, currentSlide, questions.length, mode]);

    const prevStep = useCallback(() => {
        if (mode === 'read') {
            if (currentSlide > 0) {
                setCurrentSlide(currentSlide - 1);
                setStep(2);
                setSelectedOption(null);
            }
        } else {
            if (step > 0) {
                setStep(step - 1);
            } else if (currentSlide > 0) {
                setCurrentSlide(currentSlide - 1);
                setStep(2);
                setSelectedOption(null);
            }
        }
    }, [step, currentSlide, mode]);

    useEffect(() => {
        if (mode === 'read') {
            setStep(2);
        } else {
            setStep(0);
        }
    }, [mode]);

    useEffect(() => {
        setTimerSeconds(0);
    }, [currentSlide]);

    useEffect(() => {
        if (!isOpen || !isTimerEnabled || step >= 1) return;

        const interval = setInterval(() => {
            setTimerSeconds(s => s + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [isOpen, isTimerEnabled, step, currentSlide]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if (e.key === 'Escape') {
                if (isSettingsOpen) {
                    setIsSettingsOpen(false);
                } else {
                    closePresentation();
                }
                return;
            }

            if (e.key.toLowerCase() === 's') {
                setIsSettingsOpen(prev => !prev);
                return;
            }

            if (e.key.toLowerCase() === 't') {
                setIsTimerEnabled(prev => !prev);
                return;
            }

            if (e.key.toLowerCase() === 'm') {
                setMode(prev => prev === 'test' ? 'read' : 'test');
                return;
            }

            if (e.key.toLowerCase() === 'q') {
                setQFontScale(s => Math.max(0.6, s - 0.1));
                return;
            }
            if (e.key.toLowerCase() === 'w') {
                setQFontScale(s => Math.min(2.0, s + 0.1));
                return;
            }
            if (e.key.toLowerCase() === 'o') {
                setOptFontScale(s => Math.max(0.6, s - 0.1));
                return;
            }
            if (e.key.toLowerCase() === 'p') {
                setOptFontScale(s => Math.min(2.0, s + 0.1));
                return;
            }

            if (e.key.toLowerCase() === 'l') {
                setOptionsLayout('list');
                return;
            }

            if (e.key.toLowerCase() === 'g') {
                setOptionsLayout('grid');
                return;
            }

            if (!isSettingsOpen) {
                if (e.key === 'ArrowRight' || e.key === ' ') {
                    e.preventDefault();
                    nextStep();
                }
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    prevStep();
                }
                if (step === 0) {
                    const key = e.key.toLowerCase();
                    if (['a', 'b', 'c', 'd', 'e'].includes(key)) {
                        const currentQ = questions[currentSlide];
                        if (currentQ && currentQ.options && currentQ.options[key as keyof typeof currentQ.options]) {
                            setSelectedOption(key);
                            setStep(1);
                        }
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, closePresentation, nextStep, prevStep, isSettingsOpen, step, currentSlide, questions]);

    if (!isOpen) {
        return (
            <button
                onClick={openPresentation}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg mt-6"
            >
                <Play className="w-5 h-5 fill-current" />
                Start Presentation
            </button>
        );
    }

    const q = questions[currentSlide];

    if (typeof window === 'undefined') return null;

    return createPortal(
        <div className="fixed inset-0 z-[99999] bg-[#f8fbff] flex items-center justify-center select-none font-sans overflow-hidden">
            <style>{`
                @keyframes popIn {
                    0% { transform: scale(1); box-shadow: 0 0 0 rgba(52,168,83,0); }
                    50% { transform: scale(1.05); box-shadow: 0 0 40px rgba(52,168,83,0.6); }
                    100% { transform: scale(1.03); box-shadow: 0 0 30px rgba(52,168,83,0.5); }
                }
                .animate-pop-in {
                    animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
            `}</style>
            
            {/* Left Banner Area */}
            <div className="hidden lg:flex flex-1 h-full flex-col items-center justify-between bg-gradient-to-b from-[#0a192f] via-[#0b2244] to-[#041128] relative z-0 overflow-hidden font-sans shadow-[inset_-10px_0_20px_rgba(0,0,0,0.3)] border-r border-[#1a3f7c]">
                 
                 {/* Floating Elements Background */}
                 <div className="absolute top-[5%] left-[25%] w-20 h-20 rounded-full border border-blue-400/20 bg-blue-500/10 blur-[8px]"></div>
                 <div className="absolute top-[20%] right-[15%] w-10 h-10 rounded-full border border-yellow-300/30 bg-transparent blur-[2px]"></div>
                 <div className="absolute top-[45%] left-[-10%] w-40 h-40 rounded-full bg-blue-600/10 blur-[50px]"></div>
                 <div className="absolute bottom-[30%] right-[-5%] w-32 h-32 rounded-full bg-blue-400/10 blur-[40px]"></div>
                 
                 {/* Top Logo */}
                 <div className="flex flex-col items-center justify-center w-full px-4 pt-10 xl:pt-12 z-10">
                      <div className="flex items-center justify-center mb-8">
                          <div className="bg-white p-2 xl:p-2.5 rounded-xl xl:rounded-2xl shadow-lg">
                              <img src="/image/logo.png" alt="DeshExam Academy" className="h-10 xl:h-[3rem] w-auto object-contain" />
                          </div>
                      </div>
                      
                      {/* Text Section */}
                      <div className="text-center font-bold tracking-wide mt-2">
                          <h3 className="text-[1.65rem] xl:text-[2rem] text-white mb-3 leading-tight drop-shadow-md">সঠিক প্রস্তুতি,</h3>
                          <h3 className="text-[1.65rem] xl:text-[2rem] text-white leading-tight drop-shadow-md">
                              <span className="text-[#FFB800]">সফলতা</span> চাবিকাঠি!
                          </h3>
                      </div>
                 </div>

                 {/* Middle Illustration Placeholder */}
                 <div className="flex items-center justify-center text-[3.5rem] xl:text-[4.5rem] gap-3 xl:gap-5 z-10 w-full drop-shadow-2xl opacity-95 my-6 relative">
                     <div className="absolute inset-0 bg-blue-400/10 blur-[40px] rounded-full"></div>
                     🏆 📚 🎓 📜
                 </div>

                 {/* Features List Box */}
                 <div className="flex flex-col z-10 w-full px-6 xl:px-10 mb-4">
                      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 xl:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                          <div className="flex flex-col space-y-3.5 xl:space-y-4">
                              {[
                                  'Mock Tests',
                                  'Chapter-wise Practice',
                                  'Previous Year Questions',
                                  'Smart Analytics',
                                  'AI Performance Report'
                              ].map((feature, idx) => (
                                  <div key={idx} className="flex items-center gap-3">
                                      <svg className="w-5 h-5 xl:w-[22px] xl:h-[22px] text-[#FFB800] shrink-0 drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                          <polyline points="20 6 9 17 4 12"></polyline>
                                      </svg>
                                      <span className="text-gray-100 text-[14px] xl:text-[16px] font-semibold tracking-wide drop-shadow-sm">{feature}</span>
                                  </div>
                              ))}
                          </div>
                      </div>
                 </div>

                 {/* Join Button */}
                 <div className="w-full px-8 xl:px-12 pb-10 xl:pb-14 z-10">
                      <button className="w-full flex flex-col items-center justify-center py-3 xl:py-3.5 bg-gradient-to-b from-[#2178ff] to-[#0a4bb8] border border-blue-400/50 rounded-full shadow-[0_8px_20px_rgba(10,75,184,0.4)] hover:from-[#2e82ff] hover:to-[#1155c9] transition-all duration-300 group">
                          <span className="text-white font-bold text-lg xl:text-[20px] mb-0.5 drop-shadow-md group-hover:scale-105 transition-transform duration-300">Practice Today</span>
                      </button>
                      <div className="text-center mt-3">
                          <span className="text-gray-300/80 text-xs xl:text-[13px] font-medium tracking-wide">Success Starts Here</span>
                      </div>
                 </div>
            </div>

            {/* Dynamic Responsive Font Styles */}
            <style dangerouslySetInnerHTML={{ __html: `
                .responsive-fonts {
                    --q-size: ${20 * qFontScale}px;
                    --opt-size: ${16 * optFontScale}px;
                    --exp-size: ${15 * expFontScale}px;
                }
                @media (min-width: 768px) {
                    .responsive-fonts {
                        --q-size: ${28 * qFontScale}px;
                        --opt-size: ${20 * optFontScale}px;
                        --exp-size: ${18 * expFontScale}px;
                    }
                }
                @media (min-width: 1024px) {
                    .responsive-fonts {
                        --q-size: ${38 * qFontScale}px;
                        --opt-size: ${30 * optFontScale}px;
                        --exp-size: ${24 * expFontScale}px;
                    }
                }
            ` }} />

            {/* Main Presentation Area */}
            <div className="responsive-fonts relative w-full h-full lg:max-w-[177.78vh] lg:max-h-[56.25vw] bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#f8fafc] flex flex-col shadow-2xl overflow-hidden shrink-0 z-10">

                {/* Drawing Canvas */}
                <canvas
                    ref={canvasRef}
                    className={`absolute inset-0 w-full h-full z-20 touch-none ${isPenActive ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none'}`}
                    onPointerDown={startDrawing}
                    onPointerMove={draw}
                    onPointerUp={stopDrawing}
                    onPointerCancel={stopDrawing}
                    onPointerOut={stopDrawing}
                />

                {/* Background Decorations */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    {/* Soft glowing mesh gradients */}
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-200/30 blur-[100px]"></div>
                    <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-pink-200/30 blur-[100px]"></div>
                    <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-purple-200/30 blur-[80px]"></div>
                    
                    {/* Dot Pattern */}
                    <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(rgba(99, 102, 241, 0.06) 2px, transparent 2px)', backgroundSize: '32px 32px', opacity: 0.8 }}></div>
                    
                    {/* Clean geometric lines */}
                    <div className="absolute top-[15%] right-[-5%] w-72 h-72 rounded-full border-[1px] border-indigo-200/40 opacity-60"></div>
                    <div className="absolute top-[18%] right-[-2%] w-56 h-56 rounded-full border-[1px] border-purple-200/40 opacity-60"></div>
                    <div className="absolute bottom-[20%] left-[5%] w-48 h-48 rounded-full border-[1px] border-pink-200/40 opacity-60"></div>
                    {/* Watermark removed from here, moved to foreground */}
                </div>

                {/* Background Watermarks */}
                {wmVisible && (
                    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
                        <div 
                            className="absolute top-[75%] left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[8deg] font-black tracking-widest uppercase transition-all duration-300"
                            style={{ 
                                fontSize: `${wmSize}px`, 
                                color: `rgba(229, 231, 235, ${wmOpacity / 100})` 
                            }}
                        >
                            DESHEXAM
                        </div>
                        <div 
                            className="absolute top-[25%] right-[10%] -translate-y-1/2 -rotate-[8deg] font-black tracking-widest uppercase transition-all duration-300"
                            style={{ 
                                fontSize: `${wmSize * 1.15}px`, 
                                color: `rgba(229, 231, 235, ${(wmOpacity * 0.8) / 100})` 
                            }}
                        >
                            DESHEXAM
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="shrink-0 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-indigo-100 py-3 px-4 md:pl-6 md:pr-8 flex flex-col md:flex-row justify-between items-center w-full z-30 shadow-sm gap-3 md:gap-0 relative">
                    {/* Logo Area */}
                    <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto justify-between md:justify-start">
                        <div className="flex items-center gap-2 md:gap-3 px-1">
                            <img src="/image/logo.png" alt="DeshExam" className="h-8 md:h-9 w-auto object-contain drop-shadow-sm" />
                            <div className="flex flex-col">
                                <span className="font-extrabold text-sm md:text-lg text-indigo-950 leading-none">Desh Exam Academy</span>
                                <span className="text-[9px] md:text-[10px] text-indigo-800/70 font-bold tracking-wide mt-1 uppercase">Learn • Practice • Succeed</span>
                            </div>
                        </div>
                        {/* Mobile Close Button & Badge */}
                        <div className="flex items-center gap-2 md:hidden">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1 rounded-full font-bold text-xs tracking-wider shadow-md">
                                MOCK TEST
                            </div>
                            <button onClick={closePresentation} className="p-1.5 bg-white/60 hover:bg-white rounded-full text-indigo-600 shadow-sm transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    {/* Title Area */}
                    <div className="flex-1 text-center w-full mt-1 md:mt-0 px-2 md:px-6">
                        <h1 className="text-base md:text-2xl font-extrabold text-indigo-950 tracking-tight line-clamp-1 md:line-clamp-none">{classLine}</h1>
                        {(chapterName || topicName) && (
                            <div className="text-xs md:text-sm text-indigo-800 font-semibold mt-1.5 tracking-wide uppercase">
                                {[chapterName, topicName].filter(Boolean).join(' | ')}
                            </div>
                        )}
                    </div>
                    {/* Badge Area (Desktop) */}
                    <div className="hidden md:flex items-center gap-4">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-2 rounded-full font-bold text-lg tracking-wider shadow-md">
                            MOCK TEST
                        </div>
                        <button onClick={closePresentation} className="p-2.5 bg-white/60 hover:bg-white rounded-full text-indigo-600 shadow-sm transition-all" title="Close Presentation">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 w-full relative flex flex-col items-center px-4 md:px-24 py-6 md:py-12 z-10 overflow-y-auto custom-scrollbar gap-8">

                    {/* Timer */}
                    {isTimerEnabled && (
                        <div 
                            className={`absolute top-6 right-10 bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-2 flex items-center gap-2 text-gray-700 font-bold font-mono text-2xl animate-in fade-in zoom-in duration-300 z-50 select-none ${isDraggingTimer ? 'cursor-grabbing scale-105 shadow-md' : 'cursor-grab'}`}
                            style={{ transform: `translate(${timerPos.x}px, ${timerPos.y}px)` }}
                            onPointerDown={handleTimerPointerDown}
                            onPointerMove={handleTimerPointerMove}
                            onPointerUp={handleTimerPointerUp}
                            onPointerCancel={handleTimerPointerUp}
                        >
                            <Clock className="w-6 h-6 text-blue-500 pointer-events-none" />
                            <span className={`pointer-events-none ${step >= 1 ? "text-gray-400" : "text-gray-800"}`}>
                                {String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:{String(timerSeconds % 60).padStart(2, '0')}
                            </span>
                        </div>
                    )}

                    {/* Question */}
                    <div className="flex items-start gap-3 md:gap-4 w-full max-w-5xl mt-8 md:mt-4">
                        <span className="text-black font-extrabold leading-normal shrink-0" style={{ fontSize: 'var(--q-size)' }}>Q{currentSlide + 1}.</span>
                        <div className="prose prose-black max-w-none prose-p:font-extrabold text-[length:var(--q-size)] leading-normal text-left text-black font-extrabold [&_*]:!text-[length:var(--q-size)] [&_*]:!leading-normal [&_*]:!m-0 capitalize">
                            <ReactMarkdown remarkPlugins={remarkPluginsList} rehypePlugins={rehypePluginsList}>
                                {q.questionText}
                            </ReactMarkdown>
                        </div>
                    </div>

                    {/* Options */}
                    <div className={optionsLayout === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 w-full max-w-6xl mt-2" : "flex flex-col gap-y-4 md:gap-y-5 w-[90%] md:w-fit md:min-w-[500px] max-w-5xl mt-2 mx-auto"}>
                        {q.options && [
                            { key: 'a', text: q.options.a },
                            { key: 'b', text: q.options.b },
                            { key: 'c', text: q.options.c },
                            { key: 'd', text: q.options.d },
                            ...(q.options.e ? [{ key: 'e', text: q.options.e }] : [])
                        ].map((opt, oIdx) => {
                            const isCorrect = q.correctAnswer && q.correctAnswer.toLowerCase().includes(opt.key);
                            const optLetter = q.language === 'Bangla' || !q.language ? bnOptionsMap[opt.key] : opt.key.toUpperCase();

                            const showCorrect = step >= 1 && isCorrect;
                            const showWrong = step >= 1 && !isCorrect;
                            const isSelected = selectedOption === opt.key;

                            // Colors closely matching the image
                            const colorThemes = [
                                { border: 'border-[#4285F4]', bg: 'bg-white', letterBg: 'bg-[#4285F4]', letterText: 'text-white' }, // Blue
                                { border: 'border-[#34A853]', bg: 'bg-white', letterBg: 'bg-[#34A853]', letterText: 'text-white' }, // Green
                                { border: 'border-[#F9AB00]', bg: 'bg-white', letterBg: 'bg-[#F9AB00]', letterText: 'text-white' }, // Yellow/Orange
                                { border: 'border-[#EA4335]', bg: 'bg-white', letterBg: 'bg-[#EA4335]', letterText: 'text-white' }, // Red
                                { border: 'border-[#9C27B0]', bg: 'bg-white', letterBg: 'bg-[#9C27B0]', letterText: 'text-white' }, // Purple
                            ];

                            const theme = colorThemes[oIdx % colorThemes.length];

                            let containerClasses = `flex items-center gap-3 md:gap-4 py-2 px-3 rounded-2xl border-2 transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.04)] ${theme.bg} ${theme.border}`;
                            let letterClasses = `shrink-0 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full text-lg md:text-xl font-black transition-colors duration-300 ${theme.letterBg} ${theme.letterText}`;

                            if (step === 0) {
                                if (isSelected) {
                                    containerClasses = `flex items-center gap-3 md:gap-4 py-2 px-3 rounded-2xl border-2 transition-all duration-300 shadow-[0_8px_20px_rgba(66,133,244,0.15)] bg-[#e8f0fe] border-[#4285F4] transform scale-[1.02] cursor-pointer ring-2 ring-[#4285F4]/30`;
                                    letterClasses = `shrink-0 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full text-lg md:text-xl font-black transition-colors duration-300 bg-[#4285F4] text-white`;
                                } else {
                                    containerClasses += ` hover:scale-[1.01] hover:shadow-md cursor-pointer hover:border-gray-300`;
                                }
                            } else {
                                if (showCorrect) {
                                    containerClasses = `flex items-center gap-3 md:gap-4 py-2 px-3 rounded-2xl border-2 ring-4 ring-[#34A853]/30 bg-[#f0fdf4] border-[#34A853] z-10 relative animate-pop-in`;
                                    letterClasses = `shrink-0 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full text-lg md:text-xl font-black transition-colors duration-300 bg-[#34A853] text-white`;
                                } else if (showWrong && isSelected) {
                                    containerClasses = `flex items-center gap-3 md:gap-4 py-2 px-3 rounded-2xl border-2 transition-all duration-300 shadow-[0_8px_20px_rgba(234,67,53,0.15)] bg-[#fce8e6] border-[#EA4335] transform scale-[1.02]`;
                                    letterClasses = `shrink-0 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full text-lg md:text-xl font-black transition-colors duration-300 bg-[#EA4335] text-white`;
                                } else if (showWrong) {
                                    containerClasses = `flex items-center gap-3 md:gap-4 py-2 px-3 rounded-2xl border-2 transition-all duration-300 shadow-sm bg-white border-gray-200 opacity-60`;
                                    // letterClasses keeps its default theme color
                                }
                            }
                            return (
                                <div
                                    key={opt.key}
                                    className="flex flex-col gap-2 w-full"
                                >
                                    <div
                                        className={containerClasses}
                                        onClick={() => {
                                        if (step === 0) {
                                            setSelectedOption(opt.key);
                                            setStep(1);
                                        }
                                    }}
                                >
                                    <div className={letterClasses}>
                                        {optLetter}
                                    </div>
                                    <div className="prose max-w-none text-black [&>p]:m-0 [&>p]:text-[length:var(--opt-size)] [&>p]:font-semibold [&>p]:leading-snug flex-1 capitalize">
                                        <ReactMarkdown remarkPlugins={remarkPluginsList} rehypePlugins={rehypePluginsList}>
                                            {opt.text}
                                        </ReactMarkdown>
                                    </div>

                                    {step >= 1 && showCorrect && (
                                        <div className="shrink-0 text-white bg-[#34A853] rounded-full p-1.5 shadow-sm">
                                            <Check className="w-7 h-7 stroke-[3]" />
                                        </div>
                                    )}
                                    {step >= 1 && showWrong && isSelected && (
                                        <div className="shrink-0 text-white bg-[#EA4335] rounded-full p-1.5 shadow-sm">
                                            <X className="w-7 h-7 stroke-[3]" />
                                        </div>
                                    )}
                                    </div>
                                    
                                    {/* Option Explanation */}
                                    {step >= 2 && isOptionExpEnabled && q.optionExplanations?.[opt.key] && (
                                        <div 
                                            className="ml-4 mt-2 pl-4 pr-4 py-2 text-gray-700 bg-gray-50/90 rounded-xl border-l-4 border-l-[#4285F4] shadow-sm animate-in fade-in duration-500 prose max-w-none [&>p]:m-0"
                                            style={{ fontSize: 'var(--exp-size)' }}
                                        >
                                            <ReactMarkdown remarkPlugins={remarkPluginsList} rehypePlugins={rehypePluginsList}>
                                                {q.optionExplanations[opt.key]}
                                            </ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Explanation */}
                    {step >= 2 && q.explanation && isExpEnabled && (
                        <div className="w-full max-w-5xl mt-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xl relative overflow-hidden">
                                {/* Small colored accent line on the left */}
                                <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#34A853]"></div>

                                <div className="text-[#34A853] font-bold text-xl mb-3 flex items-center gap-2 pl-4">
                                    <span className="text-2xl">💡</span>
                                    Explanation
                                </div>
                                <div 
                                    className="prose prose-xl max-w-none text-gray-800 pl-4 font-medium"
                                    style={{ fontSize: 'var(--exp-size)' }}
                                >
                                    <ReactMarkdown remarkPlugins={remarkPluginsList} rehypePlugins={rehypePluginsList}>
                                        {q.explanation}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="shrink-0 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-t border-indigo-100 py-4 px-4 md:pl-12 md:pr-8 flex justify-between items-center w-full z-30 shadow-[0_-2px_10px_rgba(0,0,0,0.02)] relative">
                    <div className="flex items-center text-indigo-900/70 font-semibold text-sm md:text-lg">
                        © DeshExam
                    </div>
                    <div className="hidden md:flex items-center text-indigo-900/70 font-semibold text-lg tracking-wide">
                        www.deshexam.com
                    </div>

                    <div className="flex items-center gap-4 md:gap-8">
                        {/* Pen Tool */}
                        <div className="relative">
                            <button
                                onClick={() => setIsPenActive(!isPenActive)}
                                className={`p-3 rounded-full transition-all shadow-sm ${isPenActive ? 'bg-red-500 text-white ring-2 ring-red-300' : 'bg-white/60 hover:bg-white text-indigo-600'}`}
                                title="Toggle Pen Tool"
                            >
                                <Pen className="w-6 h-6" />
                            </button>
                            
                            {/* Pen Toolbar */}
                            {isPenActive && (
                                <div className="fixed bottom-[80px] left-1/2 -translate-x-1/2 md:absolute md:bottom-full md:left-auto md:-translate-x-0 md:right-0 md:mb-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 p-4 animate-in fade-in slide-in-from-bottom-2 z-50 flex flex-wrap items-center gap-3 md:gap-4 min-w-[280px] justify-center">
                                    <div className="flex gap-2 items-center border-r pr-3 border-gray-200">
                                        {['#ef4444', '#3b82f6', '#22c55e', '#facc15', '#000000'].map(c => (
                                            <button 
                                                key={c}
                                                onClick={() => setPenColor(c)}
                                                className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 ${penColor === c ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-110'} transition-all`}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                        <input 
                                            type="color" 
                                            value={penColor}
                                            onChange={e => setPenColor(e.target.value)}
                                            className="w-6 h-6 md:w-7 md:h-7 ml-1 cursor-pointer border-0 rounded overflow-hidden" 
                                            title="Custom Color"
                                        />
                                    </div>
                                    <div className="flex gap-2 items-center border-r pr-3 border-gray-200">
                                        <input 
                                            type="range" 
                                            min="2" 
                                            max="24" 
                                            value={penSize} 
                                            onChange={e => setPenSize(parseInt(e.target.value))}
                                            className="w-20 md:w-24 accent-blue-600"
                                            title="Pen Size"
                                        />
                                        <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0">
                                            <div className="bg-gray-800 rounded-full" style={{ width: Math.min(penSize, 16), height: Math.min(penSize, 16) }} />
                                        </div>
                                    </div>
                                    <button 
                                        onClick={clearCanvas}
                                        className="p-1.5 md:p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-semibold"
                                    >
                                        <Trash2 className="w-4 h-4 md:w-5 md:h-5" /> Clear
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Settings Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                className={`p-3 rounded-full transition-all shadow-sm ${isSettingsOpen ? 'bg-indigo-600 text-white ring-2 ring-indigo-300' : 'bg-white/60 hover:bg-white text-indigo-600'}`}
                                title="Display Settings"
                            >
                                <Settings className={`w-6 h-6 transition-transform duration-300 ${isSettingsOpen ? 'rotate-90' : ''}`} />
                            </button>

                            {isSettingsOpen && (
                                <div className="fixed bottom-[80px] left-1/2 -translate-x-1/2 md:absolute md:bottom-full md:left-auto md:right-0 md:translate-x-0 md:mb-4 bg-white border border-gray-200 rounded-2xl shadow-2xl p-5 w-[90vw] sm:w-80 z-50 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[70vh] md:max-h-[60vh]">
                                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100 shrink-0">
                                        <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                            <Settings className="w-5 h-5 text-gray-500" /> Settings
                                            <kbd className="ml-1 text-[10px] bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded text-gray-500 font-mono shadow-sm">S</kbd>
                                        </h3>
                                        <button onClick={() => setIsSettingsOpen(false)} className="p-1 text-gray-400 hover:bg-gray-100 rounded-full hover:text-gray-700 transition-colors">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="space-y-5 overflow-y-auto custom-scrollbar pr-2 pb-2">
                                        <div>
                                            <div className="text-sm font-bold text-gray-600 mb-2 flex justify-between items-center">
                                                Presentation Mode
                                                <kbd className="text-[10px] bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded text-gray-500 font-mono shadow-sm">M</kbd>
                                            </div>
                                            <div className="flex bg-gray-100 p-1 rounded-xl">
                                                <button
                                                    onClick={() => setMode('test')}
                                                    className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-colors ${mode === 'test' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                                >
                                                    Test Mode
                                                </button>
                                                <button
                                                    onClick={() => setMode('read')}
                                                    className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-colors ${mode === 'read' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                                >
                                                    Read Mode
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-sm font-bold text-gray-600 mb-2 flex justify-between items-center">
                                                Options Layout
                                            </div>
                                            <div className="flex bg-gray-100 p-1 rounded-xl">
                                                <button
                                                    onClick={() => setOptionsLayout('grid')}
                                                    className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-colors ${optionsLayout === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                                >
                                                    Grid
                                                </button>
                                                <button
                                                    onClick={() => setOptionsLayout('list')}
                                                    className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-colors ${optionsLayout === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                                >
                                                    List
                                                </button>
                                            </div>
                                        </div>

                                        <hr className="border-gray-100" />

                                        <div className="flex items-center justify-between">
                                            <div className="text-sm font-bold text-gray-600 flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-blue-500" />
                                                Question Timer
                                                <kbd className="ml-auto text-[10px] bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded text-gray-500 font-mono shadow-sm">T</kbd>
                                            </div>
                                            <button
                                                onClick={() => setIsTimerEnabled(!isTimerEnabled)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isTimerEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isTimerEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                        </div>

                                        <hr className="border-gray-100" />

                                        <div className="flex items-center justify-between">
                                            <div className="text-sm font-bold text-gray-600">
                                                Show Explanation
                                            </div>
                                            <button
                                                onClick={() => setIsExpEnabled(!isExpEnabled)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isExpEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isExpEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="text-sm font-bold text-gray-600">
                                                Show Options Explanation
                                            </div>
                                            <button
                                                onClick={() => setIsOptionExpEnabled(!isOptionExpEnabled)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isOptionExpEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isOptionExpEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                        </div>

                                        <hr className="border-gray-100" />

                                        <div>
                                            <div className="text-sm font-bold text-gray-600 mb-2 flex justify-between">
                                                <span>Question Font Size</span>
                                                <span className="text-blue-600 bg-blue-50 px-2 rounded text-xs py-0.5">{Math.round(qFontScale * 100)}%</span>
                                            </div>
                                            <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 w-full overflow-hidden shadow-inner">
                                                <button onClick={() => setQFontScale(s => Math.max(0.6, s - 0.1))} className="flex-1 py-2 flex justify-center items-center gap-2 text-gray-700 hover:bg-gray-200 font-bold border-r border-gray-200 transition-colors">
                                                    A- <kbd className="text-[10px] bg-white border border-gray-300 px-1.5 py-0.5 rounded text-gray-500 font-mono shadow-sm">Q</kbd>
                                                </button>
                                                <button onClick={() => setQFontScale(s => Math.min(2.0, s + 0.1))} className="flex-1 py-2 flex justify-center items-center gap-2 text-gray-700 hover:bg-gray-200 font-bold transition-colors">
                                                    A+ <kbd className="text-[10px] bg-white border border-gray-300 px-1.5 py-0.5 rounded text-gray-500 font-mono shadow-sm">W</kbd>
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-sm font-bold text-gray-600 mb-2 flex justify-between">
                                                <span>Options Font Size</span>
                                                <span className="text-green-600 bg-green-50 px-2 rounded text-xs py-0.5">{Math.round(optFontScale * 100)}%</span>
                                            </div>
                                            <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 w-full overflow-hidden shadow-inner">
                                                <button onClick={() => setOptFontScale(s => Math.max(0.6, s - 0.1))} className="flex-1 py-2 flex justify-center items-center gap-2 text-gray-700 hover:bg-gray-200 font-bold border-r border-gray-200 transition-colors">
                                                    A- <kbd className="text-[10px] bg-white border border-gray-300 px-1.5 py-0.5 rounded text-gray-500 font-mono shadow-sm">O</kbd>
                                                </button>
                                                <button onClick={() => setOptFontScale(s => Math.min(2.0, s + 0.1))} className="flex-1 py-2 flex justify-center items-center gap-2 text-gray-700 hover:bg-gray-200 font-bold transition-colors">
                                                    A+ <kbd className="text-[10px] bg-white border border-gray-300 px-1.5 py-0.5 rounded text-gray-500 font-mono shadow-sm">P</kbd>
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-sm font-bold text-gray-600 mb-2 flex justify-between">
                                                <span>Explanation Font Size</span>
                                                <span className="text-purple-600 bg-purple-50 px-2 rounded text-xs py-0.5">{Math.round(expFontScale * 100)}%</span>
                                            </div>
                                            <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 w-full overflow-hidden shadow-inner">
                                                <button onClick={() => setExpFontScale(s => Math.max(0.6, s - 0.1))} className="flex-1 py-2 flex justify-center items-center text-gray-700 hover:bg-gray-200 font-bold border-r border-gray-200 transition-colors">
                                                    A-
                                                </button>
                                                <button onClick={() => setExpFontScale(s => Math.min(2.0, s + 0.1))} className="flex-1 py-2 flex justify-center items-center text-gray-700 hover:bg-gray-200 font-bold transition-colors">
                                                    A+
                                                </button>
                                            </div>
                                        </div>

                                        <hr className="border-gray-100" />

                                        <div>
                                            <div className="text-sm font-bold text-gray-600 mb-3 flex items-center justify-between">
                                                <span>Watermark</span>
                                                <button onClick={() => setWmVisible(!wmVisible)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${wmVisible ? 'bg-blue-600' : 'bg-gray-300'}`}>
                                                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${wmVisible ? 'translate-x-5' : 'translate-x-1'}`} />
                                                </button>
                                            </div>
                                            {wmVisible && (
                                                <div className="space-y-4 bg-gray-50 p-3 rounded-xl border border-gray-100 shadow-inner">
                                                    <div>
                                                        <div className="flex justify-between text-xs font-semibold text-gray-500 mb-2">
                                                            <span>Size</span>
                                                            <span className="text-blue-600">{wmSize}px</span>
                                                        </div>
                                                        <input type="range" min="20" max="150" value={wmSize} onChange={(e) => setWmSize(Number(e.target.value))} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                                                    </div>
                                                    <div>
                                                        <div className="flex justify-between text-xs font-semibold text-gray-500 mb-2">
                                                            <span>Opacity</span>
                                                            <span className="text-blue-600">{wmOpacity}%</span>
                                                        </div>
                                                        <input type="range" min="5" max="100" value={wmOpacity} onChange={(e) => setWmOpacity(Number(e.target.value))} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="text-gray-700 font-semibold text-lg">
                            Page {String(currentSlide + 1).padStart(2, '0')}
                        </div>

                        {/* Controls */}
                        <div className="flex gap-3">
                            <button onClick={prevStep} className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-all active:scale-95">
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button onClick={nextStep} className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md transition-all active:scale-95">
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Close Button */}
                <button onClick={closePresentation} className="absolute top-4 right-6 z-50 p-2.5 bg-gray-100/80 hover:bg-gray-200 rounded-full text-gray-600 backdrop-blur-sm transition-all hover:scale-110">
                    <X className="w-6 h-6" />
                </button>

            </div>

            {/* Right Banner Area */}
            <div className="hidden lg:flex flex-1 h-full flex-col items-center justify-between bg-gradient-to-b from-[#0a2f6c] via-[#07214f] to-[#041334] relative z-0 overflow-hidden font-sans shadow-[inset_10px_0_20px_rgba(0,0,0,0.3)] border-l border-[#1a3f7c]">
                 
                 {/* Floating Bubbles/Orbs Background */}
                 <div className="absolute top-[10%] left-[15%] w-24 h-24 rounded-full border border-blue-400/20 bg-blue-400/5 blur-[2px]"></div>
                 <div className="absolute top-[8%] left-[65%] w-8 h-8 rounded-full border border-blue-300/30 bg-transparent blur-[1px]"></div>
                 <div className="absolute top-[30%] right-[10%] w-32 h-32 rounded-full border border-blue-400/10 bg-blue-400/5 blur-[4px]"></div>
                 <div className="absolute bottom-[25%] left-[-15%] w-48 h-48 rounded-full bg-blue-500/10 blur-[40px]"></div>
                 <div className="absolute bottom-[10%] right-[-10%] w-56 h-56 rounded-full bg-blue-400/10 blur-[50px]"></div>
                 
                 {/* Top Content */}
                 <div className="flex flex-col items-center justify-center w-full px-4 pt-12 xl:pt-16 z-10">
                      {/* Target Icon */}
                      <div className="text-[5rem] xl:text-[6.5rem] leading-none mb-6 drop-shadow-[0_10px_25px_rgba(0,0,0,0.6)]">
                          🎯
                      </div>
                      
                      {/* Text Section */}
                      <div className="text-center font-bold tracking-wide">
                          <h3 className="text-2xl xl:text-[1.75rem] text-white mb-2 leading-tight">লক্ষ্য তোমার,</h3>
                          <h3 className="text-2xl xl:text-[1.75rem] text-white leading-tight">
                              <span className="text-[#FFD700]">সাফল্য</span> আমাদের সাথে!
                          </h3>
                      </div>
                 </div>

                 {/* Middle Illustration Placeholder */}
                 <div className="flex items-center justify-center text-[3.5rem] xl:text-[4.5rem] gap-3 xl:gap-5 z-10 w-full drop-shadow-2xl opacity-90 my-4">
                     📚 💡 🚀 💻
                 </div>

                 {/* Features List */}
                 <div className="flex flex-col space-y-3 z-10 w-full px-12 xl:px-16 mb-4">
                      {[
                          'Daily Mock Tests',
                          'Unlimited Practice',
                          'Instant Result',
                          'Detailed Explanation',
                          'Performance Tracking'
                      ].map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                              <svg className="w-5 h-5 xl:w-[22px] xl:h-[22px] text-white shrink-0 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                              </svg>
                              <span className="text-white text-[15px] xl:text-[17px] font-semibold tracking-wide drop-shadow-sm">{feature}</span>
                          </div>
                      ))}
                 </div>

                 {/* Join Button */}
                 <div className="w-full px-8 xl:px-12 pb-12 xl:pb-16 z-10">
                      <button className="w-full flex flex-col items-center justify-center py-3.5 xl:py-4 bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-md border border-white/30 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:from-white/30 hover:to-white/10 transition-all duration-300 group">
                          <span className="text-white font-bold text-xl xl:text-[22px] mb-0.5 drop-shadow-md group-hover:scale-105 transition-transform duration-300">Join DeshExam</span>
                          <span className="text-gray-300 text-xs xl:text-[13px] font-medium tracking-wide">Start Your Success Journey</span>
                      </button>
                 </div>
            </div>
        </div>,
        document.body
    );
}
