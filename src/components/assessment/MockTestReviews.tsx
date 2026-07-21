'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, ThumbsUp, ThumbsDown, MessageSquare, Loader2, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { getRecentReviews, getUserReview, submitReview, incrementReviewHelpful, incrementReviewUnhelpful, MockTestReview } from '@/lib/firebase/reviews';
import { ReviewStats } from '@/lib/assessment-types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog';

interface MockTestReviewsProps {
  testId: string;
  slug: string;
  stats?: ReviewStats;
}

export function MockTestReviews({ testId, slug, stats }: MockTestReviewsProps) {
  const { user } = useAuth();
  
  const [reviews, setReviews] = useState<MockTestReview[]>([]);
  const [userReview, setUserReview] = useState<MockTestReview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likedReviews, setLikedReviews] = useState<Set<string>>(new Set());
  const [dislikedReviews, setDislikedReviews] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const recent = await getRecentReviews(testId, 10);
        setReviews(recent);
        
        if (user) {
          const myReview = await getUserReview(testId, user.uid);
          if (myReview) {
            setUserReview(myReview);
            setRating(myReview.rating);
            setContent(myReview.content);
          }
        }
      } catch (err) {
        console.error("Failed to load reviews:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [testId, user]);

  // Derived stats from props (0 reads!)
  const aggregateRating = stats?.averageRating || 0;
  const totalReviews = stats?.totalReviews || 0;
  
  const ratingCounts = [
    { stars: 5, count: stats?.ratingDistribution?.[5] || 0 },
    { stars: 4, count: stats?.ratingDistribution?.[4] || 0 },
    { stars: 3, count: stats?.ratingDistribution?.[3] || 0 },
    { stars: 2, count: stats?.ratingDistribution?.[2] || 0 },
    { stars: 1, count: stats?.ratingDistribution?.[1] || 0 },
  ].map(rc => ({
    ...rc,
    percent: totalReviews > 0 ? Math.round((rc.count / totalReviews) * 100) : 0
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const name = user.displayName || 'Anonymous Student';
      const avatar = user.displayName ? user.displayName.charAt(0).toUpperCase() : 'A';
      
      await submitReview(testId, user.uid, name, avatar, rating, content);
      
      // Optimistic update UI
      const updatedReview: MockTestReview = {
        id: `${testId}_${user.uid}`,
        testId,
        userId: user.uid,
        userName: name,
        userAvatar: avatar,
        rating,
        content,
        createdAt: userReview?.createdAt || new Date().toISOString(),
        likes: userReview?.likes || 0
      };
      
      setUserReview(updatedReview);
      setIsOpen(false);
      
      // Refresh list
      const recent = await getRecentReviews(testId);
      setReviews(recent);
      
    } catch (err) {
      console.error("Failed to submit review:", err);
      alert("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId: string) => {
    if (likedReviews.has(reviewId) || dislikedReviews.has(reviewId)) return;
    
    setLikedReviews(prev => new Set(prev).add(reviewId));
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, likes: (r.likes || 0) + 1 } : r));

    try {
      await incrementReviewHelpful(reviewId);
    } catch (err) {
      console.error("Failed to like review", err);
    }
  };

  const handleUnhelpful = async (reviewId: string) => {
    if (likedReviews.has(reviewId) || dislikedReviews.has(reviewId)) return;
    
    setDislikedReviews(prev => new Set(prev).add(reviewId));
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, dislikes: (r.dislikes || 0) + 1 } : r));

    try {
      await incrementReviewUnhelpful(reviewId);
    } catch (err) {
      console.error("Failed to dislike review", err);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mt-8">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-indigo-100/50 dark:border-indigo-900/20 bg-gradient-to-r from-indigo-50/50 to-violet-50/50 dark:from-indigo-900/10 dark:to-violet-900/10">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
          <MessageSquare className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">Student Reviews & Ratings</h2>
      </div>

      <div className="p-6">
        {/* Aggregate Stats */}
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-8">
          <div className="text-center md:text-left flex flex-col items-center md:items-start shrink-0">
            <h3 className="text-5xl font-black text-slate-900 dark:text-white">{aggregateRating.toFixed(1)}</h3>
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
                    className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                    style={{ width: `${rc.percent}%` }}
                  ></div>
                </div>
                <span className="w-10 text-slate-500 dark:text-slate-400 text-right">{rc.percent}%</span>
              </div>
            ))}
          </div>
          
          <div className="shrink-0 w-full md:w-auto flex justify-center">
            {user ? (
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg shadow-indigo-600/20">
                    {userReview ? 'Edit My Review' : 'Write a Review'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{userReview ? 'Edit Your Review' : 'Write a Review'}</DialogTitle>
                    <DialogDescription>
                      Share your experience with this mock test to help other students.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="mt-4">
                    <div className="flex items-center justify-center gap-2 mb-6">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`p-1 transition-colors ${star <= rating ? 'text-amber-500' : 'text-slate-200 dark:text-slate-700'}`}
                        >
                          <Star className="w-8 h-8 fill-current" />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="What did you think of the test difficulty, explanations, etc.?"
                      className="w-full min-h-[120px] p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      required
                      minLength={10}
                    />
                    <div className="flex justify-end mt-6 gap-3">
                      <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Review'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            ) : (
              <Button disabled className="w-full md:w-auto font-bold rounded-lg">
                Login to Review
              </Button>
            )}
          </div>
        </div>

        <div className="w-full h-px bg-slate-100 dark:bg-slate-800 mb-8"></div>

        {/* Review List */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            No reviews yet. Be the first to review!
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
                  <span className="font-bold text-indigo-700 dark:text-indigo-300">{review.userAvatar || 'S'}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                        {review.userName}
                        <span title="Verified User" className="flex items-center">
                          <BadgeCheck className="w-4 h-4 text-emerald-500 cursor-help" />
                        </span>
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex items-center text-amber-500">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={`w-3.5 h-3.5 ${star <= review.rating ? 'fill-current' : 'text-slate-300 dark:text-slate-700'}`} />
                          ))}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">
                          • {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-sm mt-2 leading-relaxed whitespace-pre-wrap">
                    {review.content}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <button 
                      onClick={() => handleHelpful(review.id)}
                      disabled={likedReviews.has(review.id) || dislikedReviews.has(review.id)}
                      className={`flex items-center gap-1.5 text-[11px] font-semibold transition-colors ${
                        likedReviews.has(review.id) 
                          ? 'text-indigo-600 dark:text-indigo-400' 
                          : 'text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${likedReviews.has(review.id) ? 'fill-current' : ''}`} /> 
                      Helpful ({review.likes || 0})
                    </button>
                    
                    <button 
                      onClick={() => handleUnhelpful(review.id)}
                      disabled={likedReviews.has(review.id) || dislikedReviews.has(review.id)}
                      className={`flex items-center gap-1.5 text-[11px] font-semibold transition-colors ${
                        dislikedReviews.has(review.id) 
                          ? 'text-red-500 dark:text-red-400' 
                          : 'text-slate-400 hover:text-red-500 dark:hover:text-red-400'
                      }`}
                    >
                      <ThumbsDown className={`w-3.5 h-3.5 ${dislikedReviews.has(review.id) ? 'fill-current' : ''}`} /> 
                      Not Helpful ({(review as any).dislikes || 0})
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalReviews > 10 && (
          <div className="mt-8 text-center">
            <Link href={`/mock-tests/reviews/${slug}`}>
              <Button variant="ghost" className="text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                See All {totalReviews} Reviews
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
