import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, limit, query } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env from the project root
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

async function checkDb() {
  console.log("Checking taxonomy_nodes...");
  try {
    const q = query(collection(db, "taxonomy_nodes"), limit(10));
    const snap = await getDocs(q);
    
    let count = 0;
    snap.forEach(doc => {
      const data = doc.data();
      console.log(`ID: ${doc.id} | type: ${data.type} | title: ${data.title} | fullSlug: ${data.fullSlug || 'MISSING'}`);
      count++;
    });
    
    if (count === 0) {
      console.log("No taxonomy nodes found!");
    }
  } catch (err) {
    console.error("Error connecting to DB:", err);
  }
}

checkDb();
