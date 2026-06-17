import React from 'react';
import { notFound } from 'next/navigation';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { TaxonomyNode } from '@/lib/firebase/taxonomy';
import { 
  MapPin, Globe, Star, Building, Navigation, ArrowLeft, Bookmark, CheckCircle2, 
  Users, BookOpen, Clock, Phone, Mail, FileText, Monitor, Bed, Bus, TestTube, 
  Trophy, Wifi, Coffee, Tent, PlusSquare, ChevronDown, ChevronRight, Filter
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

export default async function InstitutionDetailsPage({ params }: { params: { slug: string } }) {
  const institution = await getInstitutionBySlug(params.slug);

  if (!institution) {
    notFound();
  }

  // Cover Image (Mocked if not present)
  const coverImage = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=2000';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] pb-20 font-sans">
      
      {/* 1. HERO BANNER */}
      <div className="relative w-full h-[450px] md:h-[500px]">
        <Image src={coverImage} alt="Campus" fill className="object-cover brightness-50" unoptimized />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
        
        <div className="absolute inset-0 pt-20 px-4 md:px-8 max-w-7xl mx-auto flex flex-col justify-end pb-10">
          <div className="flex justify-between items-start w-full">
            <Link href="/institution" className="inline-flex items-center text-white/80 hover:text-white transition-colors text-sm font-medium mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Directory
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-end justify-between w-full">
            
            {/* Left side: Logo & Title */}
            <div className="flex flex-col md:flex-row gap-6 items-end w-full lg:w-auto">
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-white shadow-xl border-4 border-white/10 flex items-center justify-center overflow-hidden shrink-0 z-10 relative">
                {institution.logoUrl || institution.featureImage ? (
                  <Image src={institution.logoUrl || institution.featureImage || ''} alt={institution.title || ''} fill className="object-contain p-2" unoptimized />
                ) : (
                  <Building className="w-16 h-16 text-slate-300" />
                )}
              </div>
              <div className="text-white space-y-2 pb-2 flex-grow">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-none shadow-sm backdrop-blur-md">{institution.boardType || 'University'}</Badge>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 backdrop-blur-md"><CheckCircle2 className="w-3 h-3 mr-1" /> Verified</Badge>
                  {institution.rating && (
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-4 h-4 fill-amber-400" /> {institution.rating}
                    </div>
                  )}
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">{institution.title}</h1>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-300 mt-2">
                  <span className="flex items-center gap-1"><Building className="w-4 h-4" /> Type: {institution.boardType || 'Educational Institution'}</span>
                  <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> Medium: English</span>
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Location: {institution.address ? institution.address.split(',')[0] : 'City'}</span>
                </div>
                <div className="flex gap-3 mt-4">
                  {institution.websiteUrl && (
                    <Button asChild className="bg-white text-slate-900 hover:bg-slate-100 font-semibold shadow-lg">
                      <a href={institution.websiteUrl} target="_blank" rel="noopener noreferrer"><Globe className="w-4 h-4 mr-2" /> Visit Website</a>
                    </Button>
                  )}
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">Get Admission Info</Button>
                </div>
              </div>
            </div>

            {/* Right side: Stats Cards */}
            <div className="hidden lg:grid grid-cols-2 gap-4 pb-2">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-white min-w-[140px]">
                <Users className="w-6 h-6 text-emerald-400 mb-2" />
                <div className="text-xs text-slate-300 uppercase tracking-wider font-semibold">Students</div>
                <div className="text-2xl font-bold">5,200+</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-white min-w-[140px]">
                <BookOpen className="w-6 h-6 text-indigo-400 mb-2" />
                <div className="text-xs text-slate-300 uppercase tracking-wider font-semibold">Teachers</div>
                <div className="text-2xl font-bold">180+</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-white min-w-[140px]">
                <FileText className="w-6 h-6 text-rose-400 mb-2" />
                <div className="text-xs text-slate-300 uppercase tracking-wider font-semibold">Courses</div>
                <div className="text-2xl font-bold">{MOCK_COURSES.length}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-white min-w-[140px]">
                <Star className="w-6 h-6 text-amber-400 mb-2" />
                <div className="text-xs text-slate-300 uppercase tracking-wider font-semibold">Rating</div>
                <div className="text-2xl font-bold">{institution.rating || '4.7'} / 5</div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* PAGE LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN (MAIN CONTENT) - 70% */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* 2. QUICK INFO BAR */}
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardContent className="p-6 grid grid-cols-2 md:grid-cols-5 gap-6 divide-x divide-slate-100 text-sm">
              <div className="flex flex-col items-center text-center px-2">
                <MapPin className="w-5 h-5 text-indigo-500 mb-2" />
                <span className="font-semibold text-slate-800">Address</span>
                <span className="text-slate-500 text-xs line-clamp-2 mt-1">{institution.address || 'Location Details'}</span>
              </div>
              <div className="flex flex-col items-center text-center px-2">
                <Phone className="w-5 h-5 text-emerald-500 mb-2" />
                <span className="font-semibold text-slate-800">Phone</span>
                <span className="text-slate-500 text-xs mt-1">{institution.phoneNumber || '+91 98765 43210'}</span>
              </div>
              <div className="flex flex-col items-center text-center px-2">
                <Mail className="w-5 h-5 text-amber-500 mb-2" />
                <span className="font-semibold text-slate-800">Email</span>
                <span className="text-slate-500 text-xs mt-1 line-clamp-1">info@institution.edu</span>
              </div>
              <div className="flex flex-col items-center text-center px-2">
                <Globe className="w-5 h-5 text-cyan-500 mb-2" />
                <span className="font-semibold text-slate-800">Website</span>
                <span className="text-slate-500 text-xs mt-1 line-clamp-1">{institution.websiteUrl ? 'Available' : 'N/A'}</span>
              </div>
              <div className="flex flex-col items-center text-center px-2 bg-emerald-50/50 rounded-lg py-2 border border-emerald-100">
                <Clock className="w-5 h-5 text-emerald-600 mb-2" />
                <span className="font-semibold text-emerald-900">Admission</span>
                <Badge className="mt-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">Open Now</Badge>
              </div>
            </CardContent>
          </Card>

          {/* 3. OVERVIEW */}
          <Card className="border-none shadow-sm rounded-2xl bg-white">
            <CardContent className="p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">About Institution</h2>
                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                  {institution.description ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {institution.description}
                    </ReactMarkdown>
                  ) : (
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                    </p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Vision & Mission</h3>
                <p className="text-slate-600 leading-relaxed">
                  Our institution is dedicated to providing excellence in education. We strive to nurture talent, foster innovation, and build a community of lifelong learners who will contribute positively to society.
                </p>
              </div>
              <Button variant="outline" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50">Read More</Button>
            </CardContent>
          </Card>

          {/* 4. COURSES / PROGRAMS */}
          <Card className="border-none shadow-sm rounded-2xl bg-white">
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Courses / Programs</h2>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Input placeholder="Search courses..." className="max-w-xs bg-slate-50 border-slate-200" />
                  <Button variant="outline" className="shrink-0"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_COURSES.map(course => (
                  <div key={course.id} className="border border-slate-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all bg-slate-50/50">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-lg text-slate-900">{course.title}</h3>
                      <Bookmark className="w-5 h-5 text-slate-400 hover:text-indigo-500 cursor-pointer" />
                    </div>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm text-slate-600 mb-4">
                      <div><span className="text-slate-400">Duration:</span> <span className="font-medium text-slate-800">{course.duration}</span></div>
                      <div><span className="text-slate-400">Fees:</span> <span className="font-medium text-slate-800">{course.fees}</span></div>
                      <div><span className="text-slate-400">Eligibility:</span> <span className="font-medium text-slate-800 line-clamp-1">{course.eligibility}</span></div>
                      <div><span className="text-slate-400">Seats:</span> <span className="font-medium text-slate-800">{course.seats}</span></div>
                    </div>
                    <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-lg">Apply Now</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 5. FACILITIES */}
          <Card className="border-none shadow-sm rounded-2xl bg-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Facilities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {MOCK_FACILITIES.map((facility, idx) => (
                  <div key={idx} className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 transition-colors text-slate-600 hover:text-emerald-700 cursor-default">
                    <div className="mb-3 p-3 bg-slate-50 rounded-full">{facility.icon}</div>
                    <span className="text-sm font-semibold text-center">{facility.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 6. ADMISSION INFO (TIMELINE) */}
          <Card className="border-none shadow-sm rounded-2xl bg-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-8">Admission Process</h2>
              <div className="relative border-l-2 border-indigo-100 ml-3 md:ml-4 space-y-8">
                {MOCK_ADMISSION_STEPS.map((step, idx) => (
                  <div key={idx} className="relative pl-8 md:pl-10">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-indigo-500 border-4 border-white shadow-sm"></div>
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-2">
                      <Badge variant="outline" className="w-fit text-indigo-700 border-indigo-200 bg-indigo-50">{step.step}</Badge>
                      <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                    </div>
                    <p className="text-slate-600 text-sm mb-2">{step.desc}</p>
                    <div className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Tentative Date: {step.date}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8">Start Application</Button>
              </div>
            </CardContent>
          </Card>

          {/* 7. GALLERY */}
          <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Campus Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {(institution.galleryImages && institution.galleryImages.length > 0 ? institution.galleryImages : MOCK_GALLERY).map((img, idx) => (
                  <div key={idx} className={`relative rounded-xl overflow-hidden group ${idx === 0 ? 'col-span-2 row-span-2 aspect-square md:aspect-auto' : 'aspect-square'}`}>
                    <Image src={img} alt="Gallery image" fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 8. REVIEWS */}
          <Card className="border-none shadow-sm rounded-2xl bg-white">
            <CardContent className="p-8">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">Student Reviews</h2>
                  <div className="flex items-center gap-2">
                    <div className="flex text-amber-400">
                      {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
                    </div>
                    <span className="font-bold text-lg">{institution.rating || '4.8'}</span>
                    <span className="text-slate-500 text-sm">({institution.userRatingsTotal || 124} reviews)</span>
                  </div>
                </div>
                <Button variant="outline">Write Review</Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {(institution.reviews && institution.reviews.length > 0 ? institution.reviews : MOCK_REVIEWS).map((review: any, idx) => (
                  <div key={idx} className="p-5 rounded-xl border border-slate-100 bg-slate-50">
                    <div className="flex items-center gap-3 mb-3">
                      <Image src={review.authorPhotoUrl || review.avatar} alt={review.authorName || review.name} width={40} height={40} className="rounded-full bg-slate-200" unoptimized />
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{review.authorName || review.name}</div>
                        <div className="text-xs text-slate-500">{review.time || review.course}</div>
                      </div>
                      <div className="ml-auto flex items-center bg-white px-2 py-1 rounded shadow-sm border border-slate-100">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400 mr-1" />
                        <span className="text-xs font-bold">{review.rating}.0</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 italic">"{review.text}"</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 9. FAQ */}
          <Card className="border-none shadow-sm rounded-2xl bg-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {MOCK_FAQS.map((faq, idx) => (
                  <details key={idx} className="group border border-slate-200 rounded-xl bg-white overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex items-center justify-between cursor-pointer p-5 font-semibold text-slate-800 hover:bg-slate-50 transition-colors">
                      {faq.q}
                      <span className="transition group-open:rotate-180">
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      </span>
                    </summary>
                    <div className="p-5 pt-0 text-slate-600 text-sm leading-relaxed border-t border-slate-100 bg-slate-50/50">
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
          
          {/* Admission Status Widget */}
          <Card className="border-none shadow-sm rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white overflow-hidden relative">
            <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
              <CheckCircle2 className="w-32 h-32" />
            </div>
            <CardContent className="p-6 relative z-10">
              <div className="text-emerald-100 text-sm font-semibold uppercase tracking-wider mb-1">Admission Status</div>
              <div className="text-3xl font-extrabold mb-4">Open Now</div>
              <p className="text-emerald-50 text-sm mb-6 opacity-90">Applications are currently being accepted for the 2024-2025 academic session.</p>
              <Button className="w-full bg-white text-emerald-700 hover:bg-emerald-50 font-bold text-lg h-12 shadow-lg">
                Apply Now
              </Button>
            </CardContent>
          </Card>

          {/* Important Dates */}
          <Card className="border-none shadow-sm rounded-2xl bg-white">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg text-slate-900 mb-4 border-b pb-3">Important Dates</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-slate-600 text-sm">Last Date to Apply</div>
                  <div className="font-semibold text-slate-900 text-sm bg-slate-100 px-2 py-1 rounded">25 Sep 2023</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-slate-600 text-sm">Entrance Exam</div>
                  <div className="font-semibold text-slate-900 text-sm bg-slate-100 px-2 py-1 rounded">12 Oct 2023</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-slate-600 text-sm">Result Declaration</div>
                  <div className="font-semibold text-slate-900 text-sm bg-slate-100 px-2 py-1 rounded">01 Nov 2023</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Card */}
          <Card className="border-none shadow-sm rounded-2xl bg-white">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg text-slate-900 mb-4 border-b pb-3">Contact Info</h3>
              <div className="space-y-3 mb-6">
                <a href={`tel:${institution.internationalPhoneNumber || institution.phoneNumber || '+919876543210'}`} className="flex items-center gap-3 text-slate-600 hover:text-indigo-600 transition-colors p-2 rounded-lg hover:bg-slate-50">
                  <div className="bg-indigo-50 p-2 rounded-full text-indigo-600"><Phone className="w-4 h-4" /></div>
                  <span className="text-sm font-medium">{institution.phoneNumber || '+91 98765 43210'}</span>
                </a>
                <a href="mailto:contact@institution.edu" className="flex items-center gap-3 text-slate-600 hover:text-rose-600 transition-colors p-2 rounded-lg hover:bg-slate-50">
                  <div className="bg-rose-50 p-2 rounded-full text-rose-600"><Mail className="w-4 h-4" /></div>
                  <span className="text-sm font-medium">contact@institution.edu</span>
                </a>
                {institution.websiteUrl && (
                  <a href={institution.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-600 hover:text-cyan-600 transition-colors p-2 rounded-lg hover:bg-slate-50">
                    <div className="bg-cyan-50 p-2 rounded-full text-cyan-600"><Globe className="w-4 h-4" /></div>
                    <span className="text-sm font-medium line-clamp-1">{institution.websiteUrl}</span>
                  </a>
                )}
              </div>
              
              {institution.latitude && institution.longitude && (
                <Button asChild variant="outline" className="w-full border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100">
                  <a href={`https://www.google.com/maps/search/?api=1&query=${institution.latitude},${institution.longitude}`} target="_blank" rel="noopener noreferrer">
                    <MapPin className="w-4 h-4 mr-2 text-emerald-600" /> View on Map
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Nearby Institutions */}
          <Card className="border-none shadow-sm rounded-2xl bg-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4 border-b pb-3">
                <h3 className="font-bold text-lg text-slate-900">Nearby</h3>
                <Link href="/institution" className="text-xs text-indigo-600 font-semibold hover:underline">View All</Link>
              </div>
              <div className="space-y-4">
                {MOCK_NEARBY.map(nearby => (
                  <Link href={`/institution`} key={nearby.id} className="flex items-center gap-3 group">
                    <Image src={nearby.img} alt={nearby.name} width={50} height={50} className="rounded-lg object-cover" unoptimized />
                    <div>
                      <div className="font-semibold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{nearby.name}</div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="flex items-center gap-0.5"><Building className="w-3 h-3" /> {nearby.type}</span>
                        <span>•</span>
                        <span>{nearby.location}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
          
        </div>
      </div>
    </div>
  );
}
