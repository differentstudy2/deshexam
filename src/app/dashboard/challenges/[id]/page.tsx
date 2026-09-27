'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { getChallenge, submitChallengeResult, Challenge } from '@/lib/firebase/challenges';
import { getQuestionsByIds } from '@/lib/firebase/question-bank';
import { QuestionBankEntry } from '@/lib/question-bank-types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Clock, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function ChallengeArenaPage() {
  const params = useParams();
  const router = useRouter();
  const challengeId = params.id as string;
  const { user } = useAuth();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [questions, setQuestions] = useState<QuestionBankEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20); // 20 seconds per question
  const [score, setScore] = useState(0);
  const [totalTimeTaken, setTotalTimeTaken] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimerRef = useRef<number>(0);

  // Anti-cheat: Tab switch detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmitting && questions.length > 0) {
        alert("Cheat Detected! You switched tabs. Match forfeited.");
        // Auto submit with current score and massive time penalty
        handleFinalSubmit(score, totalTimeTaken + 999);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isSubmitting, score, totalTimeTaken, questions]);

  useEffect(() => {
    async function init() {
      if (!user) return;
      try {
        const ch = await getChallenge(challengeId);
        if (!ch) {
          router.push('/dashboard/challenges');
          return;
        }

        // Check if user is already done
        const isChallenger = ch.challengerId === user.uid;
        const isOpponent = ch.opponentId === user.uid;
        
        if (!isChallenger && !isOpponent) {
          router.push('/dashboard/challenges');
          return;
        }

        if ((isChallenger && ch.challengerCompleted) || (isOpponent && ch.opponentCompleted)) {
          router.push(`/dashboard/challenges/${challengeId}/result`);
          return;
        }

        const qs = await getQuestionsByIds(ch.questionIds);
        setChallenge(ch);
        setQuestions(qs);
        startTimerRef.current = Date.now();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [user, challengeId, router]);

  // Question Timer Logic
  useEffect(() => {
    if (loading || isSubmitting || questions.length === 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleNextQuestion(false); // Time's up, marked as wrong
          return 20;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, loading, isSubmitting, questions]);

  const handleNextQuestion = (isCorrect: boolean) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const timeSpent = 20 - timeLeft;
    setTotalTimeTaken(prev => prev + timeSpent);

    if (isCorrect) setScore(prev => prev + 1);
    setSelectedAnswer(null);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setTimeLeft(20);
    } else {
      // Finished all questions
      handleFinalSubmit(isCorrect ? score + 1 : score, totalTimeTaken + timeSpent);
    }
  };

  const handleAnswerSelect = (optionId: string) => {
    if (selectedAnswer) return; // Prevent double clicking
    setSelectedAnswer(optionId);
    
    const currentQ = questions[currentIndex];
    const isCorrect = optionId.toLowerCase() === currentQ.correctAnswer.toLowerCase();
    
    // Give a brief moment to see if it was right/wrong, then move next
    setTimeout(() => {
      handleNextQuestion(isCorrect);
    }, 800);
  };

  const handleFinalSubmit = async (finalScore: number, finalTime: number) => {
    if (isSubmitting || !user) return;
    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      await submitChallengeResult(challengeId, user.uid, finalScore, finalTime);
      router.push(`/dashboard/challenges/${challengeId}/result`);
    } catch (err) {
      console.error(err);
      alert("Failed to submit result");
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="w-16 h-16 relative flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-800 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-green-500 rounded-full border-t-transparent animate-spin"></div>
          <Swords className="w-6 h-6 text-green-600 dark:text-green-500 absolute" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-800 dark:text-slate-200">Preparing Arena...</h2>
        <p className="text-slate-500 text-sm">Do not switch tabs during the challenge!</p>
      </div>
    );
  }

  if (questions.length === 0) return null;

  const currentQ = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  return (
    <div className="w-full max-w-3xl mx-auto min-h-[80vh] flex flex-col pt-4 sm:pt-8 text-slate-800 dark:text-slate-100">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6 px-4 sm:px-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Question {currentIndex + 1} of {questions.length}</span>
        </div>
        <div className={`flex items-center gap-2 font-bold text-lg px-4 py-1.5 rounded-full ${timeLeft <= 5 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-green-100 text-green-700'}`}>
          <Clock className="w-5 h-5" /> 00:{timeLeft.toString().padStart(2, '0')}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full mb-8 overflow-hidden mx-4 sm:mx-0">
        <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
      </div>

      {/* Question Card */}
      <Card className="flex-1 p-6 sm:p-10 shadow-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl mx-4 sm:mx-0">
        <h2 className="text-xl sm:text-2xl font-bold leading-relaxed mb-8">
          <div dangerouslySetInnerHTML={{ __html: currentQ.questionText }} />
        </h2>

        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {currentQ.options && Object.entries(currentQ.options).map(([optKey, optText]) => {
            if (!optText) return null;
            let btnClass = "border-slate-200 dark:border-slate-700 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20";
            
            const isThisCorrect = optKey.toLowerCase() === currentQ.correctAnswer.toLowerCase();

            if (selectedAnswer === optKey) {
              if (isThisCorrect) {
                btnClass = "border-green-500 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400";
              } else {
                btnClass = "border-red-500 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400";
              }
            } else if (selectedAnswer && isThisCorrect) {
              // Show correct answer if user got it wrong
              btnClass = "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 ring-2 ring-green-500";
            }

            return (
              <button
                key={optKey}
                onClick={() => handleAnswerSelect(optKey)}
                disabled={!!selectedAnswer}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 font-medium text-lg ${btnClass} disabled:cursor-not-allowed`}
              >
                <div dangerouslySetInnerHTML={{ __html: optText }} />
              </button>
            );
          })}
        </div>
      </Card>

      {/* Warning Footer */}
      <div className="mt-8 flex items-center justify-center gap-2 text-slate-400 dark:text-slate-500 text-sm">
        <AlertTriangle className="w-4 h-4" /> Do not refresh or switch tabs. Doing so will forfeit the match.
      </div>
    </div>
  );
}

// Ensure Swords icon is imported at the top if missing
import { Swords } from 'lucide-react';
