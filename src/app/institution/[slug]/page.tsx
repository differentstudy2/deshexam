import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { TaxonomyNode } from '@/lib/firebase/taxonomy';
import {
  MapPin, Globe, Star, Building, Navigation, ArrowLeft, Bookmark, CheckCircle2, 
  Users, BookOpen, Clock, Phone, Mail, FileText, Monitor, Bed, Bus, TestTube, 
  Trophy, Wifi, Coffee, Tent, PlusSquare, ChevronDown, ChevronRight, Filter, Sparkles, Calendar, XCircle
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
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

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const institution = await getInstitutionBySlug(params.slug);
  if (!institution) return { title: 'Not Found' };

  const currentYear = new Date().getFullYear();
  const seoInfo = (institution as any).seo || {};
  
  const title = seoInfo.seoTitle || `${institution.title} Admission ${currentYear}, Fees, Courses, Reviews | DeshExam`;
  const description = seoInfo.seoDescription || `Explore ${institution.title} admission ${currentYear}, fees, courses, placement, scholarship, facilities, ranking, contact details and student reviews on DeshExam.`;
  const keywords = seoInfo.seoKeywords || [seoInfo.focusKeyword || institution.title, `${institution.title} admission`, `${institution.title} fees`];
  
  const ogImage = seoInfo.ogImage || (institution as any).featureImage || (institution.galleryImages && institution.galleryImages[0]) || '';
  const canonicalUrl = seoInfo.canonicalUrl || `https://deshexam.com/institution/${params.slug}`;

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
  { id: 1, title: 'B.Sc Computer Science', duration: '3 Years', fees: '\u20B950,000 / yr', eligibility: '10+2 with Science', seats: 120 },
  { id: 2, title: 'B.A English Literature', duration: '3 Years', fees: '\u20B930,000 / yr', eligibility: '10+2 (Any Stream)', seats: 60 },
  { id: 3, title: 'B.Com Accounting', duration: '3 Years', fees: '\u20B940,000 / yr', eligibility: '10+2 Commerce', seats: 150 },
  { id: 4, title: 'Class 1-12', duration: '12 Years', fees: '\u20B960,000 / yr', eligibility: 'Age Criteria', seats: 'Open' },
  { id: 5, title: 'Diploma in Engineering', duration: '3 Years', fees: '\u20B935,000 / yr', eligibility: '10th Pass', seats: 80 },
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

export default async function InstitutionDetailsPage({ params }: { params: { slug: string } }) {
  const institution = await getInstitutionBySlug(params.slug);

  if (!institution) {
    notFound();
  }

  const currentYear = new Date().getFullYear();
  const stateStr = (institution as any).state || "West Bengal";
  const cityStr = (institution as any).city || "City";

  // Generate JSON-LD Schemas
  const schemaInstitution = {
    "@context":"https://schema.org",
    "@type":"CollegeOrUniversity",
    "name": institution.title,
    "url": `https://deshexam.com/institution/${params.slug}`,
    "telephone": institution.phoneNumber || "",
    "address":{
      "@type":"PostalAddress",
      "addressLocality": cityStr,
      "addressRegion": stateStr,
      "addressCountry": "IN"
    }
  };

  const schemaRating = institution.rating ? {
    "@context":"https://schema.org",
    "@type":"AggregateRating",
    "itemReviewed": {
      "@type": "CollegeOrUniversity",
      "name": institution.title
    },
    "ratingValue": institution.rating,
    "reviewCount": institution.userRatingsTotal || 1
  } : null;

  const schemaFAQ = {
    "@context":"https://schema.org",
    "@type":"FAQPage",
    "mainEntity": MOCK_FAQS.map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  const schemaBreadcrumb = {
    "@context":"https://schema.org",
    "@type":"BreadcrumbList",
    "itemListElement":[
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://deshexam.com/" },
      { "@type": "ListItem", "position": 2, "name": "Institutions", "item": "https://deshexam.com/institutions" },
      { "@type": "ListItem", "position": 3, "name": stateStr, "item": `https://deshexam.com/institutions/${stateStr.toLowerCase().replace(/\s+/g, '-')}` },
      { "@type": "ListItem", "position": 4, "name": cityStr, "item": `https://deshexam.com/institutions/${stateStr.toLowerCase().replace(/\s+/g, '-')}/${cityStr.toLowerCase().replace(/\s+/g, '-')}` },
      { "@type": "ListItem", "position": 5, "name": institution.title, "item": `https://deshexam.com/institution/${params.slug}` }
    ]
  };

  const schemas: any[] = [schemaInstitution, schemaFAQ, schemaBreadcrumb];
  if (schemaRating) schemas.push(schemaRating);

  // Cover Image (Mocked if not present)
  const coverImage = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=2000';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] pb-20 font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      
      {/* 1. HERO BANNER */}
      <div className="relative w-full overflow-hidden">
        <Image src={coverImage} alt={`${institution.title} campus building and facilities in ${cityStr}, ${stateStr}`} fill className="object-cover brightness-[0.4]" unoptimized />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-900/40" />
        
        <div className="relative pt-8 px-4 md:px-8 max-w-7xl mx-auto flex flex-col pb-8 z-10">
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

          {/* ── MOBILE: stacked native layout ── DESKTOP: side-by-side ── */}
          <div className="flex flex-col lg:flex-row gap-8 items-start justify-between w-full">

            {/* Left Column */}
            <div className="w-full lg:w-2/3 flex flex-col gap-5">

              {/* Logo + Name row */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-white shadow-xl flex items-center justify-center overflow-hidden shrink-0 relative">
                  {institution.logoUrl || institution.featureImage ? (
                    <Image src={institution.logoUrl || institution.featureImage || ''} alt={`${institution.title} official logo`} fill className="object-contain p-2" unoptimized />
                  ) : (
                    <Building className="w-10 h-10 text-slate-300" />
                  )}
                </div>
                <div className="flex flex-col gap-1.5 min-w-0">
                  <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 self-start text-[10px] px-2 py-0.5">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                  </Badge>
                  <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">{institution.title}</h1>
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{institution.address ? institution.address.split(',').slice(-2).join(',').trim() : `${cityStr}, ${stateStr}`}</span>
                  </div>
                </div>
              </div>

              {/* Rating + Type pills */}
              <div className="flex flex-wrap items-center gap-2">
                {institution.boardType && (
                  <span className="flex items-center gap-1.5 bg-white/10 text-white/90 text-xs px-3 py-1.5 rounded-full border border-white/15 font-medium">
                    <Building className="w-3.5 h-3.5" /> {institution.boardType}
                  </span>
                )}
                {institution.rating && (
                  <span className="flex items-center gap-1.5 bg-amber-500/20 text-amber-300 text-xs px-3 py-1.5 rounded-full border border-amber-500/30 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {institution.rating} <span className="font-normal text-amber-300/70">({institution.userRatingsTotal || 0})</span>
                  </span>
                )}
                <span className="text-[10px] text-white/50">Updated {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>

              {/* Info chips — WRAPPING, no scroll */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 bg-blue-500/15 text-blue-200 border border-blue-400/20 text-xs font-semibold px-3 py-1.5 rounded-full">
                  <Calendar className="w-3 h-3" /> Est. {institution.establishedYear || '2013'}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-purple-500/15 text-purple-200 border border-purple-400/20 text-xs font-semibold px-3 py-1.5 rounded-full">
                  <BookOpen className="w-3 h-3" /> {institution.mediumOfInstruction ? (Array.isArray(institution.mediumOfInstruction) ? institution.mediumOfInstruction.join(' & ') : institution.mediumOfInstruction) : 'English'}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-emerald-500/15 text-emerald-200 border border-emerald-400/20 text-xs font-semibold px-3 py-1.5 rounded-full">
                  <Building className="w-3 h-3" /> College
                </span>
              </div>

              {/* CTA Buttons — tiny compact native pills */}
              <div className="flex flex-wrap items-center gap-2">
                <Button className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-semibold h-8 px-4 rounded-full shadow-md shadow-emerald-600/30 transition-all text-xs border-0">
                  Admission Info
                </Button>
                <Button className="bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 text-white font-medium h-8 px-4 rounded-full backdrop-blur-md transition-all text-xs">
                  📄 Brochure
                </Button>
                {institution.websiteUrl ? (
                  <Button asChild className="bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 text-white font-medium h-8 px-4 rounded-full backdrop-blur-md transition-all text-xs">
                    <a href={institution.websiteUrl} target="_blank" rel="noopener noreferrer">🌐 Website</a>
                  </Button>
                ) : (
                  <Button className="bg-white/5 border border-white/10 text-white/30 font-medium h-8 px-4 rounded-full text-xs" disabled>
                    🌐 Website
                  </Button>
                )}
              </div>
            </div>

            {/* Right side: Stats Cards */}
            <div className="lg:w-1/3 w-full grid grid-cols-2 gap-2.5 lg:pt-0">
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 text-white flex flex-col items-center justify-center gap-0.5 active:scale-[0.97] transition-all">
                <div className="text-2xl font-extrabold tracking-tight">{institution.totalEnrollment || '7,841'}</div>
                <div className="text-[11px] text-white/60 font-medium">Students</div>
              </div>
              <div className="bg-amber-500/20 backdrop-blur-md border border-amber-400/25 rounded-2xl p-4 text-amber-50 flex flex-col items-center justify-center gap-0.5 active:scale-[0.97] transition-all">
                <div className="flex items-center gap-1 text-2xl font-extrabold tracking-tight">{institution.rating || '4.7'}<Star className="w-5 h-5 fill-amber-400 text-amber-400 ml-0.5" /></div>
                <div className="text-[11px] text-amber-200/70 font-medium">Rating</div>
              </div>
              <div className="bg-emerald-500/15 backdrop-blur-md border border-emerald-400/20 rounded-2xl p-4 text-emerald-50 flex flex-col items-center justify-center gap-0.5 active:scale-[0.97] transition-all">
                <div className="text-2xl font-extrabold tracking-tight">{MOCK_COURSES.length}</div>
                <div className="text-[11px] text-emerald-200/70 font-medium">Courses</div>
              </div>
              <div className="bg-purple-500/15 backdrop-blur-md border border-purple-400/20 rounded-2xl p-4 text-purple-50 flex flex-col items-center justify-center gap-0.5 active:scale-[0.97] transition-all">
                <div className="text-2xl font-extrabold tracking-tight">{institution.userRatingsTotal || 471}</div>
                <div className="text-[11px] text-purple-200/70 font-medium">Reviews</div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* QUICK ACTION BAR â€” sticky native Android horizontal scroll */}
      <div className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-40">
        <div className="flex overflow-x-auto no-scrollbar">
          {[
            { icon: <MapPin className="w-5 h-5 text-indigo-500" />, label: 'Address', value: institution.address ? institution.address.split(',')[0] : 'View' },
            { icon: <Phone className="w-5 h-5 text-emerald-500" />, label: 'Phone', value: institution.phoneNumber || 'Call' },
            { icon: <Mail className="w-5 h-5 text-amber-500" />, label: 'Email', value: 'Email Us' },
            { icon: <BookOpen className="w-5 h-5 text-purple-500" />, label: 'Courses', value: `${MOCK_COURSES.length} Available` },
            { icon: <Globe className="w-5 h-5 text-cyan-500" />, label: 'Website', value: institution.websiteUrl ? 'Open' : 'N/A' },
            { icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, label: 'Admission', value: institution.admission?.admissionOpen ? 'Open âœ“' : 'Closed' },
            { icon: <Building className="w-5 h-5 text-slate-500" />, label: 'Board', value: institution.boardType || 'University' },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center text-center px-5 py-3 shrink-0 border-r border-slate-100 last:border-r-0 min-w-[90px] active:bg-slate-50 transition-colors cursor-pointer">
              {item.icon}
              <span className="font-semibold text-slate-800 text-[11px] mt-1.5">{item.label}</span>
              <span className="text-slate-400 text-[10px] line-clamp-1 mt-0.5">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* PAGE BODY */}
      <div className="max-w-7xl mx-auto px-0 sm:px-4 md:px-8 pb-8 grid grid-cols-1 lg:grid-cols-12 gap-0 sm:gap-8 sm:mt-4">
        
        {/* LEFT COLUMN (MAIN CONTENT) */}
        <div className="lg:col-span-8 space-y-0 sm:space-y-6">
          
          {/* ABOUT */}
          <div className="bg-white sm:rounded-2xl sm:shadow-sm overflow-hidden">
            <div className="px-4 pt-5 pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">About Institution</h2>
            </div>
            <div className="px-4 py-4 text-slate-600 text-sm leading-relaxed">
              {institution.description ? (
                <div className="tiptap-content line-clamp-4" dangerouslySetInnerHTML={{ __html: institution.description }} />
              ) : (
                <p className="line-clamp-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
              )}
            </div>
            <div className="px-4 pb-4">
              <Button variant="outline" className="w-full text-indigo-600 border-indigo-100 hover:bg-indigo-50 rounded-xl h-11 font-semibold text-sm">Read Full Description</Button>
            </div>
          </div>

          <div className="h-2 sm:h-0 bg-slate-100 sm:bg-transparent" />

          {/* COURSES */}
          <div className="bg-white sm:rounded-2xl sm:shadow-sm overflow-hidden">
            <div className="px-4 pt-5 pb-3 flex items-center justify-between border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Courses & Programs</h2>
              <span className="text-xs text-indigo-600 font-semibold">{MOCK_COURSES.length} Courses</span>
            </div>
            <div className="divide-y divide-slate-50">
              {MOCK_COURSES.map(course => (
                <div key={course.id} className="px-4 py-4 flex items-start gap-3 active:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-slate-900 leading-tight">{course.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{course.duration} &middot; {course.eligibility}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-emerald-600">{course.fees.replace(' / yr', '')}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">per year</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2.5">
                      <span className="text-[10px] bg-slate-100 text-slate-600 rounded-full px-2 py-0.5 font-medium">Seats: {course.seats}</span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 rounded-full px-2 py-0.5 font-medium">New</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 mt-1" />
                </div>
              ))}
            </div>
          </div>

          <div className="h-2 sm:h-0 bg-slate-100 sm:bg-transparent" />

          {/* FACILITIES */}
          <div className="bg-white sm:rounded-2xl sm:shadow-sm overflow-hidden">
            <div className="px-4 pt-5 pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Facilities</h2>
            </div>
            <div className="px-4 py-4">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {(institution.facilities && institution.facilities.length > 0 ? institution.facilities : MOCK_FACILITIES).slice(0, 9).map((facilityObj: any, idx) => {
                  const facilityStr = typeof facilityObj === 'string' ? facilityObj : (facilityObj.label || facilityObj.title || 'Facility');
                  const available = typeof facilityObj === 'string' ? true : facilityObj.available !== false;
                  const iconMap: Record<string, React.ReactNode> = {
                    'Library': <BookOpen className="w-6 h-6" />, 'Hostel': <Bed className="w-6 h-6" />,
                    'Wi-Fi': <Wifi className="w-6 h-6" />, 'Smart Class': <Monitor className="w-6 h-6" />,
                    'Cafeteria': <Coffee className="w-6 h-6" />, 'Transport': <Bus className="w-6 h-6" />,
                    'Sports': <Trophy className="w-6 h-6" />, 'Sports Complex': <Trophy className="w-6 h-6" />,
                    'Lab': <TestTube className="w-6 h-6" />, 'Labs': <TestTube className="w-6 h-6" />,
                    'Medical': <PlusSquare className="w-6 h-6" />, 'Medical Facility': <PlusSquare className="w-6 h-6" />,
                    'Auditorium': <Tent className="w-6 h-6" />, 'WiFi': <Wifi className="w-6 h-6" />,
                  };
                  return (
                    <div key={idx} className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center ${available ? 'border-emerald-100 bg-emerald-50/60' : 'border-slate-100 bg-slate-50 opacity-60'}`}>
                      <div className={`mb-1.5 ${available ? 'text-emerald-600' : 'text-slate-400'}`}>{iconMap[facilityStr] || facilityObj.icon || <Building className="w-6 h-6" />}</div>
                      <span className="text-[11px] font-bold text-slate-800 leading-tight">{facilityStr}</span>
                      {available ? <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-1" /> : <XCircle className="w-3 h-3 text-slate-300 mt-1" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="h-2 sm:h-0 bg-slate-100 sm:bg-transparent" />

          {/* ADMISSION */}
          <div className="bg-white sm:rounded-2xl sm:shadow-sm overflow-hidden">
            <div className="px-4 pt-5 pb-3 flex items-center justify-between border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Admission</h2>
              <Badge className={institution.admission?.admissionOpen ? "bg-emerald-500 text-white text-[10px]" : "bg-slate-200 text-slate-600 text-[10px]"}>
                {institution.admission?.admissionOpen ? 'Open Now' : 'Closed'}
              </Badge>
            </div>
            <div className="px-4 pt-5 pb-4">
              <div className="relative flex justify-between items-start w-full mb-6 px-2">
                <div className="absolute top-2.5 left-0 w-full h-0.5 bg-slate-100 -z-10" />
                {[{ step: '1', label: 'Register' }, { step: '2', label: 'Upload' }, { step: '3', label: 'Verify' }, { step: '4', label: 'Confirm' }].map((s, i) => (
                  <div key={i} className="flex flex-col items-center w-1/4">
                    <div className={`w-6 h-6 rounded-full border-4 border-white mb-1.5 shadow-sm flex items-center justify-center text-[9px] font-bold ${i < 2 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>{s.step}</div>
                    <span className="text-[10px] font-bold text-slate-700 text-center">{s.label}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-slate-50 rounded-xl p-3"><span className="text-[10px] text-slate-400 font-semibold uppercase block mb-0.5">Start Date</span><span className="font-bold text-slate-800 text-sm">{institution.admission?.applicationStartDate ? new Date(institution.admission.applicationStartDate).toLocaleDateString('en-GB') : 'TBA'}</span></div>
                <div className="bg-slate-50 rounded-xl p-3"><span className="text-[10px] text-slate-400 font-semibold uppercase block mb-0.5">End Date</span><span className="font-bold text-slate-800 text-sm">{institution.admission?.applicationEndDate ? new Date(institution.admission.applicationEndDate).toLocaleDateString('en-GB') : 'TBA'}</span></div>
                <div className="bg-slate-50 rounded-xl p-3"><span className="text-[10px] text-slate-400 font-semibold uppercase block mb-0.5">Mode</span><span className="font-bold text-slate-800 text-sm">{institution.admission?.admissionMode || 'Online'}</span></div>
                <div className="bg-slate-50 rounded-xl p-3"><span className="text-[10px] text-slate-400 font-semibold uppercase block mb-0.5">App. Fee</span><span className="font-bold text-slate-800 text-sm">{institution.admission?.applicationFee ? `â‚¹${institution.admission.applicationFee}` : 'Free'}</span></div>
              </div>
              <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm h-12 font-bold text-base">
                {institution.admission?.admissionUrl ? (<a href={institution.admission.admissionUrl} target="_blank" rel="noopener noreferrer">Apply Now â†’</a>) : (<Link href="#">Apply Now â†’</Link>)}
              </Button>
            </div>
          </div>

          <div className="h-2 sm:h-0 bg-slate-100 sm:bg-transparent" />

          {/* GALLERY â€” horizontal scroll strip */}
          <div className="bg-white sm:rounded-2xl sm:shadow-sm overflow-hidden">
            <div className="px-4 pt-5 pb-3 flex items-center justify-between border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Gallery</h2>
              <span className="text-xs text-indigo-600 font-semibold">View All</span>
            </div>
            <div className="flex overflow-x-auto gap-3 px-4 py-4 no-scrollbar">
              {(institution.galleryImages && institution.galleryImages.length > 0 ? institution.galleryImages : [...MOCK_GALLERY, ...MOCK_GALLERY, MOCK_GALLERY[0]]).slice(0, 9).map((img, idx) => (
                <div key={idx} className="relative rounded-xl overflow-hidden shrink-0 w-36 h-28 sm:w-48 sm:h-36">
                  <Image src={img} alt={`${institution.title} campus gallery image ${idx + 1}`} fill className="object-cover" unoptimized />
                </div>
              ))}
            </div>
          </div>

          <div className="h-2 sm:h-0 bg-slate-100 sm:bg-transparent" />

          {/* REVIEWS */}
          <div className="bg-white sm:rounded-2xl sm:shadow-sm overflow-hidden">
            <div className="px-4 pt-5 pb-3 flex items-center justify-between border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Reviews</h2>
              <span className="text-xs text-indigo-600 font-semibold">Write a Review</span>
            </div>
            <div className="px-4 py-4">
              <div className="flex items-center gap-5 mb-5 bg-slate-50 rounded-2xl p-4">
                <div className="text-center">
                  <div className="text-4xl font-black text-slate-900">{institution.rating || '4.5'}</div>
                  <div className="flex text-amber-400 justify-center mt-1">
                    {[1,2,3,4,5].map(i => <Star key={i} className={`w-4 h-4 ${i <= Math.round(Number(institution.rating || 4)) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">{institution.userRatingsTotal || 14} reviews</div>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5,4,3,2,1].map(stars => (
                    <div key={stars} className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span className="w-3 text-right font-bold">{stars}</span>
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 shrink-0" />
                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${stars === 5 ? 70 : stars === 4 ? 20 : stars === 3 ? 5 : 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {institution.aiReviewSummary && (
                <div className="mb-4 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold mb-2 text-sm"><Sparkles className="w-4 h-4" /> AI Review Summary</div>
                  <div className="text-slate-600 text-xs leading-relaxed line-clamp-4">{institution.aiReviewSummary}</div>
                </div>
              )}
              <div className="space-y-3">
                {(institution.reviews && institution.reviews.length > 0 ? institution.reviews : MOCK_REVIEWS).map((review: any, idx) => (
                  <div key={idx} className="border border-slate-100 rounded-2xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Image src={review.authorPhotoUrl || review.avatar} alt={review.authorName || review.name} width={36} height={36} className="rounded-full bg-slate-200 shrink-0" unoptimized />
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{review.authorName || review.name}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          {[1,2,3,4,5].map(i => <Star key={i} className={`w-3 h-3 ${i <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />)}
                          <span className="text-[10px] text-slate-400 ml-1">{review.time || 'May 2023'}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="h-2 sm:h-0 bg-slate-100 sm:bg-transparent" />

          {/* FAQs */}
          <div className="bg-white sm:rounded-2xl sm:shadow-sm overflow-hidden">
            <div className="px-4 pt-5 pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">FAQs</h2>
            </div>
            <div className="divide-y divide-slate-50">
              {MOCK_FAQS.map((faq, idx) => (
                <details key={idx} className="group [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between cursor-pointer px-4 py-4 font-semibold text-slate-800 text-sm hover:bg-slate-50 active:bg-slate-100 transition-colors list-none">
                    <span>{faq.q}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform shrink-0 ml-2" />
                  </summary>
                  <div className="px-4 pb-4 text-slate-500 text-xs leading-relaxed bg-slate-50/50">{faq.a}</div>
                </details>
              ))}
            </div>
          </div>

          <div className="h-2 sm:h-0 bg-slate-100 sm:bg-transparent" />

          {/* NEARBY */}
          <div className="bg-white sm:rounded-2xl sm:shadow-sm overflow-hidden">
            <div className="px-4 pt-5 pb-3 flex items-center justify-between border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Nearby Institutions</h2>
              <Link href="/institution" className="text-xs text-indigo-600 font-semibold">View All</Link>
            </div>
            <div className="divide-y divide-slate-50">
              {MOCK_NEARBY.map(nearby => (
                <Link href="/institution" key={nearby.id} className="flex items-center gap-3 px-4 py-3.5 active:bg-slate-50 transition-colors">
                  <Image src={nearby.img} alt={nearby.name} width={48} height={48} className="rounded-xl object-cover shrink-0" unoptimized />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-slate-900 truncate">{nearby.name}</div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <Building className="w-3 h-3 shrink-0" /> {nearby.type} <span className="text-slate-300">Â·</span> {nearby.location}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (SIDEBAR) â€” desktop only */}
        <div className="lg:col-span-4 space-y-6 hidden lg:block">
          <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-2">
                {(institution.galleryImages && institution.galleryImages.length > 0 ? institution.galleryImages : MOCK_GALLERY).slice(0, 4).map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
                    <Image src={img} alt={`${institution.title} campus gallery image ${idx + 1}`} fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized />
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-3 text-xs font-semibold rounded-xl">View All Photos</Button>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm rounded-2xl bg-white">
            <CardContent className="p-6">
              <h3 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Contact Us</h3>
              <div className="space-y-4">
                <a href={`tel:${institution.phoneNumber || '+919876543210'}`} className="flex items-center gap-3 text-slate-600 hover:text-emerald-600 transition-colors group">
                  <div className="bg-emerald-50 p-2.5 rounded-full text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors"><Phone className="w-4 h-4" /></div>
                  <div><div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Call Us</div><div className="text-sm font-semibold">{institution.phoneNumber || '+91 98765 43210'}</div></div>
                </a>
                <a href="mailto:contact@institution.edu" className="flex items-center gap-3 text-slate-600 hover:text-amber-600 transition-colors group">
                  <div className="bg-amber-50 p-2.5 rounded-full text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors"><Mail className="w-4 h-4" /></div>
                  <div><div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Email</div><div className="text-sm font-semibold">contact@institution.edu</div></div>
                </a>
                {institution.websiteUrl && (
                  <a href={institution.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-600 hover:text-indigo-600 transition-colors group">
                    <div className="bg-indigo-50 p-2.5 rounded-full text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors"><Globe className="w-4 h-4" /></div>
                    <div><div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Website</div><div className="text-sm font-semibold truncate">{institution.websiteUrl}</div></div>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm rounded-2xl bg-white">
            <CardContent className="p-6">
              <h3 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                <div><span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-1 flex items-center gap-1"><Building className="w-3 h-3"/>Ownership</span><span className="font-semibold text-slate-800">{(institution as any).ownershipType || 'Private'}</span></div>
                <div><span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/>Area</span><span className="font-semibold text-slate-800">{(institution as any).campusArea || '50 Acres'}</span></div>
                <div><span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-1 flex items-center gap-1"><Users className="w-3 h-3"/>Faculty</span><span className="font-semibold text-slate-800">{(institution as any).facultyCount || '200+'}</span></div>
                <div><span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/>Est. Year</span><span className="font-semibold text-slate-800">{institution.establishedYear || '1995'}</span></div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm rounded-2xl bg-white">
            <CardContent className="p-6">
              <h3 className="font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">Location</h3>
              <div className="text-sm text-slate-600 mb-3 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>{institution.address || 'Institution Address, City, State'}</span>
              </div>
              {institution.latitude && institution.longitude ? (
                <div className="rounded-xl overflow-hidden border border-slate-200">
                  <iframe width="100%" height="200" frameBorder="0" scrolling="no" marginHeight={0} marginWidth={0}
                    src={`https://maps.google.com/maps?q=${institution.latitude},${institution.longitude}&hl=en&z=14&output=embed`} />
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 h-[180px] flex items-center justify-center text-slate-400 text-sm">Map Not Available</div>
              )}
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white">
            <CardContent className="p-6 text-center">
              <BookOpen className="w-10 h-10 mx-auto mb-3 text-indigo-200" />
              <h3 className="font-bold text-lg mb-1">Download Brochure</h3>
              <p className="text-sm text-indigo-100 mb-4">Courses, fees, and facilities at a glance.</p>
              <Button className="w-full bg-white text-indigo-700 hover:bg-indigo-50 font-bold shadow-sm">Download PDF</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CONTACT SECTION â€” mobile only */}
      <div className="lg:hidden bg-white border-t border-slate-100">
        <div className="px-4 pt-5 pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Contact & Info</h2>
        </div>
        <div className="divide-y divide-slate-50">
          <a href={`tel:${institution.phoneNumber || '+919876543210'}`} className="flex items-center gap-3 px-4 py-4 active:bg-slate-50">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0"><Phone className="w-5 h-5 text-emerald-600" /></div>
            <div><div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Call</div><div className="text-sm font-semibold text-slate-900">{institution.phoneNumber || '+91 98765 43210'}</div></div>
            <ChevronRight className="w-4 h-4 text-slate-300 ml-auto shrink-0" />
          </a>
          <a href="mailto:contact@institution.edu" className="flex items-center gap-3 px-4 py-4 active:bg-slate-50">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0"><Mail className="w-5 h-5 text-amber-600" /></div>
            <div><div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Email</div><div className="text-sm font-semibold text-slate-900">contact@institution.edu</div></div>
            <ChevronRight className="w-4 h-4 text-slate-300 ml-auto shrink-0" />
          </a>
          {institution.websiteUrl && (
            <a href={institution.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-4 active:bg-slate-50">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0"><Globe className="w-5 h-5 text-indigo-600" /></div>
              <div><div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Website</div><div className="text-sm font-semibold text-slate-900 truncate">{institution.websiteUrl}</div></div>
              <ChevronRight className="w-4 h-4 text-slate-300 ml-auto shrink-0" />
            </a>
          )}
        </div>
      </div>

      {/* Sticky Mobile Footer CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-slate-200 px-4 py-3 flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-50">
        <Button variant="outline" className="flex-1 border-slate-200 font-semibold h-12 rounded-xl text-slate-700"><Phone className="w-4 h-4 mr-2" /> Call</Button>
        <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm h-12 rounded-xl text-base">Apply Now</Button>
      </div>
    </div>
  );
}

