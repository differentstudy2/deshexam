import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getTextbookProgress, markChapterComplete, markChapterIncomplete } from '@/lib/firebase/progress';

export const useProgress = (textbookId: string, totalChapters: number) => {
    const { user } = useAuth();
    const [completedChapters, setCompletedChapters] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [progressPercentage, setProgressPercentage] = useState(0);

    const loadProgress = useCallback(async () => {
        if (!user || !textbookId) {
            setLoading(false);
            return;
        }

        try {
            const progress = await getTextbookProgress(user.uid, textbookId);
            if (progress) {
                setCompletedChapters(progress.completedChapters || []);
            }
        } catch (error) {
            console.error("Failed to load progress", error);
        } finally {
            setLoading(false);
        }
    }, [user, textbookId]);

    useEffect(() => {
        loadProgress();
    }, [loadProgress]);

    useEffect(() => {
        if (totalChapters > 0) {
            const percentage = Math.round((completedChapters.length / totalChapters) * 100);
            setProgressPercentage(Math.min(percentage, 100)); // cap at 100%
        } else {
            setProgressPercentage(0);
        }
    }, [completedChapters, totalChapters]);

    const toggleChapterComplete = async (chapterId: string) => {
        if (!user || !textbookId) return;

        const isComplete = completedChapters.includes(chapterId);
        
        // Optimistic UI update
        if (isComplete) {
            setCompletedChapters(prev => prev.filter(id => id !== chapterId));
        } else {
            setCompletedChapters(prev => [...prev, chapterId]);
        }

        try {
            if (isComplete) {
                await markChapterIncomplete(user.uid, textbookId, chapterId);
            } else {
                await markChapterComplete(user.uid, textbookId, chapterId);
            }
        } catch (error) {
            console.error("Failed to toggle chapter progress:", error);
            // Revert on failure
            await loadProgress();
        }
    };

    return {
        completedChapters,
        progressPercentage,
        loading,
        toggleChapterComplete,
        isChapterComplete: (chapterId: string) => completedChapters.includes(chapterId)
    };
};
