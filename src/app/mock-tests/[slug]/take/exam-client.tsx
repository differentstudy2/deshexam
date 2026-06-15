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
  initialQuestions: QuestionBankEntry[];
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export function ExamClient({ mockTest, initialQuestions }: ExamClientProps) {
  const router = useRouter();
  
  const [questions] = useState<QuestionBankEntry[]>(() => {
    let qs = [...initialQuestions];
    
    if (mockTest.shuffleQuestions) {
      qs = shuffleArray(qs);
    }
    
    if (mockTest.shuffleOptions) {
      qs = qs.map(q => {
        if (!q.options) return q;
        const opts = Object.entries(q.options);
        const shuffledOpts = shuffleArray(opts);
        const newOptions = {} as { a: string; b: string; c: string; d: string; e?: string };
        let newCorrectAnswer = q.correctAnswer;
        const oldKeys = ['a', 'b', 'c', 'd', 'e'].slice(0, opts.length) as (keyof typeof newOptions)[];
        
        opts.forEach((opt, index) => {
          const [oldKey, val] = opt;
          const newKey = oldKeys[index];
          if (newKey) newOptions[newKey] = val;
          if (q.correctAnswer === oldKey) {
            newCorrectAnswer = newKey;
          }
        });

        return { ...q, options: newOptions, correctAnswer: newCorrectAnswer };
      });
    }
    return qs;
  });
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeLeft, setTimeLeft] = useState((mockTest.durationMin || 60) * 60);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [questionStates, setQuestionStates] = useState<Record<string, QuestionState>>({});

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [scoreData, setScoreData] = useState({ correct: 0, wrong: 0, skipped: 0, score: 0, total: 0 });
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [wasKicked, setWasKicked] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);

  useEffect(() => {
    const initialStates: Record<string, QuestionState> = {};
    questions.forEach(q => initialStates[q.id] = 'unvisited');
    if (questions.length > 0) {
      initialStates[questions[0].id] = 'current';
    }
    setQuestionStates(initialStates);
  }, [questions]);

  useEffect(() => {
    if (isSubmitted || !hasStarted) return;
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
  }, [isSubmitted, hasStarted]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeft < 600;

  useEffect(() => {
    const handleFullscreenChange = () => {
      const currentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(currentlyFullscreen);

      if (!currentlyFullscreen && hasStarted && !isSubmitted && mockTest.isStrictMode !== false) {
        // Anti-cheat kick out
        setWasKicked(true);
        setHasStarted(false);
        setAnswers({});
        setCurrentQuestionIndex(0);
        setTimeLeft((mockTest.durationMin || 60) * 60);

        const initialStates: Record<string, QuestionState> = {};
        questions.forEach(q => initialStates[q.id] = 'unvisited');
        if (questions.length > 0) {
          initialStates[questions[0].id] = 'current';
        }
        setQuestionStates(initialStates);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // Auto-start if already in fullscreen from previous page
    if (document.fullscreenElement) {
      setIsFullscreen(true);
      setHasStarted(true);
    }

    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [hasStarted, isSubmitted, questions, mockTest.durationMin]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.error(err));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const startExam = async () => {
    if (mockTest.isStrictMode !== false) {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        console.error("Fullscreen request failed:", err);
      }
    }
    setWasKicked(false);
    setHasStarted(true);
  };

  const handleOptionSelect = (optionId: string) => {
    if (questions.length === 0 || isSubmitted) return;
    const qId = questions[currentQuestionIndex].id;
    setAnswers(prev => ({ ...prev, [qId]: optionId }));
  };

  const updateStateAndNavigate = (newState: QuestionState, nextIndexOffset: number = 0) => {
    if (questions.length === 0) return;
    const currentQId = questions[currentQuestionIndex].id;
    
    if (!isSubmitted) {
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
    }

    if (nextIndexOffset !== 0) {
      const nextIndex = currentQuestionIndex + nextIndexOffset;
      if (nextIndex >= 0 && nextIndex < questions.length) {
        setCurrentQuestionIndex(nextIndex);
      }
    }
  };

  const handleSaveAndNext = () => {
    if (questions.length === 0) return;
    if (isSubmitted) {
      updateStateAndNavigate('current', 1);
      return;
    }
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
    if (questions.length === 0) return;
    if (isSubmitted) {
      updateStateAndNavigate('current', -1);
      return;
    }
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
    if (questions.length === 0) return;
    if (!isSubmitted) {
      const currentQId = questions[currentQuestionIndex].id;
      const isAnswered = !!answers[currentQId];
      if (questionStates[currentQId] === 'current') {
        setQuestionStates(prev => ({ ...prev, [currentQId]: isAnswered ? 'answered' : 'skipped' }));
      }
      setQuestionStates(prev => ({ ...prev, [questions[index].id]: 'current' }));
    }
    setCurrentQuestionIndex(index);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (questions.length === 0 || showSubmitConfirm) return;
      if (!isSubmitted && ['1','2','3','4'].includes(e.key)) {
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
  }, [currentQuestionIndex, answers, questions, isSubmitted, showSubmitConfirm, isFullscreen, mockTest.isStrictMode]);

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
    
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(e => console.error(e));
      setIsFullscreen(false);
    }
  };

  const handleExitExam = () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(e => console.error(e));
    }
    router.back();
  };

  const currentQ = questions[currentQuestionIndex];
  const totalAttempted = Object.values(questionStates).filter(s => s === 'answered').length;
  const totalReview = Object.values(questionStates).filter(s => s === 'review').length;
  const totalSkipped = Object.values(questionStates).filter(s => s === 'skipped').length;
  const totalRemaining = questions.length - totalAttempted - totalSkipped - totalReview;

  const liveCorrect = questions.filter(q => {
    const ua = answers[q.id];
    return ua && q.correctAnswer && ua.toLowerCase() === q.correctAnswer.toLowerCase();
  }).length;
  const liveAccuracy = totalAttempted > 0 ? Math.round((liveCorrect / totalAttempted) * 100) : 0;

  if (!questions || questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 text-slate-500">
        No questions found for this test.
      </div>
    );
  }

  if (isSubmitted && !isReviewMode) {
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
            <Button 
              onClick={() => setIsReviewMode(true)}
              className="h-12 px-8 rounded-full font-semibold bg-[#16A34A] hover:bg-green-700 text-white border-0 shadow-sm"
            >
              View Solutions
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-slate-900 font-inter">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-xl border border-slate-200">
          {wasKicked ? (
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          ) : (
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Maximize className="w-8 h-8 text-blue-600" />
            </div>
          )}
          
          <h2 className="text-2xl font-bold mb-3">{mockTest.title}</h2>
          
          {wasKicked ? (
            <p className="text-red-500 font-medium mb-8 bg-red-50 p-4 rounded-xl border border-red-100">
              Exam Terminated! You exited fullscreen mode. All progress has been lost and the exam has been reset. You must start over.
            </p>
          ) : (
            <p className="text-slate-500 mb-8 leading-relaxed">
              {mockTest.isStrictMode !== false 
                ? "This exam must be taken in Fullscreen mode. Once started, the timer will begin and you will be locked into the exam environment." 
                : "You are about to start the mock test. Ensure you have a stable internet connection before beginning."}
            </p>
          )}

          <Button onClick={startExam} className="w-full h-12 text-[15px] font-semibold rounded-full bg-[#16A34A] hover:bg-green-700 text-white shadow-sm">
            {wasKicked ? "Restart Exam" : mockTest.isStrictMode !== false ? "Start Exam in Fullscreen" : "Start Exam"}
          </Button>
        </div>
      </div>
    );
  }

  const currentOptionsKeys = currentQ.options 
    ? Object.keys(currentQ.options).filter(k => currentQ.options![k as keyof typeof currentQ.options] && String(currentQ.options![k as keyof typeof currentQ.options]).trim() !== '').sort()
    : [];

  return (
    <div className="fixed inset-0 z-[100] bg-[#F1F5F9] md:bg-[#F8FAFC] flex flex-col h-screen overflow-hidden text-slate-900 font-inter">

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

      {/* ── MOBILE UI ── */}
      <div className="md:hidden flex flex-col h-full w-full relative">
        {/* Top Section */}
        <div className="pt-4 px-4 flex-shrink-0 z-10 flex flex-col gap-4 mb-4">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                <button onClick={handleExitExam} className="w-10 h-10 bg-white shadow-sm flex items-center justify-center rounded-full border border-slate-200 text-slate-700">
                   <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border border-slate-100 shadow-sm">
                   {/* App Logo Placeholder / Palette */}
                   <div className="w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center relative">
                     <div className="w-2 h-2 bg-blue-400 rounded-full absolute top-1 left-1"></div>
                     <div className="w-2 h-2 bg-green-400 rounded-full absolute bottom-1 right-1"></div>
                   </div>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <button className="text-slate-700">
                   <Bookmark className="w-6 h-6" />
                </button>
                <div className="bg-[#DCFCE7] text-[#166534] px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5 text-sm shadow-sm">
                   <Clock className="w-4 h-4" />
                   <span>{formatTime(timeLeft)}</span>
                </div>
             </div>
          </div>
          {/* Horizontal Navigator Container */}
          <div className="bg-white rounded-[20px] p-2 flex items-center gap-2 overflow-x-auto hide-scrollbar shadow-sm border border-slate-100">
             <div className="text-slate-400 font-bold tracking-widest pl-2 pr-1">...</div>
             {questions.map((q, idx) => {
               const state = questionStates[q.id] || 'unvisited';
               const isCurrent = currentQuestionIndex === idx;
               
               let pillClass = "bg-white border-slate-300 text-slate-700"; // unvisited default
               
               if (isCurrent) {
                 pillClass = "bg-[#166534] border-[#166534] text-white"; // dark green solid
               } else if (state === 'answered') {
                 pillClass = "bg-white border-[#22C55E] text-slate-700"; // white bg, green border
               } else if (state === 'skipped') {
                 pillClass = "bg-white border-[#EF4444] text-slate-700"; // white bg, red border
               } else if (state === 'review') {
                 pillClass = "bg-white border-[#EAB308] text-slate-700"; // white bg, yellow border
               }
               
               return (
                 <button
                   key={q.id}
                   onClick={() => jumpToQuestion(idx)}
                   className={cn(
                     "w-8 h-8 rounded-lg border-2 flex items-center justify-center text-[13px] font-bold flex-shrink-0 transition-colors",
                     pillClass
                   )}
                 >
                   {idx + 1}
                 </button>
               );
             })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-3 pb-24 hide-scrollbar flex flex-col gap-3">
          <div className="bg-white rounded-[24px] p-5 shadow-sm">
             <div 
                className="text-xl font-bold leading-snug text-slate-900"
                dangerouslySetInnerHTML={{ __html: currentQ.questionText || '' }}
             />
          </div>
          <div className="bg-white rounded-[24px] p-4 shadow-sm flex flex-col gap-2">
             {currentOptionsKeys.map((key) => {
               const isSelected = answers[currentQ.id] === key;
               const optionText = (currentQ.options as any)[key];
               
               let optionClass = "border-slate-300 bg-white";
               let bubbleClass = "border-slate-400 text-slate-700 bg-transparent";
               let textClass = "text-slate-800";

               if (isSelected) {
                 optionClass = "border-[#166534] bg-[#bbf7d0]";
                 bubbleClass = "border-[#166534] text-white bg-[#166534]";
                 textClass = "text-slate-900";
               }

               if (isReviewMode) {
                 const isCorrectAnswer = currentQ.correctAnswer && key.toLowerCase() === currentQ.correctAnswer.toLowerCase();
                 if (isCorrectAnswer) {
                   optionClass = "border-[#166534] bg-[#bbf7d0]";
                   bubbleClass = "border-[#166534] text-white bg-[#166534]";
                   textClass = "text-slate-900";
                 } else if (isSelected && !isCorrectAnswer) {
                   optionClass = "border-[#991B1B] bg-[#FECACA]";
                   bubbleClass = "border-[#991B1B] text-white bg-[#991B1B]";
                   textClass = "text-slate-900";
                 } else {
                   optionClass = "border-slate-300 bg-white opacity-60";
                 }
               }
               
               return (
                 <button
                   key={key}
                   onClick={() => handleOptionSelect(key)}
                   className={cn(
                     "flex items-center w-full min-h-[48px] p-2 rounded-[16px] border text-left transition-colors",
                     optionClass
                   )}
                 >
                   <div className={cn(
                     "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-base mr-3 border",
                     bubbleClass
                   )}>
                     {key.toUpperCase()}
                   </div>
                   <span className={cn("text-base", textClass)}>
                     {optionText}
                   </span>
                 </button>
               );
             })}
          </div>

          {isReviewMode && currentQ.explanation && (
            <div className="bg-blue-50 border border-blue-100 rounded-[24px] p-5 shadow-sm mt-1 mb-4">
              <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                Explanation
              </h4>
              <div className="text-blue-800 leading-relaxed text-sm" dangerouslySetInnerHTML={{ __html: currentQ.explanation }} />
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#F1F5F9] via-[#F1F5F9] to-transparent flex items-center justify-between gap-3 z-20 pb-6">
          <button 
            onClick={handlePrevious} 
            disabled={currentQuestionIndex === 0}
            className="h-12 px-5 rounded-full border border-slate-400 bg-white font-medium text-slate-800 whitespace-nowrap disabled:opacity-50"
          >
            Previous
          </button>
          
          {!isReviewMode ? (
            <>
              <button 
                onClick={handleMarkReview} 
                className="h-12 px-6 rounded-full bg-[#FDE047] font-medium text-slate-800 whitespace-nowrap border border-transparent hover:border-amber-400"
              >
                Preview
              </button>
              <button 
                onClick={handleSaveAndNext} 
                className="h-12 px-6 rounded-full bg-[#166534] text-white font-medium flex-1 flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                Save & Next
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>
              </button>
            </>
          ) : (
            <button 
              onClick={handleSaveAndNext}
              disabled={currentQuestionIndex === questions.length - 1}
              className="h-12 flex-1 px-8 rounded-full font-bold bg-[#2563EB] text-white shadow-sm"
            >
              Next Question
            </button>
          )}
        </div>
      </div>

      {/* ── DESKTOP UI (preserved) ── */}
      <div className="hidden md:flex flex-col h-full w-full">
        <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-6 z-30 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-4 w-1/3">
            <button onClick={() => isReviewMode ? setIsReviewMode(false) : handleExitExam()} className="flex items-center text-slate-800 font-medium hover:text-slate-600 transition-colors rounded-full active:bg-slate-100">
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span>{isReviewMode ? "Back to Results" : "Exit"}</span>
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
            <h1 className="font-bold text-lg text-slate-900 line-clamp-1">
              {isReviewMode ? "Reviewing Solutions" : mockTest.title}
            </h1>
            <p className="text-sm text-slate-600">Question {currentQuestionIndex + 1} of {questions.length}</p>
          </div>

          <div className="flex items-center justify-end gap-5 w-1/3">
            {!isReviewMode && (
              <>
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
              </>
            )}
            {isReviewMode && (
               <Button 
                 onClick={() => setIsReviewMode(false)}
                 variant="outline"
                 className="rounded-full px-6 shadow-sm font-medium border-slate-300"
               >
                 Close Review
               </Button>
            )}
          </div>
        </header>

        {!isReviewMode && (
          <div className="h-1 bg-slate-100 flex-shrink-0">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        )}

        <main className="flex-1 flex gap-6 p-6 overflow-hidden max-w-[1920px] mx-auto w-full">
          <aside className="w-[280px] flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 p-5 overflow-hidden">
            <h2 className="font-bold text-lg mb-4 text-slate-900">Question Navigator</h2>
            
            <div className="space-y-3 mb-4 text-sm font-medium">
              <div className="flex justify-between items-center text-slate-700">
                <span>Total Questions</span>
                <span className="font-bold text-slate-900">{questions.length}</span>
              </div>
              {!isReviewMode && (
                <>
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#16A34A] inline-block" />Answered</span>
                    <span className="font-bold text-[#16A34A]">{totalAttempted}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#F59E0B] inline-block" />Review</span>
                    <span className="font-bold text-amber-600">{totalReview}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-slate-200 inline-block" />Skipped</span>
                    <span className="font-bold text-slate-900">{totalSkipped}</span>
                  </div>
                </>
              )}
              {isReviewMode && (
                <>
                  <div className="flex justify-between items-center text-slate-700">
                    <span>Correct</span>
                    <span className="font-bold text-[#16A34A]">{scoreData.correct}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-700">
                    <span>Wrong</span>
                    <span className="font-bold text-red-600">{scoreData.wrong}</span>
                  </div>
                </>
              )}
            </div>

            <Progress value={isReviewMode ? ((scoreData.correct / questions.length) * 100) : ((totalAttempted / questions.length) * 100)} className="h-2 mb-6 bg-slate-100 [&>div]:bg-[#3B82F6]" />

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-5 gap-2.5">
                {questions.map((q, idx) => {
                  const state = questionStates[q.id] || 'unvisited';
                  const isCurrent = currentQuestionIndex === idx;
                  
                  let reviewClass = "";
                  if (isReviewMode) {
                    const uAnswer = answers[q.id];
                    if (!uAnswer) reviewClass = "bg-slate-200 text-slate-700";
                    else if (q.correctAnswer && uAnswer.toLowerCase() === q.correctAnswer.toLowerCase()) reviewClass = "bg-[#16A34A] text-white";
                    else reviewClass = "bg-red-500 text-white";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => jumpToQuestion(idx)}
                      className={cn(
                        "w-11 h-11 rounded-lg flex items-center justify-center text-sm font-medium transition-all relative",
                        isReviewMode ? reviewClass : (
                          state === 'answered' && !isCurrent ? "bg-[#16A34A] text-white" :
                          state === 'skipped' && !isCurrent ? "bg-slate-200 text-slate-700" :
                          state === 'review' && !isCurrent ? "bg-[#F59E0B] text-white" :
                          state === 'unvisited' && !isCurrent ? "bg-[#F1F5F9] text-slate-700 border border-slate-200" : ""
                        ),
                        isCurrent ? "ring-2 ring-offset-1 ring-[#2563EB] shadow-sm z-10" : ""
                      )}
                    >
                      <span className="relative z-10">{idx + 1}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <section className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQ.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col h-full max-w-3xl mx-auto"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-lg font-bold text-slate-900">Question {currentQuestionIndex + 1} of {questions.length}</span>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-500 font-medium">Difficulty:</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded font-bold",
                        currentQ.difficulty === 'Easy' ? "bg-emerald-100 text-emerald-700" : 
                        currentQ.difficulty === 'Medium' ? "bg-amber-100 text-amber-700" : 
                        "bg-red-100 text-red-700"
                      )}>{currentQ.difficulty || 'Medium'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm ml-auto">
                      <span className="text-slate-500 font-medium mr-0.5">Marks:</span>
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-bold border border-slate-200 flex items-center gap-1 text-xs">
                        <span className="text-emerald-600">+{currentQ.marks || 1}</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-red-500">-{mockTest.negativeMarking || 0}</span>
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-px bg-slate-100 mb-4"></div>

                  <div 
                    className="leading-relaxed text-slate-900 mb-6 text-2xl font-semibold"
                    dangerouslySetInnerHTML={{ __html: currentQ.questionText || '' }}
                  />

                  <h3 className="font-bold text-slate-900 mb-3">Options</h3>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {currentOptionsKeys.map((key) => {
                      const isSelected = answers[currentQ.id] === key;
                      const optionText = (currentQ.options as any)[key];
                      
                      let optionClass = isSelected 
                        ? "border-[#22C55E] bg-[#F0FDF4]" 
                        : "border-slate-200 bg-white hover:border-[#86EFAC] hover:bg-[#F0FDF4]";
                      
                      let bubbleClass = isSelected 
                        ? "border-[#22C55E] text-[#16A34A] bg-white shadow-sm" 
                        : "border-slate-300 text-slate-500 bg-slate-50";

                      let textClass = isSelected ? "text-[#16A34A]" : "text-slate-700";

                      if (isReviewMode) {
                        const isCorrectAnswer = currentQ.correctAnswer && key.toLowerCase() === currentQ.correctAnswer.toLowerCase();
                        if (isCorrectAnswer) {
                          optionClass = "border-[#22C55E] bg-[#F0FDF4]";
                          bubbleClass = "border-[#22C55E] text-white bg-[#16A34A]";
                          textClass = "text-[#16A34A]";
                        } else if (isSelected && !isCorrectAnswer) {
                          optionClass = "border-red-500 bg-red-50";
                          bubbleClass = "border-red-500 text-white bg-red-500";
                          textClass = "text-red-700";
                        } else {
                          optionClass = "border-slate-200 bg-white opacity-60";
                          bubbleClass = "border-slate-300 text-slate-400 bg-slate-50";
                          textClass = "text-slate-400";
                        }
                      }
                      
                      return (
                        <motion.button
                          key={key}
                          whileHover={{ scale: isReviewMode ? 1 : 1.01 }}
                          whileTap={{ scale: isReviewMode ? 1 : 0.99 }}
                          onClick={() => handleOptionSelect(key)}
                          className={cn(
                            "flex items-center w-full min-h-[64px] p-3 rounded-xl border-2 text-left transition-colors duration-200",
                            optionClass
                          )}
                        >
                          <div className={cn(
                            "w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-base mr-3 transition-colors border",
                            bubbleClass
                          )}>
                            {key.toUpperCase()}
                          </div>
                          <span className={cn(
                            "text-base font-medium leading-snug",
                            textClass
                          )}>
                            {optionText}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>

                  {isReviewMode && currentQ.explanation && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-blue-50 border border-blue-100 rounded-xl p-5 mt-4"
                    >
                      <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-blue-600" />
                        Explanation
                      </h4>
                      <div 
                        className="text-blue-800 leading-relaxed text-sm"
                        dangerouslySetInnerHTML={{ __html: currentQ.explanation }}
                      />
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="p-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <Button 
                variant="outline" 
                onClick={handlePrevious} 
                disabled={currentQuestionIndex === 0}
                className="h-11 px-6 rounded-full font-semibold border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Previous
              </Button>
              
              {!isReviewMode ? (
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
              ) : (
                <Button 
                  onClick={handleSaveAndNext}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="h-11 px-8 rounded-full font-semibold bg-[#2563EB] hover:bg-blue-700 text-white border-0 shadow-sm"
                >
                  Next Question
                </Button>
              )}
            </div>
          </section>

          <aside className="w-[280px] hidden xl:flex flex-col gap-4 overflow-y-auto custom-scrollbar pb-2 pr-1">
            <div className="bg-[#FFF4F4] rounded-2xl p-6 shadow-sm border border-[#FFE4E4] flex flex-col items-center justify-center">
              <span className="text-[15px] font-medium text-slate-700 mb-1.5">Time Remaining</span>
              <div 
                suppressHydrationWarning
                className={cn(
                  "text-[40px] font-extrabold tracking-tight leading-none",
                  isLowTime ? "text-red-600" : "text-black"
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
                      <div className="h-full bg-[#3B82F6] rounded-full transition-all duration-300" style={{ width: `${(totalAttempted / questions.length) * 100}%` }}></div>
                    </div>
                    <span className="w-6 text-right font-bold">{totalAttempted}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Correct</span>
                  <div className="flex items-center gap-3 w-1/2">
                    <div className="h-1.5 bg-slate-100 flex-1 rounded-full overflow-hidden">
                      <div className="h-full bg-[#22C55E] rounded-full transition-all duration-300" style={{ width: totalAttempted > 0 ? `${(liveCorrect / totalAttempted) * 100}%` : '0%' }}></div>
                    </div>
                    <span className="w-6 text-right font-bold text-emerald-600">{liveCorrect}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Accuracy %</span>
                  <div className="flex items-center gap-3 w-1/2">
                    <div className="h-1.5 bg-slate-100 flex-1 rounded-full overflow-hidden">
                      <div className="h-full bg-[#22C55E] rounded-full transition-all duration-300" style={{ width: `${liveAccuracy}%` }}></div>
                    </div>
                    <span className="w-6 text-right font-bold">{liveAccuracy}</span>
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
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        body { background-color: #F8FAFC !important; overflow: hidden !important; }
        footer { display: none !important; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
      `}} />
    </div>
  );
}
