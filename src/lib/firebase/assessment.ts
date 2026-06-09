import { db } from './client';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp, writeBatch } from 'firebase/firestore';
import { PracticeSet, Quiz, MockTest, ExamSeries, ExamPaper, DailyChallenge } from '@/lib/assessment-types';

export const ASSESSMENT_COLLECTIONS = {
  practiceSets: 'practice_sets',
  quizzes: 'quizzes',
  mockTests: 'mock_tests',
  examSeries: 'exam_series',
  examPapers: 'exam_papers',
  dailyChallenges: 'daily_challenges'
} as const;

export type AssessmentCollectionType = keyof typeof ASSESSMENT_COLLECTIONS;

// Generic Fetch All
export async function getAssessments(collectionName: AssessmentCollectionType) {
  const colRef = collection(db, ASSESSMENT_COLLECTIONS[collectionName]);
  const q = query(colRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Generic Fetch Single
export async function getAssessment(collectionName: AssessmentCollectionType, id: string) {
  const docRef = doc(db, ASSESSMENT_COLLECTIONS[collectionName], id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// Fetch by Slug
export async function getAssessmentBySlug(collectionName: AssessmentCollectionType, slug: string) {
  const colRef = collection(db, ASSESSMENT_COLLECTIONS[collectionName]);
  const q = query(colRef, where('slug', '==', slug));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

// Generic Create/Update
export async function saveAssessment(collectionName: AssessmentCollectionType, id: string, data: any) {
  const docRef = doc(db, ASSESSMENT_COLLECTIONS[collectionName], id);
  const isUpdate = (await getDoc(docRef)).exists();
  
  const payload = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  if (!isUpdate) {
    payload.createdAt = new Date().toISOString();
  }

  await setDoc(docRef, payload, { merge: true });
}

// Generic Delete
export async function deleteAssessment(collectionName: AssessmentCollectionType, id: string) {
  await deleteDoc(doc(db, ASSESSMENT_COLLECTIONS[collectionName], id));
}

// Generic Bulk Update
export async function bulkUpdateAssessments(collectionName: AssessmentCollectionType, ids: string[], data: any) {
    const batch = writeBatch(db);
    ids.forEach(id => {
        const ref = doc(db, ASSESSMENT_COLLECTIONS[collectionName], id);
        batch.update(ref, {
            ...data,
            updatedAt: new Date().toISOString()
        });
    });
    await batch.commit();
}

// Generic Bulk Delete
export async function bulkDeleteAssessments(collectionName: AssessmentCollectionType, ids: string[]) {
    const batch = writeBatch(db);
    ids.forEach(id => {
        const ref = doc(db, ASSESSMENT_COLLECTIONS[collectionName], id);
        batch.delete(ref);
    });
    await batch.commit();
}
