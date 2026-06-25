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
export const MOCK_TESTS_COLLECTION = 'mock_tests';

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
    // Sanitize rating to integer between 1 and 5
    let numRating = Number(rating);
    if (isNaN(numRating)) numRating = 5;
    const sanitizedRating = Math.max(1, Math.min(5, Math.round(numRating)));
    
    let numOldRating = Number(oldRating);
    if (isNaN(numOldRating)) numOldRating = 5;
    const oldSanitizedRating = oldRating ? Math.max(1, Math.min(5, Math.round(numOldRating))) : null;

    let currentStats = testData.reviewStats || {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };

    // Calculate new stats, ensuring robust fallback for corrupted distribution keys
    let newTotal = currentStats.totalReviews || 0;
    const newDist: Record<number, number> = { 
      1: currentStats.ratingDistribution?.[1] || 0,
      2: currentStats.ratingDistribution?.[2] || 0,
      3: currentStats.ratingDistribution?.[3] || 0,
      4: currentStats.ratingDistribution?.[4] || 0,
      5: currentStats.ratingDistribution?.[5] || 0,
    };

    if (isUpdate && oldSanitizedRating) {
      // User changed their rating
      if (oldSanitizedRating !== sanitizedRating) {
        newDist[oldSanitizedRating] = Math.max(0, newDist[oldSanitizedRating] - 1);
        newDist[sanitizedRating] += 1;
      }
    } else {
      // Completely new review
      newTotal += 1;
      newDist[sanitizedRating] += 1;
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
      rating: sanitizedRating,
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

/**
 * Bulk insert an array of fake reviews.
 * This sequentially calls submitReview to safely update stats.
 */
export async function bulkSubmitReviews(
  testId: string,
  reviews: { name: string; rating: number; content: string }[]
): Promise<void> {
  for (const review of reviews) {
    const fakeUserId = `ai_gen_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const fakeAvatar = review.name.charAt(0).toUpperCase();
    await submitReview(
      testId,
      fakeUserId,
      review.name,
      fakeAvatar,
      review.rating,
      review.content
    );
  }
}
