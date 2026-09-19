
"use client";

import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  UserCredential,
  sendPasswordResetEmail,
  confirmPasswordReset,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc, onSnapshot, serverTimestamp, getDoc } from "firebase/firestore";
import { useFirebaseAuth, useFirestore } from "@/hooks/use-firebase";
import { db } from "@/lib/firebase/client";
import {
  getUserProfile,
  updateUserProfile,
  checkDailyStreak,
  processReferral,
} from "@/lib/firebase/firestore";

interface AuthContextType {
  user: User | null;
  userProfile: any | null;
  loading: boolean;
  signUp: (email: string, password: string, referralCode?: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithGoogle: (referralCode?: string) => Promise<any>;
  signInWithGoogleOneTap: (credentialResponse: any) => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
  confirmPasswordReset: (oobCode: string, newPassword: string) => Promise<any>;
  logOut: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  signInWithGoogle: async () => {},
  signInWithGoogleOneTap: async () => {},
  resetPassword: async () => {},
  confirmPasswordReset: async () => {},
  logOut: async () => {},
});

const handleNewUser = async (credential: UserCredential) => {
    const user = credential.user;
    if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
            // Only set these default values for brand new users
            const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            
            const userProfile = {
                displayName: user.displayName || user.email?.split('@')[0] || 'New User',
                email: user.email,
                photoURL: user.photoURL,
                createdAt: new Date(),
                followers: [],
                following: [],
                followersCount: 0,
                followingCount: 0,
                xp: 0,
                achievements: [],
                referralCode: referralCode,
                referralCount: 0,
                currentStreak: 0,
                longestStreak: 0,
                lastActiveDate: null,
                examsTaken: 0,
                perfectExams: 0,
                nightOwlCount: 0,
                earlyBirdCount: 0,
                role: 'user',
                isOnboarded: false,
                profileType: null,
                boardId: null,
                classId: null,
            };
            await updateUserProfile(user.uid, userProfile);
        } else {
            // For existing users, only update their basic info if it changed
            const currentProfile = userDoc.data();
            if (!currentProfile.displayName && user.displayName) {
                await updateUserProfile(user.uid, { displayName: user.displayName });
            }
            if (!currentProfile.photoURL && user.photoURL) {
                await updateUserProfile(user.uid, { photoURL: user.photoURL });
            }
        }
    }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useFirebaseAuth();
  const db = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const signUp = async (email: string, password: string, referralCode?: string) => {
    if (!auth) throw new Error("Auth service is not available");
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await handleNewUser(credential);
    
    // Process referral if provided
    if (referralCode) {
        await processReferral(credential.user.uid, referralCode);
    }
    
    // Automatically send verification email upon sign up
    await sendEmailVerification(credential.user);
    return credential;
  };

  const signIn = (email: string, password: string) => {
    if (!auth) throw new Error("Auth service is not available");
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async (referralCode?: string) => {
    if (!auth) throw new Error("Auth service is not available");
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);
    await handleNewUser(credential);
    
    // Process referral if provided
    if (referralCode) {
        await processReferral(credential.user.uid, referralCode);
    }
    
    return credential;
  };

  const signInWithGoogleOneTap = async (credentialResponse: any) => {
    if (!auth) throw new Error("Auth service is not available");
    const credential = GoogleAuthProvider.credential(credentialResponse.credential);
    const result = await signInWithCredential(auth, credential);
    await handleNewUser(result);
    return result;
  };

  const resetPassword = (email: string) => {
    if (!auth) throw new Error("Auth service is not available");
    return sendPasswordResetEmail(auth, email);
  };

  const confirmPasswordResetAction = (oobCode: string, newPassword: string) => {
    if (!auth) throw new Error("Auth service is not available");
    return confirmPasswordReset(auth, oobCode, newPassword);
  };

  const logOut = () => {
    if (!auth) throw new Error("Auth service is not available");
    if (typeof window !== 'undefined') sessionStorage.removeItem('deshexam_is_admin');
    return signOut(auth);
  };

  useEffect(() => {
    if (!auth || !db) {
        // Auth or DB might not be initialized yet, so we wait.
        return;
    }

    let sessionUnsubscribe: () => void;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Run streak check in background
        await checkDailyStreak(user.uid);
        
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);

        // --- Session Management ---
        try {
          let sessionId = localStorage.getItem("sessionId");
          if (!sessionId) {
            sessionId = Math.random().toString(36).substring(2, 15);
            localStorage.setItem("sessionId", sessionId);
          }
          const userAgent = navigator.userAgent;
          let location = "Unknown Location";
          try {
            const ipRes = await fetch("https://ipapi.co/json/");
            if (ipRes.ok) {
              const ipData = await ipRes.json();
              if (ipData.city && ipData.country_name) {
                location = `${ipData.city}, ${ipData.country_name}`;
              }
            }
          } catch (e) {
            console.warn("Could not fetch location", e);
          }

          const sessionRef = doc(db, `users/${user.uid}/sessions/${sessionId}`);
          
          await setDoc(sessionRef, {
            userAgent,
            location,
            lastActive: serverTimestamp(),
          }, { merge: true });

          sessionUnsubscribe = onSnapshot(sessionRef, (snapshot) => {
            // If the document is deleted (e.g. from another device), log out
            if (!snapshot.exists()) {
              signOut(auth);
              localStorage.removeItem("sessionId");
            }
          });
        } catch (error) {
          console.error("Session registration failed", error);
        }

      } else {
        setUserProfile(null);
        if (sessionUnsubscribe) sessionUnsubscribe();
      }
      setLoading(false);

      if (!user) {
        let attempts = 0;
        const initGoogleGlobal = () => {
          if (typeof window === 'undefined') return;
          if ((window as any).google && (window as any).google.accounts) {
            (window as any).google.accounts.id.initialize({
              client_id: '643911224795-3l0qt8drad3ucfm0tmf8g77cbb972rjq.apps.googleusercontent.com',
              callback: async (response: any) => {
                try {
                  const credential = GoogleAuthProvider.credential(response.credential);
                  const result = await signInWithCredential(auth, credential);
                  await handleNewUser(result);
                } catch (error: any) {
                  console.error("Global One Tap Login Failed:", error);
                }
              },
              auto_select: true,
            });
            // Show the One Tap slide-down globally
            (window as any).google.accounts.id.prompt();
          } else {
            attempts++;
            if (attempts < 20) {
              setTimeout(initGoogleGlobal, 100);
            }
          }
        };
        initGoogleGlobal();
      }
    });

    return () => {
      unsubscribe();
      if (sessionUnsubscribe) sessionUnsubscribe();
    };
  }, [auth, db]);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signUp, signIn, signInWithGoogle, signInWithGoogleOneTap, resetPassword, confirmPasswordReset: confirmPasswordResetAction, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
