import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { getAdminDb } from '../src/lib/firebase/admin';
import * as admin from 'firebase-admin';

const featureIdeas = [
  { text: 'Add Global Search (Command Palette) using Ctrl+K for quick admin navigation', completed: false, priority: 'high', tags: ['UI', 'Admin'] },
  { text: 'Implement Multi-language Support (i18n) for Bengali and English users', completed: false, priority: 'medium', tags: ['Feature', 'Growth'] },
  { text: 'Add Offline Mode / PWA support so students can view saved notes without internet', completed: false, priority: 'medium', tags: ['PWA', 'Student'] },
  { text: 'Develop an AI-powered Mock Interview bot for job preparation', completed: false, priority: 'low', tags: ['AI', 'Premium'] },
  { text: 'Create a Referral System to reward students for inviting friends', completed: false, priority: 'high', tags: ['Marketing', 'Growth'] },
  { text: 'Add Live Chat Support or a helpdesk ticketing system for student queries', completed: false, priority: 'medium', tags: ['Support'] },
];

async function seed() {
  console.log('Adding new feature ideas...');
  const db = getAdminDb();
  if (!db) {
    console.error("Failed to initialize Admin DB.");
    process.exit(1);
  }

  for (const idea of featureIdeas) {
    try {
      await db.collection('admin_todos').add({
        ...idea,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`Added: ${idea.text}`);
    } catch (e) {
      console.error('Error adding:', e);
    }
  }
  console.log('Done!');
  process.exit(0);
}

seed();
