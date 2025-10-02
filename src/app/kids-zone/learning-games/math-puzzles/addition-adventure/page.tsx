
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, RefreshCw, Check, X, Sparkles, Delete, Clock, Settings, Trophy, Rows, Mic, BarChart4 } from "lucide-react";
import Link from "next/link";
import Confetti from 'react-dom-confetti';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const playSound = (type: 'correct' | 'incorrect') => {
  if (typeof window !== 'undefined') {
    const soundUrl = type === 'correct'
      ? '/audio/correct-83487.mp3'
      : '/audio/incorrect-293358.mp3';
      
    const audio = new Audio(soundUrl);
    audio.play().catch(error => console.error(`Error playing ${type} sound:`, error));
  }
};

const feedbackMessages = {
    correct: ["Great job!", "Awesome!", "You got it!", "Amazing!", "Superstar!"],
    incorrect: ["Try again!", "Not quite!", "Almost there!", "Oops!"]
};

const useSpeechRecognition = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window)) {
            console.warn('Speech recognition not supported in this browser.');
            return;
        }

        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onresult = (event: any) => {
            const last = event.results.length - 1;
            const text = event.results[last][0].transcript;
            setTranscript(text);
        };
        
        recognitionRef.current = recognition;

    }, []);

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            recognitionRef.current.start();
        }
    };
    
    const resetTranscript = () => {
        setTranscript('');
    }

    return { isListening, transcript, startListening, resetTranscript, hasSupport: !!recognitionRef.current };
};

const NumberPad = ({ onNumberClick, onClear, onDelete }: { onNumberClick: (num: number) => void, onClear: () => void, onDelete: () => void }) => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
    return (
        <Card className="w-full max-w-xs mx-auto bg-blue-100/50 dark:bg-blue-900/30">
            <CardContent className="p-2 md:p-4">
                 <div className="grid grid-cols-3 gap-2 md:gap-3">
                    {numbers.map(num => (
                        <Button key={num} onClick={() => onNumberClick(num)} variant="outline" className="h-16 md:h-20 text-3xl md:text-4xl font-bold rounded-lg md:rounded-xl shadow-lg bg-white dark:bg-slate-800 hover:bg-slate-50 active:shadow-inner active:scale-95 transition-transform">
                            {num}
                        </Button>
                    ))}
                    <Button onClick={onDelete} variant="outline" className="h-16 md:h-20 text-lg rounded-lg md:rounded-xl shadow-lg bg-white dark:bg-slate-800 flex items-center justify-center active:scale-95 transition-transform col-span-1">
                        <Delete className="w-6 h-6 md:w-8 md:h-8 text-destructive" />
                    </Button>
                     <Button onClick={onClear} variant="outline" className="h-16 md:h-20 text-lg rounded-lg md:rounded-xl shadow-lg bg-white dark:bg-slate-800 active:scale-95 transition-transform col-span-2">
                        Clear
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

const MultipleChoicePad = ({ options, onOptionClick, isSubmitting }: { options: number[], onOptionClick: (num: number) => void, isSubmitting: boolean }) => {
    return (
        <Card className="w-full max-w-xs mx-auto bg-blue-100/50 dark:bg-blue-900/30">
            <CardContent className="p-2 md:p-4">
                 <div className="grid grid-cols-2 gap-2 md:gap-4">
                    {options.map(option => (
                        <Button 
                            key={option} 
                            onClick={() => onOptionClick(option)} 
                            variant="outline" 
                            className="h-20 md:h-24 text-4xl md:text-5xl font-bold rounded-lg md:rounded-xl shadow-lg bg-white dark:bg-slate-800 hover:bg-slate-50 active:shadow-inner active:scale-95 transition-transform"
                            disabled={isSubmitting}
                        >
                            {option}
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

const VoiceInputPad = ({ isListening, startListening, transcript }: { isListening: boolean, startListening: () => void, transcript: string }) => {
    return (
        <Card className="w-full max-w-xs mx-auto bg-blue-100/50 dark:bg-blue-900/30 flex flex-col items-center justify-center p-4 min-h-[300px] md:min-h-[420px]">
            <Button 
                onClick={startListening}
                variant={isListening ? 'destructive' : 'outline'}
                className="w-32 h-32 md:w-48 md:h-48 rounded-full shadow-lg text-6xl font-bold transition-all duration-300 ease-in-out"
                disabled={isListening}
            >
                <Mic className="w-16 h-16 md:w-24 md:h-24" />
            </Button>
            <p className="mt-4 md:mt-6 text-lg md:text-xl font-semibold text-slate-700 dark:text-slate-200">
                {isListening ? 'Listening...' : 'Tap to Speak'}
            </p>
            {transcript && <p className="mt-2 text-sm text-muted-foreground">Last heard: "{transcript}"</p>}
        </Card>
    );
};

export default function AdditionAdventurePage() {
    const [problem, setProblem] = useState<{ num1: number, num2: number, answer: number } | null>(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState<{message: string, type: 'correct' | 'incorrect' | 'none'}>({message: '', type: 'none'});
    const [isCorrect, setIsCorrect] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timerDuration, setTimerDuration] = useState(60); 
    const [timeLeft, setTimeLeft] = useState(timerDuration);
    const [score, setScore] = useState(0);
    const [totalAttempted, setTotalAttempted] = useState(0);
    const [gameMode, setGameMode] = useState<'input' | 'multipleChoice' | 'voice'>('input');
    const [options, setOptions] = useState<number[]>([]);
    const [mcqLevel, setMcqLevel] = useState(4);
    const [difficultyLevel, setDifficultyLevel] = useState(1);
    
    const { isListening, transcript, startListening, resetTranscript, hasSupport: hasVoiceSupport } = useSpeechRecognition();

    const generateProblemWithOptions = useCallback((mode: 'input' | 'multipleChoice' | 'voice', level: number) => {
        let num1, num2;
        if (level === 1) {
            num1 = Math.floor(Math.random() * 9) + 1; // 1 to 9
            num2 = Math.floor(Math.random() * (10 - num1)) + 1; // Ensure sum is <= 10
        } else {
            const maxNumber = level * 10;
            const singleDigit = Math.floor(Math.random() * 9) + 1; // 1 to 9
            const doubleDigit = Math.floor(Math.random() * (maxNumber - 10)) + 10; // 10 to maxNumber

            if (Math.random() > 0.5) {
                num1 = singleDigit;
                num2 = doubleDigit;
            } else {
                num1 = doubleDigit;
                num2 = singleDigit;
            }
        }
        const answer = num1 + num2;

        const newProblem = { num1, num2, answer };
        setProblem(newProblem);

        if (mode === 'multipleChoice') {
            const incorrectOptions = new Set<number>();
            while (incorrectOptions.size < mcqLevel - 1) {
                const offset = Math.floor(Math.random() * 9) - 4; // -4 to 4
                const incorrectAnswer = answer + offset;
                if (incorrectAnswer !== answer && incorrectAnswer > 0) {
                    incorrectOptions.add(incorrectAnswer);
                }
            }
            const shuffledOptions = [...incorrectOptions, answer].sort(() => Math.random() - 0.5);
            setOptions(shuffledOptions);
        }
    }, [mcqLevel]);


    const handleNewProblem = useCallback((isIncorrectOrTimeout: boolean = false) => {
        if(isIncorrectOrTimeout) {
            setTotalAttempted(prev => prev + 1);
        }
        generateProblemWithOptions(gameMode, difficultyLevel);
        setUserAnswer('');
        setFeedback({message: '', type: 'none'});
        setIsCorrect(false);
        setIsSubmitting(false);
        setTimeLeft(timerDuration);
        resetTranscript();
    }, [timerDuration, generateProblemWithOptions, gameMode, difficultyLevel, resetTranscript]);
    
    const handleSubmit = useCallback((answer: string) => {
        if (!answer || isSubmitting || !problem) return;
        
        setIsSubmitting(true);
        const answerNum = parseInt(answer, 10);
        if (answerNum === problem.answer) {
            playSound('correct');
            const randomMsg = feedbackMessages.correct[Math.floor(Math.random() * feedbackMessages.correct.length)];
            setScore(prev => prev + 1);
            setTotalAttempted(prev => prev + 1);
            setFeedback({ message: randomMsg, type: 'correct' });
        } else {
            playSound('incorrect');
             const randomMsg = feedbackMessages.incorrect[Math.floor(Math.random() * feedbackMessages.incorrect.length)];
            setFeedback({ message: randomMsg, type: 'incorrect' });
        }
    }, [isSubmitting, problem]);

    useEffect(() => {
        if (gameMode === 'input' && problem && userAnswer.length > 0 && userAnswer.length === String(problem.answer).length) {
            handleSubmit(userAnswer);
        }
    }, [userAnswer, problem, handleSubmit, gameMode]);
    
    useEffect(() => {
        if (gameMode !== 'voice' || !transcript) return;
        
        const wordsToNumbers: { [key: string]: string } = {
            'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
            'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
            'ten': '10', 'eleven': '11', 'twelve': '12', 'thirteen': '13', 'fourteen': '14',
            'fifteen': '15', 'sixteen': '16', 'seventeen': '17', 'eighteen': '18', 'nineteen': '19', 'twenty': '20'
        };

        const spokenAnswer = transcript.toLowerCase().trim();
        const extractedNumber = spokenAnswer.match(/\d+/) || (wordsToNumbers[spokenAnswer] ? [wordsToNumbers[spokenAnswer]] : null);

        if (extractedNumber) {
            const numberStr = extractedNumber[0];
            setUserAnswer(numberStr);
            handleSubmit(numberStr);
        } else {
             setFeedback({ message: "Didn't catch that. Try again!", type: 'incorrect' });
        }
    }, [transcript, gameMode, handleSubmit]);

    useEffect(() => {
        if (typeof window !== 'undefined' && !problem) {
            generateProblemWithOptions(gameMode, difficultyLevel);
        }
    }, [problem, generateProblemWithOptions, gameMode, difficultyLevel]);

     useEffect(() => {
        if (timerDuration === 0 || isSubmitting) return; // Stop timer if disabled or during submission
        if (timeLeft <= 0) {
            handleNewProblem(true);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prevTime => prevTime - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, handleNewProblem, timerDuration, isSubmitting]);

    
    useEffect(() => {
        if(feedback.type === 'correct') {
            setIsCorrect(true);
            const timer = setTimeout(() => {
                handleNewProblem();
            }, 3000);
            return () => clearTimeout(timer);
        }
        if (feedback.type === 'incorrect') {
            const timer = setTimeout(() => {
                setIsSubmitting(false);
                if (gameMode !== 'voice') {
                    handleNewProblem(true);
                } else {
                    resetTranscript();
                    setFeedback({message: '', type: 'none'});
                }
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [feedback.type, handleNewProblem, gameMode, resetTranscript]);
    
    const handleDurationChange = (value: string) => {
        const newDuration = parseInt(value, 10);
        setTimerDuration(newDuration);
        setTimeLeft(newDuration);
    };

    const handleGameModeChange = (value: 'input' | 'multipleChoice' | 'voice') => {
        setGameMode(value);
        setScore(0);
        setTotalAttempted(0);
        generateProblemWithOptions(value, difficultyLevel);
        setUserAnswer('');
        setFeedback({message: '', type: 'none'});
        setIsCorrect(false);
        setIsSubmitting(false);
        setTimeLeft(timerDuration);
    };
    
    const handleMcqLevelChange = (value: string) => {
        setMcqLevel(parseInt(value, 10));
        setScore(0);
        setTotalAttempted(0);
        handleNewProblem();
    };

    const handleDifficultyChange = (value: string) => {
        const newLevel = parseInt(value, 10);
        setDifficultyLevel(newLevel);
        setScore(0);
        setTotalAttempted(0);
        generateProblemWithOptions(gameMode, newLevel);
        setUserAnswer('');
        setFeedback({message: '', type: 'none'});
        setIsCorrect(false);
        setIsSubmitting(false);
        setTimeLeft(timerDuration);
    };

    const handleNumberClick = (num: number) => {
        if (userAnswer.length < 3 && !isSubmitting) {
             setUserAnswer(prev => prev + num.toString());
        }
    };

    const handleClear = () => {
        setUserAnswer('');
    };

    const handleDelete = () => {
        setUserAnswer(prev => prev.slice(0, -1));
    };

    const handleOptionClick = (num: number) => {
        if (isSubmitting) return;
        const answerString = num.toString();
        setUserAnswer(answerString);
        handleSubmit(answerString);
    }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/10 dark:to-green-900/10 min-h-screen p-4">
      <div className="container mx-auto py-8">
        <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
            <Button asChild variant="ghost">
                <Link href="/kids-zone/learning-games/math-puzzles">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Math Puzzles
                </Link>
            </Button>
            <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <Rows className="w-5 h-5 text-slate-600"/>
                    <Label htmlFor="mode-select" className="text-sm font-medium text-slate-700">Mode:</Label>
                    <Select value={gameMode} onValueChange={handleGameModeChange}>
                        <SelectTrigger id="mode-select" className="w-[180px] h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="input">Number Pad</SelectItem>
                            <SelectItem value="multipleChoice">Multiple Choice</SelectItem>
                             {hasVoiceSupport && <SelectItem value="voice">Voice</SelectItem>}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    <BarChart4 className="w-5 h-5 text-slate-600"/>
                    <Label htmlFor="difficulty-select" className="text-sm font-medium text-slate-700">Difficulty:</Label>
                    <Select value={difficultyLevel.toString()} onValueChange={handleDifficultyChange}>
                        <SelectTrigger id="difficulty-select" className="w-[120px] h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[...Array(10)].map((_, i) => (
                                <SelectItem key={i + 1} value={(i + 1).toString()}>Level {i + 1}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {gameMode === 'multipleChoice' && (
                    <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-slate-600"/>
                        <Label htmlFor="level-select" className="text-sm font-medium text-slate-700">Options:</Label>
                        <Select value={mcqLevel.toString()} onValueChange={handleMcqLevelChange}>
                            <SelectTrigger id="level-select" className="w-[120px] h-9">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="2">2</SelectItem>
                                <SelectItem value="3">3</SelectItem>
                                <SelectItem value="4">4</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}
                
                <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-slate-600"/>
                    <Label htmlFor="timer-select" className="text-sm font-medium text-slate-700">Timer:</Label>
                    <Select value={timerDuration.toString()} onValueChange={handleDurationChange}>
                        <SelectTrigger id="timer-select" className="w-[120px] h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">5 seconds</SelectItem>
                            <SelectItem value="10">10 seconds</SelectItem>
                            <SelectItem value="15">15 seconds</SelectItem>
                            <SelectItem value="30">30 seconds</SelectItem>
                            <SelectItem value="60">60 seconds</SelectItem>
                            <SelectItem value="90">90 seconds</SelectItem>
                            <SelectItem value="0">Off</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
        <header className="text-center mb-12">
          <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-blue-600">
            Addition Adventure
          </h1>
          <p className="text-lg text-blue-700/80 mt-4 max-w-2xl mx-auto">
            Add the numbers and choose the correct answer!
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-4xl mx-auto">
            <Card className="w-full shadow-xl bg-white/60 dark:bg-card/60 backdrop-blur-sm">
                <CardHeader>
                    {timerDuration > 0 && (
                         <div className="flex items-center gap-3 mb-4">
                            <Clock className="w-6 h-6 text-slate-500" />
                            <Progress value={(timeLeft / timerDuration) * 100} className="w-full h-4" />
                            <span className="text-xl font-bold text-slate-600">{timeLeft}s</span>
                        </div>
                    )}
                    <CardTitle className="text-center text-4xl md:text-7xl font-bold tracking-wider flex items-center justify-center flex-wrap gap-x-2 md:gap-x-4 gap-y-2 text-slate-700 dark:text-slate-200" style={{fontFamily: "'Lexend', sans-serif"}}>
                        <span>{problem?.num1 ?? '?'}</span>
                        <span className="text-blue-500 font-normal">+</span>
                        <span>{problem?.num2 ?? '?'}</span>
                        <span className="text-blue-500 font-normal">=</span>
                        <span className="inline-block w-24 h-24 md:w-36 md:h-28 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-5xl md:text-7xl font-mono shadow-inner">
                            {userAnswer || '?'}
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-12 md:h-20 text-center relative flex justify-center items-center">
                    <Confetti active={isCorrect} config={{
                        angle: 90,
                        spread: 360,
                        startVelocity: 40,
                        elementCount: 100,
                        decay: 0.9,
                    }}/>

                {feedback.type === 'correct' && (
                    <div className="flex items-center gap-2 text-green-600 font-bold text-xl md:text-2xl animate-pulse">
                        <Sparkles className="w-6 h-6 md:w-8 md:h-8" /> {feedback.message}
                    </div>
                )}
                {feedback.type === 'incorrect' && (
                    <div className="flex items-center gap-2 text-destructive font-bold text-xl md:text-2xl">
                        <X className="w-6 h-6 md:w-8 md:h-8" /> {feedback.message}
                    </div>
                )}
                </CardContent>
                 <CardContent className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2 text-lg md:text-xl font-semibold text-slate-600 dark:text-slate-300">
                        <Trophy className="w-5 h-5 md:w-6 md:h-6 text-amber-500"/>
                        Score: {score} / {totalAttempted} ({totalAttempted > 0 ? Math.round((score / totalAttempted) * 100) : 0}%)
                    </div>
                    <Button variant="outline" onClick={() => handleNewProblem(true)} size="lg">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        New Problem
                    </Button>
                </CardContent>
            </Card>
            
            {gameMode === 'input' && (
                <NumberPad 
                    onNumberClick={handleNumberClick}
                    onClear={handleClear}
                    onDelete={handleDelete}
                />
            )}
            {gameMode === 'multipleChoice' && (
                <MultipleChoicePad 
                    options={options}
                    onOptionClick={handleOptionClick}
                    isSubmitting={isSubmitting}
                />
            )}
            {gameMode === 'voice' && (
                <VoiceInputPad 
                    isListening={isListening}
                    startListening={startListening}
                    transcript={transcript}
                />
            )}
        </div>
      </div>
    </div>
  );
}
