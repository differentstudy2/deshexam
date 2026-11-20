import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export function useSaveDocument() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [savedDocs, setSavedDocs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSavedDocs([]);
      setLoading(false);
      return;
    }
    const fetchSaved = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setSavedDocs(userDoc.data().savedDocuments || []);
        }
      } catch (error) {
        console.error("Failed to load saved docs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, [user]);

  const toggleSave = async (docId: string) => {
    if (!user) {
      toast({ title: "Login Required", description: "Please sign in to save documents.", variant: "destructive" });
      return;
    }
    if (!docId) {
      console.error("No document ID provided to toggleSave");
      return;
    }
    const isSavedLocally = savedDocs.includes(docId);
    
    // Optimistic UI update
    setSavedDocs(prev => isSavedLocally ? prev.filter(id => id !== docId) : [...prev, docId]);

    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        savedDocuments: isSavedLocally ? arrayRemove(docId) : arrayUnion(docId)
      }, { merge: true });
      
      if (!isSavedLocally) {
        toast({ title: "Saved!", description: "Document added to your saved list." });
      }
    } catch (error) {
      // Revert UI on failure
      setSavedDocs(prev => isSavedLocally ? [...prev, docId] : prev.filter(id => id !== docId));
      toast({ title: "Error", description: "Failed to update saved documents.", variant: "destructive" });
      console.error("Toggle save error", error);
    }
  };

  const isSaved = (docId: string) => {
    if (!docId) return false;
    return savedDocs.includes(docId);
  };

  return { savedDocs, isSaved, toggleSave, loading };
}
