import { BookOpen, GraduationCap, School, University, BookMarked } from "lucide-react";

export function LogoCloud() {
  const logos = [
    { name: "Delhi Public School", icon: School },
    { name: "Kolkata University", icon: University },
    { name: "Aakash Institute", icon: BookOpen },
    { name: "Kendriya Vidyalaya", icon: GraduationCap },
    { name: "FIITJEE", icon: BookMarked },
  ];

  return (
    <div className="py-10 bg-white border-b border-[#E2E8F0]">
      <div className="container max-w-[1400px] mx-auto px-6 text-center">
        <p className="text-sm font-bold text-[#64748B] uppercase tracking-widest mb-8">
          Trusted by Top Institutions & Coaching Centers
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
          {logos.map((logo, idx) => (
            <div key={idx} className="flex items-center gap-2 text-[#0F172A] hover:text-[#16A34A] transition-colors">
              <logo.icon className="w-8 h-8" />
              <span className="font-bold text-lg md:text-xl">{logo.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
