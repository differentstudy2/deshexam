
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/layout/header';

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
        <Sidebar>
            <DashboardSidebar user={user} logOut={logOut} />
        </Sidebar>
        <SidebarInset>
            <div className="flex flex-col min-h-screen">
                <main className="flex-grow p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </SidebarInset>
    </SidebarProvider>
  );
}
