'use client';

import React, { useState } from 'react';
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

/** Generates a consistent color from a string */
function stringToColor(str: string): string {
  const colors = [
    '#10b981', '#6366f1', '#f59e0b', '#ef4444',
    '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

/** Avatar: tries Google photo URL first, falls back to initials */
function ReviewAvatar({ photoUrl, name }: { photoUrl?: string; name: string }) {
  const [imgFailed, setImgFailed] = useState(false);
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const bg = stringToColor(name);

  if (photoUrl && !imgFailed) {
    return (
      // Use a plain <img> with referrerPolicy so Google serves the photo
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={name}
        referrerPolicy="no-referrer"
        width={40}
        height={40}
        className="rounded-full bg-slate-200 w-10 h-10 object-cover shrink-0"
        onError={() => setImgFailed(true)}
      />
    );
  }

  return (
    <div
      className="rounded-full w-10 h-10 flex items-center justify-center text-white text-sm font-bold shrink-0"
      style={{ backgroundColor: bg }}
    >
      {initials}
    </div>
  );
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
      const reviewIndex = reviews.findIndex((r: any) => 
        (localReview.id && r.id === localReview.id) || 
        (!localReview.id && r.authorName === localReview.authorName && r.text === localReview.text)
      );
      
      if (reviewIndex === -1) throw new Error("Review not found");

      const currentReview = reviews[reviewIndex];
      if (!currentReview.id) {
        currentReview.id = crypto.randomUUID();
      }

      const likedBy = currentReview.likedBy || [];
      const dislikedBy = currentReview.dislikedBy || [];
      
      const hasLiked = likedBy.includes(user.uid);
      const hasDisliked = dislikedBy.includes(user.uid);

      if (actionType === 'like') {
        if (hasLiked) {
          currentReview.likedBy = likedBy.filter((uid: string) => uid !== user.uid);
        } else {
          currentReview.likedBy = [...likedBy, user.uid];
          currentReview.dislikedBy = dislikedBy.filter((uid: string) => uid !== user.uid);
        }
      } else {
        if (hasDisliked) {
          currentReview.dislikedBy = dislikedBy.filter((uid: string) => uid !== user.uid);
        } else {
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

  const authorName = localReview.authorName || localReview.name || 'Anonymous';
  const photoUrl = localReview.authorPhotoUrl || localReview.avatar;

  return (
    <div className="p-5 rounded-sm border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-800/30 shadow-sm flex flex-col">
      <div className="flex items-start gap-3 mb-3">
        <ReviewAvatar photoUrl={photoUrl} name={authorName} />
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
            {authorName}
            {localReview.isVerified !== false && (
              <span title="Verified Review"><BadgeCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /></span>
            )}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} className={`w-3 h-3 ${star <= localReview.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
              ))}
            </div>
            <span>{localReview.rating} • {localReview.time || 'Recent'}</span>
          </div>
        </div>
      </div>
      
      <div className="text-sm text-slate-600 dark:text-slate-300 mb-3 whitespace-pre-wrap">
        {displayText}
        {isLongText && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2 font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline flex items-center inline-flex"
          >
            {isExpanded ? (
              <>Show less <ChevronUp className="w-3 h-3 ml-0.5" /></>
            ) : (
              <>Read more <ChevronDown className="w-3 h-3 ml-0.5" /></>
            )}
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50 dark:border-slate-800/60">
        <div className="flex gap-2">
          {localReview.rating >= 4 ? (
            <Badge className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 font-normal text-[10px]">Positive</Badge>
          ) : localReview.rating === 3 ? (
            <Badge className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 font-normal text-[10px]">Neutral</Badge>
          ) : (
            <Badge className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 font-normal text-[10px]">Critical</Badge>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleAction('like')}
            disabled={isLiking}
            className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${hasUserLiked ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400'}`}
          >
            <ThumbsUp className={`w-4 h-4 ${hasUserLiked ? 'fill-indigo-600 dark:fill-indigo-400' : ''}`} />
            {likedCount > 0 && <span>{likedCount}</span>}
          </button>
          
          <button 
            onClick={() => handleAction('dislike')}
            disabled={isLiking}
            className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${hasUserDisliked ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400'}`}
          >
            <ThumbsDown className={`w-4 h-4 ${hasUserDisliked ? 'fill-rose-600 dark:fill-rose-400' : ''}`} />
            {dislikedCount > 0 && <span>{dislikedCount}</span>}
          </button>
        </div>
      </div>
    </div>
  );
}

