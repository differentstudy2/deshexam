import * as fs from 'fs';
import * as admin from 'firebase-admin';

const newestIdeas = [
  {
    text: "Implement Flashcards & Spaced Repetition",
    priority: "high",
    completed: false,
    description: "কেন জরুরি: এটি স্টুডেন্টদের কঠিন সূত্র এবং শব্দ দ্রুত মুখস্থ করতে সাহায্য করবে, যা অ্যাপটিকে প্রতিদিন ব্যবহারের উপযোগী করবে।"
  },
  {
    text: "Build AI Performance Predictor",
    priority: "low",
    completed: false,
    description: "কেন জরুরি: এআই অ্যানালাইসিস দিয়ে স্টুডেন্টদের পাস করার সম্ভাবনা দেখালে তারা তাদের পড়াশোনার প্রতি আরও সিরিয়াস হবে।"
  },
  {
    text: "Create Virtual Group Study Rooms",
    priority: "medium",
    completed: false,
    description: "কেন জরুরি: একসাথে বসে পড়ার সুযোগ থাকলে স্টুডেন্টরা অ্যাপে অনেক বেশি সময় কাটাবে এবং বোরিং ফিল করবে না।"
  },
  {
    text: "Add Study Materials & PDF Notes section",
    priority: "high",
    completed: false,
    description: "কেন জরুরি: পরীক্ষার পাশাপাশি স্টাডি ম্যাটেরিয়াল থাকলে স্টুডেন্টদের অন্য কোথাও যাওয়ার প্রয়োজন হবে না।"
  },
  {
    text: "Integrate Job Board & Career Guidance",
    priority: "medium",
    completed: false,
    description: "কেন জরুরি: নতুন চাকরির খবরগুলো অ্যাপেই দেখতে পেলে এটি তাদের জন্য একটি কমপ্লিট সলিউশন হয়ে উঠবে।"
  },
  {
    text: "Develop Coupon & Discount System",
    priority: "high",
    completed: false,
    description: "কেন জরুরি: স্পেশাল ডিসকাউন্ট কোড দিলে প্রিমিয়াম সাবস্ক্রিপশন বিক্রির হার বহুগুণ বেড়ে যায়।"
  },
  {
    text: "Implement Daily Mini-Challenges",
    priority: "medium",
    completed: false,
    description: "কেন জরুরি: প্রতিদিন ছোট একটি কুইজ দিলে স্টুডেন্টরা প্রতিদিন অ্যাপটি ওপেন করার একটি কারণ খুঁজে পাবে।"
  }
];

async function run() {
  const envFile = fs.readFileSync('.env.local', 'utf-8');
  let gcpKeyStr = '';
  for (const line of envFile.split('\n')) {
    if (line.startsWith('GCP_SA_KEY=')) {
      gcpKeyStr = line.substring('GCP_SA_KEY='.length).trim();
      break;
    }
  }

  if (gcpKeyStr.startsWith("'") && gcpKeyStr.endsWith("'")) {
    gcpKeyStr = gcpKeyStr.substring(1, gcpKeyStr.length - 1);
  }

  const parsed = JSON.parse(gcpKeyStr);
  if (parsed.private_key) {
    parsed.private_key = parsed.private_key.replace(/\\n/g, '\n').replace(/\\\\n/g, '\n');
  }

  admin.initializeApp({
    credential: admin.credential.cert(parsed)
  });

  const db = admin.firestore();
  console.log('Adding newest ideas to admin_todos...');
  
  const batch = db.batch();
  for (const idea of newestIdeas) {
    const docRef = db.collection('admin_todos').doc();
    batch.set(docRef, {
      ...idea,
      tags: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  await batch.commit();

  console.log(`Successfully added ${newestIdeas.length} newest tasks with explanations.`);
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
