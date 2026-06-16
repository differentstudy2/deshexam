"use client";

import { useEffect, useRef } from "react";
import { useAuthDialog } from "@/hooks/use-auth-dialog";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  const { openAuthDialog, isOpen } = useAuthDialog();
  const router = useRouter();
  const hasOpened = useRef(false);

  useEffect(() => {
    if (!hasOpened.current) {
      setTimeout(() => openAuthDialog("sign-in"), 100);
      hasOpened.current = true;
    }
  }, [openAuthDialog]);

  useEffect(() => {
    if (hasOpened.current && !isOpen) {
      router.push("/");
    }
  }, [isOpen, router]);

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="text-center space-y-4">
        <p className="text-muted-foreground">Opening secure sign-in...</p>
        <Button variant="outline" onClick={() => openAuthDialog("sign-in")}>
          Click here if the popup didn't open
        </Button>
      </div>
    </div>
  );
}
