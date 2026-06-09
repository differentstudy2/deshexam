import { db } from './client';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp, limit, increment, writeBatch, addDoc } from 'firebase/firestore';
import { TaxonomyNode, QuestionBankEntry } from '@/lib/question-bank-types';

export const TAXONOMY_COLLECTIONS = {
  board: 'question_boards',
  class: 'question_classes',
  subject: 'question_subjects',
  textbook: 'question_textbooks',
  chapter: 'question_chapters',
  topic: 'question_topics',
} as const;

export type TaxonomyType = keyof typeof TAXONOMY_COLLECTIONS;

// Generic Taxonomy CRUD
export async function getTaxonomyNodes(type: TaxonomyType, parentField?: string, parentId?: string) {
  const colRef = collection(db, TAXONOMY_COLLECTIONS[type]);
  let q;
  if (parentId && parentField) {
    q = query(colRef, where(parentField, '==', parentId)); // Note: compound indexes might be needed if combined with orderBy
  } else {
    q = query(colRef);
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getTaxonomyNode(type: TaxonomyType, id: string) {
  const docRef = doc(db, TAXONOMY_COLLECTIONS[type], id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function createTaxonomyNode(type: TaxonomyType, data: Partial<TaxonomyNode> & { id: string }) {
  const docRef = doc(db, TAXONOMY_COLLECTIONS[type], data.id);
  await setDoc(docRef, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return data.id;
}

export async function updateTaxonomyNode(type: TaxonomyType, id: string, data: Partial<TaxonomyNode>) {
  const docRef = doc(db, TAXONOMY_COLLECTIONS[type], id);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteTaxonomyNode(type: TaxonomyType, id: string) {
  const docRef = doc(db, TAXONOMY_COLLECTIONS[type], id);
  await deleteDoc(docRef);
}

// ----------------------------------------------------
// Questions CRUD
// ----------------------------------------------------
export const QUESTIONS_COLLECTION = 'question_bank';

export async function getQuestions(filters?: Record<string, any>, limitCount = 50) {
  const colRef = collection(db, QUESTIONS_COLLECTION);
  let q = query(colRef, orderBy('createdAt', 'desc'), limit(limitCount));
  
  if (filters) {
    const conditions = [];
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        conditions.push(where(key, '==', value));
      }
    }
    if (conditions.length > 0) {
      q = query(colRef, ...conditions, orderBy('createdAt', 'desc'), limit(limitCount));
    }
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as QuestionBankEntry);
}

export async function getQuestion(id: string) {
  const docRef = doc(db, QUESTIONS_COLLECTION, id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as QuestionBankEntry;
}

export async function createQuestion(data: Omit<QuestionBankEntry, 'createdAt' | 'updatedAt'>) {
  const docRef = doc(db, QUESTIONS_COLLECTION, data.id);
  await setDoc(docRef, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return data.id;
}

export async function updateQuestion(id: string, data: Partial<QuestionBankEntry>) {
  const docRef = doc(db, QUESTIONS_COLLECTION, id);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteQuestion(id: string) {
  const docRef = doc(db, QUESTIONS_COLLECTION, id);
  await deleteDoc(docRef);
}

export async function getQuestionBySlug(slug: string) {
  const colRef = collection(db, QUESTIONS_COLLECTION);
  const q = query(colRef, where('slug', '==', slug), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as QuestionBankEntry;
}

export async function getQuestionsByTaxonomySlug(slug: string, limitCount = 50) {
  // Simple heuristic: we assume the slug might match a boardId, classId, subjectId, etc for now
  // In a robust implementation, you'd resolve the slug to an actual taxonomy ID first.
  const colRef = collection(db, QUESTIONS_COLLECTION);
  const conditions = [
      query(colRef, where('boardId', '==', slug), limit(limitCount)),
      query(colRef, where('classId', '==', slug), limit(limitCount)),
      query(colRef, where('subjectId', '==', slug), limit(limitCount))
  ];
  
  for (const q of conditions) {
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
          return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as QuestionBankEntry);
      }
  }
  return [];
}

export async function getPopularQuestions(limitCount = 5) {
  const colRef = collection(db, QUESTIONS_COLLECTION);
  const q = query(colRef, orderBy('viewsCount', 'desc'), limit(limitCount));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as QuestionBankEntry);
}

// ----------------------------------------------------
// Interactions (Likes, Dislikes, Views, Bookmarks)
// ----------------------------------------------------

export async function incrementQuestionView(id: string) {
  const docRef = doc(db, QUESTIONS_COLLECTION, id);
  await updateDoc(docRef, { viewsCount: increment(1) });
}

export async function toggleInteraction(questionId: string, userId: string, type: 'like' | 'dislike' | 'bookmark') {
  const interactionId = `${userId}_${questionId}`;
  const docRef = doc(db, 'question_interactions', interactionId);
  const snap = await getDoc(docRef);
  const qRef = doc(db, QUESTIONS_COLLECTION, questionId);

  const currentData = snap.exists() ? snap.data() : { isLiked: false, isDisliked: false, isBookmarked: false };
  let updateData: any = {};
  let qUpdate: any = {};

  if (type === 'like') {
    updateData.isLiked = !currentData.isLiked;
    if (updateData.isLiked && currentData.isDisliked) {
      updateData.isDisliked = false;
      qUpdate.dislikesCount = increment(-1);
    }
    qUpdate.likesCount = increment(updateData.isLiked ? 1 : -1);
  } else if (type === 'dislike') {
    updateData.isDisliked = !currentData.isDisliked;
    if (updateData.isDisliked && currentData.isLiked) {
      updateData.isLiked = false;
      qUpdate.likesCount = increment(-1);
    }
    qUpdate.dislikesCount = increment(updateData.isDisliked ? 1 : -1);
  } else if (type === 'bookmark') {
    updateData.isBookmarked = !currentData.isBookmarked;
    qUpdate.bookmarksCount = increment(updateData.isBookmarked ? 1 : -1);
  }

  const batch = writeBatch(db);
  batch.set(docRef, { ...currentData, ...updateData, userId, questionId, updatedAt: serverTimestamp() }, { merge: true });
  batch.update(qRef, qUpdate);
  await batch.commit();

  return updateData;
}

export async function getQuestionInteraction(questionId: string, userId: string) {
  const interactionId = `${userId}_${questionId}`;
  const docRef = doc(db, 'question_interactions', interactionId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return { isLiked: false, isDisliked: false, isBookmarked: false };
  return snap.data();
}

// ----------------------------------------------------
// Comments
// ----------------------------------------------------

export async function getQuestionComments(questionId: string) {
  const colRef = collection(db, 'question_comments');
  const q = query(colRef, where('questionId', '==', questionId));
  const snapshot = await getDocs(q);
  const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  // Sort by createdAt descending client-side to bypass Firebase composite index requirement
  return docs.sort((a: any, b: any) => {
    const timeA = a.createdAt?.toMillis() || 0;
    const timeB = b.createdAt?.toMillis() || 0;
    return timeB - timeA;
  });
}

export async function addQuestionComment(questionId: string, userId: string, comment: string, userName: string, userAvatar: string) {
  const colRef = collection(db, 'question_comments');
  const docRef = await addDoc(colRef, {
    questionId,
    userId,
    userName,
    userAvatar,
    comment,
    likesCount: 0,
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

// ----------------------------------------------------
// Bulk Operations
// ----------------------------------------------------

export async function bulkUpdateQuestions(ids: string[], updateData: Partial<QuestionBankEntry>) {
  const batch = writeBatch(db);
  ids.forEach(id => {
    const docRef = doc(db, QUESTIONS_COLLECTION, id);
    batch.update(docRef, { ...updateData, updatedAt: serverTimestamp() });
  });
  await batch.commit();
}

export async function bulkDeleteQuestions(ids: string[]) {
  const batch = writeBatch(db);
  ids.forEach(id => {
    const docRef = doc(db, QUESTIONS_COLLECTION, id);
    batch.delete(docRef);
  });
  await batch.commit();
}

