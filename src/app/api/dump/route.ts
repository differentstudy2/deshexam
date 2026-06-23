import { NextResponse } from 'next/server';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

export async function GET() {
  const q = query(collection(db, 'taxonomy_nodes'), where('type', 'in', ['chapter', 'textbook']));
  const snap = await getDocs(q);
  const data = snap.docs.map(d => ({
    id: d.id,
    type: d.data().type,
    title: d.data().title,
    slug: d.data().slug,
    fullSlug: d.data().fullSlug
  }));
  return NextResponse.json(data);
}
