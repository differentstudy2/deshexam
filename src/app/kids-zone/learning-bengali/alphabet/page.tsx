
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, RefreshCw, Mic, Sparkles, X, Check } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Confetti from 'react-dom-confetti';


const vowels = [
  { char: 'অ', name: 'Aw' }, { char: 'আ', name: 'A' }, { char: 'ই', name: 'E' },
  { char: 'ঈ', name: 'Ee' }, { char: 'উ', name: 'U' }, { char: 'ঊ', name: 'Oo' },
  { char: 'ঋ', name: 'Ri' }, { char: 'এ', name: 'E' }, { char: 'ঐ', name: 'Oi' },
  { char: 'ও', name: 'O' }, { char: 'ঔ', name: 'Ou' }
];

const consonants = [
  { char: 'ক', name: 'Kaw' }, { char: 'খ', name: 'Khaw' }, { char: 'গ', name: 'Gaw' }, { char: 'ঘ', name: 'Ghaw' }, { char: 'ঙ', name: 'Ngaw' },
  { char: 'চ', name: 'Chaw' }, { char: 'ছ', name: 'Chhaw' }, { char: 'জ', name: 'Jaw' }, { char: 'ঝ', name: 'Jhaw' }, { char: 'ঞ', name: 'Niyaw' },
  { char: 'ট', name: 'Taw' }, { char: 'ঠ', name: 'Thaw' }, { char: 'ড', name: 'Daw' }, { char: 'ঢ', name: 'Dhaw' }, { char: 'ণ', name: 'Naw' },
  { char: 'ত', name: 'Taw' }, { char: 'থ', name: 'Thaw' }, { char: 'দ', name: 'Daw' }, { char: 'ধ', name: 'Dhaw' }, { char: 'ন', name: 'Naw' },
  { char: 'প', name: 'Paw' }, { char: 'ফ', name: 'Faw' }, { char: 'ব', name: 'Baw' }, { char: 'ভ', name: 'Bhaw' }, { char: 'ম', name: 'Maw' },
  { char: 'য', name: 'Jaw' }, { char: 'র', name: 'Raw' }, { char: 'ল', name: 'Law' }, { char: 'ব', name: 'Baw' }, { char: 'শ', name: 'Shaw' }, { char: 'ষ', name: 'Shaw' },
  { char: 'স', name: 'Saw' }, { char: 'হ', name: 'Haw' }, { char: 'ক্ষ', name: 'Kkhaw' }, { char: 'ড়', name: 'Raw' }, { char: 'ঢ়', name: 'Rhaw' }, { char: 'য়', name: 'Yaw' },
  { char: 'ৎ', name: 'T' }, { char: 'ং', name: 'Ong' }, { char: 'ঃ', name: 'Oh' }, { char: 'ঁ', name: 'Chandrabindu' }
];

const allLetters = [...vowels, ...consonants];

const playSound = (type: 'correct' | 'incorrect') => {
  if (typeof window !== 'undefined') {
    const soundUrl = type === 'correct'
      ? '/audio/correct-83487.mp3'
      : '/audio/incorrect-293358.mp3';
      
    const audio = new Audio(soundUrl);
    audio.play().catch(error => console.error(`Error playing ${type} sound:`, error));
  }
};

const AlphabetRecognitionGame = ({ letters, gridClass = "grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8" }: { letters: { char: string; name: string; }[], gridClass?: string }) => {
    const [shuffledAlphabet, setShuffledAlphabet] = useState<{ char: string; name: string; }[]>([]);
    const [activeLetter, setActiveLetter] = useState<string | null>(null);

    const shuffleLetters = useCallback(() => {
        const shuffled = [...letters].sort(() => Math.random() - 0.5);
        setShuffledAlphabet(shuffled);
    }, [letters]);

    useEffect(() => {
        shuffleLetters();
    }, [shuffleLetters]);

    const playLetterSound = (letter: string) => {
        console.log(`Playing sound for ${letter}`);
        setActiveLetter(letter);
        setTimeout(() => setActiveLetter(null), 1000);
    }
    
    return (
        <div className="mt-8">
            <div className="flex justify-center mb-6">
                <Button onClick={shuffleLetters}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset (পুনরায় সাজান)
                </Button>
            </div>
            <div className={cn("gap-4 max-w-7xl mx-auto grid", gridClass)}>
                {shuffledAlphabet.map((letter, index) => (
                     <Card 
                        key={`${letter.char}-${index}`} 
                        onClick={() => playLetterSound(letter.char)}
                        className={cn(
                            "transform transition-all duration-300 hover:scale-110 hover:shadow-2xl flex flex-col text-center items-center justify-center aspect-square cursor-pointer",
                            activeLetter === letter.char ? "scale-110 shadow-2xl ring-4 ring-orange-400" : "shadow-lg bg-white/70 backdrop-blur-sm"
                        )}
                    >
                        <CardContent className="p-2 w-full flex flex-col items-center justify-center">
                            <p className="text-5xl md:text-7xl font-bold text-slate-800 dark:text-slate-100">{letter.char}</p>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{letter.name}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
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
    
    const { isListening, transcript, startListening, resetTranscript, hasSupport } = useSpeechRecognition('bn-IN');

    const startNewRound = useCallback(() => {
        const randomIndex = Math.floor(Math.random() * allLetters.length);
        setCurrentLetter(allLetters[randomIndex]);
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
                        {currentLetter?.name}
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-32 text-center relative flex flex-col justify-center items-center">
                    <Confetti active={isCorrect} config={{
                        angle: 90,
                        spread: 360,
                        startVelocity: 40,
                        elementCount: 100,
                        decay: 0.9,
                    }}/>

                    <div className="absolute top-0 w-full px-4">
                        {feedback.message && (
                             <div className={`flex items-center justify-center gap-2 font-bold text-2xl ${isCorrect ? 'text-green-600' : 'text-destructive'}`}>
                                {isCorrect ? <Check className="w-8 h-8" /> : <X className="w-8 h-8" />}
                                {feedback.message}
                            </div>
                        )}
                    </div>
                    
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


export default function BengaliAlphabetPage() {
    const [activeLetter, setActiveLetter] = useState<string | null>(null);

    const playLetterSound = (letter: string) => {
        console.log(`Playing sound for ${letter}`);
        setActiveLetter(letter);
        setTimeout(() => setActiveLetter(null), 1000);
    }

  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/10 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
            <Button asChild variant="ghost">
                <Link href="/kids-zone/learning-bengali">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Learning Bengali
                </Link>
            </Button>
        </div>
        <header className="text-center mb-12">
          <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-orange-600">
            Bengali Alphabet (বাংলা বর্ণমালা)
          </h1>
          <p className="text-lg text-orange-700/80 mt-4 max-w-2xl mx-auto">
            Click on a letter to learn its sound or test your pronunciation.
          </p>
        </header>

        <Tabs defaultValue="alphabet" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
                <TabsTrigger value="alphabet">Alphabet (বর্ণমালা)</TabsTrigger>
                <TabsTrigger value="recognize">Recognize (চিনুন)</TabsTrigger>
                <TabsTrigger value="voice">Voice Recognition (কণ্ঠস্বর)</TabsTrigger>
            </TabsList>
            <TabsContent value="alphabet" className="mt-8">
                <section className="mb-12">
                    <h2 className="text-3xl font-bold font-headline mb-6 text-center text-orange-700">Vowels (স্বরবর্ণ)</h2>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 max-w-4xl mx-auto">
                        {vowels.map((letter, index) => (
                            <Card 
                                key={`${letter.char}-${index}`} 
                                onClick={() => playLetterSound(letter.char)}
                                className={cn(
                                    "transform transition-all duration-300 hover:scale-110 hover:shadow-2xl flex flex-col text-center items-center justify-center aspect-square cursor-pointer",
                                    activeLetter === letter.char ? "scale-110 shadow-2xl ring-4 ring-orange-400" : "shadow-lg bg-white/70 backdrop-blur-sm"
                                )}
                            >
                                <CardContent className="p-2 w-full flex flex-col items-center justify-center">
                                    <p className="text-6xl md:text-8xl font-bold text-slate-800 dark:text-slate-100">{letter.char}</p>
                                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-2">{letter.name}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="text-3xl font-bold font-headline mb-6 text-center text-orange-700">Consonants (ব্যঞ্জনবর্ণ)</h2>
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-8 gap-4 max-w-7xl mx-auto">
                        {consonants.map((letter, index) => (
                            <Card 
                                key={`${letter.char}-${index}`}
                                onClick={() => playLetterSound(letter.char)}
                                className={cn(
                                    "transform transition-all duration-300 hover:scale-110 hover:shadow-2xl flex flex-col text-center items-center justify-center aspect-square cursor-pointer",
                                    activeLetter === letter.char ? "scale-110 shadow-2xl ring-4 ring-orange-400" : "shadow-lg bg-white/70 backdrop-blur-sm"
                                )}
                            >
                                <CardContent className="p-2 w-full flex flex-col items-center justify-center">
                                    <p className="text-5xl md:text-7xl font-bold text-slate-800 dark:text-slate-100">{letter.char}</p>
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{letter.name}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            </TabsContent>
            <TabsContent value="recognize">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto">
                    <TabsTrigger value="all">All (সব বর্ণ)</TabsTrigger>
                    <TabsTrigger value="vowels">Vowels (স্বরবর্ণ)</TabsTrigger>
                    <TabsTrigger value="consonants">Consonants (ব্যঞ্জনবর্ণ)</TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                    <AlphabetRecognitionGame letters={allLetters} />
                </TabsContent>
                 <TabsContent value="vowels">
                    <AlphabetRecognitionGame letters={vowels} gridClass="grid-cols-2 sm:grid-cols-4 md:grid-cols-6" />
                </TabsContent>
                 <TabsContent value="consonants">
                    <AlphabetRecognitionGame letters={consonants} />
                </TabsContent>
              </Tabs>
            </TabsContent>
            <TabsContent value="voice">
                <VoiceRecognitionGame />
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
