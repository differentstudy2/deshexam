
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, RefreshCw, Check, X, Sparkles, Trophy, Clock, ImageDown, Video, Play, Pause, Volume2, FileQuestion, Loader2, Languages, Settings, Copy } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

const translations = {
    en: {
        backToQuizzes: "Back to Fun Quizzes",
        quizComplete: "Quiz Complete!",
        amazingJob: "You did an amazing job!",
        yourScore: "Your Score",
        playAgain: "Play Again",
        question: "Question",
        timer: "Timer:",
        autoplayAudio: "Autoplay Audio",
        saveAsDefault: "Save as Default",
        saveForLandscape: "Save for Landscape Video (16:9)",
        saveForShorts: "Save for Short Video (9:16)",
        saveForInstagram: "Save for Instagram (1:1)",
        saveForFacebook: "Save for Facebook Post (4:5)",
        correct: "Correct!",
        incorrect: "Not quite!",
        correctAnswer: "Correct Answer",
        timesUp: "Time's up!",
        ttsNotSupported: "Your browser does not support text-to-speech.",
        copied: "Copied to clipboard!",
        copyFailed: "Failed to copy text.",
        copyQuestion: "Copy Question"
    },
    hi: {
        backToQuizzes: "मज़ेदार क्विज़ पर वापस जाएँ",
        quizComplete: "क्विज़ पूरा हुआ!",
        amazingJob: "आपने अद्भुत काम किया!",
        yourScore: "आपका स्कोर",
        playAgain: "फिर से खेलें",
        question: "प्रश्न",
        timer: "टाइमर:",
        autoplayAudio: "ऑडियो ऑटोप्ले करें",
        saveAsDefault: "डिफ़ॉल्ट के रूप में सहेजें",
        saveForLandscape: "लैंडस्केप वीडियो (16:9) के लिए सहेजें",
        saveForShorts: "शॉर्ट वीडियो (9:16) के लिए सहेजें",
        saveForInstagram: "इंस्टाग्राम (1:1) के लिए सहेजें",
        saveForFacebook: "फेसबुक पोस्ट (4:5) के लिए सहेजें",
        correct: "सही!",
        incorrect: "सही नहीं!",
        correctAnswer: "सही जवाब",
        timesUp: "समय समाप्त!",
        ttsNotSupported: "आपका ब्राउज़र टेक्स्ट-टू-स्पीच का समर्थन नहीं करता है।",
        copied: "क्लिपबोर्ड पर कॉपी किया गया!",
        copyFailed: "टेक्स्ट कॉपी करने में विफल।",
        copyQuestion: "प्रश्न कॉपी करें"
    },
    bn: {
        backToQuizzes: "মজার কুইজে ফিরে যান",
        quizComplete: "কুইজ সম্পন্ন!",
        amazingJob: "আপনি একটি আশ্চর্যজনক কাজ করেছেন!",
        yourScore: "আপনার স্কোর",
        playAgain: "আবার খেলুন",
        question: "প্রশ্ন",
        timer: "টাইমার:",
        autoplayAudio: "প্রশ্ন অডিও অটো-প্লে করুন",
        saveAsDefault: "ডিফল্ট হিসেবে সেভ করুন",
        saveForLandscape: "ল্যান্ডস্কেপ ভিডিও (১৬:৯) এর জন্য সেভ করুন",
        saveForShorts: "শর্ট ভিডিও (৯:১৬) এর জন্য সেভ করুন",
        saveForInstagram: "ইন্সটাগ্রাম (১:১) এর জন্য সেভ করুন",
        saveForFacebook: "ফেসবুক পোস্ট (৪:৫) এর জন্য সেভ করুন",
        correct: "সঠিক!",
        incorrect: "সঠিক নয়!",
        correctAnswer: "সঠিক উত্তর",
        timesUp: "সময় শেষ!",
        ttsNotSupported: "আপনার ব্রাউজার টেক্সট-টু-স্পিচ সমর্থন করে না।",
        copied: "ক্লিপবোর্ডে কপি করা হয়েছে!",
        copyFailed: "টেক্সট কপি করতে ব্যর্থ।",
        copyQuestion: "প্রশ্ন কপি করুন"
    }
};

const optionBgColors = [
    'bg-sky-100 dark:bg-sky-900/30 hover:bg-sky-200/80',
    'bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200/80',
    'bg-lime-100 dark:bg-lime-900/30 hover:bg-lime-200/80',
    'bg-rose-100 dark:bg-rose-900/30 hover:bg-rose-200/80',
];

const TimerCircle = ({ timeLeft, totalDuration, className, size = 36, strokeWidth = 3 }: { timeLeft: number; totalDuration: number, className?: string; size?: number; strokeWidth?: number; }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    
    const progress = totalDuration > 0 ? (timeLeft / totalDuration) * 100 : 0;
    const offset = circumference - (progress / 100) * circumference;

    const colorClass = progress <= 25 ? 'text-destructive' : progress <= 50 ? 'text-yellow-500' : 'text-primary';

    return (
        <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
            <svg className="absolute top-0 left-0" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle
                    className="text-gray-200 dark:text-gray-700"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <circle
                    className={cn("transition-all duration-1000 linear -rotate-90 origin-center", colorClass)}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
            </svg>
            <span className={cn("font-mono font-semibold", colorClass, {
                'text-sm': size >= 36,
                'text-xs': size < 36,
            })}>
                {timeLeft}
            </span>
        </div>
    );
};


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

    const [isCapturing, setIsCapturing] = useState(false);
    const [captureMode, setCaptureMode] = useState<'idle' | 'question' | 'answer'>('idle');
    const [isLoading, setIsLoading] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [language, setLanguage] = useState<'en' | 'hi' | 'bn'>('bn');

    const t = translations[language];

    const stopAllAudio = useCallback(() => {
        if (activeAudioRef.current) {
            activeAudioRef.current.pause();
            activeAudioRef.current.currentTime = 0;
            activeAudioRef.current = null;
        }
        setPlayingUrl(null);
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    }, []);
    
    const speakText = useCallback((text: string) => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = language === 'en' ? 'en-US' : language === 'hi' ? 'hi-IN' : 'bn-BD';
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
        } else {
            toast({
                variant: "destructive",
                title: "TTS Not Supported",
                description: t.ttsNotSupported,
            });
        }
    }, [language, t.ttsNotSupported, toast]);

    const speakFullQuestion = useCallback((question?: Question) => {
        if (!question) return;
        stopAllAudio();
        
        let textToSpeak = `${question.text}. `;
        const correctOptionIndex = question.options.findIndex(opt => opt.text === question.correctAnswer);
        const correctOptionLetter = String.fromCharCode(65 + correctOptionIndex);

        question.options.forEach((opt, index) => {
            const optionLetter = String.fromCharCode(65 + index);
            textToSpeak += `Option ${optionLetter}: ${opt.text}. `;
        });

        textToSpeak += `${t.correctAnswer} Option ${correctOptionLetter}: ${question.correctAnswer}.`;
        
        speakText(textToSpeak);
    }, [stopAllAudio, speakText, t.correctAnswer]);

    const playSound = useCallback((url: string) => {
        if (typeof window === 'undefined') return;
        
        stopAllAudio();

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
    }, [stopAllAudio]);

    const togglePlayUrl = useCallback((url: string) => {
        if (playingUrl === url && activeAudioRef.current) {
            stopAllAudio();
        } else {
            playSound(url);
        }
    }, [playingUrl, playSound, stopAllAudio]);

    const playSystemSound = useCallback((type: 'correct' | 'incorrect' | 'win') => {
        if (typeof window === 'undefined') return;

        if (type !== 'win') {
           stopAllAudio();
        }
        
        let soundUrl = '';
        if (type === 'correct') soundUrl = '/audio/correct-83487.mp3';
        else if (type === 'incorrect') soundUrl = '/audio/incorrect-293358.mp3';
        else if (type === 'win') soundUrl = '/audio/win-fanfare.mp3';
        
        if(soundUrl) {
            const audio = new Audio(soundUrl);
            audio.play().catch(error => console.error(`Error playing sound:`, error));
        }
    }, [stopAllAudio]);
    
    const toggleSpeak = useCallback(() => {
        if (isSpeaking) {
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        } else {
            speakFullQuestion(shuffledQuestions[currentQuestionIndex]);
        }
    }, [isSpeaking, speakFullQuestion, currentQuestionIndex, shuffledQuestions]);


    const nextQuestion = useCallback(() => {
        stopAllAudio();
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
    }, [currentQuestionIndex, shuffledQuestions.length, timerDuration, playSystemSound, stopAllAudio]);
    
    useEffect(() => {
        if(quiz && quiz.questions) {
             setShuffledQuestions([...quiz.questions].sort(() => Math.random() - 0.5));
        }
        setIsLoading(false);
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
                    stopAllAudio();
                    playSystemSound('incorrect');
                    setFeedback(t.timesUp);
                    setTimeout(nextQuestion, 1500); 
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
    }, [quizFinished, selectedAnswer, nextQuestion, timerDuration, currentQuestionIndex, playSystemSound, stopAllAudio, t.timesUp]);
    
    useEffect(() => {
        return () => {
            stopAllAudio();
        }
    }, [stopAllAudio]);

    const handleAnswer = (answer: string) => {
        if (selectedAnswer) return;

        stopAllAudio();

        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

        setSelectedAnswer(answer);
        if (answer === currentQuestion.correctAnswer) {
            setFeedback(t.correct);
            setIsCorrect(true);
            setScore(prev => prev + 1);
            playSystemSound('correct');
        } else {
            setFeedback(t.incorrect);
            playSystemSound('incorrect');
        }

        setTimeout(nextQuestion, 1500);
    };

    const restartQuiz = () => {
        stopAllAudio();
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
        const sourceCanvas = await html2canvas(quizCardRef.current, { 
            useCORS: true, 
            backgroundColor: null,
            scale: 4
        });
        
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
                { from: 'rgb(128, 128, 0)', to: '#1d4350' },
                { from: '#434343', to: '#000000' },
                { from: '#283e51', to: '#4b79a1' },
                { from: '#2c3e50', to: '#2980b9' },
                { from: '#3498db', to: '#2c3e50' }
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

    const handleCopy = () => {
        if (!currentQuestion) return;

        let textToCopy = `${currentQuestion.text}\n`;
        currentQuestion.options.forEach((opt, i) => {
            textToCopy += `Option "${String.fromCharCode(65 + i)}": "${opt.text}"\n`;
        });
        const correctOptionIndex = currentQuestion.options.findIndex(opt => opt.text === currentQuestion.correctAnswer);
        if (correctOptionIndex > -1) {
            const correctOptionLetter = String.fromCharCode(65 + correctOptionIndex);
            textToCopy += `Correct Answer Option "${correctOptionLetter}": "${currentQuestion.correctAnswer}"\n`;
        }

        navigator.clipboard.writeText(textToCopy).then(() => {
            toast({ title: t.copied });
        }).catch(err => {
            toast({ variant: 'destructive', title: t.copyFailed, description: 'Could not copy text to clipboard.' });
        });
    };
    
    const handleLanguageChange = (lang: 'en' | 'hi' | 'bn') => {
        setLanguage(lang);
    };

    if (isLoading) {
        return (
             <div className="w-full max-w-2xl mx-auto py-12 px-4">
                <Card className="bg-card/60 backdrop-blur-sm">
                    <CardContent className="p-3">
                        <div className="flex flex-wrap justify-between items-center gap-4">
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-4 w-1/2 flex-grow" />
                            <div className="flex items-center gap-4 flex-wrap justify-end">
                               <Skeleton className="h-9 w-9 rounded-full" />
                               <Skeleton className="h-9 w-9 rounded-full" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-2xl bg-card/60 backdrop-blur-sm overflow-hidden mt-2">
                    <CardHeader className="relative bg-muted/30 p-6 min-h-[150px]">
                        <div className="space-y-3">
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-5 w-1/2" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                            <Skeleton className="h-20 w-full rounded-xl" />
                            <Skeleton className="h-20 w-full rounded-xl" />
                            <Skeleton className="h-20 w-full rounded-xl" />
                            <Skeleton className="h-20 w-full rounded-xl" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

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
                            <CardTitle className="text-4xl font-bold font-headline mt-4">{t.quizComplete}</CardTitle>
                            <CardDescription className="text-lg">{t.amazingJob}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-5xl font-bold">{score} <span className="text-3xl text-muted-foreground">/ {shuffledQuestions.length}</span></p>
                            <p className="text-xl mt-2 font-semibold">{t.yourScore}</p>
                            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                                <Button onClick={restartQuiz} size="lg">
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    {t.playAgain}
                                </Button>
                                <Button asChild variant="outline" size="lg">
                                    <Link href="/kids-zone/fun-quizzes">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        {t.backToQuizzes}
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
                                    <div className="flex-grow" />
                                    <div className="flex items-center gap-2">
                                        {timerDuration > 0 && timeLeft !== null && (
                                            <TimerCircle timeLeft={timeLeft} totalDuration={timerDuration} />
                                        )}
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="icon"><Settings className="h-4 w-4" /></Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[425px]">
                                                <DialogHeader>
                                                    <DialogTitle>Quiz Settings</DialogTitle>
                                                    <DialogDescription>Adjust your quiz preferences.</DialogDescription>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label htmlFor="language" className="flex items-center gap-2 col-span-2"><Languages className="w-5 h-5"/> Language</Label>
                                                        <Select value={language} onValueChange={handleLanguageChange}>
                                                            <SelectTrigger className="col-span-2 h-9"><SelectValue /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="en">English</SelectItem>
                                                                <SelectItem value="hi">हिन्दी</SelectItem>
                                                                <SelectItem value="bn">বাংলা</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label htmlFor="autoplay" className="flex items-center gap-2 col-span-2"><Volume2 className="w-5 h-5"/> Autoplay</Label>
                                                        <Switch id="autoplay" checked={autoplayEnabled} onCheckedChange={(checked) => { setAutoplayEnabled(checked); if (!checked) { stopAllAudio(); } }} />
                                                    </div>
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label htmlFor="timer" className="flex items-center gap-2 col-span-2"><Clock className="w-5 h-5"/> Timer</Label>
                                                        <Select value={timerDuration.toString()} onValueChange={handleTimerChange} disabled={selectedAnswer !== null}>
                                                            <SelectTrigger id="timer" className="col-span-2 h-9"><SelectValue /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="15">15 seconds</SelectItem>
                                                                <SelectItem value="30">30 seconds</SelectItem>
                                                                <SelectItem value="60">60 seconds</SelectItem>
                                                                <SelectItem value="0">Off</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                        <Button variant="outline" size="icon" onClick={toggleSpeak}>
                                            {isSpeaking ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                        </Button>
                                        {currentQuestion?.audio && (
                                            <Button variant="outline" size="icon" onClick={() => togglePlayUrl(currentQuestion.audio!)}>
                                                {playingUrl === currentQuestion.audio ? <Pause className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                                            </Button>
                                        )}
                                        <Button variant="outline" size="icon" onClick={handleCopy}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                 <Button variant="outline" size="icon" disabled={isCapturing}>
                                                     {isCapturing ? <Loader2 className="h-4 w-4 animate-spin"/> : <ImageDown className="h-4 w-4" />}
                                                 </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => handleSaveAsImage('default')}>
                                                    {t.saveAsDefault}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleSaveAsImage('16:9')}>
                                                    <Video className="mr-2 h-4 w-4" />
                                                    {t.saveForLandscape}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleSaveAsImage('9:16')}>
                                                    <Video className="mr-2 h-4 w-4 rotate-90" />
                                                    {t.saveForShorts}
                                                </DropdownMenuItem>
                                                 <DropdownMenuItem onClick={() => handleSaveAsImage('1:1')}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>
                                                    {t.saveForInstagram}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleSaveAsImage('4:5')}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /></svg>
                                                    {t.saveForFacebook}
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
                                        <div className="relative h-48 w-full my-4">
                                            <Image src={currentQuestion.image} alt={currentQuestion.text} layout="fill" objectFit="contain" className="rounded-lg" />
                                        </div>
                                    )}
                                    
                                     <div className="flex items-start justify-between gap-2">
                                        <CardTitle className="text-left text-2xl md:text-3xl font-bold">
                                            <span>{currentQuestion?.text}</span>
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <RadioGroup onValueChange={handleAnswer} value={selectedAnswer || ''} disabled={selectedAnswer !== null}>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                                            {currentQuestion?.options.map((option, index) => {
                                                const isSelected = selectedAnswer === option.text;
                                                const isCorrectAnswer = currentQuestion.correctAnswer === option.text;
                                                const isShown = selectedAnswer !== null;

                                                return (
                                                    <Label
                                                        key={index}
                                                        htmlFor={`q-${currentQuestionIndex}-opt-${index}`}
                                                        className={cn(
                                                            "rounded-xl border-2 p-4 flex justify-between items-center gap-4 transition-all duration-300",
                                                            !isShown && "cursor-pointer hover:scale-105 hover:border-primary",
                                                            isShown && isCorrectAnswer && "border-green-500 ring-2 ring-green-500/50 bg-green-100 dark:bg-green-900/30",
                                                            isShown && isSelected && !isCorrectAnswer && "border-destructive ring-2 ring-destructive/50 bg-red-100 dark:bg-red-900/30",
                                                            !isShown && optionBgColors[index % optionBgColors.length],
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
                                    {feedback && captureMode === 'idle' && (
                                        <div className={`mt-4 font-bold text-xl text-center ${isCorrect ? 'text-green-600' : 'text-destructive'}`}>
                                            {feedback}
                                            {!isCorrect && selectedAnswer && (
                                                <div className="text-sm font-normal text-muted-foreground mt-2 flex items-center justify-center">
                                                    <span>{t.correctAnswer} {currentQuestion.correctAnswer}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

