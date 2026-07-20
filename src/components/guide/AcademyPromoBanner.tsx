import React from 'react';
import Link from 'next/link';
import { CheckCircle2, GraduationCap, BarChart, BookOpen, Brain, Trophy, FileText } from 'lucide-react';
import Image from 'next/image';

export function AcademyPromoBanner() {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-b from-[#0a1945] via-[#102462] to-[#050e29] shadow-xl text-white border border-blue-900/30 flex flex-col mt-4">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-32 h-32 rounded-full bg-blue-500/20 blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-40 h-40 rounded-full bg-indigo-500/10 blur-3xl"></div>
        {/* Little stars/dots */}
        <div className="absolute top-[15%] left-[10%] w-1 h-1 bg-white/40 rounded-full"></div>
        <div className="absolute top-[25%] right-[20%] w-1.5 h-1.5 bg-white/50 rounded-full"></div>
        <div className="absolute top-[45%] left-[85%] w-1 h-1 bg-white/30 rounded-full"></div>
        <div className="absolute bottom-[35%] left-[15%] w-1 h-1 bg-white/40 rounded-full"></div>
      </div>

      <div className="relative z-10 p-5 flex flex-col items-center text-center">
        {/* Logo Area */}
        <div className="flex items-center gap-2 mb-1">
          <div className="bg-white text-[#0a1945] p-1 rounded-md">
            <GraduationCap className="w-4 h-4 font-bold" />
          </div>
          <div className="flex flex-col items-start leading-none">
            <span className="font-bold text-sm tracking-wide">DeshExam</span>
            <span className="font-semibold text-xs text-blue-200">Academy</span>
          </div>
        </div>
        <div className="text-[9px] text-blue-300/80 mb-5 font-medium tracking-widest uppercase">
          Learn &bull; Practice &bull; Succeed
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold mb-1 leading-tight text-white">
          সঠিক প্রস্তুতি,
        </h3>
        <h3 className="text-xl font-bold mb-4 leading-tight text-amber-400">
          সফলতার চাবিকাঠি!
        </h3>

        {/* Graphic Placeholder (Replacing 3D image with Lucide Icons for now) */}
        <div className="relative w-full h-32 mb-4 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1945] to-transparent z-10 pointer-events-none"></div>
          {/* Abstract graphic representation */}
          <div className="relative z-0 flex items-center justify-center w-full h-full">
            <div className="absolute text-amber-400 z-10 top-2"><Trophy className="w-16 h-16 fill-amber-400 stroke-amber-200" /></div>
            <div className="absolute text-blue-300 z-0 bottom-4 -left-2 rotate-[-15deg]"><BookOpen className="w-12 h-12 fill-blue-800" /></div>
            <div className="absolute text-emerald-400 z-0 bottom-2 -right-2 rotate-[10deg]"><BookOpen className="w-14 h-14 fill-emerald-800" /></div>
          </div>
        </div>

        {/* Feature List (Glassmorphism) */}
        <div className="w-full bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-4 flex flex-col gap-2.5 mb-5 text-left">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-1 rounded-md"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /></div>
            <span className="text-xs font-medium text-slate-100">Mock Tests</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-1 rounded-md"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /></div>
            <span className="text-xs font-medium text-slate-100">Chapter-wise Practice</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-1 rounded-md"><FileText className="w-3.5 h-3.5 text-amber-400" /></div>
            <span className="text-xs font-medium text-slate-100">Previous Year Questions</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-1 rounded-md"><BarChart className="w-3.5 h-3.5 text-amber-400" /></div>
            <span className="text-xs font-medium text-slate-100">Smart Analytics</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-1 rounded-md"><Brain className="w-3.5 h-3.5 text-amber-400" /></div>
            <span className="text-xs font-medium text-slate-100">AI Performance Report</span>
          </div>
        </div>

        {/* CTA Button */}
        <Link href="/academy" className="w-full relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-300"></div>
          <div className="relative w-full bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white font-bold py-2.5 px-4 rounded-full shadow-lg transition-all text-sm flex items-center justify-center">
            Practice Today
          </div>
        </Link>
        <div className="text-[10px] text-slate-400 mt-2">Success Starts Here</div>
      </div>
    </div>
  );
}
