
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Volume2, Languages } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const translations = {
    en: {
        back: "Back to Learn Numbers",
        title: "Learn Numbers 21 to 30",
        description: "Click on a number to hear its name.",
        tapToListen: "Tap to listen",
        numberNames: ['Twenty-one', 'Twenty-two', 'Twenty-three', 'Twenty-four', 'Twenty-five', 'Twenty-six', 'Twenty-seven', 'Twenty-eight', 'Twenty-nine', 'Thirty'],
    },
    hi: {
        back: "नंबर सीखें पर वापस जाएं",
        title: "संख्याएँ 21 से 30 सीखें",
        description: "किसी संख्या का नाम सुनने के लिए उस पर क्लिक करें।",
        tapToListen: "सुनने के लिए टैप करें",
        numberNames: ['इक्कीस', 'बाईस', 'तेईस', 'चौबीस', 'पच्चीस', 'छब्बीस', 'सत्ताईस', 'अट्ठाईस', 'उनतीस', 'तीस'],
    },
    bn: {
        back: "সংখ্যা শেখা পৃষ্ঠায় ফিরে যান",
        title: "সংখ্যা ২১ থেকে ৩০ শিখুন",
        description: "সংখ্যার নাম শুনতে সেটির উপর ক্লিক করুন।",
        tapToListen: "শুনতে ট্যাপ করুন",
        numberNames: ['একুশ', 'বাইশ', 'তেইশ', 'চব্বিশ', 'পঁচিশ', 'ছাব্বিশ', 'সাতাশ', 'আঠাশ', 'উনত্রিশ', 'ত্রিশ'],
    }
};

const toDevanagari = (num: number | string) => {
    const n = num.toString();
    const devanagariDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return n.split('').map(digit => devanagariDigits[parseInt(digit, 10)]).join('');
};

const toBengaliNumerals = (num: number | string) => {
    const n = num.toString();
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return n.split('').map(digit => bengaliDigits[parseInt(digit, 10)]).join('');
};


export default function LearnNumbers21To30Page() {
    const [activeNumber, setActiveNumber] = useState<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [language, setLanguage] = useState<'en' | 'hi' | 'bn'>('en');

    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.onended = () => {
                setActiveNumber(null);
            };
        }
    }, []);

    const t = translations[language];
    const numbers = Array.from({ length: 10 }, (_, i) => 21 + i);

    const playSound = async (number: number) => {
        if (activeNumber !== null || !audioRef.current) return; 

        try {
            setActiveNumber(number);
            const langCode = language === 'en' ? 'en-us' : language === 'hi' ? 'hi-in' : 'bn-in';
            const audioSrc = `/audio/numbers/${langCode}/${number}.mp3`;
            
            if (audioRef.current.src !== audioSrc) {
                audioRef.current.src = audioSrc;
            }
            await audioRef.current.play();

        } catch (error) {
            console.error(`Could not play sound for number ${number}:`, error);
            setActiveNumber(null);
        }
    };
    
    const handleLanguageChange = (lang: 'en' | 'hi' | 'bn') => {
        setLanguage(lang);
        setActiveNumber(null);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
        }
    }
    
    const displayNum = (num: number | string) => {
        if (language === 'hi') return toDevanagari(num);
        if (language === 'bn') return toBengaliNumerals(num);
        return num.toString();
    }


  return (
    <div className="bg-gradient-to-br from-green-50 to-cyan-50 dark:from-green-900/10 min-h-screen">
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

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
          {numbers.map((number, index) => (
            <Card 
                key={number} 
                onClick={() => playSound(number)}
                className={cn(
                    "transform transition-all duration-300 hover:scale-110 hover:shadow-2xl flex flex-col text-center items-center justify-start aspect-square cursor-pointer",
                    activeNumber === number ? "scale-110 shadow-2xl ring-4 ring-cyan-400" : "shadow-lg"
                )}
            >
              <CardContent className="p-2 w-full flex flex-col items-center justify-center">
                <p className="text-xl font-semibold text-slate-500 dark:text-slate-400 mb-2 pb-2 border-b w-full">{t.numberNames[index]}</p>
                <div className="flex-grow flex items-center justify-center">
                    <p className="text-8xl font-bold text-slate-800 dark:text-slate-100" style={{fontFamily: "'Lexend', sans-serif"}}>
                        {displayNum(number)}
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
