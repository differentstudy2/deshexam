'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Save, Sparkles, Image as ImageIcon, Palette, Type } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

export default function BrandingSettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [branding, setBranding] = useState({
    appName: 'DeshExam',
    logoUrl: '/favicon-bg.png',
    primaryColor: '#2563EB',
    fontFamily: 'Inter',
  });

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const docRef = doc(db, 'settings', 'branding');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBranding(prev => ({ ...prev, ...docSnap.data() }));
        }
      } catch (e) {
        console.error("Error fetching branding:", e);
      } finally {
        setFetching(false);
      }
    };
    fetchBranding();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, 'settings', 'branding'), branding, { merge: true });
      toast({
        title: 'Branding Saved',
        description: 'Your branding settings have been updated successfully.',
      });
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e.message || 'Failed to save branding settings.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-8 animate-pulse text-slate-500">Loading branding settings...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-blue-600" />
          Branding & Identity
        </h1>
        <p className="text-slate-500 mt-2">Manage your app's visual identity, logo, and core branding elements.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Type className="w-5 h-5 text-slate-500" /> General Details</CardTitle>
          <CardDescription>Configure the main name of your application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="appName">App Name</Label>
            <Input 
              id="appName" 
              value={branding.appName} 
              onChange={e => setBranding({...branding, appName: e.target.value})} 
              placeholder="e.g. DeshExam" 
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ImageIcon className="w-5 h-5 text-slate-500" /> Logo & Assets</CardTitle>
          <CardDescription>URLs for your logo and favicons.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="logoUrl">Main Logo URL</Label>
            <div className="flex gap-4 items-start">
              <Input 
                id="logoUrl" 
                value={branding.logoUrl} 
                onChange={e => setBranding({...branding, logoUrl: e.target.value})} 
                placeholder="/logo.png or https://..." 
              />
              {branding.logoUrl && (
                <div className="w-12 h-12 rounded-lg border bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden">
                  <img src={branding.logoUrl} alt="Logo preview" className="max-w-full max-h-full object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5 text-slate-500" /> Colors & Typography</CardTitle>
          <CardDescription>Set the main theme colors and fonts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex gap-2">
                <Input 
                  type="color" 
                  id="primaryColorColor" 
                  value={branding.primaryColor} 
                  onChange={e => setBranding({...branding, primaryColor: e.target.value})} 
                  className="w-12 p-1 h-10 cursor-pointer"
                />
                <Input 
                  id="primaryColor" 
                  value={branding.primaryColor} 
                  onChange={e => setBranding({...branding, primaryColor: e.target.value})} 
                  className="font-mono uppercase"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fontFamily">Font Family</Label>
              <Input 
                id="fontFamily" 
                value={branding.fontFamily} 
                onChange={e => setBranding({...branding, fontFamily: e.target.value})} 
                placeholder="e.g. Inter, sans-serif" 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto h-11 px-8 rounded-full shadow-sm">
          {loading ? <span className="animate-spin mr-2 border-2 border-white/20 border-t-white rounded-full w-4 h-4"></span> : <Save className="w-4 h-4 mr-2" />}
          Save Branding
        </Button>
      </div>
    </div>
  );
}
