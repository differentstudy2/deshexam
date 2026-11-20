import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { AppProviders } from "./providers";
import { AuthDialogProvider } from "@/hooks/use-auth-dialog";
import { AuthDialog } from "@/components/feature/auth-dialog";
import { Inter, Lexend } from 'next/font/google';
import localFont from 'next/font/local';
import { FirebaseProvider } from "@/hooks/use-firebase";
import Script from 'next/script';
import { ConditionalHeader, ConditionalFooter } from "@/components/layout/ConditionalLayout";
import { CookieConsent } from "@/components/layout/cookie-consent";
import { notFound } from 'next/navigation';
import { GoogleTranslateWidget } from '@/components/GoogleTranslateWidget';

import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://deshexam.vercel.app"),
};

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const lexend = Lexend({
  subsets: ['latin'],
  variable: '--font-lexend',
  weight: ['400', '700'],
});

// Tiro Bangla — the full app's font (headings + body), self-hosted from
// google/fonts (ofl/tirobangla), converted to woff2 (Latin + Bengali + ₹ kept).
// Note: Tiro Bangla ships only Regular 400 (+ Italic); there is no bold
// weight, so font-bold headings render with browser-synthesised bold.
const tiroBangla = localFont({
  src: [
    { path: '../../public/fonts/TiroBangla-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/TiroBangla-Italic.woff2', weight: '400', style: 'italic' },
  ],
  variable: '--font-tiro-bangla',
  display: 'swap',
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="bn" suppressHydrationWarning>
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
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0f172a" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={cn("antialiased overscroll-none touch-manipulation", inter.variable, lexend.variable, tiroBangla.variable)}>
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-brand-gold focus:px-5 focus:py-2 focus:text-sm focus:font-bold focus:text-[#042f2e]">
            মূল কনটেন্টে যান
          </a>
          <FirebaseProvider>
            <AppProviders>
              <AuthProvider>
                <AuthDialogProvider>
                  <div className="flex flex-col min-h-screen">
                    <ConditionalHeader />
                    <main id="main-content" className="flex-grow">{children}</main>
                    <ConditionalFooter />
                  </div>
                  <AuthDialog />
                </AuthDialogProvider>
              </AuthProvider>
              <CookieConsent />
              <GoogleTranslateWidget />
              <Toaster />
              <Script src="https://checkout.razorpay.com/v1/checkout.js" />
              <Script src="https://accounts.google.com/gsi/client" strategy="beforeInteractive" />
            </AppProviders>
          </FirebaseProvider>
      </body>
    </html>
  );
}
