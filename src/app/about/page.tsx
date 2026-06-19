import type { Metadata } from 'next';
import { HeroSection } from "@/components/about/HeroSection";
import { LogoCloud } from "@/components/about/LogoCloud";
import { OurStory } from "@/components/about/OurStory";
import { MissionVision } from "@/components/about/MissionVision";
import { CoreValues } from "@/components/about/CoreValues";
import { WhatWeOffer } from "@/components/about/WhatWeOffer";
import { WhyChooseUs } from "@/components/about/WhyChooseUs";
import { PlatformDemo } from "@/components/about/PlatformDemo";
import { Testimonials } from "@/components/about/Testimonials";
import { TeamSection } from "@/components/about/TeamSection";
import { BottomCTA } from "@/components/about/BottomCTA";

export const metadata: Metadata = {
  title: 'About DeshExam | Empowering Education Through Technology',
  description: 'DeshExam is a modern educational platform helping students learn smarter through mock tests, courses, documents, question banks, exams, and AI-powered learning tools.',
  keywords: ['about deshexam', 'education team', 'edtech mission', 'exam preparation india', 'online mock tests'],
};

export default function AboutUsPage() {
  return (
    <div className="flex flex-col min-h-screen font-sans">
      <HeroSection />
      <LogoCloud />
      <OurStory />
      <MissionVision />
      <CoreValues />
      <WhatWeOffer />
      <WhyChooseUs />
      <PlatformDemo />
      <Testimonials />
      <TeamSection />
      <BottomCTA />
    </div>
  );
}
