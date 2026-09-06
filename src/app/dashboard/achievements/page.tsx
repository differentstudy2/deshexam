'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

import { ACHIEVEMENTS } from '@/lib/constants/achievements';
import { useAuth } from '@/hooks/use-auth';
import { CheckCircle2, Lock, Trophy, Target, Star, Gift, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Confetti from 'react-dom-confetti';
import { db } from '@/lib/firebase/client';
import { doc, updateDoc, arrayUnion, Timestamp, increment } from 'firebase/firestore';

export default function AchievementsPage() {
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('All');
  const [isConfettiActive, setIsConfettiActive] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const tabs = ['All', 'Common', 'Rare', 'Epic', 'Legendary'];

  const filteredAchievements = activeTab === 'All' 
    ? ACHIEVEMENTS 
    : ACHIEVEMENTS.filter(ach => ach.type === activeTab.toUpperCase());

  // Stats Calculation
  const totalAchievements = ACHIEVEMENTS.length;
  let unlockedCount = 0;
  let totalAP = 0;

  ACHIEVEMENTS.forEach(ach => {
    const isUnlocked = userProfile?.achievements?.includes(ach.id);
    if (isUnlocked) {
      unlockedCount++;
      if (ach.type === 'COMMON') totalAP += 10;
      else if (ach.type === 'RARE') totalAP += 50;
      else if (ach.type === 'EPIC') totalAP += 100;
      else if (ach.type === 'LEGENDARY') totalAP += 500;
    }
  });

  const completionPct = totalAchievements > 0 ? (unlockedCount / totalAchievements) * 100 : 0;
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionPct / 100) * circumference;

  const [selectedAchievement, setSelectedAchievement] = useState<any | null>(null);

  const confettiConfig = {
    angle: 90,
    spread: 360,
    startVelocity: 40,
    elementCount: 70,
    dragFriction: 0.12,
    duration: 3000,
    stagger: 3,
    width: "10px",
    height: "10px",
    perspective: "500px",
    colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"]
  };

  const handleClaim = async (ach: any) => {
    if (!user || !userProfile) return;
    try {
      setIsClaiming(true);
      
      const userRef = doc(db, 'users', user.uid);
      
      // Update achievements, award XP, and add notification
      await updateDoc(userRef, {
        achievements: arrayUnion(ach.id),
        xp: increment(ach.rewardXP || 0),
        notifications: arrayUnion({
          id: Date.now().toString(),
          type: 'achievement',
          title: `Unlocked: ${ach.title}`,
          message: 'You have claimed a new achievement reward!',
          createdAt: Timestamp.now(),
          read: false
        })
      });

      // Trigger Confetti
      setIsConfettiActive(true);
      setTimeout(() => setIsConfettiActive(false), 3000);

    } catch (error) {
      console.error('Error claiming achievement:', error);
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto pb-12 text-slate-800 dark:text-slate-100">
      
      {/* Header and Stats */}
      <div className="mb-8 px-2 sm:px-0">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-4">Achievements</h1>
        
        <Card className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-md border-none overflow-hidden relative rounded-2xl">
          {/* Decorative shapes */}
          <div className="absolute top-[-20%] right-[-5%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-20%] left-[-5%] w-48 h-48 bg-purple-400/20 rounded-full blur-2xl"></div>
          
          <CardContent className="p-6 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1 flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-300" /> Great Progress!</h2>
              <p className="text-indigo-100 text-sm max-w-md">Unlock more achievements to earn AP and rise to the top of the leaderboards.</p>
              
              <div className="flex gap-6 mt-4">
                <div>
                  <div className="text-xs text-indigo-200 font-semibold uppercase tracking-wider mb-0.5">Total Unlocked</div>
                  <div className="text-2xl font-bold">{unlockedCount} <span className="text-sm font-normal text-indigo-200">/ {totalAchievements}</span></div>
                </div>
                <div>
                  <div className="text-xs text-indigo-200 font-semibold uppercase tracking-wider mb-0.5">Total AP</div>
                  <div className="text-2xl font-bold text-yellow-300">{totalAP}</div>
                </div>
              </div>
            </div>
            
            <div className="shrink-0 flex items-center justify-center relative w-24 h-24">
              <svg width="100" height="100" className="rotate-[-90deg]">
                <circle cx="50" cy="50" r={radius} fill="transparent" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                <circle 
                  cx="50" cy="50" r={radius} 
                  fill="transparent" 
                  stroke="#fde047" 
                  strokeWidth="8" 
                  strokeDasharray={circumference} 
                  strokeDashoffset={strokeDashoffset} 
                  strokeLinecap="round" 
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold">{Math.round(completionPct)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 px-2 sm:px-0">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
              activeTab === tab
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/50 shadow-sm'
                : 'bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 border-transparent'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Achievements Grid (3 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2 sm:px-0">
        {filteredAchievements.map((ach, i) => {
          const unlocked = userProfile?.achievements?.includes(ach.id);
          
          // Determine current progress based on metric
          let rawCurrent = 0;
          if (ach.metric === 'xp') rawCurrent = userProfile?.xp || 0;
          else if (ach.metric === 'referrals') rawCurrent = userProfile?.referralCount || 0;
          else if (ach.metric === 'streak_days') rawCurrent = userProfile?.currentStreak || 0;
          else if (ach.metric === 'exams_taken') rawCurrent = userProfile?.examsTaken || 0;
          else if (ach.metric === 'perfect_exams') rawCurrent = userProfile?.perfectExams || 0;
          else if (ach.metric === 'night_owl') rawCurrent = userProfile?.nightOwlCount || 0;
          else if (ach.metric === 'early_bird') rawCurrent = userProfile?.earlyBirdCount || 0;
          
          const current = unlocked ? ach.target : Math.min(rawCurrent, ach.target);
          const progressPct = (current / ach.target) * 100;

          // Format the unit based on metric
          let unitText = '';
          if (ach.metric === 'xp') unitText = ' XP';
          else if (ach.metric === 'streak_days') unitText = ' Days';
          else if (ach.metric === 'exams_taken' || ach.metric === 'perfect_exams') unitText = ' Exams';
          else if (ach.metric === 'study_hours') unitText = ' Mins';

          return (
            <Card 
              key={i} 
              onClick={() => setSelectedAchievement(ach)}
              className={`cursor-pointer bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 rounded-2xl transition-all ${unlocked ? 'border-amber-200 dark:border-amber-800 ring-1 ring-amber-100 dark:ring-amber-900/30 hover:scale-[1.02]' : 'hover:border-slate-300 dark:hover:border-slate-700 opacity-80 hover:opacity-100'}`}
            >
              <CardContent className="p-6">
                <div className="flex gap-4 items-center h-full">
                  {/* Icon Box */}
                  <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center shrink-0 relative border-2 ${unlocked ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'}`}>
                    <span className={`text-3xl leading-none transition-all ${unlocked ? '' : 'grayscale opacity-30 blur-[1px]'}`}>{ach.icon}</span>
                    {!unlocked && <Lock className="w-5 h-5 absolute inset-0 m-auto text-slate-400" />}
                    
                    {/* Rarity Tag */}
                    <div className={`text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm absolute -bottom-2.5 shadow-sm uppercase tracking-wider
                      ${ach.type === 'COMMON' ? 'bg-slate-600' : 
                        ach.type === 'RARE' ? 'bg-blue-500' : 
                        ach.type === 'EPIC' ? 'bg-purple-500' : 
                        'bg-orange-500'}`}
                    >
                      {ach.type}
                    </div>
                  </div>
                  
                  {/* Content Details */}
                  <div className="flex-1 pt-1 ml-2">
                    <div className="flex justify-between items-end mb-2">
                      <h4 className="font-bold text-[15px] text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        {ach.title}
                        {unlocked && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                      </h4>
                      <span className="text-[11px] font-bold text-slate-400 shrink-0 ml-2">{current}/{ach.target}{unitText}</span>
                    </div>
                    
                    {progressPct >= 100 && !unlocked ? (
                      <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-bold text-[10px] uppercase tracking-wider py-1 px-2 rounded-md mb-2 flex items-center justify-center gap-1 border border-amber-200 dark:border-amber-800 animate-pulse">
                        <Gift className="w-3 h-3" /> Ready to Claim!
                      </div>
                    ) : (
                      <Progress value={progressPct} className={`h-2 mb-2 ${unlocked ? 'bg-green-100 [&>div]:bg-green-500' : 'bg-slate-100 dark:bg-slate-800'}`} />
                    )}
                    
                    <p className="text-[11px] text-slate-500 font-medium leading-tight line-clamp-2">
                      {ach.desc}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Empty State if filter yields no results */}
      {filteredAchievements.length === 0 && (
        <div className="text-center py-20">
          <span className="text-4xl">📭</span>
          <h3 className="mt-4 text-lg font-bold text-slate-700 dark:text-slate-300">No achievements found</h3>
          <p className="text-sm text-slate-500 mt-1">Try selecting a different tab.</p>
        </div>
      )}

      {/* Achievement Details Modal */}
      <Dialog open={!!selectedAchievement} onOpenChange={(open) => !open && setSelectedAchievement(null)}>
        <DialogContent className="sm:max-w-[425px] text-center flex flex-col items-center p-8">
          {selectedAchievement && (() => {
            const unlocked = userProfile?.achievements?.includes(selectedAchievement.id);
            const isClaimable = !unlocked && (() => {
              let rawCurrent = 0;
              if (selectedAchievement.metric === 'xp') rawCurrent = userProfile?.xp || 0;
              else if (selectedAchievement.metric === 'referrals') rawCurrent = userProfile?.referralCount || 0;
              else if (selectedAchievement.metric === 'streak_days') rawCurrent = userProfile?.currentStreak || 0;
              else if (selectedAchievement.metric === 'exams_taken') rawCurrent = userProfile?.examsTaken || 0;
              else if (selectedAchievement.metric === 'perfect_exams') rawCurrent = userProfile?.perfectExams || 0;
              else if (selectedAchievement.metric === 'night_owl') rawCurrent = userProfile?.nightOwlCount || 0;
              else if (selectedAchievement.metric === 'early_bird') rawCurrent = userProfile?.earlyBirdCount || 0;
              return rawCurrent >= selectedAchievement.target;
            })();
            const ap = selectedAchievement.type === 'COMMON' ? 10 : selectedAchievement.type === 'RARE' ? 50 : selectedAchievement.type === 'EPIC' ? 100 : 500;
            return (
              <>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
                  <Confetti active={isConfettiActive} config={confettiConfig} />
                </div>

                <DialogHeader className="w-full">
                  <DialogTitle className="sr-only">Achievement Details</DialogTitle>
                </DialogHeader>
                
                <div className={`w-32 h-32 rounded-2xl flex items-center justify-center relative mb-4 border-4 ${unlocked ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 shadow-lg shadow-amber-500/20' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                  <span className={`text-7xl leading-none ${unlocked ? 'animate-bounce' : 'grayscale opacity-20'}`}>
                    {selectedAchievement.icon}
                  </span>
                  {!unlocked && <Lock className="w-10 h-10 absolute inset-0 m-auto text-slate-400" />}
                  
                  <div className={`text-white text-xs font-bold px-3 py-1 rounded-sm absolute -bottom-3 shadow-md uppercase tracking-wider
                      ${selectedAchievement.type === 'COMMON' ? 'bg-slate-600' : 
                        selectedAchievement.type === 'RARE' ? 'bg-blue-500' : 
                        selectedAchievement.type === 'EPIC' ? 'bg-purple-500' : 
                        'bg-orange-500'}`}
                  >
                    {selectedAchievement.type}
                  </div>
                </div>

                <h3 className="text-2xl font-bold mt-2 text-slate-900 dark:text-white flex items-center justify-center gap-2">
                  {selectedAchievement.title}
                  {unlocked && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                </h3>
                
                <p className="text-slate-500 mt-3 text-sm">
                  {selectedAchievement.desc}
                </p>

                <div className="mt-6 w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Status:</span>
                    <span className={`font-bold ${unlocked ? 'text-green-500' : isClaimable ? 'text-amber-500' : 'text-slate-500'}`}>
                      {unlocked ? 'Unlocked!' : isClaimable ? 'Ready to Claim' : 'Locked'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Reward:</span>
                    <span className="font-bold text-yellow-500">+{ap} AP</span>
                  </div>
                  {unlocked && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Rarity:</span>
                      <span className="font-bold text-blue-500">Only {Math.floor(Math.random() * 20) + 1}% have this!</span>
                    </div>
                  )}
                </div>

                {isClaimable && (
                  <button 
                    onClick={() => handleClaim(selectedAchievement)}
                    disabled={isClaiming}
                    className="w-full mt-4 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
                  >
                    {isClaiming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Gift className="w-5 h-5" />}
                    {isClaiming ? 'Claiming...' : 'Claim Reward!'}
                  </button>
                )}
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

    </div>
  );
}
