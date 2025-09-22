
"use client";

import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AuthProvider } from "@/hooks/use-auth";
import Script from "next/script";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { AuthDialogProvider } from "@/hooks/use-auth-dialog";
import { AuthDialog } from "@/components/feature/auth-dialog";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { messaging } from "@/lib/firebase/client";
import { getToken } from "firebase/messaging";
import { useToast } from "@/hooks/use-toast";
import { addFCMToken } from "@/lib/firebase/firestore";


const FirebaseMessagingProvider = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();

  useEffect(() => {
    const requestPermission = async () => {
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator && messaging) {
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            const currentToken = await getToken(messaging, { vapidKey: 'BDatzP4l-S4Jz3T3b-g3_N8uN-c8_a8yP8_H7v6J1FzZ5j3qX2xK7J8wQ9G3X' });
            if (currentToken) {
              await addFCMToken(currentToken);
            } else {
              console.log('No registration token available. Request permission to generate one.');
            }
          }
        } catch (err) {
          console.error('An error occurred while retrieving token. ', err);
          toast({
            variant: "destructive",
            title: "Notification Error",
            description: "Could not enable push notifications.",
          });
        }
      }
    };
    
    requestPermission();
  }, [toast]);

  return <>{children}</>;
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const showFooter = !pathname.startsWith('/admin') && !pathname.startsWith('/dashboard') && !pathname.startsWith('/sign-in') && !pathname.startsWith('/sign-up');

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("antialiased")}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
          <AuthProvider>
            <AuthDialogProvider>
             <FirebaseMessagingProvider>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow">{children}</main>
                {showFooter && <Footer />}
              </div>
              <AuthDialog />
              </FirebaseMessagingProvider>
            </AuthDialogProvider>
          </AuthProvider>
          <Toaster />
          <Script src="https://checkout.razorpay.com/v1/checkout.js" />
        </ThemeProvider>
      </body>
    </html>
  );
}
