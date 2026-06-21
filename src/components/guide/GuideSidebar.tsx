'use client';

import React, { useEffect, useState } from 'react';
import { SidebarSubject } from '@/app/guide/guide-data';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Loader2 } from 'lucide-react';

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
              id: n.id,
              title: n.title || n.name,
              countStr: '' // We could calculate this if needed
            })));
          }
        } catch (error) {
          console.error("Error fetching class subjects for sidebar:", error);
        }
      } else if (!user) {
        // Fallback title if not logged in
        setClassTitle('Subjects');
      }
      setLoading(false);
    }
    
    fetchStudentData();
  }, [user, userProfile]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-fit overflow-hidden">
      <div className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="font-bold text-[20px] text-slate-800 dark:text-slate-100">
          {classTitle}
        </h3>
      </div>
      <div className="flex flex-col max-h-[70vh] overflow-y-auto show-scrollbar">
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
          </div>
        ) : subjects.length > 0 ? (
          subjects.map((subject, idx) => {
            const isActive = subject.id === activeId;
            const isLast = idx === subjects.length - 1;
            
            return (
              <Link 
                href={`/guide/${subject.id}`} 
                key={subject.id}
              >
                <div 
                  className={cn(
                    "flex items-center justify-between px-5 py-4 transition-colors cursor-pointer group",
                    !isLast && "border-b border-slate-100 dark:border-slate-800/50",
                    isActive 
                      ? "bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-800 dark:text-emerald-400" 
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300"
                  )}
                >
                  <span className="font-medium text-[15px]">
                    {subject.title}
                  </span>
                  {subject.countStr && (
                    <span 
                      className={cn(
                        "text-xs px-2.5 py-1 rounded-md font-bold transition-colors",
                        isActive 
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400" 
                          : "bg-[#e2f5ea] text-[#2c8a5a] dark:bg-emerald-900/30 dark:text-emerald-400 group-hover:bg-emerald-100"
                      )}
                    >
                      {subject.countStr}
                    </span>
                  )}
                </div>
              </Link>
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
