'use client';

import { fetchWithAuth } from '@/lib/fetch-with-auth';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getTaxonomyNodeById, updateTaxonomyNode, TaxonomyNode } from '@/lib/firebase/taxonomy';
import { storage } from '@/lib/firebase/client';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Upload, Shield, Image as ImageIcon, MapPin, Sparkles, X, Plus, Bold, Italic, List, Heading2, BookOpen, Building, Trophy, Globe, FileText, Layers, LineChart, GraduationCap, LayoutDashboard, Search } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const TiptapEditor = dynamic(() => import('@/components/admin/TiptapEditor').then(mod => mod.TiptapEditor), {
  ssr: false,
  loading: () => <div className="min-h-[200px] flex items-center justify-center bg-slate-50 border border-slate-200 rounded-md">Loading Editor...</div>
});

export default function InstitutionEditPage() {
  const params = useParams();
  const router = useRouter();
  const institutionId = params.id as string;
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isGeneratingReviews, setIsGeneratingReviews] = useState(false);
  const [reviewLanguage, setReviewLanguage] = useState('English');
  const [editingReviewIdx, setEditingReviewIdx] = useState<number | null>(null);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [draggedGalleryIdx, setDraggedGalleryIdx] = useState<number | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [bulkImportJson, setBulkImportJson] = useState(`[\n  {\n    "authorName": "Ramesh Kumar",\n    "rating": 5,\n    "text": "The teachers are extremely supportive and the infrastructure is top-notch."\n  },\n  {\n    "authorName": "Priya Sharma",\n    "rating": 4,\n    "text": "Good environment for studies, but sports facilities could be improved."\n  }\n]`);

  const [formData, setFormData] = useState<Partial<TaxonomyNode>>({
    title: '',
    acronym: '',
    slug: '',
    boardType: 'Public School',
    stateRegion: '',
    description: '',
    logoUrl: '',
    websiteUrl: '',
    establishedYear: '',
    headquarters: '',
    placeId: '',
    address: '',
    latitude: undefined,
    longitude: undefined,
    totalEnrollment: undefined,
    mediumOfInstruction: [],
    rating: undefined,
    status: 'draft',
    seoTitle: '',
    seoDescription: '',
    featureImage: '',
    tags: [],
    keywords: [],
    seoAdvanced: {
      focusKeyword: '',
      canonicalUrl: '',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      robotsIndex: true,
      schemaEnabled: true,
    },
    admission: {
      admissionOpen: false,
      applicationStartDate: '',
      applicationEndDate: '',
      admissionMode: 'Both',
      applicationFee: '',
      admissionUrl: '',
      requiredDocuments: [],
      admissionProcess: ''
    },
    facilities: [],
    placement: {
      placementAvailable: false,
      placementRate: '',
      highestPackage: '',
      averagePackage: '',
      recruiters: [],
      placementDescription: ''
    },
    brochure: {
      pdfUrl: '',
      title: '',
      size: ''
    },
    metrics: {
      views: 0,
      brochureDownloads: 0,
      callClicks: 0,
      websiteClicks: 0,
      admissionClicks: 0
    },
    phoneNumber: '',
    internationalPhoneNumber: '',
    openingHours: [],
    galleryImages: [],
    reviews: [],
    socialProfiles: {
      facebook: '',
      twitter: '',
      linkedin: '',
      instagram: '',
      youtube: '',
    }
  });

  useEffect(() => {
    async function loadInstitution() {
      if (!institutionId) return;
      try {
        const node = await getTaxonomyNodeById(institutionId);
        if (node) {
          setFormData({
            title: node.title || '',
            acronym: node.acronym || '',
            slug: node.slug || '',
            boardType: node.boardType || 'Public School',
            stateRegion: node.stateRegion || '',
            description: node.description || '',
            logoUrl: node.logoUrl || node.featureImage || '', 
            websiteUrl: node.websiteUrl || '',
            establishedYear: node.establishedYear || '',
            headquarters: node.headquarters || '',
            placeId: node.placeId || '',
            address: node.address || '',
            latitude: node.latitude,
            longitude: node.longitude,
            rating: node.rating,
            status: node.status || 'published',
            seoTitle: node.seoTitle || '',
            seoDescription: node.seoDescription || '',
            featureImage: node.featureImage || '',
            tags: node.tags || [],
            keywords: node.keywords || [],
            seoAdvanced: node.seoAdvanced || {
              focusKeyword: '',
              canonicalUrl: '',
              ogTitle: '',
              ogDescription: '',
              ogImage: '',
              robotsIndex: true,
              schemaEnabled: true,
            },
            admission: node.admission || {
              admissionOpen: false,
              applicationStartDate: '',
              applicationEndDate: '',
              admissionMode: 'Both',
              applicationFee: '',
              admissionUrl: '',
              requiredDocuments: [],
              admissionProcess: ''
            },
            facilities: node.facilities || [],
            placement: node.placement || {
              placementAvailable: false,
              placementRate: '',
              highestPackage: '',
              averagePackage: '',
              recruiters: [],
              placementDescription: ''
            },
            brochure: node.brochure || {
              pdfUrl: '',
              title: '',
              size: ''
            },
            metrics: node.metrics || {
              views: 0,
              brochureDownloads: 0,
              callClicks: 0,
              websiteClicks: 0,
              admissionClicks: 0
            },
            phoneNumber: node.phoneNumber || '',
            internationalPhoneNumber: node.internationalPhoneNumber || '',
            openingHours: node.openingHours || [],
            galleryImages: node.galleryImages || [],
            reviews: node.reviews || [],
            aiReviewSummary: node.aiReviewSummary || '',
            totalEnrollment: node.totalEnrollment,
            mediumOfInstruction: node.mediumOfInstruction || [],
            socialProfiles: {
              facebook: node.socialProfiles?.facebook || '',
              twitter: node.socialProfiles?.twitter || '',
              linkedin: node.socialProfiles?.linkedin || '',
              instagram: node.socialProfiles?.instagram || '',
              youtube: node.socialProfiles?.youtube || '',
            }
          });
        }
      } catch (error) {
        console.error('Failed to load institution:', error);
        toast({ variant: 'destructive', title: 'Error loading institution data' });
      } finally {
        setLoading(false);
        setInitialLoadDone(true);
      }
    }
    loadInstitution();
  }, [institutionId, toast]);

  // Auto-Save Effect
  useEffect(() => {
    if (!initialLoadDone || !institutionId || institutionId === 'new') return;

    const timeoutId = setTimeout(async () => {
      setSaving(true);
      try {
        const payload: any = { ...formData };
        if (payload.logoUrl) payload.featureImage = payload.logoUrl;
        Object.keys(payload).forEach(key => {
          if (payload[key] === undefined) {
            delete payload[key];
          }
        });

        await updateTaxonomyNode(institutionId, payload);
        setLastSaved(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setSaving(false);
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [formData, initialLoadDone, institutionId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('social_')) {
      const socialKey = name.replace('social_', '');
      setFormData(prev => ({
        ...prev,
        socialProfiles: {
          ...prev.socialProfiles,
          [socialKey]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  const handleMediumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData(prev => ({
      ...prev,
      mediumOfInstruction: val.split(',').map(s => s.trim()).filter(Boolean)
    }));
  };

  const handleAutoFill = async () => {
    if (!formData.title) {
      toast({ variant: 'destructive', title: 'Institution name required to use AI' });
      return;
    }
    
    setIsAiLoading(true);
    toast({ title: 'AI is searching...', description: 'Please wait while AI gathers data from the web.' });
    
    try {
      const res = await fetchWithAuth('/api/ai/fill-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.title, address: formData.address || formData.headquarters }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || 'AI request failed');
      }
      
      const data = await res.json();
      
      setFormData(prev => ({
        ...prev,
        establishedYear: data.establishedYear || prev.establishedYear,
        totalEnrollment: data.totalEnrollment || prev.totalEnrollment,
        mediumOfInstruction: data.mediumOfInstruction || prev.mediumOfInstruction || [],
        description: data.description || prev.description,
        seoTitle: data.seoTitle || prev.seoTitle,
        seoDescription: data.seoDescription || prev.seoDescription,
        socialProfiles: {
          facebook: data.socialProfiles?.facebook || prev.socialProfiles?.facebook || '',
          twitter: data.socialProfiles?.twitter || prev.socialProfiles?.twitter || '',
          linkedin: data.socialProfiles?.linkedin || prev.socialProfiles?.linkedin || '',
          instagram: data.socialProfiles?.instagram || prev.socialProfiles?.instagram || '',
          youtube: data.socialProfiles?.youtube || prev.socialProfiles?.youtube || '',
        }
      }));
      
      toast({ title: 'AI Auto-Fill Complete!', description: 'Review the new data before saving.' });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'AI Request Failed', description: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSummarizeReviews = async () => {
    if (!formData.reviews || formData.reviews.length === 0) return;
    setIsSummarizing(true);
    try {
      const response = await fetchWithAuth('/api/ai/summarize-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviews: formData.reviews, institutionName: formData.title || formData.acronym }),
      });
      if (!response.ok) throw new Error('Failed to summarize reviews');
      const data = await response.json();
      setFormData(prev => ({ ...prev, aiReviewSummary: data.summary }));
      toast({ title: 'Reviews summarized!' });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'AI failed to summarize' });
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleGenerateReviews = async (count: number) => {
    setIsGeneratingReviews(true);
    try {
      const response = await fetchWithAuth('/api/ai/generate-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ institutionName: formData.title || formData.acronym, count, language: reviewLanguage }),
      });
      if (!response.ok) throw new Error('Failed to generate reviews');
      const data = await response.json();
      
      setFormData(prev => ({
        ...prev,
        reviews: [...(prev.reviews || []), ...data.reviews]
      }));
      
      toast({ title: `Generated ${count} AI reviews!`, description: 'Remember to save your changes.' });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'AI failed to generate reviews' });
    } finally {
      setIsGeneratingReviews(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `institutions/logos/${institutionId}_${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setFormData(prev => ({ ...prev, logoUrl: url }));
      toast({ title: 'Logo uploaded successfully' });
    } catch (error) {
      console.error('Upload failed:', error);
      toast({ variant: 'destructive', title: 'Upload failed', description: String(error) });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      galleryImages: prev.galleryImages?.filter((_, index) => index !== indexToRemove) || []
    }));
  };

  const handleAddGalleryUrl = () => {
    if (!newGalleryUrl.trim()) return;
    setFormData(prev => ({
      ...prev,
      galleryImages: [...(prev.galleryImages || []), newGalleryUrl.trim()]
    }));
    setNewGalleryUrl('');
  };

  const handleUploadGalleryImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `institutions/gallery/${institutionId}_${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setFormData(prev => ({
        ...prev,
        galleryImages: [...(prev.galleryImages || []), url]
      }));
      toast({ title: 'Gallery image uploaded successfully' });
    } catch (error) {
      console.error('Upload failed:', error);
      toast({ variant: 'destructive', title: 'Upload failed', description: String(error) });
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryDragStart = (idx: number) => {
    setDraggedGalleryIdx(idx);
  };

  const handleGalleryDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedGalleryIdx === null || draggedGalleryIdx === idx) return;
    
    setFormData(prev => {
      if (!prev.galleryImages) return prev;
      const newImages = [...prev.galleryImages];
      const draggedImg = newImages[draggedGalleryIdx];
      newImages.splice(draggedGalleryIdx, 1);
      newImages.splice(idx, 0, draggedImg);
      return { ...prev, galleryImages: newImages };
    });
    setDraggedGalleryIdx(idx);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (institutionId) {
        const payload: any = { ...formData };
        if (payload.logoUrl) payload.featureImage = payload.logoUrl;
        
        if (payload.reviews && payload.reviews.length > 0) {
          const avg = payload.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / payload.reviews.length;
          payload.rating = parseFloat(avg.toFixed(1));
          payload.userRatingsTotal = payload.reviews.length;
        }
        
        Object.keys(payload).forEach(key => {
          if (payload[key] === undefined) {
            delete payload[key];
          }
        });

        await updateTaxonomyNode(institutionId, payload);
        setLastSaved(new Date());
        toast({ title: 'Institution updated successfully' });
      } else {
        // Handle create logic here if needed
      }
      router.refresh();
    } catch (error) {
      console.error('Save failed:', error);
      toast({ variant: 'destructive', title: 'Failed to save institution', description: String(error) });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-500 animate-pulse">Loading institution details...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon" className="h-10 w-10 rounded-full">
            <Link href="/admin/institution">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Edit Institution: {formData.acronym || 'New Entry'}
            </h1>
            <p className="text-gray-500 text-sm">ID: {institutionId}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={formData.status === 'published' || formData.status === 'active' ? 'default' : 'secondary'}
                 className={formData.status === 'published' || formData.status === 'active' ? 'bg-emerald-100 text-emerald-800' : ''}>
            {formData.status}
          </Badge>
          <div className="flex items-center gap-4">
              {lastSaved && (
                <span className="text-sm text-slate-500 hidden sm:inline-block">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </span>
              )}
              <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
        </div>
      </div>

      <AnimatePresence>
        {isAiLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            >
              <Sparkles className="w-20 h-20 text-indigo-500" />
            </motion.div>
            <motion.h2 
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="mt-6 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600"
            >
              AI is crafting your content...
            </motion.h2>
            <p className="text-slate-500 mt-2 text-sm animate-pulse">Scouring the web for up-to-date information</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 flex flex-col gap-1 shrink-0">
          {[
            { id: 'general', label: 'General Info', icon: <FileText className="w-4 h-4" /> },
            { id: 'admission', label: 'Admission', icon: <GraduationCap className="w-4 h-4" /> },
            { id: 'facilities', label: 'Facilities', icon: <Building className="w-4 h-4" /> },
            { id: 'placement', label: 'Placement', icon: <Trophy className="w-4 h-4" /> },
            { id: 'media', label: 'Media & Brochure', icon: <ImageIcon className="w-4 h-4" /> },
            { id: 'seo', label: 'Advanced SEO', icon: <Search className="w-4 h-4" /> },
            { id: 'subcollections', label: 'Courses & FAQs', icon: <Layers className="w-4 h-4" /> },
            { id: 'analytics', label: 'Analytics', icon: <LineChart className="w-4 h-4" /> },
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={`w-full text-left px-4 py-3 flex items-center gap-3 rounded-lg transition-colors text-sm font-medium border ${activeTab === tab.id ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 space-y-6 min-w-0">
          
          {/* --- GENERAL TAB --- */}
          {activeTab === 'general' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card>
                <CardHeader className="border-b border-gray-100 bg-gray-50/50 flex flex-row items-center justify-between py-4">
                  <CardTitle className="text-lg">General Information</CardTitle>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleAutoFill} 
                disabled={isAiLoading || !formData.title}
                className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
              >
                <Sparkles className={`w-4 h-4 mr-2 ${isAiLoading ? 'animate-pulse text-indigo-400' : 'text-indigo-500'}`} />
                {isAiLoading ? 'AI is thinking...' : 'Auto-Fill with AI'}
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Full Name <span className="text-red-500">*</span></Label>
                <Input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Delhi Public School" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="acronym">Acronym / Short Name</Label>
                  <Input id="acronym" name="acronym" value={formData.acronym} onChange={handleChange} placeholder="e.g. DPS" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input id="slug" name="slug" value={formData.slug} onChange={handleChange} placeholder="e.g. dps" />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <div className="min-h-[400px]">
                <TiptapEditor 
                  content={formData.description || ''} 
                  onChange={(html) => setFormData(prev => ({ ...prev, description: html }))}
                />
              </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-500" />
                Physical Location & Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="address">Full Address</Label>
                <textarea 
                  id="address" 
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange} 
                  rows={2}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="123 Main St, City, State, ZIP"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input id="latitude" name="latitude" type="number" step="any" value={formData.latitude || ''} onChange={handleChange} placeholder="e.g. 28.6139" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input id="longitude" name="longitude" type="number" step="any" value={formData.longitude || ''} onChange={handleChange} placeholder="e.g. 77.2090" />
                </div>
              </div>

              {/* Map Preview */}
              {formData.latitude && formData.longitude && (
                <div className="w-full h-48 bg-slate-100 rounded-md overflow-hidden border border-slate-200 mt-2">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://maps.google.com/maps?q=${formData.latitude},${formData.longitude}&hl=en&z=14&output=embed`}
                    allowFullScreen
                  />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="placeId">Google Place ID</Label>
                  <Input id="placeId" name="placeId" value={formData.placeId || ''} onChange={handleChange} placeholder="ChIJ..." />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rating">Google Rating</Label>
                  <Input id="rating" name="rating" type="number" step="0.1" max="5" value={formData.rating || ''} onChange={handleChange} placeholder="4.5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input id="phoneNumber" name="phoneNumber" value={formData.phoneNumber || ''} onChange={handleChange} placeholder="+91 98765 43210" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="internationalPhoneNumber">International Phone</Label>
                  <Input id="internationalPhoneNumber" name="internationalPhoneNumber" value={formData.internationalPhoneNumber || ''} onChange={handleChange} placeholder="+91 98765 43210" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                <div className="grid gap-2">
                  <Label htmlFor="boardType">Institution Type</Label>
                  <select 
                    id="boardType" 
                    name="boardType" 
                    value={formData.boardType} 
                    onChange={handleChange as any}
                    className="h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="College">College</option>
                    <option value="University">University</option>
                    <option value="Public School">Public School</option>
                    <option value="Private School">Private School</option>
                    <option value="Coaching Institute">Coaching Institute</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="stateRegion">State / Region</Label>
                  <Input id="stateRegion" name="stateRegion" value={formData.stateRegion} onChange={handleChange} placeholder="e.g. Uttar Pradesh" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="establishedYear">Established Year</Label>
                  <Input id="establishedYear" name="establishedYear" value={formData.establishedYear || ''} onChange={handleChange} placeholder="e.g. 1945" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="totalEnrollment">Total Enrollment</Label>
                  <Input id="totalEnrollment" name="totalEnrollment" type="number" value={formData.totalEnrollment || ''} onChange={handleChange} placeholder="e.g. 1500" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="headquarters">Headquarters (City)</Label>
                  <Input id="headquarters" name="headquarters" value={formData.headquarters || ''} onChange={handleChange} placeholder="e.g. New Delhi, India" />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="mediumOfInstruction">Medium(s) of Instruction (comma separated)</Label>
                <div className="flex gap-2 items-center">
                  <Input 
                    id="mediumOfInstruction" 
                    value={formData.mediumOfInstruction?.join(', ') || ''} 
                    onChange={handleMediumChange} 
                    placeholder="e.g. English, Bengali, Hindi" 
                    className="flex-1"
                  />
                  <select 
                    className="h-10 text-sm border border-slate-200 rounded-md px-3 bg-white"
                    onChange={(e) => {
                      if (e.target.value) {
                        const current = formData.mediumOfInstruction || [];
                        if (!current.includes(e.target.value)) {
                           setFormData(prev => ({ ...prev, mediumOfInstruction: [...current, e.target.value] }));
                        }
                        e.target.value = "";
                      }
                    }}
                  >
                    <option value="">+ Add Language</option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Bengali">Bengali</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Marathi">Marathi</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Urdu">Urdu</option>
                    <option value="Gujarati">Gujarati</option>
                    <option value="Kannada">Kannada</option>
                    <option value="Odia">Odia</option>
                    <option value="Malayalam">Malayalam</option>
                    <option value="Punjabi">Punjabi</option>
                    <option value="Assamese">Assamese</option>
                  </select>
                </div>
              </div>

              {/* Social Profiles */}
              <div className="grid gap-4 pt-4 border-t border-gray-100">
                <Label className="text-base flex items-center gap-2">Social Media Profiles</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="social_facebook" className="text-xs text-slate-500">Facebook URL</Label>
                    <Input id="social_facebook" name="social_facebook" type="url" value={formData.socialProfiles?.facebook || ''} onChange={handleChange} placeholder="https://facebook.com/..." />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="social_twitter" className="text-xs text-slate-500">Twitter/X URL</Label>
                    <Input id="social_twitter" name="social_twitter" type="url" value={formData.socialProfiles?.twitter || ''} onChange={handleChange} placeholder="https://twitter.com/..." />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="social_linkedin" className="text-xs text-slate-500">LinkedIn URL</Label>
                    <Input id="social_linkedin" name="social_linkedin" type="url" value={formData.socialProfiles?.linkedin || ''} onChange={handleChange} placeholder="https://linkedin.com/school/..." />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="social_instagram" className="text-xs text-slate-500">Instagram URL</Label>
                    <Input id="social_instagram" name="social_instagram" type="url" value={formData.socialProfiles?.instagram || ''} onChange={handleChange} placeholder="https://instagram.com/..." />
                  </div>
                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="social_youtube" className="text-xs text-slate-500">YouTube Channel URL</Label>
                    <Input id="social_youtube" name="social_youtube" type="url" value={formData.socialProfiles?.youtube || ''} onChange={handleChange} placeholder="https://youtube.com/..." />
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="websiteUrl">Official Website</Label>
                <Input id="websiteUrl" name="websiteUrl" type="url" value={formData.websiteUrl} onChange={handleChange} placeholder="https://example.edu" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <select 
                    id="status" 
                    name="status" 
                    value={formData.status} 
                    onChange={handleChange as any}
                    className="h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="published">Published</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="seoTitle">SEO Title</Label>
                  <Input id="seoTitle" name="seoTitle" value={formData.seoTitle} onChange={handleChange} placeholder="Custom title for SEO" />
                </div>
              </div>
              <div className="grid gap-2 pt-4">
                <Label htmlFor="seoDescription">SEO Description</Label>
                <textarea 
                  id="seoDescription" 
                  name="seoDescription" 
                  value={formData.seoDescription || ''} 
                  onChange={handleChange} 
                  rows={2}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Compelling meta description for search engines..."
                />
              </div>

              {/* SEO Live Preview */}
              {(formData.seoTitle || formData.seoDescription) && (
                <div className="pt-2">
                  <Label className="text-xs text-slate-500 mb-1 block">Google Search Preview (For Your DeshExam Page)</Label>
                  <div className="bg-white p-4 border border-slate-200 rounded-md shadow-sm max-w-[600px]">
                    <div className="text-sm text-slate-800 flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                        {/* We use a generic icon or DeshExam logo here ideally, fallback to Shield for now */}
                        <Shield className="w-3 h-3 text-slate-400" />
                      </div>
                      <div className="flex flex-col leading-none">
                        <span className="text-[12px] truncate">DeshExam</span>
                        <span className="text-[12px] text-slate-500 truncate">
                          https://deshexam.com › institution › {formData.slug || formData.acronym?.toLowerCase() || 'details'}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-[20px] text-[#1a0dab] group-hover:underline cursor-pointer truncate leading-tight pt-1">
                      {formData.seoTitle || formData.title}
                    </h3>
                    <p className="text-[14px] text-[#4d5156] mt-1 line-clamp-2 leading-snug">
                      {formData.seoDescription}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        )}

        {/* --- ADMISSION TAB --- */}
        {activeTab === 'admission' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card>
              <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-500" />
                  Admission Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                <div className="flex items-center gap-3 bg-indigo-50/50 p-4 rounded-md border border-indigo-100">
                  <input
                    type="checkbox"
                    id="admissionOpen"
                    checked={formData.admission?.admissionOpen || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, admission: { ...prev.admission, admissionOpen: e.target.checked } as any }))}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <Label htmlFor="admissionOpen" className="text-base font-semibold text-indigo-900 cursor-pointer">Admissions are currently OPEN</Label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="applicationStartDate">Application Start Date</Label>
                    <Input 
                      type="date" 
                      id="applicationStartDate" 
                      value={formData.admission?.applicationStartDate || ''} 
                      onChange={(e) => setFormData(prev => ({ ...prev, admission: { ...prev.admission, applicationStartDate: e.target.value } as any }))} 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="applicationEndDate">Application End Date</Label>
                    <Input 
                      type="date" 
                      id="applicationEndDate" 
                      value={formData.admission?.applicationEndDate || ''} 
                      onChange={(e) => setFormData(prev => ({ ...prev, admission: { ...prev.admission, applicationEndDate: e.target.value } as any }))} 
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="admissionMode">Admission Mode</Label>
                    <select
                      id="admissionMode"
                      value={formData.admission?.admissionMode || 'Both'}
                      onChange={(e) => setFormData(prev => ({ ...prev, admission: { ...prev.admission, admissionMode: e.target.value } as any }))}
                      className="h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Merit">Merit Based</option>
                      <option value="Entrance">Entrance Exam</option>
                      <option value="Both">Merit & Entrance (Both)</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="applicationFee">Application Fee (₹)</Label>
                    <Input 
                      id="applicationFee" 
                      placeholder="e.g. 1500"
                      value={formData.admission?.applicationFee || ''} 
                      onChange={(e) => setFormData(prev => ({ ...prev, admission: { ...prev.admission, applicationFee: e.target.value } as any }))} 
                    />
                  </div>
                  
                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="admissionUrl">Admission Link / Apply URL</Label>
                    <Input 
                      id="admissionUrl" 
                      type="url"
                      placeholder="https://example.edu/apply"
                      value={formData.admission?.admissionUrl || ''} 
                      onChange={(e) => setFormData(prev => ({ ...prev, admission: { ...prev.admission, admissionUrl: e.target.value } as any }))} 
                    />
                  </div>

                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="requiredDocuments">Required Documents (comma separated)</Label>
                    <Input 
                      id="requiredDocuments" 
                      placeholder="e.g. 10th Marksheet, 12th Marksheet, Aadhar Card, Photos"
                      value={formData.admission?.requiredDocuments?.join(', ') || ''} 
                      onChange={(e) => setFormData(prev => ({ ...prev, admission: { ...prev.admission, requiredDocuments: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) } as any }))} 
                    />
                  </div>
                </div>

                <div className="grid gap-2 pt-4 border-t border-gray-100">
                  <Label>Admission Process & Details</Label>
                  <div className="min-h-[300px]">
                    <TiptapEditor 
                      content={formData.admission?.admissionProcess || ''} 
                      onChange={(html) => setFormData(prev => ({ ...prev, admission: { ...prev.admission, admissionProcess: html } as any }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* --- FACILITIES TAB --- */}
        {activeTab === 'facilities' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card>
              <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="w-5 h-5 text-indigo-500" />
                  Facilities & Infrastructure
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    'Library', 'Hostel', 'Wi-Fi', 'Cafeteria', 'Transport', 
                    'Sports Complex', 'Gym', 'Medical Facility', 'Auditorium', 
                    'Labs', 'AC Classrooms', 'Swimming Pool', 'Smart Board'
                  ].map(facility => (
                    <div key={facility} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`facility-${facility}`}
                        checked={((formData.facilities as any[]) || []).includes(facility)}
                        onChange={(e) => {
                          const current = (formData.facilities as any[]) || [];
                          if (e.target.checked) {
                            setFormData(prev => ({ ...prev, facilities: [...current, facility] as any }));
                          } else {
                            setFormData(prev => ({ ...prev, facilities: current.filter(f => f !== facility) as any }));
                          }
                        }}
                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                      />
                      <Label htmlFor={`facility-${facility}`} className="text-sm cursor-pointer">{facility}</Label>
                    </div>
                  ))}
                </div>
                
                <div className="grid gap-2 pt-4 border-t border-gray-100">
                  <Label htmlFor="customFacilities">Additional Facilities (Comma Separated)</Label>
                  <Input 
                    id="customFacilities"
                    placeholder="e.g. Robotics Lab, Incubation Center"
                    value={((formData.facilities as any[]) || []).filter(f => ![
                      'Library', 'Hostel', 'Wi-Fi', 'Cafeteria', 'Transport', 
                      'Sports Complex', 'Gym', 'Medical Facility', 'Auditorium', 
                      'Labs', 'AC Classrooms', 'Swimming Pool', 'Smart Board'
                    ].includes(f)).join(', ')}
                    onChange={(e) => {
                      const standard = ((formData.facilities as any[]) || []).filter(f => [
                        'Library', 'Hostel', 'Wi-Fi', 'Cafeteria', 'Transport', 
                        'Sports Complex', 'Gym', 'Medical Facility', 'Auditorium', 
                        'Labs', 'AC Classrooms', 'Swimming Pool', 'Smart Board'
                      ].includes(f));
                      const custom = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                      setFormData(prev => ({ ...prev, facilities: [...standard, ...custom] as any }));
                    }}
                  />
                  <p className="text-xs text-slate-500">Any standard facilities you uncheck will disappear from the list, while custom ones will appear here.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* --- PLACEMENT TAB --- */}
        {activeTab === 'placement' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card>
              <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-indigo-500" />
                  Placement & Career Services
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                <div className="flex items-center gap-3 bg-indigo-50/50 p-4 rounded-md border border-indigo-100">
                  <input
                    type="checkbox"
                    id="placementAvailable"
                    checked={formData.placement?.placementAvailable || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, placement: { ...prev.placement, placementAvailable: e.target.checked } as any }))}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <Label htmlFor="placementAvailable" className="text-base font-semibold text-indigo-900 cursor-pointer">Placement Cell Available</Label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="placementRate">Placement Rate</Label>
                    <Input 
                      id="placementRate" 
                      placeholder="e.g. 95%"
                      value={formData.placement?.placementRate || ''} 
                      onChange={(e) => setFormData(prev => ({ ...prev, placement: { ...prev.placement, placementRate: e.target.value } as any }))} 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="highestPackage">Highest Package (LPA)</Label>
                    <Input 
                      id="highestPackage" 
                      placeholder="e.g. 45 LPA"
                      value={formData.placement?.highestPackage || ''} 
                      onChange={(e) => setFormData(prev => ({ ...prev, placement: { ...prev.placement, highestPackage: e.target.value } as any }))} 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="averagePackage">Average Package (LPA)</Label>
                    <Input 
                      id="averagePackage" 
                      placeholder="e.g. 12 LPA"
                      value={formData.placement?.averagePackage || ''} 
                      onChange={(e) => setFormData(prev => ({ ...prev, placement: { ...prev.placement, averagePackage: e.target.value } as any }))} 
                    />
                  </div>

                  <div className="grid gap-2 md:col-span-3">
                    <Label htmlFor="recruiters">Top Recruiters (comma separated)</Label>
                    <Input 
                      id="recruiters" 
                      placeholder="e.g. Google, Microsoft, TCS, Infosys"
                      value={formData.placement?.recruiters?.join(', ') || ''} 
                      onChange={(e) => setFormData(prev => ({ ...prev, placement: { ...prev.placement, recruiters: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) } as any }))} 
                    />
                  </div>
                </div>

                <div className="grid gap-2 pt-4 border-t border-gray-100">
                  <Label>Placement Description</Label>
                  <div className="min-h-[250px]">
                    <TiptapEditor 
                      content={formData.placement?.placementDescription || ''} 
                      onChange={(html) => setFormData(prev => ({ ...prev, placement: { ...prev.placement, placementDescription: html } as any }))}
                    />
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        )}

        {/* --- SEO TAB --- */}
        {activeTab === 'seo' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card>
              <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search className="w-5 h-5 text-indigo-500" />
                  Advanced SEO & Social Sharing
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="focusKeyword">Focus Keyword</Label>
                    <Input 
                      id="focusKeyword" 
                      placeholder="e.g. Best Engineering College in Delhi"
                      value={formData.seoAdvanced?.focusKeyword || ''} 
                      onChange={(e) => setFormData(prev => ({ ...prev, seoAdvanced: { ...prev.seoAdvanced, focusKeyword: e.target.value } as any }))} 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="canonicalUrl">Canonical URL</Label>
                    <Input 
                      id="canonicalUrl" 
                      type="url"
                      placeholder="https://deshexam.com/institution/..."
                      value={formData.seoAdvanced?.canonicalUrl || ''} 
                      onChange={(e) => setFormData(prev => ({ ...prev, seoAdvanced: { ...prev.seoAdvanced, canonicalUrl: e.target.value } as any }))} 
                    />
                  </div>
                  
                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input 
                      id="tags" 
                      placeholder="e.g. engineering, delhi, computer science"
                      value={formData.tags?.join(', ') || ''} 
                      onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) }))} 
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-semibold mb-4 text-indigo-900">Open Graph (Social Media Sharing)</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="ogTitle">OG Title</Label>
                      <Input 
                        id="ogTitle" 
                        placeholder="Title for Facebook/LinkedIn sharing"
                        value={formData.seoAdvanced?.ogTitle || ''} 
                        onChange={(e) => setFormData(prev => ({ ...prev, seoAdvanced: { ...prev.seoAdvanced, ogTitle: e.target.value } as any }))} 
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="ogDescription">OG Description</Label>
                      <textarea 
                        id="ogDescription" 
                        rows={2}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Description for social sharing..."
                        value={formData.seoAdvanced?.ogDescription || ''} 
                        onChange={(e) => setFormData(prev => ({ ...prev, seoAdvanced: { ...prev.seoAdvanced, ogDescription: e.target.value } as any }))} 
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="ogImage">OG Image URL (Fallback to Feature Image)</Label>
                      <Input 
                        id="ogImage" 
                        type="url"
                        placeholder="https://example.com/og-image.jpg"
                        value={formData.seoAdvanced?.ogImage || ''} 
                        onChange={(e) => setFormData(prev => ({ ...prev, seoAdvanced: { ...prev.seoAdvanced, ogImage: e.target.value } as any }))} 
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="robotsIndex"
                      checked={formData.seoAdvanced?.robotsIndex ?? true}
                      onChange={(e) => setFormData(prev => ({ ...prev, seoAdvanced: { ...prev.seoAdvanced, robotsIndex: e.target.checked } as any }))}
                      className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                    />
                    <Label htmlFor="robotsIndex" className="cursor-pointer">Allow Search Engines to Index (robots: index, follow)</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="schemaEnabled"
                      checked={formData.seoAdvanced?.schemaEnabled ?? true}
                      onChange={(e) => setFormData(prev => ({ ...prev, seoAdvanced: { ...prev.seoAdvanced, schemaEnabled: e.target.checked } as any }))}
                      className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                    />
                    <Label htmlFor="schemaEnabled" className="cursor-pointer">Enable Rich JSON-LD Schema (EducationalOrganization)</Label>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        )}

        {/* --- SUBCOLLECTIONS TAB --- */}
        {activeTab === 'subcollections' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card>
              <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-500" />
                  Manage Subcollections
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  <div className="border border-slate-200 rounded-xl p-6 flex flex-col items-center text-center hover:border-indigo-300 hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">Courses</h3>
                    <p className="text-sm text-slate-500 mb-6">Manage undergraduate, postgraduate, and diploma courses with fee structures.</p>
                    <Button asChild className="w-full" variant={institutionId === 'new' ? 'secondary' : 'default'} disabled={institutionId === 'new'}>
                      <Link href={`/admin/institution/${institutionId}/courses`}>
                        Manage Courses
                      </Link>
                    </Button>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-6 flex flex-col items-center text-center hover:border-indigo-300 hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">FAQs</h3>
                    <p className="text-sm text-slate-500 mb-6">Add frequently asked questions and answers specifically for this institution.</p>
                    <Button asChild className="w-full" variant={institutionId === 'new' ? 'secondary' : 'default'} disabled={institutionId === 'new'}>
                      <Link href={`/admin/institution/${institutionId}/faqs`}>
                        Manage FAQs
                      </Link>
                    </Button>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-6 flex flex-col items-center text-center hover:border-indigo-300 hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">Scholarships</h3>
                    <p className="text-sm text-slate-500 mb-6">List available scholarships, amounts, criteria, and deadlines.</p>
                    <Button asChild className="w-full" variant={institutionId === 'new' ? 'secondary' : 'default'} disabled={institutionId === 'new'}>
                      <Link href={`/admin/institution/${institutionId}/scholarships`}>
                        Manage Scholarships
                      </Link>
                    </Button>
                  </div>

                </div>
                {institutionId === 'new' && (
                  <p className="text-sm text-amber-600 mt-4 text-center bg-amber-50 p-2 rounded">
                    Please save this institution first before managing its courses, FAQs, or scholarships.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* --- ANALYTICS TAB --- */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card>
              <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-indigo-500" />
                  Performance Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-bold text-indigo-600">{formData.metrics?.views || 0}</span>
                    <span className="text-sm font-medium text-slate-500 mt-1">Page Views</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-bold text-indigo-600">{formData.metrics?.brochureDownloads || 0}</span>
                    <span className="text-sm font-medium text-slate-500 mt-1">Brochure Downloads</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-bold text-indigo-600">{formData.metrics?.admissionClicks || 0}</span>
                    <span className="text-sm font-medium text-slate-500 mt-1">Apply Clicks</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-bold text-indigo-600">{formData.metrics?.websiteClicks || 0}</span>
                    <span className="text-sm font-medium text-slate-500 mt-1">Website Clicks</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-bold text-indigo-600">{formData.metrics?.callClicks || 0}</span>
                    <span className="text-sm font-medium text-slate-500 mt-1">Phone Reveals</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-6 text-center italic">Metrics are updated in real-time as users interact with the public page.</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* --- MEDIA & BROCHURE TAB --- */}
        {activeTab === 'media' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <Card>
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-indigo-500" />
                Feature Image & Logo
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center space-y-4">
                
                {/* Logo Preview */}
                <div className="w-32 h-32 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative shadow-sm">
                  {formData.logoUrl ? (
                    <Image src={formData.logoUrl} alt="Institution Logo" fill className="object-contain p-2" unoptimized />
                  ) : (
                    <Shield className="w-12 h-12 text-gray-300" />
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center backdrop-blur-sm">
                      <span className="text-sm font-medium text-indigo-600 animate-pulse">Uploading...</span>
                    </div>
                  )}
                </div>

                <div className="w-full">
                  <Label htmlFor="logo-upload" className="w-full">
                    <div className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-md cursor-pointer hover:bg-indigo-100 transition-colors font-medium text-sm">
                      <Upload className="w-4 h-4" />
                      {formData.logoUrl ? 'Change Image' : 'Upload Image'}
                    </div>
                  </Label>
                  <input 
                    id="logo-upload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </div>
                
                {formData.logoUrl && (
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-2" onClick={() => setFormData(prev => ({ ...prev, logoUrl: '' }))}>
                    Remove Image
                  </Button>
                )}
                
                <div className="w-full pt-4 mt-4 border-t border-gray-100">
                  <Label htmlFor="logoUrl" className="text-xs text-gray-500 mb-2 block">Or paste image URL directly:</Label>
                  <Input 
                    id="logoUrl" 
                    name="logoUrl" 
                    value={formData.logoUrl} 
                    onChange={handleChange} 
                    placeholder="https://example.com/logo.png" 
                    className="text-sm"
                  />
                </div>
                
                <p className="text-xs text-gray-400 text-center mt-4">
                  Recommended size: 1600x900px for Feature Image.<br/> PNG or WebP with transparent background.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                Brochure & Prospectus
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="brochureTitle">Brochure Title</Label>
                  <Input 
                    id="brochureTitle" 
                    placeholder="e.g. 2024 Engineering Prospectus"
                    value={formData.brochure?.title || ''} 
                    onChange={(e) => setFormData(prev => ({ ...prev, brochure: { ...prev.brochure, title: e.target.value } as any }))} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="brochureSize">File Size / Info</Label>
                  <Input 
                    id="brochureSize" 
                    placeholder="e.g. PDF (2.4 MB)"
                    value={formData.brochure?.size || ''} 
                    onChange={(e) => setFormData(prev => ({ ...prev, brochure: { ...prev.brochure, size: e.target.value } as any }))} 
                  />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="brochurePdfUrl">PDF URL</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="brochurePdfUrl" 
                      type="url"
                      placeholder="https://example.com/brochure.pdf"
                      value={formData.brochure?.pdfUrl || ''} 
                      onChange={(e) => setFormData(prev => ({ ...prev, brochure: { ...prev.brochure, pdfUrl: e.target.value } as any }))} 
                    />
                    <Label className="cursor-pointer shrink-0">
                      <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 border border-slate-200 rounded-md hover:bg-slate-200 transition-colors font-medium text-sm">
                        <Upload className="w-4 h-4" /> Upload PDF
                      </div>
                      <input 
                        type="file" 
                        accept="application/pdf" 
                        className="hidden" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file || !institutionId) return;
                          try {
                            setUploading(true);
                            toast({ title: 'Uploading PDF...' });
                            const storageRef = ref(storage, `institutions/${institutionId}/brochure_${Date.now()}.pdf`);
                            await uploadBytes(storageRef, file);
                            const url = await getDownloadURL(storageRef);
                            setFormData(prev => ({ ...prev, brochure: { ...prev.brochure, pdfUrl: url, size: `PDF (${(file.size / 1024 / 1024).toFixed(1)} MB)` } as any }));
                            toast({ title: 'PDF uploaded successfully' });
                          } catch (err) {
                            toast({ variant: 'destructive', title: 'Upload failed', description: String(err) });
                          } finally {
                            setUploading(false);
                          }
                        }}
                        disabled={uploading}
                      />
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-500" />
                Rich Data & Media
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Opening Hours */}
              <div className="grid gap-2">
                <Label>Opening Hours</Label>
                {formData.openingHours && formData.openingHours.length > 0 ? (
                  <ul className="text-sm text-slate-600 bg-slate-50 p-3 rounded-md border border-slate-100 space-y-1">
                    {formData.openingHours.map((hour, idx) => (
                      <li key={idx}>{hour}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-400 italic">No opening hours imported.</p>
                )}
              </div>

              {/* Gallery Images */}
              <div className="grid gap-2 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <Label>Gallery Images</Label>
                  <div className="flex gap-2">
                    <Label className="cursor-pointer">
                      <div className="flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-xs font-medium hover:bg-indigo-100 transition-colors">
                        <Upload className="w-3 h-3" />
                        Upload
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleUploadGalleryImage} disabled={uploading} />
                    </Label>
                  </div>
                </div>

                <div className="flex gap-2 mb-2">
                  <Input 
                    placeholder="Or paste an image URL..." 
                    value={newGalleryUrl} 
                    onChange={e => setNewGalleryUrl(e.target.value)} 
                    className="h-8 text-sm"
                  />
                  <Button type="button" onClick={handleAddGalleryUrl} disabled={!newGalleryUrl.trim()} size="sm" variant="secondary" className="h-8">
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>

                {formData.galleryImages && formData.galleryImages.length > 0 ? (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {formData.galleryImages.map((url, idx) => (
                      <div 
                        key={url + idx} 
                        draggable
                        onDragStart={() => handleGalleryDragStart(idx)}
                        onDragOver={(e) => handleGalleryDragOver(e, idx)}
                        onDragEnd={() => setDraggedGalleryIdx(null)}
                        className={`relative aspect-square rounded-md overflow-hidden border border-slate-200 group cursor-grab active:cursor-grabbing ${draggedGalleryIdx === idx ? 'opacity-50 border-indigo-500' : ''}`}
                      >
                        <Image src={url} alt={`Gallery ${idx}`} fill className="object-cover pointer-events-none" unoptimized />
                        <button 
                          onClick={() => handleRemoveGalleryImage(idx)}
                          className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">No gallery images yet.</p>
                )}
              </div>

              {/* Reviews Summary */}
              <div className="grid gap-2 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <Label>Imported Student Reviews</Label>
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsBulkImportModalOpen(true)} 
                      className="h-8"
                    >
                      <Upload className="w-3 h-3 mr-2" /> Bulk Import
                    </Button>
                    <select
                      className="h-8 text-xs border border-slate-200 rounded px-2 bg-white"
                      value={reviewLanguage}
                      onChange={(e) => setReviewLanguage(e.target.value)}
                      disabled={isGeneratingReviews}
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Bengali">Bengali</option>
                      <option value="Telugu">Telugu</option>
                      <option value="Marathi">Marathi</option>
                      <option value="Tamil">Tamil</option>
                      <option value="Gujarati">Gujarati</option>
                      <option value="Kannada">Kannada</option>
                      <option value="Malayalam">Malayalam</option>
                      <option value="Odia">Odia</option>
                      <option value="Punjabi">Punjabi</option>
                      <option value="Assamese">Assamese</option>
                    </select>
                    <select
                      className="h-8 text-xs border border-slate-200 rounded px-2"
                      onChange={(e) => {
                        if (e.target.value) {
                          handleGenerateReviews(Number(e.target.value));
                          e.target.value = ""; // reset
                        }
                      }}
                      disabled={isGeneratingReviews}
                    >
                      <option value="">{isGeneratingReviews ? 'Generating...' : 'Generate AI Reviews'}</option>
                      <option value="3">Generate 3 Reviews</option>
                      <option value="5">Generate 5 Reviews</option>
                      <option value="10">Generate 10 Reviews</option>
                    </select>
                    {formData.reviews && formData.reviews.length > 0 && (
                      <Button 
                        type="button" 
                        variant="secondary" 
                        size="sm" 
                        onClick={handleSummarizeReviews} 
                        disabled={isSummarizing}
                        className="h-8 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
                      >
                        <Sparkles className={`w-3 h-3 mr-2 ${isSummarizing ? 'animate-pulse text-indigo-400' : 'text-indigo-500'}`} />
                        {isSummarizing ? 'Summarizing...' : 'AI Summarize'}
                      </Button>
                    )}
                  </div>
                </div>

                {formData.aiReviewSummary && (
                  <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-md mb-2">
                    <h4 className="text-sm font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-500" /> AI Review Summary
                    </h4>
                    <div className="text-sm text-indigo-800 prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-0">
                      <ReactMarkdown>{formData.aiReviewSummary}</ReactMarkdown>
                    </div>
                  </div>
                )}

                {formData.reviews && formData.reviews.length > 0 ? (
                  <div className="space-y-3">
                    {formData.reviews.map((r, idx) => (
                      <div key={idx} className="text-sm bg-slate-50 p-3 rounded border border-slate-100 group relative">
                        {editingReviewIdx === idx ? (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Input 
                                value={r.authorName} 
                                onChange={(e) => {
                                  const newReviews = [...(formData.reviews || [])];
                                  newReviews[idx].authorName = e.target.value;
                                  setFormData(prev => ({ ...prev, reviews: newReviews }));
                                }} 
                                placeholder="Author Name"
                                className="h-8 text-xs bg-white flex-1"
                              />
                              <select 
                                value={r.rating} 
                                onChange={(e) => {
                                  const newReviews = [...(formData.reviews || [])];
                                  newReviews[idx].rating = Number(e.target.value);
                                  setFormData(prev => ({ ...prev, reviews: newReviews }));
                                }}
                                className="h-8 text-xs border border-slate-200 rounded px-2 bg-white"
                              >
                                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Stars</option>)}
                              </select>
                            </div>
                            <textarea 
                              value={r.text}
                              onChange={(e) => {
                                const newReviews = [...(formData.reviews || [])];
                                newReviews[idx].text = e.target.value;
                                setFormData(prev => ({ ...prev, reviews: newReviews }));
                              }}
                              className="w-full text-xs border border-slate-200 rounded p-2 min-h-[60px]"
                              placeholder="Review Text"
                            />
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" className="h-7 text-xs bg-white" onClick={() => setEditingReviewIdx(null)}>Done</Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                {r.authorPhotoUrl ? (
                                  <img src={r.authorPhotoUrl} alt={r.authorName} className="w-6 h-6 rounded-full object-cover shadow-sm" />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                    {r.authorName?.charAt(0)}
                                  </div>
                                )}
                                <div className="font-semibold text-slate-800">{r.authorName} <span className="text-amber-500 font-medium">({r.rating}★)</span></div>
                              </div>
                              <div className="flex gap-1">
                                <button 
                                  type="button"
                                  onClick={() => setEditingReviewIdx(idx)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded"
                                >
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg> Edit
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => {
                                    if(confirm('Delete review?')) {
                                      const newReviews = [...(formData.reviews || [])];
                                      newReviews.splice(idx, 1);
                                      setFormData(prev => ({ ...prev, reviews: newReviews }));
                                    }
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-red-600 hover:text-red-800 bg-red-50 px-2 py-1 rounded"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <p className="text-slate-600 italic">"{r.text}"</p>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">No reviews imported.</p>
                )}
              </div>
            </CardContent>
          </Card>
          </div>
        )}
        </div>
      </div>

      {/* Bulk Import Modal */}
      <Dialog open={isBulkImportModalOpen} onOpenChange={setIsBulkImportModalOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Bulk Import Reviews</DialogTitle>
            <DialogDescription>
              Paste a JSON array of reviews below. Each review object should at least contain <code>authorName</code>, <code>rating</code> (1-5), and <code>text</code>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <textarea
              className="w-full min-h-[300px] p-4 text-sm font-mono border rounded-md bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
              value={bulkImportJson}
              onChange={(e) => setBulkImportJson(e.target.value)}
              placeholder='[ { "authorName": "John", "rating": 5, "text": "Great!" } ]'
              spellCheck={false}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkImportModalOpen(false)}>Cancel</Button>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => {
                if (!bulkImportJson) return;
                try {
                  const parsed = JSON.parse(bulkImportJson);
                  if (Array.isArray(parsed)) {
                    const newReviews = parsed.map(r => ({
                      id: crypto.randomUUID(),
                      authorName: r.authorName || 'Anonymous',
                      rating: r.rating || 5,
                      text: r.text || '',
                      time: r.time || new Date().toLocaleDateString('en-GB').replace(/\//g, '.'),
                      authorPhotoUrl: r.authorPhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.authorName || 'User')}&background=random`,
                      isVerified: true,
                      likedBy: [],
                      dislikedBy: []
                    }));
                    setFormData(prev => ({ ...prev, reviews: [...(prev.reviews || []), ...newReviews] }));
                    toast({ title: `Imported ${newReviews.length} reviews successfully.` });
                    setIsBulkImportModalOpen(false);
                  } else {
                    toast({ variant: 'destructive', title: 'Input must be a JSON array' });
                  }
                } catch(e) {
                  toast({ variant: 'destructive', title: 'Invalid JSON format' });
                }
              }}
            >
              Import JSON
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
