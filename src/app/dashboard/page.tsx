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
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Zap, 
  Trophy, 
  Target, 
  FileText, 
  Book, 
  Flame, 
  Clock, 
  Edit3, 
  ArrowRight,
  Target as TargetIcon,
  Medal,
  Award,
  Lock,
  ChevronDown,
  MessageSquare,
  Settings,
  User as UserIcon
} from 'lucide-react';
import Link from 'next/link';

// Mock Data
const engagementData = [
  { day: 'Sat', value: 0 },
  { day: 'Sun', value: 0 },
  { day: 'Mon', value: 0 },
  { day: 'Tue', value: 0 },
  { day: 'Wed', value: 0 },
  { day: 'Thu', value: 0 },
  { day: 'Fri', value: 0 },
];

const accuracyData = [
  { name: 'Right', value: 0, color: '#00a651' },
  { name: 'Wrong', value: 1, color: '#ef4444' }, // Just to show the gray circle
];
const COLORS = ['#00a651', '#f1f5f9'];

const quickLinks = [
  { name: 'Practice', icon: <Play className="w-5 h-5 text-green-500" /> },
  { name: 'Question Bank', icon: <Zap className="w-5 h-5 text-green-500" /> },
  { name: 'Leaderboard', icon: <Trophy className="w-5 h-5 text-green-500" /> },
  { name: 'Challenges', icon: <Target className="w-5 h-5 text-green-500" /> },
  { name: 'Exams', icon: <FileText className="w-5 h-5 text-green-500" /> },
  { name: 'Books', icon: <Book className="w-5 h-5 text-green-500" /> },
];

const subjects = [
  { name: 'আমার বাংলা বই', progress: 0 },
  { name: 'English For Today', progress: 0 },
  { name: 'প্রাথমিক গণিত', progress: 0 },
  { name: 'প্রাথমিক বিজ্ঞান', progress: 0 },
  { name: 'বাংলাদেশ ও বিশ্বপরিচয়', progress: 0 },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Row */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        <div className="flex-1 overflow-x-auto pb-2 custom-scrollbar">
          <div className="flex gap-4 min-w-max">
            {quickLinks.map((link, idx) => (
              <Button key={idx} variant="outline" className="flex flex-col items-center justify-center h-24 w-28 bg-white border-slate-200 hover:border-green-200 hover:bg-green-50 rounded-2xl gap-2 shadow-sm transition-all">
                <div className="bg-green-100/50 p-2 rounded-full">
                  {link.icon}
                </div>
                <span className="text-xs font-semibold text-slate-600">{link.name}</span>
              </Button>
            ))}
          </div>
        </div>
        
        <Card className="w-full lg:w-[320px] shrink-0 bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200 shadow-sm rounded-2xl flex items-center p-4">
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-2xl shadow-sm">
               <Flame className="w-8 h-8 text-orange-500 fill-orange-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg leading-tight">Current Streak</h3>
              <div className="flex items-baseline gap-1">
                <span className="font-extrabold text-2xl text-orange-500">0</span>
                <span className="text-sm font-medium text-slate-600">Day</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Practice some MCQ to start your streak! 🔥</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Study Stats */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">Your Study Stats Last 7 Days</h2>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-md shadow-sm">7D</button>
            <button className="px-3 py-1 text-slate-500 text-xs font-bold rounded-md hover:bg-slate-200">15D</button>
            <button className="px-3 py-1 text-slate-500 text-xs font-bold rounded-md hover:bg-slate-200">30D</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column Stats */}
          <div className="space-y-4">
            <Card className="bg-white shadow-sm border-slate-200 rounded-2xl">
              <CardContent className="p-5 flex flex-col justify-between h-[120px]">
                <div className="flex justify-between items-center text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">STUDY TIME</span>
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-3xl font-bold text-slate-800">0s</div>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-sm border-slate-200 rounded-2xl">
              <CardContent className="p-5 flex flex-col justify-between h-[120px]">
                <div className="flex justify-between items-center text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">EXAM TAKEN</span>
                  <Edit3 className="w-4 h-4" />
                </div>
                <div className="text-3xl font-bold text-slate-800">0</div>
              </CardContent>
            </Card>
          </div>

          {/* Accuracy */}
          <Card className="bg-white shadow-sm border-slate-200 rounded-2xl relative">
            <CardContent className="p-5 flex flex-col h-full">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-800">Accuracy</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
              <div className="flex-1 flex flex-col items-center justify-center relative mt-4">
                <div className="h-[120px] w-[120px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={accuracyData}
                        innerRadius={45}
                        outerRadius={55}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {accuracyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-green-500">0%</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">ACC.</span>
                  </div>
                </div>
                
                <div className="flex gap-4 mt-4 text-xs font-medium text-slate-500">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div>0 Wrong</div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div>0 Right</div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-300"></div>0 Skipped</div>
                </div>
                <div className="text-xs text-slate-400 mt-2">Practice More...</div>
              </div>
            </CardContent>
          </Card>

          {/* Engagement */}
          <Card className="bg-white shadow-sm border-slate-200 rounded-2xl">
            <CardContent className="p-5 h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-slate-800">Your Engagement</span>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                  <div className="w-6 h-2 bg-green-100 border border-green-500 rounded-sm"></div>
                  Your Engagement
                </div>
              </div>
              <div className="flex-1 h-[150px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={engagementData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorEngage" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00a651" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#00a651" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Area type="step" dataKey="value" stroke="#00a651" strokeWidth={2} fillOpacity={1} fill="url(#colorEngage)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Missions */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">Missions 🚀</h2>
          <Button variant="ghost" className="text-sm font-medium text-slate-500 hover:text-green-600">View All <ArrowRight className="ml-1 w-4 h-4" /></Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {/* Mission 1 */}
           <Card className="bg-white shadow-sm border-slate-200 rounded-2xl overflow-hidden hover:border-green-200 transition-colors">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-3">
                  <div className="bg-blue-50 p-2 rounded-xl h-10 w-10 flex items-center justify-center shrink-0">
                    <TargetIcon className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">৫টি মক টেস্ট দিন</h4>
                    <p className="text-xs text-slate-500 mt-1">Progress: 0/5 (0%)</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-blue-50 text-blue-600 text-[10px]">Daily</Badge>
              </div>
              <Progress value={0} className="h-1.5 bg-slate-100 mb-4" />
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
           <Card className="bg-white shadow-sm border-slate-200 rounded-2xl overflow-hidden hover:border-green-200 transition-colors">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-3">
                  <div className="bg-red-50 p-2 rounded-xl h-10 w-10 flex items-center justify-center shrink-0">
                    <TargetIcon className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">১০টি ভুল রিভিউ করুন</h4>
                    <p className="text-xs text-slate-500 mt-1">Progress: 0/10 (0%)</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-blue-50 text-blue-600 text-[10px]">Daily</Badge>
              </div>
              <Progress value={0} className="h-1.5 bg-slate-100 mb-4" />
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
           <Card className="bg-white shadow-sm border-slate-200 rounded-2xl overflow-hidden hover:border-green-200 transition-colors relative">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-3">
                  <div className="bg-orange-50 p-2 rounded-xl h-10 w-10 flex items-center justify-center shrink-0">
                    <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">দৈনিক স্ট্রিক বজায় রাখুন</h4>
                    <p className="text-xs text-slate-500 mt-1">Mission in progress</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-blue-50 text-blue-600 text-[10px]">Daily</Badge>
              </div>
              <Progress value={0} className="h-1.5 bg-slate-100 mb-4" />
              <div className="flex gap-2">
                 <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-600 text-[10px] gap-1 px-2 py-0">
                   <TargetIcon className="w-3 h-3" /> 1
                 </Badge>
                 <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-600 text-[10px] gap-1 px-2 py-0">
                   <Award className="w-3 h-3" /> 5
                 </Badge>
              </div>
            </CardContent>
            
            <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/3 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white cursor-pointer hover:scale-105 transition-transform">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
           </Card>
        </div>
      </div>

      {/* Grid for Bottom Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Subjects Report */}
        <Card className="bg-white shadow-sm border-slate-200 rounded-2xl">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-800">Subjects Report</CardTitle>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {subjects.map((sub, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group">
                  <span className="text-sm font-medium text-slate-700">{sub.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-green-600">{sub.progress.toFixed(2)}%</span>
                    <div className="bg-slate-100 rounded-md p-1 group-hover:bg-slate-200 transition-colors">
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="bg-white shadow-sm border-slate-200 rounded-2xl">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-800">Recent Activities</CardTitle>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent className="p-5">
            <div className="flex gap-4">
               <div className="mt-1 relative flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0 z-10">
                    <FileText className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="w-px h-full bg-slate-200 absolute top-8 bottom-0 -z-0 hidden"></div>
               </div>
               <div className="flex-1 pb-6">
                 <div className="flex justify-between items-start">
                   <div>
                     <h4 className="font-bold text-sm text-slate-800">Onboarding Bonus</h4>
                     <p className="text-xs text-slate-400 mt-1">23 minutes ago</p>
                   </div>
                   <Badge className="bg-green-100 hover:bg-green-100 text-green-700 border-none px-3 shadow-none">
                     ★ +30 XP
                   </Badge>
                 </div>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Attended Exams */}
        <Card className="bg-white shadow-sm border-slate-200 rounded-2xl">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-800">Attended Exams</CardTitle>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent className="p-8 flex flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-slate-400 mb-4">No exam results found.</p>
            <Button className="bg-purple-600 hover:bg-purple-700 rounded-lg px-6 h-9">View Exams</Button>
          </CardContent>
        </Card>

        {/* Course Progress */}
        <Card className="bg-white shadow-sm border-slate-200 rounded-2xl">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-800">Course Progress</CardTitle>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent className="p-8 flex flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-slate-400 mb-4">No course progress found.</p>
            <Button className="bg-green-600 hover:bg-green-700 rounded-lg px-6 h-9">View Courses</Button>
          </CardContent>
        </Card>

        {/* Achievements - Full Width Below */}
        <Card className="bg-white shadow-sm border-slate-200 rounded-2xl lg:col-span-2">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-800">Achievements</CardTitle>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent className="p-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-100">
               <div className="flex flex-col items-center justify-center text-center p-4">
                 <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                   <Lock className="w-6 h-6 text-slate-300" />
                 </div>
                 <h4 className="font-bold text-slate-800 mb-1">Join the League!</h4>
                 <p className="text-xs text-slate-400 mb-3">Earn XP to join a league and compete.</p>
                 <Link href="#" className="text-sm font-bold text-green-600 hover:underline">Start Learning →</Link>
               </div>
               
               <div className="flex flex-col items-center justify-center text-center p-4 pt-8 md:pt-4">
                 <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                   <TargetIcon className="w-8 h-8 text-red-500" />
                 </div>
                 <p className="text-xs font-medium text-slate-500 mb-2">No achievements in progress.</p>
                 <Link href="#" className="text-sm text-blue-500 hover:underline">View all badges</Link>
               </div>
             </div>
          </CardContent>
        </Card>

      </div>
      
      <div className="flex flex-col items-center justify-center py-6 text-slate-400 text-xs font-medium gap-2">
        <button className="flex items-center gap-1 hover:text-slate-600"><Settings className="w-3 h-3"/> Customize Dashboard</button>
        <button className="flex items-center gap-1 hover:text-slate-600"><UserIcon className="w-3 h-3"/> Change User Type</button>
      </div>
    </div>
  );
}
