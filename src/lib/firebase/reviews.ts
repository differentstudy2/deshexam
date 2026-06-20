import { db } from './client';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  runTransaction 
} from 'firebase/firestore';

export interface MockTestReview {
  id: string; // testId_userId
  testId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1 to 5
  content: string;
  createdAt: string; // ISO string
  updatedAt?: string; // ISO string
  likes: number;
}

export const REVIEWS_COLLECTION = 'mockTestReviews';
export const MOCK_TESTS_COLLECTION = 'mockTests';

/**
 * Fetch a specific user's review for a mock test
 */
export async function getUserReview(testId: string, userId: string): Promise<MockTestReview | null> {
  const reviewId = `${testId}_${userId}`;
  const docRef = doc(db, REVIEWS_COLLECTION, reviewId);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as MockTestReview;
  }
  return null;
}

/**
 * Fetch recent reviews for a test
 */
export async function getRecentReviews(testId: string, maxResults = 5): Promise<MockTestReview[]> {
  const reviewsRef = collection(db, REVIEWS_COLLECTION);
  const q = query(
    reviewsRef,
    where('testId', '==', testId),
    orderBy('createdAt', 'desc'),
    limit(maxResults)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MockTestReview));
}

/**
 * Fetch ALL reviews for a test (used for the all reviews page)
 */
export async function getAllReviews(testId: string): Promise<MockTestReview[]> {
  const reviewsRef = collection(db, REVIEWS_COLLECTION);
  const q = query(
    reviewsRef,
    where('testId', '==', testId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MockTestReview));
}

/**
 * Submit or update a review using a transaction to guarantee stats are updated safely
 */
export async function submitReview(
  testId: string,
  userId: string,
  userName: string,
  userAvatar: string | undefined,
  rating: number,
  content: string
): Promise<void> {
  const reviewId = `${testId}_${userId}`;
  const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
  const testRef = doc(db, MOCK_TESTS_COLLECTION, testId);

  await runTransaction(db, async (transaction) => {
    // 1. Read existing review to know if we are creating or updating
    const existingReviewDoc = await transaction.get(reviewRef);
    const isUpdate = existingReviewDoc.exists();
    const oldRating = isUpdate ? existingReviewDoc.data()?.rating : null;

    // 2. Read the mock test document to get current stats
    const testDoc = await transaction.get(testRef);
    if (!testDoc.exists()) {
      throw new Error("Mock test does not exist!");
    }

    const testData = testDoc.data();
    let currentStats = testData.reviewStats || {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };

    // Calculate new stats
    let newTotal = currentStats.totalReviews;
    const newDist = { ...currentStats.ratingDistribution };

    if (isUpdate) {
      // User changed their rating
      if (oldRating !== rating) {
        newDist[oldRating as keyof typeof newDist] = Math.max(0, newDist[oldRating as keyof typeof newDist] - 1);
        newDist[rating as keyof typeof newDist] += 1;
      }
    } else {
      // Completely new review
      newTotal += 1;
      newDist[rating as keyof typeof newDist] += 1;
    }

    // Calculate new average
    let sum = 0;
    for (let i = 1; i <= 5; i++) {
      sum += i * newDist[i as keyof typeof newDist];
    }
    const newAverage = newTotal === 0 ? 0 : Number((sum / newTotal).toFixed(1));

    const updatedStats = {
      averageRating: newAverage,
      totalReviews: newTotal,
      ratingDistribution: newDist
    };

    // 3. Write review
    const reviewData: Partial<MockTestReview> = {
      testId,
      userId,
      userName,
      userAvatar: userAvatar || '',
      rating,
      content,
      updatedAt: new Date().toISOString()
    };
    
    if (!isUpdate) {
      reviewData.createdAt = new Date().toISOString();
      reviewData.likes = 0;
      transaction.set(reviewRef, reviewData);
    } else {
      transaction.update(reviewRef, reviewData);
    }

    // 4. Update stats on test document
    transaction.update(testRef, { reviewStats: updatedStats });
  });
}
