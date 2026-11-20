'use client';

import React, { useState, useEffect } from 'react';
import { Share2, MoreVertical, Eye, ChevronLeft, ChevronRight, Play, CheckCircle2, Printer, FileQuestion, Target, Trophy, HelpCircle, FileText, Edit } from 'lucide-react';
import { ReadingContentData, ContentSection, ContentAuthor } from '@/app/guide/guide-data';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
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
import { NodeQuestionsPage } from '@/components/guide/NodeQuestionsPage';

interface ReadingArticleProps {
  data: ReadingContentData;
  node?: any;
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
  contentType?: string | null;
}

function SectionFooter() {
  return (
    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-3 tracking-wider">
        PUBLISHED BY
      </p>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden p-1.5">
          <img src="/icons/icon-192x192.png" alt="DeshExam" className="w-full h-full object-contain" />
        </div>
        <span className="text-[15px] text-slate-800 dark:text-slate-200 font-extrabold tracking-tight">
          DeshExam
        </span>
      </div>
    </div>
  );
}

import { incrementGuideNodeViews } from '@/lib/firebase/guide';

export function ReadingArticle({ data, node, hierarchy, navigation, contentType }: ReadingArticleProps) {
  const [mounted, setMounted] = useState(false);
  const params = useParams();
  const locale = params?.locale as string || 'bn';
  const [viewCount, setViewCount] = React.useState(data.views || 0);

  React.useEffect(() => {
    setMounted(true);
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
      <div className="bg-[#f2f9f6] dark:bg-emerald-900/10 px-2 py-2 sm:py-2 border-b border-emerald-100/50 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex-1 w-full">
            <div className="flex flex-wrap items-baseline gap-2 mb-1">
              <h1 className="text-[18px] sm:text-[18px] font-bold text-[#143d30] dark:text-slate-100 tracking-tight">
                {data.title}
              </h1>
              {data.author?.name && (
                <span className="text-[14px] font-normal text-slate-400 dark:text-slate-500">
                  ({data.author.name})
                </span>
              )}
            </div>
            {hierarchy ? (
              <div className="flex flex-wrap items-center gap-1.5 text-[13px] text-[#789e90] dark:text-slate-400 font-normal">
                {[
                  hierarchy.boardTitle && hierarchy.boardTitle !== 'Board' ? hierarchy.boardTitle : null,
                  hierarchy.classTitle && hierarchy.classTitle !== 'Class' ? hierarchy.classTitle : null,
                  hierarchy.subjectTitle && hierarchy.subjectTitle !== 'Subject' ? hierarchy.subjectTitle : null,
                  hierarchy.textbookTitle && hierarchy.textbookTitle !== 'Textbook' ? hierarchy.textbookTitle : null
                ].filter(Boolean).map((text, i, arr) => (
                  <React.Fragment key={text as string}>
                    <span>{text}</span>
                    {i < arr.length - 1 && <span className="opacity-60">-</span>}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[#789e90] dark:text-slate-500 uppercase tracking-wide m-0">
                {data.subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[#6b8c80] print:hidden shrink-0">
            <div className="flex items-center justify-center gap-1.5 text-[14px] font-medium px-2 h-8">
              <Eye className="w-[18px] h-[18px]" />
              {viewCount}
            </div>
            <button
              onClick={() => window.print()}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:text-[#1b3d36] hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors"
              title="Print"
            >
              <Printer className="w-[18px] h-[18px] stroke-[1.5]" />
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: data.title, url: window.location.href }).catch(console.error);
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }
              }}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:text-[#1b3d36] hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors"
              title="Share"
            >
              <Share2 className="w-[18px] h-[18px] stroke-[1.5]" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 rounded-md hover:text-[#1b3d36] hover:bg-emerald-50 shadow-sm border border-slate-200/80 dark:border-slate-700 transition-colors ml-1">
                  <MoreVertical className="w-[18px] h-[18px] stroke-[1.5]" />
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
      <div className="p-6 sm:p-6 flex flex-col gap-8">
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
        <SectionFooter />
      </div>
    </div>
  );

  const renderSection = (sec: ContentSection, idx: number) => {
    const isLesson = sec.id === 'lesson' || sec.id === 'guide_content';

    return (
      <div key={idx} id={sec.id} className="bg-white dark:bg-slate-900 scroll-mt-20 border-b border-slate-100 dark:border-slate-800">

        {/* Section Header */}
        {!isLesson && (
          <div className="bg-[#f2f9f6] dark:bg-emerald-900/10 px-6 py-4 border-b border-emerald-100/50 dark:border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-[20px] font-bold text-[#143d30] dark:text-slate-100 tracking-tight">
                {sec.title}
              </h2>
              {sec.type !== 'article' && (
                <span className="px-2 py-0.5 bg-emerald-600/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 text-[11px] font-bold rounded uppercase tracking-wider">
                  Reading
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[#6b8c80] print:hidden">
              <button className="hover:text-[#1b3d36] transition-colors p-1.5 rounded-md hover:bg-emerald-50 dark:hover:bg-slate-800">
                <Share2 className="w-[18px] h-[18px] stroke-[1.5]" />
              </button>
              <button className="bg-white dark:bg-slate-800 rounded-md p-1.5 hover:text-[#1b3d36] hover:bg-emerald-50 shadow-sm border border-slate-200/80 dark:border-slate-700 transition-colors">
                <MoreVertical className="w-5 h-5 stroke-[1.5]" />
              </button>
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

                .custom-reading-font table {
                  display: block;
                  width: 100%;
                  max-width: 100%;
                  overflow-x: auto;
                  -webkit-overflow-scrolling: touch;
                }

                .hide-scrollbar::-webkit-scrollbar {
                  display: none;
                }
                .hide-scrollbar {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
              `}} />
              <div className="prose dark:prose-invert max-w-none custom-reading-font">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeRaw, rehypeKatex]}
                >
                  {(locale === 'en' && sec.body_en) ? sec.body_en : (sec.body || '')}
                </ReactMarkdown>
              </div>
            </>
          )}

          {['mcq', 'cq', 'true-false', 'fill-in-blanks', 'matching'].includes(sec.type) && !(sec as any).questions && (
            <div className="mt-8 relative">
              <NodeQuestionsPage node={node} contentType={sec.type} previewMode={true} />
            </div>
          )}

          {sec.type === 'mcq' && (sec as any).questions && (
            <div className="flex flex-col gap-8">
              {(sec as any).questions.map((q: any, qIdx: number) => (
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

          <SectionFooter />
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
            <div className="bg-[#f2f9f6] dark:bg-emerald-900/10 px-4 py-2 sm:py-2 border-b border-emerald-100/50 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex-1 w-full">
                  <div className="flex flex-wrap items-baseline gap-2 mb-1">
                    <h1 className="text-[18px] sm:text-[18px] font-bold text-[#143d30] dark:text-slate-100 tracking-tight">
                      {data.title}
                    </h1>
                    {data.author?.name && (
                      <span className="text-[14px] font-normal text-slate-400 dark:text-slate-500">
                        ({data.author.name})
                      </span>
                    )}
                  </div>
                  {hierarchy && (
                    <div className="flex flex-wrap items-center gap-1.5 text-[13px] text-[#789e90] dark:text-slate-400 font-normal">
                      {[
                        hierarchy.boardTitle && hierarchy.boardTitle !== 'Board' ? hierarchy.boardTitle : null,
                        hierarchy.classTitle && hierarchy.classTitle !== 'Class' ? hierarchy.classTitle : null,
                        hierarchy.subjectTitle && hierarchy.subjectTitle !== 'Subject' ? hierarchy.subjectTitle : null,
                        hierarchy.textbookTitle && hierarchy.textbookTitle !== 'Textbook' ? hierarchy.textbookTitle : null
                      ].filter(Boolean).map((text, i, arr) => (
                        <React.Fragment key={text as string}>
                          <span>{text}</span>
                          {i < arr.length - 1 && <span className="opacity-60">-</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  )}

                </div>

                <div className="flex items-center text-[#6b8c80] print:hidden shrink-0">
                  <div className="flex items-center gap-1.5 text-[15px] font-medium mr-1.5">
                    <Eye className="w-[18px] h-[18px]" />
                    {viewCount}
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="hover:text-[#1b3d36] transition-colors p-0"
                    title="Print"
                  >
                    <Printer className="w-[18px] h-[18px] stroke-[1.5]" />
                  </button>
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: data.title, url: window.location.href }).catch(console.error);
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Link copied to clipboard!');
                      }
                    }}
                    className="hover:text-[#1b3d36] transition-colors p-0 mx-1.5"
                    title="Share"
                  >
                    <Share2 className="w-[18px] h-[18px] stroke-[1.5]" />
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="bg-white dark:bg-slate-800 rounded-md p-0 hover:text-[#1b3d36] hover:bg-slate-50 shadow-sm border border-slate-200/80 dark:border-slate-700 transition-colors w-7 h-7 flex items-center justify-center">
                        <MoreVertical className="w-[18px] h-[18px] stroke-[1.5]" />
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

            {/* Quick Action Badges */}
            {node && (
              <div className="bg-slate-50 dark:bg-slate-900/40 px-3 sm:px-4 py-2.5 border-b border-slate-200/60 dark:border-slate-800 print:hidden overflow-hidden">
                <div className="flex items-center gap-2 w-full overflow-x-auto hide-scrollbar pb-0.5">
                  <div className="flex-1 min-w-0"></div>
                  <div className="flex items-center justify-center gap-2 min-w-max shrink-0">
                    <Link href={`/guide/${node.fullSlug || node.id}/questions`} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 rounded text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors shadow-sm whitespace-nowrap">
                      <FileQuestion className="w-3 h-3" />
                      Questions
                    </Link>
                    <Link href={`/guide/${node.fullSlug || node.id}/mock-test`} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 rounded text-[10px] font-bold text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors shadow-sm whitespace-nowrap">
                      <Target className="w-3 h-3" />
                      Mock
                    </Link>
                    <Link href={`/guide/${node.fullSlug || node.id}/practice-set`} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-800 border border-amber-100 dark:border-slate-700 rounded text-[10px] font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-700 transition-colors shadow-sm whitespace-nowrap">
                      <FileText className="w-3 h-3" />
                      Practice
                    </Link>
                    <Link href={`/guide/${node.fullSlug || node.id}/quiz`} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-800 border border-rose-100 dark:border-slate-700 rounded text-[10px] font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-700 transition-colors shadow-sm whitespace-nowrap">
                      <Trophy className="w-3 h-3" />
                      Quiz
                    </Link>
                    <Link href={`/guide/${node.fullSlug || node.id}/cq`} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-800 border border-cyan-100 dark:border-slate-700 rounded text-[10px] font-bold text-cyan-700 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-slate-700 transition-colors shadow-sm whitespace-nowrap">
                      <HelpCircle className="w-3 h-3" />
                      Q/A
                    </Link>
                  </div>
                  <div className="flex-1 min-w-0 flex justify-end shrink-0">
                    <Link href={`/admin/guide-content/topic/${node.id}`} title="Edit Content" className="flex-shrink-0 text-slate-400 hover:text-emerald-600 transition-colors p-1.5 rounded-md hover:bg-emerald-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700">
                      <Edit className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {(() => {
              const searchParams = useSearchParams();
              // Support both standard URL contentType and legacy ?section= params
              const sectionQuery = searchParams ? searchParams.get('section') : null;
              const contentSectionId = contentType ? contentType.replace(/-/g, '_') : null;

              if (contentSectionId || sectionQuery) {
                const activeId = contentSectionId || sectionQuery;
                const sectionToRender = data.sections.find(s => s.id === activeId) || data.sections[0];
                return sectionToRender ? renderSection(sectionToRender, 0) : null;
              }

              return data.sections.map((sec, idx) => renderSection(sec, idx));
            })()}

            {/* Tags and Pagination */}
            <div className="px-6 py-6 sm:px-8 mt-4">

              {data.tags && (
                <div className="mb-8">
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
