import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/client';
import { doc, getDoc } from 'firebase/firestore';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    const redirectDoc = await getDoc(doc(db, 'url_redirects', id));
    
    if (redirectDoc.exists()) {
      return NextResponse.json({ redirectUrl: redirectDoc.data().newUrl });
    } else {
      return NextResponse.json({ redirectUrl: null }, { status: 404 });
    }
  } catch (error) {
    console.error('Failed to fetch redirect:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
