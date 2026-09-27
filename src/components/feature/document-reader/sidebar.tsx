import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Bookmark, PlayCircle, BookOpen } from 'lucide-react';
import Link from 'next/link';

export function DocumentSidebar() {
  return (
    <div className="w-full lg:w-80 shrink-0 hidden lg:block">
      <div className="sticky top-24 space-y-6">
        
        {/* Reading Progress */}
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Reading Progress</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mb-2">
              <div className="bg-[#107c41] h-2.5 rounded-full" style={{ width: '0%' }}></div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-right">0% Completed</p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button variant="outline" className="w-full justify-start text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700">
            <Bookmark className="w-4 h-4 mr-2" /> Save to Bookmarks
          </Button>
        </div>

        {/* Related Documents */}
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Related Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {[1, 2, 3].map((i) => (
                <Link href="#" key={i} className="flex items-start gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded shrink-0">
                     <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight mb-1">Previous Year Question Solutions</h4>
                    <p className="text-xs text-slate-500">12 Pages • PDF</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
