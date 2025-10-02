
'use client';

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Equal, Volume2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";

const matras = [
  { matra: 'া', matraName: 'আ-কার (A-kar)', soundSuffix: 'a' },
  { matra: 'ি', matraName: 'ই-কার (E-kar)', soundSuffix: 'i' },
  { matra: 'ী', matraName: 'ঈ-কার (Ee-kar)', soundSuffix: 'ee' },
  { matra: 'ু', matraName: 'উ-কার (U-kar)', soundSuffix: 'u' },
  { matra: 'ূ', matraName: 'ঊ-কার (Oo-kar)', soundSuffix: 'oo' },
  { matra: 'ৃ', matraName: 'ঋ-কার (Ri-kar)', soundSuffix: 'ri' },
  { matra: 'ে', matraName: 'এ-কার (E-kar)', soundSuffix: 'e' },
  { matra: 'ৈ', matraName: 'ঐ-কার (Oi-kar)', soundSuffix: 'oi' },
  { matra: 'ো', matraName: 'ও-কার (O-kar)', soundSuffix: 'o' },
  { matra: 'ৌ', matraName: 'ঔ-কার (Ou-kar)', soundSuffix: 'ou' },
];

const consonants = [
  { char: 'ক', name: 'Kaw', baseSound: 'K' }, { char: 'খ', name: 'Khaw', baseSound: 'Kh' }, { char: 'গ', name: 'Gaw', baseSound: 'G' }, { char: 'ঘ', name: 'Ghaw', baseSound: 'Gh' }, { char: 'ঙ', name: 'Ngaw', baseSound: 'Ng' },
  { char: 'চ', name: 'Chaw', baseSound: 'Ch' }, { char: 'ছ', name: 'Chhaw', baseSound: 'Chh' }, { char: 'জ', name: 'Jaw', baseSound: 'J' }, { char: 'ঝ', name: 'Jhaw', baseSound: 'Jh' }, { char: 'ঞ', name: 'Niyaw', baseSound: 'Niy' },
  { char: 'ট', name: 'Taw', baseSound: 'T' }, { char: 'ঠ', name: 'Thaw', baseSound: 'Th' }, { char: 'ড', name: 'Daw', baseSound: 'D' }, { char: 'ঢ', name: 'Dhaw', baseSound: 'Dh' }, { char: 'ণ', name: 'Naw', baseSound: 'N' },
  { char: 'ত', name: 'Taw', baseSound: 'T' }, { char: 'থ', name: 'Thaw', baseSound: 'Th' }, { char: 'দ', name: 'Daw', baseSound: 'D' }, { char: 'ধ', name: 'Dhaw', baseSound: 'Dh' }, { char: 'ন', name: 'Naw', baseSound: 'N' },
  { char: 'প', name: 'Paw', baseSound: 'P' }, { char: 'ফ', name: 'Faw', baseSound: 'F' }, { char: 'ব', name: 'Baw', baseSound: 'B' }, { char: 'ভ', name: 'Bhaw', baseSound: 'Bh' }, { char: 'ম', name: 'Maw', baseSound: 'M' },
  { char: 'য', name: 'Jaw', baseSound: 'J' }, { char: 'র', name: 'Raw', baseSound: 'R' }, { char: 'ল', name: 'Law', baseSound: 'L' },
  { char: 'শ', name: 'Shaw', baseSound: 'Sh' }, { char: 'ষ', name: 'Shaw', baseSound: 'Sh' },
  { char: 'স', name: 'Saw', baseSound: 'S' }, { char: 'হ', name: 'Haw', baseSound: 'H' }, { char: 'ড়', name: 'Raw', baseSound: 'R' }, { char: 'ঢ়', name: 'Rhaw', baseSound: 'Rh' }, { char: 'য়', name: 'Yaw', baseSound: 'Y' },
];

export default function MatraPronunciationPage() {
    const [activeCard, setActiveCard] = useState<string | null>(null);

    const playSound = (sound: string) => {
        // Placeholder for audio playback logic
        console.log(`Playing sound for ${sound}`);
        setActiveCard(sound);
        setTimeout(() => setActiveCard(null), 1000);
    }
    
  return (
    <div className="bg-gradient-to-br from-pink-50 to-indigo-50 dark:from-pink-900/10 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
            <Button asChild variant="ghost">
                <Link href="/kids-zone/learning-bengali/matra">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Matra Learning
                </Link>
            </Button>
        </div>
        <header className="text-center mb-12">
          <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-indigo-600">
            Matra Pronunciation Practice
          </h1>
          <p className="text-lg text-indigo-700/80 mt-4 max-w-2xl mx-auto">
            See how each matra combines with all the consonants and listen to the sounds.
          </p>
        </header>

        <Tabs defaultValue={matras[0].matraName} className="w-full" orientation="vertical">
            <TabsList className="grid grid-cols-2 md:grid-cols-1 md:w-48 h-auto">
                {matras.map((item) => (
                    <TabsTrigger key={item.matraName} value={item.matraName} className="justify-start gap-2">
                        <span className="text-2xl font-bold text-indigo-500">{item.matra}</span>
                        <span>{item.matraName}</span>
                    </TabsTrigger>
                ))}
            </TabsList>
            {matras.map((matra) => (
                <TabsContent key={matra.matraName} value={matra.matraName} className="md:ml-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {consonants.map((consonant, index) => {
                             const combinedChar = consonant.char + matra.matra;
                             const combinedSound = consonant.baseSound + matra.soundSuffix;
                             return (
                                <Card 
                                    key={index} 
                                    onClick={() => playSound(combinedSound)}
                                    className={cn(
                                        "transform transition-all duration-300 hover:scale-105 hover:shadow-xl flex flex-col text-center items-center justify-center cursor-pointer",
                                        activeCard === combinedSound ? "scale-105 shadow-xl ring-4 ring-indigo-400" : "shadow-md bg-white/70 backdrop-blur-sm"
                                    )}
                                >
                                    <CardContent className="p-3 w-full">
                                        <div className="flex flex-wrap items-center justify-center gap-x-1 sm:gap-x-2 w-full text-2xl sm:text-3xl font-bold text-slate-800">
                                            <div className="flex flex-col items-center">
                                                <span>{consonant.char}</span>
                                                <span className="text-xs font-normal">{consonant.name}</span>
                                            </div>
                                            <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
                                            <div className="flex flex-col items-center">
                                                <span className="text-indigo-600">{matra.matra}</span>
                                                <span className="text-xs font-normal">{matra.matraName.split(' ')[0]}</span>
                                            </div>
                                            <Equal className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
                                            <div className="flex flex-col items-center">
                                                <span className="text-green-600">{combinedChar}</span>
                                                <span className="text-xs font-normal">{combinedSound}</span>
                                            </div>
                                        </div>
                                         <div className="flex items-center text-muted-foreground mt-2 pt-2 border-t w-full justify-center text-xs">
                                            <Volume2 className="w-3 h-3 mr-1"/>
                                            <span>Tap to listen</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </TabsContent>
            ))}
        </Tabs>
      </div>
    </div>
  );
}
