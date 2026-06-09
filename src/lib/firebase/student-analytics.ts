import { db } from './client';
import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, deleteDoc, serverTimestamp, increment, updateDoc } from 'firebase/firestore';

// ----------------------------------------------------
// Bookmarks
// ----------------------------------------------------
export const BOOKMARKS_COLLECTION = 'user_bookmarks';

export async function toggleBookmark(userId: string, questionId: string) {
  const docId = `${userId}_${questionId}`;
  const docRef = doc(db, BOOKMARKS_COLLECTION, docId);
  
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    await deleteDoc(docRef);
    return false; // removed
  } else {
    await setDoc(docRef, {
      userId,
      questionId,
      createdAt: serverTimestamp()
    });
    return true; // added
  }
}

export async function getUserBookmarks(userId: string) {
  const q = query(collection(db, BOOKMARKS_COLLECTION), where('userId', '==', userId));
  const snap = await getDocs(q);
  const results = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return results.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

// ----------------------------------------------------
// Mistake Vault
// ----------------------------------------------------
export const MISTAKES_COLLECTION = 'user_mistakes';

export async function recordMistake(userId: string, questionId: string, selectedAnswer: string) {
  const docId = `${userId}_${questionId}`;
  const docRef = doc(db, MISTAKES_COLLECTION, docId);
  
  await setDoc(docRef, {
    userId,
    questionId,
    lastSelectedAnswer: selectedAnswer,
    mistakeCount: increment(1),
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function recordQuestionAttempt(userId: string, questionId: string, selectedAnswer: string, isCorrect: boolean) {
  const docId = `${userId}_${questionId}`;
  const docRef = doc(db, MISTAKES_COLLECTION, docId);
  
  await setDoc(docRef, {
    userId,
    questionId,
    lastSelectedAnswer: selectedAnswer,
    mistakeCount: isCorrect ? increment(0) : increment(1),
    correctCount: isCorrect ? increment(1) : increment(0),
    isCorrectLatest: isCorrect,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function getUserMistakes(userId: string) {
  const q = query(collection(db, MISTAKES_COLLECTION), where('userId', '==', userId));
  const snap = await getDocs(q);
  const results = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return results.sort((a: any, b: any) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
}

// ----------------------------------------------------
// Quiz Scores
// ----------------------------------------------------
export const QUIZ_SCORES_COLLECTION = 'user_quiz_scores';

export async function saveQuizScore(userId: string, taxonomyId: string, totalQuestions: number, correctAnswers: number) {
  const docRef = doc(collection(db, QUIZ_SCORES_COLLECTION));
  await setDoc(docRef, {
    userId,
    taxonomyId,
    totalQuestions,
    correctAnswers,
    scorePercentage: (correctAnswers / totalQuestions) * 100,
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

export async function getUserRecentScores(userId: string, limitCount = 10) {
  const q = query(collection(db, QUIZ_SCORES_COLLECTION), where('userId', '==', userId));
  const snap = await getDocs(q);
  const results = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  results.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  return results.slice(0, limitCount);
}
