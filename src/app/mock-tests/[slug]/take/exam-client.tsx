'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Bookmark, Flag, Maximize, Minimize, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

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

// Generate 50 Mock Questions
const MOCK_QUESTIONS: Question[] = Array.from({ length: 50 }).map((_, i) => ({
  id: `q${i + 1}`,
  questionNumber: i + 1,
  text: `Question text is large and readable. Supporting English, Bengali, math equations, images, audio, and tables with comfortable line height. (Sample ${i + 1})`,
  difficulty: i % 3 === 0 ? 'Easy' : i % 3 === 1 ? 'Medium' : 'Hard',
  marks: 2,
  negativeMarks: -0.5,
  options: [
    { id: `o1`, label: 'A', text: 'Option text A' },
    { id: `o2`, label: 'B', text: 'Option text B' },
    { id: `o3`, label: 'C', text: 'Option text C' },
    { id: `o4`, label: 'D', text: 'Option text D' },
  ],
}));

export function ExamClient({ testId }: { testId: string }) {
  const router = useRouter();
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [questionStates, setQuestionStates] = useState<Record<string, QuestionState>>({});

  useEffect(() => {
    const initialStates: Record<string, QuestionState> = {};
    MOCK_QUESTIONS.forEach(q => initialStates[q.id] = 'unvisited');
    initialStates[MOCK_QUESTIONS[0].id] = 'current';
    setQuestionStates(initialStates);
  }, []);

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

  const isLowTime = timeLeft < 600;

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
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
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

  const handleMarkReview = () => updateStateAndNavigate('review', 1);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['1','2','3','4'].includes(e.key)) {
        const optionIndex = parseInt(e.key) - 1;
        const currentQ = MOCK_QUESTIONS[currentQuestionIndex];
        if (currentQ.options[optionIndex]) handleOptionSelect(currentQ.options[optionIndex].id);
      }
      if (e.key.toLowerCase() === 'n') handleSaveAndNext();
      if (e.key.toLowerCase() === 'p' && currentQuestionIndex > 0) handlePrevious();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestionIndex, answers]);

  const currentQ = MOCK_QUESTIONS[currentQuestionIndex];
  const totalAttempted = Object.values(questionStates).filter(s => s === 'answered').length;
  const totalReview = Object.values(questionStates).filter(s => s === 'review').length;
  const totalSkipped = Object.values(questionStates).filter(s => s === 'skipped').length;
  const totalRemaining = MOCK_QUESTIONS.length - totalAttempted - totalSkipped - totalReview;

  return (
    <div className="fixed inset-0 z-[100] bg-[#F8FAFC] flex flex-col h-screen overflow-hidden text-slate-900 font-inter">
      {/* HEADER */}
      <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-6 z-20 flex-shrink-0">
        <div className="flex items-center w-1/3">
          <button onClick={() => router.back()} className="flex items-center text-slate-800 font-medium hover:text-slate-600 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Exit Exam
          </button>
        </div>

        <div className="flex flex-col items-center justify-center w-1/3 text-center">
          <h1 className="font-bold text-lg text-slate-900">SSC CGL Mock Test 1</h1>
          <p className="text-sm text-slate-600">Arithmetic • Question {currentQuestionIndex + 1} of {MOCK_QUESTIONS.length}</p>
        </div>

        <div className="flex items-center justify-end gap-5 w-1/3">
          <div className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full font-medium text-lg border border-green-200">
            {formatTime(timeLeft)}
          </div>
          <div className="flex flex-col items-end text-sm">
            <span className="text-slate-500 font-medium leading-none">Score</span>
            <span className="font-bold text-slate-900 leading-none mt-1">0 / 0</span>
          </div>
          <Button className="bg-[#16A34A] hover:bg-green-700 text-white rounded-full px-6 shadow-sm font-medium">
            Submit
          </Button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col lg:flex-row gap-6 p-6 overflow-hidden max-w-[1920px] mx-auto w-full">
        
        {/* LEFT SIDEBAR (Question Navigator) */}
        <aside className="w-[320px] hidden lg:flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 p-6 overflow-hidden">
          <h2 className="font-bold text-lg mb-4 text-slate-900">Question Navigator</h2>
          
          <div className="space-y-3 mb-4 text-sm font-medium">
            <div className="flex justify-between items-center text-slate-700">
              <span>Total Questions</span>
              <span className="font-bold text-slate-900">{MOCK_QUESTIONS.length}</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span>Answered</span>
              <span className="font-bold text-[#16A34A]">{totalAttempted}</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span>Skipped</span>
              <span className="font-bold text-slate-900">{totalSkipped}</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span>Remaining</span>
              <span className="font-bold text-slate-500">{totalRemaining}</span>
            </div>
          </div>

          <Progress value={(totalAttempted / MOCK_QUESTIONS.length) * 100} className="h-2 mb-6 bg-slate-100 [&>div]:bg-[#3B82F6]" />

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-5 gap-2.5">
              {MOCK_QUESTIONS.map((q, idx) => {
                const state = questionStates[q.id];
                const isCurrent = currentQuestionIndex === idx;
                
                return (
                  <button
                    key={q.id}
                    onClick={() => jumpToQuestion(idx)}
                    className={cn(
                      "w-11 h-11 rounded-lg flex items-center justify-center text-sm font-medium transition-all relative",
                      state === 'answered' && !isCurrent ? "bg-[#16A34A] text-white" : "",
                      state === 'skipped' && !isCurrent ? "bg-slate-200 text-slate-700" : "",
                      state === 'review' && !isCurrent ? "bg-[#F59E0B] text-white" : "",
                      state === 'unvisited' && !isCurrent ? "bg-[#F1F5F9] text-slate-700 border border-slate-200" : "",
                      isCurrent ? "bg-white text-[#2563EB] ring-2 ring-[#2563EB] shadow-sm z-10" : ""
                    )}
                  >
                    {isCurrent && state === 'answered' && <div className="absolute inset-0 bg-green-50 rounded-lg -z-10"></div>}
                    <span className="relative z-10">{idx + 1}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[#E2E8F0]"></div>
              <span>Not visited</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-[#3B82F6] bg-white"></div>
              <span>Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[#16A34A]"></div>
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[#F59E0B]"></div>
              <span>Review</span>
            </div>
          </div>
        </aside>

        {/* CENTER QUESTION AREA */}
        <section className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQ.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col h-full max-w-3xl mx-auto"
              >
                {/* Question Top Row */}
                <div className="flex items-center gap-6 mb-6">
                  <span className="text-lg font-bold text-slate-900">Question {currentQ.questionNumber} of {MOCK_QUESTIONS.length}</span>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500 font-medium">Difficulty</span>
                    <span className={cn(
                      "px-2.5 py-0.5 rounded font-semibold",
                      currentQ.difficulty === 'Easy' ? "bg-green-100 text-green-700" : 
                      currentQ.difficulty === 'Medium' ? "bg-orange-100 text-orange-700" : 
                      "bg-red-100 text-red-700"
                    )}>{currentQ.difficulty}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm ml-auto">
                    <span className="text-slate-500 font-medium">Marks</span>
                    <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded font-semibold border border-green-100 flex items-center gap-1">
                      <span>+{currentQ.marks}</span>
                      <span className="text-slate-300">|</span>
                      <span className="text-red-500">{currentQ.negativeMarks}</span>
                    </span>
                  </div>
                </div>

                <div className="w-full h-px bg-slate-100 mb-8"></div>

                {/* Question Text */}
                <div className="text-xl md:text-[22px] leading-relaxed text-slate-900 mb-10 font-medium">
                  {currentQ.text}
                </div>

                {/* Options UI */}
                <h3 className="font-bold text-slate-900 mb-4">Options UI</h3>
                <div className="flex flex-col gap-3">
                  {currentQ.options.map((opt) => {
                    const isSelected = answers[currentQ.id] === opt.id;
                    
                    return (
                      <motion.button
                        key={opt.id}
                        whileHover={{ scale: 1.005 }}
                        whileTap={{ scale: 0.995 }}
                        onClick={() => handleOptionSelect(opt.id)}
                        className={cn(
                          "flex items-center w-full min-h-[64px] p-4 rounded-xl border-2 text-left transition-colors duration-200",
                          isSelected 
                            ? "border-[#22C55E] bg-[#F0FDF4]" 
                            : "border-slate-200 bg-white hover:border-[#86EFAC] hover:bg-[#F0FDF4]"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm mr-4 transition-colors border",
                          isSelected 
                            ? "border-[#22C55E] text-[#16A34A] bg-white" 
                            : "border-slate-300 text-slate-500 bg-white"
                        )}>
                          {opt.label}
                        </div>
                        <span className={cn(
                          "text-base font-medium",
                          isSelected ? "text-[#16A34A]" : "text-slate-700"
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

          {/* Bottom Action Bar */}
          <div className="p-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <Button 
              variant="outline" 
              onClick={handlePrevious} 
              disabled={currentQuestionIndex === 0}
              className="h-11 px-6 rounded-full font-semibold border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleMarkReview}
                className="h-11 px-6 rounded-full font-semibold bg-[#D97706] hover:bg-amber-700 text-white border-0"
              >
                Mark for Review
              </Button>
              <Button 
                onClick={handleClear}
                className="h-11 px-6 rounded-full font-semibold bg-[#64748B] hover:bg-slate-600 text-white border-0"
              >
                Clear Response
              </Button>
              <Button 
                onClick={handleSaveAndNext}
                className="h-11 px-8 rounded-full font-semibold bg-[#16A34A] hover:bg-green-700 text-white border-0 shadow-sm"
              >
                Save & Next
              </Button>
            </div>
          </div>
        </section>

        {/* RIGHT SIDEBAR */}
        <aside className="w-[320px] hidden xl:flex flex-col gap-5">
          {/* Timer Widget */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative overflow-hidden flex flex-col items-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-red-100/50 rounded-full blur-3xl -z-10"></div>
            <h3 className="font-bold text-slate-900 w-full mb-4">Timer</h3>
            <span className="text-sm font-medium text-slate-700 mb-1">Time Remaining</span>
            <div className={cn(
              "text-[44px] font-bold tracking-tight leading-none",
              isLowTime ? "text-red-600" : "text-red-600/90"
            )}>
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Performance Widget */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-5">Performance</h3>
            <div className="space-y-4 text-sm font-medium text-slate-700">
              <div className="flex items-center justify-between">
                <span>Attempted</span>
                <div className="flex items-center gap-3 w-1/2">
                  <div className="h-1.5 bg-slate-100 flex-1 rounded-full overflow-hidden">
                    <div className="h-full bg-[#3B82F6] rounded-full" style={{ width: `${(totalAttempted / MOCK_QUESTIONS.length) * 100}%` }}></div>
                  </div>
                  <span className="w-6 text-right">{totalAttempted}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Correct</span>
                <div className="flex items-center gap-3 w-1/2">
                  <div className="h-1.5 bg-slate-100 flex-1 rounded-full overflow-hidden">
                    <div className="h-full bg-[#22C55E] rounded-full" style={{ width: '0%' }}></div>
                  </div>
                  <span className="w-6 text-right">0</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Accuracy %</span>
                <div className="flex items-center gap-3 w-1/2">
                  <div className="h-1.5 bg-slate-100 flex-1 rounded-full overflow-hidden">
                    <div className="h-full bg-[#22C55E] rounded-full" style={{ width: '97%' }}></div>
                  </div>
                  <span className="w-6 text-right">97</span>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions Widget */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4">Instructions</h3>
            <ul className="space-y-2.5 text-sm font-medium text-slate-700">
              <li>+2 for correct</li>
              <li>-0.5 negative marking</li>
              <li>Unanswered = 0</li>
            </ul>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4">Quick Actions</h3>
            <div className="flex flex-col gap-2.5">
              <Button variant="outline" className="w-full justify-start h-10 rounded-lg text-slate-700 font-semibold border-slate-200">
                <Bookmark className="w-4 h-4 mr-2" /> Bookmark Question
              </Button>
              <Button variant="outline" className="w-full justify-start h-10 rounded-lg text-slate-700 font-semibold border-slate-200">
                <AlertCircle className="w-4 h-4 mr-2" /> Report Issue
              </Button>
              <Button variant="outline" onClick={toggleFullscreen} className="w-full justify-start h-10 rounded-lg text-slate-700 font-semibold border-slate-200">
                {isFullscreen ? <Minimize className="w-4 h-4 mr-2" /> : <Maximize className="w-4 h-4 mr-2" />} 
                {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              </Button>
            </div>
          </div>
        </aside>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        body { background-color: #F8FAFC !important; overflow: hidden !important; }
        footer { display: none !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
      `}} />
    </div>
  );
}
