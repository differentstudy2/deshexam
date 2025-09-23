

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
  FileText,
  Settings,
  BookUser,
  ClipboardList,
  ShieldCheck,
  Menu,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { getUserProfile } from '@/lib/firebase/firestore';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: <LayoutGrid /> },
  { href: '/dashboard/my-content', label: 'My Content', icon: <Library /> },
  { href: '/dashboard/all-questions', label: 'All Questions', icon: <ClipboardList /> },
  { href: '/dashboard/my-results', label: 'My Results', icon: <FileText /> },
  { href: '/dashboard/profile', label: 'Profile', icon: <BookUser /> },
  { href: '/dashboard/settings', label: 'Settings', icon: <Settings /> },
];

type UserProfile = {
  role?: 'admin' | 'user';
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const userProfile = await getUserProfile(user.uid);
        setProfile(userProfile);
      }
    };
    fetchProfile();
  }, [user]);

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
            {profile?.role === 'admin' && (
                <SidebarMenuItem>
                    <SidebarMenuButton 
                    asChild
                    className={cn(
                        "justify-start w-full h-11 px-4 py-2 text-base font-normal rounded-lg transition-colors duration-200",
                        "hover:bg-secondary/80"
                    )}
                    >
                        <Link href="/admin" onClick={() => setIsSheetOpen(false)}>
                            <ShieldCheck />
                            <span>Admin Dashboard</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            )}
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
                    <span className="font-semibold text-foreground">{user?.displayName || 'User'}</span>
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
                    <SheetContent side="left" className="p-0 flex flex-col w-[80%]">
                        <SheetHeader className="border-b p-4">
                             <SheetTitle className="flex items-center gap-2">
                                <Link href="/dashboard" onClick={() => setIsSheetOpen(false)}>
                                    <DeshExamLogo />
                                </Link>
                            </SheetTitle>
                             <SheetDescription className="sr-only">Dashboard sidebar menu</SheetDescription>
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
