"use client";

import { usePathname } from 'next/navigation';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const ConditionalHeader = () => {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard') || pathname?.includes('/take')) return null;
  return <Header />;
};

export const ConditionalFooter = () => {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard') || pathname?.includes('/take')) return null;
  return <Footer />;
};
