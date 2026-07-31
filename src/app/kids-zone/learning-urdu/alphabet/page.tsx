
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Volume2 } from "lucide-react";
import Link from "next/link";
import { useState } from 'react';
import { cn } from "@/lib/utils";

const urduLetters = [
  { char: 'ا', name: 'Alif' }, { char: 'ب', name: 'Be' }, { char: 'پ', name: 'Pe' },
  { char: 'ت', name: 'Te' }, { char: 'ٹ', name: 'Te' }, { char: 'ث', name: 'Se' },
  { char: 'ج', name: 'Jīm' }, { char: 'چ', name: 'Ce' }, { char: 'ح', name: 'Baṛī He' },
  { char: 'خ', name: 'K͟he' }, { char: 'د', name: 'Dāl' }, { char: 'ڈ', name: 'Ḍāl' },
  { char: 'ذ', name: 'Zāl' }, { char: 'ر', name: 'Re' }, { char: 'ڑ', name: 'Ṛe' },
  { char: 'ز', name: 'Ze' }, { char: 'ژ', name: 'Že' }, { char: 'س', name: 'Sīn' },
  { char: 'ش', name: 'Shīn' }, { char: 'ص', name: 'Suād' }, { char: 'ض', name: 'Zuād' },
  { char: 'ط', name: 'To\'e' }, { char: 'ظ', name: 'Zo\'e' }, { char: 'ع', name: 'Ain' },
  { char: 'غ', name: 'G͟hain' }, { char: 'ف', name: 'Fe' }, { char: 'ق', name: 'Qāf' },
  { char: 'ک', name: 'Kāf' }, { char: 'گ', name: 'Gāf' }, { char: 'ل', name: 'Lām' },
  { char: 'م', name: 'Mīm' }, { char: 'ن', name: 'Nūn' }, { char: 'ں', name: 'Nūn Ghunna' },
  { char: 'ہ', name: 'Choṭī He' }, { char: 'و', name: 'Vā\'o' }, { char: 'ی', name: 'Ye' },
  { char: 'ے', name: 'Baṛī Ye' }
];

const playSound = (sound: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(sound);
      utterance.lang = 'ur-PK';
      window.speechSynthesis.speak(utterance);
    }
};

export default function UrduAlphabetPage() {
    const [activeLetter, setActiveLetter] = useState<string | null>(null);

    const playLetterSound = (letter: {char: string, name: string}) => {
        playSound(letter.char); // Speak the character itself
        setActiveLetter(letter.char);
        setTimeout(() => setActiveLetter(null), 1000);
    }

  return (
    <div className="bg-gradient-to-br from-rose-50 to-fuchsia-50 dark:from-rose-900/10 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
            <Button asChild variant="ghost">
                <Link href="/kids-zone/learning-urdu">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Learning Urdu
                </Link>
            </Button>
        </div>
        <header className="text-center mb-12">
          <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-rose-600">
            Urdu Alphabet (حروف تہجی)
          </h1>
          <p className="text-lg text-rose-700/80 mt-4 max-w-2xl mx-auto">
            Click on a letter to learn its sound.
          </p>
        </header>
        
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-4 max-w-7xl mx-auto">
            {urduLetters.map((letter, index) => (
                <Card 
                    key={`${letter.char}-${index}`} 
                    onClick={() => playLetterSound(letter)}
                    className={cn(
                        "transform transition-all duration-300 hover:scale-110 hover:shadow-2xl flex flex-col text-center items-center justify-center aspect-square cursor-pointer",
                        activeLetter === letter.char ? "scale-110 shadow-2xl ring-4 ring-rose-400" : "shadow-lg bg-white/70 backdrop-blur-sm"
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
