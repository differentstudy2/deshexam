'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Play, Clock, User, Search, Filter, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function VideosPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('all');

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const q = query(
          collection(db, 'guide_videos'),
          where('status', '==', 'published')
        );
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setVideos(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const videoTypes = ['all', 'lesson', 'explanation', 'revision'];

  const filtered = videos.filter(v => {
    const matchSearch = (v.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (v.instructorName || '').toLowerCase().includes(search.toLowerCase());
    const matchType = activeType === 'all' || v.videoType === activeType;
    return matchSearch && matchType;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0f4c2a] via-[#107c41] to-[#1a9e52] text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <Play className="w-4 h-4 fill-current" />
            Video Library
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Learn from Expert Videos
          </h1>
          <p className="text-lg text-white/70 max-w-xl mx-auto mb-8">
            Browse our complete library of lesson, explanation, and revision videos curated by DeshExam instructors.
          </p>

          {/* Search */}
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search videos or instructors..."
              className="pl-12 h-12 text-base bg-white text-slate-800 border-0 shadow-lg rounded-xl focus-visible:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Filter chips */}
        <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-1">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {videoTypes.map(type => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize whitespace-nowrap transition-colors ${
                activeType === type
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-400'
              }`}
            >
              {type === 'all' ? 'All Videos' : type}
            </button>
          ))}
          <span className="ml-auto text-sm text-slate-500 shrink-0">{filtered.length} video{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-xl bg-white dark:bg-slate-900 overflow-hidden animate-pulse shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="aspect-video bg-slate-200 dark:bg-slate-800" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <Play className="w-14 h-14 text-slate-200 mx-auto mb-4" />
            <p className="text-xl font-semibold text-slate-500">No videos found</p>
            <p className="text-slate-400 mt-1">Try a different search term or filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(video => (
              <Link
                key={video.id}
                href={`/video/${video.slug || video.id}`}
                className="group rounded-xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-200 flex flex-col"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  {video.thumbnail ? (
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20">
                      <Play className="w-10 h-10 text-emerald-400" />
                    </div>
                  )}
                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 text-emerald-600 fill-current ml-0.5" />
                    </div>
                  </div>
                  {/* Duration badge */}
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded font-mono">
                      {video.duration}
                    </div>
                  )}
                  {/* Type badge */}
                  {video.videoType && (
                    <div className="absolute top-2 left-2 bg-emerald-600/90 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                      {video.videoType}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                  <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm line-clamp-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors flex-1 mb-2">
                    {video.title}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-auto">
                    <User className="w-3.5 h-3.5" />
                    <span className="truncate">{video.instructorName || 'DeshExam'}</span>
                    {video.duration && (
                      <>
                        <span className="mx-1">·</span>
                        <Clock className="w-3.5 h-3.5" />
                        <span>{video.duration}</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
