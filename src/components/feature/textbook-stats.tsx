
'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, doc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Layers, FileText, CheckSquare, Award, FileQuestion, Book } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const TextbookStats = ({ textbookId }: { textbookId: string }) => {
    const [stats, setStats] = useState({ chapterCount: 0, topicCount: 0, practiceSetCount: 0, examCount: 0, mockTestCount: 0, quizCount: 0, questionCount: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (!textbookId) {
                setLoading(false);
                return;
            }

            try {
                const textbookRef = doc(db, 'textbooks', textbookId);
                const chaptersRef = collection(textbookRef, 'chapters');
                
                const [chaptersSnapshot, contentSnapshot] = await Promise.all([
                    getDocs(chaptersRef),
                    getDocs(query(collection(db, "content"), where("textbookId", "==", textbookId)))
                ]);

                let chapterCount = chaptersSnapshot.size;
                let topicCount = 0;
                let textbookQuestionCount = 0;

                for (const chapterDoc of chaptersSnapshot.docs) {
                    const topicsRef = collection(chapterDoc.ref, "topics");
                    const topicsSnapshot = await getDocs(topicsRef);
                    topicCount += topicsSnapshot.size;
                    
                    const chapterData = chapterDoc.data();
                    if(chapterData.textbookQuestions) {
                        textbookQuestionCount += chapterData.textbookQuestions.length;
                    }
                }

                let examCount = 0;
                let mockTestCount = 0;
                let quizCount = 0;
                let practiceSetCount = 0;
                
                contentSnapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.testType === 'Exam') examCount++;
                    if (data.testType === 'Mock Test') mockTestCount++;
                    if (data.testType === 'Quiz') quizCount++;
                    if (data.testType === 'Practice Set') practiceSetCount++;
                });

                setStats({ 
                    chapterCount, 
                    topicCount, 
                    practiceSetCount, 
                    examCount,
                    mockTestCount,
                    quizCount,
                    questionCount: textbookQuestionCount,
                });
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
            <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
                <div className="flex flex-col items-center gap-1">
                    <Skeleton className="h-4 w-12"/>
                </div>
                 <div className="flex flex-col items-center gap-1">
                    <Skeleton className="h-4 w-12"/>
                </div>
                 <div className="flex flex-col items-center gap-1">
                    <Skeleton className="h-4 w-12"/>
                </div>
            </div>
        )
    }

    return (
        <div className="mt-4 pt-2 text-center text-xs text-muted-foreground grid grid-cols-3 gap-2">
            <div className="flex items-center gap-1">
                <Layers className="h-4 w-4" />
                <span>{stats.chapterCount} Chap.</span>
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
                <FileQuestion className="h-4 w-4" />
                <span>{stats.mockTestCount} M.Tests</span>
            </div>
             <div className="flex items-center gap-1">
                <CheckSquare className="h-4 w-4" />
                <span>{stats.practiceSetCount} P.Sets</span>
            </div>
            <div className="flex items-center gap-1">
                <Book className="h-4 w-4" />
                <span>{stats.quizCount} Quizzes</span>
            </div>
        </div>
    );
};
