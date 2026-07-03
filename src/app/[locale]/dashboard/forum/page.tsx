'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Image as ImageIcon, 
  BarChart2, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  Award,
  Bookmark,
  Link as LinkIcon
} from 'lucide-react';

const posts = [
  {
    id: 1,
    name: 'Khursida begum',
    initials: 'KB',
    avatarBg: 'bg-yellow-700',
    time: 'a month ago',
    content: 'aaj amake physics 1st chapter er basic dao',
    likes: 4,
    comments: 1,
  },
  {
    id: 2,
    name: 'Jahanur miah',
    initials: 'JM',
    avatarBg: 'bg-yellow-400',
    time: 'a month ago',
    content: 'Same dt English version er book ba exam kobe?\nami english version e... but sob e bengali version!',
    likes: 1,
    comments: 1,
  },
  {
    id: 3,
    name: 'Nuru Raul',
    initials: 'NR',
    avatarBg: 'bg-yellow-500',
    time: 'a month ago',
    content: 'রাজশাহীর এক জনপ্রিয় লোকজ গান\nগম্ভীরা ভাওয়াইয়া ভাটিয়ালি লালনগীতি',
    likes: 0,
    comments: 0,
  },
  {
    id: 4,
    name: 'M AL',
    initials: 'MA',
    avatarBg: 'bg-blue-300',
    time: 'a month ago',
    content: '2024 saal theke nobo prithibir ek prothon chob... Dinajpur theke\n15.00 e onk shundor ekta din theke theke valo lagche',
    likes: 0,
    comments: 0,
  },
  {
    id: 5,
    name: 'MD Amin Hossain',
    initials: 'MH',
    avatarBg: 'bg-slate-400',
    time: 'a month ago',
    content: '10-15 barig in UP super mag er er kumn board\ndhaka board',
    likes: 0,
    comments: 0,
  },
  {
    id: 6,
    name: 'Md Rakib',
    initials: 'MR',
    avatarBg: 'bg-blue-400',
    time: 'a month ago',
    content: 'এসএসসি ২০২৪ সিলেবাস কবে দিবে\nভাইয়া এসএসসি ২০২৪ সিলেবাস কি দিবে? না দিলে আমি কেমনে পড়ব আমার তো কোন আইডিয়া নাই',
    likes: 0,
    comments: 1,
  },
  {
    id: 7,
    name: 'Moontasir Rahman',
    initials: 'MR',
    avatarBg: 'bg-purple-300',
    time: 'a month ago',
    content: '৫ টি বইয়ের গড় দাম ১৫০ টাকা। ১ম ৩ টি বইয়ের গড় দাম কত?\n৫ টি বইয়ের গড় দাম ১৫০ টাকা। ১ম ৩ টি বইয়ের গড় দাম কত?\nA) ১৩০ টাকা\nB) ১৩৫ টাকা\nC) ১৪০ টাকা\nD) ১৪৫ টাকা',
    likes: 0,
    comments: 1,
  },
  {
    id: 8,
    name: 'OSMAN SIDDIQUE',
    initials: 'OS',
    avatarImg: 'https://i.pravatar.cc/150?u=10', // using an image for this one like screenshot
    time: 'a month ago',
    content: 'সমাস কত প্রকার?',
    likes: 0,
    comments: 1,
    poll: {
      totalVotes: 21,
      options: [
        { text: '৪ প্রকার', percent: 0 },
        { text: '৬ প্রকার', percent: 100 },
        { text: '৮ প্রকার', percent: 0 },
        { text: '১০ প্রকার', percent: 0 },
      ]
    }
  }
];

const trendingTopics = [
  { tag: '#ssc_2025', posts: 1420 },
  { tag: '#math_solution', posts: 856 },
  { tag: '#hsc_admission', posts: 643 },
  { tag: '#physics_notes', posts: 512 },
  { tag: '#english_grammar', posts: 380 },
];

const topContributors = [
  { name: 'Khursida begum', xp: 4500, avatarBg: 'bg-yellow-700', initials: 'KB' },
  { name: 'Jahanur miah', xp: 3800, avatarBg: 'bg-yellow-400', initials: 'JM' },
  { name: 'OSMAN SIDDIQUE', xp: 3100, avatarImg: 'https://i.pravatar.cc/150?u=10', initials: 'OS' },
  { name: 'Nuru Raul', xp: 2850, avatarBg: 'bg-yellow-500', initials: 'NR' },
];

export default function ForumPage() {
  const [feedType, setFeedType] = useState<'feed' | 'mypost'>('feed');

  return (
    <div className="w-full max-w-[1400px] mx-auto pb-12 text-slate-800 dark:text-slate-100">
      
      {/* Header */}
      <div className="mb-6 px-4 sm:px-0 border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Forum</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start px-4 sm:px-0">
        
        {/* LEFT COLUMN: Main Feed */}
        <div className="flex-1 w-full flex flex-col items-center">
          
          <div className="w-full max-w-2xl space-y-6">
            {/* Create Post Box */}
            <Card className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <div className="flex gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold shrink-0">
                    ME
                  </div>
                  <textarea 
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none resize-none rounded-xl p-4 text-sm focus:ring-1 focus:ring-blue-500 outline-none text-slate-700 dark:text-slate-300 placeholder:text-slate-400 min-h-[80px]"
                    placeholder="What's on your mind? Ask a question or start a discussion..."
                  ></textarea>
                </div>
                <div className="flex items-center justify-between mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <div className="flex items-center gap-4 pl-14">
                    <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                      <ImageIcon className="w-4 h-4 text-emerald-500" /> Photo
                    </button>
                    <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                      <BarChart2 className="w-4 h-4 text-emerald-500" /> Poll
                    </button>
                  </div>
                  <Button className="bg-[#818cf8] hover:bg-[#6366f1] text-white rounded-xl px-8 h-9 font-bold text-xs shadow-sm">
                    Post
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Feed Toggle */}
            <div className="flex justify-center">
              <div className="bg-slate-100 dark:bg-slate-800 rounded-full p-1 inline-flex">
                <button 
                  onClick={() => setFeedType('feed')}
                  className={`px-6 py-1.5 rounded-full text-xs font-bold transition-all ${
                    feedType === 'feed' 
                      ? 'bg-[#6366f1] text-white shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  Feed
                </button>
                <button 
                  onClick={() => setFeedType('mypost')}
                  className={`px-6 py-1.5 rounded-full text-xs font-bold transition-all ${
                    feedType === 'mypost' 
                      ? 'bg-[#6366f1] text-white shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  My Post
                </button>
              </div>
            </div>

            {/* Posts List */}
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id} className="bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                  <CardContent className="p-5">
                    {/* Post Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        {post.avatarImg ? (
                          <img src={post.avatarImg} alt={post.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className={`w-10 h-10 rounded-full ${post.avatarBg} text-white flex items-center justify-center font-bold text-sm`}>
                            {post.initials}
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-[14px] text-slate-800 dark:text-slate-200 leading-tight">{post.name}</h4>
                          <span className="text-[11px] font-medium text-slate-400">{post.time}</span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="text-slate-400 hover:text-slate-600 outline-none">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-xl p-1.5 border-slate-200 dark:border-slate-800">
                          <DropdownMenuItem className="cursor-pointer gap-2.5 py-2 px-3 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-800 rounded-lg transition-colors">
                            <Bookmark className="w-4 h-4" />
                            <span className="font-medium text-sm">Bookmark</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer gap-2.5 py-2 px-3 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-800 rounded-lg transition-colors">
                            <LinkIcon className="w-4 h-4" />
                            <span className="font-medium text-sm">Copy Link</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Post Content */}
                    <p className="text-[14px] text-slate-700 dark:text-slate-300 whitespace-pre-line mb-4 font-medium leading-relaxed">
                      {post.content}
                    </p>

                    {/* Poll UI */}
                    {post.poll && (
                      <div className="mb-4 space-y-2 mt-4">
                        {post.poll.options.map((opt, i) => (
                          <div key={i} className="relative w-full h-10 rounded-lg overflow-hidden border border-blue-100 dark:border-blue-900/30 flex items-center bg-slate-50 dark:bg-slate-800/50">
                            <div 
                              className="absolute top-0 left-0 h-full bg-blue-100 dark:bg-blue-900/40 transition-all"
                              style={{ width: `${opt.percent}%` }}
                            ></div>
                            <div className="absolute inset-0 flex justify-between items-center px-4">
                              <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300 z-10">{opt.text}</span>
                              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 z-10">{opt.percent}%</span>
                            </div>
                          </div>
                        ))}
                        <div className="text-right text-[11px] text-slate-400 font-medium pt-1">
                          {post.poll.totalVotes} votes
                        </div>
                      </div>
                    )}

                    {/* Post Actions */}
                    <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-50 dark:border-slate-800/50">
                      <div className="flex items-center gap-6">
                        <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-500 transition-colors">
                          <Heart className="w-4 h-4" /> {post.likes}
                        </button>
                        <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-500 transition-colors">
                          <MessageSquare className="w-4 h-4" /> {post.comments}
                        </button>
                      </div>
                      <button className="text-slate-500 hover:text-slate-700 transition-colors">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>

                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-col sm:flex-row justify-between items-center pt-8 pb-10 gap-4">
              <div className="text-[13px] text-slate-500 font-medium">
                Showing 1 - 15 of 2269
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mr-4">
                  Rows:
                  <div className="flex items-center justify-between border border-slate-200 dark:border-slate-700 rounded px-2 py-1 min-w-[50px] bg-white dark:bg-slate-900 cursor-pointer">
                    15 <ChevronDown className="w-3 h-3 ml-2" />
                  </div>
                </div>

                <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden shadow-sm">
                  <button className="px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 border-r border-slate-200 dark:border-slate-700">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="px-3 py-1.5 text-xs font-bold bg-[#4f46e5] text-white">1</button>
                  <button className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">2</button>
                  <button className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hidden sm:block">3</button>
                  <button className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hidden sm:block">4</button>
                  <button className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hidden md:block">5</button>
                  <div className="px-2 py-1.5 text-xs font-bold text-slate-400 hidden sm:block">...</div>
                  <button className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hidden sm:block">151</button>
                  <button className="px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border-l border-slate-200 dark:border-slate-700">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar (Added per instructions) */}
        <div className="w-full lg:w-[320px] xl:w-[350px] shrink-0 space-y-6">
          
          {/* Trending Topics */}
          <Card className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4 text-slate-800 dark:text-slate-100">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-[15px]">Trending Topics</h3>
              </div>
              <div className="space-y-3">
                {trendingTopics.map((topic, i) => (
                  <div key={i} className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group">
                    <span className="font-bold text-[13px] text-blue-600 dark:text-blue-400 group-hover:underline">{topic.tag}</span>
                    <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{topic.posts} posts</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Contributors */}
          <Card className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4 text-slate-800 dark:text-slate-100">
                <Award className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold text-[15px]">Top Contributors</h3>
              </div>
              <div className="space-y-4 mt-2">
                {topContributors.map((user, i) => (
                  <div key={i} className="flex items-center gap-3 p-1">
                    <div className="w-6 flex justify-center text-[12px] font-bold text-slate-400">
                      #{i + 1}
                    </div>
                    {user.avatarImg ? (
                      <img src={user.avatarImg} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                    ) : (
                      <div className={`w-8 h-8 rounded-full ${user.avatarBg} text-white flex items-center justify-center font-bold text-[10px]`}>
                        {user.initials}
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-bold text-[13px] text-slate-700 dark:text-slate-300 leading-tight truncate">{user.name}</h4>
                      <p className="text-[10px] font-bold text-orange-500">{user.xp} XP</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}
