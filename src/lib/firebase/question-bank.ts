import { db } from './client';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp, limit, increment, writeBatch, addDoc, documentId, startAfter, getCountFromServer } from 'firebase/firestore';
import { TaxonomyNode, QuestionBankEntry } from '@/lib/question-bank-types';
import hardcodedQuestionsRaw from '@/data/hardcoded/taxonomy/questions.json';

const hardcodedQuestions = hardcodedQuestionsRaw as unknown as QuestionBankEntry[];

export const TAXONOMY_COLLECTIONS = {
  board: 'question_boards',
  class: 'question_classes',
  subject: 'question_subjects',
  textbook: 'question_textbooks',
  chapter: 'question_chapters',
  topic: 'question_topics',
  exam: 'question_exams',
  year: 'question_years',
  tag: 'question_tags',
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
  let localQuestions = hardcodedQuestions.filter(q => {
    if (!filters) return true;
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        if (q[key as keyof QuestionBankEntry] !== value) return false;
      }
    }
    return true;
  });

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
      q = query(colRef, ...conditions, limit(1000));
    }
  }
  
  const snapshot = await getDocs(q);
  let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as QuestionBankEntry);
  
  results = [...localQuestions, ...results];
  
  if (filters) {
      results.sort((a, b) => {
          const timeA = (a.createdAt as any)?.seconds || ((a.createdAt as any)?.getTime?.() / 1000) || 0;
          const timeB = (b.createdAt as any)?.seconds || ((b.createdAt as any)?.getTime?.() / 1000) || 0;
          return timeB - timeA;
      });
      // Client side slicing to ensure newest items are kept when returning
      if (results.length > limitCount) {
        results = results.slice(0, limitCount);
      }
  }
  return results;
}

export async function getAllQuestionBankEntries() {
  const colRef = collection(db, QUESTIONS_COLLECTION);
  const q = query(colRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as QuestionBankEntry);
}

export async function getQuestionsPaginated(filters?: Record<string, any>, limitCount = 50, startAfterDoc?: any) {
  let localQuestions = hardcodedQuestions.filter(q => {
    if (!filters) return true;
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        if (Array.isArray(value)) {
          if (!value.includes(q[key as keyof QuestionBankEntry])) return false;
        } else {
          if (q[key as keyof QuestionBankEntry] !== value) return false;
        }
      }
    }
    return true;
  });

  const isLocalOffset = typeof startAfterDoc === 'number';
  const isFirebaseStart = startAfterDoc === 'firebase-start';
  const offset = isLocalOffset ? startAfterDoc : 0;

  // 1. Serve Local Questions First
  if (localQuestions.length > 0 && (!startAfterDoc || isLocalOffset)) {
      const paginatedLocal = localQuestions.slice(offset, offset + limitCount);
      
      if (paginatedLocal.length > 0) {
          const nextOffset = offset + paginatedLocal.length;
          const hasMoreLocal = nextOffset < localQuestions.length;
          
          return {
              questions: paginatedLocal,
              lastDoc: hasMoreLocal ? nextOffset : 'firebase-start'
          };
      }
  }

  // 2. Serve Firebase Questions
  const colRef = collection(db, QUESTIONS_COLLECTION);
  let conditions = [];
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        if (Array.isArray(value)) {
          conditions.push(where(key, 'in', value));
        } else {
          conditions.push(where(key, '==', value));
        }
      }
    }
  }

  let q;
  const actualStartAfter = (isFirebaseStart || isLocalOffset || !startAfterDoc) ? null : startAfterDoc;

  if (conditions.length > 0) {
      if (actualStartAfter) {
          q = query(colRef, ...conditions, startAfter(actualStartAfter), limit(limitCount));
      } else {
          q = query(colRef, ...conditions, limit(limitCount));
      }
  } else {
      if (actualStartAfter) {
          q = query(colRef, orderBy('createdAt', 'desc'), startAfter(actualStartAfter), limit(limitCount));
      } else {
          q = query(colRef, orderBy('createdAt', 'desc'), limit(limitCount));
      }
  }
  
  const snapshot = await getDocs(q);
  let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as QuestionBankEntry);

  return {
      questions: results,
      lastDoc: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null
  };
}

export async function getQuestion(id: string) {
  const localMatch = hardcodedQuestions.find(q => q.id === id);
  if (localMatch) return localMatch;

  const docRef = doc(db, QUESTIONS_COLLECTION, id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as QuestionBankEntry;
}



export async function getTotalQuestionsCount(filters?: any) {
  const colRef = collection(db, QUESTIONS_COLLECTION);
  let q = query(colRef);
  
  if (filters && Object.keys(filters).length > 0) {
      const conditions: any[] = [];
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null && value !== '' && value !== 'all') {
          conditions.push(where(key, '==', value));
        }
      }
      
      if (conditions.length > 0) {
          q = query(colRef, ...conditions);
      }
  }

  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
}

export async function getQuestionsByIds(ids: string[]) {
  if (!ids || ids.length === 0) return [];
  
  // Firestore 'in' query supports up to 10 items.
  // For larger arrays, we need to chunk them.
  const chunks = [];
  for (let i = 0; i < ids.length; i += 10) {
    chunks.push(ids.slice(i, i + 10));
  }
  
  const results: QuestionBankEntry[] = [];
  const colRef = collection(db, QUESTIONS_COLLECTION);
  
  for (const chunk of chunks) {
    const q = query(colRef, where(documentId(), 'in', chunk));
    const snapshot = await getDocs(q);
    snapshot.docs.forEach(doc => results.push({ id: doc.id, ...doc.data() } as QuestionBankEntry));
  }
  
  // Sort back to original order of `ids` array
  const mapped = new Map(results.map(q => [q.id, q]));
  return ids.map(id => mapped.get(id)).filter(Boolean) as QuestionBankEntry[];
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
  const localMatch = hardcodedQuestions.find(q => q.slug === slug);
  if (localMatch) return localMatch;

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

export async function getUserInteractions(userId: string) {
  const colRef = collection(db, 'question_interactions');
  const q = query(colRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
}

export async function getUserLikedQuestions(userId: string) {
  const interactions = await getUserInteractions(userId);
  const likedIds = interactions.filter((i: any) => i.isLiked).map((i: any) => i.questionId);
  return getQuestionsByIds(likedIds);
}

export async function getUserBookmarkedQuestions(userId: string) {
  const interactions = await getUserInteractions(userId);
  const bookmarkedIds = interactions.filter((i: any) => i.isBookmarked).map((i: any) => i.questionId);
  return getQuestionsByIds(bookmarkedIds);
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

export async function bulkCreateQuestions(questions: Omit<QuestionBankEntry, 'createdAt' | 'updatedAt'>[]) {
  // Firestore batches have a limit of 500 operations
  const CHUNK_SIZE = 450;
  for (let i = 0; i < questions.length; i += CHUNK_SIZE) {
    const chunk = questions.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);
    
    chunk.forEach(q => {
      const docRef = doc(db, QUESTIONS_COLLECTION, q.id);
      batch.set(docRef, { ...q, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    });
    
    await batch.commit();
  }
}

export async function bulkEditQuestions(updates: (Partial<QuestionBankEntry> & { id: string })[]) {
  const CHUNK_SIZE = 450;
  for (let i = 0; i < updates.length; i += CHUNK_SIZE) {
    const chunk = updates.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);
    
    chunk.forEach(q => {
      const docRef = doc(db, QUESTIONS_COLLECTION, q.id);
      const updateData = { ...q };
      delete (updateData as any).id;
      batch.update(docRef, { ...updateData, updatedAt: serverTimestamp() });
    });
    
    await batch.commit();
  }
}

// ----------------------------------------------------
// Saved Question Papers (Drafts)
// ----------------------------------------------------

export const SAVED_PAPERS_COLLECTION = 'saved_question_papers';

export interface SavedQuestionPaper {
  id?: string;
  userId: string;
  title: string;
  questions: any[];
  templateSettings: any;
  createdAt?: any;
  updatedAt?: any;
}

export async function saveQuestionPaperDraft(userId: string, title: string, questions: any[], templateSettings: any, draftId?: string) {
  const colRef = collection(db, SAVED_PAPERS_COLLECTION);
  let docRef;
  
  if (draftId) {
    docRef = doc(db, SAVED_PAPERS_COLLECTION, draftId);
    await updateDoc(docRef, {
      title,
      questions,
      templateSettings,
      updatedAt: serverTimestamp()
    });
    return draftId;
  } else {
    docRef = await addDoc(colRef, {
      userId,
      title,
      questions,
      templateSettings,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  }
}

export async function getUserQuestionPaperDrafts(userId: string) {
  const colRef = collection(db, SAVED_PAPERS_COLLECTION);
  const q = query(colRef, where('userId', '==', userId), orderBy('updatedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SavedQuestionPaper[];
}

export async function getQuestionPaperDraft(draftId: string) {
  const docRef = doc(db, SAVED_PAPERS_COLLECTION, draftId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as SavedQuestionPaper;
}

export async function deleteQuestionPaperDraft(draftId: string) {
  const docRef = doc(db, SAVED_PAPERS_COLLECTION, draftId);
  await deleteDoc(docRef);
}
