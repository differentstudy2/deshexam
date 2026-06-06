'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchGuideItems } from '@/lib/firebase/guide';
import { Video, Edit3, Trash2, Eye, BarChart2, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminVideoPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const data = await fetchGuideItems('guide_videos');
      setVideos(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Video className="w-8 h-8 text-blue-500" />
            Video Library
          </h1>
          <p className="text-slate-500 mt-2">Central repository for all educational videos.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={loadVideos} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Refresh'}
          </Button>
          <Link href="/admin/video/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add New Video
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="p-4 font-medium text-slate-500 w-24">Thumbnail</th>
                  <th className="p-4 font-medium text-slate-500">Video Details</th>
                  <th className="p-4 font-medium text-slate-500">Type & Status</th>
                  <th className="p-4 font-medium text-slate-500">Instructor</th>
                  <th className="p-4 font-medium text-slate-500">Stats</th>
                  <th className="p-4 font-medium text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {videos.map(video => (
                  <tr key={video.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="w-20 h-12 bg-slate-200 rounded overflow-hidden flex items-center justify-center shrink-0">
                        {video.thumbnail ? (
                          <img src={video.thumbnail} alt="thumb" className="w-full h-full object-cover" />
                        ) : (
                          <Video className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-900 line-clamp-1">{video.title || 'Untitled'}</div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                        <span>Duration: {video.duration || '00:00'}</span>
                        <span>•</span>
                        <span>Attached to: {video.attachments?.length || 0} Topics</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-slate-700 capitalize">{video.videoType || 'Lesson'}</div>
                      <span className={`inline-flex items-center px-2 py-0.5 mt-1 rounded text-[10px] font-medium uppercase tracking-wider ${video.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {video.status || 'Draft'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600 font-medium">
                      {video.instructorName || 'DeshExam'}
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      <div>Views: {video.views || 0}</div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/learn/video/${video.slug || video.id}`}>
                          <Button variant="ghost" size="icon" title="Preview">
                            <Eye className="w-4 h-4 text-slate-500" />
                          </Button>
                        </Link>
                        <Link href={`/admin/video/edit/${video.id}`}>
                          <Button variant="ghost" size="icon" title="Edit">
                            <Edit3 className="w-4 h-4 text-blue-500" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" title="Analytics">
                          <BarChart2 className="w-4 h-4 text-emerald-500" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Delete">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {videos.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No videos found in the library. Click "Add New Video" to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
