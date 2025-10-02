
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Volume2, Languages } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const translations = {
    en: {
        back: "Back to Learn Numbers",
        title: "Learn Numbers 0 to 10",
        description: "Click on a number to hear its name.",
        tapToListen: "Tap to listen",
        numberNames: ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten']
    },
    hi: {
        back: "नंबर सीखें पर वापस जाएं",
        title: "संख्याएँ 0 से 10 सीखें",
        description: "किसी संख्या का नाम सुनने के लिए उस पर क्लिक करें।",
        tapToListen: "सुनने के लिए टैप करें",
        numberNames: ['शून्य', 'एक', 'दो', 'तीन', 'चार', 'पांच', 'छह', 'सात', 'आठ', 'नौ', 'दस']
    },
    bn: {
        back: "সংখ্যা শেখা পৃষ্ঠায় ফিরে যান",
        title: "সংখ্যা ০ থেকে ১০ শিখুন",
        description: "সংখ্যার নাম শুনতে সেটির উপর ক্লিক করুন।",
        tapToListen: "শুনতে ট্যাপ করুন",
        numberNames: ['শূন্য', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়', 'দশ']
    }
};


export default function LearnNumbers0To10Page() {
    const [activeNumber, setActiveNumber] = useState<number | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [language, setLanguage] = useState<'en' | 'hi' | 'bn'>('en');

    const t = translations[language];

    const playSound = async (number: number) => {
        if (activeNumber !== null) return; 

        try {
            setActiveNumber(number);
            const languageCode = language === 'en' ? 'en-US' : language === 'hi' ? 'hi-IN' : 'bn-IN';
            const result = await textToSpeech({ text: t.numberNames[number], lang: languageCode });
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

    const handleLanguageChange = (lang: 'en' | 'hi' | 'bn') => {
        setLanguage(lang);
        setActiveNumber(null);
        setAudioUrl(null);
    }


  return (
    <div className="bg-gradient-to-br from-green-50 to-cyan-50 dark:from-green-900/10 min-h-screen">
       {audioUrl && <audio ref={audioRef} onEnded={handleAudioEnd} src={audioUrl} />}
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 flex justify-between items-center">
            <Button asChild variant="ghost">
                <Link href="/kids-zone/learning-games/number-recognition/learn-numbers">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t.back}
                </Link>
            </Button>
            <div className="flex items-center gap-2">
                <Languages className="w-5 h-5 text-slate-600"/>
                <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-[120px] h-9">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">हिन्दी</SelectItem>
                        <SelectItem value="bn">বাংলা</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        <header className="text-center mb-12">
          <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-cyan-600">
            {t.title}
          </h1>
          <p className="text-lg text-cyan-700/80 mt-4 max-w-2xl mx-auto">
            {t.description}
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
                <p className="text-xl font-semibold text-slate-500 dark:text-slate-400 mb-2 pb-2 border-b w-full">{t.numberNames[number]}</p>
                <div className="flex-grow flex items-center justify-center">
                    <p className="text-8xl font-bold text-slate-800 dark:text-slate-100" style={{fontFamily: "'Lexend', sans-serif"}}>
                        {number}
                    </p>
                </div>
                <div className="flex items-center text-muted-foreground mt-2 pt-2 border-t">
                    <Volume2 className="w-4 h-4 mr-1"/>
                    <span>{t.tapToListen}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
