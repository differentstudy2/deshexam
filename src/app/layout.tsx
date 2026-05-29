
"use client";

import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/layout/header";
import { AuthProvider } from "@/hooks/use-auth";
import { AppProviders } from "./providers"; // Import the new provider
import { AuthDialogProvider } from "@/hooks/use-auth-dialog";
import { AuthDialog } from "@/components/feature/auth-dialog";
<<<<<<< HEAD
import { Inter, Lexend } from 'next/font/google';
import { Footer } from "@/components/layout/footer";
=======
import { Inter, Lexend, Hind_Siliguri } from 'next/font/google';
import { FirebaseProvider } from "@/hooks/use-firebase";
>>>>>>> 49fc1c0c874748b5830da174a57557d18a08f292

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


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
<<<<<<< HEAD
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
      </head>
      <body className={cn("antialiased", inter.variable, lexend.variable)}>
        <AppProviders>
          <AuthProvider>
            <AuthDialogProvider>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow">{children}</main>
                <Footer />
              </div>
              <AuthDialog />
            </AuthDialogProvider>
          </AuthProvider>
          <Toaster />
        </AppProviders>
=======
       <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={cn("antialiased", inter.variable, lexend.variable, hindSiliguri.variable)}>
        <FirebaseProvider>
          <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
          >
            <AuthProvider>
              <AuthDialogProvider>
                <div className="flex flex-col min-h-screen">
                  <Header />
                  <main className="flex-grow">{children}</main>
                  <Footer />
                </div>
                <AuthDialog />
              </AuthDialogProvider>
            </AuthProvider>
            <Toaster />
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
          </ThemeProvider>
        </FirebaseProvider>
>>>>>>> 49fc1c0c874748b5830da174a57557d18a08f292
      </body>
    </html>
  );
}
