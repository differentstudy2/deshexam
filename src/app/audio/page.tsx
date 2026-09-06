import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Headphones, Play } from 'lucide-react';
import { fetchGuideItems } from '@/lib/firebase/guide';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Audios | DeshExam',
  description: 'Browse all educational audio resources and podcasts.',
};

export default async function AudiosPage() {
  const items = await fetchGuideItems('guide_audios');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Headphones className="w-8 h-8 text-emerald-500" />
          Educational Audio
        </h1>
        <p className="text-slate-500 mt-2">Browse our collection of audio guides and pronunciations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item: any) => (
          <Card key={item.id} className="border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-4">
                <Headphones className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 line-clamp-2">
                {item.title}
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                Added {item.createdAt ? new Date(item.createdAt.toMillis()).toLocaleDateString() : 'recently'}
              </p>
              <div className="mt-auto">
                <audio controls src={item.url} className="w-full h-10 mb-4 outline-none"></audio>
                <Link 
                  href={`/audio/${item.id}`}
                  className="w-full inline-flex justify-center items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-md transition-colors"
                >
                  <Play className="w-4 h-4" />
                  View Details
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}

        {items.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <Headphones className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p>No audio files found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
