'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { Challenge, getUserChallenges, createChallenge } from '@/lib/firebase/challenges';
import { getTaxonomyNodes } from '@/lib/firebase/question-bank';
import { Swords, Trophy, Clock, CheckCircle, XCircle, Search, User as UserIcon, Loader2, Sparkles, Plus, AlertCircle, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ChallengesHubPage() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'incoming' | 'sent' | 'completed'>('incoming');
  
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  
  // New Challenge Form State
  const [mode, setMode] = useState<'friend' | 'random'>('random');
  const [subjectId, setSubjectId] = useState('');
  const [questionCount, setQuestionCount] = useState('5');
  const [opponentIdInput, setOpponentIdInput] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const [chData, subjData] = await Promise.all([
          getUserChallenges(user.uid),
          getTaxonomyNodes('subject')
        ]);
        setChallenges(chData);
        setSubjects(subjData);
      } catch (err) {
        console.error("Failed to load challenges", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

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
        parseInt(questionCount)
      );
      
      setIsNewModalOpen(false);
      // Navigate straight to the arena
      router.push(`/dashboard/challenges/${challengeId}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create challenge');
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

  const displayList = activeTab === 'incoming' ? incoming : activeTab === 'sent' ? sent : completed;

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
          <DialogContent className="sm:max-w-[425px]">
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
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant={mode === 'random' ? 'default' : 'outline'} 
                    onClick={() => setMode('random')}
                    className={mode === 'random' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
                  >
                    <Search className="w-4 h-4 mr-2" /> Random
                  </Button>
                  <Button 
                    variant={mode === 'friend' ? 'default' : 'outline'} 
                    onClick={() => setMode('friend')}
                    className={mode === 'friend' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
                  >
                    <UserIcon className="w-4 h-4 mr-2" /> Friend
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

              <div className="space-y-2">
                <label className="text-sm font-semibold">Subject</label>
                <Select value={subjectId} onValueChange={setSubjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject..." />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
