import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PlayCircle, Headphones, FileText, CheckCircle, Video, BookOpen, HelpCircle } from 'lucide-react';
import Link from 'next/link';

interface RelatedResourcesProps {
  resources?: any[]; // In a real scenario, this would be typed
}

export function RelatedResources({ resources = [] }: RelatedResourcesProps) {
  // Fallback to some mock resources if none provided
  const displayResources = resources.length > 0 ? resources : [
    { title: "Chapter Video Lecture", type: "video", icon: <PlayCircle className="w-5 h-5 text-red-500" />, link: "#" },
    { title: "Audio Summary", type: "audio", icon: <Headphones className="w-5 h-5 text-purple-500" />, link: "#" },
    { title: "MCQ Practice Set", type: "mcq", icon: <CheckCircle className="w-5 h-5 text-green-500" />, link: "#" },
    { title: "Important Questions", type: "guide_content", icon: <HelpCircle className="w-5 h-5 text-blue-500" />, link: "#" },
  ];

  if (displayResources.length === 0) return null;

  return (
    <div className="mb-10">
      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Related Resources</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayResources.map((res, i) => (
          <Link href={res.link || '#'} key={i} className="block group">
            <Card className="border border-slate-200 dark:border-slate-800 hover:border-[#107c41] dark:hover:border-[#107c41] transition-colors shadow-sm bg-slate-50 dark:bg-slate-900 group-hover:shadow-md">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                  {res.icon || <FileText className="w-5 h-5 text-slate-500" />}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm line-clamp-1">{res.title}</h4>
                  <p className="text-xs text-slate-500 capitalize">{res.type}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
