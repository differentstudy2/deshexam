

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, RefreshCw, Mic, Sparkles, X, Check, Eye, ImageDown, Video, Play, Pause, Volume2, FileQuestion, Languages, Settings, Copy, Trophy, Loader2, ChevronLeft, ChevronRight, GripVertical, CheckCircle, XCircle } from "lucide-react";
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
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';

type Question = {
    id: string;
    text: string;
    image?: string;
    audio?: string;
    options: { text: string; image?: string; audio?: string; }[];
    matchingOptions?: {
        columnA: { text: string; image?: string; }[];
        columnB: { text: string; image?: string; }[];
    };
    correctAnswer: any;
    type: 'Multiple Choice' | 'True/False' | 'Short Answer' | 'Fill in the Blank' | 'Matching' | 'Direct Question';
    answerImage?: string;
    answerAudio?: string;
};

type Quiz = {
    id: string;
    title: string;
    questions: Question[];
};

const translations = {
    en: {
        backToQuizzes: "Back to Quizzes",
        quizComplete: "Quiz Complete!",
        amazingJob: "You did an amazing job!",
        yourScore: "Your Score",
        playAgain: "Play Again",
        question: "Question",
        timer: "Timer:",
        seconds: "seconds",
        off: "Off",
        autoplayAudio: "Autoplay Audio",
        autoAnswer: "Auto Answer",
        saveAsDefault: "Save Default",
        saveForLandscape: "(16:9)",
        saveForShorts: "(9:16)",
        saveForInstagram: "(1:1)",
        saveForFacebook: "(4:5)",
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
        backToQuizzes: "क्विज़ पर वापस जाएं",
        quizComplete: "क्विज़ पूरा हुआ!",
        amazingJob: "आपने अद्भुत काम किया!",
        yourScore: "आपका स्कोर",
        playAgain: "फिर से खेलें",
        question: "प्रश्न",
        timer: "टाइमर:",
        seconds: "सेकंड",
        off: "बंद",
        autoplayAudio: "ऑडियो ऑटोप्ले करें",
        autoAnswer: "ऑटो उत्तर",
        saveAsDefault: "डिफ़ॉल्ट",
        saveForLandscape: "(16:9)",
        saveForShorts: "(9:16)",
        saveForInstagram: "(1:1)",
        saveForFacebook: "(4:5)",
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
        backToQuizzes: "কুইজে ফিরে যান",
        quizComplete: "কুইজ সম্পন্ন!",
        amazingJob: "আপনি একটি আশ্চর্যজনক কাজ করেছেন!",
        yourScore: "আপনার স্কোর",
        playAgain: "আবার খেলুন",
        question: "প্রশ্ন",
        timer: "টাইমার:",
        seconds: "সেকেন্ড",
        off: "বন্ধ",
        autoplayAudio: "প্রশ্ন অডিও অটো-প্লে করুন",
        autoAnswer: "স্বয়ংক্রিয় উত্তর",
        saveAsDefault: "ডিফল্ট",
        saveForLandscape: "(১৬:৯)",
        saveForShorts: "(৯:১৬)",
        saveForInstagram: "(১:১)",
        saveForFacebook: "(৪:৫)",
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

const toDevanagari = (num: number | string) => {
    const n = num.toString();
    const devanagariDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return n.split('').map(digit => devanagariDigits[parseInt(digit, 10)]).join('');
};

const toBengaliNumerals = (num: number | string) => {
    const n = num.toString();
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return n.split('').map(digit => bengaliDigits[parseInt(digit, 10)]).join('');
};

const optionGradients = [
    'from-sky-500 to-indigo-600',
    'from-amber-400 to-orange-500',
    'from-teal-400 to-cyan-500',
    'from-rose-400 to-red-500',
];

const bgGradients = [
    'from-rose-400 via-fuchsia-500 to-indigo-500',
    'from-amber-400 via-orange-500 to-red-500',
    'from-sky-400 via-cyan-500 to-blue-500',
    'from-violet-400 via-purple-500 to-pink-500',
    'from-[#ec4899] to-[#f43f5e]',
    'from-[#06b6d4] to-[#3b82f6]',
    'from-[#facc15] to-[#eab308]'
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
    const [selectedAnswer, setSelectedAnswer] = useState<any>(null);
    const [matchingAnswers, setMatchingAnswers] = useState<{ [key: string]: string }>({});
    const [feedback, setFeedback] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);
    const [score, setScore] = useState(0);
    const [quizFinished, setQuizFinished] = useState(false);
    const [timerDuration, setTimerDuration] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const quizCardRef = useRef<HTMLDivElement>(null);
    const [autoplayEnabled, setAutoplayEnabled] = useState(false);
    const [autoAnswerEnabled, setAutoAnswerEnabled] = useState(false);
    const nextQuestionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [playingUrl, setPlayingUrl] = useState<string | null>(null);
    const activeAudioRef = useRef<HTMLAudioElement | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    const [isCapturing, setIsCapturing] = useState(false);
    const [captureMode, setCaptureMode] = useState<'idle' | 'question' | 'answer'>('idle');
    const [isLoading, setIsLoading] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [language, setLanguage] = useState<'en' | 'hi' | 'bn'>('bn');
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [textAnswer, setTextAnswer] = useState('');

    const [fillInTheBlankAnswers, setFillInTheBlankAnswers] = useState<(string | null)[]>([]);
    const [wordBank, setWordBank] = useState<string[]>([]);
    
    const t = translations[language];

    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    
     const stopSound = useCallback(() => {
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
        setIsSubmitting(false);
        if (currentQuestionIndex < shuffledQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setFeedback('');
            setIsCorrect(false);
            setMatchingAnswers({});
            setTextAnswer('');
            setFillInTheBlankAnswers([]);
            setWordBank([]);
            if (timerDuration > 0) {
                setTimeLeft(timerDuration);
            }
        } else {
            setQuizFinished(true);
            playSystemSound('win');
        }
    }, [currentQuestionIndex, shuffledQuestions.length, timerDuration, playSystemSound, stopSound]);
    
    const handleAnswer = useCallback((answer: any) => {
        if (selectedAnswer || isSubmitting) return;

        stopSound();
        setIsSubmitting(true);

        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

        setSelectedAnswer(answer);
        
        let isCorrect = false;
        let isPartial = false;

        if (currentQuestion.type === 'Matching') {
            const correctAnswers = currentQuestion.correctAnswer;
            let correctCount = 0;
            if (answer && Array.isArray(correctAnswers)) {
                for (const pair of correctAnswers) {
                    if (answer[pair.a] === pair.b) {
                        correctCount++;
                    }
                }
            }
            if (correctAnswers && correctAnswers.length > 0 && correctCount === correctAnswers.length) {
                isCorrect = true;
            } else if (correctCount > 0) {
                isPartial = true;
            }
        } else {
             const processedUserAnswer = typeof answer === 'string' ? answer.toLowerCase().trim() : answer;
             const correctAnswer = typeof currentQuestion.correctAnswer === 'string' 
                ? currentQuestion.correctAnswer.toLowerCase().trim() 
                : currentQuestion.correctAnswer;
            
            isCorrect = processedUserAnswer === correctAnswer;
        }

        if (isCorrect) {
            setFeedback(t.correct);
            setIsCorrect(true);
            setScore(prev => prev + 1); // For quizzes, assume 1 point per question
            playSystemSound('correct');
        } else {
            setFeedback(isPartial ? 'Partially Correct!' : t.incorrect);
            playSystemSound(isPartial ? 'correct' : 'incorrect');
        }

        nextQuestionTimeoutRef.current = setTimeout(nextQuestion, 5000);
    }, [selectedAnswer, isSubmitting, stopSound, currentQuestion, t, playSystemSound, nextQuestion]);

    const onAudioEnd = useCallback(() => {
        if (autoAnswerEnabled && currentQuestion) {
            handleAnswer(currentQuestion.correctAnswer);
        }
    }, [autoAnswerEnabled, currentQuestion, handleAnswer]);
    
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
            onAudioEnd();
        };
    }, [stopSound, onAudioEnd]);

     const speakText = useCallback((text: string) => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            stopSound();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = language === 'en' ? 'en-US' : language === 'hi' ? 'hi-IN' : 'bn-BD';
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => {
                setIsSpeaking(false);
                onAudioEnd();
            };
            utterance.onerror = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
        } else {
            toast({
                variant: "destructive",
                title: "TTS Not Supported",
                description: t.ttsNotSupported,
            });
        }
    }, [language, t.ttsNotSupported, toast, onAudioEnd, stopSound]);

     const speakFullQuestion = useCallback((question?: Question) => {
        if (!question) return;
        stopSound();
        
        let textToSpeak = `${question.text}. `;
        if ((question.type === 'Multiple Choice' || question.type === 'True/False') && question.options) {
            const correctOptionIndex = question.options.findIndex(opt => opt.text === question.correctAnswer);
            const correctOptionLetter = String.fromCharCode(65 + correctOptionIndex);

            question.options.forEach((opt, index) => {
                const optionLetter = String.fromCharCode(65 + index);
                textToSpeak += `Option ${optionLetter}: ${opt.text}. `;
            });

            textToSpeak += `${t.correctAnswer} Option ${correctOptionLetter}: ${question.correctAnswer}.`;
        }
        
        speakText(textToSpeak);
    }, [stopSound, speakText, t.correctAnswer]);
    
    useEffect(() => {
        if (!autoplayEnabled || !currentQuestion || quizFinished || selectedAnswer) {
            return;
        }

        const autoplayTimeout = setTimeout(() => {
            if (currentQuestion.audio) {
                playSound(currentQuestion.audio);
            } 
            else if (currentQuestion.text) {
                speakFullQuestion(currentQuestion);
            } else {
                if (autoAnswerEnabled) {
                   handleAnswer(currentQuestion.correctAnswer);
                }
            }
        }, 500); 

        return () => clearTimeout(autoplayTimeout);
    }, [currentQuestionIndex, currentQuestion, autoplayEnabled, quizFinished, selectedAnswer, playSound, speakFullQuestion, autoAnswerEnabled, handleAnswer]);

    const togglePlayUrl = useCallback((url: string) => {
        if (playingUrl === url && activeAudioRef.current) {
            stopSound();
        } else {
            playSound(url);
        }
    }, [playingUrl, playSound, stopSound]);
    
    const toggleSpeak = useCallback(() => {
        if (isSpeaking) {
            stopSound();
        } else {
            speakFullQuestion(shuffledQuestions[currentQuestionIndex]);
        }
    }, [isSpeaking, speakFullQuestion, currentQuestionIndex, shuffledQuestions, stopSound]);

    const restartQuiz = () => {
        stopSound();
        setShuffledQuestions([...quiz.questions].sort(() => Math.random() - 0.5));
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setMatchingAnswers({});
        setFeedback('');
        setIsCorrect(false);
        setScore(0);
        setQuizFinished(false);
        setIsSubmitting(false);
        setTextAnswer('');
        setFillInTheBlankAnswers([]);
        setWordBank([]);
        setTimeLeft(timerDuration);
    };
    
    const handleTimerChange = (value: string) => {
        const newDuration = parseInt(value, 10);
        setTimerDuration(newDuration);
        setTimeLeft(newDuration);
    };
    
    useEffect(() => {
      const shuffleArray = (array: any[]) => {
        const indexedArray = array.map((item, index) => ({ ...item, originalIndex: index }));
        for (let i = indexedArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indexedArray[i], indexedArray[j]] = [indexedArray[j], indexedArray[i]];
        }
        return indexedArray;
      };

      if (quiz && quiz.questions) {
          const questionsWithMatchingOptions = quiz.questions.map(q => {
              if (q.type === 'Matching' && q.correctAnswer) {
                  const pairs = q.correctAnswer as { a: string, aImage?: string, b: string, bImage?: string }[];
                  const columnA = pairs.map(p => ({ text: p.a, image: p.aImage }));
                  let columnB = pairs.map(p => ({ text: p.b, image: p.bImage }));
                  return {
                      ...q,
                      matchingOptions: {
                          columnA,
                          columnB: shuffleArray(columnB)
                      }
                  }
              }
              return q;
          });
          setShuffledQuestions([...questionsWithMatchingOptions].sort(() => Math.random() - 0.5));
      }
      setIsLoading(false);
    }, [quiz]);

    useEffect(() => {
        if (currentQuestion?.type === 'Fill in the Blank' && currentQuestion.options) {
            const blankCount = (currentQuestion.text.match(/____/g) || []).length;
            setFillInTheBlankAnswers(Array(blankCount).fill(null));
            setWordBank(currentQuestion.options.map(o => o.text).filter(Boolean) as string[]);
        }
    }, [currentQuestion]);


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
                    setFeedback(t.timesUp);
                    setTimeout(nextQuestion, 5000); 
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
    }, [quizFinished, selectedAnswer, nextQuestion, timerDuration, currentQuestionIndex, playSystemSound, stopSound, t.timesUp]);
    
    useEffect(() => {
        return () => {
            stopSound();
            if (nextQuestionTimeoutRef.current) {
              clearTimeout(nextQuestionTimeoutRef.current);
            }
        }
    }, [stopSound]);

    const handleManualNext = () => {
        if (nextQuestionTimeoutRef.current) {
            clearTimeout(nextQuestionTimeoutRef.current);
            nextQuestionTimeoutRef.current = null;
        }
        nextQuestion();
    };
    
    const handleManualPrev = () => {
        if (nextQuestionTimeoutRef.current) {
            clearTimeout(nextQuestionTimeoutRef.current);
            nextQuestionTimeoutRef.current = null;
        }
        stopSound();
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
            setSelectedAnswer(null);
            setFeedback('');
            setIsCorrect(false);
            setMatchingAnswers({});
            if (timerDuration > 0) {
                setTimeLeft(timerDuration);
            }
        }
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

            // Create a pleasant gradient background
            const gradients = [
                { from: '#DA22FF', to: '#9733EE' },
                { from: '#09203F', to: '#537895' },
                { from: '#868F96', to: '#596164' },
                { from: '#c0392b', to: '#8e44ad' },
                { from: '#434343', to: '#000000' },
                { from: '#283e51', to: '#4b79a1' },
                { from: '#2c3e50', to: '#2980b9' },
                { from: '#3498db', to: '#2c3e50' },
                { from: '#6a3093', to: '#a044ff' }
            ];
            const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
            const gradient = targetCtx.createLinearGradient(0, 0, targetWidth, targetHeight);
            gradient.addColorStop(0, randomGradient.from);
            gradient.addColorStop(0.5, randomGradient.to);
            gradient.addColorStop(1, randomGradient.to);
            targetCtx.fillStyle = gradient;
            targetCtx.fillRect(0, 0, targetWidth, targetHeight);
            
            // Add repeating watermark
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

        let textToCopy = `${t.question}: ${currentQuestion.text}\n`;
        currentQuestion.options.forEach((opt, i) => {
            textToCopy += `Option "${String.fromCharCode(65 + i)}": "${opt.text}"\n`;
        });
        const correctOptionIndex = currentQuestion.options.findIndex(opt => opt.text === currentQuestion.correctAnswer);
        if (correctOptionIndex > -1) {
            const correctOptionLetter = String.fromCharCode(65 + correctOptionIndex);
            textToCopy += `${t.correctAnswer} Option "${correctOptionLetter}": "${currentQuestion.correctAnswer}"`;
        }

        navigator.clipboard.writeText(textToCopy).then(() => {
            toast({ title: t.copied });
        }).catch(err => {
            toast({ variant: 'destructive', title: t.copyFailed, description: 'Could not copy text to clipboard.' });
        });
    };
    
    const handleLanguageChange = (lang: 'en' | 'hi' | 'bn') => {
        setLanguage(lang);
    }
    
    const displayNum = (num: number | string) => {
        if (language === 'hi') return toDevanagari(num);
        if (language === 'bn') return toBengaliNumerals(num);
        return num.toString();
    }
    
    const handleDragStart = (e: React.DragEvent, word: string, from: 'bank' | number) => {
        e.dataTransfer.setData("text/plain", JSON.stringify({ word, from }));
    };

    const handleDrop = (e: React.DragEvent, to: 'bank' | number) => {
        e.preventDefault();
        const data = e.dataTransfer.getData("text/plain");
        if (!data) return;

        const { word, from } = JSON.parse(data);

        const newAnswers = [...fillInTheBlankAnswers];
        let newWordBank = [...wordBank];

        if (to === 'bank') {
            if (from !== 'bank') { // Moving from blank to bank
                newAnswers[from] = null;
                newWordBank.push(word);
            }
        } else { // Dropping on a blank
            const oldWordInBlank = newAnswers[to];
            newAnswers[to] = word;

            if (from === 'bank') {
                newWordBank = newWordBank.filter(w => w !== word);
            } else { // Moving from another blank
                newAnswers[from] = null;
            }
            
            if (oldWordInBlank) {
                newWordBank.push(oldWordInBlank);
            }
        }

        setFillInTheBlankAnswers(newAnswers);
        setWordBank(newWordBank);
    };
    
    const checkFillInTheBlankAnswer = useCallback(() => {
        if (isSubmitting || !currentQuestion) return;
        
        const correctAnswers = (currentQuestion.correctAnswer as string[]).slice(0, fillInTheBlankAnswers.length);
        const userAnswers = fillInTheBlankAnswers.filter(a => a !== null);

        const isCorrect = userAnswers.length === correctAnswers.length && userAnswers.every((ans, i) => ans === correctAnswers[i]);
        
        handleAnswer(isCorrect);
    }, [isSubmitting, currentQuestion, fillInTheBlankAnswers, handleAnswer]);

    useEffect(() => {
        if (currentQuestion?.type === 'Fill in the Blank' && currentQuestion.options && currentQuestion.options.length > 0 && fillInTheBlankAnswers.length > 0 && !isSubmitting) {
            const allFilled = fillInTheBlankAnswers.every(a => a !== null);
            const blankCount = (currentQuestion?.text.match(/____/g) || []).length;
            if (allFilled && fillInTheBlankAnswers.length === blankCount) {
                checkFillInTheBlankAnswer();
            }
        }
    }, [fillInTheBlankAnswers, currentQuestion, isSubmitting, checkFillInTheBlankAnswer]);

    const handleMatchingAnswerChange = (columnAItem: string, columnBItem: string) => {
        if (isSubmitting) return;
        const newAnswers = { ...matchingAnswers, [columnAItem]: columnBItem };
        setMatchingAnswers(newAnswers);
        if (currentQuestion.matchingOptions && Object.keys(newAnswers).length === currentQuestion.matchingOptions.columnA.length) {
            handleAnswer(newAnswers);
        }
    };


    if (isLoading) {
        return (
             <div className="w-full max-w-2xl mx-auto py-12 px-4">
                <Card className="bg-card/60 backdrop-blur-sm">
                    <CardContent className="p-3">
                        <div className="flex flex-wrap justify-between items-center gap-4">
                            <Skeleton className="h-6 w-20" />
                            <div className="flex-grow max-w-lg">
                                <Skeleton className="h-4 w-full" />
                            </div>
                            <div className="flex items-center gap-4 flex-wrap justify-end">
                               <Skeleton className="h-9 w-9 rounded-full" />
                               <Skeleton className="h-9 w-9 rounded-full" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-2xl bg-card/100 backdrop-blur-sm overflow-hidden mt-2">
                    <CardHeader className="relative bg-muted/30 p-6 min-h-[150px]">
                        <div className="space-y-3">
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-5 w-1/2" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                            <Skeleton className="h-16 w-full rounded-xl" />
                            <Skeleton className="h-16 w-full rounded-xl" />
                            <Skeleton className="h-16 w-full rounded-xl" />
                            <Skeleton className="h-16 w-full rounded-xl" />
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
                     <Link href="/quizzes">Back to Quizzes</Link>
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
                opacity: 0.08,
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
                            <p className="text-5xl font-bold">{displayNum(score)} <span className="text-3xl text-muted-foreground">/ {displayNum(shuffledQuestions.length)}</span></p>
                            <p className="text-xl mt-2 font-semibold">{t.yourScore}</p>
                            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                                <Button onClick={restartQuiz} size="lg">
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    {t.playAgain}
                                </Button>
                                <Button asChild variant="outline" size="lg">
                                    <Link href="/quizzes">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        {t.backToQuizzes}
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="relative">
                        <Button
                            variant="outline"
                            size="icon"
                            className="absolute -left-4 md:-left-16 top-1/2 -translate-y-1/2 rounded-full h-12 w-12 z-20 bg-white/50 dark:bg-black/50 backdrop-blur-sm hidden md:flex"
                            onClick={handleManualPrev}
                            disabled={currentQuestionIndex === 0 || isSubmitting}
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </Button>

                        <div className={cn(
                            "w-full mx-auto transition-all duration-300",
                            viewMode === 'desktop' ? 'max-w-2xl' : 'max-w-sm'
                        )}>
                            <Card className="bg-card/60 backdrop-blur-sm">
                                <CardContent className="p-3">
                                    <div className="flex flex-wrap justify-between items-center gap-4">
                                         <div className="flex items-baseline gap-1 text-sm font-semibold text-muted-foreground">
                                            <span className="text-2xl font-bold text-foreground bg-secondary px-2 rounded-md">{displayNum(currentQuestionIndex + 1)}</span>
                                            <span>/</span>
                                            <span className="text-lg">{displayNum(shuffledQuestions.length)}</span>
                                        </div>
                                        <div className="flex items-center gap-4 flex-wrap justify-end">
                                            <div className="flex items-center gap-1 flex-shrink-0">
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
                                                        <DropdownMenuItem onClick={() => handleSaveAsImage('default')}>{t.saveAsDefault}</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleSaveAsImage('16:9')}><Video className="mr-2 h-4 w-4" />{t.saveForLandscape}</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleSaveAsImage('9:16')}><Video className="mr-2 h-4 w-4 rotate-90" />{t.saveForShorts}</DropdownMenuItem>
                                                         <DropdownMenuItem onClick={() => handleSaveAsImage('1:1')}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>{t.saveForInstagram}</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleSaveAsImage('4:5')}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /></svg>{t.saveForFacebook}</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
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
                                                            <Label htmlFor="view-mode" className="col-span-2">View Mode</Label>
                                                            <Select value={viewMode} onValueChange={(v) => setViewMode(v as 'desktop' | 'mobile')}>
                                                                <SelectTrigger className="col-span-2 h-9">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="desktop">Desktop</SelectItem>
                                                                    <SelectItem value="mobile">Mobile (Shorts)</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
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
                                                            <Label htmlFor="timer-select" className="col-span-2">{t.timer}</Label>
                                                            <Select value={timerDuration.toString()} onValueChange={handleTimerChange} disabled={selectedAnswer !== null}>
                                                                <SelectTrigger id="timer-select" className="col-span-2 h-9">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                <SelectItem value="0">{t.off}</SelectItem>
                                                                    <SelectItem value="15">15 {t.seconds}</SelectItem>
                                                                    <SelectItem value="30">30 {t.seconds}</SelectItem>
                                                                    <SelectItem value="60">60 {t.seconds}</SelectItem>
                                                                    
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <Label htmlFor="autoplay-switch" className="flex items-center gap-2"><Volume2 className="w-5 h-5"/> {t.autoplayAudio}</Label>
                                                            <Switch id="autoplay-switch" checked={autoplayEnabled} onCheckedChange={(checked) => { setAutoplayEnabled(checked); if (!checked) { stopSound(); } }} />
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <Label htmlFor="auto-answer-switch" className="flex items-center gap-2"><Sparkles className="w-5 h-5"/> {t.autoAnswer}</Label>
                                                            <Switch id="auto-answer-switch" checked={autoAnswerEnabled} onCheckedChange={setAutoAnswerEnabled} />
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>

                                            {timerDuration > 0 && (
                                                <div className="flex items-center gap-2 text-muted-foreground font-semibold">
                                                    <TimerCircle timeLeft={timeLeft} totalDuration={timerDuration} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <div ref={quizCardRef}>
                                 <Card className={cn(
                                    "shadow-2xl overflow-hidden mt-2",
                                    (captureMode !== 'question') && `bg-gradient-to-br ${bgGradients[currentQuestionIndex % bgGradients.length]}`,
                                    captureMode === 'question' && 'bg-orange-500'
                                )}>
                                    <CardHeader className={cn(
                                        "relative p-6 text-white",
                                        (captureMode !== 'question') && `bg-gradient-to-br ${bgGradients[currentQuestionIndex % bgGradients.length]}`,
                                        captureMode === 'question' && 'bg-orange-500'
                                    )}>
                                        <div className="relative z-10">
                                            <CardTitle className="text-center text-2xl md:text-3xl font-bold flex items-center justify-center gap-2">
                                                <span>{currentQuestion?.text}</span>
                                                {currentQuestion?.audio && (
                                                    <Button variant="ghost" size="icon" onClick={() => togglePlayUrl(currentQuestion.audio!)}>
                                                        {playingUrl === currentQuestion.audio ? <Pause /> : <Play />}
                                                    </Button>
                                                )}
                                            </CardTitle>
                                        </div>
                                    </CardHeader>
                                    
                                    {currentQuestion && currentQuestion.image && (
                                        <div className="p-4 bg-black/10">
                                            <div className="relative h-48 w-full">
                                                <Image 
                                                    src={currentQuestion.image} 
                                                    alt={currentQuestion.text || 'Question Image'} 
                                                    layout="fill" 
                                                    objectFit="contain" 
                                                    className="rounded-lg" 
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <CardContent className="p-6 bg-orange-50 dark:bg-slate-900 rounded-b-xl">
                                        {currentQuestion?.type === 'Multiple Choice' && currentQuestion.options ? (
                                            <RadioGroup onValueChange={handleAnswer} value={selectedAnswer || ''} disabled={selectedAnswer !== null}>
                                                <div className={cn("grid gap-4 w-full", viewMode === 'desktop' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1')}>
                                                    {currentQuestion.options.map((option, index) => {
                                                        const isSelected = selectedAnswer === option.text;
                                                        const isCorrectAnswer = currentQuestion.correctAnswer === option.text;
                                                        const isShown = selectedAnswer !== null;
                                                        const isCorrectForCapture = captureMode === 'answer' && isCorrectAnswer;
                                                        const isIncorrectForCapture = captureMode === 'answer' && !isCorrectAnswer;
                                                        const gradientClass = `bg-gradient-to-br text-white hover:brightness-110 ${optionGradients[(currentQuestionIndex + index) % optionGradients.length]}`;

                                                        return (
                                                            <div key={index}>
                                                                {option.image && (<div className="relative h-32 w-full rounded-md overflow-hidden bg-white/20 mb-2"><Image src={option.image} alt={option.text || `Option ${index + 1}`} layout="fill" objectFit="contain" className="rounded-md" /></div>)}
                                                                <Label htmlFor={`q-${currentQuestionIndex}-opt-${index}`} className={cn("rounded-xl border-2 p-4 flex gap-4 h-16 transition-all duration-300 relative", !isShown && !isCapturing && "cursor-pointer hover:scale-105 justify-between items-center", isShown && isCorrectAnswer && "border-green-500 ring-2 ring-green-500/50 bg-green-500 text-white justify-between items-center", isShown && isSelected && !isCorrectAnswer && "border-destructive ring-2 ring-destructive/50 bg-red-500 text-white justify-between items-center", !isShown && !isCapturing && gradientClass, isCapturing && "items-center", isCorrectForCapture && "border-green-500 bg-green-100 dark:bg-green-900/20", isIncorrectForCapture && "border-destructive bg-red-100 dark:bg-red-900/20")}>
                                                                    {isCorrectForCapture && <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />}
                                                                    {isIncorrectForCapture && <XCircle className="w-6 h-6 text-destructive shrink-0" />}
                                                                    <span className={cn( "font-bold text-lg md:text-xl", !isCapturing && "flex-1 text-left", isCapturing && "text-black dark:text-white")}>{String.fromCharCode(65 + index)}. {option.text}</span>
                                                                    {!isCapturing && <RadioGroupItem value={option.text} id={`q-${currentQuestionIndex}-opt-${index}`} className="bg-white/50 border-primary-foreground/50 shrink-0" />}
                                                                </Label>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </RadioGroup>
                                        ) : currentQuestion?.type === 'True/False' ? (
                                            <RadioGroup onValueChange={handleAnswer} value={selectedAnswer || ''} disabled={selectedAnswer !== null} className="flex justify-center space-x-4">
                                                {['True', 'False'].map((option, index) => {
                                                    const isSelected = selectedAnswer === option;
                                                    const isCorrectAnswer = currentQuestion.correctAnswer === option;
                                                    const isShown = selectedAnswer !== null;
                                                    const gradientClass = `bg-gradient-to-br text-white hover:brightness-110 ${optionGradients[(currentQuestionIndex + index + 2) % optionGradients.length]}`;
                                                    return (
                                                        <Label key={index} htmlFor={`q-${currentQuestionIndex}-opt-${index}`} className={cn("rounded-xl border-2 p-4 text-xl font-bold flex justify-center items-center gap-4 transition-all duration-300 w-40 h-16", !isShown && "cursor-pointer hover:scale-105", !isShown && gradientClass, isShown && isCorrectAnswer && "border-green-500 ring-2 ring-green-500/50 bg-green-500 text-white", isShown && isSelected && !isCorrectAnswer && "border-destructive ring-2 ring-destructive/50 bg-red-500 text-white")}>
                                                            <RadioGroupItem value={option} id={`q-${currentQuestionIndex}-opt-${index}`} className="sr-only" />
                                                            {option}
                                                        </Label>
                                                    );
                                                })}
                                            </RadioGroup>
                                        ) : (currentQuestion?.type === 'Short Answer' || (currentQuestion?.type === 'Fill in the Blank' && (!currentQuestion.options || currentQuestion.options.length === 0))) ? (
                                            <form onSubmit={(e) => { e.preventDefault(); handleAnswer(textAnswer); }} className="flex w-full max-w-sm items-center space-x-2 mx-auto">
                                                <Input type="text" placeholder="Your answer" value={textAnswer} onChange={(e) => setTextAnswer(e.target.value)} disabled={selectedAnswer !== null} className="text-lg h-12" />
                                                <Button type="submit" disabled={selectedAnswer !== null || !textAnswer.trim()} size="lg">Submit</Button>
                                            </form>
                                        ) : currentQuestion?.type === 'Fill in the Blank' && currentQuestion.options && currentQuestion.options.length > 0 ? (
                                            <div className="flex flex-col items-center gap-6">
                                                <div className="flex flex-wrap justify-center gap-4 p-4 rounded-lg bg-secondary min-h-[70px] w-full" onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, 'bank')}>
                                                    {wordBank.map((word, index) => (
                                                        <Button key={index} draggable onDragStart={(e) => handleDragStart(e, word, 'bank')} className="h-auto p-4 text-2xl font-bold rounded-xl shadow-lg cursor-grab active:cursor-grabbing bg-white text-slate-800" variant="outline">{word}</Button>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : currentQuestion?.type === 'Matching' && currentQuestion?.matchingOptions ? (
                                            <div className="w-full space-y-4">
                                                <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center"><div className="font-bold text-center">Column A</div><div></div><div className="font-bold text-center">Column B</div></div>
                                                {currentQuestion.matchingOptions.columnA.map((itemA, itemIndex) => (
                                                    <div key={itemIndex} className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                                                        <div className="p-3 border rounded-md text-center bg-secondary">
                                                            {itemA.image && <Image src={itemA.image} alt={itemA.text} width={40} height={40} className="mx-auto mb-1 rounded-sm" />}
                                                            {itemA.text}
                                                        </div>
                                                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                                                        <Select onValueChange={(value) => handleMatchingAnswerChange(itemA.text, value)} value={matchingAnswers[itemA.text] || ''} disabled={selectedAnswer !== null}>
                                                            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                                            <SelectContent>{currentQuestion.matchingOptions?.columnB.map((itemB: any, bIndex: number) => (
                                                                <SelectItem key={`${currentQuestion.id}-${itemA.text}-${bIndex}`} value={itemB.text}><div className="flex items-center gap-2">{itemB.image && <Image src={itemB.image} alt={itemB.text} width={20} height={20} className="rounded-sm" />}<span>{itemB.text}</span></div></SelectItem>
                                                            ))}</SelectContent>
                                                        </Select>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : currentQuestion?.type === 'Direct Question' ? (
                                            (!!currentQuestion.correctAnswer || currentQuestion.answerImage || currentQuestion.answerAudio) && (<div className="mt-4 flex flex-col items-center gap-4">
                                                {currentQuestion.correctAnswer && String(currentQuestion.correctAnswer).trim() && (<div className="w-full p-4 text-2xl font-bold text-white rounded-xl bg-gradient-to-r from-cyan-400 to-teal-500 shadow-lg text-center">{String(currentQuestion.correctAnswer)}</div>)}
                                                {currentQuestion.answerImage && (<div className="relative w-full max-w-sm mx-auto aspect-video mt-4"><Image src={currentQuestion.answerImage} alt="Answer Image" layout="fill" objectFit="contain" className="rounded-lg" /></div>)}
                                                {currentQuestion.answerAudio && (<audio controls src={currentQuestion.answerAudio} className="w-full mt-4 max-w-sm" />)}
                                            </div>)
                                        ) : (
                                          <div className="text-center text-muted-foreground">This question type is not supported in this view.</div>
                                        )}
                                        {feedback && captureMode === 'idle' && (
                                            <div className={`mt-4 font-bold text-xl text-center ${isCorrect ? 'text-green-600' : 'text-destructive'}`}>
                                                {feedback}
                                                {!isCorrect && selectedAnswer && (
                                                    <div className="text-sm font-normal text-muted-foreground mt-2 flex items-center justify-center">
                                                      <span>{t.correctAnswer}: </span>
                                                      {currentQuestion.type === 'Matching' && Array.isArray(currentQuestion.correctAnswer) ? (
                                                          <div className="flex flex-col items-center mt-1">
                                                              {currentQuestion.correctAnswer.map((pair: any, i: number) => (
                                                                  <span key={i} className="ml-1">{pair.a} &rarr; {pair.b}</span>
                                                              ))}
                                                          </div>
                                                      ) : (
                                                          <span className="ml-1">{String(currentQuestion.correctAnswer)}</span>
                                                      )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="mt-4 flex md:hidden justify-between">
                                <Button variant="secondary" onClick={handleManualPrev} disabled={currentQuestionIndex === 0 || isSubmitting} className="shadow-lg">
                                    <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                                </Button>
                                <Button variant="secondary" onClick={handleManualNext} disabled={quizFinished || isSubmitting || currentQuestionIndex === shuffledQuestions.length - 1} className="shadow-lg">
                                    Next <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                         <Button
                            variant="outline"
                            size="icon"
                            className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full h-12 w-12 z-20 bg-white/50 dark:bg-black/50 backdrop-blur-sm hidden md:flex"
                            onClick={handleManualNext}
                            disabled={quizFinished || isSubmitting || currentQuestionIndex === shuffledQuestions.length - 1}
                        >
                            <ChevronRight className="h-6 w-6" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
