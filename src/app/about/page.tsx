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
  title: 'About DeshExam | Smart Learning Platform for Students',
  description: 'Learn about DeshExam, the modern educational platform offering mock tests, courses, question banks, documents, and AI-powered learning tools.',
  keywords: ['about deshexam', 'deshexam', 'deshexam platform', 'online learning platform india', 'mock test platform', 'education technology platform'],
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/about`,
  },
  openGraph: {
    title: 'About DeshExam',
    description: 'Learn about the DeshExam learning ecosystem.',
    images: ['/about-og-banner.jpg'],
  }
};

const jsonLdOrg = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "DeshExam",
  "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}`,
  "logo": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/logo.png`,
  "sameAs": [
    "https://facebook.com/deshexam",
    "https://youtube.com/deshexam"
  ]
};

const jsonLdAboutPage = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "name": "About DeshExam",
  "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/about`
};

const jsonLdWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "DeshExam",
  "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}`
};

export default function AboutUsPage() {
  return (
    <div className="flex flex-col min-h-screen font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdAboutPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }} />
      
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
