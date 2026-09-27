'use client';

import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Settings, Save, Loader2 } from 'lucide-react';

export default function DocumentSettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    autoDownload: true,
    adsMode: 'guests_only', // 'none', 'guests_only', 'everyone'
    adsensePublisherId: '',
    leftAdSlot: '',
    rightAdSlot: '',
    sidebarAdSlot: '',
    belowHeroAdSlot: '',
  });

  useEffect(() => {
    let mounted = true;
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'download_page');
        const snap = await getDoc(docRef);
        if (snap.exists() && mounted) {
          setSettings({
            autoDownload: snap.data().autoDownload ?? true,
            adsMode: snap.data().adsMode || 'guests_only',
            adsensePublisherId: snap.data().adsensePublisherId || '',
            leftAdSlot: snap.data().leftAdSlot || '',
            rightAdSlot: snap.data().rightAdSlot || '',
            sidebarAdSlot: snap.data().sidebarAdSlot || '',
            belowHeroAdSlot: snap.data().belowHeroAdSlot || '',
          });
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchSettings();
    return () => { mounted = false; };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'download_page'), settings, { merge: true });
      toast({ title: 'Settings saved successfully!' });
    } catch (error: any) {
      toast({ title: 'Failed to save', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-8 h-8 text-[#107c41]" />
          Download Page Settings
        </h1>
        <p className="text-slate-500 mt-2">Manage settings for the public document download waiting page.</p>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle>Download Behavior</CardTitle>
          <CardDescription>Configure how downloads behave for the user.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Auto-Download Enabled</Label>
              <p className="text-sm text-slate-500">Automatically start the download after the countdown finishes.</p>
            </div>
            <Switch
              checked={settings.autoDownload}
              onCheckedChange={(checked) => setSettings({ ...settings, autoDownload: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle>Advertisements</CardTitle>
          <CardDescription>Configure ad visibility on the download page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-base">Ads Mode</Label>
            <p className="text-sm text-slate-500 mb-2">Select who should see ads on the download page.</p>
            <select
              value={settings.adsMode}
              onChange={(e) => setSettings({ ...settings, adsMode: e.target.value })}
              className="flex h-10 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
            >
              <option value="none">Disabled (No Ads)</option>
              <option value="guests_only">Guests Only (Hide for logged in users)</option>
              <option value="everyone">Everyone</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {settings.adsMode !== 'none' && (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <CardTitle>Google AdSense Configuration</CardTitle>
            <CardDescription>Enter your publisher and slot IDs. Leave a slot ID blank to disable that specific placement.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Publisher ID</Label>
              <Input
                placeholder="e.g. ca-pub-1234567890123456"
                value={settings.adsensePublisherId}
                onChange={(e) => setSettings({ ...settings, adsensePublisherId: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Left Download Ad Slot ID</Label>
                <Input
                  placeholder="e.g. 1234567890"
                  value={settings.leftAdSlot}
                  onChange={(e) => setSettings({ ...settings, leftAdSlot: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Right Download Ad Slot ID</Label>
                <Input
                  placeholder="e.g. 1234567890"
                  value={settings.rightAdSlot}
                  onChange={(e) => setSettings({ ...settings, rightAdSlot: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Sidebar Popular Downloads Ad Slot ID</Label>
                <Input
                  placeholder="e.g. 1234567890"
                  value={settings.sidebarAdSlot}
                  onChange={(e) => setSettings({ ...settings, sidebarAdSlot: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Below Document Hero Ad Slot ID</Label>
                <Input
                  placeholder="e.g. 1234567890"
                  value={settings.belowHeroAdSlot}
                  onChange={(e) => setSettings({ ...settings, belowHeroAdSlot: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Button onClick={handleSave} disabled={saving} className="bg-[#107c41] hover:bg-[#0b5c30]">
        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
        Save Settings
      </Button>
    </div>
  );
}
