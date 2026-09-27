'use client';

import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, Loader2 } from 'lucide-react';
import { getAllReviews, MockTestReview } from '@/lib/firebase/reviews';

export function AllReviewsList({ testId }: { testId: string }) {
  const [reviews, setReviews] = useState<MockTestReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const all = await getAllReviews(testId);
        setReviews(all);
      } catch (err) {
        console.error("Failed to load reviews:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [testId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">Loading all reviews...</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">No reviews yet.</p>
        <p className="text-slate-400 dark:text-slate-500 mt-2">Be the first to review this mock test!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {reviews.map((review) => (
        <div key={review.id} className="flex gap-4 sm:gap-6 border-b border-slate-100 dark:border-slate-800/50 pb-8 last:border-0 last:pb-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
            <span className="text-lg font-black text-indigo-700 dark:text-indigo-300">{review.userAvatar || 'S'}</span>
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 sm:mb-1">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base sm:text-lg">{review.userName}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'fill-current' : 'text-slate-300 dark:text-slate-700'}`} />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm text-slate-400 font-medium">
                    • {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mt-3 leading-relaxed whitespace-pre-wrap">
              {review.content}
            </p>
            <div className="flex items-center gap-1 mt-4">
              <button className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <ThumbsUp className="w-4 h-4" /> Helpful ({review.likes || 0})
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
