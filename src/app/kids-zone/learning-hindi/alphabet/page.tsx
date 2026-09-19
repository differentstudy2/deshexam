
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, RefreshCw, Volume2 } from "lucide-react";
import Link from "next/link";
import { useState, useCallback, useEffect } from 'react';
import { cn } from "@/lib/utils";

const vowels = [
  { char: 'अ', name: 'a' }, { char: 'आ', name: 'aa' }, { char: 'इ', name: 'i' },
  { char: 'ई', name: 'ee' }, { char: 'उ', name: 'u' }, { char: 'ऊ', name: 'oo' },
  { char: 'ऋ', name: 'ri' }, { char: 'ए', name: 'e' }, { char: 'ऐ', name: 'ai' },
  { char: 'ओ', name: 'o' }, { char: 'औ', name: 'au' }
];

const consonants = [
  { char: 'क', name: 'ka' }, { char: 'ख', name: 'kha' }, { char: 'ग', name: 'ga' }, { char: 'घ', name: 'gha' }, { char: 'ङ', name: 'nga' },
  { char: 'च', name: 'cha' }, { char: 'छ', name: 'chha' }, { char: 'ज', name: 'ja' }, { char: 'झ', name: 'jha' }, { char: 'ञ', name: 'nya' },
  { char: 'ट', name: 'ta' }, { char: 'ठ', name: 'tha' }, { char: 'ड', name: 'da' }, { char: 'ढ', name: 'dha' }, { char: 'ण', name: 'na' },
  { char: 'त', name: 'ta' }, { char: 'थ', name: 'tha' }, { char: 'द', name: 'da' }, { char: 'ध', name: 'dha' }, { char: 'न', name: 'na' },
  { char: 'प', name: 'pa' }, { char: 'फ', name: 'pha' }, { char: 'ब', name: 'ba' }, { char: 'भ', name: 'bha' }, { char: 'म', name: 'ma' },
  { char: 'य', name: 'ya' }, { char: 'र', name: 'ra' }, { char: 'ल', name: 'la' }, { char: 'व', name: 'va' },
  { char: 'श', name: 'sha' }, { char: 'ष', name: 'sha' }, { char: 'स', name: 'sa' }, { char: 'ह', name: 'ha' },
  { char: 'क्ष', name: 'ksha' }, { char: 'त्र', name: 'tra' }, { char: 'ज्ञ', name: 'gya' }
];

const playSound = (sound: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(sound);
      utterance.lang = 'hi-IN';
      window.speechSynthesis.speak(utterance);
    }
};

const AlphabetSection = ({ title, letters, gridClass }: { title: string, letters: { char: string, name: string }[], gridClass?: string }) => {
    const [activeLetter, setActiveLetter] = useState<string | null>(null);

    const playLetterSound = (letter: {char: string, name: string}) => {
        playSound(letter.char); // Speak the character itself
        setActiveLetter(letter.char);
        setTimeout(() => setActiveLetter(null), 1000);
    }

    return (
        <section className="mb-12">
            <h2 className="text-3xl font-bold font-headline mb-6 text-center text-pink-700">{title}</h2>
            <div className={cn("grid gap-4 max-w-7xl mx-auto", gridClass || "grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9")}>
                {letters.map((letter, index) => (
                    <Card 
                        key={`${letter.char}-${index}`} 
                        onClick={() => playLetterSound(letter)}
                        className={cn(
                            "transform transition-all duration-300 hover:scale-110 hover:shadow-2xl flex flex-col text-center items-center justify-center aspect-square cursor-pointer",
                            activeLetter === letter.char ? "scale-110 shadow-2xl ring-4 ring-pink-400" : "shadow-lg bg-white/70 backdrop-blur-sm"
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
    )
}

export default function HindiAlphabetPage() {
  return (
    <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/10 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
            <Button asChild variant="ghost">
                <Link href="/kids-zone/learning-hindi">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Learning Hindi
                </Link>
            </Button>
        </div>
        <header className="text-center mb-12">
          <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-pink-600">
            Hindi Alphabet (वर्णमाला)
          </h1>
          <p className="text-lg text-pink-700/80 mt-4 max-w-2xl mx-auto">
            Click on a letter to learn its sound.
          </p>
        </header>
        
        <AlphabetSection title="Vowels (स्वर)" letters={vowels} gridClass="grid-cols-3 sm:grid-cols-4 md:grid-cols-6" />
        <AlphabetSection title="Consonants (व्यंजन)" letters={consonants} />
      </div>
    </div>
  );
}
