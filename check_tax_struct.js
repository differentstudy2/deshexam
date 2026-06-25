const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, limit, query, where } = require('firebase/firestore');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
env.split('\n').forEach(line => {
    const [key, ...val] = line.split('=');
    if (key && val) {
        process.env[key.trim()] = val.join('=').trim();
    }
});

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
    const q1 = query(collection(db, 'taxonomy_nodes'), where('type', '==', 'board'), limit(1));
    const snap1 = await getDocs(q1);
    snap1.forEach(d => console.log('Board:', d.id, d.data()));

    const q2 = query(collection(db, 'taxonomy_nodes'), where('type', '==', 'class'), limit(1));
    const snap2 = await getDocs(q2);
    snap2.forEach(d => console.log('Class:', d.id, d.data()));
}
check().catch(console.error);
