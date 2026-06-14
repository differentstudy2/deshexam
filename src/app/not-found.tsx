'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DeshExamLogo } from '@/components/icons';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-slate-50/50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] p-8 md:p-12 max-w-[500px] w-full text-center border border-slate-100">
        
        {/* Logo Area */}
        <div className="flex justify-center items-center mb-8">
            <DeshExamLogo />
        </div>

        {/* 404 Header */}
        <h1 className="text-[100px] md:text-[130px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-[#14b8a6] to-[#3b82f6]">
          404
        </h1>
        
        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mt-4 mb-3">
          পেজটি পাওয়া যায়নি
        </h2>
        
        {/* Description */}
        <p className="text-slate-500 text-sm md:text-base leading-relaxed px-2">
          দুঃখিত, আপনি যে লিংকটি খুঁজছেন তা হয়তো সরানো হয়েছে অথবা এটি অস্তিত্বহীন।
        </p>

        {/* Primary Action */}
        <Link href="/" className="block mt-10">
          <button className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-medium text-base py-4 rounded-xl transition-all shadow-sm shadow-emerald-500/20 active:scale-[0.98]">
            হোমপেজে ফিরে যান
          </button>
        </Link>

        {/* Secondary Actions */}
        <div className="flex items-center gap-4 mt-4">
          <button 
            onClick={() => router.back()} 
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm py-4 rounded-xl transition-all active:scale-[0.98]"
          >
            ← পেছনে যান
          </button>
          
          <Link href="/contact" className="flex-1">
            <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm py-4 rounded-xl transition-all active:scale-[0.98]">
              যোগাযোগ
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}
