'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin, Star, Building, ChevronRight, School, Globe } from 'lucide-react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { TaxonomyNode } from '@/lib/firebase/taxonomy';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export default function PublicInstitutionDirectory() {
  const [institutions, setInstitutions] = useState<TaxonomyNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

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
    
    return matchesSearch && matchesTab;
  });

  const tabs = ['All', 'College', 'University', 'Public School', 'Private School', 'Coaching Institute', 'Other'];

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
            Discover Institutions
          </h1>
          <p className="text-emerald-100 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Explore verified real-world colleges, universities, public schools, and coaching institutes worldwide.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto pt-8">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-emerald-400 group-focus-within:text-emerald-600 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search by institution name, acronym, or address..."
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
        
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 justify-center pb-4">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm ${
                activeTab === tab 
                  ? 'bg-emerald-600 text-white shadow-emerald-500/25 border border-emerald-500' 
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 hover:border-emerald-200'
              }`}
            >
              {tab}
            </button>
          ))}
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
              <Link href={`/institution/${inst.slug}`} key={inst.id} className="group">
                <Card className="h-full border border-slate-200 hover:border-emerald-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white overflow-hidden">
                  <CardContent className="p-0 flex flex-col h-full">
                    {/* Top Color Bar & Logo */}
                    <div className={`h-24 bg-gradient-to-r ${getGradient(inst.title || 'A')} relative`}>
                      <div className="absolute -bottom-8 left-6">
                        <div className="w-16 h-16 rounded-xl bg-white shadow-lg border-4 border-white flex items-center justify-center overflow-hidden">
                          {inst.logoUrl || inst.featureImage ? (
                            <Image src={inst.logoUrl || inst.featureImage || ''} alt={inst.title || ''} fill className="object-contain p-2" unoptimized />
                          ) : (
                            <School className="w-8 h-8 text-emerald-600/50" />
                          )}
                        </div>
                      </div>
                      <div className="absolute top-4 right-4">
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
                        {inst.address && (
                          <div className="flex items-start text-slate-600 text-sm gap-2">
                            <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" />
                            <span className="line-clamp-2">{inst.address}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-sm">
                          {inst.rating ? (
                            <div className="flex items-center gap-1 font-medium text-slate-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                              {inst.rating} <span className="text-slate-500 font-normal">({inst.reviews?.length || inst.userRatingsTotal || 0})</span>
                            </div>
                          ) : (
                            <div></div>
                          )}
                          
                          {inst.websiteUrl && (
                            <div className="flex items-center gap-1 text-indigo-600 font-medium">
                              <Globe className="w-4 h-4" /> Website
                            </div>
                          )}
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
      </div>
    </div>
  );
}
