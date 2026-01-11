
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUserProfile } from '@/lib/firebase/firestore';
import { Loader2 } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/layout/header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading, logOut } = useAuth();
  const router = useRouter();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    // Wait until authentication status is determined
    if (authLoading) {
      return;
    }

    if (!user) {
      router.push('/sign-in');
      return;
    }

    const checkAdminStatus = async () => {
      try {
        const userProfile = await getUserProfile(user.uid);
        if (userProfile && userProfile.role === 'admin') {
          // User is an admin, allow access
        } else {
          // If not an admin, redirect to user dashboard
          router.push('/dashboard');
        }
      } catch (error) {
        console.error("Failed to verify admin status:", error);
        // Redirect on error as a security measure
        router.push('/dashboard');
      } finally {
        setVerifying(false);
      }
    };

    checkAdminStatus();
  }, [user, authLoading, router]);


  if (verifying) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <p>Verifying admin access...</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
        <Sidebar>
            <AdminSidebar logOut={logOut} />
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
