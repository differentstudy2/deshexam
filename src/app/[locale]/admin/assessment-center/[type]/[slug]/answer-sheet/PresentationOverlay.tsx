'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import Confetti from 'react-dom-confetti';
import { motion, AnimatePresence } from 'framer-motion';

const MUSIC_OPTIONS = [
    { id: 'lofi', name: 'Lo-Fi Chill', url: '/audio/lofi.mp3' },
    { id: 'ambient', name: 'Ambient Focus', url: '/audio/ambient.mp3' },
    { id: 'nature', name: 'Nature Sounds', url: '/audio/nature.mp3' },
    { id: 'piano', name: 'Soft Piano', url: '/audio/piano.mp3' },
    { id: 'rain', name: 'Rain Sounds', url: '/audio/rain.mp3' },
    { id: 'binaural', name: 'Binaural Beats', url: '/audio/binaural.mp3' },
    { id: 'cafe', name: 'Cafe Ambience', url: '/audio/cafe.mp3' },
    { id: 'jazz', name: 'Smooth Jazz', url: '/audio/jazz.mp3' },
    { id: 'classic', name: 'Classical Music', url: '/audio/classic.mp3' },
    { id: 'meditation', name: 'Meditation Bowl', url: '/audio/meditation.mp3' },
    { id: 'ticking', name: 'Ticking Clock', url: '/audio/ticking.mp3' },
    { id: 'calc_guess', name: 'A Calculated Guess', url: '/audio/A_Calculated_Guess.mp3' },
    { id: 'porcelain_rain', name: 'Porcelain Against the Rain', url: '/audio/Porcelain_Against_the_Rain.mp3' },
    { id: 'sec_solve', name: 'Seconds to Solve', url: '/audio/Seconds_to_Solve.mp3' },
    { id: 'seven_letters', name: 'Seven Letters Down', url: '/audio/Seven_Letters_Down.mp3' },
    { id: 'steps_clarity', name: 'Steps Toward Clarity', url: '/audio/Steps_Toward_Clarity.mp3' },
    { id: 'sunlight_cedar', name: 'Sunlight on Cedar', url: '/audio/Sunlight_on_Cedar.mp3' },
    { id: 'last_answer', name: 'The Last Answer', url: '/audio/The_Last_Answer.mp3' },
    { id: 'last_pendulum', name: 'The Last Pendulum', url: '/audio/The_Last_Pendulum.mp3' },
    { id: 'library_storm', name: 'The Library Storm', url: '/audio/The_Library_Storm.mp3' },
    { id: 'longest_min', name: 'The Longest Minute', url: '/audio/The_Longest_Minute.mp3' },
    { id: 'weightless_page', name: 'The Weightless Page', url: '/audio/The_Weightless_Page.mp3' },
    { id: 'ticking_margin', name: 'Ticking Margin', url: '/audio/Ticking_Margin.mp3' },
    { id: 'tiptoe_still', name: 'Tiptoe into Stillness', url: '/audio/Tiptoe_into_Stillness.mp3' },
    { id: 'twelve_stories', name: 'Twelve Stories Above', url: '/audio/Twelve_Stories_Above.mp3' }
];

const VIDEO_OPTIONS = [
    { id: 'v1', name: 'High-Tech Digital', url: '/videos/A_high_tech_digital_quiz_backg.mp4' },
    { id: 'v2', name: 'Abstract Minimalist', url: '/videos/A_seamless_slow_moving_abstra.mp4' },
    { id: 'v3', name: 'Gold & White', url: '/videos/Slow_elegant_gold_and_white_g.mp4' },
    { id: 'v4', name: 'Gold & White (Alt)', url: '/videos/Slow_elegant_gold_and_white_g (1).mp4' },
    { id: 'v5', name: 'Modern TV Studio', url: '/videos/Wide_shot_of_an_empty_modern.mp4' }
];

const CONFETTI_CONFIG = {
    spread: 90,
    elementCount: 70,
    duration: 3000,
    startVelocity: 30,
    colors: ['#34A853', '#FABB05', '#4285F4', '#EA4335']
};

import 'katex/dist/katex.min.css';
import { X, ChevronLeft, ChevronRight, Play, Pause, Settings, Check, Clock, Pen, Trash2, Focus, Highlighter, MousePointer2, Maximize, Minimize, LayoutGrid, Sun, Moon, Eraser, Square, Circle, ArrowUpRight, Type, Presentation, ZoomIn, Volume2, VolumeX, MonitorPlay, Lightbulb, MessageCircle, Stamp, Droplet, Music, AlignLeft, Keyboard, Printer } from 'lucide-react';

const bnOptionsMap: Record<string, string> = {
    a: 'ক',
    b: 'খ',
    c: 'গ',
    d: 'ঘ',
    e: 'ঙ'
};

const remarkPluginsList = [remarkGfm, remarkMath];
const rehypePluginsList = [rehypeKatex, rehypeRaw];

const WATERMARK_POSITIONS = [
    { top: '15%', left: '15%', sizeScale: 1, rot: -15, opacScale: 0.7 },
    { top: '25%', left: '85%', sizeScale: 1.15, rot: -8, opacScale: 0.8 },
    { top: '50%', left: '50%', sizeScale: 1.3, rot: -10, opacScale: 0.9 },
    { top: '75%', left: '20%', sizeScale: 1, rot: -5, opacScale: 1.0 },
    { top: '85%', left: '80%', sizeScale: 1.2, rot: -12, opacScale: 0.6 },
    { top: '10%', left: '60%', sizeScale: 0.9, rot: 5, opacScale: 0.5 },
    { top: '90%', left: '40%', sizeScale: 0.8, rot: 15, opacScale: 0.5 },
    { top: '35%', left: '30%', sizeScale: 1.05, rot: 10, opacScale: 0.7 },
    { top: '65%', left: '70%', sizeScale: 1.1, rot: -18, opacScale: 0.65 },
    { top: '5%', left: '35%', sizeScale: 0.85, rot: -20, opacScale: 0.4 },
    { top: '45%', left: '80%', sizeScale: 1.2, rot: 8, opacScale: 0.75 },
    { top: '80%', left: '55%', sizeScale: 1.1, rot: -3, opacScale: 0.85 },
    { top: '20%', left: '45%', sizeScale: 1.0, rot: 12, opacScale: 0.6 },
    { top: '55%', left: '25%', sizeScale: 1.15, rot: -14, opacScale: 0.8 },
    { top: '95%', left: '75%', sizeScale: 0.95, rot: 7, opacScale: 0.55 },
    { top: '40%', left: '10%', sizeScale: 1.25, rot: -6, opacScale: 0.95 },
    { top: '70%', left: '90%', sizeScale: 0.9, rot: 20, opacScale: 0.45 },
    { top: '30%', left: '55%', sizeScale: 1.1, rot: -11, opacScale: 0.7 },
    { top: '60%', left: '15%', sizeScale: 1.05, rot: 16, opacScale: 0.65 },
    { top: '15%', left: '95%', sizeScale: 0.8, rot: -22, opacScale: 0.35 }
];

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
    const [isNavigatorOpen, setIsNavigatorOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [mode, setMode] = useState<'test' | 'read'>('test');
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isTimerEnabled, setIsTimerEnabled] = useState(true);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [wmOpacity, setWmOpacity] = useState(40);
    const [wmSize, setWmSize] = useState(50);
    const [wmCount, setWmCount] = useState(7);
    const [wmVisible, setWmVisible] = useState(true);
    const [optionsLayout, setOptionsLayout] = useState<'grid' | 'list'>('grid');
    const [isFullscreen, setIsFullscreen] = useState(false);

    const [isExpEnabled, setIsExpEnabled] = useState(false);
    const [isOptionExpEnabled, setIsOptionExpEnabled] = useState(false);
    const [expFontScale, setExpFontScale] = useState(1);

    const [timerPos, setTimerPos] = useState({ x: 0, y: 0 });
    const [isDraggingTimer, setIsDraggingTimer] = useState(false);
    const dragStartPos = useRef({ x: 0, y: 0 });

    // Pen Tool State
    const [isPenActive, setIsPenActive] = useState(false);
    const [penColor, setPenColor] = useState('#ef4444');
    const [penSize, setPenSize] = useState(4);

    // Drawing Tool State
    const [drawingTool, setDrawingTool] = useState<'pen' | 'highlighter' | 'laser' | 'eraser' | 'rectangle' | 'circle' | 'arrow' | 'text' | 'magnifier'>('pen');
    const [isMagnified, setIsMagnified] = useState(false);
    const [magnifierPos, setMagnifierPos] = useState({ x: 50, y: 50 });
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isWhiteboardMode, setIsWhiteboardMode] = useState(false);
    const [isAutoPlayReadAloud, setIsAutoPlayReadAloud] = useState(false);
    const [textInput, setTextInput] = useState<{ x: number, y: number, text: string } | null>(null);
    const textInputRef = useRef<HTMLTextAreaElement>(null);
    const cursorRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const lofiAudioRef = useRef<HTMLAudioElement>(null);
    const popAudioRef = useRef<HTMLAudioElement>(null);
    const wowAudioRef = useRef<HTMLAudioElement>(null);

    const [isConfettiActive, setIsConfettiActive] = useState(false);
    const [isLofiEnabled, setIsLofiEnabled] = useState(false);
    const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
    const [eliminatedOptions, setEliminatedOptions] = useState<string[]>([]);
    const [showHeader, setShowHeader] = useState(true);
    const [showLogo, setShowLogo] = useState(true);
    const [headerScale, setHeaderScale] = useState(0.9);
    const [headerTitleScale, setHeaderTitleScale] = useState(0.9);
    const [headerTitleAlign, setHeaderTitleAlign] = useState<'left' | 'center' | 'right'>('left');
    const [selectedMusic, setSelectedMusic] = useState(MUSIC_OPTIONS[0].url);
    const [musicVolume, setMusicVolume] = useState(0.5);
    const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
    const [bgTheme, setBgTheme] = useState<'default' | 'mesh' | 'grid' | 'dots' | 'video'>('dots');
    const [selectedVideo, setSelectedVideo] = useState(VIDEO_OPTIONS[0].url);
    const [videoOpacity, setVideoOpacity] = useState(40);
    const [bgOpacity, setBgOpacity] = useState(100);
    const [qBgColor, setQBgColor] = useState('bg-white/90 dark:bg-gray-800/90');
    const [qTextColor, setQTextColor] = useState('#000000');
    const [animSpeed, setAnimSpeed] = useState(0.8);

    const getBgThemeClasses = () => {
        switch (bgTheme) {
            case 'mesh': return 'bg-indigo-50 dark:bg-indigo-950';
            case 'grid': return 'bg-[#f8fafc] dark:bg-gray-900';
            case 'dots': return 'bg-[#f8fafc] dark:bg-gray-900';
            case 'video': return 'bg-black/90 text-white';
            default: return 'bg-slate-50 dark:bg-slate-950';
        }
    };

    const getBgThemeOverlayClasses = () => {
        switch (bgTheme) {
            case 'mesh': return 'bg-gradient-to-br from-indigo-100 via-purple-50 to-teal-100 dark:from-indigo-950 dark:via-purple-900 dark:to-teal-950';
            case 'grid': return 'bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:24px_24px]';
            case 'dots': return 'bg-[radial-gradient(#cbd5e1_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#374151_1.5px,transparent_1.5px)] [background-size:20px_20px]';
            case 'video': return '';
            default: return 'bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.25),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.2),rgba(255,255,255,0))]';
        }
    };

    const isAutoPlayRef = useRef(isAutoPlayReadAloud);
    const stepRef = useRef(step);

    useEffect(() => {
        if (lofiAudioRef.current) {
            lofiAudioRef.current.volume = musicVolume;
        }
    }, [musicVolume]);

    useEffect(() => {
        isAutoPlayRef.current = isAutoPlayReadAloud;
        stepRef.current = step;
    }, [isAutoPlayReadAloud, step]);

    useEffect(() => {
        if (textInput && textInputRef.current) {
            textInputRef.current.focus();
        }
    }, [textInput]);

    const finalizeText = useCallback(() => {
        if (!textInput || !textInput.text.trim()) {
            setTextInput(null);
            return;
        }
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx) {
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1.0;
            ctx.font = `bold ${Math.max(penSize * 3, 16)}px sans-serif`;
            ctx.fillStyle = penColor;
            ctx.textBaseline = 'top';

            const lines = textInput.text.split('\n');
            const lineHeight = Math.max(penSize * 3, 16) * 1.2;

            lines.forEach((line, index) => {
                ctx.fillText(line, textInput.x, textInput.y + (index * lineHeight));
            });
        }
        setTextInput(null);
    }, [textInput, penColor, penSize]);

    const handleCanvasWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop += e.deltaY;
        }
    };

    // Spotlight State
    const [isSpotlightActive, setIsSpotlightActive] = useState(false);
    const [spotlightPos, setSpotlightPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (!isSpotlightActive) return;
        const handleMouseMove = (e: MouseEvent) => {
            setSpotlightPos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [isSpotlightActive]);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const activeCanvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const isDrawing = useRef(false);
    const currentStroke = useRef<{ x: number, y: number }[]>([]);

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
        const activeCanvas = activeCanvasRef.current;
        if (activeCanvas) {
            const activeCtx = activeCanvas.getContext('2d');
            if (activeCtx) {
                activeCtx.clearRect(0, 0, activeCanvas.width, activeCanvas.height);
            }
        }
    }, []);

    useEffect(() => {
        clearCanvas();
        setEliminatedOptions([]);
    }, [currentSlide, clearCanvas]);

    const getCoordinates = (e: any) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();

        let clientX = e.clientX;
        let clientY = e.clientY;

        if (clientX === undefined && e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        return {
            x: (clientX || 0) - rect.left,
            y: (clientY || 0) - rect.top
        };
    };

    // Drawing Handlers
    const startDrawing = (e: any) => {
        if (!isPenActive) return;

        const { x, y } = getCoordinates(e);
        if (cursorRef.current) {
            cursorRef.current.style.left = `${x}px`;
            cursorRef.current.style.top = `${y}px`;
        }

        if (drawingTool === 'laser') {
            return;
        }

        if (drawingTool === 'magnifier') {
            setIsMagnified(true);
            const rect = activeCanvasRef.current?.getBoundingClientRect();
            if (rect) {
                const mx = ((e.clientX - rect.left) / rect.width) * 100;
                const my = ((e.clientY - rect.top) / rect.height) * 100;
                setMagnifierPos({ x: mx, y: my });
            }
            try {
                if (e.target && e.target.setPointerCapture && e.pointerId !== undefined) {
                    (e.target as HTMLElement).setPointerCapture(e.pointerId);
                }
            } catch (err) { }
            return;
        }

        if (drawingTool === 'text') {
            if (textInput) {
                finalizeText();
            } else {
                setTextInput({ x, y, text: '' });
            }
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;

        // Force resize if incorrect right before drawing
        const expectedWidth = canvas.offsetWidth;
        const expectedHeight = canvas.offsetHeight;
        if (expectedWidth > 0 && expectedHeight > 0 && (canvas.width !== expectedWidth || canvas.height !== expectedHeight)) {
            canvas.width = expectedWidth;
            canvas.height = expectedHeight;
            const newCtx = canvas.getContext('2d');
            if (newCtx) {
                newCtx.lineCap = 'round';
                newCtx.lineJoin = 'round';
                contextRef.current = newCtx;
            }
        }

        isDrawing.current = true;
        try {
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
        } catch (err) { }
        currentStroke.current = [{ x, y }];
        redrawActiveStroke();
    };

    const drawArrow = (ctx: CanvasRenderingContext2D, fromx: number, fromy: number, tox: number, toy: number) => {
        const headlen = 15;
        const dx = tox - fromx;
        const dy = toy - fromy;
        const angle = Math.atan2(dy, dx);
        ctx.beginPath();
        ctx.moveTo(fromx, fromy);
        ctx.lineTo(tox, toy);
        ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(tox, toy);
        ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
    };

    const redrawActiveStroke = () => {
        const canvas = activeCanvasRef.current;
        if (!canvas) return;

        if (canvas.width !== canvas.offsetWidth || canvas.height !== canvas.offsetHeight) {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (currentStroke.current.length === 0) return;
        if (drawingTool === 'eraser') return;

        ctx.globalAlpha = drawingTool === 'highlighter' ? 0.3 : 1.0;
        ctx.globalCompositeOperation = drawingTool === 'highlighter' ? 'multiply' : 'source-over';
        const size = drawingTool === 'highlighter' ? penSize * 5 : penSize;

        ctx.strokeStyle = penColor;
        ctx.fillStyle = penColor;
        ctx.lineWidth = size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const start = currentStroke.current[0];
        const current = currentStroke.current[currentStroke.current.length - 1];

        if (drawingTool === 'rectangle') {
            ctx.strokeRect(start.x, start.y, current.x - start.x, current.y - start.y);
            return;
        }

        if (drawingTool === 'circle') {
            const radius = Math.sqrt(Math.pow(current.x - start.x, 2) + Math.pow(current.y - start.y, 2));
            ctx.beginPath();
            ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
            ctx.stroke();
            return;
        }

        if (drawingTool === 'arrow') {
            drawArrow(ctx, start.x, start.y, current.x, current.y);
            return;
        }

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);

        if (currentStroke.current.length === 1) {
            ctx.arc(start.x, start.y, size / 2, 0, Math.PI * 2);
            ctx.fill();
            return;
        }

        for (let i = 1; i < currentStroke.current.length; i++) {
            ctx.lineTo(currentStroke.current[i].x, currentStroke.current[i].y);
        }

        ctx.stroke();
    };

    const draw = (e: any) => {
        if (!isPenActive) return;

        const { x, y } = getCoordinates(e);

        if (cursorRef.current) {
            cursorRef.current.style.left = `${x}px`;
            cursorRef.current.style.top = `${y}px`;
        }

        if (drawingTool === 'laser' || drawingTool === 'text') {
            return;
        }

        if (drawingTool === 'magnifier') {
            if (isMagnified) {
                const rect = activeCanvasRef.current?.getBoundingClientRect();
                if (rect) {
                    const mx = ((e.clientX - rect.left) / rect.width) * 100;
                    const my = ((e.clientY - rect.top) / rect.height) * 100;
                    setMagnifierPos({ x: mx, y: my });
                }
            }
            return;
        }

        if (!isDrawing.current) return;

        currentStroke.current.push({ x, y });

        if (drawingTool === 'eraser') {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (ctx && currentStroke.current.length >= 2) {
                const prev = currentStroke.current[currentStroke.current.length - 2];
                ctx.globalCompositeOperation = 'destination-out';
                ctx.beginPath();
                ctx.moveTo(prev.x, prev.y);
                ctx.lineTo(x, y);
                ctx.strokeStyle = 'rgba(0,0,0,1)';
                ctx.lineWidth = penSize * 5;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.stroke();
                ctx.globalCompositeOperation = 'source-over';
            }
        } else {
            redrawActiveStroke();
        }
    };

    const stopDrawing = (e: any) => {
        if (drawingTool === 'magnifier') {
            setIsMagnified(false);
            try {
                if (e.target && e.target.releasePointerCapture && e.pointerId !== undefined) {
                    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
                }
            } catch (err) { }
            return;
        }

        if (!isDrawing.current) return;

        isDrawing.current = false;
        try {
            if (e.target && e.target.releasePointerCapture && e.pointerId !== undefined) {
                (e.target as HTMLElement).releasePointerCapture(e.pointerId);
            }
        } catch (err) { }

        const mainCanvas = canvasRef.current;
        const activeCanvas = activeCanvasRef.current;
        if (mainCanvas && activeCanvas && drawingTool !== 'eraser') {
            const ctx = mainCanvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(activeCanvas, 0, 0);
            }
            const activeCtx = activeCanvas.getContext('2d');
            if (activeCtx) {
                activeCtx.clearRect(0, 0, activeCanvas.width, activeCanvas.height);
            }
        }
        currentStroke.current = [];
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

    useEffect(() => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);

            if (isOpen && isAutoPlayReadAloud) {
                const timer = setTimeout(() => {
                    handleReadAloud(true);
                }, 300);
                return () => clearTimeout(timer);
            }
        }
    }, [currentSlide, isOpen, isAutoPlayReadAloud]);

    const handleReadAloud = (forcePlay = false) => {
        if (!('speechSynthesis' in window)) return;

        if (isSpeaking && !forcePlay) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        const q = questions[currentSlide];
        if (!q) return;

        // Clean up markdown before reading
        const cleanMarkdown = (text: string) => text.replace(/[*_#]/g, '').replace(/\[(.*?)\]\(.*?\)/g, '$1');

        let textToRead = cleanMarkdown(q.questionText) + '. ';

        if (q.options) {
            const optionKeys = ['a', 'b', 'c', 'd', 'e'].filter(k => q.options && q.options[k as keyof typeof q.options]);
            optionKeys.forEach((key) => {
                const optText = q.options![key as keyof typeof q.options];
                if (optText) {
                    textToRead += `${bnOptionsMap[key] || key.toUpperCase()}: ${cleanMarkdown(optText)}. `;
                }
            });
        }

        const currentSlideLocal = currentSlide;
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = q.language === 'Bangla' ? 'bn-BD' : 'en-US';

        utterance.onend = () => {
            if (isAutoPlayRef.current && stepRef.current === 0 && q.correctAnswer) {
                const correctKey = q.correctAnswer.toLowerCase().trim();
                const optionKeys = ['a', 'b', 'c', 'd', 'e'].filter(k => q.options && q.options[k as keyof typeof q.options]);
                const validKey = optionKeys.find(k => correctKey.includes(k));
                if (validKey) {
                    setSelectedOption(validKey);
                    setStep(1);

                    const isBangla = q.language === 'Bangla';
                    const correctOptText = cleanMarkdown(q.options![validKey as keyof typeof q.options] || '');
                    const correctText = isBangla
                        ? `সঠিক উত্তর: ${bnOptionsMap[validKey]}, ${correctOptText}`
                        : `Correct Answer is: ${validKey.toUpperCase()}, ${correctOptText}`;

                    const correctUtterance = new SpeechSynthesisUtterance(correctText);
                    correctUtterance.lang = isBangla ? 'bn-BD' : 'en-US';

                    correctUtterance.onend = () => {
                        setIsSpeaking(false);
                        setTimeout(() => {
                            if (isAutoPlayRef.current) {
                                setCurrentSlide(prev => {
                                    if (prev === currentSlideLocal && prev < questions.length - 1) {
                                        setStep(0);
                                        setSelectedOption(null);
                                        setTimerSeconds(0);
                                        return prev + 1;
                                    }
                                    return prev;
                                });
                            }
                        }, 1500);
                    };
                    correctUtterance.onerror = () => setIsSpeaking(false);
                    window.speechSynthesis.speak(correctUtterance);
                } else {
                    setIsSpeaking(false);
                }
            } else {
                setIsSpeaking(false);
            }
        };
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
    };

    const handleReadAloudRef = useRef(handleReadAloud);
    useEffect(() => {
        handleReadAloudRef.current = handleReadAloud;
    });

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            const key = e.key.toLowerCase();

            if (e.shiftKey) {
                if (key === '?') {
                    setIsShortcutsOpen(prev => !prev);
                } else if (key === 'a') {
                    setIsAutoPlayReadAloud(prev => !prev);
                } else if (key === 'r') {
                    handleReadAloudRef.current(true);
                } else if (key === 'f') {
                    setIsSpotlightActive(prev => !prev);
                } else if (key === 'd') {
                    setIsPenActive(prev => !prev);
                } else if (key === 'w') {
                    setIsWhiteboardMode(prev => !prev);
                } else if (key === 'n') {
                    setIsDarkMode(prev => !prev);
                } else if (key === 'x') {
                    setIsExpEnabled(prev => !prev);
                } else if (key === 'o') {
                    setIsOptionExpEnabled(prev => !prev);
                } else if (['p', 'm', 'l', 'e', 'b', 'c', 'v', 't', 'z'].includes(key)) {
                    setIsPenActive(true);
                    if (key === 'p') setDrawingTool('pen');
                    else if (key === 'm') setDrawingTool('highlighter');
                    else if (key === 'l') setDrawingTool('laser');
                    else if (key === 'e') setDrawingTool('eraser');
                    else if (key === 'b') setDrawingTool('rectangle');
                    else if (key === 'c') setDrawingTool('circle');
                    else if (key === 'v') setDrawingTool('arrow');
                    else if (key === 't') setDrawingTool('text');
                    else if (key === 'z') setDrawingTool('magnifier');
                }
            } else {
                if (key === 's') {
                    setIsSettingsOpen(prev => !prev);
                } else if (key === 't') {
                    setIsTimerEnabled(prev => !prev);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const openPresentation = () => {
        setIsOpen(true);
        setCurrentSlide(0);
        setStep(mode === 'read' ? 2 : 0);
        setSelectedOption(null);
        setTimerSeconds(0);
        document.body.style.overflow = 'hidden';
    };

    const closePresentation = useCallback(() => {
        setIsOpen(false);
        document.body.style.overflow = '';
        if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(err => console.error(err));
        }
    }, []);

    const nextStep = useCallback(() => {
        if (mode === 'read') {
            if (currentSlide < questions.length - 1) {
                setCurrentSlide(currentSlide + 1);
                setStep(2);
                setSelectedOption(null);
                setTimerSeconds(0);
            }
        } else {
            const currentQ = questions[currentSlide];
            const hasExp = isExpEnabled && currentQ?.explanation;
            const hasOptExp = isOptionExpEnabled && currentQ?.optionExplanations && Object.keys(currentQ.optionExplanations).length > 0;
            const maxStep = (hasExp || hasOptExp) ? 2 : 1;

            if (step < maxStep) {
                setStep(step + 1);
            } else if (currentSlide < questions.length - 1) {
                setCurrentSlide(currentSlide + 1);
                setStep(0);
                setSelectedOption(null);
                setTimerSeconds(0);
            }
        }
    }, [step, currentSlide, questions, mode, isExpEnabled, isOptionExpEnabled]);

    const prevStep = useCallback(() => {
        if (mode === 'read') {
            if (currentSlide > 0) {
                setCurrentSlide(currentSlide - 1);
                setStep(2);
                setSelectedOption(null);
                setTimerSeconds(0);
            }
        } else {
            if (step > 0) {
                setStep(step - 1);
            } else if (currentSlide > 0) {
                setCurrentSlide(currentSlide - 1);
                setStep(2);
                setSelectedOption(null);
                setTimerSeconds(0);
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
        if (!isOpen || !isTimerEnabled || step >= 1) return;

        const interval = setInterval(() => {
            setTimerSeconds(s => s + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [isOpen, isTimerEnabled, step, currentSlide]);

    useEffect(() => {
        if (lofiAudioRef.current) {
            if (isLofiEnabled && isOpen) {
                lofiAudioRef.current.play().catch(e => console.warn('Audio play failed:', e));
            } else {
                lofiAudioRef.current.pause();
            }
        }
    }, [isLofiEnabled, isOpen]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = useCallback(async () => {
        if (!document.fullscreenElement) {
            try {
                await document.documentElement.requestFullscreen();
            } catch (err) {
                console.error('Error attempting to enable fullscreen:', err);
            }
        } else {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            }
        }
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if (e.key === 'Escape') {
                if (isSettingsOpen) {
                    setIsSettingsOpen(false);
                } else if (isNavigatorOpen) {
                    setIsNavigatorOpen(false);
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

            if (e.key === 'D') {
                setIsPenActive(prev => !prev);
                return;
            }

            if (e.key === 'F') {
                setIsSpotlightActive(prev => !prev);
                return;
            }

            if (e.key === 'F11') {
                e.preventDefault();
                toggleFullscreen();
                return;
            }

            if (e.key === 'C' || e.key === 'Delete' || e.key === 'Backspace') {
                clearCanvas();
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
            if (e.key === '[') {
                setExpFontScale(s => Math.max(0.6, s - 0.1));
                return;
            }
            if (e.key === ']') {
                setExpFontScale(s => Math.min(2.0, s + 0.1));
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
    }, [isOpen, closePresentation, nextStep, prevStep, isSettingsOpen, step, currentSlide, questions, clearCanvas]);
    const currentQ = questions[currentSlide];

    const parsedOptions = useMemo(() => {
        if (!currentQ || !currentQ.options) return [];
        const arr = [
            { key: 'a', text: currentQ.options.a },
            { key: 'b', text: currentQ.options.b },
            { key: 'c', text: currentQ.options.c },
            { key: 'd', text: currentQ.options.d }
        ];
        if (currentQ.options.e) arr.push({ key: 'e', text: currentQ.options.e });
        return arr;
    }, [currentQ]);

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
        <>
            <div className={`print:hidden fixed inset-0 w-full h-full z-[99999] flex items-center justify-between xl:gap-[0.1rem] xl:p-[0.1rem] select-none font-sans overflow-hidden transition-colors duration-500 ${isDarkMode ? 'dark bg-gray-900' : 'bg-[#f8fbff]'}`}>
                <style>{`
                    @keyframes popIn {
                        0% { transform: scale(1); box-shadow: 0 0 0 rgba(52,168,83,0); }
                        50% { transform: scale(1.05); box-shadow: 0 0 40px rgba(52,168,83,0.6); }
                        100% { transform: scale(1.03); box-shadow: 0 0 30px rgba(52,168,83,0.5); }
                    }
                    .animate-pop-in {
                        animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                    }
                    @media print {
                        @page { size: A4 landscape; margin: 10mm; }
                        body { margin: 0 !important; overflow: visible !important; background: white !important; }
                        body > *:not(.print-only) { display: none !important; }
                        .print-only { display: block !important; position: static !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
                        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    }
                `}</style>

                {/* Left Ad Banner (160x600) */}
                <div className="hidden xl:flex w-[160px] h-[600px] shrink-0 flex-col items-center justify-between bg-gradient-to-b from-[#0a192f] via-[#0b2244] to-[#041128] rounded-xl overflow-hidden shadow-2xl border border-blue-400/20 relative z-10 p-3">
                    {/* Floating Elements Background */}
                    <div className="absolute top-[5%] left-[25%] w-16 h-16 rounded-full border border-blue-400/20 bg-blue-500/10 blur-[8px]"></div>
                    <div className="absolute bottom-[30%] right-[-5%] w-20 h-20 rounded-full bg-blue-400/10 blur-[20px]"></div>

                    {/* Top Logo */}
                    <div className="flex flex-col items-center w-full z-10 pt-2">
                        <div className="bg-white/10 px-3 py-2 rounded-lg shadow-lg border border-white/10 backdrop-blur-sm mb-3">
                            <h2 className="text-[20px] font-extrabold text-white tracking-wide drop-shadow-md">
                                <span className="text-blue-400">Desh</span>Exam
                            </h2>
                        </div>
                        <div className="text-center">
                            <h3 className="text-[18px] text-blue-100 mb-1 leading-tight font-medium">সঠিক প্রস্তুতি</h3>
                            <h3 className="text-[26px] text-white leading-tight font-extrabold">
                                <span className="text-[#FFD700]">সফলতার</span>
                            </h3>
                            <h3 className="text-[26px] text-white leading-tight font-extrabold">চাবিকাঠি!</h3>
                        </div>
                    </div>

                    {/* Middle Trophy */}
                    <div className="flex items-center justify-center text-4xl w-full z-10 drop-shadow-2xl my-2 relative">
                        <div className="absolute inset-0 bg-blue-400/20 blur-[15px] rounded-full"></div>
                        🏆
                    </div>

                    {/* Features List */}
                    <div className="flex flex-col z-10 w-full space-y-2 mb-2">
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-2.5">
                            <div className="flex flex-col space-y-1.5">
                                {[
                                    'Mock Test',
                                    'Topic Test',
                                    'Live Exam',
                                    'PYQ',
                                    'AI Report',
                                    'Merit List'
                                ].map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5">
                                        <Check className="w-4 h-4 text-[#FFB800] shrink-0" />
                                        <span className="text-gray-100 text-[14px] font-semibold tracking-wide leading-tight">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Discount Badge */}
                    <div className="w-full z-10 flex justify-center mb-2">
                        <div className="bg-red-500/90 text-white text-[11px] font-bold px-3 py-1 rounded-full animate-pulse border border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                            ⭐ GET 50% OFF ⭐
                        </div>
                    </div>

                    {/* CTA Button */}
                    <div className="w-full z-10 pb-2">
                        <button className="w-full flex flex-col items-center justify-center py-2 bg-gradient-to-b from-[#2178ff] to-[#0a4bb8] border border-blue-400/50 rounded-lg shadow-[0_4px_10px_rgba(10,75,184,0.4)] hover:scale-105 transition-transform duration-300">
                            <span className="text-white font-bold text-[16px] drop-shadow-md leading-none mb-1">Subscribe</span>
                            <span className="text-white font-bold text-[16px] drop-shadow-md leading-none">Today</span>
                        </button>
                    </div>
                </div>

                {/* Main Presentation Area */}
                <div 
                    className={`responsive-fonts flex-1 min-w-0 relative w-full h-full ${getBgThemeClasses()} flex flex-col shadow-2xl overflow-hidden shrink-0 z-10 xl:rounded-xl xl:border xl:border-gray-200 dark:border-gray-800 transition-colors duration-500`}
                    onPointerMove={(e) => {
                        if (isPenActive && drawingTool === 'laser') {
                            draw(e);
                        }
                    }}
                >

                    {/* Background Pattern Overlay */}
                    {bgTheme !== 'video' && (
                        <div
                            className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-300 ${getBgThemeOverlayClasses()}`}
                            style={{ opacity: bgOpacity / 100 }}
                        />
                    )}

                    {/* Video Background */}
                    {bgTheme === 'video' && (
                        <>
                            <video
                                key={selectedVideo}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover z-0 mix-blend-screen pointer-events-none"
                                style={{ opacity: videoOpacity / 100 }}
                            >
                                <source src={selectedVideo} type="video/mp4" />
                            </video>
                            <div className="absolute inset-0 w-full h-full z-0 pointer-events-none bg-[radial-gradient(rgba(255,255,255,0.15)_1.5px,transparent_1.5px)] [background-size:20px_20px]"></div>
                        </>
                    )}

                    {/* Main Drawing Canvas */}
                    <canvas
                        ref={canvasRef}
                        className={`absolute inset-0 w-full h-full z-20 pointer-events-none`}
                    />

                    {/* Active Stroke Canvas (Top Layer) */}
                    <canvas
                        ref={activeCanvasRef}
                        className={`absolute inset-0 w-full h-full z-30 touch-none ${isPenActive && drawingTool !== 'laser' ? 'pointer-events-auto cursor-none' : 'pointer-events-none'}`}
                        onPointerDown={startDrawing}
                        onPointerMove={draw}
                        onPointerUp={stopDrawing}
                        onPointerCancel={stopDrawing}
                        onPointerOut={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        onTouchCancel={stopDrawing}
                        onWheel={handleCanvasWheel}
                    />

                    {/* Custom Mouse Cursor for Presentation Tools */}
                    {isPenActive && (
                        <div
                            ref={cursorRef}
                            className="absolute z-40 pointer-events-none"
                            style={{
                                left: -100,
                                top: -100,
                                transform: 'translate(-50%, -50%)',
                                willChange: 'left, top',
                                ...(drawingTool === 'laser' ? {
                                    width: '16px',
                                    height: '16px',
                                    backgroundColor: '#ef4444',
                                    borderRadius: '50%',
                                    boxShadow: '0 0 15px 5px rgba(239,68,68,0.8)',
                                    border: '1px solid rgba(255,255,255,0.5)'
                                } : drawingTool === 'highlighter' ? {
                                    width: `${penSize * 5}px`,
                                    height: `${penSize * 5}px`,
                                    backgroundColor: penColor,
                                    opacity: 0.5,
                                    borderRadius: '50%',
                                    mixBlendMode: 'multiply'
                                } : {
                                    width: `${Math.max(penSize, 8)}px`,
                                    height: `${Math.max(penSize, 8)}px`,
                                    border: `2px solid ${penColor}`,
                                    borderRadius: '50%',
                                    backgroundColor: 'transparent'
                                })
                            }}
                        />
                    )}

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
                            {WATERMARK_POSITIONS.slice(0, wmCount).map((wm, i) => (
                                <div
                                    key={i}
                                    className="absolute font-black tracking-widest uppercase transition-all duration-300 whitespace-nowrap"
                                    style={{
                                        top: wm.top,
                                        left: wm.left,
                                        transform: `translate(-50%, -50%) rotate(${wm.rot}deg)`,
                                        fontSize: `${wmSize * wm.sizeScale}px`,
                                        color: `rgba(229, 231, 235, ${(wmOpacity * wm.opacScale * (isDarkMode ? 0.25 : 1)) / 100})`
                                    }}
                                >
                                    DESHEXAM
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Whiteboard Layer */}
                    {isWhiteboardMode && (
                        <div className={`absolute inset-0 z-[15] transition-colors duration-500 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`} />
                    )}

                    {/* Text Input Overlay */}
                    {textInput && (
                        <textarea
                            ref={textInputRef}
                            value={textInput.text}
                            onChange={(e) => setTextInput({ ...textInput, text: e.target.value })}
                            onBlur={finalizeText}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    finalizeText();
                                }
                            }}
                            style={{
                                left: textInput.x,
                                top: textInput.y,
                                color: penColor,
                                fontSize: `${Math.max(penSize * 3, 16)}px`,
                                fontWeight: 'bold',
                            }}
                            className="absolute z-[60] bg-transparent outline-none border-2 border-blue-400 border-dashed resize-none min-w-[200px] min-h-[40px] overflow-hidden leading-tight p-1"
                        />
                    )}

                    {/* Header */}
                    {showHeader && (
                        <div
                            className="shrink-0 bg-gradient-to-r from-indigo-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-b border-indigo-100/50 dark:border-gray-700/50 flex flex-col md:flex-row justify-between items-center w-full z-30 shadow-sm relative transition-all duration-500 px-3 md:px-6"
                            style={{
                                paddingTop: `${0.75 * headerScale}rem`,
                                paddingBottom: `${0.75 * headerScale}rem`,
                                gap: `${0.5 * headerScale}rem`
                            }}
                        >
                            {/* Logo Area */}
                            <div className="flex items-center w-full md:w-auto justify-between md:justify-start">
                                {showLogo && (
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <img src="/image/logo.png" alt="DeshExam" style={{ height: `${2.25 * headerScale}rem` }} className="w-auto object-contain drop-shadow-sm" />
                                        <div className="flex flex-col justify-center">
                                            <span className="font-extrabold text-indigo-950 dark:text-gray-100 leading-tight" style={{ fontSize: `${1.1 * headerScale}rem` }}>Desh Exam Academy</span>
                                            <span className="text-indigo-800/80 dark:text-gray-400 font-bold tracking-widest uppercase mt-0.5" style={{ fontSize: `${0.55 * headerScale}rem` }}>Learn • Practice • Succeed</span>
                                        </div>
                                    </div>
                                )}

                                {/* Mobile Actions */}
                                <div className="flex md:hidden items-center gap-2 shrink-0">
                                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full font-bold tracking-widest shadow-md flex items-center justify-center whitespace-nowrap" style={{ fontSize: `${0.7 * headerScale}rem`, padding: `${0.35 * headerScale}rem ${0.8 * headerScale}rem` }}>
                                        MOCK TEST
                                    </div>
                                    <button onClick={closePresentation} className="bg-white/90 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 rounded-full text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-gray-600 transition-colors flex items-center justify-center shrink-0" style={{ width: `${2.2 * headerScale}rem`, height: `${2.2 * headerScale}rem` }}>
                                        <X style={{ width: `${1.2 * headerScale}rem`, height: `${1.2 * headerScale}rem` }} strokeWidth={2.5} />
                                    </button>
                                </div>
                            </div>

                            {/* Title Area */}
                            <div className={`flex-1 w-full md:px-6 flex flex-col justify-center ${headerTitleAlign === 'left' ? 'items-start text-left' :
                                headerTitleAlign === 'right' ? 'items-end text-right' :
                                    'items-center text-center'
                                }`}>
                                <h1 className="font-extrabold text-indigo-950 dark:text-gray-100 tracking-tight line-clamp-1 md:line-clamp-none" style={{ fontSize: `${1.1 * headerScale * headerTitleScale}rem` }}>{classLine}</h1>
                                {(chapterName || topicName) && (
                                    <div className="text-indigo-700 dark:text-gray-400 font-bold tracking-wider uppercase mt-1" style={{ fontSize: `${0.75 * headerScale * headerTitleScale}rem` }}>
                                        {[chapterName, topicName].filter(Boolean).join(' | ')}
                                    </div>
                                )}
                            </div>

                            {/* Desktop Actions */}
                            <div className="hidden md:flex items-center gap-3 justify-end shrink-0">
                                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full font-extrabold tracking-widest shadow-md flex items-center justify-center whitespace-nowrap" style={{ fontSize: `${0.85 * headerScale}rem`, padding: `${0.5 * headerScale}rem ${1.25 * headerScale}rem` }}>
                                    MOCK TEST
                                </div>
                                <button onClick={closePresentation} className="bg-white/90 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 rounded-full text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-gray-600 transition-all hover:scale-105 flex items-center justify-center shrink-0" style={{ width: `${2.75 * headerScale}rem`, height: `${2.75 * headerScale}rem` }} title="Close Presentation">
                                    <X style={{ width: `${1.4 * headerScale}rem`, height: `${1.4 * headerScale}rem` }} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Hidden Audio Elements */}
                    <audio ref={lofiAudioRef} src={selectedMusic} loop />
                    <audio ref={popAudioRef} src="/audio/correct-pop.mp3" preload="auto" />
                    <audio ref={wowAudioRef} src="/audio/wow.mp3" preload="auto" />

                    {/* Main Content Area */}
                    <div ref={scrollContainerRef} className="flex-1 w-full relative flex flex-col items-center px-4 md:px-24 py-6 md:py-12 z-10 overflow-y-auto custom-scrollbar gap-8">

                        {/* Floating Controls (Timer & Read Aloud) */}
                        <div
                            className={`absolute bottom-20 right-4 md:bottom-28 md:right-10 flex items-stretch gap-2 md:gap-3 z-[60]`}
                            style={{ transform: `translate(${timerPos.x}px, ${timerPos.y}px)` }}
                        >
                            {isTimerEnabled && (
                                <div
                                    className={`flex items-center gap-1.5 md:gap-3 px-3 py-1.5 md:px-5 md:py-2.5 rounded-xl md:rounded-2xl backdrop-blur-xl border select-none transition-all duration-300 font-mono text-lg md:text-[26px] font-black tracking-widest ${step >= 1
                                        ? 'bg-gray-100/90 dark:bg-gray-800/90 border-gray-200/50 dark:border-gray-700/50 text-gray-400 dark:text-gray-500 shadow-sm'
                                        : 'bg-white/95 dark:bg-gray-800/95 border-blue-200/60 dark:border-blue-900/60 text-[#1e3a8a] dark:text-blue-100 shadow-[0_8px_32px_rgba(59,130,246,0.15)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] ring-1 ring-blue-100 dark:ring-blue-900/50'
                                        } ${isDraggingTimer ? 'cursor-grabbing scale-105 shadow-[0_16px_48px_rgba(59,130,246,0.25)] ring-blue-300 dark:ring-blue-700' : 'cursor-grab hover:shadow-[0_12px_40px_rgba(59,130,246,0.2)] hover:scale-[1.02]'}`}
                                    onPointerDown={handleTimerPointerDown}
                                    onPointerMove={handleTimerPointerMove}
                                    onPointerUp={handleTimerPointerUp}
                                    onPointerCancel={handleTimerPointerUp}
                                >
                                    <div className="relative flex items-center justify-center shrink-0">
                                        <Clock className={`w-5 h-5 md:w-7 md:h-7 transition-colors duration-300 ${step >= 1 ? 'text-gray-400 dark:text-gray-500' : 'text-blue-600 dark:text-blue-400'} pointer-events-none`} />
                                        {step === 0 && (
                                            <span className="absolute -top-1 -right-1 flex h-2 w-2 md:h-2.5 md:w-2.5 pointer-events-none">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 md:h-2.5 md:w-2.5 bg-red-500"></span>
                                            </span>
                                        )}
                                    </div>
                                    <span className="pointer-events-none drop-shadow-sm flex items-center w-[60px] md:w-[90px] justify-center">
                                        {String(Math.floor(timerSeconds / 60)).padStart(2, '0')}
                                        <span className={`${step === 0 && timerSeconds % 2 === 0 ? 'opacity-100' : step === 0 ? 'opacity-50' : 'opacity-100'} transition-opacity duration-300 mx-0.5`}>:</span>
                                        {String(timerSeconds % 60).padStart(2, '0')}
                                    </span>
                                </div>
                            )}


                        </div>

                        {/* Zoomable Content Wrapper */}
                        <div
                            className="w-full flex flex-col items-center flex-1 transition-transform duration-100 ease-out"
                            style={isMagnified ? { transform: 'scale(1.7)', transformOrigin: `${magnifierPos.x}% ${magnifierPos.y}%` } : {}}
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentSlide}
                                    initial={{ opacity: 0, x: 40 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -40 }}
                                    transition={{ duration: animSpeed, ease: 'easeOut' }}
                                    className="w-full flex flex-col items-center flex-1"
                                >

                                    {/* Question */}
                                    <div 
                                        className={`flex items-start gap-3 md:gap-4 w-full max-w-5xl mt-8 md:mt-2 transition-all duration-300 ${qBgColor !== 'transparent' ? `${qBgColor} p-4 md:p-6 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-md shadow-lg` : ''}`}
                                        style={{ 
                                            '--q-color': qTextColor !== 'default' ? qTextColor : undefined,
                                            ...(qBgColor !== 'transparent' && bgTheme === 'dots' ? {
                                                backgroundImage: `radial-gradient(${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'} 1.5px, transparent 1.5px)`,
                                                backgroundSize: '16px 16px'
                                            } : qBgColor !== 'transparent' && bgTheme === 'grid' ? {
                                                backgroundImage: `linear-gradient(to right, ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'} 1px, transparent 1px), linear-gradient(to bottom, ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'} 1px, transparent 1px)`,
                                                backgroundSize: '16px 16px'
                                            } : {
                                                backgroundImage: 'none',
                                                backgroundSize: 'auto'
                                            })
                                        } as unknown as React.CSSProperties}
                                    >
                                        <span className={`font-extrabold leading-normal shrink-0 ${bgTheme === 'video' ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]' : 'text-indigo-600 dark:text-indigo-400 drop-shadow-sm'}`} style={{ fontSize: 'var(--q-size)' }}>Q{currentSlide + 1}.</span>
                                        <div className={`prose max-w-none prose-p:font-extrabold text-[length:var(--q-size)] leading-normal text-left font-extrabold capitalize [&_*]:!text-[length:var(--q-size)] [&_*]:!leading-normal [&_*]:!m-0 ${qTextColor !== 'default' ? 'text-[var(--q-color)] [&_*]:!text-[var(--q-color)] drop-shadow-sm [&_*]:!drop-shadow-sm' : (bgTheme === 'video' ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] [&_*]:!text-white [&_*]:!drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]' : 'text-black dark:text-gray-100 [&_*]:!text-black dark:[&_*]:!text-gray-100')}`}>
                                            <ReactMarkdown remarkPlugins={remarkPluginsList} rehypePlugins={rehypePluginsList}>
                                                {q.questionText}
                                            </ReactMarkdown>
                                        </div>
                                    </div>

                                    {/* Options */}
                                    <motion.div
                                        className={optionsLayout === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 w-full max-w-6xl mt-12 md:mt-16" : "flex flex-col gap-y-3 w-[90%] md:w-fit md:min-w-[500px] max-w-5xl mt-12 md:mt-12 mx-auto"}
                                        initial="hidden"
                                        animate="visible"
                                        variants={{
                                            hidden: {},
                                            visible: { transition: { staggerChildren: animSpeed / 2 } }
                                        }}
                                    >
                                        {parsedOptions.length > 0 && parsedOptions.map((opt: { key: string, text: string }, oIdx: number) => {
                                            const isCorrect = q.correctAnswer && q.correctAnswer.toLowerCase().includes(opt.key);
                                            const optLetter = q.language === 'Bangla' || !q.language ? bnOptionsMap[opt.key] : opt.key.toUpperCase();

                                            const showCorrect = step >= 1 && isCorrect;
                                            const showWrong = step >= 1 && !isCorrect;
                                            const isSelected = selectedOption === opt.key;

                                            // Colors closely matching the image
                                            const colorThemes = [
                                                { border: 'border-[#4285F4]/50', bg: 'bg-white dark:bg-gray-800/90', letterBg: 'bg-[#4285F4]/75', letterText: 'text-white' }, // Blue
                                                { border: 'border-[#34A853]/50', bg: 'bg-white dark:bg-gray-800/90', letterBg: 'bg-[#34A853]/75', letterText: 'text-white' }, // Green
                                                { border: 'border-[#F9AB00]/50', bg: 'bg-white dark:bg-gray-800/90', letterBg: 'bg-[#F9AB00]/75', letterText: 'text-white' }, // Yellow/Orange
                                                { border: 'border-[#EA4335]/50', bg: 'bg-white dark:bg-gray-800/90', letterBg: 'bg-[#EA4335]/75', letterText: 'text-white' }, // Red
                                                { border: 'border-[#9C27B0]/50', bg: 'bg-white dark:bg-gray-800/90', letterBg: 'bg-[#9C27B0]/75', letterText: 'text-white' }, // Purple
                                            ];

                                            const theme = colorThemes[oIdx % colorThemes.length];

                                            let containerClasses = `flex items-center gap-3 md:gap-4 py-1.5 px-3 rounded-lg border-2 transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.04)] ${theme.bg} ${theme.border}`;
                                            let letterClasses = `shrink-0 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full text-lg md:text-xl font-black transition-colors duration-300 ${theme.letterBg} ${theme.letterText}`;

                                            if (step === 0) {
                                                if (eliminatedOptions.includes(opt.key)) {
                                                    containerClasses = `flex items-center gap-3 md:gap-4 py-1.5 px-3 rounded-lg border-2 transition-all duration-300 opacity-40 grayscale border-gray-300 bg-gray-50 dark:bg-gray-800/50`;
                                                    letterClasses = `shrink-0 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full text-lg md:text-xl font-black transition-colors duration-300 bg-gray-300 text-gray-500`;
                                                } else if (isSelected) {
                                                    containerClasses = `flex items-center gap-3 md:gap-4 py-1.5 px-3 rounded-lg border-2 transition-all duration-300 shadow-[0_8px_20px_rgba(66,133,244,0.15)] bg-[#e8f0fe] dark:bg-[#4285F4]/20 border-[#4285F4] transform scale-[1.02] cursor-pointer ring-2 ring-[#4285F4]/30`;
                                                    letterClasses = `shrink-0 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full text-lg md:text-xl font-black transition-colors duration-300 bg-[#4285F4] text-white`;
                                                } else {
                                                    containerClasses += ` hover:scale-[1.01] hover:shadow-md cursor-pointer hover:border-gray-300`;
                                                }
                                            } else {
                                                if (showCorrect) {
                                                    containerClasses = `flex items-center gap-3 md:gap-4 py-1.5 px-3 rounded-lg border-2 ring-4 ring-[#34A853]/30 bg-[#f0fdf4] dark:bg-[#34A853]/20 border-[#34A853] z-10 relative animate-pop-in`;
                                                    letterClasses = `shrink-0 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full text-lg md:text-xl font-black transition-colors duration-300 bg-[#34A853] text-white`;
                                                } else if (showWrong && isSelected) {
                                                    containerClasses = `flex items-center gap-3 md:gap-4 py-1.5 px-3 rounded-lg border-2 transition-all duration-300 shadow-[0_8px_20px_rgba(234,67,53,0.15)] bg-[#fce8e6] dark:bg-[#EA4335]/20 border-[#EA4335] transform scale-[1.02]`;
                                                    letterClasses = `shrink-0 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full text-lg md:text-xl font-black transition-colors duration-300 bg-[#EA4335] text-white`;
                                                } else if (showWrong) {
                                                    containerClasses = `flex items-center gap-3 md:gap-4 py-1.5 px-3 rounded-lg border-2 transition-all duration-300 shadow-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60`;
                                                    // letterClasses keeps its default theme color
                                                }
                                            }
                                            return (
                                                <motion.div
                                                    key={opt.key}
                                                    variants={{
                                                        hidden: { opacity: 0, y: 20 },
                                                        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 14 } }
                                                    }}
                                                    className="flex flex-col gap-2 w-full relative"
                                                >
                                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
                                                        <Confetti active={isConfettiActive && isSelected && showCorrect} config={CONFETTI_CONFIG} />
                                                    </div>
                                                    <div
                                                        className={containerClasses}
                                                        style={{
                                                            ...(bgTheme === 'dots' ? {
                                                                backgroundImage: `radial-gradient(${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'} 1.5px, transparent 1.5px)`,
                                                                backgroundSize: '12px 12px'
                                                            } : bgTheme === 'grid' ? {
                                                                backgroundImage: `linear-gradient(to right, ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'} 1px, transparent 1px), linear-gradient(to bottom, ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'} 1px, transparent 1px)`,
                                                                backgroundSize: '12px 12px'
                                                            } : {
                                                                backgroundImage: 'none',
                                                                backgroundSize: 'auto'
                                                            })
                                                        }}
                                                        onContextMenu={(e) => {
                                                            e.preventDefault();
                                                            if (step === 0) {
                                                                setEliminatedOptions(prev =>
                                                                    prev.includes(opt.key) ? prev.filter(k => k !== opt.key) : [...prev, opt.key]
                                                                );
                                                            }
                                                        }}
                                                        onClick={() => {
                                                            if (step === 0) {
                                                                if (eliminatedOptions.includes(opt.key)) return;
                                                                setSelectedOption(opt.key);
                                                                setStep(1);

                                                                // Trigger confetti and sound if correct
                                                                if (q.correctAnswer && q.correctAnswer.toLowerCase().trim().includes(opt.key)) {
                                                                    const newConsecutive = consecutiveCorrect + 1;
                                                                    setConsecutiveCorrect(newConsecutive);
                                                                    setIsConfettiActive(true);

                                                                    if (newConsecutive > 0 && newConsecutive % 5 === 0) {
                                                                        // Play WOW sound every 5 consecutive correct answers
                                                                        if (wowAudioRef.current) {
                                                                            wowAudioRef.current.currentTime = 0;
                                                                            wowAudioRef.current.play().catch(e => console.warn('Wow audio failed:', e));
                                                                        }
                                                                    } else {
                                                                        // Normal pop sound
                                                                        if (popAudioRef.current) {
                                                                            popAudioRef.current.currentTime = 0;
                                                                            popAudioRef.current.play().catch(e => console.warn('Pop audio failed:', e));
                                                                        }
                                                                    }
                                                                    setTimeout(() => setIsConfettiActive(false), 2000);
                                                                } else {
                                                                    // Reset on wrong answer
                                                                    setConsecutiveCorrect(0);
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <div className={letterClasses}>
                                                            {optLetter}
                                                        </div>
                                                        <div className={`prose dark:prose-invert max-w-none text-black dark:text-gray-100 [&>p]:m-0 [&>p]:text-[length:var(--opt-size)] [&>p]:font-semibold [&>p]:leading-snug flex-1 capitalize ${eliminatedOptions.includes(opt.key) && step === 0 ? 'line-through opacity-50' : ''}`}>
                                                            <ReactMarkdown remarkPlugins={remarkPluginsList} rehypePlugins={rehypePluginsList}>
                                                                {opt.text}
                                                            </ReactMarkdown>
                                                        </div>

                                                        {step >= 1 && showCorrect && (
                                                            <motion.div
                                                                initial={{ x: -200, opacity: 0, scale: 0.5 }}
                                                                animate={{ x: 0, opacity: 1, scale: 1 }}
                                                                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                                                                className="shrink-0 text-white bg-[#34A853] rounded-full p-1.5 shadow-sm relative z-20"
                                                            >
                                                                <Check className="w-7 h-7 stroke-[3]" />
                                                            </motion.div>
                                                        )}
                                                        {step >= 1 && showWrong && isSelected && (
                                                            <motion.div
                                                                initial={{ x: -200, opacity: 0, scale: 0.5 }}
                                                                animate={{ x: 0, opacity: 1, scale: 1 }}
                                                                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                                                                className="shrink-0 text-white bg-[#EA4335] rounded-full p-1.5 shadow-sm relative z-20"
                                                            >
                                                                <X className="w-7 h-7 stroke-[3]" />
                                                            </motion.div>
                                                        )}
                                                    </div>

                                                    {/* Option Explanation */}
                                                    {step >= 2 && isOptionExpEnabled && q.optionExplanations?.[opt.key] && (
                                                        <div
                                                            className="ml-4 mt-2 pl-4 pr-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-50/90 dark:bg-gray-800/90 rounded-xl border-l-4 border-l-[#4285F4] shadow-sm animate-in fade-in duration-500 prose dark:prose-invert max-w-none [&>p]:m-0 [&_*]:!text-[length:var(--exp-size)]"
                                                            style={{ fontSize: 'var(--exp-size)' }}
                                                        >
                                                            <ReactMarkdown remarkPlugins={remarkPluginsList} rehypePlugins={rehypePluginsList}>
                                                                {q.optionExplanations[opt.key]}
                                                            </ReactMarkdown>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </motion.div>

                                    {/* Explanation */}
                                    {step >= 2 && q.explanation && isExpEnabled && (
                                        <div className="w-full max-w-5xl mt-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-xl relative overflow-hidden transition-colors duration-500">
                                                {/* Small colored accent line on the left */}
                                                <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#34A853]"></div>

                                                <div className="text-[#34A853] font-bold text-xl mb-3 flex items-center gap-2 pl-4">
                                                    <span className="text-2xl">💡</span>
                                                    Explanation
                                                </div>
                                                <div
                                                    className="prose prose-xl dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 pl-4 font-medium [&_*]:!text-[length:var(--exp-size)] [&_*]:!leading-relaxed"
                                                    style={{ fontSize: 'var(--exp-size)' }}
                                                >
                                                    <ReactMarkdown remarkPlugins={remarkPluginsList} rehypePlugins={rehypePluginsList}>
                                                        {q.explanation}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="shrink-0 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 border-t border-indigo-100 dark:border-gray-700 py-2 px-2 md:pl-12 md:pr-8 flex justify-between items-center w-full z-30 shadow-[0_-2px_10px_rgba(0,0,0,0.02)] relative transition-colors duration-500 overflow-visible">
                        <div className="flex items-center text-indigo-900/70 dark:text-gray-400 font-semibold text-sm md:text-lg whitespace-nowrap mr-2 md:mr-4">
                            © DeshExam
                        </div>
                        <div className="hidden lg:flex items-center text-indigo-900/70 dark:text-gray-400 font-semibold text-lg tracking-wide whitespace-nowrap">
                            www.deshexam.com
                        </div>

                        <div className="flex items-center gap-2 md:gap-4 lg:gap-8 ml-auto w-full md:w-auto justify-between md:justify-end">
                            <div className="flex items-center gap-2 md:gap-4">
                                {/* Read Aloud Toggle Button (Footer) */}
                                <button
                                    onClick={() => handleReadAloud()}
                                    className={`p-2 md:p-3 rounded-full transition-all shadow-sm shrink-0 ${isSpeaking ? 'bg-indigo-600 text-white ring-2 ring-indigo-300' : 'bg-white/60 hover:bg-white text-indigo-600 dark:bg-gray-700/60 dark:hover:bg-gray-700 dark:text-gray-300'}`}
                                    title={isSpeaking ? "Stop Reading (R)" : "Read Aloud (R)"}
                                >
                                    {isSpeaking ? <Pause className="w-5 h-5 md:w-6 md:h-6 fill-current" /> : <Play className="w-5 h-5 md:w-6 md:h-6 fill-current" />}
                                </button>

                                {/* Dark Mode Toggle Button */}
                                <button
                                    onClick={() => setIsDarkMode(!isDarkMode)}
                                    className="p-2 md:p-3 rounded-full transition-all shadow-sm bg-white/60 hover:bg-white text-indigo-600 dark:bg-gray-700/60 dark:hover:bg-gray-700 dark:text-gray-300 shrink-0"
                                    title="Toggle Dark Mode (Shift+N)"
                                >
                                    {isDarkMode ? <Sun className="w-5 h-5 md:w-6 md:h-6" /> : <Moon className="w-5 h-5 md:w-6 md:h-6" />}
                                </button>
                                {/* Fullscreen Toggle Button */}
                                <button
                                    onClick={toggleFullscreen}
                                    className="p-2 md:p-3 rounded-full transition-all shadow-sm bg-white/60 hover:bg-white text-indigo-600 shrink-0"
                                    title="Toggle Fullscreen (F11)"
                                >
                                    {isFullscreen ? <Minimize className="w-5 h-5 md:w-6 md:h-6" /> : <Maximize className="w-5 h-5 md:w-6 md:h-6" />}
                                </button>

                                {/* Print Button */}
                                <button
                                    onClick={() => window.print()}
                                    className="hidden md:block p-2 md:p-3 rounded-full transition-all shadow-sm bg-white/60 hover:bg-white text-indigo-600 shrink-0"
                                    title="Print Slides (Ctrl+P)"
                                >
                                    <Printer className="w-5 h-5 md:w-6 md:h-6" />
                                </button>

                                {/* Spotlight Toggle Button */}
                                <button
                                    onClick={() => setIsSpotlightActive(!isSpotlightActive)}
                                    className={`hidden sm:block p-2 md:p-3 rounded-full transition-all shadow-sm shrink-0 ${isSpotlightActive ? 'bg-yellow-500 text-white ring-2 ring-yellow-300' : 'bg-white/60 hover:bg-white text-indigo-600'}`}
                                    title="Toggle Spotlight (Shift+F)"
                                >
                                    <Focus className="w-5 h-5 md:w-6 md:h-6" />
                                </button>

                                {/* Whiteboard Toggle Button */}
                                <button
                                    onClick={() => setIsWhiteboardMode(!isWhiteboardMode)}
                                    className={`hidden md:block p-2 md:p-3 rounded-full transition-all shadow-sm shrink-0 ${isWhiteboardMode ? 'bg-indigo-600 text-white ring-2 ring-indigo-300' : 'bg-white/60 hover:bg-white text-indigo-600'}`}
                                    title="Toggle Whiteboard Mode (Shift+W)"
                                >
                                    <Presentation className="w-5 h-5 md:w-6 md:h-6" />
                                </button>

                                {/* Pen Toggle Button */}
                                <button
                                    onClick={() => setIsPenActive(!isPenActive)}
                                    className={`p-2 md:p-3 rounded-full transition-all shadow-sm shrink-0 ${isPenActive ? 'bg-red-500 text-white ring-2 ring-red-300' : 'bg-white/60 hover:bg-white text-indigo-600'}`}
                                    title="Toggle Pen Tool (Shift+D)"
                                >
                                    <Pen className="w-5 h-5 md:w-6 md:h-6" />
                                </button>

                                {/* Keyboard Shortcuts Toggle Button */}
                                <div className="relative shrink-0 hidden md:block">
                                    <button
                                        onClick={() => setIsShortcutsOpen(!isShortcutsOpen)}
                                        className={`p-2 md:p-3 rounded-full transition-all shadow-sm ${isShortcutsOpen ? 'bg-indigo-600 text-white ring-2 ring-indigo-300' : 'bg-white/60 hover:bg-white text-indigo-600 dark:bg-gray-700/60 dark:hover:bg-gray-700 dark:text-gray-300'}`}
                                        title="Keyboard Shortcuts (Shift+?)"
                                    >
                                        <Keyboard className="w-5 h-5 md:w-6 md:h-6" />
                                    </button>

                                    {isShortcutsOpen && (
                                        <div className="fixed bottom-[80px] left-1/2 -translate-x-1/2 md:absolute md:bottom-full md:left-auto md:right-0 md:translate-x-0 md:mb-4 bg-white/95 backdrop-blur-xl border border-white/40 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] ring-1 ring-gray-900/5 p-5 w-[90vw] sm:w-[400px] z-50 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[70vh] md:max-h-[60vh]">
                                            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100 shrink-0">
                                                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                                    <Keyboard className="w-5 h-5 text-gray-500" /> Keyboard Shortcuts
                                                </h3>
                                                <button onClick={() => setIsShortcutsOpen(false)} className="p-1 text-gray-400 hover:bg-gray-100 rounded-full hover:text-gray-700 transition-colors">
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                            <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2 pb-2 text-sm text-gray-700">
                                                <div className="flex justify-between items-center border-b border-gray-50 pb-2"><span className="font-medium">Toggle Shortcuts</span><kbd className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded font-mono text-xs">Shift + ?</kbd></div>
                                                <div className="flex justify-between items-center border-b border-gray-50 pb-2"><span className="font-medium">Next / Previous</span><kbd className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded font-mono text-xs">← / →</kbd></div>
                                                <div className="flex justify-between items-center border-b border-gray-50 pb-2"><span className="font-medium">Select Option A-E</span><kbd className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded font-mono text-xs">A - E</kbd></div>
                                                <div className="flex justify-between items-center border-b border-gray-50 pb-2"><span className="font-medium">Read Aloud</span><kbd className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded font-mono text-xs">Shift + R</kbd></div>
                                                <div className="flex justify-between items-center border-b border-gray-50 pb-2"><span className="font-medium">Auto-Play Read Aloud</span><kbd className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded font-mono text-xs">Shift + A</kbd></div>
                                                <div className="flex justify-between items-center border-b border-gray-50 pb-2"><span className="font-medium">Toggle Timer</span><kbd className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded font-mono text-xs">T</kbd></div>
                                                <div className="flex justify-between items-center border-b border-gray-50 pb-2"><span className="font-medium">Toggle Dark Mode</span><kbd className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded font-mono text-xs">Shift + N</kbd></div>
                                                <div className="flex justify-between items-center border-b border-gray-50 pb-2"><span className="font-medium">Toggle Fullscreen</span><kbd className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded font-mono text-xs">F11</kbd></div>
                                                <div className="flex justify-between items-center border-b border-gray-50 pb-2"><span className="font-medium">Toggle Settings</span><kbd className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded font-mono text-xs">S</kbd></div>
                                                <div className="flex justify-between items-center border-b border-gray-50 pb-2"><span className="font-medium">Toggle Spotlight</span><kbd className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded font-mono text-xs">Shift + F</kbd></div>
                                                <div className="flex justify-between items-center border-b border-gray-50 pb-2"><span className="font-medium">Whiteboard Mode</span><kbd className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded font-mono text-xs">Shift + W</kbd></div>
                                                <div className="flex justify-between items-center border-b border-gray-50 pb-2"><span className="font-medium">Toggle Pen Tool</span><kbd className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded font-mono text-xs">Shift + D</kbd></div>
                                                <div className="flex justify-between items-center border-b border-gray-50 pb-2"><span className="font-medium">Show Explanation</span><kbd className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded font-mono text-xs">Shift + X</kbd></div>
                                                <div className="flex justify-between items-center pb-2"><span className="font-medium">Show Option Explanations</span><kbd className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded font-mono text-xs">Shift + O</kbd></div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Settings Dropdown */}
                                <div className="relative shrink-0">
                                    <button
                                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                        className={`p-2 md:p-3 rounded-full transition-all shadow-sm ${isSettingsOpen ? 'bg-indigo-600 text-white ring-2 ring-indigo-300' : 'bg-white/60 hover:bg-white text-indigo-600'}`}
                                        title="Display Settings"
                                    >
                                        <Settings className={`w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 ${isSettingsOpen ? 'rotate-90' : ''}`} />
                                    </button>

                                    {isSettingsOpen && (
                                        <div className="fixed bottom-[80px] left-1/2 -translate-x-1/2 md:absolute md:bottom-full md:left-auto md:right-0 md:translate-x-0 md:mb-4 bg-white/95 backdrop-blur-xl border border-white/40 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] ring-1 ring-gray-900/5 p-5 w-[90vw] sm:w-[340px] z-50 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[70vh] md:max-h-[60vh]">
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
                                                    <div className="text-sm font-bold text-gray-700 mb-2 flex justify-between items-center">
                                                        <span className="flex items-center gap-2"><MonitorPlay className="w-4 h-4 text-indigo-500" /> Presentation Mode</span>
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
                                                    <div className="text-sm font-bold text-gray-700 mb-2 flex justify-between items-center">
                                                        <span className="flex items-center gap-2"><LayoutGrid className="w-4 h-4 text-indigo-500" /> Options Layout</span>
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

                                                <div>
                                                    <div className="text-sm font-bold text-gray-700 mb-2 flex justify-between items-center">
                                                        <span className="flex items-center gap-2"><LayoutGrid className="w-4 h-4 text-indigo-500" /> Header Settings</span>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-bold text-gray-500">Show Header</span>
                                                            <button onClick={() => setShowHeader(!showHeader)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${showHeader ? 'bg-blue-600' : 'bg-gray-300'}`}>
                                                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${showHeader ? 'translate-x-5' : 'translate-x-1'}`} />
                                                            </button>
                                                        </div>
                                                        {showHeader && (
                                                            <>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-xs font-bold text-gray-500">Show Logo</span>
                                                                    <button onClick={() => setShowLogo(!showLogo)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${showLogo ? 'bg-blue-600' : 'bg-gray-300'}`}>
                                                                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${showLogo ? 'translate-x-5' : 'translate-x-1'}`} />
                                                                    </button>
                                                                </div>
                                                                <div className="flex items-center gap-3 bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-200">
                                                                    <span className="text-xs font-bold text-gray-500 min-w-[50px]">Scale</span>
                                                                    <input
                                                                        type="range" min="0.5" max="1.5" step="0.1"
                                                                        value={headerScale} onChange={(e) => setHeaderScale(Number(e.target.value))}
                                                                        className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                                                    />
                                                                    <span className="text-xs font-bold text-gray-500 w-8 text-right">{(headerScale * 100).toFixed(0)}%</span>
                                                                </div>
                                                                <div className="flex items-center gap-3 bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-200">
                                                                    <span className="text-xs font-bold text-gray-500 min-w-[50px]">Text Size</span>
                                                                    <input
                                                                        type="range" min="0.5" max="2.5" step="0.1"
                                                                        value={headerTitleScale} onChange={(e) => setHeaderTitleScale(Number(e.target.value))}
                                                                        className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                                                    />
                                                                    <span className="text-xs font-bold text-gray-500 w-8 text-right">{(headerTitleScale * 100).toFixed(0)}%</span>
                                                                </div>
                                                                <div className="flex flex-col gap-1.5 bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-200">
                                                                    <span className="text-xs font-bold text-gray-500">Text Alignment</span>
                                                                    <div className="flex items-center justify-between gap-2">
                                                                        <button onClick={() => setHeaderTitleAlign('left')} className={`flex-1 py-1 rounded text-xs font-bold transition-colors ${headerTitleAlign === 'left' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>Left</button>
                                                                        <button onClick={() => setHeaderTitleAlign('center')} className={`flex-1 py-1 rounded text-xs font-bold transition-colors ${headerTitleAlign === 'center' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>Center</button>
                                                                        <button onClick={() => setHeaderTitleAlign('right')} className={`flex-1 py-1 rounded text-xs font-bold transition-colors ${headerTitleAlign === 'right' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>Right</button>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                <hr className="border-gray-100" />

                                                <div>
                                                    <div className="text-sm font-bold text-gray-700 mb-2 flex justify-between items-center">
                                                        <span className="flex items-center gap-2"><Play className="w-4 h-4 text-indigo-500" /> Animation Speed</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-200">
                                                        <input
                                                            type="range"
                                                            min="0.1"
                                                            max="2.0"
                                                            step="0.1"
                                                            value={animSpeed}
                                                            onChange={(e) => setAnimSpeed(Number(e.target.value))}
                                                            className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                                        />
                                                        <span className="text-xs font-bold text-gray-500 w-8 text-right">{animSpeed.toFixed(1)}s</span>
                                                    </div>
                                                </div>

                                                <hr className="border-gray-100" />

                                                <div>
                                                    <div className="text-sm font-bold text-gray-700 mb-2 flex justify-between items-center">
                                                        <span className="flex items-center gap-2"><LayoutGrid className="w-4 h-4 text-indigo-500" /> Background Theme</span>
                                                    </div>
                                                    <div className="flex bg-gray-100 p-1 rounded-xl flex-wrap gap-1">
                                                        <button onClick={() => setBgTheme('default')} className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-colors ${bgTheme === 'default' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Default</button>
                                                        <button onClick={() => setBgTheme('mesh')} className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-colors ${bgTheme === 'mesh' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Mesh</button>
                                                        <button onClick={() => setBgTheme('grid')} className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-colors ${bgTheme === 'grid' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Grid</button>
                                                        <button onClick={() => setBgTheme('dots')} className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-colors ${bgTheme === 'dots' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Dots</button>
                                                        <button onClick={() => setBgTheme('video')} className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-colors ${bgTheme === 'video' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Video</button>
                                                    </div>
                                                    {bgTheme === 'video' && (
                                                        <div className="mt-2 space-y-2">
                                                            <select
                                                                value={selectedVideo}
                                                                onChange={(e) => setSelectedVideo(e.target.value)}
                                                                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500 text-gray-700 font-semibold"
                                                            >
                                                                {VIDEO_OPTIONS.map(opt => (
                                                                    <option key={opt.id} value={opt.url}>{opt.name}</option>
                                                                ))}
                                                            </select>
                                                            <div className="flex items-center gap-3 bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-200">
                                                                <Sun className="w-4 h-4 text-gray-400 shrink-0" />
                                                                <input
                                                                    type="range"
                                                                    min="5"
                                                                    max="100"
                                                                    value={videoOpacity}
                                                                    onChange={(e) => setVideoOpacity(Number(e.target.value))}
                                                                    className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                                                />
                                                                <span className="text-xs font-bold text-gray-500 w-8 text-right">{videoOpacity}%</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {bgTheme !== 'video' && (
                                                        <div className="mt-2 flex items-center gap-3 bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-200">
                                                            <Sun className="w-4 h-4 text-gray-400 shrink-0" />
                                                            <input
                                                                type="range"
                                                                min="0"
                                                                max="100"
                                                                value={bgOpacity}
                                                                onChange={(e) => setBgOpacity(Number(e.target.value))}
                                                                className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                                            />
                                                            <span className="text-xs font-bold text-gray-500 w-8 text-right">{bgOpacity}%</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <hr className="border-gray-100" />

                                                <div>
                                                    <div className="text-sm font-bold text-gray-700 mb-2 flex justify-between items-center">
                                                        <span className="flex items-center gap-2"><Highlighter className="w-4 h-4 text-indigo-500" /> Question Styling</span>
                                                    </div>
                                                    <div className="space-y-3">
                                                        {/* Background Color */}
                                                        <div className="flex items-center gap-2 bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-200">
                                                            <span className="text-[10px] font-bold text-gray-500 min-w-[50px] uppercase">Bg Color:</span>
                                                            <div className="flex gap-1.5 flex-1 justify-end">
                                                                <button onClick={() => setQBgColor('transparent')} className={`w-5 h-5 rounded-full border-2 ${qBgColor === 'transparent' ? 'border-blue-500' : 'border-transparent'} relative`} title="Transparent">
                                                                    <div className="absolute inset-0 rounded-full bg-transparent overflow-hidden border border-gray-300">
                                                                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%, #e5e7eb), repeating-linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%, #e5e7eb)', backgroundPosition: '0 0, 3px 3px', backgroundSize: '6px 6px' }}></div>
                                                                    </div>
                                                                </button>
                                                                <button onClick={() => setQBgColor('bg-white/90 dark:bg-gray-800/90')} className={`w-5 h-5 rounded-full border border-gray-300 bg-white shadow-sm ring-2 ${qBgColor === 'bg-white/90 dark:bg-gray-800/90' ? 'ring-blue-500' : 'ring-transparent'}`} title="White/Dark"></button>
                                                                <button onClick={() => setQBgColor('bg-blue-50/90 dark:bg-blue-900/50')} className={`w-5 h-5 rounded-full border border-blue-200 bg-blue-100 shadow-sm ring-2 ${qBgColor === 'bg-blue-50/90 dark:bg-blue-900/50' ? 'ring-blue-500' : 'ring-transparent'}`} title="Blue"></button>
                                                                <button onClick={() => setQBgColor('bg-indigo-50/90 dark:bg-indigo-900/50')} className={`w-5 h-5 rounded-full border border-indigo-200 bg-indigo-100 shadow-sm ring-2 ${qBgColor === 'bg-indigo-50/90 dark:bg-indigo-900/50' ? 'ring-blue-500' : 'ring-transparent'}`} title="Indigo"></button>
                                                                <button onClick={() => setQBgColor('bg-black/50 dark:bg-black/80')} className={`w-5 h-5 rounded-full border border-gray-700 bg-gray-900 shadow-sm ring-2 ${qBgColor === 'bg-black/50 dark:bg-black/80' ? 'ring-blue-500' : 'ring-transparent'}`} title="Black/Dark"></button>
                                                            </div>
                                                        </div>

                                                        {/* Text Color */}
                                                        <div className="flex items-center gap-2 bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-200">
                                                            <span className="text-[10px] font-bold text-gray-500 min-w-[50px] uppercase">Text Color:</span>
                                                            <div className="flex gap-1.5 flex-1 justify-end">
                                                                <button onClick={() => setQTextColor('default')} className={`w-5 h-5 rounded-full border border-gray-300 shadow-sm text-[9px] font-bold flex items-center justify-center bg-gray-100 text-gray-500 ring-2 ${qTextColor === 'default' ? 'ring-blue-500' : 'ring-transparent'}`} title="Auto">A</button>
                                                                <button onClick={() => setQTextColor('#000000')} className={`w-5 h-5 rounded-full border border-gray-800 shadow-sm bg-black ring-2 ${qTextColor === '#000000' ? 'ring-blue-500' : 'ring-transparent'}`} title="Black"></button>
                                                                <button onClick={() => setQTextColor('#ffffff')} className={`w-5 h-5 rounded-full border border-gray-300 shadow-sm bg-white ring-2 ${qTextColor === '#ffffff' ? 'ring-blue-500' : 'ring-transparent'}`} title="White"></button>
                                                                <button onClick={() => setQTextColor('#ef4444')} className={`w-5 h-5 rounded-full border border-red-500 shadow-sm bg-red-500 ring-2 ${qTextColor === '#ef4444' ? 'ring-blue-500' : 'ring-transparent'}`} title="Red"></button>
                                                                <button onClick={() => setQTextColor('#3b82f6')} className={`w-5 h-5 rounded-full border border-blue-500 shadow-sm bg-blue-500 ring-2 ${qTextColor === '#3b82f6' ? 'ring-blue-500' : 'ring-transparent'}`} title="Blue"></button>
                                                                <button onClick={() => setQTextColor('#f59e0b')} className={`w-5 h-5 rounded-full border border-amber-500 shadow-sm bg-amber-500 ring-2 ${qTextColor === '#f59e0b' ? 'ring-blue-500' : 'ring-transparent'}`} title="Yellow"></button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <hr className="border-gray-100" />

                                                <div className="flex items-center justify-between">
                                                    <div className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-indigo-500" />
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
                                                    <div className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                                        <Volume2 className="w-4 h-4 text-indigo-500" />
                                                        Auto Play Read Aloud
                                                        <kbd className="ml-auto text-[10px] bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded text-gray-500 font-mono shadow-sm">Shift+A</kbd>
                                                    </div>
                                                    <button
                                                        onClick={() => setIsAutoPlayReadAloud(!isAutoPlayReadAloud)}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isAutoPlayReadAloud ? 'bg-blue-600' : 'bg-gray-300'}`}
                                                    >
                                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAutoPlayReadAloud ? 'translate-x-6' : 'translate-x-1'}`} />
                                                    </button>
                                                </div>

                                                <hr className="border-gray-100" />

                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                                            <Music className="w-4 h-4 text-indigo-500" />
                                                            Focus Mode (Music)
                                                        </div>
                                                        <button
                                                            onClick={() => setIsLofiEnabled(!isLofiEnabled)}
                                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isLofiEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                                                        >
                                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isLofiEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                                        </button>
                                                    </div>
                                                    {isLofiEnabled && (
                                                        <div className="pl-6 pr-2 flex flex-col gap-3">
                                                            <select
                                                                value={selectedMusic}
                                                                onChange={(e) => {
                                                                    setSelectedMusic(e.target.value);
                                                                    // Restart audio if it's already playing
                                                                    if (isLofiEnabled && lofiAudioRef.current) {
                                                                        lofiAudioRef.current.src = e.target.value;
                                                                        lofiAudioRef.current.play().catch(console.warn);
                                                                    }
                                                                }}
                                                                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500 text-gray-700 font-semibold"
                                                            >
                                                                {MUSIC_OPTIONS.map(opt => (
                                                                    <option key={opt.id} value={opt.url}>{opt.name}</option>
                                                                ))}
                                                            </select>
                                                            <div className="flex items-center gap-3">
                                                                <VolumeX className="w-4 h-4 text-gray-400" />
                                                                <input
                                                                    type="range"
                                                                    min="0"
                                                                    max="1"
                                                                    step="0.05"
                                                                    value={musicVolume}
                                                                    onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                                                                    className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                                                />
                                                                <div className="flex items-center gap-1 min-w-[3.5rem]">
                                                                    <Volume2 className="w-4 h-4 text-gray-400" />
                                                                    <span className="text-xs font-semibold text-gray-500">{Math.round(musicVolume * 100)}%</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <hr className="border-gray-100" />

                                                <div className="flex items-center justify-between">
                                                    <div className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                                        <Lightbulb className="w-4 h-4 text-indigo-500" /> Show Explanation
                                                        <kbd className="ml-auto text-[10px] bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded text-gray-500 font-mono shadow-sm">Shift+X</kbd>
                                                    </div>
                                                    <button
                                                        onClick={() => setIsExpEnabled(!isExpEnabled)}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isExpEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                                                    >
                                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isExpEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                                    </button>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                                        <MessageCircle className="w-4 h-4 text-indigo-500" /> Show Options Explanation
                                                        <kbd className="ml-auto text-[10px] bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded text-gray-500 font-mono shadow-sm">Shift+O</kbd>
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
                                                    <div className="text-sm font-bold text-gray-700 mb-2 flex justify-between">
                                                        <span className="flex items-center gap-2"><Type className="w-4 h-4 text-indigo-500" /> Question Font Size</span>
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
                                                    <div className="text-sm font-bold text-gray-700 mb-2 flex justify-between">
                                                        <span className="flex items-center gap-2"><Type className="w-4 h-4 text-green-500" /> Options Font Size</span>
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
                                                    <div className="text-sm font-bold text-gray-700 mb-2 flex justify-between">
                                                        <span className="flex items-center gap-2"><Type className="w-4 h-4 text-purple-500" /> Explanation Font Size</span>
                                                        <span className="text-purple-600 bg-purple-50 px-2 rounded text-xs py-0.5">{Math.round(expFontScale * 100)}%</span>
                                                    </div>
                                                    <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 w-full overflow-hidden shadow-inner">
                                                        <button onClick={() => setExpFontScale(s => Math.max(0.6, s - 0.1))} className="flex-1 py-2 flex justify-center items-center gap-2 text-gray-700 hover:bg-gray-200 font-bold border-r border-gray-200 transition-colors">
                                                            A- <kbd className="text-[10px] bg-white border border-gray-300 px-1.5 py-0.5 rounded text-gray-500 font-mono shadow-sm">[</kbd>
                                                        </button>
                                                        <button onClick={() => setExpFontScale(s => Math.min(2.0, s + 0.1))} className="flex-1 py-2 flex justify-center items-center gap-2 text-gray-700 hover:bg-gray-200 font-bold transition-colors">
                                                            A+ <kbd className="text-[10px] bg-white border border-gray-300 px-1.5 py-0.5 rounded text-gray-500 font-mono shadow-sm">]</kbd>
                                                        </button>
                                                    </div>
                                                </div>

                                                <hr className="border-gray-100" />

                                                <div className="flex items-center justify-between">
                                                    <div className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                                        <Focus className="w-4 h-4 text-yellow-500" />
                                                        Spotlight Mode
                                                        <kbd className="ml-auto text-[10px] bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded text-gray-500 font-mono shadow-sm">Shift+F</kbd>
                                                    </div>
                                                    <button
                                                        onClick={() => setIsSpotlightActive(!isSpotlightActive)}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isSpotlightActive ? 'bg-yellow-500' : 'bg-gray-300'}`}
                                                    >
                                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isSpotlightActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                                    </button>
                                                </div>

                                                <hr className="border-gray-100" />

                                                <div>
                                                    <div className="text-sm font-bold text-gray-700 mb-3 flex items-center justify-between">
                                                        <span className="flex items-center gap-2"><Pen className="w-4 h-4 text-indigo-500" /> Presentation Tools</span>
                                                        <div className="flex items-center gap-2">
                                                            <kbd className="text-[10px] bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded text-gray-500 font-mono shadow-sm">Shift+D</kbd>
                                                            <button onClick={() => setIsPenActive(!isPenActive)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${isPenActive ? 'bg-blue-600' : 'bg-gray-300'}`}>
                                                                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isPenActive ? 'translate-x-5' : 'translate-x-1'}`} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {isPenActive && (
                                                        <div className="space-y-4 bg-gray-50 p-3 rounded-xl border border-gray-100 shadow-inner mb-4">

                                                            {/* Tool Selector */}
                                                            <div className="flex gap-2 p-1.5 bg-gray-200/50 rounded-lg flex-wrap">
                                                                <button
                                                                    onClick={() => setDrawingTool('pen')}
                                                                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-bold transition-all ${drawingTool === 'pen' ? 'bg-white text-blue-600 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'}`}
                                                                    title="Pen (Shift+P)"
                                                                >
                                                                    <Pen className="w-3.5 h-3.5" /> Pen
                                                                </button>
                                                                <button
                                                                    onClick={() => setDrawingTool('highlighter')}
                                                                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-bold transition-all ${drawingTool === 'highlighter' ? 'bg-white text-yellow-600 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'}`}
                                                                    title="Marker (Shift+M)"
                                                                >
                                                                    <Highlighter className="w-3.5 h-3.5" /> Marker
                                                                </button>
                                                                <button
                                                                    onClick={() => setDrawingTool('laser')}
                                                                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-bold transition-all ${drawingTool === 'laser' ? 'bg-white text-red-500 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'}`}
                                                                    title="Laser (Shift+L)"
                                                                >
                                                                    <MousePointer2 className="w-3.5 h-3.5" /> Laser
                                                                </button>
                                                                <button
                                                                    onClick={() => setDrawingTool('eraser')}
                                                                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-bold transition-all ${drawingTool === 'eraser' ? 'bg-white text-gray-800 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'}`}
                                                                    title="Eraser (Shift+E)"
                                                                >
                                                                    <Eraser className="w-3.5 h-3.5" /> Eraser
                                                                </button>
                                                            </div>
                                                            <div className="flex gap-2 p-1.5 bg-gray-200/50 rounded-lg flex-wrap mt-2">
                                                                <button
                                                                    onClick={() => setDrawingTool('rectangle')}
                                                                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-bold transition-all ${drawingTool === 'rectangle' ? 'bg-white text-indigo-600 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'}`}
                                                                    title="Rect (Shift+B)"
                                                                >
                                                                    <Square className="w-3.5 h-3.5" /> Rect
                                                                </button>
                                                                <button
                                                                    onClick={() => setDrawingTool('circle')}
                                                                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-bold transition-all ${drawingTool === 'circle' ? 'bg-white text-indigo-600 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'}`}
                                                                    title="Circle (Shift+C)"
                                                                >
                                                                    <Circle className="w-3.5 h-3.5" /> Circle
                                                                </button>
                                                                <button
                                                                    onClick={() => setDrawingTool('arrow')}
                                                                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-bold transition-all ${drawingTool === 'arrow' ? 'bg-white text-indigo-600 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'}`}
                                                                    title="Arrow (Shift+V)"
                                                                >
                                                                    <ArrowUpRight className="w-3.5 h-3.5" /> Arrow
                                                                </button>
                                                                <button
                                                                    onClick={() => setDrawingTool('text')}
                                                                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-bold transition-all ${drawingTool === 'text' ? 'bg-white text-indigo-600 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'}`}
                                                                    title="Text (Shift+T)"
                                                                >
                                                                    <Type className="w-3.5 h-3.5" /> Text
                                                                </button>
                                                                <button
                                                                    onClick={() => setDrawingTool('magnifier')}
                                                                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-bold transition-all ${drawingTool === 'magnifier' ? 'bg-white text-indigo-600 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'}`}
                                                                    title="Zoom (Shift+Z)"
                                                                >
                                                                    <ZoomIn className="w-3.5 h-3.5" /> Zoom
                                                                </button>
                                                            </div>

                                                            <div className={drawingTool === 'laser' || drawingTool === 'text' || drawingTool === 'magnifier' ? 'opacity-50 pointer-events-none transition-opacity flex flex-col gap-4 mt-2' : 'transition-opacity flex flex-col gap-4 mt-2'}>
                                                                <div>
                                                                    <div className="flex justify-between text-xs font-semibold text-gray-500 mb-2">
                                                                        <span>Color</span>
                                                                    </div>
                                                                    <div className="flex gap-2 items-center flex-wrap">
                                                                        {['#ef4444', '#3b82f6', '#22c55e', '#facc15', '#000000'].map(c => (
                                                                            <button
                                                                                key={c}
                                                                                onClick={() => setPenColor(c)}
                                                                                className={`w-5 h-5 rounded-full border-2 ${penColor === c ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-110'} transition-all`}
                                                                                style={{ backgroundColor: c }}
                                                                            />
                                                                        ))}
                                                                        <input
                                                                            type="color"
                                                                            value={penColor}
                                                                            onChange={e => setPenColor(e.target.value)}
                                                                            className="w-6 h-6 ml-1 cursor-pointer border-0 rounded overflow-hidden"
                                                                            title="Custom Color"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <div className="flex justify-between text-xs font-semibold text-gray-500 mb-2">
                                                                        <span>Size</span>
                                                                        <span className="text-blue-600">{penSize}px</span>
                                                                    </div>
                                                                    <input type="range" min="2" max="24" value={penSize} onChange={(e) => setPenSize(Number(e.target.value))} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={clearCanvas}
                                                                className="w-full py-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center gap-1.5 text-xs font-bold"
                                                            >
                                                                <Trash2 className="w-4 h-4" /> Clear Canvas <kbd className="ml-1 text-[10px] bg-white border border-red-200 px-1.5 py-0.5 rounded text-red-500 font-mono shadow-sm">Shift+C</kbd>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                <hr className="border-gray-100" />

                                                <div>
                                                    <div className="text-sm font-bold text-gray-700 mb-3 flex items-center justify-between">
                                                        <span className="flex items-center gap-2"><Stamp className="w-4 h-4 text-indigo-500" /> Watermark</span>
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
                                                                    <span>Count</span>
                                                                    <span className="text-blue-600">{wmCount}</span>
                                                                </div>
                                                                <input type="range" min="1" max="20" value={wmCount} onChange={(e) => setWmCount(Number(e.target.value))} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
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

                            </div>

                            <div className="relative hidden md:flex items-center justify-center shrink-0 ml-auto md:ml-0">
                                <button
                                    onClick={() => setIsNavigatorOpen(!isNavigatorOpen)}
                                    className={`flex items-center gap-1.5 md:gap-2 px-2.5 py-1.5 md:px-4 md:py-2 rounded-xl transition-all shadow-sm font-semibold text-xs md:text-lg ${isNavigatorOpen ? 'bg-indigo-600 text-white ring-2 ring-indigo-300' : 'bg-white/60 hover:bg-white text-indigo-700'}`}
                                    title="Slide Navigator"
                                >
                                    <LayoutGrid className="w-4 h-4 md:w-5 md:h-5" />
                                    <span className="hidden sm:inline">Page </span>{String(currentSlide + 1).padStart(2, '0')} <span className="text-[10px] md:text-sm opacity-70">/ {questions.length}</span>
                                </button>

                                {isNavigatorOpen && (
                                    <div className="absolute bottom-[calc(100%+10px)] right-0 md:left-1/2 md:-translate-x-1/2 bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 md:p-5 w-[280px] sm:w-[320px] z-50 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[50vh]">
                                        <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-100 shrink-0">
                                            <h3 className="font-bold text-gray-800 text-sm md:text-base flex items-center gap-2">
                                                <LayoutGrid className="w-4 h-4 md:w-5 md:h-5 text-gray-500" /> Slide Navigator
                                            </h3>
                                            <button onClick={() => setIsNavigatorOpen(false)} className="p-1 text-gray-400 hover:bg-gray-100 rounded-full hover:text-gray-700 transition-colors">
                                                <X className="w-4 h-4 md:w-5 md:h-5" />
                                            </button>
                                        </div>

                                        <div className="overflow-y-auto custom-scrollbar pr-2 pb-2">
                                            <div className="grid grid-cols-5 gap-2">
                                                {questions.map((_, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => {
                                                            setCurrentSlide(idx);
                                                            setStep(mode === 'read' ? 2 : 0);
                                                            setSelectedOption(null);
                                                            setTimerSeconds(0);
                                                            setIsNavigatorOpen(false);
                                                        }}
                                                        className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs md:text-sm font-bold transition-all ${currentSlide === idx ? 'bg-blue-600 text-white shadow-md scale-105' : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600'}`}
                                                    >
                                                        {idx + 1}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Controls */}
                            <div className="flex gap-2 md:gap-3 shrink-0">
                                <button onClick={prevStep} className="p-2 md:p-3 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-all active:scale-95">
                                    <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                                </button>
                                <button onClick={nextStep} className="p-2 md:p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md transition-all active:scale-95">
                                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Responsive Font Styles */}
                    <style dangerouslySetInnerHTML={{
                        __html: `
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


                </div>

                {/* Right Ad Banner (160x600) */}
                <div className="hidden xl:flex w-[160px] h-[600px] shrink-0 flex-col items-center justify-between bg-gradient-to-b from-[#2a0845] via-[#6441A5] to-[#2a0845] rounded-xl overflow-hidden shadow-2xl border border-purple-400/20 relative z-10 p-3">
                    {/* Floating Elements Background */}
                    <div className="absolute top-[10%] right-[20%] w-16 h-16 rounded-full border border-purple-400/20 bg-purple-500/10 blur-[8px]"></div>
                    <div className="absolute bottom-[20%] left-[-10%] w-20 h-20 rounded-full bg-pink-400/10 blur-[20px]"></div>

                    {/* Top Icon */}
                    <div className="flex items-center justify-center text-4xl w-full z-10 pt-4 drop-shadow-lg relative">
                        <div className="absolute inset-0 bg-purple-400/20 blur-[15px] rounded-full"></div>
                        🎯
                    </div>

                    {/* Text Section */}
                    <div className="flex flex-col items-center w-full z-10 text-center mt-3">
                        <h3 className="text-[18px] text-purple-100 mb-1 leading-tight font-medium">লক্ষ্য তোমার,</h3>
                        <h3 className="text-[26px] text-white leading-tight font-extrabold">
                            <span className="text-[#FFD700]">সফলতা</span>
                        </h3>
                        <h3 className="text-[26px] text-white leading-tight font-extrabold">আমাদের সাথে!</h3>
                    </div>

                    {/* Features List */}
                    <div className="flex flex-col z-10 w-full space-y-2 mt-4 mb-2">
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-2.5">
                            <div className="flex flex-col space-y-2">
                                {[
                                    'Daily Test',
                                    'Unlimited',
                                    'Analytics',
                                    'AI Ranking',
                                    'Report'
                                ].map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5">
                                        <Check className="w-5 h-5 text-[#00E676] shrink-0" />
                                        <span className="text-gray-100 text-[16px] font-semibold tracking-wide leading-tight">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <div className="w-full z-10 pb-2">
                        <button className="w-full flex items-center justify-center py-2.5 bg-gradient-to-r from-[#FF416C] to-[#FF4B2B] border border-red-400/50 rounded-lg shadow-[0_4px_10px_rgba(255,65,108,0.4)] hover:scale-105 transition-transform duration-300">
                            <span className="text-white font-bold text-[18px] drop-shadow-md">Join Now</span>
                        </button>
                    </div>
                </div>

                {/* Spotlight Overlay */}
                {isSpotlightActive && (
                    <div
                        className="fixed inset-0 z-[9999] pointer-events-none transition-opacity duration-300"
                        style={{
                            background: `radial-gradient(circle at ${spotlightPos.x}px ${spotlightPos.y}px, transparent 60px, rgba(0,0,0,0.85) 150px)`
                        }}
                    />
                )}
            </div> {/* Close print:hidden container */}

            {/* Print Only Container */}
            <div className="print-only hidden print:block w-full bg-white text-black relative z-[999999]" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                {questions.map((q, idx) => {
                    const parsedOptions = (() => {
                        if (!q.options) return [];
                        try { return typeof q.options === 'string' ? JSON.parse(q.options) : q.options; } catch (e) { return []; }
                    })();
                    const opts = parsedOptions.length > 0 ? parsedOptions : (() => {
                        const arr = [
                            { key: 'a', text: q.options?.a || '' },
                            { key: 'b', text: q.options?.b || '' },
                            { key: 'c', text: q.options?.c || '' },
                            { key: 'd', text: q.options?.d || '' }
                        ];
                        if (q.options?.e) arr.push({ key: 'e', text: q.options.e });
                        return arr.filter((x: any) => x.text);
                    })();

                    return (
                        <div key={idx} className={`w-full h-[100vh] flex items-center justify-center select-none font-sans overflow-hidden transition-colors duration-500 ${isDarkMode ? 'dark bg-gray-900' : 'bg-[#f8fbff]'}`} style={{ pageBreakAfter: 'always' }}>
                            {/* Main Presentation Area Only (No side banners) */}
                            <div className={`responsive-fonts relative w-full h-full ${getBgThemeClasses()} flex flex-col shadow-2xl overflow-hidden z-10 transition-colors duration-500`}>
                                {bgTheme !== 'video' && (
                                    <div className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-300 ${getBgThemeOverlayClasses()}`} style={{ opacity: bgOpacity / 100 }} />
                                )}

                                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-200/30 blur-[100px]"></div>
                                    <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-pink-200/30 blur-[100px]"></div>
                                    <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-purple-200/30 blur-[80px]"></div>
                                    <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(rgba(99, 102, 241, 0.06) 2px, transparent 2px)', backgroundSize: '32px 32px', opacity: 0.8 }}></div>
                                    <div className="absolute top-[15%] right-[-5%] w-72 h-72 rounded-full border-[1px] border-indigo-200/40 opacity-60"></div>
                                    <div className="absolute top-[18%] right-[-2%] w-56 h-56 rounded-full border-[1px] border-purple-200/40 opacity-60"></div>
                                    <div className="absolute bottom-[20%] left-[5%] w-48 h-48 rounded-full border-[1px] border-pink-200/40 opacity-60"></div>
                                </div>

                                {wmVisible && (
                                    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
                                        {WATERMARK_POSITIONS.slice(0, wmCount).map((wm, i) => (
                                            <div
                                                key={i}
                                                className="absolute font-black tracking-widest uppercase transition-all duration-300 whitespace-nowrap"
                                                style={{
                                                    top: wm.top, left: wm.left,
                                                    transform: `translate(-50%, -50%) rotate(${wm.rot}deg)`,
                                                    fontSize: `${wmSize * wm.sizeScale}px`,
                                                    color: `rgba(229, 231, 235, ${(wmOpacity * wm.opacScale * (isDarkMode ? 0.25 : 1)) / 100})`
                                                }}
                                            >DESHEXAM</div>
                                        ))}
                                    </div>
                                )}

                                {/* Header */}
                                {showHeader && (
                                    <div
                                        className="shrink-0 bg-gradient-to-r from-indigo-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-b border-indigo-100/50 dark:border-gray-700/50 flex flex-row justify-between items-center w-full z-30 shadow-sm relative px-6 py-4"
                                    >
                                        <div className="flex items-center gap-3 w-1/3">
                                            {showLogo && <img src="/image/logo.png" alt="DeshExam" className="h-10 w-auto object-contain drop-shadow-sm" />}
                                            <div className="flex flex-col justify-center">
                                                <span className="font-extrabold text-indigo-950 dark:text-gray-100 leading-tight text-lg">Desh Exam Academy</span>
                                                <span className="text-indigo-800/80 dark:text-gray-400 font-bold tracking-widest uppercase mt-0.5 text-[10px]">Learn • Practice • Succeed</span>
                                            </div>
                                        </div>
                                        <div className={`flex-1 w-full px-6 flex flex-col justify-center ${headerTitleAlign === 'left' ? 'items-start text-left' : headerTitleAlign === 'right' ? 'items-end text-right' : 'items-center text-center'}`}>
                                            <h1 className="font-extrabold text-indigo-950 dark:text-gray-100 tracking-tight text-lg">{classLine}</h1>
                                            {(chapterName || topicName) && (
                                                <div className="text-indigo-700 dark:text-gray-400 font-bold tracking-wider uppercase mt-1 text-xs">
                                                    {[chapterName, topicName].filter(Boolean).join(' | ')}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-end shrink-0 w-1/3">
                                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full font-extrabold tracking-widest shadow-md flex items-center justify-center whitespace-nowrap px-6 py-2 text-sm">
                                                MOCK TEST
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Question & Options */}
                                <div className="flex-1 w-full relative flex flex-col items-center px-12 py-10 z-10 justify-center">
                                    <div
                                        className={`w-full max-w-[90%] xl:max-w-6xl rounded-3xl p-12 shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-sm border transition-all duration-500 relative z-20 ${qBgColor} border-white/20 dark:border-gray-700/50`}
                                        style={{
                                            boxShadow: isDarkMode ? '0 20px 40px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)' : '0 20px 40px -10px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.5)',
                                            backgroundImage: `linear-gradient(to right, ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'} 1px, transparent 1px), linear-gradient(to bottom, ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'} 1px, transparent 1px)`,
                                            backgroundSize: '24px 24px'
                                        }}
                                    >
                                        <div className="flex items-start gap-4 mb-12 border-b border-gray-200/50 dark:border-gray-700/50 pb-10">
                                            <div className="flex items-center gap-4 shrink-0">
                                                <span className="font-black text-[32px] bg-clip-text text-transparent bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 drop-shadow-sm">
                                                    Q{idx + 1}.
                                                </span>
                                            </div>
                                            <div className="flex-1 w-full relative pt-1">
                                                <div className={`prose max-w-none prose-p:font-black font-black text-[32px] leading-snug ${qTextColor !== 'default' ? 'text-[var(--q-color)]' : 'text-gray-900 dark:text-gray-100'} [&_*]:!text-[32px] [&_*]:!leading-snug [&>p]:m-0`} style={{ '--q-color': qTextColor !== 'default' ? qTextColor : undefined } as React.CSSProperties}>
                                                    <ReactMarkdown remarkPlugins={remarkPluginsList} rehypePlugins={rehypePluginsList}>
                                                        {q.questionText}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={optionsLayout === 'grid' ? "grid grid-cols-2 gap-x-12 gap-y-10" : "flex flex-col gap-8 max-w-4xl mx-auto"}>
                                            {opts.map((opt: any, oIdx: number) => {
                                                const optLetter = q.language === 'Bangla' || !q.language ? bnOptionsMap[opt.key] : opt.key.toUpperCase();
                                                const colorThemes = [
                                                    { border: 'border-[#4285F4]/50', bg: 'bg-white dark:bg-gray-800/90', letterBg: 'bg-[#4285F4]/75', letterText: 'text-white' },
                                                    { border: 'border-[#34A853]/50', bg: 'bg-white dark:bg-gray-800/90', letterBg: 'bg-[#34A853]/75', letterText: 'text-white' },
                                                    { border: 'border-[#F9AB00]/50', bg: 'bg-white dark:bg-gray-800/90', letterBg: 'bg-[#F9AB00]/75', letterText: 'text-white' },
                                                    { border: 'border-[#EA4335]/50', bg: 'bg-white dark:bg-gray-800/90', letterBg: 'bg-[#EA4335]/75', letterText: 'text-white' },
                                                    { border: 'border-[#9C27B0]/50', bg: 'bg-white dark:bg-gray-800/90', letterBg: 'bg-[#9C27B0]/75', letterText: 'text-white' },
                                                ];
                                                const theme = colorThemes[oIdx % colorThemes.length];

                                                return (
                                                    <div key={opt.key} className={`flex items-center gap-5 py-2 px-3 rounded-xl border-2 shadow-[0_4px_12px_rgba(0,0,0,0.04)] ${theme.bg} ${theme.border} min-h-[50px]`}>
                                                        <div className={`shrink-0 w-14 h-14 flex items-center justify-center rounded-full text-2xl font-black ${theme.letterBg} ${theme.letterText}`}>
                                                            {optLetter}
                                                        </div>
                                                        <div className="prose dark:prose-invert max-w-none text-black dark:text-gray-100 font-bold text-[24px] flex items-center [&_*]:!text-[24px] [&_*]:!leading-tight [&_*]:!m-0">
                                                            <ReactMarkdown remarkPlugins={remarkPluginsList} rehypePlugins={rehypePluginsList}>
                                                                {opt.text}
                                                            </ReactMarkdown>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>,
        document.body
    );
}
