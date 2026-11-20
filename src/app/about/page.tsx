import type { Metadata } from 'next';
import { HeroSection } from "@/components/about/HeroSection";
import { LogoCloud } from "@/components/about/LogoCloud";
import { OurStory } from "@/components/about/OurStory";
import { MissionVision } from "@/components/about/MissionVision";
import { CoreValues } from "@/components/about/CoreValues";
import { WhatWeOffer } from "@/components/about/WhatWeOffer";
import { WhyChooseUs } from "@/components/about/WhyChooseUs";
import { PlatformDemo } from "@/components/about/PlatformDemo";
import { BottomCTA } from "@/components/about/BottomCTA";

export const metadata: Metadata = {
  title: 'About DeshExam | Smart Learning Platform for Students',
  description: 'Learn about DeshExam — West Bengal Board exam preparation for Class 5–12 (WBBSE & WBCHSE): chapter-wise mock tests, courses, question banks, notes, and AI-powered learning tools in Bengali and English medium.',
  keywords: ['about deshexam', 'deshexam', 'deshexam platform', 'online learning platform india', 'mock test platform', 'education technology platform', 'WBBSE', 'WBCHSE'],
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}/about`,
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
  "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}`,
  "logo": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}/logo.png`,
  "sameAs": [
    "https://facebook.com/deshexam",
    "https://youtube.com/deshexam"
  ]
};

const jsonLdAboutPage = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "name": "About DeshExam",
  "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}/about`
};

const jsonLdWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "DeshExam",
  "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}`
};

export default function AboutUsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#040a16] font-body text-slate-100">
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

      {/*
        Removed 2026-11-20 (no-fake-data rule): <Testimonials /> showed
        fabricated student quotes with invented names (Rahul Verma / Sneha
        Das / Aditya Singh), fake exam ranks and picsum avatars.
        <TeamSection /> listed the same person three times under three
        different roles with dead "#" social links. Both sections live in
        src/components/about/* (outside this file's scope) and need real,
        permission-backed content before they can return.
      */}
      <section className="section-dark py-16">
        <div className="container mx-auto max-w-3xl px-6 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-amber-300/90">
            Team &amp; Student Stories
          </p>
          <h2 className="font-headline text-2xl font-extrabold text-white md:text-3xl">
            Built in Dinhata, West Bengal
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-slate-300">
            DeshExam is built and run by its founder in Dinhata, West Bengal,
            for Class 5–12 students of the West Bengal Board. Student stories
            will appear here once we have written permission to share them.
          </p>
        </div>
      </section>

      <BottomCTA />
    </div>
  );
}
