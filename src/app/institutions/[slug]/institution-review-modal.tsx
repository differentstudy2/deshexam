'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useAuthDialog } from '@/hooks/use-auth-dialog';
import { db } from '@/lib/firebase/client';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Props {
  institutionId: string;
}

export function InstitutionReviewModal({ institutionId }: Props) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const { openAuthDialog } = useAuthDialog();
  const { toast } = useToast();
  const router = useRouter();

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && !user) {
      openAuthDialog('sign-in');
      return;
    }
    setOpen(newOpen);
    if (!newOpen) {
      setRating(0);
      setHoverRating(0);
      setText('');
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      openAuthDialog('sign-in');
      return;
    }
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating.",
        variant: "destructive",
      });
      return;
    }
    if (text.trim().length < 10) {
      toast({
        title: "Review too short",
        description: "Please write at least 10 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const institutionRef = doc(db, 'taxonomy_nodes', institutionId);
      const docSnap = await getDoc(institutionRef);
      const existingData = docSnap.data();
      const existingReviews = existingData?.reviews || [];
      
      const newReview = {
        id: crypto.randomUUID(),
        authorName: user.displayName || 'Anonymous User',
        rating,
        text: text.trim(),
        time: new Date().toLocaleDateString('en-GB'),
        authorPhotoUrl: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'U')}&background=random`,
        isVerified: true,
        likedBy: [],
        dislikedBy: []
      };

      const updatedReviews = [...existingReviews, newReview];
      const newAvgRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;

      await updateDoc(institutionRef, {
        reviews: updatedReviews,
        rating: parseFloat(newAvgRating.toFixed(1)),
        userRatingsTotal: updatedReviews.length
      });

      toast({
        title: "Review Submitted!",
        description: "Thank you for sharing your experience.",
      });
      
      setOpen(false);
      router.refresh();
      
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: "Could not submit your review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-[#00a651] hover:bg-green-700 text-white rounded-sm h-9 px-4 text-sm font-medium shadow-sm transition-all">
          Write a Review
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            Share your experience with others.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">How would you rate this institution?</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="focus:outline-none transition-transform hover:scale-110"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star 
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoverRating || rating) 
                        ? 'fill-amber-400 text-amber-400' 
                        : 'text-slate-300 dark:text-slate-600'
                    }`} 
                  />
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Textarea
              placeholder="Tell us what you liked or disliked..."
              className="resize-none min-h-[120px] focus-visible:ring-[#00a651]"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <span className="text-[10px] text-slate-400 text-right">
              {text.length} characters
            </span>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting} className="rounded-sm">
            Cancel
          </Button>
          <Button 
            className="bg-[#00a651] hover:bg-green-700 text-white rounded-sm" 
            onClick={handleSubmit} 
            disabled={isSubmitting || rating === 0 || text.trim().length < 10}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
