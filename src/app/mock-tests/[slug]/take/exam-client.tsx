'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Maximize, Minimize, AlertCircle, Bookmark, Flag, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Types for Mock Data
type QuestionState = 'unvisited' | 'answered' | 'skipped' | 'review' | 'current';

interface Option {
  id: string;
  label: string;
  text: string;
}

interface Question {
  id: string;
  questionNumber: number;
  text: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  marks: number;
  negativeMarks: number;
  options: Option[];
}

// Mock Data Generation
const MOCK_QUESTIONS: Question[] = Array.from({ length: 50 }).map((_, i) => ({
  id: `q${i + 1}`,
  questionNumber: i + 1,
  text: `Which legendary superstar is affectionately called 'Big B' in Hindi cinema? (Sample Question ${i + 1})`,
  difficulty: i % 3 === 0 ? 'Easy' : i % 3 === 1 ? 'Medium' : 'Hard',
  marks: 2,
  negativeMarks: -0.5,
  options: [
    { id: `o1`, label: 'A', text: 'Shah Rukh Khan' },
    { id: `o2`, label: 'B', text: 'Amitabh Bachchan' },
    { id: `o3`, label: 'C', text: 'Salman Khan' },
    { id: `o4`, label: 'D', text: 'Rajinikanth' },
  ],
}));

export function ExamClient({ testId }: { testId: string }) {
  const router = useRouter();
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId -> optionId
  const [questionStates, setQuestionStates] = useState<Record<string, QuestionState>>({});

  // Initialize states
  useEffect(() => {
    const initialStates: Record<string, QuestionState> = {};
    MOCK_QUESTIONS.forEach(q => initialStates[q.id] = 'unvisited');
    initialStates[MOCK_QUESTIONS[0].id] = 'current';
    setQuestionStates(initialStates);
  }, []);

  // Timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeft < 600; // < 10 mins

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.error(err));
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleOptionSelect = (optionId: string) => {
    const qId = MOCK_QUESTIONS[currentQuestionIndex].id;
    setAnswers(prev => ({ ...prev, [qId]: optionId }));
  };

  const updateStateAndNavigate = (newState: QuestionState, nextIndexOffset: number = 0) => {
    const currentQId = MOCK_QUESTIONS[currentQuestionIndex].id;
    setQuestionStates(prev => {
      const updated = { ...prev, [currentQId]: newState };
      
      const nextIndex = currentQuestionIndex + nextIndexOffset;
      if (nextIndex >= 0 && nextIndex < MOCK_QUESTIONS.length) {
        const nextQId = MOCK_QUESTIONS[nextIndex].id;
        if (updated[nextQId] !== 'answered' && updated[nextQId] !== 'review') {
          updated[nextQId] = 'current';
        }
      }
      return updated;
    });

    if (nextIndexOffset !== 0) {
      const nextIndex = currentQuestionIndex + nextIndexOffset;
      if (nextIndex >= 0 && nextIndex < MOCK_QUESTIONS.length) {
        setCurrentQuestionIndex(nextIndex);
      }
    }
  };

  const handleSaveAndNext = () => {
    const currentQId = MOCK_QUESTIONS[currentQuestionIndex].id;
    const hasAnswer = !!answers[currentQId];
    updateStateAndNavigate(hasAnswer ? 'answered' : 'skipped', 1);
  };

  const handleMarkReview = () => {
    updateStateAndNavigate('review', 1);
  };

  const handleClear = () => {
    const currentQId = MOCK_QUESTIONS[currentQuestionIndex].id;
    setAnswers(prev => {
      const updated = { ...prev };
      delete updated[currentQId];
      return updated;
    });
  };

  const handlePrevious = () => {
    const prevQId = MOCK_QUESTIONS[currentQuestionIndex].id;
    const isAnswered = !!answers[prevQId];
    const currentState = questionStates[prevQId];
    if (currentState === 'current') {
      updateStateAndNavigate(isAnswered ? 'answered' : 'skipped', -1);
    } else {
       updateStateAndNavigate(currentState, -1);
    }
  };

  const jumpToQuestion = (index: number) => {
    const currentQId = MOCK_QUESTIONS[currentQuestionIndex].id;
    const isAnswered = !!answers[currentQId];
    if (questionStates[currentQId] === 'current') {
      setQuestionStates(prev => ({ ...prev, [currentQId]: isAnswered ? 'answered' : 'skipped' }));
    }
    
    setCurrentQuestionIndex(index);
    setQuestionStates(prev => ({ ...prev, [MOCK_QUESTIONS[index].id]: 'current' }));
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['1','2','3','4'].includes(e.key)) {
        const optionIndex = parseInt(e.key) - 1;
        const currentQ = MOCK_QUESTIONS[currentQuestionIndex];
        if (currentQ.options[optionIndex]) {
          handleOptionSelect(currentQ.options[optionIndex].id);
        }
      }
      if (e.key.toLowerCase() === 'n') {
        handleSaveAndNext();
      }
      if (e.key.toLowerCase() === 'p') {
        if (currentQuestionIndex > 0) handlePrevious();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestionIndex, answers]);

  const currentQ = MOCK_QUESTIONS[currentQuestionIndex];

  const totalAttempted = Object.values(questionStates).filter(s => s === 'answered').length;
  const totalReview = Object.values(questionStates).filter(s => s === 'review').length;
  const totalSkipped = Object.values(questionStates).filter(s => s === 'skipped').length;

  return (
    <div className="fixed inset-0 z-[100] bg-[#F8FAFC] flex flex-col h-screen overflow-hidden text-slate-900 font-inter">
      {/* HEADER */}
      <header className="h-[80px] bg-white shadow-sm flex items-center justify-between px-4 lg:px-6 z-20 flex-shrink-0">
        <div className="flex items-center gap-2 lg:gap-4 w-1/3">
          <Button variant="ghost" className="text-slate-500 hover:text-slate-800 px-2 lg:px-4" onClick={() => router.back()}>
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span className="hidden sm:inline">Exit Exam</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleFullscreen} title="Toggle Fullscreen" className="hidden md:flex">
            {isFullscreen ? <Minimize className="w-5 h-5 text-slate-500" /> : <Maximize className="w-5 h-5 text-slate-500" />}
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center w-1/3 text-center">
          <h1 className="font-bold text-base lg:text-lg font-headline truncate w-full">SSC CGL Mock Test 1</h1>
          <p className="text-xs lg:text-sm text-slate-500 hidden sm:block">Arithmetic • 50 Questions</p>
        </div>

        <div className="flex items-center justify-end gap-3 lg:gap-6 w-1/3">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-xs text-slate-500 uppercase font-semibold">Score</span>
            <span className="font-bold">{(totalAttempted * 2) - (Object.keys(answers).length - totalAttempted) * 0.5}</span>
          </div>
          
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg font-mono text-lg lg:text-xl font-bold transition-colors duration-500",
            isLowTime ? "bg-red-100 text-red-600 animate-pulse" : "bg-slate-100 text-slate-800"
          )}>
            ⏱ {formatTime(timeLeft)}
          </div>

          <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full px-4 lg:px-8 shadow-lg shadow-green-600/20">
            Submit
          </Button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col lg:flex-row gap-6 p-4 lg:p-6 overflow-hidden max-w-[1920px] mx-auto w-full">
        
        {/* LEFT SIDEBAR */}
        <aside className="w-full lg:w-[300px] hidden lg:flex flex-col gap-4 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 overflow-hidden">
          <h2 className="font-bold text-lg mb-2">Questions Overview</h2>
          
          <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <span className="block text-slate-500 mb-1">Total</span>
              <span className="font-bold text-lg">{MOCK_QUESTIONS.length}</span>
            </div>
            <div className="bg-green-50 rounded-xl p-3 border border-green-100">
              <span className="block text-green-600 mb-1">Answered</span>
              <span className="font-bold text-lg text-green-700">{totalAttempted}</span>
            </div>
            <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
              <span className="block text-orange-600 mb-1">Skipped</span>
              <span className="font-bold text-lg text-orange-700">{totalSkipped}</span>
            </div>
            <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
              <span className="block text-purple-600 mb-1">Review</span>
              <span className="font-bold text-lg text-purple-700">{totalReview}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-5 gap-3">
              {MOCK_QUESTIONS.map((q, idx) => {
                const state = questionStates[q.id];
                const isCurrent = currentQuestionIndex === idx;
                
                return (
                  <button
                    key={q.id}
                    onClick={() => jumpToQuestion(idx)}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all relative overflow-hidden",
                      state === 'answered' && !isCurrent ? "bg-green-500 text-white shadow-sm" : "",
                      state === 'skipped' && !isCurrent ? "bg-orange-400 text-white shadow-sm" : "",
                      state === 'review' && !isCurrent ? "bg-purple-500 text-white shadow-sm" : "",
                      state === 'unvisited' && !isCurrent ? "bg-slate-100 text-slate-500 hover:bg-slate-200" : "",
                      isCurrent ? "bg-white text-blue-600 shadow-md ring-[3px] ring-blue-600 z-10" : ""
                    )}
                  >
                    {isCurrent && state === 'answered' && <div className="absolute inset-0 bg-green-100 opacity-50"></div>}
                    <span className="relative z-10">{idx + 1}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* CENTER QUESTION AREA */}
        <section className="flex-1 flex flex-col bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative border border-slate-100">
          
          <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQ.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="flex flex-col h-full max-w-4xl mx-auto"
              >
                {/* Question Header */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-bold text-slate-800">Question {currentQ.questionNumber} <span className="text-slate-400 font-normal">/ {MOCK_QUESTIONS.length}</span></span>
                    <span className={cn(
                      "px-3 py-1 rounded-md uppercase tracking-wider text-xs font-bold border",
                      currentQ.difficulty === 'Easy' ? "border-green-200 text-green-600 bg-green-50" : 
                      currentQ.difficulty === 'Medium' ? "border-orange-200 text-orange-600 bg-orange-50" : 
                      "border-red-200 text-red-600 bg-red-50"
                    )}>
                      {currentQ.difficulty}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg font-mono text-sm font-medium">
                    <span className="text-green-600">+{currentQ.marks}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-red-500">{currentQ.negativeMarks}</span>
                  </div>
                </div>

                {/* Question Body */}
                <div className="text-xl md:text-[28px] leading-relaxed text-slate-800 mb-12 font-medium">
                  {currentQ.text}
                </div>

                {/* Options */}
                <div className="flex flex-col gap-4 mt-auto">
                  {currentQ.options.map((opt) => {
                    const isSelected = answers[currentQ.id] === opt.id;
                    
                    return (
                      <motion.button
                        key={opt.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleOptionSelect(opt.id)}
                        className={cn(
                          "flex items-center w-full min-h-[72px] p-4 rounded-2xl border-2 text-left transition-colors duration-200",
                          isSelected 
                            ? "border-green-500 bg-green-50 shadow-[0_4px_20px_rgba(34,197,94,0.15)]" 
                            : "border-slate-200 bg-white hover:border-green-300 hover:bg-green-50/50 shadow-sm"
                        )}
                      >
                        <div className={cn(
                          "w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg mr-6 transition-colors shadow-sm",
                          isSelected ? "bg-green-500 text-white shadow-green-500/30" : "bg-slate-100 text-slate-500"
                        )}>
                          {opt.label}
                        </div>
                        <span className={cn(
                          "text-lg md:text-xl",
                          isSelected ? "text-green-900 font-medium" : "text-slate-700"
                        )}>
                          {opt.text}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Actions */}
          <div className="h-auto lg:h-[88px] p-4 lg:p-0 bg-slate-50 border-t border-slate-200 flex flex-col lg:flex-row items-center justify-between lg:px-8 flex-shrink-0 gap-4 lg:gap-0">
            <div className="flex items-center gap-3 lg:gap-4 w-full lg:w-auto">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handlePrevious} 
                disabled={currentQuestionIndex === 0}
                className="h-12 flex-1 lg:flex-none lg:px-6 rounded-full font-medium"
              >
                Previous
              </Button>
              <Button 
                variant="ghost" 
                size="lg" 
                onClick={handleClear}
                className="h-12 flex-1 lg:flex-none lg:px-6 rounded-full font-medium text-slate-500 hover:bg-slate-200"
              >
                Clear
              </Button>
            </div>
            
            <div className="flex items-center gap-3 lg:gap-4 w-full lg:w-auto">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleMarkReview}
                className="h-12 flex-1 lg:flex-none lg:px-8 rounded-full font-medium border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800 bg-white shadow-sm"
              >
                <Bookmark className="w-4 h-4 mr-2 hidden sm:block" /> Review
              </Button>
              <Button 
                size="lg" 
                onClick={handleSaveAndNext}
                className="h-12 flex-1 lg:flex-none lg:px-10 rounded-full font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20"
              >
                Save & Next
              </Button>
            </div>
          </div>
        </section>

        {/* RIGHT SIDEBAR */}
        <aside className="w-[360px] hidden xl:flex flex-col gap-5">
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-500" /> Instructions
            </h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                <span>Every correct answer awards <strong className="text-green-600">+2 marks</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                <span>Every wrong answer deducts <strong className="text-red-500">-0.5 marks</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                <span>Skipped questions have <strong>no penalty</strong>.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 mt-auto">
            <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Quick Actions</h3>
            <div className="flex flex-col gap-3">
              <Button variant="outline" className="w-full justify-start h-12 rounded-xl text-slate-600 border-slate-200">
                <Flag className="w-4 h-4 mr-3" /> Report Question Issue
              </Button>
              <Button variant="outline" className="w-full justify-start h-12 rounded-xl text-slate-600 border-slate-200">
                <Pause className="w-4 h-4 mr-3" /> Pause Exam
              </Button>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100">
               <div className="text-xs text-slate-400 mb-3 text-center uppercase tracking-wider font-semibold">Shortcuts</div>
               <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg text-xs">
                    <span className="text-slate-500">Select</span>
                    <kbd className="font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm text-slate-700">1-4</kbd>
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg text-xs">
                    <span className="text-slate-500">Next</span>
                    <kbd className="font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm text-slate-700">N</kbd>
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg text-xs">
                    <span className="text-slate-500">Previous</span>
                    <kbd className="font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm text-slate-700">P</kbd>
                  </div>
               </div>
            </div>
          </div>
        </aside>

      </main>

      {/* Global overrides to hide footer and prevent scroll */}
      <style dangerouslySetInnerHTML={{__html: `
        body { background-color: #F8FAFC !important; overflow: hidden !important; }
        footer { display: none !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
      `}} />
    </div>
  );
}
