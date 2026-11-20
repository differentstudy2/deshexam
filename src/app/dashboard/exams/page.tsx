'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { getUserProfile } from '@/lib/firebase/firestore';
import { getAssessmentBySlug } from '@/lib/firebase/assessment';
import { AssessmentCard } from '@/components/assessment/AssessmentCard';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight,
  HelpCircle,
  Clock,
  Award,
  Play,
  ArrowLeft,
  ChevronDown,
  Star,
  Users,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

// MOCK DATA

const statusTabs = [
  { name: 'All', active: true },
  { name: 'Ongoing', active: false },
  { name: 'Upcoming', active: false },
  { name: 'Archived', active: false },
  { name: 'Live', active: false },
];

const accessTabs = [
  'All',
  'Purchased',
  'Free',
  'Paid',
  'Subscribed',
];

const subjectTabs = [
  { name: 'আমার বাংলা বই', count: 23 },
  { name: 'প্রাথমিক গণিত', count: 13 },
  { name: 'বাংলাদেশ ও বিশ্বপরিচয়', count: 13 },
  { name: 'প্রাথমিক বিজ্ঞান', count: 11 },
  { name: 'ইসলাম শিক্ষা', count: 5 },
  { name: 'হিন্দুধর্ম শিক্ষা', count: 5 },
];

const exams = [
  "৩য় শ্রেণী হিন্দুধর্ম শিক্ষা অধ্যায়ভিত্তিক লার্নিং টেস্ট - প্রকৃতি ও পরিবেশ এবং দেশপ্রেম",
  "৩য় শ্রেণী হিন্দুধর্ম শিক্ষা অধ্যায়ভিত্তিক লার্নিং টেস্ট - নৈতিক ও মানবিক গুণাবলি",
  "৩য় শ্রেণী হিন্দুধর্ম শিক্ষা অধ্যায়ভিত্তিক লার্নিং টেস্ট - ধর্মগ্রন্থ, পূজা-পার্বণ ও ধর্মীয় উৎসব...",
  "৩য় শ্রেণী হিন্দুধর্ম শিক্ষা অধ্যায়ভিত্তিক লার্নিং টেস্ট - স্রষ্টা ও সৃষ্টি এবং উপাসনা ও প্রার্থনা",
  "৩য় শ্রেণী হিন্দুধর্ম শিক্ষা অধ্যায়ভিত্তিক লার্নিং টেস্ট - আদর্শ জীবনচরিত",
  "৩য় শ্রেণী ইসলাম শিক্ষা অধ্যায়ভিত্তিক লার্নিং টেস্ট - জীবজগৎ ও প্রকৃতির প্রতি...",
  "৩য় শ্রেণী ইসলাম শিক্ষা অধ্যায়ভিত্তিক লার্নিং টেস্ট - নৈতিক ও মানবিক গুণাবলি অর্জন",
  "৩য় শ্রেণী ইসলাম শিক্ষা অধ্যায়ভিত্তিক লার্নিং টেস্ট - ধর্মীয় সম্প্রীতি",
  "৩য় শ্রেণী ইসলাম শিক্ষা অধ্যায়ভিত্তিক লার্নিং টেস্ট - স্রষ্টা ও সৃষ্টি",
  "৩য় শ্রেণী ইসলাম শিক্ষা অধ্যায়ভিত্তিক লার্নিং টেস্ট - নবি, রাসুল ও মহানবি (স.) এর...",
  "৩য় শ্রেণী বাংলাদেশ ও বিশ্বপরিচয় অধ্যায়ভিত্তিক লার্নিং টেস্ট - বিভিন্ন পেশা",
  "৩য় শ্রেণী বাংলাদেশ ও বিশ্বপরিচয় অধ্যায়ভিত্তিক লার্নিং টেস্ট - টাকার ব্যবহার",
  "৩য় শ্রেণী বাংলাদেশ ও বিশ্বপরিচয় অধ্যায়ভিত্তিক লার্নিং টেস্ট - জরুরি পরিস্থিতি",
  "৩য় শ্রেণী বাংলাদেশ ও বিশ্বপরিচয় অধ্যায়ভিত্তিক লার্নিং টেস্ট - নৈতিক ও...",
  "৩য় শ্রেণী বাংলাদেশ ও বিশ্বপরিচয় অধ্যায়ভিত্তিক লার্নিং টেস্ট - আমাদের দেশ",
  "৩য় শ্রেণী বাংলাদেশ ও বিশ্বপরিচয় অধ্যায়ভিত্তিক লার্নিং টেস্ট - পরিবার ও...",
  "৩য় শ্রেণী বাংলাদেশ ও বিশ্বপরিচয় অধ্যায়ভিত্তিক লার্নিং টেস্ট - শিশু অধিকার...",
  "৩য় শ্রেণী বাংলাদেশ ও বিশ্বপরিচয় অধ্যায়ভিত্তিক লার্নিং টেস্ট - আমাদের...",
  "৩য় শ্রেণী বাংলাদেশ ও বিশ্বপরিচয় অধ্যায়ভিত্তিক লার্নিং টেস্ট - মহাদেশ ও...",
  "৩য় শ্রেণী বাংলাদেশ ও বিশ্বপরিচয় অধ্যায়ভিত্তিক লার্নিং টেস্ট - আমাদের চার...",
  "৩য় শ্রেণী বাংলাদেশ ও বিশ্বপরিচয় অধ্যায়ভিত্তিক লার্নিং টেস্ট - আমাদের...",
  "৩য় শ্রেণী বাংলাদেশ ও বিশ্বপরিচয় অধ্যায়ভিত্তিক লার্নিং টেস্ট - আমাদের...",
  "৩য় শ্রেণী বাংলাদেশ ও বিশ্বপরিচয় অধ্যায়ভিত্তিক লার্নিং টেস্ট - আমরা সবাই...",
  "৩য় শ্রেণী প্রাথমিক বিজ্ঞান অধ্যায়ভিত্তিক লার্নিং টেস্ট - তথ্য ও যোগাযোগ"
].map(title => ({
  title,
  ques: 10,
  mins: 10,
  marks: 10,
  status: 'Ongoing'
}));

const latestPackages = [
  { title: 'হিন্দুধর্ম শিক্ষা অধ্যায়ভিত্তিক...', price: 40, rating: 4.5, students: '1.2k', color: 'bg-blue-600' },
  { title: 'ইসলাম শিক্ষা অধ্যায়ভিত্তিক...', price: 40, rating: 4.5, students: '1.2k', color: 'bg-indigo-600' },
  { title: 'বাংলাদেশ ও বিশ্বপরিচয় অধ্যা...', price: 104, rating: 4.5, students: '1.2k', color: 'bg-blue-500' },
  { title: 'প্রাথমিক বিজ্ঞান অধ্যায়ভিত্তিক...', price: 88, rating: 4.5, students: '1.2k', color: 'bg-purple-600' },
  { title: 'গণিত অধ্যায়ভিত্তিক লার্নিং টে...', price: 104, rating: 4.5, students: '1.2k', color: 'bg-cyan-500' },
  { title: 'স্যাট বাংলা অধ্যায়ভিত্তিক লা...', price: 184, rating: 4.5, students: '1.2k', color: 'bg-indigo-500' },
];

export default function ExamsPage() {
  const { user } = useAuth();
  const [activeAccessTab, setActiveAccessTab] = useState('All');
  const [purchasedExams, setPurchasedExams] = useState<any[]>([]);
  const [isLoadingPurchases, setIsLoadingPurchases] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchPurchased = async () => {
      setIsLoadingPurchases(true);
      try {
        const profile = await getUserProfile(user.uid);
        const slugs = profile?.purchasedTests || [];
        if (slugs.length > 0) {
          const promises = slugs.map((slug: string) => getAssessmentBySlug('mockTests', slug));
          const tests = await Promise.all(promises);
          setPurchasedExams(tests.filter(Boolean));
        }
      } catch (err) {
        console.error("Failed to load purchased tests", err);
      } finally {
        setIsLoadingPurchases(false);
      }
    };
    fetchPurchased();
  }, [user]);

  return (
    <div className="w-full max-w-[1400px] mx-auto pb-12 text-slate-800 dark:text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white hover:text-blue-600 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Exams
        </Link>
        <Button variant="outline" className="text-xs font-bold text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-md shrink-0 self-start sm:self-auto uppercase tracking-wider h-8 px-3 hover:bg-slate-50 dark:hover:bg-slate-800">
          VIEW ATTENDED <ChevronRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>

      {/* Controls */}
      <div className="space-y-4 mb-6">
        <div className="relative w-full">
          <Input 
            type="text" 
            placeholder="Search for exams..." 
            className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg h-10 shadow-sm pl-4 pr-10"
          />
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide w-full md:w-auto">
            {statusTabs.map((tab, i) => (
              <button
                key={i}
                className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors shrink-0 ${
                  tab.active 
                    ? 'bg-[#007bff] text-white' 
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* Access Tabs */}
          <div className="flex items-center gap-2 shrink-0">
            {accessTabs.map((tab, i) => (
              <button
                key={i}
                onClick={() => setActiveAccessTab(tab)}
                className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors ${
                  activeAccessTab === tab 
                    ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900' 
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Subject Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide border-t border-slate-100 dark:border-slate-800 pt-4">
          {subjectTabs.map((tab, i) => (
            <button
              key={i}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors shrink-0 border bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800`}
            >
              {tab.name} <span className="text-slate-400 font-medium">({tab.count})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* LEFT COLUMN: Main Exam Grid */}
        <div className="flex-1 w-full space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {activeAccessTab === 'Purchased' ? (
              isLoadingPurchases ? (
                <div className="col-span-full flex flex-col items-center justify-center h-48 text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin mb-4" />
                  <p>Loading your purchases...</p>
                </div>
              ) : purchasedExams.length > 0 ? (
                purchasedExams.map((test, i) => (
                  <AssessmentCard key={i} assessment={{...test, type: 'Mock Test'}} href={`/mock-tests/${test.slug}`} type="Mock Test" />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center h-48 text-slate-500">
                  <Award className="w-10 h-10 mb-4 opacity-50" />
                  <p>You haven't purchased any tests yet.</p>
                </div>
              )
            ) : (
              exams.map((exam, i) => (
                <Card key={i} className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-md transition-shadow group flex flex-col p-4">
                  <div className="flex justify-end mb-1">
                     <div className="w-5 h-5 bg-slate-100 dark:bg-slate-800 rounded-md flex items-center justify-center">
                       <span className="text-[10px] font-bold text-slate-400">bd</span>
                     </div>
                  </div>
                  <h3 className="font-bold text-[13px] text-slate-800 dark:text-slate-100 line-clamp-3 mb-4 leading-snug flex-1">
                    {exam.title}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-[11px] font-semibold mb-5">
                    <div className="flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" /> {exam.ques} Ques
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> {exam.mins} Mins
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5" /> {exam.marks} Marks
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-green-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> {exam.status}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button className="h-7 px-3 bg-[#00a651] hover:bg-[#008f45] text-white text-[11px] font-bold rounded flex items-center gap-1">
                        Start Exam <Play className="w-2.5 h-2.5 fill-current" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-7 w-7 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded">
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Showing 1 - 24 of 70
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Per Page 
                <select className="h-7 text-xs px-2 py-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md outline-none">
                  <option>15</option>
                  <option>24</option>
                  <option>50</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="w-8 h-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 rounded-md" disabled>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="default" className="w-8 h-8 bg-[#5b5fdb] hover:bg-[#4b4fbf] text-white text-xs font-bold rounded-md p-0">1</Button>
                <Button variant="outline" className="w-8 h-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-md p-0">2</Button>
                <Button variant="outline" className="w-8 h-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-md p-0">3</Button>
                <Button variant="outline" size="icon" className="w-8 h-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-md">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar */}
        <div className="w-full lg:w-[280px] shrink-0">
          <Card className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden sticky top-24">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Latest Exam Packages</h3>
              <span className="text-[10px] font-bold text-slate-400 cursor-pointer hover:text-slate-600">See All</span>
            </div>
            <div className="p-4 space-y-4">
              {latestPackages.map((pkg, i) => (
                <div key={i} className="flex gap-3 cursor-pointer group items-center">
                  <div className={`w-10 h-10 shrink-0 rounded flex items-center justify-center text-white ${pkg.color}`}>
                     <span className="text-[10px] font-bold">bd</span>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-blue-600 transition-colors mb-1">{pkg.title}</h4>
                    <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500">
                      <span className="text-green-600">₹{pkg.price}</span>
                      <span className="flex items-center text-yellow-500"><Star className="w-2.5 h-2.5 fill-current mr-0.5" /> {pkg.rating}</span>
                      <span className="flex items-center text-slate-400"><Users className="w-2.5 h-2.5 mr-0.5" /> {pkg.students}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-center items-center gap-4">
              <ChevronLeft className="w-3.5 h-3.5 text-slate-300 cursor-pointer" />
              <span className="text-[9px] font-bold text-slate-400 tracking-widest">PAGE 1</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
            </div>
          </Card>
        </div>

      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
