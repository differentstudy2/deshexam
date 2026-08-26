'use client';

import React, { useEffect, useState } from 'react';
import { SidebarSubject } from '@/app/guide/guide-data';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Loader2, Layers, BookOpen, Feather, Languages, Calculator, Leaf, Landmark, Globe } from 'lucide-react';

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

const subjectTranslationMap: Record<string, string> = {
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
};

const translateToBengali = (title: string) => {
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
      <div className="flex flex-col gap-1 max-h-[70vh] overflow-y-auto show-scrollbar p-3">
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
                  "flex items-start justify-between p-2 transition-all duration-300 rounded-[0.120rem] border group relative overflow-hidden",
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
  );
}
