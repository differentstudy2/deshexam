'use client';

import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAssessments } from '@/lib/firebase/assessment';
import { AssessmentBase } from '@/lib/assessment-types';
import { AssessmentCard } from '@/components/assessment/AssessmentCard';
import { BookOpen, Trophy, Target, ShieldCheck, Loader2 } from 'lucide-react';

interface AssessmentTabsProps {
  chapterId: string;
}

export function AssessmentTabs({ chapterId }: AssessmentTabsProps) {
  const [activeTab, setActiveTab] = useState('practice');
  const [data, setData] = useState<Record<string, AssessmentBase[]>>({
    practice: [],
    quiz: [],
    mock: [],
    exam: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const { getAssessmentsByTopic } = await import('@/lib/firebase/assessment');
        const [ps, qz, mt, ep] = await Promise.all([
          getAssessmentsByTopic('practiceSets', chapterId),
          getAssessmentsByTopic('quizzes', chapterId),
          getAssessmentsByTopic('mockTests', chapterId),
          getAssessmentsByTopic('examPapers', chapterId)
        ]);

        const filterPublished = (arr: any[]) => arr.filter(a => a.status === 'Published');

        setData({
          practice: filterPublished(ps),
          quiz: filterPublished(qz),
          mock: filterPublished(mt),
          exam: filterPublished(ep),
        });
      } catch (error) {
        console.error("Failed to load assessments for chapter", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [chapterId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // If there are absolutely no assessments for this chapter, don't show the tabs
  const hasAnyAssessments = Object.values(data).some(arr => arr.length > 0);
  if (!hasAnyAssessments) {
    return null;
  }

  return (
    <div className="mt-12 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
      <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100">Assessments for this Chapter</h2>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 mb-8">
          <TabsTrigger value="practice" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-[#00a651]">
            <Target className="w-4 h-4 mr-2" /> Practice ({data.practice.length})
          </TabsTrigger>
          <TabsTrigger value="quiz" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-purple-600">
            <Trophy className="w-4 h-4 mr-2" /> Quizzes ({data.quiz.length})
          </TabsTrigger>
          <TabsTrigger value="mock" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-blue-600">
            <ShieldCheck className="w-4 h-4 mr-2" /> Mock Tests ({data.mock.length})
          </TabsTrigger>
          <TabsTrigger value="exam" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-orange-600">
            <BookOpen className="w-4 h-4 mr-2" /> Past Papers ({data.exam.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="practice">
          <AssessmentGrid items={data.practice} type="Practice" emptyMsg="No practice sets available for this chapter yet." />
        </TabsContent>
        <TabsContent value="quiz">
          <AssessmentGrid items={data.quiz} type="Quiz" emptyMsg="No quizzes available for this chapter yet." />
        </TabsContent>
        <TabsContent value="mock">
          <AssessmentGrid items={data.mock} type="Mock Test" emptyMsg="No mock tests available for this chapter yet." />
        </TabsContent>
        <TabsContent value="exam">
          <AssessmentGrid items={data.exam} type="Exam" emptyMsg="No past papers available for this chapter yet." />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AssessmentGrid({ items, type, emptyMsg }: { items: AssessmentBase[], type: any, emptyMsg: string }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-500">
        {emptyMsg}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map(item => (
        <AssessmentCard key={item.id} assessment={item} type={type} href={`/assessment/take/${item.id}`} />
      ))}
    </div>
  );
}
