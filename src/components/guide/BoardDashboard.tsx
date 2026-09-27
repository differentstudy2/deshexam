"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ChevronRight, Play, BookOpen, FileText, AudioLines, 
  Video, CheckCircle2, Shield, Search, Trophy, Medal, MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '@/hooks/use-auth';
import { translateToBengali } from '@/components/guide/GuideSidebar';

interface BoardDashboardProps {
  id: string;
  node?: any;
  classes?: any[];
  subjects?: any[];
  boardTitle?: string;
  breadcrumbs?: { name: string, url: string }[];
}

export function BoardDashboard({
  id,
  node,
  classes = [],
  subjects = [],
  boardTitle,
  breadcrumbs
}: BoardDashboardProps) {
  const { user } = useAuth();
  const router = useRouter();

  // Stats
  const classCount = classes?.length || 12;
  const subjectCount = subjects?.length || 85;
  const textbookCount = 240; // Mock data as per UI
  const questionCount = '50K+';

  const acronym = node?.acronym || boardTitle?.split(' ')[0] || 'Board';
  const fullName = node?.title || boardTitle || 'Educational Board';

  // Extract FAQS and SEO Content
  const faqs: { question: string; answer: string }[] = (node?.faqs && node.faqs.length > 0) ? node.faqs : [
    { question: `What is ${acronym}?`, answer: `This is an essential guide for students under the ${fullName} curriculum.` },
    { question: `How to prepare for board exams?`, answer: `Regularly practicing our chapter-wise notes, previous year questions, and mock tests.` },
    { question: `Which books are recommended?`, answer: `We provide comprehensive notes and recommended textbooks based on the latest syllabus.` },
    { question: `How to use DeshExam Academy?`, answer: `Simply select your class and subject to get started with chapter-wise materials.` }
  ];

  const seoContent = node?.seoContent || `Welcome to the complete guide for **${fullName}**. This guide provides a detailed learning path for all classes.\n\nMastering this curriculum is essential for scoring well in your exams.`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] text-slate-800 dark:text-slate-200 font-sans pb-20 selection:bg-emerald-500/30 transition-colors duration-300">
      
      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8 relative z-10">
        
        {/* Left Column - Main Content */}
        <div className="flex-1 w-full space-y-12">
          
          {/* Hero Section */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-white via-slate-50 to-emerald-50 dark:from-slate-900 dark:via-[#0a1929] dark:to-emerald-950/20 border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl p-8 sm:p-12 transition-colors duration-300">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold tracking-wide mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Interactive Learning Platform
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-[1.1] mb-6 tracking-tight">
                  Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400">{acronym}</span><br />Board Preparation
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg mb-10 max-w-xl leading-relaxed">
                  Access to textbooks, chapter-wise notes, MCQ practice, mock tests, previous year papers and smart learning resources.
                </p>

                <div className="flex flex-wrap items-center gap-x-8 gap-y-6 mb-10">
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">{classCount}</span>
                    <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Classes</span>
                  </div>
                  <div className="h-10 w-px bg-slate-200 dark:bg-slate-800"></div>
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">{subjectCount}</span>
                    <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Subjects</span>
                  </div>
                  <div className="h-10 w-px bg-slate-200 dark:bg-slate-800"></div>
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">{textbookCount}</span>
                    <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Textbooks</span>
                  </div>
                  <div className="h-10 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{questionCount}</span>
                    <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Questions</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Button className="bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-bold px-8 h-12 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all">
                    Start Learning
                  </Button>
                  <Button variant="outline" className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 dark:hover:text-white font-bold px-8 h-12 rounded-full">
                    Explore Curriculum
                  </Button>
                </div>
              </div>
              
              <div className="hidden lg:flex w-72 h-72 relative shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-full blur-[40px] animate-pulse"></div>
                <div className="absolute inset-4 rounded-full border border-emerald-500/20 dark:border-emerald-500/30 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-2xl">
                  <BookOpen className="w-32 h-32 text-emerald-600/80 dark:text-emerald-400/80 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                  <div className="absolute -bottom-4 -right-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-2xl shadow-xl">
                    <Trophy className="w-8 h-8 text-yellow-500" />
                  </div>
                  <div className="absolute -top-4 -left-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-2xl shadow-xl">
                    <Shield className="w-8 h-8 text-cyan-500 dark:text-cyan-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Browse Classes Section */}
          <section>
            <div className="mb-6">
              <h2 className="text-xs font-bold text-emerald-600 dark:text-emerald-500 tracking-wider uppercase mb-1">Class Explorer</h2>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Browse Classes</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Select your class to view subjects and textbooks</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {classes.length > 0 ? classes.map((cls) => (
                <Link key={cls.id} href={`/guide/${cls.slug || cls.id}`} className="group">
                  <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 shadow-sm hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all duration-300">
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-2">
                      {cls.title}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      8 Subjects • 24 Books
                    </p>
                  </div>
                </Link>
              )) : (
                // Dummy Data based on UI if no classes provided
                ['Pre Primary', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map((cls, idx) => (
                  <Link key={idx} href={`/guide/${acronym.toLowerCase()}/${cls.toLowerCase().replace(' ', '-')}`} className="group">
                    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 shadow-sm hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all duration-300 relative overflow-hidden">
                      {idx === 10 && (
                        <div className="absolute inset-0 border-2 border-emerald-500/50 rounded-2xl shadow-[inset_0_0_15px_rgba(16,185,129,0.1)] dark:shadow-[inset_0_0_15px_rgba(16,185,129,0.2)]"></div>
                      )}
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-2 relative z-10">
                        {cls}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium relative z-10">
                        {(idx % 5) + 3} Subjects • {(idx * 7 % 15) + 5} Books
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

          {/* Popular Subjects */}
          <section>
            <div className="flex items-end justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Popular Subjects</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Chapters with glow animation on hover</p>
              </div>
              <Button variant="outline" className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-full text-xs h-8">
                Expand <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {['Bengali', 'English', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography'].map((subj, idx) => (
                <div key={idx} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-emerald-500/30 transition-all cursor-pointer shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/20 flex items-center justify-center mb-4 transition-colors">
                    <BookOpen className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">{translateToBengali(subj)}</h4>
                  <p className="text-[11px] text-slate-500">Chapters: {(idx % 10) + 10}<br/>Questions: {(idx * 3 % 10) + 15}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Practice Zone */}
          <section>
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Practice Zone</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Premium analytics style cards</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: '1. MCQ Practice', total: '23,400', attempted: 10, color: 'emerald' },
                { title: '2. CQ Practice', total: '234', attempted: 23, color: 'blue' },
                { title: '3. Mock Tests', total: '31', attempted: 2, color: 'purple' },
                { title: '4. Previous Year Questions', total: '38', attempted: 10, color: 'rose' }
              ].map((prac, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-600 transition-colors flex flex-col h-full relative overflow-hidden group">
                  <div className={`absolute top-0 left-0 w-1 h-full bg-${prac.color}-500/20 dark:bg-${prac.color}-500/50 group-hover:bg-${prac.color}-500 dark:group-hover:bg-${prac.color}-400 transition-colors`}></div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-6 relative z-10">{prac.title}</h4>
                  
                  <div className="mt-auto relative z-10">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total: <span className="text-slate-900 dark:text-white font-bold">{prac.total}</span></p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Attempted: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{prac.attempted}</span></p>
                    <Link href="#" className={`text-[11px] font-bold text-${prac.color}-600 dark:text-${prac.color}-400 flex items-center hover:text-${prac.color}-700 dark:hover:text-${prac.color}-300 transition-colors`}>
                      Start Practice <ChevronRight className="w-3 h-3 ml-1" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Right Column - Widgets Sidebar */}
        <div className="w-full lg:w-[320px] shrink-0 space-y-6">
          
          {/* User Logged In Widgets */}
          {user && (
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase mb-4">Logged In Navbar</h3>
              
              {/* Continue Learning Widget */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5 mb-4 shadow-sm dark:shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500"></div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-slate-900 dark:text-white font-bold mb-1">Class {(user as any)?.class || '10'}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Current Class</p>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 text-orange-600 dark:text-orange-400 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                    🔥 12 Day Streak
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Current Subject</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">Mathematics</p>
                  </div>
                  <div className="w-12 h-12 rounded-full border-2 border-emerald-500 flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/30">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">65%</span>
                  </div>
                </div>
                
                <Button className="w-full bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-bold rounded-xl h-10 text-xs">
                  Resume Learning <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>

              {/* Countdown Widget */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5 mb-4 shadow-sm dark:shadow-lg text-center">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Upcoming Board Exam</p>
                <div className="w-24 h-24 mx-auto rounded-full border-4 border-slate-100 dark:border-slate-800 border-t-cyan-500 dark:border-t-cyan-400 flex flex-col items-center justify-center mb-4 relative">
                  <span className="text-3xl font-black text-slate-900 dark:text-white leading-none mb-1">182</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Days Left</span>
                </div>
                <Button variant="outline" className="w-full border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-xl h-9 text-xs">
                  Revision Planner
                </Button>
              </div>

              {/* Challenge Widget */}
              <div className="bg-gradient-to-br from-white to-emerald-50 dark:from-slate-900 dark:to-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-5 shadow-sm dark:shadow-[0_0_15px_rgba(16,185,129,0.1)] relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-500/10 dark:bg-emerald-500/20 blur-xl rounded-full"></div>
                <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">Daily Challenge</h4>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Today's Challenge</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4">10 Questions • 5 Minutes</p>
                
                <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-3 flex items-center justify-between mb-4 border border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Reward</p>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">+100 XP</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-yellow-50 dark:bg-yellow-500/10 px-2 py-1 rounded border border-yellow-200 dark:border-yellow-500/20 text-yellow-600 dark:text-yellow-500 text-xs font-bold">
                    <Trophy className="w-3 h-3" /> Badge
                  </div>
                </div>
                
                <Button className="w-full bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-bold rounded-xl h-10 text-xs shadow-md dark:shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                  Play Challenge
                </Button>
              </div>

              {/* Leaderboard Widget */}
              <div className="mt-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Top Performers</h4>
                  <Medal className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((rank) => (
                    <div key={rank} className="flex items-center gap-3">
                      <div className="w-5 text-center text-xs font-bold text-slate-500">{rank}</div>
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"></div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">User Name</p>
                      </div>
                      <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">12k XP</div>
                    </div>
                  ))}
                </div>
                <Link href="/leaderboard" className="block text-center text-[11px] font-bold text-emerald-600 dark:text-emerald-500 mt-4 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                  View Full Leaderboard
                </Link>
              </div>

            </div>
          )}

          {/* Board Resources Sidebar Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5">Board Resources</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: BookOpen, label: 'Textbooks' },
                { icon: FileText, label: 'Notes' },
                { icon: FileText, label: 'PDFs' },
                { icon: AudioLines, label: 'Audio Lessons' },
                { icon: Video, label: 'Video Lessons' },
                { icon: CheckCircle2, label: 'Solutions' }
              ].map((res, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center gap-3 hover:border-emerald-500/30 dark:hover:border-emerald-500/50 hover:bg-white dark:hover:bg-slate-900 transition-all cursor-pointer group">
                  <res.icon className="w-6 h-6 text-emerald-600 dark:text-emerald-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" />
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{res.label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom SEO & FAQ Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-200 dark:border-slate-800/60 mt-8 relative z-10 bg-white dark:bg-transparent">
        <div className="grid lg:grid-cols-2 gap-12">
          
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">FAQ</h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq: { question: string; answer: string }, idx: number) => (
                <AccordionItem key={idx} value={`item-${idx}`} className="border-slate-200 dark:border-slate-800">
                  <AccordionTrigger className="text-left font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-sm">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 dark:bg-emerald-500/5 blur-3xl rounded-full"></div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">About {acronym} Board Learning on DeshExam</h2>
            <div className="prose dark:prose-invert max-w-none prose-sm prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-headings:text-slate-900 dark:prose-headings:text-slate-200 prose-a:text-emerald-600 dark:prose-a:text-emerald-400 prose-strong:text-emerald-700 dark:prose-strong:text-emerald-300">
              <ReactMarkdown>{seoContent}</ReactMarkdown>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800/60">
              <div className="flex items-start gap-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 p-4 rounded-xl">
                <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  This educational portal is provided primarily for learning and educational purposes. DeshExam offers supplementary learning materials, notes, and question banks to help students prepare effectively for their board examinations.
                </p>
              </div>
            </div>
          </div>
          
        </div>
      </div>

    </div>
  );
}
