const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

let credential;
if (process.env.GCP_SA_KEY) {
  const parsed = JSON.parse(process.env.GCP_SA_KEY);
  if (parsed.private_key) {
    parsed.private_key = parsed.private_key.replace(/\\n/g, '\n').replace(/\\\\n/g, '\n');
  }
  credential = admin.credential.cert(parsed);
} else {
  credential = admin.credential.applicationDefault();
}

admin.initializeApp({ credential });
const db = admin.firestore();

const categories = [
  { id: "general", name: "General Queries", description: "Common questions about the platform", icon: "info", order: 1 },
  { id: "mock_tests", name: "Mock Tests & Practice", description: "Everything about taking exams and mock tests", icon: "file-text", order: 2 },
  { id: "payments", name: "Payments & Billing", description: "Subscriptions, refunds, and payment issues", icon: "credit-card", order: 3 },
  { id: "account", name: "Account Management", description: "Login, profiles, and password resets", icon: "user", order: 4 },
  { id: "technical", name: "Technical Support", description: "Bugs, errors, and system requirements", icon: "settings", order: 5 },
  { id: "syllabus", name: "Syllabus & Course Info", description: "Details about exam syllabus and subjects", icon: "book", order: 6 }
];

async function seed() {
  console.log("Seeding categories...");
  for (const cat of categories) {
    await db.collection("faq_categories").doc(cat.id).set(cat);
    console.log(`Added: ${cat.name}`);
  }
  console.log("Done seeding categories!");
}

seed().catch(console.error);
