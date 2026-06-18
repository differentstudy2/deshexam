"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from '@/components/ui/input';
import { Check, X, BookCopy, FileClock, CircleUser, Video, Repeat, Loader2, Tag, ChevronRight, Flame, Star, BrainCircuit, Search, BarChart3, Rocket, FileText, Users } from 'lucide-react';
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
    
    // Countdown Timer State (12h 45m 32s = 45932 seconds)
    const [timeLeft, setTimeLeft] = useState(45932);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;

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
            
            {/* NEW HEADER SECTION */}
            <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700 text-white shadow-xl mb-12 border border-indigo-500/30">
                {/* Background Glows */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan-500/20 rounded-full blur-[80px] translate-y-1/2 pointer-events-none"></div>
                <div className="absolute top-1/2 right-0 w-96 h-96 bg-indigo-500/30 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/2 pointer-events-none"></div>

                <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-12 flex flex-col md:flex-row items-center justify-between gap-10">
                    {/* Left Content */}
                    <div className="flex-1 flex flex-col items-center text-center md:items-start md:text-left">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm font-medium mb-6 backdrop-blur-md">
                            <Flame className="w-4 h-4 text-orange-400" />
                            <span>Limited Time Offer</span>
                        </div>
                        
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 leading-tight tracking-tight">
                            Unlock Premium Learning <br className="hidden md:block" /> with DeshExam Pass Pro
                        </h1>
                        
                        <p className="text-indigo-100 text-base sm:text-lg mb-8 max-w-xl leading-relaxed">
                            Get unlimited mock tests, AI analytics, previous year papers, premium practice sets, and advanced performance tracking.
                        </p>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 mb-8">
                            {['50K+ Students', '70K+ Mock Tests', 'Secure Payments', 'Instant Access'].map((feat, i) => (
                                <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm text-indigo-50 backdrop-blur-sm">
                                    <Check className="w-3.5 h-3.5" />
                                    <span>{feat}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <Button className="bg-white text-indigo-900 hover:bg-slate-50 font-bold h-12 px-8 rounded-lg shadow-lg">
                                Buy Pass Pro
                            </Button>
                            <Button variant="outline" className="bg-white/5 border-white/20 hover:bg-white/10 text-white font-bold h-12 px-8 rounded-lg backdrop-blur-sm">
                                Compare Plans
                            </Button>
                        </div>
                    </div>

                    {/* Right Glass Card */}
                    <div className="shrink-0 w-full sm:w-auto">
                        <div className="relative p-[1.5px] rounded-2xl bg-gradient-to-b from-white/40 to-white/5 shadow-2xl backdrop-blur-md">
                            <div className="absolute inset-0 bg-cyan-400/20 blur-[50px] -z-10 rounded-2xl"></div>
                            <div className="bg-white/10 border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center min-w-[240px] backdrop-blur-xl">
                                <span className="text-indigo-100 text-sm font-medium mb-1">Starting from</span>
                                <div className="text-5xl font-extrabold text-white mb-3">₹599</div>
                                <div className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-5 shadow-sm">
                                    Save 64%
                                </div>
                                <button className="w-full py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 text-sm font-bold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors">
                                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                    Bestseller
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <h2 className="text-2xl font-bold">Choose a Plan</h2>
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
                        className="w-full h-12 rounded-[4px] text-[15px] font-bold bg-[#6064f4] hover:bg-[#4f53ec] text-white shadow-none transition-all"
                    >
                        {isProcessingPayment ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Processing...</> : 'Proceed to Pay'}
                    </Button>
                    <div className="flex items-center justify-center gap-1.5 mt-3 opacity-70">
                        <span className="text-xs font-semibold text-slate-500">Secured by</span>
                        <span className="text-xs font-extrabold text-[#02042B] dark:text-white tracking-tight">Razorpay</span>
                    </div>
                </div>

            </div>

            {/* Why Upgrade to Premium */}
            <div className="mt-16 mb-8">
                <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-8">Why Upgrade to Premium?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { title: 'Unlimited Mock Tests', desc: 'Unlimited Mock tests, in-depth analytics and advanced performance tracking.', icon: <FileText className="w-5 h-5 text-[#6366f1]" /> },
                        { title: 'AI Insights', desc: 'AI Insights generate topic by topic analytics and previous year paper costs.', icon: <BrainCircuit className="w-5 h-5 text-[#6366f1]" /> },
                        { title: 'Weak Topic Detection', desc: 'Weak topic detectors in context, recognize weak topic elimination.', icon: <Search className="w-5 h-5 text-[#6366f1]" /> },
                        { title: 'Rank Prediction', desc: 'Rank Prediction compares with peers to focus on speed analytics.', icon: <BarChart3 className="w-5 h-5 text-[#6366f1]" /> },
                        { title: 'Previous Year Papers', desc: 'Previous Year Papers combining including daily live Tests.', icon: <FileClock className="w-5 h-5 text-[#6366f1]" /> },
                        { title: 'Smart Recommendations', desc: 'Smart recommendations on what to enhance and communications.', icon: <Rocket className="w-5 h-5 text-[#6366f1]" /> },
                    ].map((feature, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-indigo-50 dark:border-slate-800">
                            <div className="mb-3 w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                                {feature.icon}
                            </div>
                            <h3 className="font-bold text-[15px] text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                            <p className="text-[13px] text-slate-500 leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* LIMITED OFFER BANNER */}
            <div className="mt-12 mb-8">
                <div className="text-center mb-3">
                    <span className="text-sm font-bold tracking-widest text-slate-900 dark:text-white uppercase">Limited Offer</span>
                </div>
                <div className="bg-gradient-to-r from-red-700 via-red-600 to-orange-500 rounded-2xl p-8 text-center shadow-lg shadow-red-500/20 text-white relative overflow-hidden">
                    {/* Glossy overlay effect */}
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10 rounded-t-2xl pointer-events-none"></div>
                    
                    <h3 className="text-xl sm:text-2xl font-bold mb-2 relative z-10">Offer Ending Soon</h3>
                    <div className="text-4xl sm:text-5xl font-extrabold tracking-wider mb-3 drop-shadow-md font-mono relative z-10">
                        {hours}h {minutes.toString().padStart(2, '0')}m {seconds.toString().padStart(2, '0')}s
                    </div>
                    <p className="text-red-50 text-sm sm:text-base font-medium relative z-10">Lock in your discount before prices increase.</p>
                </div>
            </div>

            {/* STUDENT SUCCESS */}
            <div className="mt-16 mb-12">
                <div className="text-center mb-10">
                    <span className="text-sm font-bold tracking-widest text-slate-500 uppercase">Student Success</span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">Trusted by Thousands of Students</h2>
                </div>
                
                {/* Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                        <Users className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                        <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">50K+</div>
                        <div className="text-sm text-slate-500 font-medium">Students</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1 mt-2">70K+</div>
                        <div className="text-sm text-slate-500 font-medium">Tests Attempted Daily</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1 mt-2">4.8/5</div>
                        <div className="text-sm text-slate-500 font-medium">Average Rating</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-3xl font-bold text-amber-500 mb-1 mt-2">92%</div>
                        <div className="text-sm text-slate-500 font-medium">Improved Scores</div>
                    </div>
                </div>

                {/* Testimonials */}
                <div className="relative">
                    <div className="flex gap-4 overflow-hidden">
                        {[
                            { name: 'Rahul Sharma', role: 'Premium Review', img: 'https://i.pravatar.cc/150?u=1' },
                            { name: 'Priya Patel', role: 'Premium Rating', img: 'https://i.pravatar.cc/150?u=2' },
                            { name: 'Amit Kumar', role: 'Premium Review', img: 'https://i.pravatar.cc/150?u=3' },
                            { name: 'Sneha Singh', role: 'Premium Review', img: 'https://i.pravatar.cc/150?u=4' },
                        ].map((user, idx) => (
                            <div key={idx} className="flex-1 min-w-[200px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                                <img src={user.img} alt={user.name} className="w-16 h-16 rounded-full mx-auto mb-4 border-2 border-indigo-50 dark:border-slate-800" />
                                <h4 className="font-bold text-slate-900 dark:text-white mb-1">{user.name}</h4>
                                <p className="text-xs text-slate-500 mb-3">{user.role}</p>
                                <div className="flex justify-center gap-1">
                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Carousel Arrow */}
                    <button className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/3 w-10 h-10 bg-white border border-slate-200 rounded-full shadow-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hidden md:flex">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                    {/* Pagination dots */}
                    <div className="flex justify-center gap-2 mt-6">
                        <div className="w-4 h-1.5 rounded-full bg-slate-800 dark:bg-slate-200"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                    </div>
                </div>
            </div>

            {/* Native Accordion FAQ - Single Panel */}
            <div className="mt-12">
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

            {/* SEO Content Section */}
            <div className="mt-16 mb-12 text-left bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 space-y-8 prose dark:prose-invert max-w-none">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Why Choose DeshExam for Your Exam Preparation?</h2>
                    <p className="mb-4 leading-relaxed">
                        When you are preparing for highly competitive exams, every single mark counts. The difference between success and failure often comes down to the quality of your practice. That is exactly why thousands of students trust DeshExam. We don't just provide questions; we provide a comprehensive ecosystem designed to identify your weaknesses and transform them into strengths. By leveraging advanced AI analytics and a massive repository of over 70,000+ meticulously curated mock tests, we ensure that you are always exam-ready. <a href="/features" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Explore all premium features</a> to see exactly how our platform can revolutionize your learning journey.
                    </p>
                    <p className="mb-6 leading-relaxed">
                        Our platform is built by top educators and industry experts who understand the exact patterns, difficulty levels, and nuances of various state and national level examinations. From real-time ranking to detailed solutions, we simulate the actual exam environment so that on the final day, you experience zero surprises. 
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 mt-10">The Power of Premium Learning</h2>
                    <p className="mb-4 leading-relaxed">
                        While basic practice is good, premium structured learning is essential for guaranteed success. Upgrading to our premium subscription unlocks a suite of elite tools. You gain unrestricted access to our extensive <a href="/question-bank" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Question Bank</a>, allowing you to practice specific topics endlessly. 
                    </p>
                    <p className="mb-6 leading-relaxed">
                        Furthermore, the premium tier activates our proprietary AI insights engine. This engine doesn't just tell you that you scored 75%; it tells you *why* you lost 25%. It pinpoints exact sub-topics where you spent too much time or made conceptual errors. You can even generate custom practice sets targeting specifically those weak areas. It's like having a personalized digital tutor available 24/7.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 mt-10">Who Should Buy Pass Pro?</h2>
                    <p className="mb-4 leading-relaxed">
                        Our platform is engineered to be highly adaptable, making it the perfect companion for various demographics:
                    </p>
                    <ul className="list-disc pl-6 space-y-3 mb-6">
                        <li><strong>School & Board Students:</strong> Build a fundamentally strong base. <a href="/mock-tests" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Practice free mock tests</a> designed strictly according to the latest NCERT and state board syllabi.</li>
                        <li><strong>Competitive Exam Aspirants:</strong> Whether you're targeting JEE, NEET, SSC, Banking, or State PSCs, time management and accuracy are your biggest hurdles. Pass Pro gives you the real-time competitive analytics needed to outpace peers.</li>
                        <li><strong>Parents:</strong> Track your child's exact progress through our intuitive parental dashboard. Stop guessing and start seeing tangible performance metrics.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 mt-10">Why DeshExam Pass Pro is the Ultimate Choice</h2>
                    <p className="mb-4 leading-relaxed">
                        You might wonder, why specifically choose the Pass Pro over standard plans or competing platforms? The answer lies in the sheer volume and quality of content combined with cutting-edge technology. With a single subscription, you eliminate the need to buy dozens of expensive physical test series books. You get instant updates whenever an exam pattern changes. You get video solutions for complex problems.
                    </p>
                    <p className="mb-4 leading-relaxed">
                        We are continuously adding new exams and updating our <a href="/exams" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">exams library</a> to ensure you are never left behind. Don't leave your career to chance. If you still have questions about billing, access, or features, please <a href="/faq" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">see detailed FAQ</a>. Make the smart choice today and join the ranks of toppers who trusted DeshExam.
                    </p>
                </div>
            </div>

            {/* FINAL CTA */}

            <div className="mt-16 mb-8 text-center">
                <div className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-4">FINAL CTA</div>
                <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-600 text-white shadow-xl">
                    {/* Glowing orbs */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-400/40 rounded-full blur-[60px] -translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-400/40 rounded-full blur-[60px] translate-x-1/4 translate-y-1/4 pointer-events-none"></div>
                    
                    <div className="relative z-10 px-6 py-16 sm:py-20 flex flex-col items-center text-center">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                            Start Your Premium Learning <br className="hidden md:block"/> Journey Today
                        </h2>
                        <p className="text-indigo-50 text-base sm:text-lg mb-8 max-w-xl">
                            Join thousands of students preparing smarter with DeshExam
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <Button className="bg-white text-indigo-900 hover:bg-slate-50 font-bold h-12 px-8 rounded-lg shadow-lg">
                                Buy Now
                            </Button>
                            <Button variant="outline" className="bg-white/10 border-white/30 hover:bg-white/20 text-white font-bold h-12 px-8 rounded-lg backdrop-blur-sm">
                                Contact Support
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
  );
}
