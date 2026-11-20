'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getUserQuestionPaperDrafts, deleteQuestionPaperDraft, SavedQuestionPaper } from '@/lib/firebase/question-bank';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2, FileText, Trash2, Edit, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function MyPapersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [drafts, setDrafts] = useState<SavedQuestionPaper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    const fetchDrafts = async () => {
      try {
        const fetchedDrafts = await getUserQuestionPaperDrafts(user.uid);
        setDrafts(fetchedDrafts);
      } catch (error) {
        console.error('Error fetching drafts:', error);
        toast({ title: 'Failed to load saved papers', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDrafts();
  }, [user]);

  const handleDelete = async (draftId: string) => {
    if (!confirm('Are you sure you want to delete this saved paper?')) return;
    
    try {
      await deleteQuestionPaperDraft(draftId);
      setDrafts(prev => prev.filter(d => d.id !== draftId));
      toast({ title: 'Paper deleted successfully' });
    } catch (error) {
      console.error('Error deleting draft:', error);
      toast({ title: 'Failed to delete paper', variant: 'destructive' });
    }
  };

  const handleEdit = (draftId: string) => {
    router.push(`/e-question-builder/create-question?draft_id=${draftId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-4">Please login to view your saved papers</h2>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          My Saved Papers
        </h1>
        <Button onClick={() => router.push('/e-question-builder/select-question')} className="bg-blue-600 hover:bg-blue-700 text-white">
          Create New Paper
        </Button>
      </div>

      {drafts.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Saved Papers Found</h3>
            <p className="text-gray-500 mb-6">You haven't saved any question papers yet.</p>
            <Button onClick={() => router.push('/e-question-builder/select-question')} variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
              Start Building Now
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drafts.map(draft => (
            <Card key={draft.id} className="hover:shadow-md transition-shadow group">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-gray-800 line-clamp-2" title={draft.title}>
                  {draft.title || 'Untitled Paper'}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <Calendar className="w-3 h-3" />
                  Last saved: {draft.updatedAt ? format(draft.updatedAt?.toDate ? draft.updatedAt.toDate() : (draft.updatedAt?.seconds ? new Date(draft.updatedAt.seconds * 1000) : new Date(draft.updatedAt)), 'MMM d, yyyy h:mm a') : 'Unknown'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-2">
                  <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-md font-medium">
                    {draft.questions?.length || 0} Questions
                  </span>
                </div>
              </CardContent>
              <CardFooter className="pt-2 flex justify-between gap-2 border-t border-gray-100 bg-gray-50/50">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => handleDelete(draft.id!)}
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => handleEdit(draft.id!)}
                >
                  <Edit className="w-4 h-4 mr-1" /> Edit Paper
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
