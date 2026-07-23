'use client'; // trigger recompile

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Bookmark, Flag, Maximize, Minimize, AlertCircle, Clock, Moon, Sun, LayoutGrid, List, Settings, X, ToggleLeft, ToggleRight, Lock, Loader2, Presentation, Target } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { QuestionBankEntry } from '@/lib/question-bank-types';
import { useAuth } from '@/hooks/use-auth';
import { useAuthDialog } from '@/hooks/use-auth-dialog';
import { getUserProfile } from '@/lib/firebase/firestore';
import { saveExamAttempt, getUserExamAttemptsCount, recordQuestionAttempt } from '@/lib/firebase/student-analytics';
import PresentationOverlay from './PresentationOverlay';
import { AdUnit } from '@/components/ui/ad-unit';

type QuestionState = 'unvisited' | 'answered' | 'skipped' | 'review' | 'current';

export interface ExamConfig {
  id: string;
  slug: string;
  title: string;
  durationMin?: number;
  totalMarks?: number;
  negativeMarking?: number;
  attemptsAllowed?: number;
  isStrictMode?: boolean;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  accessType?: 'free' | 'subscription' | 'one_time' | 'both';
  allowedSubscriptionPlans?: string[];
  taxonomyLine?: string;
}

interface ExamClientProps {
  mockTest: ExamConfig;
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
  const { theme, setTheme } = useTheme();
  const { openAuthDialog } = useAuthDialog();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

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
  const [showPresentationMode, setShowPresentationMode] = useState(false);
  const [autoSaveNext, setAutoSaveNext] = useState(false);
  const [optionsLayout, setOptionsLayout] = useState<'list' | 'grid'>('list');
  const [showLayoutSettings, setShowLayoutSettings] = useState(false);

  // --- ACCESS CONTROL STATE ---
  const { user, loading: authLoading } = useAuth();
  const [profileLoading, setProfileLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [requiresLogin, setRequiresLogin] = useState(false);
  const [attemptsExceeded, setAttemptsExceeded] = useState(false);
  const [userAttemptCount, setUserAttemptCount] = useState(0);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setRequiresLogin(true);
      setProfileLoading(false);
      return;
    }

    // For free tests, user is logged in
    if (mockTest.accessType === 'free' || !mockTest.accessType) {
      setHasAccess(true);

      if (mockTest.attemptsAllowed && mockTest.attemptsAllowed > 0) {
        getUserExamAttemptsCount(user.uid, mockTest.id).then(count => {
          setUserAttemptCount(count);
          if (count >= mockTest.attemptsAllowed!) setAttemptsExceeded(true);
        }).catch(console.error);
      }

      setProfileLoading(false);
      return;
    }

    getUserProfile(user.uid).then(profile => {
      const userPlan = profile?.subscriptionPlan || null;
      const purchasedTests = profile?.purchasedTests || [];
      const allowedPlans = mockTest.allowedSubscriptionPlans || [];

      let accessGranted = false;

      if (userPlan === 'pro') {
        accessGranted = true;
      } else if ((mockTest.accessType === 'subscription' || mockTest.accessType === 'both') && userPlan && allowedPlans.includes(userPlan)) {
        accessGranted = true;
      } else if ((mockTest.accessType === 'one_time' || mockTest.accessType === 'both') && purchasedTests.includes(mockTest.slug)) {
        accessGranted = true;
      }

      setHasAccess(accessGranted);

      if (accessGranted && mockTest.attemptsAllowed && mockTest.attemptsAllowed > 0) {
        // Enforce attempts for logged-in user
        getUserExamAttemptsCount(user.uid, mockTest.id).then(count => {
          setUserAttemptCount(count);
          if (count >= mockTest.attemptsAllowed!) {
            setAttemptsExceeded(true);
          }
        }).catch(console.error);
      }

    }).catch(console.error).finally(() => {
      setProfileLoading(false);
    });
  }, [user, authLoading, mockTest.accessType, mockTest.allowedSubscriptionPlans, mockTest.slug, mockTest.attemptsAllowed, mockTest.id]);

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
    const triggerAntiCheat = () => {
      if (hasStarted && !isSubmitted && mockTest.isStrictMode !== false) {
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

    const handleFullscreenChange = () => {
      const currentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(currentlyFullscreen);

      if (!currentlyFullscreen) {
        triggerAntiCheat();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerAntiCheat();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Auto-start if already in fullscreen from previous page
    if (document.fullscreenElement) {
      setIsFullscreen(true);
      setHasStarted(true);
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
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

    if (autoSaveNext) {
      setTimeout(() => {
        if (!isSubmitted) {
          updateStateAndNavigate('answered', 1);
        }
      }, 400);
    }
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

      const key = e.key.toLowerCase();

      if (!isSubmitted && ['a', 'b', 'c', 'd', 'e'].includes(key)) {
        const currentQ = questions[currentQuestionIndex];
        const optionsKeys = currentQ.options ? Object.keys(currentQ.options).sort() : [];
        const index = key.charCodeAt(0) - 97; // 'a' is 97
        if (optionsKeys[index]) {
          handleOptionSelect(optionsKeys[index]);
        }
      }

      if (key === 'n') handleSaveAndNext();
      if (key === 'p' && currentQuestionIndex > 0) handlePrevious();
      if (key === 'm' && !isSubmitted) handleMarkReview();
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
        if (user) recordQuestionAttempt(user.uid, q.id, '', 'skipped').catch(console.error);
      } else {
        const isCorrect = q.correctAnswer && userAnswer.toLowerCase() === q.correctAnswer.toLowerCase();
        if (isCorrect) {
          correct += 1;
          score += (q.marks || 1);
          if (user) recordQuestionAttempt(user.uid, q.id, userAnswer, 'correct').catch(console.error);
        } else {
          wrong += 1;
          score -= (mockTest.negativeMarking || 0);
          if (user) recordQuestionAttempt(user.uid, q.id, userAnswer, 'wrong').catch(console.error);
        }
      }
    });

    const finalScoreData = { correct, wrong, skipped, score, total: mockTest.totalMarks || questions.length };
    setScoreData(finalScoreData);
    setShowSubmitConfirm(false);
    setIsSubmitted(true);

    // Save attempt to Firebase
    if (user) {
      saveExamAttempt(user.uid, mockTest.id, finalScoreData).catch(console.error);
    }

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

  if (authLoading || profileLoading) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#F8FAFC] dark:bg-[#0f172a] flex flex-col items-center justify-center p-6 text-slate-900 font-inter transition-colors duration-300">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-slate-500 font-medium text-lg">Checking exam access...</p>
        </div>
      </div>
    );
  }

  if (requiresLogin) {
    return (
      <div className="fixed inset-0 z-40 bg-[#f8fbff] dark:bg-[#041128] flex flex-col items-center justify-center p-6 text-slate-900 font-sans transition-colors duration-300 overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-400/20 blur-[120px] pointer-events-none" />

        <div className="max-w-[420px] w-full relative z-10">
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-[2.5rem] p-10 text-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/60 dark:border-slate-700/50 transition-all duration-300 group">

            <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner border border-white/80 dark:border-white/5 transform group-hover:scale-105 transition-transform duration-500 ease-out rotate-3 group-hover:rotate-0">
              <Lock className="w-10 h-10 text-blue-600 dark:text-blue-400 drop-shadow-sm" strokeWidth={1.5} />
            </div>

            <h2 className="text-[1.75rem] font-extrabold mb-4 text-slate-900 dark:text-slate-50 tracking-tight transition-colors">
              Authentication Required
            </h2>
            <p className="text-[15px] text-slate-500 dark:text-slate-400 mb-10 leading-relaxed transition-colors px-2">
              You need to be logged in to your DeshExam Academy account to take this mock test.
            </p>

            <Button
              onClick={() => openAuthDialog('sign-in')}
              className="w-full h-14 text-[16px] font-bold rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] hover:shadow-[0_12px_25px_-6px_rgba(37,99,235,0.5)] transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Log In or Sign Up
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="fixed inset-0 z-40 bg-[#f8fbff] dark:bg-[#041128] flex flex-col items-center justify-center p-6 text-slate-900 font-sans transition-colors duration-300 overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-amber-400/15 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-orange-400/15 blur-[120px] pointer-events-none" />

        <div className="max-w-[420px] w-full relative z-10">
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-[2.5rem] p-10 text-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/60 dark:border-slate-700/50 transition-all duration-300 group">

            <div className="w-24 h-24 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner border border-white/80 dark:border-white/5 transform group-hover:scale-105 transition-transform duration-500 ease-out -rotate-3 group-hover:rotate-0">
              <Lock className="w-10 h-10 text-amber-500 dark:text-amber-400 drop-shadow-sm" strokeWidth={1.5} />
            </div>

            <h2 className="text-[1.75rem] font-extrabold mb-4 text-slate-900 dark:text-slate-50 tracking-tight transition-colors">
              Access Denied
            </h2>
            <p className="text-[15px] text-slate-500 dark:text-slate-400 mb-10 leading-relaxed transition-colors px-2">
              You do not have access to this mock test. Please upgrade your subscription or purchase this test to proceed.
            </p>

            <Button
              onClick={() => router.replace(`/mock-tests/${mockTest.slug}`)}
              className="w-full h-14 text-[16px] font-bold rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-[0_8px_20px_-6px_rgba(245,158,11,0.4)] hover:shadow-[0_12px_25px_-6px_rgba(245,158,11,0.5)] transition-all duration-300 transform hover:-translate-y-0.5"
            >
              View Access Options
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (attemptsExceeded) {
    return (
      <div className="fixed inset-0 z-40 bg-[#f8fbff] dark:bg-[#041128] flex flex-col items-center justify-center p-6 text-slate-900 font-sans transition-colors duration-300 overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-red-400/15 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-rose-400/15 blur-[120px] pointer-events-none" />

        <div className="max-w-[420px] w-full relative z-10">
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-[2.5rem] p-10 text-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/60 dark:border-slate-700/50 transition-all duration-300 group">

            <div className="w-24 h-24 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner border border-white/80 dark:border-white/5 transform group-hover:scale-105 transition-transform duration-500 ease-out rotate-3 group-hover:rotate-0">
              <AlertCircle className="w-10 h-10 text-red-500 drop-shadow-sm" strokeWidth={1.5} />
            </div>

            <h2 className="text-[1.75rem] font-extrabold mb-4 text-slate-900 dark:text-slate-50 tracking-tight transition-colors">
              Attempts Exceeded
            </h2>
            <p className="text-[15px] text-slate-500 dark:text-slate-400 mb-10 leading-relaxed transition-colors px-2">
              You have reached the maximum allowed attempts ({userAttemptCount}/{mockTest.attemptsAllowed}) for this mock test.
            </p>

            <Button
              onClick={() => router.replace(`/mock-tests`)}
              className="w-full h-14 text-[16px] font-bold rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white shadow-[0_8px_20px_-6px_rgba(15,23,42,0.4)] dark:shadow-[0_8px_20px_-6px_rgba(255,255,255,0.4)] transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 transition-colors duration-300">
        No questions found for this test.
      </div>
    );
  }

  if (isSubmitted && !isReviewMode) {
    const accuracy = scoreData.correct + scoreData.wrong > 0
      ? Math.round((scoreData.correct / (scoreData.correct + scoreData.wrong)) * 100)
      : 0;

    return (
      <div className="fixed inset-0 z-40 bg-[#F8FAFC] dark:bg-[#0f172a] flex flex-col items-center justify-center p-6 font-inter overflow-y-auto transition-colors duration-300">
        <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-10 shadow-xl border border-slate-200 dark:border-slate-700 max-w-2xl w-full text-center relative overflow-hidden transition-colors duration-300">
          <div className="absolute top-0 left-0 w-full h-2 bg-[#16A34A] dark:bg-emerald-600"></div>

          <div className="w-20 h-20 bg-green-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors">
            <Bookmark className="w-10 h-10 text-[#16A34A] dark:text-emerald-500" />
          </div>

          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2 transition-colors">Test Submitted!</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-10 text-lg transition-colors">You have successfully completed {mockTest.title}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 transition-colors">
              <div className="text-3xl font-bold text-[#16A34A] dark:text-emerald-500 mb-1">{scoreData.score.toFixed(2)}</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors">Score</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 transition-colors">
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-1 transition-colors">{accuracy}%</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors">Accuracy</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 transition-colors">
              <div className="text-3xl font-bold text-[#2563EB] dark:text-blue-500 mb-1">{scoreData.correct}</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors">Correct</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 transition-colors">
              <div className="text-3xl font-bold text-[#DC2626] dark:text-red-500 mb-1">{scoreData.wrong}</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors">Wrong</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center items-center w-full max-w-xl mx-auto">
            <Button onClick={() => router.back()} className="w-full sm:w-auto h-12 px-8 rounded-full font-semibold border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" variant="outline">
              Return to Dashboard
            </Button>
            <Button onClick={() => window.location.reload()} className="w-full sm:w-auto h-12 px-8 rounded-full font-semibold border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" variant="outline">
              Retake
            </Button>
            <Button
              onClick={() => setIsReviewMode(true)}
              className="w-full sm:w-auto h-12 px-8 rounded-full font-semibold bg-[#16A34A] dark:bg-emerald-600 hover:bg-green-700 dark:hover:bg-emerald-700 text-white border-0 shadow-sm transition-colors"
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
      <div className="fixed inset-0 z-[100] bg-[#F8FAFC] dark:bg-[#0f172a] flex flex-col items-center justify-center p-6 text-slate-900 font-inter transition-colors duration-300">
        <div className="max-w-md w-full bg-white dark:bg-[#1e293b] rounded-3xl p-8 text-center shadow-xl border border-slate-200 dark:border-slate-700 transition-colors duration-300">
          {wasKicked ? (
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-500" />
            </div>
          ) : (
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors">
              <Maximize className="w-8 h-8 text-blue-600 dark:text-blue-500" />
            </div>
          )}

          <h2 className="text-2xl font-bold mb-3 dark:text-slate-50 transition-colors">{mockTest.title}</h2>

          {wasKicked ? (
            <p className="text-red-500 dark:text-red-400 font-medium mb-8 bg-red-50 dark:bg-red-900/30 p-4 rounded-xl border border-red-100 dark:border-red-900/50 transition-colors">
              Exam Terminated! You exited fullscreen mode. All progress has been lost and the exam has been reset. You must start over.
            </p>
          ) : (
            <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed transition-colors">
              {mockTest.isStrictMode !== false
                ? "This exam must be taken in Fullscreen mode. Once started, the timer will begin and you will be locked into the exam environment."
                : "You are about to start the mock test. Ensure you have a stable internet connection before beginning."}
            </p>
          )}

          <Button onClick={startExam} className="w-full h-12 text-[15px] font-semibold rounded-full bg-[#16A34A] dark:bg-emerald-600 hover:bg-green-700 dark:hover:bg-emerald-700 text-white shadow-sm transition-colors">
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
    <>
      <div className="fixed inset-0 z-[100] bg-[#F1F5F9] md:bg-[#F8FAFC] dark:bg-[#0f172a] md:dark:bg-[#0f172a] flex flex-col h-[100dvh] overflow-hidden text-slate-900 dark:text-slate-50 font-inter transition-colors duration-300">

        <AnimatePresence>
          {showSubmitConfirm && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-colors"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-[#1e293b] rounded-2xl p-8 max-w-md w-full shadow-2xl transition-colors"
              >
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2 transition-colors">Submit Exam?</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6 transition-colors">You have attempted {totalAttempted} out of {questions.length} questions. Once submitted, you cannot change your answers.</p>
                <div className="flex gap-3 w-full">
                  <Button onClick={() => setShowSubmitConfirm(false)} variant="outline" className="flex-1 h-11 rounded-xl dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">Cancel</Button>
                  <Button onClick={handleSubmit} className="flex-1 h-11 rounded-xl bg-[#16A34A] dark:bg-emerald-600 hover:bg-green-700 dark:hover:bg-emerald-700 text-white transition-colors">Yes, Submit</Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── MOBILE UI ── */}
        <div className="md:hidden flex flex-col h-full w-full relative">
          {/* Top Section */}
          <div className="pt-4 px-2 flex-shrink-0 z-10 flex flex-col gap-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button onClick={handleExitExam} className="w-10 h-10 bg-white dark:bg-[#1e293b] shadow-sm flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm transition-colors flex-shrink-0">
                    <img src="/favicon-bg.png" alt="DeshExam Logo" className="w-full h-full object-cover m-0 !mb-0 rounded-none" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="font-extrabold text-[15px] leading-[1.1] tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-500 dark:from-blue-400 dark:to-emerald-400">
                      Desh Exam
                    </span>
                    <span className="text-[8px] font-extrabold tracking-[0.25em] text-slate-500 dark:text-slate-400 uppercase leading-none mt-0.5 ml-[1px]">
                      Academy
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={toggleFullscreen}>
                  {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </button>
                <button onClick={toggleTheme}>
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button onClick={() => setShowMobileNav(true)}>
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button onClick={() => setShowPresentationMode(true)} title="Presentation Mode">
                  <Presentation className="w-5 h-5" />
                </button>
                {!isReviewMode && (
                  <button
                    onClick={() => setAutoSaveNext(!autoSaveNext)}
                    className={cn(
                      "flex items-center justify-center p-1.5 rounded-md border transition-colors",
                      autoSaveNext
                        ? "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                        : "bg-white dark:bg-[#1e293b] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                    )}
                    title="Auto Save & Next"
                  >
                    {autoSaveNext ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                )}
              </div>
            </div>
            {/* Horizontal Navigator Container */}
            <div className="relative mt-2">
              {!isReviewMode && (
                <div className="absolute top-[0.4rem] right-1 z-30 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded-full shadow-sm border border-slate-200/50 dark:border-slate-700/50 font-bold flex items-center gap-1.5 text-xs transform -translate-y-full transition-colors">
                  <Clock className="w-3.5 h-3.5 text-[#16A34A] dark:text-emerald-500" />
                  <span>{formatTime(timeLeft)}</span>
                </div>
              )}
              <div className="bg-gradient-to-r from-white via-slate-50 to-white dark:from-[#1e293b] dark:via-[#1e293b] dark:to-[#1e293b] rounded-2xl p-2.5 flex items-center justify-center gap-2 overflow-x-auto hide-scrollbar shadow-sm border border-white/60 dark:border-slate-700/50 transition-colors">
                {questions.map((q, idx) => {
                  const state = questionStates[q.id] || 'unvisited';
                  const isCurrent = currentQuestionIndex === idx;

                  if (Math.abs(idx - currentQuestionIndex) > 3 && idx !== 0 && idx !== questions.length - 1) {
                    if (idx === 1 || idx === questions.length - 2) return <div key={q.id} className="text-[#0B476D] dark:text-slate-500 font-bold tracking-widest px-1 transition-colors">...</div>;
                    return null;
                  }

                  let pillClass = "bg-white dark:bg-[#1e293b] border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"; // unvisited default

                  if (isCurrent) {
                    pillClass = "bg-[#166534] dark:bg-emerald-600 border-transparent text-white dark:text-emerald-50 shadow-sm"; // dark green solid
                  } else if (isReviewMode) {
                    const uAnswer = answers[q.id];
                    if (uAnswer && q.correctAnswer && uAnswer.toLowerCase() === q.correctAnswer.toLowerCase()) pillClass = "bg-white dark:bg-[#1e293b] border-[#16A34A] text-[#16A34A] dark:text-emerald-400";
                    else if (uAnswer) pillClass = "bg-white dark:bg-[#1e293b] border-[#DC2626] text-[#DC2626] dark:text-red-400";
                  } else if (state === 'answered') {
                    pillClass = "bg-white dark:bg-[#1e293b] border-[#16A34A] text-[#16A34A] dark:text-emerald-400";
                  } else if (state === 'skipped') {
                    pillClass = "bg-white dark:bg-[#1e293b] border-[#DC2626] text-[#DC2626] dark:text-red-400";
                  } else if (state === 'review') {
                    pillClass = "bg-white dark:bg-[#1e293b] border-[#D97706] text-[#D97706] dark:text-amber-400";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => jumpToQuestion(idx)}
                      className={cn(
                        "w-9 h-9 rounded-[8px] border flex items-center justify-center text-[14px] font-bold flex-shrink-0 transition-colors",
                        pillClass
                      )}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto px-2 pb-24 hide-scrollbar flex flex-col gap-3">
            <div className="bg-gradient-to-br from-white to-blue-50/30 dark:from-[#1e293b] dark:to-slate-900/80 rounded-2xl p-5 shadow-md border border-white/60 dark:border-slate-700/50 transition-colors">
              <div
                className="text-xl font-bold leading-snug text-slate-900 dark:text-slate-50 transition-colors"
                dangerouslySetInnerHTML={{ __html: currentQ.questionText || '' }}
              />
            </div>
            <div className="bg-gradient-to-br from-white to-slate-50/50 dark:from-[#1e293b] dark:to-slate-900/80 rounded-2xl p-4 shadow-sm border border-white/60 dark:border-slate-700/50 flex flex-col gap-2 transition-colors">
              {currentOptionsKeys.map((key) => {
                const isSelected = answers[currentQ.id] === key;
                const optionText = (currentQ.options as any)[key];

                let optionClass = "border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] hover:bg-blue-50/50 hover:border-blue-300 dark:hover:bg-slate-800 dark:hover:border-slate-500 hover:shadow-sm";
                let bubbleClass = "border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800";
                let textClass = "text-slate-700 dark:text-slate-200 font-medium";

                if (isSelected) {
                  optionClass = "border-emerald-400 dark:border-emerald-500/50 bg-gradient-to-r from-emerald-50 to-teal-50/50 dark:from-emerald-900/40 dark:to-teal-900/20 shadow-sm ring-1 ring-emerald-500/20";
                  bubbleClass = "border-transparent text-white bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm";
                  textClass = "text-emerald-900 dark:text-emerald-100 font-bold";
                }

                if (isReviewMode) {
                  const isCorrectAnswer = currentQ.correctAnswer && key.toLowerCase() === currentQ.correctAnswer.toLowerCase();
                  if (isCorrectAnswer) {
                    optionClass = "border-emerald-400 dark:border-emerald-500/50 bg-gradient-to-r from-emerald-50 to-teal-50/50 dark:from-emerald-900/40 dark:to-teal-900/20 shadow-sm ring-1 ring-emerald-500/20";
                    bubbleClass = "border-transparent text-white bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm";
                    textClass = "text-emerald-900 dark:text-emerald-100 font-bold";
                  } else if (isSelected && !isCorrectAnswer) {
                    optionClass = "border-red-400 dark:border-red-500/50 bg-gradient-to-r from-red-50 to-rose-50/50 dark:from-red-900/40 dark:to-rose-900/20 shadow-sm ring-1 ring-red-500/20";
                    bubbleClass = "border-transparent text-white bg-gradient-to-br from-red-500 to-rose-600 shadow-sm";
                    textClass = "text-red-900 dark:text-red-100 font-bold";
                  } else {
                    optionClass = "border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] opacity-60";
                  }
                }

                return (
                  <button
                    key={key}
                    onClick={() => handleOptionSelect(key)}
                    className={cn(
                      "flex items-center w-full min-h-[48px] p-2 rounded-[16px] border text-left transition-all duration-200",
                      optionClass
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-base mr-3 border transition-colors",
                      bubbleClass
                    )}>
                      {key.toUpperCase()}
                    </div>
                    <span className={cn("text-[18px] transition-colors", textClass)}>
                      {optionText}
                    </span>
                  </button>
                );
              })}
            </div>

            {isReviewMode && currentQ.explanation && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-[8px] p-5 shadow-sm mt-1 mb-4 transition-colors">
                <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2 transition-colors">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Explanation
                </h4>
                <div className="text-blue-800 dark:text-blue-200 leading-relaxed text-sm transition-colors" dangerouslySetInnerHTML={{ __html: currentQ.explanation }} />
              </div>
            )}
          </div>



          {/* Floating Submit Button (Mobile) */}
          {!isReviewMode && (
            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="fixed bottom-24 right-4 z-30 flex items-center justify-center gap-1.5 bg-[#16A34A] dark:bg-emerald-600 text-white px-4 py-2.5 rounded-full shadow-lg shadow-green-900/20 dark:shadow-emerald-900/40 border border-white/20 font-bold text-sm transition-transform active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              Submit
            </button>
          )}

          {/* Bottom Bar */}
          <div className="fixed bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-[#F1F5F9] dark:from-[#0f172a] via-[#F1F5F9] dark:via-[#0f172a] to-transparent flex items-center justify-between gap-1.5 sm:gap-3 z-20 pb-5 sm:pb-6 transition-colors">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="h-10 px-3 sm:px-4 rounded-full border border-slate-400 dark:border-slate-600 bg-white dark:bg-[#1e293b] font-semibold text-[13px] sm:text-sm text-slate-800 dark:text-slate-200 whitespace-nowrap disabled:opacity-50 transition-colors flex-shrink-0"
            >
              Previous
            </button>

            {!isReviewMode ? (
              <>
                <button
                  onClick={handleMarkReview}
                  className="h-10 px-3 sm:px-4 rounded-full bg-[#FDE047] dark:bg-amber-500/90 font-semibold text-[13px] sm:text-sm text-slate-800 dark:text-slate-900 whitespace-nowrap border border-transparent hover:border-amber-400 dark:hover:border-amber-400 transition-colors flex-shrink-0"
                >
                  Preview
                </button>
                <button
                  onClick={handleSaveAndNext}
                  className="h-10 px-3 sm:px-4 rounded-full bg-[#166534] dark:bg-emerald-600 text-white font-semibold text-[13px] sm:text-sm flex-1 flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap transition-colors"
                >
                  Save & Next
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 sm:w-5 sm:h-5"><path d="M7 17 17 7" /><path d="M7 7h10v10" /></svg>
                </button>
              </>
            ) : (
              <button
                onClick={handleSaveAndNext}
                disabled={currentQuestionIndex === questions.length - 1}
                className="h-10 flex-1 px-4 sm:px-6 rounded-full font-bold text-[13px] sm:text-sm bg-[#2563EB] dark:bg-blue-600 text-white shadow-sm transition-colors"
              >
                Next Question
              </button>
            )}
          </div>
          {/* Mobile Question Nav Popup */}
          <AnimatePresence>
            {showMobileNav && (
              <motion.div
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed inset-0 z-[100] bg-white dark:bg-[#0f172a] flex flex-col"
              >
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
                  <h2 className="font-bold text-lg text-slate-900 dark:text-slate-50">All Questions</h2>
                  <button onClick={() => setShowMobileNav(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                  <div className="grid grid-cols-7 gap-1.5">
                    {questions.map((q, idx) => {
                      const state = questionStates[q.id] || 'unvisited';
                      const isCurrent = currentQuestionIndex === idx;

                      let pillClass = "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500";
                      if (isCurrent) {
                        pillClass = "bg-[#166534] dark:bg-emerald-600 border-[#166534] dark:border-emerald-600 text-white";
                      } else if (isReviewMode) {
                        const uAnswer = answers[q.id];
                        if (uAnswer && q.correctAnswer && uAnswer.toLowerCase() === q.correctAnswer.toLowerCase()) pillClass = "bg-[#DCFCE7] dark:bg-[#064e3b] border-[#22C55E] text-[#166534] dark:text-[#34d399]";
                        else if (uAnswer) pillClass = "bg-[#FEE2E2] dark:bg-[#7f1d1d] border-[#EF4444] text-[#B91C1C] dark:text-[#fca5a5]";
                      } else if (state === 'answered') {
                        pillClass = "bg-[#DCFCE7] dark:bg-[#064e3b] border-[#22C55E] dark:border-[#047857] text-[#166534] dark:text-[#34d399]";
                      } else if (state === 'skipped') {
                        pillClass = "bg-[#FEE2E2] dark:bg-[#7f1d1d] border-[#EF4444] dark:border-[#b91c1c] text-[#B91C1C] dark:text-[#fca5a5]";
                      } else if (state === 'review') {
                        pillClass = "bg-[#FEF9C3] dark:bg-[#713f12] border-[#EAB308] dark:border-[#a16207] text-[#A16207] dark:text-[#fde047]";
                      }

                      return (
                        <button
                          key={q.id}
                          onClick={() => { jumpToQuestion(idx); setShowMobileNav(false); }}
                          className={cn(
                            "aspect-square rounded-md border flex items-center justify-center text-[13px] font-bold transition-colors",
                            pillClass
                          )}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── DESKTOP UI ── */}
        <div className="hidden md:flex flex-col h-full w-full bg-[#EDF1F5] dark:bg-[#0f172a] font-sans transition-colors duration-300">

          {/* Top Header */}
          <header className="bg-gradient-to-r from-indigo-700 via-purple-700 to-blue-800 dark:from-indigo-900 dark:via-purple-900 dark:to-blue-950 text-white rounded-[5px] m-2 px-6 py-3 shadow-lg border border-white/10 flex items-center justify-between z-30 flex-shrink-0 transition-colors duration-300">
            {/* Left: Logo & Title */}
            <div className="flex items-center gap-4 flex-shrink-0 min-w-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center relative overflow-hidden flex-shrink-0 shadow-sm p-0.5">
                  <img src="/favicon-bg.png" alt="DeshExam Logo" className="w-full h-full object-cover m-0 !mb-0 rounded-md" />
                </div>
                <div className="hidden xl:flex flex-col justify-center">
                  <span className="font-extrabold text-[19px] leading-[1.1] tracking-tight text-white drop-shadow-sm">
                    Desh Exam
                  </span>
                  <span className="text-[9px] font-extrabold tracking-[0.25em] text-white/70 uppercase leading-none mt-0.5 ml-[2px]">
                    Academy
                  </span>
                </div>
              </div>
              <div className="h-8 w-px bg-white/20 hidden xl:block flex-shrink-0 mx-2"></div>
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex flex-col min-w-0">
                  <h1 className="font-bold text-lg text-white leading-tight line-clamp-1 flex-1 drop-shadow-sm" title={mockTest.title}>
                    {isReviewMode ? "Reviewing Solutions" : mockTest.title}
                  </h1>
                  <div className="flex items-center gap-2 mt-1.5 overflow-hidden w-full">
                    {(mockTest.taxonomyLine || (mockTest as any).category || "General Studies").split(' • ').map((part: string, idx: number, arr: string[]) => (
                      <div key={idx} className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-md bg-white/15 text-white border border-white/20 tracking-wide uppercase shadow-sm">
                          {part}
                        </span>
                        {idx < arr.length - 1 && (
                          <span className="text-white/40 text-[10px]">▶</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>



            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:bg-white/10 hover:text-white transition-colors">
                <Bookmark className="w-5 h-5" />
              </button>
              <button onClick={toggleFullscreen} className="w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:bg-white/10 hover:text-white transition-colors">
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
              <button onClick={toggleTheme} className="w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:bg-white/10 hover:text-white transition-colors">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button onClick={() => setShowPresentationMode(true)} className="w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:bg-white/10 hover:text-white transition-colors" title="Presentation Mode">
                <Presentation className="w-5 h-5" />
              </button>
              <div className="h-6 w-px bg-white/20 mx-1 transition-colors"></div>

              {!isReviewMode ? (
                <>
                  <button
                    onClick={() => setAutoSaveNext(!autoSaveNext)}
                    className={cn(
                      "h-10 px-3 rounded-full font-bold text-sm flex items-center gap-1.5 border transition-colors shadow-sm",
                      autoSaveNext
                        ? "bg-white/20 text-white border-white/40"
                        : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white"
                    )}
                    title="Automatically save and go to next question"
                  >
                    {autoSaveNext ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <Button
                    onClick={() => setShowSubmitConfirm(true)}
                    className="bg-[#EF4444] hover:bg-red-600 text-white rounded-full px-6 font-bold shadow-sm border border-red-500/50"
                  >
                    Submit
                  </Button>
                  <div className="bg-white/15 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-sm border border-white/20 transition-colors backdrop-blur-md">
                    <Clock className="w-5 h-5 text-emerald-300" />
                    <span className="text-[15px]">{formatTime(timeLeft)}</span>
                  </div>
                </>
              ) : (
                <Button
                  onClick={() => setIsReviewMode(false)}
                  className="bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-full px-6 font-bold shadow-sm"
                >
                  Close Review
                </Button>
              )}
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col lg:flex-row gap-5 px-4 pb-4 overflow-y-auto lg:overflow-hidden max-w-[1800px] mx-auto w-full">

            {/* Left Sidebar */}
            <aside className="order-2 lg:order-1 w-full lg:w-[260px] xl:w-[280px] flex flex-col gap-2 xl:gap-3 overflow-y-auto hide-scrollbar flex-shrink-0 lg:h-full">
              
              {/* Site Promo Ad */}
              <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-4 text-white shadow-[0_8px_30px_-4px_rgba(79,70,229,0.3)] border border-indigo-400/30 relative overflow-hidden group shrink-0">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl transform translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-500"></div>
                <h3 className="font-bold text-[15px] leading-tight mb-1">Desh Exam PRO</h3>
                <p className="text-xs text-white/80 mb-3 leading-relaxed">Unlock mock tests, AI analytics & ad-free experience.</p>
                <Button size="sm" className="w-full bg-white text-indigo-600 hover:bg-slate-50 text-xs font-bold h-8">
                  Upgrade Now
                </Button>
              </div>



              {/* AdSense Slot */}
              <div className="mt-auto shrink-0 pt-2">
                <AdUnit
                  format="vertical"
                  className="w-full min-h-[250px] rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 bg-white dark:bg-[#1e293b]"
                />
              </div>
            </aside>

            {/* Center Main Area */}
            <section className="order-1 lg:order-2 flex-1 flex flex-col gap-4 overflow-hidden min-w-0 relative">

              {/* Top Bar: Mini Navigator */}
              <div className="flex items-center bg-white dark:bg-[#1e293b] rounded-[12px] p-2 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">

                {/* Center: Mini Navigator */}
                <div className="flex items-center w-full min-w-0">
                  <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-full px-2 py-1 flex items-center justify-between gap-2 border border-slate-100 dark:border-slate-700 transition-colors">
                    <button onClick={handlePrevious} disabled={currentQuestionIndex === 0} className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-30 shadow-sm border border-slate-200 dark:border-slate-600 transition-colors"><ArrowLeft className="w-4 h-4" /></button>
                    <div className="flex-1 flex items-center justify-center gap-1.5 overflow-x-auto hide-scrollbar scroll-smooth px-2 mask-edges">
                      {(() => {
                        const maxVisible = 16;
                        let start = Math.max(1, currentQuestionIndex - Math.floor(maxVisible / 2));
                        let end = start + maxVisible - 1;
                        if (end >= questions.length - 1) {
                          end = questions.length - 2;
                          start = Math.max(1, end - maxVisible + 1);
                        }
                        
                        return questions.map((q, idx) => {
                          const state = questionStates[q.id] || 'unvisited';
                          const isCurrent = currentQuestionIndex === idx;

                          if (idx !== 0 && idx !== questions.length - 1) {
                            if (idx < start) {
                              if (idx === start - 1) return <span key={`dots-left-${q.id}`} className="text-[#0B476D] dark:text-blue-300 font-bold px-1 tracking-widest flex items-center justify-center">...</span>;
                              return null;
                            }
                            if (idx > end) {
                              if (idx === end + 1) return <span key={`dots-right-${q.id}`} className="text-[#0B476D] dark:text-blue-300 font-bold px-1 tracking-widest flex items-center justify-center">...</span>;
                              return null;
                            }
                          }

                          let navClass = "bg-transparent text-[#0B476D] dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-slate-700";

                        if (isCurrent) {
                          navClass = "bg-[#166534] dark:bg-emerald-600 text-white shadow-sm";
                        } else if (isReviewMode) {
                          const uAnswer = answers[q.id];
                          if (uAnswer && q.correctAnswer && uAnswer.toLowerCase() === q.correctAnswer.toLowerCase()) navClass = "bg-transparent text-[#16A34A] dark:text-emerald-400";
                          else if (uAnswer) navClass = "bg-transparent text-[#DC2626] dark:text-red-400";
                        } else if (state === 'answered') {
                          navClass = "bg-transparent text-[#16A34A] dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-700";
                        } else if (state === 'review') {
                          navClass = "bg-transparent text-[#D97706] dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-700";
                        } else if (state === 'skipped') {
                          navClass = "bg-transparent text-[#DC2626] dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-700";
                        }

                        return (
                          <button
                            key={q.id}
                            onClick={() => jumpToQuestion(idx)}
                            className={cn(
                              "w-7 h-7 rounded-md flex items-center justify-center text-[14px] font-bold transition-all",
                              navClass
                            )}
                          >
                            {idx + 1}
                          </button>
                        );
                      });
                    })()}
                    </div>
                    <button onClick={() => { if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex(prev => prev + 1); }} disabled={currentQuestionIndex === questions.length - 1} className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-30 shadow-sm border border-slate-200 dark:border-slate-600 transition-colors"><ArrowLeft className="w-4 h-4 rotate-180" /></button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4 pr-1 pb-24">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQ.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-4"
                  >
                    {/* Question Card */}
                    <div className="bg-gradient-to-br from-white to-blue-50/30 dark:from-[#1e293b] dark:to-slate-900/80 rounded-2xl p-5 lg:p-6 shadow-md border border-white/60 dark:border-slate-700/50 flex flex-col transition-colors duration-300">

                      <div
                        className="text-[26px] font-bold leading-tight text-slate-900 dark:text-slate-50 transition-colors"
                        dangerouslySetInnerHTML={{ __html: currentQ.questionText || '' }}
                      />
                    </div>

                    {/* Options Card */}
                    <div className="bg-gradient-to-br from-white to-slate-50/50 dark:from-[#1e293b] dark:to-slate-900/80 rounded-2xl p-4 lg:p-5 shadow-sm border border-white/60 dark:border-slate-700/50 flex flex-col transition-colors duration-300">

                      <div className={cn(
                        "grid gap-3",
                        optionsLayout === 'grid' ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
                      )}>
                        {currentOptionsKeys.map((key, idx) => {
                          const isSelected = answers[currentQ.id] === key;
                          const optionText = (currentQ.options as any)[key];

                          let defaultOptionClass = "border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b]";
                          let defaultBubbleClass = "border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800";
                          
                          if (idx === 0) {
                            defaultOptionClass = "border-[#6B9DF2]/60 dark:border-blue-700/50 bg-white dark:bg-[#1e293b] hover:bg-blue-50/50 dark:hover:bg-slate-800";
                            defaultBubbleClass = "bg-[#6B9DF2] text-white border-transparent shadow-sm";
                          } else if (idx === 1) {
                            defaultOptionClass = "border-[#65C27B]/60 dark:border-green-700/50 bg-white dark:bg-[#1e293b] hover:bg-green-50/50 dark:hover:bg-slate-800";
                            defaultBubbleClass = "bg-[#65C27B] text-white border-transparent shadow-sm";
                          } else if (idx === 2) {
                            defaultOptionClass = "border-[#F5B435]/60 dark:border-amber-700/50 bg-white dark:bg-[#1e293b] hover:bg-amber-50/50 dark:hover:bg-slate-800";
                            defaultBubbleClass = "bg-[#F5B435] text-white border-transparent shadow-sm";
                          } else if (idx === 3) {
                            defaultOptionClass = "border-[#EF6861]/60 dark:border-red-700/50 bg-white dark:bg-[#1e293b] hover:bg-red-50/50 dark:hover:bg-slate-800";
                            defaultBubbleClass = "bg-[#EF6861] text-white border-transparent shadow-sm";
                          }

                          let optionClass = `${defaultOptionClass} hover:shadow-sm hover:-translate-y-0.5 transition-all`;
                          let bubbleClass = defaultBubbleClass;
                          let textClass = "text-slate-700 dark:text-slate-200 font-medium";

                          if (isSelected) {
                            optionClass = "border-emerald-400 dark:border-emerald-500/50 bg-gradient-to-r from-emerald-50 to-teal-50/50 dark:from-emerald-900/40 dark:to-teal-900/20 shadow-sm ring-1 ring-emerald-500/20";
                            bubbleClass = "border-transparent text-white bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm";
                            textClass = "text-emerald-900 dark:text-emerald-100 font-bold";
                          }

                          if (isReviewMode) {
                            const isCorrectAnswer = currentQ.correctAnswer && key.toLowerCase() === currentQ.correctAnswer.toLowerCase();
                            if (isCorrectAnswer) {
                              optionClass = "border-emerald-400 dark:border-emerald-500/50 bg-gradient-to-r from-emerald-50 to-teal-50/50 dark:from-emerald-900/40 dark:to-teal-900/20 shadow-sm ring-1 ring-emerald-500/20";
                              bubbleClass = "border-transparent text-white bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm";
                              textClass = "text-emerald-900 dark:text-emerald-100 font-bold";
                            } else if (isSelected && !isCorrectAnswer) {
                              optionClass = "border-red-400 dark:border-red-500/50 bg-gradient-to-r from-red-50 to-rose-50/50 dark:from-red-900/40 dark:to-rose-900/20 shadow-sm ring-1 ring-red-500/20";
                              bubbleClass = "border-transparent text-white bg-gradient-to-br from-red-500 to-rose-600 shadow-sm";
                              textClass = "text-red-900 dark:text-red-100 font-bold";
                            } else {
                              optionClass = "border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] opacity-60";
                            }
                          }

                          return (
                            <button
                              key={key}
                              onClick={() => handleOptionSelect(key)}
                              className={cn(
                                "flex items-center justify-center text-center w-full min-h-[48px] md:min-h-[52px] px-14 py-2 rounded-[16px] border transition-all duration-200 relative group",
                                optionClass
                              )}
                            >
                              <div className={cn(
                                "absolute left-4 w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-[15px] border transition-colors",
                                bubbleClass
                              )}>
                                {key.toUpperCase()}
                              </div>
                              <span className={cn("text-[18px] transition-colors", textClass)}>
                                {optionText}
                              </span>
                              <span className="absolute right-4 text-xs font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                (Press {key.toUpperCase()})
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {isReviewMode && currentQ.explanation && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-[8px] p-6 shadow-sm transition-colors">
                        <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2 transition-colors">
                          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          Explanation
                        </h4>
                        <div className="text-blue-800 dark:text-blue-200 leading-relaxed transition-colors" dangerouslySetInnerHTML={{ __html: currentQ.explanation }} />
                      </div>
                    )}

                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Bottom Action Bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#1e293b] border-t border-slate-200 dark:border-slate-700 py-3 px-2 flex items-center justify-center z-20 transition-colors duration-300 rounded-b-[12px] lg:rounded-none">
                <div className="flex flex-nowrap items-center justify-start lg:justify-center gap-2 pointer-events-auto w-full overflow-x-auto hide-scrollbar px-2 pr-14">
                  <button
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    className="h-10 px-5 rounded-full border border-slate-300 bg-white font-bold text-slate-700 whitespace-nowrap disabled:opacity-50 hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" /> Previous
                  </button>

                  {!isReviewMode ? (
                    <>
                      <button
                        onClick={handleMarkReview}
                        className="h-10 px-6 rounded-full font-bold text-[#B45309] border border-[#B45309] hover:bg-amber-50 whitespace-nowrap transition-colors text-sm"
                      >
                        Mark for Review
                      </button>
                      <button
                        onClick={handleClear}
                        className="h-10 px-6 rounded-full font-bold text-slate-600 border border-slate-300 hover:bg-slate-50 whitespace-nowrap transition-colors text-sm"
                      >
                        Clear Response
                      </button>
                      {currentQuestionIndex === questions.length - 1 ? (
                        <button
                          onClick={() => {
                            handleSaveAndNext();
                            setShowSubmitConfirm(true);
                          }}
                          className="h-10 px-8 rounded-full bg-[#2563EB] hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 whitespace-nowrap shadow-sm transition-colors text-sm"
                        >
                          Submit
                        </button>
                      ) : (
                        <button
                          onClick={handleSaveAndNext}
                          className="h-10 px-6 rounded-full bg-[#166534] hover:bg-green-800 text-white font-bold flex items-center gap-1.5 whitespace-nowrap shadow-sm transition-colors text-sm"
                        >
                          Save & Next
                        </button>
                      )}
                      <button
                        onClick={() => { if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex(prev => prev + 1); }}
                        disabled={currentQuestionIndex === questions.length - 1}
                        className="h-10 px-6 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center gap-1.5 whitespace-nowrap shadow-sm transition-colors text-sm disabled:opacity-50"
                      >
                        Next <ArrowLeft className="w-4 h-4 rotate-180" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleSaveAndNext}
                      disabled={currentQuestionIndex === questions.length - 1}
                      className="h-10 px-8 rounded-full font-bold bg-[#2563EB] hover:bg-blue-700 text-white shadow-sm transition-colors text-sm"
                    >
                      Next Question
                    </button>
                  )}
                </div>

                {/* Layout Settings Toggle */}
                <div className="absolute right-4 bottom-1/2 translate-y-1/2 z-50">
                  <button
                    onClick={() => setShowLayoutSettings(!showLayoutSettings)}
                    className={cn(
                      "w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 border shadow-sm group",
                      showLayoutSettings 
                        ? "bg-blue-600 text-white border-blue-600 shadow-blue-500/25 rotate-90"
                        : "bg-white dark:bg-[#1e293b] text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-600 hover:rotate-45"
                    )}
                    title="Layout Settings"
                  >
                    <Settings className="w-4 h-4 transition-transform duration-500" />
                  </button>

                  <AnimatePresence>
                    {showLayoutSettings && (
                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.9, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(2px)' }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="absolute bottom-[calc(100%+16px)] right-0 w-[220px] bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-white/50 dark:border-slate-700/50 p-4 z-50 overflow-hidden"
                      >
                        {/* Decorative background glows */}
                        <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
                        
                        <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 bg-blue-100 dark:bg-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400">
                              <Settings className="w-3.5 h-3.5" />
                            </div>
                            <h3 className="text-[12px] font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-widest">Layout Settings</h3>
                          </div>
                          
                          <div className="flex bg-slate-100/80 dark:bg-slate-800/60 p-1 rounded-xl shadow-inner border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                            <button
                              onClick={() => {
                                setOptionsLayout('list');
                                setTimeout(() => setShowLayoutSettings(false), 200);
                              }}
                              className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all duration-300 text-[12px] font-bold relative overflow-hidden",
                                optionsLayout === 'list' 
                                  ? "text-white shadow-md" 
                                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                              )}
                            >
                              {optionsLayout === 'list' && (
                                <motion.div layoutId="layout-active-bg" className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg -z-10" />
                              )}
                              <List className="w-3.5 h-3.5" /> List
                            </button>
                            <button
                              onClick={() => {
                                setOptionsLayout('grid');
                                setTimeout(() => setShowLayoutSettings(false), 200);
                              }}
                              className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all duration-300 text-[12px] font-bold relative overflow-hidden",
                                optionsLayout === 'grid' 
                                  ? "text-white shadow-md" 
                                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                              )}
                            >
                              {optionsLayout === 'grid' && (
                                <motion.div layoutId="layout-active-bg" className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg -z-10" />
                              )}
                              <LayoutGrid className="w-3.5 h-3.5" /> Grid
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

            </section>

            {/* Right Sidebar - Premium Analytics & AI */}
            <aside className="order-3 w-full lg:w-[270px] xl:w-[300px] 2xl:w-[320px] flex flex-col gap-2 xl:gap-3 overflow-y-auto hide-scrollbar flex-shrink-0 lg:h-full">

              {/* Premium Exam Progress Card (Compact) */}
              <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-800 dark:from-indigo-900 dark:via-blue-900 dark:to-indigo-950 text-white rounded-2xl shadow-[0_8px_30px_-4px_rgba(79,70,229,0.3)] border border-indigo-400/30 p-4 transition-colors duration-300 flex flex-col relative overflow-hidden flex-shrink-0">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-24 h-24 bg-blue-400/20 rounded-full blur-xl pointer-events-none"></div>
                
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <h3 className="font-bold text-[15px] text-white flex items-center gap-2 drop-shadow-sm">
                    <Target className="w-4 h-4 text-indigo-200" /> Progress
                  </h3>
                  <div className="text-[13px] font-extrabold text-indigo-900 dark:text-indigo-950 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-md shadow-sm">
                    {currentQuestionIndex + 1} <span className="text-indigo-400/80">/ {questions.length}</span>
                  </div>
                </div>

                {!isReviewMode && (
                  <div className="w-full h-1.5 bg-black/20 dark:bg-black/40 rounded-full overflow-hidden mb-3 shadow-inner relative z-10">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(52,211,153,0.6)]" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
                  </div>
                )}

                <div className="flex justify-between items-center bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-xl p-2.5 border border-white/20 dark:border-white/10 shadow-sm relative z-10">
                  <div className="flex flex-col items-center flex-1 border-r border-white/20 dark:border-white/10">
                    <span className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest mb-0.5 drop-shadow-sm">Attempted</span>
                    <span className="text-base font-black text-white leading-tight drop-shadow-md">{totalAttempted}</span>
                  </div>
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest mb-0.5 drop-shadow-sm">Remaining</span>
                    <span className="text-base font-black text-white leading-tight drop-shadow-md">{questions.length - totalAttempted}</span>
                  </div>
                </div>
              </div>

              {/* Deshexam Academy Ad Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-black rounded-2xl p-4 text-white shadow-xl border border-slate-700/60 dark:border-slate-800 flex-shrink-0 relative overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-300">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-amber-500/20 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/30 transition-colors duration-500"></div>
                <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-blue-500/10 rounded-full blur-xl pointer-events-none"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 mb-1 drop-shadow-sm flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      Premium
                    </span>
                    <h4 className="font-extrabold text-[15px] leading-tight text-white flex items-center gap-1.5">
                      Desh Exam <span className="bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 px-1.5 py-0.5 rounded-[4px] text-[9px] font-black tracking-widest uppercase shadow-sm">Academy</span>
                    </h4>
                    <p className="text-[11px] font-medium text-slate-400 mt-1.5 max-w-[150px] leading-snug">Unlock unlimited tests & detailed analytics</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)] transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* AdSense Ad Slot */}
              <div className="w-full min-h-[250px] bg-slate-50 dark:bg-slate-800/30 rounded-2xl flex items-center justify-center border border-slate-200/60 dark:border-slate-700/50 flex-shrink-0 overflow-hidden relative">
                {/* Placeholder text (visible while loading or if blocked) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 opacity-50">
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Advertisement</span>
                </div>
                {/* AdSense ins tag */}
                <div className="w-full relative z-10 overflow-hidden flex justify-center">
                  <ins className="adsbygoogle"
                       style={{ display: 'block', width: '100%', height: '100%' }}
                       data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                       data-ad-slot="XXXXXXXXXX"
                       data-ad-format="auto"
                       data-full-width-responsive="true"></ins>
                </div>
              </div>

              {/* Quick Actions Mini Card */}
              <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 dark:from-violet-800 dark:to-fuchsia-800 rounded-xl shadow-md border border-white/20 dark:border-white/10 p-2.5 flex-shrink-0 flex items-center justify-between mt-auto relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 rounded-full blur-xl pointer-events-none"></div>
                <button onClick={() => alert('Calculator feature coming soon!')} className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors group w-1/4 relative z-10">
                  <div className="p-1.5 rounded-lg bg-white/10 group-hover:bg-white/20 shadow-sm transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider drop-shadow-sm">Calc</span>
                </button>
                <button onClick={() => alert('Thanks for reporting! We will review this question.')} className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors group w-1/4 relative z-10">
                  <div className="p-1.5 rounded-lg bg-white/10 group-hover:bg-white/20 shadow-sm transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider drop-shadow-sm">Report</span>
                </button>
                <button onClick={() => alert('Shortcuts:\n• Space: Skip Question\n• Enter: Save & Next\n• A,B,C,D: Select Option')} className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors group w-1/4 relative z-10">
                  <div className="p-1.5 rounded-lg bg-white/10 group-hover:bg-white/20 shadow-sm transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider drop-shadow-sm">Info</span>
                </button>
                <button onClick={() => { if (!document.fullscreenElement) { document.documentElement.requestFullscreen().catch(e=>console.error(e)); } else { document.exitFullscreen().catch(e=>console.error(e)); } }} className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors group w-1/4 relative z-10">
                  <div className="p-1.5 rounded-lg bg-white/10 group-hover:bg-white/20 shadow-sm transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider drop-shadow-sm">Zoom</span>
                </button>
              </div>

            </aside>
          </main>
        </div>

        {showPresentationMode && (
          <div className="fixed inset-0 z-[300] bg-white dark:bg-slate-900">
            <button
              onClick={() => setShowPresentationMode(false)}
              className="absolute top-4 right-4 z-[400] w-12 h-12 bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 backdrop-blur-md border border-black/20 dark:border-white/20 rounded-full flex items-center justify-center text-slate-900 dark:text-white shadow-xl transition-all hover:scale-105"
              title="Exit Presentation Mode"
            >
              <X className="w-6 h-6 drop-shadow-md" />
            </button>
            <PresentationOverlay
              questions={questions}
              classLine={mockTest.title}
              chapterName={mockTest.taxonomyLine}
              autoStart={true}
              onClose={() => setShowPresentationMode(false)}
            />
          </div>
        )}

        <style dangerouslySetInnerHTML={{
          __html: `
        html.dark body { background-color: #0f172a !important; }
        html:not(.dark) body { background-color: #F8FAFC !important; }
        body { overflow: hidden !important; }
        footer { display: none !important; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
      `}} />
      </div>
    </>
  );
}
