
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUserProfile } from '@/lib/firebase/firestore';
import { Loader2, Bell, LogOut, UserIcon, Moon, Sun, Monitor } from "lucide-react";
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, useSidebar } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/layout/header';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Link from "next/link";
import { useTheme } from "next-themes";
import { AdminMobileBottomNav } from '@/components/layout/admin-mobile-bottom-nav';

const AdminSidebarWrapper = ({ logOut }: { logOut: () => void }) => {
  const { setOpenMobile, isMobile } = useSidebar();
  return <AdminSidebar logOut={logOut} onLinkClick={isMobile ? () => setOpenMobile(false) : undefined} />;
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading, logOut } = useAuth();
  const { setTheme } = useTheme();
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
      <div className="flex min-h-[100dvh] w-full bg-slate-50 dark:bg-slate-900">
        <Sidebar className="hidden md:flex">
          <AdminSidebarWrapper logOut={logOut} />
        </Sidebar>
        <div className="flex flex-col flex-1 w-full relative">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b border-slate-200 dark:border-slate-800 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-slate-950/95 dark:supports-[backdrop-filter]:bg-slate-950/60 px-4 md:px-6 shadow-sm">
                    <SidebarTrigger className="-ml-1 text-slate-500 dark:text-slate-400" />
                    <div className="flex-1 font-semibold text-slate-800 dark:text-slate-100 tracking-tight text-lg md:text-xl truncate">
                        Admin
                    </div>
                    <div className="ml-auto flex items-center space-x-2 md:space-x-4">
                        <ThemeToggle />
                        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-full relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white dark:border-slate-950"></span>
                        </Button>
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700 cursor-pointer ml-2">
                                    <AvatarImage src={user?.photoURL || `https://picsum.photos/seed/${user?.uid}/40/40`} />
                                    <AvatarFallback>{user?.displayName?.[0] || 'A'}</AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user?.displayName || "Admin User"}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user?.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard">
                                        <UserIcon className="mr-2 h-4 w-4" />
                                        <span>Dashboard</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={logOut}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>
                
                <SidebarInset className="bg-transparent">
                    <main className="flex-grow p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
                        {children}
                    </main>
                </SidebarInset>
            </div>
            <AdminMobileBottomNav />
        </div>
    </SidebarProvider>
  );
}
