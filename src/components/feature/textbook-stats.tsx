

'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Layers, FileText, CheckSquare, Award } from 'lucide-react';

export const TextbookStats = ({ textbookId }: { textbookId: string }) => {
    const [stats, setStats] = useState({ chapterCount: 0, topicCount: 0, practiceSetCount: 0, examCount: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            let chapterCount = 0;
            let topicCount = 0;
            let practiceSetCount = 0;
            let examCount = 0;
            
            if (!textbookId) {
                setLoading(false);
                return;
            }

            try {
                const textbookRef = doc(db, 'textbooks', textbookId);
                const chaptersRef = collection(textbookRef, 'chapters');
                const examsRef = collection(textbookRef, 'exams');
                
                const [chaptersSnapshot, examsSnapshot] = await Promise.all([
                    getDocs(chaptersRef),
                    getDocs(examsRef),
                ]);

                chapterCount = chaptersSnapshot.size;
                examCount = examsSnapshot.size;

                for (const chapterDoc of chaptersSnapshot.docs) {
                    const topicsRef = collection(chapterDoc.ref, "topics");
                    const topicsSnapshot = await getDocs(topicsRef);
                    topicCount += topicsSnapshot.size;

                     for (const topicDoc of topicsSnapshot.docs) {
                        const practiceSetsRef = collection(topicDoc.ref, "practiceSets");
                        const practiceSetsSnapshot = await getDocs(practiceSetsRef);
                        practiceSetCount += practiceSetsSnapshot.size;
                    }
                }
                setStats({ chapterCount, topicCount, practiceSetCount, examCount });
            } catch (error) {
                console.error("Failed to fetch textbook stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [textbookId]);

    if (loading) {
        return (
            <div className="mt-4 pt-4 border-t grid grid-cols-4 gap-2 text-center text-xs text-muted-foreground">
                <div className="flex flex-col items-center gap-1">
                    <Layers className="h-4 w-4" />
                    <span>... Chapters</span>
                </div>
                 <div className="flex flex-col items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>... Topics</span>
                </div>
                 <div className="flex flex-col items-center gap-1">
                    <Award className="h-4 w-4" />
                    <span>... Exams</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <CheckSquare className="h-4 w-4" />
                    <span>... Sets</span>
                </div>
            </div>
        )
    }

    return (
        <div className="mt-4 pt-2 text-center text-xs text-muted-foreground grid grid-cols-4 gap-1">
            <div className="flex items-center gap-1">
                <Layers className="h-4 w-4" />
                <span>{stats.chapterCount} Chapters</span>
            </div>
            <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>{stats.topicCount} Topics</span>
            </div>
             <div className="flex items-center gap-1">
                <Award className="h-4 w-4" />
                <span>{stats.examCount} Exams</span>
            </div>
            <div className="flex items-center gap-1">
                <CheckSquare className="h-4 w-4" />
                <span>{stats.practiceSetCount} Sets</span>
            </div>
        </div>
    );
};

