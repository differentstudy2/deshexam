import * as fs from 'fs';
import * as admin from 'firebase-admin';

const newIdeas = [
  {
    text: "Build Live Quiz & Multiplayer Battles",
    priority: "high",
    completed: false,
    description: "কেন জরুরি: বন্ধুদের সাথে রিয়েল টাইমে কুইজ ব্যাটেল স্টুডেন্টদের মাঝে উত্তেজনা তৈরি করে এবং অ্যাপে তাদের বারবার ফিরিয়ে আনে।"
  },
  {
    text: "Create AI Question Generator for Admins",
    priority: "medium",
    completed: false,
    description: "কেন জরুরি: এআই দিয়ে পিডিএফ বা টেক্সট থেকে অটোমেটিক MCQ বানালে অ্যাডমিনদের হাজার হাজার প্রশ্ন বানানোর সময় বেঁচে যায়।"
  },
  {
    text: "Implement Study Streak & Daily Rewards",
    priority: "medium",
    completed: false,
    description: "কেন জরুরি: টানা পড়ার জন্য ব্যাজ বা পয়েন্ট দিলে স্টুডেন্টরা প্রতিদিন অ্যাপে ঢুকতে মোটিভেটেড হয়।"
  },
  {
    text: "Add Doubt Solving Q&A Board",
    priority: "low",
    completed: false,
    description: "কেন জরুরি: স্টুডেন্টরা ছবির মাধ্যমে প্রশ্ন আপলোড করে উত্তর পেলে তারা অ্যাপটির উপর বেশি ভরসা করবে।"
  },
  {
    text: "Setup Subscription/Premium Plans (SaaS)",
    priority: "high",
    completed: false,
    description: "কেন জরুরি: ফ্রি সার্ভিসের পাশাপাশি প্রিমিয়াম প্ল্যান বিক্রি করা অ্যাপ থেকে রেভিনিউ আয় করার সবচেয়ে ভালো উপায়।"
  },
  {
    text: "Develop a Parent Portal Dashboard",
    priority: "low",
    completed: false,
    description: "কেন জরুরি: বাবা-মা তাদের সন্তানের পরীক্ষার ফলাফল দেখতে পারলে তারাও অ্যাপটিকে প্রমোট করবে।"
  },
  {
    text: "Add Support for Audio & Video Lectures",
    priority: "medium",
    completed: false,
    description: "কেন জরুরি: অ্যাপের ভেতরে প্রিমিয়াম ভিডিও ক্লাস দেখার সুবিধা থাকলে এটি একটি পূর্ণাঙ্গ এডুকেশন প্ল্যাটফর্ম হয়ে উঠবে।"
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
  console.log('Adding new ideas to admin_todos...');
  
  const batch = db.batch();
  for (const idea of newIdeas) {
    const docRef = db.collection('admin_todos').doc();
    batch.set(docRef, {
      ...idea,
      tags: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  await batch.commit();

  console.log(`Successfully added ${newIdeas.length} new tasks with explanations.`);
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
