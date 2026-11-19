import { Card } from "@/components/ui/card";
import { Brain, MonitorCheck, LineChart, BookOpen, Languages, Zap, FileSearch, FileQuestion } from "lucide-react";

export function WhyChooseUs() {
  const features = [
    {
      title: "Smart Practice Engine",
      description: "DeshExam's practice engine adapts to your learning speed and continuously generates questions tailored to your weakest subjects.",
      icon: Brain,
      color: "text-[#4ade80]",
      bg: "bg-[#16A34A]/15"
    },
    {
      title: "Real Exam Simulation",
      description: "Experience the exact interface and pressure of actual exams with our time-bound, strict simulation mode.",
      icon: MonitorCheck,
      color: "text-[#818cf8]",
      bg: "bg-[#6366F1]/15"
    },
    {
      title: "Progress Analytics",
      description: "Get highly detailed reports on your performance and time management, so you can see exactly which chapters need work.",
      icon: LineChart,
      color: "text-[#fbbf24]",
      bg: "bg-[#F59E0B]/15"
    },
    {
      title: "Expert Study Material",
      description: "Access a rich library of study notes, formula sheets, and video lectures curated by the DeshExam Faculty.",
      icon: BookOpen,
      color: "text-[#f472b6]",
      bg: "bg-[#ec4899]/15"
    },
    {
      title: "Multi-language Support",
      description: "Study and take tests in Bengali or English — switch your medium anytime.",
      icon: Languages,
      color: "text-[#a78bfa]",
      bg: "bg-[#8b5cf6]/15"
    },
    {
      title: "Fast Performance",
      description: "A lightning-fast, zero-lag platform ensures you never waste a second while taking a crucial test.",
      icon: Zap,
      color: "text-[#38bdf8]",
      bg: "bg-[#0ea5e9]/15"
    },
    {
      title: "Previous-Year Papers",
      description: "Practise with Madhyamik and Higher Secondary previous-year question papers, chapter by chapter.",
      icon: FileQuestion,
      color: "text-[#fb7185]",
      bg: "bg-[#f43f5e]/15"
    },
    {
      title: "Detailed Solutions",
      description: "Review comprehensive, step-by-step explanations for every single question after you finish a mock test.",
      icon: FileSearch,
      color: "text-[#34d399]",
      bg: "bg-[#10b981]/15"
    }
  ];

  return (
    <section className="section-dark py-20">
      <div className="container max-w-[1400px] mx-auto px-6">
        
        <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Section 4</h2>
            <h3 className="text-4xl font-extrabold text-white mb-4">Why Students Choose DeshExam</h3>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                We combine cutting-edge technology with high-quality education to give you the ultimate competitive edge.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
                <Card key={idx} className="bg-white/[0.04] p-8 border-white/10 shadow-sm hover:shadow-lg hover:bg-white/[0.06] transition-all duration-300">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${feature.bg} ${feature.color}`}>
                        <feature.icon className="w-7 h-7" strokeWidth={2} />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-3">{feature.title}</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                        {feature.description}
                    </p>
                </Card>
            ))}
        </div>

      </div>
    </section>
  );
}
