import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/client';
import { doc, increment, setDoc } from 'firebase/firestore';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const documentId = resolvedParams.id;
    
    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    const docRef = doc(db, 'guide_documents', documentId);
    
    // We use setDoc with merge to either update existing or create if somehow missing
    await setDoc(docRef, {
      bookmarks: increment(1)
    }, { merge: true });

    return NextResponse.json({ success: true, message: 'Bookmark incremented' });
  } catch (error) {
    console.error('Error updating bookmark:', error);
    return NextResponse.json({ error: 'Failed to update bookmark' }, { status: 500 });
  }
}
