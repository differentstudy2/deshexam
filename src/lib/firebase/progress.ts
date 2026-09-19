import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

export interface TextbookProgress {
    completedChapters: string[];
    lastUpdated: any;
}

/**
 * Fetches the progress for a specific textbook for a user.
 */
export const getTextbookProgress = async (userId: string, textbookId: string): Promise<TextbookProgress | null> => {
    if (!userId || !textbookId) return null;
    try {
        const progressRef = doc(db, `users/${userId}/textbookProgress/${textbookId}`);
        const snapshot = await getDoc(progressRef);
        
        if (snapshot.exists()) {
            return snapshot.data() as TextbookProgress;
        }
        return null;
    } catch (error) {
        console.error("Error fetching textbook progress:", error);
        return null;
    }
};

/**
 * Marks a chapter as complete for a specific user and textbook.
 */
export const markChapterComplete = async (userId: string, textbookId: string, chapterId: string) => {
    if (!userId || !textbookId || !chapterId) return;
    
    try {
        const progressRef = doc(db, `users/${userId}/textbookProgress/${textbookId}`);
        const snapshot = await getDoc(progressRef);

        if (snapshot.exists()) {
            await updateDoc(progressRef, {
                completedChapters: arrayUnion(chapterId),
                lastUpdated: serverTimestamp()
            });
        } else {
            // Create the document if it doesn't exist
            await setDoc(progressRef, {
                completedChapters: [chapterId],
                lastUpdated: serverTimestamp()
            });
        }
    } catch (error) {
        console.error("Error marking chapter as complete:", error);
        throw error;
    }
};

/**
 * Marks a chapter as incomplete for a specific user and textbook.
 */
export const markChapterIncomplete = async (userId: string, textbookId: string, chapterId: string) => {
    if (!userId || !textbookId || !chapterId) return;
    
    try {
        const progressRef = doc(db, `users/${userId}/textbookProgress/${textbookId}`);
        const snapshot = await getDoc(progressRef);

        if (snapshot.exists()) {
            await updateDoc(progressRef, {
                completedChapters: arrayRemove(chapterId),
                lastUpdated: serverTimestamp()
            });
        }
    } catch (error) {
        console.error("Error marking chapter as incomplete:", error);
        throw error;
    }
};
