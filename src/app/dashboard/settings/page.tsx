'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  User, 
  UserSquare, 
  Briefcase, 
  Phone, 
  Share2, 
  Bell, 
  Lock, 
  Shield, 
  Settings as SettingsIcon, 
  ChevronRight,
  Upload
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { getTaxonomyNodesByType, TaxonomyNode } from '@/lib/firebase/taxonomy';
import { updateUserProfile, uploadFile } from '@/lib/firebase/firestore';
import { Loader2 } from 'lucide-react';

const TABS = [
  { id: 'personal-info', label: 'Personal Info', icon: User },
  { id: 'academic-info', label: 'Academic Info', icon: UserSquare },
  { id: 'professional-info', label: 'Professional Info', icon: Briefcase },
  { id: 'contact-info', label: 'Contact Info', icon: Phone },
  { id: 'social-links', label: 'Social Links', icon: Share2 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Lock },
  { id: 'security', label: 'Security', icon: Shield },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('personal-info');

  useEffect(() => {
    // Read initial hash
    const hash = window.location.hash.replace('#', '');
    if (hash && TABS.some(t => t.id === hash)) {
      setActiveTab(hash);
    }

    // Listen for hash changes
    const handleHashChange = () => {
      const newHash = window.location.hash.replace('#', '');
      if (newHash && TABS.some(t => t.id === newHash)) {
        setActiveTab(newHash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    window.location.hash = id;
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto pb-12 text-slate-800 dark:text-slate-100">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Settings</h1>
        <p className="text-sm font-medium text-slate-500">Manage your account settings and preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Sidebar Menu */}
        <div className="w-full md:w-[280px] shrink-0 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-3 flex flex-col gap-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  isActive 
                    ? 'bg-blue-50/80 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <tab.icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
          
          <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
          
          <button className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
            <div className="flex items-center gap-3">
              <SettingsIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              Legacy Settings
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8">
          {activeTab === 'personal-info' && <PersonalInfoTab />}
          {activeTab === 'academic-info' && <AcademicInfoTab />}
          {activeTab === 'professional-info' && <ProfessionalInfoTab />}
          {activeTab === 'contact-info' && <ContactInfoTab />}
          {activeTab === 'social-links' && <SocialLinksTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'privacy' && <PrivacyTab />}
          {activeTab === 'security' && <SecurityTab />}
        </div>
      </div>
    </div>
  );
}

// --- TAB COMPONENTS ---

function PrivacyTab() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Privacy Settings</h2>
        <p className="text-sm font-medium text-slate-500 mt-1">Manage your privacy preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Privacy</label>
          <Select defaultValue="public">
            <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <SelectValue placeholder="Select privacy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Phone Privacy</label>
          <Select defaultValue="public">
            <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <SelectValue placeholder="Select privacy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Resume Privacy</label>
          <Select defaultValue="private">
            <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <SelectValue placeholder="Select privacy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-6 font-bold shadow-md shadow-indigo-500/20">
          <Lock className="w-4 h-4 mr-2" /> Save Changes
        </Button>
      </div>
    </div>
  );
}

function ContactInfoTab() {
  const { user, userProfile } = useAuth();
  
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [address, setAddress] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (userProfile) {
      setEmail(userProfile.contactEmail || user?.email || '');
      setPhone(userProfile.phone || user?.phoneNumber || '');
      setAltPhone(userProfile.altPhone || '');
      setAddress(userProfile.address || '');
    } else if (user) {
      setEmail(user.email || '');
      setPhone(user.phoneNumber || '');
    }
  }, [userProfile, user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setMessage('');
    try {
      await updateUserProfile(user.uid, {
        contactEmail: email,
        phone,
        altPhone,
        address,
      });
      setMessage('Contact info updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Failed to update contact info.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Contact Information</h2>
        <p className="text-sm font-medium text-slate-500 mt-1">Update your contact details for communication and delivery</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Address</label>
          <Input 
            className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11" 
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Primary Phone</label>
          <Input 
            className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11" 
            placeholder="+91 ..."
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Alternate Phone (Optional)</label>
          <Input 
            className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11" 
            placeholder="+91 ..."
            value={altPhone}
            onChange={(e) => setAltPhone(e.target.value)}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Full Address</label>
          <textarea 
            className="flex w-full rounded-md border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 min-h-[80px]" 
            placeholder="Street, City, Postal Code..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          ></textarea>
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-6">
        <div className="flex justify-end">
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-8 h-11 font-bold shadow-md shadow-indigo-500/20 rounded-xl"
          >
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lock className="w-4 h-4 mr-2" />}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
        {message && (
          <p className={`text-right text-sm font-semibold mt-2 ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

function AcademicInfoTab() {
  const { user, userProfile } = useAuth();
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [classes, setClasses] = useState<TaxonomyNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const fetchedClasses = await getTaxonomyNodesByType('academic', 'class');
        const competitiveCategories = await getTaxonomyNodesByType('competitive', 'category');
        
        const allNodes = [...fetchedClasses, ...competitiveCategories];
        
        // Sort them similar to how we sort taxonomy nodes
        const sorted = allNodes.sort((a, b) => {
          if (typeof a.orderIndex === 'number' && typeof b.orderIndex === 'number' && a.orderIndex !== b.orderIndex) {
            return a.orderIndex - b.orderIndex;
          }
          return (a.title || '').localeCompare(b.title || '', undefined, { numeric: true, sensitivity: 'base' });
        });
        
        setClasses(sorted);
        
        if (userProfile?.classId) {
          setSelectedClassId(userProfile.classId);
        } else if (sorted.length > 0) {
          setSelectedClassId(sorted[0].id);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClasses();
  }, [userProfile]);

  const handleSave = async () => {
    if (!user || !selectedClassId) return;
    setIsSaving(true);
    setMessage('');
    try {
      await updateUserProfile(user.uid, {
        classId: selectedClassId,
      });
      setMessage('Class updated successfully!');
      // Give the system a second to process and update the auth context
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Failed to update class. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Academic Information</h2>
        <p className="text-sm font-medium text-slate-500 mt-1">Select your class to personalize your experience</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-[#00a651]" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl">
            {classes.map(c => {
              const isActive = selectedClassId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedClassId(c.id)}
                  className={`h-12 rounded-xl border text-sm font-bold transition-all ${
                    isActive 
                      ? 'border-[#00a651] bg-[#00a651]/10 dark:bg-[#00a651]/20 text-[#00a651] dark:text-[#00a651]' 
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {c.title}
                </button>
              )
            })}
          </div>

          <div className="pt-6 max-w-4xl flex flex-col gap-2">
            <Button 
              onClick={handleSave}
              disabled={isSaving || !selectedClassId}
              className="w-full bg-[#00a651] hover:bg-[#008c44] text-white h-12 font-bold tracking-wider rounded-xl shadow-md shadow-green-500/20 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              {isSaving ? 'SAVING...' : 'CHANGE'}
            </Button>
            {message && (
              <p className={`text-center text-sm font-semibold mt-2 ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function ProfessionalInfoTab() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Professional Information</h2>
        <p className="text-sm font-medium text-slate-500 mt-1">Update your professional information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Last Academic Degree</label>
          <Input className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Institute Name</label>
          <Input className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11" />
        </div>
        
        <div className="col-span-1 md:col-span-2 py-2">
          <div className="h-px w-full bg-slate-100 dark:bg-slate-800" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Profession</label>
          <Input className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Current Organization</label>
          <Input className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11" />
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-8 h-11 font-bold shadow-md shadow-indigo-500/20 rounded-xl">
          <Lock className="w-4 h-4 mr-2" /> Save Changes
        </Button>
      </div>
    </div>
  );
}

function NotificationsTab() {
  const categories = [
    {
      title: 'Book Notifications',
      items: [
        { label: 'Book Subscribed (Soft Copy)', sub: '' },
        { label: 'Book Ordered (Hard Copy)', sub: '' },
        { label: 'New Book Added', sub: 'by businesses you follow' },
        { label: 'Delivery Status Changed', sub: 'of books you have ordered' },
      ]
    },
    {
      title: 'Course Notifications',
      items: [
        { label: 'Enrolled in Course', sub: '' },
        { label: 'New Course Added', sub: 'by businesses you follow' },
        { label: 'New Video Added to Course', sub: 'that you have enrolled in' },
        { label: 'New Assignment Added to Course', sub: 'that you have enrolled in' },
        { label: 'New Exam Added to Course', sub: 'that you have enrolled in' },
        { label: 'Course Completed', sub: '' },
      ]
    },
    {
      title: 'Exam Notifications',
      items: [
        { label: 'Exam Subscribed', sub: '' },
        { label: 'New Exam Added', sub: 'by businesses you follow' },
        { label: 'New Exam Package Added', sub: 'by businesses you follow' },
        { label: 'Result published', sub: 'of exams you have attended' },
      ]
    },
    {
      title: 'Package Notifications',
      items: [
        { label: 'Package Subscribed', sub: '' },
        { label: 'Package Renewed', sub: '' },
        { label: 'Package Upgraded', sub: '' },
      ]
    },
    {
      title: 'Business Notifications',
      items: [
        { label: 'Business Created', sub: '' },
        { label: 'Business Published', sub: '' },
        { label: 'Business Invitation', sub: '' },
      ]
    },
    {
      title: 'Career Notifications',
      items: [
        { label: 'Job Applied', sub: '' },
        { label: 'Applied Job\'s Status Changed', sub: '' },
      ]
    },
    {
      title: 'Other Notifications',
      items: [
        { label: 'Pending/Processing Items Approved', sub: 'Example: Subject Contents, Questions, Descriptions etc.' },
        { label: 'Login Alert', sub: 'Get notified when someone logs into your account', defaultOff: true },
        { label: 'Various offers and promotions', sub: 'from Skill Academy' },
      ]
    }
  ];

  return (
    <div className="space-y-10 max-w-3xl">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Notification Settings</h2>
        <p className="text-sm font-medium text-slate-500 mt-1">Manage your notification preferences</p>
      </div>

      <div className="space-y-12">
        {categories.map((category, i) => (
          <div key={i} className="space-y-5">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{category.title}</h3>
            <div className="space-y-4">
              {category.items.map((item, j) => (
                <div key={j} className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.label}</h4>
                    {item.sub && <p className="text-[11px] text-slate-400 mt-0.5">{item.sub}</p>}
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox defaultChecked={!item.defaultOff} className={!item.defaultOff ? 'data-[state=checked]:bg-[#4f46e5] data-[state=checked]:border-[#4f46e5]' : ''} />
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Web</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox defaultChecked={!item.defaultOff} className={!item.defaultOff ? 'data-[state=checked]:bg-[#4f46e5] data-[state=checked]:border-[#4f46e5]' : ''} />
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Email</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-6 border-t border-slate-100 dark:border-slate-800">
        <Button className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-8 h-11 font-bold shadow-md shadow-indigo-500/20 rounded-xl">
          <Lock className="w-4 h-4 mr-2" /> Save Changes
        </Button>
      </div>
      
      <p className="text-center text-[11px] font-medium text-slate-400 pb-8">
        Note: You will always receive transactional notifications (e.g. Order Confirmation, Password Reset etc.)
      </p>
    </div>
  );
}

// --- MOCKUP TABS ---

function PersonalInfoTab() {
  const { user, userProfile } = useAuth();
  
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setUsername(userProfile.username || '');
      setBio(userProfile.bio || '');
      setPhotoURL(userProfile.photoURL || '');
    } else if (user) {
      setDisplayName(user.displayName || '');
      setPhotoURL(user.photoURL || '');
    }
  }, [userProfile, user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setMessage('');
    try {
      await updateUserProfile(user.uid, {
        displayName,
        username,
        bio,
        photoURL,
      });
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    setIsUploading(true);
    try {
      const url = await uploadFile(file);
      setPhotoURL(url);
      
      // Auto save photoURL
      await updateUserProfile(user.uid, { photoURL: url });
      setMessage('Photo updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Failed to upload photo.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Personal Information</h2>
        <p className="text-sm font-medium text-slate-500 mt-1">Manage your basic profile details</p>
      </div>
      
      <div className="flex items-center gap-6 mb-8">
        <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-md flex items-center justify-center overflow-hidden">
           {photoURL ? (
             <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
           ) : (
             <User className="w-10 h-10 text-slate-400" />
           )}
        </div>
        <div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handlePhotoUpload}
          />
          <Button 
            variant="outline" 
            className="font-bold rounded-xl mb-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
            {isUploading ? 'Uploading...' : 'Upload Photo'}
          </Button>
          <p className="text-[11px] text-slate-400 font-medium">Recommended size: 256x256px. Max 2MB.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Full Name</label>
          <Input 
            className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11" 
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your Name"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Username</label>
          <Input 
            className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Bio</label>
          <textarea 
            className="flex w-full rounded-md border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 min-h-[100px]" 
            placeholder="Write a short bio about yourself..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          ></textarea>
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-6">
        <div className="flex justify-end">
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-8 h-11 font-bold shadow-md shadow-indigo-500/20 rounded-xl"
          >
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lock className="w-4 h-4 mr-2" />}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
        {message && (
          <p className={`text-right text-sm font-semibold mt-2 ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

function SocialLinksTab() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Social Links</h2>
        <p className="text-sm font-medium text-slate-500 mt-1">Connect your social media profiles</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Facebook URL</label>
          <Input className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11" placeholder="https://facebook.com/..." />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">LinkedIn URL</label>
          <Input className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11" placeholder="https://linkedin.com/in/..." />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Twitter URL</label>
          <Input className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11" placeholder="https://twitter.com/..." />
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-8 h-11 font-bold shadow-md shadow-indigo-500/20 rounded-xl">
          <Lock className="w-4 h-4 mr-2" /> Save Changes
        </Button>
      </div>
    </div>
  );
}

function SecurityTab() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Security Settings</h2>
        <p className="text-sm font-medium text-slate-500 mt-1">Manage your password and account security</p>
      </div>

      <div className="space-y-4 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl">
        <h3 className="font-bold text-slate-800 dark:text-slate-200">Change Password</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Current Password</label>
            <Input type="password" className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">New Password</label>
            <Input type="password" className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Confirm New Password</label>
            <Input type="password" className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11" />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-8 h-11 font-bold shadow-md shadow-indigo-500/20 rounded-xl">
          <Shield className="w-4 h-4 mr-2" /> Update Password
        </Button>
      </div>
    </div>
  );
}
