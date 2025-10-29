
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import type { Metadata } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Topic } from '@/lib/types';
import TopicClientPage from './topic-client-page';

// Although this is now mainly a client-side route,
// keeping a lightweight metadata function can still be beneficial.
export async function generateMetadata({ params }: { params: { bookId: string; chapterId: string; topicId: string } }) {
    try {
        const topicRef = doc(db, `textbooks/${params.bookId}/chapters/${params.chapterId}/topics`, params.topicId);
        const topicSnap = await getDoc(topicRef);
        if (topicSnap.exists()) {
            const topic = topicSnap.data() as Topic;
            return {
                title: topic.title,
                description: topic.content?.substring(0, 160) || `Learn about ${topic.title}.`,
            };
        }
    } catch (e) {
        // Fallback metadata
        return {
            title: "Topic",
            description: "Learn more about this topic.",
        };
    }
     return {
        title: "Topic",
        description: "Learn more about this topic.",
    };
}


export default function TopicPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin"/></div>}>
            <TopicClientPage />
        </Suspense>
    );
}
