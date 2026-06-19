import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Linkedin, Twitter, Github } from "lucide-react";

export function TeamSection() {
  const teamMembers = [
    {
      name: "Aarav Sharma",
      role: "Founder & CEO",
      avatar: "https://picsum.photos/seed/AaravSharma/200/200",
      bio: "A passionate educator with a vision to make quality education accessible to every student in India.",
    },
    {
      name: "Saanvi Gupta",
      role: "Head of Content",
      avatar: "https://picsum.photos/seed/SaanviGupta/200/200",
      bio: "An experienced teacher and curriculum designer, ensuring our content is top-notch and highly effective.",
    },
    {
      name: "Vivaan Singh",
      role: "Lead Developer",
      avatar: "https://picsum.photos/seed/VivaanSingh/200/200",
      bio: "The tech wizard behind our platform, dedicated to creating a seamless and powerful learning experience.",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container max-w-[1400px] mx-auto px-6">
        
        <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-[#64748B] uppercase tracking-widest mb-4">Section 7</h2>
            <h3 className="text-4xl font-extrabold text-[#0F172A] mb-4">Meet Our Team</h3>
            <p className="text-lg text-[#64748B] max-w-2xl mx-auto">
                The passionate educators, engineers, and designers behind DeshExam.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {teamMembers.map((member, idx) => (
                <Card key={idx} className="text-center bg-white border-[#E2E8F0] shadow-sm hover:shadow-lg transition-all duration-300">
                    <CardContent className="pt-10 pb-8 px-6">
                        <Avatar className="w-32 h-32 mx-auto mb-6 border-4 border-white shadow-lg">
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <h4 className="text-xl font-bold text-[#0F172A] mb-1">{member.name}</h4>
                        <p className="text-sm font-bold text-[#16A34A] uppercase tracking-wider mb-4">{member.role}</p>
                        <p className="text-sm text-[#64748B] mb-6 leading-relaxed">
                            {member.bio}
                        </p>
                        
                        <div className="flex justify-center gap-4">
                            <a href="#" className="w-8 h-8 rounded-full bg-[#F8FAFC] flex items-center justify-center text-[#64748B] hover:text-[#0A66C2] hover:bg-blue-50 transition-colors">
                                <Linkedin className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-[#F8FAFC] flex items-center justify-center text-[#64748B] hover:text-[#1DA1F2] hover:bg-blue-50 transition-colors">
                                <Twitter className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-[#F8FAFC] flex items-center justify-center text-[#64748B] hover:text-[#181717] hover:bg-slate-100 transition-colors">
                                <Github className="w-4 h-4" />
                            </a>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>

      </div>
    </section>
  );
}
