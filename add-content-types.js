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

const contentTypes = [
  { name: "Blog" },
  { name: "Job" },
  { name: "News" },
];

async function seed() {
  console.log("Seeding contentTypes...");
  for (const type of contentTypes) {
    const docId = type.name.toLowerCase().replace(/\s+/g, '-');
    await db.collection("contentTypes").doc(docId).set(type, { merge: true });
    console.log(`Added: ${type.name}`);
  }
  console.log("Done seeding contentTypes!");
}

seed().catch(console.error);
