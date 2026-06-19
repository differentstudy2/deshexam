"use client";

import { useEffect, useState } from 'react';
import { getFaqs, getCategories } from '@/features/faqs/services/faq.api';
import { FAQ, FAQCategory } from '@/features/faqs/types/faq.types';
import { Loader2 } from 'lucide-react';

import Link from 'next/link';
import { Search, List, Folder, Plus, Minus, ChevronDown, Clock, Globe, Eye, Copy, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function FAQPage() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
    const { toast } = useToast();
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [categoriesData, setCategoriesData] = useState<FAQCategory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const fetchedFaqs = await getFaqs();
                const fetchedCategories = await getCategories();
                setFaqs(fetchedFaqs);
                setCategoriesData(fetchedCategories);
            } catch (e) {
                console.error("Failed to load", e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const filteredFaqs = faqs.filter(faq => {
        const matchesCategory = activeCategory === 'all' || faq.categoryId === activeCategory;
        const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const recentFaqsList = [...faqs].sort((a, b) => {
        const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : Date.now();
        const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : Date.now();
        return bTime - aTime;
    }).slice(0, 5);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]"><Loader2 className="w-8 h-8 animate-spin text-[#0ea5e9]" /></div>;
    }


    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast({
            description: (
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                    <span className="font-semibold text-[15px] text-white">লিংক কপি হয়েছে!</span>
                </div>
            ),
            className: "bg-[#5cb85c] border-none shadow-lg top-0 right-0 mt-4 mr-4 fixed w-auto min-w-[200px]",
            duration: 2000,
        });
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] font-sans">
            
            {/* Top Header */}
            <div className="bg-white py-12 text-center border-b border-slate-200">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold text-slate-800 mb-3">Frequently Asked Questions</h1>
                    <p className="text-slate-500 text-[15px] font-medium leading-relaxed">
                        দেশ এক্সাম দেশের সর্ববৃহৎ শিক্ষাবিষয়ক ওপেন প্ল্যাটফর্ম।<br/>
                        এখানে আপনি দেশ এক্সাম এবং এর সকল ফিচার সম্পর্কে বিস্তারিত তথ্য পাবেন।
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-6">
                    
                    {/* Left Sidebar */}
                    <div className="w-full lg:w-[320px] shrink-0 space-y-6">
                        
                        {/* Search Panel */}
                        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                            <div className="bg-[#0ea5e9] px-4 py-3 text-white font-bold text-sm flex items-center gap-2">
                                <Search className="w-4 h-4" /> FAQ খুঁজুন
                            </div>
                            <div className="p-4">
                                <div className="flex bg-slate-50 border border-slate-200 rounded overflow-hidden">
                                    <input 
                                        type="text" 
                                        placeholder="FAQ খুঁজুন..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-transparent px-3 py-2 text-sm outline-none"
                                    />
                                    <button className="bg-green-100 px-4 flex items-center justify-center shrink-0 hover:bg-green-200 transition-colors">
                                        <Search className="w-4 h-4 text-green-700" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Categories Panel */}
                        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                            <div className="bg-[#0ea5e9] px-4 py-3 text-white font-bold text-sm flex items-center gap-2">
                                <List className="w-4 h-4" /> ক্যাটাগরি
                            </div>
                            <div className="flex flex-col text-sm font-medium">
                                {[{id: 'all', name: 'সকল FAQ'}, ...categoriesData].map((cat, index) => {
                                    const isActive = activeCategory === cat.id;
                                    return (
                                        <button 
                                            key={cat.id}
                                            onClick={() => setActiveCategory(cat.id)}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-3 text-left transition-colors border-l-4",
                                                isActive 
                                                    ? "bg-slate-100 text-slate-900 border-slate-300" 
                                                    : "bg-white text-slate-600 border-transparent hover:bg-slate-50",
                                                index !== categories.length - 1 && "border-b border-b-slate-100"
                                            )}
                                        >
                                            <span className="text-slate-400"><Folder className="w-4 h-4" /></span>
                                            {cat.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Recent FAQs Panel */}
                        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                            <div className="bg-[#0ea5e9] px-4 py-3 text-white font-bold text-sm flex items-center gap-2">
                                <Clock className="w-4 h-4" /> সাম্প্রতিক FAQ
                            </div>
                            <div className="flex flex-col">
                                {recentFaqsList.map((faq, index) => (
                                    <div key={index} className={cn(
                                        "p-4 hover:bg-slate-50 cursor-pointer transition-colors",
                                        index !== recentFaqs.length - 1 && "border-b border-slate-100"
                                    )}>
                                        <h4 className="text-[13px] font-bold text-slate-800 leading-tight mb-1.5">{faq.question}</h4>
                                        <p className="text-[12px] text-slate-400 leading-snug line-clamp-2">{faq.answer}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 bg-white rounded-lg border border-slate-200 p-6">
                        
                        {/* Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                            <h2 className="text-[17px] font-bold text-slate-800">সকল FAQ (873)</h2>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 transition-colors text-slate-800 px-3 py-1.5 rounded text-[14px] font-semibold border border-slate-200 outline-none">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
                                        সর্ট করুন
                                        <ChevronDown className="w-4 h-4 ml-1 text-black" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40 font-medium text-slate-700 bg-white p-1">
                                    <DropdownMenuItem className="py-2 px-3 text-[15px] cursor-pointer focus:bg-slate-50">নতুন প্রথম</DropdownMenuItem>
                                    <DropdownMenuItem className="py-2 px-3 text-[15px] cursor-pointer focus:bg-slate-50">পুরাতন প্রথম</DropdownMenuItem>
                                    <DropdownMenuItem className="py-2 px-3 text-[15px] cursor-pointer focus:bg-slate-50">জনপ্রিয়</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* FAQ List */}
                        <div className="space-y-3">
                            {filteredFaqs.map((faq) => (
                                <div key={faq.id} className={cn(
                                    "bg-white border rounded-lg overflow-hidden transition-colors",
                                    expandedFaq === faq.id ? "border-[#bfdbfe]" : "border-slate-200 hover:border-slate-300"
                                )}>
                                    <div 
                                        onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                                        className={cn(
                                            "flex items-center gap-4 p-3 cursor-pointer group",
                                            expandedFaq === faq.id ? "bg-[#dbeafe]" : "hover:bg-slate-50"
                                        )}
                                    >
                                        <div className="w-8 h-8 rounded-md bg-[#0ea5e9] text-white flex items-center justify-center font-bold text-sm shrink-0">
                                            {faq.id}
                                        </div>
                                        <h3 className="flex-1 text-[14px] font-semibold text-slate-800">
                                            {faq.question}
                                        </h3>
                                        <div className="hidden sm:flex items-center gap-3 shrink-0">
                                            <span className={cn(
                                                "px-3 py-1 rounded text-[11px] font-bold whitespace-nowrap",
                                                expandedFaq === faq.id ? "bg-white/50 text-slate-700" : "bg-slate-100 text-slate-600"
                                            )}>
                                                {(categoriesData.find(c => c.id === faq.categoryId)?.name || 'General')}
                                            </span>
                                            {expandedFaq === faq.id ? (
                                                <Minus className="w-4 h-4 text-slate-600" />
                                            ) : (
                                                <Plus className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                                            )}
                                        </div>
                                    </div>
                                    
                                    {expandedFaq === faq.id && (
                                        <div className="p-4 bg-white">
                                            {/* Tab */}
                                            <div className="inline-flex items-center gap-1.5 border border-slate-200 border-b-transparent bg-slate-50 px-4 py-2 rounded-t-md relative top-[1px] z-10 text-sm font-medium text-slate-600">
                                                <Globe className="w-4 h-4" /> ওয়েব প্ল্যাটফর্ম
                                            </div>
                                            {/* Content Box */}
                                            <div className="bg-slate-50 border border-slate-200 rounded-b-md rounded-tr-md p-4 mb-4">
                                                <p className="text-[14px] text-slate-800 leading-relaxed">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                            {/* Action Buttons */}
                                            <div className="flex justify-end gap-3">
                                                <Link href={`/faq/${faq.seo?.slug || faq.id}`} className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 text-[13px] font-bold rounded-md transition-colors">
                                                    <Eye className="w-4 h-4" /> বিস্তারিত দেখুন
                                                </Link>
                                                <button onClick={handleCopyLink} className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-bold rounded-md transition-colors">
                                                    <Copy className="w-4 h-4" /> লিংক কপি
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="mt-8 flex items-center justify-center gap-1.5">
                            <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 text-sm">‹</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded bg-[#0ea5e9] text-white text-[13px] font-bold">1</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 text-[13px] font-semibold">2</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 text-[13px] font-semibold">3</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 text-[13px] font-semibold">4</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 text-[13px] font-semibold">5</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 text-[13px] font-semibold">6</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 text-[13px] font-semibold">7</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 text-[13px] font-semibold">8</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 text-[13px] font-semibold">9</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 text-[13px] font-semibold">10</button>
                            <span className="text-slate-400 px-1">...</span>
                            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 text-[13px] font-semibold">72</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 text-[13px] font-semibold">73</button>
                            <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 text-sm">›</button>
                        </div>
                        
                    </div>

                </div>
            </div>
            
        </div>
    );
}
