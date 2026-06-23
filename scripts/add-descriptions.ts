import * as fs from 'fs';
import * as admin from 'firebase-admin';

const descriptions: Record<string, string> = {
  "Add Dark Mode Toggle": "কেন জরুরি: রাতে পড়ার সময় ডার্ক মোড স্টুডেন্টদের চোখের আরাম দেয়, ফলে তারা অ্যাপে বেশি সময় ব্যয় করে।",
  "Detailed Analytics for Students": "কেন জরুরি: স্টুডেন্টরা তাদের দুর্বল দিকগুলো জানতে পারলে প্রস্তুতি ভালো হয়, যা তাদের অ্যাপের প্রতি নির্ভরশীল করে তুলবে।",
  "Certificate Generation": "কেন জরুরি: কোর্স বা মক টেস্ট শেষে একটি সার্টিফিকেট পেলে স্টুডেন্টদের আত্মবিশ্বাস বাড়ে এবং তারা সেটা সোশ্যাল মিডিয়ায় শেয়ার করে (ফ্রি মার্কেটিং)।",
  "Discussion Forum": "কেন জরুরি: একটিভ কমিউনিটি থাকলে স্টুডেন্টরা একে অপরের সমস্যা সমাধান করতে পারে, যা অ্যাপের রিটেনশন (Retention) বাড়ায়।",
  "Push Notifications": "কেন জরুরি: নিয়মিত নোটিফিকেশন পাঠিয়ে স্টুডেন্টদের মনে করিয়ে দিলে তারা প্রতিদিন অ্যাপে ফিরে আসবে (Daily Active Users)।",
  "Mobile App": "কেন জরুরি: বেশিরভাগ স্টুডেন্ট মোবাইল থেকে পড়াশোনা করে। একটি ডেডিকেটেড অ্যাপ থাকলে ইউজার এক্সপেরিয়েন্স অনেক উন্নত হবে।",
  "Exam Timer & Auto-Submit": "কেন জরুরি: আসল পরীক্ষার মত পরিবেশ তৈরি করতে স্ট্রিক্ট টাইমার থাকা বাধ্যতামূলক, যা প্ল্যাটফর্মের মান বৃদ্ধি করে।"
};

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
  console.log('Fetching admin_todos...');
  const snapshot = await db.collection('admin_todos').get();
  
  let updateCount = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const text = data.text?.trim() || "";
    
    // Find matching description
    for (const [key, desc] of Object.entries(descriptions)) {
      if (text.startsWith(key)) {
        console.log('Updating:', key);
        await doc.ref.update({ description: desc });
        updateCount++;
        break;
      }
    }
  }

  console.log(`Successfully updated ${updateCount} tasks with explanations.`);
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
