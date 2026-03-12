
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, RefreshCw, Check, X, Sparkles, Trophy, Clock, ImageDown, Video, Play, Pause } from "lucide-react";
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
    const [timerDuration, setTimerDuration] = useState(60);
    const [timeLeft, setTimeLeft] = useState(60);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const quizCardRef = useRef<HTMLDivElement>(null);
    const [autoplayEnabled, setAutoplayEnabled] = useState(false);
    
    const [playingUrl, setPlayingUrl] = useState<string | null>(null);
    const activeAudioRef = useRef<HTMLAudioElement | null>(null);
    
    const stopSound = useCallback(() => {
        if (activeAudioRef.current) {
            activeAudioRef.current.pause();
            activeAudioRef.current.currentTime = 0;
            activeAudioRef.current = null;
        }
        setPlayingUrl(null);
    }, []);

    const playSystemSound = useCallback((type: 'correct' | 'incorrect' | 'win') => {
        if (typeof window === 'undefined') return;

        if (playingUrl && type !== 'win') return;

        stopSound(); 
        
        let soundUrl = '';
        if (type === 'correct') soundUrl = '/audio/correct-83487.mp3';
        else if (type === 'incorrect') soundUrl = '/audio/incorrect-293358.mp3';
        else if (type === 'win') soundUrl = '/audio/win-fanfare.mp3';
        
        if(soundUrl) {
            const audio = new Audio(soundUrl);
            activeAudioRef.current = audio;
            audio.play().catch(error => console.error(`Error playing sound:`, error));
            audio.onended = () => {
                if (activeAudioRef.current === audio) {
                    activeAudioRef.current = null;
                }
            };
        }
    }, [stopSound, playingUrl]);

    const togglePlayUrl = useCallback((url: string) => {
        if (typeof window === 'undefined') return;

        if (playingUrl === url && activeAudioRef.current) {
            stopSound();
        } else {
            stopSound();
            const audio = new Audio(url);
            activeAudioRef.current = audio;
            setPlayingUrl(url);
            audio.play().catch(error => {
                console.error(`Error playing sound:`, error);
                setPlayingUrl(null);
            });
            audio.onended = () => {
                setPlayingUrl(null);
                if (activeAudioRef.current === audio) {
                    activeAudioRef.current = null;
                }
            };
        }
    }, [playingUrl, stopSound]);

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
        if (autoplayEnabled && currentQuestion?.audio && !quizFinished && !selectedAnswer && !playingUrl) {
            const autoplayTimeout = setTimeout(() => {
                togglePlayUrl(currentQuestion.audio!);
            }, 500);
            return () => clearTimeout(autoplayTimeout);
        }
    }, [currentQuestion, autoplayEnabled, quizFinished, selectedAnswer, togglePlayUrl, playingUrl]);


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

    const handleSaveAsImage = (aspectRatio: 'default' | '9:16' | '16:9' = 'default') => {
        if (quizCardRef.current) {
            html2canvas(quizCardRef.current, {
                useCORS: true,
                backgroundColor: null,
            }).then(sourceCanvas => {
                let targetCanvas = sourceCanvas;
                let fileNameSuffix = 'default';

                if (aspectRatio !== 'default') {
                    const target = document.createElement('canvas');
                    const targetCtx = target.getContext('2d');
                    if (!targetCtx) return;

                    let targetWidth, targetHeight;
                    if (aspectRatio === '9:16') {
                        targetHeight = 1920; // Standard portrait resolution (e.g., for YouTube Shorts)
                        targetWidth = 1080;
                        fileNameSuffix = 'portrait';
                    } else { // 16:9
                        targetWidth = 1920; // Standard landscape resolution (e.g., for YouTube videos)
                        targetHeight = 1080;
                        fileNameSuffix = 'landscape';
                    }
                    
                    target.width = targetWidth;
                    target.height = targetHeight;

                    // Create a pleasant gradient background
                    const gradient = targetCtx.createLinearGradient(0, 0, targetWidth, targetHeight);
                    gradient.addColorStop(0, '#fef3c7'); // amber-100
                    gradient.addColorStop(1, '#fed7aa'); // orange-200
                    targetCtx.fillStyle = gradient;
                    targetCtx.fillRect(0, 0, targetWidth, targetHeight);

                    // Calculate scaling to fit the source canvas onto the target with some padding
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
                link.download = `${quiz.title.replace(/\s+/g, '_')}_q${currentQuestionIndex + 1}_${fileNameSuffix}.png`;
                link.href = targetCanvas.toDataURL('image/png');
                link.click();
            });
        }
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
                opacity: 0.5,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50/80 to-amber-50/80 dark:from-orange-900/70 dark:to-amber-900/90" />
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
                        <Card className="mb-4 bg-card/60 backdrop-blur-sm">
                             <CardContent className="p-3">
                                <div className="flex flex-wrap justify-between items-center mt-2 gap-4">
                                    <div className="text-sm text-muted-foreground">
                                        Question {currentQuestionIndex + 1} of {shuffledQuestions.length}
                                    </div>
                                    <div className="flex items-center gap-4 flex-wrap justify-end">
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor="autoplay-switch" className="text-sm font-medium">Autoplay Audio</Label>
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
                                                <Button variant="outline" size="icon">
                                                    <ImageDown className="h-4 w-4" />
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
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card ref={quizCardRef} className="shadow-2xl bg-card/60 backdrop-blur-sm overflow-hidden">
                             <CardHeader className="relative bg-[#0e8107] text-white p-4 mb-2">
                                {currentQuestion && currentQuestion.image && (
                                    <div className="relative h-48 w-full mt-4">
                                        <Image src={currentQuestion.image} alt={currentQuestion.text} layout="fill" objectFit="contain" className="rounded-lg" />
                                    </div>
                                )}
                                
                                <CardTitle className="text-center text-2xl md:text-3xl font-bold flex items-center justify-center gap-2">
                                    <span>{currentQuestion?.text}</span>
                                    {currentQuestion?.audio && (
                                        <Button variant="ghost" size="icon" onClick={() => togglePlayUrl(currentQuestion.audio!)}>
                                            {playingUrl === currentQuestion.audio ? <Pause /> : <Play />}
                                        </Button>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center gap-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                                    {currentQuestion?.options.map((option, index) => {
                                        const isSelected = selectedAnswer === option.text;
                                        const isCorrectAnswer = currentQuestion.correctAnswer === option.text;
                                        const isShown = selectedAnswer !== null;

                                        return (
                                            <Card
                                                key={index}
                                                onClick={() => !selectedAnswer && handleAnswer(option.text)}
                                                className={cn(
                                                    "rounded-xl border-2 overflow-hidden transition-all duration-300 transform",
                                                    !selectedAnswer && "cursor-pointer hover:scale-105 hover:shadow-xl",
                                                    isShown && isCorrectAnswer && "border-green-500 ring-4 ring-green-500/50",
                                                    isShown && isSelected && !isCorrectAnswer && "border-destructive ring-4 ring-destructive/50"
                                                )}
                                            >
                                                {option.image && (
                                                    <div className="relative w-full h-40 bg-gray-100 dark:bg-gray-800 p-2">
                                                        <Image src={option.image} alt={option.text} layout="fill" objectFit="contain" />
                                                    </div>
                                                )}
                                                <div className={cn(
                                                    "p-4 text-lg justify-between items-center flex gap-4",
                                                    !selectedAnswer && optionBgColors[index % optionBgColors.length],
                                                    isShown && isCorrectAnswer && 'bg-green-100 dark:bg-green-900/30',
                                                    isShown && isSelected && !isCorrectAnswer && 'bg-red-100 dark:bg-red-900/30'
                                                )}>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold">{String.fromCharCode(65 + index)}.</span>
                                                        <span className="text-left">{option.text}</span>
                                                        {option.audio && (
                                                            <Button variant="ghost" size="icon" className="shrink-0 w-8 h-8 rounded-full" onClick={(e) => { e.stopPropagation(); togglePlayUrl(option.audio!); }}>
                                                                {playingUrl === option.audio ? <Pause className="w-5 h-5"/> : <Play className="w-5 h-5"/>}
                                                            </Button>
                                                        )}
                                                    </div>
                                                    <div className={cn(
                                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                                                        isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                                                    )}>
                                                        {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                                                    </div>
                                                </div>
                                            </Card>
                                        );
                                    })}
                                </div>
                                {feedback && <div className={`mt-4 font-bold text-xl ${isCorrect ? 'text-green-600' : 'text-destructive'}`}>{feedback}</div>}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
