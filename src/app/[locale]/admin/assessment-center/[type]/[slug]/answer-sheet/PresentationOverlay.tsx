'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';
import { X, ChevronLeft, ChevronRight, Play, Settings } from 'lucide-react';

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
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closePresentation();
            if (e.key === 'ArrowRight' || e.key === ' ') {
                e.preventDefault();
                nextStep();
            }
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                prevStep();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, closePresentation, nextStep, prevStep]);

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
        <div className="fixed inset-0 z-[99999] bg-[#f8fbff] flex items-center justify-center select-none font-sans">
            {/* Aspect Ratio Container for 16:9 */}
            <div className="relative w-full h-full max-w-[177.78vh] max-h-[56.25vw] bg-[#f8f9fc] flex flex-col shadow-2xl overflow-hidden">
                
                {/* Background Decorations */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    {/* Dot Pattern Left */}
                    <div className="absolute top-20 left-0 w-64 h-full" style={{ backgroundImage: 'radial-gradient(#e5e7eb 2px, transparent 2px)', backgroundSize: '24px 24px', opacity: 0.5 }}></div>
                    {/* Circles Right */}
                    <div className="absolute top-1/4 -right-16 w-64 h-64 rounded-full border-[1.5px] border-gray-200 opacity-50"></div>
                    <div className="absolute bottom-1/4 right-32 w-48 h-48 rounded-full border-[1.5px] border-gray-200 opacity-50"></div>
                    <div className="absolute top-1/3 left-1/4 w-32 h-32 rounded-full border-[1.5px] border-gray-200 opacity-50"></div>
                    {/* Watermark Center */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 text-[120px] font-black text-gray-200/50 tracking-widest uppercase">
                        DESHEXAM
                    </div>
                </div>

                {/* Header */}
                <div className="shrink-0 bg-white border-b border-gray-200 py-3 pl-8 pr-12 flex justify-between items-center w-full z-10 shadow-sm">
                    {/* Logo Area */}
                    <div className="flex items-center gap-3">
                        <img src="/image/logo.png" alt="DeshExam" className="h-10 w-auto object-contain" />
                        <div className="flex flex-col">
                            <span className="font-extrabold text-xl text-gray-900 leading-none">DeshExam Logo</span>
                            <span className="text-[11px] text-gray-500 font-medium tracking-wide mt-1">Learn • Practice • Succeed</span>
                        </div>
                    </div>
                    {/* Title Area */}
                    <div className="flex-1 text-center">
                        <h1 className="text-3xl font-extrabold text-black tracking-tight">{classLine}</h1>
                        {(chapterName || topicName) && (
                            <div className="text-sm text-gray-500 font-medium mt-0.5">
                                {[chapterName, topicName].filter(Boolean).join(' | ')}
                            </div>
                        )}
                    </div>
                    {/* Badge Area */}
                    <div className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold text-lg tracking-wider shadow-md">
                        MOCK TEST
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 w-full flex flex-col items-center px-24 py-12 z-10 overflow-y-auto custom-scrollbar gap-8">
                        
                    {/* Question */}
                    <div className="flex items-start gap-4 w-full max-w-5xl mt-4" style={{ '--q-size': `${38 * qFontScale}px` } as React.CSSProperties}>
                        <span className="text-black font-extrabold leading-tight shrink-0" style={{ fontSize: 'var(--q-size)' }}>Q{currentSlide + 1}.</span>
                        <div className="prose prose-black max-w-none prose-p:font-extrabold prose-p:text-[length:var(--q-size)] leading-snug prose-p:my-0 prose-li:text-2xl text-left text-black">
                            <ReactMarkdown remarkPlugins={remarkPluginsList} rehypePlugins={rehypePluginsList}>
                                {q.questionText}
                            </ReactMarkdown>
                        </div>
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-2 gap-x-8 gap-y-5 w-full max-w-6xl mt-2">
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
                                { border: 'border-[#4285F4]', bg: 'bg-white', letterBg: 'bg-[#e8f0fe]', letterText: 'text-[#4285F4]' }, // Blue
                                { border: 'border-[#34A853]', bg: 'bg-white', letterBg: 'bg-[#e6f4ea]', letterText: 'text-[#34A853]' }, // Green
                                { border: 'border-[#F9AB00]', bg: 'bg-white', letterBg: 'bg-[#fef7e0]', letterText: 'text-[#F9AB00]' }, // Yellow/Orange
                                { border: 'border-[#34A853]', bg: 'bg-white', letterBg: 'bg-[#e6f4ea]', letterText: 'text-[#34A853]' }, // Green (from image)
                                { border: 'border-[#EA4335]', bg: 'bg-white', letterBg: 'bg-[#fce8e6]', letterText: 'text-[#EA4335]' }, // Red
                            ];

                            const theme = colorThemes[oIdx % colorThemes.length];
                            
                            let containerClasses = `flex items-center gap-4 py-2 px-3 rounded-2xl border-2 transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.04)] ${theme.bg} ${theme.border}`;
                            let letterClasses = `shrink-0 w-12 h-12 flex items-center justify-center rounded-xl text-xl font-black transition-colors duration-300 ${theme.letterBg} ${theme.letterText}`;
                            
                            if (step === 0) {
                                if (isSelected) {
                                    containerClasses = `flex items-center gap-4 py-2 px-3 rounded-2xl border-2 transition-all duration-300 shadow-[0_8px_20px_rgba(66,133,244,0.15)] bg-[#e8f0fe] border-[#4285F4] transform scale-[1.02] cursor-pointer ring-2 ring-[#4285F4]/30`;
                                    letterClasses = `shrink-0 w-12 h-12 flex items-center justify-center rounded-xl text-xl font-black transition-colors duration-300 bg-[#4285F4] text-white`;
                                } else {
                                    containerClasses += ` hover:scale-[1.01] hover:shadow-md cursor-pointer hover:border-gray-300`;
                                }
                            } else {
                                if (showCorrect) {
                                    containerClasses = `flex items-center gap-4 py-2 px-3 rounded-2xl border-2 transition-all duration-300 shadow-[0_8px_20px_rgba(52,168,83,0.15)] bg-[#f0fdf4] border-[#34A853] transform scale-[1.02]`;
                                    letterClasses = `shrink-0 w-12 h-12 flex items-center justify-center rounded-xl text-xl font-black transition-colors duration-300 bg-[#34A853] text-white`;
                                } else if (showWrong && isSelected) {
                                    containerClasses = `flex items-center gap-4 py-2 px-3 rounded-2xl border-2 transition-all duration-300 shadow-[0_8px_20px_rgba(234,67,53,0.15)] bg-[#fce8e6] border-[#EA4335] transform scale-[1.02]`;
                                    letterClasses = `shrink-0 w-12 h-12 flex items-center justify-center rounded-xl text-xl font-black transition-colors duration-300 bg-[#EA4335] text-white`;
                                } else if (showWrong) {
                                    containerClasses = `flex items-center gap-4 py-2 px-3 rounded-2xl border-2 transition-all duration-300 shadow-sm bg-white border-gray-200 opacity-50 grayscale`;
                                    letterClasses = `shrink-0 w-12 h-12 flex items-center justify-center rounded-xl text-xl font-black transition-colors duration-300 bg-gray-100 text-gray-400`;
                                }
                            }

                            return (
                                <div 
                                    key={opt.key} 
                                    className={containerClasses} 
                                    style={{ '--opt-size': `${32 * optFontScale}px` } as React.CSSProperties}
                                    onClick={() => step === 0 && setSelectedOption(opt.key)}
                                >
                                    <div className={letterClasses}>
                                        {optLetter}
                                    </div>
                                    <div className="prose max-w-none text-black [&>p]:m-0 [&>p]:text-[length:var(--opt-size)] [&>p]:font-semibold [&>p]:leading-snug">
                                        <ReactMarkdown remarkPlugins={remarkPluginsList} rehypePlugins={rehypePluginsList}>
                                            {opt.text}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Explanation */}
                    {step >= 2 && q.explanation && (
                        <div className="w-full max-w-5xl mt-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xl relative overflow-hidden">
                                {/* Small colored accent line on the left */}
                                <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#34A853]"></div>
                                
                                <div className="text-[#34A853] font-bold text-xl mb-3 flex items-center gap-2 pl-4">
                                    <span className="text-2xl">💡</span>
                                    Explanation
                                </div>
                                <div className="prose prose-xl max-w-none text-gray-800 pl-4 font-medium">
                                    <ReactMarkdown remarkPlugins={remarkPluginsList} rehypePlugins={rehypePluginsList}>
                                        {q.explanation}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="shrink-0 bg-white border-t border-gray-200 py-4 pl-12 pr-8 flex justify-between items-center w-full z-20 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center text-gray-600 font-semibold text-lg">
                        © DeshExam
                    </div>
                    <div className="flex items-center text-gray-600 font-semibold text-lg tracking-wide">
                        www.deshexam.in
                    </div>
                    
                    <div className="flex items-center gap-8">
                        {/* Settings Dropdown */}
                        <div className="relative">
                            <button 
                                onClick={() => setIsSettingsOpen(!isSettingsOpen)} 
                                className={`p-3 rounded-full transition-all shadow-sm ${isSettingsOpen ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500/50' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                                title="Display Settings"
                            >
                                <Settings className={`w-6 h-6 transition-transform duration-300 ${isSettingsOpen ? 'rotate-90' : ''}`} />
                            </button>
                            
                            {isSettingsOpen && (
                                <div className="absolute bottom-full mb-4 right-0 bg-white border border-gray-200 rounded-2xl shadow-2xl p-5 w-72 z-50 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                                        <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                            <Settings className="w-5 h-5 text-gray-500" /> Settings
                                        </h3>
                                        <button onClick={() => setIsSettingsOpen(false)} className="p-1 text-gray-400 hover:bg-gray-100 rounded-full hover:text-gray-700 transition-colors">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-5">
                                        <div>
                                            <div className="text-sm font-bold text-gray-600 mb-2">Presentation Mode</div>
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
                                        
                                        <hr className="border-gray-100" />
                                        
                                        <div>
                                            <div className="text-sm font-bold text-gray-600 mb-2 flex justify-between">
                                                <span>Question Font Size</span>
                                                <span className="text-blue-600 bg-blue-50 px-2 rounded text-xs py-0.5">{Math.round(qFontScale * 100)}%</span>
                                            </div>
                                            <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 w-full overflow-hidden shadow-inner">
                                                <button onClick={() => setQFontScale(s => Math.max(0.6, s - 0.1))} className="flex-1 py-2 text-gray-700 hover:bg-gray-200 font-bold border-r border-gray-200 transition-colors">A-</button>
                                                <button onClick={() => setQFontScale(s => Math.min(2.0, s + 0.1))} className="flex-1 py-2 text-gray-700 hover:bg-gray-200 font-bold transition-colors">A+</button>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <div className="text-sm font-bold text-gray-600 mb-2 flex justify-between">
                                                <span>Options Font Size</span>
                                                <span className="text-green-600 bg-green-50 px-2 rounded text-xs py-0.5">{Math.round(optFontScale * 100)}%</span>
                                            </div>
                                            <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 w-full overflow-hidden shadow-inner">
                                                <button onClick={() => setOptFontScale(s => Math.max(0.6, s - 0.1))} className="flex-1 py-2 text-gray-700 hover:bg-gray-200 font-bold border-r border-gray-200 transition-colors">A-</button>
                                                <button onClick={() => setOptFontScale(s => Math.min(2.0, s + 0.1))} className="flex-1 py-2 text-gray-700 hover:bg-gray-200 font-bold transition-colors">A+</button>
                                            </div>
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
        </div>,
        document.body
    );
}
