'use client';

import React, { useState, useEffect } from 'react';
import { TaxonomyDataTable } from '@/components/admin/TaxonomyDataTable';
import { Button } from '@/components/ui/button';
import { MapPin, Search, Loader2, Building, Star, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { createTaxonomyNode, generateSlug } from '@/lib/firebase/taxonomy';
import { useRouter } from 'next/navigation';

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

  // Debounced Search
  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (data.predictions) {
          setSuggestions(data.predictions);
        }
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSelectPlace = async (placeId: string) => {
    setIsSearching(true);
    try {
      const res = await fetch(`/api/places/details?placeId=${placeId}`);
      const data = await res.json();
      
      if (data.result) {
        setSelectedPlaceDetails({
          ...data.result,
          place_id: placeId
        });
        setSuggestions([]); // hide suggestions
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
        title: title,
        slug: slug,
        parentId: null,
        seoTitle: title,
      };

      if (selectedPlaceDetails.formatted_address) newNodeData.address = selectedPlaceDetails.formatted_address;
      if (selectedPlaceDetails.geometry?.location?.lat !== undefined) newNodeData.latitude = selectedPlaceDetails.geometry.location.lat;
      if (selectedPlaceDetails.geometry?.location?.lng !== undefined) newNodeData.longitude = selectedPlaceDetails.geometry.location.lng;
      if (selectedPlaceDetails.place_id) newNodeData.placeId = selectedPlaceDetails.place_id;
      if (selectedPlaceDetails.website) newNodeData.websiteUrl = selectedPlaceDetails.website;
      if (selectedPlaceDetails.rating !== undefined) newNodeData.rating = selectedPlaceDetails.rating;
      if (selectedPlaceDetails.user_ratings_total !== undefined) newNodeData.userRatingsTotal = selectedPlaceDetails.user_ratings_total;

      const newNodeId = await createTaxonomyNode(newNodeData);

      toast({ 
        title: "Institution Imported!", 
        description: `${title} has been added to your database as a draft.` 
      });
      
      setIsModalOpen(false);
      setSelectedPlaceDetails(null);
      setSearchQuery('');
      
      // Navigate to the edit page of the newly created institution to review it
      router.push(`/admin/institution/${newNodeId}`);
    } catch (error) {
      console.error('Import failed:', error);
      toast({ variant: 'destructive', title: 'Failed to import institution' });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Institution Manager
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage physical schools, colleges, universities, and coaching institutes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
            <MapPin className="w-4 h-4" />
            Import from Google Maps
          </Button>
        </div>
      </div>

      {/* Render the generic data table strictly filtered for 'institution' nodes */}
      <TaxonomyDataTable type="institution" title="Institutions" />

      {/* Google Maps Import Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <MapPin className="w-5 h-5 text-emerald-500" />
              Import Institution from Maps
            </DialogTitle>
            <DialogDescription>
              Search for a real-world school, college, or university to instantly pull its details into your database.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input 
                placeholder="Type the name of the institution..." 
                className="pl-10 h-12 text-base"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedPlaceDetails(null);
                }}
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500 w-5 h-5 animate-spin" />
              )}
            </div>

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && !selectedPlaceDetails && (
              <div className="border border-gray-100 rounded-md shadow-sm max-h-[300px] overflow-y-auto bg-white divide-y divide-gray-50">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.place_id}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 flex flex-col items-start transition-colors"
                    onClick={() => handleSelectPlace(suggestion.place_id)}
                  >
                    <span className="font-medium text-slate-800">{suggestion.structured_formatting?.main_text}</span>
                    <span className="text-sm text-slate-500 line-clamp-1">{suggestion.structured_formatting?.secondary_text}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Preview Card */}
            {selectedPlaceDetails && (
              <div className="border border-emerald-100 bg-emerald-50/30 rounded-xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                      <Building className="w-5 h-5 text-emerald-600" />
                      {selectedPlaceDetails.name}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">{selectedPlaceDetails.formatted_address}</p>
                  </div>
                  {selectedPlaceDetails.rating && (
                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow-sm border border-emerald-100">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="font-medium text-sm">{selectedPlaceDetails.rating}</span>
                      <span className="text-xs text-slate-500">({selectedPlaceDetails.user_ratings_total})</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  {selectedPlaceDetails.website && (
                    <div className="flex items-center gap-2 text-indigo-600">
                      <ExternalLink className="w-4 h-4" />
                      <a href={selectedPlaceDetails.website} target="_blank" rel="noopener noreferrer" className="hover:underline line-clamp-1">
                        Website Available
                      </a>
                    </div>
                  )}
                  {selectedPlaceDetails.geometry?.location && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-4 h-4" />
                      Coordinates Ready
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-emerald-100/50 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedPlaceDetails(null)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleImport} 
                    disabled={isImporting}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {isImporting ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importing...</>
                    ) : (
                      'Import to Database'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
