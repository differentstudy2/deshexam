'use client';

import React, { useState, useEffect } from 'react';
import { TaxonomyDataTable } from '@/components/admin/TaxonomyDataTable';
import { Button } from '@/components/ui/button';
import { MapPin, Search, Loader2, Building, Star, ExternalLink, AlertTriangle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { createTaxonomyNode, generateSlug } from '@/lib/firebase/taxonomy';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getGoogleMapsKey } from './actions';

export default function InstitutionManagerPage() {
  const { toast } = useToast();
  const router = useRouter();

  // Modal & Google Maps States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedPlaceDetails, setSelectedPlaceDetails] = useState<any | null>(null);
  // Duplicate detection
  const [duplicateInstitution, setDuplicateInstitution] = useState<{ id: string; title: string; slug: string } | null>(null);

  const mapRef = React.useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [markerInstance, setMarkerInstance] = useState<any>(null);

  // Initialize Map
  useEffect(() => {
    if (!isModalOpen) {
      setMapInstance(null);
      setMarkerInstance(null);
      return;
    }

    let isMounted = true;
    const initMap = async () => {
      let attempts = 0;
      while (!mapRef.current && attempts < 20) {
        await new Promise(r => setTimeout(r, 100));
        attempts++;
      }
      if (!mapRef.current) return;

      const loadGoogleMaps = async () => {
        if ((window as any).google?.maps) return true;

        const existingScript = document.querySelector('script[src^="https://maps.googleapis.com/maps/api/js"]');
        if (existingScript) {
          let retries = 0;
          while (!(window as any).google?.maps && retries < 50) {
            await new Promise(r => setTimeout(r, 100));
            retries++;
          }
          return !!(window as any).google?.maps;
        }

        const key = await getGoogleMapsKey();
        if (!key) return false;

        return new Promise<boolean>((resolve) => {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
          script.async = true;
          script.defer = true;
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.head.appendChild(script);
        });
      };

      const loaded = await loadGoogleMaps();
      if (!loaded || !isMounted || !mapRef.current) return;

      if (!mapInstance) {
        const map = new (window as any).google.maps.Map(mapRef.current, {
          center: { lat: 22.5726, lng: 88.3639 },
          zoom: 12,
          styles: [
            { featureType: 'poi', stylers: [{ visibility: 'off' }] },
            { featureType: 'poi.school', stylers: [{ visibility: 'on' }] },
            { featureType: 'poi.business', stylers: [{ visibility: 'off' }] }
          ]
        });

        map.addListener('click', (e: any) => {
          if (e.placeId) {
            if (typeof e.stop === 'function') e.stop();
            handleSelectPlace(e.placeId);
          }
        });

        setMapInstance(map);
      }
    };

    initMap();
    return () => { isMounted = false; };
  }, [isModalOpen, mapInstance]);

  // Update map marker when place is selected
  useEffect(() => {
    if (selectedPlaceDetails?.latitude && selectedPlaceDetails?.longitude && mapInstance && (window as any).google) {
      const position = { lat: selectedPlaceDetails.latitude, lng: selectedPlaceDetails.longitude };
      mapInstance.panTo(position);
      mapInstance.setZoom(16);

      if (markerInstance) markerInstance.setMap(null);

      const newMarker = new (window as any).google.maps.Marker({
        position,
        map: mapInstance,
        title: selectedPlaceDetails.name,
        animation: (window as any).google.maps.Animation.DROP
      });
      setMarkerInstance(newMarker);
    }
  }, [selectedPlaceDetails, mapInstance]);

  // Debounced Search
  useEffect(() => {
    if (searchQuery.trim().length < 3) { setSuggestions([]); return; }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/places/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (data.results) setSuggestions(data.results);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSelectPlace = async (placeId: string) => {
    setIsSearching(true);
    setDuplicateInstitution(null);
    try {
      // ── 1. Fetch place details ──────────────────────────────────────────────
      const res = await fetch(`/api/places/details?placeId=${placeId}`);
      const data = await res.json();

      if (data && !data.error) {
        setSelectedPlaceDetails({ ...data, place_id: placeId });
        setSuggestions([]);

        // ── 2. Check Firestore for duplicate ────────────────────────────────
        const q = query(
          collection(db, 'taxonomy_nodes'),
          where('type', '==', 'institution'),
          where('placeId', '==', placeId),
          limit(1)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const existing = snap.docs[0];
          const d = existing.data();
          setDuplicateInstitution({ id: existing.id, title: d.title || 'Unknown', slug: d.slug || existing.id });
        }
      } else {
        toast({ variant: 'destructive', title: 'Failed to fetch details' });
      }
    } catch (error) {
      console.error('Failed to fetch place details:', error);
      toast({ variant: 'destructive', title: 'Failed to fetch place details' });
    } finally {
      setIsSearching(false);
    }
  };

  const handleImport = async () => {
    if (!selectedPlaceDetails) return;

    setIsImporting(true);
    try {
      const title = selectedPlaceDetails.name;
      const slug = generateSlug(title);

      const newNodeData: any = {
        type: 'institution',
        track: 'academic',
        status: 'draft',
        title,
        slug,
        parentId: null,
        seoTitle: title,
      };

      if (selectedPlaceDetails.address) newNodeData.address = selectedPlaceDetails.address;
      if (selectedPlaceDetails.latitude !== undefined) newNodeData.latitude = selectedPlaceDetails.latitude;
      if (selectedPlaceDetails.longitude !== undefined) newNodeData.longitude = selectedPlaceDetails.longitude;
      if (selectedPlaceDetails.placeId) newNodeData.placeId = selectedPlaceDetails.placeId;
      if (selectedPlaceDetails.websiteUrl) newNodeData.websiteUrl = selectedPlaceDetails.websiteUrl;
      if (selectedPlaceDetails.rating !== undefined) newNodeData.rating = selectedPlaceDetails.rating;
      if (selectedPlaceDetails.userRatingsTotal !== undefined) newNodeData.userRatingsTotal = selectedPlaceDetails.userRatingsTotal;
      if (selectedPlaceDetails.phoneNumber) newNodeData.phoneNumber = selectedPlaceDetails.phoneNumber;
      if (selectedPlaceDetails.internationalPhoneNumber) newNodeData.internationalPhoneNumber = selectedPlaceDetails.internationalPhoneNumber;
      if (selectedPlaceDetails.openingHours) newNodeData.openingHours = selectedPlaceDetails.openingHours;
      if (selectedPlaceDetails.reviews) newNodeData.reviews = selectedPlaceDetails.reviews;
      if (selectedPlaceDetails.headquarters) newNodeData.headquarters = selectedPlaceDetails.headquarters;
      if (selectedPlaceDetails.stateRegion) newNodeData.stateRegion = selectedPlaceDetails.stateRegion;

      // Process Photos
      if (selectedPlaceDetails.photoReferences?.length > 0) {
        toast({ title: 'Uploading photos...', description: `Processing ${selectedPlaceDetails.photoReferences.length} images. Please wait.` });

        const uploadedUrls: string[] = [];
        const photosToUpload = selectedPlaceDetails.photoReferences.slice(0, 6);

        await Promise.all(photosToUpload.map(async (ref: string) => {
          try {
            const res = await fetch('/api/places/photo', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ photoReference: ref, placeId: selectedPlaceDetails.placeId })
            });
            const data = await res.json();
            if (data.url) uploadedUrls.push(data.url);
          } catch (e) {
            console.error('Failed to upload a photo:', e);
          }
        }));

        newNodeData.galleryImages = uploadedUrls;
        if (uploadedUrls.length > 0) newNodeData.featureImage = uploadedUrls[0];
      }

      const newNodeId = await createTaxonomyNode(newNodeData);

      toast({ title: 'Institution Imported!', description: `${title} has been added to your database as a draft.` });

      setIsModalOpen(false);
      setSelectedPlaceDetails(null);
      setDuplicateInstitution(null);
      setSearchQuery('');

      router.push(`/admin/institution/${newNodeId}`);
    } catch (error) {
      console.error('Import failed:', error);
      toast({ variant: 'destructive', title: 'Failed to import institution' });
    } finally {
      setIsImporting(false);
    }
  };

  const resetModal = () => {
    setSelectedPlaceDetails(null);
    setDuplicateInstitution(null);
    setSearchQuery('');
    setSuggestions([]);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Institution Manager
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage schools, colleges, universities, and coaching institutes.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white gap-2 h-10 text-sm font-semibold shadow-sm"
        >
          <MapPin className="w-4 h-4" />
          Import from Google Maps
        </Button>
      </div>

      {/* ── Data Table ───────────────────────────────────────────────────────── */}
      <TaxonomyDataTable type="institution" title="Institutions" />

      {/* ── Google Maps Import Modal ──────────────────────────────────────── */}
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) resetModal();
        }}
      >
        <DialogContent className="
          w-full max-w-none sm:max-w-[760px]
          h-[100dvh] sm:h-auto sm:max-h-[92vh]
          m-0 sm:m-auto
          rounded-none sm:rounded-xl
          flex flex-col overflow-hidden
          bg-white dark:bg-slate-900
          border-0 sm:border border-slate-200 dark:border-slate-700
          p-0
        ">
          {/* Modal Header */}
          <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3 sm:px-6 sm:pt-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div>
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                <span className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </span>
                Import Institution from Maps
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 ml-9">
                Search or click a school icon on the map to import it.
              </DialogDescription>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <div className="px-4 sm:px-6 py-4 space-y-4">

              {/* Search Box */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4 pointer-events-none" />
                <Input
                  placeholder="Type the name of the institution..."
                  className="pl-9 h-11 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedPlaceDetails(null);
                    setDuplicateInstitution(null);
                  }}
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500 w-4 h-4 animate-spin" />
                )}
              </div>

              {/* Suggestions */}
              {suggestions.length > 0 && !selectedPlaceDetails && (
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg overflow-hidden divide-y divide-slate-100 dark:divide-slate-700/50 max-h-[200px] overflow-y-auto">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.placeId}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex flex-col items-start transition-colors active:bg-slate-100 dark:active:bg-slate-700"
                      onClick={() => handleSelectPlace(suggestion.placeId)}
                    >
                      <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{suggestion.name}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{suggestion.address}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Google Map */}
              <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner bg-slate-100 dark:bg-slate-800"
                style={{ height: 'clamp(220px, 38vw, 340px)' }}
              >
                <div ref={mapRef} className="w-full h-full" />
                {!mapInstance && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">Loading map...</span>
                  </div>
                )}
                {mapInstance && !selectedPlaceDetails && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 pointer-events-none whitespace-nowrap">
                    Click on any school icon to select it
                  </div>
                )}
              </div>

              {/* Selected Place Preview Card */}
              {selectedPlaceDetails && (
                <div className="border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-900/10 rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 p-4 pb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Building className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="truncate">{selectedPlaceDetails.name}</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-6 line-clamp-2">
                        {selectedPlaceDetails.address}
                      </p>
                    </div>
                    {selectedPlaceDetails.rating && (
                      <div className="flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-1 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 shrink-0">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{selectedPlaceDetails.rating}</span>
                        {selectedPlaceDetails.user_ratings_total && (
                          <span className="text-xs text-slate-400 dark:text-slate-500">{selectedPlaceDetails.user_ratings_total}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quick Badges */}
                  <div className="flex flex-wrap gap-2 px-4 pb-3">
                    {selectedPlaceDetails.websiteUrl && (
                      <a
                        href={selectedPlaceDetails.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50 rounded-full px-2.5 py-1 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" /> Website
                      </a>
                    )}
                    {selectedPlaceDetails.latitude && selectedPlaceDetails.longitude && (
                      <span className="inline-flex items-center gap-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-full px-2.5 py-1">
                        <MapPin className="w-3 h-3 text-emerald-500" /> Coordinates Ready
                      </span>
                    )}
                    {selectedPlaceDetails.reviews?.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-full px-2.5 py-1">
                        {selectedPlaceDetails.reviews.length} Reviews
                      </span>
                    )}
                  </div>

                  {/* Duplicate Warning */}
                  {duplicateInstitution && (
                    <div className="mx-4 mb-3 flex items-start gap-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-lg p-3">
                      <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Already in database</p>
                        <p className="text-xs mt-0.5 text-amber-700 dark:text-amber-400">
                          <span className="font-medium">{duplicateInstitution.title}</span> is already imported.{' '}
                          <Link
                            href={`/admin/institution/${duplicateInstitution.id}`}
                            className="underline font-bold hover:text-amber-900 dark:hover:text-amber-200"
                            onClick={() => setIsModalOpen(false)}
                          >
                            Open existing record →
                          </Link>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 px-4 pb-4 pt-1">
                    <Button
                      variant="outline"
                      className="flex-1 sm:flex-none h-10 text-sm border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      onClick={resetModal}
                    >
                      <X className="w-4 h-4 mr-1.5" /> Clear
                    </Button>
                    <Button
                      onClick={handleImport}
                      disabled={isImporting || !!duplicateInstitution}
                      className="flex-1 h-10 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {isImporting ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importing...</>
                      ) : duplicateInstitution ? (
                        <><AlertTriangle className="w-4 h-4 mr-1.5" /> Already Imported</>
                      ) : (
                        <><MapPin className="w-4 h-4 mr-1.5" /> Import to Database</>
                      )}
                    </Button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
