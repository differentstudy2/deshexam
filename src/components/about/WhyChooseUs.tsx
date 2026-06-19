import { Card } from "@/components/ui/card";
import { Brain, MonitorCheck, LineChart, BookOpen, Languages, Zap } from "lucide-react";

export function WhyChooseUs() {
  const features = [
    {
      title: "Smart Practice Engine",
      description: "DeshExam's practice engine adapts to your learning speed and continuously generates questions tailored to your weakest subjects.",
      icon: Brain,
      color: "text-[#16A34A]",
      bg: "bg-[#16A34A]/10"
    },
    {
      title: "Real Exam Simulation",
      description: "Experience the exact interface and pressure of actual exams with our time-bound, strict simulation mode.",
      icon: MonitorCheck,
      color: "text-[#6366F1]",
      bg: "bg-[#6366F1]/10"
    },
    {
      title: "Progress Analytics",
      description: "Get highly detailed reports on your performance, time management, and percentile ranking amongst peers.",
      icon: LineChart,
      color: "text-[#F59E0B]",
      bg: "bg-[#F59E0B]/10"
    },
    {
      title: "Expert Study Material",
      description: "Access a rich library of study notes, formula sheets, and video lectures curated by top educators.",
      icon: BookOpen,
      color: "text-[#ec4899]",
      bg: "bg-[#ec4899]/10"
    },
    {
      title: "Multi-language Support",
      description: "Study and take exams in English, Bengali, and Hindi with our seamless multi-language toggle.",
      icon: Languages,
      color: "text-[#8b5cf6]",
      bg: "bg-[#8b5cf6]/10"
    },
    {
      title: "Fast Performance",
      description: "A lightning-fast, zero-lag platform ensures you never waste a second while taking a crucial test.",
      icon: Zap,
      color: "text-[#0ea5e9]",
      bg: "bg-[#0ea5e9]/10"
    }
  ];

  return (
    <section className="py-20 bg-[#F8FAFC]">
      <div className="container max-w-[1400px] mx-auto px-6">
        
        <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-[#64748B] uppercase tracking-widest mb-4">Section 4</h2>
            <h3 className="text-4xl font-extrabold text-[#0F172A] mb-4">Why Students Choose DeshExam</h3>
            <p className="text-lg text-[#64748B] max-w-2xl mx-auto">
                We combine cutting-edge technology with high-quality education to give you the ultimate competitive edge.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
                <Card key={idx} className="bg-white p-8 border-[#E2E8F0] shadow-sm hover:shadow-lg transition-all duration-300">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${feature.bg} ${feature.color}`}>
                        <feature.icon className="w-7 h-7" strokeWidth={2} />
                    </div>
                    <h4 className="text-xl font-bold text-[#0F172A] mb-3">{feature.title}</h4>
                    <p className="text-[#64748B] text-sm leading-relaxed">
                        {feature.description}
                    </p>
                </Card>
            ))}
        </div>

      </div>
    </section>
  );
}
