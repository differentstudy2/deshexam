
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';


const navItems = [
  { href: '/admin', label: 'Admin Overview', icon: ShieldCheck },
  { href: '/admin/users', label: 'Manage Users', icon: Users },
  { href: '/admin/content', label: 'Manage Content', icon: Library },
  { href: '/admin/add-content', label: 'Add Quiz/Test', icon: FilePlus },
  { href: '/admin/add-article', label: 'Add Article', icon: BookPlus },
  { href: '/admin/coupons', label: 'Manage Coupons', icon: Tag },
  { href: '/admin/earning', label: 'Earning', icon: DollarSign },
  { href: '/admin/push-notification', label: 'Push Notification', icon: Bell },
  { href: '/admin/reports', label: 'Reports & Contact', icon: Flag },
  { href: '/admin/settings', label: 'Site Settings', icon: Settings },
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
        <SidebarMenu className="mt-6">
            {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                className={cn(
                    "justify-start w-full h-11 px-4 py-2 text-base font-normal rounded-lg transition-colors duration-200",
                    "hover:bg-primary/10 hover:text-primary",
                    pathname === item.href && "bg-primary/20 text-primary font-semibold border-l-4 border-primary"
                )}
                tooltip={{
                    children: item.label,
                }}
                >
                <Link href={item.href} onClick={() => setIsSheetOpen(false)}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            ))}
            <SidebarMenuItem>
                <SidebarMenuButton 
                 asChild
                 className={cn(
                    "justify-start w-full h-11 px-4 py-2 text-base font-normal rounded-lg transition-colors duration-200",
                    "hover:bg-secondary/80"
                 )}
                >
                    <Link href="/dashboard" onClick={() => setIsSheetOpen(false)}>
                        <LayoutGrid />
                        <span>User Dashboard</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    </ScrollArea>
  );

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <DeshExamLogo />
            <div className="flex-grow" />
            <SidebarTrigger className="hidden md:flex" />
          </div>
        </SidebarHeader>
        <SidebarContent>
            {sidebarContent}
        </SidebarContent>
        <SidebarFooter>
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
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="md:hidden sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 flex flex-col">
                        <SheetHeader className="border-b p-4">
                            <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                            <Link href="/admin" onClick={() => setIsSheetOpen(false)} className="flex items-center space-x-2">
                                <DeshExamLogo />
                            </Link>
                        </SheetHeader>
                        {sidebarContent}
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
      </SidebarInset>
    </SidebarProvider>
  );
}
