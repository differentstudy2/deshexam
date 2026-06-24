'use client';

import React, { useState } from 'react';
import { Share2, MoreVertical, Eye, ChevronLeft, ChevronRight, Play, CheckCircle2, Printer } from 'lucide-react';
import { ReadingContentData, ContentSection, ContentAuthor } from '@/app/guide/guide-data';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CustomVideoPlayer } from '@/components/ui/CustomVideoPlayer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ReadingArticleProps {
  data: ReadingContentData;
  hierarchy?: {
    boardId?: string;
    boardTitle?: string;
    classId?: string;
    classTitle?: string;
    subjectId?: string;
    subjectTitle?: string;
    textbookId?: string;
    textbookTitle?: string;
    chapterId?: string;
    chapterTitle?: string;
  };
  navigation?: {
    prev?: { id: string; title: string };
    next?: { id: string; title: string };
  };
}

function SectionFooter({ author }: { author?: ContentAuthor }) {
  if (!author) return null;
  return (
    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-3 tracking-wider">
        CONTENT MANAGER
      </p>
      <div className="flex items-center gap-3">
        {author?.avatarUrl ? (
          <img 
            src={author.avatarUrl} 
            alt="DeshExam Team"
            className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-300 dark:border-slate-600">
            D
          </div>
        )}
        <span className="text-[13px] text-slate-600 dark:text-slate-400 font-medium">
          DeshExam Team
        </span>
      </div>
    </div>
  );
}

import { incrementGuideNodeViews } from '@/lib/firebase/guide';

export function ReadingArticle({ data, hierarchy, navigation }: ReadingArticleProps) {
  const [viewCount, setViewCount] = React.useState(data.views || 0);

  React.useEffect(() => {
    if (!data.id) return;
    const timer = setTimeout(() => {
      incrementGuideNodeViews(data.id).then(() => {
        setViewCount(prev => prev + 1);
      }).catch(console.error);
    }, 2000); // Wait 2s to count as a legitimate view
    return () => clearTimeout(timer);
  }, [data.id]);

  const renderLegacyContent = () => (
    <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
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
            <Eye className="w-4 h-4 mr-1.5" />
            {viewCount}
          </div>
          <button className="hover:text-[#00a651] transition-colors"><Share2 className="w-4 h-4" /></button>
          <button className="hover:text-[#00a651] transition-colors p-1"><MoreVertical className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="p-6 sm:p-10 flex flex-col gap-8">
        {data.content && typeof data.content === 'string' && (
          <div className="prose dark:prose-invert max-w-none custom-reading-font">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeRaw, rehypeKatex]}
            >
              {data.content}
            </ReactMarkdown>
          </div>
        )}
        {data.contentBlocks && data.contentBlocks.length > 0 && (
          <div className="flex flex-col gap-6 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
            {data.contentBlocks.map((block, idx) => (
              <p key={idx}><strong>{block.word}</strong> — {block.meaning}</p>
            ))}
          </div>
        )}
        {data.author && <SectionFooter author={data.author} />}
      </div>
    </div>
  );

  const renderSection = (sec: ContentSection, idx: number) => {
    const isLesson = sec.id === 'lesson';

    return (
      <div key={idx} id={sec.id} className="bg-white dark:bg-slate-900 scroll-mt-20 border-b border-slate-100 dark:border-slate-800">

        {/* Section Header */}
        {!isLesson && (
          <div className="flex justify-between items-center p-2">
            <div className="flex items-center gap-3">
              <h2 className="text-[18px] font-bold text-emerald-700 dark:text-emerald-400">
                {sec.title}
              </h2>
              {sec.type !== 'article' && (
                <span className="px-2 py-0.5 bg-[#00a651] text-white text-[11px] font-bold rounded">
                  Reading
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <button className="hover:text-emerald-600 transition-colors p-1"><Share2 className="w-4 h-4" /></button>
              <button className="hover:text-emerald-600 transition-colors p-1"><MoreVertical className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        {/* Section Body */}
        <div className={`p-6 sm:p-8 ${isLesson ? 'pt-6' : ''}`}>

          {sec.type === 'article' && sec.badges && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {sec.badges.map((b, i) => (
                <span key={i} className={`px-3 py-1 text-[12px] font-bold rounded-full ${b === 'Practice' ? 'bg-white border-2 border-[#107c41] text-[#107c41]' : 'bg-[#107c41] text-white'}`}>
                  {b}
                </span>
              ))}
            </div>
          )}

          {sec.type === 'article' && (
            <>
              <style dangerouslySetInnerHTML={{
                __html: `
                .custom-reading-font p, 
                .custom-reading-font li, 
                .custom-reading-font a, 
                .custom-reading-font strong, 
                .custom-reading-font b, 
                .custom-reading-font em, 
                .custom-reading-font i,
                .custom-reading-font td,
                .custom-reading-font th {
                  font-size: 1.15rem !important;
                  line-height: 1.8 !important;
                }
                
                .custom-reading-font div:not(.katex-display):not(.katex) {
                  font-size: 1.15rem;
                }
                
                .custom-reading-font span:not([class*="katex"]) {
                  font-size: 1.15rem;
                }

                .custom-reading-font h1, 
                .custom-reading-font h2, 
                .custom-reading-font h3, 
                .custom-reading-font h4, 
                .custom-reading-font h5, 
                .custom-reading-font h6 {
                  font-size: 1.25rem !important;
                  line-height: 1.6 !important;
                  font-weight: 700 !important;
                  margin-top: 1.5em !important;
                  margin-bottom: 0.5em !important;
                  color: inherit !important;
                }
              `}} />
              <div className="prose dark:prose-invert max-w-none custom-reading-font">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeRaw, rehypeKatex]}
                >
                  {sec.body || ''}
                </ReactMarkdown>
              </div>
            </>
          )}

          {sec.type === 'mcq' && (
            <div className="flex flex-col gap-8">
              {sec.questions.map((q, qIdx) => (
                <div key={qIdx} className="flex flex-col">
                  <p className="text-[15px] font-semibold text-slate-800 dark:text-slate-200 mb-3">
                    {qIdx + 1}. {q.q}
                  </p>
                  <div className="flex flex-col gap-2">
                    {q.options.map((opt: string, oIdx: number) => {
                      const isCorrect = oIdx === q.correctIdx;
                      return (
                        <div key={oIdx} className={`flex items-center gap-2 text-[14px] ${isCorrect ? 'text-emerald-600 font-medium' : 'text-slate-600 dark:text-slate-400'}`}>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isCorrect ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300'}`}>
                            {isCorrect && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                          </div>
                          {opt}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {sec.type === 'subtopic' && (
            <div className="flex flex-col gap-4 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
              {sec.content.map((item: any, iIdx: number) => {
                if (item.word) return <p key={iIdx}><strong>{item.word}</strong> — {item.meaning}</p>;
                if (item.text) return <p key={iIdx} className="whitespace-pre-wrap">{item.text}</p>;
                return null;
              })}
            </div>
          )}

          {sec.type === 'pdf' && sec.pdfData && sec.pdfData.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sec.pdfData.map((pdf: any, i: number) => pdf.url && (
                <div key={i} className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="M10 13v6" /><path d="M12 13v6" /><path d="M14 13v6" /></svg>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 text-center line-clamp-2">
                    {pdf.title || `Document ${i + 1}`}
                  </h3>
                  <a
                    href={pdf.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
                  >
                    <Eye className="w-4 h-4" />
                    View PDF
                  </a>
                </div>
              ))}
            </div>
          )}

          {sec.type === 'video' && sec.videoData && sec.videoData.length > 0 && (
            <div className="flex flex-col gap-6">
              {sec.videoData.map((vid: any, i: number) => vid.url && (
                <div key={i} className="flex flex-col gap-3">
                  {vid.title && (
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                      {vid.title}
                    </h3>
                  )}
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 shadow-sm">
                    <CustomVideoPlayer
                      url={vid.url}
                      title={vid.title}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {sec.type === 'audio' && sec.audioData && sec.audioData.length > 0 && (
            <div className="flex flex-col gap-4">
              {sec.audioData.map((aud: any, i: number) => aud.url && (
                <div key={i} className="flex flex-col gap-3 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  {aud.title && (
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                      {aud.title}
                    </h3>
                  )}
                  <audio controls src={aud.url} className="w-full h-10 rounded outline-none"></audio>
                </div>
              ))}
            </div>
          )}

          {sec.author && <SectionFooter author={sec.author} />}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 w-full bg-white dark:bg-[#020817] min-h-screen">
      <div className="w-full mx-auto">

        {data.sections ? (
          <div className="flex flex-col">

            {/* Master Banner */}
            <div className="bg-[#f0f7f4] dark:bg-emerald-900/10 px-4 sm:px-6 py-2 sm:py-3 border-b border-emerald-100/50 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                <div className="flex-1 w-full">
                  <div className="flex flex-wrap items-baseline gap-2 mb-0">
                    <h1 className="text-[24px] font-bold text-[#2d4a41] dark:text-slate-100">
                      {data.title}
                    </h1>
                    {data.author?.name && (
                      <span className="text-[14px] font-normal text-slate-400 dark:text-slate-500">
                        ({data.author.name})
                      </span>
                    )}
                  </div>
                  {hierarchy && (
                    <div className="flex flex-wrap items-center gap-1 text-[12px] text-[#7d9e8e] dark:text-slate-400 mt-0 font-normal">
                      {[
                        hierarchy.boardTitle && hierarchy.boardTitle !== 'Board' ? hierarchy.boardTitle : null,
                        hierarchy.classTitle && hierarchy.classTitle !== 'Class' ? hierarchy.classTitle : null,
                        hierarchy.subjectTitle && hierarchy.subjectTitle !== 'Subject' ? hierarchy.subjectTitle : null,
                        hierarchy.textbookTitle && hierarchy.textbookTitle !== 'Textbook' ? hierarchy.textbookTitle : null
                      ].filter(Boolean).map((text, i, arr) => (
                        <React.Fragment key={text as string}>
                          <span>{text}</span>
                          {i < arr.length - 1 && <span className="opacity-70">-</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 text-[#759388] mt-1">
                  <div className="flex items-center gap-1.5 text-[15px] font-medium mr-2">
                    <Eye className="w-4 h-4" />
                    {viewCount}
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="hover:text-[#2d4a41] transition-colors p-1"
                    title="Print"
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: data.title, url: window.location.href });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Link copied to clipboard!');
                      }
                    }}
                    className="hover:text-[#2d4a41] transition-colors p-1"
                    title="Share"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="bg-white dark:bg-slate-800 rounded px-1.5 py-1.5 hover:text-[#2d4a41] shadow-sm border border-slate-200 dark:border-slate-700 transition-colors ml-1">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-slate-900">
                      <DropdownMenuItem className="cursor-pointer">Test Yourself</DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">Favorite</DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">Bookmark</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer">View MCQ(129)</DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">View Written(115)</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer">প্রশ্ন তৈরি করুন</DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">Show Video</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer">Add MCQ</DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">Add Written</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {data.sections.map(renderSection)}

            {/* Tags and Pagination */}
            <div className="px-6 py-6 sm:px-8 mt-4">

              {data.tags && (
                <div className="mb-8">
                  <h4 className="text-[14px] font-bold text-slate-800 dark:text-slate-200 mb-4">
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {data.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[13px] font-medium rounded hover:bg-emerald-100 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Prev/Next Navigation */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                {navigation?.prev ? (
                  <Link href={`/guide/${navigation.prev.id}`}>
                    <Button variant="secondary" className="bg-[#dcefe2] hover:bg-[#c2e2cc] text-[#1b6b3e] dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50">
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                  </Link>
                ) : <div />}

                {navigation?.next ? (
                  <Link href={`/guide/${navigation.next.id}`}>
                    <Button variant="secondary" className="bg-[#dcefe2] hover:bg-[#c2e2cc] text-[#1b6b3e] dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50">
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                ) : <div />}
              </div>
            </div>

          </div>
        ) : (
          renderLegacyContent()
        )}

      </div>
    </div>
  );
}
