'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { getClasses } from '@/lib/firebase/firestore';
import hardcodedClassesJson from '@/data/hardcoded/taxonomy/classes.json';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const ITEMS_PER_PAGE = 12;

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

export default function BoardSolutionsClient({ board }: { board: string }) {
  const [classes, setClasses] = useState<{id: string, name: string, slug: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const formattedBoard = board.toUpperCase();

  useEffect(() => {
    const fetchBoardClasses = async () => {
      try {
        setLoading(true);
        const firebaseClasses = await getClasses().catch(() => []);

        const boardToSlugsMap: Record<string, string[]> = {
          cbse: ['cbse-board', 'cbse'],
          wbbse: ['wb-board', 'wbbme', 'wbbse'], // Excluded wbbpe to show only secondary classes
          wbchse: ['wbchse'],
          ncert: ['ncert'],
          icse: ['icse-board', 'icse']
        };

        const boardSlugs = boardToSlugsMap[board.toLowerCase()] || [board.toLowerCase()];

        // Safely extract array regardless of module system
        let hardcodedClasses: any[] = [];
        if (Array.isArray(hardcodedClassesJson)) {
          hardcodedClasses = hardcodedClassesJson;
        } else if (hardcodedClassesJson && typeof hardcodedClassesJson === 'object') {
          if (Array.isArray((hardcodedClassesJson as any).default)) {
            hardcodedClasses = (hardcodedClassesJson as any).default;
          } else {
            // fallback if it's an object with keys
            hardcodedClasses = Object.values(hardcodedClassesJson);
          }
        }

        const filteredHardcodedClasses = hardcodedClasses.filter(c => 
          c && c.boardSlug && boardSlugs.includes(c.boardSlug)
        ).map(c => ({ id: c.id, name: c.title || 'Unknown', slug: c.classSlug || c.slug || 'unknown' }));

        const firebaseMapped = (firebaseClasses as any[]).filter(c => 
          c.boardSlug && boardSlugs.includes(c.boardSlug)
        ).map(c => ({ 
          id: c.id, 
          name: c.name || c.title, 
          slug: c.classSlug || c.slug || (c.name || c.title)?.toLowerCase().replace(/\s+/g, '-') 
        }));

        // Ensure unique classes by name
        const allBoardClassesMap = new Map();
        [...filteredHardcodedClasses, ...firebaseMapped].forEach(c => {
          if (!allBoardClassesMap.has(c.name)) {
            allBoardClassesMap.set(c.name, c);
          }
        });

        // Sort classes (e.g. Class 5, Class 6... instead of random order)
        const sortedClasses = Array.from(allBoardClassesMap.values()).sort((a, b) => {
          // Sort KG before Class
          const isKgA = a.name.toLowerCase().includes('kg');
          const isKgB = b.name.toLowerCase().includes('kg');
          
          if (isKgA && !isKgB) return -1;
          if (!isKgA && isKgB) return 1;

          // Extract numbers from class names for numeric sorting
          const numA = parseInt(a.name.replace(/\D/g, '')) || 0;
          const numB = parseInt(b.name.replace(/\D/g, '')) || 0;
          if (numA !== numB) return numA - numB;
          return a.name.localeCompare(b.name);
        });

        setClasses(sortedClasses);
      } catch (error) {
         toast({
          variant: "destructive",
          title: "Error fetching data",
          description: (error as Error).message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBoardClasses();
  }, [toast, board]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white py-16 px-4 relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
           <div className="absolute top-[-10%] left-[-5%] w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
           <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-black opacity-10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-4 text-emerald-100 border-emerald-200/30 bg-emerald-800/30">
              Board Solutions
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-headline tracking-tight">
              {formattedBoard} Textbook Solutions
            </h1>
            <p className="text-lg md:text-xl text-emerald-50 mb-8 opacity-90 max-w-2xl leading-relaxed">
              Master your {formattedBoard} board exams with step-by-step, comprehensive solutions for all major textbooks. Find chapter-wise explanations and ace your preparation.
            </p>
          </div>
        </div>
      </div>

        <div className="container mx-auto max-w-7xl px-4 mt-8 md:mt-12">
        {/* Classes Section */}
        {!loading && classes.length > 0 ? (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-headline mb-6">Select Your Class</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {classes.map((c, index) => {
                const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
                
                return (
                <Link
                   key={c.id}
                   href={`/solutions/${board.toLowerCase()}/${c.slug}`}
                   className="group relative flex flex-col items-center justify-center p-8 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl border-none"
                   style={{
                      boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)'
                   }}
                >
                  {/* Premium Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-95 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  
                  {/* Subtle noise/pattern overlay */}
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-300"></div>
                  
                  <div className="relative z-10 flex flex-col items-center w-full">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-5 backdrop-blur-md shadow-inner border border-white/30 group-hover:scale-110 transition-transform duration-500 ease-out">
                      <GraduationCap className="h-8 w-8 text-white drop-shadow-md" />
                    </div>
                    
                    <span className="font-bold text-2xl text-white tracking-wide drop-shadow-md font-headline mb-4">{c.name}</span>
                    
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
        ) : !loading && classes.length === 0 ? (
           <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-12">
            <div className="mx-auto w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <GraduationCap className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">No classes found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
                We couldn't find any classes for the {formattedBoard} board at this time. We are constantly adding new materials, so check back soon!
            </p>
          </div>
        ) : (
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
              {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 w-full rounded-xl" />
              ))}
           </div>
        )}
      </div>
    </div>
  );
}
