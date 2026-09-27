'use client';

import React, { useState } from 'react';
import { collection, getDocs, writeBatch, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

export default function RepairStatsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleRepair = async () => {
    setLoading(true);
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
          let numRaw = Number(rawRating);
          if (isNaN(numRaw)) numRaw = 5;
          let rating = Math.max(1, Math.min(5, Math.round(numRaw)));
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
      setResult(`Success! Repaired ${updatedCount} mock tests.`);
    } catch (e: any) {
      setResult(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Repair Review Stats</h1>
      <button 
        onClick={handleRepair} 
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? 'Repairing...' : 'Start Repair'}
      </button>
      {result && <p className="mt-4">{result}</p>}
    </div>
  );
}
