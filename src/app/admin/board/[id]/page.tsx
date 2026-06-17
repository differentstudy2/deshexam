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
import { ArrowLeft, Save, Upload, Shield, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function BoardEditPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = params.id as string;
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState<Partial<TaxonomyNode>>({
    title: '',
    acronym: '',
    slug: '',
    boardType: 'State Board',
    stateRegion: '',
    description: '',
    logoUrl: '',
    websiteUrl: '',
    establishedYear: '',
    headquarters: '',
    status: 'draft',
    seoTitle: '',
  });

  useEffect(() => {
    async function loadBoard() {
      if (!boardId) return;
      try {
        const node = await getTaxonomyNodeById(boardId);
        if (node) {
          setFormData({
            title: node.title || '',
            acronym: node.acronym || '',
            slug: node.slug || '',
            boardType: node.boardType || 'State Board',
            stateRegion: node.stateRegion || '',
            description: node.description || '',
            logoUrl: node.logoUrl || node.featureImage || '', // fallback to featureImage if logoUrl is empty
            websiteUrl: node.websiteUrl || '',
            establishedYear: node.establishedYear || '',
            headquarters: node.headquarters || '',
            status: node.status || 'published',
            seoTitle: node.seoTitle || '',
          });
        }
      } catch (error) {
        console.error('Failed to load board:', error);
        toast({ variant: 'destructive', title: 'Error loading board data' });
      } finally {
        setLoading(false);
      }
    }
    loadBoard();
  }, [boardId, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `boards/logos/${boardId}_${Date.now()}_${file.name}`);
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

  const handleSave = async () => {
    setSaving(true);
    try {
      // Create an update object, mapping logoUrl to featureImage as well for backwards compatibility if needed
      await updateTaxonomyNode(boardId, {
        ...formData,
        featureImage: formData.logoUrl // keep featureImage in sync
      });
      toast({ title: 'Board updated successfully!' });
      router.refresh();
    } catch (error) {
      console.error('Save failed:', error);
      toast({ variant: 'destructive', title: 'Failed to save board', description: String(error) });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-500 animate-pulse">Loading board details...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon" className="h-10 w-10 rounded-full">
            <Link href="/admin/textbook">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Edit Institution / Board: {formData.acronym || 'New Entry'}
            </h1>
            <p className="text-gray-500 text-sm">ID: {boardId}</p>
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
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
              <CardTitle className="text-lg">General Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Full Name <span className="text-red-500">*</span></Label>
                <Input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Central Board of Secondary Education or Delhi Public School" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="acronym">Acronym / Short Name</Label>
                  <Input id="acronym" name="acronym" value={formData.acronym} onChange={handleChange} placeholder="e.g. CBSE" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input id="slug" name="slug" value={formData.slug} onChange={handleChange} placeholder="e.g. cbse" />
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
                  placeholder="Brief description about the board or institution..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
              <CardTitle className="text-lg">Classification & SEO</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="boardType">Institution Type</Label>
                  <select 
                    id="boardType" 
                    name="boardType" 
                    value={formData.boardType} 
                    onChange={handleChange as any}
                    className="h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Central Board">Central Board</option>
                    <option value="State Board">State Board</option>
                    <option value="Public School">Public School</option>
                    <option value="Private School">Private School</option>
                    <option value="College">College</option>
                    <option value="University">University</option>
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
                  <Input id="establishedYear" name="establishedYear" value={formData.establishedYear} onChange={handleChange} placeholder="e.g. 1929" />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="headquarters">Headquarters</Label>
                  <Input id="headquarters" name="headquarters" value={formData.headquarters} onChange={handleChange} placeholder="e.g. New Delhi, India" />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="websiteUrl">Official Website</Label>
                <Input id="websiteUrl" name="websiteUrl" type="url" value={formData.websiteUrl} onChange={handleChange} placeholder="https://cbse.gov.in" />
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
