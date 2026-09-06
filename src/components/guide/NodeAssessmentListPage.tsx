'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, FileText, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AssessmentCard } from '@/components/assessment/AssessmentCard';
import { AssessmentBase } from '@/lib/assessment-types';
import { getAssessmentsByNode, AssessmentCollectionType } from '@/lib/firebase/assessment';

interface NodeAssessmentListPageProps {
  node: any;
  contentType: string;
  breadcrumbs: { name: string; url: string }[];
}

export function NodeAssessmentListPage({ node, contentType, breadcrumbs }: NodeAssessmentListPageProps) {
  const [assessments, setAssessments] = useState<AssessmentBase[]>([]);
  const [loading, setLoading] = useState(true);

  const getCollectionAndInfo = (type: string): { collection: AssessmentCollectionType, title: string, typeName: 'Practice' | 'Quiz' | 'Mock Test' | 'Exam', baseHref: string } => {
    if (type.includes('practice')) return { collection: 'practiceSets', title: 'Practice Sets', typeName: 'Practice', baseHref: '/practice' };
    if (type.includes('quiz')) return { collection: 'quizzes', title: 'Quizzes', typeName: 'Quiz', baseHref: '/quizzes' };
    if (type.includes('mock') || type.includes('model')) return { collection: 'mockTests', title: 'Mock Tests', typeName: 'Mock Test', baseHref: '/mock-tests' };
    if (type.includes('exam')) return { collection: 'examPapers', title: 'Previous Year Papers', typeName: 'Exam', baseHref: '/previous-year-papers' };
    return { collection: 'practiceSets', title: 'Assessments', typeName: 'Practice', baseHref: '/practice' };
  };

  const info = getCollectionAndInfo(contentType);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const level = node.type as 'board' | 'class' | 'subject' | 'textbook' | 'chapter' | 'topic';
        const data = await getAssessmentsByNode(info.collection, level, node.id);
        setAssessments((data as AssessmentBase[]).filter(a => a.status === 'Published'));
      } catch (e) {
        console.error("Error fetching node assessments", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [node.id, node.type, info.collection]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] text-slate-800 dark:text-slate-200 font-sans pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="font-bold text-[17px] text-slate-900 dark:text-white">Academy</h1>
            <div className="hidden sm:flex flex-wrap items-center text-[13px] text-slate-500 dark:text-slate-400 font-medium border-l border-slate-200 dark:border-slate-800 pl-6">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <ChevronRight className="w-3.5 h-3.5 mx-2" />}
                  {idx === breadcrumbs.length - 1 ? (
                    <span className="text-slate-800 dark:text-slate-200">{crumb.name}</span>
                  ) : (
                    <Link href={crumb.url} className="hover:text-emerald-600 transition-colors">
                      {crumb.name}
                    </Link>
                  )}
                </React.Fragment>
              ))}
              <ChevronRight className="w-3.5 h-3.5 mx-2" />
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">{info.title}</span>
            </div>
          </div>
          {breadcrumbs.length > 0 && (
            <Link href={breadcrumbs[breadcrumbs.length - 1].url}>
              <Button
                variant="outline"
                className="h-8 px-5 bg-[#dcefe2] text-[#1b6b3e] border-transparent hover:bg-[#c2e2cc] hover:text-[#11512d] dark:bg-emerald-900/40 dark:text-emerald-400 dark:hover:bg-emerald-900/60 rounded-md font-bold text-sm shadow-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Topic
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10">
        <div className="mb-10 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
            {node.title} - {info.title}
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Choose a {info.typeName.toLowerCase()} below to test your knowledge on {node.title}.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[#00a651]" />
          </div>
        ) : assessments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
            <FileText className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No {info.title} Available</h3>
            <p className="text-slate-500 dark:text-slate-500 max-w-md">
              We are currently working on adding more {info.title.toLowerCase()} for this topic. Please check back later!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assessments.map(assessment => (
              <AssessmentCard 
                key={assessment.id} 
                assessment={assessment} 
                type={info.typeName} 
                href={`${info.baseHref}/${assessment.slug || assessment.id}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
