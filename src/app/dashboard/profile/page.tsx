'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRight,
  ChevronDown,
  User,
  Medal,
  FileText,
  Target,
  CheckCircle2,
  XCircle,
  MinusCircle,
  ChevronLeft,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

// MOCK DATA
const subjects = [
  { name: 'সাহিত্য কণিকা', progress: 0.96 },
  { name: 'আনন্দ পাঠ(বাংলা দ্রুত পঠন)', progress: 0.00 },
  { name: 'বাংলা ব্যাকরণ ও নির্মিতি', progress: 0.29 },
  { name: 'English for Today', progress: 0.00 },
  { name: 'English Grammar and C...', progress: 0.00 },
  { name: 'গণিত', progress: 0.00 },
  { name: 'তথ্য ও যোগাযোগ প্রযুক্তি', progress: 0.00 },
  { name: 'বাংলাদেশ ও বিশ্বপরিচয়', progress: 0.00 },
  { name: 'বিজ্ঞান', progress: 0.05 },
  { name: 'আরবি', progress: 0.00 },
  { name: 'সংস্কৃত', progress: 0.00 },
];

const achievements = [
  { title: 'Novice Explorer', desc: 'সর্বমোট ১০০ XP পয়েন্ট অর্জন করতে হবে।', current: 13, target: 100, icon: '🐣', type: 'COMMON' },
  { title: 'Curious Learner', desc: 'সর্বমোট ৫০০ XP পয়েন্ট অর্জন করতে হবে।', current: 13, target: 500, icon: '🎒', type: 'COMMON' },
  { title: 'Rising Star', desc: 'সর্বমোট ১,০০০ XP পয়েন্ট অর্জন করতে হবে।', current: 13, target: 1000, icon: '🌟', type: 'RARE' },
];

export default function ProfilePage() {
  const { user } = useAuth();

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
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-5 flex justify-between items-center relative">
            <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-6 h-3 bg-white dark:bg-slate-950 border-b border-l border-r border-purple-200 dark:border-purple-800 rounded-b-md flex justify-center items-center">
               <ChevronDown className="w-3 h-3 text-purple-300" />
            </div>
            <div>
              <h3 className="font-bold text-purple-800 dark:text-purple-300 text-lg">প্রিমিয়াম প্যাকেজে আপগ্রেড করুন</h3>
              <p className="text-xs font-medium text-purple-600/70 dark:text-purple-400 mt-1">সকল ফিচারে এক্সেস পেতে যেকোনো একটি প্যাকেজ সাবস্ক্রাইব করুন।</p>
            </div>
            <Button className="bg-[#a855f7] hover:bg-[#9333ea] text-white rounded-full font-bold px-6 shadow-md shadow-purple-500/20">
              সাবস্ক্রাইব করুন
            </Button>
          </div>

          {/* Learning Statistics */}
          <div>
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
          <Card className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 rounded-2xl">
            <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold">Achievements</CardTitle>
              <span className="text-[10px] font-bold text-[#00bcd4] cursor-pointer">VIEW ALL</span>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {achievements.map((ach, i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center shrink-0 relative">
                      <span className="text-2xl leading-none">{ach.icon}</span>
                      <div className={`text-white text-[7px] font-bold px-1.5 py-0.5 rounded-sm absolute -bottom-2 shadow-sm uppercase tracking-wider ${ach.type === 'COMMON' ? 'bg-slate-900' : 'bg-slate-900'}`}>
                        {ach.type}
                      </div>
                    </div>
                    <div className="flex-1 pt-1 ml-2">
                      <div className="flex justify-between items-end mb-1.5">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{ach.title}</h4>
                        <span className="text-[11px] font-bold text-slate-400">{ach.current}/{ach.target}</span>
                      </div>
                      <Progress value={(ach.current / ach.target) * 100} className="h-1.5 bg-slate-100 dark:bg-slate-800 mb-1" />
                      <p className="text-[10px] text-slate-500 font-medium">{ach.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* RIGHT COLUMN: Subjects Report Sidebar */}
        <div className="w-full lg:w-[350px] shrink-0">
          <Card className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 rounded-2xl sticky top-24">
            <CardHeader className="p-5 pb-4 flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm font-bold">Subjects Report</CardTitle>
              <ArrowRight className="w-4 h-4 text-slate-300" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800 h-[800px] overflow-y-auto pr-1 custom-scrollbar">
                {subjects.map((sub, i) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{sub.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-green-600">{sub.progress.toFixed(2)}%</span>
                      <div className="bg-slate-100 dark:bg-slate-800 rounded-md p-1 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>
                  </div>
                ))}
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
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #e2e8f0;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #334155;
        }
      `}</style>
    </div>
  );
}
