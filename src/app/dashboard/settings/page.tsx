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
  Upload,
  Smartphone,
  Monitor,
  LogOut,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { getTaxonomyNodesByType, TaxonomyNode } from '@/lib/firebase/taxonomy';
import { updateUserProfile, uploadFile } from '@/lib/firebase/firestore';
import { Loader2 } from 'lucide-react';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { doc, deleteDoc, collection, onSnapshot } from 'firebase/firestore';
import { useFirestore } from '@/hooks/use-firebase';

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
  const { user, userProfile } = useAuth();
  
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [searchIndexing, setSearchIndexing] = useState('allow');
  const [emailPrivacy, setEmailPrivacy] = useState('public');
  const [phonePrivacy, setPhonePrivacy] = useState('private');
  const [resumePrivacy, setResumePrivacy] = useState('private');
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (userProfile?.privacySettings) {
      setProfileVisibility(userProfile.privacySettings.profileVisibility || 'public');
      setSearchIndexing(userProfile.privacySettings.searchIndexing || 'allow');
      setEmailPrivacy(userProfile.privacySettings.email || 'public');
      setPhonePrivacy(userProfile.privacySettings.phone || 'private');
      setResumePrivacy(userProfile.privacySettings.resume || 'private');
    }
  }, [userProfile]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setMessage('');
    try {
      await updateUserProfile(user.uid, {
        privacySettings: {
          profileVisibility,
          searchIndexing,
          email: emailPrivacy,
          phone: phonePrivacy,
          resume: resumePrivacy,
        }
      });
      setMessage('Privacy settings updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Failed to update privacy settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Privacy Settings</h2>
        <p className="text-sm font-medium text-slate-500 mt-1">Manage your privacy preferences and visibility</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Profile Visibility</label>
          <Select value={profileVisibility} onValueChange={setProfileVisibility}>
            <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11">
              <SelectValue placeholder="Select visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public (Visible to everyone)</SelectItem>
              <SelectItem value="registered">Registered Users Only</SelectItem>
              <SelectItem value="private">Private (Only me)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Search Engine Indexing</label>
          <Select value={searchIndexing} onValueChange={setSearchIndexing}>
            <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11">
              <SelectValue placeholder="Allow indexing" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="allow">Allow (Recommended)</SelectItem>
              <SelectItem value="block">Block</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Privacy</label>
          <Select value={emailPrivacy} onValueChange={setEmailPrivacy}>
            <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11">
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
          <Select value={phonePrivacy} onValueChange={setPhonePrivacy}>
            <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11">
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
          <Select value={resumePrivacy} onValueChange={setResumePrivacy}>
            <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11">
              <SelectValue placeholder="Select privacy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
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
  const { user, userProfile } = useAuth();
  
  // Existing fields
  const [lastDegree, setLastDegree] = useState('');
  const [instituteName, setInstituteName] = useState('');
  const [profession, setProfession] = useState('');
  const [organization, setOrganization] = useState('');
  
  // New fields
  const [currentStatus, setCurrentStatus] = useState('');
  const [major, setMajor] = useState('');
  const [passingYear, setPassingYear] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [resumeLink, setResumeLink] = useState('');
  const [languages, setLanguages] = useState('');
  const [certifications, setCertifications] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (userProfile?.professionalInfo) {
      setLastDegree(userProfile.professionalInfo.lastDegree || '');
      setInstituteName(userProfile.professionalInfo.instituteName || '');
      setProfession(userProfile.professionalInfo.profession || '');
      setOrganization(userProfile.professionalInfo.organization || '');
      
      setCurrentStatus(userProfile.professionalInfo.currentStatus || '');
      setMajor(userProfile.professionalInfo.major || '');
      setPassingYear(userProfile.professionalInfo.passingYear || '');
      setSkills(userProfile.professionalInfo.skills || '');
      setExperience(userProfile.professionalInfo.experience || '');
      setResumeLink(userProfile.professionalInfo.resumeLink || '');
      setLanguages(userProfile.professionalInfo.languages || '');
      setCertifications(userProfile.professionalInfo.certifications || '');
    }
  }, [userProfile]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setMessage('');
    try {
      await updateUserProfile(user.uid, {
        professionalInfo: {
          lastDegree,
          instituteName,
          profession,
          organization,
          currentStatus,
          major,
          passingYear,
          skills,
          experience,
          resumeLink,
          languages,
          certifications,
        }
      });
      setMessage('Professional info updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Failed to update professional info.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Professional & Academic Info</h2>
        <p className="text-sm font-medium text-slate-500 mt-1">Update your education and career details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Current Status</label>
          <Select value={currentStatus} onValueChange={setCurrentStatus}>
            <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11">
              <SelectValue placeholder="Select your status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Student">Student</SelectItem>
              <SelectItem value="Job Seeker">Job Seeker</SelectItem>
              <SelectItem value="Employed">Employed</SelectItem>
              <SelectItem value="Freelancer">Freelancer</SelectItem>
              <SelectItem value="Entrepreneur">Entrepreneur</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Skills / Expertise</label>
          <Input 
            className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11" 
            placeholder="e.g. React, Marketing, English (comma separated)"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Languages Known</label>
          <Input 
            className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11" 
            placeholder="e.g. English, Hindi, Bengali"
            value={languages}
            onChange={(e) => setLanguages(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Certifications / Achievements</label>
          <Input 
            className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11" 
            placeholder="e.g. AWS Certified, Top Coder"
            value={certifications}
            onChange={(e) => setCertifications(e.target.value)}
          />
        </div>

        <div className="col-span-1 md:col-span-2 py-2">
          <div className="h-px w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <span className="bg-white dark:bg-slate-900 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Academic Background</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Last Academic Degree</label>
          <Input 
            className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11" 
            placeholder="e.g. B.Sc, 12th, BA"
            value={lastDegree}
            onChange={(e) => setLastDegree(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Major / Department</label>
          <Input 
            className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11" 
            placeholder="e.g. Computer Science, Science, English"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Institute Name</label>
          <Input 
            className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11" 
            placeholder="e.g. Delhi University"
            value={instituteName}
            onChange={(e) => setInstituteName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Passing Year / Expected</label>
          <Input 
            className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11" 
            placeholder="e.g. 2024"
            value={passingYear}
            onChange={(e) => setPassingYear(e.target.value)}
          />
        </div>
        
        <div className="col-span-1 md:col-span-2 py-2">
          <div className="h-px w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <span className="bg-white dark:bg-slate-900 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Professional Background</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Profession / Designation</label>
          <Input 
            className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11" 
            placeholder="e.g. Software Engineer"
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Current Organization</label>
          <Input 
            className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11" 
            placeholder="e.g. Google"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Years of Experience</label>
          <Input 
            className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11" 
            placeholder="e.g. 2"
            type="number"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Resume / CV Link</label>
          <Input 
            className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11" 
            placeholder="Google Drive link..."
            value={resumeLink}
            onChange={(e) => setResumeLink(e.target.value)}
          />
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
  const { user, userProfile } = useAuth();
  
  const [facebook, setFacebook] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');
  const [instagram, setInstagram] = useState('');
  const [website, setWebsite] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (userProfile?.socialLinks) {
      setFacebook(userProfile.socialLinks.facebook || '');
      setLinkedin(userProfile.socialLinks.linkedin || '');
      setTwitter(userProfile.socialLinks.twitter || '');
      setInstagram(userProfile.socialLinks.instagram || '');
      setWebsite(userProfile.socialLinks.website || '');
    }
  }, [userProfile]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setMessage('');
    try {
      await updateUserProfile(user.uid, {
        socialLinks: {
          facebook,
          linkedin,
          twitter,
          instagram,
          website,
        }
      });
      setMessage('Social links updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Failed to update social links.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Social Links</h2>
        <p className="text-sm font-medium text-slate-500 mt-1">Connect your social media profiles</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Facebook URL</label>
          <Input 
            className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11" 
            placeholder="https://facebook.com/..." 
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">LinkedIn URL</label>
          <Input 
            className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11" 
            placeholder="https://linkedin.com/in/..." 
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Instagram URL</label>
          <Input 
            className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11" 
            placeholder="https://instagram.com/..." 
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Twitter (X) URL</label>
          <Input 
            className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11" 
            placeholder="https://twitter.com/..." 
            value={twitter}
            onChange={(e) => setTwitter(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Personal Website / Blog</label>
          <Input 
            className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11" 
            placeholder="https://yourwebsite.com" 
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
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

function SecurityTab() {
  const { user } = useAuth();
  const db = useFirestore();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);

  // Sessions state
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentSessionId(localStorage.getItem('sessionId') || '');
    }
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    
    const sessionsRef = collection(db, `users/${user.uid}/sessions`);
    const unsubscribe = onSnapshot(sessionsRef, (snapshot) => {
      const fetchedSessions: any[] = [];
      snapshot.forEach((doc) => {
        fetchedSessions.push({ id: doc.id, ...doc.data() });
      });
      // Sort by last active descending
      fetchedSessions.sort((a, b) => {
        const timeA = a.lastActive ? a.lastActive.toMillis() : 0;
        const timeB = b.lastActive ? b.lastActive.toMillis() : 0;
        return timeB - timeA;
      });
      setSessions(fetchedSessions);
    });

    return () => unsubscribe();
  }, [user, db]);

  const handleLogOutDevice = async (sessionId: string) => {
    if (!user || !db) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/sessions/${sessionId}`));
    } catch (error) {
      console.error('Failed to log out device', error);
    }
  };

  const handleLogOutAllOtherDevices = async () => {
    if (!user || !db) return;
    try {
      const otherSessions = sessions.filter(s => s.id !== currentSessionId);
      for (const s of otherSessions) {
        await deleteDoc(doc(db, `users/${user.uid}/sessions/${s.id}`));
      }
    } catch (error) {
      console.error('Failed to log out all other devices', error);
    }
  };

  const parseUserAgent = (ua: string) => {
    if (!ua) return "Unknown Device";
    let device = "Unknown Device";
    let browser = "Unknown Browser";
    
    if (ua.includes('Windows')) device = "Windows PC";
    else if (ua.includes('Macintosh')) device = "Mac";
    else if (ua.includes('iPhone')) device = "iPhone";
    else if (ua.includes('iPad')) device = "iPad";
    else if (ua.includes('Android')) device = "Android Device";
    else if (ua.includes('Linux')) device = "Linux PC";
    
    if (ua.includes('Chrome') && !ua.includes('Edg') && !ua.includes('OPR')) browser = "Chrome";
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = "Safari";
    else if (ua.includes('Firefox')) browser = "Firefox";
    else if (ua.includes('Edg')) browser = "Edge";
    else if (ua.includes('OPR') || ua.includes('Opera')) browser = "Opera";
    
    return `${device} - ${browser}`;
  };

  const formatLastActive = (timestamp: any) => {
    if (!timestamp) return 'Active Now';
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);
    
    if (diffMins < 5) return 'Active Now';
    if (diffMins < 60) return `Last active ${diffMins} minutes ago`;
    if (diffHours < 24) return `Last active ${diffHours} hours ago`;
    if (diffDays === 1) return 'Last active yesterday';
    return `Last active ${date.toLocaleDateString()}`;
  };

  const handleUpdatePassword = async () => {
    if (!user || !user.email) {
      setMessage('error:User email not found. Please log in again.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage('error:New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setMessage('error:Password should be at least 6 characters');
      return;
    }
    setIsSaving(true);
    setMessage('');
    
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      
      setMessage('success:Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setMessage('error:Incorrect current password');
      } else if (error.code === 'auth/requires-recent-login') {
        setMessage('error:Please log out and log back in to change password.');
      } else {
        setMessage('error:Failed to update password.');
      }
    } finally {
      setIsSaving(false);
    }
  };

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
            <Input 
              type="password" 
              className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11" 
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">New Password</label>
            <Input 
              type="password" 
              className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Confirm New Password</label>
            <Input 
              type="password" 
              className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-2 pt-2">
          <div className="flex justify-end">
            <Button 
              onClick={handleUpdatePassword}
              disabled={isSaving || !currentPassword || !newPassword || !confirmPassword}
              className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-8 h-11 font-bold shadow-md shadow-indigo-500/20 rounded-xl"
            >
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Shield className="w-4 h-4 mr-2" />}
              {isSaving ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
          {message && (
            <p className={`text-right text-sm font-semibold mt-2 ${message.startsWith('success') ? 'text-green-600' : 'text-red-600'}`}>
              {message.replace('success:', '').replace('error:', '')}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-6 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl">
        <h3 className="font-bold text-slate-800 dark:text-slate-200">Additional Security</h3>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Two-Factor Authentication (2FA)</h4>
            <p className="text-xs text-slate-500 mt-1">Add an extra layer of security to your account.</p>
          </div>
          <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
        </div>

        <div className="h-px w-full bg-slate-100 dark:bg-slate-800 my-4" />

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Login Alerts</h4>
            <p className="text-xs text-slate-500 mt-1">Get notified of unrecognized logins.</p>
          </div>
          <Switch checked={loginAlerts} onCheckedChange={setLoginAlerts} />
        </div>
      </div>

      <div className="space-y-6 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl">
        <h3 className="font-bold text-slate-800 dark:text-slate-200">Active Sessions</h3>
        <p className="text-xs text-slate-500 mb-4">You are currently logged in on these devices.</p>
        
        <div className="space-y-4">
          {sessions.map((session) => {
            const isCurrent = session.id === currentSessionId;
            const parsedUA = parseUserAgent(session.userAgent);
            const isActiveNow = isCurrent || formatLastActive(session.lastActive) === 'Active Now';
            
            return (
              <div key={session.id} className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isCurrent ? 'bg-[#4f46e5]/10' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  {parsedUA.includes('Phone') || parsedUA.includes('Android') ? (
                    <Smartphone className={`w-5 h-5 ${isCurrent ? 'text-[#4f46e5]' : 'text-slate-400'}`} />
                  ) : (
                    <Monitor className={`w-5 h-5 ${isCurrent ? 'text-[#4f46e5]' : 'text-slate-400'}`} />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">{parsedUA}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {session.location || 'Unknown Location'} • {isActiveNow ? 'Active Now' : formatLastActive(session.lastActive)}
                  </p>
                </div>
                {isCurrent ? (
                  <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-md border border-green-200 dark:border-green-500/20">This Device</span>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleLogOutDevice(session.id)}
                    className="h-8 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    Log out
                  </Button>
                )}
              </div>
            );
          })}
          
          {sessions.length === 0 && (
            <div className="text-center text-sm text-slate-500 py-4">No active sessions found.</div>
          )}
        </div>

        {sessions.length > 1 && (
          <div className="flex justify-start pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button 
              variant="outline" 
              onClick={handleLogOutAllOtherDevices}
              className="text-slate-700 dark:text-slate-300 font-bold h-10 rounded-xl"
            >
              <LogOut className="w-4 h-4 mr-2" /> Log out of all other devices
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-4 border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 p-6 rounded-2xl">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h3 className="font-bold text-red-600 dark:text-red-500">Danger Zone</h3>
        </div>
        <p className="text-sm text-red-600/80 dark:text-red-400">Permanently delete your account and all of your content. This action is not reversible.</p>
        <div className="pt-2">
          <Button className="bg-red-600 hover:bg-red-700 text-white font-bold h-10 rounded-xl">
            <Trash2 className="w-4 h-4 mr-2" /> Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}
