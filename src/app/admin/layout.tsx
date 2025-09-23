
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DeshExamLogo } from '@/components/icons';
import {
  LayoutGrid,
  Library,
  Users,
  Settings,
  ShieldCheck,
  Tag,
  FilePlus,
  BookPlus,
  DollarSign,
  Bell,
  Flag,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUserProfile } from '@/lib/firebase/firestore';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';


export const navItems = [
    { href: '/admin', label: 'Admin Overview', icon: <ShieldCheck /> },
    { href: '/admin/users', label: 'Manage Users', icon: <Users /> },
    { href: '/admin/content', label: 'Manage Content', icon: <Library /> },
    { href: '/admin/add-content', label: 'Add Quiz/Test', icon: <FilePlus /> },
    { href: '/admin/add-article', label: 'Add Article', icon: <BookPlus /> },
    { href: '/admin/coupons', label: 'Manage Coupons', icon: <Tag /> },
    { href: '/admin/earning', label: 'Earning', icon: <DollarSign /> },
    { href: '/admin/push-notification', label: 'Push Notification', icon: <Bell /> },
    { href: '/admin/reports', label: 'Reports & Contact', icon: <Flag /> },
    { href: '/admin/settings', label: 'Site Settings', icon: <Settings /> },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
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
          setIsAdmin(true);
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


  if (verifying || !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <p>Verifying admin access...</p>
      </div>
    );
  }

  return (
    <div>
        <main className="p-4 md:p-6 lg:p-8">
            {children}
        </main>
    </div>
  );
}
