import { Card } from "@/components/ui/card";
import { FileText, BrainCircuit, GraduationCap, CalendarDays, FolderOpen, Database, Sparkles } from "lucide-react";
import Link from "next/link";

export function WhatWeOffer() {
  const offers = [
    {
      title: "Mock Tests",
      description: "State-of-the-art exam simulation with detailed analytics and all-India ranking.",
      icon: FileText,
      bg: "bg-gradient-to-br from-[#16A34A] to-[#15803d]",
      link: "/mock-tests"
    },
    {
      title: "Quiz System",
      description: "Quick, interactive quizzes to test your knowledge on specific topics instantly.",
      icon: BrainCircuit,
      bg: "bg-gradient-to-br from-[#06b6d4] to-[#0891b2]",
      link: "/quiz"
    },
    {
      title: "Courses",
      description: "Comprehensive video lectures and study materials from top educators.",
      icon: GraduationCap,
      bg: "bg-gradient-to-br from-[#d946ef] to-[#c026d3]",
      link: "#"
    },
    {
      title: "Exams",
      description: "Information and preparation hubs for all major competitive exams.",
      icon: CalendarDays,
      bg: "bg-gradient-to-br from-[#f97316] to-[#ea580c]",
      link: "/exams"
    },
    {
      title: "Documents",
      description: "Downloadable PDFs, previous year papers, and high-yield notes.",
      icon: FolderOpen,
      bg: "bg-gradient-to-br from-[#64748b] to-[#475569]",
      link: "/documents"
    },
    {
      title: "Question Bank",
      description: "Vast repository of practice questions with step-by-step solutions.",
      icon: Database,
      bg: "bg-gradient-to-br from-[#3b82f6] to-[#2563eb]",
      link: "/question-bank"
    },
    {
      title: "Institution Directory",
      description: "Find and connect with top coaching centers and schools in your area.",
      icon: School,
      bg: "bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed]",
      link: "/institutions"
    },
    {
      title: "AI Learning Tools",
      description: "Smart, adaptive algorithms that personalize your study plan and highlight weak areas.",
      icon: Sparkles,
      bg: "bg-gradient-to-br from-[#0ea5e9] to-[#0284c7]",
      link: "/features"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container max-w-[1400px] mx-auto px-6">
        
        <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-[#64748B] uppercase tracking-widest mb-4">Section 3</h2>
            <h3 className="text-4xl font-extrabold text-[#0F172A] mb-4">What DeshExam Offers</h3>
            <p className="text-lg text-[#64748B] max-w-2xl mx-auto">
                Discover a wide range of tools designed to accelerate your learning and boost your exam scores.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {offers.map((offer, idx) => (
                <Card key={idx} className={`${offer.bg} p-8 text-white border-0 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group`}>
                    <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-500"></div>
                    
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-6 backdrop-blur-sm">
                        <offer.icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-bold mb-3">{offer.title}</h3>
                    <p className="text-white/80 text-sm leading-relaxed mb-6 flex-grow">
                        {offer.description}
                    </p>
                    
                    <Link href={offer.link} className="inline-flex items-center text-sm font-bold text-white hover:underline mt-auto">
                        Learn more &rarr;
                    </Link>
                </Card>
            ))}
        </div>

      </div>
    </section>
  );
}

// Ensure School is imported since I used it.
import { School } from "lucide-react";
