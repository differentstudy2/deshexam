import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

export function Testimonials() {
  const testimonials = [
    {
      name: "Rahul Verma",
      exam: "JEE Advanced Ranker",
      avatar: "https://picsum.photos/seed/rahul/100/100",
      content: "DeshExam's mock tests are incredibly close to the real thing. The detailed analytics helped me pinpoint my weak areas in Physics, which ultimately boosted my percentile from 92 to 99.4!",
    },
    {
      name: "Sneha Das",
      exam: "NEET Aspirant",
      avatar: "https://picsum.photos/seed/sneha/100/100",
      content: "The Biology question bank is unmatched. What I loved most were the step-by-step video solutions provided for the tough conceptual questions. Highly recommend it to all medical aspirants.",
    },
    {
      name: "Aditya Singh",
      exam: "WBCS Mains Candidate",
      avatar: "https://picsum.photos/seed/aditya/100/100",
      content: "Finding quality mock tests in Bengali was a struggle until I found DeshExam. The multi-language support and strict exam interface made my preparation seamless and confident.",
    }
  ];

  return (
    <section className="py-24 bg-[#F8FAFC]">
      <div className="container max-w-[1400px] mx-auto px-6">
        
        <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-[#16A34A] uppercase tracking-widest mb-4">Student Success Stories</h2>
            <h3 className="text-4xl font-extrabold text-[#0F172A] mb-4">Don't Just Take Our Word For It</h3>
            <p className="text-lg text-[#64748B] max-w-2xl mx-auto">
                Join thousands of students who have transformed their preparation and achieved their dream ranks.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testi, idx) => (
                <Card key={idx} className="bg-white p-8 border-[#E2E8F0] shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">
                    <div className="flex text-[#F59E0B] mb-6">
                        <Star className="w-5 h-5 fill-current" />
                        <Star className="w-5 h-5 fill-current" />
                        <Star className="w-5 h-5 fill-current" />
                        <Star className="w-5 h-5 fill-current" />
                        <Star className="w-5 h-5 fill-current" />
                    </div>
                    
                    <p className="text-[#334155] text-lg leading-relaxed italic mb-8 flex-grow">
                        "{testi.content}"
                    </p>
                    
                    <div className="flex items-center gap-4 mt-auto pt-6 border-t border-[#F1F5F9]">
                        <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                            <AvatarImage src={testi.avatar} alt={testi.name} />
                            <AvatarFallback>{testi.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h4 className="font-bold text-[#0F172A]">{testi.name}</h4>
                            <p className="text-xs font-bold text-[#16A34A] uppercase">{testi.exam}</p>
                        </div>
                    </div>
                </Card>
            ))}
        </div>

      </div>
    </section>
  );
}
