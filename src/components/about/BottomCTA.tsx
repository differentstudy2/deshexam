import Link from "next/link";
import { Button } from "@/components/ui/button";

export function BottomCTA() {
  return (
    <section className="section-dark-blue py-24">
      <div className="container max-w-[1400px] mx-auto px-6">
          <div className="bg-white/[0.04] border border-[#d4af37]/30 rounded-3xl p-12 md:p-16 text-center relative overflow-hidden shadow-2xl">
             {/* Decorative blur elements */}
             <div className="absolute top-0 right-0 w-96 h-96 bg-[#2563eb]/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>
             <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#d4af37]/10 blur-[100px] rounded-full pointer-events-none"></div>
             
             <div className="relative z-10 max-w-3xl mx-auto">
                 <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
                    Join the Future of Learning
                 </h2>
                 <p className="text-slate-300 text-lg md:text-xl mb-10 leading-relaxed">
                    Prepare smarter, score better, and achieve your goals with DeshExam. Start with a free 5-question demo test — no login needed.
                 </p>
                 
                 <div className="flex flex-col sm:flex-row justify-center gap-4">
                     <Button asChild className="bg-[#d4af37] text-[#040a16] hover:bg-[#e5c15a] px-10 h-14 rounded-md font-bold text-base shadow-xl transition-all">
                         <Link href="/register">Start Learning</Link>
                     </Button>
                     <Button asChild variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white px-10 h-14 rounded-md font-bold text-base transition-all bg-transparent">
                         <Link href="/features">Explore Platform</Link>
                     </Button>
                 </div>
             </div>
          </div>
      </div>
    </section>
  );
}
