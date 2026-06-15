'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Clock, HelpCircle, BarChart, Loader2, ChevronRight, BookOpen, Target } from "lucide-react";
import { ContentBadge } from "@/components/content-badge";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { MockTestFilters } from "@/components/mock-test-filters";

type Test = {
  id: string;
  title: string;
  subtitle?: string;
  subject: string;
  questions: any[];
  duration: number;
  difficulty: string | string[];
  questionSource?: string | string[];
  access: "free" | "premium" | "pro";
  testType: string | string[];
  textbookId?: string;
  textbookTitle?: string;
  chapterId?: string;
  topicId?: string;
  board?: string;
  classCategory?: string;
  class?: string;
  featureImage?: string;
  description?: string;
};

const ITEMS_PER_PAGE = 12;

function getUrlForTest(test: Test) {
    if (test.textbookId && test.chapterId) {
        const topicSegment = test.topicId || 'null';
        return `/textbook-solutions/mock-test/${test.id}/textbook/${test.textbookId}/chapter/${test.chapterId}/topic/${topicSegment}`;
    }
    if (test.textbookId) {
        return `/textbook-solutions/mock-test/${test.id}/textbook/${test.textbookId}`;
    }
    const primaryType = Array.isArray(test.testType) ? test.testType[0] : test.testType;
    if (!primaryType) return `/content/${test.id}`; // Fallback
    
    const typeSlug = primaryType.toLowerCase().replace(/\s+/g, '-');
    return `/${typeSlug}/${test.id}`;
}

export default function MockTestsClientPage({ initialTests }: { initialTests: Test[] }) {
  const [tests, setTests] = useState<Test[]>(initialTests);
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [subjects, setSubjects] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (initialTests) {
        const uniqueSubjects = Array.from(new Set(initialTests.map((exam) => exam.subject))).filter(Boolean) as string[];
        setSubjects(uniqueSubjects);
    }
  }, [initialTests]);
  
  const visibleTests = useMemo(() => {
    return tests.slice(0, visibleCount);
  }, [tests, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount(prevCount => prevCount + ITEMS_PER_PAGE);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* ── Native Mobile Header & Desktop Hero ── */}
      <section className="bg-gradient-to-br from-blue-700 to-indigo-800 text-white rounded-b-3xl md:rounded-none md:bg-hero-gradient relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-blue-400/20 blur-xl"></div>
        
        <div className="container mx-auto px-4 py-8 md:py-20 lg:py-28 relative z-10">
          <div className="flex items-center gap-2 mb-3 md:hidden">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-wide uppercase text-blue-100">Practice Zone</span>
          </div>

          <h1 className="text-2xl md:text-5xl lg:text-7xl font-extrabold tracking-tight md:text-center drop-shadow-md">
            Mock Tests
          </h1>
          <p className="text-sm md:text-lg lg:text-xl mt-2 md:mt-4 max-w-3xl md:mx-auto md:text-center text-blue-100/90 leading-relaxed">
            Simulate real exams and boost your confidence with our curated mock tests.
          </p>
        </div>
      </section>

      {/* ── Content ── */}
      <div className="container mx-auto px-3 md:px-4 -mt-4 md:mt-0 relative z-20">
        <div className="py-4 md:py-12">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-3 flex gap-3 shadow-sm border border-slate-100">
                  <Skeleton className="w-24 h-24 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : tests.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                {visibleTests.map((test) => (
                  <Link href={getUrlForTest(test)} key={test.id} className="block group">
                    {/* Native Android Card Style */}
                    <div className="bg-white rounded-2xl p-2.5 md:p-4 flex md:flex-col gap-3 md:gap-4 shadow-sm border border-slate-200/80 active:bg-slate-50 transition-colors md:hover:shadow-md h-full">
                      
                      {/* Image Thumbnail */}
                      <div className="w-28 h-24 md:w-full md:h-40 rounded-xl overflow-hidden relative flex-shrink-0 bg-slate-100">
                        <Image
                          src={test.featureImage || `https://picsum.photos/seed/${test.id}/400/225`}
                          alt={test.title}
                          width={400}
                          height={225}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1.5 left-1.5 md:top-2 md:left-2">
                          <ContentBadge type={test.access} />
                        </div>
                      </div>

                      {/* Content Details */}
                      <div className="flex-1 min-w-0 flex flex-col py-0.5 md:py-0">
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 mb-1.5 md:mb-2">
                          {test.subject && <span className="text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">{test.subject}</span>}
                          {test.board && <span className="text-[10px] md:text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">{test.board}</span>}
                        </div>

                        {/* Title */}
                        <h3 className="text-sm md:text-lg font-bold text-slate-900 leading-snug line-clamp-2 mb-1">
                          {test.title}
                        </h3>

                        {/* Description / Subtitle */}
                        <p className="text-[11px] md:text-sm text-slate-500 line-clamp-1 mb-2 md:mb-4">
                          {test.subtitle || test.description || (test.textbookTitle && `From: ${test.textbookTitle}`)}
                        </p>

                        {/* Bottom Meta & Action */}
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-2.5 text-[10px] md:text-xs font-semibold text-slate-500">
                            {test.duration > 0 && (
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {test.duration}m</span>
                            )}
                            <span className="flex items-center gap-1"><HelpCircle className="w-3 h-3" /> {(test.questions?.length || 0)} Qs</span>
                          </div>
                          
                          <div className="w-7 h-7 md:w-auto md:h-auto md:px-4 md:py-2 md:bg-blue-600 md:hover:bg-blue-700 md:text-white rounded-full bg-blue-50 flex items-center justify-center text-blue-600 transition-colors">
                            <ChevronRight className="w-4 h-4 md:hidden" />
                            <span className="hidden md:inline text-sm font-semibold">Start</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              
              {visibleCount < tests.length && (
                <div className="mt-8 md:mt-12 text-center">
                  <Button onClick={handleLoadMore} className="rounded-full px-8 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold shadow-sm">
                    Load More
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">No Tests Found</h3>
              <p className="text-sm text-slate-500">There are no mock tests available matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
