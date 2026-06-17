import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { sidebarSubjects, curriculumData, readingContentData } from '@/app/guide/guide-data';

// Initialize Firebase Admin SDK with a unique name to avoid conflicts
const adminAppName = 'firebase-admin-app-deshexam';
let adminApp: App;

if (!getApps().some(app => app.name === adminAppName)) {
    const serviceAccountStr = process.env.GCP_SA_KEY || '{}';
    let serviceAccount;
    try {
        serviceAccount = JSON.parse(serviceAccountStr);
        if (serviceAccount.private_key) {
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }
    } catch (e) {
        console.warn("Could not parse GCP_SA_KEY", e);
        serviceAccount = {}; // Fallback, will fail if actually connecting to prod without keys
    }
    
    // In many local dev scenarios with Firebase, the default credentials are used
    if (Object.keys(serviceAccount).length > 0) {
        adminApp = initializeApp({
            credential: cert(serviceAccount),
        }, adminAppName);
    } else {
        adminApp = initializeApp({}, adminAppName);
    }
} else {
  adminApp = getApps().find(app => app.name === adminAppName)!;
}

const db = getFirestore(adminApp);

export async function GET() {
  try {
    let successCount = 0;

    // 1. Seed Subjects
    for (const [index, subject] of sidebarSubjects.entries()) {
      await db.collection('guide_subjects').doc(subject.id).set({
        title: subject.title,
        countStr: subject.countStr,
        orderIndex: index
      });
      successCount++;
    }

    // 2. Seed Curriculum (Chapters & Topics)
    for (const [cIdx, chapter] of curriculumData.entries()) {
      await db.collection('guide_chapters').doc(chapter.id).set({
        subjectId: 'sahitya-kanika',
        title: chapter.title,
        orderIndex: cIdx
      });
      successCount++;

      for (const [tIdx, topic] of chapter.topics.entries()) {
        await db.collection('guide_topics').doc(topic.id).set({
          chapterId: chapter.id,
          subjectId: 'sahitya-kanika',
          title: topic.title,
          subtopics: topic.subtopics || [],
          orderIndex: tIdx
        });
        successCount++;
      }
    }

    // 3. Seed Reading Content
    for (const [contentId, content] of Object.entries(readingContentData)) {
      await db.collection('guide_reading_content').doc(contentId).set(content);
      successCount++;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully seeded ${successCount} documents to Firestore!` 
    });
  } catch (error: any) {
    console.error("Seeding error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
