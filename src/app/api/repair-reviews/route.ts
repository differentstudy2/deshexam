import { NextResponse } from 'next/server';
import { collection, getDocs, writeBatch, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

export async function GET() {
  try {
    const testsSnap = await getDocs(collection(db, 'mock_tests'));
    const batch = writeBatch(db);
    let updatedCount = 0;

    for (const testDoc of testsSnap.docs) {
      const testId = testDoc.id;
      
      const q = query(collection(db, 'mockTestReviews'), where('testId', '==', testId));
      const revSnap = await getDocs(q);

      if (revSnap.empty) continue;

      let newTotal = revSnap.size;
      const newDist: Record<number, number> = { 1:0, 2:0, 3:0, 4:0, 5:0 };
      let sum = 0;

      revSnap.docs.forEach(r => {
        let rawRating = r.data().rating;
        // Correct previous bad data in memory
        let rating = Math.max(1, Math.min(5, Math.round(Number(rawRating))));
        newDist[rating] += 1;
        sum += rating;
        
        // Also fix the document in reviews collection if it had fractional/string rating
        if (rawRating !== rating) {
           batch.update(r.ref, { rating });
        }
      });

      const newAverage = newTotal === 0 ? 0 : Number((sum / newTotal).toFixed(1));

      const reviewStats = {
        averageRating: newAverage,
        totalReviews: newTotal,
        ratingDistribution: newDist
      };

      batch.update(testDoc.ref, { reviewStats });
      updatedCount++;
    }

    await batch.commit();

    return NextResponse.json({ success: true, updatedCount });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
