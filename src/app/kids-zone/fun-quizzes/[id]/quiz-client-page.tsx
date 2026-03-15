
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, RefreshCw, Check, X, Sparkles, Trophy, Clock, ImageDown, Video, Play, Pause, Volume2, FileQuestion, Loader2 } from "lucide-react";
import Link from "next/link";
import Confetti from 'react-dom-confetti';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import html2canvas from 'html2canvas';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';

type Question = {
    text: string;
    image?: string;
    audio?: string;
    options: { text: string; image?: string; audio?: string; }[];
    correctAnswer: string;
};

type Quiz = {
    id: string;
    title: string;
    questions: Question[];
};

const optionBgColors = [
    'bg-sky-100 dark:bg-sky-900/30 hover:bg-sky-200/80',
    'bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200/80',
    'bg-lime-100 dark:bg-lime-900/30 hover:bg-lime-200/80',
    'bg-rose-100 dark:bg-rose-900/30 hover:bg-rose-200/80',
];

export default function QuizClientPage({ quiz }: { quiz: Quiz }) {
    const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [feedback, setFeedback] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);
    const [score, setScore] = useState(0);
    const [quizFinished, setQuizFinished] = useState(false);
    const [timerDuration, setTimerDuration] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const quizCardRef = useRef<HTMLDivElement>(null);
    const [autoplayEnabled, setAutoplayEnabled] = useState(false);
    
    const [playingUrl, setPlayingUrl] = useState<string | null>(null);
    const activeAudioRef = useRef<HTMLAudioElement | null>(null);
    const { toast } = useToast();

    // New states for image capture
    const [isCapturing, setIsCapturing] = useState(false);
    const [captureMode, setCaptureMode] = useState<'idle' | 'question' | 'answer'>('idle');
    
    const stopSound = useCallback(() => {
        if (activeAudioRef.current) {
            activeAudioRef.current.pause();
            activeAudioRef.current.currentTime = 0;
            activeAudioRef.current = null;
        }
        setPlayingUrl(null);
    }, []);

    const playSound = useCallback((url: string) => {
        if (typeof window === 'undefined') return;
        
        stopSound(); // Stop anything else first

        const audio = new Audio(url);
        activeAudioRef.current = audio;
        setPlayingUrl(url);

        audio.play().catch(error => {
            console.error(`Error playing sound:`, error);
            setPlayingUrl(null); // Reset state on error
        });

        audio.onended = () => {
            if (activeAudioRef.current === audio) {
                setPlayingUrl(null);
                activeAudioRef.current = null;
            }
        };
    }, [stopSound]);

    const togglePlayUrl = useCallback((url: string) => {
        if (playingUrl === url && activeAudioRef.current) {
            stopSound();
        } else {
            playSound(url);
        }
    }, [playingUrl, playSound, stopSound]);

    const playSystemSound = useCallback((type: 'correct' | 'incorrect' | 'win') => {
        if (typeof window === 'undefined') return;

        if (type !== 'win') {
           stopSound();
        }
        
        let soundUrl = '';
        if (type === 'correct') soundUrl = '/audio/correct-83487.mp3';
        else if (type === 'incorrect') soundUrl = '/audio/incorrect-293358.mp3';
        else if (type === 'win') soundUrl = '/audio/win-fanfare.mp3';
        
        if(soundUrl) {
            const audio = new Audio(soundUrl);
            audio.play().catch(error => console.error(`Error playing sound:`, error));
        }
    }, [stopSound]);

    const nextQuestion = useCallback(() => {
        stopSound();
        if (currentQuestionIndex < shuffledQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setFeedback('');
            setIsCorrect(false);
            if (timerDuration > 0) {
                setTimeLeft(timerDuration);
            }
        } else {
            setQuizFinished(true);
            playSystemSound('win');
        }
    }, [currentQuestionIndex, shuffledQuestions.length, timerDuration, playSystemSound, stopSound]);
    
    useEffect(() => {
        if(quiz && quiz.questions) {
             setShuffledQuestions([...quiz.questions].sort(() => Math.random() - 0.5));
        }
    }, [quiz]);

    const currentQuestion = shuffledQuestions[currentQuestionIndex];

     useEffect(() => {
        if (autoplayEnabled && currentQuestion?.audio && !quizFinished && !selectedAnswer && (!activeAudioRef.current || activeAudioRef.current.paused)) {
            const autoplayTimeout = setTimeout(() => {
                playSound(currentQuestion.audio!);
            }, 500); 
            return () => clearTimeout(autoplayTimeout);
        }
    }, [currentQuestionIndex, currentQuestion, autoplayEnabled, quizFinished, selectedAnswer, playSound]);


    useEffect(() => {
        if (quizFinished || selectedAnswer || timerDuration === 0) {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            return;
        }

        timerIntervalRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
                    stopSound();
                    playSystemSound('incorrect');
                    setFeedback("Time's up!");
                    setTimeout(nextQuestion, 1500); 
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
    }, [quizFinished, selectedAnswer, nextQuestion, timerDuration, currentQuestionIndex, playSystemSound, stopSound]);
    
    useEffect(() => {
        return () => {
            stopSound();
        }
    }, [stopSound]);

    const handleAnswer = (answer: string) => {
        if (selectedAnswer) return;

        stopSound();

        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

        setSelectedAnswer(answer);
        if (answer === currentQuestion.correctAnswer) {
            setFeedback('Correct!');
            setIsCorrect(true);
            setScore(prev => prev + 1);
            playSystemSound('correct');
        } else {
            setFeedback('Not quite!');
            playSystemSound('incorrect');
        }

        setTimeout(nextQuestion, 1500);
    };

    const restartQuiz = () => {
        stopSound();
        setShuffledQuestions([...quiz.questions].sort(() => Math.random() - 0.5));
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setFeedback('');
        setIsCorrect(false);
        setScore(0);
        setQuizFinished(false);
        setTimeLeft(timerDuration);
    };
    
    const handleTimerChange = (value: string) => {
        const newDuration = parseInt(value, 10);
        setTimerDuration(newDuration);
        setTimeLeft(newDuration);
    };

    const drawWatermark = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
        ctx.font = "bold 32px 'Lexend', sans-serif";
        ctx.textAlign = "center";
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.rotate(-Math.PI / 4);
        
        const text = "DeshExam";
        const textWidth = ctx.measureText(text).width;
        const patternWidth = textWidth + 150;
        const patternHeight = 150;

        for (let x = -width; x < width * 1.5; x += patternWidth) {
            for (let y = -height * 1.5; y < height * 1.5; y += patternHeight) {
                ctx.fillText(text, x, y);
            }
        }
        ctx.restore();
    };

    const captureAndDownload = async (
        mode: 'question' | 'answer',
        aspectRatio: 'default' | '9:16' | '16:9' | '1:1' | '4:5'
    ) => {
        if (!quizCardRef.current) return;
        const sourceCanvas = await html2canvas(quizCardRef.current, { useCORS: true, backgroundColor: null });
        
        const questionText = currentQuestion?.text ? currentQuestion.text.replace(/[?]/g, '') : quiz.title;
        const fileName = `${questionText.replace(/\s+/g, '_').slice(0, 50)}_${mode}.png`;

        const target = document.createElement('canvas');
        const targetCtx = target.getContext('2d');
        if (!targetCtx) return;

        let targetCanvas: HTMLCanvasElement;
        if (aspectRatio === 'default') {
            target.width = sourceCanvas.width;
            target.height = sourceCanvas.height;
            targetCtx.drawImage(sourceCanvas, 0, 0);
            drawWatermark(targetCtx, target.width, target.height);
            targetCanvas = target;
        } else {
             let targetWidth, targetHeight;
            if (aspectRatio === '9:16') {
                targetHeight = 1920;
                targetWidth = 1080;
            } else if (aspectRatio === '16:9') {
                targetWidth = 1920;
                targetHeight = 1080;
            } else if (aspectRatio === '4:5') {
                targetWidth = 1080;
                targetHeight = 1350;
            } else { // 1:1 for Instagram
                targetWidth = 1080;
                targetHeight = 1080;
            }
            
            target.width = targetWidth;
            target.height = targetHeight;

            const gradients = [
                { from: '#DA22FF', to: '#9733EE' },
                { from: '#09203F', to: '#537895' },
                { from: '#868F96', to: '#596164' },
                { from: '#93A5CF', to: '#E4EfE9' },
                { from: '#11998E', to: '#38EF7D' }
            ];
            const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
            const gradient = targetCtx.createLinearGradient(0, 0, targetWidth, targetHeight);
            gradient.addColorStop(0, randomGradient.from);
            gradient.addColorStop(1, randomGradient.to);
            targetCtx.fillStyle = gradient;
            targetCtx.fillRect(0, 0, targetWidth, targetHeight);
            
            drawWatermark(targetCtx, targetWidth, targetHeight);

            const padding = 100;
            const scale = Math.min(
                (targetWidth - padding * 2) / sourceCanvas.width, 
                (targetHeight - padding * 2) / sourceCanvas.height
            );
            const scaledWidth = sourceCanvas.width * scale;
            const scaledHeight = sourceCanvas.height * scale;
            const dx = (targetWidth - scaledWidth) / 2;
            const dy = (targetHeight - scaledHeight) / 2;
            
            targetCtx.drawImage(sourceCanvas, dx, dy, scaledWidth, scaledHeight);
            targetCanvas = target;
        }
        
        const link = document.createElement('a');
        link.download = fileName;
        link.href = targetCanvas.toDataURL('image/png');
        link.click();
    };

    const handleSaveAsImage = async (aspectRatio: 'default' | '9:16' | '16:9' | '1:1' | '4:5' = 'default') => {
        if (isCapturing) return;
        setIsCapturing(true);

        setCaptureMode('question');
        await new Promise(r => setTimeout(r, 100)); // wait for rerender
        await captureAndDownload('question', aspectRatio);

        setCaptureMode('answer');
        await new Promise(r => setTimeout(r, 100));
        await captureAndDownload('answer', aspectRatio);

        setCaptureMode('idle');
        setIsCapturing(false);
        toast({ title: 'Images saved!', description: 'Both question and answer images have been downloaded.' });
    };


    if (!quiz || !shuffledQuestions || shuffledQuestions.length === 0) {
        return (
             <div className="container mx-auto px-4 py-12 text-center">
                 <h1 className="text-2xl font-bold">Quiz not found or has no questions.</h1>
                 <Button asChild className="mt-4">
                     <Link href="/kids-zone/fun-quizzes">Back to Fun Quizzes</Link>
                 </Button>
             </div>
        );
    }
    
    const progress = ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100;
    
    return (
        <div className="relative min-h-screen">
            <div
              className="absolute inset-0 z-0"
              style={{
                backgroundImage: "url('/image/logo.png')",
                backgroundSize: '150px',
                backgroundRepeat: 'repeat',
                opacity: 0.05,
              }}
            />
             <div className="absolute inset-0 bg-secondary/30" />
            <div className="relative z-10 container mx-auto px-4 py-12">
                
                {quizFinished ? (
                    <Card ref={quizCardRef} className="w-full max-w-xl mx-auto text-center shadow-2xl p-8 bg-card/80 backdrop-blur-sm">
                        <Confetti active={quizFinished} />
                        <CardHeader>
                            <Trophy className="w-20 h-20 text-yellow-500 mx-auto" />
                            <CardTitle className="text-4xl font-bold font-headline mt-4">Quiz Complete!</CardTitle>
                            <CardDescription className="text-lg">You did an amazing job!</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-5xl font-bold">{score} <span className="text-3xl text-muted-foreground">/ {shuffledQuestions.length}</span></p>
                            <p className="text-xl mt-2 font-semibold">Your Score</p>
                            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                                <Button onClick={restartQuiz} size="lg">
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Play Again
                                </Button>
                                <Button asChild variant="outline" size="lg">
                                    <Link href="/kids-zone/fun-quizzes">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to Fun Quizzes
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="w-full max-w-2xl mx-auto">
                        <Card className="bg-card/60 backdrop-blur-sm">
                             <CardContent className="p-3">
                                <div className="flex flex-wrap justify-between items-center gap-4">
                                     <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                        <FileQuestion className="w-5 h-5" />
                                        <span className="font-bold text-foreground">{currentQuestionIndex + 1}</span>
                                        <span>/</span>
                                        <span>{shuffledQuestions.length}</span>
                                    </div>
                                    <div className="flex items-center gap-4 flex-wrap justify-end">
                                        <div className="flex items-center gap-2">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Label htmlFor="autoplay-switch" className="cursor-pointer">
                                                            <Volume2 className="w-5 h-5 text-slate-600" />
                                                        </Label>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Autoplay Audio</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            <Switch
                                                id="autoplay-switch"
                                                checked={autoplayEnabled}
                                                onCheckedChange={(checked) => {
                                                    setAutoplayEnabled(checked);
                                                    if (!checked) {
                                                        stopSound();
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor="timer-select" className="text-sm font-medium">Timer</Label>
                                            <Select value={timerDuration.toString()} onValueChange={handleTimerChange} disabled={selectedAnswer !== null}>
                                                <SelectTrigger id="timer-select" className="w-[100px] h-9">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="15">15s</SelectItem>
                                                    <SelectItem value="30">30s</SelectItem>
                                                    <SelectItem value="60">60s</SelectItem>
                                                    <SelectItem value="0">Off</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {timerDuration > 0 && (
                                            <div className="flex items-center gap-2 text-muted-foreground font-semibold">
                                                <Clock className="w-5 h-5" />
                                                <span>{timeLeft}s</span>
                                            </div>
                                        )}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="icon" disabled={isCapturing}>
                                                    {isCapturing ? <Loader2 className="h-4 w-4 animate-spin"/> : <ImageDown className="h-4 w-4" />}
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => handleSaveAsImage('default')}>
                                                    Save as Default
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleSaveAsImage('16:9')}>
                                                    <Video className="mr-2 h-4 w-4" />
                                                    Save for Landscape Video (16:9)
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleSaveAsImage('9:16')}>
                                                    <Video className="mr-2 h-4 w-4 rotate-90" />
                                                    Save for Short Video (9:16)
                                                </DropdownMenuItem>
                                                 <DropdownMenuItem onClick={() => handleSaveAsImage('1:1')}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>
                                                    Save for Instagram (1:1)
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleSaveAsImage('4:5')}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /></svg>
                                                    Save for Facebook Post (4:5)
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <div ref={quizCardRef}>
                             <Card className="shadow-2xl bg-card/60 backdrop-blur-sm overflow-hidden mt-2">
                                <CardHeader className="relative bg-[#0e8107] text-white p-6">
                                    {currentQuestion && currentQuestion.image && (
                                        <div className="relative h-48 w-full mt-4">
                                            <Image src={currentQuestion.image} alt={currentQuestion.text} layout="fill" objectFit="contain" className="rounded-lg" />
                                        </div>
                                    )}
                                    
                                    <CardTitle className="text-left text-2xl md:text-3xl font-bold flex items-center justify-start gap-2">
                                        <span>{currentQuestion?.text}</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <RadioGroup onValueChange={handleAnswer} value={selectedAnswer || ''} disabled={selectedAnswer !== null}>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                                            {currentQuestion?.options.map((option, index) => {
                                                const isSelected = selectedAnswer === option.text;
                                                const isCorrectAnswer = currentQuestion.correctAnswer === option.text;
                                                
                                                const isIdle = captureMode === 'idle';
                                                const showAsCorrect = (captureMode === 'answer' && isCorrectAnswer) || (isIdle && selectedAnswer !== null && isCorrectAnswer);
                                                const showAsIncorrect = (isIdle && selectedAnswer !== null && isSelected && !isCorrectAnswer);
                                                const showAsNeutral = captureMode === 'question' || (isIdle && selectedAnswer === null);

                                                return (
                                                    <Label
                                                        key={index}
                                                        htmlFor={`q-${currentQuestionIndex}-opt-${index}`}
                                                        className={cn(
                                                            "rounded-xl border-2 p-4 flex justify-between items-center gap-4 transition-all duration-300",
                                                            !selectedAnswer && captureMode === 'idle' && "cursor-pointer hover:scale-105 hover:border-primary",
                                                            showAsCorrect && "border-green-500 ring-2 ring-green-500/50 bg-green-100 dark:bg-green-900/30",
                                                            showAsIncorrect && "border-destructive ring-2 ring-destructive/50 bg-red-100 dark:bg-red-900/30",
                                                            showAsNeutral && optionBgColors[index % optionBgColors.length],
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold">{String.fromCharCode(65 + index)}.</span>
                                                            <span className="text-left font-bold text-lg">{option.text}</span>
                                                        </div>
                                                        <RadioGroupItem value={option.text} id={`q-${currentQuestionIndex}-opt-${index}`} />
                                                    </Label>
                                                );
                                            })}
                                        </div>
                                    </RadioGroup>
                                    {feedback && captureMode === 'idle' && <div className={`mt-4 font-bold text-xl text-center ${isCorrect ? 'text-green-600' : 'text-destructive'}`}>{feedback}</div>}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
             {!quizFinished && currentQuestion?.audio && (
                <div className="fixed top-24 right-4 z-50">
                    <Button
                        variant="default"
                        size="icon"
                        className="w-16 h-16 rounded-full shadow-lg"
                        onClick={() => togglePlayUrl(currentQuestion.audio!)}
                    >
                        {playingUrl === currentQuestion.audio ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                    </Button>
                </div>
            )}
        </div>
    );
}

