import { Card } from "@/components/ui/card";
import { Target, Rocket, Users, FileText, School, CheckCircle2 } from "lucide-react";

export function MissionVision() {
  return (
    <section className="py-20 bg-white">
      <div className="container max-w-[1400px] mx-auto px-6">
        
        {/* Top: Mission & Vision Cards */}
        <div className="mb-24">
            <h2 className="text-sm font-bold text-[#64748B] uppercase tracking-widest mb-4">Section 1</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Mission Card */}
                <Card className="p-8 border-[#16A34A]/20 bg-[#16A34A]/5 hover:bg-[#16A34A]/10 transition-colors shadow-sm">
                    <div className="w-12 h-12 rounded-lg bg-[#16A34A]/20 flex items-center justify-center mb-6 text-[#16A34A]">
                        <Target className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#0F172A] mb-3">Mission</h3>
                    <p className="text-[#64748B] text-lg leading-relaxed">
                        Make quality education accessible to every student.
                    </p>
                </Card>

                {/* Vision Card */}
                <Card className="p-8 border-[#7C3AED]/20 bg-[#7C3AED]/5 hover:bg-[#7C3AED]/10 transition-colors shadow-sm">
                    <div className="w-12 h-12 rounded-lg bg-[#7C3AED]/20 flex items-center justify-center mb-6 text-[#7C3AED]">
                        <Rocket className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#0F172A] mb-3">Vision</h3>
                    <p className="text-[#64748B] text-lg leading-relaxed">
                        Build India's smartest AI-powered learning ecosystem.
                    </p>
                </Card>
            </div>
        </div>

        {/* Bottom: Stats & Cards Layout */}
        <div>
            <h2 className="text-sm font-bold text-[#64748B] uppercase tracking-widest mb-4">Section 2</h2>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                
                {/* Left Text */}
                <div className="lg:col-span-4">
                    <h2 className="text-4xl lg:text-5xl font-extrabold text-[#0F172A] leading-tight">
                        Make quality accessible to every student
                    </h2>
                </div>

                {/* Right Stats & Cards */}
                <div className="lg:col-span-8 space-y-12">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
                        <div>
                            <p className="text-sm font-bold text-[#64748B] mb-1">Students</p>
                            <h3 className="text-3xl font-extrabold text-[#0F172A]">50,000+</h3>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-[#64748B] mb-1">Questions</p>
                            <h3 className="text-3xl font-extrabold text-[#0F172A]">150,000+</h3>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-[#64748B] mb-1">Institutions</p>
                            <h3 className="text-3xl font-extrabold text-[#0F172A]">5,000+</h3>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-[#64748B] mb-1">Success Rate</p>
                            <h3 className="text-3xl font-extrabold text-[#0F172A]">92%</h3>
                        </div>
                    </div>

                    {/* Colored Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Card className="bg-gradient-to-br from-[#16A34A] to-[#15803d] p-8 text-white border-0 shadow-lg relative overflow-hidden group">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-500"></div>
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-6 backdrop-blur-sm">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <h4 className="text-sm font-bold text-white/80 uppercase tracking-widest mb-1">Students</h4>
                            <h3 className="text-3xl font-extrabold mb-2">50,000+</h3>
                            <p className="text-white/80 text-sm">Active learners daily</p>
                        </Card>

                        <Card className="bg-gradient-to-br from-[#7C3AED] to-[#5b21b6] p-8 text-white border-0 shadow-lg relative overflow-hidden group">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-500"></div>
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-6 backdrop-blur-sm">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <h4 className="text-sm font-bold text-white/80 uppercase tracking-widest mb-1">Mock Tests</h4>
                            <h3 className="text-3xl font-extrabold mb-2">2M+</h3>
                            <p className="text-white/80 text-sm">Tests taken to date</p>
                        </Card>
                    </div>
                </div>

            </div>
        </div>

      </div>
    </section>
  );
}
