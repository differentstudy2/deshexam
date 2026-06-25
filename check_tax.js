const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, limit, query } = require('firebase/firestore');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
env.split('\n').forEach(line => {
    const [key, ...val] = line.split('=');
    if (key && val) {
        process.env[key.trim()] = val.join('=').trim();
    }
});

if (process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST) {
    // If there is an emulator host, we should probably set it
    // But actually firebase SDK uses FIRESTORE_EMULATOR_HOST
    process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
}

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
    try {
        const q1 = query(collection(db, 'taxonomy_nodes'), limit(1));
        const snap1 = await getDocs(q1);
        console.log('taxonomy_nodes count:', snap1.size);

        const q2 = query(collection(db, 'guide_boards'), limit(1));
        const snap2 = await getDocs(q2);
        console.log('guide_boards count:', snap2.size);
    } catch(e) {
        console.error(e);
    }
}
check();
