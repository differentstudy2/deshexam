
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


export const navItems = [
  { href: '/admin', label: 'Admin Overview', icon: <ShieldCheck className="h-5 w-5" /> },
  { href: '/admin/users', label: 'Manage Users', icon: <Users className="h-5 w-5" /> },
  { href: '/admin/content', label: 'Manage Content', icon: <Library className="h-5 w-5" /> },
  { href: '/admin/add-content', label: 'Add Quiz/Test', icon: <FilePlus className="h-5 w-5" /> },
  { href: '/admin/add-article', label: 'Add Article', icon: <BookPlus className="h-5 w-5" /> },
  { href: '/admin/coupons', label: 'Manage Coupons', icon: <Tag className="h-5 w-5" /> },
  { href: '/admin/earning', label: 'Earning', icon: <DollarSign className="h-5 w-5" /> },
  { href: '/admin/push-notification', label: 'Push Notification', icon: <Bell className="h-5 w-5" /> },
  { href: '/admin/reports', label: 'Reports & Contact', icon: <Flag className="h-5 w-5" /> },
  { href: '/admin/settings', label: 'Site Settings', icon: <Settings className="h-5 w-5" /> },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/sign-in');
      return;
    }

    const checkAdminStatus = async () => {
      const userProfile = await getUserProfile(user.uid);
      if (userProfile && userProfile.role === 'admin') {
        setIsAdmin(true);
      } else {
        router.push('/dashboard');
      }
      setLoading(false);
    };

    checkAdminStatus();
  }, [user, authLoading, router]);

  if (loading || !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <p>Verifying admin access...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
        <main className="p-4 md:p-6 lg:p-8">
            {children}
        </main>
    </div>
  );
}
