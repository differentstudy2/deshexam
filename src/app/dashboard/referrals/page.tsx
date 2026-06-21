'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Copy, CheckCircle2, Users, Gift, Share2 } from 'lucide-react';
import { ACHIEVEMENTS } from '@/lib/constants/achievements';
import { processReferral } from '@/lib/firebase/firestore';

export default function ReferralsPage() {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // We need the base URL to generate the full link
  const [baseUrl, setBaseUrl] = useState('');
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  // Fetch the Social Butterfly achievement details
  const socialAchievement = ACHIEVEMENTS.find(a => a.id === 'SOCIAL_BUTTERFLY');
  const referralCount = userProfile?.referralCount || 0;
  const isUnlocked = userProfile?.achievements?.includes('SOCIAL_BUTTERFLY');
  const currentProgress = isUnlocked ? (socialAchievement?.target || 10) : Math.min(referralCount, socialAchievement?.target || 10);
  const progressPct = socialAchievement ? (currentProgress / socialAchievement.target) * 100 : 0;

  const referralCode = userProfile?.referralCode || 'YOUR_CODE';
  const referralLink = `${baseUrl}/sign_up?ref=${referralCode}`;

  const copyToClipboard = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({
        title: "Link Copied!",
        description: "Share this link with your friends to earn rewards.",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSimulateReferral = async () => {
    if (!user) return;
    setIsSimulating(true);
    try {
      // We pass the current user's code, but pretend a "dummy" user just registered
      const dummyUserId = `dummy_${Math.random().toString(36).substring(2, 8)}`;
      const success = await processReferral(dummyUserId, referralCode);
      
      if (success) {
        toast({
          title: "Referral Simulated!",
          description: "A friend signed up! You earned 100 XP.",
        });
      } else {
        toast({
          title: "Simulation Failed",
          description: "Could not process referral.",
          variant: "destructive"
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto pb-12 text-slate-800 dark:text-slate-100">
      
      {/* Header */}
      <div className="mb-6 px-2 sm:px-0 flex justify-between items-end">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Refer a Friend</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Invite friends and earn XP together!</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleSimulateReferral} 
          disabled={isSimulating}
          className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40"
        >
          <Gift className="w-4 h-4 mr-2" />
          {isSimulating ? 'Simulating...' : 'Simulate Signup'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-2 sm:px-0">
        
        {/* Left Column: Link & Stats */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Referral Card */}
          <Card className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 text-white">
              <h2 className="text-2xl font-bold mb-2">Give knowledge, get rewarded!</h2>
              <p className="text-blue-100 max-w-md">
                Share DeshExam with your friends. For every friend who registers using your link, you will receive <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded">100 XP</span>!
              </p>
            </div>
            <CardContent className="p-6">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Your Unique Referral Link</label>
              <div className="flex gap-3">
                <Input 
                  value={referralLink} 
                  readOnly 
                  className="bg-slate-50 dark:bg-slate-950 font-medium text-slate-600 dark:text-slate-400"
                />
                <Button 
                  onClick={copyToClipboard}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </Button>
              </div>
              
              <div className="mt-6 flex gap-4">
                 <Button 
                   variant="outline" 
                   className="flex-1 border-slate-200 dark:border-slate-700"
                   onClick={() => {
                     const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
                     window.open(url, '_blank', 'width=600,height=400');
                   }}
                 >
                    <Share2 className="w-4 h-4 mr-2 text-slate-500" />
                    Share on Facebook
                 </Button>
                 <Button 
                   variant="outline" 
                   className="flex-1 border-slate-200 dark:border-slate-700"
                   onClick={() => {
                     const text = "Join me on DeshExam and let's learn together!";
                     const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + '\n' + referralLink)}`;
                     window.open(url, '_blank');
                   }}
                 >
                    <Share2 className="w-4 h-4 mr-2 text-slate-500" />
                    Share on WhatsApp
                 </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 rounded-2xl">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Referrals</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{referralCount}</h3>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 rounded-2xl">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                  <Gift className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">XP Earned</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{referralCount * 100}</h3>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>

        {/* Right Column: Achievements & History */}
        <div className="space-y-6">
          
          {/* Achievement Widget */}
          {socialAchievement && (
            <Card className={`bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 rounded-2xl transition-all ${isUnlocked ? 'border-purple-200 dark:border-purple-800 ring-1 ring-purple-100 dark:ring-purple-900/30' : ''}`}>
              <CardContent className="p-6">
                <div className="flex gap-4 items-center">
                  {/* Icon Box */}
                  <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center shrink-0 relative border-2 ${isUnlocked ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'}`}>
                    <span className="text-3xl leading-none">{socialAchievement.icon}</span>
                    <div className={`text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm absolute -bottom-2.5 shadow-sm uppercase tracking-wider bg-purple-500`}>
                      {socialAchievement.type}
                    </div>
                  </div>
                  
                  {/* Content Details */}
                  <div className="flex-1 pt-1 ml-2">
                    <div className="flex justify-between items-end mb-2">
                      <h4 className="font-bold text-[15px] text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        {socialAchievement.title}
                        {isUnlocked && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                      </h4>
                      <span className="text-[11px] font-bold text-slate-400 shrink-0 ml-2">{currentProgress}/{socialAchievement.target}</span>
                    </div>
                    
                    <Progress value={progressPct} className={`h-2 mb-2 ${isUnlocked ? 'bg-green-100 [&>div]:bg-green-500' : 'bg-slate-100 dark:bg-slate-800'}`} />
                    
                    <p className="text-[11px] text-slate-500 font-medium leading-tight line-clamp-2">
                      {socialAchievement.desc}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Referral History Dummy List */}
          <Card className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 rounded-2xl">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm font-bold">Recent Referrals</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {referralCount === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-slate-500">No friends referred yet. Share your link to get started!</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {/* Generate some dummy rows based on referral count */}
                  {Array.from({ length: Math.min(referralCount, 5) }).map((_, i) => (
                    <div key={i} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <Users className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Friend {i + 1}</p>
                          <p className="text-[10px] text-slate-500">Signed up via your link</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-sm">+100 XP</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>

    </div>
  );
}
