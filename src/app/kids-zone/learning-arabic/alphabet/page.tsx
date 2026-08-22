
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Volume2 } from "lucide-react";
import Link from "next/link";
import { useState } from 'react';
import { cn } from "@/lib/utils";

const arabicLetters = [
  { char: 'ا', name: 'Alif' }, { char: 'ب', name: 'Ba' }, { char: 'ت', name: 'Ta' },
  { char: 'ث', name: 'Tha' }, { char: 'ج', name: 'Jim' }, { char: 'ح', name: 'Ha' },
  { char: 'خ', name: 'Kha' }, { char: 'د', name: 'Dal' }, { char: 'ذ', name: 'Dhal' },
  { char: 'ر', name: 'Ra' }, { char: 'ز', name: 'Zain' }, { char: 'س', name: 'Sin' },
  { char: 'ش', name: 'Shin' }, { char: 'ص', name: 'Sad' }, { char: 'ض', name: 'Dad' },
  { char: 'ط', name: 'Ta' }, { char: 'ظ', name: 'Dha' }, { char: 'ع', name: 'Ayn' },
  { char: 'غ', name: 'Ghayn' }, { char: 'ف', name: 'Fa' }, { char: 'ق', name: 'Qaf' },
  { char: 'ك', name: 'Kaf' }, { char: 'ل', name: 'Lam' }, { char: 'م', name: 'Mim' },
  { char: 'ن', name: 'Nun' }, { char: 'ه', name: 'Ha' }, { char: 'و', name: 'Waw' },
  { char: 'ي', name: 'Ya' }
];


const playSound = (sound: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(sound);
      utterance.lang = 'ar-SA';
      window.speechSynthesis.speak(utterance);
    }
};

export default function ArabicAlphabetPage() {
    const [activeLetter, setActiveLetter] = useState<string | null>(null);

    const playLetterSound = (letter: {char: string, name: string}) => {
        playSound(letter.char); // Speak the character itself
        setActiveLetter(letter.char);
        setTimeout(() => setActiveLetter(null), 1000);
    }

  return (
    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/10 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
            <Button asChild variant="ghost">
                <Link href="/kids-zone/learning-arabic">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Learning Arabic
                </Link>
            </Button>
        </div>
        <header className="text-center mb-12">
          <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-teal-600">
            Arabic Alphabet (الحروف الهجائية)
          </h1>
          <p className="text-lg text-teal-700/80 mt-4 max-w-2xl mx-auto">
            Click on a letter to learn its sound.
          </p>
        </header>
        
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-4 max-w-7xl mx-auto">
            {arabicLetters.map((letter, index) => (
                <Card 
                    key={`${letter.char}-${index}`} 
                    onClick={() => playLetterSound(letter)}
                    className={cn(
                        "transform transition-all duration-300 hover:scale-110 hover:shadow-2xl flex flex-col text-center items-center justify-center aspect-square cursor-pointer",
                        activeLetter === letter.char ? "scale-110 shadow-2xl ring-4 ring-teal-400" : "shadow-lg bg-white/70 backdrop-blur-sm"
                    )}
                >
                    <CardContent className="p-2 w-full flex flex-col items-center justify-center">
                        <p className="text-6xl md:text-8xl font-bold text-slate-800 dark:text-slate-100">{letter.char}</p>
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-2">{letter.name}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>
    </div>
  );
}
