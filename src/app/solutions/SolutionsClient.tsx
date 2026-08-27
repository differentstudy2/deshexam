'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from "next/link";
import { GraduationCap, Book } from "lucide-react";
import { getClasses } from '@/lib/firebase/firestore';
import hardcodedClassesJson from '@/data/hardcoded/taxonomy/classes.json';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const CARD_GRADIENTS = [
  "from-emerald-500 to-teal-700",
  "from-blue-500 to-indigo-700",
  "from-violet-500 to-purple-700",
  "from-rose-500 to-pink-700",
  "from-amber-500 to-orange-600",
  "from-cyan-500 to-blue-600",
  "from-fuchsia-500 to-purple-700",
  "from-sky-500 to-indigo-600",
];

const BOARD_CONFIGS = [
  { id: 'wbbse', name: 'WBBSE', slugs: ['wb-board', 'wbbme', 'wbbse'] },
  { id: 'ncert', name: 'NCERT', slugs: ['ncert'] },
  { id: 'cbse', name: 'CBSE', slugs: ['cbse-board', 'cbse'] },
  { id: 'wbchse', name: 'WBCHSE', slugs: ['wbchse'] },
  { id: 'icse', name: 'ICSE', slugs: ['icse-board', 'icse'] }
];

export default function SolutionsClient() {
  const [boardClasses, setBoardClasses] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAllClasses = async () => {
      try {
        setLoading(true);
        const firebaseClasses = await getClasses().catch(() => []);

        // Safely extract array regardless of module system
        let hardcodedClasses: any[] = [];
        if (Array.isArray(hardcodedClassesJson)) {
          hardcodedClasses = hardcodedClassesJson;
        } else if (hardcodedClassesJson && typeof hardcodedClassesJson === 'object') {
          if (Array.isArray((hardcodedClassesJson as any).default)) {
            hardcodedClasses = (hardcodedClassesJson as any).default;
          } else {
            hardcodedClasses = Object.values(hardcodedClassesJson);
          }
        }

        const grouped: Record<string, any[]> = {};

        BOARD_CONFIGS.forEach(board => {
          const filteredHardcodedClasses = hardcodedClasses.filter(c => 
            c && c.boardSlug && board.slugs.includes(c.boardSlug)
          ).map(c => ({ id: c.id, name: c.title || 'Unknown', slug: c.classSlug || c.slug || 'unknown' }));

          const firebaseMapped = (firebaseClasses as any[]).filter(c => 
            c.boardSlug && board.slugs.includes(c.boardSlug)
          ).map(c => ({ 
            id: c.id, 
            name: c.title || c.name || 'Unknown', 
            slug: c.classSlug || c.slug || 'unknown' 
          }));

          const allBoardClassesMap = new Map();
          [...filteredHardcodedClasses, ...firebaseMapped].forEach(c => {
            if (!allBoardClassesMap.has(c.name)) {
              allBoardClassesMap.set(c.name, c);
            }
          });

          // Sort classes
          const sortedClasses = Array.from(allBoardClassesMap.values()).sort((a, b) => {
            const isKgA = a.name.toLowerCase().includes('kg');
            const isKgB = b.name.toLowerCase().includes('kg');
            
            if (isKgA && !isKgB) return -1;
            if (!isKgA && isKgB) return 1;

            const numA = parseInt(a.name.replace(/\D/g, '')) || 0;
            const numB = parseInt(b.name.replace(/\D/g, '')) || 0;
            if (numA !== numB) return numA - numB;
            return a.name.localeCompare(b.name);
          });

          grouped[board.id] = sortedClasses;
        });

        setBoardClasses(grouped);
      } catch (error) {
         toast({
          variant: "destructive",
          title: "Error fetching classes",
          description: "Could not load class data. Please try again."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAllClasses();
  }, [toast]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <div className="bg-slate-900 dark:bg-slate-950 pt-24 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay pointer-events-none"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="container mx-auto max-w-7xl px-4 relative z-10">
          <div className="max-w-3xl">
            <Badge className="bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border-none px-3 py-1 mb-6 backdrop-blur-sm">
              All Board Solutions
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-headline tracking-tight text-white">
              Comprehensive Textbook Solutions
            </h1>
            <p className="text-lg md:text-xl text-emerald-50 mb-8 opacity-90 max-w-2xl leading-relaxed">
              Master your exams with step-by-step solutions across all major educational boards. Find chapter-wise explanations and ace your preparation.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 mt-8 md:mt-12 space-y-16">
        {loading ? (
          <div className="space-y-12">
            {[1, 2].map((i) => (
              <div key={i} className="mb-12">
                <Skeleton className="h-8 w-48 mb-6" />
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((j) => (
                    <Skeleton key={j} className="h-48 rounded-2xl w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          BOARD_CONFIGS.map(board => {
            const classes = boardClasses[board.id] || [];
            if (classes.length === 0) return null;

            return (
              <div key={board.id} className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Book className="w-5 h-5" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 font-headline">
                    {board.name} Solutions
                  </h2>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {classes.map((c, index) => {
                    const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
                    
                    return (
                    <Link
                      key={c.id}
                      href={`/solutions/${board.id}/${c.slug}`}
                      className="group relative flex flex-col items-center justify-center p-8 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl border-none"
                      style={{ boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }}
                    >
                      {/* Premium Gradient Background */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-95 group-hover:opacity-100 transition-opacity duration-300`}></div>
                      
                      {/* Subtle noise/pattern overlay */}
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-300"></div>
                      
                      <div className="relative z-10 flex flex-col items-center w-full">
                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-5 backdrop-blur-md shadow-inner border border-white/30 group-hover:scale-110 transition-transform duration-500 ease-out">
                          <GraduationCap className="h-8 w-8 text-white drop-shadow-md" />
                        </div>
                        
                        <span className="font-bold text-2xl text-white tracking-wide drop-shadow-md font-headline mb-4 text-center">{c.name}</span>
                        
                        <div className="w-full flex justify-center mt-2 px-2">
                          <span className="inline-flex items-center justify-center bg-white text-slate-800 font-semibold px-3 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform translate-y-2 opacity-90 group-hover:opacity-100 group-hover:translate-y-0 w-full whitespace-nowrap text-xs sm:text-sm">
                            View Solutions
                            <svg className="w-3.5 h-3.5 ml-1 sm:ml-1.5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </Link>
                  )})}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
