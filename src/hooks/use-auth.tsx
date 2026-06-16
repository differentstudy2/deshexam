
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
} from "firebase/auth";
import { useFirebaseAuth } from "@/hooks/use-firebase";
import { updateUserProfile } from "@/lib/firebase/firestore";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signInWithGoogleOneTap: (credentialResponse: any) => Promise<any>;
  logOut: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  signInWithGoogle: async () => {},
  signInWithGoogleOneTap: async () => {},
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
        };
        await updateUserProfile(user.uid, userProfile);
    }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useFirebaseAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signUp = async (email: string, password: string) => {
    if (!auth) throw new Error("Auth service is not available");
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await handleNewUser(credential);
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

  const logOut = () => {
    if (!auth) throw new Error("Auth service is not available");
    return signOut(auth);
  };

  useEffect(() => {
    if (!auth) {
        // Auth might not be initialized yet, so we wait.
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signInWithGoogle, signInWithGoogleOneTap, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
