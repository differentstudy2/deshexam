'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Bookmark, Flag, Maximize, Minimize, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { MockTest } from '@/lib/assessment-types';
import { QuestionBankEntry } from '@/lib/question-bank-types';

type QuestionState = 'unvisited' | 'answered' | 'skipped' | 'review' | 'current';

interface ExamClientProps {
  mockTest: MockTest;
  questions: QuestionBankEntry[];
}

export function ExamClient({ mockTest, questions }: ExamClientProps) {
  const router = useRouter();
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeLeft, setTimeLeft] = useState((mockTest.durationMin || 60) * 60);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [questionStates, setQuestionStates] = useState<Record<string, QuestionState>>({});

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [scoreData, setScoreData] = useState({ correct: 0, wrong: 0, skipped: 0, score: 0, total: 0 });

  useEffect(() => {
    const initialStates: Record<string, QuestionState> = {};
    questions.forEach(q => initialStates[q.id] = 'unvisited');
    if (questions.length > 0) {
      initialStates[questions[0].id] = 'current';
    }
    setQuestionStates(initialStates);
  }, [questions]);

  useEffect(() => {
    if (isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted]);

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
    if (questions.length === 0 || isSubmitted) return;
    const qId = questions[currentQuestionIndex].id;
    setAnswers(prev => ({ ...prev, [qId]: optionId }));
  };

  const updateStateAndNavigate = (newState: QuestionState, nextIndexOffset: number = 0) => {
    if (questions.length === 0 || isSubmitted) return;
    const currentQId = questions[currentQuestionIndex].id;
    setQuestionStates(prev => {
      const updated = { ...prev, [currentQId]: newState };
      const nextIndex = currentQuestionIndex + nextIndexOffset;
      if (nextIndex >= 0 && nextIndex < questions.length) {
        const nextQId = questions[nextIndex].id;
        if (updated[nextQId] !== 'answered' && updated[nextQId] !== 'review') {
          updated[nextQId] = 'current';
        }
      }
      return updated;
    });

    if (nextIndexOffset !== 0) {
      const nextIndex = currentQuestionIndex + nextIndexOffset;
      if (nextIndex >= 0 && nextIndex < questions.length) {
        setCurrentQuestionIndex(nextIndex);
      }
    }
  };

  const handleSaveAndNext = () => {
    if (questions.length === 0 || isSubmitted) return;
    const currentQId = questions[currentQuestionIndex].id;
    const hasAnswer = !!answers[currentQId];
    updateStateAndNavigate(hasAnswer ? 'answered' : 'skipped', 1);
  };

  const handleMarkReview = () => updateStateAndNavigate('review', 1);

  const handleClear = () => {
    if (questions.length === 0 || isSubmitted) return;
    const currentQId = questions[currentQuestionIndex].id;
    setAnswers(prev => {
      const updated = { ...prev };
      delete updated[currentQId];
      return updated;
    });
  };

  const handlePrevious = () => {
    if (questions.length === 0 || isSubmitted) return;
    const prevQId = questions[currentQuestionIndex].id;
    const isAnswered = !!answers[prevQId];
    const currentState = questionStates[prevQId];
    if (currentState === 'current') {
      updateStateAndNavigate(isAnswered ? 'answered' : 'skipped', -1);
    } else {
       updateStateAndNavigate(currentState, -1);
    }
  };

  const jumpToQuestion = (index: number) => {
    if (questions.length === 0 || isSubmitted) return;
    const currentQId = questions[currentQuestionIndex].id;
    const isAnswered = !!answers[currentQId];
    if (questionStates[currentQId] === 'current') {
      setQuestionStates(prev => ({ ...prev, [currentQId]: isAnswered ? 'answered' : 'skipped' }));
    }
    setCurrentQuestionIndex(index);
    setQuestionStates(prev => ({ ...prev, [questions[index].id]: 'current' }));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (questions.length === 0 || isSubmitted || showSubmitConfirm) return;
      if (['1','2','3','4'].includes(e.key)) {
        const optionIndex = parseInt(e.key) - 1;
        const currentQ = questions[currentQuestionIndex];
        const optionsKeys = currentQ.options ? Object.keys(currentQ.options).sort() : [];
        if (optionsKeys[optionIndex]) {
           handleOptionSelect(optionsKeys[optionIndex]);
        }
      }
      if (e.key.toLowerCase() === 'n') handleSaveAndNext();
      if (e.key.toLowerCase() === 'p' && currentQuestionIndex > 0) handlePrevious();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestionIndex, answers, questions, isSubmitted, showSubmitConfirm]);

  const handleSubmit = () => {
    let correct = 0;
    let wrong = 0;
    let skipped = 0;
    let score = 0;
    
    questions.forEach(q => {
      const userAnswer = answers[q.id];
      if (!userAnswer) {
        skipped += 1;
      } else {
        const isCorrect = q.correctAnswer && userAnswer.toLowerCase() === q.correctAnswer.toLowerCase();
        if (isCorrect) {
          correct += 1;
          score += (q.marks || 1);
        } else {
          wrong += 1;
          score -= (mockTest.negativeMarking || 0);
        }
      }
    });

    setScoreData({ correct, wrong, skipped, score, total: mockTest.totalMarks || questions.length });
    setShowSubmitConfirm(false);
    setIsSubmitted(true);
    
    // Exit fullscreen if active
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(e => console.error(e));
      setIsFullscreen(false);
    }
  };

  const currentQ = questions[currentQuestionIndex];
  const totalAttempted = Object.values(questionStates).filter(s => s === 'answered').length;
  const totalReview = Object.values(questionStates).filter(s => s === 'review').length;
  const totalSkipped = Object.values(questionStates).filter(s => s === 'skipped').length;
  const totalRemaining = questions.length - totalAttempted - totalSkipped - totalReview;

  if (!questions || questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 text-slate-500">
        No questions found for this test.
      </div>
    );
  }

  if (isSubmitted) {
    const accuracy = scoreData.correct + scoreData.wrong > 0 
      ? Math.round((scoreData.correct / (scoreData.correct + scoreData.wrong)) * 100) 
      : 0;

    return (
      <div className="fixed inset-0 z-[100] bg-[#F8FAFC] flex flex-col items-center justify-center p-6 font-inter overflow-y-auto">
        <div className="bg-white rounded-3xl p-10 shadow-xl border border-slate-200 max-w-2xl w-full text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-[#16A34A]"></div>
          
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bookmark className="w-10 h-10 text-[#16A34A]" />
          </div>
          
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Test Submitted!</h1>
          <p className="text-slate-500 mb-10 text-lg">You have successfully completed {mockTest.title}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="text-3xl font-bold text-[#16A34A] mb-1">{scoreData.score.toFixed(2)}</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Score</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="text-3xl font-bold text-slate-900 mb-1">{accuracy}%</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Accuracy</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="text-3xl font-bold text-[#2563EB] mb-1">{scoreData.correct}</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Correct</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="text-3xl font-bold text-[#DC2626] mb-1">{scoreData.wrong}</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Wrong</div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.back()} className="h-12 px-8 rounded-full font-semibold border-slate-300 text-slate-700 hover:bg-slate-50" variant="outline">
              Return to Dashboard
            </Button>
            <Button className="h-12 px-8 rounded-full font-semibold bg-[#16A34A] hover:bg-green-700 text-white border-0 shadow-sm">
              View Solutions
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Parse Options - limit to 4
  const currentOptionsKeys = currentQ.options 
    ? Object.keys(currentQ.options).sort().slice(0, 4) 
    : [];

  return (
    <div className="fixed inset-0 z-[100] bg-[#F8FAFC] flex flex-col h-screen overflow-hidden text-slate-900 font-inter">
      {/* Submit Confirmation Modal */}
      <AnimatePresence>
        {showSubmitConfirm && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Submit Exam?</h2>
              <p className="text-slate-500 mb-6">You have attempted {totalAttempted} out of {questions.length} questions. Once submitted, you cannot change your answers.</p>
              <div className="flex gap-3 w-full">
                <Button onClick={() => setShowSubmitConfirm(false)} variant="outline" className="flex-1 h-11 rounded-xl">Cancel</Button>
                <Button onClick={handleSubmit} className="flex-1 h-11 rounded-xl bg-[#16A34A] hover:bg-green-700 text-white">Yes, Submit</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-6 z-20 flex-shrink-0">
        <div className="flex items-center gap-4 w-1/3">
          <button onClick={() => router.back()} className="flex items-center text-slate-800 font-medium hover:text-slate-600 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Exit Exam
          </button>
          <div className="h-4 w-px bg-slate-200 mx-2"></div>
          <button className="text-slate-500 hover:text-slate-800 transition-colors" title="Bookmark Question">
            <Bookmark className="w-5 h-5" />
          </button>
          <button className="text-slate-500 hover:text-slate-800 transition-colors" title="Report Issue">
            <AlertCircle className="w-5 h-5" />
          </button>
          <button onClick={toggleFullscreen} className="text-slate-500 hover:text-slate-800 transition-colors" title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex flex-col items-center justify-center w-1/3 text-center">
          <h1 className="font-bold text-lg text-slate-900 line-clamp-1">{mockTest.title}</h1>
          <p className="text-sm text-slate-600">Question {currentQuestionIndex + 1} of {questions.length}</p>
        </div>

        <div className="flex items-center justify-end gap-5 w-1/3">
          <div className="bg-[#E6F4EA] text-[#137333] px-3 py-1.5 rounded-full font-semibold text-[15px] border border-[#CEEAD6] flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeLeft)}</span>
          </div>
          <div className="text-[15px] font-semibold text-slate-900">
            Score: {mockTest.totalMarks || 0}
          </div>
          <Button 
            onClick={() => setShowSubmitConfirm(true)}
            className="bg-[#16A34A] hover:bg-green-700 text-white rounded-full px-6 shadow-sm font-medium"
          >
            Submit
          </Button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col lg:flex-row gap-6 p-6 overflow-hidden max-w-[1920px] mx-auto w-full">
        
        {/* LEFT SIDEBAR (Question Navigator) */}
        <aside className="w-[280px] hidden lg:flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 p-5 overflow-hidden">
          <h2 className="font-bold text-lg mb-4 text-slate-900">Question Navigator</h2>
          
          <div className="space-y-3 mb-4 text-sm font-medium">
            <div className="flex justify-between items-center text-slate-700">
              <span>Total Questions</span>
              <span className="font-bold text-slate-900">{questions.length}</span>
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

          <Progress value={(totalAttempted / questions.length) * 100} className="h-2 mb-6 bg-slate-100 [&>div]:bg-[#3B82F6]" />

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-5 gap-2.5">
              {questions.map((q, idx) => {
                const state = questionStates[q.id] || 'unvisited';
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
          <div className="flex-1 overflow-y-auto p-5 md:p-6 custom-scrollbar">
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
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-lg font-bold text-slate-900">Question {currentQuestionIndex + 1} of {questions.length}</span>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500 font-medium">Difficulty</span>
                    <span className={cn(
                      "px-2.5 py-0.5 rounded font-semibold",
                      currentQ.difficulty === 'Easy' ? "bg-green-100 text-green-700" : 
                      currentQ.difficulty === 'Medium' ? "bg-orange-100 text-orange-700" : 
                      "bg-red-100 text-red-700"
                    )}>{currentQ.difficulty || 'Medium'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm ml-auto">
                    <span className="text-slate-500 font-medium mr-1">Marks</span>
                    <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-semibold border border-slate-200 flex items-center gap-1.5 text-xs">
                      <span className="text-slate-600">+{currentQ.marks || 1}</span>
                      <span className="text-slate-300">|</span>
                      <span className="text-slate-600">-{mockTest.negativeMarking || 0}</span>
                    </span>
                  </div>
                </div>

                <div className="w-full h-px bg-slate-100 mb-4"></div>

                {/* Question Text */}
                <div 
                  className="text-xl leading-relaxed text-slate-900 mb-6 font-medium"
                  dangerouslySetInnerHTML={{ __html: currentQ.questionText || '' }}
                />

                {/* Options UI */}
                <h3 className="font-bold text-slate-900 mb-3">Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentOptionsKeys.map((key) => {
                    const isSelected = answers[currentQ.id] === key;
                    const optionText = (currentQ.options as any)[key];
                    
                    return (
                      <motion.button
                        key={key}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleOptionSelect(key)}
                        className={cn(
                          "flex items-center w-full min-h-[64px] p-3 rounded-xl border-2 text-left transition-colors duration-200",
                          isSelected 
                            ? "border-[#22C55E] bg-[#F0FDF4]" 
                            : "border-slate-200 bg-white hover:border-[#86EFAC] hover:bg-[#F0FDF4]"
                        )}
                      >
                        <div className={cn(
                          "w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-base mr-3 transition-colors border",
                          isSelected 
                            ? "border-[#22C55E] text-[#16A34A] bg-white shadow-sm" 
                            : "border-slate-300 text-slate-500 bg-slate-50"
                        )}>
                          {key.toUpperCase()}
                        </div>
                        <span className={cn(
                          "text-base font-medium leading-snug",
                          isSelected ? "text-[#16A34A]" : "text-slate-700"
                        )}>
                          {optionText}
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
        <aside className="w-[280px] hidden xl:flex flex-col gap-4 overflow-y-auto custom-scrollbar pb-2 pr-1">
          {/* Timer Widget */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col items-center">
            <h3 className="font-bold text-slate-900 w-full mb-3">Timer</h3>
            <span className="text-xs font-medium text-slate-500 mb-1">Time Remaining</span>
            <div 
              suppressHydrationWarning
              className={cn(
                "text-3xl font-bold tracking-tight leading-none",
                isLowTime ? "text-red-600" : "text-slate-800"
              )}
            >
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Performance Widget */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4">Performance</h3>
            <div className="space-y-4 text-sm font-medium text-slate-700">
              <div className="flex items-center justify-between">
                <span>Attempted</span>
                <div className="flex items-center gap-3 w-1/2">
                  <div className="h-1.5 bg-slate-100 flex-1 rounded-full overflow-hidden">
                    <div className="h-full bg-[#3B82F6] rounded-full" style={{ width: `${(totalAttempted / questions.length) * 100}%` }}></div>
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
                    <div className="h-full bg-[#22C55E] rounded-full" style={{ width: '0%' }}></div>
                  </div>
                  <span className="w-6 text-right">0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions Widget */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-3">Instructions</h3>
            <ul className="space-y-2 text-sm font-medium text-slate-700">
              <li>+{currentQ.marks || 1} for correct</li>
              <li>-{mockTest.negativeMarking || 0} negative marking</li>
              <li>Unanswered = 0</li>
            </ul>
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
