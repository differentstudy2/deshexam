'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlayCircle, Loader2, Lock, ShoppingCart, Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { getUserProfile } from '@/lib/firebase/firestore';
import { createRazorpayOrder } from '@/ai/flows/create-razorpay-order';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface StartTestButtonProps {
  slug: string;
  accessType?: 'free' | 'subscription' | 'one_time' | 'both';
  price?: number;
  allowedSubscriptionPlans?: string[];
}

export function StartTestButton({ slug, accessType = 'free', price = 0, allowedSubscriptionPlans = [] }: StartTestButtonProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [purchasedTests, setPurchasedTests] = useState<string[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);
  
  const [isStarting, setIsStarting] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setProfileLoading(false);
      return;
    }
    getUserProfile(user.uid).then(profile => {
      setUserPlan(profile?.subscriptionPlan || null);
      setPurchasedTests(profile?.purchasedTests || []);
    }).catch(console.error).finally(() => {
      setProfileLoading(false);
    });
  }, [user, authLoading]);

  const hasAccess = () => {
    if (accessType === 'free') return true;
    if (userPlan === 'pro') return true;
    
    if (accessType === 'subscription' || accessType === 'both') {
      if (userPlan && allowedSubscriptionPlans.includes(userPlan)) return true;
    }
    
    if (accessType === 'one_time' || accessType === 'both') {
       if (purchasedTests.includes(slug)) return true;
    }
    
    return false;
  };

  const handleStart = async () => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Login Required', description: 'Please login to take this test.' });
        return;
    }

    setIsStarting(true);
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen request failed:", err);
    }
    router.push(`/mock-tests/${slug}/take`);
  };

  const handlePurchase = async () => {
      if (!user) {
          toast({ variant: 'destructive', title: 'Login Required', description: 'Please login to purchase.' });
          return;
      }

      setIsProcessingPayment(true);

      try {
          const order = await createRazorpayOrder({ amount: price * 100, currency: 'INR' });
          const options = {
              key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
              amount: order.amount,
              currency: order.currency,
              name: 'DeshExam',
              description: `Purchase of Mock Test`,
              order_id: order.id,
              handler: async function (response: any) {
                  try {
                      await updateDoc(doc(db, "users", user.uid), {
                          purchasedTests: arrayUnion(slug)
                      });
                      toast({ title: 'Payment Successful!', description: `You now have access to this test.` });
                      setPurchasedTests(prev => [...prev, slug]);
                  } catch (e) {
                      console.error("Error updating profile", e);
                      toast({ variant: 'destructive', title: 'Error', description: 'Payment succeeded but failed to update profile. Please contact support.' });
                  }
              },
              prefill: { name: user.displayName || 'Test User', email: user.email },
              theme: { color: '#6366f1' },
          };
          const rzp = new window.Razorpay(options);
          rzp.open();
      } catch (error) {
          console.error(error);
          toast({ variant: 'destructive', title: 'Payment Error', description: 'Could not initialize payment.' });
      } finally {
          setIsProcessingPayment(false);
      }
  };

  if (authLoading || profileLoading) {
    return (
      <Button disabled className="w-full h-14 text-lg rounded-xl">
        <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Checking Access...
      </Button>
    );
  }

  const canAccess = hasAccess();

  if (!canAccess) {
    if (accessType === 'subscription') {
      return (
        <Button 
          onClick={() => router.push('/pricing')} 
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 h-14 text-lg rounded-xl transition-all shadow-md text-white font-bold"
        >
          <Crown className="w-5 h-5 mr-2" /> Upgrade to Pass
        </Button>
      );
    }

    if (accessType === 'one_time') {
      return (
        <Button 
          onClick={handlePurchase} 
          disabled={isProcessingPayment}
          className="w-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black dark:from-slate-700 dark:to-slate-800 dark:hover:from-slate-600 dark:hover:to-slate-700 h-14 text-lg rounded-xl transition-all shadow-lg text-white font-bold border border-slate-700 dark:border-slate-600"
        >
          {isProcessingPayment ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <ShoppingCart className="w-5 h-5 mr-2 text-slate-300" />}
          {isProcessingPayment ? 'Processing...' : `Buy for ₹${price}`}
        </Button>
      );
    }

    if (accessType === 'both') {
      return (
        <div className="flex flex-col gap-2">
            <Button 
            onClick={() => router.push('/pricing')} 
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 h-14 text-lg rounded-xl transition-all shadow-md text-white font-bold"
            >
            <Crown className="w-5 h-5 mr-2" /> Upgrade to Pass
            </Button>
            <Button 
            variant="outline"
            onClick={handlePurchase} 
            disabled={isProcessingPayment}
            className="w-full h-12 text-md rounded-xl transition-all border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
            {isProcessingPayment ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShoppingCart className="w-4 h-4 mr-2 text-slate-500 dark:text-slate-400" />}
            {isProcessingPayment ? 'Processing...' : `Or buy for ₹${price}`}
            </Button>
        </div>
      );
    }
  }

  return (
    <Button 
      onClick={handleStart} 
      disabled={isStarting}
      className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 h-14 text-lg rounded-xl transition-all font-bold shadow-lg shadow-blue-600/25 text-white"
    >
      {isStarting ? (
        <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Launching Exam...</>
      ) : (
        <><PlayCircle className="w-5 h-5 mr-2" /> Start Mock Test</>
      )}
    </Button>
  );
}
