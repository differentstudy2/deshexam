'use client';

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
import { ArrowLeft, Save, Upload, Shield, Image as ImageIcon, MapPin, Sparkles, X, Plus } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function InstitutionEditPage() {
  const params = useParams();
  const router = useRouter();
  const institutionId = params.id as string;
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  
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
    rating: undefined,
    status: 'draft',
    seoTitle: '',
    seoDescription: '',
    phoneNumber: '',
    internationalPhoneNumber: '',
    openingHours: [],
    galleryImages: [],
    reviews: [],
    totalEnrollment: undefined,
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
            logoUrl: node.logoUrl || node.featureImage || '', // fallback to featureImage if logoUrl is empty
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
            phoneNumber: node.phoneNumber || '',
            internationalPhoneNumber: node.internationalPhoneNumber || '',
            openingHours: node.openingHours || [],
            galleryImages: node.galleryImages || [],
            reviews: node.reviews || [],
            totalEnrollment: node.totalEnrollment,
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
      }
    }
    loadInstitution();
  }, [institutionId, toast]);

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

  const handleAutoFill = async () => {
    if (!formData.title) {
      toast({ variant: 'destructive', title: 'Institution name required to use AI' });
      return;
    }
    
    setIsAiLoading(true);
    toast({ title: 'AI is searching...', description: 'Please wait while AI gathers data from the web.' });
    
    try {
      const res = await fetch('/api/ai/fill-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.title, address: formData.address || formData.headquarters }),
      });
      
      if (!res.ok) throw new Error('AI request failed');
      
      const data = await res.json();
      
      setFormData(prev => ({
        ...prev,
        establishedYear: data.establishedYear || prev.establishedYear,
        totalEnrollment: data.totalEnrollment || prev.totalEnrollment,
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
      toast({ variant: 'destructive', title: 'AI failed to gather data' });
    } finally {
      setIsAiLoading(false);
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

  const handleSave = async () => {
    setSaving(true);
    try {
      // Strip undefined values to prevent Firebase errors
      const payload: any = { ...formData };
      if (payload.logoUrl) payload.featureImage = payload.logoUrl;
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

      await updateTaxonomyNode(institutionId, payload);
      toast({ title: 'Institution updated successfully!' });
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
          <Button onClick={handleSave} disabled={saving || uploading} className="bg-indigo-600 hover:bg-indigo-700">
            {saving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Form Fields */}
        <div className="md:col-span-2 space-y-6">
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
                <textarea 
                  id="description" 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  rows={4}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Brief description about the institution..."
                />
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
            </CardContent>
          </Card>

          {/* New Card: Rich Imported Data */}
          <Card>
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-500" />
                Rich Data (Google Maps)
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
                      <div key={idx} className="relative aspect-square rounded-md overflow-hidden border border-slate-200 group">
                        <Image src={url} alt={`Gallery ${idx}`} fill className="object-cover" unoptimized />
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
                <Label>Imported Student Reviews</Label>
                {formData.reviews && formData.reviews.length > 0 ? (
                  <div className="space-y-2">
                    {formData.reviews.map((r, idx) => (
                      <div key={idx} className="text-sm bg-slate-50 p-2 rounded border border-slate-100">
                        <div className="font-semibold text-slate-800">{r.authorName} <span className="text-amber-500">({r.rating}★)</span></div>
                        <p className="text-slate-600 italic line-clamp-2">"{r.text}"</p>
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

        {/* Right Column: Logo Upload */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-indigo-500" />
                Institution Logo
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
                      {formData.logoUrl ? 'Change Logo' : 'Upload Logo'}
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
                    Remove Logo
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
                  Recommended size: 256x256px.<br/> PNG or WebP with transparent background.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
