
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { DashboardSidebar, NotificationBell } from '@/components/layout/header';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Bell, Search, Moon, LogOut, User as UserIcon, Settings as SettingsIcon, Briefcase } from 'lucide-react';
import { usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, loading, logOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [verifying, setVerifying] = useState(true);
  
  const formatPathname = (path: string) => {
    if (path === '/dashboard') return 'Dashboard';
    const parts = path.split('/');
    const lastPart = parts[parts.length - 1];
    return lastPart.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const pageTitle = formatPathname(pathname || '/dashboard');

  useEffect(() => {
    document.title = `${pageTitle} | Desh Exam`;
  }, [pageTitle]);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/sign-in');
      } else if (userProfile && !userProfile.isOnboarded) {
        router.push('/onboarding');
      } else {
        setVerifying(false);
      }
    }
  }, [user, userProfile, loading, router]);
  
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
        <div className="flex min-h-screen w-full bg-[#f8f9fa] dark:bg-slate-950 transition-colors duration-300">
            <Sidebar collapsible="icon">
                <DashboardSidebar user={user} logOut={logOut} />
            </Sidebar>
            <div className="flex flex-col flex-1 w-full relative">
                {/* Custom Top Navbar for Dashboard */}
                <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 md:px-6 shadow-sm transition-colors duration-300">
                    <SidebarTrigger className="-ml-1" />
                    
                    <h1 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 ml-1 sm:ml-2 tracking-tight truncate">
                        {pageTitle}
                    </h1>
                    
                    <div className="ml-auto flex items-center space-x-1.5 sm:space-x-4 shrink-0">
                        <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-600 font-bold text-xs sm:text-sm shrink-0 whitespace-nowrap">
                            <span className="text-orange-500">🔥</span> {userProfile?.xp || 0} XP
                        </div>
                        
                        <div className="hidden sm:flex">
                            <ThemeToggle />
                        </div>
                        <NotificationBell />
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700 cursor-pointer ml-2">
                                    <AvatarImage src={user?.photoURL || `https://picsum.photos/seed/${user?.uid}/40/40`} />
                                    <AvatarFallback>{user?.displayName?.[0] || 'U'}</AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-64 p-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg rounded-xl" align="end" forceMount>
                                <div className="flex flex-col space-y-1 p-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold leading-none text-slate-800 dark:text-slate-100">{user?.displayName || "Jahanur Miah"}</p>
                                        <div className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                                            FREE
                                        </div>
                                    </div>
                                    <p className="text-xs leading-none text-slate-500 dark:text-slate-400 mt-1">
                                        @{user?.displayName?.toLowerCase().replace(/\s+/g, '-') || "jahanur-miah"}
                                    </p>
                                    
                                    <div className="mt-3 mb-1 px-3 py-1.5 border border-dashed border-slate-200 dark:border-slate-700 rounded-full flex justify-center items-center bg-transparent">
                                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Balance: ₹1.75</p>
                                    </div>
                                </div>
                                <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-slate-800" />
                                <DropdownMenuItem asChild className="p-2.5 cursor-pointer rounded-md hover:bg-slate-50 focus:bg-slate-50 dark:hover:bg-slate-800 dark:focus:bg-slate-800">
                                    <Link href="/dashboard/profile">
                                        <UserIcon className="mr-3 h-4 w-4 text-slate-700 dark:text-slate-300" />
                                        <span className="text-slate-700 dark:text-slate-300 font-medium">Profile</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="p-2.5 cursor-pointer rounded-md hover:bg-slate-50 focus:bg-slate-50 dark:hover:bg-slate-800 dark:focus:bg-slate-800">
                                    <Link href="/dashboard/settings">
                                        <SettingsIcon className="mr-3 h-4 w-4 text-slate-700 dark:text-slate-300" />
                                        <span className="text-slate-700 dark:text-slate-300 font-medium">Settings</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="p-2.5 cursor-pointer rounded-md hover:bg-slate-50 focus:bg-slate-50 dark:hover:bg-slate-800 dark:focus:bg-slate-800">
                                    <Link href="/dashboard/business">
                                        <Briefcase className="mr-3 h-4 w-4 text-slate-700 dark:text-slate-300" />
                                        <span className="text-slate-700 dark:text-slate-300 font-medium">Business Accounts</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-slate-800" />
                                <DropdownMenuItem onClick={logOut} className="p-2.5 cursor-pointer rounded-md hover:bg-red-50 focus:bg-red-50 dark:hover:bg-red-900/20 dark:focus:bg-red-900/20 text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400">
                                    <LogOut className="mr-3 h-4 w-4" />
                                    <span className="font-medium">Logout</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>
                
                <SidebarInset className="bg-transparent">
                    <main className="flex-grow p-4 md:p-6 mx-auto w-full max-w-7xl pb-24 md:pb-6">
                        {children}
                    </main>
                </SidebarInset>
                <MobileBottomNav />
            </div>
        </div>
    </SidebarProvider>
  );
}
