
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/layout/header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Bell, Search, Moon } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
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

  const formatPathname = (path: string) => {
    if (path === '/dashboard') return 'Dashboard';
    const parts = path.split('/');
    const lastPart = parts[parts.length - 1];
    return lastPart.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const pageTitle = formatPathname(pathname || '/dashboard');

  return (
    <SidebarProvider>
        <div className="flex min-h-screen w-full bg-[#f8f9fa]">
            <Sidebar>
                <DashboardSidebar user={user} logOut={logOut} />
            </Sidebar>
            <div className="flex flex-col flex-1 w-full relative">
                {/* Custom Top Navbar for Dashboard */}
                <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-4 md:px-6 shadow-sm">
                    <SidebarTrigger className="-ml-1" />
                    
                    <h1 className="text-xl font-bold text-slate-800 ml-2 tracking-tight">
                        {pageTitle}
                    </h1>
                    
                    <div className="ml-auto flex items-center space-x-2 md:space-x-4">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-600 font-bold text-sm">
                            <span className="text-orange-500">🔥</span> 30 XP
                        </div>
                        
                        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-800 hidden sm:flex rounded-full">
                            <Moon className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-800 rounded-full">
                            <Search className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-800 rounded-full relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
                        </Button>
                        
                        <Avatar className="h-8 w-8 border border-slate-200 cursor-pointer ml-2">
                            <AvatarImage src={user?.photoURL || `https://picsum.photos/seed/${user?.uid}/40/40`} />
                            <AvatarFallback>{user?.displayName?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                    </div>
                </header>
                
                <SidebarInset className="bg-transparent">
                    <main className="flex-grow p-4 md:p-6 mx-auto w-full max-w-7xl">
                        {children}
                    </main>
                </SidebarInset>
            </div>
        </div>
    </SidebarProvider>
  );
}
