'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  Heart, 
  Bookmark, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  FileText
} from 'lucide-react';
import Image from 'next/image';

// MOCK DATA

const tabs = [
  { name: 'All', count: 392, active: true },
  { name: 'jobs', count: 665, active: false },
  { name: '1 - 12 Class', count: 83, active: false },
  { name: 'Admission', count: 34, active: false },
  { name: 'Skill Development', count: 28, active: false },
  { name: 'General', count: 0, active: false },
  { name: 'Teacher', count: 0, active: false },
];

const blogs = [
  {
    image: 'https://images.unsplash.com/photo-1626265774643-f1943311a86b?w=600&h=400&fit=crop',
    badges: ['Jobs', 'সাধারণ জ্ঞান'],
    time: '5 minutes ago',
    title: 'সুন্দরবন: বিশ্বের বৃহত্তম ম্যানগ্রোভ বনের বিস্ময়',
    desc: 'সুন্দরবন (বাংলা: সুন্দরবন, ইংরেজি: Sundarbans) হলো বঙ্গোপসাগর উপকূলবর্তী একটি বিশাল বনভূমি, যা বাংলাদেশের খুলনা, সাতক্ষীরা ও বাগেরহাট এবং ভারতের...',
    likes: 0, bookmarks: 0, views: 1558
  },
  {
    image: 'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=600&h=400&fit=crop',
    badges: ['Jobs', 'সাধারণ জ্ঞান'],
    time: '5 minutes ago',
    title: 'রাশিয়ার এক ঝলক: বিশ্বের বৃহত্তম দেশ',
    desc: 'রাশিয়া, যা আনুষ্ঠানিকভাবে রুশ ফেডারেশন নামে পরিচিত, বিশ্বের বৃহত্তম দেশ। এর আয়তন প্রায় ১৭.১ মিলিয়ন বর্গ কিলোমিটার, যা পৃথিবীর মোট স্থলভাগের...',
    likes: 0, bookmarks: 0, views: 837
  },
  {
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&h=400&fit=crop',
    badges: ['Jobs', 'সাধারণ জ্ঞান'],
    time: '14 minutes ago',
    title: 'এক্সপ্রেসওয়ে কী? বাংলাদেশের প্রথম এক্সপ্রেসওয়ে কোনটি?',
    desc: 'একটি এক্সপ্রেসওয়ে বিশেষ করে উচ্চ-গতির ট্রাফিকের জন্য পরিকল্পিত, সাধারণত কিছু দেশ বাদে, প্রবেশ বা প্রস্থানের সীমিত পয়েন্ট এবং বিপরীত দিকে চলাচলের...',
    likes: 0, bookmarks: 0, views: 5583
  },
  {
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=400&fit=crop',
    badges: ['Jobs', 'সম্পূর্ণ বিষয় একত্রে'],
    time: '24 minutes ago',
    title: 'পরীক্ষার আগে পড়াশোনা গুছিয়ে নেওয়ার ৫টি কার্যকর কৌশল',
    desc: 'পরীক্ষার আগে আমাদের অনেকেরই মনে হয়—সময় তো কম, কিন্তু পড়ার বাকি অনেক! এমন পরিস্থিতিতে আতঙ্কিত না হয়ে, যদি সঠিক কৌশল ব্যবহার করা যায় তবে অল্প...',
    likes: 1, bookmarks: 0, views: 766
  },
  {
    image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=600&h=400&fit=crop',
    badges: ['Jobs', 'বাংলা'],
    time: '26 minutes ago',
    title: 'বিসিএস: স্বপ্নের সরকারি চাকরির পথে প্রথম ধাপ',
    desc: 'বিসিএস: স্বপ্নের সরকারি চাকরির পথে প্রথম ধাপ! বাংলাদেশে সরকারি চাকরির সবচেয়ে প্রতিযোগিতামূলক ও মর্যাদাপূর্ণ পরীক্ষা হলো বিসিএস... (বাংলাদেশ সিভিল সার্ভিস) এই প্রতিবেদনটি কত...',
    likes: 0, bookmarks: 0, views: 243
  },
  {
    image: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=600&h=400&fit=crop',
    badges: ['Jobs', 'বাংলা'],
    time: '26 minutes ago',
    title: '১৯৫২: যে বছরটি বদলে দিয়েছে আমাদের ইতিহাস',
    desc: '১৯৫২: যে বছরটি বদলে দিয়েছে আমাদের ইতিহাস ১৯৫২ সাল, বাঙালির জীবনে এক অবিস্মরণীয় বছর। এটি শুধু একটি সাল নয়, এটি আমাদের অধিকারের প্রতিবাদে...',
    likes: 0, bookmarks: 0, views: 67
  },
  {
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop',
    badges: ['Jobs', 'সাধারণ বিজ্ঞান'],
    time: '26 minutes ago',
    title: 'ইকিগাই : Ikigai',
    desc: 'ইকিগাই একটি জাপানি কনসেপ্ট। যার উৎপত্তি জাপানি দ্বীপপুঞ্জ ওকিনাওয়ায় একটি গ্রামে। এর অর্থ হল, ‘জীবনের মূল্য’। আক্ষরিক অর্থে ইকি মানে জীবন আর গাই মানে... দাম বা মূল্য। যোগ করলে দাঁড়ায়, জীবনের মূল্য বা অ...',
    likes: 4, bookmarks: 0, views: 2263
  },
  {
    image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=600&h=400&fit=crop',
    badges: ['Jobs', 'সাধারণ জ্ঞান'],
    time: 'an hour ago',
    title: 'ঈশ্বরচন্দ্র বিদ্যাসাগর (২৬ সেপ্টেম্বর ১৮২০ - ২৯ জুলাই ১৮৯১)',
    desc: 'ঈশ্বরচন্দ্র বিদ্যাসাগর (২৬ সেপ্টেম্বর ১৮২০ - ২৯ জুলাই ১৮৯১) উনবিংশ শতকের বিশিষ্ট বাঙালি শিক্ষাবিদ, সমাজ সংস্কারক ও গদ্যকার। তাঁর প্রকৃত নাম ঈশ্বরচন্দ্র বন্দ্যোপাধ্যায়।',
    likes: 2, bookmarks: 0, views: 343
  },
  {
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&h=400&fit=crop',
    badges: ['Jobs', 'সম্পূর্ণ বিষয় একত্রে'],
    time: 'an hour ago',
    title: '২৬ এ চাকরির মেলা যুগান্ত',
    desc: '🔥🔥 চাকরির বাজারে ইতিহাসরে সেরা খবর 🔥🔥 FSC & OTHERS IS ON FIRE ❤️ যারা সরকারি চাকরির স্বপ্ন দেখেন, যাদের জন্ম ২০০২ সাল হতে ২০২৩ সালের মধ্যে... আসুন দেখে নিই সামনে কী কী সুযোগ আসছে— 🚀',
    likes: 0, bookmarks: 0, views: 88
  },
  {
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=400&fit=crop',
    badges: ['Jobs', 'সম্পূর্ণ বিষয় একত্রে'],
    time: 'an hour ago',
    title: 'সরকারি চাকরির প্রস্তুতি: আজ থেকেই শুরু হোক আপনার যাত্রা',
    desc: 'প্রতিযোগিতামূলক সরকারি চাকরি অনেক তরুণ-তরুণীর স্বপ্নের গন্তব্য। স্থায়িত্ব, সম্মান এবং সুযোগ-সুবিধার কারণে এ চাকরির প্রতি আগ্রহ সবসময়ই বেশি। তবে প্রতিযোগি...',
    likes: 0, bookmarks: 0, views: 147
  },
  {
    image: 'https://images.unsplash.com/photo-1501139083538-0139583c060f?w=600&h=400&fit=crop',
    badges: ['Jobs', 'সম্পূর্ণ বিষয় একত্রে'],
    time: 'an hour ago',
    title: 'কম সময়ে বিসিএস প্রস্তুতি',
    desc: 'বাংলাদেশে বিসিএস (বাংলাদেশ সিভিল সার্ভিস) পরীক্ষা একটি স্বপ্নপূরণের নাম। তবে চাকরিজীবীদের সর্বোচ্চ পর্যায়ে যেতে হলে, যাদের জন্য বিসিএস ক্যাডার হওয়া এক বিনম্র... অর্জন। কিন্তু বাস্তবতা হলো, এই প্রতিযোগিতামূলক...',
    likes: 0, bookmarks: 0, views: 177
  },
  {
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=400&fit=crop',
    badges: ['Jobs', 'কম্পিউটার ও তথ্য প্রযুক্তি (Computer & ICT)'],
    time: 'an hour ago',
    title: 'হ্যাকিং: ডিজিটাল যুগে অদৃশ্য হুমকি',
    desc: 'হ্যাকিং ডিজিটাল যুগে একটি অতিপরিচিত শব্দ। তথ্যপ্রযুক্তির যুগে ইন্টারনেট আমাদের জীবনের একটি অবিচ্ছেদ্য অংশ। কিন্তু এই সুবিধার পাশাপাশি রয়েছে এক বড় বিপদ —... হ্যাকিং। হ্যাকিং হচ্ছে কম্পিউটার সিস্টেম, নেটওয়ার্ক...',
    likes: 0, bookmarks: 0, views: 249
  },
  {
    image: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600&h=400&fit=crop',
    badges: ['Jobs', 'সাধারণ জ্ঞান'],
    time: 'an hour ago',
    title: 'এইচএসসি ২০২৪ পরীক্ষার রুটিন প্রকাশিত - সময়সূচি ও প্রস্তুতির গাইড | HSC 2024...',
    desc: 'এইচএসসি পরীক্ষার্থীদের জন্য গুরুত্বপূর্ণ খবর! শিক্ষা বোর্ড কর্তৃক এইচএসসি ২০২৪ পরীক্ষার সময়সূচি প্রকাশিত হয়েছে। নির্ধারিত সূচি অনুযায়ী, ৩০ জুন থেকে তত্ত্বীয়...',
    likes: 2, bookmarks: 0, views: 62572
  },
  {
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop',
    badges: ['Skill Development', 'লারাভেল (Laravel)'],
    time: 'an hour ago',
    title: 'লারাভেল কি? কেন লারাভেল শিখবেন ? লারাভেল ইন্সটলেশন ও কনফিগারেশন...',
    desc: 'লারাভেল কি? কেন Laravel ব্যবহার করবেন? Laravel 11 হলো জনপ্রিয় ওপেন-সোর্স PHP ফ্রেমওয়ার্কের সর্বশেষ সংস্করণ, যা ডেভেলপমেন্টের জন্য ওয়েবে অ্যাপ্লিকেশন...',
    likes: 1, bookmarks: 0, views: 1335
  },
  {
    image: '', // Use icon placeholder if empty
    badges: [],
    time: 'an hour ago',
    title: 'সেভেন সিস্টার্স ও বাংলাদেশ',
    desc: 'সেভেন সিস্টার্স কি? "সেভেন সিস্টার্স" (Seven Sisters) বা সাত বোন হলো ভারতের উত্তর-পূর্বাঞ্চলের সাতটি রাজ্যের সমন্বিত নাম। এই রাজ্যগুলো হলো: আসাম... (Assam) অরুণাচল প্রদেশ (Arunachal)',
    likes: 1, bookmarks: 0, views: 19694
  }
];

const subjects = [
  { name: 'বাংলা', count: 12 },
  { name: 'English', count: 20 },
  { name: 'গণিত', count: 6 },
  { name: 'কম্পিউটার ও তথ্য প্রযুক্তি (Computer...', count: 49 },
  { name: 'সাধারণ জ্ঞান', count: 108 },
  { name: 'সাধারণ বিজ্ঞান', count: 9 },
  { name: 'আইসিটি', count: 4 },
  { name: 'জীববিজ্ঞান', count: 1 },
];

const recentPosts = [
  { title: 'সুন্দরবন: বিশ্বের বৃহত্তম ম্যানগ্রোভ বনের বিস্ময়', category: 'সাধারণ জ্ঞান', img: 'https://images.unsplash.com/photo-1626265774643-f1943311a86b?w=100&h=100&fit=crop' },
  { title: 'রাশিয়ার এক ঝলক: বিশ্বের বৃহত্তম দেশ', category: 'সাধারণ জ্ঞান', img: 'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=100&h=100&fit=crop' },
  { title: 'এক্সপ্রেসওয়ে কী? বাংলাদেশের প্রথম এক্সপ্রেসওয়ে কোনটি?', category: 'সাধারণ জ্ঞান', img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=100&h=100&fit=crop' },
  { title: 'পরীক্ষার আগে পড়াশোনা গুছিয়ে নেওয়ার ৫টি কার্যকর কৌশল', category: 'সম্পূর্ণ বিষয় একত্রে', img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=100&h=100&fit=crop' },
  { title: 'বিসিএস: স্বপ্নের সরকারি চাকরির পথে প্রথম ধাপ', category: 'বাংলা', img: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=100&h=100&fit=crop' },
];

const popularBlogs = [
  { title: 'এইচএসসি ২০২৪: নতুন সিলেবাস, প্রশ্নপত্রের কাঠামো এবং নম্বর বণ্টন...', category: 'সাধারণ জ্ঞান', views: 110002, img: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=100&h=100&fit=crop' },
  { title: 'নোবেল পুরস্কার ২০২৪ তালিকা | সকল বিজয়ীদের নাম ছবি সহ', category: 'সাধারণ জ্ঞান', views: 107717, img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=100&h=100&fit=crop' },
  { title: 'এইচএসসি রেজাল্ট ২০২৪ (HSC Result 2024): কিভাবে সহজে রেজাল্ট চেক...', category: 'সাধারণ জ্ঞান', views: 105715, img: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=100&h=100&fit=crop' },
  { title: 'এইচএসসি ২০২৪ পরীক্ষার রুটিন প্রকাশিত - সময়সূচি ও প্রস্তুতির গাইড...', category: 'সাধারণ জ্ঞান', views: 82572, img: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=100&h=100&fit=crop' },
  { title: 'কোপা আমেরিকা ২০২৪ তালিকা | সকল বিজয়ীদের নাম ছবি সহ', category: 'সাধারণ জ্ঞান', views: 64394, img: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=100&h=100&fit=crop' },
];


export default function BlogPage() {
  return (
    <div className="w-full max-w-[1400px] mx-auto pb-12 text-slate-800 dark:text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Blog</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Discover curated posts from Satt Academy learners and mentors.</p>
        </div>
        <Button className="bg-[#5b5fdb] hover:bg-[#4b4fbf] text-white rounded-md shrink-0 self-start sm:self-auto gap-2">
          <Plus className="w-4 h-4" /> New Post
        </Button>
      </div>

      {/* Tabs and Filters */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab, i) => (
            <button
              key={i}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] font-semibold transition-colors shrink-0 border ${
                tab.active 
                  ? 'bg-[#f0f4ff] border-blue-200 text-blue-600 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {tab.name} {tab.count > 0 && <span className={`px-1.5 py-0.5 rounded-sm text-[10px] ${tab.active ? 'bg-white/60 dark:bg-blue-900/50' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{tab.count}</span>}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              type="text" 
              placeholder="Search blog posts" 
              className="w-full pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg h-10"
            />
          </div>
          <select className="h-10 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500/20 sm:w-[150px]">
            <option>Latest</option>
            <option>Oldest</option>
            <option>Most Viewed</option>
          </select>
        </div>
        
        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
          392 <span className="text-slate-500 font-medium">posts found</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* LEFT COLUMN: Main Blog Grid */}
        <div className="flex-1 w-full space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {blogs.map((blog, i) => (
              <Card key={i} className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-md transition-shadow group flex flex-col cursor-pointer">
                <div className="relative h-40 w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                  {blog.image ? (
                    <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                  )}
                  
                  <div className="absolute top-2 right-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-semibold text-slate-600 dark:text-slate-300 border border-white/20 shadow-sm">
                    {blog.time}
                  </div>
                  
                  {blog.badges.length > 0 && (
                    <div className="absolute bottom-2 left-2 flex gap-1.5 flex-wrap">
                      {blog.badges.map((badge, bi) => (
                        <div key={bi} className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-bold text-blue-600 dark:text-blue-400 border border-white/20 shadow-sm whitespace-nowrap">
                          {badge}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <CardContent className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-2 mb-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {blog.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed flex-1">
                    {blog.desc}
                  </p>
                  
                  <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 hover:text-red-500 transition-colors cursor-pointer">
                        <Heart className="w-3.5 h-3.5" /> {blog.likes}
                      </div>
                      <div className="flex items-center gap-1.5 hover:text-blue-500 transition-colors cursor-pointer">
                        <Bookmark className="w-3.5 h-3.5" /> {blog.bookmarks}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" /> {blog.views}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Showing 1 - 15 of 392
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Go to <Input type="number" className="w-12 h-7 text-xs text-center px-1 py-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800" defaultValue={1} />
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Per Page 
                <select className="h-7 text-xs px-2 py-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md outline-none">
                  <option>15</option>
                  <option>30</option>
                  <option>50</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="w-8 h-8 bg-slate-50 border-slate-200 text-slate-400 rounded-md" disabled>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="default" className="w-8 h-8 bg-[#5b5fdb] hover:bg-[#4b4fbf] text-white text-xs font-bold rounded-md p-0">1</Button>
              <Button variant="outline" className="w-8 h-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-md p-0">2</Button>
              <Button variant="outline" className="w-8 h-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-md p-0">3</Button>
              <Button variant="outline" className="w-8 h-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-md p-0 hidden sm:flex">4</Button>
              <Button variant="outline" className="w-8 h-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-md p-0 hidden sm:flex">5</Button>
              <span className="text-slate-400 px-1 hidden md:block">...</span>
              <Button variant="outline" className="w-8 h-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-md p-0 hidden md:flex">26</Button>
              <Button variant="outline" className="w-8 h-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-md p-0 hidden md:flex">27</Button>
              <Button variant="outline" size="icon" className="w-8 h-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-md">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar */}
        <div className="w-full lg:w-[280px] xl:w-[320px] shrink-0 space-y-6">
          
          {/* Select Subject */}
          <Card className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">Select Subject</h3>
            </div>
            <div className="p-0 h-[280px] overflow-y-auto custom-scrollbar">
              <ul className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {subjects.map((sub, i) => (
                  <li key={i} className="flex justify-between items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate pr-4">{sub.name}</span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded shrink-0">{sub.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          {/* Recent Posts */}
          <Card className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">Recent Posts</h3>
            </div>
            <div className="p-4 space-y-4">
              {recentPosts.map((post, i) => (
                <div key={i} className="flex gap-3 cursor-pointer group">
                  <div className="w-12 h-10 shrink-0 rounded overflow-hidden bg-slate-100">
                    <img src={post.img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors mb-0.5">{post.title}</h4>
                    <span className="text-[9px] text-slate-400">{post.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Popular Blogs */}
          <Card className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">Popular Blogs</h3>
            </div>
            <div className="p-4 space-y-4">
              {popularBlogs.map((blog, i) => (
                <div key={i} className="flex gap-3 cursor-pointer group">
                  <div className="w-12 h-10 shrink-0 rounded overflow-hidden bg-slate-100">
                    <img src={blog.img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors mb-0.5">{blog.title}</h4>
                    <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
                      <span>{blog.category}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> {blog.views}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>

      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 4px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #334155;
        }
      `}</style>
    </div>
  );
}
