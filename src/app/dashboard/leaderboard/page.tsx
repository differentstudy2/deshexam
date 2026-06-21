'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Clock, Star, Info, Crown, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

const getSuffix = (i: number) => {
  const j = i % 10, k = i % 100;
  if (j == 1 && k != 11) return "st";
  if (j == 2 && k != 12) return "nd";
  if (j == 3 && k != 13) return "rd";
  return "th";
}

export default function LeaderboardPage() {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classTitle, setClassTitle] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      if (!userProfile) {
        // If there's no userProfile, it might be loading, or unauthenticated.
        // In a real scenario useAuth will redirect if not authenticated.
        return;
      }
      
      try {
        let q;
        
        // If student and has class, filter by class. Otherwise, global leaderboard.
        if (userProfile.profileType === 'student' && userProfile.classId) {
          try {
            const classDoc = await getDoc(doc(db, 'taxonomy_nodes', userProfile.classId));
            if (classDoc.exists() && classDoc.data().title) {
              setClassTitle(classDoc.data().title);
            }
          } catch (e) {
            console.error('Error fetching class title', e);
          }

          q = query(
            collection(db, 'users'),
            where('classId', '==', userProfile.classId),
            orderBy('xp', 'desc'),
            limit(100)
          );
        } else {
          q = query(
            collection(db, 'users'),
            orderBy('xp', 'desc'),
            limit(100)
          );
        }

        const snapshot = await getDocs(q);
        const fetchedUsers = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        let allUsers = [...fetchedUsers];
        
        // If the leaderboard has fewer than 10 users, pad it with realistic dummy data
        if (allUsers.length < 10) {
          const fakeUsers = [
            { id: 'fake1', displayName: 'Rahim Uddin', xp: 4500, photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahim' },
            { id: 'fake2', displayName: 'Nusrat Jahan', xp: 4200, photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nusrat' },
            { id: 'fake3', displayName: 'Arif Hossain', xp: 3800, photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arif' },
            { id: 'fake4', displayName: 'Sumaiya Akter', xp: 3100, photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sumaiya' },
            { id: 'fake5', displayName: 'Tanvir Ahmed', xp: 2950, photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tanvir' },
            { id: 'fake6', displayName: 'Jahanur Islam', xp: 2800, photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jahanur' },
            { id: 'fake7', displayName: 'Sadia Rahman', xp: 2100, photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sadia' },
            { id: 'fake8', displayName: 'Kamrul Hasan', xp: 1950, photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kamrul' },
            { id: 'fake9', displayName: 'Mahiya Mahi', xp: 1800, photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mahiya' },
            { id: 'fake10', displayName: 'Rakib Hasan', xp: 1500, photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rakib' },
          ];
          
          allUsers = [...allUsers, ...fakeUsers].sort((a: any, b: any) => (b.xp || 0) - (a.xp || 0));
        }

        setUsers(allUsers);
      } catch (err: any) {
        console.error(err);
        if (err.message && err.message.includes('requires an index')) {
          // Provide a clickable link or a clear message
          setError(err.message);
        } else {
          setError("Failed to load leaderboard.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [userProfile]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error) {
    let errorMessage = error;
    let indexLink = null;
    if (error.includes('https://console.firebase.google.com/')) {
      const urlMatch = error.match(/(https:\/\/console\.firebase\.google\.com\/[^\s]+)/);
      if (urlMatch) {
        indexLink = urlMatch[0];
        errorMessage = error.replace(indexLink, '').replace('You can create it here: ', '');
      }
    }

    return (
      <div className="w-full max-w-3xl mx-auto p-6 bg-red-50 text-red-700 rounded-xl border border-red-200 mt-8 shadow-sm">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
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

  const topThree = users.slice(0, 3);
  const rankList = users.slice(3);

  return (
    <div className="w-full max-w-3xl mx-auto pb-12 text-slate-800 dark:text-slate-100">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 px-4 sm:px-0">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          {userProfile?.profileType === 'student' ? `${classTitle || 'Class'} Leaderboard` : 'Global Leaderboard'}
        </h1>
      </div>

      <div className="space-y-4">
        
        {/* Bronze League Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#f99d1c] to-[#e47900] shadow-md p-6 flex flex-col items-center justify-center text-white min-h-[220px]">
          
          <div className="absolute top-4 right-4">
            <Dialog>
              <DialogTrigger asChild>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-xs font-semibold transition-colors">
                  <Star className="w-3.5 h-3.5 fill-current" /> Rules / Tiers
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                    <Crown className="w-6 h-6 text-amber-500" /> Leagues & Rules
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 text-slate-600 dark:text-slate-300 py-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500" /> How to earn XP
                    </h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Complete mock tests and daily challenges to earn XP.</li>
                      <li>High accuracy and speed grant bonus XP multipliers.</li>
                      <li>Reviewing your mistakes gives you small XP rewards.</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">The League System</h3>
                    <p className="text-sm">Compete with others in your class. At the end of the week, top players advance to the next league.</p>
                    
                    <div className="grid gap-3 mt-2">
                      <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900/30">
                         <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c98e6a] to-[#804f32] flex flex-shrink-0 items-center justify-center border-2 border-[#ffb142]">
                           <Crown className="w-5 h-5 text-white" />
                         </div>
                         <div>
                           <div className="font-bold text-amber-900 dark:text-amber-500">Bronze League</div>
                           <div className="text-xs text-amber-700 dark:text-amber-600">Starting point. Top 20% advance to Silver.</div>
                         </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                         <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e2e8f0] to-[#94a3b8] flex flex-shrink-0 items-center justify-center border-2 border-slate-400">
                           <Crown className="w-5 h-5 text-slate-700" />
                         </div>
                         <div>
                           <div className="font-bold text-slate-700 dark:text-slate-300">Silver League</div>
                           <div className="text-xs text-slate-500 dark:text-slate-400">Top 15% advance to Gold. Bottom 20% demoted.</div>
                         </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-900/30">
                         <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#fef08a] to-[#eab308] flex flex-shrink-0 items-center justify-center border-2 border-yellow-400">
                           <Crown className="w-5 h-5 text-yellow-800" />
                         </div>
                         <div>
                           <div className="font-bold text-yellow-800 dark:text-yellow-500">Gold League</div>
                           <div className="text-xs text-yellow-700 dark:text-yellow-600">Top 10% advance to Diamond. Bottom 20% demoted.</div>
                         </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-cyan-50 dark:bg-cyan-950/20 rounded-lg border border-cyan-200 dark:border-cyan-900/30">
                         <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#67e8f9] to-[#06b6d4] flex flex-shrink-0 items-center justify-center border-2 border-cyan-300">
                           <Crown className="w-5 h-5 text-white" />
                         </div>
                         <div>
                           <div className="font-bold text-cyan-800 dark:text-cyan-500">Diamond League</div>
                           <div className="text-xs text-cyan-700 dark:text-cyan-600">The Elite. Stay in the top 50% to avoid demotion.</div>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-4 mt-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#c98e6a] to-[#804f32] shadow-inner flex items-center justify-center border-4 border-[#ffb142]">
              <Crown className="w-8 h-8 text-[#5c3722]" />
            </div>
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm shadow-inner border border-white/30"></div>
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm shadow-inner border border-white/30"></div>
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm shadow-inner border border-white/30"></div>
          </div>

          <h2 className="text-2xl font-bold mb-1">Bronze League</h2>
          <div className="flex items-center gap-1 text-xs font-medium text-white/90 mb-4">
            Top 20% advance to next League <Info className="w-3.5 h-3.5" />
          </div>

          <div className="flex items-center gap-1.5 px-4 py-1.5 bg-white text-[#e47900] rounded-full text-xs font-bold shadow-sm">
            <Clock className="w-4 h-4" /> 5 days Remaining
          </div>
        </div>

        {/* Top 3 List */}
        {topThree.length > 0 ? (
          <div className="space-y-2 mt-4 px-2 sm:px-0">
            {/* Rank 1 */}
            <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 flex items-center p-3 rounded-xl shadow-sm">
              <div className="w-8 flex justify-center text-amber-500">
                <Star className="w-6 h-6 fill-amber-500" />
              </div>
              <div className="flex-1 flex items-center gap-3 ml-2">
                <img src={topThree[0].photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${topThree[0].id}`} alt="" className="w-10 h-10 rounded-full border-2 border-amber-400 bg-white" />
                <span className="font-bold text-[15px] text-slate-800 dark:text-slate-200">{topThree[0].displayName || 'Anonymous User'}</span>
              </div>
              <div className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-500 text-[15px]">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" /> {topThree[0].xp || 0} XP
              </div>
            </Card>

            {/* Rank 2 & 3 */}
            {topThree.slice(1).map((user, index) => {
              const rank = index + 2;
              return (
                <Card key={user.id} className="bg-orange-50/50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/30 flex items-center p-3 rounded-xl shadow-sm">
                  <div className="w-8 flex justify-center font-bold text-slate-500 dark:text-slate-400">
                    {rank}{getSuffix(rank)}
                  </div>
                  <div className="flex-1 flex items-center gap-3 ml-2">
                    <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} alt="" className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 shadow-sm bg-white" />
                    <span className="font-bold text-[14px] text-slate-700 dark:text-slate-300">{user.displayName || 'Anonymous User'}</span>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-500 text-[14px]">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" /> {user.xp || 0} XP
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">No users found on this leaderboard.</div>
        )}

        {/* Full Rank List (Ranks 4+) */}
        {rankList.length > 0 && (
          <div className="px-2 sm:px-0 mt-6 space-y-1">
            {rankList.map((user, index) => {
              const rank = index + 4;
              
              return (
                <div key={user.id} className="flex items-center p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                  <div className="w-8 flex justify-center text-[13px] font-bold text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                    {rank}{getSuffix(rank)}
                  </div>
                  <div className="flex-1 flex items-center gap-3 ml-2">
                    <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs overflow-hidden shrink-0 shadow-sm border border-slate-100 dark:border-slate-800 bg-white">
                      <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="font-medium text-[14px] text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors truncate">
                      {user.displayName || 'Anonymous User'}
                    </span>
                  </div>
                  <div className="font-bold text-[13px] text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                    {user.xp || 0} XP
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
