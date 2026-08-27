import React from 'react';
import { Metadata } from 'next';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { TaxonomyNode } from '@/lib/firebase/taxonomy';
import InstitutionsClient from '../institutions-client';

import {
  MapPin, Globe, Star, Building, Navigation, ArrowLeft, Bookmark, CheckCircle2,
  Users, BookOpen, Clock, Phone, Mail, FileText, Monitor, Bed, Bus, TestTube,
  Trophy, Wifi, Coffee, Tent, PlusSquare, ChevronDown, ChevronRight, Filter, Sparkles, Calendar, XCircle, Info, Camera, HelpCircle
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { InstitutionReviewModal } from './institution-review-modal';
import { InstitutionReviewItem } from './institution-review-item';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Ensure this page works dynamically
export const dynamic = 'force-dynamic';

async function getInstitutionBySlug(slug: string): Promise<TaxonomyNode | null> {
  const q = query(
    collection(db, 'taxonomy_nodes'),
    where('type', '==', 'institution'),
    where('slug', '==', slug),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as TaxonomyNode;
}

async function getRelatedInstitutions(boardType: string, currentId: string): Promise<TaxonomyNode[]> {
  try {
    let q = query(
      collection(db, 'taxonomy_nodes'),
      where('type', '==', 'institution'),
      where('boardType', '==', boardType || ''),
      limit(5)
    );
    const snap = await getDocs(q);
    let related = snap.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as TaxonomyNode))
      .filter(inst => inst.id !== currentId);

    if (related.length < 3) {
      const fallbackQ = query(
        collection(db, 'taxonomy_nodes'),
        where('type', '==', 'institution'),
        limit(5)
      );
      const fallbackSnap = await getDocs(fallbackQ);
      const fallbackRelated = fallbackSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as TaxonomyNode))
        .filter(inst => inst.id !== currentId && !related.some(r => r.id === inst.id));
      related.push(...fallbackRelated);
    }
    return related.slice(0, 4);
  } catch (error) {
    console.error('Failed to fetch related institutions', error);
    return [];
  }
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  let institution = await getInstitutionBySlug(slug);

  if (!institution) {
    const hardcodedMatch = hardcodedInstitutions.find(inst => inst.slug === slug);
    if (hardcodedMatch) {
      institution = {
        ...hardcodedMatch,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as TaxonomyNode;
    } else if (slug === 'demo' || slug === 'hardcoded' || slug === 'test') {
      institution = {
        title: 'Premium Demo International Academy',
      } as TaxonomyNode;
    }
  }

  if (!institution) return { title: 'Not Found' };

  const currentYear = new Date().getFullYear();
  const seoInfo = (institution as any).seo || {};

  const title = seoInfo.seoTitle || `${institution.title} Admission ${currentYear}, Fees, Courses, Reviews | DeshExam`;
  const description = seoInfo.seoDescription || `Explore ${institution.title} admission ${currentYear}, fees, courses, placement, scholarship, facilities, ranking, contact details and student reviews on DeshExam.`;
  const keywords = seoInfo.seoKeywords || [seoInfo.focusKeyword || institution.title, `${institution.title} admission`, `${institution.title} fees`];

  const ogImage = seoInfo.ogImage || (institution as any).featureImage || (institution.galleryImages && institution.galleryImages[0]) || '';
  const canonicalUrl = seoInfo.canonicalUrl || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/institutions/${slug}`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: seoInfo.ogTitle || title,
      description: seoInfo.ogDescription || description,
      images: ogImage ? [ogImage] : [],
      url: canonicalUrl,
      type: 'website',
    },
    robots: {
      index: seoInfo.robotsIndex !== false,
      follow: seoInfo.robotsIndex !== false,
    }
  };
}

// ----------------------------------------------------------------------
// MOCK DATA
// ----------------------------------------------------------------------
const MOCK_COURSES = [
  { id: 1, title: 'B.Sc Computer Science', duration: '3 Years', fees: '₹50,000 / yr', eligibility: '10+2 with Science', seats: 120 },
  { id: 2, title: 'B.A English Literature', duration: '3 Years', fees: '₹30,000 / yr', eligibility: '10+2 (Any Stream)', seats: 60 },
  { id: 3, title: 'B.Com Accounting', duration: '3 Years', fees: '₹40,000 / yr', eligibility: '10+2 Commerce', seats: 150 },
  { id: 4, title: 'Class 1-12', duration: '12 Years', fees: '₹60,000 / yr', eligibility: 'Age Criteria', seats: 'Open' },
  { id: 5, title: 'Diploma in Engineering', duration: '3 Years', fees: '₹35,000 / yr', eligibility: '10th Pass', seats: 80 },
];

const MOCK_FACILITIES = [
  { icon: <BookOpen className="w-6 h-6" />, label: 'Library' },
  { icon: <Monitor className="w-6 h-6" />, label: 'Smart Class' },
  { icon: <Bed className="w-6 h-6" />, label: 'Hostel' },
  { icon: <Bus className="w-6 h-6" />, label: 'Transport' },
  { icon: <TestTube className="w-6 h-6" />, label: 'Lab' },
  { icon: <Trophy className="w-6 h-6" />, label: 'Sports' },
  { icon: <Wifi className="w-6 h-6" />, label: 'WiFi' },
  { icon: <Coffee className="w-6 h-6" />, label: 'Cafeteria' },
  { icon: <Tent className="w-6 h-6" />, label: 'Auditorium' },
  { icon: <PlusSquare className="w-6 h-6" />, label: 'Medical' },
];

const MOCK_ADMISSION_STEPS = [
  { step: 'Step 1', title: 'Registration', desc: 'Fill the online application form and pay the application fee.', date: 'Jan 15, 2024' },
  { step: 'Step 2', title: 'Entrance / Merit', desc: 'Appear for the entrance test or wait for merit list generation.', date: 'Feb 20, 2024' },
  { step: 'Step 3', title: 'Document Verification', desc: 'Submit original documents for verification at the campus.', date: 'Mar 10, 2024' },
  { step: 'Step 4', title: 'Final Admission', desc: 'Pay the first semester fees to confirm your seat.', date: 'Apr 05, 2024' },
];

const MOCK_GALLERY = [
  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&q=80&w=800',
];

const MOCK_REVIEWS = [
  { id: 1, name: 'Aarav Sharma', rating: 5, course: 'B.Sc Computer Science', text: 'Excellent faculty and great campus life. The placement cell is very active and helped me secure a job before graduation.', avatar: 'https://i.pravatar.cc/150?u=aarav' },
  { id: 2, name: 'Priya Patel', rating: 4, course: 'B.Com Accounting', text: 'Good infrastructure and supportive teachers. The library has a vast collection of books which is really helpful for research.', avatar: 'https://i.pravatar.cc/150?u=priya' },
];

const MOCK_FAQS = [
  { q: 'What is the admission process?', a: 'The admission process involves filling out an online application, appearing for an entrance exam (if applicable), followed by counseling and document verification.' },
  { q: 'What is the fee structure?', a: 'Fees vary by course. Please refer to the specific course card in the Programs section for detailed fee information.' },
  { q: 'Are scholarships available?', a: 'Yes, merit-based and need-based scholarships are available for eligible students. You can apply during the admission process.' },
  { q: 'Is hostel facility available?', a: 'Yes, we provide separate hostel facilities for boys and girls with modern amenities and 24/7 security.' },
];

const MOCK_NEARBY = [
  { id: 1, name: 'St. Xavier School', type: 'School', location: '2km away', img: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=200' },
  { id: 2, name: 'City College of Science', type: 'College', location: '5km away', img: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&q=80&w=200' },
  { id: 3, name: 'National Institute', type: 'University', location: '12km away', img: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=200' },
];
// ----------------------------------------------------------------------

import hardcodedInstitutions from '@/data/institutions.json';

export default async function InstitutionDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let institution = await getInstitutionBySlug(slug);

  // ── Fallback: treat slug as a location filter or check hardcoded JSON ────────
  if (!institution) {
    const hardcodedMatch = hardcodedInstitutions.find(inst => inst.slug === slug);
    if (hardcodedMatch) {
      institution = {
        ...hardcodedMatch,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as TaxonomyNode;
    } else if (slug === 'demo' || slug === 'hardcoded' || slug === 'test') {
      // Create a hardcoded dummy institution to test the UI
      institution = {
        id: 'demo-inst',
        type: 'institution',
        slug: 'demo',
        title: 'Premium Demo International Academy',
        description: 'A world-class premium educational institution designed to showcase the ultimate user interface and all available features in the system. Experience excellence in education and modern infrastructure.',
        category: 'School',
        boardType: 'Central Board',
        stateRegion: 'West Bengal',
        city: 'Kolkata',
        address: '123 Premium Avenue, Salt Lake Sector V',
        contactPhone: '+91 98765 43210',
        contactEmail: 'admissions@demoacademy.edu.in',
        website: 'https://demoacademy.edu.in',
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        track: 'academic',
        parentId: null,
        orderIndex: 0
      } as TaxonomyNode;
    } else {
      const locationName = slug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      return <InstitutionsClient initialLocationFilter={locationName} />;
    }
  }

  const relatedInstitutions = await getRelatedInstitutions(institution.boardType || '', institution.id || '');

  const currentYear = new Date().getFullYear();
  const stateStr = institution.stateRegion || "West Bengal";
  let cityStr = "City";
  let postalCodeStr = undefined;
  let streetAddressStr = undefined;
  if (institution.address) {
    const parts = institution.address.split(',');
    if (parts.length >= 3) {
      streetAddressStr = parts.slice(0, parts.length - 3).join(', ').trim();
      cityStr = parts[parts.length - 3].trim();
      const stateZipPart = parts[parts.length - 2]?.trim() || "";
      const zipMatch = stateZipPart.match(/\d{5,6}/);
      if (zipMatch) {
        postalCodeStr = zipMatch[0];
      }
    } else if (parts.length > 0) {
      cityStr = parts[0].trim();
      streetAddressStr = institution.address;
    }
  }

  // Cover Image (Mocked if not present)
  const coverImage = (institution.galleryImages && institution.galleryImages.length > 0) ? institution.galleryImages[0] : 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=2000';

  // Generate JSON-LD Schemas
  const schemaInstitution = {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    "name": institution.title,
    "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/institutions/${slug}`,
    "telephone": institution.phoneNumber || "",
    "image": institution.logoUrl || institution.featureImage || coverImage,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": streetAddressStr,
      "addressLocality": cityStr,
      "addressRegion": stateStr,
      "postalCode": postalCodeStr,
      "addressCountry": "IN"
    }
  };

  const schemaRating = institution.rating ? {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    "itemReviewed": {
      "@type": "CollegeOrUniversity",
      "name": institution.title
    },
    "ratingValue": institution.rating,
    "reviewCount": institution.userRatingsTotal || 1
  } : null;

  // Only emit FAQPage schema when the institution has real FAQ data stored
  const realFaqs = (institution as any).faqs as { q: string; a: string }[] | undefined;
  const schemaFAQ = realFaqs && realFaqs.length > 0
    ? {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": realFaqs.map((faq) => ({
        "@type": "Question",
        "name": faq.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.a
        }
      }))
    }
    : null;

  const schemaBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/` },
      { "@type": "ListItem", "position": 2, "name": "Institutions", "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/institutions` },
      { "@type": "ListItem", "position": 3, "name": stateStr, "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/institutions/${stateStr.toLowerCase().replace(/\s+/g, '-')}` },
      { "@type": "ListItem", "position": 4, "name": cityStr, "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/institutions/${stateStr.toLowerCase().replace(/\s+/g, '-')}/${cityStr.toLowerCase().replace(/\s+/g, '-')}` },
      { "@type": "ListItem", "position": 5, "name": institution.title, "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/institutions/${slug}` }
    ]
  };

  const schemas: any[] = [schemaInstitution, schemaBreadcrumb];
  if (schemaFAQ) schemas.push(schemaFAQ);
  if (schemaRating) schemas.push(schemaRating);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] pb-20 font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />

      {/* 1. HERO BANNER */}
      <div className="relative w-full overflow-hidden">
        <Image src={coverImage} alt={`${institution.title} campus building and facilities in ${cityStr}, ${stateStr}`} fill className="object-cover brightness-[0.4]" unoptimized />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-900/40" />

        <div className="relative pt-4 px-4 md:px-8 max-w-7xl mx-auto flex flex-col pb-4 z-10">
          <div className="flex justify-between items-start w-full">
            <div className="flex items-center gap-2 text-xs font-medium text-white/70 mb-8 flex-wrap">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span className="text-white/40">/</span>
              <Link href="/institutions" className="hover:text-white transition-colors">Institutions</Link>
              <span className="text-white/40">/</span>
              <Link href={`/institutions/${stateStr.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-white transition-colors">{stateStr}</Link>
              <span className="text-white/40">/</span>
              <Link href={`/institutions/${stateStr.toLowerCase().replace(/\s+/g, '-')}/${cityStr.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-white transition-colors">{cityStr}</Link>
              <span className="text-white/40">/</span>
              <span className="text-white font-semibold">{institution.title}</span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-10 items-start justify-between w-full">

            {/* Left Column: Logo, Title, Badges, Buttons */}
            <div className="w-full lg:w-2/3 flex flex-col">

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start w-full text-center sm:text-left">
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-white dark:bg-slate-900 shadow-2xl flex items-center justify-center overflow-hidden shrink-0 z-10 relative mx-auto sm:mx-0 ring-1 ring-black/5 dark:ring-white/10">
                  {institution.logoUrl || institution.featureImage ? (
                    <Image src={institution.logoUrl || institution.featureImage || ''} alt={`${institution.title} official logo`} fill className="object-contain p-1 sm:p-2" unoptimized />
                  ) : (
                    <Building className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 dark:text-slate-600" />
                  )}
                </div>

                <div className="text-white space-y-3 sm:space-y-4 pt-2 flex flex-col items-center sm:items-start w-full">
                  <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
                    <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 backdrop-blur-md px-2 py-0.0 shadow-sm"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Verified by DeshExam</Badge>
                    <span className="text-[10px] sm:text-xs text-white/70 font-medium ml-1">Updated on {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-white">{institution.title}</h1>
                  </div>

                  <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-300">
                    {institution.boardType && (
                      <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm"><Building className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {institution.boardType}</span>
                    )}
                    {institution.rating && (
                      <span className="flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full backdrop-blur-sm font-semibold">
                        <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400" /> {institution.rating} ({institution.reviews?.length || institution.userRatingsTotal || 0} reviews)
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 text-xs sm:text-sm text-slate-300">
                    <span className="flex items-center gap-1.5 text-center sm:text-left"><MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0" /> {institution.address ? institution.address.split(',').slice(-2).join(',') : 'Location'}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-6 mt-6 sm:mt-8 w-full">
                <div className="flex overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 -mx-0 px-2 sm:mx-0 sm:px-0 sm:flex-wrap items-center gap-1 no-scrollbar w-[100vw] sm:w-auto">
                  <Badge variant="outline" className="text-blue-200 border-blue-500/30 bg-blue-500/10 backdrop-blur-md whitespace-nowrap">Est: {institution.establishedYear || '2013'}</Badge>
                  <Badge variant="outline" className="text-purple-200 border-purple-500/30 bg-purple-500/10 backdrop-blur-md whitespace-nowrap">Medium: {institution.mediumOfInstruction ? (Array.isArray(institution.mediumOfInstruction) ? institution.mediumOfInstruction.join(', ') : institution.mediumOfInstruction) : 'English'}</Badge>
                  <Badge variant="outline" className="text-emerald-200 border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md whitespace-nowrap">Type: College</Badge>
                </div>
              </div>
            </div>

          <div className="lg:w-1/3 w-full flex flex-col gap-4 pt-4 lg:pt-0">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-900/20 backdrop-blur-md border border-blue-500/20 rounded-sm p-3 text-blue-50 flex flex-col items-center justify-center shadow-inner hover:bg-blue-800/30 hover:border-blue-400/40 transition-all group">
                <div className="text-xl sm:text-2xl font-bold mb-0.5 group-hover:scale-105 transition-transform">{institution.totalEnrollment || '3.25K'}</div>
                <div className="text-[10px] sm:text-xs text-blue-200/80 font-medium uppercase tracking-wider">Students</div>
              </div>
              <div className="bg-amber-900/20 backdrop-blur-md border border-amber-500/20 rounded-sm p-3 text-amber-50 flex flex-col items-center justify-center shadow-inner hover:bg-amber-800/30 hover:border-amber-400/40 transition-all group">
                <div className="flex items-center gap-1 text-xl sm:text-2xl font-bold mb-0.5 group-hover:scale-105 transition-transform">{institution.rating || '4.7'}<Star className="w-4 h-4 fill-amber-400 text-amber-400" /></div>
                <div className="text-[10px] sm:text-xs text-amber-200/80 font-medium uppercase tracking-wider">Rating</div>
              </div>
              <div className="bg-emerald-900/20 backdrop-blur-md border border-emerald-500/20 rounded-sm p-3 text-emerald-50 flex flex-col items-center justify-center shadow-inner hover:bg-emerald-800/30 hover:border-emerald-400/40 transition-all group">
                <div className="text-xl sm:text-2xl font-bold mb-0.5 group-hover:scale-105 transition-transform">{MOCK_COURSES.length}</div>
                <div className="text-[10px] sm:text-xs text-emerald-200/80 font-medium uppercase tracking-wider">Courses</div>
              </div>
              <div className="bg-purple-900/20 backdrop-blur-md border border-purple-500/20 rounded-sm p-3 text-purple-50 flex flex-col items-center justify-center shadow-inner hover:bg-purple-800/30 hover:border-purple-400/40 transition-all group">
                <div className="text-xl sm:text-2xl font-bold mb-0.5 group-hover:scale-105 transition-transform">{institution.userRatingsTotal || 232}</div>
                <div className="text-[10px] sm:text-xs text-purple-200/80 font-medium uppercase tracking-wider">Reviews</div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full">
              <Button className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-md hover:shadow-emerald-500/25 px-4 h-9 rounded-sm transition-all border border-emerald-500/50 text-xs sm:text-[13px]">Get Admission Info</Button>
              <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:flex-wrap">
                <Button className="w-full sm:w-auto bg-indigo-500/20 border border-indigo-400/30 text-indigo-50 hover:bg-indigo-500/30 hover:border-indigo-400/50 backdrop-blur-md font-medium px-4 h-9 rounded-sm shadow-md shadow-indigo-500/10 transition-all text-xs sm:text-[13px]">Brochure</Button>
                {institution.websiteUrl && (
                  <Button asChild className="w-full sm:w-auto bg-amber-500/20 border border-amber-400/30 text-amber-50 hover:bg-amber-500/30 hover:border-amber-400/50 backdrop-blur-md font-medium px-4 h-9 rounded-sm shadow-md shadow-amber-500/10 transition-all text-xs sm:text-[13px]">
                    <a href={institution.websiteUrl} target="_blank" rel="noopener noreferrer"><Globe className="w-3.5 h-3.5 sm:mr-1.5 shrink-0" /> <span className="hidden sm:inline">Website</span><span className="sm:hidden ml-1">Website</span></a>
                  </Button>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

      {/* PAGE LAYOUT */ }
  <div className="max-w-7xl mx-auto px-2 md:px-8 pt-2 pb-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

    {/* LEFT COLUMN (MAIN CONTENT) - 70% */}
    <div className="lg:col-span-8 space-y-4 sm:space-y-8">

      {/* 2. QUICK INFO BAR */}
      <Card className="border-slate-100 dark:border-slate-800 shadow-sm rounded-sm overflow-hidden bg-white dark:bg-slate-900 mb-2">
        <CardContent className="p-0">
          <div className="grid grid-cols-3 md:grid-cols-7 divide-x divide-y md:divide-y-0 divide-slate-100 dark:divide-slate-800/60">
            <div className="flex flex-col items-center justify-center text-center py-2.5 px-1 sm:py-3 sm:px-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <MapPin className="w-4 h-4 text-indigo-500 dark:text-indigo-400 mb-1" />
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] leading-tight">Address</span>
              <span className="text-slate-500 dark:text-slate-400 text-[10px] line-clamp-1 mt-0.5">{institution.address ? institution.address.split(',')[0] : 'Location'}</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center py-2.5 px-1 sm:py-3 sm:px-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <Phone className="w-4 h-4 text-emerald-500 dark:text-emerald-400 mb-1" />
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] leading-tight">Phone</span>
              <span className="text-slate-500 dark:text-slate-400 text-[10px] mt-0.5 line-clamp-1">{institution.phoneNumber || '+91 98765 43210'}</span>
            </div>
            {(institution as any).email && (
              <div className="flex flex-col items-center justify-center text-center py-2.5 px-1 sm:py-3 sm:px-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <Mail className="w-4 h-4 text-amber-500 dark:text-amber-400 mb-1" />
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] leading-tight">Email</span>
                <span className="text-slate-500 dark:text-slate-400 text-[10px] mt-0.5 line-clamp-1">{(institution as any).email}</span>
              </div>
            )}
            <div className="flex flex-col items-center justify-center text-center py-2.5 px-1 sm:py-3 sm:px-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <BookOpen className="w-4 h-4 text-purple-500 dark:text-purple-400 mb-1" />
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] leading-tight">Courses</span>
              <span className="text-slate-500 dark:text-slate-400 text-[10px] mt-0.5 line-clamp-1">{MOCK_COURSES.length} Available</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center py-2.5 px-1 sm:py-3 sm:px-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <Globe className="w-4 h-4 text-cyan-500 dark:text-cyan-400 mb-1" />
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] leading-tight">Website</span>
              <span className="text-slate-500 dark:text-slate-400 text-[10px] mt-0.5 line-clamp-1">{institution.websiteUrl ? 'Available' : 'N/A'}</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center py-2.5 px-1 sm:py-3 sm:px-2 bg-emerald-50/40 dark:bg-emerald-900/10">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 mb-1" />
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] leading-tight">Admission</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[10px] mt-0.5 line-clamp-1">{institution.admission?.admissionOpen ? 'Open' : 'Closed'}</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center py-2.5 px-1 sm:py-3 sm:px-2 col-span-3 md:col-span-1 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <Building className="w-4 h-4 text-slate-500 dark:text-slate-400 mb-1" />
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] leading-tight">Board</span>
              <span className="text-slate-500 dark:text-slate-400 text-[10px] mt-0.5 line-clamp-1">{institution.boardType || 'University'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. OVERVIEW */}
      <Card className="border-slate-100 dark:border-slate-800 shadow-sm rounded-md bg-white dark:bg-slate-900 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-3 sm:p-4 flex items-center gap-3">
          <div className="bg-white/20 p-1.5 rounded-md shadow-sm flex items-center justify-center backdrop-blur-sm">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-white font-bold uppercase text-sm sm:text-base tracking-wide">About Institution</h2>
        </div>
        <CardContent className="p-4 sm:p-6 pt-6 sm:pt-6">
          <input type="checkbox" id="about-toggle" className="peer hidden" />

          <div className="overflow-hidden max-h-[140px] peer-checked:max-h-[5000px] transition-all duration-700 ease-in-out relative">
            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed pb-2 text-sm sm:text-base">
              {institution.description ? (
                <div className="tiptap-content" dangerouslySetInnerHTML={{ __html: institution.description }} />
              ) : (
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                </p>
              )}
            </div>

            {/* Vision & Mission included in the expandable area */}
            <div className="mt-6 pb-2">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Vision & Mission</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
                Our institution is dedicated to providing excellence in education. We strive to nurture talent, foster innovation, and build a community of lifelong learners who will contribute positively to society.
              </p>
            </div>
          </div>

          {/* Fade Overlay */}
          <div className="h-24 -mt-24 bg-gradient-to-t from-white dark:from-slate-900 via-white/80 dark:via-slate-900/80 to-transparent pointer-events-none peer-checked:opacity-0 transition-opacity duration-300 relative z-10" />

          {/* Toggle Labels */}
          <div className="mt-2 relative z-20">
            <label htmlFor="about-toggle" className="inline-flex items-center gap-1 cursor-pointer text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold peer-checked:hidden transition-colors text-sm">
              Read More <ChevronDown className="w-4 h-4" />
            </label>
            <label htmlFor="about-toggle" className="hidden items-center gap-1 cursor-pointer text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold peer-checked:inline-flex transition-colors text-sm">
              Show Less <ChevronDown className="w-4 h-4 rotate-180" />
            </label>
          </div>
        </CardContent>
      </Card>

      {/* 4. COURSES / PROGRAMS */}
      <Card className="border-slate-100 dark:border-slate-800 shadow-sm rounded-md bg-white dark:bg-slate-900 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-1.5 rounded-md shadow-sm flex items-center justify-center backdrop-blur-sm">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-white font-bold uppercase text-sm sm:text-base tracking-wide">Courses & Programs</h2>
          </div>
          <div className="flex gap-2 w-full sm:w-auto relative">
            <Input placeholder="Search courses..." className="pl-8 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-white/30 backdrop-blur-sm shadow-inner" />
            <div className="absolute left-2.5 top-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>
        </div>
        <CardContent className="p-4 sm:p-6 pt-6 sm:pt-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_COURSES.map(course => (
              <div key={course.id} className="border border-slate-100 dark:border-slate-800/60 rounded-sm p-4 hover:border-emerald-200 dark:hover:border-emerald-500/30 hover:shadow-sm transition-all bg-white dark:bg-slate-800/30 relative">
                <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">New</div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-4 pr-10">{course.title}</h3>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs text-slate-600 dark:text-slate-300 mb-4">
                  <div className="flex flex-col"><span className="text-slate-400 dark:text-slate-500 font-medium">Degree Type</span> <span className="font-bold text-slate-800 dark:text-slate-200">English</span></div>
                  <div className="flex flex-col"><span className="text-slate-400 dark:text-slate-500 font-medium">Duration</span> <span className="font-bold text-slate-800 dark:text-slate-200">{course.duration}</span></div>
                  <div className="flex flex-col"><span className="text-slate-400 dark:text-slate-500 font-medium">Annual Fees</span> <span className="font-bold text-slate-800 dark:text-slate-200">{course.fees}</span></div>
                  <div className="flex flex-col"><span className="text-slate-400 dark:text-slate-500 font-medium">Seats</span> <span className="font-bold text-slate-800 dark:text-slate-200">{course.seats}</span></div>
                  <div className="flex flex-col col-span-2"><span className="text-slate-400 dark:text-slate-500 font-medium">Eligibility</span> <span className="font-bold text-slate-800 dark:text-slate-200">{course.eligibility}</span></div>
                </div>
                <div className="flex justify-end mt-2">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded shadow-sm h-8 px-6 text-xs">Apply</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* FACILITIES */}
      <Card className="border-slate-100 dark:border-slate-800 shadow-sm rounded-md bg-white dark:bg-slate-900 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-fuchsia-500 p-3 sm:p-4 flex items-center gap-3">
          <div className="bg-white/20 p-1.5 rounded-md shadow-sm flex items-center justify-center backdrop-blur-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-white font-bold uppercase text-sm sm:text-base tracking-wide">Facilities</h2>
        </div>
        <CardContent className="p-4 sm:p-6 pt-6 sm:pt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {institution.facilities && institution.facilities.length > 0 ? (
              institution.facilities.map((facilityObj: any, idx) => {
                const facilityStr = typeof facilityObj === 'string' ? facilityObj : facilityObj.title;
                const available = typeof facilityObj === 'string' ? true : facilityObj.available !== false;
                const iconMap: Record<string, React.ReactNode> = {
                  'Library': <BookOpen className="w-6 h-6" />,
                  'Hostel': <Bed className="w-6 h-6" />,
                  'Wi-Fi': <Wifi className="w-6 h-6" />,
                  'Cafeteria': <Coffee className="w-6 h-6" />,
                  'Transport': <Bus className="w-6 h-6" />,
                  'Sports Complex': <Trophy className="w-6 h-6" />,
                  'Labs': <TestTube className="w-6 h-6" />,
                  'Medical Facility': <PlusSquare className="w-6 h-6" />,
                  'Auditorium': <Tent className="w-6 h-6" />,
                  'Smart Board': <Monitor className="w-6 h-6" />
                };
                return (
                  <div key={idx} className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-sm border transition-colors cursor-default ${available ? 'border-emerald-100 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/10 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 text-slate-800 dark:text-slate-200' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 text-slate-400 dark:text-slate-500'}`}>
                    <div className={`mb-1.5 [&>svg]:w-5 [&>svg]:h-5 ${available ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>{iconMap[facilityStr] || <Building className="w-5 h-5" />}</div>
                    <span className="text-xs font-bold text-center mb-0.5">{facilityStr}</span>
                    <span className={`text-[9px] font-semibold tracking-wide uppercase ${available ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-400 dark:text-slate-600'}`}>{available ? 'Available' : 'Not Available'}</span>
                  </div>
                );
              })
            ) : (
              MOCK_FACILITIES.slice(0, 8).map((facility, idx) => (
                <div key={idx} className="flex flex-col items-center justify-center py-2.5 px-2 rounded-sm border border-emerald-100 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/10 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 transition-colors text-slate-800 dark:text-slate-200 cursor-default">
                  <div className="mb-1.5 text-emerald-600 dark:text-emerald-400 [&>svg]:w-5 [&>svg]:h-5">{facility.icon}</div>
                  <span className="text-xs font-bold text-center mb-0.5">{facility.label}</span>
                  <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-500 tracking-wide uppercase">Available</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* PLACEMENTS & SCHOLARSHIPS */}
      <Card className="border-slate-100 dark:border-slate-800 shadow-sm rounded-md bg-white dark:bg-slate-900 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-3 sm:p-4 flex items-center gap-3">
          <div className="bg-white/20 p-1.5 rounded-md shadow-sm flex items-center justify-center backdrop-blur-sm">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-white font-bold uppercase text-sm sm:text-base tracking-wide">Placements & Scholarships</h2>
        </div>
        <CardContent className="p-4 sm:p-6 pt-6 sm:pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Left side: Scholarships */}
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="border border-slate-100 dark:border-slate-800 rounded-sm p-4 bg-white dark:bg-slate-800/30 relative">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-3">Scholarship Name</h3>
                  <div className="flex flex-col gap-1 text-xs text-slate-600 dark:text-slate-300 mb-4">
                    <div className="flex"><span className="text-slate-400 dark:text-slate-500 w-20">Amount</span> <span className="font-bold text-slate-800 dark:text-slate-200">₹50,000</span></div>
                    <div className="flex"><span className="text-slate-400 dark:text-slate-500 w-20">Eligibility</span> <span className="font-bold text-slate-800 dark:text-slate-200">Merit Based</span></div>
                  </div>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded shadow-sm h-8 text-xs">Apply Scholarship</Button>
                </div>
              ))}
            </div>

            {/* Right side: Placements */}
            {institution.placement && institution.placement.placementAvailable ? (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-sm p-3 text-center border border-emerald-100 dark:border-emerald-500/20">
                    <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{institution.placement.placementRate || '95%'}</div>
                    <div className="text-[10px] sm:text-xs font-medium text-emerald-800 dark:text-emerald-500 mt-1">Placement Rate</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-sm p-3 text-center border border-slate-100 dark:border-slate-700">
                    <div className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200">{institution.placement.highestPackage || '12 LPA'}</div>
                    <div className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Highest Package</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-sm p-3 text-center border border-slate-100 dark:border-slate-700">
                    <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{institution.placement.averagePackage || '6.5 LPA'}<span className="text-xs text-emerald-500 ml-0.5">★</span></div>
                    <div className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Average Package</div>
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap gap-2">
                    {institution.placement.recruiters && institution.placement.recruiters.length > 0 ? (
                      institution.placement.recruiters.slice(0, 6).map((recruiter: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 py-1 font-normal text-xs">{recruiter}</Badge>
                      ))
                    ) : (
                      ['TCS', 'Infosys', 'Wipro', 'Cognizant', 'Accenture', 'IBM'].map((recruiter, idx) => (
                        <Badge key={idx} variant="outline" className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 py-1 font-normal text-xs">{recruiter}</Badge>
                      ))
                    )}
                    <span className="text-xs text-slate-400 dark:text-slate-500 py-1 px-2 border border-slate-100 dark:border-slate-800 rounded-full">more...</span>
                  </div>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {institution.placement.placementDescription ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none text-slate-500 dark:text-slate-400 tiptap-content line-clamp-3" dangerouslySetInnerHTML={{ __html: institution.placement.placementDescription }} />
                  ) : (
                    "Our dedicated placement cell ensures top-tier recruitment opportunities for students across various disciplines, partnering with industry leaders to provide excellent career starts."
                  )}
                </div>

                {/* Mock Mini Chart Line */}
                <div className="w-full h-10 mt-4 relative overflow-hidden opacity-80">
                  <svg className="w-full h-full text-emerald-500 dark:text-emerald-600" viewBox="0 0 200 40" preserveAspectRatio="none">
                    <path d="M0,40 L0,20 C20,10 40,30 60,20 C80,10 100,25 120,15 C140,5 160,20 180,10 L200,10 L200,40 Z" fill="currentColor" fillOpacity="0.1" />
                    <path d="M0,20 C20,10 40,30 60,20 C80,10 100,25 120,15 C140,5 160,20 180,10 L200,10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-600 text-sm py-10">
                Placement data not available
              </div>
            )}

          </div>
        </CardContent>
      </Card>

      {/* 5. ADMISSION INFO */}
      <Card className="border-slate-100 dark:border-slate-800 shadow-sm rounded-md bg-white dark:bg-slate-900 overflow-hidden">
        <div className="bg-gradient-to-r from-rose-500 to-pink-500 p-3 sm:p-4 flex items-center gap-3">
          <div className="bg-white/20 p-1.5 rounded-md shadow-sm flex items-center justify-center backdrop-blur-sm">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-white font-bold uppercase text-sm sm:text-base tracking-wide">Admission</h2>
        </div>
        <CardContent className="p-4 sm:p-6 pt-6 sm:pt-6">
          <div className="flex flex-wrap gap-4 mb-6">
            <Badge className={institution.admission?.admissionOpen ? "bg-emerald-500 hover:bg-emerald-600 text-white rounded text-sm py-1.5 px-4" : "bg-emerald-500 hover:bg-emerald-600 text-white rounded text-sm py-1.5 px-4 opacity-50"}>Admission Open</Badge>
            <Badge className={!institution.admission?.admissionOpen ? "bg-rose-500 hover:bg-rose-600 text-white rounded text-sm py-1.5 px-4" : "bg-rose-500 hover:bg-rose-600 text-white rounded text-sm py-1.5 px-4 opacity-50"}>Admission Closed</Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10 text-sm">
            <div className="flex flex-col"><span className="text-slate-500 dark:text-slate-400 font-medium mb-1">Start Date</span> <span className="font-bold text-slate-800 dark:text-slate-200">{institution.admission?.applicationStartDate ? new Date(institution.admission.applicationStartDate).toLocaleDateString('en-GB') : 'TBA'}</span></div>
            <div className="flex flex-col"><span className="text-slate-500 dark:text-slate-400 font-medium mb-1">End Date</span> <span className="font-bold text-slate-800 dark:text-slate-200">{institution.admission?.applicationEndDate ? new Date(institution.admission.applicationEndDate).toLocaleDateString('en-GB') : 'TBA'}</span></div>
            <div className="flex flex-col"><span className="text-slate-500 dark:text-slate-400 font-medium mb-1">Mode</span> <span className="font-bold text-slate-800 dark:text-slate-200">{institution.admission?.admissionMode || '-'}</span></div>
            <div className="flex flex-col"><span className="text-slate-500 dark:text-slate-400 font-medium mb-1">Application Fee</span> <span className="font-bold text-slate-800 dark:text-slate-200">{institution.admission?.applicationFee ? `₹${institution.admission.applicationFee}` : '-'}</span></div>
          </div>

          {/* Timeline */}
          <div className="relative flex justify-between items-start w-full mb-10 px-2">
            <div className="absolute top-2.5 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-700 -z-10"></div>

            <div className="flex flex-col items-center w-1/4">
              <div className="w-5 h-5 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-900 mb-2 shadow-sm"></div>
              <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">Step 1</span>
              <span className="text-[10px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 text-center">Registration</span>
            </div>
            <div className="flex flex-col items-center w-1/4">
              <div className="w-5 h-5 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-900 mb-2 shadow-sm"></div>
              <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">Step 2</span>
              <span className="text-[10px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 text-center">Document<br />Upload</span>
            </div>
            <div className="flex flex-col items-center w-1/4">
              <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 border-4 border-white dark:border-slate-900 mb-2 shadow-sm"></div>
              <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">Step 3</span>
              <span className="text-[10px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 text-center">Verification</span>
            </div>
            <div className="flex flex-col items-center w-1/4">
              <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 border-4 border-white dark:border-slate-900 mb-2 shadow-sm"></div>
              <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">Step 4</span>
              <span className="text-[10px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 text-center">Confirmation</span>
            </div>
          </div>

          {institution.admission?.admissionProcess && (
            <div className="mb-8">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2">Admission Details</h3>
              <div className="prose prose-sm dark:prose-invert prose-slate max-w-none text-slate-600 dark:text-slate-400 tiptap-content" dangerouslySetInnerHTML={{ __html: institution.admission.admissionProcess }} />
            </div>
          )}

          <div className="flex flex-col items-center">
            {institution.admission?.admissionOpen && <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">Admissions are currently active</div>}
            <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded shadow-sm h-10">
              {institution.admission?.admissionUrl ? (
                <a href={institution.admission.admissionUrl} target="_blank" rel="noopener noreferrer">Apply Now</a>
              ) : (
                <Link href="#">Apply Now</Link>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* GALLERY */}
      <Card className="border-slate-100 dark:border-slate-800 shadow-sm rounded-md bg-white dark:bg-slate-900 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 sm:p-4 flex items-center gap-3">
          <div className="bg-white/20 p-1.5 rounded-md shadow-sm flex items-center justify-center backdrop-blur-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-white font-bold uppercase text-sm sm:text-base tracking-wide">Gallery</h2>
        </div>
        <CardContent className="p-4 sm:p-6 pt-6 sm:pt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(institution.galleryImages && institution.galleryImages.length > 0 ? institution.galleryImages : [...MOCK_GALLERY, ...MOCK_GALLERY, MOCK_GALLERY[0]]).slice(0, 9).map((img, idx) => (
              <div key={idx} className={`relative rounded-sm overflow-hidden group aspect-square`}>
                <Image src={img} alt="Gallery image" fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* REVIEWS */}
      <Card className="border-slate-100 dark:border-slate-800 shadow-sm rounded-md bg-white dark:bg-slate-900 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-500 to-emerald-500 p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-1.5 rounded-md shadow-sm flex items-center justify-center backdrop-blur-sm">
              <Star className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-white font-bold uppercase text-sm sm:text-base tracking-wide">Reviews</h2>
          </div>
          <InstitutionReviewModal institutionId={institution.id} />
        </div>
        <CardContent className="p-4 sm:p-6 pt-6 sm:pt-6">
          <div className="flex flex-col sm:flex-row gap-8 mb-8 border-b border-slate-100 dark:border-slate-800 pb-8">
            <div className="flex flex-col items-center sm:items-start justify-center">
              <div className="text-5xl font-bold text-slate-900 dark:text-slate-100 mb-2">{institution.rating || '4.5'}</div>
              <div className="flex text-amber-400 mb-1">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className={`w-5 h-5 ${i === 5 ? 'text-slate-300 dark:text-slate-600' : 'fill-amber-400 text-amber-400'}`} />)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Total Reviews: {institution.userRatingsTotal || 14}</div>
            </div>
            <div className="flex-1 space-y-2 max-w-xs">
              {[5, 4, 3, 2, 1].map(stars => (
                <div key={stars} className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 font-medium">
                  <div className="flex items-center gap-1 w-6">{stars} <Star className="w-3 h-3 fill-amber-400 text-amber-400" /></div>
                  <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${stars === 5 ? 70 : stars === 4 ? 20 : stars === 3 ? 5 : 0}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {institution.aiReviewSummary && (
            <div className="mb-8 bg-gradient-to-br from-indigo-50 dark:from-indigo-900/20 to-purple-50 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-sm p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="w-24 h-24 text-indigo-500" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold mb-3">
                  <Sparkles className="w-5 h-5" /> AI Review Summary
                </div>
                <div className="prose prose-sm dark:prose-invert prose-slate max-w-none prose-p:leading-relaxed">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      ul: ({ node, ...props }) => <ul className="list-none pl-0 space-y-3 my-4" {...props} />,
                      li: ({ node, children, ...props }) => {
                        let isPro = false;
                        let isCon = false;

                        const processChildren = (childArray: any): any => {
                          return React.Children.map(childArray, child => {
                            if (typeof child === 'string') {
                              if (child.includes('[PRO] ')) {
                                isPro = true;
                                return child.replace('[PRO] ', '');
                              }
                              if (child.includes('[CON] ')) {
                                isCon = true;
                                return child.replace('[CON] ', '');
                              }
                            }
                            if (React.isValidElement(child) && child.props && 'children' in (child.props as any)) {
                              const newChildren = processChildren((child.props as any).children);
                              return React.cloneElement(child, { children: newChildren } as any);
                            }
                            return child;
                          });
                        };

                        const newChildren = processChildren(children);

                        return (
                          <li className="flex items-start gap-2.5 m-0" {...props}>
                            {isPro && <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 mt-1 shrink-0" />}
                            {isCon && <XCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 mt-1 shrink-0" />}
                            {!isPro && !isCon && <span className="w-1.5 h-1.5 bg-indigo-300 dark:bg-indigo-600 rounded-full mt-2.5 shrink-0" />}
                            <div className="flex-1">{newChildren}</div>
                          </li>
                        );
                      }
                    }}
                  >
                    {(() => {
                      let text = institution.aiReviewSummary || '';
                      text = text.replace(/(Pros\s*:[\s\S]*?)(?=Cons\s*:|Overall Conclusion\s*:|$)/i, (match) => {
                        return match.replace(/^[-*]\s+/gm, '- [PRO] ');
                      });
                      text = text.replace(/(Cons\s*:[\s\S]*?)(?=Overall Conclusion\s*:|$)/i, (match) => {
                        return match.replace(/^[-*]\s+/gm, '- [CON] ');
                      });
                      return text;
                    })()}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {(institution.reviews && institution.reviews.length > 0 ? institution.reviews : MOCK_REVIEWS).map((review: any, idx) => (
              <InstitutionReviewItem key={review.id || idx} review={review} institutionId={institution.id} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* FAQs */}
      <Card className="border-slate-100 dark:border-slate-800 shadow-sm rounded-md bg-white dark:bg-slate-900 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-600 to-slate-500 p-3 sm:p-4 flex items-center gap-3">
          <div className="bg-white/20 p-1.5 rounded-md shadow-sm flex items-center justify-center backdrop-blur-sm">
            <Info className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-white font-bold uppercase text-sm sm:text-base tracking-wide">FAQs</h2>
        </div>
        <CardContent className="p-4 sm:p-6 pt-6 sm:pt-6">
          <div className="space-y-3">
            {MOCK_FAQS.map((faq, idx) => (
              <details key={idx} className="group border border-slate-100 dark:border-slate-800 rounded-sm bg-slate-50 dark:bg-slate-800/50 overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between cursor-pointer p-4 font-semibold text-slate-800 dark:text-slate-200 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-open:rotate-90 transition-transform" />
                    {faq.q}
                  </div>
                </summary>
                <div className="p-4 pt-0 pl-10 text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>

    {/* RIGHT COLUMN (SIDEBAR) - 30% */}
    <div className="lg:col-span-4 space-y-6">

      {/* Mini Gallery */}
      <div className="rounded-md overflow-hidden shadow-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 flex items-center gap-3">
          <div className="bg-white p-1.5 rounded-md shadow-sm flex items-center justify-center">
            <Camera className="w-5 h-5 text-indigo-500" />
          </div>
          <h3 className="text-white font-bold uppercase text-sm tracking-wide">Gallery</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-2">
            {(institution.galleryImages && institution.galleryImages.length > 0 ? institution.galleryImages : MOCK_GALLERY).slice(0, 4).map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-sm overflow-hidden group">
                <Image src={img} alt={`${institution.title} campus gallery image ${idx + 1}`} fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized />
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4 text-xs font-semibold border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">View All Photos</Button>
        </div>
      </div>

      {/* Contact Card */}
      <div className="rounded-md overflow-hidden shadow-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-3 flex items-center gap-3">
          <div className="bg-white p-1.5 rounded-md shadow-sm flex items-center justify-center">
            <Phone className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="text-white font-bold uppercase text-sm tracking-wide">Contact Details</h3>
        </div>
        <div className="p-5">
          <div className="space-y-4">
            <a href={`tel:${institution.internationalPhoneNumber || institution.phoneNumber || '+919876543210'}`} className="flex items-center gap-3 text-slate-600 hover:text-emerald-600 transition-colors group">
              <div className="bg-emerald-50 p-2.5 rounded-full text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors"><Phone className="w-4 h-4" /></div>
              <div>
                <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Call Us</div>
                <div className="text-sm font-semibold">{institution.phoneNumber || '+91 98765 43210'}</div>
              </div>
            </a>
            <a href={`https://wa.me/${institution.internationalPhoneNumber || institution.phoneNumber || '+919876543210'}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-600 hover:text-green-600 transition-colors group">
              <div className="bg-green-50 p-2.5 rounded-full text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                {/* SVG WhatsApp Icon */}
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">WhatsApp</div>
                <div className="text-sm font-semibold">{institution.phoneNumber || '+91 98765 43210'}</div>
              </div>
            </a>
            {(institution as any).email && (
              <a href={`mailto:${(institution as any).email}`} className="flex items-center gap-3 text-slate-600 hover:text-amber-600 transition-colors group">
                <div className="bg-amber-50 p-2.5 rounded-full text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors"><Mail className="w-4 h-4" /></div>
                <div>
                  <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Email</div>
                  <div className="text-sm font-semibold line-clamp-1">{(institution as any).email}</div>
                </div>
              </a>
            )}
            {institution.websiteUrl && (
              <a href={institution.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-600 hover:text-indigo-600 transition-colors group">
                <div className="bg-indigo-50 p-2.5 rounded-full text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors"><Globe className="w-4 h-4" /></div>
                <div>
                  <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Website</div>
                  <div className="text-sm font-semibold line-clamp-1">{institution.websiteUrl}</div>
                </div>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Quick Contact Card */}
      <div className="rounded-md overflow-hidden shadow-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        <div className="bg-gradient-to-r from-orange-400 to-pink-500 p-3 flex items-center gap-3">
          <div className="bg-white p-1.5 rounded-md shadow-sm flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-orange-500" />
          </div>
          <h3 className="text-white font-bold uppercase text-sm tracking-wide">Interested?</h3>
        </div>
        <div className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Get free counselling and admission assistance from our experts.</p>
          <div className="space-y-3 mb-6">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold h-11 shadow-sm"><Phone className="w-4 h-4 mr-2" /> Request Callback</Button>
            <Button variant="outline" className="w-full border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold h-11 text-slate-700 dark:text-slate-200"><Mail className="w-4 h-4 mr-2" /> Send Enquiry</Button>
          </div>
          <div className="text-xs text-center text-slate-400 dark:text-slate-500">
            100% Free & Secure. We don't spam.
          </div>
        </div>
      </div>

      {/* Map/Contact Details Card */}
      <div className="rounded-md overflow-hidden shadow-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        <div className="bg-gradient-to-r from-teal-500 to-emerald-500 p-3 flex items-center gap-3">
          <div className="bg-white p-1.5 rounded-md shadow-sm flex items-center justify-center">
            <Phone className="w-5 h-5 text-teal-600" />
          </div>
          <h3 className="text-white font-bold uppercase text-sm tracking-wide">Contact Details</h3>
        </div>
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-start gap-3 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="w-10 h-10 rounded-[10px] bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-500" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">Address</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">{institution.address || 'Address not available'}</span>
              </div>
            </div>
            {(institution as any).email && (
              <div className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="w-10 h-10 rounded-[10px] bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">Email</span>
                  <a href={`mailto:${(institution as any).email}`} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-0.5">{(institution as any).email}</a>
                </div>
              </div>
            )}
            {institution.phoneNumber && (
              <div className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="w-10 h-10 rounded-[10px] bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">Phone</span>
                  <a href={`tel:${institution.phoneNumber}`} className="text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mt-0.5">{institution.phoneNumber}</a>
                </div>
              </div>
            )}
            {institution.websiteUrl && (
              <div className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="w-10 h-10 rounded-[10px] bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5 text-cyan-600 dark:text-cyan-500" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">Website</span>
                  <a href={institution.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-0.5 truncate max-w-[200px]">{institution.websiteUrl.replace(/^https?:\/\//, '')}</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Operating Hours Card */}
      <div className="rounded-md overflow-hidden shadow-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 flex items-center gap-3">
          <div className="bg-white p-1.5 rounded-md shadow-sm flex items-center justify-center">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-white font-bold uppercase text-sm tracking-wide">Operating Hours</h3>
        </div>
        <div className="p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-800/30">
          <table className="w-full text-xs">
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {(() => {
                  let rawHours = (institution as any).openingHours;
                  let scheduleArray: { day: string; hours: string }[] = [];
                  if (Array.isArray(rawHours) && rawHours.length > 0) {
                    scheduleArray = rawHours.map(item => {
                      if (typeof item === 'string') {
                        const parts = item.split(':');
                        if (parts.length > 1) {
                          return { day: parts[0].trim(), hours: parts.slice(1).join(':').trim() };
                        }
                        return { day: '', hours: item.trim() };
                      }
                      if (typeof item === 'object' && item !== null) {
                        return {
                          day: item.day || item.dayOfWeek || item.name || '',
                          hours: item.hours || item.time || item.value || ''
                        };
                      }
                      return { day: '', hours: '' };
                    });
                  } else if (typeof rawHours === 'object' && rawHours !== null) {
                    scheduleArray = Object.entries(rawHours).map(([key, val]) => ({
                      day: key,
                      hours: typeof val === 'string' ? val : ''
                    }));
                  }

                  // Fallback if we still have nothing or just empty rows
                  if (scheduleArray.length === 0 || scheduleArray.every(s => !s.day && !s.hours)) {
                    scheduleArray = [
                      { day: 'Monday', hours: '9:00 AM - 5:00 PM' },
                      { day: 'Tuesday', hours: '9:00 AM - 5:00 PM' },
                      { day: 'Wednesday', hours: '9:00 AM - 5:00 PM' },
                      { day: 'Thursday', hours: '9:00 AM - 5:00 PM' },
                      { day: 'Friday', hours: '9:00 AM - 5:00 PM' },
                      { day: 'Saturday', hours: 'Closed' },
                      { day: 'Sunday', hours: 'Closed' }
                    ];
                  }

                  return scheduleArray.map((schedule: any, idx: number) => {
                    const hours = schedule.hours || '';
                    if (!schedule.day && !hours) return null; // Skip completely empty rows
                    return (
                      <tr key={idx} className={hours.toLowerCase() === 'closed' ? 'bg-slate-50/50 dark:bg-slate-800/50' : ''}>
                        <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-300">{schedule.day}</td>
                        <td className={`py-2.5 px-3 text-right ${hours.toLowerCase() === 'closed' ? 'text-rose-500 font-medium' : 'text-slate-600 dark:text-slate-400'}`}>
                          {hours}
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>

      {/* Quick Stats Card */}
      <div className="rounded-md overflow-hidden shadow-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        <div className="bg-gradient-to-r from-purple-500 to-fuchsia-500 p-3 flex items-center gap-3">
          <div className="bg-white p-1.5 rounded-md shadow-sm flex items-center justify-center">
            <Building className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-white font-bold uppercase text-sm tracking-wide">Quick Stats</h3>
        </div>
        <div className="p-4 sm:p-6">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="w-10 h-10 rounded-[10px] bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center shrink-0">
                <Building className="w-5 h-5 text-orange-600 dark:text-orange-500" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">Ownership</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{(institution as any).ownershipType || 'Private'}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="w-10 h-10 rounded-[10px] bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-500" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">Area</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{(institution as any).campusArea || '50 Acres'}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="w-10 h-10 rounded-[10px] bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">Faculty</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{(institution as any).facultyCount || '200+'}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="w-10 h-10 rounded-[10px] bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-500" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">Est. Year</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{institution.establishedYear || '1995'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Map View */}
      <div className="rounded-md overflow-hidden shadow-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-3 flex items-center gap-3">
          <div className="bg-white p-1.5 rounded-md shadow-sm flex items-center justify-center">
            <MapPin className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="text-white font-bold uppercase text-sm tracking-wide">Location</h3>
        </div>
        <div className="p-4 sm:p-6">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-4 flex items-start gap-2">
            <MapPin className="w-4 h-4 text-emerald-500 dark:text-emerald-400 mt-0.5 shrink-0" />
            <span>{institution.address || 'Institution Address, City, State, Country - ZIP'}</span>
          </div>
          {institution.latitude && institution.longitude ? (
            <div className="rounded-sm overflow-hidden border border-slate-200 dark:border-slate-700">
              <iframe
                width="100%"
                height="200"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={`https://maps.google.com/maps?q=${institution.latitude},${institution.longitude}&hl=en&z=14&output=embed`}
              ></iframe>
            </div>
          ) : (
            <div className="rounded-sm overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 h-[200px] flex items-center justify-center text-slate-400 dark:text-slate-500">
              Map View Not Available
            </div>
          )}
        </div>
      </div>

      {/* Social Links */}
      {institution.socialProfiles && Object.values(institution.socialProfiles).some(val => val) && (
        <div className="rounded-md overflow-hidden shadow-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-3 flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-md shadow-sm flex items-center justify-center">
              <Globe className="w-5 h-5 text-cyan-600" />
            </div>
            <h3 className="text-white font-bold uppercase text-sm tracking-wide">Follow Us</h3>
          </div>
          <div className="p-4 sm:p-6">
            <div className="flex gap-3">
              {institution.socialProfiles.facebook && (
                <a href={institution.socialProfiles.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                </a>
              )}
              {institution.socialProfiles.twitter && (
                <a href={institution.socialProfiles.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-sky-500 hover:text-white flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                </a>
              )}
              {institution.socialProfiles.instagram && (
                <a href={institution.socialProfiles.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                </a>
              )}
              {institution.socialProfiles.linkedin && (
                <a href={institution.socialProfiles.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-blue-800 hover:text-white flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                </a>
              )}
              {institution.socialProfiles.youtube && (
                <a href={institution.socialProfiles.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Brochure Download Card */}
      <Card className="border-none shadow-sm rounded-md bg-gradient-to-br from-indigo-500 to-indigo-700 dark:from-indigo-900 dark:to-indigo-950 text-white overflow-hidden">
        <CardContent className="p-6 text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-indigo-200 dark:text-indigo-400" />
          <h3 className="font-bold text-lg mb-2">Download Brochure</h3>
          <p className="text-sm text-indigo-100 dark:text-indigo-300 mb-6">Get detailed information about courses, fees, and facilities.</p>
          <Button className="w-full bg-white text-indigo-700 hover:bg-indigo-50 font-bold shadow-sm">Download PDF</Button>
        </CardContent>
      </Card>

      {/* Nearby Institutions */}
      <div className="rounded-md overflow-hidden shadow-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        <div className="bg-gradient-to-r from-rose-500 to-orange-500 p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-md shadow-sm flex items-center justify-center">
              <Building className="w-5 h-5 text-rose-600" />
            </div>
            <h3 className="text-white font-bold uppercase text-sm tracking-wide">Nearby</h3>
          </div>
          <Link href="/institutions" className="text-xs text-white/90 font-semibold hover:text-white hover:underline bg-white/20 px-2 py-1 rounded backdrop-blur-sm">View All</Link>
        </div>
        <div className="p-4 sm:p-6">
          <div className="space-y-4">
            {relatedInstitutions.length > 0 ? relatedInstitutions.map(related => (
              <Link href={`/institutions/${related.slug}`} key={related.id} className="flex items-center gap-3 group">
                <div className="w-12 h-12 flex-shrink-0 bg-slate-100 dark:bg-slate-800 rounded-sm overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-700">
                  {related.logoUrl || related.featureImage ? (
                    <Image src={related.logoUrl || related.featureImage || ''} alt={related.title || ''} width={50} height={50} className="object-cover w-full h-full" unoptimized />
                  ) : (
                    <Building className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">{related.title}</div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span className="flex items-center gap-0.5"><Building className="w-3 h-3" /> {related.boardType || 'Institution'}</span>
                    {related.rating && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-amber-500"><Star className="w-3 h-3 fill-amber-500" /> {related.rating}</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            )) : (
              <div className="text-sm text-slate-500 dark:text-slate-400">No related institutions found.</div>
            )}
          </div>
        </div>
      </div>

    </div>
  </div>

  {/* Sticky Mobile Footer CTA */ }
  <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 flex gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] dark:shadow-none z-50">
    <Button variant="outline" className="flex-1 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold h-11"><Phone className="w-4 h-4 mr-2" /> Call</Button>
    <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold shadow-sm h-11">Apply Now</Button>
  </div>
    </div >
  );
}
