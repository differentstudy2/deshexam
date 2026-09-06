import { Card } from "@/components/ui/card";
import { Heart, Lightbulb, ShieldCheck } from "lucide-react";

export function CoreValues() {
  const values = [
    {
      title: "Student First",
      description: "Every decision we make, every feature we build, is centered entirely around improving the student experience.",
      icon: Heart,
      color: "text-rose-500",
      bg: "bg-rose-500/10"
    },
    {
      title: "Continuous Innovation",
      description: "We constantly evolve our AI algorithms and platform technology to keep you ahead of the curve.",
      icon: Lightbulb,
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    },
    {
      title: "Uncompromising Quality",
      description: "From our codebase to our question banks, we maintain the highest standards of accuracy and excellence.",
      icon: ShieldCheck,
      color: "text-[#16A34A]",
      bg: "bg-[#16A34A]/10"
    }
  ];

  return (
    <section className="py-20 bg-white border-t border-[#E2E8F0]">
      <div className="container max-w-[1400px] mx-auto px-6">
        
        <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-[#64748B] uppercase tracking-widest mb-4">Our DNA</h2>
            <h3 className="text-4xl font-extrabold text-[#0F172A] mb-4">Core Values</h3>
            <p className="text-lg text-[#64748B] max-w-2xl mx-auto">
                The principles that drive us to build the best educational platform in India.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {values.map((value, idx) => (
                <Card key={idx} className="p-8 text-center border-[#E2E8F0] shadow-sm hover:shadow-lg transition-all duration-300">
                    <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-6 ${value.bg} ${value.color}`}>
                        <value.icon className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-bold text-[#0F172A] mb-3">{value.title}</h4>
                    <p className="text-[#64748B] leading-relaxed">
                        {value.description}
                    </p>
                </Card>
            ))}
        </div>

      </div>
    </section>
  );
}
