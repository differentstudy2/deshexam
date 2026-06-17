import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import * as admin from 'firebase-admin';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const documentId = resolvedParams.id;
    
    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    const docRef = adminDb.collection('guide_documents').doc(documentId);
    
    // We use set with merge to either update existing or create if somehow missing
    await docRef.set({
      views: admin.firestore.FieldValue.increment(1)
    }, { merge: true });

    return NextResponse.json({ success: true, message: 'Analytics updated' });
  } catch (error) {
    console.error('Error updating analytics:', error);
    return NextResponse.json({ error: 'Failed to update analytics' }, { status: 500 });
  }
}
