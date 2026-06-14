const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, orderBy, limit, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const q = query(collection(db, 'question_bank'), orderBy('createdAt', 'desc'), limit(5));
  const snap = await getDocs(q);
  snap.docs.forEach(doc => {
    const data = doc.data();
    console.log(`ID: ${doc.id}, topicId: ${data.topicId}, chapterId: ${data.chapterId}, subjectId: ${data.subjectId}, contentType: ${data.contentType}, boardId: ${data.boardId}`);
  });
}

run().catch(console.error);
