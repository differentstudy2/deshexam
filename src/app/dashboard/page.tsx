'use client';

import { useAuth } from '@/hooks/use-auth';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRight,
  Target as TargetIcon,
  Award,
  ChevronDown,
  Settings,
  User as UserIcon,
  Trash2,
  Trophy,
  Users
} from 'lucide-react';
import Link from 'next/link';

// --- MOCK DATA ---

const subjects = [
  { name: 'সাহিত্য কণিকা', progress: 0.96 },
  { name: 'আনন্দ পাঠ(বাংলা দ্রুত পঠন)', progress: 0.00 },
  { name: 'বাংলা ব্যাকরণ ও নির্মিতি', progress: 0.29 },
  { name: 'English for Today', progress: 0.00 },
  { name: 'English Grammar and C...', progress: 0.00 },
];

const recentActivities = [
  { title: 'Exam Taken', time: '2 months ago', xp: '+0 XP' },
  { title: 'MCQ Practice', time: '4 months ago', xp: '+0 XP' },
  { title: 'MCQ Practice', time: '4 months ago', xp: '+1 XP' },
  { title: 'Exam Taken', time: '4 months ago', xp: '+9 XP' },
];

const attendedExams = [
  { title: 'সাহিত্য কণিকা', time: '6 months ago', duration: '19 Mins', score: '-0.20/33', right: 0, wrong: 1, skipped: 31, scoreColor: 'text-green-600' },
  { title: 'Fast Practice - পদ্য', time: '4 months ago', duration: '9 Mins', score: '0.00/1', right: 0, wrong: 1, skipped: 0, scoreColor: 'text-slate-800' },
  { title: 'Fast Practice - গদ্য/কবিতা', time: '4 months ago', duration: '54 Mins', score: '1.00/5', right: 1, wrong: 4, skipped: 0, scoreColor: 'text-green-600' },
];

const leaderboard = [
  { rank: 1, name: 'Sunil Chandra Barman', xp: 224 },
  { rank: 2, name: 'Nehar Akter', xp: 191 },
  { rank: 3, name: 'Shammi Akter', xp: 189 },
  { rank: 4, name: 'A.N.M Badrul Alam', xp: 165 },
  { rank: 5, name: 'Maktuma akter mina', xp: 125 },
  { rank: 6, name: 'Foisal Hasan Rahat', xp: 71 },
];

const achievements = [
  { title: 'Novice Explorer', desc: 'সর্বমোট ১০০ XP পয়েন্ট অর্জন করতে হবে।', current: 13, target: 100, icon: '🐣' },
  { title: 'Curious Learner', desc: 'সর্বমোট ৫০০ XP পয়েন্ট অর্জন করতে হবে।', current: 13, target: 500, icon: '🎒' },
  { title: 'Rising Star', desc: 'সর্বমোট ১,০০০ XP পয়েন্ট অর্জন করতে হবে।', current: 13, target: 1000, icon: '🌟' },
  { title: 'Scholar', desc: 'সর্বমোট ৫,০০০ XP পয়েন্ট অর্জন করতে হবে।', current: 13, target: 5000, icon: '🎓' },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 pb-12 w-full max-w-[1400px] mx-auto text-slate-800 dark:text-slate-100">
      
      {/* ROW 1: Missions */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">Missions 🚀</h2>
          <Button variant="ghost" className="text-sm font-medium text-slate-500 hover:text-green-600">View All</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {/* Mission 1 */}
           <Card className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-green-200 transition-colors">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-3">
                  <div className="bg-blue-50 p-2 rounded-xl h-10 w-10 flex items-center justify-center shrink-0">
                    <TargetIcon className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">৫টি মক টেস্ট দিন</h4>
                    <p className="text-xs text-slate-500 mt-1">Progress: 0/5 (0%)</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-blue-50 text-blue-600 text-[10px]">Daily</Badge>
              </div>
              <Progress value={0} className="h-1.5 bg-slate-100 dark:bg-slate-800 mb-4" />
              <div className="flex gap-2">
                 <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-600 text-[10px] gap-1 px-2 py-0">
                   <TargetIcon className="w-3 h-3" /> 2
                 </Badge>
                 <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-600 text-[10px] gap-1 px-2 py-0">
                   <Award className="w-3 h-3" /> 10
                 </Badge>
              </div>
            </CardContent>
           </Card>

           {/* Mission 2 */}
           <Card className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-green-200 transition-colors">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-3">
                  <div className="bg-red-50 p-2 rounded-xl h-10 w-10 flex items-center justify-center shrink-0">
                    <TargetIcon className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">১০টি ভুল রিভিউ করুন</h4>
                    <p className="text-xs text-slate-500 mt-1">Progress: 0/10 (0%)</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-blue-50 text-blue-600 text-[10px]">Daily</Badge>
              </div>
              <Progress value={0} className="h-1.5 bg-slate-100 dark:bg-slate-800 mb-4" />
              <div className="flex gap-2">
                 <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-600 text-[10px] gap-1 px-2 py-0">
                   <TargetIcon className="w-3 h-3" /> 2
                 </Badge>
                 <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-600 text-[10px] gap-1 px-2 py-0">
                   <Award className="w-3 h-3" /> 8
                 </Badge>
              </div>
            </CardContent>
           </Card>

           {/* Mission 3 */}
           <Card className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-green-200 transition-colors relative">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-3">
                  <div className="bg-orange-50 p-2 rounded-xl h-10 w-10 flex items-center justify-center shrink-0">
                    <TargetIcon className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">দৈনিক স্ট্রিক বজায় রাখুন</h4>
                    <p className="text-xs text-slate-500 mt-1">Mission in progress</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-blue-50 text-blue-600 text-[10px]">Daily</Badge>
              </div>
              <Progress value={0} className="h-1.5 bg-slate-100 dark:bg-slate-800 mb-4" />
              <div className="flex gap-2">
                 <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-600 text-[10px] gap-1 px-2 py-0">
                   <TargetIcon className="w-3 h-3" /> 1
                 </Badge>
                 <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-600 text-[10px] gap-1 px-2 py-0">
                   <Award className="w-3 h-3" /> 5
                 </Badge>
              </div>
            </CardContent>
           </Card>
        </div>
      </div>

      {/* ROW 2: Subjects Report & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Subjects Report */}
        <Card className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 rounded-2xl">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-bold">Subjects Report</CardTitle>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {subjects.map((sub, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                  <span className="text-sm font-medium">{sub.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-green-600">{sub.progress.toFixed(2)}%</span>
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-md p-1 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 rounded-2xl">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-bold">Recent Activities</CardTitle>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent className="p-5 space-y-6">
            {recentActivities.map((activity, i) => (
              <div key={i} className="flex gap-4 items-center">
                 <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center shrink-0">
                   <Trash2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                 </div>
                 <div className="flex-1 flex justify-between items-center">
                   <div>
                     <h4 className="font-bold text-sm">{activity.title}</h4>
                     <p className="text-xs text-slate-400 mt-0.5">{activity.time}</p>
                   </div>
                   <Badge className="bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-700 dark:text-green-400 border-none px-3 py-1 shadow-none rounded-full">
                     ★ {activity.xp}
                   </Badge>
                 </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ROW 3: Question Bank, Attended Exams, Course Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Question Bank */}
        <Card className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 rounded-2xl h-full">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between border-b border-transparent">
            <CardTitle className="text-sm font-bold">Question Bank</CardTitle>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent className="p-8 flex flex-col items-center justify-center text-center h-[250px]">
            <p className="text-sm font-medium text-slate-500 mb-6">No question bank progress found.</p>
            <Button className="bg-blue-600 hover:bg-blue-700 rounded-lg px-6 h-10 font-bold shadow-md shadow-blue-500/20 text-white">View Question Banks</Button>
          </CardContent>
        </Card>

        {/* Attended Exams */}
        <Card className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 rounded-2xl h-full">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-bold">Attended Exams</CardTitle>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {attendedExams.map((exam, i) => (
                <div key={i} className="p-5 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{exam.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{exam.time}</p>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold text-sm ${exam.scoreColor}`}>{exam.score}</div>
                      <p className="text-[11px] text-slate-400">{exam.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] font-medium text-slate-500">
                    <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> {exam.right} Right</span>
                    <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-500" /> {exam.wrong} Wrong</span>
                    <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" /> {exam.skipped} Skipped</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Course Progress */}
        <Card className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 rounded-2xl h-full">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between border-b border-transparent">
            <CardTitle className="text-sm font-bold">Course Progress</CardTitle>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent className="p-8 flex flex-col items-center justify-center text-center h-[250px]">
            <p className="text-sm font-medium text-slate-500 mb-6">No course progress found.</p>
            <Button className="bg-green-600 hover:bg-green-700 rounded-lg px-6 h-10 font-bold shadow-md shadow-green-500/20 text-white">View Courses</Button>
          </CardContent>
        </Card>

      </div>

      {/* ROW 4: Bronze League & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Bronze League + Followers */}
        <div className="space-y-6">
          <Card className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 rounded-2xl relative overflow-hidden">
            <CardHeader className="p-5 pb-4 flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 dark:bg-orange-950/50 rounded-lg">
                  <Trophy className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">Bronze League</CardTitle>
                  <p className="text-[11px] text-slate-500 mt-0.5">Earn some XP to show your position on the list. <span className="text-blue-500 font-medium cursor-pointer">Practice →</span></p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-slate-400 cursor-pointer">
                <span className="text-xs font-medium">Leaderboard</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-slate-50 dark:divide-slate-800/50 p-2">
                 {leaderboard.map((user, i) => (
                   <div key={i} className="px-4 py-3 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                       <span className="text-xs font-bold text-slate-400 w-6">#{user.rank}</span>
                       <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{user.name}</span>
                     </div>
                     <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{user.xp} XP</span>
                   </div>
                 ))}
               </div>
            </CardContent>
          </Card>

          {/* Tabs underneath leaderboard */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex gap-8 border-b border-slate-100 dark:border-slate-800 mb-8">
              <button className="border-b-2 border-green-500 text-green-600 font-bold text-xs tracking-wider pb-3 uppercase">
                Followers (0)
              </button>
              <button className="text-slate-400 hover:text-slate-600 font-bold text-xs tracking-wider pb-3 uppercase">
                Followings (0)
              </button>
            </div>
            
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <Users className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">Nothing to show</p>
            </div>
          </div>
        </div>

        {/* Right Column: Achievements */}
        <Card className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 rounded-2xl h-fit">
          <CardHeader className="p-5 pb-4 flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-bold">Achievements</CardTitle>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent className="p-5">
            <div className="space-y-6">
              {achievements.map((ach, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center shrink-0">
                    <span className="text-xl leading-none">{ach.icon}</span>
                    <div className="bg-slate-900 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm absolute mt-12 shadow-sm uppercase tracking-wider">
                      Locked
                    </div>
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex justify-between items-end mb-1">
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

      {/* Footer Actions */}
      <div className="flex flex-col items-center justify-center pt-8 pb-4 text-slate-400 text-xs font-medium gap-3">
        <button className="flex items-center gap-1.5 hover:text-slate-600 transition-colors">
          <Settings className="w-3.5 h-3.5"/> Customize Dashboard
        </button>
        <button className="flex items-center gap-1.5 hover:text-slate-600 transition-colors">
          <UserIcon className="w-3.5 h-3.5"/> Change User Type
        </button>
      </div>

    </div>
  );
}
