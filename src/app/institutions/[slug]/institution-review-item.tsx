'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star, ThumbsUp, ThumbsDown, BadgeCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useAuthDialog } from '@/hooks/use-auth-dialog';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';

interface ReviewItemProps {
  review: any;
  institutionId: string;
}

export function InstitutionReviewItem({ review, institutionId }: ReviewItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [localReview, setLocalReview] = useState(review);
  
  const { user } = useAuth();
  const { openAuthDialog } = useAuthDialog();
  const { toast } = useToast();

  const handleAction = async (actionType: 'like' | 'dislike') => {
    if (!user) {
      openAuthDialog('sign-in');
      return;
    }

    setIsLiking(true);

    try {
      const institutionRef = doc(db, 'taxonomy_nodes', institutionId);
      const docSnap = await getDoc(institutionRef);
      const data = docSnap.data();
      
      if (!data) throw new Error("Institution not found");
      
      const reviews = data.reviews || [];
      // If review has no ID, fallback to matching authorName and text
      const reviewIndex = reviews.findIndex((r: any) => 
        (localReview.id && r.id === localReview.id) || 
        (!localReview.id && r.authorName === localReview.authorName && r.text === localReview.text)
      );
      
      if (reviewIndex === -1) throw new Error("Review not found");

      const currentReview = reviews[reviewIndex];
      // Generate ID for legacy reviews if missing
      if (!currentReview.id) {
        currentReview.id = crypto.randomUUID();
      }

      const likedBy = currentReview.likedBy || [];
      const dislikedBy = currentReview.dislikedBy || [];
      
      const hasLiked = likedBy.includes(user.uid);
      const hasDisliked = dislikedBy.includes(user.uid);

      if (actionType === 'like') {
        if (hasLiked) {
          // Remove like
          currentReview.likedBy = likedBy.filter((uid: string) => uid !== user.uid);
        } else {
          // Add like, remove dislike if exists
          currentReview.likedBy = [...likedBy, user.uid];
          currentReview.dislikedBy = dislikedBy.filter((uid: string) => uid !== user.uid);
        }
      } else {
        if (hasDisliked) {
          // Remove dislike
          currentReview.dislikedBy = dislikedBy.filter((uid: string) => uid !== user.uid);
        } else {
          // Add dislike, remove like if exists
          currentReview.dislikedBy = [...dislikedBy, user.uid];
          currentReview.likedBy = likedBy.filter((uid: string) => uid !== user.uid);
        }
      }

      reviews[reviewIndex] = currentReview;

      await updateDoc(institutionRef, { reviews });
      setLocalReview(currentReview);

    } catch (error) {
      console.error("Error updating review action:", error);
      toast({
        title: "Error",
        description: "Could not complete your action. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLiking(false);
    }
  };

  const isLongText = localReview.text && localReview.text.length > 250;
  const displayText = isExpanded ? localReview.text : (isLongText ? `${localReview.text.substring(0, 250)}...` : localReview.text);
  
  const likedCount = (localReview.likedBy || []).length;
  const dislikedCount = (localReview.dislikedBy || []).length;
  
  const hasUserLiked = user && (localReview.likedBy || []).includes(user.uid);
  const hasUserDisliked = user && (localReview.dislikedBy || []).includes(user.uid);

  return (
    <div className="p-5 rounded-sm border border-slate-100 bg-white shadow-sm flex flex-col">
      <div className="flex items-start gap-3 mb-3">
        <Image 
          src={localReview.authorPhotoUrl || localReview.avatar} 
          alt={localReview.authorName || localReview.name} 
          width={40} 
          height={40} 
          className="rounded-full bg-slate-200" 
          unoptimized 
        />
        <div>
          <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            {localReview.authorName || localReview.name}
            {localReview.isVerified !== false && (
              <span title="Verified Review"><BadgeCheck className="w-4 h-4 text-emerald-500" /></span>
            )}
          </div>
          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} className={`w-3 h-3 ${star <= localReview.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
              ))}
            </div>
            <span>{localReview.rating} • {localReview.time || 'Recent'}</span>
          </div>
        </div>
      </div>
      
      <div className="text-sm text-slate-600 mb-3 whitespace-pre-wrap">
        {displayText}
        {isLongText && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2 font-medium text-indigo-600 hover:text-indigo-700 hover:underline flex items-center inline-flex"
          >
            {isExpanded ? (
              <>Show less <ChevronUp className="w-3 h-3 ml-0.5" /></>
            ) : (
              <>Read more <ChevronDown className="w-3 h-3 ml-0.5" /></>
            )}
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50">
        <div className="flex gap-2">
          {localReview.rating >= 4 ? (
            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100 font-normal text-[10px]">Positive</Badge>
          ) : localReview.rating === 3 ? (
            <Badge className="bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100 font-normal text-[10px]">Neutral</Badge>
          ) : (
            <Badge className="bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100 font-normal text-[10px]">Critical</Badge>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleAction('like')}
            disabled={isLiking}
            className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${hasUserLiked ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-500'}`}
          >
            <ThumbsUp className={`w-4 h-4 ${hasUserLiked ? 'fill-indigo-600' : ''}`} />
            {likedCount > 0 && <span>{likedCount}</span>}
          </button>
          
          <button 
            onClick={() => handleAction('dislike')}
            disabled={isLiking}
            className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${hasUserDisliked ? 'text-rose-600' : 'text-slate-400 hover:text-rose-500'}`}
          >
            <ThumbsDown className={`w-4 h-4 ${hasUserDisliked ? 'fill-rose-600' : ''}`} />
            {dislikedCount > 0 && <span>{dislikedCount}</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
