"use client";

import Link from 'next/link';
import { 
    Search, Folder, Globe, Copy, Printer, Calendar, Clock, Eye, User, 
    ThumbsUp, ThumbsDown, Mail, HelpCircle, List 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useParams } from 'next/navigation';

const categories = [
    { id: 'study', name: 'Study Plan', icon: <Folder className="w-4 h-4 text-slate-400" /> },
    { id: 'roles', name: 'Business Roles', icon: <Folder className="w-4 h-4 text-slate-400" /> },
    { id: 'assignments', name: 'Business Course Assignments', icon: <Folder className="w-4 h-4 text-slate-400" /> },
    { id: 'settings', name: 'Business Settings', icon: <Folder className="w-4 h-4 text-slate-400" /> },
    { id: 'package', name: 'Business Exam Package', icon: <Folder className="w-4 h-4 text-slate-400" /> },
    { id: 'builder', name: 'E-Question Builder', icon: <Folder className="w-4 h-4 text-slate-400" /> },
];

const relatedFaqs = [
    {
        title: "১ ক্লিকে প্রশ্ন তৈরীতে কি কি কাস্টমাইজ করা যাবে?",
        subtitle: "প্রশ্ন এডিট করা যাবে। লোগো দেয়া যাবে। ঠিকানা যুক্ত করা যাবে। Logo, Motto যুক্ত করা যা...",
        category: "E-Question Builder"
    },
    {
        title: "E-Question Builder কী?",
        subtitle: "E-Question Builder হল একটি স্মার্ট টুল যা শিক্ষকদের জন্য লক্ষ লক্ষ প্রশ্নের ভাণ্ডা...",
        category: "E-Question Builder"
    },
    {
        title: "E-Question Builder-এ কোন স্তরের প্রশ্ন তৈরি করা যায়?",
        subtitle: "এখানে ৪র্থ শ্রেণি থেকে দ্বাদশ শ্রেণি, বিশ্ববিদ্যালয় ভর্তি প্রস্তুতি ও চাকরি প্রস্তু...",
        category: "E-Question Builder"
    },
    {
        title: "একাধিক বিষয়ের প্রশ্ন একসাথে কি তৈরি করা সম্ভব?",
        subtitle: "হ্যাঁ, আপনি এক বা একাধিক বিষয় নির্বাচন করে একত্রে প্রশ্ন সেট তৈরি করতে পারবেন।",
        category: "E-Question Builder"
    }
];

export default function SingleFAQPage() {
    const params = useParams();
    const id = params.id;

    return (
        <div className="min-h-screen bg-[#f8f9fa] font-sans">
            
            {/* Top Bar / Breadcrumb */}
            <div className="bg-white border-b border-slate-200">
                <div className="container mx-auto px-4 h-14 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="font-bold text-slate-800 text-[15px]">প্রশ্ন করুন</div>
                        <div className="w-[1px] h-4 bg-slate-200 hidden sm:block"></div>
                        <div className="text-slate-500 font-medium text-[13px] hidden sm:block">
                            <Link href="/" className="hover:text-slate-800">হোম</Link> <span className="mx-1.5 text-slate-300">›</span> 
                            <Link href="/faq" className="hover:text-slate-800">প্রশ্ন করুন</Link> <span className="mx-1.5 text-slate-300">›</span> 
                            <span className="text-slate-800 font-semibold truncate max-w-[200px] sm:max-w-[300px] inline-block align-bottom">ফন্ট ও লেআউট কা...</span>
                        </div>
                    </div>
                    <div>
                        <Link href="/faq" className="inline-flex items-center justify-center px-5 py-1.5 bg-green-100 hover:bg-green-200 text-green-800 text-[13px] font-bold rounded transition-colors">
                            পিছনে
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
                                ফন্ট ও লেআউট কাস্টমাইজ করা যাবে?
                            </h1>
                            
                            <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-[#737373] text-[14px] font-medium mb-8 pb-6 border-b border-slate-100">
                                <div className="flex items-center gap-2.5">
                                    <img src="https://picsum.photos/seed/raju/32/32" alt="Author" className="w-6 h-6 rounded-full" />
                                    <span>লেখক: Najjar Hossain Raju</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-[18px] h-[18px]" />
                                    <span>প্রকাশিত: 04 Aug, 2025</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-[18px] h-[18px]" />
                                    <span>আপডেট: 6 মাস আগে</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Eye className="w-[18px] h-[18px]" />
                                    <span>দেখা হয়েছে: 382 বার</span>
                                </div>
                            </div>

                            {/* Answer Box */}
                            <div className="mt-4">
                                {/* Tab */}
                                <div className="inline-flex items-center gap-1.5 border border-slate-200 border-b-transparent bg-white px-5 py-2.5 rounded-t-md relative top-[1px] z-10 text-sm font-semibold text-slate-600">
                                    <Globe className="w-4 h-4 text-slate-500" /> ওয়েব প্ল্যাটফর্ম
                                </div>
                                {/* Content Box */}
                                <div className="bg-[#f8f9fa] border border-slate-200 rounded-b-md rounded-tr-md p-5 sm:p-6 mb-6">
                                    <p className="text-[15px] text-slate-800 leading-relaxed font-medium">
                                        অবশ্যই, E-Question Builder-এ রয়েছে Font Size, Font Style, Layout Control - যার মাধ্যমে আপনি প্রিন্ট বা PDF এর চেহারা একদম নিজের মতো করে ডিজাইন করতে পারবেন।
                                    </p>
                                </div>
                                {/* Action Buttons */}
                                <div className="flex justify-end gap-3">
                                    <button className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded transition-colors">
                                        <Copy className="w-4 h-4" /> লিংক কপি
                                    </button>
                                    <button className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-bold rounded transition-colors">
                                        <Printer className="w-4 h-4" /> প্রিন্ট করুন
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Related FAQs Section */}
                        <div>
                            <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold text-[17px]">
                                <HelpCircle className="w-5 h-5 text-slate-400" /> সংশ্লিষ্ট FAQ
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {relatedFaqs.map((faq, idx) => (
                                    <div key={idx} className="bg-white border border-slate-200 rounded-lg p-5 hover:border-slate-300 transition-colors cursor-pointer flex flex-col h-full">
                                        <h3 className="font-bold text-slate-800 text-[14px] leading-snug mb-2">
                                            {faq.title}
                                        </h3>
                                        <p className="text-[12px] text-slate-500 leading-relaxed mb-4 flex-1">
                                            {faq.subtitle}
                                        </p>
                                        <div className="mt-auto">
                                            <span className="inline-block border border-slate-200 bg-white text-slate-600 px-3 py-1 rounded text-[11px] font-bold">
                                                {faq.category}
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
                                <List className="w-4 h-4" /> ক্যাটাগরি
                            </div>
                            <div className="flex flex-col text-[13px] font-medium p-2">
                                {categories.map((cat, index) => {
                                    const linkHref = "/faq?category=" + cat.id;
                                    return (
                                        <Link 
                                            key={cat.id}
                                            href={linkHref}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-slate-50 text-slate-600 rounded",
                                                index !== categories.length - 1 && "border-b border-slate-100"
                                            )}
                                        >
                                            {cat.icon}
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
                                পরিসংখ্যান
                            </div>
                            <div className="p-6 flex items-center justify-between text-center divide-x divide-slate-100">
                                <div className="flex-1">
                                    <div className="text-2xl font-bold text-blue-500 mb-1">381</div>
                                    <div className="text-[12px] font-bold text-slate-400 uppercase tracking-wide">ভিউ</div>
                                </div>
                                <div className="flex-1">
                                    <div className="text-2xl font-bold text-emerald-500 mb-1">2</div>
                                    <div className="text-[12px] font-bold text-slate-400 uppercase tracking-wide">সহায়ক ভোট</div>
                                </div>
                            </div>
                        </div>

                        {/* Helpful Widget */}
                        <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
                            <div className="bg-slate-900 px-4 py-3 text-white font-bold text-sm flex items-center gap-2">
                                <ThumbsUp className="w-4 h-4" /> এই FAQ টি কি সহায়ক?
                            </div>
                            <div className="p-6 text-center">
                                <div className="flex items-center justify-center gap-4 mb-4">
                                    <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded text-sm font-bold transition-colors">
                                        <ThumbsUp className="w-4 h-4" /> হ্যাঁ
                                    </button>
                                    <button className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded text-sm font-bold transition-colors">
                                        <ThumbsDown className="w-4 h-4" /> না
                                    </button>
                                </div>
                                <p className="text-[12px] font-medium text-slate-400 leading-snug">
                                    আপনার মতামত আমাদের উন্নতিতে সাহায্য করবে
                                </p>
                            </div>
                        </div>

                        {/* Need More Help Widget */}
                        <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
                            <div className="bg-slate-900 px-4 py-3 text-white font-bold text-sm flex items-center gap-2">
                                <HelpCircle className="w-4 h-4" /> আরও সাহায্য প্রয়োজন?
                            </div>
                            <div className="p-6 text-center">
                                <p className="text-[13px] font-medium text-slate-500 leading-relaxed mb-6">
                                    এই FAQ আপনার সমস্যার সমাধান করতে পারেনি? আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।
                                </p>
                                <div className="space-y-3">
                                    <button className="w-full flex items-center justify-center gap-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-4 py-2.5 rounded text-[13px] font-bold transition-colors">
                                        <Mail className="w-4 h-4" /> সাপোর্ট যোগাযোগ
                                    </button>
                                    <button className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-slate-800 px-4 py-2 rounded text-[13px] font-bold transition-colors">
                                        <HelpCircle className="w-4 h-4" /> নতুন প্রশ্ন জিজ্ঞাসা
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
