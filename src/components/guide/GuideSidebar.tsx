'use client';

import React, { useEffect, useState } from 'react';
import { SidebarSubject } from '@/app/guide/guide-data';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Loader2, Layers, BookOpen, Feather, Languages, Calculator, Leaf, Landmark, Globe, Target, FileText, Bookmark, FileDown, MessageCircle, Sparkles, TrendingUp, Trophy, Bell, ClipboardList, Briefcase, Users } from 'lucide-react';

const getSubjectConfig = (title: string) => {
  const t = (title || '').toLowerCase();
  if (t.includes('bangla') || t.includes('bengali') || t.includes('বাংলা') || t.includes('sahitya')) {
    return { Icon: Feather, textClass: 'text-red-500 dark:text-red-400', cardBg: 'bg-red-50/40 hover:bg-red-50/80 dark:bg-red-950/20 dark:hover:bg-red-900/30', activeBorder: 'border-red-200 dark:border-red-800/60', indicator: 'bg-red-500' };
  }
  if (t.includes('english') || t.includes('ইংরেজি')) {
    return { Icon: Languages, textClass: 'text-blue-500 dark:text-blue-400', cardBg: 'bg-blue-50/40 hover:bg-blue-50/80 dark:bg-blue-950/20 dark:hover:bg-blue-900/30', activeBorder: 'border-blue-200 dark:border-blue-800/60', indicator: 'bg-blue-500' };
  }
  if (t.includes('math') || t.includes('গণিত')) {
    return { Icon: Calculator, textClass: 'text-purple-500 dark:text-purple-400', cardBg: 'bg-purple-50/40 hover:bg-purple-50/80 dark:bg-purple-950/20 dark:hover:bg-purple-900/30', activeBorder: 'border-purple-200 dark:border-purple-800/60', indicator: 'bg-purple-500' };
  }
  if (t.includes('science') || t.includes('বিজ্ঞান') || t.includes('পরিবেশ') || t.includes('জীবন') || t.includes('ভৌত')) {
    return { Icon: Leaf, textClass: 'text-green-500 dark:text-green-400', cardBg: 'bg-green-50/40 hover:bg-green-50/80 dark:bg-green-950/20 dark:hover:bg-green-900/30', activeBorder: 'border-green-200 dark:border-green-800/60', indicator: 'bg-green-500' };
  }
  if (t.includes('history') || t.includes('ইতিহাস')) {
    return { Icon: Landmark, textClass: 'text-orange-500 dark:text-orange-400', cardBg: 'bg-orange-50/40 hover:bg-orange-50/80 dark:bg-orange-950/20 dark:hover:bg-orange-900/30', activeBorder: 'border-orange-200 dark:border-orange-800/60', indicator: 'bg-orange-500' };
  }
  if (t.includes('geography') || t.includes('ভূগোল')) {
    return { Icon: Globe, textClass: 'text-teal-500 dark:text-teal-400', cardBg: 'bg-teal-50/40 hover:bg-teal-50/80 dark:bg-teal-950/20 dark:hover:bg-teal-900/30', activeBorder: 'border-teal-200 dark:border-teal-800/60', indicator: 'bg-teal-500' };
  }
  return { Icon: BookOpen, textClass: 'text-slate-600 dark:text-slate-400', cardBg: 'bg-slate-50/40 hover:bg-slate-50/80 dark:bg-slate-800/20 dark:hover:bg-slate-800/40', activeBorder: 'border-slate-300 dark:border-slate-700/60', indicator: 'bg-slate-500' };
};

export const subjectTranslationMap: Record<string, string> = {
  'Mathematics': 'গণিত',
  'Math': 'গণিত',
  'Physical Science': 'ভৌত বিজ্ঞান',
  'Life Science': 'জীবন বিজ্ঞান',
  'Science': 'বিজ্ঞান',
  'History': 'ইতিহাস',
  'Geography': 'ভূগোল',
  'Bengali': 'বাংলা',
  'English': 'ইংরেজি',
  'Environment': 'পরিবেশ',
  'Environmental Science': 'পরিবেশ বিজ্ঞান',
  'Computer Application': 'কম্পিউটার অ্যাপ্লিকেশন',
  'Computer Science': 'কম্পিউটার সায়েন্স',
  'Biology': 'জীববিদ্যা',
  'Physics': 'পদার্থবিদ্যা',
  'Chemistry': 'রসায়ন',
  'Bengali Grammar': 'বাংলা ব্যাকরণ',
  'Bengali Literature': 'বাংলা সাহিত্য',
  'Bhasa Charcha': 'ভাষা চর্চা',
  'Sahityamela': 'সাহিত্যমেলা',
  'Health & Physical Education': 'স্বাস্থ্য ও শারীরশিক্ষা',
  'Rapid Reader': 'সহায়ক পাঠ',
  'Pather Panchali Rapid': 'পথের পাঁচালী',
  'Amader Paribesh': 'আমাদের পরিবেশ',
  'Amar Ganit': 'আমার গণিত',
  'Ganit Prabha': 'গণিত প্রভা',
  'Poribesh O Bigyan': 'পরিবেশ ও বিজ্ঞান',
  'Bhasha Path': 'ভাষা পাঠ',
  'Butterfly': 'বাটারফ্লাই',
  'Amader Prithibi': 'আমাদের পৃথিবী',
  'Atit O Aityaja': 'অতীত ও ঐতিহ্য',
};

export const translateToBengali = (title: string) => {
  if (!title) return title;
  const trimmed = title.trim();
  for (const [en, bn] of Object.entries(subjectTranslationMap)) {
    if (trimmed.toLowerCase() === en.toLowerCase()) {
      return bn;
    }
  }
  return title;
};

interface GuideSidebarProps {
  subjects: SidebarSubject[];
  activeId?: string;
  classTitle?: string;
}

export function GuideSidebar({ subjects: initialSubjects, activeId, classTitle: initialClassTitle = 'Subjects' }: GuideSidebarProps) {
  const { user, userProfile } = useAuth();
  const [classTitle, setClassTitle] = useState<string>(initialClassTitle);
  const [subjects, setSubjects] = useState<SidebarSubject[]>(initialSubjects);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If subjects are passed as props (e.g. from the guide pages), use them directly
    if (initialSubjects && initialSubjects.length > 0) {
      setSubjects(initialSubjects);
      setClassTitle(initialClassTitle);
      setLoading(false);
      return;
    }

    // Otherwise, fetch based on user profile (e.g. for dashboard)
    async function fetchStudentData() {
      if (user && userProfile?.classId) {
        try {
          // Fetch class title
          const classDoc = await getDoc(doc(db, 'taxonomy_nodes', userProfile.classId));
          if (classDoc.exists()) {
            setClassTitle(classDoc.data().title || classDoc.data()?.name);
          }

          // Fetch subjects/textbooks for this class
          const q = query(
            collection(db, "taxonomy_nodes"),
            where("parentId", "==", userProfile.classId)
          );
          const snap = await getDocs(q);
          const classNodes = snap.docs.map(d => ({ id: d.id, ...d.data() as any }));

          // Get subjects or textbooks
          const relevantNodes = classNodes.filter(n => n.type === 'subject' || n.type === 'textbook');
          relevantNodes.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

          if (relevantNodes.length > 0) {
            setSubjects(relevantNodes.map(n => ({
              id: n.fullSlug || n.id,
              title: n.title || n.name,
              countStr: ''
            })));
          }
        } catch (error) {
          console.error("Error fetching class subjects for sidebar:", error);
        }
      } else if (!user) {
        setClassTitle('Subjects');
      }
      setLoading(false);
    }

    fetchStudentData();
  }, [initialSubjects, initialClassTitle, user, userProfile]);

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.4)] border border-slate-200 dark:border-slate-800 flex flex-col h-fit overflow-hidden">
        <div className="px-4 py-3.5 bg-gradient-to-r from-[#60739f] to-[#4572ff] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white/90 rounded-md shadow-sm">
              <Layers className="w-5 h-5 text-[#547bf1]" />
            </div>
            <h3 className="font-bold text-[16px] text-white tracking-wide">
              {classTitle === 'Subjects' ? 'Subjects' : 'অন্যান্য বিষয়সমূহ'}
            </h3>
          </div>
          {classTitle && classTitle !== 'Subjects' && (
            <span className="bg-[#354cd4] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
              {classTitle}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1 max-h-[55vh] overflow-y-auto show-scrollbar p-3">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            </div>
          ) : subjects.length > 0 ? (
            subjects.map((subject, idx) => {
              const isActive = activeId === subject.id || (activeId && subject.id && activeId.startsWith(subject.id + '/'));
              const { Icon, textClass, cardBg, activeBorder, indicator } = getSubjectConfig(subject.title);

              return (
                <div
                  key={subject.id}
                  className={cn(
                    "flex items-start justify-between py-2.5 px-3 transition-all duration-300 rounded-[0.120rem] border group relative overflow-hidden shrink-0",
                    cardBg,
                    isActive
                      ? cn("shadow-sm", activeBorder)
                      : "border-black/5 dark:border-white/5 hover:shadow-sm"
                  )}
                >
                  {isActive && (
                    <div className={cn("absolute left-0 top-3 bottom-3 w-1 rounded-r-full", indicator)}></div>
                  )}
                  <div className="flex items-start gap-2.5 w-full relative z-10">
                    <Link href={`/guide/${subject.id}`} className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-transform duration-300 group-hover:scale-105 bg-white/70 dark:bg-slate-900/50 shadow-sm border border-black/5 dark:border-white/5",
                      textClass
                    )}>
                      <Icon className="w-4 h-4" />
                    </Link>
                    <div className="flex flex-col flex-1 min-w-0 pt-0.5">
                      <Link href={`/guide/${subject.id}`} className={cn(
                        "font-bold text-[13.5px] transition-colors tracking-tight leading-tight",
                        isActive ? textClass : "text-slate-800 dark:text-slate-200 hover:opacity-80"
                      )}>
                        {translateToBengali(subject.title)}
                      </Link>

                      {subject.textbooks && subject.textbooks.length > 0 ? (
                        <div className="flex flex-col mt-0.5 gap-0">
                          {subject.textbooks.map(tb => {
                            const isTbActive = activeId === tb.id || (activeId && tb.id && activeId.startsWith(tb.id + '/'));
                            return (
                              <Link href={`/guide/${tb.id}`} key={tb.id} className={cn(
                                "text-[11.5px] transition-all duration-200 py-0.5 rounded-md line-clamp-1 flex items-center gap-1.5",
                                isTbActive
                                  ? cn("font-bold", textClass)
                                  : "text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-slate-200"
                              )}>
                                <div className={cn("w-1 h-1 rounded-full shrink-0", isTbActive ? indicator : "bg-slate-300 dark:bg-slate-600")}></div>
                                {translateToBengali(tb.title)}
                              </Link>
                            );
                          })}
                        </div>
                      ) : (
                        <Link href={`/guide/${subject.id}`} className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1 hover:text-slate-600 dark:hover:text-slate-300 transition-colors font-medium">
                          Explore contents
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-5 text-center text-sm text-slate-500">
              No subjects found.
            </div>
          )}
        </div>
      </div>

      {/* Practice & Prep Card */}
      {subjects.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.4)] border border-slate-200 dark:border-slate-800 flex flex-col h-fit overflow-hidden">
          <div className="px-4 py-3.5 bg-gradient-to-r from-orange-500 to-rose-500 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white/90 rounded-md shadow-sm">
                <Target className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="font-bold text-[15px] text-white tracking-wide uppercase">
                Practice & Prep
              </h3>
            </div>
          </div>

          <div className="flex flex-col p-3 gap-1.5">
            <Link href="/mock-tests" className="flex items-center gap-3 p-2 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 bg-orange-50/40 hover:bg-orange-50 dark:bg-orange-950/20 dark:hover:bg-orange-900/30 transition-all duration-200 group">
              <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center shrink-0 shadow-sm border border-black/5 dark:border-white/5">
                <Target className="w-4 h-4 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-[13px] text-orange-700 dark:text-orange-400 leading-tight">Mock Tests</span>
                <span className="text-[10.5px] text-slate-500 font-medium">Full length exams</span>
              </div>
            </Link>

            <Link href="/quizzes" className="flex items-center gap-3 p-2 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 bg-purple-50/40 hover:bg-purple-50 dark:bg-purple-950/20 dark:hover:bg-purple-900/30 transition-all duration-200 group">
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center shrink-0 shadow-sm border border-black/5 dark:border-white/5">
                <Feather className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-[13px] text-purple-700 dark:text-purple-400 leading-tight">Quizzes</span>
                <span className="text-[10.5px] text-slate-500 font-medium">Short chapter quizzes</span>
              </div>
            </Link>

            <Link href="/practice" className="flex items-center gap-3 p-2 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 bg-blue-50/40 hover:bg-blue-50 dark:bg-blue-950/20 dark:hover:bg-blue-900/30 transition-all duration-200 group">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0 shadow-sm border border-black/5 dark:border-white/5">
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-[13px] text-blue-700 dark:text-blue-400 leading-tight">Practice</span>
                <span className="text-[10.5px] text-slate-500 font-medium">Topic-wise MCQs</span>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Study Tools Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.4)] border border-slate-200 dark:border-slate-800 flex flex-col h-fit overflow-hidden shrink-0">
        <div className="px-4 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1 bg-white/90 rounded-md shadow-sm">
              <Briefcase className="w-4 h-4 text-teal-600" />
            </div>
            <h3 className="font-bold text-[14px] text-white tracking-wide uppercase">
              My Study Tools
            </h3>
          </div>
        </div>

        <div className="flex flex-col p-2.5 gap-1">
          <Link href="/syllabus" className="flex items-center gap-3 p-2 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 bg-teal-50/40 hover:bg-teal-50 dark:bg-teal-950/20 dark:hover:bg-teal-900/30 transition-all duration-200 group">
            <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center shrink-0 shadow-sm border border-black/5 dark:border-white/5">
              <ClipboardList className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-[12.5px] text-teal-700 dark:text-teal-400 leading-tight">Syllabus Overview</span>
              <span className="text-[10px] text-slate-500 font-medium">Full course structure</span>
            </div>
          </Link>
          <Link href="/bookmarks" className="flex items-center gap-3 p-2 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 bg-sky-50/40 hover:bg-sky-50 dark:bg-sky-950/20 dark:hover:bg-sky-900/30 transition-all duration-200 group">
            <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center shrink-0 shadow-sm border border-black/5 dark:border-white/5">
              <Bookmark className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-[12.5px] text-sky-700 dark:text-sky-400 leading-tight">My Bookmarks</span>
              <span className="text-[10px] text-slate-500 font-medium">Saved notes & Qs</span>
            </div>
          </Link>
          <Link href="/materials" className="flex items-center gap-3 p-2 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 bg-green-50/40 hover:bg-green-50 dark:bg-green-950/20 dark:hover:bg-green-900/30 transition-all duration-200 group">
            <div className="w-7 h-7 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center shrink-0 shadow-sm border border-black/5 dark:border-white/5">
              <FileDown className="w-3.5 h-3.5 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-[12.5px] text-green-700 dark:text-green-400 leading-tight">PDF Materials</span>
              <span className="text-[10px] text-slate-500 font-medium">Download notes</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Ask a Doubt Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.4)] border border-slate-200 dark:border-slate-800 flex flex-col h-fit overflow-hidden shrink-0">
        <div className="px-4 py-3 bg-gradient-to-r from-fuchsia-500 to-pink-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1 bg-white/90 rounded-md shadow-sm">
              <Sparkles className="w-4 h-4 text-fuchsia-600" />
            </div>
            <h3 className="font-bold text-[14px] text-white tracking-wide uppercase">
              Ask a Doubt
            </h3>
          </div>
        </div>
        <div className="flex flex-col p-2.5 gap-1">
          <Link href="/ai-tutor" className="flex items-center gap-3 p-2 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 bg-fuchsia-50/40 hover:bg-fuchsia-50 dark:bg-fuchsia-950/20 dark:hover:bg-fuchsia-900/30 transition-all duration-200 group">
            <div className="w-7 h-7 rounded-lg bg-fuchsia-100 dark:bg-fuchsia-900/40 flex items-center justify-center shrink-0 shadow-sm border border-black/5 dark:border-white/5">
              <MessageCircle className="w-3.5 h-3.5 text-fuchsia-600 dark:text-fuchsia-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-[12.5px] text-fuchsia-700 dark:text-fuchsia-400 leading-tight">Chat with AI</span>
              <span className="text-[10px] text-slate-500 font-medium">Instant answers</span>
            </div>
          </Link>
          <Link href="/community" className="flex items-center gap-3 p-2 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 bg-pink-50/40 hover:bg-pink-50 dark:bg-pink-950/20 dark:hover:bg-pink-900/30 transition-all duration-200 group">
            <div className="w-7 h-7 rounded-lg bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center shrink-0 shadow-sm border border-black/5 dark:border-white/5">
              <Users className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-[12.5px] text-pink-700 dark:text-pink-400 leading-tight">Community Q&A</span>
              <span className="text-[10px] text-slate-500 font-medium">Discuss with peers</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Progress & Leaderboard Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.4)] border border-slate-200 dark:border-slate-800 flex flex-col h-fit overflow-hidden shrink-0">
        <div className="px-4 py-3 bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1 bg-white/90 rounded-md shadow-sm">
              <Trophy className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="font-bold text-[14px] text-white tracking-wide uppercase">
              Performance
            </h3>
          </div>
        </div>
        <div className="flex flex-col p-2.5 gap-2">
          <div className="px-2 py-1">
            <div className="flex justify-between items-end mb-1.5">
              <span className="font-bold text-[12px] text-slate-700 dark:text-slate-300">Course Progress</span>
              <span className="font-bold text-[11px] text-amber-600 dark:text-amber-400">45%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
          <Link href="/leaderboard" className="flex items-center gap-3 p-2 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 bg-amber-50/40 hover:bg-amber-50 dark:bg-amber-950/20 dark:hover:bg-amber-900/30 transition-all duration-200 group mt-1">
            <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0 shadow-sm border border-black/5 dark:border-white/5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-[12.5px] text-amber-700 dark:text-amber-400 leading-tight">Leaderboard</span>
              <span className="text-[10px] text-slate-500 font-medium">Rank #42 in Class</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Notices Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.4)] border border-slate-200 dark:border-slate-800 flex flex-col h-fit overflow-hidden shrink-0">
        <div className="px-4 py-3 bg-gradient-to-r from-red-500 to-rose-600 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1 bg-white/90 rounded-md shadow-sm">
              <Bell className="w-4 h-4 text-red-600" />
            </div>
            <h3 className="font-bold text-[14px] text-white tracking-wide uppercase">
              Notices
            </h3>
          </div>
        </div>
        <div className="p-4 pt-5 pb-4">
          <div className="relative border-l-2 border-red-100 dark:border-red-900/50 ml-2 space-y-4">
            <div className="relative pl-4 cursor-pointer group">
              <div className="absolute w-2.5 h-2.5 bg-red-500 rounded-full -left-[5.5px] top-1 ring-[3px] ring-white dark:ring-slate-900 group-hover:scale-125 transition-transform"></div>
              <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider mb-0.5 block">Tomorrow, 10:00 AM</span>
              <span className="font-bold text-[13px] text-slate-800 dark:text-slate-200 block leading-tight group-hover:text-red-500 transition-colors">Math Unit Test</span>
              <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">Chapters 1 to 4. Be prepared!</span>
            </div>

            <div className="relative pl-4 cursor-pointer group">
              <div className="absolute w-2.5 h-2.5 bg-orange-400 rounded-full -left-[5.5px] top-1 ring-[3px] ring-white dark:ring-slate-900 group-hover:scale-125 transition-transform"></div>
              <span className="text-[10px] text-orange-500 font-bold uppercase tracking-wider mb-0.5 block">15th Aug, 2026</span>
              <span className="font-bold text-[13px] text-slate-800 dark:text-slate-200 block leading-tight group-hover:text-orange-500 transition-colors">Independence Day</span>
              <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">School will remain closed.</span>
            </div>

            <div className="relative pl-4 cursor-pointer group">
              <div className="absolute w-2.5 h-2.5 bg-slate-300 dark:bg-slate-600 rounded-full -left-[5.5px] top-1 ring-[3px] ring-white dark:ring-slate-900 group-hover:scale-125 transition-transform"></div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5 block">20th Aug, 2026</span>
              <span className="font-bold text-[13px] text-slate-800 dark:text-slate-200 block leading-tight group-hover:text-slate-500 transition-colors">Result Publication</span>
              <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">First term exam results.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
