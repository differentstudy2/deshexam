import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";

// NOTE: the previous team grid listed the same person ("MdjMiah") three
// times with three different roles and the same photo — placeholder data.
// It has been replaced with an honest empty state. Add real team members
// here only with their confirmed name, role, photo and bio.
export function TeamSection() {
  return (
    <section className="section-dark py-20">
      <div className="container max-w-[1400px] mx-auto px-6">
        
        <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Section 7</h2>
            <h3 className="text-4xl font-extrabold text-white mb-4">Meet Our Team</h3>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                The passionate educators, engineers, and designers behind DeshExam.
            </p>
        </div>

        <div className="max-w-3xl mx-auto">
            <Card className="p-10 text-center bg-white/[0.04] border border-[#d4af37]/30 shadow-sm">
                <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-6 bg-[#d4af37]/15 text-[#d4af37]">
                    <Users className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-white mb-3">Team details coming soon</h4>
                <p className="text-slate-300 leading-relaxed">
                    Our team members will be introduced here once their details are confirmed.
                </p>
            </Card>
        </div>

      </div>
    </section>
  );
}
