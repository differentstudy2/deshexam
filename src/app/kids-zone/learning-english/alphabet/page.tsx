
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, RefreshCw, Mic, Sparkles, X, Check } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Confetti from 'react-dom-confetti';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(char => ({ char, name: char }));

const playSound = (type: 'correct' | 'incorrect' | 'letter', letter?: string) => {
  if (typeof window !== 'undefined') {
    let soundUrl = '';
    if(type === 'letter' && letter) {
      soundUrl = `/audio/alphabet/${letter.toLowerCase()}.mp3`
    } else if (type === 'correct') {
      soundUrl = '/audio/correct-83487.mp3';
    } else if (type === 'incorrect') {
      soundUrl = '/audio/incorrect-293358.mp3';
    }
    
    if(soundUrl) {
      const audio = new Audio(soundUrl);
      audio.play().catch(error => console.error(`Error playing sound:`, error));
    }
  }
};

const AlphabetLearn = () => {
    const [activeLetter, setActiveLetter] = useState<string | null>(null);

    const playLetterSound = (letter: string) => {
        playSound('letter', letter);
        setActiveLetter(letter);
        setTimeout(() => setActiveLetter(null), 1000);
    }

    return (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-4 max-w-7xl mx-auto">
            {alphabet.map((letter, index) => (
                <Card 
                    key={`${letter.char}-${index}`} 
                    onClick={() => playLetterSound(letter.char)}
                    className={cn(
                        "transform transition-all duration-300 hover:scale-110 hover:shadow-2xl flex flex-col text-center items-center justify-center aspect-square cursor-pointer",
                        activeLetter === letter.char ? "scale-110 shadow-2xl ring-4 ring-blue-400" : "shadow-lg bg-white/70 backdrop-blur-sm"
                    )}
                >
                    <CardContent className="p-2 w-full flex flex-col items-center justify-center">
                        <p className="text-6xl md:text-8xl font-bold text-slate-800 dark:text-slate-100">{letter.char}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

const useSpeechRecognition = (lang: string) => {
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
        recognition.lang = lang;

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

    }, [lang]);

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            setTranscript('');
            recognitionRef.current.start();
        }
    };
    
    const resetTranscript = useCallback(() => {
        setTranscript('');
    }, []);

    return { isListening, transcript, startListening, resetTranscript, hasSupport: !!recognitionRef.current };
};

const VoiceRecognitionGame = () => {
    const [currentLetter, setCurrentLetter] = useState<{ char: string; name: string; } | null>(null);
    const [feedback, setFeedback] = useState<{message: string, type: 'correct' | 'incorrect' | 'none'}>({message: '', type: 'none'});
    const [isCorrect, setIsCorrect] = useState(false);
    
    const { isListening, transcript, startListening, resetTranscript, hasSupport } = useSpeechRecognition('en-US');

    const startNewRound = useCallback(() => {
        const randomIndex = Math.floor(Math.random() * alphabet.length);
        setCurrentLetter(alphabet[randomIndex]);
        setFeedback({message: '', type: 'none'});
        setIsCorrect(false);
        resetTranscript();
    }, [resetTranscript]);
    
    useEffect(() => {
        startNewRound();
    }, [startNewRound]);

    useEffect(() => {
        if (!transcript || !currentLetter || isCorrect) return;

        const spokenAnswer = transcript.toLowerCase().trim().replace(/[.]$/, '');
        const correctAnswer = currentLetter.name.toLowerCase();
        
        if (spokenAnswer === correctAnswer) {
            setFeedback({ message: 'Great job!', type: 'correct' });
            setIsCorrect(true);
            playSound('correct');
        } else {
            setFeedback({ message: 'Try again!', type: 'incorrect' });
            playSound('incorrect');
            setTimeout(() => {
                setFeedback({ message: '', type: 'none' });
                resetTranscript();
            }, 1500);
        }
    }, [transcript, currentLetter, isCorrect, resetTranscript]);

    if (!hasSupport) {
        return <p className="text-center text-red-500 mt-8">Voice recognition is not supported by your browser. Please try Google Chrome.</p>
    }

    return (
        <div className="relative flex flex-col items-center justify-center mt-8">
            <Card className="w-full max-w-md shadow-2xl bg-white/70 backdrop-blur-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-9xl font-bold text-slate-800" style={{fontFamily: "'Lexend', sans-serif"}}>
                        {currentLetter?.char}
                    </CardTitle>
                    <CardDescription className="text-2xl font-semibold text-slate-500 pt-2">
                        Say the letter
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-44 text-center relative flex flex-col justify-center items-center">
                    <Confetti active={isCorrect} />
                    {feedback.message && (
                        <div className={`flex items-center justify-center gap-2 font-bold text-2xl ${isCorrect ? 'text-green-600' : 'text-destructive'}`}>
                            {isCorrect ? <Check className="w-8 h-8" /> : <X className="w-8 h-8" />}
                            {feedback.message}
                        </div>
                    )}
                    <div className="h-16 w-full mt-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <p className="text-2xl font-mono text-gray-500 dark:text-gray-400">
                            {transcript || (isListening ? '...' : 'Speak here')}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="mt-8 flex flex-col items-center gap-4">
                 <Button 
                    onClick={startListening}
                    variant={isListening ? 'destructive' : 'outline'}
                    className="w-32 h-32 rounded-full shadow-lg text-6xl font-bold transition-all duration-300 ease-in-out"
                    disabled={isListening || isCorrect}
                >
                    <Mic className="w-16 h-16" />
                </Button>
                <p className="mt-2 text-lg font-semibold text-slate-700 dark:text-slate-200">
                    {isListening ? 'Listening...' : 'Tap to Speak'}
                </p>
            </div>
             <div className="mt-8">
                <Button variant="outline" onClick={startNewRound} size="lg">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    New Letter
                </Button>
            </div>
        </div>
    );
};

const MatchingGame = () => {
    const [targetLetter, setTargetLetter] = useState<{ char: string; name: string } | null>(null);
    const [options, setOptions] = useState<{ char: string; name: string }[]>([]);
    const [feedback, setFeedback] = useState<{message: string, type: 'correct' | 'incorrect' | 'none'}>({message: '', type: 'none'});
    const [isCorrect, setIsCorrect] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const startNewRound = useCallback(() => {
        const targetIndex = Math.floor(Math.random() * alphabet.length);
        const newTargetLetter = alphabet[targetIndex];
        setTargetLetter(newTargetLetter);
        
        const incorrectOptions = new Set<{ char: string; name: string }>();
        while(incorrectOptions.size < 3) {
            const randomIndex = Math.floor(Math.random() * alphabet.length);
            const randomLetter = alphabet[randomIndex];
            if (randomLetter.char !== newTargetLetter.char) {
                incorrectOptions.add(randomLetter);
            }
        }
        
        const shuffledOptions = [...Array.from(incorrectOptions), newTargetLetter].sort(() => Math.random() - 0.5);
        setOptions(shuffledOptions);

        setFeedback({ message: '', type: 'none' });
        setIsCorrect(false);
        setIsSubmitting(false);
    }, []);

    useEffect(() => {
        startNewRound();
    }, [startNewRound]);

    const handleAnswer = (selectedLetter: { char: string; name: string }) => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        if (selectedLetter.char === targetLetter?.char) {
            setFeedback({ message: 'Correct!', type: 'correct' });
            setIsCorrect(true);
            playSound('correct');
            setTimeout(startNewRound, 1500);
        } else {
            setFeedback({ message: 'Try Again!', type: 'incorrect' });
            playSound('incorrect');
            setTimeout(() => {
                setFeedback({ message: '', type: 'none' });
                setIsSubmitting(false);
            }, 1000);
        }
    };

    return (
        <div className="relative flex flex-col items-center justify-center mt-8">
            <Card className="w-full max-w-md shadow-2xl bg-white/70 backdrop-blur-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-9xl font-bold text-slate-800" style={{ fontFamily: "'Lexend', sans-serif" }}>
                        {targetLetter?.char}
                    </CardTitle>
                    <CardDescription className="text-xl font-semibold text-slate-500 pt-2">
                        Find this letter below
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-20 text-center relative flex justify-center items-center">
                    <Confetti active={isCorrect} />
                    {feedback.message && (
                        <div className={`flex items-center justify-center gap-2 font-bold text-2xl ${isCorrect ? 'text-green-600' : 'text-destructive'}`}>
                            {isCorrect ? <Check className="w-8 h-8" /> : <X className="w-8 h-8" />}
                            {feedback.message}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
                {options.map((letter, index) => (
                    <Button
                        key={`${letter.char}-${index}`}
                        onClick={() => handleAnswer(letter)}
                        disabled={isSubmitting}
                        className="h-24 md:h-32 text-5xl font-bold rounded-2xl shadow-lg transform transition-transform hover:scale-105"
                        variant="outline"
                    >
                        {letter.char}
                    </Button>
                ))}
            </div>

            <div className="mt-12">
                <Button variant="outline" onClick={startNewRound} size="lg">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    New Letter
                </Button>
            </div>
        </div>
    );
};


const RecognitionGame = () => {
    const [targetLetter, setTargetLetter] = useState<{ char: string; name: string } | null>(null);
    const [isCorrect, setIsCorrect] = useState(false);

    const startNewRound = useCallback(() => {
        const randomIndex = Math.floor(Math.random() * alphabet.length);
        const newTargetLetter = alphabet[randomIndex];
        setTargetLetter(newTargetLetter);
        playSound('letter', newTargetLetter.char);
        setIsCorrect(false);
    }, []);

    useEffect(() => {
        startNewRound();
    }, [startNewRound]);

    return (
        <div className="relative flex flex-col items-center justify-center mt-8">
            <p className="text-xl font-semibold mb-4">Listen to the sound and find the letter.</p>
            <div className="mt-8 grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-9 gap-4 w-full max-w-4xl">
                 {alphabet.map((letter, index) => (
                    <Button
                        key={`${letter.char}-${index}`}
                        onClick={() => {
                            if (letter.char === targetLetter?.char) {
                                setIsCorrect(true);
                                playSound('correct');
                                setTimeout(startNewRound, 1500);
                            } else {
                                playSound('incorrect');
                            }
                        }}
                        disabled={isCorrect}
                        className="h-24 md:h-32 text-5xl font-bold rounded-2xl shadow-lg transform transition-transform hover:scale-105"
                        variant="outline"
                    >
                        {letter.char}
                    </Button>
                ))}
            </div>
             <div className="mt-12">
                <Button variant="outline" onClick={() => playSound('letter', targetLetter?.char)} size="lg">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Play Sound Again
                </Button>
            </div>
        </div>
    );
};

export default function EnglishAlphabetPage() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
            <Button asChild variant="ghost">
                <Link href="/kids-zone/learning-english">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Learning English
                </Link>
            </Button>
        </div>
        <header className="text-center mb-12">
          <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-blue-600">
            English Alphabet
          </h1>
          <p className="text-lg text-blue-700/80 mt-4 max-w-2xl mx-auto">
            Learn your ABCs with fun games and activities!
          </p>
        </header>

        <Tabs defaultValue="alphabet" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 max-w-3xl mx-auto h-auto">
                <TabsTrigger value="alphabet">Alphabet</TabsTrigger>
                <TabsTrigger value="recognize">Recognize</TabsTrigger>
                <TabsTrigger value="match">Match</TabsTrigger>
                <TabsTrigger value="voice">Voice</TabsTrigger>
            </TabsList>
            <TabsContent value="alphabet" className="mt-8">
              <AlphabetLearn />
            </TabsContent>
            <TabsContent value="recognize">
              <RecognitionGame />
            </TabsContent>
            <TabsContent value="match">
                <MatchingGame />
            </TabsContent>
            <TabsContent value="voice">
                <VoiceRecognitionGame />
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
