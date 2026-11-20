'use client';
import React, { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestionPaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

export default function QuestionPagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange
}: QuestionPaginationProps) {
    const [jumpPage, setJumpPage] = useState('');

    const handleJump = () => {
        const page = parseInt(jumpPage, 10);
        if (!isNaN(page) && page >= 1 && page <= totalPages) {
            onPageChange(page);
            setJumpPage('');
        }
    };

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 4) {
                pages.push(1, 2, 3, 4, 5, '...', totalPages);
            } else if (currentPage >= totalPages - 3) {
                pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pages;
    };

    if (totalItems <= itemsPerPage && totalItems > 0) return null; // Don't show if 1 page or empty

    return (
        <div className="w-full mt-[32px] flex flex-col items-center pb-8">
            <div className="text-sm text-slate-500 mb-4 font-medium">
                Showing {startItem}-{endItem} of {totalItems.toLocaleString()} questions
            </div>
            
            <div className="w-full flex flex-wrap items-center justify-center gap-x-8 gap-y-6">
                
                <div className="flex items-center gap-2 md:gap-3 flex-wrap justify-center">
                    <button 
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[15px] font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors text-slate-800 dark:text-slate-200"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Previous
                    </button>

                    {getPageNumbers().map((p, idx) => (
                        <button
                            key={idx}
                            onClick={() => typeof p === 'number' && onPageChange(p)}
                            disabled={p === '...'}
                            className={cn(
                                "flex items-center justify-center w-11 h-11 rounded-xl text-[15px] font-semibold border transition-colors shadow-sm",
                                p === currentPage 
                                    ? "bg-[#107c41] text-white border-[#107c41]" 
                                    : p === '...' 
                                        ? "bg-transparent border-transparent shadow-none text-slate-500" 
                                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                            )}
                        >
                            {p}
                        </button>
                    ))}

                    <button 
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[15px] font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors text-slate-800 dark:text-slate-200"
                    >
                        Next
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex flex-col items-center gap-1.5 w-auto">
                    <span className="text-[12px] font-bold text-slate-800 dark:text-slate-200">Jump To Page</span>
                    <div className="flex items-center gap-2">
                        <input 
                            type="number" 
                            min={1} 
                            max={totalPages}
                            value={jumpPage}
                            placeholder="12"
                            onChange={(e) => setJumpPage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleJump()}
                            className="w-16 h-10 px-2 text-center text-sm border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:border-[#107c41]"
                        />
                        <button 
                            onClick={handleJump}
                            className="h-10 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm text-slate-700 dark:text-slate-300"
                        >
                            Go
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
