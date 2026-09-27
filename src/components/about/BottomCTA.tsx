import Link from "next/link";
import { Button } from "@/components/ui/button";

export function BottomCTA() {
  return (
    <section className="py-24 bg-white">
      <div className="container max-w-[1400px] mx-auto px-6">
          <div className="bg-gradient-to-r from-[#16A34A] to-[#7C3AED] rounded-3xl p-12 md:p-16 text-center relative overflow-hidden shadow-2xl">
             {/* Decorative blur elements */}
             <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>
             <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 blur-[100px] rounded-full mix-blend-multiply pointer-events-none"></div>
             
             <div className="relative z-10 max-w-3xl mx-auto">
                 <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
                    Join the Future of Learning
                 </h2>
                 <p className="text-white/90 text-lg md:text-xl mb-10 leading-relaxed">
                    Prepare smarter, score better, and achieve your goals with DeshExam. Thousands of students are already learning with us.
                 </p>
                 
                 <div className="flex flex-col sm:flex-row justify-center gap-4">
                     <Button asChild className="bg-white text-[#16A34A] hover:bg-slate-50 px-10 h-14 rounded-md font-bold text-base shadow-xl transition-all">
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
