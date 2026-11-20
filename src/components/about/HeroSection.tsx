import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <div className="section-dark-hero relative overflow-hidden text-white pt-24 pb-32">
      {/* Abstract Blur Effects — blue glow + gold accent, premium dark look */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#2563eb]/20 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#0ea5e9]/15 blur-[140px] rounded-full pointer-events-none z-0"></div>

      {/* Floating Elements (Decorative) */}
      <div className="hidden lg:block absolute top-32 left-[10%] bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-xl shadow-2xl animate-float opacity-80 z-10">
        <div className="w-8 h-8 rounded bg-[#16A34A]/20 flex items-center justify-center">
            <span className="text-xl">📘</span>
        </div>
      </div>
      <div className="hidden lg:block absolute top-40 right-[15%] bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 rounded-xl shadow-2xl animate-float delay-100 opacity-80 z-10 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-[#2563eb]/20 flex items-center justify-center">
            <span className="text-xl">📝</span>
        </div>
        <span className="text-sm font-semibold">Mock Tests</span>
      </div>
      <div className="hidden lg:block absolute bottom-32 left-[15%] bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-xl shadow-2xl animate-float delay-200 opacity-80 z-10">
        <div className="w-8 h-8 rounded bg-[#d4af37]/20 flex items-center justify-center">
            <span className="text-xl">🎓</span>
        </div>
      </div>
      <div className="hidden lg:block absolute bottom-40 right-[10%] bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 rounded-xl shadow-2xl animate-float delay-300 opacity-80 z-10 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-[#0ea5e9]/20 flex items-center justify-center">
            <span className="text-xl">📁</span>
        </div>
        <span className="text-sm font-semibold">Documents</span>
      </div>

      <div className="container max-w-[1400px] mx-auto px-6 relative z-20 text-center flex flex-col items-center">
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm text-xs font-semibold text-slate-300 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] shadow-[0_0_8px_rgba(22,163,74,0.8)]"></span>
            Empowering Education Through Technology
        </div>
        
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] max-w-4xl">
          About DeshExam
        </h1>
        
        <p className="text-lg md:text-xl text-slate-300 mb-12 max-w-3xl leading-relaxed">
          DeshExam is a modern educational platform helping students learn smarter through mock tests, courses, documents, question banks, exams, and AI-powered learning tools.
        </p>

        {/* NOTE: stats row removed — student/question/test/institution counts
            were unverified. Real numbers will be added here only once verified. */}
        
        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="bg-[#16A34A] hover:bg-[#15803d] text-white px-8 h-14 rounded-md font-bold text-base shadow-lg shadow-[#16A34A]/20 transition-all">
                <Link href="/features">Explore Platform</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/20 hover:bg-white/10 text-white hover:text-white px-8 h-14 rounded-md font-bold text-base backdrop-blur-sm transition-all bg-transparent">
                <Link href="/contact">Contact Us</Link>
            </Button>
        </div>

      </div>
    </div>
  );
}
