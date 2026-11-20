'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRight,
  ChevronDown,
  ChevronUp,
  User,
  Medal,
  FileText,
  Target,
  CheckCircle2,
  XCircle,
  MinusCircle,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  BookOpen,
  Calendar,
  Lock,
  Clock,
  Check,
  Star
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

// MOCK DATA
const subjects = [
  { 
    name: 'Literature Kanika', 
    progress: 0.96,
    mcq: { current: 10, total: 2389, pct: '0.42%' },
    cq: { current: 0, total: 1845, pct: '' },
    content: { current: 1, total: 186, pct: '0.54%' },
    started: '4 months ago'
  },
  { 
    name: 'Joyful Reading (Bengali Rapid Reader)', 
    progress: 0.00,
    mcq: { current: 0, total: 255, pct: '' },
    cq: { current: 0, total: 118, pct: '' },
    content: { current: 0, total: 41, pct: '' },
    started: ''
  },
  { 
    name: 'Bengali Grammar and Composition', 
    progress: 0.29,
    mcq: { current: 2, total: 700, pct: '0.29%' },
    cq: { current: 0, total: 385, pct: '' },
    content: { current: 0, total: 76, pct: '' },
    started: '4 months ago'
  },
  { name: 'English for Today', progress: 0.00, mcq: { current: 0, total: 100 }, cq: { current: 0, total: 50 }, content: { current: 0, total: 20 }, started: '' },
  { name: 'English Grammar and C...', progress: 0.00, mcq: { current: 0, total: 100 }, cq: { current: 0, total: 50 }, content: { current: 0, total: 20 }, started: '' },
  { name: 'Mathematics', progress: 0.00, mcq: { current: 0, total: 100 }, cq: { current: 0, total: 50 }, content: { current: 0, total: 20 }, started: '' },
  { name: 'Information and Communication Technology', progress: 0.00, mcq: { current: 0, total: 100 }, cq: { current: 0, total: 50 }, content: { current: 0, total: 20 }, started: '' },
  { name: 'Bangladesh and Global Studies', progress: 0.00, mcq: { current: 0, total: 100 }, cq: { current: 0, total: 50 }, content: { current: 0, total: 20 }, started: '' },
  { name: 'Science', progress: 0.05, mcq: { current: 1, total: 100 }, cq: { current: 0, total: 50 }, content: { current: 0, total: 20 }, started: '' },
  { name: 'Arabic', progress: 0.00, mcq: { current: 0, total: 100 }, cq: { current: 0, total: 50 }, content: { current: 0, total: 20 }, started: '' },
  { name: 'Sanskrit', progress: 0.00, mcq: { current: 0, total: 100 }, cq: { current: 0, total: 50 }, content: { current: 0, total: 20 }, started: '' },
];

const radarData = [
  { subject: 'Math', A: 85, fullMark: 100 },
  { subject: 'Science', A: 65, fullMark: 100 },
  { subject: 'English', A: 50, fullMark: 100 },
  { subject: 'Bengali', A: 90, fullMark: 100 },
  { subject: 'ICT', A: 75, fullMark: 100 },
];

import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isSameMonth, 
  isSameDay, 
  subDays,
  isAfter,
  parseISO
} from 'date-fns';

import { ACHIEVEMENTS } from '@/lib/constants/achievements';
import { awardXP, getUserProfile, checkDailyStreak, recordMockTest } from '@/lib/firebase/firestore';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { getAuth, updateProfile } from 'firebase/auth';
import { db } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export default function ProfilePage() {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [openSubjects, setOpenSubjects] = useState<Record<string, boolean>>({});
  const [isAddingXp, setIsAddingXp] = useState(false);
  const [isSimulatingNextDay, setIsSimulatingNextDay] = useState(false);
  const [isSimulatingMockTest, setIsSimulatingMockTest] = useState(false);
  const [localProfile, setLocalProfile] = useState<any>(userProfile);
  const [resolvedClassName, setResolvedClassName] = useState<string | null>(null);
  const [realSubjects, setRealSubjects] = useState<any[]>([]);

  // Edit Profile State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  useEffect(() => {
    if (user?.displayName && isEditProfileOpen) {
      setNewDisplayName(user.displayName);
    }
  }, [user, isEditProfileOpen]);

  const handleUpdateProfile = async () => {
    if (!newDisplayName.trim() || !user) return;
    setIsUpdatingProfile(true);
    try {
      const auth = getAuth();
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: newDisplayName });
        await updateDoc(doc(db, "users", user.uid), { displayName: newDisplayName });
        toast({ title: 'Success', description: 'Profile updated successfully!' });
        setIsEditProfileOpen(false);
        setTimeout(() => window.location.reload(), 1000); // Reload to reflect changes globally
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to update profile.', variant: 'destructive' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  useEffect(() => {
    setLocalProfile(userProfile);
    if (userProfile?.classId) {
      const fetchData = async () => {
        try {
          const classDoc = await getDoc(doc(db, 'taxonomy_nodes', userProfile.classId));
          if (classDoc.exists()) {
            setResolvedClassName(classDoc.data().title);
          } else {
            setResolvedClassName(null);
          }

          const subjQ = query(
            collection(db, 'taxonomy_nodes'),
            where('parentId', '==', userProfile.classId),
            where('type', '==', 'subject')
          );
          const subjSnap = await getDocs(subjQ);
          const subjectIds = subjSnap.docs.map(d => d.id);

          let fetchedTextbooks: any[] = [];
          if (subjectIds.length > 0) {
            const chunks = [];
            for (let i = 0; i < subjectIds.length; i += 10) {
              chunks.push(subjectIds.slice(i, i + 10));
            }
            
            for (const chunk of chunks) {
              const tbQ = query(
                collection(db, 'taxonomy_nodes'),
                where('parentId', 'in', chunk),
                where('type', '==', 'textbook')
              );
              const tbSnap = await getDocs(tbQ);
              fetchedTextbooks.push(...tbSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any })));
            }
          }
          
          fetchedTextbooks.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
          
          const formattedSubjects = fetchedTextbooks.map(fs => {
            const stat = userProfile.subjectStats?.[fs.title] || {};
            return {
              id: fs.id,
              name: fs.title,
              progress: stat.progress || 0,
              mcq: stat.mcq || { current: 0, total: 100 },
              cq: stat.cq || { current: 0, total: 50 },
              content: stat.content || { current: 0, total: 20 },
              started: stat.started || ''
            };
          });
          
          setRealSubjects(formattedSubjects);
        } catch (err) {
          console.error('Error fetching data', err);
        }
      };
      fetchData();
    } else {
      setResolvedClassName(null);
    }
  }, [userProfile]);

  const handleSimulateXP = async () => {
    if (!user) return;
    setIsAddingXp(true);
    try {
      const result = await awardXP(user.uid, 'CUSTOM', 50, { description: 'Simulated XP for testing' });
      if (result.unlockedAchievements && result.unlockedAchievements.length > 0) {
        result.unlockedAchievements.forEach(ach => {
          toast({
            title: `Achievement Unlocked: ${ach.title} ${ach.icon}`,
            description: `You earned a bonus of ${ach.rewardXP} XP!`,
            variant: "default",
          });
        });
      } else if (result.xpAdded > 0) {
        toast({
          title: `+50 XP Earned!`,
          description: `Keep up the good work!`,
        });
      }
      const updatedProfile = await getUserProfile(user.uid);
      setLocalProfile(updatedProfile);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAddingXp(false);
    }
  };

  const handleSimulateNextDay = async () => {
    if (!user) return;
    setIsSimulatingNextDay(true);
    try {
      const result = await checkDailyStreak(user.uid, true);
      if (result) {
        if (result.xpAwarded > 0) {
          toast({
            title: "Next Day Logged!",
            description: `You earned ${result.xpAwarded} XP for your login streak. Current Streak: ${result.currentStreak} days.`,
            variant: "default",
          });
        } else {
          toast({
            title: "Simulated Next Day",
            description: `Streak is now ${result.currentStreak} days.`,
            variant: "default",
          });
        }
        const updatedProfile = await getUserProfile(user.uid);
        setLocalProfile(updatedProfile);
      }
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Failed to simulate next day login.",
        variant: "destructive",
      });
    } finally {
      setIsSimulatingNextDay(false);
    }
  };

  const handleSimulateMockTest = async () => {
    if (!user) return;
    setIsSimulatingMockTest(true);
    try {
      // Simulate a mock test with 100% score to easily test Flawless Victory
      const result = await recordMockTest(user.uid, 100);
      if (result && result.success) {
        toast({
          title: "Mock Test Completed!",
          description: `You scored 100% and earned ${result.xpAwarded} XP.`,
          variant: "default",
        });
        const updatedProfile = await getUserProfile(user.uid);
        setLocalProfile(updatedProfile);
      }
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Failed to simulate mock test.",
        variant: "destructive",
      });
    } finally {
      setIsSimulatingMockTest(false);
    }
  };

  const toggleSubject = (name: string) => {
    setOpenSubjects(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const currentXP = localProfile?.xp || 0;
  let currentLeague: { name: string, color: string, next: string | null, max: number | null, min: number, bg: string } = { name: 'Bronze', color: 'text-amber-600', next: 'Silver', max: 500, min: 0, bg: 'bg-amber-600' };
  if (currentXP >= 5000) currentLeague = { name: 'Diamond', color: 'text-blue-400', next: null, max: 5000, min: 5000, bg: 'bg-blue-400' };
  else if (currentXP >= 2000) currentLeague = { name: 'Gold', color: 'text-yellow-500', next: 'Diamond', max: 5000, min: 2000, bg: 'bg-yellow-500' };
  else if (currentXP >= 500) currentLeague = { name: 'Silver', color: 'text-slate-400', next: 'Gold', max: 2000, min: 500, bg: 'bg-slate-400' };
  
  const leagueProgress = currentLeague.max && currentLeague.max > currentLeague.min 
    ? ((currentXP - currentLeague.min) / (currentLeague.max - currentLeague.min)) * 100 
    : 100;

  const notifications = localProfile?.notifications || [];
  const recentActivities = [...notifications]
    .sort((a: any, b: any) => {
      const timeA = typeof a.createdAt?.toMillis === 'function' ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime();
      const timeB = typeof b.createdAt?.toMillis === 'function' ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    })
    .slice(0, 5);

  return (
    <div className="w-full max-w-[1400px] mx-auto pb-12 text-slate-800 dark:text-slate-100">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Profile & Progress</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* LEFT COLUMN: Main Content */}
        <div className="flex-1 w-full space-y-6">
          
          {/* Profile Header Card */}
          <Card className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 rounded-2xl relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-5">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'User'} className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-[#00bcd4] text-white flex items-center justify-center text-3xl font-bold shadow-sm">
                      {user?.displayName ? user.displayName.split(' ').map((n: string) => n[0]).join('').substring(0,2).toUpperCase() : 'U'}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{user?.displayName || 'Student'}</h2>
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">✓</div>
                      
                      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
                        <DialogTrigger asChild>
                          <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors ml-2" title="Edit Profile">
                            <User className="w-4 h-4 text-slate-400" />
                          </button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Profile</DialogTitle>
                          </DialogHeader>
                          <div className="py-4">
                            <label className="text-sm font-medium mb-2 block">Display Name</label>
                            <Input 
                              value={newDisplayName} 
                              onChange={(e) => setNewDisplayName(e.target.value)} 
                              placeholder="Enter your full name" 
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsEditProfileOpen(false)}>Cancel</Button>
                            <Button onClick={handleUpdateProfile} disabled={isUpdatingProfile} className="bg-purple-600 hover:bg-purple-700 text-white">
                              {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <p className="text-sm text-slate-500 font-medium mb-1">@{user?.displayName?.toLowerCase().replace(/\s+/g, '-') || 'student'} • Joined {(user?.metadata as any)?.creationTime ? new Date((user?.metadata as any).creationTime).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'recently'}</p>
                    {(resolvedClassName || localProfile?.className) && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 font-bold mb-3">{resolvedClassName || localProfile.className}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs font-bold">
                      <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        <span className="w-3 h-3 bg-blue-600 text-white flex items-center justify-center text-[8px] rounded-sm">{localProfile?.level || 1}</span> LVL {localProfile?.level || 1}
                      </div>
                      <span className="text-orange-500">{localProfile?.league || 'Bronze League'}</span>
                      <span className="text-blue-500">Followers: {localProfile?.followersCount || 0}</span>
                      <span className="text-blue-500">Followings: {localProfile?.followingsCount || 0}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5">
                    <span className="text-yellow-300">●</span> {localProfile?.level || 1}
                  </div>
                  <div className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md text-xs font-bold tracking-wider">
                    {localProfile?.plan === 'premium' ? 'PREMIUM' : 'FREE PLAN'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upgrade Banner */}
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl relative transition-all duration-300">
            <div className="p-5 flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
              <div>
                <h3 className="font-bold text-purple-800 dark:text-purple-300 text-lg">Upgrade to Premium Package</h3>
                <p className="text-xs font-medium text-purple-600/70 dark:text-purple-400 mt-1">Subscribe to any package to get access to all features.</p>
              </div>
              <Button className="bg-[#a855f7] hover:bg-[#9333ea] text-white rounded-full font-bold px-6 shadow-md shadow-purple-500/20 shrink-0">
                Subscribe Now
              </Button>
            </div>
            
            {isUpgradeOpen && (
              <div className="px-8 pb-8 pt-2">
                <div className="w-full h-px bg-purple-200/50 dark:bg-purple-800/50 mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-800 dark:text-slate-200">
                      <Check className="w-4 h-4 text-green-500 shrink-0" strokeWidth={3} /> Previous Years' Questions
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-800 dark:text-slate-200">
                      <Check className="w-4 h-4 text-green-500 shrink-0" strokeWidth={3} /> Unlimited Exams & Explanations
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-800 dark:text-slate-200">
                      <Check className="w-4 h-4 text-green-500 shrink-0" strokeWidth={3} /> Doubt Solving AI Chat
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-800 dark:text-slate-200">
                      <Check className="w-4 h-4 text-green-500 shrink-0" strokeWidth={3} /> Custom Mock Tests on Demand
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-800 dark:text-slate-200">
                      <Check className="w-4 h-4 text-green-500 shrink-0" strokeWidth={3} /> Ad-free Content & ∞ Page Views
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-800 dark:text-slate-200">
                      <Check className="w-4 h-4 text-green-500 shrink-0" strokeWidth={3} /> DeshExam (Book Downloads)
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-800 dark:text-slate-200">
                      <Check className="w-4 h-4 text-green-500 shrink-0" strokeWidth={3} /> Premium Video Courses & Model Tests
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-800 dark:text-slate-200">
                      <Check className="w-4 h-4 text-green-500 shrink-0" strokeWidth={3} /> Nationwide Leaderboard
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-800 dark:text-slate-200">
                      <Check className="w-4 h-4 text-green-500 shrink-0" strokeWidth={3} /> 24/7 Live Support
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button 
              onClick={() => setIsUpgradeOpen(!isUpgradeOpen)}
              className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 translate-y-1/2 w-7 h-7 bg-white dark:bg-slate-950 border border-purple-200 dark:border-purple-800 rounded-full flex justify-center items-center cursor-pointer hover:bg-purple-50 dark:hover:bg-slate-900 transition-colors z-10 shadow-sm"
            >
               {isUpgradeOpen ? <ChevronUp className="w-4 h-4 text-purple-400" /> : <ChevronDown className="w-4 h-4 text-purple-400" />}
            </button>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button 
              onClick={handleSimulateMockTest} 
              disabled={isSimulatingMockTest}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full shadow-sm"
            >
              <FileText className="w-4 h-4 mr-2" />
              {isSimulatingMockTest ? 'Simulating...' : 'Simulate Mock Test'}
            </Button>
            <Button 
              onClick={handleSimulateNextDay} 
              disabled={isSimulatingNextDay}
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-full shadow-sm"
            >
              <Clock className="w-4 h-4 mr-2" />
              {isSimulatingNextDay ? 'Simulating...' : 'Simulate Next Day'}
            </Button>
            <Button 
              onClick={handleSimulateXP} 
              disabled={isAddingXp}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-full shadow-sm"
            >
              <Star className="w-4 h-4 mr-2" />
              {isAddingXp ? 'Adding XP...' : 'Simulate +50 XP'}
            </Button>
          </div>

          {/* Learning Statistics */}
          <div className="pt-2">
            <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-slate-200">Learning Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="shadow-sm border-slate-200 dark:border-slate-800 rounded-xl">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">🔥 Day Streak</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{localProfile?.currentStreak || 0}</div>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-slate-200 dark:border-slate-800 rounded-xl">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">⚡ XP Earned</div>
                  <div className="text-2xl font-bold text-blue-500">{localProfile?.xp || 0}</div>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-slate-200 dark:border-slate-800 rounded-xl relative overflow-hidden">
                <div className={`absolute bottom-0 left-0 h-1 ${currentLeague.bg}`} style={{ width: `${leagueProgress}%` }}></div>
                <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400"><Medal className="w-4 h-4 text-orange-400"/> Rank (League)</div>
                  <div className={`text-2xl font-bold ${currentLeague.color}`}>{currentLeague.name}</div>
                  {currentLeague.next && (
                    <div className="text-[10px] text-slate-400 font-medium mt-[-4px]">
                      {currentLeague.max! - currentXP} XP to {currentLeague.next}
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="shadow-sm border-slate-200 dark:border-slate-800 rounded-xl">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400"><FileText className="w-4 h-4"/> Exams Taken</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{localProfile?.examsTaken || 0}</div>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-slate-200 dark:border-slate-800 rounded-xl">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400"><Target className="w-4 h-4 text-red-500"/> Ques Attempted</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">41</div>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-slate-200 dark:border-slate-800 rounded-xl border-b-4 border-b-green-100">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400"><CheckCircle2 className="w-4 h-4 text-green-500"/> Right Answer</div>
                  <div className="text-2xl font-bold text-green-500">1</div>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-slate-200 dark:border-slate-800 rounded-xl border-b-4 border-b-red-100">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400"><XCircle className="w-4 h-4 text-red-500"/> Wrong Answer</div>
                  <div className="text-2xl font-bold text-red-500">9</div>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-slate-200 dark:border-slate-800 rounded-xl border-b-4 border-b-slate-100">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400"><MinusCircle className="w-4 h-4 text-blue-500"/> Skipped</div>
                  <div className="text-2xl font-bold text-orange-500">31</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* XP Last 7 Days Chart */}
          <Card className="shadow-sm border-slate-200 dark:border-slate-800 rounded-2xl">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-200">XP Last 7 Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 text-xs font-bold text-teal-600">
                  <span className="w-2 h-2 rounded-full bg-teal-500"></span> {user?.displayName || 'Student'}
                </div>
                <div className="text-xs font-bold text-slate-400">{localProfile?.xp || 0} XP Total</div>
              </div>
              
              {/* Custom SVG Line Chart matching screenshot */}
              <div className="w-full h-[150px] relative mt-4">
                {/* Y Axis labels */}
                <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-slate-400 font-medium">
                  <span>100</span>
                  <span>50</span>
                  <span>0</span>
                </div>
                
                {/* Graph Area */}
                <div className="absolute left-6 right-0 top-0 bottom-6">
                  {/* Grid lines */}
                  <div className="absolute w-full top-0 border-t border-slate-100 dark:border-slate-800"></div>
                  <div className="absolute w-full top-[50%] border-t border-slate-100 dark:border-slate-800"></div>
                  <div className="absolute w-full bottom-0 border-t-2 border-teal-500 z-10"></div>
                  
                  {/* Data Points (all at Y=0 for now as history isn't tracked yet) */}
                  <div className="absolute bottom-0 w-full flex justify-between px-1 translate-y-1/2 z-20">
                    {[0,1,2,3,4,5,6].map(i => (
                      <div key={i} className="w-3 h-3 bg-teal-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                    ))}
                  </div>
                </div>
                
                {/* X Axis labels (Dynamic Last 7 Days) */}
                <div className="absolute left-6 right-0 bottom-0 flex justify-between text-[10px] text-slate-400 font-medium px-0.5">
                  {[6,5,4,3,2,1,0].map(daysAgo => {
                    const d = new Date();
                    d.setDate(d.getDate() - daysAgo);
                    return <span key={daysAgo}>{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>;
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Streaks Calendar */}
          <Card className="shadow-sm border-slate-200 dark:border-slate-800 rounded-2xl">
            <CardHeader className="py-4">
               <div className="flex justify-between items-center px-4">
                 <ChevronLeft className="w-4 h-4 text-slate-400 cursor-pointer" />
                 <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Streaks | {format(new Date(), 'MMMM yyyy')}</h3>
                 <ChevronRightIcon className="w-4 h-4 text-slate-400 cursor-pointer" />
               </div>
            </CardHeader>
            <CardContent className="px-8 pb-8">
               <div className="grid grid-cols-7 text-center gap-y-6">
                 {/* Weekday Headers */}
                 {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                   <div key={day} className="text-xs font-bold text-slate-700 dark:text-slate-300">{day}</div>
                 ))}
                 
                 {/* Calendar Grid */}
                 {(() => {
                   const today = new Date();
                   const monthStart = startOfMonth(today);
                   const monthEnd = endOfMonth(monthStart);
                   const startDate = startOfWeek(monthStart);
                   const endDate = endOfWeek(monthEnd);
                   
                   const dateFormat = "d";
                   const days = eachDayOfInterval({
                       start: startDate,
                       end: endDate
                   });
                   
                   // Determine active streak days to highlight
                   const currentStreak = localProfile?.currentStreak || 0;
                   let lastActiveDate = localProfile?.lastActiveDate;
                   if (lastActiveDate && typeof lastActiveDate.toDate === 'function') {
                     lastActiveDate = lastActiveDate.toDate();
                   } else if (lastActiveDate) {
                     lastActiveDate = new Date(lastActiveDate);
                   }
                   
                   const activeStreakDates: Date[] = [];
                   if (currentStreak > 0 && lastActiveDate) {
                     for(let i=0; i<currentStreak; i++) {
                       activeStreakDates.push(subDays(lastActiveDate, i));
                     }
                   }

                   return days.map((day, i) => {
                     const isCurrentMonth = isSameMonth(day, monthStart);
                     const isToday = isSameDay(day, today);
                     const isStreakDay = activeStreakDates.some(streakDate => isSameDay(streakDate, day));
                     
                     let className = "text-xs font-semibold ";
                     if (!isCurrentMonth) {
                       className += "text-slate-300 dark:text-slate-600";
                     } else if (isToday || isStreakDay) {
                       className = ""; // We use a wrapper below
                     } else {
                       className += "text-slate-600 dark:text-slate-400";
                     }
                     
                     if (isToday) {
                       return (
                         <div key={i} className="flex justify-center relative">
                           <div className="w-7 h-7 bg-red-400 text-white rounded-full flex items-center justify-center text-xs font-bold -mt-1.5 shadow-sm shadow-red-400/50">
                             {format(day, dateFormat)}
                           </div>
                         </div>
                       );
                     }
                     
                     if (isStreakDay) {
                       return (
                         <div key={i} className="flex justify-center relative">
                           <div className="w-7 h-7 bg-orange-400 text-white rounded-full flex items-center justify-center text-xs font-bold -mt-1.5 shadow-sm shadow-orange-400/50">
                             {format(day, dateFormat)}
                           </div>
                         </div>
                       );
                     }

                     return (
                       <div key={i} className={className}>
                         {format(day, dateFormat)}
                       </div>
                     );
                   });
                 })()}
               </div>
            </CardContent>
          </Card>

          {/* Recent Activity Timeline */}
          <Card className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 rounded-2xl mb-8">
            <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2">
              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((act: any, i: number) => {
                    const date = act.createdAt && typeof act.createdAt.toDate === 'function' ? act.createdAt.toDate() : new Date(act.createdAt || Date.now());
                    return (
                      <div key={i} className="flex gap-4 items-start relative">
                        {i !== recentActivities.length - 1 && (
                          <div className="absolute left-[11px] top-6 bottom-[-16px] w-0.5 bg-slate-100 dark:bg-slate-800"></div>
                        )}
                        <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0 z-10 mt-1">
                          <Star className="w-3 h-3" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{act.message || 'Activity completed'}</p>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">{date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4 text-sm text-slate-500">No recent activity yet. Take a mock test to get started!</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 rounded-2xl mb-8">
            <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold">Achievements</CardTitle>
              <span className="text-[10px] font-bold text-[#00bcd4] cursor-pointer">VIEW ALL</span>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {ACHIEVEMENTS.map((ach, i) => {
                  const unlocked = userProfile?.achievements?.includes(ach.id);
                  
                  let rawCurrent = 0;
                  if (ach.metric === 'xp') {
                    rawCurrent = userProfile?.xp || 0;
                  }
                  // Future metrics can be handled here

                  const current = unlocked ? ach.target : Math.min(rawCurrent, ach.target);
                  const progressPct = (current / ach.target) * 100;

                  // Format the unit based on metric
                  let unitText = '';
                  if (ach.metric === 'xp') unitText = ' XP';
                  else if (ach.metric === 'streak_days') unitText = ' Days';
                  else if (ach.metric === 'exams_taken' || ach.metric === 'perfect_exams') unitText = ' Exams';
                  else if (ach.metric === 'study_hours') unitText = ' Mins';

                  return (
                    <div key={i} className={`flex gap-4 items-center ${unlocked ? '' : 'opacity-70'}`}>
                      <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 relative ${unlocked ? 'bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-700' : 'bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700'}`}>
                        <span className="text-2xl leading-none">{ach.icon}</span>
                        <div className={`text-white text-[7px] font-bold px-1.5 py-0.5 rounded-sm absolute -bottom-2 shadow-sm uppercase tracking-wider ${ach.type === 'COMMON' ? 'bg-slate-900' : ach.type === 'RARE' ? 'bg-blue-600' : ach.type === 'EPIC' ? 'bg-purple-600' : 'bg-orange-500'}`}>
                          {ach.type}
                        </div>
                      </div>
                      <div className="flex-1 pt-1 ml-2">
                        <div className="flex justify-between items-end mb-1.5">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            {ach.title} 
                            {unlocked && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                          </h4>
                          <span className="text-[11px] font-bold text-slate-400">{current}/{ach.target}{unitText}</span>
                        </div>
                        <Progress value={progressPct} className={`h-1.5 mb-1 ${unlocked ? 'bg-green-100 [&>div]:bg-green-500' : 'bg-slate-100 dark:bg-slate-800'}`} />
                        <p className="text-[10px] text-slate-500 font-medium">{ach.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* RIGHT COLUMN: Subjects Report Sidebar */}
        <div className="w-full lg:w-[380px] shrink-0 space-y-6">
          
          {/* Radar Chart (Subject Proficiency) */}
          <Card className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 rounded-2xl">
            <CardHeader className="p-5 pb-0 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold">Subject Proficiency</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex justify-center">
              <div className="w-[300px] h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="Student"
                      dataKey="A"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fill="#8b5cf6"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 rounded-2xl sticky top-24">
            <CardHeader className="p-5 pb-4 flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm font-bold">Subjects Report</CardTitle>
              <ArrowRight className="w-4 h-4 text-slate-300" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[800px] min-h-[300px] overflow-y-auto pr-1 pl-2 py-2 custom-scrollbar space-y-2">
                {realSubjects.length > 0 ? (
                  realSubjects.map((sub, i) => {
                    const isOpen = openSubjects[sub.name];
                    
                    if (isOpen) {
                    return (
                      <div key={i} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-900 mx-2 shadow-sm">
                        <div 
                          className="flex justify-between items-center cursor-pointer mb-4"
                          onClick={() => toggleSubject(sub.name)}
                        >
                          <h4 className="font-bold text-[15px] text-slate-800 dark:text-slate-100">{sub.name}</h4>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-green-600">{sub.progress.toFixed(2)}%</span>
                            <div className="bg-slate-100 dark:bg-slate-800 rounded-full p-1 cursor-pointer hover:bg-slate-200 transition-colors">
                              <ChevronUp className="w-4 h-4 text-slate-500" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-start mb-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              <span className="w-2 h-2 rounded-full bg-green-500"></span> {sub.mcq.current}<span className="text-slate-400 font-medium">/{sub.mcq.total} {sub.mcq.pct && `(${sub.mcq.pct})`}</span>
                            </div>
                            <div className="text-[10px] font-semibold text-slate-400 ml-3.5">MCQ</div>
                          </div>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              <span className="w-2 h-2 rounded-full bg-blue-500"></span> {sub.cq.current}<span className="text-slate-400 font-medium">/{sub.cq.total} {sub.cq.pct && `(${sub.cq.pct})`}</span>
                            </div>
                            <div className="text-[10px] font-semibold text-slate-400 ml-3.5">CQ</div>
                          </div>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              <span className="w-2 h-2 rounded-full bg-purple-500"></span> {sub.content.current}<span className="text-slate-400 font-medium">/{sub.content.total} {sub.content.pct && `(${sub.content.pct})`}</span>
                            </div>
                            <div className="text-[10px] font-semibold text-slate-400 ml-3.5 uppercase">Content</div>
                          </div>
                        </div>
                        
                        <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full mb-4 overflow-hidden flex">
                          <div className="h-full bg-green-500" style={{ width: `${(sub.mcq.current / sub.mcq.total) * 100}%` }}></div>
                          <div className="h-full bg-blue-500" style={{ width: `${(sub.cq.current / sub.cq.total) * 100}%` }}></div>
                          <div className="h-full bg-purple-500" style={{ width: `${(sub.content.current / sub.content.total) * 100}%` }}></div>
                        </div>
                        
                        <div className="flex justify-between items-center mt-2">
                          <div className="text-[11px] text-slate-500 font-medium">
                            {sub.started ? `Started: ${sub.started}` : ''}
                          </div>
                          <div className="text-[11px] font-semibold text-blue-500 flex items-center gap-1 cursor-pointer hover:underline">
                            View Report <ArrowRight className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={i} 
                      className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group mx-2 rounded-xl"
                      onClick={() => toggleSubject(sub.name)}
                    >
                      <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">{sub.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-green-600">{sub.progress.toFixed(2)}%</span>
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-md p-1 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 mt-10">
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No textbook data found for this class.</p>
                </div>
              )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          margin-top: 10px;
          margin-bottom: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #94a3b8;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #475569;
        }
      `}</style>
    </div>
  );
}
