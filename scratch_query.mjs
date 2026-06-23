import { db } from './src/lib/firebase/client.js';
import { collection, getDocs, query, where } from 'firebase/firestore';

async function run() {
  const q = query(collection(db, 'taxonomy_nodes'), where('type', '==', 'chapter'));
  const snap = await getDocs(q);
  snap.docs.forEach(d => console.log(d.data().title, d.data().slug, d.data().fullSlug));
  process.exit(0);
}
run();
