import "../globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { AppProviders } from "./providers";
import { AuthDialogProvider } from "@/hooks/use-auth-dialog";
import { AuthDialog } from "@/components/feature/auth-dialog";
import { Inter, Lexend, Hind_Siliguri } from 'next/font/google';
import { FirebaseProvider } from "@/hooks/use-firebase";
import Script from 'next/script';
import { ConditionalHeader, ConditionalFooter } from "@/components/layout/ConditionalLayout";
import { CookieConsent } from "@/components/layout/cookie-consent";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { GoogleTranslateWidget } from '@/components/GoogleTranslateWidget';

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

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
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
        <meta name="trustpilot-one-time-domain-verification-id" content="7f080357-aa3e-4ce3-b4a6-40484af64723"/>
      </head>
      <body className={cn("antialiased overscroll-none touch-manipulation", inter.variable, lexend.variable, hindSiliguri.variable)}>
        <NextIntlClientProvider messages={messages}>
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
              <CookieConsent />
              <GoogleTranslateWidget />
              <Toaster />
              <Script src="https://checkout.razorpay.com/v1/checkout.js" />
              <Script src="https://accounts.google.com/gsi/client" strategy="beforeInteractive" />
            </AppProviders>
          </FirebaseProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
