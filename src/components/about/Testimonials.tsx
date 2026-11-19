import { Card } from "@/components/ui/card";
import { MessageSquareQuote } from "lucide-react";

// NOTE: the previous testimonials (Rahul Verma — JEE, Sneha Das — NEET,
// Aditya Singh — WBCS, with picsum.photos avatars) were invented.
// They have been replaced with an honest empty state. Add testimonials
// here only with the real student's written permission.
export function Testimonials() {
  return (
    <section className="section-dark-teal py-24">
      <div className="container max-w-[1400px] mx-auto px-6">
        
        <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-[#d4af37] uppercase tracking-widest mb-4">Student Success Stories</h2>
            <h3 className="text-4xl font-extrabold text-white mb-4">Don&apos;t Just Take Our Word For It</h3>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                Real stories from real students will appear here, with their permission.
            </p>
        </div>

        <div className="max-w-3xl mx-auto">
            <Card className="p-10 text-center bg-white/[0.04] border border-[#d4af37]/30 shadow-sm">
                <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-6 bg-[#d4af37]/15 text-[#d4af37]">
                    <MessageSquareQuote className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-white mb-3">Student stories coming soon</h4>
                <p className="text-slate-300 leading-relaxed">
                    We are collecting feedback from our first students. Their stories —
                    in their own words — will be shared here once we have their permission.
                </p>
            </Card>
        </div>

      </div>
    </section>
  );
}
