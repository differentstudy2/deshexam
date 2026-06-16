import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "dummy",
  projectId: "desh-exam",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

async function run() {
    const snap = await getDocs(collection(db, "mock_tests"));
    snap.forEach(doc => {
        const d = doc.data();
        console.log("MockTest", doc.id, d.title, "topicId:", d.topicId);
    });
}
run();
