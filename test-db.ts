import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAzSss2t5UoydcGRh4CJ41VvE4x-t0Ikrc",
  authDomain: "studio-8356746366-699c1.firebaseapp.com",
  projectId: "studio-8356746366-699c1",
  storageBucket: "studio-8356746366-699c1.firebasestorage.app",
  messagingSenderId: "643911224795",
  appId: "1:643911224795:web:ea10a865635776d4932bfe"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const snap = await getDocs(collection(db, 'guide_boards'));
  console.log('guide_boards items:');
  snap.docs.forEach(doc => {
    const data = doc.data();
    console.log(`id: ${doc.id}, title: ${data.title}, name: ${data.name}, label: ${data.label}`);
  });
}

run().catch(console.error);
