'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { Challenge, getUserChallenges, createChallenge, getPublicChallenges, acceptPublicChallenge } from '@/lib/firebase/challenges';
import { getTaxonomyNodesByParent } from '@/lib/firebase/taxonomy';
import { Swords, Trophy, Clock, CheckCircle, XCircle, Search, User as UserIcon, Loader2, Sparkles, Plus, AlertCircle, BookOpen, Globe, ChevronDown, ChevronUp, CheckSquare, Square } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ChallengesHubPage() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [publicChallenges, setPublicChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'incoming' | 'sent' | 'completed' | 'public'>('incoming');
  
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [loadingTopics, setLoadingTopics] = useState(false);
  
  // New Challenge Form State
  const [mode, setMode] = useState<'friend' | 'random' | 'public'>('random');
  const [subjectId, setSubjectId] = useState('');
  const [questionCount, setQuestionCount] = useState('5');
  const [opponentIdInput, setOpponentIdInput] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCoreData() {
      if (!user) return;
      try {
        const chData = await getUserChallenges(user.uid);
        setChallenges(chData);
      } catch (err: any) {
        console.error("Failed to load core data", err);
        if (err.message && err.message.includes('requires an index')) {
          setPageError(err.message);
        } else {
          setPageError("Failed to load challenges.");
        }
      } finally {
        setLoading(false);
      }
    }
    loadCoreData();
  }, [user]);

  useEffect(() => {
    async function loadClassData() {
      if (!userProfile?.classId) return;
      try {
        // Fetch textbooks only for the user's class
        const classSubjects = await getTaxonomyNodesByParent(userProfile.classId);
        let classTextbooks: any[] = [];
        for (const subj of classSubjects) {
          if (subj.type === 'subject') {
            const textbooks = await getTaxonomyNodesByParent(subj.id);
            classTextbooks.push(...textbooks.filter((t: any) => t.type === 'textbook'));
          }
        }
        setSubjects(classTextbooks);

        // Fetch public challenges for this class
        const pubData = await getPublicChallenges(userProfile.classId);
        setPublicChallenges(pubData);
      } catch (err: any) {
        console.error("Failed to load class data", err);
        if (err.message && err.message.includes('requires an index')) {
          setPageError(err.message);
        }
      }
    }
    loadClassData();
  }, [userProfile?.classId]);

  useEffect(() => {
    async function loadChaptersAndTopics() {
      if (!subjectId) {
        setChapters([]);
        setTopics([]);
        return;
      }
      setLoadingTopics(true);
      try {
        const chapterNodes = await getTaxonomyNodesByParent(subjectId);
        setChapters(chapterNodes.filter(c => c.type === 'chapter'));
        
        let allTopics: any[] = [];
        for (const chap of chapterNodes) {
          if (chap.type === 'chapter') {
            const topicNodes = await getTaxonomyNodesByParent(chap.id);
            allTopics.push(...topicNodes.filter((t: any) => t.type === 'topic'));
          }
        }
        setTopics(allTopics);
      } catch (err) {
        console.error("Failed to load chapters and topics", err);
      } finally {
        setLoadingTopics(false);
      }
    }
    loadChaptersAndTopics();
  }, [subjectId]);

  // Handle Firebase Index Error Display
  if (pageError) {
    let errorMessage = pageError;
    let indexLink = null;
    if (pageError.includes('https://console.firebase.google.com/')) {
      const urlMatch = pageError.match(/(https:\/\/console\.firebase\.google\.com\/[^\s]+)/);
      if (urlMatch) {
        indexLink = urlMatch[0];
        errorMessage = pageError.replace(indexLink, '').replace('You can create it here: ', '');
      }
    }

    return (
      <div className="w-full max-w-3xl mx-auto p-6 bg-red-50 text-red-700 rounded-xl border border-red-200 mt-8 shadow-sm">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-lg mb-1">Database Index Required</p>
            <p className="text-sm mb-4 leading-relaxed">{errorMessage}</p>
            
            {indexLink && (
              <div className="bg-white p-4 rounded-lg border border-red-100 shadow-sm">
                <p className="text-sm font-medium mb-3 text-slate-700">Click the button below to auto-generate the required index in your Firebase console. It will take 3-5 minutes to build.</p>
                <a 
                  href={indexLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors"
                >
                  Create Index in Firebase Console
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const toggleChapter = (chapterId: string) => {
    const chapterTopics = topics.filter(t => t.parentId === chapterId).map(t => t.id);
    if (chapterTopics.length === 0) return; // Ignore if no topics
    
    const allSelected = chapterTopics.every(id => selectedTopics.has(id));
    const newSelected = new Set(selectedTopics);
    if (allSelected) {
      chapterTopics.forEach(id => newSelected.delete(id));
    } else {
      chapterTopics.forEach(id => newSelected.add(id));
    }
    setSelectedTopics(newSelected);
  };

  const toggleTopic = (topicId: string) => {
    const newSelected = new Set(selectedTopics);
    if (newSelected.has(topicId)) {
      newSelected.delete(topicId);
    } else {
      newSelected.add(topicId);
    }
    setSelectedTopics(newSelected);
  };

  const toggleAccordion = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) newExpanded.delete(chapterId);
    else newExpanded.add(chapterId);
    setExpandedChapters(newExpanded);
  };

  const handleCreateChallenge = async () => {
    if (!user || !userProfile) return;
    setError('');
    
    if (!subjectId) {
      setError('Please select a subject');
      return;
    }
    
    let oppId = 'random_user';
    let oppName = 'Random Opponent';
    let oppAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=Random`;
    
    if (mode === 'friend') {
      if (!opponentIdInput) {
        setError("Please enter a friend's ID");
        return;
      }
      oppId = opponentIdInput;
      oppName = 'Friend';
      // In a real app, you'd fetch the friend's profile to get their name/avatar
    }
    
    setCreating(true);
    try {
      const challengeId = await createChallenge(
        user.uid,
        userProfile.displayName || user.displayName || 'Anonymous',
        userProfile.photoURL || user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        oppId,
        oppName,
        oppAvatar,
        subjectId,
        mode,
        parseInt(questionCount),
        userProfile.classId,
        Array.from(selectedTopics)
      );
      
      setIsNewModalOpen(false);
      
      // Update local state temporarily for UX
      if (mode === 'public') {
        setActiveTab('public');
      } else {
        setActiveTab('sent');
      }
    } catch (err: any) {
      if (err.message && err.message.includes('requires an index')) {
        setIsNewModalOpen(false);
        setPageError(err.message);
      } else {
        setError(err.message || "Failed to create challenge");
      }
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  const incoming = challenges.filter(c => c.opponentId === user?.uid && c.status === 'pending');
  const sent = challenges.filter(c => c.challengerId === user?.uid && c.status === 'pending');
  const completed = challenges.filter(c => c.status === 'completed' || c.status === 'expired' || c.status === 'declined');

  // Also filter out public challenges created by the user themselves from the public tab so they don't join their own challenge.
  const filteredPublic = publicChallenges.filter(c => c.challengerId !== user?.uid);

  const displayList = activeTab === 'incoming' ? incoming : activeTab === 'sent' ? sent : activeTab === 'completed' ? completed : filteredPublic;

  const handleJoinPublic = async (challengeId: string) => {
    try {
      await acceptPublicChallenge(
        challengeId, 
        user!.uid, 
        user!.displayName || "Unknown", 
        user!.photoURL || `https://picsum.photos/seed/${user!.uid}/40/40`
      );
      router.push(`/dashboard/challenges/${challengeId}`);
    } catch (err: any) {
      alert(err.message || "Failed to join public challenge.");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 text-slate-800 dark:text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Swords className="w-6 h-6 text-green-600" /> Challenge Hub
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Compete with friends and earn XP!</p>
        </div>
        
        <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-green-500/25 transition-all">
              <Plus className="w-4 h-4 mr-2" /> New Challenge
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto show-scrollbar">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Swords className="w-5 h-5 text-green-500" /> Create a Challenge
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-semibold">Matchmaking Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant={mode === 'random' ? 'default' : 'outline'} 
                    onClick={() => setMode('random')}
                    className={mode === 'random' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
                  >
                    <Search className="w-4 h-4 mr-2 hidden sm:block" /> Random
                  </Button>
                  <Button 
                    variant={mode === 'public' ? 'default' : 'outline'} 
                    onClick={() => setMode('public')}
                    className={mode === 'public' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
                  >
                    <Globe className="w-4 h-4 mr-2 hidden sm:block" /> Public
                  </Button>
                  <Button 
                    variant={mode === 'friend' ? 'default' : 'outline'} 
                    onClick={() => setMode('friend')}
                    className={mode === 'friend' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
                  >
                    <UserIcon className="w-4 h-4 mr-2 hidden sm:block" /> Friend
                  </Button>
                </div>
              </div>

              {mode === 'friend' && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Friend's User ID</label>
                  <Input 
                    placeholder="Enter friend's User ID..." 
                    value={opponentIdInput}
                    onChange={(e) => setOpponentIdInput(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold">Subject</label>
                  {subjectId && (
                    <button 
                      onClick={() => { setSubjectId(''); setSelectedTopics(new Set()); }}
                      className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md transition-colors"
                    >
                      Change Subject
                    </button>
                  )}
                </div>
                <div className={`grid grid-cols-1 gap-2 ${!subjectId ? 'max-h-[220px] overflow-y-auto pr-1 show-scrollbar' : ''}`}>
                  {subjects.length > 0 ? subjects
                    .filter(s => !subjectId || s.id === subjectId)
                    .map(s => (
                    <button
                      key={s.id}
                      onClick={() => !subjectId && setSubjectId(s.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-200 ${
                        subjectId === s.id 
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/10 shadow-sm' 
                          : 'border-slate-200 dark:border-slate-800 hover:border-green-200 dark:hover:border-green-900/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          subjectId === s.id ? 'bg-green-500 text-white shadow-md shadow-green-500/20' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                        }`}>
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <p className={`font-medium leading-tight ${subjectId === s.id ? 'text-green-700 dark:text-green-400' : 'text-slate-700 dark:text-slate-200'}`}>
                            {s.title}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Class Textbook</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        subjectId === s.id ? 'border-green-500 bg-green-500' : 'border-slate-300 dark:border-slate-700'
                      }`}>
                        {subjectId === s.id && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </button>
                  )) : (
                    <div className="flex flex-col items-center justify-center py-6 border rounded-xl border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                      <BookOpen className="w-6 h-6 text-slate-400 mb-2" />
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No textbooks found</p>
                      <p className="text-xs text-slate-500 mt-1">Check your profile class</p>
                    </div>
                  )}
                </div>
              </div>

              {subjectId && (
                <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold">Topics (Optional)</label>
                    {selectedTopics.size > 0 && (
                      <span className="text-[10px] font-bold text-green-700 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                        {selectedTopics.size} Selected
                      </span>
                    )}
                  </div>
                  
                  {loadingTopics ? (
                    <div className="flex flex-col items-center justify-center py-6 border rounded-xl border-dashed">
                      <Loader2 className="w-6 h-6 text-slate-400 animate-spin mb-2" />
                      <p className="text-sm text-slate-500">Loading topics...</p>
                    </div>
                  ) : chapters.length > 0 ? (
                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 show-scrollbar">
                      {chapters.map(chapter => {
                        const chapterTopics = topics.filter(t => t.parentId === chapter.id);
                        if (chapterTopics.length === 0) return null;
                        
                        const allSelected = chapterTopics.every(t => selectedTopics.has(t.id));
                        const someSelected = chapterTopics.some(t => selectedTopics.has(t.id));
                        const isExpanded = expandedChapters.has(chapter.id);
                        
                        return (
                          <div key={chapter.id} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900/20">
                            {/* Chapter Header */}
                            <div className="flex items-center justify-between p-3 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                              <button 
                                onClick={() => toggleChapter(chapter.id)} 
                                className="flex items-center gap-3 flex-1 text-left"
                              >
                                {allSelected ? (
                                  <CheckSquare className="w-5 h-5 text-green-500 shrink-0" />
                                ) : someSelected ? (
                                  <div className="w-5 h-5 shrink-0 rounded-[3px] border-2 border-green-500 bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                    <div className="w-2.5 h-0.5 bg-green-500 rounded-full" />
                                  </div>
                                ) : (
                                  <Square className="w-5 h-5 text-slate-400 shrink-0" />
                                )}
                                <span className="font-medium text-slate-800 dark:text-slate-200 text-sm">{chapter.title || chapter.name}</span>
                              </button>
                              
                              <button onClick={() => toggleAccordion(chapter.id)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg ml-2 shrink-0">
                                {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                              </button>
                            </div>
                            
                            {/* Topics List */}
                            {isExpanded && (
                              <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-2 space-y-1">
                                {chapterTopics.map(topic => (
                                  <button
                                    key={topic.id}
                                    onClick={() => toggleTopic(topic.id)}
                                    className="flex items-center gap-3 w-full p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg text-left transition-colors"
                                  >
                                    {selectedTopics.has(topic.id) ? (
                                      <CheckSquare className="w-4 h-4 text-green-500 shrink-0" />
                                    ) : (
                                      <Square className="w-4 h-4 text-slate-300 dark:text-slate-700 shrink-0" />
                                    )}
                                    <span className={`text-[13px] leading-tight ${selectedTopics.has(topic.id) ? 'text-slate-900 dark:text-slate-100 font-medium' : 'text-slate-600 dark:text-slate-400'}`}>
                                      {topic.title || topic.name}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 border rounded-xl border-dashed">
                      <p className="text-sm text-slate-500">No specific topics found.</p>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold">Number of Questions</label>
                <Select value={questionCount} onValueChange={setQuestionCount}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Questions (Blitz)</SelectItem>
                    <SelectItem value="10">10 Questions (Standard)</SelectItem>
                    <SelectItem value="15">15 Questions (Battle)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleCreateChallenge} 
                disabled={creating}
                className="w-full bg-green-600 hover:bg-green-700 text-white mt-4"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Start Challenge!'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => setActiveTab('incoming')}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'incoming' ? 'border-green-500 text-green-600 dark:text-green-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Incoming {incoming.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{incoming.length}</span>}
        </button>
        <button 
          onClick={() => setActiveTab('sent')}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'sent' ? 'border-green-500 text-green-600 dark:text-green-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Sent {sent.length > 0 && <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] px-1.5 py-0.5 rounded-full">{sent.length}</span>}
        </button>
        <button 
          onClick={() => setActiveTab('public')}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'public' ? 'border-green-500 text-green-600 dark:text-green-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Public {filteredPublic.length > 0 && <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{filteredPublic.length}</span>}
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'completed' ? 'border-green-500 text-green-600 dark:text-green-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Completed
        </button>
      </div>

      {/* Challenge List */}
      <div className="space-y-3">
        {displayList.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <Swords className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
            <p className="font-medium text-slate-600 dark:text-slate-400">No {activeTab} challenges found.</p>
            {activeTab === 'incoming' && (
              <Button variant="outline" className="mt-4" onClick={() => setIsNewModalOpen(true)}>
                Challenge Someone
              </Button>
            )}
          </div>
        ) : (
          displayList.map(challenge => {
            const isChallenger = challenge.challengerId === user?.uid;
            const otherUser = isChallenger ? { name: challenge.opponentName, avatar: challenge.opponentAvatar } : { name: challenge.challengerName, avatar: challenge.challengerAvatar };
            
            return (
              <Card key={challenge.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img src={otherUser.avatar} alt="avatar" className="w-12 h-12 rounded-full border-2 border-slate-100 dark:border-slate-800" />
                    {challenge.mode === 'random' && (
                      <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-0.5">
                        <Search className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{otherUser.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {subjects.find(s => s.id === challenge.subjectId)?.title || 'Subject'}</span>
                      <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-amber-500" /> {challenge.rewardXp} XP</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeTab === 'incoming' && (
                    <Button onClick={() => router.push(`/dashboard/challenges/${challenge.id}`)} className="bg-green-600 hover:bg-green-700 text-white shadow-sm w-full sm:w-auto">
                      Accept & Play
                    </Button>
                  )}
                  {activeTab === 'public' && (
                    <Button onClick={() => handleJoinPublic(challenge.id!)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm w-full sm:w-auto">
                      <Globe className="w-4 h-4 mr-2" /> Join Challenge
                    </Button>
                  )}
                  {activeTab === 'sent' && (
                    <Button variant="outline" disabled className="w-full sm:w-auto border-dashed">
                      <Clock className="w-4 h-4 mr-2" /> Waiting...
                    </Button>
                  )}
                  {activeTab === 'completed' && (
                    <Button variant="outline" onClick={() => router.push(`/dashboard/challenges/${challenge.id}/result`)} className="w-full sm:w-auto">
                      View Results
                    </Button>
                  )}
                </div>
              </Card>
            )
          })
        )}
      </div>

    </div>
  );
}
