'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { getChallenge, Challenge } from '@/lib/firebase/challenges';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Swords, Trophy, Clock, Share2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function ChallengeResultPage() {
  const params = useParams();
  const router = useRouter();
  const challengeId = params.id as string;
  const { user } = useAuth();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      if (!user) return;
      try {
        const ch = await getChallenge(challengeId);
        if (!ch) {
          router.push('/dashboard/challenges');
          return;
        }
        setChallenge(ch);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [user, challengeId, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  if (!challenge || !user) return null;

  const isChallenger = challenge.challengerId === user.uid;
  const myData = isChallenger ? {
    name: challenge.challengerName,
    avatar: challenge.challengerAvatar,
    score: challenge.challengerScore,
    time: challenge.challengerTimeTaken,
    completed: challenge.challengerCompleted
  } : {
    name: challenge.opponentName,
    avatar: challenge.opponentAvatar,
    score: challenge.opponentScore,
    time: challenge.opponentTimeTaken,
    completed: challenge.opponentCompleted
  };

  const oppData = isChallenger ? {
    name: challenge.opponentName,
    avatar: challenge.opponentAvatar,
    score: challenge.opponentScore,
    time: challenge.opponentTimeTaken,
    completed: challenge.opponentCompleted
  } : {
    name: challenge.challengerName,
    avatar: challenge.challengerAvatar,
    score: challenge.challengerScore,
    time: challenge.challengerTimeTaken,
    completed: challenge.challengerCompleted
  };

  const isTie = challenge.status === 'completed' && challenge.winnerId === 'tie';
  const didIWin = challenge.status === 'completed' && challenge.winnerId === user.uid;
  const isWaiting = challenge.status !== 'completed';

  return (
    <div className="w-full max-w-4xl mx-auto py-8 text-slate-800 dark:text-slate-100">
      
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
          <Trophy className="w-8 h-8 text-green-600 dark:text-green-500" />
        </div>
        <h1 className="text-3xl font-black tracking-tight mb-2">Match Results</h1>
        {isWaiting ? (
          <p className="text-slate-500 dark:text-slate-400">Waiting for {oppData.name} to finish their turn...</p>
        ) : isTie ? (
          <p className="text-amber-500 font-bold text-xl">It's a Tie! 🤝</p>
        ) : didIWin ? (
          <p className="text-green-500 font-bold text-xl">Victory! 🏆 You earned +{challenge.rewardXp} XP</p>
        ) : (
          <p className="text-red-500 font-bold text-xl">Defeat! 😔 Better luck next time.</p>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-12">
        {/* Me */}
        <Card className={`relative flex flex-col items-center p-6 w-full max-w-xs border-2 ${didIWin ? 'border-green-500 shadow-green-500/20 shadow-xl' : 'border-slate-200 dark:border-slate-800'}`}>
          {didIWin && <div className="absolute -top-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Winner</div>}
          <img src={myData.avatar} className="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-800 mb-4" />
          <h2 className="text-xl font-bold mb-1">You</h2>
          <div className="flex flex-col items-center gap-2 mt-4 w-full">
            <div className="flex items-center justify-between w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <span className="text-slate-500"><ShieldCheck className="w-4 h-4" /></span>
              <span className="font-bold text-lg">{myData.score} / {challenge.questionIds.length}</span>
            </div>
            <div className="flex items-center justify-between w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <span className="text-slate-500"><Clock className="w-4 h-4" /></span>
              <span className="font-bold">{myData.time}s</span>
            </div>
          </div>
        </Card>

        {/* VS */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-black text-xl italic shadow-lg z-10">
            VS
          </div>
        </div>

        {/* Opponent */}
        <Card className={`relative flex flex-col items-center p-6 w-full max-w-xs border-2 ${(!didIWin && !isTie && !isWaiting) ? 'border-red-500 shadow-red-500/20 shadow-xl' : 'border-slate-200 dark:border-slate-800'}`}>
          {(!didIWin && !isTie && !isWaiting) && <div className="absolute -top-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Winner</div>}
          <img src={oppData.avatar} className="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-800 mb-4 opacity-90" />
          <h2 className="text-xl font-bold mb-1">{oppData.name}</h2>
          <div className="flex flex-col items-center gap-2 mt-4 w-full">
            {!oppData.completed ? (
              <div className="py-6 text-slate-400 italic text-sm text-center w-full">
                Has not played yet.
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-slate-500"><ShieldCheck className="w-4 h-4" /></span>
                  <span className="font-bold text-lg">{oppData.score} / {challenge.questionIds.length}</span>
                </div>
                <div className="flex items-center justify-between w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-slate-500"><Clock className="w-4 h-4" /></span>
                  <span className="font-bold">{oppData.time}s</span>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button onClick={() => router.push('/dashboard/challenges')} variant="outline" className="w-full sm:w-48 h-12 font-bold">
          <ArrowRight className="w-4 h-4 mr-2" /> Back to Hub
        </Button>
        <Button className="w-full sm:w-48 h-12 font-bold bg-green-600 hover:bg-green-700 text-white">
          <Share2 className="w-4 h-4 mr-2" /> Share Result
        </Button>
      </div>
    </div>
  );
}
