import { db } from './client';
import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, deleteDoc, serverTimestamp, increment, updateDoc, limit } from 'firebase/firestore';

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

export async function recordQuestionAttempt(
  userId: string, 
  questionId: string, 
  selectedAnswer: string, 
  isCorrect: boolean | 'correct' | 'wrong' | 'skipped'
) {
  const docId = `${userId}_${questionId}`;
  const docRef = doc(db, MISTAKES_COLLECTION, docId);
  
  const status = typeof isCorrect === 'boolean' ? (isCorrect ? 'correct' : 'wrong') : isCorrect;
  const isRight = status === 'correct';
  const isWrong = status === 'wrong';
  const isSkipped = status === 'skipped';

  await setDoc(docRef, {
    userId,
    questionId,
    lastSelectedAnswer: selectedAnswer,
    mistakeCount: isWrong ? increment(1) : increment(0),
    correctCount: isRight ? increment(1) : increment(0),
    skipCount: isSkipped ? increment(1) : increment(0),
    isCorrectLatest: isRight,
    latestStatus: status,
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

// ----------------------------------------------------
// Exam / Mock Test Attempts
// ----------------------------------------------------
export const EXAM_ATTEMPTS_COLLECTION = 'user_exam_attempts';

export async function saveExamAttempt(userId: string, assessmentId: string, scoreData: any) {
  const docRef = doc(collection(db, EXAM_ATTEMPTS_COLLECTION));
  await setDoc(docRef, {
    userId,
    assessmentId,
    scoreData,
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

export async function getUserExamAttemptsCount(userId: string, assessmentId: string) {
  const q = query(
    collection(db, EXAM_ATTEMPTS_COLLECTION),
    where('userId', '==', userId),
    where('assessmentId', '==', assessmentId)
  );
  const snap = await getDocs(q);
  return snap.size;
}

export async function getUserExamAttempts(userId: string, assessmentId: string) {
  const q = query(
    collection(db, EXAM_ATTEMPTS_COLLECTION),
    where('userId', '==', userId),
    where('assessmentId', '==', assessmentId)
  );
  const snap = await getDocs(q);
  const results = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return results.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

export async function getTopScorersForAssessment(assessmentId: string, limitCount = 5) {
  const q = query(
    collection(db, EXAM_ATTEMPTS_COLLECTION),
    where('assessmentId', '==', assessmentId)
  );
  const snap = await getDocs(q);
  const results = snap.docs.map(doc => doc.data() as any);
  
  // Group by unique user and find their max score
  const topScoresMap = new Map<string, any>();
  results.forEach(attempt => {
    const uid = attempt.userId;
    if (!uid) return;
    const currentScore = attempt.scoreData?.score || 0;
    const existing = topScoresMap.get(uid);
    if (!existing || currentScore > (existing.scoreData?.score || 0)) {
      topScoresMap.set(uid, attempt);
    }
  });

  const uniqueTopAttempts = Array.from(topScoresMap.values());
  uniqueTopAttempts.sort((a, b) => (b.scoreData?.score || 0) - (a.scoreData?.score || 0));
  
  return uniqueTopAttempts.slice(0, limitCount);
}

// ----------------------------------------------------
// Leaderboard & Daily Challenges
// ----------------------------------------------------
export const LEADERBOARD_COLLECTION = 'platform_leaderboard';
export const DAILY_CHALLENGES_COLLECTION = 'daily_challenges';

export async function getTopLeaderboard(limitCount = 4) {
  try {
    const q = query(collection(db, LEADERBOARD_COLLECTION), orderBy('score', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.error("Error fetching leaderboard", e);
    return [];
  }
}

export async function getDailyChallenges() {
  try {
    const q = query(collection(db, DAILY_CHALLENGES_COLLECTION), orderBy('order', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.error("Error fetching daily challenges", e);
    return [];
  }
}
