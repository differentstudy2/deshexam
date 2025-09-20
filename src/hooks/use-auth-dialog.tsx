
"use client";

import { createContext, useState, useContext, ReactNode, useCallback } from "react";

type AuthDialogVariant = "sign-in" | "sign-up";

interface AuthDialogContextType {
  isOpen: boolean;
  variant: AuthDialogVariant;
  openAuthDialog: (variant: AuthDialogVariant) => void;
  closeAuthDialog: () => void;
  switchVariant: () => void;
}

const AuthDialogContext = createContext<AuthDialogContextType | undefined>(undefined);

export const AuthDialogProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [variant, setVariant] = useState<AuthDialogVariant>("sign-in");

  const openAuthDialog = useCallback((v: AuthDialogVariant) => {
    setVariant(v);
    setIsOpen(true);
  }, []);

  const closeAuthDialog = useCallback(() => {
    setIsOpen(false);
  }, []);

  const switchVariant = useCallback(() => {
    setVariant(prev => prev === "sign-in" ? "sign-up" : "sign-in");
  }, []);

  return (
    <AuthDialogContext.Provider value={{ isOpen, variant, openAuthDialog, closeAuthDialog, switchVariant }}>
      {children}
    </AuthDialogContext.Provider>
  );
};

export const useAuthDialog = () => {
  const context = useContext(AuthDialogContext);
  if (context === undefined) {
    throw new Error("useAuthDialog must be used within an AuthDialogProvider");
  }
  return context;
};
