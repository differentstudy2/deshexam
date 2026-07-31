'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Headphones, Clock, User, Search, Filter, PlayCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function AudiosPage() {
  const [audios, setAudios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('all');

  useEffect(() => {
    const fetchAudios = async () => {
      try {
        const q = query(
          collection(db, 'guide_audios'),
          where('status', '==', 'published')
        );
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setAudios(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAudios();
  }, []);

  const audioTypes = ['all', 'lesson', 'podcast', 'listening_test', 'pronunciation'];

  const filtered = audios.filter(a => {
    const matchSearch = (a.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.instructorName || '').toLowerCase().includes(search.toLowerCase());
    const matchType = activeType === 'all' || a.audioType === activeType;
    return matchSearch && matchType;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#4f46e5] via-[#4338ca] to-[#3730a3] text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <Headphones className="w-4 h-4" />
            Audio Library
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Listen & Learn Anytime
          </h1>
          <p className="text-lg text-white/70 max-w-xl mx-auto mb-8">
            Browse our complete library of podcasts, pronunciation guides, and lesson audios curated by DeshExam instructors.
          </p>

          {/* Search */}
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search audios or instructors..."
              className="pl-12 h-12 text-base bg-white text-slate-800 border-0 shadow-lg rounded-xl focus-visible:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Filter chips */}
        <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-1">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {audioTypes.map(type => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize whitespace-nowrap transition-colors ${
                activeType === type
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400'
              }`}
            >
              {type === 'all' ? 'All Audios' : type.replace('_', ' ')}
            </button>
          ))}
          <span className="ml-auto text-sm text-slate-500 shrink-0">{filtered.length} track{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-xl bg-white dark:bg-slate-900 overflow-hidden animate-pulse shadow-sm border border-slate-100 dark:border-slate-800 flex items-center p-4 gap-4">
                <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-lg shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <Headphones className="w-14 h-14 text-slate-200 mx-auto mb-4" />
            <p className="text-xl font-semibold text-slate-500">No audios found</p>
            <p className="text-slate-400 mt-1">Try a different search term or filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(audio => (
              <Link
                key={audio.id}
                href={`/audio/${audio.slug || audio.id}`}
                className="group rounded-xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-200 flex flex-col"
              >
                {/* Thumbnail Header Area */}
                <div className="relative h-32 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  {audio.thumbnail ? (
                    <img
                      src={audio.thumbnail}
                      alt={audio.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 blur-[2px] group-hover:blur-0 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20">
                      <Headphones className="w-10 h-10 text-indigo-300" />
                    </div>
                  )}
                  {/* Play overlay overlay */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-colors group-hover:bg-black/20">
                    <PlayCircle className="w-12 h-12 text-white/90 group-hover:scale-110 transition-transform" />
                  </div>
                  {/* Duration badge */}
                  {audio.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded font-mono">
                      {audio.duration}
                    </div>
                  )}
                  {/* Type badge */}
                  {audio.audioType && (
                    <div className="absolute top-2 left-2 bg-indigo-600/90 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                      {audio.audioType}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                  <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-base line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex-1 mb-2">
                    {audio.title}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-auto">
                    <User className="w-3.5 h-3.5" />
                    <span className="truncate">{audio.instructorName || 'DeshExam'}</span>
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
