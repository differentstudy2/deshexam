import React from 'react';
import { notFound } from 'next/navigation';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { TaxonomyNode } from '@/lib/firebase/taxonomy';
import { MapPin, Globe, Star, Building, Navigation, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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

export default async function InstitutionDetailsPage({ params }: { params: { slug: string } }) {
  const institution = await getInstitutionBySlug(params.slug);

  if (!institution) {
    notFound();
  }

  // Generic gradient for the hero background
  const charCode = institution.title?.charCodeAt(0) || 65;
  const gradients = [
    'from-emerald-600 to-teal-800',
    'from-indigo-600 to-blue-800',
    'from-purple-600 to-pink-800',
    'from-orange-600 to-red-800',
    'from-cyan-600 to-blue-800',
  ];
  const bgGradient = gradients[charCode % gradients.length];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] pb-20">
      {/* Hero Section */}
      <div className={`relative pt-24 pb-32 px-6 bg-gradient-to-br ${bgGradient} overflow-hidden`}>
        {/* Abstract pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <Link href="/institution" className="inline-flex items-center text-white/80 hover:text-white mb-8 transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Directory
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            {/* Logo Wrapper */}
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-white shadow-2xl border-4 border-white/20 flex items-center justify-center overflow-hidden shrink-0">
              {institution.logoUrl || institution.featureImage ? (
                <Image 
                  src={institution.logoUrl || institution.featureImage || ''} 
                  alt={institution.title || ''} 
                  fill 
                  className="object-contain p-4" 
                  unoptimized 
                />
              ) : (
                <Building className="w-16 h-16 text-slate-300" />
              )}
            </div>

            {/* Main Info */}
            <div className="space-y-4">
              <Badge className="bg-white/20 text-white hover:bg-white/30 border-none shadow-sm backdrop-blur-md">
                {institution.boardType || 'Institution'}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                {institution.title}
                {institution.acronym && <span className="opacity-80 ml-3">({institution.acronym})</span>}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm md:text-base font-medium">
                {institution.address && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-5 h-5 text-emerald-200" />
                    <span>{institution.address}</span>
                  </div>
                )}
                {institution.rating && (
                  <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>{institution.rating}</span>
                    <span className="opacity-70 text-xs">({institution.userRatingsTotal} reviews)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-6 -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column (About & Details) */}
          <div className="md:col-span-2 space-y-8">
            <Card className="shadow-lg border-slate-100 rounded-2xl overflow-hidden">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">About {institution.title}</h2>
                <div className="prose prose-slate max-w-none text-slate-600">
                  {institution.description ? (
                    <div dangerouslySetInnerHTML={{ __html: institution.description }} />
                  ) : (
                    <p>No detailed description is available for this institution yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column (Sidebar Actions) */}
          <div className="space-y-6">
            <Card className="shadow-lg border-slate-100 rounded-2xl overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold text-lg text-slate-900 border-b pb-3">Contact & Location</h3>
                
                {institution.websiteUrl && (
                  <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" size="lg">
                    <a href={institution.websiteUrl} target="_blank" rel="noopener noreferrer">
                      <Globe className="w-4 h-4 mr-2" /> Visit Official Website
                    </a>
                  </Button>
                )}

                {institution.latitude && institution.longitude && (
                  <Button asChild variant="outline" className="w-full border-slate-200 text-slate-700" size="lg">
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${institution.latitude},${institution.longitude}${institution.placeId ? `&query_place_id=${institution.placeId}` : ''}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Navigation className="w-4 h-4 mr-2 text-emerald-600" /> Open in Google Maps
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>

            {institution.seoTitle && (
               <Card className="shadow-md border-slate-100 rounded-2xl overflow-hidden bg-slate-50">
               <CardContent className="p-6">
                 <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-2">SEO Title</h3>
                 <p className="text-slate-700 font-medium">{institution.seoTitle}</p>
               </CardContent>
             </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
