'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin, Star, Building, School, Globe, CheckCircle2, ShieldCheck, Map, Clock, ArrowRight, ChevronRight } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { TaxonomyNode } from '@/lib/firebase/taxonomy';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export default function InstitutionsClient({ 
  initialTypeFilter, 
  initialLocationFilter,
  initialPrefixFilter
}: { 
  initialTypeFilter?: string; 
  initialLocationFilter?: string; 
  initialPrefixFilter?: string;
}) {
  const [institutions, setInstitutions] = useState<TaxonomyNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialLocationFilter || '');
  const [activeTab, setActiveTab] = useState(initialTypeFilter || 'All');

  useEffect(() => {
    async function fetchInstitutions() {
      try {
        const q = query(
          collection(db, 'taxonomy_nodes'),
          where('type', '==', 'institution')
        );
        const snap = await getDocs(q);
        const fetchedNodes = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TaxonomyNode));
        // Sort alphabetically by title
        fetchedNodes.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        setInstitutions(fetchedNodes);
      } catch (error) {
        console.error('Failed to fetch institutions:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchInstitutions();
  }, []);

  const filteredInstitutions = institutions.filter(inst => {
    const matchesSearch = 
      (inst.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
      (inst.acronym?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (inst.address?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === 'All' || inst.boardType === activeTab;
    
    let matchesLocation = true;
    if (initialLocationFilter && initialLocationFilter.toLowerCase() !== 'india') {
       const locSearch = initialLocationFilter.toLowerCase();
       matchesLocation = 
          (inst.stateRegion?.toLowerCase() || '').includes(locSearch) || 
          (inst.address?.toLowerCase() || '').includes(locSearch);
    }

    let matchesPrefix = true;
    if (initialPrefixFilter) {
       const prefixSearch = initialPrefixFilter.toLowerCase();
       matchesPrefix = 
          // Match against any 'ownership' or 'courses' if they exist, else fuzzy match the whole object string as a fallback
          (inst as any).ownership?.toLowerCase().includes(prefixSearch) ||
          ((inst as any).courses || []).some((c: string) => c.toLowerCase().includes(prefixSearch)) ||
          JSON.stringify(inst).toLowerCase().includes(prefixSearch);
    }
    
    return matchesSearch && matchesTab && matchesLocation && matchesPrefix;
  });

  // Calculate current dynamic URL segments to preserve state when clicking other filters
  const currentLocSlug = initialLocationFilter ? initialLocationFilter.toLowerCase().replace(/ /g, '-') : 'india';
  
  let currentTypeSlug = 'institutions';
  if (initialTypeFilter === 'College') currentTypeSlug = 'colleges';
  if (initialTypeFilter === 'University') currentTypeSlug = 'universities';
  if (initialTypeFilter === 'Public School' || initialTypeFilter === 'School') currentTypeSlug = 'schools';
  if (initialTypeFilter === 'Coaching Institute') currentTypeSlug = 'coaching';

  const currentPrefixSlug = initialPrefixFilter ? `${initialPrefixFilter.toLowerCase().replace(/ /g, '-')}-` : '';

  const getFilterStyle = (isActive: boolean) => 
    `px-4 py-1.5 rounded-full border text-sm font-medium whitespace-nowrap transition-colors ${
      isActive 
        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-500/20' 
        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-emerald-300 hover:text-emerald-700'
    }`;

  const getGradient = (title: string) => {
    const charCode = title.charCodeAt(0) || 65;
    const gradients = [
      'from-emerald-500 to-teal-600',
      'from-indigo-500 to-blue-600',
      'from-purple-500 to-pink-600',
      'from-orange-500 to-red-600',
      'from-cyan-500 to-blue-600',
      'from-rose-500 to-red-600',
    ];
    return gradients[charCode % gradients.length];
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] relative pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-emerald-900 via-emerald-800 to-slate-50 dark:to-[#020817] pt-20 pb-32 px-6">
        <div className="max-w-6xl mx-auto text-center space-y-6">
          <Badge variant="outline" className="text-emerald-200 border-emerald-400 bg-emerald-950/50 backdrop-blur-md px-4 py-1 text-sm font-medium">
            Global Directory
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
            Institutions Directory in India
          </h1>
          
          {/* SEO Intro Text Block */}
          <div className="max-w-3xl mx-auto mt-6 text-emerald-50/90 text-base md:text-lg leading-relaxed text-left sm:text-center space-y-4">
            <p>
              DeshExam helps students discover and evaluate verified schools, colleges, and universities across India. 
              Our comprehensive educational directory is designed to simplify your academic journey by providing authentic, up-to-date data 
              from official sources and real student communities.
            </p>
            <p>
              Whether you are looking for the top-ranked engineering colleges in West Bengal, the best public schools in your city, or leading universities offering specialized degrees, you can easily compare admissions, courses, fee structures, campus facilities, placement records, and honest student reviews to confidently choose the right institution for your future.
            </p>
          </div>

          {/* EEAT Trust Badges */}
          <div className="flex flex-wrap justify-center gap-3 pt-4 pb-2">
            <Badge className="bg-white/10 hover:bg-white/20 text-emerald-100 border-none px-3 py-1.5 font-medium backdrop-blur-sm"><CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" /> Verified Institutions</Badge>
            <Badge className="bg-white/10 hover:bg-white/20 text-emerald-100 border-none px-3 py-1.5 font-medium backdrop-blur-sm"><Map className="w-4 h-4 mr-2 text-emerald-400" /> Data from Google Maps</Badge>
            <Badge className="bg-white/10 hover:bg-white/20 text-emerald-100 border-none px-3 py-1.5 font-medium backdrop-blur-sm"><ShieldCheck className="w-4 h-4 mr-2 text-emerald-400" /> Official Website Sources</Badge>
            <Badge className="bg-white/10 hover:bg-white/20 text-emerald-100 border-none px-3 py-1.5 font-medium backdrop-blur-sm"><Clock className="w-4 h-4 mr-2 text-emerald-400" /> Updated Regularly</Badge>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto pt-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-emerald-400 group-focus-within:text-emerald-600 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search by institution name, acronym, or location..."
                className="w-full pl-12 pr-4 py-4 md:py-5 rounded-2xl bg-white/95 backdrop-blur-xl border-2 border-emerald-100 shadow-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 text-slate-800 text-lg transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 -mt-16 relative z-10 space-y-8">
        
        {/* Crawlable Quick Filters */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm pb-6">
          <div className="flex items-center gap-2 mb-4">
            <Map className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-slate-800 text-lg">Quick Filters</h3>
          </div>
          
          <div className="flex flex-col gap-5">
            {/* Type */}
            <div className="flex items-start gap-3">
              <span className="text-sm font-semibold text-slate-500 w-24 shrink-0 pt-1.5">Type</span>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide flex-grow">
                <Link href={`/${currentPrefixSlug}institutions-in-${currentLocSlug}`} className={getFilterStyle(!initialTypeFilter || initialTypeFilter === 'All')}>All</Link>
                <Link href={`/${currentPrefixSlug}schools-in-${currentLocSlug}`} className={getFilterStyle(initialTypeFilter === 'Public School' || initialTypeFilter === 'School')}>Schools</Link>
                <Link href={`/${currentPrefixSlug}colleges-in-${currentLocSlug}`} className={getFilterStyle(initialTypeFilter === 'College')}>Colleges</Link>
                <Link href={`/${currentPrefixSlug}universities-in-${currentLocSlug}`} className={getFilterStyle(initialTypeFilter === 'University')}>Universities</Link>
                <Link href={`/${currentPrefixSlug}coaching-in-${currentLocSlug}`} className={getFilterStyle(initialTypeFilter === 'Coaching Institute')}>Coaching</Link>
              </div>
            </div>
            
            {/* State */}
            <div className="flex items-start gap-3">
              <span className="text-sm font-semibold text-slate-500 w-24 shrink-0 pt-1.5">State</span>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide flex-grow">
                <Link href={`/${currentPrefixSlug}${currentTypeSlug}-in-india`} className={getFilterStyle(!initialLocationFilter || initialLocationFilter === 'India')}>All States</Link>
                <Link href={`/${currentPrefixSlug}${currentTypeSlug}-in-west-bengal`} className={getFilterStyle(initialLocationFilter === 'West Bengal')}>West Bengal</Link>
                <Link href={`/${currentPrefixSlug}${currentTypeSlug}-in-assam`} className={getFilterStyle(initialLocationFilter === 'Assam')}>Assam</Link>
                <Link href={`/${currentPrefixSlug}${currentTypeSlug}-in-bihar`} className={getFilterStyle(initialLocationFilter === 'Bihar')}>Bihar</Link>
              </div>
            </div>
            
            {/* City */}
            <div className="flex items-start gap-3">
              <span className="text-sm font-semibold text-slate-500 w-24 shrink-0 pt-1.5">City</span>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide flex-grow">
                <Link href={`/${currentPrefixSlug}${currentTypeSlug}-in-kolkata`} className={getFilterStyle(initialLocationFilter === 'Kolkata')}>Kolkata</Link>
                <Link href={`/${currentPrefixSlug}${currentTypeSlug}-in-siliguri`} className={getFilterStyle(initialLocationFilter === 'Siliguri')}>Siliguri</Link>
                <Link href={`/${currentPrefixSlug}${currentTypeSlug}-in-dinhata`} className={getFilterStyle(initialLocationFilter === 'Dinhata')}>Dinhata</Link>
              </div>
            </div>

            {/* Ownership */}
            <div className="flex items-start gap-3">
              <span className="text-sm font-semibold text-slate-500 w-24 shrink-0 pt-1.5">Ownership</span>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide flex-grow">
                <Link href={`/${currentTypeSlug}-in-${currentLocSlug}`} className={getFilterStyle(!initialPrefixFilter)}>All</Link>
                <Link href={`/government-${currentTypeSlug}-in-${currentLocSlug}`} className={getFilterStyle(initialPrefixFilter === 'Government')}>Government</Link>
                <Link href={`/private-${currentTypeSlug}-in-${currentLocSlug}`} className={getFilterStyle(initialPrefixFilter === 'Private')}>Private</Link>
                <Link href={`/semi-government-${currentTypeSlug}-in-${currentLocSlug}`} className={getFilterStyle(initialPrefixFilter === 'Semi Government' || initialPrefixFilter === 'Semi-government')}>Semi-government</Link>
              </div>
            </div>

            {/* Course */}
            <div className="flex items-start gap-3">
              <span className="text-sm font-semibold text-slate-500 w-24 shrink-0 pt-1.5">Course</span>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide flex-grow">
                <Link href={`/science-${currentTypeSlug}-in-${currentLocSlug}`} className={getFilterStyle(initialPrefixFilter === 'Science')}>Science</Link>
                <Link href={`/commerce-${currentTypeSlug}-in-${currentLocSlug}`} className={getFilterStyle(initialPrefixFilter === 'Commerce')}>Commerce</Link>
                <Link href={`/arts-${currentTypeSlug}-in-${currentLocSlug}`} className={getFilterStyle(initialPrefixFilter === 'Arts')}>Arts</Link>
                <Link href={`/bsc-${currentTypeSlug}-in-${currentLocSlug}`} className={getFilterStyle(initialPrefixFilter === 'BSc')}>BSc</Link>
                <Link href={`/btech-${currentTypeSlug}-in-${currentLocSlug}`} className={getFilterStyle(initialPrefixFilter === 'BTech')}>BTech</Link>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl h-48 border border-slate-100"></div>
            ))}
          </div>
        ) : filteredInstitutions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInstitutions.map((inst) => (
              <Link href={`/institutions/${inst.slug}`} key={inst.id} className="group">
                <Card className="h-full border border-slate-200 hover:border-emerald-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white overflow-hidden">
                  <CardContent className="p-0 flex flex-col h-full">
                    {/* Top Color Bar & Logo */}
                    <div className={`h-24 relative ${!(inst.galleryImages && inst.galleryImages.length > 0) ? `bg-gradient-to-r ${getGradient(inst.title || 'A')}` : 'bg-slate-800'}`}>
                      {inst.galleryImages && inst.galleryImages.length > 0 && (
                        <Image src={inst.galleryImages[0]} alt={inst.title || 'Cover'} fill className="object-cover opacity-80" unoptimized />
                      )}
                      <div className="absolute -bottom-8 left-6 z-10">
                        <div className="w-16 h-16 rounded-xl bg-white shadow-lg border-4 border-white flex items-center justify-center overflow-hidden">
                          {inst.logoUrl || inst.featureImage ? (
                            <Image src={inst.logoUrl || inst.featureImage || ''} alt={inst.title || ''} fill className="object-contain p-2" unoptimized />
                          ) : (
                            <School className="w-8 h-8 text-emerald-600/50" />
                          )}
                        </div>
                      </div>
                      <div className="absolute top-4 right-4 z-10">
                        <Badge variant="secondary" className="bg-white/90 text-emerald-900 border-none shadow-sm backdrop-blur-sm">
                          {inst.boardType || 'Institution'}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="px-6 pt-12 pb-6 flex-grow flex flex-col">
                      <div className="flex justify-between items-start mb-2 gap-4">
                         <h3 className="font-bold text-xl text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                           {inst.title}
                           {inst.acronym && <span className="text-sm font-medium text-slate-500 ml-2">({inst.acronym})</span>}
                         </h3>
                      </div>
                      
                      <div className="space-y-3 mt-4 mt-auto">
                        {/* Type & Location */}
                        <div className="flex items-center text-slate-600 text-sm font-medium gap-1.5 flex-wrap">
                          <span>{inst.boardType || 'Institution'}</span>
                          {(inst.stateRegion || inst.address) && (
                            <>
                              <span className="text-slate-400">&bull;</span>
                              <span className="line-clamp-1">{inst.stateRegion || (inst.address?.split(',').slice(-2, -1)[0]?.trim() || 'India')}</span>
                            </>
                          )}
                        </div>
                        
                        {/* Established & Courses */}
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          {inst.establishedYear && (
                            <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Est. {inst.establishedYear}</div>
                          )}
                          {/* If coursesCount exists, display it. Defaults to showing it visually if present. */}
                          {(inst as any).coursesCount ? (
                            <div className="flex items-center gap-1"><School className="w-3.5 h-3.5" /> {(inst as any).coursesCount} Courses</div>
                          ) : null}
                        </div>

                        {/* Ratings & Admissions */}
                        <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-slate-50">
                          {inst.rating ? (
                            <div className="flex items-center gap-1 font-medium text-slate-700">
                              ⭐ {inst.rating} <span className="text-slate-500 font-normal">({inst.reviews?.length || inst.userRatingsTotal || 0} reviews)</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs italic">No reviews yet</span>
                          )}
                          
                          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 shadow-none font-semibold px-2 py-0.5 whitespace-nowrap">
                            Admission Open
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <Building className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700">No institutions found</h3>
            <p className="text-slate-500 mt-2">Try adjusting your search or filters.</p>
          </div>
        )}

        {/* SEO Blocks Below Grid */}
        <div className="mt-20 space-y-16 pt-16 border-t border-slate-200">
          
          {/* Popular Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-500" /> Popular States
              </h3>
              <ul className="space-y-3">
                <li><Link href="/colleges-in-west-bengal" className="text-slate-600 hover:text-emerald-600 flex items-center group"><ChevronRight className="w-4 h-4 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" /> Colleges in West Bengal</Link></li>
                <li><Link href="/schools-in-assam" className="text-slate-600 hover:text-emerald-600 flex items-center group"><ChevronRight className="w-4 h-4 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" /> Schools in Assam</Link></li>
                <li><Link href="/universities-in-bihar" className="text-slate-600 hover:text-emerald-600 flex items-center group"><ChevronRight className="w-4 h-4 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" /> Universities in Bihar</Link></li>
                <li><Link href="/institutions-in-maharashtra" className="text-slate-600 hover:text-emerald-600 flex items-center group"><ChevronRight className="w-4 h-4 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" /> Institutes in Maharashtra</Link></li>
                <li><Link href="/colleges-in-karnataka" className="text-slate-600 hover:text-emerald-600 flex items-center group"><ChevronRight className="w-4 h-4 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" /> Colleges in Karnataka</Link></li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-indigo-500" /> Top Cities
              </h3>
              <ul className="space-y-3">
                <li><Link href="/colleges-in-kolkata" className="text-slate-600 hover:text-indigo-600 flex items-center group"><ChevronRight className="w-4 h-4 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" /> Top Colleges in Kolkata</Link></li>
                <li><Link href="/schools-in-siliguri" className="text-slate-600 hover:text-indigo-600 flex items-center group"><ChevronRight className="w-4 h-4 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" /> Schools in Siliguri</Link></li>
                <li><Link href="/institutions-in-guwahati" className="text-slate-600 hover:text-indigo-600 flex items-center group"><ChevronRight className="w-4 h-4 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" /> Institutions in Guwahati</Link></li>
                <li><Link href="/universities-in-bangalore" className="text-slate-600 hover:text-indigo-600 flex items-center group"><ChevronRight className="w-4 h-4 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" /> Universities in Bangalore</Link></li>
                <li><Link href="/institutions-in-mumbai" className="text-slate-600 hover:text-indigo-600 flex items-center group"><ChevronRight className="w-4 h-4 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" /> Institutes in Mumbai</Link></li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-amber-500" /> Popular Searches
              </h3>
              <ul className="space-y-3">
                <li><Link href="/colleges-in-india" className="text-slate-600 hover:text-amber-600 flex items-center group"><ChevronRight className="w-4 h-4 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" /> All Colleges in India</Link></li>
                <li><Link href="/universities-in-india" className="text-slate-600 hover:text-amber-600 flex items-center group"><ChevronRight className="w-4 h-4 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" /> Top Universities</Link></li>
                <li><Link href="/public-schools-in-india" className="text-slate-600 hover:text-amber-600 flex items-center group"><ChevronRight className="w-4 h-4 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" /> Public Schools</Link></li>
                <li><Link href="/private-schools-in-india" className="text-slate-600 hover:text-amber-600 flex items-center group"><ChevronRight className="w-4 h-4 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" /> Private Schools Near Me</Link></li>
                <li><Link href="/institutions-in-india" className="text-slate-600 hover:text-amber-600 flex items-center group"><ChevronRight className="w-4 h-4 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" /> All Verified Institutions</Link></li>
              </ul>
            </div>
          </div>

          {/* FAQs */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-10">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <details className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-100 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between cursor-pointer font-bold text-lg text-slate-800">
                  How can I find the best institution on DeshExam?
                  <ChevronRight className="w-5 h-5 text-slate-400 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="mt-4 text-slate-600 leading-relaxed">
                  You can use our advanced search and filter options to narrow down institutions by type (school, college, university), state, city, and ownership. This allows you to easily discover the top-ranked educational institutions that match your specific criteria.
                </div>
              </details>
              
              <details className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-100 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between cursor-pointer font-bold text-lg text-slate-800">
                  Are DeshExam institution profiles verified?
                  <ChevronRight className="w-5 h-5 text-slate-400 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="mt-4 text-slate-600 leading-relaxed">
                  Yes, we prioritize authenticity. Institutions bearing the "Verified" badge have had their details, including official website links, contact information, and physical addresses, cross-checked with official sources and Google Maps data.
                </div>
              </details>

              <details className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-100 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between cursor-pointer font-bold text-lg text-slate-800">
                  Can I compare different colleges or universities?
                  <ChevronRight className="w-5 h-5 text-slate-400 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="mt-4 text-slate-600 leading-relaxed">
                  Absolutely. Each institution's profile includes detailed information on courses offered, admission processes, fee structures, facilities, and real student reviews, making it easy to compare multiple options before making your decision.
                </div>
              </details>

              <details className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-100 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between cursor-pointer font-bold text-lg text-slate-800">
                  How often is the educational directory data updated?
                  <ChevronRight className="w-5 h-5 text-slate-400 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="mt-4 text-slate-600 leading-relaxed">
                  Our database is regularly updated. We continuously monitor official institution websites and student feedback to ensure that details regarding admissions, courses, and contact information remain accurate and up-to-date.
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
