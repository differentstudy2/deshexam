
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BarChart, Users, TrendingUp, Target, Lightbulb, Heart } from "lucide-react";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about the passionate team of educators and technologists behind DeshExam, dedicated to revolutionizing exam preparation in India with high-quality, accessible, and affordable education.',
  keywords: ['about deshexam', 'education team', 'edtech mission', 'exam preparation india'],
};

const teamMembers = [
  {
    name: "Aarav Sharma",
    role: "Founder & CEO",
    avatar: "https://picsum.photos/seed/AaravSharma/100/100",
    bio: "A passionate educator with a vision to make quality education accessible to every student in India.",
  },
  {
    name: "Saanvi Gupta",
    role: "Head of Content",
    avatar: "https://picsum.photos/seed/SaanviGupta/100/100",
    bio: "An experienced teacher and curriculum designer, ensuring our content is top-notch and effective.",
  },
  {
    name: "Vivaan Singh",
    role: "Lead Developer",
    avatar: "https://picsum.photos/seed/VivaanSingh/100/100",
    bio: "The tech wizard behind our platform, dedicated to creating a seamless and powerful learning experience.",
  },
];

const whyChooseUs = [
    {
        icon: <BarChart className="w-10 h-10 text-primary" />,
        title: "Comprehensive Analytics",
        description: "Get detailed insights into your performance to identify strengths and weaknesses."
    },
    {
        icon: <Users className="w-10 h-10 text-primary" />,
        title: "Expert-Crafted Content",
        description: "Our tests and materials are created by subject-matter experts for top-quality preparation."
    },
    {
        icon: <TrendingUp className="w-10 h-10 text-primary" />,
        title: "Proven Results",
        description: "Join thousands of successful students who have achieved their exam goals with DeshExam."
    }
];

export default function AboutUsPage() {
  return (
    <div className="bg-secondary/30">
      <div className="container py-12 md:py-16">
        <header className="text-center mb-16">
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">
            About DeshExam
          </h1>
          <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
            We are a team of passionate educators and technologists dedicated to revolutionizing exam preparation in India.
          </p>
        </header>

        <section id="mission" className="mb-20">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                     <Image
                        src="https://picsum.photos/seed/mission/600/400"
                        alt="A student looking determined while studying"
                        width={600}
                        height={400}
                        className="rounded-lg shadow-xl"
                        data-ai-hint="student determined"
                    />
                </div>
                <div className="space-y-4">
                    <h2 className="font-headline text-3xl font-bold tracking-tighter">Our Mission</h2>
                    <p className="text-muted-foreground text-lg">
                        Our mission is to empower every student with the tools and confidence they need to excel in their competitive exams. We believe in providing high-quality, accessible, and affordable education to help aspirants achieve their dreams.
                    </p>
                    <div className="flex items-center gap-4 pt-2">
                        <Target className="w-8 h-8 text-primary" />
                        <p className="font-semibold">To provide the most realistic exam simulation.</p>
                    </div>
                     <div className="flex items-center gap-4">
                        <Lightbulb className="w-8 h-8 text-primary" />
                        <p className="font-semibold">To make learning personalized and data-driven.</p>
                    </div>
                     <div className="flex items-center gap-4">
                        <Heart className="w-8 h-8 text-primary" />
                        <p className="font-semibold">To build a supportive community of learners.</p>
                    </div>
                </div>
            </div>
        </section>

        <section id="team" className="mb-20">
            <div className="text-center mb-12">
                 <h2 className="font-headline text-3xl font-bold tracking-tighter">
                    Meet the Team
                </h2>
                <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
                    The passionate minds behind DeshExam.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <Card key={member.name} className="text-center">
                <CardContent className="pt-6">
                  <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-background">
                    <AvatarImage src={member.avatar} data-ai-hint="person face" />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-bold font-headline">{member.name}</h3>
                  <p className="text-primary font-semibold">{member.role}</p>
                  <p className="text-sm text-muted-foreground mt-2">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

         <section id="why-us" className="w-full py-12">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
                    Why Choose DeshExam?
                    </h2>
                    <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        We blend expert content with intelligent technology to create a learning experience that is both effective and engaging.
                    </p>
                </div>
                <div className="mx-auto grid items-start gap-8 sm:max-w-4xl sm:grid-cols-1 md:gap-12 lg:max-w-5xl lg:grid-cols-3">
                    {whyChooseUs.map((reason) => (
                    <div key={reason.title} className="grid gap-4 text-center">
                        <div className="flex justify-center">{reason.icon}</div>
                        <h3 className="text-xl font-bold font-headline">{reason.title}</h3>
                        <p className="text-muted-foreground">{reason.description}</p>
                    </div>
                    ))}
                </div>
            </div>
        </section>
      </div>
    </div>
  );
}
