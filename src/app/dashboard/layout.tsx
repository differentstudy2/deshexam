
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logOut } = useAuth();
  const router = useRouter();
  const [verifying, setVerifying] = useState(true);
  
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/sign-in');
      } else {
        setVerifying(false);
      }
    }
  }, [user, loading, router]);
  
  if (verifying) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
        <div className="flex min-h-screen">
            <Sidebar>
                <DashboardSidebar user={user} logOut={logOut} />
            </Sidebar>
            <div className="flex flex-col flex-1">
                <SidebarInset>
                    <main className="flex-grow p-4 md:p-6 lg:p-8">
                        {children}
                    </main>
                </SidebarInset>
                <Footer />
            </div>
        </div>
    </SidebarProvider>
  );
}
