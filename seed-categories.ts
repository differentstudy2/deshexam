import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

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

const categories = [
  { id: "general", name: "General Queries", description: "Common questions about the platform", icon: "info" },
  { id: "mock_tests", name: "Mock Tests & Practice", description: "Everything about taking exams and mock tests", icon: "file-text" },
  { id: "payments", name: "Payments & Billing", description: "Subscriptions, refunds, and payment issues", icon: "credit-card" },
  { id: "account", name: "Account Management", description: "Login, profiles, and password resets", icon: "user" },
  { id: "technical", name: "Technical Support", description: "Bugs, errors, and system requirements", icon: "settings" },
  { id: "syllabus", name: "Syllabus & Course Info", description: "Details about exam syllabus and subjects", icon: "book" }
];

async function seed() {
  console.log("Seeding FAQ categories into Firebase...");
  for (const cat of categories) {
    await setDoc(doc(db, "faq_categories", cat.id), cat);
    console.log(`✅ Added category: ${cat.name}`);
  }
  console.log("🎉 All necessary categories seeded successfully!");
  process.exit(0);
}

seed().catch(console.error);
