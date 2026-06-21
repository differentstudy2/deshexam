'use client';

import React, { useState } from 'react';
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
  Check,
  Star
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

// MOCK DATA
const subjects = [
  { 
    name: 'সাহিত্য কণিকা', 
    progress: 0.96,
    mcq: { current: 10, total: 2389, pct: '0.42%' },
    cq: { current: 0, total: 1845, pct: '' },
    content: { current: 1, total: 186, pct: '0.54%' },
    started: '4 months ago'
  },
  { 
    name: 'আনন্দ পাঠ(বাংলা দ্রুত পঠন)', 
    progress: 0.00,
    mcq: { current: 0, total: 255, pct: '' },
    cq: { current: 0, total: 118, pct: '' },
    content: { current: 0, total: 41, pct: '' },
    started: ''
  },
  { 
    name: 'বাংলা ব্যাকরণ ও নির্মিতি', 
    progress: 0.29,
    mcq: { current: 2, total: 700, pct: '0.29%' },
    cq: { current: 0, total: 385, pct: '' },
    content: { current: 0, total: 76, pct: '' },
    started: '4 months ago'
  },
  { name: 'English for Today', progress: 0.00, mcq: { current: 0, total: 100 }, cq: { current: 0, total: 50 }, content: { current: 0, total: 20 }, started: '' },
  { name: 'English Grammar and C...', progress: 0.00, mcq: { current: 0, total: 100 }, cq: { current: 0, total: 50 }, content: { current: 0, total: 20 }, started: '' },
  { name: 'গণিত', progress: 0.00, mcq: { current: 0, total: 100 }, cq: { current: 0, total: 50 }, content: { current: 0, total: 20 }, started: '' },
  { name: 'তথ্য ও যোগাযোগ প্রযুক্তি', progress: 0.00, mcq: { current: 0, total: 100 }, cq: { current: 0, total: 50 }, content: { current: 0, total: 20 }, started: '' },
  { name: 'বাংলাদেশ ও বিশ্বপরিচয়', progress: 0.00, mcq: { current: 0, total: 100 }, cq: { current: 0, total: 50 }, content: { current: 0, total: 20 }, started: '' },
  { name: 'বিজ্ঞান', progress: 0.05, mcq: { current: 1, total: 100 }, cq: { current: 0, total: 50 }, content: { current: 0, total: 20 }, started: '' },
  { name: 'আরবি', progress: 0.00, mcq: { current: 0, total: 100 }, cq: { current: 0, total: 50 }, content: { current: 0, total: 20 }, started: '' },
  { name: 'সংস্কৃত', progress: 0.00, mcq: { current: 0, total: 100 }, cq: { current: 0, total: 50 }, content: { current: 0, total: 20 }, started: '' },
];

import { ACHIEVEMENTS } from '@/lib/constants/achievements';
import { awardXP } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [openSubjects, setOpenSubjects] = useState<Record<string, boolean>>({});
  const [isAddingXp, setIsAddingXp] = useState(false);

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
    } catch (e) {
      console.error(e);
    } finally {
      setIsAddingXp(false);
    }
  };

  const toggleSubject = (name: string) => {
    setOpenSubjects(prev => ({ ...prev, [name]: !prev[name] }));
  };

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
                  <div className="w-20 h-20 rounded-full bg-[#00bcd4] text-white flex items-center justify-center text-3xl font-bold">
                    JM
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Jahanur Miah</h2>
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">✓</div>
                      <User className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500 font-medium mb-1">@jahanur-miah • Joined Jan 2026</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-bold mb-3">অষ্টম শ্রেণি</p>
                    
                    <div className="flex items-center gap-4 text-xs font-bold">
                      <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        <span className="w-3 h-3 bg-blue-600 text-white flex items-center justify-center text-[8px] rounded-sm">1</span> LVL 1
                      </div>
                      <span className="text-orange-500">Bronze League</span>
                      <span className="text-blue-500">Followers: 0</span>
                      <span className="text-blue-500">Followings: 0</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5">
                    <span className="text-yellow-300">●</span> 9
                  </div>
                  <div className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md text-xs font-bold tracking-wider">
                    FREE PLAN
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upgrade Banner */}
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl relative transition-all duration-300">
            <div className="p-5 flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
              <div>
                <h3 className="font-bold text-purple-800 dark:text-purple-300 text-lg">প্রিমিয়াম প্যাকেজে আপগ্রেড করুন</h3>
                <p className="text-xs font-medium text-purple-600/70 dark:text-purple-400 mt-1">সকল ফিচারে এক্সেস পেতে যেকোনো একটি প্যাকেজ সাবস্ক্রাইব করুন।</p>
              </div>
              <Button className="bg-[#a855f7] hover:bg-[#9333ea] text-white rounded-full font-bold px-6 shadow-md shadow-purple-500/20 shrink-0">
                সাবস্ক্রাইব করুন
              </Button>
            </div>
            
            {isUpgradeOpen && (
              <div className="px-8 pb-8 pt-2">
                <div className="w-full h-px bg-purple-200/50 dark:bg-purple-800/50 mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-800 dark:text-slate-200">
                      <Check className="w-4 h-4 text-green-500 shrink-0" strokeWidth={3} /> বিগত বছরের প্রশ্ন
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-800 dark:text-slate-200">
                      <Check className="w-4 h-4 text-green-500 shrink-0" strokeWidth={3} /> আনলিমিটেড পরীক্ষা ও ব্যাখ্যা
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-800 dark:text-slate-200">
                      <Check className="w-4 h-4 text-green-500 shrink-0" strokeWidth={3} /> ডাউট সলভিং চ্যাট AI
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-800 dark:text-slate-200">
                      <Check className="w-4 h-4 text-green-500 shrink-0" strokeWidth={3} /> ইচ্ছেমত কাস্টম মক টেস্ট
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-800 dark:text-slate-200">
                      <Check className="w-4 h-4 text-green-500 shrink-0" strokeWidth={3} /> অ্যাড ফ্রি কনটেন্ট ও ∞ পেজ ভিউ
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-800 dark:text-slate-200">
                      <Check className="w-4 h-4 text-green-500 shrink-0" strokeWidth={3} /> DeshExam (বুক ডাউনলোড)
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-800 dark:text-slate-200">
                      <Check className="w-4 h-4 text-green-500 shrink-0" strokeWidth={3} /> প্রিমিয়াম ভিডিও কোর্স ও মডেল টেস্ট
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-800 dark:text-slate-200">
                      <Check className="w-4 h-4 text-green-500 shrink-0" strokeWidth={3} /> সারা দেশব্যাপী লিডারবোর্ড
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-800 dark:text-slate-200">
                      <Check className="w-4 h-4 text-green-500 shrink-0" strokeWidth={3} /> ২৪/৭ লাইভ সাপোর্ট
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

          <div className="flex justify-end">
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
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">0</div>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-slate-200 dark:border-slate-800 rounded-xl">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">⚡ XP Earned</div>
                  <div className="text-2xl font-bold text-blue-500">33</div>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-slate-200 dark:border-slate-800 rounded-xl">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400"><Medal className="w-4 h-4 text-orange-400"/> Rank (Bronze)</div>
                  <div className="text-2xl font-bold text-orange-500">288</div>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-slate-200 dark:border-slate-800 rounded-xl">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400"><FileText className="w-4 h-4"/> Exams Taken</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">7</div>
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
                  <span className="w-2 h-2 rounded-full bg-teal-500"></span> Jahanur Miah
                </div>
                <div className="text-xs font-bold text-slate-400">0 XP</div>
              </div>
              
              {/* Custom SVG Line Chart matching screenshot */}
              <div className="w-full h-[150px] relative mt-4">
                {/* Y Axis labels */}
                <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-slate-400 font-medium">
                  <span>1.3</span>
                  <span>1</span>
                  <span>0</span>
                </div>
                
                {/* Graph Area */}
                <div className="absolute left-6 right-0 top-0 bottom-6">
                  {/* Grid lines */}
                  <div className="absolute w-full top-0 border-t border-slate-100 dark:border-slate-800"></div>
                  <div className="absolute w-full top-[23%] border-t border-slate-100 dark:border-slate-800"></div>
                  <div className="absolute w-full bottom-0 border-t-2 border-teal-500 z-10"></div>
                  
                  {/* Data Points (all at Y=0 / bottom) */}
                  <div className="absolute bottom-0 w-full flex justify-between px-1 translate-y-1/2 z-20">
                    {[0,1,2,3,4,5,6].map(i => (
                      <div key={i} className="w-3 h-3 bg-teal-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                    ))}
                  </div>
                </div>
                
                {/* X Axis labels */}
                <div className="absolute left-6 right-0 bottom-0 flex justify-between text-[10px] text-slate-400 font-medium px-0.5">
                  <span>Sat</span>
                  <span>Sun</span>
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Streaks Calendar */}
          <Card className="shadow-sm border-slate-200 dark:border-slate-800 rounded-2xl">
            <CardHeader className="py-4">
               <div className="flex justify-between items-center px-4">
                 <ChevronLeft className="w-4 h-4 text-slate-400 cursor-pointer" />
                 <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Streaks | June 2026</h3>
                 <ChevronRightIcon className="w-4 h-4 text-slate-400 cursor-pointer" />
               </div>
            </CardHeader>
            <CardContent className="px-8 pb-8">
               <div className="grid grid-cols-7 text-center gap-y-6">
                 {/* Weekday Headers */}
                 <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Sun</div>
                 <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Mon</div>
                 <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Tue</div>
                 <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Wed</div>
                 <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Thu</div>
                 <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Fri</div>
                 <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Sat</div>
                 
                 {/* Dates Row 1 */}
                 <div className="text-xs font-semibold text-slate-300 dark:text-slate-600">31</div>
                 <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">1</div>
                 <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">2</div>
                 <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">3</div>
                 <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">4</div>
                 <div className="flex justify-center relative">
                   <div className="w-7 h-7 bg-red-400 text-white rounded-full flex items-center justify-center text-xs font-bold -mt-1.5 shadow-sm shadow-red-400/50">5</div>
                 </div>
                 <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">6</div>
                 
                 {/* Dates Row 2 */}
                 <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">7</div>
                 <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">8</div>
                 <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">9</div>
                 <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">10</div>
                 <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">11</div>
                 <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">12</div>
                 <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">13</div>

                 {/* Dates Row 3 */}
                 <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">14</div>
                 <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">15</div>
                 <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">16</div>
                 <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">17</div>
                 <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">18</div>
                 <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">19</div>
                 <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">20</div>

                 {/* Dates Row 4 */}
                 <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">21</div>
                 <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">22</div>
                 <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">23</div>
                 <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">24</div>
                 <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">25</div>
                 <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">26</div>
                 <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">27</div>

                 {/* Dates Row 5 */}
                 <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">28</div>
                 <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">29</div>
                 <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">30</div>
                 <div className="text-xs font-semibold text-slate-300 dark:text-slate-600">1</div>
                 <div className="text-xs font-semibold text-slate-300 dark:text-slate-600">2</div>
                 <div className="text-xs font-semibold text-slate-300 dark:text-slate-600">3</div>
                 <div className="text-xs font-semibold text-slate-300 dark:text-slate-600">4</div>
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
        <div className="w-full lg:w-[380px] shrink-0">
          <Card className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 rounded-2xl sticky top-24">
            <CardHeader className="p-5 pb-4 flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm font-bold">Subjects Report</CardTitle>
              <ArrowRight className="w-4 h-4 text-slate-300" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[800px] overflow-y-auto pr-1 pl-2 py-2 custom-scrollbar space-y-2">
                {subjects.map((sub, i) => {
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
                })}
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
