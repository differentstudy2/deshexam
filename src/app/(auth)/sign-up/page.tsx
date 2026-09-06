"use client";

import { useEffect, useRef } from "react";
import { useAuthDialog } from "@/hooks/use-auth-dialog";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function SignUpPage() {
  const { openAuthDialog, isOpen } = useAuthDialog();
  const { user, loading } = useAuth();
  const router = useRouter();
  const hasOpened = useRef(false);

  useEffect(() => {
    if (loading) return;
    
    if (user) {
      router.replace("/dashboard");
      return;
    }

    if (!hasOpened.current) {
      setTimeout(() => openAuthDialog("sign-up"), 100);
      hasOpened.current = true;
    }
  }, [openAuthDialog, user, loading, router]);

  useEffect(() => {
    if (hasOpened.current && !isOpen && !loading && !user) {
      router.push("/");
    }
  }, [isOpen, router, loading, user]);

  if (loading || user) {
      return (
        <div className="flex items-center justify-center min-h-[70vh]">
          <p className="text-slate-500">Redirecting...</p>
        </div>
      );
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="text-center space-y-4">
        <p className="text-muted-foreground">Opening secure sign-up...</p>
        <Button variant="outline" onClick={() => openAuthDialog("sign-up")}>
          Click here if the popup didn't open
        </Button>
      </div>
    </div>
  );
}
