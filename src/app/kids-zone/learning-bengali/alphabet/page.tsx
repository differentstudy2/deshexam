
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from 'react';
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

    const playSound = (letter: string) => {
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
                        onClick={() => playSound(letter.char)}
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


export default function BengaliAlphabetPage() {
    const [activeLetter, setActiveLetter] = useState<string | null>(null);

    const playSound = (letter: string) => {
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
            Click on a letter to learn its sound.
          </p>
        </header>

        <Tabs defaultValue="alphabet" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                <TabsTrigger value="alphabet">Alphabet (বর্ণমালা)</TabsTrigger>
                <TabsTrigger value="recognize">Recognize Alphabet (বর্ণমালা চিনুন)</TabsTrigger>
            </TabsList>
            <TabsContent value="alphabet" className="mt-8">
                <section className="mb-12">
                    <h2 className="text-3xl font-bold font-headline mb-6 text-center text-orange-700">Vowels (স্বরবর্ণ)</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 max-w-4xl mx-auto">
                        {vowels.map((letter, index) => (
                            <Card 
                                key={`${letter.char}-${index}`} 
                                onClick={() => playSound(letter.char)}
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
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 max-w-7xl mx-auto">
                        {consonants.map((letter, index) => (
                            <Card 
                                key={`${letter.char}-${index}`}
                                onClick={() => playSound(letter.char)}
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
        </Tabs>
      </div>
    </div>
  );
}
