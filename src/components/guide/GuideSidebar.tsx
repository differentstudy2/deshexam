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
    return { Icon: Feather, bgClass: 'bg-red-100 dark:bg-red-900/40', textClass: 'text-red-500 dark:text-red-400' };
  }
  if (t.includes('english') || t.includes('ইংরেজি')) {
    return { Icon: Languages, bgClass: 'bg-blue-100 dark:bg-blue-900/40', textClass: 'text-blue-500 dark:text-blue-400' };
  }
  if (t.includes('math') || t.includes('গণিত')) {
    return { Icon: Calculator, bgClass: 'bg-purple-100 dark:bg-purple-900/40', textClass: 'text-purple-500 dark:text-purple-400' };
  }
  if (t.includes('science') || t.includes('বিজ্ঞান') || t.includes('পরিবেশ') || t.includes('জীবন') || t.includes('ভৌত')) {
    return { Icon: Leaf, bgClass: 'bg-green-100 dark:bg-green-900/40', textClass: 'text-green-500 dark:text-green-400' };
  }
  if (t.includes('history') || t.includes('ইতিহাস')) {
    return { Icon: Landmark, bgClass: 'bg-orange-100 dark:bg-orange-900/40', textClass: 'text-orange-500 dark:text-orange-400' };
  }
  if (t.includes('geography') || t.includes('ভূগোল')) {
    return { Icon: Globe, bgClass: 'bg-teal-100 dark:bg-teal-900/40', textClass: 'text-teal-500 dark:text-teal-400' };
  }
  return { Icon: BookOpen, bgClass: 'bg-slate-200 dark:bg-slate-800', textClass: 'text-slate-600 dark:text-slate-400' };
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
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-fit overflow-hidden p-2">
      <div className="px-4 py-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl flex items-center justify-between mb-3 border border-blue-100/50 dark:border-blue-800/30">
        <div className="flex items-center gap-2.5">
          <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-bold text-[16px] text-slate-800 dark:text-slate-100">
            {classTitle === 'Subjects' ? 'Subjects' : 'অন্যান্য বিষয়সমূহ'}
          </h3>
        </div>
        {classTitle && classTitle !== 'Subjects' && (
          <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full">
            {classTitle}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2 max-h-[70vh] overflow-y-auto show-scrollbar px-2 pb-2">
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
          </div>
        ) : subjects.length > 0 ? (
          subjects.map((subject, idx) => {
            const isActive = activeId === subject.id || (activeId && subject.id && activeId.startsWith(subject.id + '/'));
            const { Icon, bgClass, textClass } = getSubjectConfig(subject.title);

            return (
              <div
                key={subject.id}
                className={cn(
                  "flex items-start justify-between px-4 py-2 transition-colors rounded-xl border group",
                  isActive
                    ? "bg-white dark:bg-slate-900 border-blue-500 dark:border-blue-400 shadow-sm"
                    : "bg-slate-50 dark:bg-slate-800/50 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                )}
              >
                <div className="flex items-start gap-3.5 w-full">
                  <Link href={`/guide/${subject.id}`} className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-xl shrink-0 transition-transform group-hover:scale-105",
                    bgClass, textClass
                  )}>
                    <Icon className="w-5 h-5" />
                  </Link>
                  <div className="flex flex-col flex-1 min-w-0">
                    <Link href={`/guide/${subject.id}`} className={cn(
                      "font-bold text-[15px] hover:text-blue-600 dark:hover:text-blue-400 transition-colors",
                      isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-800 dark:text-slate-200"
                    )}>
                      {translateToBengali(subject.title)}
                    </Link>

                    {subject.textbooks && subject.textbooks.length > 0 ? (
                      <div className="flex flex-col mt-1">
                        {subject.textbooks.map(tb => {
                          const isTbActive = activeId === tb.id || (activeId && tb.id && activeId.startsWith(tb.id + '/'));
                          return (
                            <Link href={`/guide/${tb.id}`} key={tb.id} className={cn(
                              "text-[12px] transition-colors py-0.5 line-clamp-1",
                              isTbActive
                                ? "text-blue-600 dark:text-blue-400 font-bold"
                                : "text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                            )}>
                              <span className="opacity-50 mr-1">•</span>{translateToBengali(tb.title)}
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <Link href={`/guide/${subject.id}`} className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        Explore contents & guides
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
