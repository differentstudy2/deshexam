"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from '@/components/ui/input';
import { Check, X, BookCopy, FileClock, CircleUser, Video, Repeat, Loader2, Tag, Star, BrainCircuit, Search, BarChart3, Rocket, FileText, ShieldCheck, Zap, Mail, Phone } from 'lucide-react';
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

// Monthly plans only — Basic ₹50, Plus ₹100, Pro ₹200 (owner decision 2026-11-20).
// The checkout total is exactly the plan price (minus any coupon); no
// platform fee, no GST markup.
export default function PricingClientPage() {
    const { toast } = useToast();
    const { user } = useAuth();
    const [selectedPlanId, setSelectedPlanId] = useState('plus');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [couponDiscount, setCouponDiscount] = useState(0);

    // The comparison table below links here as /pricing?plan=basic|plus|pro#plans.
    // Read the query on mount (client-only, no SSR dependency).
    useEffect(() => {
        const q = new URLSearchParams(window.location.search).get('plan');
        if (q && pricingData.plans.some((p) => p.id === q)) {
            setSelectedPlanId(q);
        }
    }, []);

    useEffect(() => {
        document.title = "প্রাইসিং | DeshExam";
    }, []);

    useEffect(() => {
        if(appliedCoupon) calculateCouponDiscount();
    }, [selectedPlanId, appliedCoupon]);

    const currentPlans = pricingData.plans;
    const selectedPlan = currentPlans.find(p => p.id === selectedPlanId);

    const price = selectedPlan ? selectedPlan.price : 0;
    const originalPrice = selectedPlan ? selectedPlan.originalPrice : 0;

    const total = Math.max(0, price - couponDiscount);

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
                description: `Purchase of ${selectedPlan.name} (monthly)`,
                order_id: order.id,
                handler: async function (response: any) {
                    toast({ title: 'Payment Successful!', description: `ID: ${response.razorpay_payment_id}` });
                },
                prefill: { name: user.displayName || 'Test User', email: user.email },
                theme: { color: '#d4af37' },
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Payment Error', description: 'Could not initialize payment.' });
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    const whyMustHave = [
        { icon: <BookCopy className="h-5 w-5 text-amber-400" />, title: "অধ্যায়ভিত্তিক MCQ অনুশীলন" },
        { icon: <FileClock className="h-5 w-5 text-amber-400" />, title: "আগের বছরের প্রশ্নপত্র" },
        { icon: <CircleUser className="h-5 w-5 text-amber-400" />, title: "প্রিমিয়াম প্র্যাকটিস প্রশ্ন" },
        { icon: <Video className="h-5 w-5 text-amber-400" />, title: "ডেইলি লাইভ টেস্ট ও র‍্যাঙ্কিং" },
        { icon: <Repeat className="h-5 w-5 text-amber-400" />, title: "আনলিমিটেড টেস্ট রি-অ্যাটেম্পট" }
    ];

    const whyUpgrade = [
        { title: 'আনলিমিটেড মক টেস্ট', desc: 'আনলিমিটেড মক টেস্ট, বিস্তারিত বিশ্লেষণ ও পারফরম্যান্স ট্র্যাকিং।', icon: <FileText className="h-5 w-5 text-amber-400" /> },
        { title: 'AI বিশ্লেষণ', desc: 'বিষয়ভিত্তিক বিশ্লেষণ ও আগের বছরের প্রশ্নপত্রের ধরন বুঝুন।', icon: <BrainCircuit className="h-5 w-5 text-amber-400" /> },
        { title: 'দুর্বল বিষয় শনাক্তকরণ', desc: 'কোন অধ্যায়ে দুর্বল, সেটা চিহ্নিত করে সেখানেই অনুশীলন করুন।', icon: <Search className="h-5 w-5 text-amber-400" /> },
        { title: 'র‍্যাঙ্ক অনুমান', desc: 'সহপাঠীদের সঙ্গে তুলনা করে নিজের অবস্থান দেখুন।', icon: <BarChart3 className="h-5 w-5 text-amber-400" /> },
        { title: 'আগের বছরের প্রশ্নপত্র', desc: 'আগের বছরের প্রশ্নপত্র ও ডেইলি লাইভ টেস্ট।', icon: <FileClock className="h-5 w-5 text-amber-400" /> },
        { title: 'স্মার্ট পরামর্শ', desc: 'কী উন্নত করতে হবে, তার স্মার্ট পরামর্শ পান।', icon: <Rocket className="h-5 w-5 text-amber-400" /> },
    ];

  return (
    <div className="w-full bg-[#040a16] font-body text-base text-slate-100">
        <Script id="razorpay-checkout-js" src="https://checkout.razorpay.com/v1/checkout.js" />

        {/* ============ HERO ============ */}
        <section className="section-dark-hero text-white">
            <div className="container mx-auto max-w-6xl px-4 py-12 md:py-20">
                <div className="flex flex-col items-center gap-10 md:flex-row md:justify-between">
                    <div className="flex-1 text-center md:text-left">
                        <p className="mb-3 inline-block rounded-full border border-amber-300/40 bg-white/10 px-3 py-1 text-xs font-bold tracking-wide text-amber-200">
                            ক্লাস ৫–১২ · WBBSE ও WBCHSE
                        </p>
                        <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
                            DeshExam প্রিমিয়াম প্ল্যান
                        </h1>
                        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-300 md:mx-0 md:text-lg">
                            মক টেস্ট, সাজেশন, নোট, ভিডিও ক্লাস ও ফলাফল বিশ্লেষণ — পশ্চিমবঙ্গ বোর্ডের সম্পূর্ণ প্রস্তুতি, এক জায়গায়।
                        </p>
                        <p className="mt-4 text-lg font-bold text-amber-300">
                            মাত্র ₹50/মাস থেকে শুরু
                        </p>

                        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                            {[
                                { icon: <ShieldCheck className="h-3.5 w-3.5" />, label: 'নিরাপদ পেমেন্ট' },
                                { icon: <Zap className="h-3.5 w-3.5" />, label: 'সঙ্গে সঙ্গে অ্যাক্সেস' },
                            ].map((chip) => (
                                <span key={chip.label} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 backdrop-blur-sm sm:text-sm">
                                    {chip.icon}
                                    {chip.label}
                                </span>
                            ))}
                        </div>

                        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center md:justify-start">
                            <Button
                                onClick={() => scrollTo('plans')}
                                className="min-h-[48px] rounded-full bg-amber-400 px-8 text-base font-bold text-[#042f2e] shadow-lg hover:bg-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200 focus-visible:outline-offset-2"
                            >
                                প্ল্যান বেছে নিন
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => scrollTo('compare')}
                                className="min-h-[48px] rounded-full border-white/20 bg-white/5 px-8 text-base font-bold text-white backdrop-blur-sm hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200 focus-visible:outline-offset-2"
                            >
                                তুলনা করুন
                            </Button>
                        </div>
                    </div>

                    {/* Starting-price glass card */}
                    <div className="w-full shrink-0 sm:w-auto">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 text-center shadow-2xl backdrop-blur-md sm:min-w-[260px]">
                            <span className="mb-1 block text-sm font-medium text-slate-300">শুরু মাত্র</span>
                            <div className="mb-1 text-5xl font-extrabold text-white">₹50</div>
                            <div className="mb-5 text-sm font-medium text-slate-300">/মাস</div>
                            <button
                                onClick={() => scrollTo('plans')}
                                className="flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-lg bg-amber-400 py-2.5 text-sm font-bold text-[#042f2e] shadow-sm transition-colors hover:bg-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200 focus-visible:outline-offset-2"
                            >
                                <Star className="h-4 w-4 fill-[#042f2e] text-[#042f2e]" />
                                সবচেয়ে জনপ্রিয় — Plus ₹100
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* ============ PLAN SELECTOR ============ */}
        <section id="plans" className="section-dark scroll-mt-20 py-12 md:py-16">
            <div className="container mx-auto max-w-6xl px-4">
                <p className="text-center text-sm font-bold tracking-wide text-amber-300">মাসিক প্ল্যান</p>
                <h2 className="mt-2 text-center text-2xl font-extrabold text-white md:text-4xl">প্ল্যান বেছে নিন</h2>
                <p className="mx-auto mt-3 max-w-xl text-center text-base text-slate-300">
                    তিনটি মাসিক প্ল্যান — প্রতি মাসে নবায়ন হয়। দাম ও সুবিধা দেখে বেছে নিন।
                </p>

                <div
                    role="radiogroup"
                    aria-label="প্ল্যান বেছে নিন"
                    className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3 md:items-start"
                >
                    {currentPlans.map((plan) => {
                        const isSelected = selectedPlanId === plan.id;
                        const isPopular = plan.bestseller;
                        return (
                            <div
                                key={plan.id}
                                role="radio"
                                aria-checked={isSelected}
                                tabIndex={0}
                                onClick={() => setSelectedPlanId(plan.id)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setSelectedPlanId(plan.id);
                                    }
                                }}
                                className={cn(
                                    "relative cursor-pointer rounded-2xl border p-6 pt-8 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400 focus-visible:outline-offset-2",
                                    isPopular
                                        ? "border-2 border-amber-400 bg-white/[0.06] shadow-[0_20px_60px_rgba(212,175,55,0.15)] md:-translate-y-2"
                                        : "border-white/10 bg-white/[0.04] hover:border-white/25",
                                    isSelected && !isPopular && "border-emerald-400 bg-white/[0.06]",
                                    isSelected && isPopular && "ring-2 ring-amber-300/60"
                                )}
                            >
                                {isPopular && (
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-[#042f2e]">
                                        সবচেয়ে জনপ্রিয়
                                    </span>
                                )}
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="text-xl font-extrabold text-white">{plan.name}</h3>
                                        <p className="mt-1 text-sm text-slate-400">মেয়াদ {plan.validity} · প্রতি মাসে নবায়ন হয়</p>
                                    </div>
                                    <span
                                        aria-hidden="true"
                                        className={cn(
                                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                                            isSelected ? "border-amber-400 bg-amber-400" : "border-slate-500 bg-transparent"
                                        )}
                                    >
                                        {isSelected && <Check className="h-4 w-4 text-[#042f2e]" strokeWidth={3} />}
                                    </span>
                                </div>

                                <p className="mt-5 flex items-baseline gap-2">
                                    <span className="text-sm text-slate-400 line-through">₹{plan.originalPrice}</span>
                                    <span className="text-5xl font-extrabold text-white">₹{plan.price}</span>
                                    <span className="text-sm font-semibold text-slate-400">/মাস</span>
                                </p>
                                {plan.discount ? (
                                    <p className="mt-1 text-sm font-bold text-emerald-400">{plan.discount}% ছাড়</p>
                                ) : null}

                                <ul className="mt-6 space-y-2.5 border-t border-white/10 pt-5">
                                    {pricingData.benefits.map((benefit) => {
                                        const included = benefit[plan.id as keyof typeof benefit] === true;
                                        return (
                                            <li key={benefit.id} className="flex items-start gap-2 text-base">
                                                {included ? (
                                                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" strokeWidth={2.5} aria-hidden="true" />
                                                ) : (
                                                    <X className="mt-0.5 h-5 w-5 shrink-0 text-slate-600" strokeWidth={2.5} aria-hidden="true" />
                                                )}
                                                <span className={included ? "text-slate-200" : "text-slate-500 line-through"}>{benefit.name}</span>
                                            </li>
                                        );
                                    })}
                                </ul>

                                <p
                                    className={cn(
                                        "mt-6 flex min-h-[48px] items-center justify-center rounded-full text-base font-bold transition-colors",
                                        isSelected
                                            ? "bg-amber-400 text-[#042f2e]"
                                            : "bg-white/[0.07] text-white hover:bg-white/[0.12]"
                                    )}
                                >
                                    {isSelected ? "✓ নির্বাচিত" : "বেছে নিন"}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>

        {/* ============ FEATURES + STICKY ORDER SUMMARY ============ */}
        <section className="section-dark-blue py-12 md:py-16">
            <div className="container mx-auto max-w-6xl px-4">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px] lg:gap-12">

                    {/* LEFT: features included + what you get */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">
                                {selectedPlan?.name} প্ল্যানে যা যা পাবেন
                            </h3>
                            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
                                {pricingData.benefits.map((benefit, index) => {
                                    const isIncluded = benefit[selectedPlanId as keyof typeof benefit] === true;
                                    const isLast = index === pricingData.benefits.length - 1;
                                    return (
                                        <div
                                            key={benefit.id}
                                            className={cn(
                                                "mx-2 flex items-center justify-between p-3.5",
                                                !isLast && "border-b border-white/5"
                                            )}
                                        >
                                            <span className={cn(
                                                "text-sm font-medium leading-tight",
                                                isIncluded ? "text-slate-200" : "text-slate-500 line-through"
                                            )}>
                                                {benefit.name}
                                            </span>
                                            {isIncluded ? (
                                                <Check className="h-4 w-4 shrink-0 text-emerald-400" strokeWidth={2.5} aria-hidden="true" />
                                            ) : (
                                                <X className="h-4 w-4 shrink-0 text-slate-600" strokeWidth={2.5} aria-hidden="true" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">আরও যা পাবেন</h3>
                            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
                                {whyMustHave.map((item, index) => {
                                    const isLast = index === whyMustHave.length - 1;
                                    return (
                                        <div
                                            key={item.title}
                                            className={cn(
                                                "mx-2 flex items-center gap-3 p-3.5",
                                                !isLast && "border-b border-white/5"
                                            )}
                                        >
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.07]">
                                                {item.icon}
                                            </div>
                                            <span className="text-sm font-medium text-slate-200">{item.title}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: sticky order summary */}
                    <div className="lg:sticky lg:top-24 lg:self-start">
                        <div className="space-y-6">
                            {/* Coupon */}
                            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
                                {appliedCoupon ? (
                                    <div className="flex min-h-[56px] items-center justify-between gap-3 bg-emerald-500/10 p-4">
                                        <div className="flex items-center gap-2">
                                            <Tag className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                                            <p className="text-sm font-semibold text-emerald-300">Coupon &ldquo;{appliedCoupon.code}&rdquo; applied</p>
                                        </div>
                                        <button
                                            onClick={removeCoupon}
                                            className="min-h-[44px] px-2 text-xs font-bold text-slate-400 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 p-2 pl-4">
                                        <Input
                                            placeholder="কুপন কোড লিখুন"
                                            aria-label="কুপন কোড"
                                            className="h-11 border-none bg-transparent px-0 text-sm font-medium text-white placeholder:text-slate-500 shadow-none focus-visible:ring-2 focus-visible:ring-amber-400"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                        />
                                        <Button
                                            onClick={handleApplyCoupon}
                                            variant="ghost"
                                            className="min-h-[44px] font-bold text-amber-300 hover:bg-white/5 hover:text-amber-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
                                        >
                                            Apply
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Order summary */}
                            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 shadow-xl backdrop-blur-md">
                                <h3 className="mb-4 text-base font-bold text-white">Order Summary</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between font-medium text-slate-300">
                                        <span>{selectedPlan?.name} (১ মাস)</span>
                                        <span>₹{originalPrice}</span>
                                    </div>
                                    <div className="flex justify-between font-medium text-emerald-400">
                                        <span>ছাড়</span>
                                        <span>- ₹{(originalPrice - price).toFixed(2)}</span>
                                    </div>
                                    {couponDiscount > 0 && (
                                        <div className="flex justify-between font-medium text-emerald-400">
                                            <span>কুপন ছাড়</span>
                                            <span>- ₹{couponDiscount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between border-t border-white/10 pt-3">
                                        <span className="font-bold text-white">মোট দাম</span>
                                        <span className="text-xl font-extrabold text-amber-300">₹{total.toFixed(2)}</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={handlePayment}
                                    disabled={isProcessingPayment}
                                    className="mt-5 h-12 w-full rounded-full bg-amber-400 text-base font-bold text-[#042f2e] shadow-lg transition-colors hover:bg-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200 focus-visible:outline-offset-2 disabled:opacity-60"
                                >
                                    {isProcessingPayment ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> Processing...</> : 'পেমেন্ট করুন'}
                                </Button>
                                <p className="mt-3 text-center text-xs leading-relaxed text-slate-400">
                                    UPI · কার্ড · নেট ব্যাংকিং — পেমেন্টের আগে প্ল্যান, দাম ও মেয়াদ দেখে নিন।
                                </p>
                                <div className="mt-3 flex items-center justify-center gap-1.5 opacity-80">
                                    <span className="text-xs font-semibold text-slate-400">Secured by</span>
                                    <span className="text-xs font-extrabold tracking-tight text-white">Razorpay</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>

        {/* ============ WHY UPGRADE ============ */}
        <section className="section-dark-teal py-12 md:py-16">
            <div className="container mx-auto max-w-6xl px-4">
                <h2 className="text-center text-2xl font-extrabold text-white md:text-4xl">কেন প্রিমিয়াম নেবেন?</h2>
                <p className="mx-auto mt-3 max-w-xl text-center text-base text-slate-300">
                    পরীক্ষার প্রস্তুতির জন্য যা যা দরকার — একটাই প্ল্যানে।
                </p>
                <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
                    {whyUpgrade.map((feature) => (
                        <div key={feature.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.07]">
                                {feature.icon}
                            </div>
                            <h3 className="mb-2 text-base font-bold text-white">{feature.title}</h3>
                            <p className="text-sm leading-relaxed text-slate-300">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* ============ FAQ ============ */}
        <section className="section-dark py-12 md:py-16">
            <div className="container mx-auto max-w-4xl px-4">
                <p className="text-center text-sm font-bold tracking-wide text-amber-300">জিজ্ঞাসা</p>
                <h2 className="mt-2 text-center text-2xl font-extrabold text-white md:text-4xl">সচরাচর জিজ্ঞাসা</h2>
                <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] px-4">
                    <Accordion type="single" collapsible className="w-full">
                        {faqData.map((faq, index) => (
                            <AccordionItem value={`item-${index}`} key={index} className="border-white/10">
                                <AccordionTrigger className="min-h-[48px] py-4 text-left text-base font-semibold text-white hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="pb-4 text-sm leading-relaxed text-slate-300">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>

        {/* ============ ABOUT THE PLANS (honest, Bengali) ============ */}
        <section className="section-dark-blue py-12 md:py-16">
            <div className="container mx-auto max-w-4xl px-4 text-slate-300">
                <h2 className="text-2xl font-extrabold text-white md:text-3xl">কেন DeshExam?</h2>
                <p className="mt-4 leading-relaxed">
                    DeshExam পশ্চিমবঙ্গ বোর্ডের ছাত্রছাত্রীদের জন্য তৈরি — ক্লাস ৫–১২, WBBSE (মাধ্যমিক) ও WBCHSE (উচ্চমাধ্যমিক)। অধ্যায়ভিত্তিক MCQ, আগের বছরের প্রশ্নপত্র, মক টেস্ট, নোট ও ভিডিও ক্লাস — সব এক জায়গায়, যাতে পরীক্ষার প্রস্তুতি গোছানোভাবে করা যায়।
                </p>
                <p className="mt-4 leading-relaxed">
                    প্রিমিয়াম প্ল্যানে নিজের দুর্বল অধ্যায় খুঁজে বের করে সেখানেই অনুশীলন করা যায়, আর ফলাফল বিশ্লেষণ দেখে বোঝা যায় কোথায় উন্নতি দরকার। <Link href="/features" className="font-semibold text-amber-300 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400">সব প্রিমিয়াম সুবিধা দেখুন</Link>।
                </p>

                <h2 className="mt-10 text-2xl font-extrabold text-white md:text-3xl">কার জন্য এই প্ল্যান?</h2>
                <p className="mt-4 leading-relaxed">
                    এই প্ল্যান পশ্চিমবঙ্গ বোর্ডের ছাত্রছাত্রীদের জন্য — ক্লাস ৫–১২:
                </p>
                <ul className="mt-4 list-disc space-y-3 pl-6">
                    <li><strong className="text-white">স্কুল ও বোর্ডের ছাত্রছাত্রী:</strong> বোর্ডের সিলেবাস অনুযায়ী <Link href="/mock-tests" className="font-semibold text-amber-300 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400">ফ্রি মক টেস্ট</Link> দিয়ে শুরু করে প্রিমিয়ামে পুরো প্রস্তুতি নিতে পারবেন।</li>
                    <li><strong className="text-white">অভিভাবক:</strong> সন্তানের অগ্রগতি দেখতে পারবেন — কোন অধ্যায়ে ভালো, কোথায় আরও অনুশীলন দরকার।</li>
                </ul>
                <p className="mt-6 leading-relaxed">
                    পেমেন্ট, অ্যাক্সেস বা সুবিধা নিয়ে কোনো প্রশ্ন থাকলে <Link href="/faqs" className="font-semibold text-amber-300 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400">বিস্তারিত FAQ দেখুন</Link> অথবা <Link href="/contact" className="font-semibold text-amber-300 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400">যোগাযোগ করুন</Link>।
                </p>
            </div>
        </section>

        {/* ============ FINAL CTA + REASSURANCE ============ */}
        <section className="section-dark-hero py-12 text-white md:py-16">
            <div className="container mx-auto max-w-6xl px-4 text-center">
                <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
                    আজই প্রিমিয়াম শুরু করুন
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-base text-slate-300 sm:text-lg">
                    মাত্র ₹50/মাস থেকে — মক টেস্ট, নোট ও ভিডিও ক্লাস, এক জায়গায়।
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Button
                        onClick={() => scrollTo('plans')}
                        className="min-h-[48px] rounded-full bg-amber-400 px-8 text-base font-bold text-[#042f2e] shadow-lg hover:bg-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200 focus-visible:outline-offset-2"
                    >
                        এখনই কিনুন
                    </Button>
                    <Link
                        href="/contact"
                        className="flex min-h-[48px] items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 text-base font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200 focus-visible:outline-offset-2"
                    >
                        সাপোর্টের সঙ্গে কথা বলুন
                    </Link>
                </div>
                <div className="mx-auto mt-10 flex max-w-2xl flex-col items-center justify-center gap-3 border-t border-white/10 pt-6 text-sm text-slate-300 sm:flex-row sm:gap-6">
                    <span>ডিজিটাল কনটেন্ট কেনার পর অ্যাক্সেস পেলে সাধারণত রিফান্ড হয় না — <Link href="/refund-policy" className="font-semibold text-amber-300 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400">Refund Policy</Link></span>
                    <span className="flex items-center gap-1.5">
                        <Mail className="h-4 w-4 text-amber-300" aria-hidden="true" />
                        <a href="mailto:support@deshexam.com" className="font-semibold text-amber-300 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400">support@deshexam.com</a>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Phone className="h-4 w-4 text-amber-300" aria-hidden="true" />
                        <a href="tel:+916294006590" className="font-semibold text-amber-300 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400">+91 62940 06590</a>
                    </span>
                </div>
            </div>
        </section>

    </div>
  );
}
