"use client";

import Link from 'next/link';
import { 
    Search, Check, Folder, Globe, Copy, Printer, Calendar, Clock, Eye, User, 
    ThumbsUp, ThumbsDown, Mail, HelpCircle, List 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import { getFaqBySlugOrId, getFaqs, getCategories, getTags, updateFaq } from '@/features/faqs/services/faq.api';
import { FAQ, FAQCategory } from '@/features/faqs/types/faq.types';
import { Loader2 } from 'lucide-react';







export default function SingleFAQPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [faq, setFaq] = useState<FAQ | null>(null);
    const [categoriesData, setCategoriesData] = useState<FAQCategory[]>([]);
    const [relatedFaqsList, setRelatedFaqsList] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);

    useEffect(() => {
        if (!id) return;
        const loadData = async () => {
            try {
                const fetchedFaq = await getFaqBySlugOrId(id as string);
                if (!fetchedFaq) {
                    router.push('/faq');
                    return;
                }
                setFaq(fetchedFaq);
                
                const fetchedCategories = await getCategories();
                setCategoriesData(fetchedCategories);

                const allFaqs = await getFaqs();
                setRelatedFaqsList(allFaqs.filter(f => f.categoryId === fetchedFaq.categoryId && f.id !== fetchedFaq.id).slice(0, 4));
            } catch (err) {
                router.push('/faq');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id, router]);

    if (loading || !faq) {
        return <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]"><Loader2 className="w-8 h-8 animate-spin text-[#0ea5e9]" /></div>;
    }

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleVote = async (type: 'yes' | 'no') => {
        if (!faq || hasVoted) return;
        setHasVoted(true);
        
        try {
            const currentHelpful = faq.helpfulVotes || 0;
            const currentUnhelpful = faq.unhelpfulVotes || 0;
            
            const updates = {
                helpfulVotes: type === 'yes' ? currentHelpful + 1 : currentHelpful,
                unhelpfulVotes: type === 'no' ? currentUnhelpful + 1 : currentUnhelpful
            };
            
            setFaq({ ...faq, ...updates });
            await updateFaq(faq.id, updates);
        } catch (error) {
            console.error("Failed to vote:", error);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] font-sans">
            
            {/* Top Bar / Breadcrumb */}
            <div className="bg-white border-b border-slate-200">
                <div className="container mx-auto px-4 h-14 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="font-bold text-slate-800 text-[15px]">FAQ</div>
                        <div className="w-[1px] h-4 bg-slate-200 hidden sm:block"></div>
                        <div className="text-slate-500 font-medium text-[13px] hidden sm:block">
                            <Link href="/" className="hover:text-slate-800">Home</Link> <span className="mx-1.5 text-slate-300">›</span> 
                            <Link href="/faq" className="hover:text-slate-800">FAQ</Link> <span className="mx-1.5 text-slate-300">›</span> 
                            <span className="text-slate-800 font-semibold truncate max-w-[200px] sm:max-w-[300px] inline-block align-bottom">{faq.question.substring(0, 20)}...</span>
                        </div>
                    </div>
                    <div>
                        <Link href="/faq" className="inline-flex items-center justify-center px-5 py-1.5 bg-green-100 hover:bg-green-200 text-green-800 text-[13px] font-bold rounded transition-colors">
                            Back
                        </Link>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-6">
                    
                    {/* Main Content Area */}
                    <div className="flex-1 min-w-0 space-y-8">
                        
                        {/* FAQ Detailed Card */}
                        <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8">
                            
                            {/* Title & Meta */}
                            <h1 className="text-3xl sm:text-[34px] font-medium text-slate-800 mb-5 leading-tight break-words">
                                {faq.question}
                            </h1>
                            
                            <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-[#737373] text-[14px] font-medium mb-8 pb-6 border-b border-slate-100">
                                <div className="flex items-center gap-2.5">
                                    <img src="https://picsum.photos/seed/raju/32/32" alt="Author" className="w-6 h-6 rounded-full mb-0" />
                                    <span>Author: Najjar Hossain Raju</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-[18px] h-[18px]" />
                                    <span>Published: {faq.createdAt ? (typeof (faq.createdAt as any).toDate === 'function' ? (faq.createdAt as any).toDate().toLocaleDateString() : new Date(faq.createdAt as any).toLocaleDateString()) : 'Recent'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-[18px] h-[18px]" />
                                    <span>Updated: {faq.updatedAt ? (typeof (faq.updatedAt as any).toDate === 'function' ? (faq.updatedAt as any).toDate().toLocaleDateString() : new Date(faq.updatedAt as any).toLocaleDateString()) : 'Recent'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Eye className="w-[18px] h-[18px]" />
                                    <span>Views: {faq.views || 0}</span>
                                </div>
                            </div>

                            {/* Answer Box */}
                            <div className="mt-4">
                                {/* Tab */}
                                <div className="inline-flex items-center gap-1.5 border border-slate-200 border-b-transparent bg-white px-5 py-2.5 rounded-t-md relative top-[1px] z-10 text-sm font-semibold text-slate-600">
                                    <Globe className="w-4 h-4 text-slate-500" /> Information
                                </div>
                                {/* Content Box */}
                                <div className="bg-[#f8f9fa] border border-slate-200 rounded-b-md rounded-tr-md p-5 sm:p-6 mb-6">
                                    <p className="text-[15px] text-slate-800 leading-relaxed font-medium whitespace-pre-wrap">
                                        {faq.answer}
                                    </p>
                                </div>
                                {/* Action Buttons */}
                                <div className="flex justify-end gap-3">
                                    <button onClick={handleCopyLink} className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded transition-colors">
                                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? 'Copied!' : 'Copy Link'}
                                    </button>
                                    <button onClick={handlePrint} className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-bold rounded transition-colors">
                                        <Printer className="w-4 h-4" /> Print
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Related FAQs Section */}
                        <div>
                            <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold text-[17px]">
                                <HelpCircle className="w-5 h-5 text-slate-400" /> Related FAQs
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {relatedFaqsList.map((faq, idx) => (
                                    <div key={idx} className="bg-white border border-slate-200 rounded-lg p-5 hover:border-slate-300 transition-colors cursor-pointer flex flex-col h-full">
                                        <h3 className="font-bold text-slate-800 text-[14px] leading-snug mb-2">
                                            {faq.question}
                                        </h3>
                                        <p className="text-[12px] text-slate-500 leading-relaxed mb-4 flex-1">
                                            {faq.answer}
                                        </p>
                                        <div className="mt-auto">
                                            <span className="inline-block border border-slate-200 bg-white text-slate-600 px-3 py-1 rounded text-[11px] font-bold">
                                                {(categoriesData.find(c => c.id === faq.categoryId)?.name || 'General')}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                    </div>

                    {/* Right Sidebar Widgets */}
                    <div className="w-full lg:w-[320px] lg:max-w-[320px] shrink-0 space-y-5">
                        
                        {/* Categories Widget */}
                        <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
                            <div className="bg-slate-900 px-4 py-3 text-white font-bold text-sm flex items-center gap-2">
                                <List className="w-4 h-4" /> Categories
                            </div>
                            <div className="flex flex-col text-[13px] font-medium p-2">
                                {[{id: 'all', name: 'All FAQs'}, ...categoriesData].map((cat, index, arr) => {
                                    const linkHref = "/faq?category=" + cat.id;
                                    return (
                                        <Link 
                                            key={cat.id}
                                            href={linkHref}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-slate-50 text-slate-600 rounded",
                                                index !== arr.length - 1 && "border-b border-slate-100"
                                            )}
                                        >
                                            <Folder className="w-4 h-4" />
                                            {cat.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Statistics Widget */}
                        <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
                            <div className="bg-slate-900 px-4 py-3 text-white font-bold text-sm flex items-center gap-2">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                                Statistics
                            </div>
                            <div className="p-6 flex items-center justify-between text-center divide-x divide-slate-100">
                                <div className="flex-1">
                                    <div className="text-2xl font-bold text-blue-500 mb-1">{faq.views || 0}</div>
                                    <div className="text-[12px] font-bold text-slate-400 uppercase tracking-wide">Views</div>
                                </div>
                                <div className="flex-1">
                                    <div className="text-2xl font-bold text-emerald-500 mb-1">{faq.helpfulVotes || 0}</div>
                                    <div className="text-[12px] font-bold text-slate-400 uppercase tracking-wide">Helpful Votes</div>
                                </div>
                            </div>
                        </div>

                        {/* Helpful Widget */}
                        <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
                            <div className="bg-slate-900 px-4 py-3 text-white font-bold text-sm flex items-center gap-2">
                                <ThumbsUp className="w-4 h-4" /> Was this FAQ helpful?
                            </div>
                            <div className="p-6 text-center">
                                <div className="flex items-center justify-center gap-4 mb-4">
                                    <button onClick={() => handleVote('yes')} disabled={hasVoted} className={cn("flex items-center gap-2 px-6 py-2 rounded text-sm font-bold transition-colors", hasVoted ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-emerald-500 hover:bg-emerald-600 text-white")}>
                                        <ThumbsUp className="w-4 h-4" /> Yes
                                    </button>
                                    <button onClick={() => handleVote('no')} disabled={hasVoted} className={cn("flex items-center gap-2 px-6 py-2 rounded text-sm font-bold transition-colors", hasVoted ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600 text-white")}>
                                        <ThumbsDown className="w-4 h-4" /> No
                                    </button>
                                </div>
                                <p className="text-[12px] font-medium text-slate-400 leading-snug">
                                    {hasVoted ? "Thank you for your feedback!" : "Your feedback helps us improve"}
                                </p>
                            </div>
                        </div>

                        {/* Need More Help Widget */}
                        <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
                            <div className="bg-slate-900 px-4 py-3 text-white font-bold text-sm flex items-center gap-2">
                                <HelpCircle className="w-4 h-4" /> Need More Help?
                            </div>
                            <div className="p-6 text-center">
                                <p className="text-[13px] font-medium text-slate-500 leading-relaxed mb-6">
                                    Did this FAQ not solve your issue? Contact our support team.
                                </p>
                                <div className="space-y-3">
                                    <button className="w-full flex items-center justify-center gap-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-4 py-2.5 rounded text-[13px] font-bold transition-colors">
                                        <Mail className="w-4 h-4" /> Contact Support
                                    </button>
                                    <button className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-slate-800 px-4 py-2 rounded text-[13px] font-bold transition-colors">
                                        <HelpCircle className="w-4 h-4" /> Ask a New Question
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            
        </div>
    );
}
