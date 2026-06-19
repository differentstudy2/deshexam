import { Metadata } from 'next';
import { ContactForm } from '@/components/contact/ContactForm';
import { ContactMethods } from '@/components/contact/ContactMethods';
import { SupportFAQ } from '@/components/contact/SupportFAQ';
import { SupportInfo } from '@/components/contact/SupportInfo';
import Link from 'next/link';
import { MapPin, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Contact DeshExam Support | Help, Feedback & Assistance',
  description: 'Contact DeshExam support for help with mock tests, subscriptions, payments, technical issues, feedback, and student assistance.',
  alternates: {
    canonical: 'https://deshexam.com/contact',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Contact DeshExam Support',
    description: 'Get help with subscriptions, mock tests and support.',
    url: 'https://deshexam.com/contact',
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
  "url": "https://deshexam.com",
  "logo": "https://deshexam.com/logo.png",
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
    "streetAddress": "123",
    "addressLocality": "Baharampur",
    "addressRegion": "West Bengal",
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
        "text": "Navigate to the Pricing page, select the Pass Pro plan that suits your needs, and click 'Upgrade'."
      }
    },
    {
      "@type": "Question",
      "name": "How to contact support?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can contact support via Email, WhatsApp, Phone, or Live Chat from our Contact Page."
      }
    }
  ]
};

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] font-sans text-[#0F172A]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdLocalBusiness) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFAQ) }} />

      {/* 1. Premium Hero Section */}
      <div className="relative bg-[#0F172A] overflow-hidden text-white pt-20 pb-24 border-b border-[#1e293b]">
        {/* Abstract Blur Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7C3AED]/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/3 w-[500px] h-[500px] bg-[#6366F1]/20 blur-[140px] rounded-full pointer-events-none"></div>

        <div className="container max-w-[1400px] mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left side: Text & CTA */}
            <div className="lg:col-span-7 xl:col-span-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm text-xs font-medium text-slate-300">
                <span className="w-2 h-2 rounded-full bg-[#16A34A] shadow-[0_0_8px_rgba(22,163,74,0.8)]"></span>
                24/7 Student Support
              </div>

              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                Contact DeshExam Support
              </h1>

              <p className="text-lg text-slate-300 mb-10 max-w-xl leading-relaxed">
                Need help with mock tests, subscriptions, documents, courses, or technical issues? Our support team is here to help.
              </p>

              {/* Checkmarks */}
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-10 max-w-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />
                  <span className="text-sm font-medium text-slate-200">50K+ Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />
                  <span className="text-sm font-medium text-slate-200">Avg Reply &lt; 2 Hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />
                  <span className="text-sm font-medium text-slate-200">Dedicated Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />
                  <span className="text-sm font-medium text-slate-200">Fast Resolution</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-[#16A34A] hover:bg-[#15803d] text-white px-8 h-12 rounded-md font-bold text-sm shadow-lg shadow-[#16A34A]/20 transition-all">
                  Contact Support
                </Button>
                <Button variant="outline" asChild className="border-white/20 hover:bg-white/10 text-white hover:text-white px-8 h-12 rounded-md font-bold text-sm backdrop-blur-sm transition-all bg-transparent">
                  <Link href="/faq">Help Center</Link>
                </Button>
              </div>
            </div>

            {/* Right side: Illustration & Stats Card */}
            <div className="lg:col-span-5 xl:col-span-6 relative flex justify-center lg:justify-end mt-12 lg:mt-0">
              <div className="relative w-full max-w-[380px]">
                <div className="relative z-10 bg-[#0F172A]/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 pt-0 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center">

                  {/* Illustration overlapping the top */}
                  <div className="w-72 h-72 -mt-20 mb-2 z-20 drop-shadow-2xl animate-float pointer-events-none">
                    <img src="/support-illustration.png" alt="DeshExam student support team helping learners" className="w-full h-full object-contain" />
                  </div>

                  <div className="space-y-5 w-full">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                      <span className="text-slate-300 font-medium text-sm">Tickets Resolved:</span>
                      <span className="text-white font-bold text-lg">120K+</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                      <span className="text-slate-300 font-medium text-sm">Satisfaction:</span>
                      <span className="text-white font-bold text-lg">98%</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                      <span className="text-slate-300 font-medium text-sm">Avg Response:</span>
                      <span className="text-white font-bold text-lg">2h</span>
                    </div>
                    <div className="flex justify-between items-center pb-2">
                      <span className="text-slate-300 font-medium text-sm">Live Agents:</span>
                      <span className="text-white font-bold text-lg">12+</span>
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
        <section className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-8 max-w-5xl">
          <h2 className="text-3xl font-bold mb-4 text-[#0F172A]">Why Contact DeshExam Support?</h2>
          <p className="text-[#64748B] mb-6 leading-relaxed">
            As a leading student support platform and online exam platform, <strong className="text-[#0F172A]">DeshExam</strong> is dedicated to providing swift, highly effective assistance.
            Whether you are exploring our platform for the first time or actively preparing for competitive exams, our team of experts ensures you face zero friction.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div>
              <h3 className="text-xl font-bold mb-3 text-[#0F172A]">Mock Test & Technical Help</h3>
              <p className="text-[#64748B] leading-relaxed text-sm">
                Facing issues while taking an <Link href="/mock-tests" className="text-[#16A34A] hover:underline font-medium">online mock test</Link>?
                Or perhaps you need help accessing detailed analytics? Our technical support resolves bugs, loading errors, and performance issues instantly so your exam preparation remains uninterrupted. Check out our <Link href="/features" className="text-[#16A34A] hover:underline font-medium">Platform Features</Link> to ensure you are utilizing the system correctly.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3 text-[#0F172A]">Subscription & Payment Assistance</h3>
              <p className="text-[#64748B] leading-relaxed text-sm">
                If you need guidance choosing the right premium plan, or if a payment has failed, our customer care team is available 24/7.
                Need help with premium upgrades? Visit our <Link href="/pricing" className="text-[#16A34A] hover:underline font-medium">Pricing Page</Link> for detailed tier breakdowns, or view the <Link href="/faq" className="text-[#16A34A] hover:underline font-medium">FAQ</Link> for our refund and cancellation policies.
              </p>
            </div>
          </div>
        </section>

        {/* QUICK CONTACT METHODS */}
        <section>
          <div className="mb-6">
            <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">Quick Contact Methods</h2>
          </div>
          <ContactMethods />
        </section>

        {/* CONTACT FORM & SUPPORT INFO */}
        <section>
          <div className="mb-6">
            <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">Contact Form</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 xl:col-span-9">
              <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-8">
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
            <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">FAQ</h2>
          </div>
          <SupportFAQ />
        </section>

        {/* HELP CENTER CTA */}
        <section>
          <div className="mb-6">
            <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">Help Center CTA</h2>
          </div>
          <div className="bg-gradient-to-r from-[#16A34A] to-[#7C3AED] rounded-2xl p-12 relative overflow-hidden shadow-xl text-white">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>

            <div className="relative z-10">
              <h2 className="text-4xl font-extrabold mb-4">Need Instant Help?</h2>
              <p className="text-white/90 text-lg mb-8 max-w-2xl">Browse our help center for quick solutions and tutorials.</p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild className="bg-white text-[#16A34A] hover:bg-slate-50 px-8 h-12 rounded-md font-bold text-sm shadow-lg transition-all">
                  <Link href="/faq">Visit Help Center</Link>
                </Button>
                <Button asChild variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white px-8 h-12 rounded-md font-bold text-sm transition-all bg-transparent">
                  <Link href="/faq">Browse FAQs</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* MAP / LOCATION */}
        <section className="pb-16">
          <div className="mb-6">
            <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">Map / Location</h2>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden">
            <div className="p-8 border-b border-[#E2E8F0]">
              <h3 className="text-2xl font-extrabold text-[#0F172A]">DeshExam Headquarters</h3>
            </div>
            <div className="p-6 relative h-[400px]">
              <div className="w-full h-full rounded-xl overflow-hidden relative bg-slate-100 border border-[#E2E8F0]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14736.255474320982!2d88.33400269999999!3d22.5766627!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a0277a06c2847c1%3A0xf69c0d9a6c9dfbd3!2sKolkata%2C%20West%20Bengal!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 grayscale contrast-125 opacity-90"
                />
                <div className="absolute top-1/2 right-12 -translate-y-1/2 bg-white rounded-xl shadow-xl p-6 min-w-[280px] border border-[#E2E8F0] z-10 hidden md:block">
                  <div className="flex items-start gap-3">
                    <MapPin className="text-[#16A34A] w-6 h-6 shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-[#0F172A] mb-2">Office Location</h4>
                      <p className="text-sm text-[#64748B] mb-4 leading-relaxed">
                        123, Baharampur, West Bengal, India
                      </p>
                      <a href="#" className="inline-flex items-center text-sm font-bold text-[#16A34A] hover:underline">
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
