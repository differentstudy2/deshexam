import React from 'react';
import { Share2, MoreVertical, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { ReadingContentData } from '@/app/guide/[id]/guide-data';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface ReadingArticleProps {
  data: ReadingContentData;
}

export function ReadingArticle({ data }: ReadingArticleProps) {
  return (
    <div className="flex-1 w-full bg-slate-50 dark:bg-[#020817] min-h-screen">
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 shadow-sm border-x border-slate-200 dark:border-slate-800 min-h-screen">
        
        {/* Header */}
        <div className="bg-[#f3f9f5] dark:bg-emerald-900/10 px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
          <div>
            <h1 className="text-[22px] font-bold text-slate-800 dark:text-slate-100 mb-1">
              {data.title}
            </h1>
            <p className="text-[13px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">
              {data.subtitle}
            </p>
          </div>
          
          <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500">
            <div className="flex items-center gap-1.5 text-[13px] font-medium mr-2">
              <Eye className="w-4 h-4" />
              {data.views}
            </div>
            <button className="hover:text-[#00a651] transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
            <button className="hover:text-[#00a651] transition-colors p-1 bg-white dark:bg-slate-800 rounded shadow-sm border border-slate-100 dark:border-slate-700">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-10 flex flex-col gap-8">
          
          {/* Badge */}
          <div className="flex justify-center">
            <Image 
              src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
              alt="Get it on Google Play" 
              width={130} 
              height={38} 
              className="cursor-pointer"
            />
          </div>

          {/* Text Content Blocks */}
          <div className="flex flex-col gap-6 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
            {data.contentBlocks.map((block, idx) => (
              <p key={idx}>
                <strong>{block.word}</strong> — {block.meaning}
              </p>
            ))}
          </div>

          {/* Author Info */}
          <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-3">
              CONTENT ADDED || UPDATED BY
            </p>
            <div className="flex items-center gap-3">
              <img 
                src={data.author.avatarUrl} 
                alt={data.author.name} 
                className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700"
              />
              <span className="text-[14px] text-slate-600 dark:text-slate-400 font-medium">
                {data.author.name}
              </span>
            </div>
          </div>

          {/* Read More Section */}
          <div className="mt-8">
            <h4 className="text-[17px] font-bold text-slate-800 dark:text-slate-200 mb-4">
              Read more
            </h4>
            <div className="flex flex-wrap gap-3">
              {['পাঠের উদ্দেশ্য', 'পাঠ-পরিচিতি', 'লেখক পরিচিতি', 'কর্ম-অনুশীলন'].map((tag) => (
                <span 
                  key={tag}
                  className="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[13px] font-medium rounded hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Prev/Next Navigation */}
          <div className="flex items-center justify-between mt-12 pt-8">
            <Button variant="secondary" className="bg-[#dcefe2] hover:bg-[#c2e2cc] text-[#1b6b3e] dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button variant="secondary" className="bg-[#dcefe2] hover:bg-[#c2e2cc] text-[#1b6b3e] dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50">
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
