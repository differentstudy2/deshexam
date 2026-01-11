
import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/layout/header";
import { AuthProvider } from "@/hooks/use-auth";
import Script from "next/script";
import { AppProviders } from "./providers"; // Import the new provider
import { AuthDialogProvider } from "@/hooks/use-auth-dialog";
import { AuthDialog } from "@/components/feature/auth-dialog";
import { Inter, Lexend } from 'next/font/google';
import { Footer } from "@/components/layout/footer";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const lexend = Lexend({
  subsets: ['latin'],
  variable: '--font-lexend',
  weight: ['400', '700'],
});

export { metadata } from "@/app/metadata";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
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
          <Script src="https://checkout.razorpay.com/v1/checkout.js" />
        </AppProviders>
      </body>
    </html>
  );
}
