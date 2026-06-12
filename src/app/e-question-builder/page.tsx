import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, PlayCircle, Star, Users, CheckCircle2, 
  MonitorPlay, ClipboardList, HelpCircle, GraduationCap, 
  Search, FileQuestion, PenTool, LayoutTemplate,
  Download, Printer, FileDown, ShieldCheck, Trophy, Sparkles, Youtube
} from 'lucide-react';
import { Metadata } from 'next';

import QuestionBuilderFilters from './QuestionBuilderFilters';

export const metadata: Metadata = {
  title: "E-Question Builder | DeshExam",
  description: "Create smart question papers instantly with DeshExam's AI-based E-Question Builder.",
};

export default function EQuestionBuilderPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0f172a] font-sans pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 pt-16 pb-12 shadow-sm">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">প্রশ্ন তৈরি করুন</h1>
            <p className="text-gray-500 dark:text-gray-400">এখান থেকে আপনি আপনার প্রয়োজনীয় বোর্ড, শ্রেণি এবং বিষয় নির্বাচন করে প্রশ্ন তৈরি করতে পারবেন।</p>
          </div>

          <div className="bg-gray-50 dark:bg-slate-800 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm mb-6">
            <QuestionBuilderFilters />
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 bg-[#e0f2fe] text-[#0284c7] px-4 py-2 rounded-full font-medium text-sm">
              <Sparkles className="w-4 h-4" />
              <span>স্মার্ট কোয়েশ্চেন জেনারেটর ব্যবহার করুন</span>
            </div>
            <p className="text-sm text-gray-500 text-center max-w-2xl">
              অটোমেটিক প্রশ্ন তৈরি করতে আমাদের অ্যাডভান্সড AI জেনারেটর ব্যবহার করুন। এটি আপনার সিলেবাস অনুযায়ী প্রশ্ন বাছাই করবে।
            </p>
            <div className="flex gap-4">
              <Button variant="outline" className="text-[#10b981] border-[#10b981] hover:bg-[#10b981]/10">
                টিউটোরিয়াল দেখুন
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                ম্যানুয়াল ভাবে তৈরি করুন
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VIDEO TUTORIAL SECTION */}
      <section className="py-16 container mx-auto px-4 max-w-5xl">
        <div className="bg-gradient-to-r from-[#2e1065] to-[#1e3a8a] rounded-2xl p-6 md:p-10 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
            {/* Left: Video Thumbnail */}
            <div className="relative aspect-video bg-black rounded-lg border-4 border-white/20 overflow-hidden group cursor-pointer shadow-lg">
              <Image 
                src="https://picsum.photos/seed/tutorial/600/400" 
                alt="Tutorial Video" 
                fill 
                className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Youtube className="w-8 h-8 text-white ml-1" />
                </div>
              </div>
            </div>

            {/* Right: Content */}
            <div className="text-white">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <PlayCircle className="w-6 h-6 text-green-400" /> 
                কিভাবে ব্যবহার করবেন?
              </h2>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-400 shrink-0" />
                  <span>প্রথমে আপনার কাঙ্ক্ষিত বিষয় নির্বাচন করুন</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-400 shrink-0" />
                  <span>এরপর অধ্যায় এবং প্রশ্নের ধরন বাছাই করুন</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-400 shrink-0" />
                  <span>জেনারেট বাটনে ক্লিক করুন</span>
                </li>
              </ul>
              <Button className="mt-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6 font-semibold shadow-lg">
                <Youtube className="w-4 h-4 mr-2" /> ভিডিও টিউটোরিয়াল
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURES GRID */}
      <section className="py-8 container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white inline-block border-b-2 border-indigo-600 pb-2">আমাদের বিশেষ সুবিধা সমূহ</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 text-sm">এক নজরে দেখে নিন আমাদের ই-কোয়েশ্চেন বিল্ডারের সুবিধাগুলো</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-none shadow-sm hover:shadow-md transition-shadow dark:bg-slate-800 text-center p-6">
            <div className="mx-auto w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 text-blue-600">
              <FileQuestion className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2">১০০,০০০+ প্রশ্ন</h3>
            <p className="text-xs text-gray-500">আমাদের ভাণ্ডারে আছে লক্ষাধিক প্রশ্ন যা প্রতিদিন আপডেট হচ্ছে।</p>
          </Card>
          
          <Card className="border-none shadow-sm hover:shadow-md transition-shadow dark:bg-slate-800 text-center p-6">
            <div className="mx-auto w-14 h-14 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 text-green-600">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2">AI Based জেনারেটর</h3>
            <p className="text-xs text-gray-500">স্মার্ট অ্যালগরিদম ব্যবহার করে ১ ক্লিকেই ব্যালেন্সড প্রশ্নপত্র তৈরি।</p>
          </Card>

          <Card className="border-none shadow-sm hover:shadow-md transition-shadow dark:bg-slate-800 text-center p-6">
            <div className="mx-auto w-14 h-14 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 text-red-600">
              <FileDown className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2">PDF এক্সপোর্ট</h3>
            <p className="text-xs text-gray-500">তৈরিকৃত প্রশ্নপত্র সাথে সাথেই হাই কোয়ালিটি PDF এ সেভ করুন।</p>
          </Card>

          <Card className="border-none shadow-sm hover:shadow-md transition-shadow dark:bg-slate-800 text-center p-6">
            <div className="mx-auto w-14 h-14 bg-purple-50 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4 text-purple-600">
              <LayoutTemplate className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2">কাস্টম হেডার ও ওয়াটারমার্ক</h3>
            <p className="text-xs text-gray-500">প্রতিষ্ঠানের নাম, লোগো এবং ওয়াটারমার্ক যুক্ত করার সুবিধা।</p>
          </Card>
        </div>
      </section>

      {/* 4. MILESTONES */}
      <section className="py-12 bg-white dark:bg-slate-900 border-y border-gray-100 dark:border-slate-800 my-8">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-2xl font-bold mb-8 text-gray-800 dark:text-white">Our Milestones</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-slate-700">
            <div className="px-4 py-2">
              <div className="text-4xl font-extrabold text-blue-600 mb-2">5000+</div>
              <p className="text-gray-500 font-medium">শিক্ষক ব্যবহার করছেন</p>
            </div>
            <div className="px-4 py-2">
              <div className="text-4xl font-extrabold text-[#10b981] mb-2">100+</div>
              <p className="text-gray-500 font-medium">স্কুল ও প্রতিষ্ঠান যুক্ত</p>
            </div>
            <div className="px-4 py-2">
              <div className="text-4xl font-extrabold text-purple-600 mb-2">150,000+</div>
              <p className="text-gray-500 font-medium">মোট প্রশ্নপত্র তৈরি হয়েছে</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. DEMO/PREVIEW SECTION */}
      <section className="py-16 container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">এক নজরে প্রশ্নপত্রের ডেমো</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">আমাদের সিস্টেম থেকে জেনারেট করা প্রশ্নপত্রের নমুনা দেখুন</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Left: Paper Preview */}
          <div className="w-full lg:w-1/2 p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-slate-700 shadow-inner flex justify-center">
            <div className="relative w-full max-w-md aspect-[1/1.4] bg-white rounded shadow-xl overflow-hidden">
               <Image src="https://picsum.photos/seed/paper/600/840" alt="Question Paper Preview" fill className="object-cover opacity-90" />
            </div>
          </div>

          {/* Right: Features Detail */}
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex gap-4">
              <div className="bg-green-100 text-green-600 p-3 rounded-full h-fit"><Printer className="w-6 h-6" /></div>
              <div>
                <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">প্রিন্ট রেডি ফরম্যাট</h4>
                <p className="text-sm text-gray-500">একদম ঝকঝকে এবং সুন্দর ফন্টে প্রশ্নপত্র প্রিন্ট করার সুবিধা।</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex gap-4">
              <div className="bg-blue-100 text-blue-600 p-3 rounded-full h-fit"><FileText className="w-6 h-6" /></div>
              <div>
                <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">MS Word সাপোর্ট</h4>
                <p className="text-sm text-gray-500">প্রয়োজনে Word ডকুমেন্টে সেভ করে নিজের মতো এডিট করে নিতে পারবেন।</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex gap-4">
              <div className="bg-purple-100 text-purple-600 p-3 rounded-full h-fit"><ShieldCheck className="w-6 h-6" /></div>
              <div>
                <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">১০০% নির্ভুল প্রশ্ন</h4>
                <p className="text-sm text-gray-500">অভিজ্ঞ শিক্ষকদের প্যানেল দ্বারা যাচাইকৃত প্রশ্নব্যাংক।</p>
              </div>
            </div>
            
            <div className="pt-4">
              <Button className="w-full md:w-auto bg-[#10b981] hover:bg-emerald-600 text-white shadow-md">
                ডেমো PDF ডাউনলোড করুন
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PRICING SECTION */}
      <section className="py-16 bg-gray-50 dark:bg-[#0f172a] border-t border-gray-200 dark:border-slate-800">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">সাবস্ক্রিপশন প্যাকেজ</h2>
            <p className="text-gray-500">আপনার পছন্দমত প্যাকেজটি বেছে নিন এবং প্রশ্ন তৈরি শুরু করুন</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Basic */}
            <Card className="border border-gray-200 dark:border-slate-700 shadow-sm relative flex flex-col">
              <div className="bg-[#fef3c7] text-yellow-800 text-center py-3 font-bold uppercase rounded-t-xl border-b border-[#fde68a]">E-BASIC</div>
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="text-center mb-6">
                  <div className="text-3xl font-extrabold text-gray-800 dark:text-white mb-1">৳ ৫০০ <span className="text-base text-gray-500 font-normal">/ মাস</span></div>
                </div>
                <div className="space-y-3 flex-1 mb-6">
                  <div className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 mt-1 shrink-0" /><span className="text-sm text-gray-600 dark:text-gray-300">প্রতিমাসে ১০টি প্রশ্নপত্র</span></div>
                  <div className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 mt-1 shrink-0" /><span className="text-sm text-gray-600 dark:text-gray-300">সাধারণ হেডার ও লোগো</span></div>
                  <div className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 mt-1 shrink-0" /><span className="text-sm text-gray-600 dark:text-gray-300">শুধু PDF ডাউনলোড</span></div>
                </div>
                <Button className="w-full bg-[#10b981] hover:bg-emerald-600 text-white rounded-md">Purchase</Button>
              </CardContent>
            </Card>

            {/* Plus */}
            <Card className="border-2 border-[#10b981] shadow-md relative flex flex-col transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#10b981] text-white px-3 py-1 rounded-full text-xs font-bold uppercase shadow-sm">Most Popular</div>
              <div className="bg-[#d1fae5] text-emerald-800 text-center py-3 font-bold uppercase rounded-t-xl border-b border-[#a7f3d0]">E-PLUS</div>
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="text-center mb-6">
                  <div className="text-3xl font-extrabold text-gray-800 dark:text-white mb-1">৳ ১,০০০ <span className="text-base text-gray-500 font-normal">/ মাস</span></div>
                </div>
                <div className="space-y-3 flex-1 mb-6">
                  <div className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 mt-1 shrink-0" /><span className="text-sm text-gray-600 dark:text-gray-300">প্রতিমাসে ১০০টি প্রশ্নপত্র</span></div>
                  <div className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 mt-1 shrink-0" /><span className="text-sm text-gray-600 dark:text-gray-300">কাস্টম হেডার ও ওয়াটারমার্ক</span></div>
                  <div className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 mt-1 shrink-0" /><span className="text-sm text-gray-600 dark:text-gray-300">PDF এবং Word (DOCX) সাপোর্ট</span></div>
                  <div className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 mt-1 shrink-0" /><span className="text-sm text-gray-600 dark:text-gray-300">AI স্মার্ট জেনারেটর ব্যবহার</span></div>
                </div>
                <Button className="w-full bg-[#10b981] hover:bg-emerald-600 text-white rounded-md shadow-md">Purchase</Button>
              </CardContent>
            </Card>

            {/* Pro */}
            <Card className="border border-gray-200 dark:border-slate-700 shadow-sm relative flex flex-col">
              <div className="bg-[#fee2e2] text-red-800 text-center py-3 font-bold uppercase rounded-t-xl border-b border-[#fecaca]">E-PRO</div>
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="text-center mb-6">
                  <div className="text-3xl font-extrabold text-gray-800 dark:text-white mb-1">৳ ২,৫০০ <span className="text-base text-gray-500 font-normal">/ মাস</span></div>
                </div>
                <div className="space-y-3 flex-1 mb-6">
                  <div className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 mt-1 shrink-0" /><span className="text-sm text-gray-600 dark:text-gray-300">আনলিমিটেড প্রশ্নপত্র</span></div>
                  <div className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 mt-1 shrink-0" /><span className="text-sm text-gray-600 dark:text-gray-300">নিজস্ব প্রশ্ন এড করার সুবিধা</span></div>
                  <div className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 mt-1 shrink-0" /><span className="text-sm text-gray-600 dark:text-gray-300">সকল E-PLUS এর সুবিধাসমূহ</span></div>
                  <div className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 mt-1 shrink-0" /><span className="text-sm text-gray-600 dark:text-gray-300">ডেডিকেটেড সাপোর্ট টিম</span></div>
                </div>
                <Button className="w-full bg-[#10b981] hover:bg-emerald-600 text-white rounded-md">Purchase</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 7. BOTTOM CTA */}
      <section className="py-16 container mx-auto px-4 max-w-5xl">
        <div className="bg-[#e8f5e9] dark:bg-[#00a651]/10 rounded-3xl p-8 md:p-12 text-center border border-green-100 dark:border-green-900/30 flex flex-col items-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#00a651] mb-4">আমাদের সাথেই যুক্ত হোন আজই!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl">
            স্কুল, কলেজ, কোচিং সেন্টার বা প্রাইভেট টিউটর - সবার জন্যই আমাদের ই-কোয়েশ্চেন বিল্ডার একটি যুগান্তকারী সমাধান। আপনার মূল্যবান সময় বাঁচাতে আজই রেজিস্ট্রেশন করুন।
          </p>
          <div className="w-64 h-40 relative mb-8">
             <Image src="https://picsum.photos/seed/cta/400/250" alt="CTA Handshake" fill className="object-cover rounded-lg shadow-sm" />
          </div>
          <Button className="bg-[#2563eb] hover:bg-blue-700 text-white font-bold px-8 py-6 rounded-full text-lg shadow-lg">
            রেজিস্ট্রেশন করুন
          </Button>
        </div>
      </section>

      {/* 8. FAQs (Placeholder for now since Accordion import might fail) */}
      <section className="py-16 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">সাধারণ জিজ্ঞাসা (FAQ)</h2>
          </div>
          
          <div className="space-y-4">
            <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
              <h3 className="font-bold text-gray-800 dark:text-gray-200 flex justify-between items-center cursor-pointer">
                প্রশ্নপত্র কি Word ফাইলে সেভ করা যায়? <span className="text-gray-400">+</span>
              </h3>
              <p className="text-sm text-gray-500 mt-2">হ্যাঁ, প্লাস এবং প্রো প্যাকেজে আপনি খুব সহজেই MS Word (.docx) ফরম্যাটে প্রশ্ন সেভ করে এডিট করতে পারবেন।</p>
            </div>
            <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
              <h3 className="font-bold text-gray-800 dark:text-gray-200 flex justify-between items-center cursor-pointer">
                আমি কি আমার প্রতিষ্ঠানের লোগো ব্যবহার করতে পারবো? <span className="text-gray-400">+</span>
              </h3>
              <p className="text-sm text-gray-500 mt-2">অবশ্যই। আমাদের বিল্ট-ইন হেডার এডিটর ব্যবহার করে আপনি সহজেই আপনার নিজস্ব লোগো ও স্কুলের নাম বসাতে পারবেন।</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
