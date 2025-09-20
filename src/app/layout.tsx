import type { Metadata } from "next";
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

const fontBody = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const fontHeadline = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-headline",
});

export const metadata: Metadata = {
  title: "DeshExam",
  description: "Your ultimate destination for mock tests, quizzes, and personalized learning paths.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
              <Header />
              <main className="min-h-screen">{children}</main>
              <Footer />
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
