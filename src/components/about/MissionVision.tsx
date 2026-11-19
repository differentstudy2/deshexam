import { Card } from "@/components/ui/card";
import { Target, Rocket, Users, FileText } from "lucide-react";

export function MissionVision() {
  return (
    <section className="section-dark-teal py-20">
      <div className="container max-w-[1400px] mx-auto px-6">
        
        {/* Top: Mission & Vision Cards */}
        <div className="mb-24">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Section 1</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Mission Card */}
                <Card className="p-8 border-white/10 bg-white/[0.04] hover:bg-white/[0.06] transition-colors shadow-sm">
                    <div className="w-12 h-12 rounded-lg bg-[#16A34A]/20 flex items-center justify-center mb-6 text-[#4ade80]">
                        <Target className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">Mission</h3>
                    <p className="text-slate-300 text-lg leading-relaxed">
                        Make quality education accessible to every student.
                    </p>
                </Card>

                {/* Vision Card */}
                <Card className="p-8 border-white/10 bg-white/[0.04] hover:bg-white/[0.06] transition-colors shadow-sm">
                    <div className="w-12 h-12 rounded-lg bg-[#d4af37]/20 flex items-center justify-center mb-6 text-[#d4af37]">
                        <Rocket className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">Vision</h3>
                    <p className="text-slate-300 text-lg leading-relaxed">
                        Build India&apos;s smartest AI-powered learning ecosystem.
                    </p>
                </Card>
            </div>
        </div>

        {/* Bottom: honest numbers note + factual cards */}
        <div>
            <div className="flex flex-col lg:flex-row gap-12 items-center mb-12">
                
                {/* Left Text */}
                <div className="lg:w-1/3">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Section 2</h2>
                    <h2 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight">
                        Make quality accessible to every student
                    </h2>
                </div>

                {/* Right: honest empty state — no unverified counts.
                    Student/question/institution counts and success rates were
                    removed (50,000+ students, 150,000+ questions, 5,000+
                    institutions, 92% success rate). Real numbers will be
                    published here only after they are verified. */}
                <div className="lg:w-2/3 w-full">
                    <div className="p-8 bg-white/[0.04] rounded-2xl border border-[#d4af37]/30">
                        <p className="text-sm font-bold text-[#d4af37] mb-2 uppercase tracking-wider">Our numbers, honestly</p>
                        <p className="text-lg text-slate-300 leading-relaxed">
                            We are a growing platform. Student counts, question counts and
                            success rates will be published here only after they are verified
                            — no inflated numbers.
                        </p>
                    </div>
                </div>
            </div>

            {/* Factual Cards - Full Width Grid (no invented numbers) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-gradient-to-br from-[#16A34A] to-[#15803d] p-10 text-white border-0 shadow-lg relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-48 h-48 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm">
                        <Users className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-sm font-bold text-white/80 uppercase tracking-widest mb-2">Classes</h4>
                    <h3 className="text-4xl md:text-5xl font-extrabold mb-3">Class 5–12</h3>
                    <p className="text-white/80 text-base md:text-lg">West Bengal Board — WBBSE &amp; WBCHSE</p>
                </Card>

                <Card className="bg-gradient-to-br from-[#1d4ed8] to-[#1e3a8a] p-10 text-white border-0 shadow-lg relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-48 h-48 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm">
                        <FileText className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-sm font-bold text-white/80 uppercase tracking-widest mb-2">Mock Tests</h4>
                    <h3 className="text-4xl md:text-5xl font-extrabold mb-3">Timed Practice</h3>
                    <p className="text-white/80 text-base md:text-lg">Chapter-wise MCQ, previous-year papers and mock tests</p>
                </Card>
            </div>
        </div>

      </div>
    </section>
  );
}
