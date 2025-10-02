
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, RefreshCw, Check, X, Sparkles, Delete, Clock, Settings, Trophy, Rows, Mic, BarChart4, Languages } from "lucide-react";
import Link from "next/link";
import Confetti from 'react-dom-confetti';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { textToSpeech } from '@/ai/flows/text-to-speech';

const playSound = (type: 'correct' | 'incorrect') => {
  if (typeof window !== 'undefined') {
    const soundUrl = type === 'correct'
      ? '/audio/correct-83487.mp3'
      : '/audio/incorrect-293358.mp3';
      
    const audio = new Audio(soundUrl);
    audio.play().catch(error => console.error(`Error playing ${type} sound:`, error));
  }
};

const translations = {
    en: {
        backToPuzzles: "Back to Math Puzzles",
        pageTitle: "Addition Adventure",
        pageDescription: "Add the numbers and choose the correct answer!",
        mode: "Mode:",
        inputMode: "Number Pad",
        mcqMode: "Multiple Choice",
        voiceMode: "Voice",
        difficulty: "Difficulty:",
        level: "Level",
        options: "Options:",
        timer: "Timer:",
        seconds: "seconds",
        off: "Off",
        score: "Score:",
        newProblem: "New Problem",
        listening: "Listening...",
        tapToSpeak: "Tap to Speak",
        lastHeard: "Last heard:",
        didntCatch: "Didn't catch that. Try again!",
        correctMessages: ["Great job!", "Awesome!", "You got it!", "Amazing!", "Superstar!"],
        incorrectMessages: ["Try again!", "Not quite!", "Almost there!", "Oops!"],
        clear: "Clear",
        ttsPrompt: (num1: number, num2: number) => `Tell me, what is ${num1} plus ${num2}?`
    },
    hi: {
        backToPuzzles: "गणित पहेलियों पर वापस जाएं",
        pageTitle: "जोड़ का रोमांच",
        pageDescription: "संख्याओं को जोड़ें और सही उत्तर चुनें!",
        mode: "मोड:",
        inputMode: "नंबर पैड",
        mcqMode: "बहुविकल्पी",
        voiceMode: "आवाज",
        difficulty: "कठिनाई:",
        level: "स्तर",
        options: "विकल्प:",
        timer: "टाइमर:",
        seconds: "सेकंड",
        off: "बंद",
        score: "स्कोर:",
        newProblem: "नई समस्या",
        listening: "सुन रहा है...",
        tapToSpeak: "बोलने के लिए टैप करें",
        lastHeard: "अंतिम सुना:",
        didntCatch: "समझ नहीं आया। फिर से कोशिश करें!",
        correctMessages: ["बहुत बढ़िया!", "शानदार!", "सही है!", "अद्भुत!", "सुपरस्टार!"],
        incorrectMessages: ["पुनः प्रयास करें!", "लगभग सही!", "थोड़ा और!", "ओह!"],
        clear: "नया",
        ttsPrompt: (num1: number, num2: number) => `बताओ, ${toDevanagari(num1)} और ${toDevanagari(num2)} कितना होता है?`
    },
    bn: {
        backToPuzzles: "গণিত ধাঁধায় ফিরে যান",
        pageTitle: "যোগের অভিযান",
        pageDescription: "সংখ্যাগুলো যোগ করুন এবং সঠিক উত্তরটি বেছে নিন!",
        mode: "মোড:",
        inputMode: "নাম্বার প্যাড",
        mcqMode: "বহুনির্বাচনী",
        voiceMode: "ভয়েস",
        difficulty: "কঠিনতা:",
        level: "স্তর",
        options: "অপশন:",
        timer: "টাইমার:",
        seconds: "সেকেন্ড",
        off: "বন্ধ",
        score: "স্কোর:",
        newProblem: "নতুন সমস্যা",
        listening: "শুনছি...",
        tapToSpeak: "বলতে ট্যাপ করুন",
        lastHeard: "শেষ শোনা:",
        didntCatch: "বুঝতে পারিনি। আবার চেষ্টা করুন!",
        correctMessages: ["খুব ভালো!", "অসাধারণ!", "সঠিক হয়েছে!", "চমৎকার!", "সুপারস্টার!"],
        incorrectMessages: ["আবার চেষ্টা করুন!", "ঠিক হয়নি!", "প্রায় কাছাকাছি!", "উফ!"],
        clear: "মুছুন",
        ttsPrompt: (num1: number, num2: number) => `বলো, ${toBengaliNumerals(num1)} আর ${toBengaliNumerals(num2)} যোগ করলে কত হয়?`
    }
}

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

const useSpeechRecognition = (lang: string) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window)) {
            console.warn('Speech recognition not supported in this browser.');
            return;
        }

        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = lang;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onresult = (event: any) => {
            const last = event.results.length - 1;
            const text = event.results[last][0].transcript;
            setTranscript(text);
        };
        
        recognitionRef.current = recognition;

    }, [lang]);

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            recognitionRef.current.start();
        }
    };
    
    const resetTranscript = () => {
        setTranscript('');
    }

    return { isListening, transcript, startListening, resetTranscript, hasSupport: !!recognitionRef.current };
};

const NumberPad = ({ onNumberClick, onClear, onDelete, lang }: { onNumberClick: (num: number) => void, onClear: () => void, onDelete: () => void, lang: 'en' | 'hi' | 'bn' }) => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
    const t = translations[lang];

    const displayNum = (num: number) => {
        if (lang === 'hi') return toDevanagari(num);
        if (lang === 'bn') return toBengaliNumerals(num);
        return num;
    }

    return (
        <Card className="w-full max-w-xs mx-auto bg-blue-100/50 dark:bg-blue-900/30">
            <CardContent className="p-2 md:p-4">
                 <div className="grid grid-cols-3 gap-2 md:gap-4">
                    {numbers.map(num => (
                        <Button key={num} onClick={() => onNumberClick(num)} variant="outline" className="h-16 md:h-20 text-3xl md:text-4xl font-bold rounded-lg md:rounded-xl shadow-lg bg-white dark:bg-slate-800 hover:bg-slate-50 active:shadow-inner active:scale-95 transition-transform">
                            {displayNum(num)}
                        </Button>
                    ))}
                    <Button onClick={onClear} variant="outline" className="h-16 md:h-20 text-lg rounded-lg md:rounded-xl shadow-lg bg-white dark:bg-slate-800 active:scale-95 transition-transform">
                        {t.clear}
                    </Button>
                    <Button onClick={onDelete} variant="outline" className="h-16 md:h-20 text-lg rounded-lg md:rounded-xl shadow-lg bg-white dark:bg-slate-800 flex items-center justify-center active:scale-95 transition-transform">
                        <Delete className="w-6 h-6 md:w-8 md:h-8 text-destructive" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

const MultipleChoicePad = ({ options, onOptionClick, isSubmitting, lang }: { options: number[], onOptionClick: (num: number) => void, isSubmitting: boolean, lang: 'en' | 'hi' | 'bn' }) => {
    const displayNum = (num: number) => {
        if (lang === 'hi') return toDevanagari(num);
        if (lang === 'bn') return toBengaliNumerals(num);
        return num;
    }
    return (
        <Card className="w-full max-w-xs mx-auto bg-blue-100/50 dark:bg-blue-900/30">
            <CardContent className="p-2 md:p-4">
                 <div className="grid grid-cols-2 gap-2 md:gap-4">
                    {options.map(option => (
                        <Button 
                            key={option} 
                            onClick={() => onOptionClick(option)} 
                            variant="outline" 
                            className="h-20 md:h-24 text-4xl md:text-5xl font-bold rounded-lg md:rounded-xl shadow-lg bg-white dark:bg-slate-800 hover:bg-slate-50 active:shadow-inner active:scale-95 transition-transform"
                            disabled={isSubmitting}
                        >
                            {displayNum(option)}
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

const VoiceInputPad = ({ isListening, startListening, transcript, lang }: { isListening: boolean, startListening: () => void, transcript: string, lang: 'en' | 'hi' | 'bn' }) => {
    const t = translations[lang];
    return (
        <Card className="w-full max-w-xs mx-auto bg-blue-100/50 dark:bg-blue-900/30 flex flex-col items-center justify-center p-4 min-h-[300px] md:min-h-[420px]">
            <Button 
                onClick={startListening}
                variant={isListening ? 'destructive' : 'outline'}
                className="w-32 h-32 md:w-48 md:h-48 rounded-full shadow-lg text-6xl font-bold transition-all duration-300 ease-in-out"
                disabled={isListening}
            >
                <Mic className="w-16 h-16 md:w-24 md:h-24" />
            </Button>
            <p className="mt-4 md:mt-6 text-lg md:text-xl font-semibold text-slate-700 dark:text-slate-200">
                {isListening ? t.listening : t.tapToSpeak}
            </p>
            {transcript && <p className="mt-2 text-sm text-muted-foreground">{t.lastHeard} "{transcript}"</p>}
        </Card>
    );
};

export default function AdditionAdventurePage() {
    const [problem, setProblem] = useState<{ num1: number, num2: number, answer: number } | null>(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState<{message: string, type: 'correct' | 'incorrect' | 'none'}>({message: '', type: 'none'});
    const [isCorrect, setIsCorrect] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timerDuration, setTimerDuration] = useState(60); 
    const [timeLeft, setTimeLeft] = useState(timerDuration);
    const [score, setScore] = useState(0);
    const [totalAttempted, setTotalAttempted] = useState(0);
    const [gameMode, setGameMode] = useState<'input' | 'multipleChoice' | 'voice'>('input');
    const [options, setOptions] = useState<number[]>([]);
    const [mcqLevel, setMcqLevel] = useState(4);
    const [difficultyLevel, setDifficultyLevel] = useState(1);
    const [language, setLanguage] = useState<'en' | 'hi' | 'bn'>('en');
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    
    const t = translations[language];
    const { isListening, transcript, startListening, resetTranscript, hasSupport: hasVoiceSupport } = useSpeechRecognition(
        language === 'en' ? 'en-US' : language === 'hi' ? 'hi-IN' : 'bn-IN'
    );
    const audioRef = useRef<HTMLAudioElement>(null);

    const generateProblemWithOptions = useCallback((mode: 'input' | 'multipleChoice' | 'voice', level: number) => {
        let num1, num2;
        if (level === 1) {
            num1 = Math.floor(Math.random() * 9) + 1; // 1 to 9
            num2 = Math.floor(Math.random() * (10 - num1)) + 1; // Ensure sum is <= 10
        } else {
            const maxNumber = level * 10;
            const singleDigit = Math.floor(Math.random() * 9) + 1; // 1 to 9
            const doubleDigit = Math.floor(Math.random() * (maxNumber - 10)) + 10; // 10 to maxNumber

            if (Math.random() > 0.5) {
                num1 = singleDigit;
                num2 = doubleDigit;
            } else {
                num1 = doubleDigit;
                num2 = singleDigit;
            }
        }
        const answer = num1 + num2;

        const newProblem = { num1, num2, answer };
        setProblem(newProblem);

        if (mode === 'multipleChoice') {
            const incorrectOptions = new Set<number>();
            while (incorrectOptions.size < mcqLevel - 1) {
                const offset = Math.floor(Math.random() * 9) - 4; // -4 to 4
                const incorrectAnswer = answer + offset;
                if (incorrectAnswer !== answer && incorrectAnswer > 0) {
                    incorrectOptions.add(incorrectAnswer);
                }
            }
            const shuffledOptions = [...incorrectOptions, answer].sort(() => Math.random() - 0.5);
            setOptions(shuffledOptions);
        }
        if (mode === 'voice') {
            const promptText = t.ttsPrompt(num1, num2);
            textToSpeech({ text: promptText, lang: language === 'en' ? 'en-US' : 'hi-IN' }).then(result => {
                setAudioUrl(result.audioUrl);
            }).catch(err => console.error("TTS error:", err));
        } else {
            setAudioUrl(null);
        }
    }, [mcqLevel, t, language]);

    useEffect(() => {
        if (audioUrl && audioRef.current) {
            audioRef.current.play().catch(e => console.error("Audio playback error", e));
        }
    }, [audioUrl]);


    const handleNewProblem = useCallback((isIncorrectOrTimeout: boolean = false) => {
        if(isIncorrectOrTimeout) {
            setTotalAttempted(prev => prev + 1);
        }
        generateProblemWithOptions(gameMode, difficultyLevel);
        setUserAnswer('');
        setFeedback({message: '', type: 'none'});
        setIsCorrect(false);
        setIsSubmitting(false);
        if (timerDuration > 0) {
            setTimeLeft(timerDuration);
        }
        resetTranscript();
    }, [timerDuration, generateProblemWithOptions, gameMode, difficultyLevel, resetTranscript]);
    
    const handleSubmit = useCallback((answer: string) => {
        if (!answer || isSubmitting || !problem) return;
        
        setIsSubmitting(true);
        const answerNum = parseInt(answer, 10);
        if (answerNum === problem.answer) {
            playSound('correct');
            const randomMsg = t.correctMessages[Math.floor(Math.random() * t.correctMessages.length)];
            setScore(prev => prev + 1);
            setTotalAttempted(prev => prev + 1);
            setFeedback({ message: randomMsg, type: 'correct' });
        } else {
            playSound('incorrect');
             const randomMsg = t.incorrectMessages[Math.floor(Math.random() * t.incorrectMessages.length)];
            setFeedback({ message: randomMsg, type: 'incorrect' });
        }
    }, [isSubmitting, problem, t]);

    useEffect(() => {
        if (gameMode === 'input' && problem && userAnswer.length > 0 && userAnswer.length === String(problem.answer).length) {
            handleSubmit(userAnswer);
        }
    }, [userAnswer, problem, handleSubmit, gameMode]);
    
    useEffect(() => {
        if (gameMode !== 'voice' || !transcript) return;
        
       const wordsToNumbers: { [key: string]: string } = {
            'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10',
            'eleven': '11', 'twelve': '12', 'thirteen': '13', 'fourteen': '14', 'fifteen': '15', 'sixteen': '16', 'seventeen': '17', 'eighteen': '18', 'nineteen': '19', 'twenty': '20',
            'twenty-one': '21', 'twenty-two': '22', 'twenty-three': '23', 'twenty-four': '24', 'twenty-five': '25', 'twenty-six': '26', 'twenty-seven': '27', 'twenty-eight': '28', 'twenty-nine': '29', 'thirty': '30',
            'thirty-one': '31', 'thirty-two': '32', 'thirty-three': '33', 'thirty-four': '34', 'thirty-five': '35', 'thirty-six': '36', 'thirty-seven': '37', 'thirty-eight': '38', 'thirty-nine': '39', 'forty': '40',
            'forty-one': '41', 'forty-two': '42', 'forty-three': '43', 'forty-four': '44', 'forty-five': '45', 'forty-six': '46', 'forty-seven': '47', 'forty-eight': '48', 'forty-nine': '49', 'fifty': '50',
            'fifty-one': '51', 'fifty-two': '52', 'fifty-three': '53', 'fifty-four': '54', 'fifty-five': '55', 'fifty-six': '56', 'fifty-seven': '57', 'fifty-eight': '58', 'fifty-nine': '59', 'sixty': '60',
            'sixty-one': '61', 'sixty-two': '62', 'sixty-three': '63', 'sixty-four': '64', 'sixty-five': '65', 'sixty-six': '66', 'sixty-seven': '67', 'sixty-eight': '68', 'sixty-nine': '69', 'seventy': '70',
            'seventy-one': '71', 'seventy-two': '72', 'seventy-three': '73', 'seventy-four': '74', 'seventy-five': '75', 'seventy-six': '76', 'seventy-seven': '77', 'seventy-eight': '78', 'seventy-nine': '79', 'eighty': '80',
            'eighty-one': '81', 'eighty-two': '82', 'eighty-three': '83', 'eighty-four': '84', 'eighty-five': '85', 'eighty-six': '86', 'eighty-seven': '87', 'eighty-eight': '88', 'eighty-nine': '89', 'ninety': '90',
            'ninety-one': '91', 'ninety-two': '92', 'ninety-three': '93', 'ninety-four': '94', 'ninety-five': '95', 'ninety-six': '96', 'ninety-seven': '97', 'ninety-eight': '98', 'ninety-nine': '99', 'hundred': '100',
            'शून्य': '0', 'एक': '1', 'दो': '2', 'तीन': '3', 'चार': '4', 'पांच': '5', 'पाँच': '5', 'छह': '6', 'सात': '7', 'आठ': '8', 'नौ': '9', 'दस': '10',
            'ग्यारह': '11', 'बारह': '12', 'तेरह': '13', 'चौदह': '14', 'पंद्रह': '15', 'सोलह': '16', 'सत्रह': '17', 'अठारह': '18', 'उन्नीस': '19', 'बीस': '20',
            'इक्कीस': '21', 'बाईस': '22', 'तेईस': '23', 'चौबीस': '24', 'पच्चीस': '25', 'छब्बीस': '26', 'सत्ताईस': '27', 'अट्ठाईस': '28', 'उनतीस': '29', 'तीस': '30',
            'इकतीस': '31', 'बत्तीस': '32', 'तैंतीस': '33', 'चौंतीस': '34', 'पैंतीस': '35', 'छत्तीस': '36', 'सैंतीस': '37', 'अड़तीस': '38', 'उनतालीस': '39', 'चालीस': '40',
            'इकतालीस': '41', 'बयालीस': '42', 'तैंतालीस': '43', 'चौवालीस': '44', 'पैंतालीस': '45', 'छियालीस': '46', 'सैंतालीस': '47', 'अड़तालीस': '48', 'उनचास': '49', 'पचास': '50',
            'इक्यावन': '51', 'बावन': '52', 'तिरपन': '53', 'चौवन': '54', 'पचपन': '55', 'छप्पन': '56', 'सत्तावन': '57', 'अट्ठावन': '58', 'उनसठ': '59', 'साठ': '60',
            'इकसठ': '61', 'बासठ': '62', 'तिरसठ': '63', 'चौंसठ': '64', 'पैंसठ': '65', 'छियासठ': '66', 'सड़सठ': '67', 'अड़सठ': '68', 'उनहत्तर': '69', 'सत्तर': '70',
            'इकहत्तर': '71', 'बहत्तर': '72', 'तिहत्तर': '73', 'चौहत्तर': '74', 'पचहत्तर': '75', 'छिहत्तर': '76', 'सतहत्तर': '77', 'अठहत्तर': '78', 'उनासी': '79', 'अस्सी': '80',
            'इक्यासी': '81', 'बयासी': '82', 'तिरासी': '83', 'चौरासी': '84', 'पचासी': '85', 'छियासी': '86', 'सत्तासी': '87', 'अट्ठासी': '88', 'नवासी': '89', 'नब्बे': '90',
            'इक्यानबे': '91', 'बानबे': '92', 'तिरानबे': '93', 'चौरानबे': '94', 'पंचानबे': '95', 'छियानबे': '96', 'सत्तानबे': '97', 'अट्ठानबे': '98', 'निन्यानबे': '99', 'सौ': '100',
            'শূন্য': '0', 'এক': '1', 'দুই': '2', 'তিন': '3', 'চার': '4', 'পাঁচ': '5', 'ছয়': '6', 'সাত': '7', 'আট': '8', 'নয়': '9', 'দশ': '10',
            'এগারো': '11', 'বারো': '12', 'তেরো': '13', 'চোদ্দ': '14', 'পনেরো': '15', 'ষোল': '16', 'সতেরো': '17', 'আঠারো': '18', 'উনিশ': '19', 'কুড়ি': '20',
            'একুশ': '21', 'বাইশ': '22', 'তেইশ': '23', 'চব্বিশ': '24', 'পঁচিশ': '25', 'ছাব্বিশ': '26', 'সাতাশ': '27', 'আঠাশ': '28', 'উনત્રીশ': '29', 'ত্রিশ': '30',
            'একત્રીশ': '31', 'বત્રીশ': '32', 'তেત્રીש': '33', 'চৌત્રીশ': '34', 'পঁয়ત્રીশ': '35', 'ছત્રીশ': '36', 'সাঁইત્રીশ': '37', 'আটત્રીশ': '38', 'উনচল্লিশ': '39', 'চল্লিশ': '40',
            'একচল্লিশ': '41', 'বিয়াল্লিশ': '42', 'তেতাল্লিশ': '43', 'চুয়াল্লিশ': '44', 'পঁয়তাল্লিশ': '45', 'ছেচল্লিশ': '46', 'সাতচল্লিশ': '47', 'আটচল্লিশ': '48', 'উনপঞ্চাশ': '49', 'পঞ্চাশ': '50',
            'একান্ন': '51', 'বায়ান্ন': '52', 'তিপ্পান্ন': '53', 'চুয়ান্ন': '54', 'পঞ্চান্ন': '55', 'ছাপ্পান্ন': '56', 'সাতান্ন': '57', 'আটান্ন': '58', 'উনষাট': '59', 'ষাট': '60',
            'একষট্টি': '61', 'বাষট্টি': '62', 'তেষট্টি': '63', 'চৌষট্টি': '64', 'পঁয়ষট্টি': '65', 'ছেষট্টি': '66', 'সাতষট্টি': '67', 'আটষট্টি': '68', 'উনসত্তর': '69', 'সত্তর': '70',
            'একাত্তর': '71', 'বাহাত্তর': '72', 'তিয়াত্তর': '73', 'চুয়াত্তর': '74', 'পঁচাত্তর': '75', 'ছিয়াত্তর': '76', 'সাতাত্তর': '77', 'আটাত্তর': '78', 'উনআশি': '79', 'আশি': '80',
            'একাশি': '81', 'বিরাশি': '82', 'তিরাশি': '83', 'চুরাশি': '84', 'পঁচাশি': '85', 'ছিয়াশি': '86', 'সাতাশি': '87', 'আটাশি': '88', 'উননব্বই': '89', 'নব্বই': '90',
            'একানব্বই': '91', 'বিরানব্বই': '92', 'তিরানব্বই': '93', 'চুরানব্বই': '94', 'পંચানব্বই': '95', 'ছিয়ানব্বই': '96', 'সাতানব্বই': '97', 'আটানব্বই': '98', 'নিরানব্বই': '99', 'একশো': '100'
        };

        const spokenAnswer = transcript.toLowerCase().trim().replace(/[.]$/, '');
        
        const directNumberMatch = spokenAnswer.match(/\d+/);
        if (directNumberMatch) {
            setUserAnswer(directNumberMatch[0]);
            handleSubmit(directNumberMatch[0]);
            return;
        }

        if (wordsToNumbers[spokenAnswer]) {
            const numberStr = wordsToNumbers[spokenAnswer];
            setUserAnswer(numberStr);
            handleSubmit(numberStr);
            return;
        }
        
        setFeedback({ message: t.didntCatch, type: 'incorrect' });
        
    }, [transcript, gameMode, handleSubmit, t]);

    useEffect(() => {
        if (typeof window !== 'undefined' && !problem) {
            generateProblemWithOptions(gameMode, difficultyLevel);
        }
    }, [problem, generateProblemWithOptions, gameMode, difficultyLevel]);

     useEffect(() => {
        if (timerDuration === 0 || isSubmitting) {
            return;
        }

        if (timeLeft <= 0) {
            handleNewProblem(true);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prevTime => prevTime - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, handleNewProblem, timerDuration, isSubmitting]);

    
    useEffect(() => {
        if(feedback.type === 'correct') {
            setIsCorrect(true);
            const timer = setTimeout(() => {
                handleNewProblem();
            }, 3000);
            return () => clearTimeout(timer);
        }
        if (feedback.type === 'incorrect') {
            const timer = setTimeout(() => {
                if (gameMode !== 'multipleChoice' && gameMode !== 'voice') {
                    setUserAnswer('');
                }
                if (gameMode === 'multipleChoice' || gameMode === 'voice') {
                    handleNewProblem(true);
                } else {
                    resetTranscript();
                    setFeedback({message: '', type: 'none'});
                    setIsSubmitting(false); 
                }
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [feedback.type, handleNewProblem, gameMode, resetTranscript]);
    
    const handleDurationChange = (value: string) => {
        const newDuration = parseInt(value, 10);
        setTimerDuration(newDuration);
        setTimeLeft(newDuration);
    };

    const handleGameModeChange = (value: 'input' | 'multipleChoice' | 'voice') => {
        setGameMode(value);
        setScore(0);
        setTotalAttempted(0);
        generateProblemWithOptions(value, difficultyLevel);
        setUserAnswer('');
        setFeedback({message: '', type: 'none'});
        setIsCorrect(false);
        setIsSubmitting(false);
        setTimeLeft(timerDuration);
    };
    
    const handleMcqLevelChange = (value: string) => {
        setMcqLevel(parseInt(value, 10));
        setScore(0);
        setTotalAttempted(0);
        handleNewProblem();
    };

    const handleDifficultyChange = (value: string) => {
        const newLevel = parseInt(value, 10);
        setDifficultyLevel(newLevel);
        setScore(0);
        setTotalAttempted(0);
        generateProblemWithOptions(gameMode, newLevel);
        setUserAnswer('');
        setFeedback({message: '', type: 'none'});
        setIsCorrect(false);
        setIsSubmitting(false);
        setTimeLeft(timerDuration);
    };

    const handleNumberClick = (num: number) => {
        if (userAnswer.length < 3 && !isSubmitting) {
             setUserAnswer(prev => prev + num.toString());
        }
    };

    const handleClear = () => {
        setUserAnswer('');
    };

    const handleDelete = () => {
        setUserAnswer(prev => prev.slice(0, -1));
    };

    const handleOptionClick = (num: number) => {
        if (isSubmitting) return;
        const answerString = num.toString();
        setUserAnswer(answerString);
        handleSubmit(answerString);
    }
    
    const handleLanguageChange = (lang: 'en' | 'hi' | 'bn') => {
        setLanguage(lang);
        handleNewProblem();
    }
    
    const displayNum = (num: number | string | undefined) => {
        if (num === undefined) return '?';
        if (language === 'hi') return toDevanagari(num);
        if (language === 'bn') return toBengaliNumerals(num);
        return num.toString();
    }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/10 dark:to-green-900/10 min-h-screen p-4">
      {audioUrl && <audio ref={audioRef} src={audioUrl} />}
      <div className="container mx-auto py-8">
        <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
            <Button asChild variant="ghost">
                <Link href="/kids-zone/learning-games/math-puzzles">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t.backToPuzzles}
                </Link>
            </Button>
            <div className="flex items-center gap-4 flex-wrap">
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
                <div className="flex items-center gap-2">
                    <Rows className="w-5 h-5 text-slate-600"/>
                    <Label htmlFor="mode-select" className="text-sm font-medium text-slate-700">{t.mode}</Label>
                    <Select value={gameMode} onValueChange={handleGameModeChange}>
                        <SelectTrigger id="mode-select" className="w-[180px] h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="input">{t.inputMode}</SelectItem>
                            <SelectItem value="multipleChoice">{t.mcqMode}</SelectItem>
                             {hasVoiceSupport && <SelectItem value="voice">{t.voiceMode}</SelectItem>}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    <BarChart4 className="w-5 h-5 text-slate-600"/>
                    <Label htmlFor="difficulty-select" className="text-sm font-medium text-slate-700">{t.difficulty}</Label>
                    <Select value={difficultyLevel.toString()} onValueChange={handleDifficultyChange}>
                        <SelectTrigger id="difficulty-select" className="w-[120px] h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[...Array(10)].map((_, i) => (
                                <SelectItem key={i + 1} value={(i + 1).toString()}>{t.level} {displayNum(i + 1)}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {gameMode === 'multipleChoice' && (
                    <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-slate-600"/>
                        <Label htmlFor="level-select" className="text-sm font-medium text-slate-700">{t.options}</Label>
                        <Select value={mcqLevel.toString()} onValueChange={handleMcqLevelChange}>
                            <SelectTrigger id="level-select" className="w-[120px] h-9">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="2">{displayNum(2)}</SelectItem>
                                <SelectItem value="3">{displayNum(3)}</SelectItem>
                                <SelectItem value="4">{displayNum(4)}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}
                
                <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-slate-600"/>
                    <Label htmlFor="timer-select" className="text-sm font-medium text-slate-700">{t.timer}</Label>
                    <Select value={timerDuration.toString()} onValueChange={handleDurationChange}>
                        <SelectTrigger id="timer-select" className="w-[120px] h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">5 {t.seconds}</SelectItem>
                            <SelectItem value="10">10 {t.seconds}</SelectItem>
                            <SelectItem value="15">15 {t.seconds}</SelectItem>
                            <SelectItem value="30">30 {t.seconds}</SelectItem>
                            <SelectItem value="60">60 {t.seconds}</SelectItem>
                            <SelectItem value="90">90 {t.seconds}</SelectItem>
                            <SelectItem value="0">{t.off}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
        <header className="text-center mb-12">
          <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-blue-600">
            {t.pageTitle}
          </h1>
          <p className="text-lg text-blue-700/80 mt-4 max-w-2xl mx-auto">
            {t.pageDescription}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-4xl mx-auto">
            <Card className="w-full shadow-xl bg-white/60 dark:bg-card/60 backdrop-blur-sm">
                <CardHeader>
                    {timerDuration > 0 && (
                         <div className="flex items-center gap-3 mb-4">
                            <Clock className="w-6 h-6 text-slate-500" />
                            <Progress value={(timeLeft / timerDuration) * 100} className="w-full h-4" />
                            <span className="text-xl font-bold text-slate-600">{displayNum(timeLeft)}s</span>
                        </div>
                    )}
                    <CardTitle className="text-center text-4xl md:text-7xl font-bold tracking-wider flex items-center justify-center flex-wrap gap-x-2 md:gap-x-4 gap-y-2 text-slate-700 dark:text-slate-200" style={{fontFamily: "'Lexend', sans-serif"}}>
                        <span>{displayNum(problem?.num1)}</span>
                        <span className="text-blue-500 font-normal">+</span>
                        <span>{displayNum(problem?.num2)}</span>
                        <span className="text-blue-500 font-normal">=</span>
                        <span className="inline-block w-24 h-24 md:w-36 md:h-28 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-5xl md:text-7xl font-mono shadow-inner">
                            {displayNum(userAnswer) || '?'}
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-12 md:h-20 text-center relative flex justify-center items-center">
                    <Confetti active={isCorrect} config={{
                        angle: 90,
                        spread: 360,
                        startVelocity: 40,
                        elementCount: 100,
                        decay: 0.9,
                    }}/>

                {feedback.type === 'correct' && (
                    <div className="flex items-center gap-2 text-green-600 font-bold text-xl md:text-2xl animate-pulse">
                        <Sparkles className="w-6 h-6 md:w-8 md:h-8" /> {feedback.message}
                    </div>
                )}
                {feedback.type === 'incorrect' && (
                    <div className="flex items-center gap-2 text-destructive font-bold text-xl md:text-2xl">
                        <X className="w-6 h-6 md:w-8 md:h-8" /> {feedback.message}
                    </div>
                )}
                </CardContent>
                 <CardContent className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2 text-lg md:text-xl font-semibold text-slate-600 dark:text-slate-300">
                        <Trophy className="w-5 h-5 md:w-6 md:h-6 text-amber-500"/>
                        {t.score} {displayNum(score)} / {displayNum(totalAttempted)} ({displayNum(totalAttempted > 0 ? Math.round((score / totalAttempted) * 100) : 0)}%)
                    </div>
                    <Button variant="outline" onClick={() => handleNewProblem(true)} size="lg">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        {t.newProblem}
                    </Button>
                </CardContent>
            </Card>
            
            {gameMode === 'input' && (
                <NumberPad 
                    onNumberClick={handleNumberClick}
                    onClear={handleClear}
                    onDelete={handleDelete}
                    lang={language}
                />
            )}
            {gameMode === 'multipleChoice' && (
                <MultipleChoicePad 
                    options={options}
                    onOptionClick={handleOptionClick}
                    isSubmitting={isSubmitting}
                    lang={language}
                />
            )}
            {gameMode === 'voice' && (
                <VoiceInputPad 
                    isListening={isListening}
                    startListening={startListening}
                    transcript={transcript}
                    lang={language}
                />
            )}
        </div>
      </div>
    </div>
  );
}
