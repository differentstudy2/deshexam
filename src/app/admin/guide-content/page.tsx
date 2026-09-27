'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderTree, BookOpen, Library, GraduationCap, FileText, Layers, History } from 'lucide-react';
import Link from 'next/link';

export default function GuideContentDashboard() {
  const [stats, setStats] = useState({
    boards: 0,
    classes: 0,
    subjects: 0,
    textbooks: 0,
    chapters: 0,
    topics: 0,
  });

  const [recentNodes, setRecentNodes] = useState<any[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  useEffect(() => {
    let mounted = true;
    import('@/lib/firebase/taxonomy').then(({ getTaxonomyNodesByTrack }) => {
      getTaxonomyNodesByTrack('academic').then(nodes => {
        if (mounted) {
          const newStats = {
            boards: nodes.filter(n => n.type === 'board').length,
            classes: nodes.filter(n => n.type === 'class').length,
            subjects: nodes.filter(n => n.type === 'subject').length,
            textbooks: nodes.filter(n => n.type === 'textbook').length,
            chapters: nodes.filter(n => n.type === 'chapter').length,
            topics: nodes.filter(n => n.type === 'topic').length,
          };
          setStats(newStats);
        }
      });
    });
    
    import('@/lib/firebase/taxonomy').then(({ getRecentlyUpdatedNodes }) => {
      getRecentlyUpdatedNodes(5, 'academic').then(nodes => {
        if (mounted) {
          setRecentNodes(nodes);
          setLoadingRecent(false);
        }
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1 sm:space-y-2">
                <p className="text-xs sm:text-sm font-medium text-slate-500">Boards</p>
                <p className="text-2xl sm:text-3xl font-bold">{stats.boards}</p>
              </div>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg hidden sm:block">
                <FolderTree className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1 sm:space-y-2">
                <p className="text-xs sm:text-sm font-medium text-slate-500">Classes</p>
                <p className="text-2xl sm:text-3xl font-bold">{stats.classes}</p>
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg hidden sm:block">
                <GraduationCap className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1 sm:space-y-2">
                <p className="text-xs sm:text-sm font-medium text-slate-500">Subjects</p>
                <p className="text-2xl sm:text-3xl font-bold">{stats.subjects}</p>
              </div>
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hidden sm:block">
                <Library className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1 sm:space-y-2">
                <p className="text-xs sm:text-sm font-medium text-slate-500">Textbooks</p>
                <p className="text-2xl sm:text-3xl font-bold">{stats.textbooks}</p>
              </div>
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg hidden sm:block">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1 sm:space-y-2">
                <p className="text-xs sm:text-sm font-medium text-slate-500">Chapters</p>
                <p className="text-2xl sm:text-3xl font-bold">{stats.chapters}</p>
              </div>
              <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg hidden sm:block">
                <Layers className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1 sm:space-y-2">
                <p className="text-xs sm:text-sm font-medium text-slate-500">Topics</p>
                <p className="text-2xl sm:text-3xl font-bold">{stats.topics}</p>
              </div>
              <div className="p-2 bg-sky-50 dark:bg-sky-900/20 rounded-lg hidden sm:block">
                <FileText className="w-5 h-5 text-sky-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-500" />
            <CardTitle>Recently Updated Items</CardTitle>
          </div>
          <CardDescription>The latest changes made to the Universal Taxonomy tree.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingRecent ? (
            <div className="text-sm text-slate-500 py-4 animate-pulse">Loading recent activity...</div>
          ) : recentNodes.length === 0 ? (
            <div className="text-sm text-slate-500 italic py-4">No recent activity found.</div>
          ) : (
            <div className="space-y-4">
              {recentNodes.map((node) => (
                <div key={node.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                      {node.type === 'board' ? <FolderTree className="w-4 h-4 text-emerald-600" /> :
                       node.type === 'class' ? <GraduationCap className="w-4 h-4 text-indigo-600" /> :
                       node.type === 'subject' ? <Library className="w-4 h-4 text-amber-600" /> :
                       node.type === 'textbook' ? <BookOpen className="w-4 h-4 text-purple-600" /> :
                       node.type === 'chapter' ? <Layers className="w-4 h-4 text-rose-600" /> :
                       <FileText className="w-4 h-4 text-sky-600" />
                      }
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        {node.title} 
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium uppercase tracking-wide">
                          {node.type}
                        </span>
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500">ID: {node.id}</span>
                        {node.updatedAt && (
                          <>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span className="text-xs text-slate-500">
                              Updated {node.updatedAt.toDate ? node.updatedAt.toDate().toLocaleDateString() : 'Recently'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Link href="/admin/guide-content/explorer">
                    <Button variant="outline" size="sm" className="hidden sm:flex">
                      View in Explorer
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
