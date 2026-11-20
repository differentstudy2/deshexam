import { Metadata } from 'next';
import { ContactForm } from '@/components/contact/ContactForm';
import { ContactMethods } from '@/components/contact/ContactMethods';
import { SupportFAQ } from '@/components/contact/SupportFAQ';
import { SupportInfo } from '@/components/contact/SupportInfo';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, CheckCircle2, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Contact DeshExam Support | Help, Feedback & Assistance',
  description: 'Contact DeshExam support for help with mock tests, subscriptions, payments, technical issues, feedback, and student assistance.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}/contact`,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Contact DeshExam Support',
    description: 'Get help with subscriptions, mock tests and support.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}/contact`,
    images: [
      {
        url: '/contact-og-banner.jpg',
        width: 1200,
        height: 630,
        alt: 'Contact DeshExam Support',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact DeshExam Support',
    description: 'Get help with subscriptions, mock tests and support.',
    images: ['/contact-og-banner.jpg'],
  },
};

const jsonLdOrg = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "DeshExam",
  "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}`,
  "logo": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deshexam.vercel.app'}/logo.png`,
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+916294006590",
    "contactType": "customer support",
    "areaServed": "IN",
    "availableLanguage": ["English", "Bengali", "Hindi"]
  }
};

const jsonLdLocalBusiness = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "DeshExam",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Dwarikamari, Petla",
    "addressLocality": "Dinhata",
    "addressRegion": "West Bengal",
    "postalCode": "736135",
    "addressCountry": "IN"
  },
  "telephone": "+916294006590"
};

const jsonLdFAQ = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How to reset password?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Click on 'Forgot Password' on the login screen. Enter your registered email address, and we'll send you a link to securely reset your password."
      }
    },
    {
      "@type": "Question",
      "name": "How to upgrade premium?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Navigate to the Pricing page, select the Pro plan that suits your needs, and click 'Upgrade'."
      }
    },
    {
      "@type": "Question",
      "name": "How to contact support?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can contact support via Email, WhatsApp, or Phone from our Contact Page."
      }
    }
  ]
};

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#040a16] font-body text-slate-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdLocalBusiness) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFAQ) }} />

      {/* 1. Premium Hero Section — deep navy, blue glow, gold accents */}
      <div className="section-dark-hero relative overflow-hidden pt-20 pb-24 text-white">
        {/* Blue glow + gold glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#2563eb]/25 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/3 w-[500px] h-[500px] bg-[#0ea5e9]/15 blur-[140px] rounded-full pointer-events-none"></div>

        <div className="container max-w-[1400px] mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left side: Text & CTA */}
            <div className="lg:col-span-7 xl:col-span-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-amber-300/30 mb-8 backdrop-blur-sm text-xs font-medium text-amber-200">
                <span className="w-2 h-2 rounded-full bg-[#16A34A] shadow-[0_0_8px_rgba(22,163,74,0.8)]"></span>
                Student Support
              </div>

              <h1 className="font-headline text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                Contact DeshExam Support
              </h1>

              <p className="text-lg text-slate-300 mb-10 max-w-xl leading-relaxed">
                Need help with mock tests, subscriptions, documents, courses, or technical issues? Our support team is here to help.
              </p>

              {/* What support covers — real topics, no invented stats */}
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-10 max-w-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#d4af37]" />
                  <span className="text-sm font-medium text-slate-200">Mock test &amp; technical help</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#d4af37]" />
                  <span className="text-sm font-medium text-slate-200">Subscription &amp; payment help</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#d4af37]" />
                  <span className="text-sm font-medium text-slate-200">Feedback &amp; suggestions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#d4af37]" />
                  <span className="text-sm font-medium text-slate-200">Email &amp; phone support</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild className="bg-[#d4af37] hover:bg-amber-400 text-[#042f2e] px-8 h-12 rounded-full font-bold text-sm shadow-lg shadow-amber-500/20 transition-all">
                  <Link href="#contact-form">Contact Support</Link>
                </Button>
                <Button variant="outline" asChild className="border-white/20 hover:bg-white/10 text-white hover:text-white px-8 h-12 rounded-full font-bold text-sm backdrop-blur-sm transition-all bg-transparent">
                  <Link href="/faqs">Help Center</Link>
                </Button>
              </div>
            </div>

            {/* Right side: Illustration & real contact card */}
            <div className="lg:col-span-5 xl:col-span-6 relative flex justify-center lg:justify-end mt-12 lg:mt-0">
              <div className="relative w-full max-w-[380px]">
                <div className="relative z-10 bg-[#0F172A]/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 pt-0 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center">

                  {/* Illustration overlapping the top */}
                  <div className="w-72 h-72 -mt-20 mb-2 z-20 drop-shadow-2xl animate-float pointer-events-none">
                    <Image src="/support-illustration.png" alt="DeshExam student support team helping learners" width={288} height={288} className="w-full h-full object-contain" />
                  </div>

                  {/* Real contact details — replaces the invented
                      "120K+ tickets / 98% satisfaction / 2h / 12+ agents" stats */}
                  <div className="space-y-5 w-full">
                    <div className="flex items-start gap-3 border-b border-white/10 pb-4">
                      <Mail className="w-5 h-5 shrink-0 text-[#d4af37]" />
                      <div>
                        <p className="text-slate-300 font-medium text-sm">Email us at</p>
                        <a href="mailto:support@deshexam.com" className="text-white font-bold hover:text-amber-300 hover:underline">support@deshexam.com</a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 border-b border-white/10 pb-4">
                      <Phone className="w-5 h-5 shrink-0 text-[#d4af37]" />
                      <div>
                        <p className="text-slate-300 font-medium text-sm">Call us at</p>
                        <a href="tel:+916294006590" className="text-white font-bold hover:text-amber-300 hover:underline">+91 62940 06590</a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 pb-2">
                      <MapPin className="w-5 h-5 shrink-0 text-[#d4af37]" />
                      <div>
                        <p className="text-slate-300 font-medium text-sm">Office</p>
                        <p className="text-white font-bold">Dwarikamari, Petla, Dinhata, West Bengal 736135</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-[1400px] mx-auto px-6 py-16 space-y-20">

        {/* SEO On-Page Content Block */}
        <section className="section-dark rounded-2xl p-8 max-w-5xl">
          <h2 className="font-headline text-3xl font-bold mb-4 text-white">Why Contact DeshExam Support?</h2>
          <p className="text-slate-300 mb-6 leading-relaxed">
            <strong className="text-white">DeshExam</strong> is dedicated to providing swift, effective assistance.
            Whether you are exploring our platform for the first time or actively preparing for board exams, our support team helps resolve issues so your exam preparation remains uninterrupted.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div>
              <h3 className="text-xl font-bold mb-3 text-white">Mock Test &amp; Technical Help</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Facing issues while taking an <Link href="/mock-tests" className="text-emerald-400 hover:underline font-medium">online mock test</Link>?
                Or perhaps you need help accessing detailed analytics? Our technical support resolves bugs, loading errors, and performance issues so your exam preparation remains uninterrupted. Check out our <Link href="/features" className="text-emerald-400 hover:underline font-medium">Platform Features</Link> to ensure you are utilizing the system correctly.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3 text-white">Subscription &amp; Payment Assistance</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                If you need guidance choosing the right premium plan, or if a payment has failed, our customer care team is available to help.
                Need help with premium upgrades? Visit our <Link href="/pricing" className="text-emerald-400 hover:underline font-medium">Pricing Page</Link> for detailed tier breakdowns, or view the <Link href="/faqs" className="text-emerald-400 hover:underline font-medium">FAQ</Link> for our refund and cancellation policies.
              </p>
            </div>
          </div>
        </section>

        {/* QUICK CONTACT METHODS */}
        <section>
          <div className="mb-6">
            <h2 className="text-xs font-bold text-amber-300/90 uppercase tracking-wider mb-2">Quick Contact Methods</h2>
          </div>
          <ContactMethods />
        </section>

        {/* CONTACT FORM & SUPPORT INFO */}
        <section id="contact-form" className="scroll-mt-20">
          <div className="mb-6">
            <h2 className="text-xs font-bold text-amber-300/90 uppercase tracking-wider mb-2">Contact Form</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 xl:col-span-9">
              {/* Inline backgroundColor: guarantees the solid dark card even
                  if the generated Tailwind CSS is stale/cached — a
                  class-only bg was observed rendering white on the preview. */}
              <div className="rounded-2xl border border-white/10 bg-[#0a1626] p-8" style={{ backgroundColor: '#0a1626' }}>
                <ContactForm />
              </div>
            </div>
            <div className="lg:col-span-4 xl:col-span-3 h-full">
              <SupportInfo />
            </div>
          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <section>
          <div className="mb-6">
            <h2 className="text-xs font-bold text-amber-300/90 uppercase tracking-wider mb-2">FAQ</h2>
          </div>
          <SupportFAQ />
        </section>

        {/* HELP CENTER CTA */}
        <section>
          <div className="mb-6">
            <h2 className="text-xs font-bold text-amber-300/90 uppercase tracking-wider mb-2">Help Center CTA</h2>
          </div>
          <div className="section-dark-blue rounded-2xl p-12 relative overflow-hidden shadow-xl text-white">
            <div className="relative z-10">
              <h2 className="font-headline text-4xl font-extrabold mb-4">Need Instant Help?</h2>
              <p className="text-slate-300 text-lg mb-8 max-w-2xl">Browse our help center for quick solutions and tutorials.</p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild className="bg-[#d4af37] text-[#042f2e] hover:bg-amber-400 px-8 h-12 rounded-full font-bold text-sm shadow-lg transition-all">
                  <Link href="/faqs">Visit Help Center</Link>
                </Button>
                <Button asChild variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white px-8 h-12 rounded-full font-bold text-sm transition-all bg-transparent">
                  <Link href="/faqs">Browse FAQs</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* MAP / LOCATION */}
        <section className="pb-16">
          <div className="mb-6">
            <h2 className="text-xs font-bold text-amber-300/90 uppercase tracking-wider mb-2">Map / Location</h2>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0a1626] overflow-hidden">
            <div className="p-8 border-b border-white/10">
              <h3 className="font-headline text-2xl font-extrabold text-white">DeshExam Headquarters</h3>
            </div>
            <div className="p-6 relative h-[400px]">
              <div className="w-full h-full rounded-xl overflow-hidden relative bg-slate-900 border border-white/10">
                <iframe
                  src="https://maps.google.com/maps?q=Dwarikamari,%20Petla,%20Dinhata,%20West%20Bengal%20736135&t=&z=14&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 grayscale contrast-125 opacity-90"
                />
                <div className="absolute top-1/2 right-12 -translate-y-1/2 bg-[#0a1626] rounded-xl shadow-xl p-6 min-w-[280px] border border-white/10 z-10 hidden md:block">
                  <div className="flex items-start gap-3">
                    <MapPin className="text-[#d4af37] w-6 h-6 shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-white mb-2">Office Location</h4>
                      <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                        Dwarikamari, Petla, Dinhata,<br/>West Bengal 736135, India
                      </p>
                      <a href="https://maps.google.com/?q=Dwarikamari,+Petla,+Dinhata,+West+Bengal+736135" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-bold text-amber-300 hover:underline">
                        Get Directions &rarr;
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
