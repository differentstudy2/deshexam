
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
import { getToken, onMessage } from "firebase/messaging";
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
            const currentToken = await getToken(messaging, { vapidKey: 'BPwG_wGjDhWT_DVSY3Fd6fgrhNhlQrK2hklIDuqFRu4B29XTRnOemSrulxX0RAFXtzjy2dg0a0EV34RkK48CakA' });
            if (currentToken) {
              await addFCMToken(currentToken);
              
              // Listen for foreground messages
              onMessage(messaging, (payload) => {
                console.log('Message received. ', payload);
                const notificationTitle = payload.notification?.title || payload.data?.title;
                const notificationBody = payload.notification?.body || payload.data?.body;

                toast({
                  title: notificationTitle,
                  description: notificationBody,
                });
              });

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

    