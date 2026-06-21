
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
import { useFirebaseAuth } from "@/hooks/use-firebase";
import { updateUserProfile, getUserProfile } from "@/lib/firebase/firestore";

interface AuthContextType {
  user: User | null;
  userProfile: any | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
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
            role: 'user',
            isOnboarded: false,
            profileType: null,
            boardId: null,
            classId: null,
        };
        await updateUserProfile(user.uid, userProfile);
    }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useFirebaseAuth();
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const signUp = async (email: string, password: string) => {
    if (!auth) throw new Error("Auth service is not available");
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await handleNewUser(credential);
    // Automatically send verification email upon sign up
    await sendEmailVerification(credential.user);
    return credential;
  };

  const signIn = (email: string, password: string) => {
    if (!auth) throw new Error("Auth service is not available");
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    if (!auth) throw new Error("Auth service is not available");
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);
    await handleNewUser(credential);
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
    return signOut(auth);
  };

  useEffect(() => {
    if (!auth) {
        // Auth might not be initialized yet, so we wait.
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
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

    return () => unsubscribe();
  }, [auth]);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signUp, signIn, signInWithGoogle, signInWithGoogleOneTap, resetPassword, confirmPasswordReset: confirmPasswordResetAction, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
