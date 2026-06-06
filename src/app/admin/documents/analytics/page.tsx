'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart2, Download, Eye, TrendingUp, FileText, Loader2 } from 'lucide-react';

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
      <div>
        <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</div>
        <div className="text-sm text-slate-500">{label}</div>
      </div>
    </div>
  );
}

export default function DocumentAnalyticsPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(collection(db, 'documents'))
      .then(s => setDocs(s.docs.map(d => ({ id: d.id, ...d.data() }))))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalDownloads = docs.reduce((a, d) => a + (d.downloads || 0), 0);
  const totalViews = docs.reduce((a, d) => a + (d.views || 0), 0);
  const topByDownloads = [...docs].sort((a, b) => (b.downloads || 0) - (a.downloads || 0)).slice(0, 10);
  const topByViews = [...docs].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10);

  const catMap: Record<string, number> = {};
  docs.forEach(d => { const c = d.category || 'other'; catMap[c] = (catMap[c] || 0) + 1; });
  const catData = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817]">
      <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link href="/admin/documents">
            <Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-purple-500" /> Document Analytics
            </h1>
            <p className="text-xs text-slate-500">Track views, downloads, and engagement</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Documents" value={docs.length} icon={<FileText className="w-6 h-6 text-blue-600" />} color="bg-blue-50 dark:bg-blue-900/20" />
              <StatCard label="Total Downloads" value={totalDownloads.toLocaleString()} icon={<Download className="w-6 h-6 text-emerald-600" />} color="bg-emerald-50 dark:bg-emerald-900/20" />
              <StatCard label="Total Views" value={totalViews.toLocaleString()} icon={<Eye className="w-6 h-6 text-purple-600" />} color="bg-purple-50 dark:bg-purple-900/20" />
              <StatCard label="Published" value={docs.filter(d => d.status === 'published').length} icon={<TrendingUp className="w-6 h-6 text-amber-600" />} color="bg-amber-50 dark:bg-amber-900/20" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top by downloads */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Download className="w-4 h-4 text-emerald-500" /> Most Downloaded
                  </h2>
                </div>
                {topByDownloads.length === 0 ? (
                  <p className="p-6 text-center text-sm text-slate-400">No data yet</p>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {topByDownloads.map((d, i) => (
                      <div key={d.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <span className="text-sm font-bold text-slate-400 w-5 shrink-0">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{d.title}</p>
                          <p className="text-xs text-slate-400 capitalize">{(d.category || '').replace(/_/g, ' ')}</p>
                        </div>
                        <span className="text-sm font-bold text-emerald-600 shrink-0">{(d.downloads || 0).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Category breakdown */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="font-bold text-slate-800 dark:text-slate-100">Category Breakdown</h2>
                </div>
                <div className="p-5 space-y-3">
                  {catData.length === 0 ? (
                    <p className="text-center text-sm text-slate-400 py-8">No data yet</p>
                  ) : catData.map(([cat, count]) => {
                    const pct = Math.round((count / docs.length) * 100);
                    return (
                      <div key={cat}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 capitalize">{cat.replace(/_/g, ' ')}</span>
                          <span className="text-xs text-slate-500">{count} · {pct}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
