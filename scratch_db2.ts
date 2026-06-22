import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, limit, query, where } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

if (!getApps().length) {
  initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const db = getFirestore();

async function run() {
  const snap = await getDocs(query(collection(db, 'taxonomy_nodes'), where('type', '==', 'chapter')));
  const chapters = snap.docs.map(d => ({ title: d.data().title, orderIndex: d.data().orderIndex, parentId: d.data().parentId }));
  
  // Find chapters for English Reader
  const erChapters = chapters.filter(c => c.title.includes('LESSON') || c.title.includes('VERB') || c.title.includes('ADVERB') || c.title.includes('SENTENCE'));
  console.log(erChapters);
}
run();
