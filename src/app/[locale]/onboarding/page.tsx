"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase/client";
import { collection, query, where, getDocs } from "firebase/firestore";
import { updateUserProfile } from "@/lib/firebase/firestore";
import { TaxonomyNode } from "@/lib/firebase/taxonomy";
import { GraduationCap, Briefcase, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OnboardingPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [profileType, setProfileType] = useState<'student' | 'job' | null>(null);
  
  const [boards, setBoards] = useState<TaxonomyNode[]>([]);
  const [classes, setClasses] = useState<TaxonomyNode[]>([]);
  
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  
  const [isFetchingTaxonomy, setIsFetchingTaxonomy] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Redirect logic
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/auth/login");
      } else if (userProfile?.isOnboarded) {
        router.push("/dashboard");
      }
    }
  }, [user, userProfile, authLoading, router]);

  // Fetch Boards
  useEffect(() => {
    async function fetchBoards() {
      setIsFetchingTaxonomy(true);
      try {
        const q = query(
          collection(db, "taxonomy_nodes"), 
          where("track", "==", "academic"), 
          where("type", "==", "board")
        );
        const snap = await getDocs(q);
        const fetchedBoards = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TaxonomyNode));
        fetchedBoards.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
        setBoards(fetchedBoards);
      } catch (err) {
        console.error(err);
      } finally {
        setIsFetchingTaxonomy(false);
      }
    }
    fetchBoards();
  }, []);

  // Fetch Classes when Board changes
  useEffect(() => {
    async function fetchClasses() {
      if (!selectedBoardId) {
        setClasses([]);
        return;
      }
      setIsFetchingTaxonomy(true);
      try {
        const q = query(
          collection(db, "taxonomy_nodes"), 
          where("parentId", "==", selectedBoardId), 
          where("type", "==", "class")
        );
        const snap = await getDocs(q);
        const fetchedClasses = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TaxonomyNode));
        fetchedClasses.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
        setClasses(fetchedClasses);
      } catch (err) {
        console.error(err);
      } finally {
        setIsFetchingTaxonomy(false);
      }
    }
    fetchClasses();
  }, [selectedBoardId]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateUserProfile(user.uid, {
        isOnboarded: true,
        profileType,
        boardId: selectedBoardId || null,
        classId: selectedClassId || null,
      });
      // Force reload to get updated context and go to dashboard
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      setIsSaving(false);
    }
  };

  if (authLoading || (user && userProfile?.isOnboarded)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white text-center">
          <h1 className="text-3xl font-bold mb-2">Welcome to DeshExam! 🎉</h1>
          <p className="text-purple-100">Let's personalize your learning experience.</p>
        </div>

        <div className="p-8">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-slate-800 text-center mb-8">What are you preparing for?</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => setProfileType('student')}
                  className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-4 hover:border-purple-500 hover:bg-purple-50
                    ${profileType === 'student' ? 'border-purple-600 bg-purple-50 ring-4 ring-purple-100' : 'border-slate-200'}`}
                >
                  <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                    <GraduationCap size={32} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">School / College</h3>
                    <p className="text-sm text-slate-500 mt-1">Board exams, term exams</p>
                  </div>
                </button>

                <button
                  onClick={() => setProfileType('job')}
                  className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-4 hover:border-indigo-500 hover:bg-indigo-50
                    ${profileType === 'job' ? 'border-indigo-600 bg-indigo-50 ring-4 ring-indigo-100' : 'border-slate-200'}`}
                >
                  <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <Briefcase size={32} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">Job Entrance</h3>
                    <p className="text-sm text-slate-500 mt-1">SSC, UPSC, State PSC</p>
                  </div>
                </button>
              </div>

              <div className="flex justify-end mt-8">
                <Button 
                  disabled={!profileType} 
                  onClick={() => {
                    if (profileType === 'job') {
                      handleSave(); // Option chosen for now
                    } else {
                      setStep(2);
                    }
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-8 py-6"
                >
                  {profileType === 'job' ? 'Finish Setup' : 'Continue'} <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && profileType === 'student' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-slate-800 text-center mb-2">Select your Academic Details</h2>
              <p className="text-center text-slate-500 text-sm mb-8">This helps us show you exactly what you need.</p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Select Board</label>
                  <select 
                    className="w-full p-4 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    value={selectedBoardId}
                    onChange={(e) => {
                      setSelectedBoardId(e.target.value);
                      setSelectedClassId(''); // Reset class when board changes
                    }}
                    disabled={isFetchingTaxonomy}
                  >
                    <option value="">-- Choose Board --</option>
                    {boards.map(board => (
                      <option key={board.id} value={board.id}>{board.title}{board.acronym ? ` (${board.acronym})` : ''}</option>
                    ))}
                  </select>
                </div>

                {selectedBoardId && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-4">
                    <label className="text-sm font-bold text-slate-700">Select Class</label>
                    <select 
                      className="w-full p-4 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                      value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                      disabled={isFetchingTaxonomy}
                    >
                      <option value="">-- Choose Class --</option>
                      {classes.map(cls => (
                        <option key={cls.id} value={cls.id}>{cls.title}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-between mt-8">
                <Button variant="ghost" onClick={() => setStep(1)} className="rounded-full">Back</Button>
                <Button 
                  disabled={!selectedBoardId || !selectedClassId || isSaving} 
                  onClick={handleSave}
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-8 py-6"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  Finish Setup
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
