"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from '@/components/ui/input';
import { Check, X, BookCopy, FileClock, CircleUser, Video, Repeat, Loader2, Tag, ChevronRight } from 'lucide-react';
import { pricingData, faqData } from "@/lib/mock-data";
import { cn } from '@/lib/utils';
import { createRazorpayOrder } from '@/ai/flows/create-razorpay-order';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { getCouponByCode } from '@/lib/firebase/firestore';
import Script from 'next/script';

declare global {
    interface Window {
        Razorpay: any;
    }
}

type Coupon = {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
};

export default function PricingClientPage() {
    const { toast } = useToast();
    const { user } = useAuth();
    const [planType, setPlanType] = useState<'pro' | 'pass'>('pro');
    const [selectedDurationId, setSelectedDurationId] = useState(pricingData.plans.pro[1].id);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [couponDiscount, setCouponDiscount] = useState(0);

    useEffect(() => {
        document.title = "Pricing Plans | DeshExam";
    }, []);

    useEffect(() => {
        const newPlans = pricingData.plans[planType];
        const bestseller = newPlans.find(p => p.bestseller) || newPlans[0];
        setSelectedDurationId(bestseller.id);
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponDiscount(0);
    }, [planType]);

    useEffect(() => {
        if(appliedCoupon) calculateCouponDiscount();
    }, [selectedDurationId, appliedCoupon]);

    const currentPlans = pricingData.plans[planType];
    const selectedPlan = currentPlans.find(p => p.id === selectedDurationId);
    
    const price = selectedPlan ? selectedPlan.price : 0;
    const originalPrice = selectedPlan ? selectedPlan.originalPrice : 0;
    
    const platformFee = 30;
    const priceAfterCoupon = price - couponDiscount;
    const gst = (priceAfterCoupon + platformFee) * 0.18;
    const total = priceAfterCoupon + platformFee + gst;
    
    const calculateCouponDiscount = () => {
        if (!appliedCoupon || !selectedPlan) {
            setCouponDiscount(0);
            return;
        }
        let discount = appliedCoupon.discountType === 'percentage' 
          ? (selectedPlan.price * appliedCoupon.discountValue) / 100 
          : appliedCoupon.discountValue;
        
        setCouponDiscount(Math.min(discount, selectedPlan.price));
    };
    
    const handleApplyCoupon = async () => {
        if (!couponCode) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please enter a coupon code.' });
            return;
        }
        try {
            const couponData = await getCouponByCode(couponCode);
            if (couponData) {
                setAppliedCoupon(couponData as Coupon);
            } else {
                setAppliedCoupon(null);
                setCouponDiscount(0);
                toast({ variant: 'destructive', title: 'Invalid Coupon', description: 'Code is invalid or expired.' });
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not validate coupon.' });
        }
    };
    
    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponDiscount(0);
    };

    const handlePayment = async () => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Authentication Error', description: 'Please log in to purchase.' });
            return;
        }
        if (!selectedPlan) return;

        setIsProcessingPayment(true);

        try {
            const order = await createRazorpayOrder({ amount: total * 100, currency: 'INR' });
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: 'DeshExam',
                description: `Purchase of ${selectedPlan.name}`,
                order_id: order.id,
                handler: async function (response: any) {
                    toast({ title: 'Payment Successful!', description: `ID: ${response.razorpay_payment_id}` });
                },
                prefill: { name: user.displayName || 'Test User', email: user.email },
                theme: { color: '#6366f1' },
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Payment Error', description: 'Could not initialize payment.' });
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const whyMustHave = [
        { icon: <BookCopy className="w-5 h-5 text-slate-700" />, title: "150,000+ Mock tests" },
        { icon: <FileClock className="w-5 h-5 text-slate-700" />, title: "30,000+ Prev. Year Papers" },
        { icon: <CircleUser className="w-5 h-5 text-slate-700" />, title: "Pro Practice Questions" },
        { icon: <Video className="w-5 h-5 text-slate-700" />, title: "Daily Live Tests & Rankings" },
        { icon: <Repeat className="w-5 h-5 text-slate-700" />, title: "Unlimited Test Re-Attempts" }
    ];

  return (
    <div className="w-full pb-12 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen font-sans">
        <Script id="razorpay-checkout-js" src="https://checkout.razorpay.com/v1/checkout.js" />
        
        <div className="w-full max-w-[1000px] mx-auto px-4 sm:px-6 pt-6">
            
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Choose a Plan</h1>
                <p className="text-sm text-slate-500 mt-1">Unlock premium mock tests and analytics.</p>
            </div>

            {/* Native iOS-style Segmented Control */}
            <div className="flex w-full mb-8">
                <div className="flex w-full bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                    <button 
                        onClick={() => setPlanType('pro')}
                        className={cn("flex-1 py-2 text-sm font-semibold rounded-md transition-all flex items-center justify-center gap-1.5", 
                            planType === 'pro' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500')}
                    >
                        Pass Pro
                        <span className="bg-[#6366f1] text-white text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wide">Pro</span>
                    </button>
                    <button 
                        onClick={() => setPlanType('pass')}
                        className={cn("flex-1 py-2 text-sm font-semibold rounded-md transition-all", 
                            planType === 'pass' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500')}
                    >
                        Pass
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                
                {/* LEFT: Features & FAQ (Native List View) */}
                <div className="space-y-8">
                    
                    {/* Features List */}
                    <div>
                        <h3 className="font-bold text-[15px] mb-3 uppercase tracking-wide text-slate-500">Features Included</h3>
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            {pricingData.benefits.map((benefit, index) => {
                                const isIncluded = (planType === 'pro' && benefit.pro) || (planType === 'pass' && benefit.pass);
                                const isLast = index === pricingData.benefits.length - 1;
                                
                                return (
                                    <div key={benefit.id} className={cn(
                                        "flex items-center justify-between p-3.5 mx-2",
                                        !isLast && "border-b border-slate-100 dark:border-slate-800"
                                    )}>
                                        <span className={cn(
                                            "text-[13px] font-medium leading-tight",
                                            isIncluded ? "text-slate-700 dark:text-slate-300" : "text-slate-400 line-through"
                                        )}>
                                            {benefit.name}
                                        </span>
                                        <div className="shrink-0 ml-4">
                                            {isIncluded ? (
                                                <Check className="w-4 h-4 text-[#6366f1]" strokeWidth={2.5} />
                                            ) : (
                                                <X className="w-4 h-4 text-slate-300" strokeWidth={2.5} />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* What you get */}
                    <div>
                        <h3 className="font-bold text-[15px] mb-3 uppercase tracking-wide text-slate-500">What you get</h3>
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            {whyMustHave.map((item, index) => {
                                const isLast = index === whyMustHave.length - 1;
                                return (
                                    <div key={item.title} className={cn(
                                        "flex items-center gap-3 p-3.5 mx-2",
                                        !isLast && "border-b border-slate-100 dark:border-slate-800"
                                    )}>
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                            {item.icon}
                                        </div>
                                        <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
                                            {item.title}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>



                </div>

                {/* RIGHT: Plan Selection & Checkout */}
                <div className="space-y-6">
                    <div>
                        <h3 className="font-bold text-[15px] mb-3 uppercase tracking-wide text-slate-500">Select Duration</h3>
                        <div className="space-y-3">
                            {currentPlans.map((plan) => {
                                const isSelected = selectedDurationId === plan.id;
                                return (
                                    <div 
                                        key={plan.id}
                                        onClick={() => setSelectedDurationId(plan.id)}
                                        className={cn(
                                            "relative p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between",
                                            isSelected 
                                                ? "border-[#6366f1] bg-[#6366f1]/5 dark:bg-[#6366f1]/10" 
                                                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900"
                                        )}
                                    >
                                        {plan.bestseller && (
                                            <div className="absolute -top-2.5 left-4 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                Bestseller
                                            </div>
                                        )}
                                        {plan.discount && (
                                            <div className="absolute -top-2.5 right-4 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                {plan.discount}% OFF
                                            </div>
                                        )}
                                        
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                                                isSelected ? "border-[#6366f1]" : "border-slate-300"
                                            )}>
                                                {isSelected && <div className="w-2.5 h-2.5 bg-[#6366f1] rounded-full" />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{plan.name}</h4>
                                                <p className="text-[11px] font-medium text-slate-500">Valid for {plan.validity}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <span className="text-[11px] line-through text-slate-400 font-medium">₹{plan.originalPrice}</span>
                                                <span className="font-bold text-base text-slate-900 dark:text-white">₹{plan.price}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Native List Style Coupon */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                        {appliedCoupon ? (
                            <div className="flex items-center justify-between p-4 bg-emerald-50/50 dark:bg-emerald-900/10">
                                <div className="flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-emerald-600" />
                                    <p className="text-sm font-semibold text-emerald-700">Coupon "{appliedCoupon.code}" applied</p>
                                </div>
                                <button onClick={removeCoupon} className="text-xs font-bold text-slate-400 hover:text-slate-600">
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center p-2 pl-4">
                                <Input 
                                    placeholder="Enter Coupon Code" 
                                    className="h-10 border-none shadow-none focus-visible:ring-0 px-0 text-sm font-medium" 
                                    value={couponCode} 
                                    onChange={(e) => setCouponCode(e.target.value)}
                                />
                                <Button onClick={handleApplyCoupon} variant="ghost" className="text-[#6366f1] font-bold hover:text-[#4f46e5] hover:bg-transparent">
                                    Apply
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Native Table View Summary */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                        <h4 className="font-bold text-[15px] mb-3 text-slate-900 dark:text-white">Order Summary</h4>
                        <div className="space-y-3 text-[13px]">
                            <div className="flex justify-between text-slate-600 dark:text-slate-400 font-medium">
                                <span>{selectedPlan?.name}</span>
                                <span>₹{originalPrice}</span>
                            </div>
                            <div className="flex justify-between text-emerald-600 font-medium">
                                <span>Discount</span>
                                <span>- ₹{(originalPrice - price).toFixed(2)}</span>
                            </div>
                            {couponDiscount > 0 && (
                                <div className="flex justify-between text-emerald-600 font-medium">
                                    <span>Coupon Discount</span>
                                    <span>- ₹{couponDiscount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-slate-600 dark:text-slate-400 font-medium">
                                <span>Platform Fee</span>
                                <span>+ ₹{platformFee}</span>
                            </div>
                            <div className="flex justify-between text-slate-600 dark:text-slate-400 font-medium pb-3 border-b border-slate-100 dark:border-slate-800">
                                <span>GST (18%)</span>
                                <span>+ ₹{gst.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-1">
                                <span className="font-bold text-slate-900 dark:text-white">Total Amount</span>
                                <span className="font-bold text-lg text-slate-900 dark:text-white">₹{total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <Button 
                        onClick={handlePayment} 
                        disabled={isProcessingPayment} 
                        className="w-full h-12 rounded-xl text-[15px] font-bold bg-[#6366f1] hover:bg-[#4f46e5] text-white shadow-none"
                    >
                        {isProcessingPayment ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Processing...</> : 'Proceed to Pay'}
                    </Button>
                </div>

            </div>

            {/* Native Accordion FAQ - Single Panel */}
            <div className="mt-8">
                <h3 className="font-bold text-[15px] mb-3 uppercase tracking-wide text-slate-500">FAQ</h3>
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden px-4">
                    <Accordion type="single" collapsible className="w-full">
                        {faqData.map((faq, index) => (
                            <AccordionItem value={`item-${index}`} key={index} className="border-slate-100 dark:border-slate-800">
                                <AccordionTrigger className="text-left font-medium text-[13px] hover:no-underline py-4">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-[12px] text-slate-500 leading-relaxed pb-4">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </div>
    </div>
  );
}
