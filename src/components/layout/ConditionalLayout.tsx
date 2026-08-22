"use client";

import { usePathname } from 'next/navigation';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const ConditionalHeader = () => {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard') || pathname?.includes('/take')) return null;
  return <div className="print:hidden"><Header /></div>;
};

export const ConditionalFooter = () => {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard') || pathname?.includes('/take')) return null;
  return <div className="print:hidden"><Footer /></div>;
};
