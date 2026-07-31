'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderTree, BookOpen, Library, GraduationCap, FileText, Layers, History } from 'lucide-react';
import Link from 'next/link';

export default function GuideContentDashboard() {
  const [stats, setStats] = useState({
    classes: 0,
    subjects: 0,
    textbooks: 0,
    chapters: 0,
    topics: 0,
  });

  useEffect(() => {
    let mounted = true;
    import('@/lib/firebase/guide').then(({ getGuideStats }) => {
      getGuideStats().then(data => {
        if (mounted) setStats(data);
      });
    });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-[#107c41]" />
            Guide Content Dashboard
          </h1>
          <p className="text-slate-500 mt-2">Manage the 6-level hierarchy of DeshExam Guide content.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/guide-content/explorer">
            <Button variant="outline" className="border-slate-200">
              <FolderTree className="w-4 h-4 mr-2" />
              Content Explorer
            </Button>
          </Link>
          <Link href="/admin/guide-content/topic/create">
            <Button className="bg-[#107c41] hover:bg-[#0b5c30]">
              <FileText className="w-4 h-4 mr-2" />
              Create New Topic
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-500">Total Classes</p>
                <p className="text-3xl font-bold">{stats.classes}</p>
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <GraduationCap className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-500">Subjects</p>
                <p className="text-3xl font-bold">{stats.subjects}</p>
              </div>
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <Library className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-500">Textbooks</p>
                <p className="text-3xl font-bold">{stats.textbooks}</p>
              </div>
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-500">Chapters</p>
                <p className="text-3xl font-bold">{stats.chapters}</p>
              </div>
              <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <Layers className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-500">Topics</p>
                <p className="text-3xl font-bold">{stats.topics}</p>
              </div>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <FileText className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity (Placeholder) */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-500" />
            <CardTitle>Recently Updated Topics</CardTitle>
          </div>
          <CardDescription>The latest changes made to the curriculum.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-500 italic py-4">
            Recent activity log will appear here once topics are modified.
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
