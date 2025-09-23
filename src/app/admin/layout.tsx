
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';


const navItems = [
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
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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

  const sidebarContent = (
     <ScrollArea className="h-full">
        <ul className="mt-6 space-y-1">
            {navItems.map((item) => (
            <li key={item.href}>
                <Button
                asChild
                variant="ghost"
                className={cn(
                    "justify-start w-full h-11 px-4 py-2 text-base font-normal rounded-lg transition-colors duration-200",
                    pathname === item.href ? "bg-primary/20 text-primary font-semibold" : "hover:bg-primary/10 hover:text-primary"
                )}
                >
                <Link href={item.href} onClick={() => setIsSheetOpen(false)}>
                    {item.icon}
                    <span>{item.label}</span>
                </Link>
                </Button>
            </li>
            ))}
            <li>
                <Button 
                 asChild
                 variant="ghost"
                 className={cn(
                    "justify-start w-full h-11 px-4 py-2 text-base font-normal rounded-lg transition-colors duration-200",
                    "hover:bg-secondary/80"
                 )}
                >
                    <Link href="/dashboard" onClick={() => setIsSheetOpen(false)}>
                        <LayoutGrid className="h-5 w-5" />
                        <span>User Dashboard</span>
                    </Link>
                </Button>
            </li>
        </ul>
    </ScrollArea>
  );

  return (
    <div className="min-h-screen">
       <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center">
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu />
                            <span className="sr-only">Toggle Admin Menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 flex flex-col w-[80%] sm:w-[320px]">
                        <SheetHeader className="border-b p-4">
                             <SheetTitle className="flex items-center gap-2">
                                <Link href="/admin" onClick={() => setIsSheetOpen(false)}>
                                    <DeshExamLogo />
                                </Link>
                            </SheetTitle>
                            <SheetDescription>Admin sidebar menu</SheetDescription>
                        </SheetHeader>
                        {sidebarContent}
                         <div className="mt-auto border-t p-4">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user?.photoURL || `https://picsum.photos/seed/${user?.uid}/40/40`} />
                                    <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col text-sm">
                                    <span className="font-semibold text-foreground">{user?.displayName || 'Admin'}</span>
                                    <span className="text-muted-foreground">{user?.email}</span>
                                </div>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
                 <div className="flex flex-1 items-center justify-end">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.photoURL || `https://picsum.photos/seed/${user?.uid}/40/40`} />
                        <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                 </div>
            </div>
        </header>
        <main className="p-4 md:p-6 lg:p-8">
            {children}
        </main>
    </div>
  );
}
