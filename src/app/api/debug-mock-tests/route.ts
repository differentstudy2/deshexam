import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/client';
import { collection, getDocs } from 'firebase/firestore';

export async function GET() {
    try {
        const snap = await getDocs(collection(db, "mock_tests"));
        const data = snap.docs.map(d => ({
            id: d.id,
            title: d.data().title,
            topicId: d.data().topicId,
            chapterId: d.data().chapterId
        }));
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message });
    }
}
