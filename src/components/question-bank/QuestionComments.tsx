'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getQuestionComments, addQuestionComment } from '@/lib/firebase/question-bank';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, MessageCircle, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function QuestionComments({ questionId }: { questionId: string }) {
    const { user } = useAuth();
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (questionId) fetchComments();
    }, [questionId]);

    const fetchComments = async () => {
        try {
            const data = await getQuestionComments(questionId);
            setComments(data);
        } catch (e) {
            console.error('Failed to load comments', e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!user || !newComment.trim()) return;
        setIsSubmitting(true);
        try {
            await addQuestionComment(
                questionId,
                user.uid,
                newComment,
                user.displayName || 'Anonymous',
                user.photoURL || ''
            );
            setNewComment('');
            fetchComments();
        } catch (e) {
            console.error('Failed to post comment', e);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm mt-8">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#107c41]" /> Discussion
            </h3>

            {user ? (
                <div className="flex gap-4 mb-8">
                    <Avatar className="w-10 h-10 border">
                        <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                        <AvatarFallback>{(user.displayName || 'U').charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                        <Textarea 
                            placeholder="Add to the discussion..." 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="resize-none min-h-[80px]"
                        />
                        <div className="flex justify-end">
                            <Button 
                                onClick={handleSubmit} 
                                disabled={isSubmitting || !newComment.trim()}
                                className="bg-[#107c41] hover:bg-[#0c6132] text-white"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                                Post Comment
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-center mb-8">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Please log in to participate in the discussion.</p>
                </div>
            )}

            <div className="space-y-6">
                {isLoading ? (
                    <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 text-slate-400 animate-spin" /></div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">No comments yet. Be the first to start the discussion!</div>
                ) : (
                    comments.map(c => (
                        <div key={c.id} className="flex gap-4">
                            <Avatar className="w-10 h-10 border">
                                <AvatarImage src={c.userAvatar} alt={c.userName} />
                                <AvatarFallback>{(c.userName || 'U').charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{c.userName}</span>
                                    {c.createdAt && (
                                        <span className="text-xs text-slate-400">
                                            {formatDistanceToNow(new Date(c.createdAt.seconds ? c.createdAt.seconds * 1000 : c.createdAt), { addSuffix: true })}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{c.comment}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
