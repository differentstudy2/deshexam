
"use client";

import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/layout/header";
import { AuthProvider } from "@/hooks/use-auth";
import { AppProviders } from "./providers";
import { AuthDialogProvider } from "@/hooks/use-auth-dialog";
import { AuthDialog } from "@/components/feature/auth-dialog";
import { Inter, Lexend, Hind_Siliguri } from 'next/font/google';
import { Footer } from "@/components/layout/footer";
import { FirebaseProvider } from "@/hooks/use-firebase";
import Script from 'next/script';
import { usePathname } from 'next/navigation';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const lexend = Lexend({
  subsets: ['latin'],
  variable: '--font-lexend',
  weight: ['400', '700'],
});

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali'],
  variable: '--font-hind-siliguri',
  weight: ['400', '600', '700'],
});

const ConditionalHeader = () => {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard') || pathname?.includes('/take')) return null;
  return <Header />;
};

const ConditionalFooter = () => {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard') || pathname?.includes('/take')) return null;
  return <Footer />;
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2002844631471576"
          crossOrigin="anonymous"
        ></script>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
          integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={cn("antialiased", inter.variable, lexend.variable, hindSiliguri.variable)}>
        <FirebaseProvider>
          <AppProviders>
            <AuthProvider>
              <AuthDialogProvider>
                <div className="flex flex-col min-h-screen">
                  <ConditionalHeader />
                  <main className="flex-grow">{children}</main>
                  <ConditionalFooter />
                </div>
                <AuthDialog />
              </AuthDialogProvider>
            </AuthProvider>
            <Toaster />
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            <Script src="https://accounts.google.com/gsi/client" strategy="beforeInteractive" />
          </AppProviders>
        </FirebaseProvider>
      </body>
    </html>
  );
}
