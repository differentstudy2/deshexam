'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Volume2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { textToSpeech } from '@/ai/flows/text-to-speech';

const numbers = Array.from({ length: 11 }, (_, i) => i); // 0 to 10
const numberNames = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];


export default function LearnNumbers0To10Page() {
    const [activeNumber, setActiveNumber] = useState<number | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);


    const playSound = async (number: number) => {
        if (activeNumber !== null) return; 

        try {
            setActiveNumber(number);
            const result = await textToSpeech({ text: number.toString(), lang: 'en-US' });
            setAudioUrl(result.audioUrl);
        } catch (error) {
            console.error(`Could not generate sound for number ${number}:`, error);
            setActiveNumber(null);
        }
    };
    
    useEffect(() => {
        if (audioUrl && audioRef.current) {
            audioRef.current.load();
            audioRef.current.play().catch(e => console.error("Audio playback error:", e));
        }
    }, [audioUrl]);
    
    const handleAudioEnd = () => {
        setActiveNumber(null);
    };


  return (
    <div className="bg-gradient-to-br from-green-50 to-cyan-50 dark:from-green-900/10 min-h-screen">
       {audioUrl && <audio ref={audioRef} onEnded={handleAudioEnd} src={audioUrl} />}
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
            <Button asChild variant="ghost">
                <Link href="/kids-zone/learning-games/number-recognition/learn-numbers">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Learn Numbers
                </Link>
            </Button>
        </div>
        <header className="text-center mb-12">
          <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-cyan-600">
            Learn Numbers 0 to 10
          </h1>
          <p className="text-lg text-cyan-700/80 mt-4 max-w-2xl mx-auto">
            Click on a number to hear its name.
          </p>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 max-w-4xl mx-auto">
          {numbers.map((number) => (
            <Card 
                key={number} 
                onClick={() => playSound(number)}
                className={cn(
                    "transform transition-all duration-300 hover:scale-110 hover:shadow-2xl flex flex-col text-center items-center justify-start aspect-square cursor-pointer",
                    activeNumber === number ? "scale-110 shadow-2xl ring-4 ring-cyan-400" : "shadow-lg"
                )}
            >
              <CardContent className="p-2 w-full flex flex-col items-center justify-center">
                <p className="text-xl font-semibold text-slate-500 dark:text-slate-400 mb-2 pb-2 border-b w-full">{numberNames[number]}</p>
                <div className="flex-grow flex items-center justify-center">
                    <p className="text-8xl font-bold text-slate-800 dark:text-slate-100" style={{fontFamily: "'Lexend', sans-serif"}}>
                        {number}
                    </p>
                </div>
                <div className="flex items-center text-muted-foreground mt-2 pt-2 border-t">
                    <Volume2 className="w-4 h-4 mr-1"/>
                    <span>Tap to listen</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
