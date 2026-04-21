'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, RefreshCw, Mic, Sparkles, X, Check, Volume2, ChevronUp, ChevronDown, Settings } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Confetti from 'react-dom-confetti';
import { useToast } from "@/hooks/use-toast";
import useEmblaCarousel from 'embla-carousel-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";


const vowels = [
  { char: 'অ', name: 'Aw' }, { char: 'আ', name: 'A' }, { char: 'ই', name: 'E' },
  { char: 'ঈ', name: 'Ee' }, { char: 'উ', name: 'U' }, { char: 'ঊ', name: 'Oo' },
  { char: 'ঋ', name: 'Ri' }, 
  { char: 'এ', name: 'E', dialogue: "আমি হলাম এ! খুব সহজ আর ছটফটে। আমাকে লিখে ফেলো চটপট!" }, 
  { char: 'ঐ', name: 'Oi', dialogue: "আর আমি ঐ! এ-এর মাথায় একটা ঝুঁটি দিলেই আমি তৈরি!" },
  { char: 'ও', name: 'O' }, { char: 'ঔ', name: 'Ou' }
];

const consonants = [
  { char: 'ক', name: 'Kaw' }, { char: 'খ', name: 'Khaw' }, { char: 'গ', name: 'Gaw' }, { char: 'ঘ', name: 'Ghaw' }, { char: 'ঙ', name: 'Ngaw' },
  { char: 'চ', name: 'Chaw' }, { char: 'ছ', name: 'Chhaw' }, { char: 'জ', name: 'Jaw' }, { char: 'ঝ', name: 'Jhaw' }, { char: 'ঞ', name: 'Niyaw' },
  { char: 'ট', name: 'Taw' }, { char: 'ঠ', name: 'Thaw' }, { char: 'ড', name: 'Daw' }, { char: 'ঢ', name: 'Dhaw' }, { char: 'ণ', name: 'Naw' },
  { char: 'ত', name: 'Taw' }, { char: 'থ', name: 'Thaw' }, { char: 'দ', name: 'Daw' }, { char: 'ধ', name: 'Dhaw' }, { char: 'ন', name: 'Naw' },
  { char: 'প', name: 'Paw' }, { char: 'ফ', name: 'Faw' }, { char: 'ব', name: 'Baw' }, { char: 'ভ', name: 'Bhaw' }, { char: 'ম', name: 'Maw' },
  { char: 'য', name: 'Jaw' }, { char: 'র', name: 'Raw' }, { char: 'ল', name: 'Law' },
  { char: 'শ', name: 'Shaw' }, { char: 'ষ', name: 'Shaw' },
  { char: 'স', name: 'Saw' }, { char: 'হ', name: 'Haw' }, { char: 'ড়', name: 'Raw' }, { char: 'ঢ়', name: 'Rhaw' }, { char: 'য়', name: 'Yaw' },
  { char: 'ৎ', name: 'T ' }, { char: 'ং', name: 'Ong' }, { char: 'ঃ', name: 'Oh' }, { char: 'ঁ', name: 'Chandrabindu' }
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

const AlphabetLearn = ({ letters, type, autoplayEnabled }: { letters: { char: string; name: string, dialogue?: string }[], type: 'vowels' | 'consonants' | 'all', autoplayEnabled: boolean }) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        axis: 'y',
        loop: true,
    });
    const [activeLetter, setActiveLetter] = useState<string | null>(null);
    const { toast } = useToast();

    const playLetterSound = useCallback((letter: { char: string; name: string; dialogue?: string }) => {
        const textToSpeak = letter.dialogue || letter.char;
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.lang = 'bn-IN';
            window.speechSynthesis.speak(utterance);
        }

        if (letter.dialogue) {
            toast({
                description: letter.dialogue,
                duration: 4000,
            });
        }

        setActiveLetter(letter.char);
        setTimeout(() => setActiveLetter(null), 1000);
    }, [toast]);

    useEffect(() => {
        if (!emblaApi) return;
        
        const onSelect = () => {
            if (autoplayEnabled) {
                const selectedIndex = emblaApi.selectedScrollSnap();
                const letter = letters[selectedIndex];
                playLetterSound(letter);
            }
        };

        emblaApi.on('select', onSelect);
        if (autoplayEnabled && letters.length > 0) {
            playLetterSound(letters[0]);
        }

        return () => {
            emblaApi.off('select', onSelect);
        };
    }, [emblaApi, letters, playLetterSound, autoplayEnabled]);
    
    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    return (
        <div className="relative w-full max-w-sm mx-auto">
            <Button
                variant="outline"
                size="icon"
                className="absolute top-4 left-1/2 -translate-x-1/2 -translate-y-full rounded-full h-12 w-12 z-10 bg-white/80 backdrop-blur-sm"
                onClick={scrollPrev}
            >
                <ChevronUp className="h-6 w-6" />
            </Button>

            <div className="overflow-hidden p-2 bg-black rounded-3xl shadow-2xl h-[70vh]" ref={emblaRef}>
                <div className="flex flex-col h-full rounded-2xl">
                    {letters.map((letter, index) => (
                        <div className="flex-[0_0_100%] min-h-0 flex items-center justify-center p-0" key={`${type}-${index}`}>
                            <div 
                                onClick={() => playLetterSound(letter)}
                                className={cn(
                                    "w-full h-full transform transition-all duration-300 flex flex-col text-center items-center justify-center cursor-pointer bg-gradient-to-br from-slate-800 to-slate-900",
                                    activeLetter === letter.char && "scale-105"
                                )}
                            >
                                <div className="p-4 w-full flex flex-col items-center justify-center">
                                    <p className="text-[12rem] leading-none font-bold text-white/90">{letter.char}</p>
                                    <p className="text-3xl font-semibold text-white/70 mt-4">{letter.name}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Button
                variant="outline"
                size="icon"
                className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-full rounded-full h-12 w-12 z-10 bg-white/80 backdrop-blur-sm"
                onClick={scrollNext}
            >
                <ChevronDown className="h-6 w-6" />
            </Button>
        </div>
    );
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
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(letter);
            utterance.lang = 'bn-IN';
            window.speechSynthesis.speak(utterance);
        }
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

const MatchingGame = () => {
    const [targetLetter, setTargetLetter] = useState<{ char: string; name: string } | null>(null);
    const [options, setOptions] = useState<{ char: string; name: string }[]>([]);
    const [feedback, setFeedback] = useState<{message: string, type: 'correct' | 'incorrect' | 'none'}>({message: '', type: 'none'});
    const [isCorrect, setIsCorrect] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const startNewRound = useCallback(() => {
        const targetIndex = Math.floor(Math.random() * allLetters.length);
        const newTargetLetter = allLetters[targetIndex];
        setTargetLetter(newTargetLetter);
        
        const incorrectOptions = new Set<{ char: string; name: string }>();
        while(incorrectOptions.size < 3) {
            const randomIndex = Math.floor(Math.random() * allLetters.length);
            const randomLetter = allLetters[randomIndex];
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


export default function BengaliAlphabetClientPage() {
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);

  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/10 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
            <Button asChild variant="ghost">
                <Link href="/kids-zone/learning-bengali">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Learning Bengali
                </Link>
            </Button>
             <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Settings className="h-5 w-5" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Settings</DialogTitle>
                        <DialogDescription>Control your learning experience.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="autoplay-audio" className="flex items-center gap-2">
                                <Volume2 className="w-5 h-5"/>
                                Autoplay Audio on Scroll
                            </Label>
                            <Switch
                                id="autoplay-audio"
                                checked={autoplayEnabled}
                                onCheckedChange={(checked) => {
                                    setAutoplayEnabled(checked);
                                }}
                            />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
        
        <Tabs defaultValue="alphabet" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto h-auto">
                <TabsTrigger value="alphabet">Alphabet (বর্ণমালা)</TabsTrigger>
                <TabsTrigger value="recognize">Recognize (চিনুন)</TabsTrigger>
                <TabsTrigger value="match">Match (মেলান)</TabsTrigger>
            </TabsList>
            <TabsContent value="alphabet" className="mt-8">
              <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 max-w-sm mx-auto h-auto sm:h-10">
                    <TabsTrigger value="all">All (সব)</TabsTrigger>
                    <TabsTrigger value="vowels">Vowels (স্বরবর্ণ)</TabsTrigger>
                    <TabsTrigger value="consonants">Consonants (ব্যঞ্জনবর্ণ)</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all" className="mt-8">
                    <AlphabetLearn letters={allLetters} type="all" autoplayEnabled={autoplayEnabled} />
                  </TabsContent>
                  <TabsContent value="vowels" className="mt-8">
                    <AlphabetLearn letters={vowels} type="vowels" autoplayEnabled={autoplayEnabled} />
                  </TabsContent>
                  <TabsContent value="consonants" className="mt-8">
                    <AlphabetLearn letters={consonants} type="consonants" autoplayEnabled={autoplayEnabled} />
                  </TabsContent>
              </Tabs>
            </TabsContent>
            <TabsContent value="recognize">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 max-w-lg mx-auto h-auto sm:h-10">
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
            <TabsContent value="match">
                <MatchingGame />
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
