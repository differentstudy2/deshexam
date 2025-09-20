
"use client";

import { Poppins, Inter } from "next/font/google";
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

const fontBody = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const fontHeadline = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-headline",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const showFooter = !pathname.startsWith('/admin') && !pathname.startsWith('/dashboard') && !pathname.startsWith('/sign-in') && !pathname.startsWith('/sign-up');

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("antialiased", fontBody.variable, fontHeadline.variable)}>
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
                {showFooter && <Footer />}
              </div>
              <AuthDialog />
            </AuthDialogProvider>
          </AuthProvider>
          <Toaster />
          <Script src="https://checkout.razorpay.com/v1/checkout.js" />
        </ThemeProvider>
      </body>
    </html>
  );
}
