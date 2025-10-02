
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Volume2, Plus, Equal } from "lucide-react";
import Link from "next/link";
import { useState } from 'react';
import { cn } from "@/lib/utils";

const matras = [
  { vowel: 'অ', name: 'Aw', matra: '', example: 'ক', sound: 'Kaw' },
  { vowel: 'আ', name: 'A', matra: 'া', example: 'কা', sound: 'Ka' },
  { vowel: 'ই', name: 'I', matra: 'ি', example: 'কি', sound: 'Ki' },
  { vowel: 'ঈ', name: 'Ee', matra: 'ী', example: 'কী', sound: 'Kee' },
  { vowel: 'উ', name: 'U', matra: 'ু', example: 'কু', sound: 'Ku' },
  { vowel: 'ঊ', name: 'Oo', matra: 'ূ', example: 'কূ', sound: 'Koo' },
  { vowel: 'ঋ', name: 'Ri', matra: 'ৃ', example: 'কৃ', sound: 'Kri' },
  { vowel: 'এ', name: 'E', matra: 'ে', example: 'কে', sound: 'Ke' },
  { vowel: 'ঐ', name: 'Oi', matra: 'ৈ', example: 'কৈ', sound: 'Koi' },
  { vowel: 'ও', name: 'O', matra: 'ো', example: 'কো', sound: 'Ko' },
  { vowel: 'ঔ', name: 'Ou', matra: 'ৌ', example: 'কৌ', sound: 'Kou' }
];

export default function BengaliMatraPage() {
    const [activeCard, setActiveCard] = useState<string | null>(null);

    const playSound = (sound: string) => {
        // Placeholder for audio playback logic
        console.log(`Playing sound for ${sound}`);
        setActiveCard(sound);
        setTimeout(() => setActiveCard(null), 1000);
    }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/10 min-h-screen">
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
          <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-blue-600">
            Bengali Vowel Diacritics (মাত্রা)
          </h1>
          <p className="text-lg text-blue-700/80 mt-4 max-w-2xl mx-auto">
            Learn how Bengali vowels change their form when attached to consonants.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {matras.map((item, index) => (
                <Card 
                    key={index} 
                    onClick={() => playSound(item.sound)}
                    className={cn(
                        "transform transition-all duration-300 hover:scale-105 hover:shadow-2xl flex flex-col text-center items-center justify-center cursor-pointer",
                        activeCard === item.sound ? "scale-105 shadow-2xl ring-4 ring-blue-400" : "shadow-lg bg-white/70 backdrop-blur-sm"
                    )}
                >
                    <CardContent className="p-4 w-full flex flex-col items-center justify-center">
                        <div className="flex flex-wrap items-center justify-center gap-x-1 sm:gap-x-4 w-full text-2xl sm:text-4xl md:text-5xl font-bold text-slate-800">
                            <div className="flex flex-col items-center">
                                <span>ক</span>
                                <span className="text-xs font-normal">Kaw</span>
                            </div>
                            <Plus className="w-5 h-5 sm:w-8 sm:h-8 text-blue-500" />
                             <div className="flex flex-col items-center">
                                <span className="text-blue-600">{item.matra || 'অ'}</span>
                                <span className="text-xs font-normal">{item.name}</span>
                            </div>
                            <Equal className="w-5 h-5 sm:w-8 sm:h-8 text-blue-500" />
                             <div className="flex flex-col items-center">
                                <span className="text-green-600">{item.example}</span>
                                <span className="text-xs font-normal">{item.sound}</span>
                            </div>
                        </div>
                         <div className="flex items-center text-muted-foreground mt-4 pt-2 border-t w-full justify-center text-sm">
                            <Volume2 className="w-4 h-4 mr-1"/>
                            <span>Tap to listen to the result</span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>

      </div>
    </div>
  );
}
