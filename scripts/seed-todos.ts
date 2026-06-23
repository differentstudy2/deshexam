import { getAdminDb } from '../src/lib/firebase/admin';
import * as admin from 'firebase-admin';

const initialTodos = [
  {
    text: 'Integrate Firebase Identity Platform (Blaze Plan) to make Two-Factor Authentication (2FA) live via SMS/App.',
    completed: false,
    priority: 'high',
  },
  {
    text: 'Set up Firebase Cloud Functions and an email provider (like Resend) to make Login Alerts live.',
    completed: false,
    priority: 'high',
  },
  {
    text: 'Design Premium Dashboard Home: Add Current XP, level progress, recent study history, and interactive charts.',
    completed: false,
    priority: 'medium',
  },
  {
    text: 'Build Admin Panel Analytics: Create beautiful charts and statistics (daily signups, exam taken count, revenue).',
    completed: false,
    priority: 'medium',
  },
  {
    text: 'Enhance Leaderboard & Gamification: Make the achievements page more attractive to encourage student engagement.',
    completed: false,
    priority: 'low',
  },
  {
    text: 'Redesign Landing Page: Give the homepage a modern, premium look with 3D elements and smooth animations.',
    completed: false,
    priority: 'low',
  }
];

async function seed() {
  console.log('Seeding initial todos using Admin SDK...');
  const db = getAdminDb();
  
  if (!db) {
    console.error("Failed to initialize Admin DB.");
    process.exit(1);
  }

  for (const todo of initialTodos) {
    try {
      await db.collection('admin_todos').add({
        ...todo,
        tags: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`Added: ${todo.text}`);
    } catch (e) {
      console.error('Error adding:', e);
    }
  }
  console.log('Done!');
  process.exit(0);
}

seed();
