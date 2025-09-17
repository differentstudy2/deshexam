"use client";

import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { app } from "@/lib/firebase/client";

const auth = getAuth(app);

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  logOut: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  signInWithGoogle: async () => {},
  logOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signUp = (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const signIn = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const logOut = () => {
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signInWithGoogle, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
