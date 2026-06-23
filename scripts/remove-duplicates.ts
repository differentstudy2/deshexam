import * as fs from 'fs';
import * as admin from 'firebase-admin';

async function run() {
  console.log('Reading .env.local...');
  const envFile = fs.readFileSync('.env.local', 'utf-8');
  let gcpKeyStr = '';
  for (const line of envFile.split('\n')) {
    if (line.startsWith('GCP_SA_KEY=')) {
      gcpKeyStr = line.substring('GCP_SA_KEY='.length).trim();
      break;
    }
  }

  // Remove surrounding single quotes if present
  if (gcpKeyStr.startsWith("'") && gcpKeyStr.endsWith("'")) {
    gcpKeyStr = gcpKeyStr.substring(1, gcpKeyStr.length - 1);
  }

  const parsed = JSON.parse(gcpKeyStr);
  if (parsed.private_key) {
    parsed.private_key = parsed.private_key.replace(/\\n/g, '\n').replace(/\\\\n/g, '\n');
  }

  console.log('Initializing Firebase Admin...');
  admin.initializeApp({
    credential: admin.credential.cert(parsed)
  });

  const db = admin.firestore();
  console.log('Fetching admin_todos...');
  const snapshot = await db.collection('admin_todos').orderBy('createdAt', 'asc').get();
  
  const textMap = new Map();
  let duplicateCount = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const text = data.text?.trim();
    
    if (!text) continue;
    
    if (textMap.has(text)) {
      console.log('Deleting duplicate:', text.substring(0, 50) + '...');
      await doc.ref.delete();
      duplicateCount++;
    } else {
      textMap.set(text, true);
    }
  }

  console.log(`Successfully deleted ${duplicateCount} duplicate tasks.`);
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
