import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/client'; // Assuming client or admin here. Client might be fine if increment is allowed by rules, else we use admin.
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
      views: increment(1)
    }, { merge: true });

    return NextResponse.json({ success: true, message: 'Analytics updated' });
  } catch (error) {
    console.error('Error updating analytics:', error);
    return NextResponse.json({ error: 'Failed to update analytics' }, { status: 500 });
  }
}
