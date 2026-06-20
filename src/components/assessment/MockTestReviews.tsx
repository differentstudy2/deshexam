'use client';

import React from 'react';
import { Star, ThumbsUp, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MockTestReviewsProps {
  testId: string;
}

export function MockTestReviews({ testId }: MockTestReviewsProps) {
  // Static placeholder data for the reviews UI
  const aggregateRating = 4.9;
  const totalReviews = 342;
  const ratingCounts = [
    { stars: 5, percent: 85 },
    { stars: 4, percent: 10 },
    { stars: 3, percent: 3 },
    { stars: 2, percent: 1 },
    { stars: 1, percent: 1 },
  ];

  const recentReviews = [
    {
      id: 1,
      user: 'Rahul Banerjee',
      avatar: 'R',
      date: '2 days ago',
      rating: 5,
      content: 'The interface is exactly like the real exam. The questions are tough but very relevant. Highly recommended!',
      likes: 12,
    },
    {
      id: 2,
      user: 'Priya Saha',
      avatar: 'P',
      date: '1 week ago',
      rating: 5,
      content: 'Detailed explanations after the test really helped me understand my mistakes. The AI analytics are awesome.',
      likes: 8,
    },
    {
      id: 3,
      user: 'Suman Das',
      avatar: 'S',
      date: '2 weeks ago',
      rating: 4,
      content: 'Good quality questions. Wish there were a few more current affairs questions, but overall a great practice set.',
      likes: 3,
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mt-8">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <MessageSquare className="w-5 h-5 text-indigo-500" />
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Student Reviews & Ratings</h2>
      </div>

      <div className="p-6">
        {/* Aggregate Stats */}
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-8">
          <div className="text-center md:text-left flex flex-col items-center md:items-start shrink-0">
            <h3 className="text-5xl font-black text-slate-900 dark:text-white">{aggregateRating}</h3>
            <div className="flex items-center gap-1 my-2 text-amber-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className={`w-5 h-5 ${star <= Math.round(aggregateRating) ? 'fill-current' : 'text-slate-300 dark:text-slate-700'}`} />
              ))}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Based on {totalReviews} reviews</p>
          </div>

          <div className="flex-1 w-full space-y-2">
            {ratingCounts.map((rc) => (
              <div key={rc.stars} className="flex items-center gap-3 text-sm">
                <span className="w-8 font-medium text-slate-600 dark:text-slate-400 text-right">{rc.stars} ★</span>
                <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full" 
                    style={{ width: `${rc.percent}%` }}
                  ></div>
                </div>
                <span className="w-10 text-slate-500 dark:text-slate-400 text-right">{rc.percent}%</span>
              </div>
            ))}
          </div>
          
          <div className="shrink-0 w-full md:w-auto flex justify-center">
            <Button className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20">
              Write a Review
            </Button>
          </div>
        </div>

        <div className="w-full h-px bg-slate-100 dark:bg-slate-800 mb-8"></div>

        {/* Review List */}
        <div className="space-y-6">
          {recentReviews.map((review) => (
            <div key={review.id} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
                <span className="font-bold text-indigo-700 dark:text-indigo-300">{review.avatar}</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100">{review.user}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center text-amber-500">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`w-3.5 h-3.5 ${star <= review.rating ? 'fill-current' : 'text-slate-300 dark:text-slate-700'}`} />
                        ))}
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">• {review.date}</span>
                    </div>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm mt-2 leading-relaxed">
                  {review.content}
                </p>
                <div className="flex items-center gap-1 mt-3">
                  <button className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    <ThumbsUp className="w-3.5 h-3.5" /> Helpful ({review.likes})
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button variant="ghost" className="text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
            Load More Reviews
          </Button>
        </div>

      </div>
    </div>
  );
}
