
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
import { Inter, Lexend } from 'next/font/google';
import { FirebaseProvider } from "@/hooks/use-firebase";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const lexend = Lexend({
  subsets: ['latin'],
  variable: '--font-lexend',
  weight: ['400', '700'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("antialiased", inter.variable, lexend.variable)}>
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
      </body>
    </html>
  );
}
