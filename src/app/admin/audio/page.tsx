'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchGuideItems } from '@/lib/firebase/guide';
import { db } from '@/lib/firebase/client';
import { Headphones, Edit3, Trash2, Eye, BarChart2, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function AdminAudioPage() {
  const [audios, setAudios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAudios();
  }, []);

  const loadAudios = async () => {
    setLoading(true);
    try {
      const data = await fetchGuideItems('guide_audios');
      setAudios(data);
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to load audios', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this audio track?")) return;
    try {
      // Need to import deleteDoc and doc from firebase/firestore directly but 
      // as a quick fix we use the dynamic import or assume it exists if added to guide.ts
      // For now, doing it via client SDK
      const { deleteDoc, doc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'guide_audios', id));
      toast({ title: 'Success', description: 'Audio deleted successfully.' });
      loadAudios();
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to delete audio.', variant: 'destructive' });
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Headphones className="w-8 h-8 text-indigo-500" />
            Audio Library
          </h1>
          <p className="text-slate-500 mt-2">Central repository for all educational audio tracks and podcasts.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={loadAudios} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Refresh'}
          </Button>
          <Link href="/admin/audio/add">
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Add New Audio
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
                  <th className="p-4 font-medium text-slate-500 w-24">Cover</th>
                  <th className="p-4 font-medium text-slate-500">Audio Details</th>
                  <th className="p-4 font-medium text-slate-500">Type & Status</th>
                  <th className="p-4 font-medium text-slate-500">Instructor</th>
                  <th className="p-4 font-medium text-slate-500">Stats</th>
                  <th className="p-4 font-medium text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {audios.map(audio => (
                  <tr key={audio.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="w-20 h-20 bg-indigo-50 rounded-lg overflow-hidden flex items-center justify-center shrink-0 border border-indigo-100">
                        {audio.thumbnail ? (
                          <img src={audio.thumbnail} alt="cover" className="w-full h-full object-cover" />
                        ) : (
                          <Headphones className="w-8 h-8 text-indigo-300" />
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 line-clamp-1 text-base">{audio.title || 'Untitled Audio'}</div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                        <span>Duration: {audio.duration || '00:00'}</span>
                        <span>•</span>
                        <span>Attached to: {audio.attachments?.length || 0} Topics</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-slate-700 capitalize">{audio.audioType || 'Lesson'}</div>
                      <span className={`inline-flex items-center px-2 py-0.5 mt-1 rounded text-[10px] font-medium uppercase tracking-wider ${audio.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {audio.status || 'Draft'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600 font-medium">
                      {audio.instructorName || 'DeshExam'}
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      <div>Listens: {audio.views || audio.listens || 0}</div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/learn/audio/${audio.slug || audio.id}`}>
                          <Button variant="ghost" size="icon" title="Preview">
                            <Eye className="w-4 h-4 text-slate-500" />
                          </Button>
                        </Link>
                        <Link href={`/admin/audio/edit/${audio.id}`}>
                          <Button variant="ghost" size="icon" title="Edit">
                            <Edit3 className="w-4 h-4 text-indigo-500" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" title="Analytics">
                          <BarChart2 className="w-4 h-4 text-emerald-500" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Delete" onClick={() => handleDelete(audio.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {audios.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No audio tracks found in the library. Click "Add New Audio" to get started.
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
