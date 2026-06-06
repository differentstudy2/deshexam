'use client';

import React, { useState } from 'react';
import { Share2, MoreVertical, Eye, ChevronLeft, ChevronRight, Play, CheckCircle2 } from 'lucide-react';
import { ReadingContentData, ContentSection, ContentAuthor } from '@/app/guide/[id]/guide-data';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CustomVideoPlayer } from '@/components/ui/CustomVideoPlayer';

interface ReadingArticleProps {
  data: ReadingContentData;
}

function SectionFooter({ author }: { author: ContentAuthor }) {
  return (
    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-3 tracking-wider">
        CONTENT MANAGER
      </p>
      <div className="flex items-center gap-3">
        <img 
          src={author.avatarUrl} 
          alt={author.name} 
          className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700"
        />
        <span className="text-[13px] text-slate-600 dark:text-slate-400 font-medium">
          {author.name}
        </span>
      </div>
    </div>
  );
}

export function ReadingArticle({ data }: ReadingArticleProps) {
  
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
          {data.views && (
            <div className="flex items-center gap-1.5 text-[13px] font-medium mr-2">
              <Eye className="w-4 h-4" />
              {data.views}
            </div>
          )}
          <button className="hover:text-[#00a651] transition-colors"><Share2 className="w-4 h-4" /></button>
          <button className="hover:text-[#00a651] transition-colors p-1"><MoreVertical className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="p-6 sm:p-10 flex flex-col gap-8">
        <div className="flex flex-col gap-6 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
          {data.contentBlocks?.map((block, idx) => (
            <p key={idx}><strong>{block.word}</strong> — {block.meaning}</p>
          ))}
        </div>
        {data.author && <SectionFooter author={data.author} />}
      </div>
    </div>
  );

  const renderSection = (sec: ContentSection, idx: number) => {
    return (
      <div key={idx} id={sec.id} className="bg-white dark:bg-slate-900 scroll-mt-20 border-b border-slate-100 dark:border-slate-800">
        
        {/* Section Header */}
        <div className="bg-[#eaf5ef] dark:bg-emerald-900/10 px-6 py-4 flex justify-between items-center">
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

        {/* Section Body */}
        <div className="p-6 sm:p-8">
          
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
            <div 
              className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-300"
              dangerouslySetInnerHTML={{ __html: sec.body }}
            />
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M10 13v6"/><path d="M12 13v6"/><path d="M14 13v6"/></svg>
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

          <SectionFooter author={sec.author} />
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 w-full bg-white dark:bg-[#020817] min-h-screen">
      <div className="w-full mx-auto">
        
        {data.sections ? (
          <div className="flex flex-col">
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
        ) : (
          renderLegacyContent()
        )}
        
      </div>
    </div>
  );
}
