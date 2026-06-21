import { db } from './client';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, orderBy, serverTimestamp, limit, addDoc } from 'firebase/firestore';
import { getQuestions } from './question-bank';

export type ChallengeMode = "friend" | "random" | "public";
export type ChallengeStatus = "pending" | "accepted" | "completed" | "declined" | "expired";

export interface Challenge {
  id?: string;
  mode: ChallengeMode;
  status: ChallengeStatus;
  subjectId: string;
  questionIds: string[];
  classId?: string;
  
  challengerId: string;
  challengerName: string;
  challengerAvatar: string;
  challengerScore: number;
  challengerTimeTaken: number;
  challengerCompleted: boolean;
  
  opponentId: string;
  opponentName: string;
  opponentAvatar: string;
  opponentScore: number;
  opponentTimeTaken: number;
  opponentCompleted: boolean;
  
  winnerId: string | null;
  rewardXp: number;
  createdAt: any;
  expiresAt: any;
}

export const CHALLENGES_COLLECTION = 'challenges';

export async function createChallenge(
  challengerId: string, 
  challengerName: string, 
  challengerAvatar: string, 
  opponentId: string, 
  opponentName: string, 
  opponentAvatar: string,
  subjectId: string,
  mode: ChallengeMode,
  numberOfQuestions: number,
  classId?: string
) {
  // Fetch random questions for the subject
  const allSubjectQuestions = await getQuestions({ subjectId: subjectId }, 100);
  // Shuffle and pick
  const shuffled = allSubjectQuestions.sort(() => 0.5 - Math.random());
  const selectedQuestions = shuffled.slice(0, numberOfQuestions).map(q => q.id);

  if (selectedQuestions.length === 0) {
    throw new Error("No questions found for this subject.");
  }

  // Expires in 24 hours
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  const challengeData: Omit<Challenge, 'id'> = {
    mode,
    status: 'pending',
    subjectId,
    questionIds: selectedQuestions,
    challengerId,
    challengerName,
    challengerAvatar,
    challengerScore: 0,
    challengerTimeTaken: 0,
    challengerCompleted: false,
    opponentId,
    opponentName,
    opponentAvatar,
    opponentScore: 0,
    opponentTimeTaken: 0,
    opponentCompleted: false,
    winnerId: null,
    rewardXp: numberOfQuestions * 10, // Base XP reward
    createdAt: serverTimestamp(),
    expiresAt: expiresAt,
    classId: classId || ''
  };

  const colRef = collection(db, CHALLENGES_COLLECTION);
  const docRef = await addDoc(colRef, challengeData);
  return docRef.id;
}

export async function getChallenge(id: string): Promise<Challenge | null> {
  const docRef = doc(db, CHALLENGES_COLLECTION, id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Challenge;
}

export async function getUserChallenges(userId: string) {
  const colRef = collection(db, CHALLENGES_COLLECTION);
  
  // We need two queries because Firestore doesn't support logical OR efficiently without composite indexes
  // So we fetch where challengerId == userId and opponentId == userId separately and combine
  
  const qChallenger = query(colRef, where('challengerId', '==', userId), orderBy('createdAt', 'desc'), limit(30));
  const qOpponent = query(colRef, where('opponentId', '==', userId), orderBy('createdAt', 'desc'), limit(30));

  const [snap1, snap2] = await Promise.all([getDocs(qChallenger), getDocs(qOpponent)]);
  
  const results = new Map<string, Challenge>();
  snap1.docs.forEach(doc => results.set(doc.id, { id: doc.id, ...doc.data() } as Challenge));
  snap2.docs.forEach(doc => results.set(doc.id, { id: doc.id, ...doc.data() } as Challenge));

  const combined = Array.from(results.values());
  
  // Sort descending by createdAt
  combined.sort((a, b) => {
    const timeA = a.createdAt?.toMillis?.() || 0;
    const timeB = b.createdAt?.toMillis?.() || 0;
    return timeB - timeA;
  });

  return combined;
}

export async function updateChallenge(id: string, data: Partial<Challenge>) {
  const docRef = doc(db, CHALLENGES_COLLECTION, id);
  await updateDoc(docRef, data);
}

export async function submitChallengeResult(
  challengeId: string, 
  userId: string, 
  score: number, 
  timeTaken: number
) {
  const challenge = await getChallenge(challengeId);
  if (!challenge) throw new Error("Challenge not found");

  const isChallenger = challenge.challengerId === userId;
  const isOpponent = challenge.opponentId === userId;

  if (!isChallenger && !isOpponent) throw new Error("User not part of this challenge");

  const updates: Partial<Challenge> = {};

  if (isChallenger) {
    updates.challengerScore = score;
    updates.challengerTimeTaken = timeTaken;
    updates.challengerCompleted = true;
  } else {
    updates.opponentScore = score;
    updates.opponentTimeTaken = timeTaken;
    updates.opponentCompleted = true;
  }

  // Determine winner if both completed
  const willComplete = (isChallenger && challenge.opponentCompleted) || (isOpponent && challenge.challengerCompleted);
  
  if (willComplete) {
    updates.status = 'completed';
    const finalChallengerScore = isChallenger ? score : challenge.challengerScore;
    const finalOpponentScore = isOpponent ? score : challenge.opponentScore;
    const finalChallengerTime = isChallenger ? timeTaken : challenge.challengerTimeTaken;
    const finalOpponentTime = isOpponent ? timeTaken : challenge.opponentTimeTaken;

    if (finalChallengerScore > finalOpponentScore) {
      updates.winnerId = challenge.challengerId;
    } else if (finalOpponentScore > finalChallengerScore) {
      updates.winnerId = challenge.opponentId;
    } else {
      // Tie-breaker based on time
      if (finalChallengerTime < finalOpponentTime) {
        updates.winnerId = challenge.challengerId;
      } else if (finalOpponentTime < finalChallengerTime) {
        updates.winnerId = challenge.opponentId;
      } else {
        // Absolute tie
        updates.winnerId = 'tie';
      }
    }
  } else {
    // If opponent just finished their turn, challenge is accepted
    if (isOpponent && challenge.status === 'pending') {
        updates.status = 'accepted';
    }
  }

  await updateChallenge(challengeId, updates);
  return updates;
}

export async function getPublicChallenges(classId: string) {
  if (!classId) return [];
  const colRef = collection(db, CHALLENGES_COLLECTION);
  const q = query(
    colRef, 
    where('mode', '==', 'public'), 
    where('status', '==', 'pending'), 
    where('classId', '==', classId),
    orderBy('createdAt', 'desc'),
    limit(30)
  );

  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Challenge));
}

export async function acceptPublicChallenge(
  challengeId: string,
  opponentId: string,
  opponentName: string,
  opponentAvatar: string
) {
  const challenge = await getChallenge(challengeId);
  if (!challenge) throw new Error("Challenge not found");
  if (challenge.status !== 'pending') throw new Error("This challenge is no longer available");
  
  // Update to 'accepted' and assign the opponent
  await updateChallenge(challengeId, {
    status: 'accepted',
    opponentId,
    opponentName,
    opponentAvatar
  });
}
