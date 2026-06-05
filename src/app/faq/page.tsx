"use client";

import { useState } from 'react';
import { Search, List, Folder, Plus, ChevronDown, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Metadata } from 'next';

const categories = [
    { id: 'all', name: 'সকল FAQ', icon: <List className="w-4 h-4" /> },
    { id: 'general', name: 'General', icon: <Folder className="w-4 h-4" /> },
    { id: 'account', name: 'Account', icon: <Folder className="w-4 h-4" /> },
    { id: 'package', name: 'Package', icon: <Folder className="w-4 h-4" /> },
    { id: 'course', name: 'Course', icon: <Folder className="w-4 h-4" /> },
    { id: 'books', name: 'Books', icon: <Folder className="w-4 h-4" /> },
    { id: 'academy', name: 'Academy', icon: <Folder className="w-4 h-4" /> },
    { id: 'admission', name: 'Admission', icon: <Folder className="w-4 h-4" /> },
];

const recentFaqs = [
    {
        title: "ফন্ট ও লেআউট কাস্টমাইজ করা যাবে?",
        subtitle: "অবশ্যই, E-Question Builder-এ রয়েছে Font Size, Font Style, Layout..."
    },
    {
        title: "আমি কি কলাম ডিজাইন নিজের মতো করতে পারি?",
        subtitle: "হ্যাঁ, আপনি Custom Column Divider ব্যবহার করে প্রশ্নপত্রের কলাম ব..."
    },
    {
        title: "আমি কি একাধিক সেট (Set-A, Set-B) তৈরি কর...",
        subtitle: "E-Question Builder এর লিংকঃ https://deshexam.com/e-question-bu..."
    },
    {
        title: "প্রশ্নপত্র কিভাবে শেয়ার বা প্রকাশ করবো?",
        subtitle: "প্রশ্নপত্র তৈরি করার পর আপনি তা লিংক আকারে শেয়ার করতে পারবেন কিংবা..."
    },
    {
        title: "আমি কি নিজের প্রতিষ্ঠানের Watermark যুক্ত...",
        subtitle: "হ্যাঁ, আপনি প্রশ্নপত্রে নিজের প্রতিষ্ঠান বা কোচিংয়ের Watermark যু..."
    }
];

const faqsList = [
    { id: 1, text: "ফন্ট ও লেআউট কাস্টমাইজ করা যাবে?", category: "E-Question Builder" },
    { id: 2, text: "আমি কি কলাম ডিজাইন নিজের মতো করতে পারি?", category: "E-Question Builder" },
    { id: 3, text: "আমি কি একাধিক সেট (Set-A, Set-B) তৈরি করতে পারি?", category: "E-Question Builder" },
    { id: 4, text: "প্রশ্নপত্র কিভাবে শেয়ার বা প্রকাশ করবো?", category: "E-Question Builder" },
    { id: 5, text: "আমি কি নিজের প্রতিষ্ঠানের Watermark যুক্ত করতে পারি?", category: "E-Question Builder" },
    { id: 6, text: "প্রশ্নের সাথে উত্তরপত্র কি প্রিন্ট করা যায়?", category: "E-Question Builder" },
    { id: 7, text: "আমি কি প্রশ্ন সম্পাদনা করতে পারি?", category: "E-Question Builder" },
    { id: 8, text: "কোন কোন প্রশ্ন ধরন সাপোর্ট করে?", category: "E-Question Builder" },
    { id: 9, text: "একাধিক বিষয়ের প্রশ্ন একসাথে কি তৈরি করা সম্ভব?", category: "E-Question Builder" },
    { id: 10, text: "E-Question Builder-এ কোন স্তরের প্রশ্ন তৈরি করা যায়?", category: "E-Question Builder" },
    { id: 11, text: "E-Question Builder কী?", category: "E-Question Builder" },
    { id: 12, text: "আমি কি পাসওয়ার্ড পরিবর্তন করতে পারি?", category: "Account" },
];

export default function FAQPage() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

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
                                {categories.map((cat, index) => {
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
                                            <span className="text-slate-400">{cat.icon}</span>
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
                                {recentFaqs.map((faq, index) => (
                                    <div key={index} className={cn(
                                        "p-4 hover:bg-slate-50 cursor-pointer transition-colors",
                                        index !== recentFaqs.length - 1 && "border-b border-slate-100"
                                    )}>
                                        <h4 className="text-[13px] font-bold text-slate-800 leading-tight mb-1.5">{faq.title}</h4>
                                        <p className="text-[12px] text-slate-400 leading-snug line-clamp-2">{faq.subtitle}</p>
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
                            <button className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 transition-colors text-slate-700 px-3 py-1.5 rounded text-[13px] font-semibold border border-slate-200">
                                <List className="w-3.5 h-3.5" />
                                সর্ট করুন
                                <ChevronDown className="w-3.5 h-3.5 ml-1" />
                            </button>
                        </div>

                        {/* FAQ List */}
                        <div className="space-y-3">
                            {faqsList.map((faq) => (
                                <div key={faq.id} className="flex items-center gap-4 bg-white border border-slate-200 rounded-lg p-3 hover:border-slate-300 transition-colors cursor-pointer group">
                                    
                                    <div className="w-8 h-8 rounded-md bg-[#0ea5e9] text-white flex items-center justify-center font-bold text-sm shrink-0">
                                        {faq.id}
                                    </div>
                                    
                                    <h3 className="flex-1 text-[14px] font-semibold text-slate-800">
                                        {faq.text}
                                    </h3>
                                    
                                    <div className="hidden sm:flex items-center gap-3 shrink-0">
                                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded text-[11px] font-bold whitespace-nowrap">
                                            {faq.category}
                                        </span>
                                        <Plus className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                                    </div>
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
