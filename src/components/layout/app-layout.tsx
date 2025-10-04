
"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const showFooter = !pathname.startsWith('/admin') && !pathname.startsWith('/dashboard') && !pathname.startsWith('/sign-in') && !pathname.startsWith('/sign-up');

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">{children}</main>
            {showFooter && <Footer />}
        </div>
    );
}
